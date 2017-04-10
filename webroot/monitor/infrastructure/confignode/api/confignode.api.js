/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
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
    configApiServer = require(process.mainModule.exports["corePath"] +
            '/src/serverroot/common/configServer.api');

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
    genPostData['kfilt'] = ['*:contrail-api*',
                            '*:contrail-discovery*',
                            '*:contrail-svc-monitor*',
                            '*:contrail-schema*'];
    reqUrl = '/analytics/uves/generator';
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                             genPostData, opApiServer, null, appData);
    reqUrl = '/config-nodes?detail=true';
    commonUtils.createReqObj(dataObjArr, reqUrl, null, null,
                             configApiServer, null, appData);
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(configApiServer, true),
              function(err, results) {
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
    postData['cfilt'] = ['ModuleCpuState','NodeStatus', 'UVEAlarms'];
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                             postData, opApiServer, null, appData);
    reqUrl = '/config-nodes?detail=true';
    commonUtils.createReqObj(dataObjArr, reqUrl, null, null,
                             configApiServer, null, appData);
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
                    resultJSON[i]['value']['ModuleCpuState']
                                    ['config_node_ip'];
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

function parseConfigNodeProcessUVEs (resultJSON, configProcessUVEs, configData,
                                        host)
{
    if(resultJSON['derived-uve'] == null) {
        resultJSON['derived-uve'] = {};
    }
    if ((null != configData) && (configData.length > 0)) {
        var confLen = configData.length;
        for (var i = 0; i < confLen; i++) {
            if (configData[i]['config-node']['fq_name'][1] == host) {
                resultJSON['derived-uve']['ConfigData'] = configData[i]['config-node'];
                break;
            }
        }
    }
    var moduleList = ['contrail-api',
                      'contrail-discovery',
                      'contrail-svc-monitor',
                      'contrail-schema'];
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
            resultJSON['derived-uve'][modInstName] = {};
            resultJSON['derived-uve'][modInstName] =
                commonUtils.copyObject(resultJSON['derived-uve'][modInstName],
                                       cfgProcUVEData[i]['value']);
        } catch(e) {
            continue;
        }
    }
    return resultJSON;
}

function postProcessConfigNodeDetails (uves, host)
{
    var configData = uves[2];
    if ((null == configData) || (null == configData['config-nodes'])) {
        configData = null;
    } else {
        configData = configData['config-nodes'];
    }
    var resultJSON = {};
    resultJSON=
        commonUtils.copyObject(resultJSON, uves[0]);
    resultJSON =
        parseConfigNodeProcessUVEs(resultJSON, uves[1], configData, host)
    return resultJSON;
}

function postProcessConfigNodeSummary (configUVEData)
{
    var uveData    = configUVEData[0];
    var configData = configUVEData[1];
    var genData    = configUVEData[2];
    var tmpConfigObjs = {};

    if ((null == configData) || (null == configData['config-nodes'])) {
        configData = null;
    } else {
        configData = configData['config-nodes'];
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
            parseConfigNodeProcessUVEs(resultJSON[i]['value'], genData,
                                       configData, host);
    }
    if (null == configData) {
        return resultJSON;
    }
    var configLen = configData.length;
    for (var i = 0; i < configLen; i++) {
        tmpConfigObjs[configData[i]['config-node']['fq_name'][1]] =
            configData[i]['config-node'];
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

exports.postProcessConfigNodeSummary = postProcessConfigNodeSummary;
exports.postProcessConfigNodeDetails = postProcessConfigNodeDetails;
exports.getConfigNodesSummary = getConfigNodesSummary;
exports.getConfigNodeDetails = getConfigNodeDetails;
exports.getConfigNodesList = getConfigNodesList;

