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
    opApiServer.apiGet('/analytics/alarms', appData, function(err, result) {
        commonUtils.handleJSONResponse(err, res, result);
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
