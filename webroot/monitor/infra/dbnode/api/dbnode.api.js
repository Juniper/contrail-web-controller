/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api'),
    config = process.mainModule.exports["config"],
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
    opApiServer = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/opServer.api'),
    infraCmn = require('../../../../common/api/infra.common.api'),
    configApiServer = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/configServer.api');

opServer = rest.getAPIServer({apiName:global.label.OPS_API_SERVER,
                             server:config.analytics.server_ip,
                             port:config.analytics.server_port });

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
    var genPostData = {};
    reqUrl = '/analytics/uves/database-node/' + hostName + '?flat';
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                             null, opApiServer, null, appData);
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(opApiServer, true),
              function(err, results) {
        if (err) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        console.log('got result:' + JSON.stringify(results));
        resultJSON = postProcessDatabaseNodeDetails(results, hostName);
        commonUtils.handleJSONResponse(err, res, resultJSON);
    });
}

function getDatabaseNodesSummary (req, res, appData)
{
    console.log('inside getDatabaseNodesSummary');
    var nodesHostIp = {'hosts': {}, 'ips': {}};
    var addGen = req.param('addGen');
    var dataObjArr = [];

    var reqUrl = '/analytics/uves/database-node';
    var postData = {};
    postData['cfilt'] = ['DatabaseUsageInfo','NodeStatus'];
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                             postData, opApiServer, null, appData);
    
    var resultJSON = [];

    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(opApiServer, true),
              function(err, results) {
        if (err || (results[0] == null) ||
            (results[0]['value'].length == 0)) {
            console.log('getDatabaseNodesSummary - Got error for ajax req');
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        resultJSON = postProcessDatabaseNodeSummary(results);
        var nodeCnt = 0;
        try {
            nodeCnt = resultJSON.length;
        } catch(e) {
            nodeCnt = 0;
        }
        for (var i = 0; i < nodeCnt; i++) {
            try {
                nodesHostIp['hosts'][resultJSON[i]['name']] = [];
            } catch(e) {
            }
            var nodeIpsCnt = 0;
            try {
                var nodeIps =
                    resultJSON[i]['value']['databaseNode']['ModuleCpuState']['database_node_ip'];
                nodeIpsCnt = nodeIps.length;
            } catch(e) {
                logutils.logger.error("Database UVE IP parse error: " + e);
                nodeIpsCnt = 0;
            }
            for (var j = 0; j < nodeIpsCnt; j++) {
                nodesHostIp['ips'][nodeIps[j]] = [];
            }
        }
       
        commonUtils.handleJSONResponse(err, res, resultJSON);
    });
}

function parseDatabaseNodeProcessUVEs (resultJSON, databaseProcessUVEs, host)
{
    var moduleList = [];//TODO no process to be excluded
    try {
        var cfgProcUVEData = databaseProcessUVEs['value'];
        var cfgProcUVEDataLen = cfgProcUVEData.length;
    } catch(e) {
        return resultJSON;
    }
    for (var i = 0; i < cfgProcUVEDataLen; i++) {
        if (false == infraCmn.modExistInGenList(moduleList, host,
                                                cfgProcUVEData[i]['name'])) {
            continue;
        }
        try {
            var modInstName =
                infraCmn.getModInstName(cfgProcUVEData[i]['name']);
            if (null == modInstName) {
                continue;
            }
            resultJSON[modInstName] = {};
            resultJSON[modInstName] =
                commonUtils.copyObject(resultJSON[modInstName],
                                       cfgProcUVEData[i]['value']);
        } catch(e) {
            continue;
        }
    }
    return resultJSON;
}

function postProcessDatabaseNodeDetails (uves, host)
{
    var resultJSON = {};
    resultJSON['databaseNode'] = {};
    resultJSON['databaseNode'] =
        commonUtils.copyObject(resultJSON['databaseNode'], uves[0]);
    resultJSON = parseDatabaseNodeProcessUVEs(resultJSON, uves[1], host)
    return resultJSON;
}

function postProcessDatabaseNodeSummary (uves)
{
    var resultJSON = [];
    var databaseData = uves[0]['value'];
    var databaseDataLen = databaseData.length;
    for (var i = 0; i < databaseDataLen; i++) {
        var host = databaseData[i]['name'];
        resultJSON[i] = {};
        resultJSON[i]['name'] = host;
        resultJSON[i]['value'] = {};
        resultJSON[i]['value']['databaseNode'] = {};
        resultJSON[i]['value']['databaseNode'] =
            commonUtils.copyObject(resultJSON[i]['value']['databaseNode'],
                       databaseData[i]['value']);
        resultJSON[i]['value'] =
            parseDatabaseNodeProcessUVEs(resultJSON[i]['value'], uves[1],
                                       host);
    }
    return resultJSON;
}

exports.postProcessDatabaseNodeSummary = postProcessDatabaseNodeSummary;
exports.postProcessDatabaseNodeDetails = postProcessDatabaseNodeDetails;
exports.getDatabaseNodesSummary = getDatabaseNodesSummary;
exports.getDatabaseNodeDetails = getDatabaseNodeDetails;
exports.getDatabaseNodesList = getDatabaseNodesList;

