/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api'),
    opServer = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/opServer.api'),
    logutils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/log.utils'),
    commonUtils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/common.utils'),
    config = require(process.mainModule.exports["corePath"] + '/config/config.global.js'),
    global = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/global'),
    appErrors = require(process.mainModule.exports["corePath"] + '/src/serverroot/errors/app.errors'),
    async = require('async'),
    util = require('util'),
    ctrlGlobal = require('../../../../common/api/global'),
    qeAPI = require('../../../../reports/api/qe.api.js'),
    jsonPath = require('JSONPath').eval,
    _ = require('underscore');

var opApiServer = rest.getAPIServer({
    apiName:global.label.OPS_API_SERVER,
    server:config.analytics.server_ip,
    port:config.analytics.server_port
});

function getPRouterChassisInfo(req, res, appData) {
    var url = '/analytics/uves/prouters';
    opApiServer.api.get(url, function (error, uveData) {
        if(null != error) {
            commonUtils.handleJSONResponse(error, res, null);
            return;
        }
        if(null != uveData && uveData.length != 0) {
            var dataObjArr = [], uveDataLen = uveData.length;
            for (var i = 0; i < uveDataLen; i++) {
                if (uveData[i]['name'] != null) {
                    var reqUrl = '/analytics/uves/prouter/' + uveData[i]['name'] + '?flat';
                    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET);
                }
            }
            async.map(dataObjArr,
                commonUtils.getServerResponseByRestApi(opServer, true),
                function(err, data) {
                    if (err) {
                        commonUtils.handleJSONResponse(err, res, null);
                    } else {
                        var resultJSON = {PRouterChassisUVEs: []};
                        for (var i = 0; i < data.length; i++) {
                            resultJSON['PRouterChassisUVEs'].push(data[i]);
                        }
                        commonUtils.handleJSONResponse(null, res, resultJSON);
                    }
                });
        } else {
            logutils.logger.debug("Empty PRouters list in API response.");
            commonUtils.handleJSONResponse(error, res, null);
            return;
        }
    });
}

function createTimeQueryJsonObj (minsSince, endTime){
    var startTime = 0, timeObj = {};

    if ((null != minsSince) && ((null == endTime) || ('' == endTime))) {
        timeObj['start_time'] = 'now-' + minsSince +'m';
        timeObj['end_time'] = 'now';
        return timeObj;
    }

    if(('now' == endTime)){
        endTime = commonUtils.getUTCTime(new Date().getTime());
    }

    if(endTime != null && endTime != '' ) {
        try {
            endTime = parseInt(endTime);
        } catch (err) {
            endTime = commonUtils.getUTCTime(new Date().getTime());
        }
    }else{
        endTime = commonUtils.getUTCTime(new Date().getTime());
    }

    if (minsSince != -1) {
        startTime = commonUtils.getUTCTime(commonUtils.adjustDate(new Date(endTime), {'min':-minsSince}).getTime());
    }

    timeObj['start_time'] = startTime * 1000;
    timeObj['end_time'] = endTime * 1000;

    return timeObj;
}

function createWhereClause(fieldName, fieldValue, operator){
    var whereClause = {};
    if (fieldValue != null) {
        whereClause = {};
        whereClause.name = fieldName;
        whereClause.value = fieldValue;
        whereClause.op = operator;
    }
    return whereClause;
}

function formatQueryStringWithWhereClause (table, whereClause, selectFieldObjArr, timeObj, noSortReqd, limit)
{
    var queryJSON = qeAPI.getQueryJSON4Table(table),
        selectLen = selectFieldObjArr.length;
    queryJSON['select_fields'] = [];

    for (var i = 0; i < selectLen; i++) {
        /* Every array element is one object */
        queryJSON['select_fields'][i] = selectFieldObjArr[i];
    }

    queryJSON['start_time'] = timeObj['start_time'];
    queryJSON['end_time'] = timeObj['end_time'];
    if ((null == noSortReqd) || (false == noSortReqd) ||
        (typeof noSortReqd === 'undefined')) {
        queryJSON['sort_fields'] = [];
        queryJSON['sort'] = global.QUERY_STRING_SORT_DESC;
    }
    if ((limit != null) && (typeof limit != undefined) && (-1 != limit)) {
        queryJSON['limit'] = limit;
    }
    queryJSON['where'] = whereClause;

    return commonUtils.cloneObj(queryJSON);
}


function executeQueryString (queryJSON, callback)
{
    var startTime = (new Date()).getTime(), endTime;
    opApiServer.authorize(function () {
        opApiServer.api.post(global.RUN_QUERY_URL, queryJSON, function (error, jsonData) {
            endTime = (new Date()).getTime();
            logutils.logger.debug("Query executed in " + ((endTime - startTime) / 1000) +
            'secs ' + JSON.stringify(queryJSON));
            callback(error, jsonData);
        });
    });
}

function parsePRoutersFabricData(data) {
    var len = 0;
    var statsData, aggregate = {};
    var resultJSON = [];
    var PRouterFieldFPrefix = "enterprise.juniperNetworks.fabricMessageExt.edges.";
    var keys = [
        PRouterFieldFPrefix + "class_stats.transmit_counts.packets",
        PRouterFieldFPrefix + "class_stats.transmit_counts.bytes"
    ];

    if ((data != null) && (data['value']) && (data['value'].length)) {
        statsData = data.value;
        len = statsData.length;
        aggregate = {
            "src_aggregate" : {},
            "dst_aggregate" : {}
        };
        for(var i=0; i<len; i++) {
            resultJSON[i] = commonUtils.cloneObj(statsData[i]);
            for (var k=0; k<keys.length; k++) {
                if( statsData[i].hasOwnProperty("MAX(" + keys[k] + ")") &&
                    statsData[i].hasOwnProperty("MIN(" + keys[k] + ")")) {

                    resultJSON[i]["DIF(" + keys[k] + ")"] = statsData[i]["MAX(" + keys[k] + ")"] - statsData[i]["MIN(" + keys[k] + ")"];

                    if(statsData[i][PRouterFieldFPrefix + "src_type"] == "Linecard" &&
                        statsData[i][PRouterFieldFPrefix + "dst_type"] == "Linecard") {
                        var src_slot = statsData[i][PRouterFieldFPrefix + "src_slot"];
                        var src_pfe = statsData[i][PRouterFieldFPrefix + "src_pfe"];
                        var dst_slot = statsData[i][PRouterFieldFPrefix + "dst_slot"];
                        var dst_pfe = statsData[i][PRouterFieldFPrefix + "dst_pfe"];

                        /**
                         * SRC_SLOT, SRC_PFE based aggregation
                         * sum total of per key based values from src_slot, src_pfe to all other slot, pfe combinations
                         * aggregate.src_aggregate stores the sum of values of each key from keys.
                         */
                        if(src_slot != "undefined" && src_pfe != "undefined") {
                            if(src_slot in aggregate.src_aggregate) {
                                if(src_pfe in aggregate.src_aggregate[src_slot]) { //Check for PFE entry
                                    if("SUM(" + keys[k] + ")" in aggregate.src_aggregate[src_slot][src_pfe]) { //Check for key
                                        aggregate.src_aggregate[src_slot][src_pfe]["SUM(" + keys[k] + ")"] += resultJSON[i]["DIF(" + keys[k] + ")"];
                                    } else {
                                        aggregate.src_aggregate[src_slot][src_pfe]["SUM(" + keys[k] + ")"] = resultJSON[i]["DIF(" + keys[k] + ")"];
                                    }
                                } else { //create PFE Obj and add key
                                    aggregate.src_aggregate[src_slot][src_pfe]= {};
                                    aggregate.src_aggregate[src_slot][src_pfe]["SUM(" + keys[k] + ")"] = resultJSON[i]["DIF(" + keys[k] + ")"];
                                }
                            } else {
                                aggregate.src_aggregate[src_slot] = {};
                                aggregate.src_aggregate[src_slot][src_pfe]= {};
                                aggregate.src_aggregate[src_slot][src_pfe]["SUM(" + keys[k] + ")"] = resultJSON[i]["DIF(" + keys[k] + ")"];
                            }
                        }
                        /**
                         * DST_SLOT, DST_PFE based aggregation
                         * sum total of per key based values from dst_slot, dst_pfe to all other slot, pfe combinations
                         * aggregate.dst_aggregate stores the sum of values of each key from keys.
                         */
                        if(dst_slot != "undefined" && dst_pfe!= "undefined") {
                            if(dst_slot in aggregate.dst_aggregate) {
                                if(dst_pfe in aggregate.dst_aggregate[dst_slot]) {
                                    if("SUM(" + keys[k] + ")" in aggregate.dst_aggregate[dst_slot][dst_pfe]) {
                                        aggregate.dst_aggregate[dst_slot][dst_pfe]["SUM(" + keys[k] + ")"] += resultJSON[i]["DIF(" + keys[k] + ")"];
                                    } else {
                                        aggregate.dst_aggregate[dst_slot][dst_pfe]["SUM(" + keys[k] + ")"] = resultJSON[i]["DIF(" + keys[k] + ")"];
                                    }
                                } else {
                                    aggregate.dst_aggregate[dst_slot][dst_pfe] = {};
                                    aggregate.dst_aggregate[dst_slot][dst_pfe]["SUM(" + keys[k] + ")"] = resultJSON[i]["DIF(" + keys[k] + ")"];
                                }
                            } else {
                                aggregate.dst_aggregate[dst_slot] = {};
                                aggregate.dst_aggregate[dst_slot][dst_pfe] = {};
                                aggregate.dst_aggregate[dst_slot][dst_pfe]["SUM(" + keys[k] + ")"] = resultJSON[i]["DIF(" + keys[k] + ")"];
                            }
                        }
                    }
                }
            }
        }
        return {"values" : resultJSON, "aggregate": aggregate};
    }
}

function sendQueryRequestAndGetData(req, res, appData) {
    var PRouterFieldFPrefix = 'enterprise.juniperNetworks.fabricMessageExt.edges.';
    var whereClauseArray = [];
    var selectArr = [
            "MAX("+ PRouterFieldFPrefix + "class_stats.transmit_counts.packets)",
            "MIN("+ PRouterFieldFPrefix + "class_stats.transmit_counts.packets)",
            "MAX("+ PRouterFieldFPrefix + "class_stats.transmit_counts.bytes)",
            "MIN("+ PRouterFieldFPrefix + "class_stats.transmit_counts.bytes)",
            PRouterFieldFPrefix + "src_slot",
            PRouterFieldFPrefix + "src_type",
            PRouterFieldFPrefix + "src_pfe",
            PRouterFieldFPrefix + "dst_slot",
            PRouterFieldFPrefix + "dst_type",
            PRouterFieldFPrefix + "dst_pfe",
            PRouterFieldFPrefix + "class_stats.priority",
            "Source"
        ],
        tableName = "StatTable.TelemetryStream.enterprise.juniperNetworks.fabricMessageExt.edges.class_stats.transmit_counts";

    if(appData.queryFields.source) {
        for (var key in appData.queryFields) {
            if((typeof appData.queryFields[key] == "string" && null != appData.queryFields[key]) ||
                (typeof appData.queryFields[key] == "number" && !isNaN(appData.queryFields[key]))){
                if(key == "source") {
                    whereClauseArray.push(createWhereClause("Source", appData.queryFields[key], 1))
                } else {
                    whereClauseArray.push(createWhereClause(PRouterFieldFPrefix + key, appData.queryFields[key], 1))
                }
            }
        }
        var timeObj = createTimeQueryJsonObj(10, 'now');
        var whereClause = [whereClauseArray];
        var queryJSON = formatQueryStringWithWhereClause(tableName, whereClause, selectArr, timeObj);

        /*
        var dataObjArr = [];
        commonUtils.createReqObj(dataObjArr, global.RUN_QUERY_URL, global.HTTP_REQUEST_POST, commonUtils.cloneObj(queryJSON));

        commonUtils.getServerResponseByRestApi(opServer, false, dataObjArr[0],
            commonUtils.doEnsureExecution(function (err, resultJSON) {
                logutils.logger.debug("PRouter Stats Query completed at:" + new Date());
                if (null != err) {
                    commonUtils.handleJSONResponse(err, res, null);
                }else{
                    resultJSON = parsePRoutersFabricData(resultJSON);
                    commonUtils.handleJSONResponse(null, res, resultJSON);
                    return;
                }
            }, global.DEFAULT_MIDDLEWARE_API_TIMEOUT));
        */

        executeQueryString(queryJSON, commonUtils.doEnsureExecution(function (err, resultJSON) {
            logutils.logger.debug("PRouter Stats Query completed at:" + new Date());
            if (null != err) {
                commonUtils.handleJSONResponse(err, res, null);
            }else{
                resultJSON = parsePRoutersFabricData(resultJSON);
                commonUtils.handleJSONResponse(null, res, resultJSON);
                return;
            }
        }, global.DEFAULT_MIDDLEWARE_API_TIMEOUT));

    } else {
        //Source is must.
        logutils.logger.debug("Source is must for PRouter fabric stats query");
        var error = {
            responseCode: global.HTTP_STATUS_BAD_REQUEST,
            message: "require source field set in query",
            stack: {}
        };
        commonUtils.handleJSONResponse(error, res, null);
    }
}

function getPRouterFabricStats(req, res) {

    var source          = req.query['source'];
    var srcType         = req.query['src_type']
    var dstType         = req.query['dst_type'];
    var srcSlot         = parseInt(req.query['src_slot']);
    var dstSlot         = parseInt(req.query['dst_slot']);
    var srcPfe          = parseInt(req.query['src_pfe']);
    var dstPfe          = parseInt(req.query['dst_pfe']);
    var appData = {
        queryFields: {
            source: source,
            src_type: srcType,
            dst_type: dstType,
            src_slot: srcSlot,
            dst_slot: dstSlot,
            src_pfe: srcPfe,
            dst_pfe: dstPfe
        }
    };
    sendQueryRequestAndGetData(req, res, appData);
}

exports.getPRouterChassisInfo = getPRouterChassisInfo;
exports.getPRouterFabricStats = getPRouterFabricStats;