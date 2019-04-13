/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils'),
    configApiServer = require(process.mainModule.exports["corePath"] +
                              '/src/serverroot/common/configServer.api'),
    opApiServer = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/common/opServer.api'),
    adminApiHelper = require('./adminapi.helper'),
    logutils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/log.utils'),
    jsonPath = require('JSONPath').eval,
    assert = require('assert'),
    url = require("url"),
    request = require('request'),
    http = require('http'),
    https = require('https'),
    proxyApi = require(process.mainModule.exports["corePath"] +
                       '/src/serverroot/common/proxy.api'),
    appErrors = require(process.mainModule.exports["corePath"] +
                        '/src/serverroot/errors/app.errors'),
    redisUtils = require(process.mainModule.exports["corePath"] +
                         '/src/serverroot/utils/redis.utils'),
    rest = require(process.mainModule.exports["corePath"] +
            '/src/serverroot/common/rest.api'),
    contrailService = require(process.mainModule.exports.corePath +
            "/src/serverroot/common/contrailservice.api"),
    proxyHelper = require(process.mainModule.exports["corePath"] +
            "/src/serverroot/common/proxy.helper"),
    async = require('async');

var redisInfraClient = null;

function getModuleType (modName)
{
    switch(modName){
    case 'contrail-vrouter-agent':
    case 'TorAgent':
        return 'Compute';
    case 'contrail-control':
    case 'contrail-dns':
        return 'Control';
    case 'contrail-api':
    case 'contrail-svc-monitor':
    case 'contrail-discovery':
    case 'contrail-schema':
        return 'Config';
    case 'contrail-collector':
    case 'contrail-analytics-api':
    case 'contrail-query-engine':
        return 'Analytics';
    default:
        logutils.logger.error('Unknown moduleName used: ' + modName);
        assert(0);
    }
}

function modExistInGenList (moduleList, hostName, genName)
{
    if ((null == moduleList) || (null == genName)) {
        return false;
    }
    var modCnt = moduleList.length;
    for (var i = 0; i < modCnt; i++) {
        var modType = getModuleType(moduleList[i]);
        gen = hostName + ':' + modType + ':' + moduleList[i];
        pos = genName.indexOf(gen);
        if (-1 != pos) {
            return true;
        }
    }
    return false;
}

function getModInstName (genName)
{
    if (null == genName) {
        return null;
    }
    /* Generator Name field is a combination of
       hostname:type:module:instId
       This function returns type:module:instId
     */
    var pos = genName.indexOf(':');
    return genName.slice(pos + 1);
}

function updateGeneratorInfo (resultJSON, genInfo, hostName, moduleNames)
{
    try {
        var modType = getModuleType(moduleNames[0]);
        var mod = hostName + ':' + modType + ':';
        var genCnt = genInfo.length;
    } catch(e) {
        return resultJSON;
    }
    for (var i = 0; i < genCnt; i++) {
        if (false == modExistInGenList(moduleNames, hostName,
                                       genInfo[i]['name'])) {
            continue;
        }
        try {
            modStr = getModInstName(genInfo[i]['name']);
            resultJSON[modStr] = {};
            resultJSON[modStr] =
                commonUtils.copyObject(resultJSON[modStr], genInfo[i]['value']);
        } catch(e) {
        }
    }
    return resultJSON;
}

function doNodeExist (configData, moduleName, host)
{
    var fqName = null;
    try {
        var cnt = configData.length;
    } catch(e) {
        return -1;
    }
    for (var i = 0; i < cnt; i++) {
        try {
            if (moduleName == 'contrail-control') {
                fqName = configData[i]['bgp-router']['fq_name'];
            } else {
                fqName = configData[i]['virtual-router']['fq_name'];
            }
            var fqNameLen = fqName.length;
            if (host == fqName[fqNameLen - 1]) {
                configData[i]['visited'] = true;
                return i;
            }
        } catch(e) {
            continue;
        }
    }
    return -1;
}

function getProcStateMappedModule(moduleName)
{
    switch (moduleName) {
    case 'contrail-vrouter-agent':
        return 'contrail-vrouter-agent';
    case 'contrail-control':
        return 'contrail-control';
    default:
        return moduleName;
    }
}

function checkAndGetSummaryJSON (configData, uves, moduleNames)
{
    var resultJSON = [];
    var k = 0;
    try {
        var uveData = uves[0]['value'];
        var cnt = uveData.length;
    } catch(e) {
        cnt = 0;
    }
    try {
        var genInfo = uves[1]['value'];
        var genCnt = genInfo.length;
    } catch(e) {
        genInfo = null;
    }
    var j = 0;
    var modCnt = moduleNames.length;
    for (var i = 0; i < cnt; i++) {
        try {
            name = uveData[i]['name'] + ':' + moduleNames[0];
            resultJSON[j] = {};
            resultJSON[j]['name'] = uveData[i]['name'];
            resultJSON[j]['value'] = uveData[i]['value'];
            uveData[i]['visited'] = true;
            configIndex = doNodeExist(configData, moduleNames[0],
                                      uveData[i]['name']);
            if (-1 != configIndex) {
                resultJSON[j]['value']['ConfigData'] = configData[configIndex];
            } else {
                resultJSON[j]['value']['ConfigData'] = {};
            }
            j++;
        } catch(e) {
            continue;
        }
    }
    /* Now traverse Config Data, if 'visited' not found, then mark as Down */
    cnt = 0;
    if (null != configData) {
        cnt = configData.length;
    }
    var nodeFound = false;
    for (i = 0; i < cnt; i++) {
        try {
            if (moduleNames[0] == 'contrail-control') {
                fqName = configData[i]['bgp-router']['fq_name'];
            } else {
                fqName = configData[i]['virtual-router']['fq_name'];
            }
            if (null == configData[i]['visited']) {
                if (moduleNames[0] == 'contrail-control') {
                    if (adminApiHelper.isContrailControlNode(configData[i]['bgp-router'])) {
                        nodeFound = true;
                    }
                } else {
                    nodeFound = true;
                }
            }
            if (true == nodeFound) {
                var fqLen = fqName.length;
                resultJSON[j] = {};
                resultJSON[j]['name'] = fqName[fqLen - 1];
                resultJSON[j]['value'] = {};
                resultJSON[j]['value']['ConfigData'] = {};
                resultJSON[j]['value']['ConfigData'] = configData[i];
                j++;
            }
            nodeFound = false;
        } catch(e) {
        }
    }
    cnt = resultJSON.length;
    for (var i = 0; i < cnt; i++) {
        try {
            if (resultJSON[i]['value']['ConfigData']['visited']) {
                delete resultJSON[i]['value']['ConfigData']['visited'];
            }
        } catch(e) {
        }
    }
    for (var p = 0; p < j; p++) {
        updateGeneratorInfo(resultJSON[p]['value'], genInfo,
                            resultJSON[p]['name'], moduleNames);
    }
    return resultJSON;
}

function getvRouterAsyncResp (dataObj, callback)
{
    if (true == dataObj['configData']) {
        async.map(dataObj,
                  commonUtils.getServerResponseByRestApi(configApiServer, true),
                  function(err, data) {
            callback(null, data);
        });
    } else {
        var postData = {};
        if (null != dataObj['cfilt']) {
            postData['cfilt'] = dataObj['cfilt'];
        }
        if (null != dataObj['kfilt']) {
            postData['kfilt'] = dataObj['kfilt'];
        }
        var url = '/analytics/uves/vrouter';
        opApiServer.apiPost(url, postData, dataObj['appData'],
                            function(err, data) {
            callback(null, data);
        });
    }
}

function getvRouterSummaryConfigUVEData (configData, vrConf, nodeList, addGen,
                                         appData, callback)
{
    var newResult = [];
    var newResultLen = 0;
    var dataObjArr = [];
    var configFound = true;
    var index;
    var uuidList = null;

    if (null != uuidList) {
        len = uuidList.length;
    } else if (null != configData) {
        try {
            len = configData['virtual-routers'].length;
        } catch(e) {
            len = 0;
        }
    } else {
        len = 0;
    }
    dataObjArr[0] = [];
    for (var i = 0; i < len; i++) {
        var uuid = (null != configData) ?
            configData['virtual-routers'][i]['uuid'] : uuidList[i];
        var reqUrl = '/virtual-router/' + uuid;
        dataObjArr[0][i] = {};
        dataObjArr[0][i]['reqUrl'] = reqUrl;
        dataObjArr[0][i]['appData'] = appData;
        dataObjArr[0][i]['method'] = global.HTTP_REQUEST_GET;
        //dataObjArr[0]['configData'] = true;
    }
    reqUrl = '/analytics/uves/vrouter';
    var cfilt = ['VrouterStatsAgent:cpu_info',
        'VrouterStatsAgent:phy_if_5min_usage',
        'VrouterAgent:virtual_machine_list',
        'VrouterAgent:self_ip_list',
        'VrouterAgent:vn_count',
        'VrouterAgent:xmpp_peer_list',
        'VrouterAgent:vmi_count',
        'VrouterAgent:down_interface_count',
        'VrouterAgent:control_ip', 'VrouterAgent:build_info',
        'VrouterStatsAgent:cpu_share', 'NodeStatus',
        'VrouterAgent:sandesh_http_port',
        'VrouterAgent:platform',
        'VrouterAgent:control_ip', 'UVEAlarms',
        'VrouterStatsAgent:flow_rate'];
    var postData = {};
    if (null != nodeList) {
        var nodeCnt = nodeList.length;
        var postDataIncrCnt =
            Math.ceil(nodeCnt / global.VROUTER_COUNT_IN_JOB);
        var idx = 0;
        for (var i = 0; i < postDataIncrCnt; i++) {
            dataObjArr[i + 1] = {};
            dataObjArr[i + 1]['kfilt'] = [];
            dataObjArr[i + 1]['cfilt'] = cfilt;
            dataObjArr[i + 1]['appData'] = appData;
            dataObjArr[i + 1]['configData'] = false;
            for (j = idx; j < nodeCnt; j++) {
                dataObjArr[i + 1]['kfilt'].push(nodeList[j]);
                if ((j != 0) && (0 == (j + 1) % global.VROUTER_COUNT_IN_JOB)) {
                    idx = j + 1;
                    break;
                }
            }
        }
    } else {
        dataObjArr[0 + 1] = {};
        dataObjArr[0 + 1]['appData'] = appData;
        dataObjArr[0 + 1]['cfilt'] = cfilt;
        dataObjArr[0 + 1]['configData'] = false;
    }
    /* As Config Data we are already getting, so check if we have got Config or
     * not
     */
    if (!dataObjArr[0].length) {
        /* We did not get config data */
        dataObjArr.splice(0, 1);
        configFound = false;
        index = 0;
    } else {
        index = 1;
    }
    async.mapSeries(dataObjArr, getvRouterAsyncResp, function(err, results) {
        if ((null != err) || (null == results)) {
            callback(err, results, len);
            return;
        }
        var cnt = results.length;
        var resultJSON = [];
        for (var i = index; i < cnt; i++) {
            try {
                resultJSON = resultJSON.concat(results[i]['value']);
            } catch(e) {
                logutils.logger.error("In getvRouterSummaryConfigUVEData():" +
                                      "JSON Parse error: " + e);
            }
        }
        if (true == configFound) {
            newResult = results[0];
            newResultLen = newResult.length;
        } else {
            newResultLen = 0;
        }
        newResult[newResultLen] = {};
        newResult[newResultLen]['value'] = resultJSON;
        callback(err, newResult, len);
    });
}

function dovRouterListProcess (configData, vrConf, nodeList, addGen,
                               appData, callback)
{
    var uveData = [];
    var confData = [];
    getvRouterSummaryConfigUVEData(configData, vrConf, nodeList, addGen, appData,
                                  function(err, configUVEData,
                                           vRouterCnt) {
        if (null != err) {
            callback(null, []);
            return;
        }
        for (var i = 0; i < vRouterCnt; i++) {
            confData[i] = configUVEData[i];
        }
        var cnt = configUVEData.length;
        for (i = vRouterCnt; i < cnt; i++) {
            uveData[i - vRouterCnt] = configUVEData[i];
        }
        resultJSON =
            checkAndGetSummaryJSON(vrConf, uveData,
                                   ['contrail-vrouter-agent']);
        callback(null, resultJSON);
    });
}

function getNodeListByLastKey (list, count, lastKey, matchStr, uuidList)
{
    var resultJSON = {};
    var retLastUUID = null;
    resultJSON['lastKey'] = null;
    resultJSON['more'] = false;
    resultJSON['nodeList'] = [];
    resultJSON['uuidList'] = [];

    var list = nwMonUtils.makeUVEList(list);
    var index = nwMonUtils.getnThIndexByLastKey (lastKey, list, matchStr);
    if (index == -2) {
        return resultJSON;
    }
    try {
        var cnt = list.length;
    } catch(e) {
        return resultJSON;
    }
    if (cnt == index) {
        /* We are already at end */
        return resultJSON;
    }
    if (-1 == count) {
        totCnt = cnt;
    } else {
        totCnt = index + 1 + count;
    }
    if (totCnt < cnt) {
        retLastUUID = list[totCnt - 1][matchStr];
    }
    for (var i = index + 1; i < totCnt; i++) {
        if (list[i]) {
            resultJSON['nodeList'].push(list[i][matchStr]);
        }
        if (null != uuidList[i]) {
            resultJSON['uuidList'].push(uuidList[i]);
        }
    }
    if (null != retLastUUID) {
        resultJSON['more'] = true;
    }
    resultJSON['lastKey'] = retLastUUID;
    return resultJSON;
}

function getvRouterList (appData, callback)
{
    var resultJSON = [];
    var uuidList = [];
    var dataObjArr = [];
    var tmpInsertedList = {};
    var url = '/virtual-routers?detail=True';
    commonUtils.createReqObj(dataObjArr, url, null, null, configApiServer, null,
                             appData);
    url = '/analytics/uves/vrouters';
    commonUtils.createReqObj(dataObjArr, url, null, null, opApiServer, null,
                             appData);
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(configApiServer, true),
              function(err, results) {
        if (err || (null == results)) {
            callback(err, results, null);
            return;
        }
        var vrConf = null;
        if (null != results[0]) {
            vrConf = results[0]['virtual-routers'];
        }
        /*
        try {
            var vrConf = results[0]['virtual-routers'];
            var vrCnt = vrConf.length;
        } catch(e) {
            logutils.logger.info("In getvRouterList(), vRouter Config not " +
                                  "found");
            vrCnt = 0;
        }
        for (var i = 0; i < vrCnt; i++) {
            try {
                len = vrConf[i]['fq_name'].length;
                vrouterName = vrConf[i]['fq_name'][len - 1];
                resultJSON.push(vrouterName);
                uuidList.push(vrConf[i]['uuid']);
                tmpInsertedList[vrouterName] = vrouterName;
            } catch(e) {
                logutils.logger.error("In getvRouterList(), vRouter Config Parse " +
                                      "Error: " + e);
            }
        }
        */
        try {
            var vrUVE = results[1];
            vrCnt = vrUVE.length;
        } catch(e) {
            logutils.logger.info("In getvRouterList(), vRouter UVE not " +
                                 "found");
            vrCnt = 0;
        }
        for (i = 0; i < vrCnt; i++) {
            try {
                vrouterName = vrUVE[i]['name'];
                if (null == tmpInsertedList[vrouterName]) {
                    resultJSON.push(vrouterName);
                    tmpInsertedList[vrouterName] = vrouterName;
                }
            } catch(e) {
                logutils.logger.error("In getvRouterList(), vRouter UVE Parse " +
                                      "Error: " + e);
            }
        }
        callback(null, resultJSON, vrConf);
    });
}

function addGeneratorInfoToUVE (postData, uve, host, modules, appData, callback)
{
    var resultJSON = {};
    var url = '/analytics/uves/generator';

    opApiServer.apiPost(url, postData, appData,
                      commonUtils.doEnsureExecution(function(err, data) {
        if ((null != err) || (null == data) || (null == data['value'])) {
            callback(null, uve);
            return;
        }
        data = data['value'];
        len = data.length;
        var modCnt = modules.length;
        for (var i = 0; i < len; i++) {
            try {
                if (false ==
                    modExistInGenList(modules, host, data[i]['name'])) {
                    continue;
                }
                var modInstName = getModInstName(data[i]['name']);
                if (null == modInstName) {
                    continue;
                }
                resultJSON[modInstName] = data[i]['value'];
            } catch(e) {
            }
        }
        if (null == uve['derived-uve']) {
            uve['derived-uve'] = {}
        }
        uve['derived-uve'] = commonUtils.copyObject(uve['derived-uve'], resultJSON);
        callback(null, uve);
    }, global.DEFAULT_CB_TIMEOUT));
}

function filterOutGeneratorInfoFromGenerators(excludeProcessList, resultJSON)
{
    for (var key in resultJSON) {
        var label = key.toUpperCase();
        var excludeProcessLen = excludeProcessList.length;
        for (var i = 0; i < excludeProcessLen; i++) {
            if (label.indexOf(excludeProcessList[i].toUpperCase()) > -1) {
                try {
                    delete resultJSON[key]['ModuleServerState']['generator_info'];
                } catch(e) {
                }
            }
       }
    }
    return resultJSON;
}

function getUVEByUrlAndSendData (url, errResponse, res, appData)
{
    opApiServer.apiGet(url, appData, function(err, data) {
        if (err || (null == data)) {
            commonUtils.handleJSONResponse(err, res, errResponse);
        } else {
            commonUtils.handleJSONResponse(err, res, data);
        }
    });
}

function sortUVEList (uveEntry1, uveEntry2)
{
    if (uveEntry1['name'] > uveEntry2['name']) {
        return 1;
    } else if (uveEntry1['name'] < uveEntry2['name']) {
        return -1;
    }
    return 0;
}

function sendSandeshRequest (req, res, dataObjArr, restAPI)
{
    async.map(dataObjArr,
              commonUtils.getServerRespByRestApi(restAPI, false),
              function(err, data) {
        if ((null == err) && (null != data)) {
            commonUtils.handleJSONResponse(null, res, data);
        } else {
            sendServerRetrieveError(res);
        }
    });
}

function getCpuStatDataByUVE (cpuInfo)
{
    var result = {};
    result['CpuLoadInfo'] = {};
    try {
        var resultJSON = jsonPath(cpuInfo, "$..SysMemInfo");
        var data = {};
        result['CpuLoadInfo']['SysMemInfo'] =
            commonUtils.createJSONByUVEResponse(data,
                                                resultJSON[0]);
    } catch(e) {
    }
    try {
        resultJSON = jsonPath(cpuInfo, "$..MemInfo");
        result['CpuLoadInfo']['MemInfo'] =
            commonUtils.createJSONByUVEResponse(data,
                                                resultJSON[0]);
    } catch(e) {
    }
     try {
        resultJSON = jsonPath(cpuInfo, "$..CpuLoadAvg");
        result['CpuLoadInfo']['CpuLoadAvg'] =
            commonUtils.createJSONByUVEResponse(data,
                                                resultJSON[0]);
    } catch(e) {
    }
    try {
        resultJSON = jsonPath(cpuInfo, "$..num_cpu");
        result['CpuLoadInfo']['num_cpu'] = resultJSON[0]['#text'];
    } catch(e) {
    }
    try {
        resultJSON = jsonPath(cpuInfo, "$..cpu_share");
        result['CpuLoadInfo']['cpu_share'] = resultJSON[0]['#text'];
    } catch(e) {
    }
    return result;
}

function parseUVECpuStatsData (cpuInfo)
{
    var resultJSON = [];
    var results = [];
    var cnt = cpuInfo.length;
    for (var i = 0; i < cnt; i++) {
        results[i] = {};
        results[i] = getCpuStatDataByUVE(cpuInfo[i]);
    }
    return results;
}

function getBulkUVEUrl (type, hostname, module, filtObj)
{
    var cfilt = filtObj['cfilt'];
    var kfilt = filtObj['kfilt'];
    var mfilt = filtObj['mfilt'];
    var reqUrl = '/analytics/uves/';
    if (null == type) {
        return null;
    }

    reqUrl += type + '/';
    if (null != hostname) {
        reqUrl += hostname + ':';
    //} else {
     //   reqUrl += '*';
    }
    if (null != module) {
        reqUrl += module;
    } else {
        reqUrl += '*';
    }
    if (null != kfilt) {
        reqUrl += '?kfilt=' + kfilt;
    }
    if (null != cfilt) {
        if (null != kfilt) {
            reqUrl += '&';
        } else {
            reqUrl += '?';
        }
        reqUrl += 'cfilt=' + cfilt;
    }
    if (null != mfilt) {
        if ((null != cfilt) || (null != kfilt)) {
            reqUrl += '&';
        } else {
            reqUrl += '?';
        }
        reqUrl += 'mfilt=' + mfilt;
    }
    return reqUrl;
}

function getBulkUVEPostURLs (filtData, appData)
{
    filtData = filtData['data'];
    var url = '/analytics/uves/';
    var dataObjArr = [];

    try {
        var modCnt = filtData.length;
    } catch(e) {
        return null;
    }
    for (var i = 0; i < modCnt; i++) {
        var postData = {};
        type = filtData[i]['type'];
        hostname = filtData[i]['hostname'];
        module = filtData[i]['module'];
        /* All URLs should be valid */
        if (null == type) {
            return null;
        }
        if (null != filtData[i]['kfilt']) {
            postData['kfilt'] = filtData[i]['kfilt'].split(',');
        }
        if (null != filtData[i]['cfilt']) {
            postData['cfilt'] = filtData[i]['cfilt'].split(',');
        }
        if (null != filtData[i]['mfilt']) {
            postData['mfilt'] = filtData[i]['mfilt'].split(',');
        }
        url += type;

        var kfilt = "";
        if (null != hostname) {
            kfilt += hostname + ':';
        }
        if (null != module) {
            kfilt += module;
        } else {
            kfilt += '*';
        }
        //postData['kfilt'].splice(0, 0, kfilt);
        commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST,
                                 postData, opApiServer, null, appData);
    }
    return dataObjArr;
}

function getServerResponseByModType (req, res, appData)
{
    var postData = req.body;
    var dataObjArr = [];

    dataObjArr = getBulkUVEPostURLs(postData, appData);
    if (null == dataObjArr) {
        var err = new appErrors.RESTServerError('postData is not correct');
        commonUtils.handleJSONResponse(err, res, null);
        return;
    }
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(opApiServer, false),
              function(err, resultJSON) {
        commonUtils.handleJSONResponse(err, res, resultJSON);
    });
}

function getDataFromConfigNode (str, hostName, appData, data, callback)
{
    var url = '/' + str;
    if (null === data["derived-uve"]) {
        data["derived-uve"] = {};
    }
    data['derived-uve']['nodeStatus'] = 'Down';
    configApiServer.apiGet(url, appData,
                           commonUtils.doEnsureExecution(function(err, configData) {
        if ((null != err) || (null == configData)) {
            callback(null, data);
            return;
        }
        var configData = configData[str];
        var dataLen = configData.length;
        for (var i = 0; i < dataLen; i++) {
            try {
                fqNameLen = configData[i]['fq_name'].length;
                if (hostName == configData[i]['fq_name'][fqNameLen - 1]) {
                    break;
                }
            } catch(e) {
            }
        }
        if (i == dataLen) {
            callback(null, data);
            return;
        }
        if (str == 'bgp-routers') {
            url = '/bgp-router/';
        } else if (str == 'virtual-routers') {
            url = '/virtual-router/';
        }
        try {
            url += configData[i]['uuid'];
        } catch(e) {
            callback(null, data);
            return;
        }
        configApiServer.apiGet(url, appData,
                               commonUtils.doEnsureExecution(function(err, configData) {
            if (null == data['derived-uve']) {
                data['derived-uve'] = {};
            }
            data['derived-uve']['ConfigData'] = {};
            data['derived-uve']['ConfigData'] = configData;
            data['derived-uve']['nodeStatus'] = 'Up';
            callback(null, data);
        }, global.DEFAULT_CB_TIMEOUT));
    }, global.DEFAULT_CB_TIMEOUT));
}

/* Function: getSandeshData
   Req URL:  /api/admin/monitor/infrastructure/get-sandesh-data
   Generic API to get Sandesh data
   Ex: Client POST body format:
   {"data":{"ip":"nodeXX","port":"8085","url":"/Snh_VmListReq?uuid="}}
  */
function getSandeshData (req, res, appData)
{
    var dataObjArr = [];
    var sandeshReq = req.body;

    if ((null == sandeshReq) || (null == sandeshReq['data'])) {
        var err = appErrors.RESTServerError('POST body is empty');
        commonUtils.handleJSONResponse(err, res, null);
        return;
    }
    var data = sandeshReq['data'];
    if ((null == data) || (null == data['ip']) || (null == data['port']) ||
        (null == data['url'])) {
        var err = new appErrors.RESTServerError('POST body format is not correct,' +
                                                ' ip/port/url required');
        commonUtils.handleJSONResponse(err, res, null);
        return;
    }
    var nodeRestAPI = commonUtils.getRestAPIServer(data['ip'], data['port'],
                                                   global.SANDESH_API);
    commonUtils.createReqObj(dataObjArr, data['url']);
    async.map(dataObjArr,
              commonUtils.getServerRespByRestApi(nodeRestAPI, false),
              commonUtils.doEnsureExecution(function(err, data) {
        if ((null == err) && (data != null)) {
            /* Created request with single array entry */
            data = data[0];
        }
        commonUtils.handleJSONResponse(err, res, data);
    }, global.DEFAULT_MIDDLEWARE_API_TIMEOUT));
}

function getConfigApiNetworkReachableIP (dataObj, callback)
{
    var ip = dataObj['ip'];
    var port = dataObj['port'];
    var req = dataObj['req'];
    var resultJSON = {};

    var userRoles = req.session.userRoles;
    var authApi = require(process.mainModule.exports["corePath"] +
        '/src/serverroot/common/auth.api');
    var adminProjectList = authApi.getAdminProjectList(req);
    var headers = {};

    if ((null != adminProjectList) && (adminProjectList.length > 0)) {
        var adminProject = adminProjectList[0];
        headers['X_API_ROLE'] = req.session.userRoles[adminProject].join(',');
        headers['X-AUTH-TOKEN'] =
            req.session.tokenObjs[adminProject]['token']['id'];
    }
    var newConfigRESTServer =
        rest.getAPIServer({apiName: global.label.VNCONFIG_API_SERVER,
                           server: ip, port: port});
    var apiUrl = '/';
    newConfigRESTServer.api.get(apiUrl,
            commonUtils.doEnsureExecution(function(err, data) {
        resultJSON['ip'] = ip;
        resultJSON['port'] = port;
        callback(null, resultJSON);
    }, 10000), headers);
}

function getNetworkReachableIP (dataObj, callback)
{
    var ip = dataObj['ip'];
    var hostname = dataObj['hostname'];
    var port = dataObj['port'];
    var req = dataObj['req'];
    var isConfig = dataObj['isConfig'];
    var resultJSON = {};
    var options = url.parse("/", true);
    options.headers = {
        accept: '*/*',
        'content-length': 0
    };
    var serverType = null;
    var contrailSvcData = contrailService.getActiveServiceRespDataList();
    if ('true' == isConfig) {
        serverType = global.CONTRAIL_SERVICE_TYPE_API_SERVER;
    } else if ('false' == isConfig) {
        serverType = global.CONTRAIL_SERVICE_TYPE_OP_SERVER;
    }
    var dataList =
        commonUtils.getValueByJsonPath(contrailSvcData,
                                       serverType + ';data;' +
                                       serverType, []);
    if (null != serverType) {
        var dataCnt = dataList.length;
        for (var i = 0; i < dataCnt; i++) {
            var contrailSvcIP =
                commonUtils.getValueByJsonPath(dataList[i],
                                               'ip-address', null);
            var contrailSvcPort =
                commonUtils.getValueByJsonPath(dataList[i],
                                               'port', null);
            if (ip == contrailSvcIP) {
                port = contrailSvcPort;
                break;
            }
        }
    }
    var protocol = http;
    options.protocol = 'http:';
    var sslOptions = proxyHelper.getSSLOptionsByProxyPort(req, port);
    if ((null != sslOptions) &&
        (global.PROTOCOL_HTTPS == sslOptions.authProtocol)) {
        protocol = https;
        try {
            options.cert = fs.readFileSync(sslOptions.cert);
        } catch(e) {
            logutils.logger.error("SSL Cert file read error:" +
                                  sslOptions.cert);
            options.cert = "";
        }
        try {
            options.key = fs.readFileSync(sslOptions.key);
        } catch(e) {
            logutils.logger.error("SSL Key file read error:" +
                                  sslOptions.key);
            options.key = "";
        }
        try {
            options.ca = fs.readFileSync(sslOptions.ca);
        } catch(e) {
            logutils.logger.error("SSL CA file read error:" +
                                  sslOptions.ca);
            options.ca = "";
        }
        options.rejectUnauthorized = sslOptions.strictSSL;
        options.protocol = "https:";
    }
    resultJSON['error'] = null;
    resultJSON['data'] = null;
    resultJSON['ip'] = ip;
    resultJSON['port'] = port;
    resultJSON['hostname'] = hostname;

    if ('true' == isConfig) {
        getConfigApiNetworkReachableIP(dataObj, callback);
        return;
    }

    options.hostname = ip;
    options.port = port;

    var rqst = protocol.request(options, function(res) {
        var body = '';
        res.on('end', function() {
            resultJSON['data'] = body;
            callback(null, resultJSON);
        });
        res.on('data', function(chunk) {
            body += chunk;
        });
    }).on("error", function(err) {
        var msg = "Connection error";
        if (null != err.code) {
            msg = err.code;
        }
        var error = new appErrors.RESTServerError(msg);
        resultJSON['error'] = error;
        callback(null, resultJSON);
        logutils.logger.error(err.stack);
    });
    rqst.end();
}

function checkValidIP (ipAddrStr)
{
    try {
        var ipArr = ipAddrStr.split('.');
        var ipArrLen = ipArr.length;
        if (4 != ipArrLen) {
            return false;
        }
        for (i = 0; i < ipArrLen; i++) {
            ipArr[i] = parseInt(ipArr[i]);
        }
        if ((0 == ipArr[0]) && (0 == ipArr[1]) &&
            (0 == ipArr[2]) && (0 == ipArr[3])) {
            return false;
        }
        if ((255 == ipArr[0]) && (255 == ipArr[1]) &&
            (255 == ipArr[2]) && (255 == ipArr[3])) {
            return false;
        }
    } catch(e) {
        return false;
    }
    return true;
}

function getReachableIP (req, res, appData)
{
    var error = null;
    var resultJSON = {};
    var dataObjArr = [];
    var postBody = req.body;

    if ((null == postBody) || (null == postBody['data'])) {
        error = new appErrors.RESTServerError('POST Body not found');
        commonUtils.handleJSONResponse(error, res, null);
        return;
    }
    var data = postBody['data'];
    var len = data.length;
    for (var i = 0; i < len; i++) {
        if ((null == data[i]['ip']) || (null == data[i]['port'])) {
            error = new appErrors.RESTServerError('IP/PORT not found in post ' +
                                                  ' body in ' + i + 'th index');
            commonUtils.handleJSONResponse(error, res, null);
            return;
        }
        var isConfig = false;
        if (null != data[i]['isConfig']) {
            isConfig = data[i]['isConfig'];
        }
        dataObjArr.push({'ip': data[i]['ip'], 'port': data[i]['port'], 'hostname': data[i]['hostname'],
                         'req': req, isConfig: isConfig});
    }

    async.map(dataObjArr, getNetworkReachableIP, function(err, data) {
        if ((null != err) || (null == data)) {
            commonUtils.handleJSONResponse(err, res, data);
            return;
        }
        var respCnt = data.length;
        for (var i = 0; i < respCnt; i++) {
            if (null == data[i]['error']) {
                resultJSON['ip'] = data[i]['ip'];
                resultJSON['port'] = data[i]['port'];
                resultJSON['hostname'] = data[i]['hostname'];
                break;
            }
        }
        commonUtils.handleJSONResponse(err, res, resultJSON);
    });
}

function saveNodesHostIPToRedis (data, nodeType, callback)
{
    var hash = 'node-hash';
    var portList = proxyApi.getAllowedProxyPortListByNodeType(nodeType);
    for (key in data['hosts']) {
        if ((data['hosts'][key] instanceof Array) &&
            (portList instanceof Array)) {
            data['hosts'][key] = data['hosts'][key].concat(portList);
        } else {
            /* We must not come here */
            data['hosts'][key] = portList;
        }
    }
    for (key in data['ips']) {
        if ((data['ips'][key] instanceof Array) &&
            (portList instanceof Array)) {
            data['ips'][key] = data['ips'][key].concat(portList);
        } else {
            /* We must not come here */
            data['ips'][key] = portList;
        }
    }
    data = JSON.stringify(data);
    if (null == redisInfraClient) {
        redisUtils.createDefRedisClientAndWait(function(redisClient) {
            redisInfraClient = redisClient;
            redisInfraClient.hset(hash, nodeType, data, function(err) {
                callback(err);
            });
        });
    } else {
        redisInfraClient.hset(hash, nodeType, data, function(err) {
            callback(err);
        });
    }
}

function getvRouetrIntrospectPortByReq (req)
{
    try {
        var introspectPort = req.param('introspectPort');
    } catch(e) {
        logutils.logger.debug("We did not get introspectPort in req Obj");
        return global.SANDESH_COMPUTE_NODE_PORT;
    }
    return getvRouetrIntrospectPort(introspectPort);
}

function getvRouetrIntrospectPort (introspectPort)
{
    if (null == introspectPort) {
        introspectPort = global.SANDESH_COMPUTE_NODE_PORT;
    }
    return introspectPort;
}

function fillIntrospectPortInJobData (req, jobData)
{
    if (null == jobData) {
        jobData = {};
    }
    var introspectPort = req.param('introspectPort');
    if (null != introspectPort) {
        jobData['introspectPort'] = introspectPort;
    }
    return jobData;
}

function getvRtrIntrospectPortByJobData (jobData)
{
    if ((null != jobData) && (null != jobData['taskData']) &&
        (null != jobData['taskData']['appData']) &&
        (null != jobData['taskData']['appData']['introspectPort'])) {
        return jobData['taskData']['appData']['introspectPort'];
    }
    return global.SANDESH_COMPUTE_NODE_PORT;
}

function sendServerRetrieveError (res)
{
    var error = new appErrors.RESTServerError(global.STR_CACHE_RETRIEVE_ERROR);
    commonUtils.handleJSONResponse(error, res, null);
}
function getUVEKeys (req, res, appData) {
    var url = '/analytics/uve-types';
    var isProject = req.query['isProject'],
        globalUVEKeys = [],
        projectUVEKeys = [],
        uveKeys = [];
    opApiServer.apiGet(url, appData,
        function(err, data) {
            if (err || (null == data)) {
                commonUtils.handleJSONResponse(err, res, null);
            } else {
                for(var key in data) {
                    if (data[key] != null) {
                        var uveObj = data[key];
                        globalUVEKeys.push(key);
                        if (uveObj['global_system_object'] == false) {
                            projectUVEKeys.push(key);
                        }
                    }
                }
                uveKeys = (isProject === 'true') ? projectUVEKeys : globalUVEKeys;
                commonUtils.handleJSONResponse(null, res, uveKeys);
            }
    });
}
exports.getUVEKeys = getUVEKeys;
exports.dovRouterListProcess = dovRouterListProcess;
exports.checkAndGetSummaryJSON = checkAndGetSummaryJSON;
exports.getvRouterList = getvRouterList;
exports.getNodeListByLastKey = getNodeListByLastKey;
exports.getModuleType = getModuleType;
exports.modExistInGenList = modExistInGenList;
exports.getModInstName = getModInstName;
exports.addGeneratorInfoToUVE = addGeneratorInfoToUVE;
exports.getUVEByUrlAndSendData = getUVEByUrlAndSendData;
exports.sortUVEList = sortUVEList;
exports.sendSandeshRequest = sendSandeshRequest;
exports.getServerResponseByModType = getServerResponseByModType;
exports.getDataFromConfigNode = getDataFromConfigNode;
exports.filterOutGeneratorInfoFromGenerators =
    filterOutGeneratorInfoFromGenerators;
exports.getBulkUVEUrl = getBulkUVEUrl;
exports.getReachableIP = getReachableIP;
exports.getSandeshData = getSandeshData;
exports.saveNodesHostIPToRedis = saveNodesHostIPToRedis;
exports.getvRouetrIntrospectPort = getvRouetrIntrospectPort;
exports.fillIntrospectPortInJobData = fillIntrospectPortInJobData;
exports.getvRouetrIntrospectPortByReq = getvRouetrIntrospectPortByReq;
exports.getvRtrIntrospectPortByJobData = getvRtrIntrospectPortByJobData;
exports.sendServerRetrieveError = sendServerRetrieveError;

