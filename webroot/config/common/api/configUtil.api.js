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

var errorData = [];
var configCBDelete = 
{
    'virtual-machine-interface': portsConfig.deletePortsCB
}

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

exports.deleteMultiObject = deleteMultiObject;
exports.getConfigDetails = getConfigDetails;
exports.deleteMultiObjectCB = deleteMultiObjectCB;

