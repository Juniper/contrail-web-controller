/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var rest = require(process.mainModule.exports["corePath"] +
        '/src/serverroot/common/rest.api'),
    configUtils = require(process.mainModule.exports["corePath"] +
        '/src/serverroot/common/config.utils'),
    async = require('async'),
    qs = require('querystring'),
    commonUtils = require(process.mainModule.exports["corePath"] +
            '/src/serverroot/utils/common.utils'),
    logutils = require(process.mainModule.exports["corePath"] +
            '/src/serverroot/utils/log.utils'),
    jsonPath = require('JSONPath').eval,
    appErrors = require(process.mainModule.exports["corePath"] +
            '/src/serverroot/errors/app.errors.js'),
    adminApiHelper = require('../../../../common/api/adminapi.helper'),
    urlMod = require('url'),
    nwMonUtils = require('../../../../common/api/nwMon.utils'),
    opApiServer = require(process.mainModule.exports["corePath"] +
            '/src/serverroot/common/opServer.api'),
    infraCmn = require('../../../../common/api/infra.common.api'),
    configApiServer = require(process.mainModule.exports["corePath"] +
            '/src/serverroot/common/configServer.api');

function getAclUUIDByFlowAclInfo (flowAclInfo)
{
    try {
        var uuidObj = jsonPath(flowAclInfo, "$..uuid");
        if (uuidObj.length > 0) {
            return uuidObj[0][0]['_'];
        }
    } catch(e) {
    }
    return global.RESP_DATA_NOT_AVAILABLE;
}

function postParsevRouterFlowsSandeshData (resultJSON, flowData)
{
    try {
        var cnt = resultJSON['flowData'].length;
    } catch(e) {
        return resultJSON;
    }
    for (var i = 0; i < cnt; i++) {
        try {
            resultJSON['flowData'][i]['acl_uuid'] =
                commonUtils.getSafeDataToJSONify(getAclUUIDByFlowAclInfo(flowData[i]['policy']));
                delete resultJSON['flowData'][i]['policy'];
        } catch(e) {
            resultJSON['flowData'][i]['acl_uuid'] =
                global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
            resultJSON['flowData'][i]['out_acl_uuid'] =
                commonUtils.getSafeDataToJSONify(getAclUUIDByFlowAclInfo(flowData[i]['out_policy']));
            delete resultJSON['flowData'][i]['out_policy'];
        } catch(e) {
            resultJSON['flowData'][i]['out_acl_uuid'] =
                global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
            resultJSON['flowData'][i]['sg_uuid'] =
                commonUtils.getSafeDataToJSONify(getAclUUIDByFlowAclInfo(flowData[i]['sg']));
            delete resultJSON['flowData'][i]['sg'];
        } catch(e) {
            resultJSON['flowData'][i]['sg_uuid'] =
                global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
            resultJSON['flowData'][i]['out_sg_uuid'] =
                commonUtils.getSafeDataToJSONify(getAclUUIDByFlowAclInfo(flowData[i]['out_sg']));
            delete resultJSON['flowData'][i]['out_sg'];
        } catch(e) {
            resultJSON['flowData'][i]['out_sg_uuid'] =
                global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
            resultJSON['flowData'][i]['bytes'] =
                commonUtils.getSafeDataToJSONify(resultJSON['flowData'][i]['stats_bytes']);
            delete resultJSON['flowData'][i]['stats_bytes'];
        } catch(e) {
            resultJSON['flowData'][i]['bytes'] = global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
        resultJSON['flowData'][i]['packets'] =
            commonUtils.getSafeDataToJSONify(resultJSON['flowData'][i]['stats_packets']);
            delete resultJSON['flowData'][i]['stats_packets'];
        } catch(e) {
            resultJSON['flowData'][i]['packets'] =
                global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
            resultJSON['flowData'][i]['source_vn'] =
                commonUtils.getSafeDataToJSONify(resultJSON['flowData'][i]['src_vn']);
            delete resultJSON['flowData'][i]['src_vn'];
        } catch(e) {
            resultJSON['flowData'][i]['source_vn'] =
                global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
            resultJSON['flowData'][i]['dest_vn'] =
                commonUtils.getSafeDataToJSONify(resultJSON['flowData'][i]['dst_vn']);
            delete resultJSON['flowData'][i]['dst_vn'];
        } catch(e) {
            resultJSON['flowData'][i]['dest_vn'] =
                global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
            resultJSON['flowData'][i]['src_ip'] =
                commonUtils.getSafeDataToJSONify(resultJSON['flowData'][i]['sip']);
            delete resultJSON['flowData'][i]['sip'];
        } catch(e) {
            resultJSON['flowData'][i]['src_ip'] =
                global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
            resultJSON['flowData'][i]['dst_ip'] =
                commonUtils.getSafeDataToJSONify(resultJSON['flowData'][i]['dip']);
            delete resultJSON['flowData'][i]['dip'];
        } catch(e) {
            resultJSON['flowData'][i]['dst_ip'] =
                global.RESP_DATA_NOT_AVAILABLE;
        }
    }
    return resultJSON;
}

function parsevRouterFlowsSandeshData (flowSandeshData)
{
    var lastIndex = 0;
    var flowData = jsonPath(flowSandeshData, "$..SandeshFlowData");
    var resultArr = [];
    var resultJSON = {};

    try {
        if (flowData.length > 0) {
            commonUtils.createJSONBySandeshResponseArr(resultArr, flowData[0], lastIndex);
            resultJSON['flow_key'] =
            commonUtils.getSafeDataToJSONify(flowSandeshData[0]['FlowRecordsResp']
                                             ['flow_key'][0]['_']);
            resultJSON['flowData'] = resultArr;
            resultJSON =
                postParsevRouterFlowsSandeshData(resultJSON, flowData[0]);
        }
    } catch(e) {
    }
    return resultJSON;
}

function getvRouterPagedSummary (req, res, appData)
{
    var addGen = req.param('addGen');
    var count = req.param('count');
    var lastKey = req.param('lastKey');
    var found = false;
    var retLastUUID = null;
    var resultJSON = {};
    var matchStr = 'name';

    resultJSON['data'] = [];
    resultJSON['lastKey'] = null;
    resultJSON['more'] = false;

    if (null != count) {
        count = parseInt(count);
    } else {
        count = -1;
    }
    infraCmn.getvRouterList(appData, function(err, data, uuidList) {
        if (err) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        var result =
            infraCmn.getNodeListByLastKey(data, count, lastKey, matchStr,
                                          uuidList);
        if (null == result) {
            commonUtils.handleJSONResponse(null, res, resultJSON);
            return;
        }
        infraCmn.dovRouterListProcess(null, result['uuidList'],
                                          result['nodeList'],
                                          addGen, appData,
                                          function(err, data) {
            resultJSON['lastKey'] = result['lastKey'];
            resultJSON['data'] = data;
            resultJSON['more'] = result['more'];
            commonUtils.handleJSONResponse(err, res, resultJSON);
        });
    });
}

function getvRoutersSummaryByJob (req, res, appData)
{
    var url = '/virtual-routers';
    var forceRefresh = req.param('forceRefresh');
    var key = global.STR_GET_VROUTERS_SUMMARY;
    var config = configUtils.getConfig();

    if (null == forceRefresh) {
        forceRefresh = false;
    } else {
        forceRefresh = true;
    }
    var objData = infraCmn.fillIntrospectPortInJobData(req, objData);
    var reqObj = {req: req, res: res, jobName: key, reqUrl: url,
        sendToJobServerAlways: forceRefresh, appData: objData};
    if (true == config.serviceEndPointFromConfig) {
        reqObj.nextRunDelay = global.VROUTER_SUMM_JOB_REFRESH_TIME;
        reqObj.jobRunCount = 0; /* Infinite time */
    }
    cacheApi.queueDataFromCacheOrSendRequestByReqObj(reqObj);
}

function getvRouterGenerators (req, res, appData)
{
    var url = '/virtual-routers';
    var key = global.STR_GET_VROUTERS_GENERATORS;
    var forceRefresh = req.param['forceRefresh'];
    var objData = infraCmn.fillIntrospectPortInJobData(req, objData);
    var reqObj = {req: req, res: res, jobName: key, reqUrl: url,
        sendToJobServerAlways: forceRefresh, appData: objData};
    var config = configUtils.getConfig();
    if (true == config.serviceEndPointFromConfig) {
        reqObj.nextRunDelay = global.VROUTER_SUMM_JOB_REFRESH_TIME;
        reqObj.jobRunCount = 0; /* Infinite time */
    }
    cacheApi.queueDataFromCacheOrSendRequestByReqObj(reqObj);
}

/* Function: getComputeNodesSummary
    This function is used to get the summary of vRouters */
function getvRoutersSummary (req, res, appData)
{
    var url = '/virtual-routers';
    var resultJSON = [];
    var configData = [], uveData = [];
    var addGen = req.param('addGen');
    var count = req.param('count');
    var lastKey = req.param('lastKey');
    if ((null != count) || (null != lastKey)) {
        getvRouterPagedSummary(req, res, appData);
        return;
    }

    configApiServer.apiGet(url, appData,
                           commonUtils.doEnsureExecution(function(err, data) {
        dovRouterListPostProcess(data, null, null, addGen, appData,
                                 function(err, resultJSON) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
        });
    }, global.DEFAULT_CB_TIMEOUT));
}

function getvRouterDetails (req, res, appData)
{
    var host        = req.param('hostname');
    var flatParse   = req.param('flat');
    var basic       = req.param('basic');
    var url         = '/analytics/uves/vrouter';
    var resultJSON = {};
    var postData = {};
    postData['kfilt'] = [host];
    if(basic != null && basic == "true") {
        postData['cfilt'] = [
            'VrouterAgent:virtual_machine_list',
            'VrouterAgent:self_ip_list',
            'VrouterAgent:sandesh_http_port',
            'VrouterAgent:xmpp_peer_list',
            'VrouterAgent:vmi_count',
            'VrouterAgent:down_interface_count',
            'VrouterAgent:control_ip',
            'VrouterAgent:vn_count',
            'VrouterAgent:build_info',
            'VrouterAgent:platform',
            'VrouterStatsAgent', 'NodeStatus',
            'UVEAlarms','ContrailConfig'];
    }

    opApiServer.apiPost(url, postData, appData,
                     commonUtils.doEnsureExecution(function(err, data) {
        if ((null != err) || (null == data)) {
            data = {};
            infraCmn.getDataFromConfigNode('virtual-routers', host, appData,
                                           data, function(err, resultJSON) {
                commonUtils.handleJSONResponse(err, res, resultJSON);
            });
        } else {
            if(data['value'] != null && data['value'][0] != null && data['value'][0]['value'] != null) {
                data = data['value'][0]['value'];
            } else {
                data = {};
            }
            var postData = {};
            postData['kfilt'] = [host + ':*contrail-vrouter-agent*',host + ':*TorAgent*'];
            infraCmn.addGeneratorInfoToUVE(postData, data, host,
                                  ['contrail-vrouter-agent', 'TorAgent'],
                                  appData, function(err, data) {
                infraCmn.getDataFromConfigNode('virtual-routers', host, appData,
                                               data, function(err, data) {
                    commonUtils.handleJSONResponse(null, res, data);
                });
            });
        }
    }, global.DEFAULT_CB_TIMEOUT));
}

function getvRouterFlowsDetail (req, res, appData)
{
    var queryData = urlMod.parse(req.url, true);
    var flowKey = queryData.query['flowKey'];
    var ip = queryData.query['ip'];
    var aclUUID = queryData.query['aclUUID'];
    var iterKey = queryData.query['iterKey'];
    var introspectPort = queryData.query['introspectPort'];
    var resultJSON = [];
    var isFetchAll = false;
    var dataObjArr = [];

    var reqUrl= null;

    if ((null == aclUUID) && (null == iterKey)) {
        if (null == flowKey) {
            reqUrl = '/Snh_FetchAllFlowRecords?';
        } else {
            reqUrl = '/Snh_NextFlowRecordsSet?flow_key=' + flowKey;
        }
        isFetchAll = true;
    } else {
        if (null == iterKey) {
            reqUrl = '/Snh_AclFlowReq?x=' + aclUUID;
        } else {
            reqUrl = '/Snh_NextAclFlowReq?x=' + iterKey;
        }
    }

    var vRouterRestApi =
        commonUtils.getRestAPIServer(ip,
                                     infraCmn.getvRouetrIntrospectPort(introspectPort),
                                     global.SANDESH_API);

    commonUtils.createReqObj(dataObjArr, reqUrl);
    infraCmn.sendSandeshRequest(req, res, dataObjArr, vRouterRestApi);
}

function dovRouterListPostProcess (configData, uuidList, nodeList, addGen,
                                   appData, callback)
{
    var uveData = [];
    var confData = [];
    getvRouterDetailConfigUVEData(configData, uuidList, nodeList, addGen, appData,
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
            infraCmn.checkAndGetSummaryJSON(confData, uveData,
                                            ['contrail-vrouter-agent']);
        callback(null, resultJSON);
    });
}

function getvRouterDetailConfigUVEData (configData, uuidList, nodeList, addGen,
                                        appData, callback)
{
    var dataObjArr = [];
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
    for (var i = 0; i < len; i++) {
        var uuid = (null != configData) ?
            configData['virtual-routers'][i]['uuid'] : uuidList[i];
        var reqUrl = '/virtual-router/' + uuid;
        commonUtils.createReqObj(dataObjArr, reqUrl,
                                 global.HTTP_REQUEST_GET, null, configApiServer, null,
                                 appData);
    }
    reqUrl = '/analytics/uves/vrouter';
    var postData = {};
    if (null != nodeList) {
        postData['kfilt'] = nodeList;
    }
    postData['cfilt'] = ['VrouterStatsAgent:cpu_info',
        'VrouterAgent:virtual_machine_list',
        'VrouterAgent:vn_count',
        'VrouterAgent:self_ip_list',
        'VrouterAgent:xmpp_peer_list',
        'VrouterAgent:vmi_count',
        'VrouterAgent:down_interface_count', 'VrouterAgent:connected_networks',
        'VrouterAgent:control_ip', 'VrouterAgent:build_info',
        'VrouterAgent:platform',
        'VrouterStatsAgent:cpu_share', 'NodeStatus', 'UVEAlarms',
        'VrouterStatsAgent:flow_rate'];
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                             postData, opApiServer, null, appData);
    if (null != addGen) {
        reqUrl = '/analytics/uves/generator';
        var postData = {};

        postData['kfilt'] = [];
        if (null != nodeList) {
            var nodeCnt = nodeList.length;
            var kfilt = ['contrail-vrouter-agent'];
            var kLen = kfilt.length;
            for (var i = 0; i < nodeCnt; i++) {
                for (var j = 0; j < kLen; j++) {
                    postData['kfilt'].push(nodeList[i] + ':*' + kfilt[j] + '*');
                }
            }
        } else {
            postData['kfilt'] = ['*:contrail-vrouter-agent*'];
        }
        postData['cfilt'] = ['ModuleClientState:client_info',
                             'ModuleServerState:generator_info'];

        commonUtils.createReqObj(dataObjArr, reqUrl,
                                 global.HTTP_REQUEST_POST,
                                 postData, opApiServer, null, appData);
    }
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(configApiServer, true),
              function(err, results) {
        callback(err, results, len);
    });
}

// Handle request to get a JSON of Virtual Routers
function getVirtualRouters (req, res, appData)
{
    adminApiHelper.processVirtualRouters(req, res, global.GET_VIRTUAL_ROUTERS,
                                         null, appData);
};

function getComputeNodeVN (req, res, appData)
{
    var queryData = urlMod.parse(req.url, true);
    var ip = queryData.query['ip'];
    var introspectPort = queryData.query['introspectPort'];
    var dataObjArr = [];

    var vRouterRestAPI =
        commonUtils.getRestAPIServer(ip,
                                     infraCmn.getvRouetrIntrospectPort(introspectPort),
                                     global.SANDESH_API);
    if(queryData['query'] != null && queryData['query']['x'] != null) {
        commonUtils.createReqObj(dataObjArr, '/Snh_PageReq?x=' + queryData['query']['x']);
    } else if(queryData['query'] != null && queryData['query']['vnNameFilter'] != null) {
        commonUtils.createReqObj(dataObjArr, '/Snh_VnListReq?name=' + queryData['query']['vnNameFilter']);
    } else {
        commonUtils.createReqObj(dataObjArr, '/Snh_VnListReq?name=');
    }

    async.map(dataObjArr,
              commonUtils.getServerRespByRestApi(vRouterRestAPI, false),
              function(err, data) {
        if ((null == err) && (null != data)) {
            commonUtils.handleJSONResponse(null, res, data);
        } else {
            infraCmn.sendServerRetrieveError(res);
        }
    });
}

function getComputeNodeInterface (req, res, appData)
{
    var queryData = urlMod.parse(req.url, true);
    var url = "";
    var urlParamObj = {};
    urlParamObj['name'] = queryData.query['name'];
    urlParamObj['type'] = queryData.query['type'];
    urlParamObj['uuid'] = queryData.query['uuid'];
    urlParamObj['vn'] = queryData.query['vn'];
    urlParamObj['mac'] = queryData.query['mac'];
    urlParamObj['ipv4_address'] = queryData.query['ipv4_address'];
    urlParamObj['ipv6_address'] = queryData.query['ipv6_address'];
    urlParamObj['parent_uuid'] = queryData.query['parent_uuid'];
    if(queryData.query['x']) {
        urlParamObj['x'] = queryData.query['x'];
    }
    if(urlParamObj['x'] == null) {
        url = '/Snh_ItfReq?' + qs.stringify(urlParamObj);
    } else {
        url = '/Snh_PageReq?x=' + urlParamObj['x'];
    }
    urlParamObj['url'] = url;
    if (queryData.query['ip']) {
        urlParamObj['ip'] = queryData.query['ip'];
    }
    if (queryData.query['introspectPort']) {
        urlParamObj['introspectPort'] = queryData.query['introspectPort'];
    }
    cacheApi.queueDataFromCacheOrSendRequest(req, res,
                                             global.STR_JOB_TYPE_CACHE,
                                             global.STR_GET_COMPUTE_NODE_INTERFACE,
                                             url, 0, 1, 0, -1, true, urlParamObj);
}

function getComputeNodeAcl (req, res, appData)
{
    var queryData = urlMod.parse(req.url, true);
    var url = "";
    var urlParamObj = {};
    if(queryData.query['uuid']) {
        urlParamObj['uuid'] = queryData.query['uuid'];
    }
    if(queryData.query['x']) {
        urlParamObj['x'] = queryData.query['x'];
    }
    if (urlParamObj['x'] == null) {
        url = '/Snh_AclReq?' + qs.stringify(urlParamObj);
    } else {
        url = '/Snh_PageReq?x=' + urlParamObj['x'];
    }
    urlParamObj['url'] = url;
    if (queryData.query['ip']) {
        urlParamObj['ip'] = queryData.query['ip'];
    }
    if (queryData.query['introspectPort']) {
        urlParamObj['introspectPort'] = queryData.query['introspectPort'];
    }
    // var objData = infraCmn.fillIntrospectPortInJobData(req, objData);
    cacheApi.queueDataFromCacheOrSendRequest(req, res,
                                             global.STR_JOB_TYPE_CACHE,
                                             global.STR_GET_COMPUTE_NODE_ACL,
                                             url, 0, 1, 0, -1, true, urlParamObj);
}

function getComputeNodeAclFlows (req, res, appData)
{
    var queryData = urlMod.parse(req.url, true);
    var url = "";
    if (queryData.query['ip']) {
        url = '/Snh_AclReq?uuid=' + queryData.query['ip'];
    } else {
        url = '/Snh_AclReq?uuid=';
    }
    var objData = infraCmn.fillIntrospectPortInJobData(req, objData);
    cacheApi.queueDataFromCacheOrSendRequest(req, res,
                                             global.STR_JOB_TYPE_CACHE,
                                             global.STR_GET_COMPUTE_NODE_ACL_FLOWS,
                                             url, 0, 1, 0, -1, true, objData);
}

function getVrfIndexList (ip, introspectPort, callback)
{
    var dataObjArr = [];
    var urlLists = [];
    var lastIndex = 0;
    var resultArr = [];
    var vRouterSandeshParams = {apiName: global.SANDESH_API};

    urlLists[0] = ip + '@' + infraCmn.getvRouetrIntrospectPort(introspectPort) + '@' +
        '/Snh_VrfListReq?_x=';
    async.map(urlLists,
              commonUtils.getDataFromSandeshByIPUrl(rest.getAPIServer, true,
                                                    vRouterSandeshParams),
              function(err, data) {
        if (data) {
            var vrfData = jsonPath(data, "$..VrfSandeshData");
            if (vrfData.length == 0) {
                callback(null);
                return;
            }
            commonUtils.createJSONBySandeshResponseArr(resultArr, vrfData[0],
                                                       lastIndex);
            if (resultArr) {
                callback(resultArr);
                return;
            }
        }
        callback(null);
    });
}

function getvRouterUCastRoutes (req, res) {
    var ip = req.param('ip');
    var ucIndex = req.param('vrfindex');
    var introspectPort = req.param('introspectPort');
    var index = 0;
    var dataObjArr = [];
    var vRouterRestAPI =
        commonUtils.getRestAPIServer(ip,
                                     infraCmn.getvRouetrIntrospectPort(introspectPort),
                                     global.SANDESH_API);

    //If vrfIndex is passed
    if (null != ucIndex) {
        if(req.param('x') == null) {
            commonUtils.createReqObj(dataObjArr, '/Snh_Inet4UcRouteReq?vrf_index=' +
                                    ucIndex);
         } else  {
            commonUtils.createReqObj(dataObjArr, '/Snh_PageReq?x=' +
                                    req.param('x'));
         }
        sendvRouterRoutes(req, res, dataObjArr, vRouterRestAPI);
        return;
    }
    /* First get the ucindex from VRF */
    getVrfIndexList(ip, introspectPort, function(results) {
        if (null == results) {
            commonUtils.handleJSONResponse(null, res, []);
            return;
        }
        var vrfListLen = results.length;
        for (var i = 0; i < vrfListLen; i++) {
            commonUtils.createReqObj(dataObjArr,
                                     '/Snh_Inet4UcRouteReq?vrf_index=' +
                                     results[i]['ucindex']);
        }
        async.map(dataObjArr,
                  commonUtils.getServerRespByRestApi(vRouterRestAPI,
                                                     false),
                  function(err, data) {
            if ((null == err) && (null != data)) {
                commonUtils.handleJSONResponse(null, res, data);
            } else {
                infraCmn.sendServerRetrieveError(res);
            }
        });
    });
}

function getvRouterL2Routes (req, res)
{
    var ip = req.param('ip');
    var vrfIndex = req.param('vrfindex');
    var introspectPort = req.param('introspectPort');
    var index = 0;
    var dataObjArr = [];
    var vRouterRestAPI =
        commonUtils.getRestAPIServer(ip,
                                     infraCmn.getvRouetrIntrospectPort(introspectPort),
                                     global.SANDESH_API);

    if (null != vrfIndex) {
        if(req.param('x') == null) {
            commonUtils.createReqObj(dataObjArr, '/Snh_Layer2RouteReq?x=' +
                                 vrfIndex);
        } else {
            commonUtils.createReqObj(dataObjArr, '/Snh_PageReq?x=' +
                                    req.param('x'));
        }
        sendvRouterRoutes(req, res, dataObjArr, vRouterRestAPI);
        return;
    }
    /* First get the l2index from VRF List */
    getVrfIndexList(ip, introspectPort, function(results) {
        if (null == results) {
            commonUtils.handleJSONResponse(null, res, []);
            return;
        }
        var vrfListLen = results.length;
        for (var i = 0; i < vrfListLen; i++) {
            commonUtils.createReqObj(dataObjArr,
                                     '/Snh_Layer2RouteReq?x=' +
                                     results[i]['l2index']);
        }
        async.map(dataObjArr,
                  commonUtils.getServerRespByRestApi(vRouterRestAPI,
                                                     false),
                  function(err, data) {
            if ((null == err) && (null != data)) {
                commonUtils.handleJSONResponse(null, res, data);
            } else {
                infraCmn.sendServerRetrieveError(res);
            }
        });
    });
}

function getvRouterUCast6Routes (req, res) {
    var ip = req.param('ip');
    var uc6index = req.param('vrfindex');
    var introspectPort = req.param('introspectPort');
    var index = 0;
    var dataObjArr = [];
    var vRouterRestAPI =
        commonUtils.getRestAPIServer(ip,
                                     infraCmn.getvRouetrIntrospectPort(introspectPort),
                                     global.SANDESH_API);
    if (null != uc6index) {
        if(req.param('x') == null) {
            commonUtils.createReqObj(dataObjArr, '/Snh_Inet6UcRouteReq?vrf_index=' +
                                    uc6index);
        } else {
            commonUtils.createReqObj(dataObjArr, '/Snh_PageReq?x=' +
                                    req.param('x'));
        }
        sendvRouterRoutes(req, res, dataObjArr, vRouterRestAPI);
        return;
    }
    /* First get the uc6index from VRF */
    getVrfIndexList(ip, introspectPort, function(results) {
        if (null == results) {
            commonUtils.handleJSONResponse(null, res, []);
            return;
        }
        var vrfListLen = results.length;
        for (var i = 0; i < vrfListLen; i++) {
            commonUtils.createReqObj(dataObjArr,
                                     '/Snh_Inet6UcRouteReq?vrf_index=' +
                                     results[i]['uc6index']);
        }
        async.map(dataObjArr,
                  commonUtils.getServerRespByRestApi(vRouterRestAPI,
                                                     true),
                  function(err, data) {
            if ((null == err) && (null != data)) {
                commonUtils.handleJSONResponse(null, res, data);
            } else {
                infraCmn.sendServerRetrieveError(res);
            }
        });
    });
}

function sendvRouterRoutes (req, res, dataObjArr, vRouterRestAPI)
{
    async.map(dataObjArr,
              commonUtils.getServerRespByRestApi(vRouterRestAPI,
                                                 false),
        function(err, data) {
        if ((null == err) && (null != data)) {
            commonUtils.handleJSONResponse(null, res, data);
        } else {
            infraCmn.sendServerRetrieveError(res);
        }
    });
}

function getvRouterMCastRoutes (req, res) {
    var index = 0;
    var ip = req.param('ip');
    var vrfIndex = req.param('vrfindex');
    var introspectPort = req.param('introspectPort');

    var dataObjArr = [];
    var vRouterRestAPI =
        commonUtils.getRestAPIServer(ip,
                                     infraCmn.getvRouetrIntrospectPort(introspectPort),
                                     global.SANDESH_API);
    if (null != vrfIndex) {
        if(req.param('x') == null) {
            commonUtils.createReqObj(dataObjArr, '/Snh_Inet4McRouteReq?vrf_index=' +
                                    vrfIndex);
        } else {
            commonUtils.createReqObj(dataObjArr, '/Snh_PageReq?x=' +
                                    req.param('x'));
        }
        sendvRouterRoutes(req, res, dataObjArr, vRouterRestAPI);
        return;
    }
    /* First get the mcindex from VRF */
    getVrfIndexList(ip, introspectPort, function(results) {
        if (null == results) {
            commonUtils.handleJSONResponse(null, res, []);
            return;
        }
        var vrfListLen = results.length;
        for (var i = 0; i < vrfListLen; i++) {
            commonUtils.createReqObj(dataObjArr,
                                     '/Snh_Inet4McRouteReq?vrf_index=' +
                                     results[i]['mcindex']);
        }
        async.map(dataObjArr,
                  commonUtils.getServerRespByRestApi(vRouterRestAPI,
                                                     false),
                  function(err, data) {
            if ((null == err) && (null != data)) {
                commonUtils.handleJSONResponse(null, res, data);
            } else {
                infraCmn.sendServerRetrieveError(res);
            }
        });
    });
}

function getvRouterVrfList (req, res)
{
    var ip = req.param('ip');
    var introspectPort = req.param('introspectPort');
    var urlLists = [];
    var lastIndex = 0;
    var resultArr = [];

    urlLists[0] = ip + '@' + infraCmn.getvRouetrIntrospectPort(introspectPort) + '@' +
        // '/Snh_VrfListReq?name=';
        '/Snh_PageReq?x=begin:-1,end:-1,table:db.vrf.0&name=';
    var params = {'isRawData': true, apiName: global.SANDESH_API}
    async.map(urlLists,
            commonUtils.getDataFromSandeshByIPUrl(rest.getAPIServer, false, params),
              function(err, results) {
        if ((null == err) && (null != results) && (null != results[0])) {
            commonUtils.handleJSONResponse(null, res, results[0],false);
        } else {
            commonUtils.handleJSONResponse(err, res, null);
        }

    });
}

function getVirtualMachineInterfacesPervRouter (req, res, appData)
{
    var resultJSON = {};
    var vrouter = req.param('vrouter');
    var url = '/analytics/uves/vrouter';
    var postData = {};
    postData['kfilt'] = [vrouter];
    postData['cfilt'] = ['VrouterAgent:virtual_machine_list'];
    opApiServer.apiPost(url, postData, appData, function(err, vmList) {
        if ((null != err) || (null == vmList) || (null == vmList['value']) ||
            (!vmList['value'].length)) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        var vmUUIDList = jsonPath(vmList, "$..virtual_machine_list");
        if (!vmUUIDList.length) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        postData['kfilt'] = [];
        var uuidLen = vmUUIDList[0].length;
        for (var i = 0; i < uuidLen; i++) {
            postData['kfilt'].push(vmUUIDList[0][i]);
        }
        url = '/analytics/uves/virtual-machine';
        postData['cfilt'] = ['UveVirtualMachineAgent:interface_list'];
        opApiServer.apiPost(url, postData, appData, function(err, intfList) {
            commonUtils.handleJSONResponse(err, res, intfList);
        });
    });
}

exports.getvRoutersSummaryByJob = getvRoutersSummaryByJob;
exports.getvRouterPagedSummary = getvRouterPagedSummary;
exports.getvRouterGenerators = getvRouterGenerators;
exports.getvRouterDetails = getvRouterDetails;
exports.getvRouterFlowsDetail = getvRouterFlowsDetail;
exports.getvRoutersSummary = getvRoutersSummary;
exports.getVirtualRouters = getVirtualRouters;
exports.getComputeNodeVN = getComputeNodeVN;
exports.getComputeNodeInterface = getComputeNodeInterface;
exports.getComputeNodeAcl = getComputeNodeAcl;
exports.getComputeNodeAclFlows = getComputeNodeAclFlows;
exports.getvRouterUCastRoutes = getvRouterUCastRoutes;
exports.getvRouterMCastRoutes = getvRouterMCastRoutes;
exports.getvRouterVrfList = getvRouterVrfList;
exports.getvRouterL2Routes = getvRouterL2Routes;
exports.getvRouterUCast6Routes = getvRouterUCast6Routes;
exports.getVirtualMachineInterfacesPervRouter =
    getVirtualMachineInterfacesPervRouter
