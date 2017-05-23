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


function createOrUpdateConfigObjectCB (dataObjArr, callback)
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

function createOrUpdateConfigObject (body, type, appData, callback)
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
    async.map(dataObjArr, createOrUpdateConfigObjectCB,
              function(err, results) {
        callback(err, results);
    });
}


exports.getConfigUUIDList = getConfigUUIDList;
exports.deleteMultiObject = deleteMultiObject;
exports.getConfigDetails = getConfigDetails;
exports.createConfigObject = createConfigObject;
exports.updateConfigObject = updateConfigObject;
exports.getConfigList = getConfigList;
exports.getConfigObjects = getConfigObjects;
exports.deleteMultiObjectCB = deleteMultiObjectCB;
exports.deleteConfigObj = deleteConfigObj;
exports.deleteConfigObjCB = deleteConfigObjCB;
exports.getConfigPaginatedResponse = getConfigPaginatedResponse;
exports.getUUIDByFQN = getUUIDByFQN;

