/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
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

function getConfigNodesList (req, res, appData)
{
    var url = '/analytics/uves/config-nodes';
    var errResponse = {};

    infraCmn.getUVEByUrlAndSendData(url, errResponse, res, appData);
}

function getConfigNodeDetails (req, res, appData)
{
    var hostName = req.param('hostname');
    var errResponse = {};
    var urlLists = [];
    var resultJSON = {};
    var dataObjArr = [];
    var excludeProcessList = ['contrail-discovery','contrail-svc-monitor','contrail-schema'];
    var genPostData = {};
    reqUrl = '/analytics/uves/config-node/' + hostName + '?flat';
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                             null, opApiServer, null, appData);
    genPostData['kfilt'] = ['*:contrail-api*','*:contrail-discovery*','*:contrail-svc-monitor*','*:contrail-schema*'];
    reqUrl = '/analytics/uves/generator';
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                             genPostData, opApiServer, null, appData);
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(configApiServer, false),
              function(err, results) {
        if (err || (results[0]['ModuleCpuState'] == null)) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        resultJSON = postProcessConfigNodeDetails(results, hostName);
        resultJSON = 
            infraCmn.filterOutGeneratorInfoFromGenerators(excludeProcessList, 
                                                          resultJSON);
        commonUtils.handleJSONResponse(err, res, resultJSON);
    });
}

function getConfigNodesSummary (req, res, appData)
{
    var nodesHostIp = {'hosts': {}, 'ips': {}};
    var addGen = req.param('addGen');
    var dataObjArr = [];

    var reqUrl = '/analytics/uves/config-node';
    var postData = {};
    postData['cfilt'] = ['ModuleCpuState','NodeStatus'];
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                             postData, opApiServer, null, appData);
    if (null != addGen) {
        reqUrl = '/analytics/uves/generator';
        var genPostData = {};
        genPostData['kfilt'] = ['*:contrail-api*'];
        genPostData['cfilt'] = ['ModuleClientState:client_info',
                                'ModuleServerState:generator_info'];
        commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                                 genPostData, opApiServer, null, appData);
    }

    var resultJSON = [];

    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(opApiServer, true),
              function(err, results) {
        if (err || (results[0] == null) ||
            (results[0]['value'].length == 0)) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        resultJSON = postProcessConfigNodeSummary(results);
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
                    resultJSON[i]['value']['configNode']['ModuleCpuState']['config_node_ip'];
                nodeIpsCnt = nodeIps.length;
            } catch(e) {
                logutils.logger.error("Config UVE IP parse error: " + e);
                nodeIpsCnt = 0;
            }
            for (var j = 0; j < nodeIpsCnt; j++) {
                nodesHostIp['ips'][nodeIps[j]] = [];
            }
        }
        if (nodeCnt > 0) {
            infraCmn.saveNodesHostIPToRedis(nodesHostIp,
                                            global.label.API_SERVER,
                                            function(err) {
            });
        }
        commonUtils.handleJSONResponse(err, res, resultJSON);
    });
}

function parseConfigNodeProcessUVEs (resultJSON, configProcessUVEs, host)
{
    var moduleList = ['contrail-api', 'contrail-discovery', 'contrail-svc-monitor', 'contrail-schema'];
    try {
        var cfgProcUVEData = configProcessUVEs['value'];
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

function postProcessConfigNodeDetails (uves, host)
{
    var resultJSON = {};
    resultJSON['configNode'] = {};
    resultJSON['configNode'] =
        commonUtils.copyObject(resultJSON['configNode'], uves[0]);
    resultJSON = parseConfigNodeProcessUVEs(resultJSON, uves[1], host)
    return resultJSON;
}

function postProcessConfigNodeSummary (uves)
{
    var resultJSON = [];
    var configData = uves[0]['value'];
    var configDataLen = configData.length;
    for (var i = 0; i < configDataLen; i++) {
        var host = configData[i]['name'];
        resultJSON[i] = {};
        resultJSON[i]['name'] = host;
        resultJSON[i]['value'] = {};
        resultJSON[i]['value']['configNode'] = {};
        resultJSON[i]['value']['configNode'] =
            commonUtils.copyObject(resultJSON[i]['value']['configNode'],
                       configData[i]['value']);
        resultJSON[i]['value'] =
            parseConfigNodeProcessUVEs(resultJSON[i]['value'], uves[1],
                                       host);
    }
    return resultJSON;
}

exports.postProcessConfigNodeSummary = postProcessConfigNodeSummary;
exports.postProcessConfigNodeDetails = postProcessConfigNodeDetails;
exports.getConfigNodesSummary = getConfigNodesSummary;
exports.getConfigNodeDetails = getConfigNodeDetails;
exports.getConfigNodesList = getConfigNodesList;

