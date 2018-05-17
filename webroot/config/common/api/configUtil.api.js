/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @configUtil.api.js
 *     - Handlers for Config pages utility functions
 *     - Interfaces with config api server
 */

var configUtil       = module.exports;
//var rest = require(process.mainModule.exports["corePath"] + 
// '/src/serverroot/common/rest.api');
var async = require('async');

var portsConfig = require('../../networking/port/api/portsconfig.api'),
    logutils = require(process.mainModule.exports["corePath"] +
                       '/src/serverroot/utils/log.utils'),
    appErrors = require(process.mainModule.exports["corePath"] +
                        '/src/serverroot/errors/app.errors'),
    commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils'),
    configApiServer = require(process.mainModule.exports["corePath"] +
                              '/src/serverroot/common/configServer.api');
var vnConfig = require('../../networking/networks/api/vnconfig.api');
var nwIpam = require('../../networking/ipam/api/ipamconfig.api');
var logicalRtr =
    require('../../networking/logicalrouter/api/logicalrouterconfig.api');
var vdns = require('../../dns/servers/api/virtualdnsserversconfig.api');
var policyConfig =
    require('../../networking/policy/api/policyconfig.api');
var routingPolicyConfig =
    require('../../networking/routingpolicy/api/routingpolicyconfig.api');
var svcInst =
    require('../../services/instances/api/serviceinstanceconfig.api');
var fwPolicy =
    require('../../firewall/common/fwpolicy/api/fwpolicyconfig.api');
var intf =
    require("../../physicaldevices/interfaces/api/interfacesconfig.api");
var jsonDiff = require(process.mainModule.exports["corePath"] +
                       "/src/serverroot/common/jsondiff");
var _ = require("lodash");
var configUtils = require(process.mainModule.exports["corePath"] +
                          "/src/serverroot/common/config.utils");

var errorData = [];
var configCBDelete = 
{
    'virtual-machine-interface': portsConfig.deletePortsCB,
    'logical-router': logicalRtr.deleteLogicalRouterAsync,
    'floating-ip-pool': vnConfig.deleteFippoolAsync,
    'virtual-DNS': vdns.deleteVirtualDNSCallback,
    'network-policy': policyConfig.deletePolicyAsync,
    'routing-policy': routingPolicyConfig.deleteRoutingPolicyAsync,
    'virtual-network': vnConfig.deleteVirtualNetworkAsync,
    'service-instance': svcInst.deleteServiceInstanceCB,
    'service-health-check': svcInst.deleteServiceHealthCheckCB,
    'service-analyzer':svcInst.deleteAnalyzerCB,
    'firewall-rule': fwPolicy.deleteFirewallRulesAsync,
    'firewall-policy': fwPolicy.deleteFirewallPoliciesAsync
}

var getConfigPageRespCB = {
    'virtual-network': vnConfig.getVirtualNetworkCb,
    'network-ipam': nwIpam.getIpamCb
};
var GENERIC_API_BASIC = 'basic';

var configCBCreateEdit = 
{
    'post' :
        {
            'virtual-machine-interface':portsConfig.createPortCB,
            'logical-router': logicalRtr.createLogicalRouterCB,
            'logical-interface': intf.createPhysicalInterfacesCB,
            'physical-interface': intf.createPhysicalInterfacesCB
        },
    'put'  :
        {
            'virtual-machine-interface': portsConfig.updatePortsCB,
            'logical-router': logicalRtr.updateLogicalRouterCB,
            'logical-interface': intf.updatePhysicalInterfacesCB,
            'physical-interface': intf.updatePhysicalInterfacesCB,
            'firewall-rule': fwPolicy.updateFirewallPoliciesAsync
        },
};

/**
 * Bail out if called directly as "nodejs projectconfig.api.js"
 */
if (!module.parent) 
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
                                     module.filename));
    process.exit(1);
}

/**
 * @deleteMultiObject
 * public function
 * 1. URL /api/tenants/config/projects
 * 2. Gets list of projects for the user, domain support
 *    to be added
 * 3. Plumbed with Keystone for now
 */
function deleteMultiObject (request, response, appData)
{
    var postBody = request.body;
    var found = false;
    deleteMultiObjectCB(postBody, request, appData, function(err, data) {
        sendBackDeleteResult(err, response, data);
    });
}

function deleteMultiObjectCB (postBody, request, appData, callback)
{
    var postBodyLen = postBody.length;
    var dataObj = [];
    for (var i = 0; i < postBodyLen; i++){
        var callbackCount = 0;
        var type = postBody[i].type;
        var deleteUUIDs = postBody[i].deleteIDs;
        var deleteUUIDsLength = deleteUUIDs.length;
        var userData = postBody[i].userData;
        dataObj[i] = [];
        for (var j = 0; j < deleteUUIDsLength ; j++) {
            dataObj[i][j] = {};
            dataObj[i][j]['uuid'] = deleteUUIDs[j];
            dataObj[i][j]['type'] = postBody[i].type;
            dataObj[i][j]['request'] = request;
            dataObj[i][j]['appData'] = appData;
            dataObj[i][j]['userData'] = userData;
        }
    }
    if (dataObj.length <= 0) {
        var error = new appErrors.RESTServerError('Invalid Data');
        callback(error, null);
        return;
    } else {
        async.mapSeries(dataObj, deleteByType, function(err, data) {
                callback(err, data);
                return;
        });
    }
}

/**
 * @deleteByType
 * private function
 * 1. do a async call to delete the corresponding object.
 * 2. This function will be called based on each type.
 * 3. return back to the called function with the error message/object.
 */
function deleteByType(dataObj, callback)
{
    var delCB = getConfigDeleteCallbackByType(dataObj[0]["type"]);
    if (null == delCB || "" == delCB) {
        delCB = defaultConfigDeleteHandler;
    }
    async.mapLimit(dataObj, 100, delCB,
      function(err, data) {
        var dataArrLen = data.length;
        var errorMsg = "";
        for (var i = 0; i < dataArrLen; i++){
            if (data[i].error != null){
                if (data[i].error.custom) {
                    errorMsg += data[i].error.message + "<br>";
                } else {
                    errorMsg += data[i].error + "<br>";
                }
            }
        }
        var newError = null;
        if(errorMsg != "")
            newError = new appErrors.RESTServerError(errorMsg);
        callback(newError, null);
    });
}

/**
 * @defaultConfigDeleteHandler
 * private function
 * 1. The default handler of delete.
 * 2. If there is no function defined this default delete will be called.
 */
function defaultConfigDeleteHandler(dataObj, callback)
{
    var delUrl = "/" + dataObj['type'] + '/' + dataObj['uuid'];
    configApiServer.apiDelete(delUrl, dataObj['appData'], function(err, data) {
        callback(null, {'error': err, 'data': data});
    });
}

/**
 * @sendBackDeleteResult
 * private function
 * 1. The result for the deleteMultiObject is send to 
 *    UI from this function
 * 2. Calls the common code to send back the UI.
 */
function sendBackDeleteResult(err, res, result)
{
    commonUtils.handleJSONResponse(err, res, result);
    return;
}

/**
 * @getConfigDeleteCallbackByType
 * private function
 * 1. Get the type as a parameter
 * 2. cross check with configCBDelete and send back the 
 *    corresponding function to be called.
 */
function getConfigDeleteCallbackByType (type)
{
    return configCBDelete[type];
}

function getConfigCreateEditCallbackByType (type, objType)
{
    return _.get(configCBCreateEdit, type + '.' + objType, null);
}

function buildConfigURLSuffix (startDone, url, urlSuffix)
{
    if (true == startDone) {
        url += '&';
    } else {
        url += '?';
    }
    return url + urlSuffix;
}

function getConfigDetailsAsync (dataObj, callback)
{
    var type = dataObj['type'];
    var appData = dataObj['appData'];
    var url = '/' + type;
    var startDone = false;
    if (true == dataObj['detail']) {
        url += '?detail=true';
        startDone = true;
    }
    var details = dataObj["detail_fields"];
    if (null != details) {
        if (!(details instanceof Array)) {
            details = details.split(",");
        }
    }
    var fields = dataObj['fields'];
    if (null != fields) {
        if (fields instanceof Array) {
            fields = fields.join(",");
        }
        url = buildConfigURLSuffix(startDone, url,
                                   'fields=' + fields);
        startDone = true;
    }
    var parentIds = dataObj['parent_id'];
    if (null != parentIds) {
        if (parentIds instanceof Array) {
            parentIds = parentIds.join(",");
        }
        url = buildConfigURLSuffix(startDone, url,
                                   'parent_id=' + parentIds);
        startDone = true;
    } else {
        if ((null != dataObj['parent_fq_name_str']) &&
            (null != dataObj['parent_type'])) {
            var urlSuffix = 'parent_fq_name_str=' + dataObj['parent_fq_name_str'] +
                '&parent_type=' + dataObj['parent_type'];
            url = buildConfigURLSuffix(startDone, url, urlSuffix);
            startDone = true;
        }
    }
    var backRefIds = dataObj['back_ref_id'];
    if (null != backRefIds) {
        if (backRefIds instanceof Array) {
            backRefIds = backRefIds.join(",");
        }
        url = buildConfigURLSuffix(startDone, url,
                                   'back_ref_id=' + backRefIds);
        startDone = true;
    }
    var objIds = dataObj['obj_uuids'];
    if (null != objIds) {
        if (objIds instanceof Array) {
            objIds = objIds.join(",");
        }
        url = buildConfigURLSuffix(startDone, url,
                                   'obj_uuids=' + objIds);
        startDone = true;
    }
    var filters = dataObj['filters'];
    if (null != filters) {
        if (filters instanceof Array) {
            filters = filters.join(",");
        }
        url = buildConfigURLSuffix(startDone, url,
                                   'filters=' + filters);
        startDone = true;
    }
    if (null != dataObj['fq_name']) {
        url = buildConfigURLSuffix(startDone, url,
                                   'fq_names=' + dataObj['fq_name']);
        startDone = true;
    }
    var fqNames = dataObj['fq_names'];
    var fqNameList = [];
    if (null != fqNames) {
        if (fqNames instanceof Array) {
            var len = fqNames.length;
            for (var i = 0; i < len; i++) {
                if (fqNames[i] instanceof Array) {
                    fqNameList.push(fqNames[i].join(":"));
                } else {
                    fqNameList.push(fqNames[i]);
                }
            }
        }
        url = buildConfigURLSuffix(startDone, url,
                                   'fq_names=' + fqNameList.join(","));
        startDone = true;
    }
    configApiServer.apiGet(url, appData, function(err, data) {
        if ((null != err) || (null == data) ||
        /* Now check if we have request for details */
            (null == details) || (!details.length)) {
            callback(err, data);
            return;
        }
        var detailsFieldsCnt = details.length;
        var respDataArr = data[type];
        var respCnt = respDataArr.length;
        var uuidToApiRespDataArrMap = {};
        var uuidObjs = {};
        var uuidList = [];
        for (var i = 0; i < respCnt; i++) {
            updateUUIDListByFields(respDataArr[i], details, i,
                                   uuidObjs, uuidToApiRespDataArrMap);
        }
        var dataObjArr = [];
        for (var key in uuidObjs) {
            var reqUrl = "/" + key + "s?detail=true&obj_uuids=" +
                uuidObjs[key].join(",");
            commonUtils.createReqObj(dataObjArr, reqUrl, null, null, null, null,
                                     appData);
        }
        async.map(dataObjArr,
                  commonUtils.getServerResponseByRestApi(configApiServer, true),
                  function (error, fieldData) {
            var len = fieldData.length;
            var finalFieldData = [];
            var subType = type.substring(0, type.length - 1);
            for (var i = 0; i < len; i++) {
                finalFieldData = finalFieldData.concat(_.values(fieldData[i])[0]);
            }
            var finalFieldDataLen = finalFieldData.length;
            for (var i = 0; i < finalFieldDataLen; i++) {
                var value = _.values(finalFieldData[i])[0];
                var uuid = _.result(value, "uuid", null);
                if (null == uuid) {
                    logutils.logger.error("details data uuid null");
                    continue;
                }
                if (null == uuidToApiRespDataArrMap[uuid]) {
                    /* Weired */
                    logutils.logger.error("details data uuid map error");
                    continue;
                }
                var idxes = uuidToApiRespDataArrMap[uuid].indices;
                var field = uuidToApiRespDataArrMap[uuid].field;
                var idxCnt = idxes.length;
                for (var j = 0; j < idxCnt; j++) {
                    idx = idxes[j];
                    if (null == data[type][idx][subType].detail_fields) {
                        data[type][idx][subType].detail_fields = {};
                    }
                    if (null == data[type][idx][subType].detail_fields[field]) {
                        data[type][idx][subType].detail_fields[field] = [];
                    }
                    data[type][idx][subType].detail_fields[field].push(commonUtils.cloneObj(value));
                }
            }
            callback(err, data);
        });
    });
}

function getResTypeByFieldName (fieldName)
{
    var backRefStr = "_back_refs";
    var backRefStrLen = backRefStr.length;
    var refStr = "_refs";
    var refStrLen = refStr.length;
    var key = null;
    if (backRefStr == fieldName.substr(fieldName.length - backRefStrLen, backRefStrLen)) {
        key = fieldName.substr(0, fieldName.length - backRefStrLen);
    }
    if (refStr == fieldName.substr(fieldName.length - refStrLen, refStrLen)) {
        key = fieldName.substr(0, fieldName.length - refStrLen);
    }
    if (null != key) {
        return key.replace(/_/g, "-");
    }
    return fieldName;
}

function updateUUIDListByFields (respData, detailsFields,
                                 index, uuidObjs, uuidToApiRespDataArrMap)
{
    var apiRespData = _.values(respData)[0];
    var detailsFieldsCnt = detailsFields.length;
    for (var i = 0; i < detailsFieldsCnt; i++) {
        var fieldData = apiRespData[detailsFields[i]];
        if ((null == fieldData) || (!(fieldData instanceof Array)) ||
            (!fieldData.length)) {
            continue;
        }
        var fieldDataType = getResTypeByFieldName(detailsFields[i]);
        var fieldDataCnt = fieldData.length;
        for (var j = 0; j < fieldDataCnt; j++) {
            var uuid = fieldData[j].uuid;
            if (null == uuid) {
                continue;
            }
            if (null == uuidObjs[fieldDataType]) {
                uuidObjs[fieldDataType] = [];
            }
            uuidObjs[fieldDataType].push(uuid);
            if (null == uuidToApiRespDataArrMap[uuid]) {
                uuidToApiRespDataArrMap[uuid] = {};
                uuidToApiRespDataArrMap[uuid].indices  = [];
            }
            uuidToApiRespDataArrMap[uuid].field = detailsFields[i];
            uuidToApiRespDataArrMap[uuid].indices.push(index);
        }
    }
    return uuidObjs;
}

function getConfigDetails (req, res, appData)
{
    var postData = req.body;
    var detail = true;
    getConfigAsync(postData, detail, appData, function(err, data) {
        commonUtils.handleJSONResponse(err, res, data);
    });
}

function getConfigAsync (postData, detail, appData, callback){
    var dataList = _.result(postData, "data", null);
    if (null == dataList) {
        var error = new appErrors.RESTServerError("Invalid data format");
        callback(error, null);
        return;
    }
    var reqCnt = dataList.length;
    for (var i = 0; i < reqCnt; i++) {
        dataList[i].appData = appData;
        dataList[i].detail = detail;
    }
    async.map(dataList, getConfigDetailsAsync, function(err, results) {
        callback(err, results);
    });
}

function getConfigList (req, res, appData)
{
    var postData = req.body;
    var detail = false;
    getConfigAsync(postData, detail, appData, function(err, data) {
        commonUtils.handleJSONResponse(err, res, data);
    });
}

function getConfigObjectsAsync (dataObj, callback)
{
    var appData = dataObj['appData'], uuid = dataObj['uuid'];
    var url = '/' + dataObj['type'] + "/" + uuid;
    configApiServer.apiGet(url, appData, function(err, data) {
        callback(err, data);
    });
}

function getConfigObjects (req, res, appData)
{
    var dataObjArr = [], postData = commonUtils.getValueByJsonPath(req,
        "body;data", [], false),
        reqCnt = postData.length, i;
    for (i = 0; i < reqCnt; i++) {
        dataObjArr[i] = {};
        dataObjArr[i]['type'] = postData[i]['type'];
        dataObjArr[i]['appData'] = appData;
        dataObjArr[i]['uuid'] = postData[i]["uuid"];
    }
    async.map(dataObjArr, getConfigObjectsAsync, function(err, data) {
        commonUtils.handleJSONResponse(err, res, data);
    });
}

function deleteConfigObj (req, res, appData)
{
    var configType = req.param('type');
    var uuid = req.param('uuid');
    var dataObj = {'type': configType, 'uuid': uuid, 'appData': appData};
    deleteConfigObjCB(dataObj, function(err, data) {
        commonUtils.handleJSONResponse(err, res, data);
    });
}

function deleteConfigObjCB (dataObj, callback)
{
    var configType = dataObj['type'];
    var uuid = dataObj['uuid'];
    var appData = dataObj['appData'];

    var dataObjGetArr = []; 
    var dataObjPutArr = []; 
    var tmpUUIDObjs = {}; 
    var delCnt = 0;

    var delURL = '/' + configType + '/' + uuid;
    var configRefs = configType.replace(/-/g, "_") + "_refs";

    configApiServer.apiGet(delURL, appData, function(err, configObj) {
        if ((null != err) || (null == configObj) ||
            (null == configObj[configType])) {
            callback(err, null);
            return;
        }
        var configData = configObj[configType];
        for (key in configData) {
            var splitArr = key.split('_back_refs');
            if (splitArr.length > 1) {
                var newConfigType = splitArr[0].replace(/_/g, "-");

                var typeBackRefsCnt = configData[key].length;
                tmpUUIDObjs[newConfigType] = [];
                for (var i = 0; i < typeBackRefsCnt; i++) {
                    tmpUUIDObjs[newConfigType].push(configData[key][i]['uuid']);
                }
            }
        }
        var chunk = 200;
        var keyList = [];
        var configJsonModifyObj =
            process.mainModule.exports['configJsonModifyObj'];
        var backRefsObjs = null;
        if ((null != configJsonModifyObj) &&
            (null != configJsonModifyObj['configDelete']) &&
            (null != configJsonModifyObj['configDelete'][configType]) &&
            (null != configJsonModifyObj['configDelete'][configType]['del-back-refs'])) {
            backRefsObjs =
                configJsonModifyObj['configDelete'][configType]['del-back-refs'];
        }
        for (key in tmpUUIDObjs) {
            if (null != backRefsObjs) {
                var backRefsObjsCnt = backRefsObjs.length;
                for (var idx = 0; idx < backRefsObjsCnt; idx++) {
                    if (backRefsObjs[idx] == key) {
                        var uuidCnt = tmpUUIDObjs[key].length;
                        for (idx2 = 0; idx2 < uuidCnt; idx2++) {
                            var delBackRefsUrl = '/' +
                                key + '/' + tmpUUIDObjs[key][idx2];
                            commonUtils.createReqObj(dataObjGetArr,
                                                     delBackRefsUrl,
                                                     global.HTTP_REQUEST_DEL,
                                                     null, configApiServer,
                                                     null, appData);
                            delCnt++;
                        }
                        delete tmpUUIDObjs[key];
                    }
                }
            }
        }
        for (key in tmpUUIDObjs) {
            var uuidCnt = tmpUUIDObjs[key].length;
            for (i = 0, j = uuidCnt; i < j; i += chunk) {
                var tempArray = tmpUUIDObjs[key].slice(i, i + chunk);
                var typeReqUrl = '/' + key + 's?detail=true&fields=' +
                    configRefs + '&obj_uuids=' + tempArray.join(',');
                commonUtils.createReqObj(dataObjGetArr, typeReqUrl, null, null,
                                         configApiServer, null, appData);
                keyList.push(key);
            }
        }
        if (!dataObjGetArr.length) {
            configApiServer.apiDelete(delURL, appData, function(err, data) {
                callback(err, data);
            });
            return;
        }
        async.map(dataObjGetArr,
                  commonUtils.getServerResponseByRestApi(configApiServer,
                                                         true),
                  function(err, results) {
            results.splice(0, delCnt);
            var resCnt = results.length;
            for (var i = 0; i < resCnt; i++) {
                var configKey = keyList[i] + 's';
                var configData = results[i][configKey];
                if ((null == configData) || (!configData.length)) {
                    continue;
                }
                var configTypeLen = configData.length;
                for (var j = 0; j < configTypeLen; j++) {
                    var typeConfig = configData[j][keyList[i]];
                    var typeRefs = typeConfig[configRefs];
                    var typeRefsCnt = typeRefs.length;
                    for (var k = 0; k < typeRefsCnt; k++) {
                        if (uuid == typeRefs[k]['uuid']) {
                            typeConfig[configRefs].splice(k, 1);
                            break;
                        }
                    }
                    for (key in typeConfig) {
                        if (-1 != key.indexOf('_back_refs')) {
                            delete typeConfig[key];
                        }
                    }
                    var newConfig = {};
                    newConfig[keyList[i]] = typeConfig;
                    var putURL = '/' + keyList[i] + '/' + typeConfig['uuid'];
                    commonUtils.createReqObj(dataObjPutArr, putURL,
                                             global.HTTP_REQUEST_PUT, newConfig,
                                             null, null, appData);
                }
            }
            if (!dataObjPutArr.length) {
                configApiServer.apiDelete(delURL, appData, function(err, data) {
                    callback(err, data);
                });
                return;
            }
            async.map(dataObjPutArr,
                      commonUtils.getServerResponseByRestApi(configApiServer,
                                                             false),
                      function(error, results) {
                if (null != error) {
                    callback(err, data);
                    return;
                }
                configApiServer.apiDelete(delURL, appData, function(err, data) {
                    callback(err, data);
                })
            });
        });
    });
}

function getConfigUUIDList (req, res, appData)
{
    var type        = req.param('type');
    var parentUUID  = req.param('parentUUID');
    var resultJSON = [];
    type = type + 's';

    var configUrl = '/' + type + '?parent_id=' + parentUUID;
    configApiServer.apiGet(configUrl, appData, function(err, configData) {
        if ((null != err) || (null == configData) ||
            (null == configData[type])) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        configData = configData[type];
        if ((null == configData) || (!configData.length)) {
            commonUtils.handleJSONResponse(null, res, resultJSON);
            return;
        }
        var count = configData.length;
        for (var i = 0; i < count; i++) {
            resultJSON.push(configData[i]['uuid']);
        }
        commonUtils.handleJSONResponse(null, res, resultJSON);
    });
}

function getConfigPageRespAsync (configReqObj, callback)
{
    var type = configReqObj['type'];
    var data = configReqObj['data'];
    var appData = configReqObj['appData'];
    var configPageCB = getConfigPageRespCB[type];
    configPageCB(data, appData, function(err, data) {
        callback(err, data);
    });
}

function getConfigPaginatedResponse (req, res, appData)
{
    var body = req.body;
    var type = body.type + 's';
    var uuidList = body.uuidList;
    var fields = body.fields;
    var dataObjGetArr = [];
    var configReqObjArr = [];
    var tmpArray = [];

    var chunk = 200;
    var uuidCnt = uuidList.length;
    for (var i = 0, j = uuidCnt; i < j; i += chunk) {
        tmpArray = uuidList.slice(i, i + chunk);
        var reqUrl = '/' + type + '?detail=true&obj_uuids=' + tmpArray.join(',');
        if ((null != fields) && (fields.length > 0)) {
            reqUrl += '&fields=' + fields.join(',');
        }
        commonUtils.createReqObj(dataObjGetArr, reqUrl, null, null, null, null,
                                 appData);
    }
    async.map(dataObjGetArr,
              commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
              function(error, results) {
        var resultJSON = [];
        var resCnt = results.length;
        for (var i = 0; i < resCnt; i++) {
            results[i] = results[i][type];
            resultJSON = resultJSON.concat(results[i]);
        }
        var configPageCB = getConfigPageRespCB[body.type];
        if (null == configPageCB) {
            commonUtils.handleJSONResponse(null, res, resultJSON);
            return;
        }
        resCnt = resultJSON.length;
        for (i = 0; i < resCnt; i++) {
            configReqObjArr.push({'type': body.type, 'data': resultJSON[i],
                                 'appData': appData});
        }
        async.map(configReqObjArr, getConfigPageRespAsync,
                  function(err, customConfigData) {
            commonUtils.handleJSONResponse(err, res, customConfigData);
            return;
        });
    });
}

/*
 * Calls fqname-to-id on api server,
 * expects fqnAppObj in form {'appData': appData,
 *                          'fqnReq': {'fq_name': 'my_name',
 *                                     'type': project}
 *                        }
 */
function getUUIDByFQN (fqnAppObj, callback) {
    var fqnameURL     = '/fqname-to-id';

    configApiServer.apiPost(fqnameURL, fqnAppObj.fqnReq,
                                fqnAppObj.appData,
                         function(error, data) {
            callback(error, data);
    });
}


function getBackReferStrByChildName (childName, childObjs)
{
    var str = "";
    /* Child Name with "s" */
    childName = childName.substring(0, childName.length - 1);
    var refs = _.result(childObjs, childName + ".references", []);
    refs = refs.map(function(refName) {
        return (refName + "_back_refs");
    });
    return refs.join(",");
}

function getReferencesByChildName (childName, childObjs)
{
    childName = childName.substring(0, childName.length - 1);
    return _.result(childObjs, childName + ".references", []);
}

function filterChildrenData (dataObj, callback)
{
    var data = dataObj.data;
    var resType = dataObj.parentType;
    var appData = dataObj.appData;
    var doLookup = dataObj.doLookup;
    logutils.logger.info("Trying to filter data with Parent " + resType +
                         " for data " + JSON.stringify(data));
    var origData = commonUtils.cloneObj(data);
    var configObj = process.mainModule.exports['configJsonModifyObj'];
    var configObjByType = configObj[resType];
    var childrenData = {};
    if (null == configObjByType) {
        return callback(null, {origData: data, filteredData: data,
                               childrenData: {}, childObjs: {}});
    }
    var children = configObjByType.children;
    if (null == children) {
        return callback(null, {origData: data, filteredData: data,
                               childrenData: {}, childObjs: {}});
    }
    var dataObjArr = [];
    for (var childName in children) {
        /* Please note UI sends with "s" along with child object name,
           ex: floating_ip_pools where in UI schema we have floating_ip_pool,
           so add "s" to map to UI data
         */
        var arrDiffName = childName.replace(/_/g, "-");
        var arrDiffEntry = configObj.arrayDiff[arrDiffName];
        if (null != arrDiffEntry) {
            children[childName] =
                configUtils.mergeObjects(children[childName], arrDiffEntry);
        }
        logutils.logger.info("childName as:" + childName);
        childName = childName + "s";
        if (null != data[resType][childName]) {
            childrenData[childName] =
                commonUtils.cloneObj(data[resType][childName]);
            var cnt = childrenData[childName].length;
            var uuidList = [];
            for (var i = 0; i < cnt; i++) {
                var uuid = childrenData[childName][i].uuid;
                if (null == uuid) {
                    continue;
                }
                uuidList.push(uuid);
            }
            var uuidListLen = uuidList.length;
            if ((uuidListLen > 0) && (true == doLookup)) {
                var backRefsStr = getBackReferStrByChildName(childName, children);
                logutils.logger.info("getting backRefsStr as:" + backRefsStr +
                                     " for child " + childName +
                                     " with children " +
                                     JSON.stringify(children));
                if ((null != backRefsStr) && (backRefsStr.length > 0)) {
                    var chunk = 200;
                    for (var j = 0, k = uuidListLen; j < k; j += chunk) {
                        var tempArray = uuidList.slice(j, j + chunk);
                        var reqUrl = "/" + arrDiffName + "s?detail=true&fields=" +
                            backRefsStr + "&obj_uuids=" + tempArray.join(",");
                        logutils.logger.info("Getting back_ref reqUrl as:" + reqUrl);
                        commonUtils.createReqObj(dataObjArr, reqUrl, null, null, null, null,
                                                 appData);
                    }
                }
                delete data[resType][childName];
            }
        }
    }

    var returnObj =
        {filteredData: data, childrenData: childrenData, origData: origData,
         childObjs: children};

    if (!dataObjArr.length) {
        var childDataWORefs =
            updateReferencesToConfigChildren(childrenData, null, children);
        returnObj.childDataWORefs = childDataWORefs;
        logutils.logger.info("Updated filteredData WO GET as:" +
                             JSON.stringify(returnObj));
        callback(null, returnObj);
        return;
    }
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(configApiServer, true),
              function(error, configData) {
        /* Now attach the project details with floating-ip-pools */
        var childDataWORefs =
            updateReferencesToConfigChildren(childrenData, configData, children);
        returnObj.childrenData = childrenData;
        returnObj.childDataWORefs = childDataWORefs;
        logutils.logger.info("Updated filteredData With GET as:" +
                             JSON.stringify(returnObj));
        callback(error, returnObj);
    });
}

function createChildEntries (data, callback)
{
    var dataObjArr      = [];
    var appData         = _.result(data, "appData", null);
    var parentType      = _.result(data, "parentType", null);
    var dataObj         = _.result(data, "dataObj", {});
    var childrenData    = _.result(dataObj, "childrenData", {});

    for (var childKey in childrenData) {
        buildChildPostData(parentType, dataObjArr, childKey,
                           childrenData[childKey], appData);
    }

    if (!dataObjArr.length) {
        callback(null, null);
        return;
    }
    logutils.logger.info("Trying to create childEntries with data:" +
                         JSON.stringify(dataObj));
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(configApiServer, true),
              function(error, data) {
        callback(error, data);
    });
}

function attachRefs (data, callback)
{
    var dataObjArr = [];
    var appData = _.result(data, "appData", null);
    var parentType = _.result(data, "parentType", null);
    var dataObj = _.result(data, "dataObj", {});
    var configData = _.result(dataObj, "origData", null);
    var parentId = _.result(configData, parentType + ".uuid", null);
    var childObjs = _.result(dataObj, "childObjs", null);
    var allChildAddRefObjs = _.result(dataObj, "allChildAddRefObjs", null);
    var getUrl = "/" + parentType + "/" + parentId;
    configApiServer.apiGet(getUrl, appData, function(error, configData) {
        if ((null != error) || (null == configData)) {
            callback(error, configData);
            return;
        }
        logutils.logger.info("In attachRefs(), getting data as:" +
                             JSON.stringify(dataObj));
        var childToValMaps = {};
        var config = _.result(configData, parentType, {});
        for (var refKey in childObjs) {
            var uiKey = refKey + "s";
            if (null == config[uiKey]) {
                continue;
            }
            var childCnt = config[uiKey].length;
            for (var i = 0; i < childCnt; i++) {
                if (null == childToValMaps[uiKey]) {
                    childToValMaps[uiKey] = {};
                }
                var to = config[uiKey][i].to.join(":");
                childToValMaps[uiKey][to] = config[uiKey][i];
            }
        }
        logutils.logger.info("Geting childToValMaps as:" +
                             JSON.stringify(childToValMaps));
        var reqUrl = "/ref-update";
        for (var uiChildKey in allChildAddRefObjs) {
            var childKey = uiChildKey.substring(0, uiChildKey.length - 1);
            /* Check if we have references */
            var refs = _.result(childObjs, childKey + ".references", []);
            if (!refs.length) {
                continue;
            }
            var refsCnt = refs.length;
            var childCnt = allChildAddRefObjs[uiChildKey].length;
            for (var i = 0; i < refsCnt; i++) {
                var uiRef = refs[i] + "s";
                for (var j = 0; j < childCnt; j++) {
                    var childRef = allChildAddRefObjs[uiChildKey][j];
                    if (null == childRef[uiRef]) {
                        continue;
                    }
                    var fqn = childRef.to;
                    var fqnStr = fqn.join(":");
                    var mappedData = _.result(childToValMaps, uiChildKey + "." +
                                              fqnStr, null);
                    if (null == mappedData) {
                        continue;
                    }
                    var childRefCnt = childRef[uiRef].length; // It is 1 always
                    for (var k = 0; k < childRefCnt; k++) {
                        var uuid = mappedData.uuid;
                        var postData = {
                            "type": refs[i],
                            /* Always 1 entry */
                            "uuid": childRef[uiRef][k].uuid,
                            "ref-type": childKey.replace(/_/g, "-"),
                            "ref-uuid": mappedData.uuid,
                            "ref-fq-name": fqn,
                            "operation": "ADD",
                            "attr": childRef[uiRef][k].attr ? childRef[uiRef][k].attr : null
                        };
                        commonUtils.createReqObj(dataObjArr, reqUrl,
                                                 global.HTTP_REQUEST_POST, postData,
                                                 null, null, appData);
                        logutils.logger.info("Getting Refs postData as:" +
                                             JSON.stringify(postData));
                    }
                }
            }
        }
        async.map(dataObjArr,
                  commonUtils.getServerResponseByRestApi(configApiServer, false),
                  function(error, data) {
            callback(error, data);
        });
    });
}

function buildChildPostData (parentType, dataObjArr, childName,
                             childDataPerType, appData)
{
    logutils.logger.info("In buildChildPostData(), " +
                         "childDataPerType as:" +
                         JSON.stringify(childDataPerType));
    var childDataPerTypeCnt = childDataPerType.length;
    var configChildName = childName.replace(/_/g, "-");
    var uiChildName = configChildName.substring(0, configChildName.length - 1);
    for (var i = 0; i < childDataPerTypeCnt; i++) {
        var postData = {}
        var childURL = "/" + configChildName;
        postData[uiChildName] = commonUtils.cloneObj(childDataPerType[i]);
        if ("to" in postData[uiChildName]) {
            var fqn = postData[uiChildName].to;
            postData[uiChildName].fq_name = fqn;
            delete postData[uiChildName].to;
            postData[uiChildName].parent_type = parentType;
            commonUtils.createReqObj(dataObjArr, childURL, global.HTTP_REQUEST_POST,
                                     postData, null, null, appData);
            logutils.logger.info("getting childURL as:" + childURL +
                                 " with post data as " + JSON.stringify(postData));
        }
    }
}

function createDeleteRefsObjs (dataObjArr, childName, refName, refs, childData,
                               appData)
{
    var uiChildName = childName.replace(/_/g, "-");
    uiChildName = uiChildName.substring(0, uiChildName.length - 1);
    var refsCnt = refs.length;
    var reqUrl = "/ref-update";
    for (var i = 0; i < refsCnt; i++) {
        var postData = {
            "type": refName,
            "uuid": refs[i].uuid,
            "ref-type": uiChildName,
            "ref-uuid": childData.uuid,
            "ref-fq-name": childData.to,
            "operation": "DELETE",
            "attr": (null != refs[i].attr) ? refs[i].attr : null
        };
        commonUtils.createReqObj(dataObjArr, reqUrl,
                                 global.HTTP_REQUEST_POST, postData,
                                 null, null, appData);
        logutils.logger.info("Getting Child DEL Post Data as:" + JSON.stringify(postData));
    }
}

function deleteReferences (data, callback)
{
    var parentType = data.parentType;
    var dataObj = data.dataObj;
    var appData = data.appData;
    var childrenData = dataObj.childrenData;
    var dataObjArr = [];
    var childObjs = dataObj.childObjs;

    logutils.logger.info("deleteReferences() delete data as: " +
                         JSON.stringify(dataObj));
    for (var key in childrenData) {
        var len = childrenData[key].length;
        var refs = getReferencesByChildName(key, childObjs);
        var refsLen = refs.length;
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < refsLen; j++) {
                var refsKey = refs[j] + "s";
                if (null != childrenData[key][i][refsKey]) {
                    createDeleteRefsObjs(dataObjArr, key, refs[j],
                                         childrenData[key][i][refsKey],
                                         childrenData[key][i], appData);
                }
            }
        }
    }
    if (!dataObjArr.length) {
        callback(null, data);
        return;
    }
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(configApiServer,
                                                     false),
              function(error, configDelData) {
        callback(error, data);
    });
}

function deleteChildrenFromParent (data, callback)
{
    /* Just delete the children now */
    var dataObj = data.dataObj;
    var appData = data.appData;
    var allChildDelObjs = dataObj.allChildDelObjs;
    var childrenData = dataObj.childrenData;
    var childObjs = _.result(dataObj, "childObjs", {});
    logutils.logger.info("deleteChildren Data AS:" + JSON.stringify(dataObj));
    var dataObjArr = [];
    /* If there is any reference, then we delete from allChildDelObjs, else from
     * childrenData
     */
    for (var key in allChildDelObjs) {
        var uiChildName = key.substring(0, key.length - 1);
        var refs = _.result(childObjs, uiChildName + ".references", []);
        if (!refs.length) {
            continue;
        }
        uiChildName = uiChildName.replace(/_/g, "-");
        var children = allChildDelObjs[key];
        var len = children.length;
        for (var i = 0; i < len; i++) {
            var reqUrl = "/" + uiChildName + "/" + children[i].uuid;
            commonUtils.createReqObj(dataObjArr, reqUrl,
                                     global.HTTP_REQUEST_DEL,
                                     null, null, null, appData);
            logutils.logger.info("DEL from Parent reqUrl as:" + reqUrl);
        }
    }
    for (var key in childrenData) {
        var uiChildName = key.substring(0, key.length - 1);
        var refs = _.result(childObjs, uiChildName + ".references", []);
        if (refs.length > 0) {
            continue;
        }
        uiChildName = uiChildName.replace(/_/g, "-");
        var children = childrenData[key];
        var len = children.length;
        for (var i = 0; i < len; i++) {
            var reqUrl = "/" + uiChildName + "/" + children[i].uuid;
            commonUtils.createReqObj(dataObjArr, reqUrl,
                                     global.HTTP_REQUEST_DEL,
                                     null, null, null, appData);
            logutils.logger.info("DEL from Parent reqUrl as:" + reqUrl);
        }
    }
    if (!dataObjArr.length) {
        callback(null, data);
        return;
    }
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(configApiServer,
                                                     false),
              function(error, delData) {
        callback(error, data);
    });
}

function deleteChildren (data, callback)
{
    async.waterfall([
        async.apply(deleteReferences, data),
        deleteChildrenFromParent
    ],
    function(error, data) {
        callback(error, data);
    });
}

function createChildren (data, callback)
{
    async.series([
        function(CB) {
            createChildEntries(data, function(error, childData) {
                CB(error, childData);
            });
        },
        function(CB) {
            attachRefs(data, function(error, refsData) {
                CB(error, refsData);
            });
        }
    ],
    function(error, data) {
        callback(error, data);
    });
    return;
}

function updateBackReferences (dataObj, callback)
{
    var filteredUIData = dataObj.filteredUIData;
    var filteredConfigData = dataObj.filteredConfigData;
    var appData = dataObj.appData;
    var uiOrigData = filteredUIData.origData;
    var configOrigData = filteredConfigData.origData;
    var parentType = _.keys(uiOrigData)[0];

    var newUIOrigData = commonUtils.cloneObj(uiOrigData[parentType]);
    var newConfigOrigData = commonUtils.cloneObj(configOrigData[parentType]);
    var deltas = {addedObjs: {}, deletedObjs: {}};
    buildDeltasByOrigData(deltas, newUIOrigData, newConfigOrigData);
    logutils.logger.info("Getting back_refs deltas as:" + JSON.stringify(deltas));
    var addedObjs = deltas.addedObjs;
    var deletedObjs = deltas.deletedObjs;
    /* From the original uidata first delete all the back_refs */
    var backRefStr = "_back_refs";
    var backRefStrLen = backRefStr.length;
    for (var key in uiOrigData[parentType]) {
        if (backRefStr == key.substr(key.length - backRefStrLen, backRefStrLen)) {
            delete uiOrigData[parentType][key];
        }
    }
    newUIOrigData = commonUtils.cloneObj(uiOrigData);
    for (var key in addedObjs) {
        uiOrigData[parentType][key] = addedObjs[key];
    }
    for (var key in deletedObjs) {
        newUIOrigData[parentType][key] = deletedObjs[key];
    }
    var updateData = {parentType: parentType, appData: appData,
                   configData: configOrigData};
    async.series([
        function(CB) {
            updateData.op = "DELETE";
            updateData.data = {origData: newUIOrigData};
            createOrDeleteBackReferences(updateData, function(error, data) {
                CB(error, data);
            });
        },
        function(CB) {
            updateData.op = "ADD";
            updateData.data = {origData: uiOrigData};
            createOrDeleteBackReferences(updateData, function(error, data) {
                CB(error, data);
            });
        }
    ],
    function(error, data) {
        callback(error, dataObj);
    })
}

function buildDeltasByOrigData (deltas, newOrigData, oldOrigData)
{
    var backRefStr = "_back_refs";
    var backRefStrLen = backRefStr.length;
    for (var key in newOrigData) {
        if (backRefStr == key.substr(key.length - backRefStrLen, backRefStrLen)) {
            var refName = key.substr(0, key.length - backRefStrLen);
            refName = refName.replace(/_/g, "-");
            var configBackRefsData = _.result(oldOrigData, key, []);
            var delta = jsonDiff.getConfigArrayDelta(key, configBackRefsData,
                                                     newOrigData[key]);
            if (null != delta) {
                if (delta.addedList.length > 0) {
                    deltas.addedObjs[key] = delta.addedList;
                }
                if (delta.deletedList.length > 0) {
                    deltas.deletedObjs[key] = delta.deletedList;
                }
            }
        }
        delete newOrigData[key];
        delete oldOrigData[key];
    }
}

function createOrDeleteBackReferences (dataObj, callback)
{
    var parentType = dataObj.parentType;
    var data = dataObj.data;
    var appData = dataObj.appData;
    var op = dataObj.op;
    var configData = dataObj.configData;
    var reqUrl = "/ref-update";
    var dataObjArr = [];

    var origData = data.origData[parentType];
    var backRefStr = "_back_refs";
    var backRefStrLen = backRefStr.length;
    for (var key in origData) {
        if (backRefStr == key.substr(key.length - backRefStrLen, backRefStrLen)) {
            var refName = key.substr(0, key.length - backRefStrLen);
            refName = refName.replace(/_/g, "-");
            var cnt = origData[key].length;
            for (var i = 0; i < cnt; i++) {
                var postData = {
                    "type": refName,
                    "uuid": origData[key][i].uuid,
                    "ref-type": parentType,
                    "ref-uuid": (null == origData.uuid) ? origData.uuid :
                        configData[parentType].uuid,
                    "ref-fq-name": origData.fq_name,
                    "operation": op,
                    "attr": (null != origData[key][i].attr) ?
                        origData[key][i].attr : null
                };
                commonUtils.createReqObj(dataObjArr, reqUrl,
                                         global.HTTP_REQUEST_POST, postData,
                                         null, null, appData);
                logutils.logger.info("Pushing back_refs post data for " +
                                     refName + " with ref-type " + parentType +
                                     " data as" + JSON.stringify(postData));
            }
        }
    }
    if (!dataObjArr.length) {
        callback(null, null);
        return;
    };
    logutils.logger.info("Updating back refs with op " + op + " for data");
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(configApiServer, false),
              function(error, data) {
        callback(error, data);
    });
}

function preBuildChildData (data)
{
    if (null == data) {
        return;
    }
    data.allChildAddRefObjs =
        commonUtils.cloneObj(data.childrenData);
    for (var child in data.childrenData) {
        var uiChildKey = child.substring(0, child.length - 1);
        var refs = _.result(data, "childObjs." + uiChildKey + ".references",
                            []);
        refs = refs.map(function(ref) { return ref + "s"; });
        if (data.childrenData[child].length > 0) {
            var keys = _.keys(data.childrenData[child][0]);
            if ((_.intersection(refs, keys)).length > 0) {
                /* If there are references, then we split the
                 * references with the child, so same child will
                 * exist in multiple array elemets, so in that
                 * case take the child list from childDataWORefs
                 */
                var childWORefs =
                    _.result(data, "childDataWORefs." + child,
                             null);
                if (null == childWORefs) {
                    /* We must not come here */
                    logutils.logger.error("We got null " +
                                          "childDataWORefs " +
                                          "for key " + child);
                    continue;
                }
                logutils.logger.info("Taking child data for " +
                                     child + " from " +
                                     "childDataWORefs");
                data.childrenData[child] =
                    commonUtils.cloneObj(childWORefs);
            }
        }
    }
}

function createConfigObjectByType (data, appData, callback)
{
    var reqUrl = data.reqUrl;
    var body = data.body;
    configApiServer.apiPost(reqUrl, body, appData, function(error, configResp) {
        callback(error, configResp);
    });
}

function updateConfigObjectByType (data, appData, callback)
{
    var reqUrl = data.reqUrl;
    var body = data.body;
    configApiServer.apiPut(reqUrl, body, appData, function(error, configResp) {
        callback(error, configResp);
    });
}

function createConfigObjectCB (data, appData, callback)
{
    /* Find the reqUrl from first key in data */
    var resType = _.keys(data)[0];
    var reqUrl = "/" + resType + "s";
    /* Filter out all children */
    if ((null != data.reqUrl) && (null != data.body)) {
        /* User has given instruction to execute */
        return createConfigObjectByType(data, appData, callback);
    }
    var dataObj = {data: data, parentType: resType, appData: appData,
                   doLookup: false};
    filterChildrenData(dataObj, function(error, data) {
        var postData = jsonDiff.getConfigJSONDiff(resType, null,
                                                  data.filteredData);
        configApiServer.apiPost(reqUrl, postData, appData,
                                function(error, configData) {
            if ((null != error) || (null == configData)) {
                callback(error, {configData: configData});
                return;
            }
            var configObj = process.mainModule.exports['configJsonModifyObj'];
            var configObjByType = configObj[resType];
            if (null == configObjByType) {
                callback(null, {configData: configData});
                return;
            }
            /* Now create all the children */
            async.parallel([
                function(CB) {
                    /* Update the uuid in data */
                    var uuid = _.result(configData, resType + ".uuid", null);
                    if (null != uuid) {
                        data.origData[resType].uuid = uuid;
                    }
                    preBuildChildData(data);
                    createChildren({parentType: resType, dataObj: data,
                                   appData: appData}, function(error, data) {
                        CB(error, data);
                    });
                },
                function(CB) {
                    createOrDeleteBackReferences({appData: appData, op: "ADD",
                                          data: data, configData: configData,
                                          parentType: resType},
                                          function(error, data) {
                        CB(error, data);
                    });
                }
            ],
            function(error, data) {
                callback(error, {configData: configData, otherData: data});
            });
        });
    });
}

function buildSetTagMaps (mapObj, data, objType)
{
    if (null == mapObj) {
        mapObj = {};
    }
    if (null == data) {
        return;
    }
    if (null == objType) {
        objType = _.keys(data)[0];
    }
    var tagRefs = _.get(data, [objType, "tag_refs"], []);
    var uuid = _.get(data, [objType, "uuid"], null);
    var fqName = _.get(data, [objType, "fq_name"], []).join(":");
    partialKey = (null != uuid) ? uuid : fqName;
    mapObj[objType + ';'+ partialKey] = tagRefs;
}

function createConfigObject (req, res, appData)
{
    var body = req.body;
    if (null === body) {
        var error = new appErrors.RESTServerError('Invalid POST Data');
        commonUtils.handleJSONResponse(error, res, null);
        return;
    }
    doCreateOrUpdateConfigObject(global.HTTP_REQUEST_POST, body, appData,
                                 req, function(error, result) {
        commonUtils.handleJSONResponse(error, res, result);
    });
}

function updateConfigObject (req, res, appData)
{
    var body = req.body;
    if (null === body) {
        var error = new appErrors.RESTServerError('Invalid POST Data');
        commonUtils.handleJSONResponse(error, res, null);
        return;
    }
    doCreateOrUpdateConfigObject(global.HTTP_REQUEST_PUT, body, appData,
                                 req, function(error, result) {
        commonUtils.handleJSONResponse(error, res, result);
    });
}

function doCreateOrUpdateConfigObject (type, body, appData, req, callback)
{
    var setTagsMap = {};
    var objType = _.keys(body)[0];
    var dataObj = {appData: appData, data: body, type: type,
        objType: objType, request: req};
    createOrUpdateConfigObject(dataObj, function(error, result) {
        if (null != error) {
            callback(error, result);
            return;
        }
        /* Set Tags */
        buildSetTagMaps(setTagsMap, body);
        setTags(setTagsMap, [result.configData], appData,
                function(error, tagResult) {
            callback(error, result);
            return;
        });
    });
}

function attachReferencesToChild (childData, refNames, configData)
{
    logutils.logger.info("In attachReferencesToChild() " +
                         "Getting childData as:" + JSON.stringify(childData));
    var refNamesCnt = refNames.length;
    childData.uuid = configData.uuid;
    for (var i = 0; i < refNamesCnt; i++) {
        var backRefKey = refNames[i] + "_back_refs";
        if (null == configData[backRefKey]) {
            continue;
        }
        var backRefsCnt = configData[backRefKey].length;
        for (var j = 0; j < backRefsCnt; j++) {
            var uuid = configData[backRefKey][j].uuid;
            var refKey = refNames[i] + "s";
            if (null == childData[refKey]) {
                childData[refKey] = [];
            }
            childData[refKey].push({uuid: uuid});
        }
    }
    logutils.logger.info("Attched childData as:" + JSON.stringify(childData));
}

function updateReferencesToConfigChildren (childrenData, configRefData,
                                           childObjs)
{
    var refs = {};
    var len = 0;
    if (null != configRefData) {
        len = configRefData.length;
    }
    for (var i = 0; i < len; i++) {
        for (var key in configRefData[i]) {
            var uiKey = key.replace(/-/g, "_");
            if (null == refs[uiKey]) {
                refs[uiKey] = [];
            }
            refs[uiKey] = refs[uiKey].concat(configRefData[i][key]);
        }
    }
    logutils.logger.info("Getting refs as:" + JSON.stringify(refs));
    var refObjs = {};
    for (var uiKey in refs) {
        refObjs[uiKey] = {};
        var len = refs[uiKey].length;
        for (var i = 0; i < len; i++) {
            var resourceKey = uiKey.replace(/_/g, "-");
            resourceKey = resourceKey.substring(0, resourceKey.length - 1);
            var uuid = refs[uiKey][i][resourceKey].uuid;
            refObjs[uiKey][uuid] = refs[uiKey][i][resourceKey];
        }
    }
    logutils.logger.info("Getting refObjs as:" + JSON.stringify(refObjs));
    for (var key in childrenData) {
        if (null != refs[key]) {
            var childObjKey = key.substring(0, key.length - 1);
            var configRefNames = _.result(childObjs, childObjKey +
                                          ".references", []);
            if (!configRefNames.length) {
                /* Weired... we have refs, but we do not have in UI schema */
                logutils.logger.error("Did not find the references in schema," +
                                      " but we have data " + key);
                continue;
            }
            var childPerKeyCnt = childrenData[key].length;
            for (var i = 0; i < childPerKeyCnt; i++) {
                var uuid = childrenData[key][i].uuid;
                if (null == uuid) {
                    // Weired...we came here but do not have to field
                    logutils.logger.error("UUID is null for key " + key +
                                          " in child data");
                    continue;
                }
                if (null == refObjs[key][uuid]) {
                    logutils.logger.error("UUID not found in refObjs " + key +
                                          " for child data for UUID " + uuid);
                    continue;
                }
                attachReferencesToChild(childrenData[key][i], configRefNames,
                                        refObjs[key][uuid]);
            }
        }
    }
    /* Now split all the references */
    var clonedChildrenData = commonUtils.cloneObj(childrenData);
    var childDataWORefs = {};
    splitArr = [];
    for (var key in childrenData) {
        var uiKey = key.substring(0, key.length - 1);
        var configRefNames = _.result(childObjs, uiKey + ".references", []);
        if (!configRefNames.length) {
            childDataWORefs[key] = childrenData[key];
            continue;
        }
        childDataWORefs[key] = [];
        var len = childrenData[key].length;
        for (var i = 0; i < len; i++) {
            childDataWORefs[key][i] = {};
            childDataWORefs[key][i] = {
                to: childrenData[key][i].to,
                uuid: childrenData[key][i].uuid
            };
            splitArr = splitArr.concat(splitChildrenByRef(childrenData[key][i],
                                       configRefNames));
        }
        childrenData[key] = splitArr;
        childrenData = commonUtils.cloneObj(childrenData);
    }
    return childDataWORefs;
}

function filterChildByRefs (childEntry, addRefKey, refList)
{
    logutils.logger.info("In filterChildByRefs() childEntry as:" +
                         JSON.stringify(childEntry));
    var clonedChildEntry = commonUtils.cloneObj(childEntry);
    var refKey = addRefKey + "s";
    var newChildArr = [];
    if (null == clonedChildEntry[refKey]) {
        return newChildArr;
    }
    var refData = [];
    var skipRefKeysLen = refList.length;
    for (var i = 0; i < skipRefKeysLen; i++) {
        var uiRefKey = refList[i] + "s";
        if (addRefKey == refList[i]) {
            refData = commonUtils.cloneObj(clonedChildEntry[uiRefKey]);
        }
        if (clonedChildEntry[uiRefKey]) {
            delete clonedChildEntry[uiRefKey];
        }
    }
    var childRefLen = refData.length;
    for (var i = 0; i < childRefLen; i++) {
        newChildArr[i] = clonedChildEntry;
        newChildArr[i][refKey] = [];
        newChildArr[i][refKey].push(refData[i]);
        newChildArr = commonUtils.cloneObj(newChildArr);
    }
    return newChildArr;
}

function splitChildrenByRef (childEntry, refList)
{
    var newChildArr = []
    var clonedChildEntry = commonUtils.cloneObj(childEntry);
    var clonedRefList = commonUtils.cloneObj(refList);
    var tmpArr = [];
    var refCnt = refList.length;
    for (var i = 0; i < refCnt; i++) {
        if (null == childEntry[refList[i] + "s"]) {
            continue;
        }
        newChildArr = newChildArr.concat(filterChildByRefs(clonedChildEntry,
                                                           refList[i],
                                                           refList));
    }
    if (!newChildArr.length) {
        /* It must the case when we do not have any references */
        newChildArr.push(clonedChildEntry);
    }
    return newChildArr;
}

function updateChildren (dataObj, callback)
{
    var deltas      = [];
    var uiData      = dataObj.uiData;
    var configData  = dataObj.configData;
    var appData     = dataObj.appData;
    var parentType  = dataObj.parentType;

    var configObj       = process.mainModule.exports['configJsonModifyObj'];
    var configObjByType = configObj[parentType];
    if (null == configObjByType) {
        logutils.logger.debug("We do not have " + parentType + " in UI Schema");
        callback(null, {filteredUIData: {filteredData: uiData, origData: uiData},
                        filteredConfigData: {filteredData: configData, origData:
                                             configData},
                        appData: appData}
                );
        return;
    }
    var uiDataObj = {data: uiData, parentType: parentType, appData: appData,
                   doLookup: true};
    var configDataObj = {data: configData, parentType: parentType, appData: appData,
                   doLookup: true};
    async.parallel([
        function(CB) {
            filterChildrenData(uiDataObj, function(error, data) {
                CB(error, data);
            });
        },
        function(CB) {
            filterChildrenData(configDataObj, function(error, data) {
                CB(error, data);
            });
        }
    ],
    function(error, data) {
        var filteredUIData = data[0];
        var filteredConfigData = data[1];
        var dataObj = {
            appData: appData,
            filteredUIData: filteredUIData,
            filteredConfigData: filteredConfigData,
            parentType: parentType,
            configData: configData
        };
        logutils.logger.info("Final filtered data as:" + JSON.stringify(data));
        getUpdateChildDeltaAndUpdate(dataObj, callback);
    });
}

function getUpdateChildDeltaAndUpdate (dataObj, callback)
{
    var childDeltas         = [];
    var childRefDeltas      = [];
    var appData             = dataObj.appData;
    var parentType          = dataObj.parentType;
    var filteredUIData      = dataObj.filteredUIData;
    var filteredConfigData  = dataObj.filteredConfigData;

    logutils.logger.info("Getting filteredUIData as:" + JSON.stringify(filteredUIData));
    logutils.logger.info("Getting filteredConfigData as:" +
                         JSON.stringify(filteredConfigData));
    var clonedUIChildData =
        commonUtils.cloneObj(_.result(filteredUIData, "childrenData", {}));
    var clonedConfigChildData =
        commonUtils.cloneObj(_.result(filteredConfigData, "childrenData", {}));

    clonedUIChildDataWORefs =
        commonUtils.cloneObj(_.result(filteredUIData, "childDataWORefs", {}));
    clonedConfigChildDataWORefs =
        commonUtils.cloneObj(_.result(filteredConfigData, "childDataWORefs",
                                      {}));

    for (var uiChildKey in clonedUIChildDataWORefs) {
        var arrDiffKey = uiChildKey.substring(0, uiChildKey.length - 1);
        arrDiffKey = arrDiffKey.replace(/_/g, "-");
        var childDelta =
            jsonDiff.getConfigArrayDelta(arrDiffKey,
                                         clonedConfigChildDataWORefs[uiChildKey],
                                         clonedUIChildDataWORefs[uiChildKey]);
        delete clonedConfigChildDataWORefs[uiChildKey];
        delete clonedUIChildDataWORefs[uiChildKey];
        if (null == childDelta) {
            continue;
        }
        childDelta["uiChildName"] = uiChildKey;
        childDeltas.push(childDelta);
    }
    for (var configChildKey in clonedConfigChildDataWORefs) {
        var arrDiffKey = configChildKey.substring(0, configChildKey.length - 1);
        arrDiffKey = arrDiffKey.replace(/_/g, "-");
        var childDelta =
            jsonDiff.getConfigArrayDelta(arrDiffKey,
                                         clonedConfigChildDataWORefs[configChildKey],
                                         clonedUIChildDataWORefs[configChildKey]);
        if (null == childDelta) {
            continue;
        }
        childDelta["uiChildName"] = configChildKey;
        childDeltas.push(childDelta);
    }
    for (var uiChildKey in clonedUIChildData) {
        var arrDiffKey = uiChildKey.substring(0, uiChildKey.length - 1);
        arrDiffKey = arrDiffKey.replace(/_/g, "-");
        var childRefDelta =
            jsonDiff.getConfigArrayDelta(arrDiffKey,
                                         clonedConfigChildData[uiChildKey],
                                         clonedUIChildData[uiChildKey]);
        delete clonedUIChildData[uiChildKey];
        delete clonedConfigChildData[uiChildKey];
        if (null == childRefDelta) {
            continue;
        }
        childRefDelta["uiChildName"] = uiChildKey;
        childRefDeltas.push(childRefDelta);
    }
    for (var configChildKey in clonedConfigChildData) {
        var arrDiffKey = configChildKey.substring(0, configChildKey.length - 1);
        arrDiffKey = arrDiffKey.replace(/_/g, "-");
        var childRefDelta =
            jsonDiff.getConfigArrayDelta(arrDiffKey,
                                         clonedConfigChildData[uiChildKey],
                                         clonedUIChildData[uiChildKey]);
        if (null == childRefDelta) {
            continue;
        }
        childRefDelta["uiChildName"] = configChildKey;
        childRefDeltas.push(childRefDelta);
    }
    logutils.logger.info("Getting Child deltas as:" + JSON.stringify(childDeltas));
    logutils.logger.info("Getting Child Ref deltas as:" +
                         JSON.stringify(childRefDeltas));
    updateChildrenCB(dataObj, childDeltas, childRefDeltas, callback);
}

function getAndDeleteSameEntryByComparators (modObjs, delta, comparators,
                                             doInsert)
{
    var clonedDelta = commonUtils.cloneObj(delta);
    var addedList = commonUtils.doDeepSort(clonedDelta.addedList);
    var delList = commonUtils.doDeepSort(clonedDelta.deletedList);
    jsonDiff.filterFieldsByComparators(addedList, comparators);
    var newAddedList = commonUtils.doDeepSort(addedList);
    jsonDiff.filterFieldsByComparators(delList, comparators);
    var newDelList = commonUtils.doDeepSort(delList);
    var newAddedListLen = newAddedList.length;
    var newDelListLen = newDelList.length;
    var compCnt = comparators.length;
    var modList = [];
    var foundArr = [];
    for (var i = 0; i < newAddedListLen; i++) {
        for (var j = 0; j < newDelListLen; j++) {
            if (_.isEqual(newAddedList[i], newDelList[j])) {
                logutils.logger.info("Pushing to modifiedChild list " +
                                     JSON.stringify(delta.addedList[i]));
                if (doInsert) {
                    modList.push(commonUtils.cloneObj(delta.addedList[i]));
                }
                delta.addedList.splice(i, 1);
                delta.deletedList.splice(j, 1);
                newAddedListLen--;
                newDelListLen--;
            }
        }
    }
    if (doInsert) {
        modObjs[delta.uiChildName] = modList;
    }
}

function getToEditChildrenByDeltasCB(modObjs, deltas, children, parentType,
                                     doInsert)
{
    var deltasCnt = deltas.length;
    for (var i = 0; i < deltasCnt; i++) {
        var uiChildName = deltas[i].uiChildName;
        uiChildName = uiChildName.substring(0, uiChildName.length - 1);
        var comparators = _.result(children, uiChildName + ".comparators", []);
        if (!comparators.length) {
            continue;
        }
        getAndDeleteSameEntryByComparators(modObjs, deltas[i], comparators,
                                           doInsert);
    }
}

function getToEditChildrenByDeltas (childDeltas, childRefDeltas, parentType)
{
    /* Let us compare with all the comparators if they are same, and we have
     * in add/delete list, then it must be modify the child
     */
    var childDeltasCnt = childDeltas.length;
    var configObj = process.mainModule.exports['configJsonModifyObj'];
    var children = _.result(configObj, parentType + ".children", null);
    if (null == children) {
        return [];
    }
    var modList = [];
    var modObjs = {};
    getToEditChildrenByDeltasCB(modObjs, childDeltas, children, parentType, true);
    getToEditChildrenByDeltasCB(modObjs, childRefDeltas, children, parentType,
                                false);
    return modObjs;
}

function modifyChildrenCB (dataObj, callback)
{
    var postData = dataObj.postData;
    var reqUrl = dataObj.reqUrl;
    var appData = dataObj.appData;
    logutils.logger.info("Child Modify PUT data " + reqUrl +
                         JSON.stringify(postData));
    jsonDiff.getConfigDiffAndMakeCall(reqUrl, appData, postData, callback);
}

function modifyChildren (dataObj, callback)
{
    var dataObjArr = [];
    var allModifiedObjs = dataObj.allModifiedObjs;
    var appData = dataObj.appData;
    var parentType = dataObj.parentType;

    for (var key in allModifiedObjs) {
        var configChildName = key.substring(0, key.length - 1);
        configChildName = configChildName.replace(/_/g, "-");
        var dataPerChildType = allModifiedObjs[key];
        var cnt = dataPerChildType.length;
        for (var i = 0; i < cnt; i++) {
            var postData = {};
            postData[configChildName] = dataPerChildType[i];
            if ("to" in postData[configChildName]) {
                postData[configChildName].fq_name = postData[configChildName].to;
                delete postData[configChildName].to;
                postData[configChildName].parent_type = parentType;
            }
            logutils.logger.info("modifyChild PUT data as:" +
                                 JSON.stringify(postData));
            var reqUrl = "/" + configChildName + "/" + postData[configChildName].uuid;
            dataObjArr.push({postData: postData, reqUrl: reqUrl, appData:
                            appData});
        }
    }
    if (!dataObjArr.length) {
        callback(null, null);
        return;
    }
    async.map(dataObjArr, modifyChildrenCB, function(error, data) {
        callback(error, data);
    });
}

function concatAddDelDeltaObjs (deltas)
{
    var deltasCnt = deltas.length;
    var allAddedObjs = {};
    var allDeletedObjs = {};

    for (var i = 0; i < deltasCnt; i++) {
        var addedList = deltas[i].addedList;
        var deletedList = deltas[i].deletedList;
        var childName = deltas[i].uiChildName;
        if (addedList.length > 0) {
            if (null == allAddedObjs[childName]) {
                allAddedObjs[childName] = [];
            }
            allAddedObjs[childName] = allAddedObjs[childName].concat(addedList);
        }
        if (deletedList.length > 0) {
            if (null == allDeletedObjs[childName]) {
                allDeletedObjs[childName] = [];
            }
            allDeletedObjs[childName] =
                allDeletedObjs[childName].concat(deletedList);
        }
    }
    return {allAddedObjs: allAddedObjs, allDeletedObjs: allDeletedObjs};
}

function updateChildrenCB (dataObj, childDeltas, childRefDeltas, callback)
{
    var appData             = dataObj.appData;
    var parentType          = dataObj.parentType;
    var filteredUIData      = dataObj.filteredUIData;
    var filteredConfigData  = dataObj.filteredConfigData;

    logutils.logger.info("Getting Initial Deltas as:",
                         JSON.stringify(childDeltas));
    var allModifiedObjs = getToEditChildrenByDeltas(childDeltas, childRefDeltas,
                                                    parentType);
    var allAddedObjs = {};
    var allDeletedObjs = {};
    var allChildAddDelObjs = concatAddDelDeltaObjs(childDeltas);
    var allChildAddDelRefObjs = concatAddDelDeltaObjs(childRefDeltas);

    logutils.logger.info("Getting allChildAddDelObjs as:" +
                         JSON.stringify(allChildAddDelObjs));
    logutils.logger.info("Getting allChildAddDelRefObjs as:" +
                         JSON.stringify(allChildAddDelRefObjs));

    /* All ADD happens WRT data from filteredUIData */
    var filteredAddData = commonUtils.cloneObj(filteredUIData);
    filteredAddData.childrenData = allChildAddDelObjs.allAddedObjs;
    filteredAddData.allChildAddRefObjs = allChildAddDelRefObjs.allAddedObjs;
    filteredAddData.parentData = dataObj.configData;

    /* All DEL happens WRT data from filteredConfigData */
    var filteredDelData = commonUtils.cloneObj(filteredConfigData);
    filteredDelData.childrenData = allChildAddDelRefObjs.allDeletedObjs;
    filteredDelData.allChildDelObjs = allChildAddDelObjs.allDeletedObjs;

    logutils.logger.info("Getting allModifiedObjs as:" +
                         JSON.stringify(allModifiedObjs));
    async.parallel([
        function(CB) {
            deleteChildren({parentType: parentType, dataObj: filteredDelData,
                           appData: appData},
                           function(error, data) {
                CB(error, data);
            });
        },
        function(CB) {
            createChildren({parentType: parentType, dataObj: filteredAddData,
                           appData: appData},
                           function(error, data) {
                CB(error, data);
            });
        },
        function(CB) {
            modifyChildren({allModifiedObjs: allModifiedObjs, appData: appData,
                           parentType: parentType}, function(error, data) {
                CB(error, data);
            });
        }
    ],
    function(error, data) {
        callback(error, {filteredUIData: filteredUIData,
                 filteredConfigData: filteredConfigData, appData: appData,
                 configData: dataObj.configData});
    });
}

function updateResource (dataObj, callback)
{
    var filteredData = _.result(dataObj, "filteredUIData.filteredData", null);
    if (null == filteredData) {
        logutils.logger.error("updateResource error, filteredData is null");
        /* We must not come here */
        callback(null, null);
        return;
    }
    logutils.logger.info("Getting filteredData in updateResource() " +
                         JSON.stringify(filteredData));

    var parentKey = _.keys(filteredData)[0];
    var appData = _.result(dataObj, "appData", null);
    var uuid = _.result(filteredData, parentKey + ".uuid", null);
    var reqUrl = "/" + parentKey + "/" + uuid;
    jsonDiff.getConfigDiffAndMakeCall(reqUrl, appData, filteredData,
                                      function(error, data) {
        callback(error, data);
    }, null, uuid);
}

function updateConfigObjectCB (body, appData, callback)
{
    var error;
    /* Update the children first */
    var resType = _.keys(body)[0];
    if ((null != body.reqUrl) && (null != body.body)) {
        /* User has given instruction to execute */
        return updateConfigObjectByType(body, appData, callback);
    }
    var resUUID = _.result(body, resType + ".uuid", null);
    if (null == resUUID) {
        error = new appErrors.RESTServerError("UUID is not provided");
        callback(error, null);
        return;
    }
    var getReqURL = "/" + resType + "/" + resUUID;
    configApiServer.apiGet(getReqURL, appData, function(error, configData) {
        /* Now let us find the diff of child objects */
        var dataObj =
            {configData: configData, appData: appData, parentType: resType,
             uiData: body};
        async.waterfall([
            async.apply(updateChildren, dataObj),
            updateBackReferences,
            updateResource
        ],
        function(error, data) {
            callback(error, {configData: body, otherData: data});
        });
    });
}

function createOrUpdateConfigObject (dataObj, callback)
{
    var appData = dataObj.appData;
    var body = dataObj.data;
    var type = dataObj.type;
    var objType = dataObj.objType;
    if(GENERIC_API_BASIC === body.requestType) {
        delete body.requestType;
        createOrUpdateConfigObjectCB(type, body, appData, callback);
        return;
    }
    var createEditHandler = getConfigCreateEditCallbackByType(type, objType);
    if (null !== createEditHandler) {
        createEditHandler(dataObj, function(error, data) {
            callback(error, {configData: data});
        });
        return;
    }
    createOrUpdateConfigObjectCB(type, body, appData, callback);
}

function createOrUpdateConfigObjectCB (type, body, appData, callback)
{
    if (global.HTTP_REQUEST_PUT == type) {
        updateConfigObjectCB(body, appData, function(error, data) {
            callback(error, data);
        });
    } else {
        createConfigObjectCB(body, appData, function(error, data) {
            callback(error, data);
        });
    }
}

function createConfigObjects (req, res, appData)
{
    var body = req.body;
    if (null === body) {
        var error = new appErrors.RESTServerError('Invalid POST Data');
        commonUtils.handleJSONResponse(error, res, null);
        return;
    }
    createOrUpdateConfigObjects(req, global.HTTP_REQUEST_POST,
                                appData, function(error, results) {
        commonUtils.handleJSONResponse(error, res, results);
    });
}

function updateConfigObjects (req, res, appData)
{
    var body = req.body;
    if (null === body) {
        var error = new appErrors.RESTServerError('Invalid POST Data');
        commonUtils.handleJSONResponse(error, res, null);
        return;
    }
    createOrUpdateConfigObjects(req, global.HTTP_REQUEST_PUT,
                                appData, function(error, results) {
        commonUtils.handleJSONResponse(error, res, results);
    });
}

function createOrUpdateConfigObjects (req, type, appData, callback)
{
    var dataObjArr = [];
    var body = req.body;
    var data = commonUtils.getValueByJsonPath(body, 'data', [], false);
    var reqCnt = data.length;
    var dataObjArr = [];
    var setTagsMap = {}, objType, tagRefs, fqName, uuid, partialKey;
    for (var i = 0; i < reqCnt; i++) {
        var uiData = _.get(data, [i, "data"], null);
        dataObjArr[i] = {};
        dataObjArr[i]['type'] = type;
        dataObjArr[i]['data'] = uiData;
        dataObjArr[i]['request'] = req;
        dataObjArr[i]['appData'] = appData;
        objType =  _.get(data, i + '.type', null);
        if(objType === null) {
            objType = _.keys(data[i]['data'])[0];
        }
        dataObjArr[i]['objType'] = objType;
        buildSetTagMaps(setTagsMap, uiData, objType);
    }

    async.map(dataObjArr, createOrUpdateConfigObject,
              function(err, results) {
              if(err){
                  callback(err, null);
                  return;
              }
              var configDatas = [];
              var cnt = results.length;
              for (var i = 0; i < cnt; i++) {
                if (null == results[i].configData) {
                    /* We must not come here */
                    logutils.logger.error("We did not get configData for " +
                                          "result index as " + i);
                    continue;
                }
                configDatas.push(results[i].configData);
              }
              setTags(setTagsMap, configDatas, appData,
                      function(errTag, resultsTag){
                  if(errTag){
                      callback(errTag, null);
                      return;
                  }
                  callback(err, results);
              });
    });
}

function setTags(setTagsMap, results, appData, callback)
{
    try {
        var dataObjArray = [];
        _.forIn(setTagsMap, function(tagRefs, key) {
            var objTypeArry = key.split(';'),
                objType = objTypeArry[0],
                partialKey = objTypeArry[1];
            var objDetails = _.find(results, function(o){
                var fqName = _.get(o, objType +'.fq_name', []).join(':'),
                    uuid =  _.get(o, objType +'.uuid', null);
                return (fqName === partialKey || uuid === partialKey);
            });
            var reqUrl = '/set-tag';
            var postData = {};
            postData.obj_type = objType;
            postData.obj_uuid = objDetails[objType].uuid;
            //delete existing tag refs for edit case
            var existingTagRefs = objDetails[objType].tag_refs;
            var deleteTagArray = [];
            if(existingTagRefs && existingTagRefs.length) {
                _.each(existingTagRefs, function(existingTag){
                    var tagExist = _.find(tagRefs, function(tag){
                            var tagTo = tag.to.join(':');
                            var existingTagTo = existingTag.to.join(':');
                            return tagTo === existingTagTo;
                        });
                    if(tagExist === undefined) {
                        deleteTagArray.push(existingTag);
                    }
                });
            }
            _.each(deleteTagArray, function(tag){
                var tagInfo = tag.to[tag.to.length -1];
                tagInfo = tagInfo.split('=');
                var tagType = tagInfo[0];
                var tagValue = tagInfo[1];
                if(tagType === 'label') {
                    if(!postData[tagType]) {
                        postData[tagType] = {};
                    }
                    if(!postData[tagType]['delete_values']){
                        postData[tagType]['delete_values'] = [];
                    }
                    postData[tagType]['delete_values'].push(tagValue);
                } else {
                    postData[tagType] = null;
                }
            });
            _.each(tagRefs, function(tag){
                var tagInfo = tag.to[tag.to.length -1];
                tagInfo = tagInfo.split('=');
                var tagType = tagInfo[0];
                var tagValue = tagInfo[1];
                if(tagType === 'label') {
                    if(!postData[tagType]) {
                        postData[tagType] = {};
                    }
                    if(!postData[tagType]['add_values']){
                        postData[tagType]['add_values'] = [];
                    }
                    postData[tagType]['add_values'].push(tagValue);
                } else {
                    postData[tagType] = {};
                    postData[tagType]['value'] = tagValue;
                }
                if(tag.to.length === 3) {
                    postData[tagType]['is_global'] = false;
                } else if(tag.to.length === 1) {
                    postData[tagType]['is_global'] = true;
                }
            });
            commonUtils.createReqObj(dataObjArray, reqUrl,
                                     global.HTTP_REQUEST_POST,
                                     commonUtils.cloneObj(postData), null,
                                     null, appData);
        });
        async.map(dataObjArray,
                commonUtils.getServerResponseByRestApi(configApiServer, true),
                function(error, results) {
                    callback(error, results);
                    return;
                }
            );
    } catch(e){
        logutils.logger.info("Set Tags: " + e);
        callback(null, null);
    }
}

exports.getConfigUUIDList = getConfigUUIDList;
exports.deleteMultiObject = deleteMultiObject;
exports.getConfigDetails = getConfigDetails;
exports.getConfigAsync= getConfigAsync;
exports.createConfigObject = createConfigObject;
exports.updateConfigObject = updateConfigObject;
exports.createConfigObjects = createConfigObjects;
exports.updateConfigObjects = updateConfigObjects;
exports.getConfigList = getConfigList;
exports.getConfigObjects = getConfigObjects;
exports.deleteMultiObjectCB = deleteMultiObjectCB;
exports.deleteConfigObj = deleteConfigObj;
exports.deleteConfigObjCB = deleteConfigObjCB;
exports.getConfigPaginatedResponse = getConfigPaginatedResponse;
exports.getUUIDByFQN = getUUIDByFQN;

