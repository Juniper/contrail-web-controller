/*

 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var nwMonApi = module.exports;

var cacheApi = require(process.mainModule.exports["corePath"] + '/src/serverroot/web/core/cache.api'),
    global = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/global'),
    messages = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/messages'),
    commonUtils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/common.utils'),
    rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api'),
    authApi = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/auth.api'),
    opApiServer = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/opServer.api'),
    configApiServer = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/configServer.api'),
    logutils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/log.utils'),
    infraCmn = require('../../../common/api/infra.common.api'),
    nwMonUtils = require('../../../common/api/nwMon.utils'),
    ctrlGlobal = require('../../../common/api/global'),
    nwMonJobs = require('../jobs/network.mon.jobs.js'),
    appErrors = require(process.mainModule.exports["corePath"] + '/src/serverroot/errors/app.errors'),
    async = require('async'),
    jsonPath = require('JSONPath').eval,
    flowCache = require('../../../common/api/flowCache.api'),
    qeUtils = require(process.mainModule.exports["corePath"] +
                      '/webroot/reports/qe/api/query.utils'),
    _ = require("underscore"),
    lodash = require("lodash"),
    assert = require('assert');

var uveListExpTime = 10 * 60; // 10 Minutes

var instanceDetailsMap = {
    vcenter: getInstancesDetailsForUser
}

var virtualNetworkDetailsMap = {
    vcenter: getVirtualNetworksForUser
}

function getFlowSeriesByVN(req, res) {
    var minsSince = req.query['minsSince'];
    var vnName = req.query['srcVN'];
    var sampleCnt = req.query['sampleCnt'];
    var dstVN = req.query['destVN'];
    var srcVN = req.query['srcVN'];
    var fqName = req.query['fqName'];
    var startTime = req.query['startTime'];
    var endTime = req.query['endTime'];
    var relStartTime = req.query['relStartTime'];
    var relEndTime = req.query['relEndTime'];
    var timeGran = req.query['timeGran'];
    var minsAlign = req.query['minsAlign'];
    var useServerTime = req.query['useServerTime'];
    var vrouter = req.query['vrouter'];
    var reqKey;

    if (null == dstVN) {
        dstVN = "";
        srcVN = fqName;
        reqKey = global.GET_FLOW_SERIES_BY_VN;
    } else {
        reqKey = global.GET_FLOW_SERIES_BY_VNS;
    }

    var appData = {
        minsSince: minsSince,
        minsAlign: minsAlign,
        srcVN: srcVN,
        dstVN: dstVN,
        sampleCnt: sampleCnt,
        startTime: startTime,
        endTime: endTime,
        relStartTime: relStartTime,
        relEndTime: relEndTime,
        timeGran: timeGran,
        useServerTime: useServerTime,
        vrouter: vrouter,
        minsAlign: minsAlign
    };

    var reqUrl = "/flow_series/VN=";
    cacheApi.queueDataFromCacheOrSendRequest(req, res, global.STR_JOB_TYPE_CACHE,
        reqKey, reqUrl,
        0, 1, 0, -1, true, appData);
}

function getProjectSummary(req, res, appData) {
    var urlLists = [];
    var project = req.param('fqName');
    url = "/virtual-networks?parent_type=project&parent_fq_name_str=" + project;
    getProjectData({url: url, appData: appData}, function (err, results) {
        if (err || (null == results)) {
            commonUtils.handleJSONResponse(err, res, null);
        } else {
            commonUtils.handleJSONResponse(null, res, results['virtual-networks']);
        }
    });
}

function getNetworkStats(req, res) {
    var fqName = req.query['fqName'];
    var type = req.query['type'];
    var limit = req.query['limit'];
    var minsSince = req.query['minsSince'];
    var protocol = req.query['protocol'];
    var startTime = req.query['startTime'];
    var endTime = req.query['endTime'];
    var useServerTime = req.query['useServerTime'];
    var ip = req.query['ip'];
    var reqKey;

    var appData = {
        minsSince: minsSince,
        fqName: fqName,
        limit: limit,
        startTime: startTime,
        endTime: endTime,
        useServerTime: useServerTime,
        protocol: protocol,
        ip: ip
    };
    if (type == 'port') {
        reqKey = global.STR_GET_TOP_PORT_BY_NW;
        if (req.query['portRange']) {
            appData['portRange'] = req.query['portRange'];
        }
    } else {
        var err =
            appErrors.RESTServerError(messages.error.monitoring.invalid_type_provided,
                                      reqKey);
        commonUtils.handleJSONResponse(err, res, null);
        return;
    }

    var url = '/virtual-network/stats';
    cacheApi.queueDataFromCacheOrSendRequest(req, res, global.STR_JOB_TYPE_CACHE,
                                             reqKey, url, 0, 1, 0, -1, true,
                                             appData);
}

function getVNStatsSummary(req, res, appData) {
    var vnName = req.param('fqName');
    var url = '/analytics/uves/virtual-network/' + vnName;
    var json = {};
        opApiServer.apiGet(url, appData, function (error, vnJSON) {
            var resultJSON = {};
            if (!error && (vnJSON)) {
                var resultJSON = {};
                resultJSON['virtual-networks'] = [];
                resultJSON['virtual-networks'][0] = {};
                resultJSON['virtual-networks'][0]['fq_name'] = vnName.split(':');
                populateInOutTraffic(resultJSON, vnJSON, 0);
                try {
                    json = resultJSON['virtual-networks'][0];
                } catch (e) {
                    logutils.logger.error("In getVNStatsSummary(), JSON parse error: " + e);
                    json = {};
                }
                commonUtils.handleJSONResponse(null, res, json);
            } else {
                commonUtils.handleJSONResponse(error, res, json);
            }
        });
}

function getFlowSeriesByVM(req, res) {
    var vnName = req.query['fqName'];
    var sampleCnt = req.query['sampleCnt'];
    var minsSince = req.query['minsSince'];
    var ip = req.query['ip'];
    var startTime = req.query['startTime'];
    var endTime = req.query['endTime'];
    var relStartTime = req.query['relStartTime'];
    var relEndTime = req.query['relEndTime'];
    var timeGran = req.query['timeGran'];
    var minsAlign = req.query['minsAlign'];
    var useServerTime = req.query['useServerTime'];
    var vmName = req.query['vmName'];
    var vmVnName = req.query['vmVnName'];
    var fip = req.query['fip'];
    var appData = {
        ip: ip,
        vnName: vnName,
        vmName: vmName,
        vmVnName: vmVnName,
        fip: fip,
        sampleCnt: sampleCnt,
        minsSince: minsSince,
        minsAlign: minsAlign,
        startTime: startTime,
        endTime: endTime,
        relStartTime: relStartTime,
        relEndTime: relEndTime,
        timeGran: timeGran,
        useServerTime: useServerTime,
        minsAlign: minsAlign
    };
    var reqUrl = "/flow_series/VM=";
    cacheApi.queueDataFromCacheOrSendRequest(req, res, global.STR_JOB_TYPE_CACHE,
        global.GET_FLOW_SERIES_BY_VM, reqUrl,
        0, 1, 0, -1, true, appData);
}

function getVMStatByInterface(vmStat, vmVnName) {
    var resultJSON = {};
    var data;
    try {
        var len = vmStat.length;
        for (var i = 0; i < len; i++) {
            try {
                data = vmStat[i];
                if (data['name']['#text'] == vmVnName) {
                    break;
                }
            } catch (e) {
                logutils.logger.error("In getVMStatByInterface(): Data JSON Parse error:" + e);
                continue;
            }
        }
        if (i == len) {
            return resultJSON;
        }
        resultJSON = commonUtils.createJSONByUVEResponse(resultJSON, data);
    } catch (e) {
        logutils.logger.error("In getVMStatByInterface(): JSON Parse error:" + e);
    }
    return resultJSON;
}

function initVmStatResultData(resultJSON, vmName) {
    resultJSON['name'] = vmName;
    resultJSON['in_pkts'] = 0;
    resultJSON['in_bytes'] = 0;
    resultJSON['out_pkts'] = 0;
    resultJSON['out_bytes'] = 0;
}

function getVMStatsSummary(req, res, appData) {
    var url;
    var vmVnName = req.query['vmVnName'];
    var resultJSON = {};

    try {
        var vmName = vmVnName.split(':')[0];
    } catch (e) {
        commonUtils.handleJSONResponse(null, res, {});
        return;
    }

    initVmStatResultData(resultJSON, vmVnName);
    url = '/analytics/uves/virtual-machine/' + vmName;

        opApiServer.apiGet(url, appData, function (err, data) {
            var statData = jsonPath(data, "$..VmInterfaceAgentStats");
            if (statData.length > 0) {
                var data = getVMStatByInterface(statData[0], vmVnName);
                commonUtils.handleJSONResponse(null, res, data);
            } else {
                commonUtils.handleJSONResponse(null, res, resultJSON);
            }
        });
}

function getTrafficInEgrStat(resultJSON, srcVN, destVN, type) {
    var results = {};
    results['srcVN'] = srcVN;
    results['destVN'] = destVN;
    results['inBytes'] = 0;
    results['inPkts'] = 0;
    results['outBytes'] = 0;
    results['outPkts'] = 0;
    if (type != global.FlOW_SERIES_STAT_TYPE) {
        var inStat = resultJSON['in_stats'];
        var outStat = resultJSON['out_stats'];
        var inStatLen = inStat.length;
        var outStatLen = outStat.length;
        for (var i = 0; i < inStatLen; i++) {
            if (destVN == inStat[i]['other_vn']) {
                results['inBytes'] = inStat[i]['bytes'];
                results['inPkts'] = inStat[i]['tpkts'];
                break;
            }
        }
        for (var i = 0; i < outStatLen; i++) {
            if (destVN == outStat[i]['other_vn']) {
                results['outBytes'] = outStat[i]['bytes'];
                results['outPkts'] = outStat[i]['tpkts'];
                break;
            }
        }
        return results;
    } else {
        if (resultJSON['vn_stats'] != null && resultJSON['vn_stats'][0]['StatTable.UveVirtualNetworkAgent.vn_stats'] != null) {
            var stats = resultJSON['vn_stats'][0]['StatTable.UveVirtualNetworkAgent.vn_stats'];
            for (var i = 0; i < stats.length; i++) {
                if (stats[i]['vn_stats.other_vn'] == destVN) {
                    results['inBytes'] = stats[i]['SUM(vn_stats.in_bytes)'] != null ? stats[i]['SUM(vn_stats.in_bytes)'] : 0;
                    results['outBytes'] = stats[i]['SUM(vn_stats.out_bytes)'] != null ? stats[i]['SUM(vn_stats.out_bytes)'] : 0;
                    results['inPkts'] = stats[i]['SUM(vn_stats.in_tpkts)'] != null ? stats[i]['SUM(vn_stats.in_tpkts)'] : 0;
                    results['outPkts'] = stats[i]['SUM(vn_stats.out_tpkts)'] != null ? stats[i]['SUM(vn_stats.out_tpkts)'] : 0;
                    break;
                }
            }
        }
        return results;
    }
}

function getVNStatsJSONSummary(resultJSON, results) {
    var len = results.length;
    var VNAgentData;
    var inStat;
    var outStat;
    for (var i = 0; i < len; i++) {
        resultJSON[i] = {};
        try {
            resultJSON[i]['vn_stats'] = results[i]['UveVirtualNetworkAgent']['vn_stats'];
        } catch (e) {
            resultJSON[i]['vn_stats'] = [];
        }
        try {
            inStat = results[i]['UveVirtualNetworkAgent']['in_stats']['list']['UveInterVnStats'];
            var inStatCnt = inStat.length;
            resultJSON[i]['in_stats'] = [];
            resultJSON[i]['out_stats'] = [];
            for (var j = 0; j < inStatCnt; j++) {
                resultJSON[i]['in_stats'][j] = {};
                resultJSON[i]['in_stats'][j]['other_vn'] =
                    inStat[j]['other_vn']['#text'];
                resultJSON[i]['in_stats'][j]['bytes'] =
                    inStat[j]['bytes']['#text'];
                resultJSON[i]['in_stats'][j]['tpkts'] =
                    inStat[j]['tpkts']['#text'];
            }
        } catch (e) {
            resultJSON[i]['in_stats'] = [];
        }
        try {
            outStat = results[i]['UveVirtualNetworkAgent']['out_stats']['list']['UveInterVnStats'];
            var outStatCnt = outStat.length;
            for (j = 0; j < outStatCnt; j++) {
                resultJSON[i]['out_stats'][j] = {};
                resultJSON[i]['out_stats'][j]['other_vn'] =
                    outStat[j]['other_vn']['#text'];
                resultJSON[i]['out_stats'][j]['bytes'] =
                    outStat[j]['bytes']['#text'];
                resultJSON[i]['out_stats'][j]['tpkts'] =
                    outStat[j]['tpkts']['#text'];
            }
        } catch (e) {
            resultJSON[i]['out_stats'] = [];
        }
    }
}

function getNetworkInGressEgressTrafficStat(srcVN, destVN, appData, callback) {
    var dataObjArr = [];
    var resultJSON = [];

    var url = '/analytics/uves/virtual-network/' + srcVN + '?flat';
    commonUtils.createReqObj(dataObjArr, url, null, null, null, null, appData);
    url = '/analytics/uves/virtual-network/' + destVN + '?flat';
    commonUtils.createReqObj(dataObjArr, url, null, null, null, null, appData);

    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(opApiServer.apiGet, true),
              function (err, results) {
            if ((null == err) && results) {
                getVNStatsJSONSummary(resultJSON, results);
                /* Now get the data */
                var jsonData = [];
                jsonData[0] = getTrafficInEgrStat(resultJSON[0], srcVN, destVN);
                jsonData[1] = getTrafficInEgrStat(resultJSON[1], destVN, srcVN);
                callback(null, jsonData);
            } else {
                callback(err, results);
            }
        });
}

function formatNetworkStatsSummary(data) {
    var results = {};
    results['fromNW'] = {};
    try {
        results['fromNW']['inBytes'] = data[0]['inBytes'];
    } catch (e) {
        results['fromNW']['inBytes'] = 0;
    }
    try {
        results['fromNW']['inPkts'] = data[0]['inPkts'];
    } catch (e) {
        results['fromNW']['inPkts'] = 0;
    }
    try {
        results['fromNW']['outBytes'] = data[0]['outBytes'];
    } catch (e) {
        results['fromNW']['outBytes'] = 0;
    }
    try {
        results['fromNW']['outPkts'] = data[0]['outPkts'];
    } catch (e) {
        results['fromNW']['outPkts'] = 0;
    }
    results['toNW'] = {};
    try {
        results['toNW']['inBytes'] = data[1]['inBytes'];
    } catch (e) {
        results['toNW']['inBytes'] = 0;
    }
    try {
        results['toNW']['inPkts'] = data[1]['inPkts'];
    } catch (e) {
        results['toNW']['inPkts'] = 0;
    }
    try {
        results['toNW']['outBytes'] = data[1]['outBytes'];
    } catch (e) {
        results['toNW']['outBytes'] = 0;
    }
    try {
        results['toNW']['outPkts'] = data[1]['outPkts'];
    } catch (e) {
        results['toNW']['outPkts'] = 0;
    }
    return results;
}

function swapInEgressData(statData) {
    var resultJSON = {};
    resultJSON['fromNW'] = {};
    resultJSON['toNW'] = {};
    resultJSON['fromNW'] = statData['fromNW'];
    resultJSON['toNW']['inBytes'] = statData['toNW']['outBytes'];
    resultJSON['toNW']['inPkts'] = statData['toNW']['outPkts'];
    resultJSON['toNW']['outBytes'] = statData['toNW']['inBytes'];
    resultJSON['toNW']['outPkts'] = statData['toNW']['inPkts'];
    return resultJSON;
}

function getNetworkStatsSummary(req, res, appData) {
    var srcVN = req.query['srcVN'];
    var destVN = req.query['destVN'];
    var urlLists = [];
    var resultJSON = [];

    getNetworkInGressEgressTrafficStat(srcVN, destVN, appData, function (err, data) {
        if ((null == err) && (data)) {
            var results = formatNetworkStatsSummary(data);
            /* Swap IN/Out Data */
            var resultJSON = swapInEgressData(results);
            commonUtils.handleJSONResponse(null, res, resultJSON);
        } else {
            commonUtils.handleJSONResponse(err, res, null);
        }
    });
}

function sendOpServerResponseByURL(url, req, res, appData) {
    opApiServer.apiGet(url, appData, function (err, data) {
        if (err || (null == data)) {
            commonUtils.handleJSONResponse(err, res, null);
        } else {
            commonUtils.handleJSONResponse(null, res, data);
        }
    });
}

function getVNSummary(fqName, data) {
    var resultJSON = [];
    try {
        uveData = data['value'];
        var vnCnt = uveData.length;
    } catch (e) {
        if ((fqName.split(':')).length == 3) {
            var tempData = {};
            tempData['value'] = [];
            tempData['value'][0] = {};
            tempData['value'][0]['name'] = fqName;
            tempData['value'][0]['value'] = data;
            return tempData;
        }
        return data;
    }
    for (var i = 0, j = 0; i < vnCnt; i++) {
        try {
            if (false == isServiceVN(uveData[i]['name'])) {
                resultJSON[j++] = uveData[i];
            }
        } catch (e) {
        }
    }
    return {'value': resultJSON};
}

function getVirtualNetworksSummary(req, res, appData) {
    var fqNameRegExp = req.query['fqNameRegExp'];
    var url = '/analytics/uves/virtual-network/';
    var fqn = fqNameRegExp;
    var fqNameArr = fqNameRegExp.split(':');
    if (fqNameArr) {
        var len = fqNameArr.length;
        if (len == 3) {
            /* Exact VN */
            if (true == isServiceVN(fqNameRegExp)) {
                commonUtils.handleJSONResponse(null, res, {});
                return;
            }
        }
        if ((fqNameArr[len - 1] != '*') &&
            (len < 3)) {
            fqn = fqNameRegExp + ':*';
        }
    }

    url += fqn + '?flat';
    opApiServer.apiGet(url, appData, function (err, data) {
        if (err || (null == data)) {
            commonUtils.handleJSONResponse(err, res, {});
        } else {
            var resultJSON = getVNSummary(fqNameRegExp, data);
            commonUtils.handleJSONResponse(null, res, resultJSON);
        }
    });
}

function getVirtualMachine(req, res, appData) {
    var fqNameRegExp = req.query['fqNameRegExp'];
    var url = '/analytics/uves/virtual-machine/' + fqNameRegExp;
    sendOpServerResponseByURL(url, req, res, appData);
}


function getVirtualMachinesSummary(req, res, appData) {
    var reqPostData = req.body,
        kfilt = reqPostData['kfilt'], cfilt = reqPostData['cfilt'],
        url = '/analytics/uves/virtual-machine',
        opServerPostData = {};

    if (kfilt != null && kfilt != '') {
        opServerPostData['kfilt'] = kfilt.split(",");
    }

    if (cfilt != null && cfilt != '') {
        opServerPostData['cfilt'] = cfilt.split(",");
    }

    opApiServer.apiPost(url, opServerPostData, appData, function (err, data) {
        if (err || (null == data)) {
            commonUtils.handleJSONResponse(err, res, null);
        } else {
            commonUtils.handleJSONResponse(null, res, data);
        }
    });
}

function getVMIDetailsByVmiList (vmiList, appData, callback) {
    var url = "/analytics/uves/virtual-machine-interface";
    var postData = {};
    postData.kfilt = vmiList;
    opApiServer.apiPost(url, postData, appData, function(error, vmiDetails) {
        callback(error, vmiDetails);
    });
}

function getAllUveVMIDetails (req, appData, callback) {
    getAllUveVmVmiList(req, appData, function(error, list) {
        getVMIDetailsByVmiList(list.vmiList, appData, callback);
    });
}

function getUveVMIDetailsByProject (fqn, req, appData, callback) {
    getUveVmVmiListByFqns([fqn], "project", req, appData, function(error, list) {
        getVMIDetailsByVmiList(list.vmiList, appData, callback);
    });
}

function getUveVMIDetailsByVN (fqn, req, appData, callback) {
    getUveVmVmiListByFqns([fqn], "vn", req, appData, function(error, list) {
        getVMIDetailsByVmiList(list.vmiList, appData, callback);
    });
}

function getVirtualInterfacesSummary(req, res, appData) {
    var reqPostData = req.body,
        parentType = reqPostData['parentType'],
        kfilt = reqPostData['kfilt'], cfilt = reqPostData['cfilt'],
        projectFQN = reqPostData['projectFQN'],
        networkFQN = reqPostData['networkFQN'],
        vmiUrl = '/analytics/uves/virtual-machine-interface',
        vnUrl = '/analytics/uves/virtual-network',
        opServerPostData = {};
    if (cfilt != null && cfilt != '') {
        opServerPostData['cfilt'] = cfilt.split(",");
    }

    if (parentType == 'project') {
        vmiUrl += "/" + projectFQN + ":*";

        if (cfilt != null && cfilt != '') {
            vmiUrl += '?cfilt=' + cfilt;
        }

        opApiServer.apiGet(vmiUrl, appData, function (err, data) {
            if (err || (null == data)) {
                commonUtils.handleJSONResponse(err, res, null);
            } else {
                commonUtils.handleJSONResponse(null, res, data);
            }
        });
    } else if (parentType == 'virtual-network') {
        vnUrl += '/' + networkFQN + '?cfilt=UveVirtualNetworkAgent:interface_list';
        opApiServer.apiGet(vnUrl, appData, function (err, vnJSON) {
            var interfaceList = [];
            if (err || (null == vnJSON)) {
                commonUtils.handleJSONResponse(err, res, null);
            } else if (vnJSON['UveVirtualNetworkAgent'] != null) {
                interfaceList = vnJSON['UveVirtualNetworkAgent']['interface_list'];
                opServerPostData['kfilt'] = interfaceList;
                opApiServer.apiPost(vmiUrl, opServerPostData, appData,
                                    function (err, data) {
                    if (err || (null == data)) {
                        commonUtils.handleJSONResponse(err, res, null);
                    } else {
                        commonUtils.handleJSONResponse(null, res, data);
                    }
                });
            } else {
                commonUtils.handleJSONResponse(null, res, []);
            }
        });
    } else if (parentType == 'virtual-machine') {
        opServerPostData['kfilt'] = kfilt.split(",");

        opApiServer.apiPost(vmiUrl, opServerPostData, appData,
                            function (err, data) {
            if (err || (null == data)) {
                commonUtils.handleJSONResponse(err, res, null);
            } else {
                commonUtils.handleJSONResponse(null, res, data);
            }
        });
    }
}

function getVirtualNetworksDetails (req, res, appData) {
    var lastUUID = req.query['lastKey'];
    var count = req.query['count'];
    var filtUrl = null;

    var reqId = req.body['id'];
    var fqn = req.body['FQN'];
    var opUrl = '/analytics/uves/virtual-networks';
    var postData = {};
    var resultJSON = createEmptyPaginatedData();

    var filtData = nwMonUtils.buildBulkUVEUrls(req.body, appData);
    if (filtData && filtData[0]) {
        filtUrl = filtData[0]['reqUrl'];
    }
    redisUtils.getRedisData(reqId, function(error, vnList) {
        if (null != vnList) {
            var data = nwMonUtils.makeUVEList(vnList, "VNUUID");
            processVirtualNetworksReqByLastUUID(lastUUID, count, "VNUUID", data, filtUrl, null, appData,
                                                function (err, data) {
                commonUtils.handleJSONResponse(err, res, data);
            });
            return;
        }
        if (null == fqn) {
            //getAllUveVNList(req, appData, function(error, list) {
            getAllConfigVNList(req, appData, function(err, projects){
                redisUtils.setexRedisData(reqId, uveListExpTime, projects.vnFqnList);
                //var data = nwMonUtils.makeUVEList(list, "VNUUID");
                var data = nwMonUtils.makeUVEList(projects.vnFqnList, "VNUUID");
                processVirtualNetworksReqByLastUUID(lastUUID, count, "VNUUID", data, filtUrl,
                                                    null, appData, function (err, data) {
                    commonUtils.handleJSONResponse(err, res, data);
                });
            });
            //});
        } else {
            getUveVnListByFqn(fqn, appData, function(error, vnList) {
                redisUtils.setexRedisData(reqId, uveListExpTime, vnList);
                var data = nwMonUtils.makeUVEList(vnList, "VNUUID");
                processVirtualNetworksReqByLastUUID(lastUUID, count, "VNUUID", data, filtUrl,
                                                    null, appData, function (err, data) {
                    commonUtils.handleJSONResponse(err, res, data);
                    return;
                });
            });
        }
    });
}

function getInterfacesDetails (req, res, appData) {
    var lastUUID = req.query['lastKey'];
    var count = req.query['count'];
    var type = req.query['type'];
    var filtUrl = null;

    var reqId = req.body['id'];
    var fqn = req.body['FQN'];
    var opUrl = '/analytics/uves/virtual-network';
    var postData = {};
    var resultJSON = createEmptyPaginatedData();
    postData['cfilt'] = [
        'UveVirtualNetworkAgent:interface_list'
    ];
    if (null == fqn) {
        fqn = commonUtils.getValueByJsonPath(req, "cookies;domain", null, false);
    }
    var fqnArr = fqn.split(":");
    if (3 == fqnArr.length) {
        /* VN */
        postData['kfilt'] = [fqn];
    } else {
        postData['kfilt'] = [fqn + ":*"];
    }

    var filtData = nwMonUtils.buildBulkUVEUrls(req.body, appData);
    if (filtData && filtData[0]) {
        filtUrl = filtData[0]['reqUrl'];
    }
    redisUtils.getRedisData(reqId, function(error, opVMCachedList) {
        if (null != opVMCachedList && opVMCachedList.length > 0) {
            var data = nwMonUtils.makeUVEList(opVMCachedList.vmiList, "VMIUUID");

            processInterfaceReqByLastUUID(lastUUID, count, "VMIUUID", data, filtUrl, appData,
                                          function (err, data) {
                commonUtils.handleJSONResponse(err, res, data);
            });
        } else {
            var fqnArr = fqn.split(":");
            if (1 == fqnArr.length) {
                /* Domain context */
                getAllUveVmVmiList(req, appData, function(error, list) {
                    redisUtils.setexRedisData(reqId, uveListExpTime, list);
                    var data = nwMonUtils.makeUVEList(list.vmiList, "VMIUUID");
                    processInterfaceReqByLastUUID(lastUUID, count, "VMIUUID", data, filtUrl, appData,
                                                  function (err, data) {
                        commonUtils.handleJSONResponse(err, res, data);
                    });
                });
            } else if (2 == fqnArr.length) {
                /* Project Context */
                getUveVmVmiListByFqns([fqn], "project", req, appData, function(error, list) {
                    redisUtils.setexRedisData(reqId, uveListExpTime, list);
                    var data = nwMonUtils.makeUVEList(list.vmiList, "VMIUUID");
                    processInterfaceReqByLastUUID(lastUUID, count, "VMIUUID", data, filtUrl, appData,
                                                  function (err, data) {
                        commonUtils.handleJSONResponse(err, res, data);
                    });
                });
            } else {
                /* VN Context */
                getUveVmVmiListByFqns([fqn], "vn", req, appData, function(error, list) {
                    redisUtils.setexRedisData(reqId, uveListExpTime, list);
                    var data = nwMonUtils.makeUVEList(list.vmiList, "VMIUUID");
                    processInterfaceReqByLastUUID(lastUUID, count, "VMIUUID", data, filtUrl, appData,
                                                  function (err, data) {
                        commonUtils.handleJSONResponse(err, res, data);
                    });
                });
            }
        }
        return;
    });
}

function isServiceVN(vnName) {
    if (null == isServiceVN) {
        return false;
    }
    var vnNameArr = vnName.split(':');
    var vnNameLen = vnNameArr.length;

    if (3 != vnNameLen) {
        return false;
    }
    if ((-1 == vnNameArr[2].indexOf('svc-vn-right')) &&
        (-1 == vnNameArr[2].indexOf('svc-vn-left')) &&
        (-1 == vnNameArr[2].indexOf('svc-vn-mgmt'))) {
        return false;
    }
    return true;
}

function isAllowedVN(fqName, vnName) {
    if ((null == vnName) || (null == fqName)) {
        return false;
    }

    if (true == isServiceVN(vnName)) {
        return false;
    }

    var vnNameArr = vnName.split(':');
    var fqNameArr = fqName.split(':');
    var fqLen = fqNameArr.length;
    if (3 == fqLen) {
        /* VN */
        if (fqName == vnName) {
            return true;
        }
    } else if (2 == fqLen) {
        /* Project */
        if ((vnNameArr[0] == fqNameArr[0]) && (vnNameArr[1] == fqNameArr[1])) {
            return true;
        }
    } else if (1 == fqLen) {
        if ('*' == fqNameArr[0]) {
            return true;
        }
        if (vnNameArr[0] == fqNameArr[0]) {
            return true;
        }
    }
    return false;
}

function getConfigVMListByVNList (vnUUIDList, appData, callback)
{
    var chunk       = 200;
    var tmpArray    = [];
    var uuidCnt     = vnUUIDList.length;
    var dataObjArr  = [];

    for (var i = 0, j = uuidCnt; i < j; i += chunk) {
        tmpArray = vnUUIDList.slice(i, i + chunk);
        var reqUrl = '/virtual-machine-interfaces?back_ref_id=' +
            tmpArray.join(',') + '&fields=virtual_machine_refs';
        commonUtils.createReqObj(dataObjArr, reqUrl, null, null, null, null,
                                 appData);
    }
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(configApiServer, true),
              function (err, data) {
        var resultVMIList = [];
        for (var i = 0; i < data.length; i++) {
            var vmiData =
                commonUtils.getValueByJsonPath(data[i],
                                               'virtual-machine-interfaces',
                                               []);
            resultVMIList = resultVMIList.concat(vmiData);
        }
        var vmiCnt = resultVMIList.length;
        var vmList = [];
        for (var i = 0; i < vmiCnt; i++) {
            var vmRefs =
                commonUtils.getValueByJsonPath(resultVMIList[i],
                                               'virtual_machine_refs', []);
            var vmId =
                commonUtils.getValueByJsonPath(vmRefs, '0;uuid', null);
            if (null != vmId) {
                vmList.push(vmId);
            }
        }
        vmList.sort(function (s1, s2) {
            return (s1 > s2) - (s1 < s2)
        });
        vmList = _.uniq(vmList);
        callback(null, vmList);
    });
}

function getVMListByVMIList(vmiList, appData, callback) {
    var insertedVMList = {};
    var insertedVMIList = {};
    var vmiListObjArr = [];
    var vmiUUID = null;
    var vmList = [];
    var vmiReqUrl = null;

    if (null == vmiList) {
        callback(null, null);
        return;
    }
    var vmiCnt = vmiList.length;
    var vmiUUIDList = [];
    for (var i = 0; i < vmiCnt; i++) {
        vmiUUID = vmiList[i]['uuid'];
        if (null == insertedVMIList[vmiUUID]) {
            vmiUUIDList.push(vmiUUID);
        }
    }

    var chunk = 200,
        tmpArray = [],
        uuidCnt = vmiUUIDList.length;
    for (var i = 0, j = uuidCnt; i < j; i += chunk) {
        tmpArray = vmiUUIDList.slice(i, i + chunk);
        var reqUrl = '/virtual-machine-interfaces?detail=true&obj_uuids=' +
            tmpArray.join(',') +
            '&fields=virtual_machine_refs';

        commonUtils.createReqObj(vmiListObjArr, reqUrl, null, null, null, null,
            appData);
    }

    async.map(vmiListObjArr, commonUtils.getServerResponseByRestApi(configApiServer, true),
        function (err, data) {
            if (null != data && data.length > 0) {
                var resultVMIList = [];
                for (var i = 0; i < data.length; i++) {
                    resultVMIList = resultVMIList.concat(data[i]['virtual-machine-interfaces']);
                }
                for (var i = 0; i < resultVMIList.length; i++) {
                    if (resultVMIList[i]['virtual-machine-interface'] &&
                        resultVMIList[i]['virtual-machine-interface']['virtual_machine_refs']) {
                        var vmRefs = resultVMIList[i]['virtual-machine-interface']['virtual_machine_refs'];
                        for (var j = 0; j < vmRefs.length; j++) {
                            var vmUUID = vmRefs[j]['uuid'];
                            if (null == insertedVMList[vmUUID]) {
                                vmList.push(vmUUID);
                                insertedVMList[vmUUID] = vmUUID;
                            }
                        }
                    }

                }
            }
            callback(null, vmList);
        });
}

function getVMListByType(type, configData, appData, callback) {
    var emptyList = [];

    if (type == 'vn') {
        /*
         if (isServiceVN((configData['virtual-network']['fq_name']).join(':'))) {
         callback(null, null);
         return;
         }
         */
        if ((null == configData['virtual-network']) ||
            (null ==
            configData['virtual-network']['virtual_machine_interface_back_refs'])) {
            callback(null, emptyList);
            return;
        }

        var vmiBackRefsList =
            configData['virtual-network']['virtual_machine_interface_back_refs'];
        getVMListByVMIList(vmiBackRefsList, appData, function (err, vmList) {
            if (vmList && vmList.length > 1) {
                vmList.sort();
            }
            callback(err, vmList);
        });
    } else if (type == 'project') {
        if ((null == configData['project']) ||
            (null == configData['project']['virtual_machine_interfaces'])) {
            callback(null, emptyList);
            return;
        }

        var vmiList = configData['project']['virtual_machine_interfaces'];
        getVMListByVMIList(vmiList, appData, function (err, vmList) {
            if (vmList && vmList.length > 1) {
                vmList.sort();
            }
            callback(null, vmList);
        });
    }
}

function getVMDetails(req, res, appData) {
    var resultJSON = [];
    var fqnUUID = req.query['fqnUUID'];
    var type = req.query['type'];
    var url = null;
    if (type == 'vn') {
        url = '/virtual-network/' + fqnUUID;
    } else if (type == 'project') {
        url = '/project/' + fqnUUID;
    }

    if (null == type) {
        err = new
            appErrors.RESTServerError('type is required');
        commonUtils.handleJSONResponse(err, res, null);
        return;
    }
    var opServerUrl = '/analytics/uves/virtual-machine';
    configApiServer.apiGet(url, appData, function (err, data) {
        if (err || (null == data)) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        getVMListByType(type, data, appData, function (err, vmOpList) {
            if (err || (null == vmOpList) || (!vmOpList.length)) {
                commonUtils.handleJSONResponse(err, res, resultJSON);
                return;
            }
            var postData = {};
            postData['kfilt'] = vmOpList;
            opApiServer.apiPost(opServerUrl, postData, appData, function (err, data) {
                if (err || (null == data)) {
                    commonUtils.handleJSONResponse(err, res, resultJSON);
                    return;
                }
                commonUtils.handleJSONResponse(null, res, data);
            });
        });
    });
}

function processVirtualNetworksReqByLastUUID(lastUUID, count, keyToCompare,
                                             vnList, filtUrl, tenantList,
                                             appData, callback) {
    getOpServerPagedResponseByLastKey(lastUUID, count, keyToCompare, vnList,
                                      'virtual-network', filtUrl, tenantList,
                                      appData, function (err, data) {
            callback(err, data);
    });
}

function processInstanceReqByLastUUID(lastUUID, count, keyToCompare, VMList,
                                      filtUrl, appData, callback) {
    getOpServerPagedResponseByLastKey(lastUUID, count, keyToCompare, VMList,
                                      'virtual-machine', filtUrl, null,
                                      appData, function (err, data) {
        if (data && data['data'] && (-1 == count)) {
            data = data['data'];
        }
        callback(err, data);
    });
}

function processInterfaceReqByLastUUID(lastUUID, count, keyToCompare, VMList,
                                       filtUrl, appData, callback) {
    getOpServerPagedResponseByLastKey(lastUUID, count, keyToCompare, VMList,
                                      "virtual-machine-interface", filtUrl, null,
                                      appData, function (err, data) {
        if (data && data['data'] && (-1 == count)) {
            data = data['data'];
        }
        callback(err, data);
    });
}

function getOpServerPagedResponseByLastKey(lastKey, count, keyToCompare, list,
                                           type, filtUrl, tenantList, appData, callback) {
    var found = false, retLastUUID = null,
        resultJSON = {}, typeStr = type + 's',
        url = '/analytics/uves/' + type + '/*?kfilt=',
        index, listLength, totalCount;

    resultJSON['data'] = [];
    resultJSON['lastKey'] = null;
    resultJSON['more'] = false;

    if (list[typeStr] != null) {
        list = list[typeStr];
    }

    index = nwMonUtils.getnThIndexByLastKey(lastKey, list, keyToCompare);
    if (index == -2) {
        callback(null, resultJSON);
        return;
    }

    try {
        var listLength = list.length;
    } catch (e) {
        callback(null, resultJSON);
        return;
    }

    if (listLength == index) {
        /* We are already at end */
        callback(null, resultJSON);
        return;
    }

    if (-1 == count) {
        totalCount = listLength;
    } else {
        totalCount = index + 1 + parseInt(count);
    }

    if (totalCount < listLength) {
        if(keyToCompare != null) {
            retLastUUID = list[totalCount - 1][keyToCompare];
        } else {
            retLastUUID = list[totalCount - 1];
        }
    }

    for (var i = index + 1; i < totalCount; i++) {
        if (list[i]) {
            if (i != index + 1) {
                url += ',';
            }
            if(keyToCompare != null) {
                url += list[i][keyToCompare];
            } else {
                url += list[i];
            }
            found = true;
        }
    }

    if (false == found) {
        callback(null, resultJSON);
        return;
    }
    //filtURL already contains the url, /analytics/uves, so remove this and then append to our url
    var kfiltUrlKey = '/*?kfilt=',
        splArr = url.split(kfiltUrlKey),
        postData = {};

    if (splArr.length == 2) {
        postData['kfilt'] = splArr[1].split(',');
        url = splArr[0];
    }

    if (filtUrl) {
        var cfiltArr = filtUrl.split('cfilt=');
        if (cfiltArr.length == 2) {
            postData['cfilt'] = cfiltArr[1].split(',');
        }
    }
    opApiServer.apiPost(url, postData, appData, function (err, data) {
        if (data && data['value']) {
            var resCnt = data['value'].length;
            if (resCnt < count) {
                /* We have got less number of elements compared to whatever we
                 * sent to opSrever in kfilt, so these entries may be existing
                 * in API Server, but not in opServer, so add these in the
                 * response 
                 */
                var tempResData = {}, vnName;
                for (i = 0; i < resCnt; i++) {
                    if (null == data['value'][i]) {
                        continue;
                    }
                    vnName = data['value'][i]['name'];
                    tempResData[vnName] = vnName;
                }
                var kFiltLen = postData['kfilt'].length;
                for (i = 0; i < kFiltLen; i++) {
                    vnName = postData['kfilt'][i];
                    if (null == tempResData[vnName]) {
                        tempResData[vnName] = vnName;
                        data['value'].push({'name': vnName, 'value': {}});
                    }
                }
            }
        }
        resultJSON['data'] = data;
        resultJSON['lastKey'] = retLastUUID;
        if (null == retLastUUID) {
            resultJSON['more'] = false;
        } else {
            resultJSON['more'] = true;
        }
        callback(err, resultJSON);
    });
}

function createEmptyPaginatedData() {
    var resultJSON = {};
    resultJSON['data'] = {};
    resultJSON['data']['value'] = [];
    resultJSON['more'] = false;
    resultJSON['lastKey'] = null;
    return resultJSON;
}

function getInstanceDetailsByFqn(req, appData, callback) {
    var fqnUUID = req.query['fqnUUID'];
    var lastUUID = req.query['lastKey'];
    var count = req.query['count'];
    var type = req.query['type'];
    var url = null;
    var filtUrl = null;

    var resultJSON = createEmptyPaginatedData();

    if (type == 'vn') {
        url = '/virtual-network/' + fqnUUID;
    } else if (type == 'project') {
        url = '/project/' + fqnUUID;
    }
    var filtData = nwMonUtils.buildBulkUVEUrls(req.body, appData);
    if (filtData && filtData[0]) {
        filtUrl = filtData[0]['reqUrl'];
    }
    configApiServer.apiGet(url, appData, function (err, data) {
        if (err || (null == data)) {
            callback(err, resultJSON);
            return;
        }
        getVMListByType(type, data, appData, function (err, vmOpList) {
            if (err || (null == vmOpList) || (!vmOpList.length)) {
                callback(err, resultJSON);
                return;
            }
            var data = nwMonUtils.makeUVEList(vmOpList);
            processInstanceReqByLastUUID(lastUUID, count, 'name', data, filtUrl,
                                         appData, function (err, data) {
                    callback(err, data);
            });
        });
    });
}

function getVNListByProject(projectFqn, appData, callback) {
    aggConfigVNList(projectFqn, appData, function (err, vnList) {
        callback(err, vnList);
    });
}

function getVirtualNetworksDetailsByFqn(fqn, lastUUID, count, res, appData) {
    var fqn = res.req.query['fqn'];
    var filtUrl = null;

    var filtData = nwMonUtils.buildBulkUVEUrls(res.req.body, appData);
    if (filtData && filtData[0]) {
        filtUrl = filtData[0]['reqUrl'];
    }
    var fqnArr = fqn.split(':');
    var len = fqnArr.length;
    var resultJSON = createEmptyPaginatedData();

    if (2 == len) {
        /* Project */
        getVNListByProject(fqn, appData, function (err, vnList, tenantList) {
            if (err || (null == vnList) || (!vnList.length)) {
                commonUtils.handleJSONResponse(err, res, resultJSON);
                return;
            }

            processVirtualNetworksReqByLastUUID(lastUUID, count, 'name', vnList,
                                                filtUrl, tenantList, appData,
                                                function (err, data) {
                    commonUtils.handleJSONResponse(err, res, data);
                });
        });
    }
}

function aggConfigVNList(fqn, appData, callback) {
    var vnList = [], dataObjArr = [], req = appData.authObj.req;
    var configURL = null;
    if (null != fqn) {
        configURL = '/virtual-networks?parent_type=project&parent_fq_name_str=' + fqn;
        getVNConfigList(configURL, appData, callback);
    } else {
        var getVNCB = virtualNetworkDetailsMap[req.session.loggedInOrchestrationMode];
        if (null != getVNCB) {
            getVNCB(appData, callback);
            return;
        }
        getVirtualNetworksForUser(appData, callback)
    }
}
/*
 * This function just calls the config server to get the virtual networks
 */
function getVNConfigList(configURL, appData, callback) {
    configApiServer.apiGet(configURL, appData, function (err, configVNData) {
        if (err || (null == configVNData)) {
            callback(err, null);
            return;
        }
        if ((null != configVNData) &&
            (null != configVNData['virtual-networks'])) {
            vnList = getFqNameList(configVNData['virtual-networks']);
        }
        if (0 != vnList.length) {
            vnList.sort(infraCmn.sortUVEList);
        }
        callback(err, vnList, null);
    });
}
/*
 * This function is to get the virtual networks based on the user name
 */
function getVirtualNetworksForUser(appData, callback) {
    var vnList = [], dataObjArr = [];
    var configURL = null;
    getAllProjectList(appData.authObj.req, appData,
        function (error, tenantList) {
            var cookieDomain =
                commonUtils.getValueByJsonPath(appData,
                                               'authObj;req;cookies;domain',
                                               null, false);
            var tenantListLen = (tenantList['tenants'] != null) ? (tenantList['tenants'].length) : 0;
            for (var i = 0; i < tenantListLen; i++) {
                configURL =
                    '/virtual-networks?parent_type=project&parent_fq_name_str=' +
                    cookieDomain + ':' + tenantList['tenants'][i]['name'];
                commonUtils.createReqObj(dataObjArr, configURL,
                    global.HTTP_REQUEST_GET, null, null, null,
                    appData);
            }
            async.map(dataObjArr,
                      commonUtils.getAPIServerResponse(configApiServer.apiGet,
                                                       true),
                function (err, configVNData) {
                    if (err || (null == configVNData)) {
                        callback(err, vnList);
                        return;
                    }
                    var vnArray = [], configVNDataLen = configVNData.length;
                    for (var i = 0; i < configVNDataLen; i++) {
                        var vnList = commonUtils.getValueByJsonPath(configVNData[i], 'virtual-networks', []);
                        vnArray = vnArray.concat(vnList);
                    }
                    configVNData['virtual-networks'] = vnArray;
                    vnList = getFqNameList(configVNData['virtual-networks']);
                    if (0 != vnList.length) {
                        vnList.sort(infraCmn.sortUVEList);
                    }
                    callback(err, vnList, tenantList);
                });
        });
}
/*
 * This function takes the data, parses it and checks for fqName
 * and constructs the fqName array
 */
function getFqNameList(data) {
    var vnList = [], vnNmae = null, dataLen = (data != null) ? (data.length) : 0;
    if (null != data) {
        for (var i = 0; i < dataLen; i++) {
            try {
                vnName =
                    data[i]['fq_name'].join(':');
            } catch (e) {
                continue;
            }
            vnList.push({'name': vnName});
        }
    }
    return vnList;
}
function getVirtualNetworks (req, res, appData) {
    var fqn = req.query['fqn'];
    var lastUUID = req.query['lastKey'];
    var count = req.query['count'];
    var filtUrl = null;
    var vnList = [];
    var dataObjArr = [];

    var resultJSON = createEmptyPaginatedData();
    var filtData = nwMonUtils.buildBulkUVEUrls(res.req.body, appData);
    if (filtData && filtData[0]) {
        filtUrl = filtData[0]['reqUrl'];
    }
    if (null == count) {
        count = -1;
    } else {
        count = parseInt(count);
    }
    if (null != fqn) {
        getVirtualNetworksDetailsByFqn(fqn, lastUUID, count, res, appData);
        return;
    }
    aggConfigVNList(null, appData, function (err, vnList, tenantList) {
        if (0 == vnList.length) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        processVirtualNetworksReqByLastUUID(lastUUID, count, 'name', vnList,
                                            filtUrl, tenantList, appData,
                                            function (err, data) {
                commonUtils.handleJSONResponse(err, res, data);
        });
    });
}

//Returns the list of virtual networks for calculating the 
//vn count in Infra Dashboard
function getUVEVirtualNetworksList(req, res, appData) {
    var reqPostData = req.body;
    var url = '/analytics/uves/virtual-networks?cfilt=UveVirtualNetworkAgent';
    opApiServer.apiGet(url, appData, function (error, data) {
        if (error) {
            commonUtils.handleJSONResponse(error, res, null);
            return;
        }
        commonUtils.handleJSONResponse(error, res, data);
    });
}

function getInstanceDetails(req, res, appData) {
    var getVMCB = instanceDetailsMap[req.session.loggedInOrchestrationMode];
    if (null != getVMCB) {
        getVMCB(req, appData, function (err, instDetails) {
            commonUtils.handleJSONResponse(err, res, instDetails);
            return;
        });
        return;
    }
    getInstancesDetailsForUser(req, appData, function (err, instDetails) {
        commonUtils.handleJSONResponse(err, res, instDetails);
        return;
    });
}
/*
 * This function is to get the Virtual Machines
 * details of the particular vRouter
 */
function getInstanceDetailsForVRouter (req, res, appData) {
    var vRouterName = req.query['vRouter'];
    var lastUUID = req.query['lastKey'];
    var count = req.query['count'];
    var filtUrl = null;
    var resultJSON = createEmptyPaginatedData();
    if (null == vRouterName) {
        err = new appErrors.RESTServerError('vRouter is required');
        commonUtils.handleJSONResponse(err, res, resultJSON);
        return;
    }
    var filtData = nwMonUtils.buildBulkUVEUrls(req.body, appData);
    if (filtData && filtData[0]) {
        filtUrl = filtData[0]['reqUrl'];
    }
    var url = '/analytics/uves/vrouter/'+vRouterName+'?flat';
    opApiServer.apiGet(url, appData, function (err, data) {
        if(err || null == data) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        var vmUUIDArr = [];
        if(data['VrouterAgent'] != null &&
            data['VrouterAgent']['virtual_machine_list'] != null) {
            vmUUIDArr = data['VrouterAgent']['virtual_machine_list'];
            vmUUIDArr.sort(function (vmUUID1, vmUUID2){
                if(vmUUID1 > vmUUID2){
                    return 1;
                } else if (vmUUID1 < vmUUID2) {
                    return -1;
                }
                return 0;
            });
            processInstanceReqByLastUUID(lastUUID, count, null, vmUUIDArr, filtUrl,
                                         appData, function (err, instDetails) {
                    commonUtils.handleJSONResponse(err, res, instDetails);
                    return;
            });
        } else {
            commonUtils.handleJSONResponse(null, res, resultJSON);
            return;
        }
    });
}


/*
 * This function fetch the virtual machines for the Admin role
 */
function getInstanceDetailsForAdmin(req, appData, callback) {
    var fqnUUID = req.query['fqnUUID'];
    var lastUUID = req.query['lastKey'];
    var count = req.query['count'];
    var type = req.query['type'];
    var url = '/analytics/uves/virtual-machines';
    var filtUrl = null;
    var resultJSON = createEmptyPaginatedData();
    var filtData = nwMonUtils.buildBulkUVEUrls(req.body, appData);
    if (filtData && filtData[0]) {
        filtUrl = filtData[0]['reqUrl'];
    }
    if (null == count) {
        count = -1;
    } else {
        count = parseInt(count);
    }
    if (null != fqnUUID) {
        if (null == type) {
            err = new
                appErrors.RESTServerError('type is required');
            callback(err, resultJSON);
            return;
        }
        return getInstanceDetailsByFqn(req, appData, callback);
    }
    opApiServer.apiGet(url, appData, function (err, data) {
        if (err || (null == data)) {
            callback(err, resultJSON);
            return;
        }
        data.sort(infraCmn.sortUVEList);
        processInstanceReqByLastUUID(lastUUID, count, 'name', data, filtUrl,
                                     appData, callback);
    });
}

function getAllProjectFromConfig (req, appData, callback) {
    var tenantList = [];
    var domCookie = req.cookies.domain;
    var url = "/projects?parent_type=domain&parent_fq_name_str=" + domCookie;
    configApiServer.apiGet(url, appData, function(error, data) {
        if ((null != error) || (null == data) || (null == data.projects)) {
            callback(null, {tenants: []});
            return;
        }
        var projects = data.projects;
        var projCnt = projects.length;
        for (var i = 0; i < projCnt; i++) {
            tenantList.push({name: projects[i].fq_name[1],
                            id: commonUtils.convertApiServerUUIDtoKeystoneUUID(projects[i].uuid)});
        }
        callback(null, {tenants: tenantList});
    });
}

function getAllProjectFromIdentity (req, appData, callback) {
    authApi.getTenantList(req, appData, function(error, tenantList) {
        if ((null != error) || (null == tenantList) || (null == tenantList.tenants)) {
            callback(null, {tenants: []});
            return;
        }
        callback(null, tenantList);
    });
}

function getAllProjectListCB (dataObj, callback) {
    var type = dataObj.type;
    if ("config" === type) {
        getAllProjectFromConfig(dataObj.req, dataObj.appData, callback);
    } else {
        getAllProjectFromIdentity(dataObj.req, dataObj.appData, callback);
    }
}

function getAllProjectList (req, appData, callback) {
    var dataObjArr = [];
    var configProjects, identityProjects;
    var identityProjectsCnt = 0, configProjectsLen = 0;
    var tmpProjects = {};

    dataObjArr.push({type: "config", req: req, appData: appData});
    dataObjArr.push({type: "identity", req: req, appData: appData});
    async.map(dataObjArr, getAllProjectListCB, function(error, data) {
        configProjects = data[0].tenants;
        identityProjects = data[1].tenants;
        identityProjectsCnt = identityProjects.length;
        for (var i = 0; i < identityProjectsCnt; i++) {
            var projName = identityProjects[i].name;
            tmpProjects[projName] = identityProjects[i];
        }
        configProjectsLen = configProjects.length;
        for (i = 0; i < configProjectsLen; i++) {
            var projName = configProjects[i].name;
            if (lodash.isNil(tmpProjects[projName])) {
                identityProjects.push(configProjects[i]);
            }
        }
        callback(null, {tenants: identityProjects});
    });
}

/*
 * This function fetch the virtual machines for the User role
 */
function getInstancesDetailsForUser(req, appData, callback) {
    var fqnUUID = req.query['fqnUUID'];
    var lastUUID = req.query['lastKey'];
    var count = req.query['count'];
    var type = req.query['type'];
    var dataObjArr = [];
    var filtUrl = null;
    var filtData = nwMonUtils.buildBulkUVEUrls(req.body, appData);
    if (filtData && filtData[0]) {
        filtUrl = filtData[0]['reqUrl'];
    }
    if (null != fqnUUID) {
        if (null == type) {
            var err = new appErrors.RESTServerError('type is required');
            callback(err, null)
            return;
        }
        getInstanceDetailsByFqn(req, appData, callback);
        return;
    }
    getAllProjectList(req, appData, function (err, tenantList) {
        var projectsLen = (tenantList['tenants'] != null) ? (tenantList['tenants'].length) : 0,
            configURL = null;
        for (var i = 0; i < projectsLen; i++) {
            configURL = '/project/' + commonUtils.convertUUIDToString(tenantList['tenants'][i]['id']);
            commonUtils.createReqObj(dataObjArr, configURL, global.HTTP_REQUEST_GET, null, null, null, appData);
        }
        async.map(dataObjArr,
                  commonUtils.getAPIServerResponse(configApiServer.apiGet, true), function (err, projectData) {
                if (err || (null == projectData)) {
                    callback(err, null);
                    return;
                }
                var vmiUrl = null, reqArr = [], projectDataLen = projectData.length;
                for (var i = 0; i < projectDataLen; i++) {
                    var itemData = projectData[i]['project'];
                    var vmiLen = (itemData['virtual_machine_interfaces'] != null) ?
                        (itemData['virtual_machine_interfaces'].length) : 0;
                    for (var j = 0; j < vmiLen; j++) {
                        vmiUrl = '/virtual-machine-interface/' + itemData['virtual_machine_interfaces'][j]['uuid'];
                        commonUtils.createReqObj(reqArr, vmiUrl, global.HTTP_REQUEST_GET, null, null, null, appData);
                    }
                }
                if (0 == reqArr.length) {
                    var emptyData = {
                        "data": [],
                        "lastKey": null,
                        "more": false
                    };
                    callback(null, emptyData);
                    return;
                }
                async.map(reqArr,
                          commonUtils.getAPIServerResponse(configApiServer.apiGet,
                                                           true), function (error, vmiData) {
                        if (error || (null == vmiData)) {
                            callback(error, null);
                            return;
                        }
                        var vmuuidObjArr = [], vmuuidArr = [], vmiDataLen = vmiData.length;
                        for (var k = 0; k < vmiDataLen; k++) {
                            var itemData = (vmiData[k]['virtual-machine-interface'] != null) ? (vmiData[k]['virtual-machine-interface']) : {},
                                vmiRefsLen = (itemData['virtual_machine_refs'] != null) ? (itemData['virtual_machine_refs'].length) : 0;

                            if (itemData['virtual_machine_refs'] != null) {
                                for (var l = 0; l < vmiRefsLen; l++) {
                                    if (-1 == vmuuidArr.indexOf(itemData['virtual_machine_refs'][l]['uuid'])) {
                                        vmuuidArr.push(itemData['virtual_machine_refs'][l]['uuid']);
                                        vmuuidObjArr.push({name: itemData['virtual_machine_refs'][l]['uuid']});
                                    }
                                }
                            }
                        }
                        vmuuidObjArr.sort(infraCmn.sortUVEList);
                        processInstanceReqByLastUUID(lastUUID, count, 'name',
                                                     vmuuidObjArr, filtUrl,
                                                     appData, function (err, vmdata) {
                                callback(err, vmdata);
                        });
                    });
            });
    });

}

function getStats (req, res, appData)
{

    var reqParams = req.body['data'],
        type = reqParams['type'],
        uuids = reqParams['uuids'],
        whereClauseArray = [], table, context,
        whereFieldName = "name", whereClause;

    if ('virtual-machine' == type) {
        table = 'StatTable.UveVMInterfaceAgent.if_stats';
        context = 'vm';
        whereFieldName = 'vm_uuid';
    } else if ('virtual-network' == type) {
        table = 'StatTable.UveVirtualNetworkAgent.vn_stats';
        context = 'vn';
    } else if ('virtual-machine-interface' == type) {
        table = 'StatTable.UveVMInterfaceAgent.if_stats';
        context = 'vm';
    }

    uuids = uuids.split(',');
    var uuidsLen = uuids.length;
    whereClause = "";
    for (var i = 0; i < uuidsLen; i++) {
        whereClause += "(" + whereFieldName + " = " + uuids[i] + ")";
        if ((uuidsLen > 1) && (i < uuidsLen - 1)) {
            whereClause += " OR ";
        }
    }

    var props = global.STATS_PROP[context];
    var selectArr = [props['inBytes'], props['outBytes'], props['inPkts'],
        props['outPkts'], whereFieldName];

    var qeQuery = qeUtils.formQEQueryData(table, reqParams, selectArr,
                                          whereClause, null);
    var qeQueries = [];
    qeQueries.push(qeQuery);
    flowCache.getFlowSeriesDataByQE(qeQueries, reqParams, appData, context, null,
                                    function (err, qeResp) {
        var resultJSON = [];
        resultJSON[0] =
            {value: commonUtils.getValueByJsonPath(qeResp, '0;data', [])};
        logutils.logger.debug(JSON.stringify(resultJSON));
        commonUtils.handleJSONResponse(err, res, resultJSON);
    });
}

// Handle request to get a JSON of projects for a given domain.
function getProjects(req, res, appData) {
    var url, domain = req.param('domain');
    //Re-check to add domain filtering
    url = "/projects?domain=" + domain;
    configApiServer.apiGet(url, appData, function (error, projectsJSON) {
        commonUtils.handleJSONResponse(error, res, projectsJSON);
    });
}

// Handle request to get a JSON of virtual networks under a given project name.
function getVNetworks(req, res, appData) {
    var url, fqName = req.param('fqname');
    url = "/virtual-networks?parent_type=project&parent_fq_name_str=" + fqName;
    configApiServer.apiGet(url, appData, function (error, vnsJSON) {
        commonUtils.handleJSONResponse(error, res, vnsJSON);
    });
}

function populateName(arr) {

    for (var j = 0; j < arr.length; j++) {
        var currData = arr[j];
        currData['name'] = currData['fq_name'][currData['fq_name'].length - 1];
    }
}

function populateInOutTraffic(vnJSON, trafficJSON, counter) {
    try {
        var inBytes = 0, outBytes = 0, inPkts = 0, outPkts = 0;
        var interVNInBytes = 0, interVNOutBytes = 0, interVNInPkts = 0, interVNOutPkts = 0;
        if (trafficJSON['UveVirtualNetworkAgent']) {
            var inBytesData = trafficJSON['UveVirtualNetworkAgent']['in_bytes'];
            var outBytesData = trafficJSON['UveVirtualNetworkAgent']['out_bytes'];
            var inPktsData = trafficJSON['UveVirtualNetworkAgent']['in_tpkts'];
            var outPktsData = trafficJSON['UveVirtualNetworkAgent']['out_tpkts'];
            if ((inBytesData == null) || (inBytesData['#text'] == null)) {
                inBytes = 0;
            } else {
                inBytes = inBytesData['#text'];
            }
            if ((outBytesData == null) || (outBytesData['#text'] == null)) {
                outBytes = 0;
            } else {
                outBytes = outBytesData['#text'];
            }

            if ((inPktsData == null) || (inPktsData['#text'] == null))
                inPkts = 0;
            else
                inPkts = inPktsData['#text'];
            if ((outPktsData == null) || (outPktsData['#text'] == null))
                outPkts = 0;
            else
                outPkts = outPktsData['#text'];

            var inStatsData = [], outStatsData = [];

            if ((trafficJSON['UveVirtualNetworkAgent']['in_stats'] != null) && (trafficJSON['UveVirtualNetworkAgent']['in_stats']['list'] != null) &&
                (trafficJSON['UveVirtualNetworkAgent']['out_stats'] != null) && (trafficJSON['UveVirtualNetworkAgent']['out_stats']['list'] != null)) {
                var inStatsData = trafficJSON['UveVirtualNetworkAgent']['in_stats']['list']['UveInterVnStats'];
                var outStatsData = trafficJSON['UveVirtualNetworkAgent']['out_stats']['list']['UveInterVnStats'];
                for (var i = 0; i < inStatsData.length; i++) {
                    interVNInBytes += parseInt(inStatsData[i]['bytes']['#text']);
                    interVNInPkts += parseInt(inStatsData[i]['tpkts']['#text']);
                }
                for (var i = 0; i < outStatsData.length; i++) {
                    interVNOutBytes += parseInt(outStatsData[i]['bytes']['#text']);
                    interVNOutPkts += parseInt(outStatsData[i]['tpkts']['#text']);
                }
            }
        }
        populateName([vnJSON['virtual-networks'][counter]]);
        vnJSON["virtual-networks"][counter]['inBytes'] = parseInt(inBytes);
        vnJSON["virtual-networks"][counter]['outBytes'] = parseInt(outBytes);
        vnJSON["virtual-networks"][counter]['inPkts'] = parseInt(inPkts);
        vnJSON["virtual-networks"][counter]['outPkts'] = parseInt(outPkts);
        vnJSON["virtual-networks"][counter]['interVNInBytes'] = interVNInBytes;
        vnJSON["virtual-networks"][counter]['interVNOutBytes'] = interVNOutBytes;
        vnJSON["virtual-networks"][counter]['interVNInPkts'] = interVNInPkts;
        vnJSON["virtual-networks"][counter]['interVNOutPkts'] = interVNOutPkts;
    } catch (err) {
        logutils.logger.error(err.stack);
    }
}

function getProjectData(configObj, callback) {
    var url = configObj.url;
    var appData = configObj.appData;
    var dataObjArr = [];
    configApiServer.apiGet(url, appData, function (error, jsonData) {
        if (error) {
            callback(error);
        } else {
            try {
                var vnJSON = jsonData,
                    uveUrls = [],
                    vnCount = vnJSON["virtual-networks"].length,
                    i, uuid, fq_name, url;
                //logutils.logger.debug("vnJSONStr: " + JSON.stringify(vnJSON));
                if (vnCount != 0) {
                    for (i = 0; i < vnCount; i += 1) {
                        uuid = vnJSON["virtual-networks"][i].uuid;
                        fq_name = vnJSON['virtual-networks'][i].fq_name;
                        url = '/analytics/uves/virtual-network/' + fq_name.join(':');
                        commonUtils.createReqObj(dataObjArr, url,
                                                 null, null, null, null,
                                                 appData);
                        logutils.logger.debug('getProjectDetails URL:', url);
                    }
                    async.map(dataObjArr,
                              commonUtils.getAPIServerResponse(opApiServer.apiGet,
                                                               true),
                              function (err, results) {
                            var i, trafficJSON;
                            if (!err) {
                                for (i = 0; i < vnCount; i += 1) {
                                    trafficJSON = results[i];
                                    populateInOutTraffic(vnJSON, trafficJSON, i);
                                }
                                callback(null, vnJSON);
                            } else {
                                callback(error);
                            }
                        });
                } else {
                    callback(null, vnJSON);
                }
            } catch (error) {
                callback(error);
            }
        }
    });
}

function parseDomainSummary(resultJSON, results) {
    resultJSON = {};
    resultJSON['interVNInBytes'] = 0;
    resultJSON['interVNInPkts'] = 0;
    resultJSON['interVNOutBytes'] = 0;
    resultJSON['interVNOutPkts'] = 0;
    resultJSON['inBytes'] = 0;
    resultJSON['inPkts'] = 0;
    resultJSON['outBytes'] = 0;
    resultJSON['outPkts'] = 0;
    try {
        var projCount = results.length;
        for (var i = 0; i < projCount; i++) {
            vnData = results[i]['virtual-networks'];
            vnCount = vnData.length;
            for (var j = 0; j < vnCount; j++) {
                try {
                    resultJSON['interVNInBytes'] = parseInt(resultJSON['interVNInBytes']) +
                        parseInt(vnData[j]['interVNInBytes']);
                } catch (e) {
                    logutils.logger.error("In parseDomainSummary(), JSON Parse error:" + e);
                }
                try {
                    resultJSON['interVNInPkts'] = parseInt(resultJSON['interVNInPkts']) +
                        parseInt(vnData[j]['interVNInPkts']);
                } catch (e) {
                    logutils.logger.error("In parseDomainSummary(), JSON Parse error:" + e);
                }
                try {
                    resultJSON['interVNOutBytes'] = parseInt(resultJSON['interVNOutBytes']) +
                        parseInt(vnData[j]['interVNOutBytes']);
                } catch (e) {
                    logutils.logger.error("In parseDomainSummary(), JSON Parse error:" + e);
                }
                try {
                    resultJSON['interVNOutPkts'] = parseInt(resultJSON['interVNOutPkts']) +
                        parseInt(vnData[j]['interVNOutPkts']);
                } catch (e) {
                    logutils.logger.error("In parseDomainSummary(), JSON Parse error:" + e);
                }
                try {
                    resultJSON['inBytes'] = parseInt(resultJSON['inBytes']) +
                        parseInt(vnData[j]['inBytes']);
                } catch (e) {
                    logutils.logger.error("In parseDomainSummary(), JSON Parse error:" + e);
                }
                try {
                    resultJSON['inPkts'] = parseInt(resultJSON['inPkts']) +
                        parseInt(vnData[j]['interVNInBytes']);
                } catch (e) {
                    logutils.logger.error("In parseDomainSummary(), JSON Parse error:" + e);
                }
                try {
                    resultJSON['inPkts'] = parseInt(resultJSON['interVNInBytes']) +
                        parseInt(vnData[j]['interVNInBytes']);
                } catch (e) {
                    logutils.logger.error("In parseDomainSummary(), JSON Parse error:" + e);
                }
                try {
                    resultJSON['outBytes'] = parseInt(resultJSON['outBytes']) +
                        parseInt(vnData[j]['outBytes']);
                } catch (e) {
                    logutils.logger.error("In parseDomainSummary(), JSON Parse error:" + e);
                }
                try {
                    resultJSON['outPkts'] = parseInt(resultJSON['outPkts']) +
                        parseInt(vnData[j]['outPkts']);
                } catch (e) {
                    logutils.logger.error("In parseDomainSummary(), JSON Parse error:" + e);
                }
            }
        }
    } catch (e) {
        logutils.logger.error("In parseDomainSummary(), JSON parse error" + e);
    }
    return resultJSON;
}

function getNetworkDomainSummary(req, res, appData) {
    var configObjArr = [];
    var domain = req.param('fq-name');
    var results = {};
    var urlLists = [];
    var j = 0;
    var resultJSON = {};

    var url = '/projects?domain=' + domain;
    /* First get the project details in this domain */
    configApiServer.apiGet(url, appData, function (error, jsonData) {
        if (error) {
            commonUtils.handleJSONResponse(error, res, null);
            return;
        }
        try {
            var projects = jsonData['projects'];
            var projectsCount = projects.length;
            for (var i = 0; i < projectsCount; i++) {
                if ((projects[i]['fq_name'][1] == 'service') ||
                    (projects[i]['fq_name'][1] == 'default-project') ||
                    (projects[i]['fq_name'][1] == 'invisible_to_admin')) {
                    continue;
                }
                url = "/virtual-networks?parent_type=project&parent_fq_name_str=" + projects[i]['fq_name'].join(':');
                configObjArr[j] = {};
                configObjArr[j]['url'] = url;
                configObjArr[j]['appData'] = appData;
                j++;
            }
            async.map(configObjArr, getProjectData, function (err, results) {
                resultJSON = parseDomainSummary(resultJSON, results);
                commonUtils.handleJSONResponse(null, res, resultJSON);
            });
        } catch (e) {
            logutils.logger.error("getNetworkDomainSummary JSON parse error: " + e.stack);
            commonUtils.handleJSONResponse(null, res, results);
        }
    });
}

function parseVNUveData(resultJSON, vnUve) {
    try {
        resultJSON['intfList'] =
            vnUve['UveVirtualNetworkAgent']['interface_list']['list']['element'];
    } catch (e) {
    }
    try {
        resultJSON['aclRuleCnt'] =
            vnUve['UveVirtualNetworkAgent']['total_acl_rules'][0][0]['#text'];
    } catch (e) {
        resultJSON['aclRuleCnt'] = 0;
    }
    try {
        resultJSON['intfCnt'] = resultJSON['intfList'].length;
    } catch (e) {
        resultJSON['intfCnt'] = 0;
    }
    try {
        resultJSON['vmCnt'] =
            vnUve['UveVirtualNetworkAgent']['virtualmachine_list']['list']['@size'];
    } catch (e) {
        resultJSON['vmCnt'] = 0;
    }
    try {
        resultJSON['partiallyConnectedNws'] =
            vnUve['UveVirtualNetworkConfig']['partially_connected_networks']['list']['element'];
    } catch (e) {
    }
}

function parseNetworkDetails(resultJSON, appData, jsonData, callback) {
    var vmRefs = [], vmRefsCount = 0,
        urlLists = [], dataObjArr = [];

    if (null == jsonData) {
        return;
    }

    resultJSON['vmCnt'] = 0;
    resultJSON['intfCnt'] = 0;
    resultJSON['aclRuleCnt'] = 0;
    resultJSON['policyList'] = [];
    resultJSON['intfList'] = {};
    resultJSON['partiallyConnectedNws'] = {};

    try {
        resultJSON['fq-name'] = jsonData['fq_name'].join(':');
        var nwPolicyRefs = jsonData['network_policy_refs'],
            policyCount = nwPolicyRefs.length;
        for (i = 0; i < policyCount; i++) {
            resultJSON['policyList'][i] = {};
            resultJSON['policyList'][i]['name'] = nwPolicyRefs[i]['to'].join(':');
            resultJSON['policyList'][i]['uuid'] = nwPolicyRefs[i]['uuid'];
        }
        /* Now get the rest of the data from UVE */
        var url = '/analytics/uves/virtual-network/' + resultJSON['fq-name'];
        opApiServer.apiGet(url, appData, function (err, vnUve) {
            parseVNUveData(resultJSON, vnUve);
            callback(resultJSON);
        });
    } catch (e) {
        logutils.logger.debug("In parseNetworkDetails(): VM JSON Parse error:" + e);
        callback(resultJSON);
    }
}

function getNetworkDetails(req, res, appData) {
    var resultJSON = {},
        uuid = req.param('uuid'),
        url = '/virtual-network/' + uuid;

    configApiServer.apiGet(url, appData, function (error, jsonData) {
        if (error) {
            commonUtils.handleJSONResponse(error, res, null);
            return;
        }
        parseNetworkDetails(resultJSON, appData, jsonData['virtual-network'],
            function (results) {
                commonUtils.handleJSONResponse(null, res, results);
            });
    });
}

function getVMDetailsByVMList (vmList, appData, callback)
{
    var postData = {};
    postData['kfilt'] = vmList;
    var vmURL = '/analytics/uves/virtual-machine';
    opApiServer.apiPost(vmURL, postData, appData, function(error, data) {
        if ((null != error) || (null == data)) {
            callback(error, data);
            return;
        }
        callback(error, {data: data, more: false, nextKey: null});
    });
}

function getConfigVMIListByVNs(vnIds, appData, callback) {
    var configUrl = '/virtual-machine-interfaces?fields=virtual_machine_refs';
    if (null != vnId) {
        configUrl += '&back_ref_id=' + vnId;
    }

    configApiServer.apiGet(configUrl, appData, function (err, configData) {
        if (null != err) {
            callback(err, []);
            return;
        }
        var vmis =
            commonUtils.getValueByJsonPath(configData,
                                           "virtual-machine-interfaces",
                                           []);
        var vmisCnt = vmis.length;
        var vmList = [];
        for (var i = 0; i < vmisCnt; i++) {
            var vm =
                commonUtils.getValueByJsonPath(vmis[i],
                                               "virtual_machine_refs;0;uuid",
                                               null);
            if (null != vm) {
                vmList.push(vm);
            }
        }
        callback(null, vmList);
    });
    return;
}

/*get Instance list API */

function getInstancesListFromConfig (req, appData, callback) {
    var fqnUUID = req.body['fqnUUID'];
    var type = req.query['type'];
    var fqn = req.body["FQN"];
    var url = null;
    if (lodash.isNil(fqnUUID)) {
        getAllConfigVMList(req, appData, callback);
        return;
    }
    var fqnArr = fqn.split(":");
    if (3 == fqnArr.length) {
        /* VN */
        getConfigVMListByVNList([fqnUUID], appData, callback);
        return;
    } else {
        /* Project */
        url = "/project/" + fqnUUID + "?fields=virtual_networks";
    }
    configApiServer.apiGet(url, appData, function (err, projData) {
        if (!lodash.isNil(err) || lodash.isNil(projData)) {
            callback(err, []);
            return;
        }
        var vnList = commonUtils.getValueByJsonPath(projData, "project;virtual_networks", []);
        var vnCnt = vnList.length;
        if (!vnCnt) {
            callback(null, []);
            return;
        }
        var vnUUIDs = [];
        for (var i = 0; i < vnCnt; i++) {
            vnUUIDs.push(vnList[i].uuid);
        }
        getConfigVMListByVNList(vnUUIDs, appData, callback);
    });
}

function getAllConfigVMList (req, appData, callback) {
    getAllConfigVNList(req, appData, function(error, vnList) {
        getConfigVMListByVNList(vnList.vnUUIDList, appData, callback);
    });
}

function getAllConfigVNList (req, appData, callback) {
    var url = "/virtual-networks";
    configApiServer.apiGet(url, appData, function(error, vnData) {
        if ((null != error) || (null == vnData)) {
            callback(error, {vnUUIDList: [], vnFqnList: []});
            return;
        }
        var vnData = commonUtils.getValueByJsonPath(vnData, "virtual-networks", []);
        var vnCnt = vnData.length;
        var vnIdList = [];
        var vnFqnList = [];
        for (var i = 0; i < vnCnt; i++) {
            vnIdList.push(vnData[i].uuid);
            vnFqnList.push(vnData[i].fq_name.join(":"));
        }
        callback(null, {vnUUIDList: vnIdList, vnFqnList: vnFqnList});
    });
}

function getAllConfigVMIList (req, appData, callback) {
    var chunk  = 200;
    var reqUrl = "/projects?fields=virtual_machine_interfaces&obj_uuids=";
    var dataObjArr = [];
    var tmpArray = [];
    var domainFQN = commonUtils.getValueByJsonPath(req, "cookies;domain", null, false);
    getAllProjectList(req, appData, function (err, tenantList) {
        var projects = commonUtils.getValueByJsonPath(tenantList, "tenants", []);
        var projectsLen = projects.length;
        var uuidList = [];
        for (var i = 0; i < projectsLen; i++) {
            var uuid = commonUtils.convertUUIDToString(projects[i].id);
            uuidList.push(uuid);
        }
        for (var i = 0, j = projectsLen; i < j; i += chunk) {
            tmpArray = uuidList.slice(i, i + chunk);
            var url = reqUrl + tmpArray.join(",");
            commonUtils.createReqObj(dataObjArr, url, null, null, null, null, appData);
        }
        async.map(dataObjArr, commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
                  function(error, projChunks) {
            var uuidList = getVmiUUIDListByVnOrProjChunkResponse(projChunks, "project");
            callback(null, uuidList);
        });
    });
}

function getVmiUUIDListByVnOrProjChunkResponse (chunkResp, context) {
    var chunkList = [];
    var uuidList = [];
    if ((lodash.isNil(chunkResp)) || (!chunkResp.length)) {
        return uuidList;
    }
    var parentKey = null, childKey = null;
    if ("project" === context) {
        parentKey = "projects";
        childKey = "virtual_machine_interfaces";
    } else if ("vn" == context) {
        parentKey = "virtual-networks";
        childKey = "virtual_machine_interface_back_refs";
    }
    var chunkLen = chunkResp.length;
    for (var i = 0; i < chunkLen; i++) {
        if (lodash.isNil(chunkResp[i])) {
            continue;
        }
        var chunk = chunkResp[i][parentKey];
        if (lodash.isNil(chunk)) {
            continue;
        }
        var chunkCnt = chunk.length;
        for (var j = 0; j < chunkCnt; j++) {
            var children = chunk[j][childKey];
            if (lodash.isNil(children)) {
                continue;
            }
            var childCnt = children.length;
            for (var k = 0; k < childCnt; k++) {
                var fqn = children[k].to;
                var uuid = children[k].uuid;
                if (lodash.isNil(fqn)) {
                    continue;
                }
                uuidList.push({fqn: fqn.join(":"), uuid: uuid});
            }
        }
    }
    return uuidList;
}

function getUveVnListByFqn (fqn, appData, callback) {
    var opUrl = "/analytics/uves/virtual-networks";
    opUrl += "?kfilt=" + fqn + ":*";
    opApiServer.apiGet(opUrl, appData, function(error, vnUveList) {
        if ((null != error) || (null == vnUveList) || (!vnUveList.length)) {
            callback(error, []);
            return;
        }
        var vnCnt = vnUveList.length;
        var vnList = [];
        for (var i = 0; i < vnCnt; i++) {
            vnList.push(vnUveList[i].name);
        }
        if (vnList.length > 1) {
            vnList.sort(function (s1, s2) {
                return (s1 > s2) - (s1 < s2)
            });
        }
        callback(null, vnList);
    });
}

function getAllUveVNList (req, appData, callback) {
    var reqId = req.body["id"];
    getAllProjects(req, appData, function(error, fqnList) {
        if ((null != error) || (null == fqnList) || (!fqnList.length)) {
            callback(null, []);
            return;
        }
        var projLen = fqnList.length;
        var projObjs = {};
        for (var i = 0; i < projLen; i++) {
            projObjs[fqnList[i] + ":"] = fqnList[i];
        }
        var domainFqn = commonUtils.getValueByJsonPath(req, "cookies;domain", null, false);
        //var reqUrl = "/analytics/uves/virtual-networks?kfilt=" + domainFqn + ":*";
        var reqUrl = "/analytics/uves/virtual-networks";
        opApiServer.apiGet(reqUrl, appData, function(error, vnList) {
            if ((null != error) || (null == vnList) || (!vnList.length)) {
                callback(null, []);
                return;
            }
            var vnFqns = [];
            var vnCnt = vnList.length;
            for (var i = 0; i < vnCnt; i++) {
                var vnArr = vnList[i].name.split(":");
                var projFqn = vnArr[0] + ":" + vnArr[1];
                if (null != projObjs[projFqn + ":"]) {
                    vnFqns.push(vnList[i].name);
                }
            }
            if (vnFqns.length > 1) {
                vnFqns.sort(function (s1, s2) {
                    return (s1 > s2) - (s1 < s2)
                });
            }
            callback(null, vnFqns);
        });
    });
}


function getAllUveVmVmiList (req, appData, callback) {
    getAllProjects (req, appData, function(error, fqnList) {
        getUveVmVmiListByFqns(fqnList, "project", req, appData, callback);
    });
}

function getAllProjects (req, appData, callback) {
    var reqId = req.body["id"];
    redisUtils.getRedisData(reqId, function(error, vmiList) {
        if (null != vmiList) {
            callback(null, {vmiList: vmiList});
            return;
        }

        var reqObjArr = [];
        var domainFQN = commonUtils.getValueByJsonPath(req, "cookies;domain", null, false);
        var postData = {};
        var opUrl = "/analytics/uves/virtual-network";
        postData.cfilt = ["UveVirtualNetworkAgent:virtualmachine_list",
                          "UveVirtualNetworkAgent:interface_list"];
       getAllProjectList(req, appData, function (err, tenantList) {
            var projects = commonUtils.getValueByJsonPath(tenantList, "tenants", []);
            var projectsLen = projects.length;
            postData.kfilt = [];
            var fqnList = [];
            for (var i = 0; i < projectsLen; i++) {
                var projectName = commonUtils.getValueByJsonPath(projects, i + ";name", null);
                if (lodash.isNil(projectName)) {
                    continue;
                }
                fqnList.push(domainFQN + ":" + projectName);
            }
            callback(null, fqnList);
        });
    });
}

function getUveVmVmiListByFqns (fqns, type, req, appData, callback) {
    var reqId = req.body["id"];
    redisUtils.getRedisData(reqId, function(error, vmiList) {
        if (null != vmiList) {
            callback(null, {vmiList: vmiList});
            return;
        }

        var opVMList = [];
        var opVMIList = [];
        var postData = { kfilt:[] };
        var fqnsLen = fqns.length;
        var opUrl = "/analytics/uves/virtual-network";
        for (var i = 0; i < fqnsLen; i++) {
            if ("vn" == type) {
                postData.kfilt.push(fqns[i]);
            } else if ("project" === type) {
                postData.kfilt.push(fqns[i] + ":*");
            }
        }
        postData.cfilt = [
            "UveVirtualNetworkAgent:virtualmachine_list",
            "UveVirtualNetworkAgent:interface_list"
        ];
        opApiServer.apiPost(opUrl, postData, appData, function (err, response) {
            if ((err) || (null == response)) {
                callback(err, []);
                return;
            }
            var vnList = commonUtils.getValueByJsonPath(response, "value", []);
            var vnCnt = vnList.length;
            for (var i = 0; i < vnCnt; i++) {
                var vmList = commonUtils.getValueByJsonPath(vnList, i +
                                                            ";value;UveVirtualNetworkAgent;virtualmachine_list",
                                                            []);
                var vmiList = commonUtils.getValueByJsonPath(vnList, i +
                                                             ";value;UveVirtualNetworkAgent;interface_list",
                                                             []);
                opVMList = opVMList.concat(vmList);
                opVMIList = opVMIList.concat(vmiList);
            }
            if (opVMList.length > 1) {
                opVMList.sort(function (s1, s2) {
                    return (s1 > s2) - (s1 < s2)
                });
            }
            if (opVMIList.length > 1) {
                opVMIList.sort(function (s1, s2) {
                    return (s1 > s2) - (s1 < s2)
                });
            }
            callback(null, {vmList: opVMList, vmiList: opVMIList});
        });
    });
}

function getVmOrVmiListFromAnalytics (req, appData, type, callback) {
    var reqId = req.body['id'];
    var fqn = req.body['FQN'];
    var opUrl = '/analytics/uves/virtual-network';
    var postData = {};
    postData.cfilt = ["UveVirtualNetworkAgent:virtualmachine_list",
        "UveVirtualNetworkAgent:interface_list"];
    if (null != fqn) {
        var fqnArr = fqn.split(":");

        if (3 == fqnArr.length) {
            /* VN */
            postData['kfilt'] = [fqn];
        } else {
            /* Project */
            postData['kfilt'] = [fqn + ":*"];
        }
        getVMListByURL(opUrl, postData, appData, function(err, list) {
            callback(err, list);
            return;
        });
    } else {
        getAllUveVmVmiList(req, appData, function(err, list) {
            callback(err, list);
            return;
        });
    }
}

function getInstancesListAsync (dataObj, callback)
{
    if ("analytics" == dataObj.type) {
        getVmOrVmiListFromAnalytics(dataObj.req, dataObj.appData, "vm", function(error, list) {
            callback(null, list.vmList);
        });
    } else {
        getInstancesListFromConfig(dataObj.req, dataObj.appData, function(error, configVMList) {
            callback(null, configVMList);
        });
    }
}

function getInterfacesListAsync (dataObj, callback)
{
    if ("analytics" == dataObj.type) {
        getVmOrVmiListFromAnalytics(dataObj.req, dataObj.appData, "vmi", function(error, list) {
            callback(null, list.vmiList);
        });
    } else {
        getInterfacesListFromConfig(dataObj.req, dataObj.appData, function(error, configVMList) {
            callback(null, configVMList);
        });
    }
}

function getInterfacesListFromConfig (req, appData, callback) {
    var fqnUUID = req.body['fqnUUID'];
    var fqn = req.body["FQN"];
    var url = null;
    if (lodash.isNil(fqnUUID)) {
        getAllConfigVMIList(req, appData, callback);
        return;
    }

    var fqnArr = fqn.split(":");
    var parentKey = null, childKey = null;
    var type = null;
    if (3 == fqnArr.length) {
        /* VN */
        url = "/virtual-networks?fields=virtual_machine_interface_back_refs&obj_uuids=" + fqnUUID;
        parentKey = "virtual-networks";
        childKey = "virtual_machine_interface_back_refs";
        type = "vn";
    } else {//if ("project" === type) {
        /* Project */
        url = "/projects?fields=virtual_machine_interfaces&obj_uuids=" + fqnUUID;
        parentKey = "projects";
        childKey = "virtual_machine_interfaces";
        type = "project";
    }
    configApiServer.apiGet(url, appData, function (err, projData) {
        if (!lodash.isNil(err) || lodash.isNil(projData)) {
            callback(err, []);
            return;
        }
        var uuidList = getVmiUUIDListByVnOrProjChunkResponse([projData], type);
        callback(null, uuidList);
    });
}

function getInstanceUUIDList (req, res, appData) {
    var reqId = req.body["reqId"];
    redisUtils.getRedisData(reqId, function(error, list) {
        if (!lodash.isNil(list)) {
            commonUtils.handleJSONResponse(error, res, list);
            return;
        }
        var dataObjArr = [];
        dataObjArr.push({type: "config", req: req, appData: appData});
        dataObjArr.push({type: "analytics", req: req, appData: appData});
        async.map(dataObjArr, getInstancesListAsync, function(error, data) {
            var configVMList = data[0];
            var opVMList = data[1];
            var resultData = {opVMList: opVMList, configVMList: configVMList};
            redisUtils.setexRedisData(reqId, uveListExpTime, resultData);
            //setTimeout(function() {
            commonUtils.handleJSONResponse(null, res, resultData);
            //}, 10000);
        });
    });
}

function getVNListFromConfig (req, appData, callback) {
    var fqnUUID = req.body['fqnUUID'];
    if (null == fqnUUID) {
        /* All Projects */
        getAllConfigVNList(req, appData, function(error, configVMList) {
            callback(null, configVMList);
        });
    } else {
        var url = "/virtual-networks?parent_id=" + fqnUUID;
        configApiServer.apiGet(url, appData, function(error, vnData) {
            if ((null != error) || (null == vnData)) {
                callback(error, []);
                return;
            }
            var vnData = commonUtils.getValueByJsonPath(vnData, "virtual-networks", []);
            var vnCnt = vnData.length;
            var vnIdList = [];
            var vnFqnList = [];
            for (var i = 0; i < vnCnt; i++) {
                vnIdList.push(vnData[i].uuid);
                vnFqnList.push(vnData[i].fq_name.join(":"));
            }
            callback(null, {vnUUIDList: vnIdList, vnFqnList: vnFqnList});
        });
    }
}

function getVNListFromAnalytics (req, appData, callback) {
    var fqn = req.body["FQN"];
    if (null == fqn) {
        //getAllUveVNList(req, appData, callback);
        getAllConfigVNList(req, appData, function(err, projects){
            callback(err, projects.vnFqnList);
        });
    } else {
        getUveVnListByFqn(fqn, appData, callback);
    }
}

function getVirtualNetworksListAsync (dataObj, callback) {
    if ("analytics" == dataObj.type) {
        getVNListFromAnalytics(dataObj.req, dataObj.appData, function(error, list) {
            callback(null, list);
        });
    } else {
        getVNListFromConfig(dataObj.req, dataObj.appData, function(error, configVMList) {
            callback(null, configVMList);
        });
    }
}

function getVirtualNetworkUUIDList (req, res, appData) {
    var reqId = req.body["reqId"];
    var isUveConfigList = req.body["uveConfigList"];
    redisUtils.getRedisData(reqId, function(error, list) {
        if (!lodash.isNil(list)) {
            commonUtils.handleJSONResponse(error, res, list);
            return;
        }
        var dataObjArr = [];
        dataObjArr.push({type: "config", req: req, appData: appData});
        dataObjArr.push({type: "analytics", req: req, appData: appData});
        async.map(dataObjArr, getVirtualNetworksListAsync, function(error, data) {
            var configVNList = data[0];
            var opVNList = data[1];
            var resultData = {opVNList: opVNList, configVNList: configVNList};
            redisUtils.setexRedisData(reqId, uveListExpTime, resultData);
            commonUtils.handleJSONResponse(null, res, resultData);
        });
    });
}

function getInterfaceUUIDList (req, res, appData) {
    var reqId = req.body["reqId"];
    redisUtils.getRedisData(reqId, function(error, list) {
        if (!lodash.isNil(list)) {
            commonUtils.handleJSONResponse(error, res, list);
            return;
        }
        var dataObjArr = [];
        dataObjArr.push({type: "config", req: req, appData: appData});
        dataObjArr.push({type: "analytics", req: req, appData: appData});
        async.map(dataObjArr, getInterfacesListAsync, function(error, data) {
            var configVMIList = data[0];
            var opVMIList = data[1];
            var resultData = {opVMIList: opVMIList, configVMIList: configVMIList};
            redisUtils.setexRedisData(reqId, uveListExpTime, resultData);
            commonUtils.handleJSONResponse(null, res, resultData);
        });
    });
}

/*End of Instance list API */

/*Get Instances API*/

/**
 * Process API requests to OPServer in queue. Supports paginated response
 * @param queue
 * @param queueFetchStatus
 * @param count
 * @param type
 * @param filtUrl
 * @param appData
 * @param callback
 */

/**
 * Get the list of instances from Config API and proceed with requests to
 * Analytics with the filters in the request.
 * @param req
 * @param appData
 * @param callback
 */
function getInstancesForUserFromConfig(req, appData, callback) {

    var lastUUID = req.body['lastKey'],
        count = req.query['count'],
        type = req.query['type'],
        filtUrl = null,
        resultJSON = createEmptyPaginatedData(),
        filtData = nwMonUtils.buildBulkUVEUrls(req.body, appData);

    if (filtData && filtData[0]) {
        filtUrl = filtData[0]['reqUrl'];
    }

    getInstancesListFromConfig(req, appData, function(err, configVMList) {
        if (err || (null == configVMList)) {
            callback(err, resultJSON);
            return;
        }
        var vmList = nwMonUtils.makeUVEList(configVMList);
        processInstanceReqByLastUUID(lastUUID, count, 'name', vmList, filtUrl, appData, function (err, data) {
            callback(err, data);
        });
    });

}

function getVMListByURL (opUrl, postData, appData, vmListCB) {
    var emptyObj = {vmList: [], vmiList: []};
    opApiServer.apiPost(opUrl, postData, appData, function(err, response) {
        if ((null != err) || (null == response)) {
            vmListCB(err, emptyObj);
            return;
        }
        var opVMList = [];
        var vnData =
            commonUtils.getValueByJsonPath(response, 'value', []);
        var vnCnt = vnData.length;
        if (!vnCnt) {
            vmListCB(err, emptyObj);
            return;
        }
        var opVMIList = [];
        for (var i = 0; i < vnCnt; i++) {
            var vmListPerVN =
                commonUtils.getValueByJsonPath(vnData[i],
                                               'value;UveVirtualNetworkAgent;virtualmachine_list',
                                               []);
            var vmiListPerVN =
                commonUtils.getValueByJsonPath(vnData[i],
                                               'value;UveVirtualNetworkAgent;interface_list',
                                               []);
            opVMIList = opVMIList.concat(vmiListPerVN);
            opVMList = opVMList.concat(vmListPerVN);
        }
        opVMIList = _.uniq(opVMIList);
        opVMList = _.uniq(opVMList);
        if (opVMList.length > 1) {
            opVMList.sort(function (s1, s2) {
                return (s1 > s2) - (s1 < s2)
            });
        }
        if (opVMIList.length > 1) {
            opVMIList.sort(function (s1, s2) {
                return (s1 > s2) - (s1 < s2)
            });
        }
        vmListCB(null, {vmList: opVMList, vmiList: opVMIList});
    });
}

/**
 * For requests with/out FQN set, request Analytics based on type and get instance list and proceed with requests to
 * Analytics with the filters in the request.
 * @param req
 * @param appData
 * @param callback
 */
function getInstancesForUserFromAnalytics (req, appData, callback) {
    var lastUUID = req.query['lastKey'];
    var count = req.query['count'];
    var type = req.query['type'];
    var filtUrl = null;

    var reqId = req.body['id'];
    var fqn = req.body['FQN'];
    var opUrl = '/analytics/uves/virtual-network';
    var postData = {};
    var resultJSON = createEmptyPaginatedData();
    postData['cfilt'] = [
        'UveVirtualNetworkAgent:virtualmachine_list',
        'UveVirtualNetworkAgent:interface_list'
    ];
    if (null == fqn) {
        fqn = commonUtils.getValueByJsonPath(req, "cookies;domain", null, false);
    }
    var fqnArr = fqn.split(":");
    if (3 == fqnArr.length) {
       /*  VN */
       postData['kfilt'] = [fqn];
    } else {//if (type == 'project') {
       postData['kfilt'] = [fqn + ":*"];
    }
    getAllConfigVNList(req, appData, function(err, projects){
        if (projects && projects.vnFqnList.length > 0 
                &&  (req.session.userRole.indexOf(global.STR_ROLE_USER) > -1) 
                && 3 !== fqnArr.length) {
           postData['kfilt'] = projects.vnFqnList;
        }
        var filtData = nwMonUtils.buildBulkUVEUrls(req.body, appData);
        if (filtData && filtData[0]) {
            filtUrl = filtData[0]['reqUrl'];
        }

        redisUtils.getRedisData(reqId, function(error, opVMCachedList) {
            if (null != opVMCachedList) {
                var data = nwMonUtils.makeUVEList(opVMCachedList, 'VMUUID');

                processInstanceReqByLastUUID(lastUUID, count, 'VMUUID', data, filtUrl, appData,
                                         function (err, data) {
                    getVMIDetils(data, appData, function(error, vmiData) {
                        data.vmiData = vmiData;
                        callback(err, data);
                    });
                });
            } else {
                getVMListByURL(opUrl, postData, appData, function(err, list) {
                    var opVMList = list.vmList;
                    if (!opVMList.length) {
                        callback(null, {data: {}, lastKey: null, more: false});
                        return;
                    }
                    redisUtils.setexRedisData(reqId, uveListExpTime, opVMList);
                    var data = nwMonUtils.makeUVEList(opVMList, 'VMUUID');
                    processInstanceReqByLastUUID(lastUUID, count, 'VMUUID', data, filtUrl, appData, function (err, data) {
                        getVMIDetils(data, appData, function(error, vmiData) {
                            data.vmiData = vmiData;
                            callback(err, data);
                        });
                    });
                });
            }
        });
    });
}

function getVMIDetils (vmPaginatedData, appData, callback) {
    var vmiData = commonUtils.getValueByJsonPath(vmPaginatedData, "data;value", []);
    var vmiCnt = vmiData.length;
    var opVMIList = [];
    for (var i = 0; i < vmiCnt; i++) {
        var intfList = commonUtils.getValueByJsonPath(vmiData[i],
                                                      "value;UveVirtualMachineAgent;interface_list",
                                                      []);
        opVMIList = opVMIList.concat(intfList);
    }
    if (!opVMIList.length) {
        callback(null, {});
        return;
    };
    if ((null != opVMIList) && (opVMIList.length > 1)) {
        opVMIList = _.uniq(opVMIList);
    }
    var url = "/analytics/uves/virtual-machine-interface";
    var postData = {};
    postData["kfilt"] = opVMIList;
    opApiServer.apiPost(url, postData, appData, function(error, data) {
        callback(error, data);
    });
}

/**
 *
 * @param req
 * @param res
 * @param appData
 */
function getInstancesDetails (req, res, appData) {
    var getVMCB = instanceDetailsMap[req.session.loggedInOrchestrationMode];
    if (null != getVMCB) {
        getVMCB(req, appData, function (err, instDetails) {
            commonUtils.handleJSONResponse(err, res, instDetails);
            return;
        });
        return;
    }
    getInstancesForUserFromAnalytics(req, appData, function (err, instDetails) {
        commonUtils.handleJSONResponse(err, res, instDetails);
        return;
    });
}


/* List all public functions */
exports.getFlowSeriesByVN = getFlowSeriesByVN;
exports.getProjectSummary = getProjectSummary;
exports.getNetworkStats = getNetworkStats;
exports.getVNStatsSummary = getVNStatsSummary;
exports.getFlowSeriesByVM = getFlowSeriesByVM;
exports.getVMStatsSummary = getVMStatsSummary;
exports.getNetworkStatsSummary = getNetworkStatsSummary;
exports.getVirtualNetworksSummary = getVirtualNetworksSummary;
exports.getVirtualMachine = getVirtualMachine;
exports.getVirtualMachinesSummary = getVirtualMachinesSummary;
exports.getVirtualInterfacesSummary = getVirtualInterfacesSummary;
exports.getVMDetails = getVMDetails;
exports.getInstanceDetails = getInstanceDetails;
exports.getVirtualNetworks = getVirtualNetworks;
exports.isAllowedVN = isAllowedVN;
exports.getVNListByProject = getVNListByProject;
exports.getStats = getStats;
exports.getUVEVirtualNetworksList = getUVEVirtualNetworksList;
exports.getProjects = getProjects;
exports.getVNetworks = getVNetworks;
exports.getNetworkDomainSummary = getNetworkDomainSummary;
exports.getNetworkDetails = getNetworkDetails;
exports.getInstanceDetailsForVRouter = getInstanceDetailsForVRouter;
//Instances
exports.getInstanceUUIDList = getInstanceUUIDList;
exports.getInstancesDetails = getInstancesDetails;
exports.getInterfaceUUIDList = getInterfaceUUIDList;
exports.getInterfacesDetails = getInterfacesDetails;
exports.getVirtualNetworkUUIDList = getVirtualNetworkUUIDList;
exports.getVirtualNetworksDetails = getVirtualNetworksDetails;
