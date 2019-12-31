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
    contrailService = require(process.mainModule.exports["corePath"] +
            '/src/serverroot/common/contrailservice.api'),
    configApiServer = require(process.mainModule.exports["corePath"] +
            '/src/serverroot/common/configServer.api');

function postProcessAndAddQueryStats (collUVEData, genUVEData, configData,
                                      appData, isSummaryReq, callback)
{
    var nodesHostIp = {'hosts': {}, 'ips': {}};
    var resultJSON =
        postProcessAnalyticsNodeSummaryJSON(collUVEData, genUVEData,
                                            configData);
    var statQueryCB = null;
    if (isSummaryReq) {
        statQueryCB = addAnalyticsQueryStatsToSummary;
    } else {
        statQueryCB = addAnalyticsQueryStatsToDetails;
    }
    statQueryCB(resultJSON, appData, function(data) {
        if (false == isSummaryReq) {
            callback(null, data);
            return;
        }
        var nodeCnt = 0;
        try {
            nodeCnt = data.length;
        } catch(e) {
            nodeCnt = 0;
        }
        for (var i = 0; i < nodeCnt; i++) {
            nodesHostIp['hosts'][data[i]['name']] = [];
            var ipsCnt = 0;
            try {
                var ips = data[i]['value']['CollectorState']['self_ip_list'];
                ipsCnt = ips.length;
            } catch(e) {
                logutils.logger.error("Analytics Node UVE IP Parse error:" +
                                      e);
                ipsCnt = 0;
            }
            for (var j = 0; j < ipsCnt; j++) {
                nodesHostIp['ips'][ips[j]] = [];
            }
        }
        if (nodeCnt > 0) {
            infraCmn.saveNodesHostIPToRedis(nodesHostIp,
                                            global.label.OPS_API_SERVER,
                                            function(err) {
                                            });
        }
        callback(null, data);
    });
}

function getAnalyticsNodeSummary (req, res, appData)
{
    var addGen = req.param('addGen');
    var resultJSON = [];
    var dataObjArr = [];

    var reqUrl = '/analytics/uves/analytics-node';
    var collPostData = {};
    collPostData['cfilt'] = ['ModuleCpuState', 'CollectorState:self_ip_list',
        'CollectorState:build_info', 'CollectorState:tx_socket_stats',
        'CollectorState:rx_socket_stats','NodeStatus', 'UVEAlarms'];
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                             collPostData, opApiServer, null, appData);
    reqUrl = '/analytics-nodes';
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                             null, configApiServer, null, appData);
    if (null != addGen) {
        reqUrl = '/analytics/uves/generator';
        var postData = {};
        postData['kfilt'] = ['*:contrail-collector*',
                             '*:contrail-analytics-api*',
                             '*:contrail-query-engine*'];
        postData['cfilt'] = ['ModuleClientState:client_info',
                             'ModuleServerState:generator_info'];
        commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                                 postData, opApiServer, null, appData);
    }
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(opApiServer, true),
              function(err, results) {
        processConfigDetailsAndAddQueryStats(results[0], results[2], results[1],
                                             appData, true,
                                             function(err, data) {
            commonUtils.handleJSONResponse(err, res, data);
        });
    });
}

function processConfigDetailsAndAddQueryStats (collUVEData, genData, configList,
                                               appData, isSummaryReq, callback)
{
    if ((null == configList) || (null == configList['analytics-nodes']) ||
        (!configList['analytics-nodes'].length)) {
        postProcessAndAddQueryStats(collUVEData, genData, null, appData,
                                    isSummaryReq, function(err, data) {
                callback(err, data);
                });
    } else {
        var configCnt = configList['analytics-nodes'].length;
        dataObjArr = [];
        for (var i = 0; i < configCnt; i++) {
            reqUrl = '/analytics-node/' +
                configList['analytics-nodes'][i]['uuid'];
            commonUtils.createReqObj(dataObjArr, reqUrl,
                                     global.HTTP_REQUEST_GET, null,
                                     configApiServer, null, appData);
        }
        async.map(dataObjArr,
                  commonUtils.getServerResponseByRestApi(configApiServer,
                                                         true),
                  function(err, configDetails) {
            postProcessAndAddQueryStats(collUVEData, genData,
                                        configDetails, appData, isSummaryReq,
                                        function(err, data) {
                callback(err, data);
            });
        });
    }
}

function getAnalyticsNodeGenerators (req, res, appData)
{
    var resultJSON = [];
    var ip = req.param('ip');
    var hostName = req.param('hostname');
    var url = '/analytics/uves/generator/*';

    var count = req.param('count');
    var lastKey = req.param('lastKey');
    getAnalyticsGenPagedSummary(req, res, appData);
}

function processAnalyticsNodeDetailJSON (hostName, genUVEData, appData, callback)
{
    var data = null;
    var resultJSON = [];
    var lastIndex = 0;
    var reqUrl = '/analytics/uves/analytics-node/' + hostName + '?flat';
    var dataObjArr = [];
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                             null, opApiServer, null, appData);
    reqUrl = '/analytics-nodes';
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                             null, configApiServer, null, appData);
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(opApiServer, true),
              function(err, results) {
    var collUVEData = results[0];
    var configData = results[1];
        var collData = {};
        collData['value'] = [];
        collData['value'][0] = {};
        collData['value'][0]['name'] = hostName;
        collData['value'][0]['value'] = collUVEData;
        processConfigDetailsAndAddQueryStats(collData, genUVEData, configData,
                                             appData, false,
                                             function(err, resultJSON) {
            var result;
            try {
                result = resultJSON[0][0]['value'];
            } catch(e) {
                result = {};
            }
            callback(result);
        });
    });
}

function addAnalyticsQueryStatsToSummary (data, appData, callback)
{
    processAnalyticsQueryStats(data, appData, 0, function(err, result) {
        callback(result);
    });
}

function addAnalyticsQueryStatsToDetails(data, appData, callback)
{
    var result = [];
    result[0] = {};
    result[0] = data;
    processAnalyticsQueryStats(result, appData, 1, function(err, result) {
        callback(result);
    });
}

function fillAnalyticsConfigData (anaData, configData)
{
    var nodeName = anaData['name'];
    var configCnt = 0;
    try {
        configCnt = configData.length;
    } catch(e) {
        configCnt = 0;
    }
    if(anaData['value']['derived-uve'] == null) {
        anaData['value']['derived-uve'] = {};
    }
    anaData['value']['derived-uve']['ConfigData'] = {};
    for (var i = 0; i < configCnt; i++) {
        if ((null != configData[i]) &&
            (null != configData[i]['analytics-node']) &&
            (null != configData[i]['analytics-node']['fq_name']) &&
            (nodeName == configData[i]['analytics-node']['fq_name'][1])) {
            anaData['value']['derived-uve']['ConfigData'] =
                commonUtils.cloneObj(configData[i]);
            break;
        }
    }
    return anaData;
}

function postProcessAnalyticsNodeSummaryJSON (collUVEData, genUVEData,
                                              configData)
{
    var moduleNames = ['contrail-query-engine',
                       'contrail-analytics-api', 'contrail-collector'];
    var modCnt = moduleNames.length;
    var modHost = null;
    var resultJSON = [];
    var result = [];
    var lastIndex = 0;
    var collDataLen = 0;
    var genDataLen = 0;
    var tmpConfigObjs = {};
    try {
        try {
            var genData = genUVEData['value'];
            var genDataLen = genData.length;
        } catch(e) {
                genDataLen = 0;
        }
        try {
            var collData = collUVEData['value'];
            var collDataLen = collData.length;
        } catch(e) {
            collDataLen = 0;
        }
        for (var i = 0, l = 0; i < collDataLen; i++) {
          try {
            resultJSON[lastIndex] = {};
            resultJSON[lastIndex]['name'] = collData[i]['name'];
            resultJSON[lastIndex]['value'] = {};
            if(resultJSON[lastIndex]['value']['derived-uve']) {
                resultJSON[lastIndex]['value']['derived-uve'] = {};
            }
            resultJSON[lastIndex]['value'] =
                commonUtils.copyObject(resultJSON[lastIndex]['value'],
                                       collData[i]['value']);
                resultJSON[lastIndex] =
                    fillAnalyticsConfigData(resultJSON[lastIndex],
                                            configData);
            for (var j = 0; j < genDataLen; j++) {
                try {
                    if (false ==
                        infraCmn.modExistInGenList(moduleNames,
                                                   collData[i]['name'],
                                                   genData[j]['name'])) {
                        continue;
                    }
                    var genName = genData[j]['name'];
                    var pos = genName.indexOf(':');
                    mod = genName.slice(pos + 1);
                    resultJSON[lastIndex]['value']['derived-uve'][mod] = {};
                    resultJSON[lastIndex]['value']['derived-uve'][mod] =
                        commonUtils.copyObject(resultJSON[lastIndex]['value']['derived-uve'][mod],
                                               genData[j]['value']);
                } catch (e) {
                    continue;
                }
            }
            lastIndex++;
          } catch(e) {
              continue;
          }
        }
        var configLen = configData.length;
        //Building a hashmap of nodename and configData
        for (var i = 0; i < configLen; i++) {
            tmpConfigObjs[configData[i]['analytics-node']['fq_name'][1]] =
                configData[i]['analytics-node'];
        }
        var resCnt = resultJSON.length;
        //Looping through UVE nodes
        for (i = 0; i < resCnt; i++) {
            if (null != tmpConfigObjs[resultJSON[i]['name']]) {
                delete tmpConfigObjs[resultJSON[i]['name']];
            }
        }
        //Adding nodes which have only configData
        for (key in tmpConfigObjs) {
            resultJSON.push({
                name: key,
                value: {
                    ConfigData: tmpConfigObjs[key]
                }
            });
        }
    } catch(e) {
        logutils.logger.error("In postProcessAnalyticsNodeSummaryJSON: " +
                              "JSON Parse error:" + e);
    }
    return resultJSON;
}

function getAnalyticsNodeDetails (req, res, appData)
{
    var hostName = req.param('hostname');
    var resultJSON = {};
    var url = '/analytics/uves/generator';
    var excludeProcessList = ['contrail-query-engine'];

    var postData = {};
    postData['kfilt'] = [hostName + ':*contrail-collector*',
                         hostName + ':*contrail-analytics-api*',
                         hostName + ':*contrail-query-engine*'];
    opApiServer.apiPost(url, postData, appData, function(err, genData) {
        if (err || (null == genData)) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
        } else {
            processAnalyticsNodeDetailJSON(hostName, genData, appData,
                                           function(resultJSON) {
                resultJSON =
                    infraCmn.filterOutGeneratorInfoFromGenerators(excludeProcessList,
                                                                  resultJSON);
                commonUtils.handleJSONResponse(null, res, resultJSON);
            });
        }
    });
}

function getAnalyticsNodeList (req, res, appData)
{
    var url = '/analytics/uves/analytics-nodes';

    opApiServer.apiGet(url, appData, function(err, data) {
        if (err || (null == data)) {
            commonUtils.handleJSONResponse(err, res, []);
        } else {
            commonUtils.handleJSONResponse(null, res, data);
        }
    });
}

function parseCollectorNodeUVEData (uve)
{
    var lastIndex = 0;
    var result = {};

    result['source'] = uve[1];
    result['value'] = [];
    try {
        commonUtils.createJSONByUVEResponseArr(result['value'],
                               uve[0]['list']['GeneratorSummaryInfo'],
                               lastIndex);
    } catch(e) {
    }
    return result;
}

function fillHostDetailsToAnalyticsQueryStatsUVE (collUVE, qStats, ipList,
                                                  details)
{
    var result = {};
    var ipCnt = ipList.length;
    var uveCnt = collUVE.length;

    for (var i = 0; i < ipCnt; i++) {
        for (var j = 0; j < uveCnt; j++) {
            try {
                ip = jsonPath(collUVE[j], "$..self_ip_list");
                if (ip[0][0] == ipList[i][0]) {
                    if (details) {
                        if(collUVE[j][0]['value']['derived-uve'] == null) {
                            collUVE[j][0]['value']['derived-uve'] = {};
                        }
                        collUVE[j][0]['value']['derived-uve']['QueryStats'] = {};
                        collUVE[j][0]['value']['derived-uve']['QueryStats'] =
                            commonUtils.cloneObj(qStats[i])
                    } else {
                        if(collUVE[j]['value']['derived-uve'] == null) {
                            collUVE[j]['value']['derived-uve'] = {};
                        }
                        collUVE[j]['value']['derived-uve']['QueryStats'] = {};
                        collUVE[j]['value']['derived-uve']['QueryStats'] =
                            commonUtils.cloneObj(qStats[i]);
                    }
                    break;
                }
            } catch(e) {
            }
        }
    }
}

function processAnalyticsQueryStats (collUVE, appData, details, callback)
{
    var resultJSON = [];
    var ipList = jsonPath(collUVE, "$..self_ip_list");
    var urlLists = [];
    var dataObjArr = [];
    var url = '/analytics/queries';
    var anaPort = '8081';
    var opServers = [];
    var opServersCnt = 0;

    var contrailServList =
        contrailService.getActiveServiceRespDataList();
    opServers =
        commonUtils.getValueByJsonPath(contrailServList,
                global.CONTRAIL_SERVICE_TYPE_OP_SERVER + ';data;' +
                global.CONTRAIL_SERVICE_TYPE_OP_SERVER, []);
    opServersCnt = opServers.length;

    if (ipList.length == 0) {
        callback(null, collUVE);
    } else {
        cnt = ipList.length;
        for (var i = 0; i < cnt; i++) {
            var serverIP = commonUtils.getValueByJsonPath(ipList[i], '0', null);
            for (var j = 0; j < opServersCnt; j++) {
                if ((serverIP == opServers[j]['@publisher-id']) ||
                    (serverIP == opServers[j]['ip-address'])) {
                    anaPort = opServers[j]['port'];
                    break;
                }
            }
            opServerAPI =
                rest.getAPIServer({apiName: global.label.OPS_API_SERVER,
                                   server: serverIP,
                                   port: anaPort});
            var headers = {};
            headers = configApiServer.configAppHeaders(headers, appData);
            commonUtils.createReqObj(dataObjArr, url, null, null,
                                     opServerAPI, headers, appData);
        }
        async.map(dataObjArr,
            commonUtils.getServerRespByRestApi(null, true),
            function(err, data) {
            fillHostDetailsToAnalyticsQueryStatsUVE(collUVE, data, ipList,
                                                    details);
            callback(null, collUVE);
            for (var i = 0; i < cnt; i++) {
                delete dataObjArr[i]['serverObj'];
            }
        });
    }
}

function getAnalyticsGenPagedSummary (req, res, appData)
{
    var count = req.param('count');
    var lastKey = req.param('lastKey');
    var hostName = req.param('hostname');
    var found = false;
    var retLastUUID = null;
    var resultJSON = {};
    var matchStr = 'name';
    var postData = {};
    var url = '/analytics/uves/generator';
    var lastGen = null;

    resultJSON['data'] = [];
    resultJSON['lastKey'] = null;
    resultJSON['more'] = false;
    postData['kfilt'] = [];
    postData['cfilt'] =
        ['ModuleClientState:client_info', 'ModuleServerState:generator_info',
        'ModuleServerState:msg_stats'];

    if (null != count) {
        count = parseInt(count);
    } else {
        count = -1;
    }

    if (null == hostName) {
        var err = new appErrors.RESTServerError('analytics node hostname not' +
                                                ' provided');
        commonUtils.handleJSONResponse(err, res, null);
        return;
    }
    getGeneratorsList(hostName, appData, function(err, genList) {
        var list = buildGenList(genList);
        if (null == list) {
            commonUtils.handleJSONResponse(null, res, resultJSON);
            return;
        }
        var index = nwMonUtils.getnThIndexByLastKey(lastKey, list, null);
        if (-2 == index) {
            commonUtils.handleJSONResponse(null, res, resultJSON);
            return;
        }
        try {
            var cnt = list.length;
        } catch(e) {
            commonUtils.handleJSONResponse(null, res, resultJSON);
            return;
        }
        if (cnt == index) {
            /* We are already at end */
            commonUtils.handleJSONResponse(null, res, resultJSON);
            return;
        }
        if (-1 == count) {
            totCnt = cnt;
        } else {
            totCnt = index + 1 + count;
        }
        if (totCnt < cnt) {
            lastGen = list[totCnt - 1];
        }
        for (var i = index + 1; i < totCnt; i++) {
            if (list[i]) {
                postData['kfilt'].push(list[i]);
                found = true;
            }
        }
        if (false == found) {
            commonUtils.handleJSONResponse(null, res, resultJSON);
            return;
        }
        opApiServer.apiPost(url, postData, appData, function (err, data) {
            resultJSON['data'] = data;
            resultJSON['lastKey'] = lastGen;
            if (null == lastGen) {
                resultJSON['more'] = false;
            } else {
                resultJSON['more'] = true;
            }
            commonUtils.handleJSONResponse(null, res, resultJSON);
        });
    });
}

function getGeneratorsList (hostName, appData, callback)
{
    var reqUrl = '/analytics/uves/analytics-node';
    var dataObjArr = [];
    var postData = {};
    postData['kfilt'] = [hostName];
    postData['cfilt'] = ['CollectorState:generator_infos'];
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                             postData, opApiServer, null, appData);

    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(opApiServer, true),
              function(err, results) {
        if ((null != err) || (null == results) || (null == results[0])) {
            callback(err, null);
            return;
        }
        var genInfo = jsonPath(results[0], "$..generator_infos");
        callback(err, genInfo[0]);
    });
}

function buildGenList (genList)
{
    var modGenList = [];
    try {
        var cnt = genList.length;
    } catch(e) {
        return null;
    }
    for (var i = 0; i < cnt; i++) {
        try {
            modGenList.push(genList[i]['source'] + ':' +
                            genList[i]['node_type'] + ':' +
                            genList[i]['module_id'] + ':' +
                            genList[i]['instance_id']);
        } catch(e) {
            logutils.logger.error("JSON Parse error while building generator" +
                                  " list");
        }
    }
    modGenList.sort();
    return modGenList;
}

exports.getAnalyticsNodeSummary = getAnalyticsNodeSummary;
exports.getAnalyticsNodeGenerators = getAnalyticsNodeGenerators;
exports.postProcessAnalyticsNodeSummaryJSON = postProcessAnalyticsNodeSummaryJSON;
exports.getAnalyticsNodeDetails = getAnalyticsNodeDetails;
exports.getAnalyticsNodeList = getAnalyticsNodeList;
exports.getAnalyticsGenPagedSummary = getAnalyticsGenPagedSummary;

