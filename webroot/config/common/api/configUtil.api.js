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
var configObjs = require("../../../common/api/jsonDiff.helper");
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
        console.log("Didnt find the handler");
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

function getConfigDetailsAsync (dataObj, callback)
{
    var appData = dataObj['appData'];
    var url = '/' + dataObj['type'];
    var startDone = false;
    if (true == dataObj['detail']) {
        url += '?detail=true';
        startDone = true;
    }
    if (null != dataObj['fields']) {
        if (true == startDone) {
            url += '&';
        } else {
            url += '?';
        }
        url += 'fields=' + dataObj['fields'];
        startDone = true;
    }
    if (null != dataObj['parent_id']) {
        if (true == startDone) {
            url += '&';
        } else {
            url += '?';
        }
        url += 'parent_id=' + dataObj['parent_id'];
        startDone = true;
    } else {
        if ((null != dataObj['parent_fq_name_str']) &&
            (null != dataObj['parent_type'])) {
            if (true == startDone) {
                url += '&';
            } else {
                url += '?';
            }
            url += 'parent_fq_name_str=' + dataObj['parent_fq_name_str'] +
                '&parent_type=' + dataObj['parent_type'];
            startDone = true;
        }
    }
    if (null != dataObj['back_ref_id']) {
        if (true == startDone) {
            url += '&';
        } else {
            url += '?';
        }
        url += 'back_ref_id=' + dataObj['back_ref_id'];
        startDone = true;
    }
    if (null != dataObj['obj_uuids']) {
        if (true == startDone) {
            url += '&';
        } else {
            url += '?';
        }
        url += 'obj_uuids=' + dataObj['obj_uuids'].join(',');
        startDone = true;
    }
    if (null != dataObj['filters']) {
        if (true == startDone) {
            url += '&';
        } else {
            url += '?';
        }
        url += 'filters=' + dataObj['filters'];
        startDone = true;
    }
    if (null != dataObj['fq_name']) {
        var postData = {
            'appData': appData,
            'fqnReq' : {
                'fq_name': dataObj['fq_name'].split(':'),
                'type':
                    dataObj['type'] != null ? dataObj['type'].slice(0, -1) : null}
        };
        getUUIDByFQN(postData, function(error, data) {
            if ( null != error) {
                var error = new appErrors.RESTServerError('Invalid fqn provided');
                callback(error, null);
                return;
            }
            var uuid = data.uuid;
            if (true == startDone) {
                url += '&';
            } else {
                url += '?';
            }
            url += 'obj_uuids=' + uuid;
            configApiServer.apiGet(url, appData, function(err, data) {
                callback(err, data);
            });
        });
    } else {
        configApiServer.apiGet(url, appData, function(err, data) {
            callback(err, data);
        });
    }

}

function getConfigDetails (req, res, appData)
{
    var postData = req.body;
    var detail = true;
    getConfigAsync(postData, detail, appData, function(err, data) {
        commonUtils.handleJSONResponse(err, res, data);
    });
}

function getConfigAsync (postData, detail, appData, callback)
{
    var dataObjArr = [];
    postData = postData['data'];
    var reqCnt = postData.length;
    for (var i = 0; i < reqCnt; i++) {
        var fields = postData[i]['fields'];
        dataObjArr[i] = {};
        dataObjArr[i]['detail'] = detail;
        dataObjArr[i]['type'] = postData[i]['type'];
        dataObjArr[i]['appData'] = appData;
        if ((null != fields) && (fields.length > 0)) {
            dataObjArr[i]['fields'] = fields.join(',');
        }
        if (null != postData[i]['parent_id']) {
            dataObjArr[i]['parent_id'] = postData[i]['parent_id'];
        }
        if (null != postData[i]['obj_uuids']) {
            dataObjArr[i]['obj_uuids'] = postData[i]['obj_uuids'];
        }
        if ((null != postData[i]['parent_fq_name_str']) &&
            (null != postData[i]['parent_type'])) {
            dataObjArr[i]['parent_fq_name_str'] =
                postData[i]['parent_fq_name_str'];
            dataObjArr[i]['parent_type'] = postData[i]['parent_type'];
        }
        var backRefIds = postData[i]['back_ref_id'];
        if ((null != backRefIds) && (backRefIds.length > 0)) {
            dataObjArr[i]['back_ref_id'] = backRefIds.join(',');
        }
        if (null != postData[i]['fq_name']) {
            dataObjArr[i]['fq_name'] = postData[i]['fq_name'];
        }
        if (null != postData[i]['filters']) {
            dataObjArr[i]['filters'] = postData[i]['filters'];
        }
    }
    async.map(dataObjArr, getConfigDetailsAsync, function(err, results) {
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
    var configObj = configObjs.configJsonModifyObj;
    var configObjByType = configObj[resType];
    var childrenData = {};
    if (null == configObjByType) {
        return callback(null, {origData: data, filteredData: data});
    }
    var children = configObjByType.children;
    if (null == children) {
        return callback(null, {origData: data, filteredData: data});
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
            var uuidCnt = uuidList.length;
            if ((uuidCnt > 0) && (true == doLookup)) {
                var backRefsStr = getBackReferStrByChildName(childName, children);
                logutils.logger.info("getting backRefsStr as:" + backRefsStr +
                                     " for child " + childName +
                                     " with children " + children);
                if ((null != backRefsStr) && (backRefsStr.length > 0)) {
                    var chunk = 200;
                    for (var j = 0, k = uuidCnt; j < k; j += chunk) {
                        var tempArray = uuidList.slice(j, j + chunk);
                        var reqUrl = "/" + arrDiffName + "s?detail=true&fields=" +
                            backRefsStr + "&obj_uuids=" + tempArray.join(",");
                        logutils.logger.info("Getting back_ref reqUrl as:" + reqUrl);
                        commonUtils.createReqObj(dataObjArr, reqUrl, null, null, null, null,
                                                 appData);
                    }
                }
            }
            delete data[resType][childName];
        }
    }
    var returnObj =
        {filteredData: data, childrenData: childrenData, origData: origData,
         childObjs: children};

    if (!dataObjArr.length) {
        callback(null, returnObj);
        return;
    }
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(configApiServer, true),
              function(error, configData) {
        /* Now attach the project details with floating-ip-pools */
        updateReferencesToConfigChildren(childrenData, configData, children);
        logutils.logger.info("Updated childrenData as:" +
                    JSON.stringify(childrenData));
        returnObj.childrenData = childrenData;
        callback(error, returnObj);
    });
}

function createChildEntry (refsDataObj, callback)
{
    logutils.logger.info("Creating child entry for " + refsDataObj.uiChildName);
    var dataObjArr = [];
    buildChildPostData(refsDataObj.parentType, dataObjArr,
                       refsDataObj.uiChildName,
                       [refsDataObj.childDataPerType], refsDataObj.appData);
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(configApiServer, true),
              function(error, data) {
        callback(error, {configData: data[0], refsDataObj: refsDataObj});
    });
}

function attachRefs (dataObj, callback)
{
    var configData = dataObj.configData;
    var refsDataObj = dataObj.refsDataObj;
    var uiChildName = refsDataObj.uiChildName.replace(/_/g, "-");
    var childUUID = _.result(configData, uiChildName + ".uuid", null);
    var childFqn = _.result(configData, uiChildName + ".fq_name", []);
    var childDataPerType = refsDataObj.childDataPerType;
    var refs = refsDataObj.refs;
    var appData = refsDataObj.appData;
    var refsCnt = refs.length;
    var reqUrl = "/ref-update";
    var dataObjArr = [];

    for (var i = 0; i < refsCnt; i++) {
        var refObjName = refs[i] + "s";
        if (null != childDataPerType[refObjName]) {
            var refsList = childDataPerType[refObjName];
            var refsListLen = refsList.length;
            for (var j = 0; j < refsListLen; j++) {
                var postData = {
                    "type": refs[i],
                    "uuid": refsList[j].uuid,
                    "ref-type": uiChildName,
                    "ref-uuid": childUUID,
                    "ref-fq-name": childFqn,
                    "operation": "ADD",
                    "attr": (null != refsList[j].attr) ? refsList[j].attr : null
                };
                commonUtils.createReqObj(dataObjArr, reqUrl,
                                         global.HTTP_REQUEST_POST, postData,
                                         null, null, appData);
                logutils.logger.info("Getting Refs postData as:" + postData);
            }
        }
    }
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(configApiServer, true),
              function(error, data) {
        callback(error, data);
    });
}

function createAndUpdateChildWithRefs (refsDataObj, callback)
{
    async.waterfall([
        async.apply(createChildEntry, refsDataObj),
        attachRefs
    ],
    function(error, data) {
        callback(error, data);
    });
}

function buildChildPostData (parentType, dataObjArr, childName, childDataPerType, appData)
{
    var childDataPerTypeCnt = childDataPerType.length;
    var configChildName = childName.replace(/_/g, "-");
    for (var i = 0; i < childDataPerTypeCnt; i++) {
        var postData = {}
        var childURL = "/" + configChildName + "s";
        postData[configChildName] = childDataPerType[i];
        if ("to" in postData[configChildName]) {
            postData[configChildName].fq_name = postData[configChildName].to;
            delete postData[configChildName].to;
            postData[configChildName].parent_type = parentType;
        }
        commonUtils.createReqObj(dataObjArr, childURL, global.HTTP_REQUEST_POST,
                                 postData, null, null, appData);
        logutils.logger.info("getting childURL as:" + childURL +
                             " with post data as " + JSON.stringify(postData));
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
            "uuid": refs[i],
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
                                                     true),
              function(error, configDelData) {
        callback(error, data);
    });
}

function deleteChildrenFromParent (data, callback)
{
    /* Just delete the children now */
    var dataObj = data.dataObj;
    var appData = data.appData;
    logutils.logger.info("deleteChildren Data AS:" + JSON.stringify(dataObj));
    var childrenData = dataObj.childrenData;
    var dataObjArr = [];
    for (var key in childrenData) {
        var uiChildName = key.substring(0, key.length - 1);
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
                                                     true),
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
    var parentType = data.parentType;
    var dataObj = data.dataObj;
    var appData = data.appData;
    logutils.logger.info("createChildren Data AS:" + JSON.stringify(dataObj));
    var data = dataObj.origData;
    var childrenData = dataObj.childrenData;
    var dataObjArr = [];
    var configChildObjs = dataObj.childObjs;
    var refsDataObjArr = [];

    /* Top level key in each element in childrenData is child name */
    for (var childName in childrenData) {
        /* childName contains "s" at end, but UI schema does not */
        var uiChildName = childName.substring(0, childName.length - 1);
        var childDataPerType = childrenData[childName];
        var refs = _.result(configChildObjs[uiChildName],  "references", []);
        logutils.logger.info("Getting refs as:" + refs + " with childObjs as " +
                             configChildObjs + " for child " + childName);
        if ((refs.length > 0) && (childDataPerType.length > 0)) {
            var childDataPerTypeCnt = childDataPerType.length;
            for (var j = 0; j < childDataPerTypeCnt; j++) {
                refsDataObjArr.push({uiChildName: uiChildName,
                                    childName: childName,
                                    childDataPerType: childDataPerType[j],
                                    parentType: parentType,
                                    refs: refs, appData: appData});
                logutils.logger.info("Pushing to refsDataObjArr:" +
                                     childDataPerType[j]);
            }
            continue;
        }
        var childDataPerTypeCnt = childDataPerType.length;
        buildChildPostData(parentType, dataObjArr, uiChildName, childDataPerType, appData);
    }
    async.parallel([
        function(CB) {
            async.map(dataObjArr,
                      commonUtils.getServerResponseByRestApi(configApiServer,
                                                             true),
                      function(error, data) {
                CB(error, data);
            });
        },
        function(CB) {
            if (refsDataObjArr.length > 0) {
                async.map(refsDataObjArr, createAndUpdateChildWithRefs,
                          function(error, data) {
                    CB(error, data);
                });
                return;
            }
            CB(null);
        }
    ],
    function(error, results) {
        callback(error, results);
    });
}

function createBackReferences (dataObj, callback)
{
    callback(null, null);
}

function createConfigObjectCB (data, appData, callback)
{
    /* Find the reqUrl from first key in data */
    for (var resType in data) {
        break;
    }
    var reqUrl = "/" + resType + "s";
    /* Filter out all children */
    var dataObj = {data: data, parentType: resType, appData: appData,
                   doLookup: false};
    filterChildrenData(dataObj, function(error, data) {
        configApiServer.apiPost(reqUrl, data.filteredData, appData,
                                function(error, configData) {
            if ((null != error) || (null == configData)) {
                callback(error, configData);
                return;
            }
            var configObj = configObjs.configJsonModifyObj;
            var configObjByType = configObj[resType];
            if (null == configObjByType) {
                callback(null, configData);
                return;
            }
            /* Now create all the children */
            async.parallel([
                function(CB) {
                    createChildren({parentType: resType, dataObj: data,
                                    appData: appData}, function(error, data) {
                        CB(error, data);
                    });
                },
                function(CB) {
                    createBackReferences({configData: configData, appData: appData,
                                          dataObj: data}, function(error, data) {
                        CB(error, data);
                    });
                }
            ],
            function(error, data) {
                callback(error, data);
            });
        });
    });
}

function createConfigObject (req, res, appData)
{
    var body = req.body;
    if (null === body) {
        var error = new appErrors.RESTServerError('Invalid POST Data');
        commonUtils.handleJSONResponse(error, res, null);
        return;
    }
    createOrUpdateConfigObject(body, global.HTTP_REQUEST_POST,
                               appData, function(error, results) {
        commonUtils.handleJSONResponse(error, res, results);
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
    createOrUpdateConfigObject(body, global.HTTP_REQUEST_PUT,
                               appData, function(error, results) {
        commonUtils.handleJSONResponse(error, res, results);
    });
}

function attachReferencesToChild (childData, refNames, configData)
{
    var refNamesCnt = refNames.length;
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
            childData[refKey].push(uuid);
        }
    }
    logutils.logger.info("Attched childData as:" + JSON.stringify(childData));
}

function updateReferencesToConfigChildren (childrenData, configRefData,
                                           childObjs)
{
    var refs = {};
    var len = configRefData.length;
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
    logutils.logger.info("getting refObjs as:" + JSON.stringify(refObjs));
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
                    /* Weired...we came here but do not have uuid */
                    logutils.logger.error("UUID is null for key " + key +
                                          " in child data");
                    continue;
                }
                if (null == refObjs[key][uuid]) {
                    logutils.logger.error("UUID not found in refObjs " + key +
                                          " for child data");
                    continue;
                }
                attachReferencesToChild(childrenData[key][i], configRefNames,
                                        refObjs[key][uuid]);
            }
        }
    }
}

function updateChildren (dataObj, callback)
{
    var deltas      = [];
    var uiData      = dataObj.uiData;
    var configData  = dataObj.configData;
    var appData     = dataObj.appData;
    var parentType  = dataObj.parentType;

    var configObj       = configObjs.configJsonModifyObj;
    var configObjByType = configObj[parentType];
    if (null == configObjByType) {
        logutils.logger.debug("We do not have " + parentType + " in UI Schema");
        callback(null, {filteredUIData: {filteredData: uiData},
                 appData: appData});
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
            parentType: parentType
        };
        getUpdateChildDeltaAndUpdate(dataObj, callback);
    });
}

function getUpdateChildDeltaAndUpdate (dataObj, callback)
{
    var deltas              = [];
    var appData             = dataObj.appData;
    var parentType          = dataObj.parentType;
    var filteredUIData      = dataObj.filteredUIData;
    var filteredConfigData  = dataObj.filteredConfigData;

    logutils.logger.info("Getting filteredUIData as:" + JSON.stringify(filteredUIData));
    var clonedUIChildData =
        commonUtils.cloneObj(_.result(filteredUIData, "childrenData", []));
    var clonedConfigChildData =
        commonUtils.cloneObj(_.result(filteredConfigData, "childrenData", []));

    for (var uiChildKey in clonedUIChildData) {
        var arrDiffKey = uiChildKey.substring(0, uiChildKey.length - 1);
        arrDiffKey = arrDiffKey.replace(/_/g, "-");
        var childDelta =
            jsonDiff.getConfigArrayDelta(arrDiffKey,
                                         clonedConfigChildData[uiChildKey],
                                         clonedUIChildData[uiChildKey]);
        delete clonedUIChildData[uiChildKey];
        delete clonedConfigChildData[uiChildKey];
        if (null == childDelta) {
            continue;
        }
        childDelta["uiChildName"] = uiChildKey;
        deltas.push(childDelta);
    }
    for (var configChildKey in clonedConfigChildData) {
        var arrDiffKey = configChildKey.substring(0, configChildKey.length - 1);
        arrDiffKey = arrDiffKey.replace(/_/g, "-");
        var childDelta =
            jsonDiff.getConfigArrayDelta(arrDiffKey,
                                         clonedConfigChildData[uiChildKey],
                                         clonedUIChildData[uiChildKey]);
        if (null == childDelta) {
            continue;
        }
        childDelta["uiChildName"] = configChildKey;
        deltas.push(childDelta);
    }
    logutils.logger.info("Getting Child deltas as:" + JSON.stringify(deltas));
    updateChildrenCB(parentType, deltas, filteredUIData, filteredConfigData,
                     appData, callback);
}

function updateChildrenCB (parentType, deltas, filteredUIData,
                           filteredConfigData, appData, callback)
{
    var deltasCnt = deltas.length;
    var allAddedObjs = {};
    var allDeletedObjs = {};
    for (var i = 0; i < deltasCnt; i++) {
        var addedList = deltas[i].addedList;
        var deletedList = deltas[i].deletedList;
        var childName = deltas[i].uiChildName;
        if (addedList.length > 0) {
            allAddedObjs[childName] = addedList;
        }
        if (deletedList.length > 0) {
            allDeletedObjs[childName] = deletedList;
        }
    }
    /* All ADD happens WRT data from filteredUIData */
    /* All DEL happens WRT data from filteredConfigData */
    var filteredAddData = commonUtils.cloneObj(filteredUIData);
    filteredAddData.childrenData = allAddedObjs;
    var filteredDelData = commonUtils.cloneObj(filteredConfigData);
    filteredDelData.childrenData = allDeletedObjs;
    logutils.logger.info("Getting filteredAddData as:" + JSON.stringify(filteredAddData));
    logutils.logger.info("Getting filteredDelData as:" + JSON.stringify(filteredDelData));
    async.parallel([
        function(CB) {
            deleteChildren({parentType: parentType, dataObj: filteredDelData,
                           appData: appData}, function(error, data) {
                CB(error, data);
            });
        },
        function(CB) {
            createChildren({parentType: parentType, dataObj: filteredAddData,
                           appData: appData}, function(error, data) {
                CB(error, data);
            });
        }
    ],
    function(error, data) {
        callback(error, {data: data, filteredUIData: filteredUIData,
                 filteredConfigData: filteredConfigData, appData: appData});
    });
}

function updateResource (dataObj, callback)
{
    var filteredData = _.result(dataObj, "filteredUIData.filteredData", null);
    logutils.logger.info("Getting filteredData in updateResource() " +
                         JSON.stringify(filteredData));
    for (var parentKey in filteredData) {
        break;
    }
    var appData = _.result(dataObj, "appData", null);
    var uuid = _.result(filteredData, parentKey + ".uuid", null);
    var reqUrl = "/" + parentKey + "/" + uuid;
    jsonDiff.getConfigDiffAndMakeCall(reqUrl, appData, filteredData,
                                      function(error, data) {
        callback(error, data);
    });
}

function updateConfigObjectCB (body, appData, callback)
{
    var error;
    /* Update the children first */
    for (var resType in body) {
        break;
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
            updateResource
        ],
        function(error, data) {
            callback(error, data);
        });
    });
}

function createOrUpdateConfigObject (body, type, appData, callback)
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

function createOrUpdateConfigObjectsCB (dataObjArr, callback)
{
    var reqUrl = dataObjArr['reqUrl'];
    var appData = dataObjArr['appData'];
    var data = dataObjArr['data'];
    var type = dataObjArr['type'];
    if (global.HTTP_REQUEST_PUT == type) {
        configApiServer.apiPut(reqUrl, data, appData, function(error, data) {
            callback(error, data);
        });
    } else {
        configApiServer.apiPost(reqUrl, data, appData, function(error, data) {
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
    createOrUpdateConfigObjects(body, global.HTTP_REQUEST_POST,
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
    createOrUpdateConfigObjects(body, global.HTTP_REQUEST_PUT,
                               appData, function(error, results) {
        commonUtils.handleJSONResponse(error, res, results);
    });
}

function createOrUpdateConfigObjects (body, type, appData, callback)
{
    var dataObjArr = [];
    var data = commonUtils.getValueByJsonPath(body, 'data', [], false);
    var reqCnt = data.length;
    var dataObjArr = [];
    for (var i = 0; i < reqCnt; i++) {
        dataObjArr[i] = {};
        dataObjArr[i]['type'] = type;
        dataObjArr[i]['data'] = data[i]['data'];
        dataObjArr[i]['appData'] = appData;
        dataObjArr[i]['reqUrl'] = data[i]['reqUrl'];
    }
    async.map(dataObjArr, createOrUpdateConfigObjectsCB,
              function(err, results) {
        callback(err, results);
    });
}

exports.getConfigUUIDList = getConfigUUIDList;
exports.deleteMultiObject = deleteMultiObject;
exports.getConfigDetails = getConfigDetails;
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

