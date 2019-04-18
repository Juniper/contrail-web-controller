/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @serviceinstance.api.js
 *     - Handlers for Service Instance Configuration
 *     - Interfaces with config api server
 */

var rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api');
var async = require('async');
var logutils = require(process.mainModule.exports["corePath"] +
                       '/src/serverroot/utils/log.utils');
var commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils');
var messages = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/messages');
var global = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/global');
var appErrors = require(process.mainModule.exports["corePath"] +
                        '/src/serverroot/errors/app.errors');
var util = require('util');
var serviceTemplate = require('../../templates/api/servicetemplateconfig.api.js');
var computeApi = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/computemanager.api');
var authApi = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/auth.api');
var crypto = require('crypto');
var configApiServer = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/configServer.api');
var policyConfigApi = require('../../../networking/policy/api/policyconfig.api');
var jsonPath = require('JSONPath').eval;
var jsonDiff = require(process.mainModule.exports["corePath"] +
                       '/src/serverroot/common/jsondiff');
var opApiServer = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/common/opServer.api');
var ctrlGlobal = require('../../../../common/api/global');
var _ = require('underscore');

/**
 * Bail out if called directly as "nodejs serviceinstanceconfig.api.js"
 */
if (!module.parent) 
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
        module.filename));
    process.exit(1);
}

/**
 * @listServiceInstances
 * public function
 * 1. URL /api/tenants/config/service-instances/:id
 * 2. Gets list of service instances for a given project and get the instances
 *    status from nova and send the status along with config data
 * 3. Needs project id as the id
 * 4. Calls listServiceInstancesCb that process data from config
 *    api server and sends back the http response.
 */
function listServiceInstances(request, response, appData) 
{
    var projectId, projectURL = '/project', template;

    if ((projectId = request.param('id'))) {
        projectURL += '/' + projectId.toString();
        template = request.param('template');
    } else {
        //TODO - Add Language independent error code and return
    }
    configApiServer.apiGet(projectURL, appData,
        function (error, data) {
            listServiceInstancesCb(error, data, response, appData, template)
        });
}

/*
 * @listServiceInstances
 * public function
 * 1. URL /api/tenants/config/service-instances/:id
 * 2. Gets list of service instances for a given project 
 * 3. Needs project id as the id
 * 4. Calls getServiceInstancesCb that process data from config
 *    api server and sends back the http response.
 */
function getServiceInstances (request, response, appData)
{
    var projectId;
    var emptyResult = [];
    if ((projectId = request.param('id'))) {
        var siUrl =
            '/service-instances?detail=true&fields=virtual_machine_back_refs,' +
            'port_tuples,interface_route_table_back_refs,' +
            'route_aggregate_back_refs,routing_policy_back_refs,' +
            'service_health_check_back_refs&parent_id=' + projectId;
    } else {
        //TODO - Add Language independent error code and return
    }
    configApiServer.apiGet(siUrl, appData, function(error, siList) {
        if ((null != error) || (null == siList) ||
            (null == siList['service-instances'])) {
            commonUtils.handleJSONResponse(error, response, siList);
            return;
        }
        siGetListAggCB(siList['service-instances'], appData,
                       function(error, aggSIData) {
            getVMIUVEHealthCheckStatus(aggSIData, appData, function(error, data) {
                commonUtils.handleJSONResponse(error, response, {aggSIData:
                                               aggSIData, siMaps: data});
            });
        });
    });
}

/*
 * @listAllServiceInstancesDetails
 * public function
 * URL /api/tenants/config/service-instances-details
 * Gets the details of service-instances across all the projects
 */
function listAllServiceInstancesDetails (req, res, appData)
{
    var siDataObjArr = [];

    var siURL = '/service-instances?detail=true&fields=' +
        'virtual_machine_back_refs,port_tuples';
    var prpjId = req.param('id');
    if (null != prpjId) {
        siURL += "&parent_id=" + prpjId.toString();
    }
    configApiServer.apiGet(siURL, appData, function(err, data) {
        if ((null != err) || (null == data) ||
            (null == data['service-instances'])) {
            commonUtils.handleJSONResponse(err, res, []);
            return;
        }
        commonUtils.handleJSONResponse(err, res, data['service-instances']);
    });
}

/**
 * @listServiceInstances
 * public function
 * 1. Get list of all service instances
 */
function listAllServiceInstances(response, appData) 
{
    var reqUrl = "/service-instances";
    configApiServer.apiGet(reqUrl, appData, function (error, jsonData) {
        if (error) {
            logutils.logger.error(error.stack);
            commonUtils.handleJSONResponse(null, response, []);
        } else {
            commonUtils.handleJSONResponse(error, response, jsonData);
        }
    });
};

/**
 * @listServiceInstancesCb
 * private function
 * 1. Callback for listServiceInstances
 * 2. Reads the response of per project SI list from config api server
 *    and sends it back to the client.
 */
function listServiceInstancesCb(error, siListData, response, appData, template) 
{
    var reqUrl = null;
    var dataObjArr = [];
    var i = 0, siLength = 0;
    var serviceInstances = {};

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    serviceInstances['service_instances'] = [];

    if ('service_instances' in siListData['project']) {
        serviceInstances['service_instances'] =
            siListData['project']['service_instances'];
    }

    siLength = serviceInstances['service_instances'].length;

    if (!siLength) {
        commonUtils.handleJSONResponse(error, response, serviceInstances);
        return;
    }

    for (i = 0; i < siLength; i++) {
        var siRef = serviceInstances['service_instances'][i];
        reqUrl = '/service-instance/' + siRef['uuid'];
        commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
            null, null, null, appData);
    }

    async.map(dataObjArr,
        commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
        function (error, results) {
            siListAggCb(error, results, response, appData, template);
        });
}

/*
 * @getServiceInstancesCb
 * private function
 * 1. Callback for getServiceInstances
 * 2. Reads the response of per project SI list from config api server
 *    and sends it back to the client.
 */
function getServiceInstancesCB(siListData, response, appData)
{
    var reqUrl = null;
    var dataObjArr = [];
    var i = 0, siLength = 0;
    var serviceInstances = {};
    var emptyResult = [];

    siGetListAggCB(siListData, appData, function(error, data) {
        commonUtils.handleJSONResponse(error, response, data);
    });
    return;
}

/**
 * @siListAggCb
 * private function
 * 1. Callback for the SI gets, sends all SIs to client.
 */
function siListAggCb(error, results, response, appData, template) 
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (template != null && template == global.DEFAULT_ANALYZER_TEMPLATE) {
        filterInAnalyzerInstances(results, response, appData);
    } else {
        filterOutAnalyzerInstances(results, response, appData);
    }
}

function getVMIUVEHealthCheckStatus (svcInstList, appData, callback)
{
    if ((null == svcInstList) || (!svcInstList.length)) {
        callback(null, []);
        return;
    }
    var vmiUUIDList = [];
    var instTupleVMIMaps = {};
    var svcInstListLen = svcInstList.length;
    var vmToSvcInstMaps = {};
    var vmUUIDList = [];
    var portTupleList = [];

    for (var i = 0; i < svcInstListLen; i++) {
        var svcInstUUID =
            commonUtils.getValueByJsonPath(svcInstList[i], 'service-instance;uuid',
                                           null);
        var vmBackRefs =
            commonUtils.getValueByJsonPath(svcInstList[i],
                                           'service-instance;virtual_machine_back_refs',
                                           []);
        var vmBackRefsCnt = vmBackRefs.length;
        var portTuples =
            commonUtils.getValueByJsonPath(svcInstList[i],
                                           'service-instance;port_tuples',
                                           []);
        var portTuplesCnt = portTuples.length;
        if ((!vmBackRefsCnt) && (!portTuplesCnt)) {
            continue;
        }
        for (var j = 0; j < vmBackRefsCnt; j++) {
            var vmID =
                commonUtils.getValueByJsonPath(vmBackRefs[j], 'uuid', null);
            vmToSvcInstMaps[vmID] = svcInstUUID;
            vmUUIDList.push(vmID);
        }
        for (var j = 0; j < portTuplesCnt; j++) {
            portTupleList.push(portTuples[j]["uuid"]);
            var vmis = commonUtils.getValueByJsonPath(portTuples[j],
                                                      "vmis", []);
            var vmisCnt = vmis.length;
            for (var k = 0; k < vmisCnt; k++) {
                var vmiFqn = commonUtils.getValueByJsonPath(vmis[k],
                                                            "virtual-machine-interface;fq_name",
                                                            null);
                if (null != vmiFqn) {
                    vmiFqn = vmiFqn.join(":");
                    vmiUUIDList.push(vmiFqn);
                }
            }
        }
    }
    vmUUIDList = vmUUIDList.concat(portTupleList);
    if (!vmUUIDList.length) {
        callback(null, null);
        return;
    }
    var vmiURL =
        '/virtual-machine-interfaces?' +
        'fields=virtual_machine_refs,port_tuple_refs&back_ref_id=' +
        vmUUIDList.join(',');
    configApiServer.apiGet(vmiURL, appData, function(error, vmiData) {
        if ((null != error) || (null == vmiData) ||
            (null == vmiData['virtual-machine-interfaces']) ||
            (!vmiData['virtual-machine-interfaces'].length)) {
            callback(error, null);
            return;
        }
        var vmis = vmiData['virtual-machine-interfaces'];
        var vmisCnt = vmis.length;
        var vmiToSvcInstMaps = {};
        for (var i = 0; i < vmisCnt; i++) {
            var vmiUUID = commonUtils.getValueByJsonPath(vmis[i], 'uuid',
                                                        null);
            var vmiFqn = commonUtils.getValueByJsonPath(vmis[i], 'fq_name',
                                                        []);
            vmiFqn = vmiFqn.join(':');
            var vmUUID =
                commonUtils.getValueByJsonPath(vmis[i],
                                               'virtual_machine_refs;0;uuid',
                                               null);
            //var portTupleUUID =
            if (null == vmUUID) {
                continue;
            }
            vmiUUIDList.push(vmiFqn);
            var svcInstID = vmToSvcInstMaps[vmUUID];
            if (null != svcInstID) {
                if (null == instTupleVMIMaps[svcInstID]) {
                    instTupleVMIMaps[svcInstID] = {};
                    instTupleVMIMaps[svcInstID][vmUUID] = {};
                    instTupleVMIMaps[svcInstID][vmUUID]['vmis'] = [];
                }
                if (null == instTupleVMIMaps[svcInstID][vmUUID]) {
                    instTupleVMIMaps[svcInstID][vmUUID] = {};
                    instTupleVMIMaps[svcInstID][vmUUID]['vmis'] = [];
                }
                instTupleVMIMaps[svcInstID][vmUUID]['vmis'].push(vmiFqn);
                vmiToSvcInstMaps[vmiUUID] = vmToSvcInstMaps[vmUUID];
            }
        }
        vmiUUIDList = _.uniq(vmiUUIDList);
        var vmiPostData = {
            'cfilt': ['UveVMInterfaceAgent:health_check_instance_list',
            'UveVMInterfaceAgent:ip_address',
            'UveVMInterfaceAgent:active',
            'UveVMInterfaceAgent:uuid'],
            'kfilt': vmiUUIDList
        };
        var reqUrl = '/analytics/uves/virtual-machine-interface';
        opApiServer.apiPost(reqUrl, vmiPostData, appData, function(error, data) {
            var dataObj = {'vmiData': data,
                'instTupleVMIMaps': instTupleVMIMaps};
            callback(error, dataObj);
        });
    });
}

function getNovaVMIStatusPaginated (request, response, appData)
{
    var limit = request.query["count"];
    var marker = request.query["lastKey"];
    var reqUrl = "/servers/detail";
    var argsFound = false;
    if ((null != limit) && ("undefined" != limit)) {
        reqUrl += "?limit=" + limit;
        argsFound = true;
    }
    if ((null != marker) && ("undefined" != marker)) {
        if (true == argsFound) {
            reqUrl += "&";
        } else {
            reqUrl += "?";
        }
        reqUrl += "marker=" + marker;
    }
    computeApi.getNovaDataByReqUrl(request, reqUrl, function(error, data) {
        var novaStatusData = commonUtils.getValueByJsonPath(data, "servers",
                                                            []);
        commonUtils.handleJSONResponse(error, response, novaStatusData);
    });
}

/**
 * @filterAnalyzerInstancesByType
 * private function
 * 1. This function is used to filter out SIs based on the type and matchReq
      If type is matched and matchReq is set as false, then it returns all the
      SIs which are not of type, are returned, If matchReq is set to true, then
      only SIs which are of type, are returned
 */
function filterAnalyzerInstancesByType (results, type, matchReq)
{
    var found = false;
    var siObjArr = [];
    var filteredResults = [], templateRefs, serviceInstances = {},
        i, k = 0;
    var resLen = results.length;
    for (i = 0; i < resLen; i++) {
        try {
            found = false;
            templateRefs = results[i]['service-instance']['service_template_refs'];
            if ((false == matchReq) && (templateRefs[0]['to'][1] != type)) {
                found = true;
            } else if ((true == matchReq) && (templateRefs[0]['to'][1] == type)) {
                found = true;
            }
        } catch(e) {
            logutils.logger.error("In filterAnalyzerInstancesByType:" +
                                  "JSON Parse error:" + e);
        }
        if (true == found) {
            if (templateRefs[0]['to'][1] != type) {
                filteredResults[k] = results[i];
                k++;
            }
        }
    }
    return filteredResults;
}

/**
 * @siGetListAggCb
 * private function
 * 1. Callback for the SI gets, sends all SIs to client which are of not analyzer
 *    template
 */
function siGetListAggCB (results, appData, callback)
{
    var portTuplesList = [];
    var vmPortTupleList = [];
    var portTupleToSIIdxMaps = {};
    var vmiToPortTupleMap = {};
    var filteredResults =
        filterAnalyzerInstancesByType(results,
                                      global.DEFAULT_ANALYZER_TEMPLATE,
                                      false);
    /* Now attach vm_refs in port-tuples */
    var svcInstCnt = filteredResults.length;
    for (var i = 0; i < svcInstCnt; i++) {
        var configSIData = {ConfigData: filteredResults[i]};
        updateVMStatusByCreateTS(configSIData, true);
        if (null != configSIData.tempVMStatus) {
            filteredResults[i]["service-instance"].tempVMStatus =
                configSIData.tempVMStatus;
        }
        var uuid =
            commonUtils.getValueByJsonPath(filteredResults[i],
                                           'service-instance;uuid',
                                           null);
        var portTuples =
            commonUtils.getValueByJsonPath(filteredResults[i],
                                           'service-instance;port_tuples',
                                           []);
        var portTuplesCnt = portTuples.length;
        if (!portTuplesCnt) {
            continue;
        }
        var vmBackRefs =
            commonUtils.getValueByJsonPath(filteredResults[i],
                                           'service-instance;virtual_machine_back_refs',
                                           []);
        var vmList = [];
        var vmBackRefsCnt = vmBackRefs.length;
        for (var j = 0; j < vmBackRefsCnt; j++) {
            var vmUUID = vmBackRefs[j]['uuid'];
            vmList.push(vmUUID);
        }

        for (var j = 0; j < portTuplesCnt; j++) {
            var portTupleUUID = portTuples[j]['uuid'];
            portTuplesList.push(portTupleUUID);
            portTupleToSIIdxMaps[portTupleUUID] = {siIndex: i, portTupleIdx: j};
        }
        vmPortTupleList = portTuplesList.concat(vmList);
    }
    var vmPortTuplesCnt = vmPortTupleList.length;
    if (!vmPortTuplesCnt) {
        callback(null, filteredResults);
        return;
    }
    var chunk = 200;
    var dataObjArr = [];
    for (var i = 0, j = vmPortTuplesCnt; i < j; i += chunk) {
        var tempArray = vmPortTupleList.slice(i, i + chunk);
        var vmiUrl = '/virtual-machine-interfaces?detail=true&' +
            'fields=port_tuple_refs,virtual_mchine_refs&back_ref_id=' +
            tempArray.join(',');
        commonUtils.createReqObj(dataObjArr, vmiUrl, null, null, null, null,
                                 appData);
    }
    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
              function(err, results) {
        if (null == results) {
            commonUtils.handleJSONResponse(null, response, filteredResults);
            return;
        }
        var chunkCnt = results.length;
        var allVmis = [];
        for (var i = 0; i < chunkCnt; i++) {
            if ((null != results[i]) &&
                (null != results[i]['virtual-machine-interfaces'])) {
                allVmis =
                    allVmis.concat(results[i]['virtual-machine-interfaces']);
            }
        }
        var allVmisCnt = allVmis.length;
        var portTupleIdToVMnVMIObjs = {};
        var portTupleIdToVMIDetailObjs = {};
        var vmiToSIMaps = {};
        for (var i = 0; i < allVmisCnt; i++) {
            var portTupleRefs  =
                commonUtils.getValueByJsonPath(allVmis[i],
                                               'virtual-machine-interface;port_tuple_refs',
                                               []);
            var portTupleRefsCnt = portTupleRefs.length;
            var vmRefs =
                commonUtils.getValueByJsonPath(allVmis[i],
                                               'virtual-machine-interface;virtual_machine_refs',
                                               []);
            var vmiUUID =
                commonUtils.getValueByJsonPath(allVmis[i],
                                               'virtual-machine-interface;uuid',
                                               null);
            var vmiFqn =
                commonUtils.getValueByJsonPath(allVmis[i],
                                               'virtual-machine-interface;fq_name',
                                               null);
            var vmiObjs = {};
            for (var j = 0; j < portTupleRefsCnt; j++) {
                var portTupleID = portTupleRefs[j]['uuid'];
                if (null == portTupleIdToVMnVMIObjs[portTupleID]) {
                    portTupleIdToVMnVMIObjs[portTupleID] = [];
                    var vmis = [];
                    portTupleIdToVMIDetailObjs[portTupleID] = [];
                    var vmiDetails = [];
                } else {
                    vmis = portTupleIdToVMnVMIObjs[portTupleID];
                    vmiDetails = portTupleIdToVMIDetailObjs[portTupleID];
                }
                vmis.push({'virtual-machine-interface': {'fq_name': vmiFqn,
                          'uuid': vmiUUID},
                          'virtual_machine_refs': vmRefs});
                if (null == vmiToPortTupleMap[vmiUUID]) {
                    vmiToPortTupleMap[vmiUUID] = [];
                }
                vmiToPortTupleMap[vmiUUID].push(portTupleID);
                vmiDetails.push(allVmis[i]["virtual-machine-interface"]);
                portTupleIdToVMnVMIObjs[portTupleID] = vmis;
                portTupleIdToVMIDetailObjs[portTupleID] = vmiDetails;
                if (null == vmiToSIMaps[vmiUUID]) {
                    vmiToSIMaps[vmiUUID] = [];
                }
                vmiToSIMaps[vmiUUID].push(portTupleID);
            }
        }
        /* Now attach vmi-vms to port-tuples */
        var parentIntfList = [];
        var childVMIToSIMaps = {};
        for (var i = 0; i < svcInstCnt; i++) {
            var portTuples =
                commonUtils.getValueByJsonPath(filteredResults[i],
                                               'service-instance;port_tuples',
                                               []);
            if (portTuples.length > 0) {
                var len = portTuples.length;
                for (var j = 0; j < len; j++) {
                    filteredResults[i]['service-instance']['port_tuples'][j]
                        ['vmis'] = {};
                    var portTupleUUID = portTuples[j]['uuid'];
                    var vmiObjs = portTupleIdToVMIDetailObjs[portTupleUUID];
                    if (null == vmiObjs) {
                        continue;
                    }
                    var vmiObjsCnt = vmiObjs.length;
                    for (var k = 0; k < vmiObjsCnt; k++) {
                        /* Check if it is sub interface */
                        if (isSubInterface(vmiObjs[k])) {
                            /* */
                            childVMIToSIMaps[vmiObjs[k]] =
                                commonUtils.getValueByJsonPath(filteredResults[i],
                                                               'service-instance;uuid',
                                                               null);
                            var parentVMI =
                                commonUtils.getValueByJsonPath(vmiObjs[k],
                                                               'virtual_machine_interface_refs;0;uuid',
                                                               null);
                            if (null != parentVMI) {
                                parentIntfList.push(parentVMI);
                            }
                        }
                    }
                    filteredResults[i]['service-instance']['port_tuples'][j]
                        ['vmis'] = portTupleIdToVMnVMIObjs[portTupleUUID];
                }
            }
        }
        var parentIntfListCnt = parentIntfList.length;
        if (!parentIntfListCnt) {
            callback(null, filteredResults);
            return;
        }
        var chunk = 200;
        var dataObjArr = [];
        for (var i = 0, j = parentIntfListCnt; i < j; i += chunk) {
            var tempArray = parentIntfList.slice(i, i + chunk);
            var vmiUrl = '/virtual-machine-interfaces?detail=true&' +
                'fields=port_tuple_refs,virtual_machine_interface_refs,' +
                'virtual_machine_refs&obj_uuids=' + tempArray.join(',');
            commonUtils.createReqObj(dataObjArr, vmiUrl, null, null, null, null,
                                     appData);
        }
        async.map(dataObjArr,
                  commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
                  function(err, results) {
            var vmis = [];
            var vmisChunkCnt = results.length;
            for (var i = 0; i < vmisChunkCnt; i++) {
                vmis = vmis.concat(results[i]["virtual-machine-interfaces"]);
            }
            var vmisCnt = vmis.length;
            for (i = 0; i < vmisCnt; i++) {
                var vmiId = commonUtils.getValueByJsonPath(vmis[i],
                                                           "virtual-machine-interface;uuid",
                                                           null);
                var parentVMIId =
                    commonUtils.getValueByJsonPath(vmis[i],
                                                   "virtual-machine-interface;"
                                                   + "virtual_machine_interface_refs;0;uuid",
                                                   null);
                var vmRefs = commonUtils.getValueByJsonPath(vmis[i],
                                                            "virtual-machine-interface;"
                                                            + "virtual_machine_refs;0",
                                                            null);
                if (null == vmRefs) {
                    continue;
                }
                var portTuples = vmiToPortTupleMap[parentVMIId];
                if (null != portTuples) {
                    var portTuplesLen = portTuples.length;
                    for (j = 0; j < portTuplesLen; j++) {
                        var idxObj = portTupleToSIIdxMaps[portTuples[j]];
                        if (null == idxObj) {
                            continue;
                        }
                        try {
                            var vmiIdx =
                                getVMIIdx(filteredResults[idxObj.siIndex]["service-instance"]
                                        ["port_tuples"][idxObj.portTupleIdx]["vmis"],
                                        parentVMIId);
                        } catch(e) {
                            logutils.logger.error("In siGetListAggCB(): " +
                                                  "getVMIIdx error:" + e);
                            vmiIdx = null;
                        }
                        if (null == vmiIdx) {
                            continue;
                        }
                        try {
                            filteredResults[idxObj.siIndex]["service-instance"]["port_tuples"][idxObj.portTupleIdx]
                                ["vmis"][vmiIdx]["virtual_machine_refs"].push(vmRefs);
                        } catch(e) {
                            logutils.logger.error("In siGetListAggCB(): " +
                                                  "idxObj assign error:" + e);
                        }
                    }
                }
            }
            callback(null, filteredResults);
        });
    });
}

function getVMIIdx (vmis, vmiId)
{
    if ((null == vmiId) || (null == vmis) ||
        (!vmis.length)) {
        return;
    }
    var vmisCnt = vmis.length;
    for (var i = 0; i < vmisCnt; i++) {
        if (vmiId ==
            commonUtils.getValueByJsonPath(vmis[i],
                                           "virtual-machine-interface;uuid",
                                           null)) {
            return i;
        }
    }
    return null;
}

/**
 * @filterInAnalyzerInstances
 * private function
 * 1. Filter and return Service Instances (SIs) of default 'analyzer-template' from list of all SIs
 * 2. Required a list of Service Template of 'analyzer' type to identify SIs of this type
 */
function filterInAnalyzerInstances(results, response, appData) 
{
    var filteredResults = [], templateRefs, j, i, k = 0,
        dynamicPolicyNames = [], siName;
    for (i = 0; i < results.length; i++) {
        templateRefs = results[i]['service-instance']['service_template_refs'];
        for (j = 0; j < templateRefs.length; j++) {
            siName = results[i]['service-instance']['fq_name'][2];
            if (templateRefs[j]['to'][1] == global.DEFAULT_ANALYZER_TEMPLATE && siName != global.DEFAULT_FLOW_PCAP_ANALYZER && siName != global.DEFAULT_INTERFACE_PCAP_ANALYZER) {
                filteredResults[k] = results[i];
                dynamicPolicyNames[k] = getDefaultAnalyzerPolicyName(siName);
                k += 1;
                break;
            }
        }
    }
    var projId = response.req.param('id');
    getVNDetailsByServiceInstances(filteredResults, appData, function (filteredResults) {
        logutils.logger.debug("VM Status Nova Query Started at:" + new Date());
        computeApi.getVMStatsByProject(projId, response.req, function (err, data) {
            logutils.logger.debug("VM Status Nova Response processed at:" + new Date());
            var results = updateVMStatConfigDataAgg(filteredResults, data);
            siFetchPolicyCb(response, appData, results, dynamicPolicyNames);
        });
    });
}

function configVMDataAggCb(configData, vmStatData) {
    try {
        var siLen = configData['service_instances'].length;
        for (var i = 0; i < siLen; i++) {
            try {
                for (key in vmStatData[i]) {
                    configData['service_instances'][i][key] =
                        vmStatData[i][key];
                    if (configData['service_instances'][i]['service-instance']) {
                        delete
                            configData['service_instances'][i]['service-instance'];
                    }
                }
            } catch (e) {
            }
        }
    } catch (e) {
    }
    return configData['service_instances'];
}

function updateVMDetails(vmRefs, vmStats) {
    var resultJSON = [];
    try {
        vmStats = vmStats['servers'];
        var vmCnt = vmRefs.length;
        for (var i = 0; i < vmCnt; i++) {
            var vmStatsCnt = vmStats.length;
            resultJSON[i] = {};
            resultJSON[i]['server'] = {};
            for (var j = 0; j < vmStatsCnt; j++) {
                if (vmRefs[i]['uuid'] == vmStats[j]['id']) {
                    resultJSON[i]['server'] = vmStats[j];
                }
            }
        }
    } catch (e) {
        logutils.logger.debug("In updateVMDetails(): JSON Parse error:" + e);
    }
    return resultJSON;
}

function getNetworkPolicyDetailsByProjList(projList, appData, callback) {
    var prjCnt = projList.length;
    var dataObjArr = [];

    for (var i = 0, k = 0; i < prjCnt; i++) {
        try {
            var policys =
                projList[i]['project']['network_policys'];
            var policyCnt = policys.length;
        } catch (e) {
            continue;
        }
        for (var j = 0; j < policyCnt; j++) {
            try {
                var reqUrl =
                    '/network-policy/' + policys[j]['uuid'];
                commonUtils.createReqObj(dataObjArr, reqUrl,
                    global.HTTP_REQUEST_GET, null, null,
                    null, appData);
            } catch (e) {
                continue;
            }
        }
    }
    async.map(dataObjArr,
        commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
        function (err, configData) {
            callback(err, configData);
        });
}

function updateServiceInstanceWithPolicy(serviceInstances, configData) {
    var insertedVN = [];
    var siCnt = serviceInstances.length, analyzerName;
    for (var i = 0; i < siCnt; i++) {
        serviceInstances[i]['network_policy'] = {};
        try {
            var fqName = commonUtils.getValueByJsonPath(serviceInstances[i],
                "service-instance;fq_name", []).join(":");
            var policyCnt = configData.length;
        } catch (e) {
            continue;
        }
        for (var j = 0; j < policyCnt; j++) {
            analyzerName = commonUtils.getValueByJsonPath(configData[j],
                "network-policy;network_policy_entries;policy_rule;0;action_list;mirror_to;analyzer_name",
                null);
            if(fqName === analyzerName) {
                serviceInstances[i]['service-instance']['network_policy'] = configData[j]["network-policy"];
                break;
            }
        }
    }
    return serviceInstances;
}

function getVNDetailsByServiceInstances(serviceInstances, appData, callback) {
    var cnt = serviceInstances.length;
    var insertedProjList = {};
    var dataObjArr = [];

    for (var i = 0, j = 0; i < cnt; i++) {
        var serInst = serviceInstances[i]['service-instance'];
        var projUUID = serInst['parent_uuid'];
        if (null == insertedProjList[projUUID]) {
            var reqUrl = '/project/' + projUUID;
            commonUtils.createReqObj(dataObjArr, reqUrl,
                global.HTTP_REQUEST_GET,
                null, null, null, appData);
            insertedProjList[projUUID] = projUUID;
        }
    }

    async.map(dataObjArr,
        commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
        function (err, configData) {
            getNetworkPolicyDetailsByProjList(configData, appData, function (err, data) {
                serviceInstances = updateServiceInstanceWithPolicy(serviceInstances,
                    data);
                callback(serviceInstances);
            });
        });
}

function updateVMStatConfigDataAgg(configData, vmStats) {
    var result = [];
    var vmFound = true;
    try {
        var servInstCnt = configData.length;
        for (var i = 0; i < servInstCnt; i++) {
            vmFound = true;
            try {
                var vmRefs =
                    configData[i]['service-instance']['virtual_machine_back_refs'];
                if (null == vmRefs) {
                    vmFound = false;
                }
            } catch (e) {
                vmFound = false;
            }
            result[i] = {};
            result[i]['ConfigData'] = configData[i];
            if (false == vmFound) {
                result[i]['vmStatus'] = global.STR_VM_STATE_SPAWNING;
            } else {
                result[i]['VMDetails'] = updateVMDetails(vmRefs, vmStats);
                result[i] = updateVMStatus(result[i]);
            }
            updateVMStatusByCreateTS(result[i]);
        }
    } catch (e) {
        logutils.logger.debug("In updateVMStatConfigDataAgg(): JSON Parse " +
            "error: " + e);
    }
    return result;
}

/**
 * @filterOutAnalyzerInstances
 * private function
 * 1. Filter out Service Instances (SIs) of a 'analyzer' type from list of all SIs
 * 2. Required a list of Service Template of 'analyzer' type to identify SIs of this type
 */
function filterOutAnalyzerInstances(results, response, appData) {
    var siObjArr = [];
    var filteredResults = [], templateRefs, serviceInstances = {},
        i, k = 0;
    for (i = 0; i < results.length; i++) {
        templateRefs = results[i]['service-instance']['service_template_refs'];
        if (templateRefs[0]['to'][1] != global.DEFAULT_ANALYZER_TEMPLATE) {
            filteredResults[k] = results[i];
            k += 1;
        }
    }
    serviceInstances['service_instances'] = filteredResults;
    /* Now add the VM Stats per service instance */
    var projId = response.req.param('id');

    getVNDetailsByServiceInstances(filteredResults, appData, function (filteredResults) {
        logutils.logger.debug("VM Status Nova Query Started at:" + new Date());
        computeApi.getVMStatsByProject(projId, response.req, function (err, data) {
            logutils.logger.debug("VM Status Nova Response processed at:" + new
                Date());
            var result = updateVMStatConfigDataAgg(filteredResults, data);
            commonUtils.handleJSONResponse(null, response, result);
            return;
        });
    });
    /*
     var instCnt = filteredResults.length;
     for (var i = 0; i < instCnt; i++) {
     siObjArr[i] = {};
     siObjArr[i]['req'] = response.req;
     siObjArr[i]['appData'] = appData;
     siObjArr[i]['servInstId'] = filteredResults[i]['service-instance']['uuid'];
     }
     logutils.logger.debug("VM Status Nova Query Started at:" + new Date());
     async.map(siObjArr, getServiceInstanceDetails, function(err, data) {
     serviceInstances = configVMDataAggCb(serviceInstances, data);
     logutils.logger.debug("VM Status Nova Response processed at:" + new
     Date());
     commonUtils.handleJSONResponse(null, response, serviceInstances);
     });
     */
}

/**
 * @siFetchPolicyCb
 * private function
 * 1. Get policy id for given list of SIs of 'analyzer' type
 * 2. Required a list of dynamic policy name for given list of SIs of 'analyzer' type
 */
function siFetchPolicyCb(response, appData, filteredResults, dynamicPolicyNames) 
{
    var serviceInstances = {}, policyUrl = '/network-policys';
    if (filteredResults.length > 0) {
        policyUrl += '?parent_type=project&parent_fq_name_str=' + filteredResults[0]['ConfigData']['service-instance']['fq_name'][0] + ":" + filteredResults[0]['ConfigData']['service-instance']['fq_name'][1];
        configApiServer.apiGet(policyUrl, appData,
            function (error, data) {
                var policys, policyName, index, results = [];
                if (!error) {
                    policys = data['network-policys'];
                    for (var i = 0; i < policys.length; i++) {
                        policyName = policys[i]['fq_name'][2];
                        index = dynamicPolicyNames.indexOf(policyName);
                        if(index != -1) {
                            filteredResults[index]['ConfigData']['service-instance']['policyuuid'] = policys[i]['uuid'];
                            results[results.length] = filteredResults[index];
                        }
                    }
                }
                serviceInstances['service_instances'] = results;
                commonUtils.handleJSONResponse(error, response, serviceInstances);
            });
    } else {
        serviceInstances['service_instances'] = filteredResults;
        commonUtils.handleJSONResponse(null, response, serviceInstances);
    }
};

function formSvcInstRefsPostData (dataObjArr, refsData, svcInstRefs,
                                 type, op, appData)
{
    var parentType = 'project';
    var refsCnt = refsData.length;
    for (var i = 0; i < refsCnt; i++) {
        var putData = {
            'type': type,
            'uuid': refsData[i]['uuid'],
            'ref-type': 'service-instance',
            'ref-uuid': svcInstRefs['uuid'],
            'ref-fq-name': svcInstRefs['to'],
            'operation': op,
            'attr': refsData[i]['attr']
        };
        var reqUrl = '/ref-update';
        commonUtils.createReqObj(dataObjArr, reqUrl,
                                 global.HTTP_REQUEST_POST,
                                 commonUtils.cloneObj(putData), null,
                                 null, appData);
    }
}

function formSvcInstRefsGetData (dataObjArr, postData, type, appData)
{
    var refs = [];
    if ('service-health-check' == type) {
        refs =
        postData['service-instance']['service_health_check_back_refs'];
    }
    if ('interface-route-table' == type) {
        refs =
        postData['service-instance']['interface_route_table_back_refs'];
    }
    if ('routing-policy' == type) {
        refs =
        postData['service-instance']['routing_policy_back_refs'];
    }
    if ('route-aggregate' == type) {
        refs =
        postData['service-instance']['route_aggregate_back_refs'];
    }
    var tmpArr = [];
    if ((null != refs) && (refs.length > 0)) {
        len = refs.length;
        for (var i = 0; i < len; i++) {
            tmpArr.push(refs[i]['uuid']);
        }
    }
    tmpArr = _.uniq(tmpArr);
    if (!tmpArr.length) {
        return -1;
    }
    var reqUrl = '/' + type + 's?detail=true&fields=service_instance_refs' +
        '&obj_uuids=' + tmpArr.join(',');
    commonUtils.createReqObj(dataObjArr, reqUrl,
                             global.HTTP_REQUEST_GET, null, null, null,
                             appData);
    return dataObjArr.length - 1;
}

/**
 * @createServiceInstance
 * public function
 * 1. URL /api/tenants/config/service-instances - Post
 * 2. Sets Post Data and sends back the service instance config to client
 */
function createServiceInstance(request, response, appData) 
{
    var siCreateURL = '/service-instances',
        siPostData = request.body, error;

    if (typeof(siPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ((!('service-instance' in siPostData)) ||
        (!('fq_name' in siPostData['service-instance'])) ||
        (!(siPostData['service-instance']['fq_name'][2].length))) {
        error = new appErrors.RESTServerError('Invalid Service instance');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    /* Check if port_tuples is there (template v2), if yes, then create
     * port_tuple first and then create the service instance
     */
    var dataObjArr = [];
    var vmisDataObjArr = [];
    var portTuples = [];
    if (null != siPostData['service-instance']['port_tuples']) {
        portTuples =
            commonUtils.cloneObj(siPostData['service-instance']['port_tuples']);
    }
    var origPostData = commonUtils.cloneObj(siPostData);
    var portTuplesCnt = portTuples.length;
    var reqUrl = '/port-tuples';
    var vmiObjUUIDs = [];
    var vmiToPortTupleMap = {};
    for (var i = 0; i < portTuplesCnt; i++) {
        var postData = {'port-tuple': {
            'fq_name': portTuples[i]['to'],
            'parent_type': 'service-instance',
            'display_name': portTuples[i]['to'][portTuples[i]['to'].length - 1]
        }};
        commonUtils.createReqObj(dataObjArr, reqUrl,
                                 global.HTTP_REQUEST_POST, postData, null,
                                 null, appData);
        var vmis = portTuples[i]['vmis'];
        var vmisCnt = vmis.length;
        for (var j = 0; j < vmisCnt; j++) {
            vmiObjUUIDs.push(vmis[j]['uuid']);
            vmiToPortTupleMap[vmis[j]['uuid']] =
                {'to': portTuples[i]['to'], 'attr': null,
                 'intfType': vmis[j]['interfaceType']};
        }
    }
    var uniqVmiObjUUIDs = _.uniq(vmiObjUUIDs);
    if (uniqVmiObjUUIDs.length != vmiObjUUIDs.length) {
        var error = new appErrors.RESTServerError('Same port associated with' +
                                                  ' same/multple port tuples');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    if ((portTuplesCnt > 0) && (!uniqVmiObjUUIDs.length)) {
        var error = new appErrors.RESTServerError('No Virtual Machine ' +
                                                  'Interface selected for ' +
                                                  'port tuples');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (uniqVmiObjUUIDs.length > 0) {
        reqUrl = '/virtual-machine-interfaces?detail=true' +
            '&fields=virtual_machine_interface_properties,port_tuple_refs' +
            '&obj_uuids=' + uniqVmiObjUUIDs.join(',');
        commonUtils.createReqObj(dataObjArr, reqUrl,
                                 global.HTTP_REQUEST_GET, null, null, null,
                                 appData);
    }

    var intfRtTableGetIndex =
        formSvcInstRefsGetData(dataObjArr, origPostData, 'interface-route-table',
                               appData);
    var svcHealthChkGetIndex =
        formSvcInstRefsGetData(dataObjArr, origPostData, 'service-health-check',
                               appData);
    var rtPolGetIndex =
        formSvcInstRefsGetData(dataObjArr, origPostData, 'routing-policy',
                               appData);
    var rtAggGetIndex =
        formSvcInstRefsGetData(dataObjArr, origPostData, 'route-aggregate',
                               appData);
    delete siPostData['service-instance']['port_tuples'];
    delete siPostData['service-instance']['interface_route_table_back_refs'];
    delete siPostData['service-instance']['service_health_check_back_refs'];
    delete siPostData['service-instance']['routing_policy_back_refs'];
    delete siPostData['service-instance']['route_aggregate_back_refs'];
    configApiServer.apiPost(siCreateURL, siPostData, appData,
                            function(error, siPostResp) {
        if (null != error) {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
        async.map(dataObjArr,
                  commonUtils.getServerResponseByRestApi(configApiServer,
                                                         true),
                  function(error, results) {
            if (null != error) {
                commonUtils.handleJSONResponse(error, response, null);
                return;
            }
            var portTupleObjs = {};
            for (var i = 0; i < portTuplesCnt; i++) {
                var fqn = results[i]['port-tuple']['fq_name'].join(':');
                portTupleObjs[fqn] = results[i]['port-tuple']['uuid'];
            }
            for (key in vmiToPortTupleMap) {
                var portTupleFqn = vmiToPortTupleMap[key]['to'];
                if (null != portTupleObjs[portTupleFqn]) {
                    vmiToPortTupleMap[key]['uuid'] =
                        portTupleObjs[portTupleFqn];
                }
            }
            var vmiDetails = [];
            if (uniqVmiObjUUIDs.length > 0) {
                vmiDetails =
                    results[portTuplesCnt]['virtual-machine-interfaces'];
            }
            var vmiCnt = vmiDetails.length;
            dataObjArr = [];
            for (var i = 0; i < vmiCnt; i++) {
                if (null ==
                    vmiDetails[i]['virtual-machine-interface']
                        ['port_tuple_refs']) {
                    vmiDetails[i]['virtual-machine-interface']
                        ['port_tuple_refs'] = [];
                }
                var vmiUUID =
                    vmiDetails[i]['virtual-machine-interface']['uuid'];
                var portTupleRef = vmiToPortTupleMap[vmiUUID];
                if (null == portTupleRef) {
                    continue;
                }
                vmiDetails[i]['virtual-machine-interface']
                    ['port_tuple_refs'].push(portTupleRef);
                var vmiProp =
                    vmiDetails[i]['virtual-machine-interface']
                        ['virtual_machine_interface_properties'];
                if (null == vmiProp) {
                    vmiProp = {};
                    vmiProp['sub_interface_vlan_tag'] = null;
                    vmiProp['interface_mirror'] = null;
                    vmiProp['local_preference'] = null;
                }
                vmiProp['service_interface_type'] =
                    vmiToPortTupleMap[vmiUUID]['intfType'];
                delete portTupleRef['intfType'];
                var vmiPutData = {
                    'virtual-machine-interface': {
                        'display_name':
                            vmiDetails[i]['virtual-machine-interface']['display_name'],
                        'uuid': vmiUUID,
                        'fq_name':
                            vmiDetails[i]['virtual-machine-interface']['fq_name'],
                        'parent_type': 'project',
                        'port_tuple_refs':
                            vmiDetails[i]['virtual-machine-interface']['port_tuple_refs'],
                        'virtual_machine_interface_properties': vmiProp,
                        'annotations': { "key_value_pair":
                            [{ "key": "_service_vm_", "value": "True"}]}
                    }
                };
                var reqUrl = '/virtual-machine-interface/' +
                    vmiDetails[i]['virtual-machine-interface']['uuid'];
                commonUtils.createReqObj(dataObjArr, reqUrl,
                                         global.HTTP_REQUEST_PUT, vmiPutData,
                                         null, null, appData);
            }
            async.map(dataObjArr,
                      commonUtils.getServerResponseByRestApi(configApiServer,
                                                             false),
                      function(error, data) {
                if (null != error) {
                    commonUtils.handleJSONResponse(error, response, null);
                    return;
                }
                /* Now update the service instance */
                for (var i = 0; i < portTuplesCnt; i++) {
                    delete portTuples[i]['vmis'];
                    if (null != portTupleObjs[portTuples[i]['to']]) {
                        portTuples[i]['uuid'] =
                            portTupleObjs[portTuples[i]['to']];
                    }
                };
                var svcInstPutData = {
                    'service-instance': {
                        'fq_name': siPostData['service-instance']['fq_name'],
                        'parent_type': 'project',
                        'uuid': siPostResp['service-instance']['uuid'],
                        'port_tuples': portTuples
                    }
                };
                var siPutURL = '/service-instance/' +
                    siPostResp['service-instance']['uuid'];
                configApiServer.apiPut(siPutURL, svcInstPutData, appData,
                                       function(error, data) {
                    /* Now update all the refs */
                    dataObjArr = [];
                    var svcInstRefs = {
                        'to': siPostResp['service-instance']['fq_name'],
                        'uuid': siPostResp['service-instance']['uuid']
                    };
                    if (-1 != intfRtTableGetIndex) {
                        formSvcInstRefsPostData(dataObjArr,
                                           origPostData['service-instance']
                                            ['interface_route_table_back_refs'],
                                            svcInstRefs,
                                            'interface-route-table',
                                            'ADD',
                                            appData);
                    }
                    if (-1 != rtAggGetIndex) {
                        formSvcInstRefsPostData(dataObjArr,
                                           origPostData['service-instance']
                                            ['route_aggregate_back_refs'],
                                            svcInstRefs,
                                            'route-aggregate',
                                            'ADD',
                                            appData);
                    }
                    if (-1 != rtPolGetIndex) {
                        formSvcInstRefsPostData(dataObjArr,
                                           origPostData['service-instance']
                                            ['routing_policy_back_refs'],
                                            svcInstRefs,
                                            'routing-policy',
                                            'ADD',
                                            appData);
                    }
                    if (-1 != svcHealthChkGetIndex) {
                        formSvcInstRefsPostData(dataObjArr,
                                           origPostData['service-instance']
                                            ['service_health_check_back_refs'],
                                            svcInstRefs,
                                            'service-health-check',
                                            'ADD',
                                            appData);
                    }
                    if (!dataObjArr.length) {
                        commonUtils.handleJSONResponse(error, response, data);
                        return;
                    }
                    async.map(dataObjArr,
                              commonUtils.getServerResponseByRestApi(configApiServer,
                                                                     false),
                              function(error, data) {
                        commonUtils.handleJSONResponse(error, response, data);
                    });
                });
            })
        });
    });
}

function formSvcInstPortTupleRefsPostData (dataObjArr, vmiObj, portTupleObj,
                                           vmiDetails, operation, appData)
{
    var reqUrl = null;
    var reqType = global.HTTP_REQUEST_POST;
    var vmi = vmiDetails[vmiObj['uuid']];

    var data = null;
    if ('ADD' == operation) {
        if ((null == vmi) || (null == vmi['virtual-machine-interface'])) {
            return;
        }
        var vmiPutData = {};
        if (null == vmi['virtual-machine-interface']['port_tuple_refs']) {
            vmi['virtual-machine-interface']['port_tuple_refs'] = [];
        }
        vmiPutData['port_tuple_ref'] = {'to': portTupleObj['to'], 'uuid':
            portTupleObj['uuid'], 'attr': null};
        vmiPutData['fq_name'] =
            commonUtils.getValueByJsonPath(vmi,
                                           'virtual-machine-interface;fq_name',
                                           null);
        vmiPutData['uuid'] =
            commonUtils.getValueByJsonPath(vmi,
                                           'virtual-machine-interface;uuid',
                                           null);
        var vmiProp =
            commonUtils.getValueByJsonPath(vmi,
                                           'virtual-machine-interface;virtual_machine_interface_properties',
                                           null);
        vmiPutData['virtual_machine_interface_properties'] = {};
        if (null != vmiProp) {
            vmiPutData['virtual_machine_interface_properties'] = vmiProp;
        }
        vmiPutData['virtual_machine_interface_properties']
            ['service_interface_type'] = vmiObj['interfaceType'];
        dataObjArr.push(vmiPutData);
    } else {
        /*
        var portTupleRefs = vmi['virtual-machine-interface']['port_tuple_refs'];
        var portTupleRefsCnt = portTupleRefs.length;
        for (var i = 0; i < portTupleRefsCnt; i++) {
            if (portTupleRefs[i]['uuid'] == portTupleObj['uuid']) {
                portTupleRefs.splice(i, 1);
                break;
            }
        }
        vmi['virtual-machine-interface']['port_tuple_refs'] = portTupleRefs;
        */
        var data = {
            'type': 'virtual-machine-interface',
            'uuid': vmiObj['uuid'],
            'ref-type': 'port-tuple',
            'ref-uuid': portTupleObj['uuid'],
            'ref-fq-name': portTupleObj['to'],
            'operation': operation,
            'attr': null
        };
        reqUrl = '/ref-update';
        commonUtils.createReqObj(dataObjArr, reqUrl, reqType, data, null, null,
                                 appData);
    }
}

function updatePortTuples (configSIData, siPostData, vmiDetails, appData,
                           callback)
{
    var dataObjArr = [];
    var portTuples = [];
    var portTuplesCnt = 0;

    if (null != siPostData['service-instance']['port_tuples']) {
        portTuples =
            commonUtils.cloneObj(siPostData['service-instance']['port_tuples']);
        portTuplesCnt = portTuples.length;
    }

    var cfgPortTuples = [];
    var tmpPortTuplesArr = [];
    if (null != configSIData['service-instance']['port_tuples']) {
        cfgPortTuples =
            commonUtils.cloneObj(configSIData['service-instance']['port_tuples']);
        tmpPortTuplesArr =
            commonUtils.cloneObj(configSIData['service-instance']['port_tuples']);
    }
    var cfgPortTuplesCnt = cfgPortTuples.length;
    for (var i = 0; i < cfgPortTuplesCnt; i++) {
        delete tmpPortTuplesArr[i]['href'];
    }
    var uiOldPortTuples = [];
    var uiOldPortTuplesCnt = 0;
    if (null != siPostData['service-instance']['old_port_tuples']) {
        uiOldPortTuples =
            commonUtils.cloneObj(siPostData['service-instance']['old_port_tuples']);
        uiOldPortTuplesCnt = uiOldPortTuples.length;
    }
    var uiPortTuples = commonUtils.cloneObj(portTuples);
    var uiPortTuplesCnt = uiPortTuples.length;
    var tmpUIPortTupleObjs = {};
    for (i = 0; i < uiPortTuplesCnt; i++) {
        var fqn = uiPortTuples[i]['to'].join(':');
        if (null != uiPortTuples[i]['vmis']) {
            tmpUIPortTupleObjs[fqn] =
                commonUtils.cloneObj(uiPortTuples[i]['vmis']);
            delete uiPortTuples[i]['vmis'];
        }
    }
    for (i = 0; i < uiOldPortTuplesCnt; i++) {
        var fqn = uiOldPortTuples[i]['to'].join(':');
        if ((null == tmpUIPortTupleObjs[fqn]) &&
            (null != uiOldPortTuples[i]['vmis'])) {
            tmpUIPortTupleObjs[fqn] =
                commonUtils.cloneObj(uiOldPortTuples[i]['vmis']);
        }
    }

    var changedPortTuples =
        jsonDiff.getConfigArrayDelta('port-tuple', tmpPortTuplesArr,
                                     uiPortTuples);
    if (null != changedPortTuples) {
            var newPortTuples = changedPortTuples['addedList'];
            var newPortTuplesCnt = newPortTuples.length;
            for (var i = 0; i < newPortTuplesCnt; i++) {
                var postData = {'port-tuple': {
                    'fq_name': newPortTuples[i]['to'],
                    'parent_type': 'service-instance',
                    'display_name': newPortTuples[i]['to'][portTuples[i]['to'].length - 1]
                }};
                reqUrl = '/port-tuples';
                commonUtils.createReqObj(dataObjArr, reqUrl,
                                         global.HTTP_REQUEST_POST, postData,
                                         null, null, appData);
            }
            if (dataObjArr.length > 0) {
                async.map(dataObjArr,
                          commonUtils.getServerResponseByRestApi(configApiServer,
                                                                 false),
                          function(error, portTuplesAddConfig) {
                    if (null != error) {
                        callback(error, changedPortTuples, portTuplesAddConfig);
                        return;
                    }
                    updatePortTupleRefsInVMI(changedPortTuples['deletedList'],
                                             tmpUIPortTupleObjs, vmiDetails,
                                             'DELETE', appData,
                                             function(error, data) {
                        updatePortTupleRefsInVMI(newPortTuples,
                                                 tmpUIPortTupleObjs,
                                                 vmiDetails, 'ADD', appData,
                                                 function(error, data) {
                            /* All add/deleted port-tuple updation is done, now
                             * check if any non-change port-tuple has change in
                             * VMI refereneces
                             */
                            updateVMIsInPortTuples(configSIData, siPostData,
                                                   vmiDetails, appData,
                                                   function(error, data) {
                                callback(error, changedPortTuples,
                                     portTuplesAddConfig);
                            });
                        });
                    });
                });
            } else {
                updatePortTupleRefsInVMI(changedPortTuples['deletedList'],
                                         tmpUIPortTupleObjs, vmiDetails, 'DELETE', appData,
                                         function(error, data) {
                    updateVMIsInPortTuples(configSIData, siPostData,
                                           vmiDetails, appData,
                                           function(error, data) {
                        callback(error, changedPortTuples,
                                 null);
                    });
                });
            }
    } else {
        updateVMIsInPortTuples(configSIData, siPostData,
                               vmiDetails, appData, function(error, data) {
            callback(null, null, null);
        });
    }
}

function updateVMIsInPortTuples (configSIData, siPostData, vmiDetails, appData,
                                 callback)
{
    var uiPortTuples = [];
    var cfgPortTuples = [];
    if (null != configSIData['service-instance']['port_tuples']) {
        cfgPortTuples =
            commonUtils.cloneObj(configSIData['service-instance']['port_tuples']);
        uiPortTuples =
            commonUtils.cloneObj(siPostData['service-instance']['port_tuples']);
    }
    var cfgPortTuplesCnt = 0;
    if (null != cfgPortTuples) {
        cfgPortTuplesLen = cfgPortTuples.length;
    }
    var uiPortTuplesLen = 0;
    if (null != uiPortTuples) {
        uiPortTuplesLen = uiPortTuples.length;
    }
    var cfgPortTulesUUIDList = [];
    var tmpPortTupleObjs = {};
    for (var i = 0; i < cfgPortTuplesLen; i++) {
        cfgPortTulesUUIDList.push(cfgPortTuples[i]['uuid']);
        tmpPortTupleObjs[cfgPortTuples[i]['uuid']] = i;
    }
    if (cfgPortTulesUUIDList.length > 1) {
        cfgPortTulesUUIDList = _.uniq(cfgPortTulesUUIDList);
    }
    if (!cfgPortTulesUUIDList.length) {
        /* We should not come here, already taken care this case earlier */
        callback(null, null);
        return;
    }
    var vmiUrl =
        '/virtual-machine-interfaces?detail=true&&fields=port_tuple_refs&back_ref_id=' +
        cfgPortTulesUUIDList.join(',');
    configApiServer.apiGet(vmiUrl, appData, function(error, configData) {
        if ((null != error) || (null == configData) ||
            (null == configData['virtual-machine-interfaces'])) {
            callback(error, configData);
            return;
        }
        var vmis = configData['virtual-machine-interfaces'];
        var vmisCnt = vmis.length;
        var portTupleObjs = {};
        for (var i = 0; i < vmisCnt; i++) {
            var vmi = vmis[i]['virtual-machine-interface'];
            var intfType =
                commonUtils.getValueByJsonPath(vmi,
                                               'virtual_machine_interface_properties;'
                                               + 'service_interface_type',
                                               null);
            var portTupleRefs =
                commonUtils.getValueByJsonPath(vmi,
                                               'port_tuple_refs', []);
            var portTupleRefsCnt = portTupleRefs.length;
            for (var j = 0; j < portTupleRefsCnt; j++) {
                var portTupleUUID = portTupleRefs[j]['uuid'];
                if (null != tmpPortTupleObjs[portTupleUUID]) {
                    if (null == portTupleObjs[portTupleUUID]) {
                        portTupleObjs[portTupleUUID] = [];
                    }
                    portTupleObjs[portTupleUUID].push({'fq_name':
                                                        vmi['fq_name'],
                                                      interfaceType: intfType,
                                                      uuid: vmi['uuid']});
                    break;
                }
            }
        }
        var dataObjArr = [];
        var addDataObjArr = [];
        for (var i = 0; i < uiPortTuplesLen; i++) {
            var uiUUID = uiPortTuples[i]['uuid'];
            if (null != portTupleObjs[uiUUID]) {
                var vmisDelta =
                    jsonDiff.getConfigArrayDelta('port-tuple-vmi',
                                                 portTupleObjs[uiUUID],
                                                 uiPortTuples[i]['vmis']);
                if (null != vmisDelta) {
                    if ((null != vmisDelta['deletedList']) &&
                        (vmisDelta['deletedList'].length > 0)) {
                        var len = vmisDelta['deletedList'].length;
                        for (var k = 0; k < len; k++) {
                            formSvcInstPortTupleRefsPostData(dataObjArr,
                                                  vmisDelta['deletedList'][k],
                                                  uiPortTuples[i], vmiDetails,
                                                  'DELETE', appData);
                        }
                    }
                    if ((null != vmisDelta['addedList']) &&
                        (vmisDelta['addedList'].length > 0)) {
                        var len = vmisDelta['addedList'].length;
                        for (var k = 0; k < len; k++) {
                            formSvcInstPortTupleRefsPostData(addDataObjArr,
                                                  vmisDelta['addedList'][k],
                                                  uiPortTuples[i], vmiDetails,
                                                  'ADD', appData);
                        }
                    }
                }
            }
        }
        async.mapSeries(dataObjArr,
                  commonUtils.getServerResponseByRestApi(configApiServer,
                                                         false),
                  function(error, data) {
            addPortTupleRefsInVMI(addDataObjArr, appData, function(error, data) {
                callback(error, data);
            });
        });
    });
}

function addPortTupleRefsInVMI (addDataObjArr, appData, callback)
{
    if (null == addDataObjArr) {
        callback(null, null);
        return;
    }

    var dataObjArr = [];
    var addDataObjArrLen = addDataObjArr.length;
    var vmiList = [];
    var tmpVMIToIdxMap = {};
    for (var i = 0; i < addDataObjArrLen; i++) {
        vmiList.push(addDataObjArr[i]['uuid']);
        tmpVMIToIdxMap[addDataObjArr[i]['uuid']] = i;
    }
    var vmiListLen = vmiList.length;
    if (vmiListLen > 0) {
        var vmiGetUrl = '/virtual-machine-interfaces?detail=true&obj_uuids=' +
            vmiList.join(',') + '&fields=port_tuple_refs';
        commonUtils.createReqObj(dataObjArr, vmiGetUrl, null, null, null, null,
                                 appData);
    }
    if (!dataObjArr.length) {
        callback(null, null);
        return;
    }

    configApiServer.apiGet(vmiGetUrl, appData, function(error, vmiDetails) {
        if ((null != error) || (null == vmiDetails) ||
            (null == vmiDetails['virtual-machine-interfaces'])) {
            callback(error, null);
            return;
        }
        var vmiConfigData =
            commonUtils.getValueByJsonPath(vmiDetails,
                                           'virtual-machine-interfaces', []);
        var vmiConfigDataLen = vmiConfigData.length;
        dataObjArr = [];
        for (var i = 0; i < vmiConfigDataLen; i++) {
            var vmiConfig =
            commonUtils.getValueByJsonPath(vmiConfigData[i],
                                           'virtual-machine-interface', null);
            var configUUID =
                commonUtils.getValueByJsonPath(vmiConfig, 'uuid', null);
            var idx = tmpVMIToIdxMap[configUUID];
            if ((null != configUUID) && (null != idx)) {
                var putData = {'virtual-machine-interface': {}};
                if (null == vmiConfig['port_tuple_refs']) {
                    vmiConfig['port_tuple_refs'] = [];
                }
                vmiConfig['port_tuple_refs'].push(addDataObjArr[idx]['port_tuple_ref']);
                delete addDataObjArr[idx]['port_tuple_ref'];
                addDataObjArr[idx]['port_tuple_refs'] =
                    vmiConfig['port_tuple_refs'];
                putData['virtual-machine-interface'] = addDataObjArr[idx];
                var vmiPutUrl = '/virtual-machine-interface/' + configUUID;
                commonUtils.createReqObj(dataObjArr, vmiPutUrl,
                                         global.HTTP_REQUEST_PUT,
                                         commonUtils.cloneObj(putData), null,
                                         null, appData);
            }
        }
        async.map(dataObjArr,
                  commonUtils.getServerResponseByRestApi(configApiServer,
                                                         false),
                  function(error, data) {
            callback(error, data);
        });
    });
    return;
}

function updatePortTupleRefsInVMI (portTuples, tmpUIPortTupleObjs, vmiDetails,
                                   operation, appData, callback)
{
    var dataObjArr = [];
    if ((null == portTuples) || (!portTuples.length)) {
        callback(null, null);
        return;
    }
    var cnt = portTuples.length;
    var addDataObjArr = [];
    for (var i = 0; i < cnt; i++) {
        var fqn = portTuples[i]['to'].join(':');
        var vmis = tmpUIPortTupleObjs[fqn];
        if (null == vmis) {
            continue;
        }
        var vmisCnt = vmis.length;
        for (var j = 0; j < vmisCnt; j++) {
            if ('DELETE' == operation) {
                formSvcInstPortTupleRefsPostData(dataObjArr, vmis[j],
                                                 portTuples[i], vmiDetails,
                                                 operation, appData);
            } else {
                formSvcInstPortTupleRefsPostData(addDataObjArr, vmis[j],
                                                 portTuples[i], vmiDetails,
                                                 operation, appData);
            }
        }
    }

    async.mapSeries(dataObjArr,
              commonUtils.getServerResponseByRestApi(configApiServer,
                                                     false),
              function(error, data) {
        if (null != error) {
            callback(error, data);
            return;
        }
        if ('ADD' == operation) {
            addPortTupleRefsInVMI(addDataObjArr, appData,
                                  function(error, data) {
                callback(error, data);
            });
            return;
        }
        dataObjArr = [];
        for (var i = 0; i < cnt; i++) {
            var reqUrl = '/port-tuple/' + portTuples[i]['uuid'];
            commonUtils.createReqObj(dataObjArr, reqUrl,
                                     global.HTTP_REQUEST_DEL,
                                     null, null, null, appData);
        }
        if (!dataObjArr.length) {
            callback(error, data);
            return;
        }
        async.map(dataObjArr,
                  commonUtils.getServerResponseByRestApi(configApiServer,
                                                         false),
                  function(error, data) {
            callback(error, data);
        });
    });
}

function deleteHrefFromBackRefs (backRefs)
{
    if (null == backRefs) {
        return;
    }
    var cnt = backRefs.length;
    for (var i = 0; i < cnt; i++) {
        delete backRefs[i]['href'];
    }
}

function updateSIRefs (configSIData, siPostData, appData, callback)
{
    var cfgRtTabBackRefs =
        configSIData['service-instance']['interface_route_table_back_refs'];
    var uiRtTabBackRefs =
        siPostData['service-instance']['interface_route_table_back_refs'];
    var cfgRtAggBackRefs =
        configSIData['service-instance']['route_aggregate_back_refs'];
    var uiRtAggBackRefs =
        siPostData['service-instance']['route_aggregate_back_refs'];
    var cfgRtPolBackRefs =
        configSIData['service-instance']['routing_policy_back_refs'];
    var uiRtPolBackRefs =
        siPostData['service-instance']['routing_policy_back_refs'];
    var cfgSvcHealthChkBackRefs =
        configSIData['service-instance']['service_health_check_back_refs'];
    var uiSvcHealthChkBackRefs =
        siPostData['service-instance']['service_health_check_back_refs'];
    deleteHrefFromBackRefs(cfgRtTabBackRefs);
    var rtTabArrDiff =
        jsonDiff.getConfigArrayDelta('interface-route-table',
                                     cfgRtTabBackRefs, uiRtTabBackRefs);
    deleteHrefFromBackRefs(cfgRtAggBackRefs);
    var rtAggArrDiff =
        jsonDiff.getConfigArrayDelta('route-aggregate',
                                     cfgRtAggBackRefs, uiRtAggBackRefs);
    deleteHrefFromBackRefs(cfgRtPolBackRefs);
    var rtPolArrDiff =
        jsonDiff.getConfigArrayDelta('routing-policy',
                                     cfgRtPolBackRefs, uiRtPolBackRefs);
    deleteHrefFromBackRefs(cfgSvcHealthChkBackRefs);
    var svcHealthChkArrDiff =
        jsonDiff.getConfigArrayDelta('service-health-check',
                                     cfgSvcHealthChkBackRefs,
                                     uiSvcHealthChkBackRefs);
    var svcInstRefs = {
        'to': siPostData['service-instance']['fq_name'],
        'uuid': siPostData['service-instance']['uuid']
    };
    var dataObjArr = [];
    if (null != rtTabArrDiff) {
        if ((null != rtTabArrDiff['deletedList']) &&
            (rtTabArrDiff['deletedList'].length > 0)) {
            formSvcInstRefsPostData(dataObjArr,
                                    rtTabArrDiff['deletedList'],
                                    svcInstRefs, 'interface-route-table',
                                    'DELETE', appData);
        }
        if ((null != rtTabArrDiff['addedList']) &&
            (rtTabArrDiff['addedList'].length > 0)) {
            formSvcInstRefsPostData(dataObjArr,
                                    rtTabArrDiff['addedList'],
                                    svcInstRefs, 'interface-route-table',
                                    'ADD', appData);
        }
    }
    if (null != rtAggArrDiff) {
        if ((null != rtAggArrDiff['deletedList']) &&
            (rtAggArrDiff['deletedList'].length > 0)) {
            formSvcInstRefsPostData(dataObjArr,
                                    rtAggArrDiff['deletedList'],
                                    svcInstRefs, 'route-aggregate',
                                    'DELETE', appData);
        }
        if ((null != rtAggArrDiff['addedList']) &&
            (rtAggArrDiff['addedList'].length > 0)) {
            formSvcInstRefsPostData(dataObjArr,
                                    rtAggArrDiff['addedList'],
                                    svcInstRefs, 'route-aggregate',
                                    'ADD', appData);
        }
    }
    if (null != rtPolArrDiff) {
        if ((null != rtPolArrDiff['deletedList']) &&
            (rtPolArrDiff['deletedList'].length > 0)) {
            formSvcInstRefsPostData(dataObjArr,
                                    rtPolArrDiff['deletedList'],
                                    svcInstRefs, 'routing-policy',
                                    'DELETE', appData);
        }
        if ((null != rtPolArrDiff['addedList']) &&
            (rtPolArrDiff['addedList'].length > 0)) {
            formSvcInstRefsPostData(dataObjArr,
                                    rtPolArrDiff['addedList'],
                                    svcInstRefs, 'routing-policy',
                                    'ADD', appData);
        }
    }
    if (null != svcHealthChkArrDiff) {
        if ((null != svcHealthChkArrDiff['deletedList']) &&
            (svcHealthChkArrDiff['deletedList'].length > 0)) {
            formSvcInstRefsPostData(dataObjArr,
                                    svcHealthChkArrDiff['deletedList'],
                                    svcInstRefs, 'service-health-check',
                                    'DELETE', appData);
        }
        if ((null != svcHealthChkArrDiff['addedList']) &&
            (svcHealthChkArrDiff['addedList'].length > 0)) {
            formSvcInstRefsPostData(dataObjArr,
                                    svcHealthChkArrDiff['addedList'],
                                    svcInstRefs, 'service-health-check',
                                    'ADD', appData);
        }
    }
    if (!dataObjArr.length) {
        callback(null, null);
        return;
    }
    async.mapSeries(dataObjArr,
              commonUtils.getServerResponseByRestApi(configApiServer, false),
              function(error, data) {
        callback(error, data);
    });
}

function getOldPortTuplesBySIid (siId, request, appData, callback)
{
    var oldPortTupleList = [];
    var siURL = '/service-instance/' + siId;
    configApiServer.apiGet(siURL, appData, function(error, siConfig) {
        if ((null != error) || (null == siConfig) ||
            (null == siConfig['service-instance'])) {
            callback(error, siConfig);
            return;
        }
        var portTuples =
            commonUtils.getValueByJsonPath(siConfig,
                                           'service-instance;port_tuples',
                                           []);
        var portTuplesCnt = portTuples.length;
        var portTupleUUIDList = [];
        var tmpPortTupleUUIDToIdxMap = {};
        for (var i = 0; i < portTuplesCnt; i++) {
            portTupleUUIDList.push(portTuples[i]['uuid']);
            oldPortTupleList.push({'to': portTuples[i]['to'],
                                   'uuid': portTuples[i]['uuid']});
            tmpPortTupleUUIDToIdxMap[portTuples[i]['uuid']] = i;
        }
        if (!portTupleUUIDList.length) {
            callback(null, []);
            return;
        }
        var vmiURL = '/virtual-machine-interfaces?detail=true&back_ref_id=' +
            portTupleUUIDList.join(',');
        configApiServer.apiGet(vmiURL, appData, function(error, vmiData) {
            if ((null != error) || (null == vmiData)) {
                callback(error, vmiData);
                return;
            }
            var vmis =
                commonUtils.getValueByJsonPath(vmiData,
                                               'virtual-machine-interfaces',
                                               []);
            var vmisCnt = vmis.length;
            for (var i = 0; i < vmisCnt; i++) {
                var vmi = vmis[i]['virtual-machine-interface'];
                var portTupleRefs =
                    commonUtils.getValueByJsonPath(vmi,
                                                   'port_tuple_refs', []);
                var portTupleRefsCnt = portTupleRefs.length;
                var intfType =
                    commonUtils.getValueByJsonPath(vmi,
                                'virtual_machine_interface_properties;' +
                                'service_interface_type',
                                null);
                for (var j = 0; j < portTupleRefsCnt; j++) {
                    var portTupleID = portTupleRefs[j]['uuid'];
                    var idx = tmpPortTupleUUIDToIdxMap[portTupleID];
                    if (null != idx) {
                        if (null == oldPortTupleList[idx]['vmis']) {
                            oldPortTupleList[idx]['vmis'] = [];
                        }
                        oldPortTupleList[idx]['vmis'].push({'fq_name':
                                                        vmi['fq_name'],
                                                      'uuid': vmi['uuid'],
                                                      'interfaceType':
                                                        intfType});
                    }
                }
            }
            callback(null, oldPortTupleList);
        });
    });
}

/**
 * @updateServiceInstance
 * public function
 * 1. URL /api/tenants/config/service-instances - Put
 * 2. Sets Put Data and sends back the service instance config to client
 */
function updateServiceInstance(request, response, appData) 
{
    var siId       = null;
    var siPutURL   = '/service-instance/';
    var siPostData = request.body;
    var error;

    if (typeof(siPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (siId = request.param('uuid').toString()) {
        siPutURL += siId;
    } else {
        error = new appErrors.RESTServerError('Add Service Instence ID');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ((!('service-instance' in siPostData)) ||
        (!('fq_name' in siPostData['service-instance'])) ||
        (!(siPostData['service-instance']['fq_name'][2].length))) {
        error = new appErrors.RESTServerError('Invalid Service instance');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    getOldPortTuplesBySIid(siId, request, appData,
                           function(error, oldPortTuples) {
        if (null != error) {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
        siPostData['service-instance']['old_port_tuples'] = oldPortTuples;

    var portTuples = [];
    var portTuplesCnt = 0;
    if (null != siPostData['service-instance']['port_tuples']) {
        portTuples =
            commonUtils.cloneObj(siPostData['service-instance']['port_tuples']);
        portTuplesCnt = portTuples.length;
    }
    var vmiList = [];
    for (var i = 0; i < portTuplesCnt; i++) {
        var vmis = portTuples[i]['vmis'];
        var vmisCnt = 0;
        if (null != vmis) {
            vmisCnt = vmis.length;
        }
        for (var j = 0; j < vmisCnt; j++) {
            vmiList.push(vmis[j]['uuid']);
        }
    }
    var tmpVmiList = _.uniq(vmiList);
    if (tmpVmiList.length != vmiList.length) {
        var error = new appErrors.RESTServerError('Same port associated with' +
                                                  ' same/multple port tuples');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    if ((portTuplesCnt > 0) && (!tmpVmiList.length)) {
        var error = new appErrors.RESTServerError('No Virtual Machine ' +
                                                  'Interface selected for ' +
                                                  'port tuples');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    vmiList = _.uniq(vmiList);
    var dataObjArr = [];
    if (vmiList.length > 0) {
        var vmiUrl = '/virtual-machine-interfaces?detail=true&obj_uuids=' +
            vmiList.join(',');
        commonUtils.createReqObj(dataObjArr, vmiUrl, global.HTTP_REQUEST_GET,
                                 null, null, null, appData);
    }
    var siUrl = '/service-instance/' + siPostData['service-instance']['uuid'];
    commonUtils.createReqObj(dataObjArr, siUrl, global.HTTP_REQUEST_GET,
                             null, null, null, appData);

    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(configApiServer,
                                                     true),
              function(error, configSiVmiData) {
        if (null != error) {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
        var vmiDetails = [];
        var configSIData;
        if (vmiList.length > 0) {
            vmiDetails =
                commonUtils.getValueByJsonPath(configSiVmiData[0],
                                               'virtual-machine-interfaces',
                                               []);
            configSIData = configSiVmiData[1];
        } else {
            configSIData = configSiVmiData[0];
        }

        var vmiObjs = {};
        var vmiDetailsCnt = 0;
        if (null != vmiDetails) {
            vmiDetailsCnt = vmiDetails.length;
        }
        for (var i = 0; i < vmiDetailsCnt; i++) {
            var vmiUUID = vmiDetails[i]['virtual-machine-interface']['uuid'];
            vmiObjs[vmiUUID] = vmiDetails[i];
        }
        /* Update port tuples */
        updatePortTuples(configSIData, siPostData, vmiObjs, appData,
                         function(error, changedPortTuples,
                                  portTuplesAddConfig) {
            if (null != error) {
                commonUtils.handleJSONResponse(error, response, null);
                return;
            }
            /* Now update SI */
            var tmpPortTupleObjs = {};
            for (var i = 0; i < portTuplesCnt; i++) {
                var fqn = portTuples[i]['to'].join(':');
                tmpPortTupleObjs[fqn] = i;
            }
            var siPutData = { 'service-instance': {
                'uuid': siPostData['service-instance']['uuid'],
                'fq_name': siPostData['service-instance']['fq_name'],
                'display_name': siPostData['service-instance']['display_name']
            }};
            if ((null != changedPortTuples) &&
                (null != changedPortTuples['deletedList']) &&
                (changedPortTuples['deletedList'].length > 0)) {
                var len = changedPortTuples['deletedList'].length;
                for (var i = 0; i < len; i++) {
                    fqn = changedPortTuples['deletedList'][i]['to'].join(':');
                    if (null != tmpPortTupleObjs[fqn]) {
                        portTuples.splice(tmpPortTupleObjs[fqn], 1);
                    }
                }
            }
            if ((null != portTuplesAddConfig) &&
                (portTuplesAddConfig.length > 0)) {
                var newLen = portTuplesAddConfig.length;
                for (var i = 0; i < newLen; i++) {
                    portTuples.push({'to':
                                        portTuplesAddConfig[i]['port-tuple']['fq_name'],
                                    'uuid':
                                        portTuplesAddConfig[i]['port-tuple']['uuid']});
                }
            }
            delete siPostData['service-instance']['old_port_tuples'];
            siPostData['service-instance']['port_tuples'] = portTuples;
            jsonDiff.getConfigDiffAndMakeCall(siUrl, appData, siPostData,
                                            function(error, data) {
                if (null != error) {
                    commonUtils.handleJSONResponse(error, response, data);
                    return;
                }
                updateSIRefs(configSIData, siPostData, appData,
                             function(error, data) {
                    if (null != error) {
                        commonUtils.handleJSONResponse(error, response, null);
                        return;
                    }
                    commonUtils.handleJSONResponse(null, response, data);
                });
            });
        });
    });
  });
}

/**
 * @deleteServiceInstanceCb
 * private function
 * 1. Return back the response of service instance delete.
 */
function deleteServiceInstanceCb(error, siDelResp, response) 
{

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    commonUtils.handleJSONResponse(error, response, siDelResp);
}

/**
 * @deleteServiceInstance
 * public function
 * 1. URL /api/tenants/config/service-instance/:id
 * 2. Deletes the service instance from config api server
 */
function deleteServiceInstance(request, response, appData) 
{
    var siDelURL = '/service-instance/',
        siId, analyzerPolicyId;

    if (siId = request.param('id').toString()) {
        siDelURL += siId;
    } else {
        error = new appErrors.RESTServerError('Service Instance ID is required.');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    analyzerPolicyId = request.param('policyId');
    if (analyzerPolicyId != null && analyzerPolicyId != '') {
        policyConfigApi.deleteAnalyzerPolicy(analyzerPolicyId, appData, function (error) {
            if (error) {
                logutils.logger.error(error.stack);
            }
            configApiServer.apiDelete(siDelURL, appData,
                function (error, data) {
                    deleteServiceInstanceCb(error, data, response);
                });
        });
    } else {
        configApiServer.apiDelete(siDelURL, appData,
            function (error, data) {
                deleteServiceInstanceCb(error, data, response);
            });
    }
}

function formDataObjRefDelete (dataObjArr, deleteObj, type)
{
    var userData = deleteObj.userData;
    var refUpdURL = '/ref-update';
    var backRefs = null;
    var backRefsLen = 0;
    var appData = deleteObj.appData;

    if ('interface-route-table' == type) {
        backRefs = userData['interface_route_table_back_refs'];
    }
    if ('service-health-check' == type) {
        backRefs = userData['service_health_check_back_refs'];
    }
    if ('routing-policy' == type) {
        backRefs = userData['routing_policy_back_refs'];
    }
    if ('route-aggregate' == type) {
        backRefs = userData['route_aggregate_back_refs'];
    }
    if (null != backRefs) {
        backRefsLen = backRefs.length;
    }

    if (backRefsLen > 0) {
        for (i = 0; i < backRefsLen; i++) {
            var postData = {
                "type": type,
                "uuid": backRefs[i]['uuid'],
                "ref-type": "service-instance",
                "ref-uuid": deleteObj.uuid,
                "ref-fq-name": userData.fq_name,
                "operation": "DELETE",
                "attr": null
            };
            commonUtils.createReqObj(dataObjArr, refUpdURL,
                                     global.HTTP_REQUEST_POST, postData,
                                     null, null, appData);
        }
    }
}

function deletePortTuplesAndSI (portTupleUUIDList, siID, appData, callback)
{
    var siDelURL = '/service-instance/' + siID;
    var dataObjArr = [];
    if ((null == portTupleUUIDList) || (!portTupleUUIDList.length)) {
        configApiServer.apiDelete(siDelURL, appData, function(error, data) {
            callback(error, data);
        });
        return;
    }

    var portTuplesCnt = portTupleUUIDList.length;
    for (var i = 0; i < portTuplesCnt; i++) {
        var ptDelUrl = '/port-tuple/' + portTupleUUIDList[i];
        commonUtils.createReqObj(dataObjArr, ptDelUrl,
                                 global.HTTP_REQUEST_DEL, null, null,
                                 null, appData);
    }
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(configApiServer,
                                                     false),
              function(error, data) {
        configApiServer.apiDelete(siDelURL, appData, function(error, data) {
            callback(error, data);
            return;
        });
    });
}

function deleteAllSIRefsAndSI (deleteObj, deleteRefs, portTupleUUIDList,
                               callback)
{
    var appData = deleteObj.appData;
    var userData = deleteObj.userData;
    var dataObjArr = [];

    var siDelUrl = '/service-instance/' + deleteObj.uuid;
    if (false == deleteRefs) {
        deletePortTuplesAndSI(portTupleUUIDList, deleteObj.uuid, appData,
                              function(error, data) {
            callback(error, data);
        });
        return;
    }
    formDataObjRefDelete(dataObjArr, deleteObj, 'interface-route-table');
    formDataObjRefDelete(dataObjArr, deleteObj, 'service-health-check');
    formDataObjRefDelete(dataObjArr, deleteObj, 'routing-policy');
    formDataObjRefDelete(dataObjArr, deleteObj, 'route-aggregate');
    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiPost,
                                               false),
              function(error, data) {
        if (null != error) {
            callback(error, data);
            return;
        }
        deletePortTuplesAndSI(portTupleUUIDList, deleteObj.uuid, appData,
                              function(error, data) {
            callback(error, data);
        });
    });
}

function deleteAnalyzerCB (deleteObj, callback)
{
    var appData = deleteObj.appData;
    var uuid = deleteObj.uuid;
    var userData = deleteObj.userData,
        analyzerPolicyId = userData ? userData.policyuuid : null;
    if (analyzerPolicyId != null && analyzerPolicyId != '') {
        policyConfigApi.deleteAnalyzerPolicy(analyzerPolicyId, appData, function (error) {
            if (error) {
                logutils.logger.error(error.stack);
            }
            deleteServiceInstanceCB(deleteObj, callback);
        });
    } else {
        deleteServiceInstanceCB(deleteObj, callback);
    }
}

/**
 * It is used to remove SHC reference from VMI before deleting SHC
 * @param deleteObj
 * @param callback
 */
function deleteServiceHealthCheckCB (deleteObj, callback)
{
    var appData = deleteObj.appData,
        uuid = deleteObj.uuid,
        shcURL = '/service-health-check/' + uuid,
        dataObjArr = [];
    configApiServer.apiGet(shcURL, appData, function(error, svcData) {
        if (null != error) {
            callback(null, {'error': error, 'data': svcData});
            return;
        }
        var vmiBackRefs = commonUtils.getValueByJsonPath(svcData,
                'service-health-check;virtual_machine_interface_back_refs', []);
        if(!vmiBackRefs.length) {
            configApiServer.apiDelete(shcURL, appData,
                    function(error, data) {
                        callback(null, {'error': error, 'data': data});
                        return;
            });
            return;
        }
        _.each(vmiBackRefs, function(vmi){
            var reqUrl = '/ref-update';
            var putData = {
                    'type': 'virtual-machine-interface',
                    'uuid': vmi['uuid'],
                    'ref-type': 'service-health-check',
                    'ref-fq-name': commonUtils.getValueByJsonPath(svcData,
                            'service-health-check;fq_name', null),
                    'operation': 'DELETE'
                };
            commonUtils.createReqObj(dataObjArr, reqUrl,
                                     global.HTTP_REQUEST_POST,
                                     commonUtils.cloneObj(putData), null,
                                     null, appData);
        });
        async.map(dataObjArr,
                  commonUtils.getAPIServerResponse(configApiServer.apiPost,
                                                   false),
                  function(err, results) {
                      configApiServer.apiDelete(shcURL, appData,
                              function(error, data) {
                                  callback(null, {'error': error, 'data': data});
                                  return;
                      });
        });
    });
}

function deleteServiceInstanceCB (deleteObj, callback)
{
    var appData = deleteObj.appData;
    var uuid = deleteObj.uuid;
    var req = deleteObj.request;
    var userData = deleteObj.userData;
    var siURL = '/service-instance/' + uuid;
    /* Template Version 1 */
    /* Call deleteAllSIRefsAndSI to delete all the refs and SI
     */
    /* Template Version 2 */
    /* 1. Get the VMI details attached to the port tuples of this service
     *    instance, and then remove the references of port tuples
     * 2. Remove the port tuples
     * 3. Remove all the references of this SI from health-check-service,
     *    interface-route-table, routing-policy and route-aggregates
     * 4. Remove this SI
     */
    var dataObjArr = [];
    var portTuples = userData['port_tuples'];
    var portTuplesCnt = 0;
    if (null != portTuples) {
        portTuplesCnt = portTuples.length;
    }
    if (!portTuplesCnt) {
        var deleteRefs = true;
        deleteAllSIRefsAndSI(deleteObj, true, [], function(error, data) {
            callback(null, {'error': error, 'data': data});
            return;
        });
        return;
    }
    var uuidList = [];
    for (var i = 0; i < portTuplesCnt; i++) {
        uuidList.push(portTuples[i]['uuid']);
    }
    var reqURL =
        '/port-tuples?detail=true&fields=virtual_machine_interface_back_refs' +
        '&obj_uuids=' + uuidList.join(',');
    /* Get the port-tuple details */
    configApiServer.apiGet(reqURL, appData, function(error, data) {
        if (null != error) {
            callback(null, {'error': error, 'data': data});
            return;
        }
        var pTuples = data['port-tuples'];
        var cnt = pTuples.length;
        var tmpVMIToPTuplesMap = {};
        var vmiUUIDList = [];
        dataObjArr = [];
        var refUpdURL = '/ref-update';
        for (var i = 0; i < cnt; i++) {
            var vmis =
                commonUtils.getValueByJsonPath(pTuples[i],
                                               'port-tuple;virtual_machine_interface_back_refs',
                                               []);
            var vmisCnt = vmis.length;
            for (var j = 0; j < vmisCnt; j++) {
                var postData = {
                    "type": 'virtual-machine-interface',
                    "uuid": vmis[j]['uuid'],
                    "ref-type": "port-tuple",
                    "ref-uuid": pTuples[i]['port-tuple']['uuid'],
                    "ref-fq-name": pTuples[i]['port-tuple']['to'],
                    "operation": "DELETE",
                    "attr": null
                };
                commonUtils.createReqObj(dataObjArr, refUpdURL,
                                         global.HTTP_REQUEST_POST, postData,
                                         null, null, appData);
            }
        }
        formDataObjRefDelete(dataObjArr, deleteObj, 'interface-route-table');
        formDataObjRefDelete(dataObjArr, deleteObj, 'service-health-check');
        formDataObjRefDelete(dataObjArr, deleteObj, 'routing-policy');
        formDataObjRefDelete(dataObjArr, deleteObj, 'route-aggregate');

        if (!dataObjArr.length) {
            var deleteRefs = false;
            deleteAllSIRefsAndSI(deleteObj, deleteRefs, uuidList,
                                 function(error, data) {
                callback(null, {'error': error, data: data})
                return;
            });
            return;
        }
        async.map(dataObjArr,
                  commonUtils.getAPIServerResponse(configApiServer.apiPost,
                                                   false),
                  function(err, results) {
            /* Now delete all the port-tuples */
            dataObjArr = [];
            for (i = 0; i < portTuplesCnt; i++) {
                var ptDelUrl = '/port-tuple/' + portTuples[i]['uuid'];
                commonUtils.createReqObj(dataObjArr, ptDelUrl,
                                         global.HTTP_REQUEST_DEL, null, null,
                                         null, appData);
            }
            async.map(dataObjArr,
                      commonUtils.getAPIServerResponse(configApiServer.apiDelete,
                                                       false),
                      function(error, results) {
                /* Finally delete the service instance now */
                configApiServer.apiDelete(siURL, appData,
                                          function(error, data) {
                    callback(null, {'error': error, 'data': data});
                    return;
                });
            });
        });
    });
}

/**
 * @setSIRead
 * private function
 * 1. Callback for SI create / update operations
 * 2. Reads the response of SI get from config api server
 *    and sends it back to the client.
 */
function setSIRead(error, siConfig, response, appData) 
{
    var siGetURL = '/service-instance/';

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    siGetURL += siConfig['service-instance']['uuid'];
    configApiServer.apiGet(siGetURL, appData,
        function (error, data) {
            siSendResponse(error, data, response)
        });
}

/**
 * @siSendResponse
 * private function
 * 1. Sends back the response of service instance read to clients after set operations.
 */
function siSendResponse(error, siConfig, response) 
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
    } else {
        commonUtils.handleJSONResponse(error, response, siConfig);
    }
    return;
}

/**
 * @listServiceInstanceTemplates
 * 1. Sends back the response of service templates list to clients.
 */
function listServiceInstanceTemplates(request, response, appData) 
{
    serviceTemplate.listServiceTemplates(request, response, appData);
}

/**
 * @getVNCUrl
 * URL: /api/tenants/config/service-instance-vm?project_id=project_name&vm_id=vmuuid
 * Desc: Gets the browser compatable URL to launch VNC session for a given VM instance in a project/tenant.
 * 1. Get authentication token for the given project name using authApi.getTokenObj()
 * 2. Set headers 'X-Auth-Token', 'X-Auth-Project-Id' with token id and project uuid got from step 1
 * 3. Send POST request to "/v1.1/<project_uuid>/servers/<vmuuid>"
 * 4. Send POST request to "/v1.1/<project_uuid>/servers/<vmuuid>/actions" with data {"os-getVNCConsole": {"type": "novnc"}}
 * 5. Send back response
 */
function getVNCUrl(request, response, appData) 
{
    computeApi.launchVNC(request, function (err, data) {
        if (err) {
            commonUtils.handleJSONResponse(err, response, null);
        } else {
            commonUtils.handleJSONResponse(null, response, data);
        }
    });
}

function updateVMStatusByCreateTS(result, forceAddTSStatus) {
    if ((result['vmStatus'] != global.STR_VM_STATE_SPAWNING) &&
        (true != forceAddTSStatus)) {
        /* Status is properly updated */
        return;
    }
    var configData = result['ConfigData'];
    var siCreateTime =
        commonUtils.getValueByJsonPath(configData,
                                       'service-instance;id_perms;created',
                                       null);
    var siCreateUTCTime = commonUtils.getUTCTime(siCreateTime);
    var currentUTCTime = commonUtils.getCurrentUTCTime();
    if ((currentUTCTime - siCreateUTCTime) > ctrlGlobal.INSTANCE_SPAWNING_TIMEOUT) {
        result.tempVMStatus = global.STR_VM_STATE_INACTIVE;
    } else {
        result.tempVMStatus = global.STR_VM_STATE_SPAWNING;
    }
    return;
    /*
    {
        if (true == forceAddTSStatus) {
            result.tempVMStatus = global.STR_VM_STATE_INACTIVE;
        } else {
            result['vmStatus'] = global.STR_VM_STATE_INACTIVE;
        }
    } else {
        if (true == forceAddTSStatus) {
            result.tempVMStatus = global.STR_VM_STATE_SPAWNING;
        }
    }
    */
}

function updateVMStatus(result) {
    var vmCnt = null;
    var instCnt = null;
    var configData = result['ConfigData'];
    var maxInst = jsonPath(configData, "$..max_instances");
    if (maxInst > 0) {
        instCnt = maxInst[0];
    } else {
        instCnt = null;
    }

    var actCnt = 0, inactCnt = 0, spawnCnt = 0;
    try {
        if (null == instCnt) {
            vmCnt = result['VMDetails'].length;
        } else {
            vmCnt = instCnt;
        }
        for (var i = 0; i < vmCnt; i++) {
            try {
                /* VM State Details:
                 https://github.com/openstack/nova/blob/master/nova/compute/vm_states.py
                 */
                if (result['VMDetails'][i]['server']['OS-EXT-STS:vm_state'] ==
                    'active') {
                    actCnt++;
                } else if
                    (result['VMDetails'][i]['server']['OS-EXT-STS:vm_state'] ==
                    'building') {
                    spawnCnt++;
                } else {
                    inactCnt++;
                }
            } catch (e) {
                spawnCnt++;
            }
        }
        if (spawnCnt == vmCnt) {
            result['vmStatus'] = global.STR_VM_STATE_SPAWNING;
        } else if (actCnt == vmCnt) {
            result['vmStatus'] = global.STR_VM_STATE_ACTIVE;
        } else if (inactCnt == vmCnt) {
            result['vmStatus'] = global.STR_VM_STATE_INACTIVE;
        } else {
            result['vmStatus'] = global.STR_VM_STATE_PARTIALLY_ACTIVE;
        }
    } catch (e) {
        result['vmStatus'] = global.STR_VM_STATE_SPAWNING;
    }
    return result;
}

function isSubInterface (vmi)
{
    var vlan =
        commonUtils.getValueByJsonPath(vmi,
                                       'virtual_machine_interface_properties;' +
                                       'sub_interface_vlan_tag', null);
    var vmiRefs =
        commonUtils.getValueByJsonPath(vmi,
                                       'virtual_machine_interface_refs',
                                       []);
    if ((null != vlan) && (vmiRefs.length > 0)) {
        return true;
    }
    return false;
}

/**
 * @configurePacketCapture4Interface
 * public function
 */
function configurePacketCapture4Interface(request, response, appData) {
    var postData = request.body, vnFQN = postData['vnFQN'],
        direction = postData['direction'],
        interfaceUUID = postData['interfaceUUID'],
        action = postData.action,
        vnFQNArray, projectFQN;

    var options = {
        interfaceUUID: interfaceUUID,
        direction: null,
        defaultPCAPAnalyzer: null,
        defaultPCAPAnalyzerFQN: null,
        action: action
    }
    if (action == 'start' || action == 'update') {
        options.defaultPCAPAnalyzer = global.DEFAULT_INTERFACE_PCAP_ANALYZER;
        vnFQNArray = vnFQN.split(":");
        projectFQN = vnFQNArray[0] + ':' + vnFQNArray[1];
        options.direction = direction;
        options.projectFQN = projectFQN;
        options.domain = vnFQNArray[0];
        options.project = vnFQNArray[1];
        options.defaultPCAPAnalyzerFQN = projectFQN + ':' + global.DEFAULT_INTERFACE_PCAP_ANALYZER;
        if (action == 'start') {
            check4DefaultAnalyzer(response, appData, options, startPacketCapture4Interface);
        } else {
            updateVMInterfaceProperties(response, appData, options);
        }
    } else if (action == 'stop') {
        stopPacketCapture4Interface(response, appData, options);
    } else {
        commonUtils.handleJSONResponse(null, response, {error: 'No action found to configure packet capture.'});
    }
};

/**
 * @check4DefaultAnalyzer
 * private function
 */
function check4DefaultAnalyzer(response, appData, options, callback) {
    var siURL = '/service-instances?parent_type=project&parent_fq_name_str=' + options.projectFQN;
    configApiServer.apiGet(siURL, appData, function (error, jsonData) {
        var serviceInstances, isAnalyzerPresent = false;
        if (error) {
            callback(error);
        } else {
            serviceInstances = jsonData['service-instances'];
            for (var i = 0; i < serviceInstances.length; i++) {
                if (serviceInstances[i]['fq_name'][2] == options.defaultPCAPAnalyzer) {
                    isAnalyzerPresent = true;
                    options.defaultPCAPAnalyzerUUID = serviceInstances[i]['uuid'];
                    break;
                }
            }
            callback(error, response, appData, options, isAnalyzerPresent);
        }
    });
};

/**
 * @startPacketCapture4Interface
 * private function
 */
function startPacketCapture4Interface(error, response, appData, options, isAnalyzerPresent) {
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
    } else {
        if (isAnalyzerPresent) {
            updateVMInterfaceProperties(response, appData, options)
        } else {
            createDefaultPCAPAnalyzer(response, appData, options, function (response) {
                commonUtils.handleJSONResponse(null, response, {message: 'Default interface analyzer was not available. A new analyzer has been created. Try after some time.'});
            });
        }
    }
}

/**
 * @createDefaultPCAPAnalyzer
 * private function
 */
function createDefaultPCAPAnalyzer(response, appData, options, callback) {
    var siCreateURL = '/service-instances';
    var newAnalyzerParams = {};
    newAnalyzerParams.domain = options.domain;
    newAnalyzerParams.project = options.project;
    newAnalyzerParams.analyzerName = options.defaultPCAPAnalyzer;
    var siPostData = getDefaultPCAPAnalyzer(newAnalyzerParams);
    configApiServer.apiPost(siCreateURL, siPostData, appData, function (error, jsonData) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
        } else {
            options.defaultPCAPAnalyzerUUID = jsonData['service-instance']['uuid'];
            callback(response, appData, options);
        }
    });
};

/**
 * @stopPacketCapture4Interface
 * private function
 */
function stopPacketCapture4Interface(response, appData, options) {
    updateVMInterfaceProperties(response, appData, options)
};

/**
 * @updateVMInterfaceProperties
 * private function
 */
function updateVMInterfaceProperties(response, appData, options) {
    var interfaceUrl = '/virtual-machine-interface/' + options.interfaceUUID,
        defaultPCAPAnalyzerFQN = options.defaultPCAPAnalyzerFQN,
        direction = options.direction, projectFQN = options.projectFQN;
    configApiServer.apiGet(interfaceUrl, appData, function (error, interfaceJSON) {
        var interfaceProperties;
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
        } else {
            interfaceProperties = interfaceJSON['virtual-machine-interface']['virtual_machine_interface_properties'];
            if (interfaceProperties == null) {
                interfaceJSON['virtual-machine-interface']['virtual_machine_interface_properties'] = {interface_mirror: getInterfaceMirrorProperty(defaultPCAPAnalyzerFQN, direction)};
            } else {
                interfaceProperties['interface_mirror'] = getInterfaceMirrorProperty(defaultPCAPAnalyzerFQN, direction);
            }
            configApiServer.apiPut(interfaceUrl, interfaceJSON, appData, function (error, jsonData) {
                var analyzerNotReadyMsg = 'Interface packet-capture analyzer is not ready. Try after some time.';
                if (error) {
                    logutils.logger.error(error.stack);
                    commonUtils.handleJSONResponse(error, response, null);
                } else if (options.action == 'start') {
                    getPCAPAnalyzerVMId(response, appData, options, analyzerNotReadyMsg, function (response, responseJSON) {
                        commonUtils.handleJSONResponse(null, response, responseJSON);
                    });
                } else {
                    commonUtils.handleJSONResponse(null, response, jsonData);
                }
            });
        }
    });
};

/**
 * @getPCAPAnalyzerVMId
 * private function
 */
function getPCAPAnalyzerVMId(response, appData, responseJSON, errorMessage, callback) {
    var siUrl = '/service-instance/' + responseJSON['defaultPCAPAnalyzerUUID'], vmBackRef;
    configApiServer.apiGet(siUrl, appData, function (error, jsonData) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
        } else {
            vmBackRef = jsonData['service-instance']['virtual_machine_back_refs'];
            if (vmBackRef != null && vmBackRef.length > 0) {
                responseJSON['vmUUID'] = vmBackRef[0]['uuid'];
                responseJSON['siUUID'] = jsonData['service-instance']['uuid'];
                responseJSON['projectUUID'] = jsonData['service-instance']['parent_uuid'];
                callback(response, responseJSON);
            } else {
                commonUtils.handleJSONResponse(null, response, {message: errorMessage});
            }
        }
    });
};

/**
 * @configurePacketCapture4Flow
 * public function
 */
function configurePacketCapture4Flow(request, response, appData) {
    var postData = request.body, vnFQN = postData['vnFQN'],
        vnFQNArray, projectFQN;

    vnFQNArray = vnFQN.split(":");
    projectFQN = vnFQNArray[0] + ':' + vnFQNArray[1];

    var options = {
        domain: vnFQNArray[0],
        project: vnFQNArray[1],
        projectFQN: projectFQN,
        defaultPCAPAnalyzer: global.DEFAULT_FLOW_PCAP_ANALYZER,
        defaultPCAPAnalyzerFQN: projectFQN + ':' + global.DEFAULT_FLOW_PCAP_ANALYZER,
        defaultPCAPAnalyzerPolicyName: getDefaultAnalyzerPolicyName(global.DEFAULT_FLOW_PCAP_ANALYZER)
    };

    check4DefaultAnalyzer(response, appData, options, function (error, response, appData, options, isAnalyzerPresent) {
        var analyzerNotReadyMsg = 'Flow packet-capture analyzer is not ready. Try after some time.';
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
        } else if (isAnalyzerPresent) {
            getPCAPAnalyzerVMId(response, appData, options, analyzerNotReadyMsg, function (response, responseJSON) {
                fetchDefaultAnalyzerPolicyCB(response, appData, responseJSON);
            });
        } else {
            createDefaultPCAPAnalyzer(response, appData, options, function (response) {
                commonUtils.handleJSONResponse(null, response, {message: 'Default flow analyzer was not available. A new analyzer has been created. Try after some time.'});
            });
        }
    });
};

/**
 * @getInterfaceMirrorProperty
 * private function
 */
function getInterfaceMirrorProperty(analyzerName, direction) {
    var interfaceMirror = {
        'traffic_direction': '',
        'mirror_to': {
            'analyzer_name': ''
        }
    };
    if(analyzerName != null) {
        interfaceMirror['mirror_to']['analyzer_name'] = analyzerName;
        interfaceMirror['traffic_direction'] = direction;
    } else {
        interfaceMirror = null;
    }
    return interfaceMirror;
};

/**
 * @getDefaultPCAPAnalyzer
 * private function
 */
function getDefaultPCAPAnalyzer(analyzerParams) {
    var analyzerInstance = {},
        domain = analyzerParams.domain, project = analyzerParams.project,
        analyzerName = analyzerParams.analyzerName;

    analyzerInstance["service-instance"] = {};
    analyzerInstance["service-instance"]["parent_type"] = "project";
    analyzerInstance["service-instance"]["fq_name"] = [];
    analyzerInstance["service-instance"]["fq_name"] = [domain, project, analyzerName];

    analyzerInstance["service-instance"]["service_template_refs"] = [];
    analyzerInstance["service-instance"]["service_template_refs"][0] = {};
    analyzerInstance["service-instance"]["service_template_refs"][0]["to"] = [];
    analyzerInstance["service-instance"]["service_template_refs"][0]["to"] = [domain, global.DEFAULT_ANALYZER_TEMPLATE];

    analyzerInstance["service-instance"]["service_instance_properties"] = {};

    analyzerInstance["service-instance"]["service_instance_properties"]["scale_out"] = {};
    analyzerInstance["service-instance"]["service_instance_properties"]["scale_out"]["max_instances"] = 1;
    analyzerInstance["service-instance"]["service_instance_properties"]["scale_out"]["auto_scale"] = false;

    analyzerInstance["service-instance"]["service_instance_properties"]["right_virtual_network"] = "";
    analyzerInstance["service-instance"]["service_instance_properties"]["management_virtual_network"] = "";
    analyzerInstance["service-instance"]["service_instance_properties"]["left_virtual_network"] = "";
    analyzerInstance["service-instance"]["service_instance_properties"]["interface_list"] = [{ virtual_network : ""}];

    return analyzerInstance;
};

/**
 * @fetchDefaultAnalyzerPolicyCB
 * private function
 */
function fetchDefaultAnalyzerPolicyCB(response, appData, responseJSON) {
    var policyUrl = '/network-policys?parent_type=project&parent_fq_name_str=' + responseJSON.projectFQN;
    configApiServer.apiGet(policyUrl, appData, function (error, data) {
        var policys, policyName;
        if (!error) {
            policys = data['network-policys'];
            for (var i = 0; i < policys.length; i++) {
                policyName = policys[i]['fq_name'][2];
                if (policyName == responseJSON.defaultPCAPAnalyzerPolicyName) {
                    responseJSON.defaultPCAPAnalyzerPolicyUUID = policys[i]['uuid'];
                    break;
                }
            }
        }
        commonUtils.handleJSONResponse(error, response, responseJSON);
    });
};

/**
 * @getDefaultAnalyzerPolicyName
 * private function
 */
function getDefaultAnalyzerPolicyName(analyzerName) {
    var policyName = null;
    if (analyzerName) {
        analyzerName = analyzerName.trim().replace(' ', '-');
        policyName = 'default-analyzer-' + analyzerName + '-policy';
    }
    return policyName;
};

/**
 * @getOSHostList
 * private function
 * 1.gets the list of Host list with details and sends back response to client.
 */
function getHostList(request, response, appdata)
{
    computeApi.getOSHostList(request, function(err, data) {
        var filteredOSHostList = [];
        if ((null != err) || (null == data)) {
            commonUtils.handleJSONResponse(null, response, filteredOSHostList);
            return;
        }
        var allOSHostList =
            commonUtils.getValueByJsonPath(data, 'hosts', []);
        for (i = 0; i < allOSHostList.length; i++) {
            if (allOSHostList[i].service == "compute"){
                filteredOSHostList.push(allOSHostList[i]);
            }
        }
        var returnArr = {};
        returnArr["host"] = filteredOSHostList;
        commonUtils.handleJSONResponse(err, response, returnArr);
    });
}

/**
 * @getAvailabilityZoneList
 * private function
 * 1.gets the list of Availability Zone List with details and sends back response to client.
 */

function getAvailabilityZone(request, response, appdata)
{
    computeApi.getAvailabilityZoneList(request, function(err, data) {
        if ((null != err) || (null == data)) {
            commonUtils.handleJSONResponse(null, response, []);
            return;
        }
        commonUtils.handleJSONResponse(err, response, data);
    });
}

exports.listServiceInstances = listServiceInstances;
exports.listAllServiceInstances = listAllServiceInstances;
exports.listAllServiceInstancesDetails = listAllServiceInstancesDetails;
exports.listServiceInstanceTemplates = listServiceInstanceTemplates;
exports.createServiceInstance = createServiceInstance;
exports.deleteServiceInstance = deleteServiceInstance;
exports.getVNCUrl = getVNCUrl;
exports.configurePacketCapture4Interface = configurePacketCapture4Interface;
exports.configurePacketCapture4Flow = configurePacketCapture4Flow;
exports.updateServiceInstance = updateServiceInstance;
exports.getServiceInstances = getServiceInstances;
exports.getHostList = getHostList;
exports.getAvailabilityZone = getAvailabilityZone;
exports.deleteServiceInstanceCB = deleteServiceInstanceCB;
exports.deleteServiceHealthCheckCB = deleteServiceHealthCheckCB;
exports.deleteAnalyzerCB = deleteAnalyzerCB;
exports.getNovaVMIStatusPaginated = getNovaVMIStatusPaginated;

