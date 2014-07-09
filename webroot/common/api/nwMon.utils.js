/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 *  nwMon.utils.js:
 *      This file contains utility functions for network monitoring pages
 */

var commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils'),
    rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api'),
    logutils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/log.utils'),
    infraCmn = require('./infra.common.api'),
    assert = require('assert'),
    config = require(process.mainModule.exports["corePath"] + '/config/config.global.js'),
    opApiServer = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/opServer.api'),
    async = require('async');

var opServer = rest.getAPIServer({apiName:global.label.OPS_API_SERVER,
                                  server:config.analytics.server_ip,
                                  port:config.analytics.server_port });
function getTimeGranByTimeSlice (timeObj, sampleCnt)
{
    var startTime = timeObj['start_time'];
    var endTime = timeObj['end_time'];
    if (true == isNaN(startTime)) {
        var str = 'now-';
        var pos = startTime.indexOf(str);
        if (pos != -1) {
            var mins = startTime.slice(pos + str.length);
            mins = mins.substr(0, mins.length - 1);
            mins = parseInt(mins);
        } else {
            assert(0);
        }
        var timeGran = (mins * 60) / sampleCnt;
        return Math.floor(timeGran);
    }

    var timeGran = (endTime - startTime) / (sampleCnt * 
        global.MILLISEC_IN_SEC * global.MICROSECS_IN_MILL);
    if (timeGran < 1) { 
        timeGran = 1; 
    }    
    return Math.floor(timeGran);
}

function createTimeObj (appData)
{
    var minsSince = appData['minsSince'];
    var minsAlign = appData['minsAlign'];

    var endTime = commonUtils.getUTCTime(new Date().getTime());
    var startTime = 0;

    if (minsSince != -1) {
        if (null == appData['startTime']) {
            var ctDate = new Date();
            if (null != minsAlign) {
                ctDate.setSeconds(0);
            }

            startTime =
                commonUtils.getUTCTime(commonUtils.adjustDate(ctDate, 
                                                              {'min':-minsSince}).getTime());
        } else {
            startTime = parseInt(appData['startTime']);
            endTime = parseInt(appData['endTime']);
        }
    }   

    var timeObj = {}; 
    timeObj['start_time'] = startTime * 1000;
    timeObj['end_time'] = endTime * 1000;
    return timeObj;
}

function getStatDataByQueryJSON (srcQueryJSON, destQueryJSON, callback)
{
    var dataObjArr = [];
    commonUtils.createReqObj(dataObjArr, global.RUN_QUERY_URL,
                             global.HTTP_REQUEST_POST,
                             commonUtils.cloneObj(srcQueryJSON));
    commonUtils.createReqObj(dataObjArr, global.RUN_QUERY_URL,
                             global.HTTP_REQUEST_POST,
                             commonUtils.cloneObj(destQueryJSON));
    logutils.logger.debug("Query1 executing: " + JSON.stringify(dataObjArr[0]['data']));
    logutils.logger.debug("Query2 executing:" + JSON.stringify(dataObjArr[1]['data']));
    async.map(dataObjArr, commonUtils.getServerRespByRestApi(opServer, true),
              function(err, data) {
        callback(err, data);
    });
}

function createTimeQueryObjByStartEndTime (startTime, endTime) 
{
    var timeObj = {};
    timeObj['start_time'] = parseInt(startTime) * global.MICROSECS_IN_MILL;
    timeObj['end_time'] = parseInt(endTime) * global.MICROSECS_IN_MILL;
    return timeObj;
}

function createTimeObjByAppData (appData) 
{
    var serverTime = appData['serverTime'];
    var minsSince = appData['minsSince'];
    var timeObj = {};
    if ((minsSince != null) && (null == appData['startTime'])) {
        if ((null != serverTime) && (('true' == serverTime) ||
                                     (true == serverTime))) {
            timeObj = createTimeObj(appData);
            timeObj['timeGran'] = 
                getTimeGranByTimeSlice(timeObj, appData['sampleCnt']);
        } else {
            timeObj['start_time'] = 'now-' + minsSince +'m';
            timeObj['end_time'] = 'now';
            timeObj['timeGran'] = getTimeGranByTimeSlice(timeObj, 
                                                         appData['sampleCnt']);
        }
    } else {
        assert(appData['startTime']);
        assert(appData['endTime']);
        timeObj = createTimeQueryObjByStartEndTime(appData['startTime'],
                                                   appData['endTime']);
        if (null == appData['timeGran']) {
            timeObj['timeGran'] = getTimeGranByTimeSlice(timeObj,
                                                         appData['sampleCnt']);
        } else {
            timeObj['timeGran'] = parseInt(appData['timeGran']);
        }
    }
    return timeObj;
}

function sortEntriesByObj (entries, matchStr)
{
    if (null != matchStr) {
        entries.sort(function(a, b) {
            if (a[matchStr] > b[matchStr]) {
                return 1;
            } else if (a[matchStr] < b[matchStr]) {
                return -1;
            }
            return 0;
        });
    } else {
        entries.sort();
    }
    return entries;
}

function getnThIndexByLastKey (lastKey, entries, matchStr)
{
    if (null == lastKey) {
        return -1;
    }
    try {
        var cnt = entries.length;
    } catch(e) {
        return -1;
    }
    for (var i = 0; i < cnt; i++) {
        if (null == matchStr) {
            matchedStr = entries[i];
        } else {
            matchedStr = entries[i][matchStr];
        }
        if (matchedStr == lastKey) {
            return i;
        } else if (matchedStr > lastKey) {
            return i - 1;
        }
    }
    return -2;
}

function makeUVEList (keys)
{
    var result = [];
    var len = keys.length;
    for (var i = 0; i < len; i++) {
        result[i] = {};
        result[i]['name'] = keys[i];
    }
    return result;
}

function buildBulkUVEUrls (filtData, appData)
{
    filtData = filtData['data'];
    var url = '/analytics/uves';
    var dataObjArr = [];

    try {
        var modCnt = filtData.length;
    } catch(e) {
        return null;
    }
    for (var i = 0; i < modCnt; i++) {
        type = filtData[i]['type'];
        hostname = filtData[i]['hostname'];
        module = filtData[i]['module'];
        cfilt = filtData[i]['cfilt'];
        kfilt = filtData[i]['kfilt'];
        mfilt = filtData[i]['mfilt'];
        reqUrl = 
            infraCmn.getBulkUVEUrl(type, hostname, module,
                                   {cfilt:cfilt, kfilt:kfilt, mfilt:mfilt});
        /* All URLs should be valid */
        if (null == reqUrl) {
            return null;
        }
        commonUtils.createReqObj(dataObjArr, reqUrl, null,
                                 null, opApiServer, null, appData);
    }
    return dataObjArr;
}

exports.getTimeGranByTimeSlice = getTimeGranByTimeSlice;
exports.getStatDataByQueryJSON = getStatDataByQueryJSON;
exports.createTimeQueryObjByStartEndTime = createTimeQueryObjByStartEndTime;
exports.createTimeObjByAppData = createTimeObjByAppData;
exports.getnThIndexByLastKey = getnThIndexByLastKey;
exports.makeUVEList = makeUVEList;
exports.sortEntriesByObj = sortEntriesByObj;
exports.buildBulkUVEUrls = buildBulkUVEUrls;

