/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var rest = require(process.mainModule.exports["corePath"] +
                   '/src/serverroot/common/rest.api'),
    logutils = require(process.mainModule.exports["corePath"] +
                       '/src/serverroot/utils/log.utils'),
    commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils'),
    messages = require(process.mainModule.exports["corePath"] +
                       '/src/serverroot/common/messages'),
    global = require(process.mainModule.exports["corePath"] +
                     '/src/serverroot/common/global'),
    flowCache = require('../../../common/api/flowCache.api'),
    redisPub = require(process.mainModule.exports["corePath"] +
                       '/src/serverroot/jobs/core/redisPub'),
    qUtils = require(process.mainModule.exports["corePath"] +
                     '/webroot/reports/qe/api/query.utils'),
    async = require('async');

nwMonJobsApi = module.exports;

function getZeroFlowSeries (startTime, endTime, timeGran)
{
    var timeInterval = timeGran * 1000000,
        countTimeIntervals = Math.ceil((endTime - startTime) / timeInterval),
        zeroFlowSeries = [];

    for (var i = 0; i < countTimeIntervals; i++) {
        zeroFlowSeries.push(getZeroFlowSample(startTime + (timeInterval * i)));
    }

    return zeroFlowSeries;
}

function getZeroFlowSample (time)
{
    return {
        time: time, outPkts: 0, outBytes: 0, inPkts: 0, inBytes: 0,
        totalPkts: 0, totalBytes: 0
    };
}

function processVNFlowSeriesData (pubChannel, saveChannelKey, jobData, done)
{
    var appData = jobData.taskData.appData;
    var vnName = appData['srcVN'];
    var vrouter = appData['vrouter'];
    var where = "";
    if (null != vnName) {
        where = "(name = " + vnName + " )";
        logutils.logger.debug(messages.qe.qe_execution +
                              'VN Flow Series data ' + vnName);
    } else if (null != vrouter) {
        where = "(vn_stats.vrouter = " + vrouter + " )";
        logutils.logger.debug(messages.qe.qe_execution +
                              'vrouter Flow Series data ' + vrouter);
    }
    var selectArr = ['SUM(vn_stats.out_bytes)', 'SUM(vn_stats.out_tpkts)',
        'SUM(vn_stats.in_bytes)', 'SUM(vn_stats.in_tpkts)', "T="]
    if (null != vnName) {
        selectArr.push('name');
    }
    var qeQuery =
        qUtils.formQEQueryData('StatTable.UveVirtualNetworkAgent.vn_stats',
                               appData, selectArr, where, null);
    var qeQueries = [];
    qeQueries.push(qeQuery);
    flowCache.getFlowSeriesDataByQE(qeQueries, appData, jobData, 'vn', true,
                                    function(error, resultArr) {
        var data = resultArr[0];
        var resultJSON, resultJSONStr = '';
        if (data != null) {
            if ((null === data['flow-series']) ||
                (!data['flow-series'].length)) {
                var timeGran =
                    commonUtils.getValueByJsonPath(qeQuery,
                                                   "formModelAttrs;time_granularity",
                                                   null);
                data['flow-series'] =
                    getZeroFlowSeries(data['summary']['start_time'],
                                      data['summary']['end_time'],
                                      timeGran);
            }
            resultJSON = data;
        } else {
            resultJSON = {};
        }
        resultJSONStr = JSON.stringify(resultJSON);
        redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                                    global.HTTP_STATUS_RESP_OK,
                                    resultJSONStr, resultJSONStr,
                                    0, 0, done);
    });
}

function processVNsFlowSeriesData (pubChannel, saveChannelKey, jobData, done)
{
    var appData = jobData.taskData.appData;
    var srcVN = appData['srcVN'];
    var dstVN = appData['dstVN'];
    var where = "(name = " + srcVN + " AND vn_stats.other_vn = " + dstVN + ")";
    var selectArr = ['SUM(vn_stats.out_bytes)', 'SUM(vn_stats.out_tpkts)',
        'SUM(vn_stats.in_bytes)', 'SUM(vn_stats.in_tpkts)', "T=", 'name',
        'vn_stats.other_vn'];

    var qeQuery =
        qUtils.formQEQueryData('StatTable.UveVirtualNetworkAgent.vn_stats',
                               appData, selectArr, where, null);
    var qeQueries = [];
    qeQueries.push(qeQuery);
    logutils.logger.debug(messages.qe.qe_execution +
                          'Connected VNs Flow Series data ' +
                          srcVN + ' ' + dstVN);
    flowCache.getFlowSeriesDataByQE(qeQueries, appData, jobData, 'conn-vn', true,
                                    function(error, resultArr) {
        var resultJSON, resultJSONStr = '';
        var data = resultArr[0];
        if (data != null) {
            if ((null === data['flow-series']) || (!data['flow-series'].length)) {
                var timeGran =
                    commonUtils.getValueByJsonPath(qeQuery,
                                                   "formModelAttrs;time_granularity",
                                                   null);
                data['flow-series'] =
                    getZeroFlowSeries(data['summary']['start_time'],
                                      data['summary']['end_time'],
                                      timeGran);
            }
            resultJSON = data;
        } else {
            resultJSON = {};
        }
        resultJSONStr = JSON.stringify(resultJSON);
        redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                                    global.HTTP_STATUS_RESP_OK,
                                    resultJSONStr, resultJSONStr,
                                    0, 0, done);
    });
}

function processVMFlowSeriesData (pubChannel, saveChannelKey, jobData, done)
{
    var appData = jobData.taskData.appData,
        srcVNObjArr = [], destVNObjArr = [],
        vnName = appData['vName'], vmName = appData['vmName'],
        vmVnName = appData['vmVnName'], fip = appData['fip'], ip = appData.ip,
        context = 'vm',
        whereClause = "(name = " + vmVnName + ")";

     var table = 'StatTable.UveVMInterfaceAgent.if_stats',
        selectArr = ['SUM(if_stats.out_bytes)', 'SUM(if_stats.in_bytes)',
            'SUM(if_stats.out_pkts)', 'SUM(if_stats.in_pkts)',
            "T=", 'name'];

    if (fip) {
        table = 'StatTable.UveVMInterfaceAgent.fip_diff_stats';
        selectArr = ['SUM(fip_stats.out_bytes)', 'SUM(fip_stats.in_bytes)',
                  'SUM(fip_stats.out_pkts)', 'SUM(fip_stats.in_pkts)',
                  "T=", 'name'];
        whereClause = "(fip_diff_stats.ip_address = " + ip + ")";
        context = 'fip';
    }
    var qeQuery =
        qUtils.formQEQueryData(table, appData, selectArr, whereClause, null);
    var qeQueries = [];
    qeQueries.push(qeQuery);
    logutils.logger.debug(messages.qe.qe_execution +
                          'VM Flow Series data ' + vnName);
    flowCache.getFlowSeriesDataByQE(qeQueries, appData, jobData, context, true,
                                    function(error, resultArr) {
        var resultJSON, resultJSONStr = '';
        var data = resultArr[0];
        if (data != null) {
            if ((null == data['flow-series']) || (!data['flow-series'].length)) {
                var timeGran =
                    commonUtils.getValueByJsonPath(qeQuery,
                                                   "formModelAttrs;time_granularity",
                                                   null);
                data['flow-series'] =
                    getZeroFlowSeries(data['summary']['start_time'],
                                      data['summary']['end_time'],
                                      timeGran);
            }
            resultJSON = data;
        } else {
            resultJSON = {};
        }
        resultJSONStr = JSON.stringify(resultJSON);
        redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                                    global.HTTP_STATUS_RESP_OK,
                                    resultJSONStr, resultJSONStr,
                                    0, 0, done);
    });
}

function getNetworkOutIndex (resultJSON, statEntry, srcSelectArr, destSelectArr)
{
    var key;
    var found = false;
    var len = resultJSON.length;
    var selectArrlen = srcSelectArr.length;

    for (var i = 0; i < len; i++) {
        if (found == true) {
            break;
        }
        for (j = 0; j < selectArrlen; j++) {
            srcKey = srcSelectArr[j];
            destKey = destSelectArr[j];
            if ((srcKey == 'SUM(bytes)') || (srcKey == 'SUM(packets)') ||
                (srcKey == 'flow_count')) {
                continue;
            }
            if (resultJSON[i][srcKey] != statEntry[destKey]) {
                found = false;
                break;
            } else {
                found = true;
            }
        }
    }
    if ((i == len) && (found == false)) {
        return -1;
    }
    return (i - 1);
}

function fillResultJSONByIndex (resultJSON, index, statEntry, selectArr, isSrc)
{
    var selectArrlen = selectArr.length;
    var key;
    resultJSON[index]['name'] = (statEntry['sourcevn']) ?
        statEntry['sourcevn'] : statEntry['destvn'];
    for (var i = 0; i < selectArrlen; i++) {
        key = selectArr[i];
        if (key == 'SUM(bytes)') {
            if (isSrc) {
                resultJSON[index]['inBytes'] = statEntry[key];
            } else {
                resultJSON[index]['outBytes'] = statEntry[key];
            }
        } else if (key == 'SUM(packets)') {
            if (isSrc) {
                resultJSON[index]['inPkts'] = statEntry[key];
            } else {
                resultJSON[index]['outPkts'] = statEntry[key];
            }
        } else if (key == 'flow_count') {
            if (isSrc) {
                resultJSON[index]['inFlowCount'] = statEntry[key];
            } else {
                resultJSON[index]['outFlowCount'] = statEntry[key];
            }
        } else {
            resultJSON[index][key] = statEntry[key];
        }
    }
    resultJSON[index]['totalPkts'] = resultJSON[index]['inPkts'] +
        resultJSON[index]['outPkts'];
    resultJSON[index]['totalBytes'] = resultJSON[index]['inBytes'] +
        resultJSON[index]['outBytes'];
}

function parseNetStatDataProjectOrNetwork(resultJSON, data, srcSelectArr,
                                          destSelectArr)
{
    if ((null == data) || (0 == data.length)) {
        return;
    }
    try {
        var outStat = data[0]['data'];
        var outStatLen = outStat.length;
        resultJSON["sport"] = [];
    } catch (e) {
        outStatLen = 0;
    }
    for (var i = 0; i < outStatLen; i++) {
        resultJSON["sport"][i] = {};
        resultJSON["sport"][i]['outBytes'] = 0;
        resultJSON["sport"][i]['outPkts'] = 0;
        resultJSON["sport"][i]['outFlowCount'] = 0;
        fillResultJSONByIndex(resultJSON["sport"], i, outStat[i],
                              srcSelectArr, false);
    }
    try {
        var inStat = data[1]['data'];
        var inStatLen = inStat.length;
        resultJSON["dport"] = [];
    } catch (e) {
        inStatLen = 0;
    }
    for (i = 0; i < inStatLen; i++) {
        resultJSON["dport"][i] = {};
        resultJSON["dport"][i]['inBytes'] = 0;
        resultJSON["dport"][i]['inPkts'] = 0;
        resultJSON["dport"][i]['inFlowCount'] = 0;
        fillResultJSONByIndex(resultJSON["dport"], i, inStat[i],
                              destSelectArr, true);
    }
}

function getQEWhereStrByProtoVN (vnType, appData)
{
    var vn = appData.fqName;
    var ip = appData.ip;
    var protoList = [1, 6, 17];
    var protoListLen = protoList.length;
    if (vn.split(':').length != 3) {
        vn = vn + ":";
        operator = " Starts with ";
    } else {
        operator = " = ";
    }

    var qeWhere = "";
    for (var i = 0; i < protoListLen; i++) {
        qeWhere += "(protocol = " + protoList[i] + " AND " + vnType +
            operator + vn;
        if (null != ip) {
            if ("sourcevn" == vnType) {
                qeWhere += " AND sourceip = " + ip;
            } else {
                qeWhere += " AND destip = " + ip;
            }
        }
        qeWhere += ")";
        if ((protoListLen > 1) && (i < protoListLen - 1)) {
            qeWhere += " OR ";
        }
    }
    return qeWhere;
}

function getTrafficStatsByPort (pubChannel, saveChannelKey, jobData, done)
{
    var appData = jobData.taskData.appData;

    var srcSelectArr = ['SUM(bytes)', 'SUM(packets)', 'sport', 'protocol'];
    var destSelectArr = ['SUM(bytes)', 'SUM(packets)', 'dport', 'protocol'];
    var filters = "sort_fields: SUM(bytes) & sort: desc";

    var srcQEWhere = getQEWhereStrByProtoVN("sourcevn", appData);
    var destQEWhere = getQEWhereStrByProtoVN("destvn", appData);

    var qeQueries = [];
    var srcQEQuery =
        qUtils.formQEQueryData("FlowSeriesTable", appData, srcSelectArr,
                               srcQEWhere, filters);
    qeQueries.push(srcQEQuery);
    var destQEQuery =
        qUtils.formQEQueryData("FlowSeriesTable", appData, destSelectArr,
                               destQEWhere, filters);
    qeQueries.push(destQEQuery);
    flowCache.getFlowSeriesDataByQE(qeQueries, appData, jobData, null, null,
                                    function (err, qeResps) {
        var resultJSON = {}, resultJSONStr = '';
        parseNetStatDataProjectOrNetwork(resultJSON, qeResps, srcSelectArr,
                                         destSelectArr);
        resultJSON['startTime'] =
            commonUtils.getValueByJsonPath(srcQEQuery,
                                           "formModelAttrs;from_time_utc",
                                           null);

        resultJSON['endTime'] =
            commonUtils.getValueByJsonPath(srcQEQuery,
                                           "formModelAttrs;to_time_utc",
                                           null);
       resultJSONStr = JSON.stringify(resultJSON);
       redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                                   global.HTTP_STATUS_RESP_OK,
                                   resultJSONStr, resultJSONStr,
                                   0, 0, done);
    });
}

exports.processVNFlowSeriesData = processVNFlowSeriesData;
exports.processVNsFlowSeriesData = processVNsFlowSeriesData;
exports.processVMFlowSeriesData = processVMFlowSeriesData;
exports.getTrafficStatsByPort = getTrafficStatsByPort;

