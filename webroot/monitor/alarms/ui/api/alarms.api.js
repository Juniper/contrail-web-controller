/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var cacheApi = require(process.mainModule.exports["corePath"] + '/src/serverroot/web/core/cache.api'),
    global   = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/global'),
    messages = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/messages'),
    commonUtils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/common.utils'),
    config = process.mainModule.exports["config"],
    rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api'),
    async = require('async'),
    jsonPath = require('JSONPath').eval,
    opApiServer = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/opServer.api'),
    configApiServer = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/configServer.api'),
    logutils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/log.utils'),
    ctrlGlobal = require('../../../../common/api/global'),
    appErrors = require(process.mainModule.exports["corePath"] + '/src/serverroot/errors/app.errors'),
    assert = require('assert'),
    authApi = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/auth.api');

function getAlarms(req, res, appData)
{
    opApiServer.apiGet('/analytics/alarms', appData, function(err, alarmLst) {
        var alarmLstLen = alarmLst.length;
        var alarmObjArry = [];
        if(err || alarmLstLen == 0) {
            commonUtils.handleJSONResponse(err, res, null);
        }
        for(var i = 0; i < alarmLstLen; i++) {
            var name = alarmLst[i].name;
            var alarmSubStr = name.substr(0, name.length - 1);
            var alarmUrl = '/analytics/alarms/' + alarmSubStr + '/*';
            commonUtils.createReqObj(alarmObjArry, alarmUrl, global.HTTP_REQUEST_DELETE,
                                        null, opApiServer, null, appData);
        }
        async.mapLimit(alarmObjArry, global.ASYNC_MAP_LIMIT_COUNT, getAlarmsAsync, function(error, result) {
            commonUtils.handleJSONResponse(error, res, result);
        });
    });
}

function getAlarmsAsync(dataObj, callback)
{
    var url = dataObj.reqUrl;
    var appData = dataObj.appData;
    opApiServer.apiGet(url, appData, function(err, alarmDetLst){
        callback(err, alarmDetLst);
    });
}

exports.getAlarms = getAlarms;