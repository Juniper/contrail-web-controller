/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * flowCache.api.js
 *      This file contains caching infra for flow-series data
 */

var commonUtils = require(process.mainModule.exports.corePath +
                            "/src/serverroot/utils/common.utils")
    , global = require(process.mainModule.exports.corePath + "/src/serverroot/common/global")
    , util = require("util")
    , logutils = require(process.mainModule.exports.corePath +
                         "/src/serverroot/utils/log.utils")
    , qeUtils = require(process.mainModule.exports.corePath +
                       "/webroot/reports/qe/api/query.utils")
    , messages = require(process.mainModule.exports.corePath +
                         "/src/serverroot/common/messages")
    , threadApi = require(process.mainModule.exports.corePath +
                          "/src/serverroot/common/threads.api")
    , _ = require("lodash")
    , async = require("async");

if (!module.parent) {
	logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
		module.filename));
	process.exit(1);
}

function sortFlowSeriesDataByTS (a, b) {
    return (parseInt(a.time) - parseInt(b.time));
}

function fillFlowSeriesData (resultJSON, i, j, inStat, outStat) {
    if (!_.isNil(inStat)) {
        resultJSON.time = inStat[i].T;
    } else {
        /* We have either inStat/outStat/both valid */
        resultJSON.time = outStat[j].T;
    }
    try {
        resultJSON.outPkts = ((j === -1) ? 0 :
                                    outStat[j]["SUM(packets)"]);
    } catch(e) {
        resultJSON.outPkts = 0;
    }   
    try {
        resultJSON.outBytes = ((j === -1) ? 0 :
                                     outStat[j]["SUM(bytes)"]);
    } catch(e) {
        resultJSON.outBytes = 0;
    }   
    try {
        resultJSON.inPkts = ((i === -1) ? 0 :
                                inStat[i]["SUM(packets)"]);
    } catch(e) {
        resultJSON.inPkts = 0;
    }   
    try {
        resultJSON.inBytes = ((i === -1) ? 0 :
                                 inStat[i]["SUM(bytes)"]);
    } catch(e) {
        resultJSON.inBytes = 0;
    }
    resultJSON.totalPkts = parseInt(resultJSON.inPkts) +
        parseInt(resultJSON.outPkts);
    resultJSON.totalBytes = parseInt(resultJSON.inBytes) +
        parseInt(resultJSON.outBytes);
}

function parseFlowSeriesData (dataObj, callback) {
    var data = dataObj.data;
    var timeObj = dataObj.timeObj;
    var index = 0;
    var outStat;
    var outStatLen;
    var inStat;
    var inStatLen;
    var resultJSON = [];
    var results = {};
    var inStatTime = 0;
    var outStatTime = 0;
    try {
        outStat = data[0].value;
        outStatLen = outStat.length;
    } catch(e) {
        outStatLen = 0;
    }
    try {
        inStat = data[1].value;
        inStatLen = inStat.length;
    } catch(e) {
        inStatLen = 0;
    }
    for (var i = 0; i < inStatLen; i++) {
        resultJSON[i] = {};
        inStatTime = parseInt(inStat[i].T);
        for (j = 0; j < outStatLen; j++) {
            if (inStatTime === parseInt(outStat[j].T)) {
                break;
            }
        }
        if ((j === outStatLen) && (outStatLen !== 0)) {
            /* No Match in outStat */
            fillFlowSeriesData(resultJSON[i], i, -1, inStat, null);
        } else {
            /* Match found */
            fillFlowSeriesData(resultJSON[i], i, j, inStat, outStat);
        }
    }
    index = i;
    for (i = 0; i < outStatLen; i++) {
        for (var j = 0; j < inStatLen; j++) {
            /* Check if we have any match, if yes then already we have included
             * earlier step, so do not include that entry
             */
            outStatTime = parseInt(outStat[i].T);
            if (outStatTime === parseInt(inStat[j].T)) {
                break;
            }
        }
        if (j === inStatLen) {
            resultJSON[index] = {};
            /* We did not find this entry, so add now */
            fillFlowSeriesData(resultJSON[index], -1, i,
                               null, outStat);
            index++;
        }
    }
    /* Now Sort the data */
    resultJSON.sort(sortFlowSeriesDataByTS);
    results.summary = {};
    results.summary.start_time = timeObj.start_time;
    results.summary.end_time = timeObj.end_time;
    results.summary.timeGran_microsecs =
        Math.floor(parseInt(timeObj.timeGran)) * global.MILLISEC_IN_SEC *
        global.MICROSECS_IN_MILL;
    results["flow-series"] = resultJSON;
    callback(null, results);
}
/*
 * Function used to parse the stats oracle response for both virtual network and virtual machine
 */
function parseFlowSeriesDataForOracleStats (dataObj, callback) {
    var stats = dataObj.data;
    var timeObj = dataObj.timeObj;
    var context = dataObj.context;
    var resultJSON = [];
    var results = {};
    var statsLen = 0;
    var props = global.STATS_PROP[context];
    try {
        statsLen = stats.length;
    } catch(e) {
        statsLen = 0;
    }
    for (var i = 0; i < statsLen; i++) {
        var obj = {};
        obj.time = stats[i]["T="];
        obj.inBytes = commonUtils.ifNull(stats[i][props.inBytes], 0);
        obj.outBytes = commonUtils.ifNull(stats[i][props.outBytes], 0);
        obj.inPkts = commonUtils.ifNull(stats[i][props.inPkts], 0);
        obj.outPkts = commonUtils.ifNull(stats[i][props.outPkts], 0);
        obj.totalPkts = obj.inPkts + obj.outPkts;
        obj.totalBytes = obj.inBytes + obj.outBytes;
        resultJSON[i] = obj;
    }
    /* Now Sort the data */
    resultJSON.sort(sortFlowSeriesDataByTS);
    results.summary = {};
    results.summary.start_time = timeObj.start_time;
    results.summary.end_time = timeObj.end_time;
    results.summary.timeGran_microsecs =
        Math.floor(parseInt(timeObj.timeGran)) * global.MILLISEC_IN_SEC *
        global.MICROSECS_IN_MILL;
    results["flow-series"] = resultJSON;
    callback(null, results);
}

/*
function printFlowSeriesData (data)
{
    return;
    var cnt = 0;
    try {
        cnt = data['flow-series'].length;
        for (var i = 0; i < cnt; i++) {
            var diff = (data['flow-series'][i]['time'] -
                        data['flow-series'][0]['time']) /
                data['summary']['timeGran_microsecs'];
            if (i != 0) {
                var diff1 = (data['flow-series'][i]['time'] -
                             data['flow-series'][i-1]['time']) /
                    data['summary']['timeGran_microsecs'];
            } else {
                diff1 = 0;
            }
            logutils.logger.debug(i + 'th Entry: ' + new
                                  Date((parseInt(data['flow-series'][i]['time']))/1000)
                                  + ' ' + data['flow-series'][i]['time'] + ' ' +
                                  diff + ' ' + diff1);
        }
    } catch(e) {
    }
    logutils.logger.debug("Total entries:", cnt);
}

function createTimeQueryJsonObjByServerTimeFlag (minsSince, serverTimeFlag) {
    var timeObj = {};
    if (_.isNil(serverTimeFlag) || (false === serverTimeFlag) ||
        ("false" === serverTimeFlag)) {
        timeObj.start_time = "now-" + minsSince + "m";
        timeObj.end_time = "now";
        return timeObj;
    }

    var endTime = commonUtils.getUTCTime(new Date().getTime());
    var startTime =
        commonUtils.getUTCTime(commonUtils.adjustDate(new
                Date(endTime),
            {"min": -minsSince}).getTime());
    timeObj.start_time = startTime * 1000;
    timeObj.end_time = endTime * 1000;
    return timeObj;
}
*/

function runQueries (qeQueryObj, callback) {
    var qApi = require(process.mainModule.exports.corePath +
                       "/webroot/reports/qe/api/query.api");
    qApi.runQuery(null, qeQueryObj.query, qeQueryObj.appData, null,
                  function(error, qeResps) {
        callback(error, qeResps);
    });
}

function getFlowSeriesDataByQE (qeQueries, uiQuery, appData, context,
                                doParse, callback) {
    var timeObj = qeUtils.createTimeObjByAppData(uiQuery);
    var resultJSON = [];
    var qeObjArr = [];
    var qeQueriesLen = qeQueries.length;
    for (var i = 0; i < qeQueriesLen; i++) {
        qeObjArr.push({appData: appData, query: qeQueries[i]});
    }
    var resultArr = [];
    async.map(qeObjArr, runQueries,
              commonUtils.doEnsureExecution(function (err, qeResps) {
        if (!_.isNil(err) || _.isNil(qeResps)) {
            callback(err, resultJSON);
            return;
        }
        if ((false === doParse) || _.isNil(doParse)) {
            callback(err, qeResps);
            return;
        }
        var qeRespsLen = qeResps.length;
        for (var i = 0; i < qeRespsLen; i++) {
            var tableType =
                commonUtils.getValueByJsonPath(qeQueries[i],
                                               "formModelAttrs;table_type",
                                               null);
            var data = commonUtils.getValueByJsonPath(qeResps[i], "data", []);
            if ("STAT" === tableType) {
                threadApi.runInThread(parseFlowSeriesDataForOracleStats,
                                      {data: data, timeObj: timeObj, context:
                                      context}, function(error, resultJSON) {
                    resultArr.push(resultJSON);
                    callback(null, resultArr);
                });
            } else {
                threadApi.runInThread(parseFlowSeriesData,
                                      {data: data, timeObj: timeObj},
                                      function(error, resultJSON) {
                    resultArr.push(resultJSON);
                    callback(null, resultArr);
                });
            }
        }
        callback(null, resultArr);
    }, global.DEFAULT_MIDDLEWARE_API_TIMEOUT));
}

exports.getFlowSeriesDataByQE = getFlowSeriesDataByQE;
