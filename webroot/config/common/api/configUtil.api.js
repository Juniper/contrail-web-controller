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

var portsConfig = require('../../ports/api/portsconfig.api'),
    logutils = require(process.mainModule.exports["corePath"] +
                       '/src/serverroot/utils/log.utils'),
    appErrors = require(process.mainModule.exports["corePath"] +
                        '/src/serverroot/errors/app.errors'),
    commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils'),
    configApiServer = require(process.mainModule.exports["corePath"] +
                              '/src/serverroot/common/configServer.api');
var vnConfig = require('../../vn/api/vnconfig.api');
var nwIpam = require('../../ipaddressmanagement/api/ipamconfig.api');

var errorData = [];
var configCBDelete = 
{
    'virtual-machine-interface': portsConfig.deletePortsCB
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
        dataObj[i] = [];
        for (var j = 0; j < deleteUUIDsLength ; j++) {
            dataObj[i][j] = {};
            dataObj[i][j]['uuid'] = deleteUUIDs[j];
            dataObj[i][j]['type'] = postBody[i].type;
            dataObj[i][j]['request'] = request;
            dataObj[i][j]['appData'] = appData;
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

function getConfigDetailsAsync (dataObj, callback)
{
    var appData = dataObj['appData'];
    var url = '/' + dataObj['type'] +'' + '?detail=true';
    if (null != dataObj['fields']) {
        url += '&fields=' + dataObj['fields'];
    }
    if (null != dataObj['parent_uuid']) {
        url += '&parent_uuid=' + dataObj['parent_uuid'];
    }
    configApiServer.apiGet(url, appData, function(err, data) {
        callback(err, data);
    });
}

function getConfigDetails (req, res, appData)
{
    var dataObjArr = [];
    var postData = req.body;
    postData = postData['data'];
    var reqCnt = postData.length;
    for (var i = 0; i < reqCnt; i++) {
        var fields = postData[i]['fields'];
        dataObjArr[i] = {};
        dataObjArr[i]['type'] = postData[i]['type'];
        dataObjArr[i]['appData'] = appData;
        if ((null != fields) && (fields.length > 0)) {
            dataObjArr[i]['fields'] = fields.join(',');
        }
        if (null != postData[i]['parent_uuid']) {
            dataObjArr[i]['parent_uuid'] = postData[i]['parent_uuid'];
        }
    }
    async.map(dataObjArr, getConfigDetailsAsync, function(err, results) {
        commonUtils.handleJSONResponse(err, res, results);
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
    var uuid        = req.param('uuid');
    var configField = req.param('configField');
    var resultJSON = [];

    var configUrl = '/' + type + '/' + uuid;
    configApiServer.apiGet(configUrl, appData, function(err, configData) {
        if ((null != err) || (null == configData) ||
            (null == configData[type])) {
            commonUtils.handleJSONResponse(err, res, null);
            return;
        }
        configData = configData[type][configField];
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
    var appData = configReqObj['appdata'];
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

exports.getConfigUUIDList = getConfigUUIDList;
exports.deleteMultiObject = deleteMultiObject;
exports.getConfigDetails = getConfigDetails;
exports.deleteMultiObjectCB = deleteMultiObjectCB;
exports.deleteConfigObj = deleteConfigObj;
exports.deleteConfigObjCB = deleteConfigObjCB;
exports.getConfigPaginatedResponse = getConfigPaginatedResponse;

