/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api'),
    opServer = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/opServer.api'),
    logutils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/log.utils'),
    commonUtils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/common.utils'),
    config = process.mainModule.exports["config"],
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

//Needs to be moved to web-core globals
var PRouterFieldPrefix = "enterprise.juniperNetworks.fabricMessageExt.edges.";
var PRouterStatsTableName = "StatTable.TelemetryStream." + PRouterFieldPrefix + "class_stats.transmit_counts";

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
function parsePRouterFabricStats(data,appData) {
    var len = 0;
    var statsData;
    var resultJSON = {};
    var keys = [
        PRouterFieldPrefix + "class_stats.transmit_counts.packets",
        PRouterFieldPrefix + "class_stats.transmit_counts.bytes"
    ];
    if ((data != null) && (data['value']) && (data['value'].length)) {
        statsData = data.value;
        len = statsData.length;
    }
    for(var i = 0; i < len; i++) {
        var statObj = statsData[i];
        for(var j = 0; j < keys.length; j++) {
            statObj["DIF(" + keys[j] + ")"] = commonUtils.ifNull(statObj["MAX(" + keys[j] + ")"],0) - commonUtils.ifNull(statObj["MIN(" + keys[j] + ")"],0);
            var src_slot, src_pfe, dst_slot, dst_pfe;
            if(appData['queryFields'] != null && appData['queryFields']['viewType'] == 'chasis') {
                if(statObj[PRouterFieldPrefix + "src_type"] == 'Linecard' && statObj[PRouterFieldPrefix + "dst_type"] == 'Linecard') {
                    src_slot = statObj[PRouterFieldPrefix + "src_slot"];
                    dst_slot = statObj[PRouterFieldPrefix + "dst_slot"];
                    if(resultJSON[src_slot] != null){
                        if(resultJSON[src_slot][dst_slot] != null) {
                            if(resultJSON[src_slot][dst_slot]['SUM('+keys[j]+')'] != null) {
                                resultJSON[src_slot][dst_slot]['SUM('+keys[j]+')'] += statObj["DIF(" + keys[j] + ")"];
                            } else {
                                resultJSON[src_slot][dst_slot]['SUM('+keys[j]+')'] = statObj["DIF(" + keys[j] + ")"];
                            } 
                        } else {
                            resultJSON[src_slot][dst_slot] = {};
                            resultJSON[src_slot][dst_slot]['SUM('+keys[j]+')'] = statObj["DIF(" + keys[j] + ")"];
                        }
                    } else {
                        resultJSON[src_slot] = {};
                        resultJSON[src_slot][dst_slot] = {};
                        resultJSON[src_slot][dst_slot]['SUM('+keys[j]+')'] = statObj["DIF(" + keys[j] + ")"];
                    }
                }
            } else if(appData['queryFields'] != null && (appData['queryFields']['viewType'] == 'pfe' || appData['queryFields']['viewType'] == 'lineCard')) {
                if(statObj[PRouterFieldPrefix + "src_type"] == 'Linecard' && statObj[PRouterFieldPrefix + "dst_type"] == 'Linecard') {
                    src_slot = statObj[PRouterFieldPrefix + "src_slot"];
                    dst_slot = statObj[PRouterFieldPrefix + "dst_slot"];
                    src_pfe = statObj[PRouterFieldPrefix + "src_pfe"];
                    dst_pfe = statObj[PRouterFieldPrefix + "dst_pfe"];
                    if(resultJSON[src_slot] != null) {
                        if(resultJSON[src_slot][src_pfe] != null) {
                            if(resultJSON[src_slot][src_pfe][dst_slot] != null) {
                                if(resultJSON[src_slot][src_pfe][dst_slot][dst_pfe] != null) {
                                    resultJSON[src_slot][src_pfe][dst_slot][dst_pfe]['SUM('+keys[j]+')'] += statObj["DIF("+ keys[j] + ")"];
                                } else {
                                    resultJSON[src_slot][src_pfe][dst_slot][dst_pfe] = {};
                                    resultJSON[src_slot][src_pfe][dst_slot][dst_pfe]['SUM('+keys[j]+')'] = statObj["DIF("+ keys[j] + ")"]; 
                                }
                            } else {
                                resultJSON[src_slot][src_pfe][dst_slot] = {};
                                resultJSON[src_slot][src_pfe][dst_slot][dst_pfe] = {};
                                resultJSON[src_slot][src_pfe][dst_slot][dst_pfe]['SUM('+keys[j]+')'] = statObj["DIF("+ keys[j] + ")"];
                            }
                        } else {
                            resultJSON[src_slot][src_pfe] = {};
                            resultJSON[src_slot][src_pfe][dst_slot] = {};
                            resultJSON[src_slot][src_pfe][dst_slot][dst_pfe] = {};
                            resultJSON[src_slot][src_pfe][dst_slot][dst_pfe]['SUM('+keys[j]+')'] = statObj["DIF("+ keys[j] + ")"];
                        }
                    } else {
                        resultJSON[src_slot] = {};
                        resultJSON[src_slot][src_pfe] = {};
                        resultJSON[src_slot][src_pfe][dst_slot] = {};
                        resultJSON[src_slot][src_pfe][dst_slot][dst_pfe] = {};
                        resultJSON[src_slot][src_pfe][dst_slot][dst_pfe]['SUM('+keys[j]+')'] = statObj["DIF("+ keys[j] + ")"];
                    }
                }
            }
        }
    }
    return {"values" : resultJSON};
}
function parsePRouterFabricStatsData(data) {
    var len = 0;
    var statsData, aggregate = {};
    var resultJSON = [];
    var keys = [
        PRouterFieldPrefix + "class_stats.transmit_counts.packets",
        PRouterFieldPrefix + "class_stats.transmit_counts.bytes"
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

                    if((statsData[i][PRouterFieldPrefix + "src_type"] == "Linecard") || (statsData[i][PRouterFieldPrefix + "src_type"] == "Switch_Fabric") &&
                        (statsData[i][PRouterFieldPrefix + "dst_type"] == "Linecard") || (statsData[i][PRouterFieldPrefix + "dst_type"] == "Switch_Fabric")) {
                        var src_slot, src_pfe, dst_slot, dst_pfe;
                        /**
                         * if src_type or dst_type is Switch Fabric, slot and pfe attributes will be null.
                         * for now setting slot as "switch_fabric" and pfe as 0
                         */
                        if (statsData[i][PRouterFieldPrefix + "src_type"] == "Switch_Fabric") {
                            src_slot = "switch_fabric";
                            src_pfe = 0;
                        } else {
                            src_slot = statsData[i][PRouterFieldPrefix + "src_slot"];
                            src_pfe = statsData[i][PRouterFieldPrefix + "src_pfe"];
                        }
                        if (statsData[i][PRouterFieldPrefix + "dst_type"] == "Switch_Fabric") {
                            dst_slot = "switch_fabric";
                            dst_pfe = 0;
                        } else {
                            dst_slot = statsData[i][PRouterFieldPrefix + "dst_slot"];
                            dst_pfe = statsData[i][PRouterFieldPrefix + "dst_pfe"];
                        }
                        /**
                         * SRC_SLOT, SRC_PFE based aggregation
                         * sum total of per key based values from src_slot, src_pfe to all other slot, pfe combinations
                         * aggregate.src_aggregate stores the sum of values of each key from keys.
                         */
                        if(src_slot != null && src_pfe != null) {
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
                        if(dst_slot != null && dst_pfe!= null) {
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
    //var PRouterFieldPrefix = 'enterprise.juniperNetworks.fabricMessageExt.edges.';
    var whereClauseArray = [], intFields = [PRouterFieldPrefix+'src_slot',PRouterFieldPrefix+'dst_slot',
                                               PRouterFieldPrefix+'dst_pfe',PRouterFieldPrefix+'src_pfe'];
    var selectArr = [
            "MAX("+ PRouterFieldPrefix + "class_stats.transmit_counts.packets)",
            "MIN("+ PRouterFieldPrefix + "class_stats.transmit_counts.packets)",
            "MAX("+ PRouterFieldPrefix + "class_stats.transmit_counts.bytes)",
            "MIN("+ PRouterFieldPrefix + "class_stats.transmit_counts.bytes)",
            PRouterFieldPrefix + "src_slot",
            PRouterFieldPrefix + "src_type",
            PRouterFieldPrefix + "src_pfe",
            PRouterFieldPrefix + "dst_slot",
            PRouterFieldPrefix + "dst_type",
            PRouterFieldPrefix + "dst_pfe",
            PRouterFieldPrefix + "class_stats.priority",
            "Source"
        ],
        tableName = PRouterStatsTableName;

    if(appData.queryFields.source) {
        var whereClause = [];
        if(appData.queryFields.where) {
            whereClause = appData.queryFields.where;
            var whereClauseLen = whereClause.length;
            //Conversion of slot and pfe to integers
            for(var i = 0; i < whereClauseLen; i++) {
                if(whereClause[i] instanceof Array){
                    var nestWhereClauseObj = whereClause[i];
                    var nestWhereClauseObjLen = nestWhereClauseObj.length;
                    for (var j = 0; j < nestWhereClauseObjLen; j++){
                        nestWhereClauseObj[j]['op'] = parseInt(nestWhereClauseObj[j]['op']);
                        if(intFields.indexOf(nestWhereClauseObj[j]['name']) > -1) {
                            nestWhereClauseObj[j]['value'] = parseInt(nestWhereClauseObj[j]['value']);
                        }
                    }
                } else {
                    if(intFields.indexOf(whereClause[i]['name']) > -1) {
                        whereClause[i]['value'] = parseInt(whereClause[i]['value']);
                        whereClause[i]['op'] = parseInt(whereClause[i]['op']);
                    }
                }
            }
        } else {
            for (var key in appData.queryFields) {
                if((typeof appData.queryFields[key] == "string" && null != appData.queryFields[key]) ||
                    (typeof appData.queryFields[key] == "number" && !isNaN(appData.queryFields[key]))){
                    if(key != 'viewType') {
                        if(key == "source") {
                            whereClauseArray.push(createWhereClause("Source", appData.queryFields[key], 1))
                        } else if(key == "priority") {
                            whereClauseArray.push(createWhereClause(PRouterFieldPrefix + "class_stats." + key, appData.queryFields[key], 1))
                        } else {
                            whereClauseArray.push(createWhereClause(PRouterFieldPrefix + key, appData.queryFields[key], 1))
                        }
                    }
                }
            }
            whereClause = [whereClauseArray];
        }
        var timeObj = createTimeQueryJsonObj(10, 'now');
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
                resultJSON = parsePRouterFabricStats(resultJSON,appData);
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
    var priority        = req.query['priority'];
    var viewType        = req.query['viewType'];
    var where           = req.query.whereClause;

    if(srcType == "Switch_Fabric" || dstType == "Switch_Fabric") {
        priority = null; // priority cannot be combined with above device types.
    }
    var appData = {
        queryFields: {
            source: source,
            src_type: srcType,
            dst_type: dstType,
            src_slot: srcSlot,
            dst_slot: dstSlot,
            src_pfe: srcPfe,
            dst_pfe: dstPfe,
            priority: priority,
            viewType: viewType,
            where:  where
        }
    };
    sendQueryRequestAndGetData(req, res, appData);
}

/**
 * This function takes the fabric stats TS query and create a hash with T(timestamp) as the key.
 * each of the items then gets passed to parsePRouterFabricStatsData to calculate the aggregate based on source and destination
 * response JSON data gets formatted with aggregates for individual PFEs and corresponding timestamp.
 * @param data
 */
function parsePRouterFabricTSData(data) {
    var TSData = {},
        TSList = [],
        resultJSON = [];

    if ((data != null) && (data['value']) && (data['value'].length)) {
        var statsData = data.value;
        var len = statsData.length;

        for(var i=0; i<len; i++) {
            var ts = statsData[i]["T="];
            if(!(ts in TSData)) {
                TSData[ts] = [];
                TSList.push(ts);
            }
            TSData[ts].push(statsData[i]);
        }
        for(var i=0; i<TSList.length; i ++) {
            var ts = TSList[i];
            var stats = parsePRouterFabricStatsData({value:TSData[ts]});
            resultJSON.push({
                ts: ts,
                values: stats.aggregate
            });
        }
    }
    return resultJSON;
}

function sendQueryRequestAndGetTSData(req, res, appData) {
    var whereClauseArray = [];
    var selectArr = [
            "MAX("+ PRouterFieldPrefix + "class_stats.transmit_counts.packets)",
            "MIN("+ PRouterFieldPrefix + "class_stats.transmit_counts.packets)",
            "MAX("+ PRouterFieldPrefix + "class_stats.transmit_counts.bytes)",
            "MIN("+ PRouterFieldPrefix + "class_stats.transmit_counts.bytes)",
            PRouterFieldPrefix + "src_slot",
            PRouterFieldPrefix + "src_type",
            PRouterFieldPrefix + "src_pfe",
            PRouterFieldPrefix + "dst_slot",
            PRouterFieldPrefix + "dst_type",
            PRouterFieldPrefix + "dst_pfe",
            PRouterFieldPrefix + "class_stats.priority",
            "Source",
            "T=" + appData.queryFields.t
        ],
        tableName = PRouterStatsTableName;

    if(appData.queryFields.whereClause.source) {
        for (var key in appData.queryFields.whereClause) {
            if((typeof appData.queryFields.whereClause[key] == "string" && null != appData.queryFields.whereClause[key]) ||
                (typeof appData.queryFields.whereClause[key] == "number" && !isNaN(appData.queryFields.whereClause[key]))){
                if(key == "source") {
                    whereClauseArray.push(createWhereClause("Source", appData.queryFields.whereClause[key], 1))
                } else if(key == "priority") {
                    whereClauseArray.push(createWhereClause(PRouterFieldPrefix + "class_stats." + key, appData.queryFields.whereClause[key], 1))
                } else {
                    whereClauseArray.push(createWhereClause(PRouterFieldPrefix + key, appData.queryFields.whereClause[key], 1))
                }
            }
        }
        var timeObj = createTimeQueryJsonObj(appData.queryFields.mins_since, appData.queryFields.end_time);
        var whereClause = [whereClauseArray];
        var queryJSON = formatQueryStringWithWhereClause(tableName, whereClause, selectArr, timeObj);

        executeQueryString(queryJSON, commonUtils.doEnsureExecution(function (err, resultJSON) {
            logutils.logger.debug("PRouter Stats Query completed at:" + new Date());
            if (null != err) {
                commonUtils.handleJSONResponse(err, res, null);
            }else{
                resultJSON = parsePRouterFabricTSData(resultJSON);
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

function getPRouterFabricTSStats(req, res) {

    var source          = req.query['source'];
    var srcType         = req.query['src_type']
    var dstType         = req.query['dst_type'];
    var srcSlot         = parseInt(req.query['src_slot']);
    var dstSlot         = parseInt(req.query['dst_slot']);
    var srcPfe          = parseInt(req.query['src_pfe']);
    var dstPfe          = parseInt(req.query['dst_pfe']);
    var priority        = req.query['priority'];
    var minsSince       = req.query['mins_since'];
    var endTime         = req.query['end_time'];
    var t               = req.query['T'];

    if(null == minsSince || minsSince == 'undefined') {
        minsSince = 10; //Default 10m
    }
    if(null ==t || t== 'undefined') {
        t = 60;  //Default aggregation 60s
    }
    if(srcType == "Switch_Fabric" || dstType == "Switch_Fabric") {
        priority = null; // priority cannot be combined with above device types.
    }

    var appData = {
        queryFields: {
            whereClause: {
                source: source,
                src_type: srcType,
                dst_type: dstType,
                src_slot: srcSlot,
                dst_slot: dstSlot,
                src_pfe: srcPfe,
                dst_pfe: dstPfe,
                priority: priority
            },
            mins_since: minsSince,
            end_time: endTime,
            t: t
        }
    };
    sendQueryRequestAndGetTSData(req, res, appData);
}

exports.getPRouterChassisInfo = getPRouterChassisInfo;
exports.getPRouterFabricStats = getPRouterFabricStats;
exports.getPRouterFabricTSStats = getPRouterFabricTSStats;
