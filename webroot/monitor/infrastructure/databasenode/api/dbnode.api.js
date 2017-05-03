/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var rest = require(process.mainModule.exports["corePath"] +
        '/src/serverroot/common/rest.api'),
    async = require('async'),
    commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils'),
    logutils = require(process.mainModule.exports["corePath"] +
                       '/src/serverroot/utils/log.utils'),
    jsonPath = require('JSONPath').eval,
    appErrors = require(process.mainModule.exports["corePath"] +
                        '/src/serverroot/errors/app.errors'),
    adminApiHelper = require('../../../../common/api/adminapi.helper'),
    urlMod = require('url'),
    nwMonUtils = require('../../../../common/api/nwMon.utils'),
    opApiServer = require(process.mainModule.exports["corePath"] +
            '/src/serverroot/common/opServer.api'),
    infraCmn = require('../../../../common/api/infra.common.api'),
    qeUtils = require(process.mainModule.exports["corePath"] +
                      "/webroot/reports/qe/api/query.utils"),
    ctrlGlobal = require('../../../../common/api/global'),
    configApiServer = require(process.mainModule.exports["corePath"] +
            '/src/serverroot/common/configServer.api');

function getDatabaseNodesList (req, res, appData)
{
    var url = '/analytics/uves/database-nodes';
    var errResponse = {};

    infraCmn.getUVEByUrlAndSendData(url, errResponse, res, appData);
}

function getDatabaseNodeDetails (req, res, appData)
{
    var hostName = req.param('hostname');
    var errResponse = {};
    var urlLists = [];
    var resultJSON = {};
    var dataObjArr = [];
    var excludeProcessList = [];
    reqUrl = '/analytics/uves/database-node/' + hostName + '?flat';
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                             null, opApiServer, null, appData);
    reqUrl = '/database-nodes?detail=true';
    commonUtils.createReqObj(dataObjArr, reqUrl, null, null,
                             configApiServer, null, appData);
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(opApiServer, true),
              function(err, results) {
        if (err) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        resultJSON = postProcessDatabaseNodeDetails(results, hostName);
        commonUtils.handleJSONResponse(err, res, resultJSON);
    });
}

function getDatabaseNodesSummary (req, res, appData)
{
    var nodesHostIp = {'hosts': {}, 'ips': {}};
    var addGen = req.param('addGen');
    var dataObjArr = [];

    var reqUrl = '/analytics/uves/database-node';
    var postData = {};
//    postData['cfilt'] = ['NodeStatus'];
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                             postData, opApiServer, null, appData);
    reqUrl = '/database-nodes?detail=true';
    commonUtils.createReqObj(dataObjArr, reqUrl, null, null,
                             configApiServer, null, appData);

    var resultJSON = [];

    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(opApiServer, true),
              function(err, results) {
        resultJSON = postProcessDatabaseNodeSummary(results);
        var nodeCnt = 0;
        try {
            nodeCnt = resultJSON.length;
        } catch(e) {
            nodeCnt = 0;
        }

        commonUtils.handleJSONResponse(err, res, resultJSON);
    });
}

function parseDatabaseNodeProcessUVEs (resultJSON, databaseProcessUVEs,
                                        configData, host)
{
    if(resultJSON['derived-uve'] == null) {
        resultJSON['derived-uve'] = {};
    }
    if ((null != configData) && (configData.length > 0)) {
        var confLen = configData.length;
        for (var i = 0; i < confLen; i++) {
            if (configData[i]['database-node']['fq_name'][1] == host) {
                resultJSON['derived-uve']['ConfigData'] = configData[i]['database-node'];
                break;
            }
        }
    }
    var moduleList = [];//TODO no process to be excluded
    try {
        var dbUVEData = databaseProcessUVEs['value'];
        var dbUVEDataLen = dbUVEData.length;
    } catch(e) {
        return resultJSON;
    }
    for (var i = 0; i < dbUVEDataLen; i++) {
        if (false == infraCmn.modExistInGenList(moduleList, host,
                                                dbUVEData[i]['name'])) {
            continue;
        }
        try {
            var modInstName =
                infraCmn.getModInstName(dbUVEData[i]['name']);
            if (null == modInstName) {
                continue;
            }
            resultJSON['derived-uve'][modInstName] = {};
            resultJSON['derived-uve'][modInstName] =
                commonUtils.copyObject(resultJSON['derived-uve'][modInstName],
                                       dbUVEData[i]['value']);
        } catch(e) {
            continue;
        }
    }
    return resultJSON;
}

function postProcessDatabaseNodeDetails (uves, host)
{
    var configData = uves[1];
    if ((null == configData) || (null == configData['database-nodes'])) {
        configData = null;
    } else {
        configData = configData['database-nodes'];
    }
    var resultJSON = {};
    resultJSON =
        commonUtils.copyObject(resultJSON, uves[0]);
    resultJSON = parseDatabaseNodeProcessUVEs(resultJSON, uves[0], configData, host)
    return resultJSON;
}

function postProcessDatabaseNodeSummary (dbUVEData)
{
    var uveData    = dbUVEData[0];
    var configData = dbUVEData[1];
    var tmpConfigObjs = {};

    if ((null == configData) || (null == configData['database-nodes'])) {
        configData = null;
    } else {
        configData = configData['database-nodes'];
    }
    var uveLen = 0;
    if ((null == uveData) || (null == uveData['value'])) {
        uveData = null;
    } else {
        uveData = uveData['value'];
        uveLen = uveData.length;
    }

    var resultJSON = [];
    for (var i = 0; i < uveLen; i++) {
        var host = uveData[i]['name'];
        resultJSON[i] = {};
        resultJSON[i]['name'] = host;
        resultJSON[i]['value'] = {};
        resultJSON[i]['value'] =
            commonUtils.copyObject(resultJSON[i]['value'],
                    uveData[i]['value']);
        resultJSON[i]['value'] =
            parseDatabaseNodeProcessUVEs(resultJSON[i]['value'], uveData,
                    configData, host);
    }
    if (null == configData) {
        return resultJSON;
    }
    var configLen = configData.length;
    for (var i = 0; i < configLen; i++) {
        tmpConfigObjs[configData[i]['database-node']['fq_name'][1]] =
                                            configData[i]['database-node'];
    }
    var resCnt = resultJSON.length;
    for (i = 0; i < resCnt; i++) {
        if (null != tmpConfigObjs[resultJSON[i]['name']]) {
            delete tmpConfigObjs[resultJSON[i]['name']];
        }
    }
    for (key in tmpConfigObjs) {

        resultJSON.push({
                name:key,
                value: {
                    ConfigData : tmpConfigObjs[key]
                }
        });
    }
    return resultJSON;
}

function getDBNodeStatsFlowSeries (req, res, appData)
{
    var resultJSON = {'summary': {}, 'flow-series': []};
    var timeObj = {};
    var source = req.param('source');
    var dataObjArr = [];
    var appData = {
        'startTime': req.param('startTime'),
        'endTime': req.param('endTime'),
        'minsSince': req.param('minsSince')
    };

    var timeObj = qeUtils.createTimeQueryJsonObjByAppData(appData);
    var queryJSON =
        commonUtils.cloneObj(ctrlGlobal.QUERY_JSON[
            'StatTable.DatabaseUsageInfo.database_usage'
            ]);
    queryJSON['where'][0][0]['value'] = source;
    queryJSON['start_time'] = timeObj['start_time'];
    queryJSON['end_time'] = timeObj['end_time'];
    var url = '/analytics/query';
    commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST,
                             queryJSON, null, null, null);
    logutils.logger.debug("Executing DB Node Stats Query:",
                          JSON.stringify(queryJSON) + "at:" + new Date());
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(opApiServer, true),
              function(err, results) {
        if ((null == results[0]) || (null == results[0]['value'])) {
            commonUtils.handleJSONResponse(null, res, resultJSON);
            return;
        }
        logutils.logger.debug("DB Node Stats Query completed at:" + new Date());
        resultJSON['flow-series'] = results[0]['value'];
        resultJSON['summary']['start_time'] = timeObj['start_time'];
        resultJSON['summary']['end_time'] = timeObj['end_time'];
        commonUtils.handleJSONResponse(null, res, resultJSON);
    });
}

function getDBUsage (req, res, appData) {
    var url = '/analytics/uves/database-node/*';
    opApiServer.apiGet(url, appData, function (error, resultJSON) {
        if(!error) {
            var resultsArray = resultJSON['value'],
                responseJSON = [];

            for(var i = 0; resultsArray != null && i < resultsArray.length; i++) {
                var analyticsDBStats = {},
                    dbUsageInfo = resultsArray[i]['value']['DatabaseUsageInfo'],
                    key;

                analyticsDBStats['name'] = resultsArray[i]['name'];

                if(dbUsageInfo != null) {
                   for(key in dbUsageInfo) {
                       analyticsDBStats[key] = dbUsageInfo[key];
                   }
                }

                responseJSON.push(analyticsDBStats);
            }
            commonUtils.handleJSONResponse(null, res, responseJSON);
        } else {
            logutils.logger.error(error.stack);
            commonUtils.handleJSONResponse(error, res, null);
        }
    });
}

function purgeDB (req, res, appData) {
    var url = '/analytics/operation/database-purge',
        purgeInputStr = req.param('purge_input'),
        purgeInput, postData;

    try {
        purgeInput = parseInt(purgeInputStr);
        postData = {
            purge_input: purgeInput
        };

        opApiServer.apiPost(url, postData, appData, function (error, responseJSON) {
            if(!error) {
                commonUtils.handleJSONResponse(null, res, responseJSON);
            } else {
                logutils.logger.error(error.stack);
                commonUtils.handleJSONResponse(error, res, null);
            }
        });
    } catch (error) {
        logutils.logger.error(error.stack);
        commonUtils.handleJSONResponse({"status": "error", "message": "Invalid input for purge."}, res, null);
    }
}

exports.postProcessDatabaseNodeSummary = postProcessDatabaseNodeSummary;
exports.postProcessDatabaseNodeDetails = postProcessDatabaseNodeDetails;
exports.getDatabaseNodesSummary = getDatabaseNodesSummary;
exports.getDatabaseNodeDetails = getDatabaseNodeDetails;
exports.getDatabaseNodesList = getDatabaseNodesList;
exports.getDBNodeStatsFlowSeries = getDBNodeStatsFlowSeries;
exports.getDBUsage = getDBUsage;
exports.purgeDB = purgeDB;
