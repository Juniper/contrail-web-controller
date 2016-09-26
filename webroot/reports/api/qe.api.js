/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * API for communication with Query Engine.
 */

var assert = require("assert"),
    util = require("util"),
    _ = require("lodash"),
    redisReadStream = require("redis-rstream"),
    config = process.mainModule.exports.config,
    logutils = require(process.mainModule.exports.corePath + "/src/serverroot/utils/log.utils"),
    commonUtils = require(process.mainModule.exports.corePath + "/src/serverroot/utils/common.utils"),
    messages = require(process.mainModule.exports.corePath + "/src/serverroot/common/messages"),
    global = require(process.mainModule.exports.corePath + "/src/serverroot/common/global"),
    redisUtils = require(process.mainModule.exports.corePath + "/src/serverroot/utils/redis.utils"),
    opApiServer = require(process.mainModule.exports.corePath + "/src/serverroot/common/opServer.api");



var redisServerPort = (config.redis_server_port) ? config.redis_server_port : global.DFLT_REDIS_SERVER_PORT,
    redisServerIP = (config.redis_server_ip) ? config.redis_server_ip : global.DFLT_REDIS_SERVER_IP,
    redisClient = redisUtils.createRedisClient(redisServerPort, redisServerIP, global.QE_DFLT_REDIS_DB);

if (!module.parent) {
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call, module.filename));
    process.exit(1);
}

function executeQuery(res, options, appData) {
    var queryJSON = options.queryJSON,
        async = options.async, asyncHeader = {"Expect": "202-accepted"};
    logutils.logger.debug("Query sent to Opserver at " + new Date() + " " + JSON.stringify(queryJSON));
    options.startTime = new Date().getTime();
    opApiServer.apiPost(global.RUN_QUERY_URL, queryJSON, appData,
        function (error, jsonData) {
            if (error) {
                logutils.logger.error("Error Run Query: " + error.stack);
                commonUtils.handleJSONResponse(error, res, null);
            } else if (async) {
                initPollingConfig(options, queryJSON.start_time, queryJSON.end_time);
                options.url = jsonData.href;
                options.opsQueryId = parseOpsQueryIdFromUrl(jsonData.href);
                setTimeout(fetchQueryResults, 1000, res, jsonData, options, appData);
                options.intervalId = setInterval(fetchQueryResults, options.pollingInterval, res, jsonData, options, appData);
                options.timeoutId = setTimeout(stopFetchQueryResult, options.pollingTimeout, options);
            } else {
                processQueryResults(res, jsonData, options);
            }
        }, async ? asyncHeader : {});
}

function initPollingConfig(options, fromTime, toTime) {
    var timeRange = null, str = "now-";

    if (isNaN(fromTime) === true) {
        /* Check if we have keyword now in that */
        var pos = fromTime.indexOf(str);
        if (pos !== -1) {
            var mins = fromTime.slice(pos + str.length);
            mins = mins.substr(0, mins.length - 1);
            mins = parseInt(mins);
        } else {
            assert(0);
        }
        timeRange = mins;
    } else {
        timeRange = (toTime - fromTime) / 60000000;
    }
    if (timeRange <= 720) {
        options.pollingInterval = 5000;
        options.maxCounter = 2;
        options.pollingTimeout = 3600000;
    } else if (timeRange > 720 && timeRange <= 1440) {
        options.pollingInterval = 30000;
        options.maxCounter = 1;
        options.pollingTimeout = 5400000;
    } else {
        options.pollingInterval = 60000;
        options.maxCounter = 1;
        options.pollingTimeout = 7200000;
    }
}

function parseOpsQueryIdFromUrl(url) {
    var opsQueryId = "", urlArray;

    if (!_.isNil(url)) {
        urlArray = url.split("/");
        opsQueryId = urlArray[urlArray.length - 1];
    }

    return opsQueryId;
}

function fetchQueryResults(res, jsonData, options, appData) {
    var progress;

    opApiServer.apiGet(jsonData.href, appData, function(error, queryResults) {
        progress = queryResults.progress;
        options.counter += 1;
        if (error) {
            logutils.logger.error(error.stack);
            clearInterval(options.intervalId);
            clearTimeout(options.timeoutId);
            options.progress = progress;

            if (options.status === "run") {
                commonUtils.handleJSONResponse(error, res, null);
            } else if (options.status === "queued") {
                options.status = "error";
                options.errorMessage = error;
                updateQueryStatus(options);
            }
        } else if (progress === 100) {
            clearInterval(options.intervalId);
            clearTimeout(options.timeoutId);
            options.progress = progress;
            options.count = queryResults.chunks[0].count;
            jsonData.href = queryResults.chunks[0].href;
            fetchQueryResults(res, jsonData, options, appData);
        } else if (_.isNil(progress)) {
            processQueryResults(res, queryResults, options);

            if (options.status === "queued") {
                options.endTime = new Date().getTime();
                options.status = "completed";
                updateQueryStatus(options);
            }
        } else if (options.counter === options.maxCounter) {
            options.progress = progress;
            options.status = "queued";
            updateQueryStatus(options);
            commonUtils.handleJSONResponse(null, res, { status: "queued", value: [] });
        }
    });
}

function stopFetchQueryResult(options) {
    clearInterval(options.intervalId);
    options.status = "timeout";
    updateQueryStatus(options);
}

function updateQueryStatus(options) {
    var queryStatus = {
        startTime: options.startTime,
        queryId: options.queryId,
        url: options.url,
        queryJSON: options.queryJSON,
        progress: options.progress,
        status: options.status,
        tableName: options.queryJSON.table,
        count: options.count,
        timeTaken: -1,
        errorMessage: options.errorMessage,
        reRunTimeRange: options.reRunTimeRange,
        reRunQueryString: getReRunQueryString(options.reRunQuery, options.reRunTimeRange),
        opsQueryId: options.opsQueryId,
        engQueryStr: options.engQueryStr
    };

    if (queryStatus.tableName === "FlowSeriesTable"
        || queryStatus.tableName.indexOf("StatTable.") !== -1) {
        queryStatus.tg = options.tg;
        queryStatus.tgUnit = options.tgUnit;
    }

    if (options.progress === 100) {
        queryStatus.timeTaken = (options.endTime - queryStatus.startTime) / 1000;
    }

    redisClient.hmset(options.queryQueue, options.queryId, JSON.stringify(queryStatus));
}

function getReRunQueryString(reRunQuery, reRunTimeRange) {
    delete reRunQuery.queryId;
    delete reRunQuery.skip;
    delete reRunQuery.take;
    delete reRunQuery.page;
    delete reRunQuery.pageSize;

    if (!_.isNil(reRunTimeRange) && reRunTimeRange !== "0") {
        delete reRunQuery.fromTime;
        delete reRunQuery.fromTimeUTC;
        delete reRunQuery.toTime;
        delete reRunQuery.toTimeUTC;
        delete reRunQuery.reRunTimeRange;
    }

    return reRunQuery;
}

function processQueryResults(res, queryResults, options) {
    var startDate = new Date(),
        startTime = startDate.getTime(),
        queryId = options.queryId,
        pageSize = options.pageSize,
        queryJSON = options.queryJSON,
        endDate = new Date(),
        table = queryJSON.table,
        endTime = endDate.getTime(),
        total, responseJSON, resultJSON;

    resultJSON = (queryResults && !isEmptyObject(queryResults)) ? queryResults.value : [];
    logutils.logger.debug("Query results ("
        + resultJSON.length
        + " records) received from opserver at "
        + endDate + " in " + ((endTime - startTime) / 1000) + "secs. "
        + JSON.stringify(queryJSON));

    resultJSON = formatQueryResultJSON(queryJSON.table, resultJSON);
    logutils.logger.debug("Formatting of query-results on webserver completed in "
        + (((new Date()).getTime() - endTime) / 1000) + "secs. "
        + JSON.stringify(queryJSON));

    total = resultJSON.length;

    if (options.status === "run") {
        if (_.isNil(queryId) || total <= pageSize) {
            responseJSON = resultJSON;
        } else {
            responseJSON = resultJSON.slice(0, pageSize);
        }
        commonUtils.handleJSONResponse(null, res, { data: responseJSON, total: total, queryJSON: queryJSON });
    }
    if (!_.isNil(options.saveQuery) && (!options.saveQuery || options.saveQuery === "false")) {
        return;
    }
    saveQueryResult2Redis(resultJSON, total, queryId, pageSize, getSortStatus4Query(queryJSON), queryJSON);
    if (table === "FlowSeriesTable") {
        saveData4Chart2Redis(queryId, resultJSON, getPlotFields(queryJSON.select_fields));
    } else if (table.indexOf("StatTable.") !== -1) {
        saveStatsData4Chart2Redis(queryId, resultJSON, options);
    }
}

function saveQueryResult2Redis(resultData, total, queryId, pageSize, sort, queryJSON) {
    var endRow;

    if (!_.isNil(sort)) {
        redisClient.set(queryId + ":sortStatus", JSON.stringify(sort));
    }
    // TODO: Should we need to save every page?
    redisClient.set(queryId, JSON.stringify({ data: resultData, total: total, queryJSON: queryJSON }));
    if (total === 0) {
        redisClient.set(queryId + ":page1", JSON.stringify({ data: [], total: 0, queryJSON: queryJSON }));
    } else {
        for (var j = 0, k = 1; j < total; k++) {
            endRow = k * pageSize;
            if (endRow > resultData.length) {
                endRow = resultData.length;
            }
            var spliceData = resultData.slice(j, endRow);
            redisClient.set(queryId + ":page" + k, JSON.stringify({ data: spliceData, total: total, queryJSON: queryJSON }));
            j = endRow;
        }
    }
}

function getSortStatus4Query(queryJSON) {
    var sortFields = queryJSON.sort_fields,
        sortDirection = queryJSON.sort,
        sortStatus;

    if (!_.isNil(sortFields) && sortFields.length > 0 && !_.isNil(sortDirection)) {
        sortStatus = [{"field": sortFields[0], "dir": sortDirection === 2 ? "desc" : "asc"}];
    }
    return sortStatus;
}


function getPlotFields(selectFields) {
    var plotFields = [],
        statFields = [
            { field: "sum(bytes)", label: "sum_bytes" },
            { field: "avg(bytes)", label: "avg_bytes" },
            { field: "sum(packets)", label: "sum_packets" },
            { field: "avg(packets)", label: "avg_packets" }
        ];

    for (var j = 0; j < statFields.length; j++) {
        if (selectFields.indexOf(statFields[j].field) !== -1) {
            plotFields.push(statFields[j].label);
        }
    }
    return plotFields;
}

function saveStatsData4Chart2Redis(queryId, dataJSON, queryOptions) {
    var resultData = {},
        secTime,
        uniqueFlowClassArray = [],
        flowClassArray = [],
        statPlotFields = queryOptions.statPlotFields,
        statGroupFields = queryOptions.statGroupFields;

    if (!_.isNil(statPlotFields) && statPlotFields.length !== 0) {
        for (var i = 0; i < dataJSON.length; i++) {
            var rawTime = dataJSON[i].T || dataJSON[i]["T="];
            if (!_.isUndefined(rawTime)) {
                secTime = Math.floor(rawTime / 1000);
            }

            var resultStatGroupFields = [], resultStatGroupFieldsKey;
            for (var x = 0; x < statPlotFields.length; x++) {
                if (statGroupFields[x] in dataJSON[i]) {
                    resultStatGroupFields.push(dataJSON[i][statGroupFields[x]]);
                }
            }

            //CLASS(T=) is used as the stat_class_id and is used to store data in redis.
            resultStatGroupFieldsKey = dataJSON[i]["CLASS(T=)"];
            if (uniqueFlowClassArray.indexOf(resultStatGroupFieldsKey) === -1) {
                uniqueFlowClassArray.push(resultStatGroupFieldsKey);
                var statFlowClassRecord = getStatClassRecord(resultStatGroupFieldsKey, resultStatGroupFields, dataJSON[i]);
                flowClassArray.push(statFlowClassRecord);
            }

            if (_.isNil(resultData[resultStatGroupFieldsKey])) {
                resultData[resultStatGroupFieldsKey] = {};
                dataJSON[i].date = new Date(secTime);
                dataJSON[i] = getStatClassRecord(resultStatGroupFieldsKey, resultStatGroupFields, dataJSON[i]);
                resultData[resultStatGroupFieldsKey][secTime] = dataJSON[i];
            } else {
                dataJSON[i].date = new Date(secTime);
                dataJSON[i] = getStatClassRecord(resultStatGroupFieldsKey, resultStatGroupFields, dataJSON[i]);
                resultData[resultStatGroupFieldsKey][secTime] = dataJSON[i];
            }
        }
    }

    redisClient.set(queryId + ":flowclasses", JSON.stringify(flowClassArray));
    redisClient.set(queryId + ":chartdata", JSON.stringify(resultData));
}

function getStatClassRecord(key, resultStatGroupFields, row) {
  // TODO: clean up??? The function name doesn't describe what it does.
    row.stat_flow_class_id = key;
    return row;
}

function saveData4Chart2Redis(queryId, dataJSON, plotFields) {
    var resultData = {},
        result, i, k, flowClassId, flowClassRecord,
        uniqueFlowClassArray = [], secTime, flowClassArray = [];

    if (plotFields.length !== 0) {
        for (i = 0; i < dataJSON.length; i++) {
            flowClassId = dataJSON[i].flow_class_id;
            flowClassRecord = getFlowClassRecord(dataJSON[i]);
            if (uniqueFlowClassArray.indexOf(flowClassId) === -1) {
                uniqueFlowClassArray.push(flowClassId);
                flowClassArray.push(flowClassRecord);
            }
            secTime = Math.floor(dataJSON[i].T / 1000);
            result = {"date": new Date(secTime), "flow_class_id": flowClassId};
            for (k = 0; k < plotFields.length; k++) {
                result[plotFields[k]] = dataJSON[i][plotFields[k]];
            }
            if (_.isNil(resultData[flowClassId])) {
                resultData[flowClassId] = {};
                resultData[flowClassId][secTime] = result;
            } else {
                resultData[flowClassId][secTime] = result;
            }
        }
    }
    redisClient.set(queryId + ":flowclasses", JSON.stringify(flowClassArray));
    redisClient.set(queryId + ":chartdata", JSON.stringify(resultData));
}

function getFlowClassRecord(row) {
    var flowClassFields = global.FLOW_CLASS_FIELDS,
        fieldValue, flowClass = { flow_class_id: row.flow_class_id };

    for (var i = 0; i < flowClassFields.length; i++) {
        fieldValue = row[flowClassFields[i]];
        if (!_.isNil(fieldValue)) {
            flowClass[flowClassFields[i]] = fieldValue;
        }
    }
    return flowClass;
}

function formatQueryResultJSON(tableName, jsonData) {
    var columnLabels, fieldName, label;

    if (tableName === "FlowSeriesTable") {
        columnLabels = global.FORMAT_TABLE_COLUMNS[tableName];
        jsonData.forEach(function(record) {
            for (fieldName in columnLabels) {
                if (columnLabels.hasOwnProperty(fieldName) && !_.isNil(record[fieldName])) {
                    label = columnLabels[fieldName];
                    record[label] = record[fieldName];
                    delete record[fieldName];
                }
            }
        });
    }
    return jsonData;
}

function parseFilterAndLimit(reqObject) {
    var filters, filterWithLimit, filter, limit;

    filters = reqObject.filters;
    if (_.isNil(filters) || filters === "") {
        return reqObject;
    }
    filterWithLimit = filters.split(",");
    filter = filterWithLimit[0];
    limit = filterWithLimit[1];
    if (!_.isNil(filter) && filter.trim() !== "") {
        filter = filter.split(":");
        reqObject.filters = filter[1].trim();
    }
    if (!_.isNil(limit) && limit.trim() !== "") {
        limit = limit.split(":");
        reqObject.limit = limit[1].trim();
    }
    return reqObject;
}

function parseSLQuery(requestQuery) {
    var reqQuery = parseFilterAndLimit(requestQuery),
        msgQuery, fromTimeUTC, toTimeUTC, where, filters,
        table, level, category, moduleId, source, messageType,
        limit, keywords;

    table = reqQuery.table;
    msgQuery = getQueryJSON4Table(table);
    fromTimeUTC = reqQuery.fromTimeUTC;
    toTimeUTC = reqQuery.toTimeUTC;
    limit = parseInt(reqQuery.limit);
    where = reqQuery.where;
    filters = reqQuery.filters;
    level = reqQuery.level;
    category = reqQuery.category;
    setMicroTimeRange(msgQuery, fromTimeUTC, toTimeUTC);
    keywords = reqQuery.keywords;

    if (!_.isNil(where)) {
        if (!_.isNil(keywords) && keywords !== "") {
            parseSLWhere(msgQuery, where, keywords);
        } else {
            parseWhere(msgQuery, where);
        }
    } else {
        moduleId = reqQuery.moduleId;
        source = reqQuery.source;
        messageType = reqQuery.messageType;
        createSLWhere(msgQuery, moduleId, messageType, source, category);
    }

    if (limit > 0) {
        msgQuery.limit = limit;
    }

    if (!_.isNil(level) && level !== "") {
        createSLFilter(msgQuery, level);
    }

    if (!_.isNil(filters) && filters !== "") {
        parseSLFilter(msgQuery, filters);
    }

    return msgQuery;
}

function setMicroTimeRange(query, fromTime, toTime) {
    if (isNaN(fromTime) === true) {
        query.start_time = fromTime;
    } else {
        query.start_time = fromTime * 1000;
    }
    if (isNaN(toTime) === true) {
        query.end_time = toTime;
    } else {
        query.end_time = toTime * 1000;
    }
}

function createSLWhere(msgQuery, moduleId, messageType, source, category) {
    var whereClauseArray = [];

    if (!_.isNil(moduleId) && moduleId !== "") {
        whereClauseArray.push(createClause("ModuleId", moduleId, 1));
    }

    if (!_.isNil(messageType) && messageType !== "") {
        whereClauseArray.push(createClause("Messagetype", messageType, 1));
    }

    if (!_.isNil(source) && source !== "") {
        whereClauseArray.push(createClause("Source", source, 1));
    }

    if (!_.isNil(category) && category !== "") {
        whereClauseArray.push(createClause("Category", category, 1));
    }

    msgQuery.where = [whereClauseArray];
}

function createSLFilter(msgQuery, level) {
    var filterClauseArray = [];

    filterClauseArray.push(createClause("Level", level, 5));

    for (var i = 0; i < msgQuery.filter.length; i++) {
        msgQuery.filter[i] = msgQuery.filter[i].concat(filterClauseArray);
    }
}

function createClause(fieldName, fieldValue, operator) {
    var whereClause = {};

    if (!_.isNil(fieldValue)) {
        whereClause = {};
        whereClause.name = fieldName;
        whereClause.value = fieldValue;
        whereClause.op = operator;
    }

    return whereClause;
}

function parseOTQuery(requestQuery) {
    var reqQuery = parseFilterAndLimit(requestQuery),
        objTraceQuery, fromTimeUTC, toTimeUTC, where,
        filters, objectType, select, objectId, limit;

    select = reqQuery.select;
    objectType = reqQuery.objectType;
    objTraceQuery = createOTQueryJSON(objectType);
    fromTimeUTC = reqQuery.fromTimeUTC;
    toTimeUTC = reqQuery.toTimeUTC;
    objectId = reqQuery.objectId;
    filters = reqQuery.filters;
    where = reqQuery.where;
    limit = parseInt(reqQuery.limit);
    setMicroTimeRange(objTraceQuery, fromTimeUTC, toTimeUTC);
    parseOTWhere(objTraceQuery, where, objectId);

    if (!_.isNil(select) && select.trim() !== "") {
        parseOTSelect(objTraceQuery, select);
    } else {
        objTraceQuery.select_fields = objTraceQuery.select_fields.concat(["ObjectLog", "SystemLog"]);
    }

    if (limit > 0) {
        objTraceQuery.limit = limit;
    }

    if (!_.isNil(filters) && filters !== "") {
        parseFilter(objTraceQuery, filters);
    }

    return objTraceQuery;
}

function createOTQueryJSON(objectType) {
    var queryJSON = getQueryJSON4Table(objectType);

    if (!_.isNil(queryJSON)) {
        return getQueryJSON4Table(objectType);
    } else {
        queryJSON = getQueryJSON4Table("ObjectTableQueryTemplate");
    }

    queryJSON.table = objectType;

    return queryJSON;
}

function parseOTSelect(objTraceQuery, select) {
    var selectArray = select.split(","),
        selectLength = selectArray.length;

    for (var i = 0; i < selectLength; i++) {
        selectArray[i] = selectArray[i].trim();
    }

    objTraceQuery.select_fields = objTraceQuery.select_fields.concat(selectArray);
}

function parseOTWhere(otQuery, where, objectId) {
    parseWhere(otQuery, where);

    var whereClauseArray, whereClauseLength, i;

    if (!_.isNil(otQuery.where)) {
        whereClauseArray = otQuery.where;
        whereClauseLength = whereClauseArray.length;
        for (i = 0; i < whereClauseLength; i += 1) {
            if (!_.isNil(objectId) && objectId !== "") {
                whereClauseArray[i].push(createClause("ObjectId", objectId, 1));
            }
        }
        otQuery.where = whereClauseArray;
    } else if (!_.isNil(objectId) && objectId !== "") {
        whereClauseArray = [
            []
        ];
        whereClauseArray[0].push(createClause("ObjectId", objectId, 1));
        otQuery.where = whereClauseArray;
    }
}

function parseFSQuery(reqQuery) {
    var select, where, filters, fromTimeUTC, toTimeUTC,
        fsQuery, table, tg, tgUnit, direction, autoLimit, autoSort;

    table = reqQuery.table;
    select = reqQuery.select;
    autoLimit = (reqQuery.autoLimit === "true") ? true : false;
    autoSort = (reqQuery.autoSort === "true" && select.indexOf("time-granularity") !== -1) ? true : false;
    fsQuery = getQueryJSON4Table(table, autoSort, autoLimit);
    fromTimeUTC = reqQuery.fromTimeUTC;
    toTimeUTC = reqQuery.toTimeUTC;
    where = reqQuery.where;
    filters = reqQuery.filters;
    tg = reqQuery.tgValue;
    tgUnit = reqQuery.tgUnits;
    direction = parseInt(reqQuery.direction);
    setMicroTimeRange(fsQuery, fromTimeUTC, toTimeUTC);

    if (select !== "") {
        parseSelect(fsQuery, select, tg, tgUnit);
    }

    parseWhere(fsQuery, where);

    if (direction >= 0) {
        fsQuery.dir = direction;
    }

    parseFSFilter(fsQuery, filters);

    return fsQuery;
}

function parseStatsQuery(reqQuery) {
    var select, where, fromTimeUTC, toTimeUTC, statQuery,
        filters, table, tg, tgUnit, filtersArray;

    table = reqQuery.table;
    statQuery = getQueryJSON4Table(table);
    fromTimeUTC = reqQuery.fromTimeUTC;
    toTimeUTC = reqQuery.toTimeUTC;
    select = reqQuery.select;
    where = reqQuery.where;
    filters = reqQuery.filters;
    tg = reqQuery.tgValue;
    tgUnit = reqQuery.tgUnits;
    setMicroTimeRange(statQuery, fromTimeUTC, toTimeUTC);

    if (select !== "") {
        parseSelect(statQuery, select, tg, tgUnit);
    }

    parseStatWhere(statQuery, where);

    if (!_.isNil(filters) && filters !== "") {
        // splitting the filters and using parseFilter for the [name, value, operator] and parseFSFilter for
        // [sortfields, sortby, limit]
        filtersArray = filters.split(",");
        parseFilter(statQuery, filtersArray[0].toString().replace("filter: ", ""));
        filtersArray.shift();
        parseFSFilter(statQuery, filtersArray.toString());
    }

    return statQuery;
}

function parseFRQuery(reqQuery) {
    var select, where, fromTimeUTC, toTimeUTC,
        frQuery, table, direction, filters;

    table = reqQuery.table;
    frQuery = getQueryJSON4Table(table);
    fromTimeUTC = reqQuery.fromTimeUTC;
    toTimeUTC = reqQuery.toTimeUTC;
    select = reqQuery.select;
    where = reqQuery.where;
    filters = reqQuery.filters;
    direction = parseInt(reqQuery.direction);

    if (!_.isNil(reqQuery.limit)) {
        frQuery.limit = reqQuery.limit;
    }

    setMicroTimeRange(frQuery, fromTimeUTC, toTimeUTC);

    if (select !== "") {
        parseSelect(frQuery, select);
    }

    parseWhere(frQuery, where);

    if (direction >= 0) {
        frQuery.dir = direction;
    }

    if (!_.isNil(filters)) {
        parseFSFilter(frQuery, filters);
    }

    return frQuery;
}

function parseSelect(query, select, tg, tgUnit) {
    var selectArray = splitString2Array(select, ","),
        tgIndex = selectArray.indexOf("time-granularity"),
        classTEqualToIndex = selectArray.indexOf("T=");

    if (tgIndex > -1) {
        selectArray[tgIndex] = "T=" + getTGSecs(tg, tgUnit);
    } else if (selectArray.indexOf("T=") !== -1) {
        tgIndex = selectArray.indexOf("T=");
        selectArray[tgIndex] = "T=" + getTGSecs(tg, tgUnit);
    }

    query.select_fields = query.select_fields.concat(selectArray);

    // CLASS(T=) should be added to the select fields only if user has selected T=
    if (classTEqualToIndex > -1) {
        query.select_fields = query.select_fields.concat("CLASS(T=)");
    }
}

function splitString2Array(strValue, delimiter) {
    var strArray = strValue.split(delimiter),
        count = strArray.length;

    for (var i = 0; i < count; i++) {
        strArray[i] = strArray[i].trim();
    }

    return strArray;
}

function getTGSecs(tg, tgUnit) {
    if (tgUnit === "secs") {
        return tg;
    } else if (tgUnit === "mins") {
        return tg * 60;
    } else if (tgUnit === "hrs") {
        return tg * 3600;
    } else if (tgUnit === "days") {
        return tg * 86400;
    } else {
        console.error("CANNOT handle UNKNOWN tg unit: " + tgUnit);
        return tg;
    }
}

function parseSLWhere(query, where, keywords) {
    var keywordsArray = keywords.split(",");

    if (!_.isNil(keywords) && keywords.trim() !== "") {
        for (var i = 0; i < keywordsArray.length; i++) {
            keywordsArray[i] = keywordsArray[i].trim();
        }
    }

    if (!_.isNil(where) && where.trim() !== "") {
        var whereORArray = where.split(" OR "),
            whereORLength = whereORArray.length,
            newWhereOR,
            keywordsStr = getKeywordsStrFromArray(keywordsArray);

        where = [];
        for (i = 0; i < whereORLength; i += 1) {
            whereORArray[i] = whereORArray[i].trim();
            newWhereOR = whereORArray[i].substr(0, whereORArray[i].length - 1);
            where[i] = newWhereOR.concat(" AND " + keywordsStr + " )");
            where[i] = parseWhereANDClause(where[i]);
        }
        query.where = where;
    } else {
        if (!_.isNil(keywords) && keywords.trim() !== "") {
            where = [];
            query.where = parseKeywordsObj(keywordsArray);
        }
    }
}

function getKeywordsStrFromArray(keywords) {
    var tempStr = "";

    for (var i = 1; i < keywords.length; i++) {
        tempStr = tempStr.concat("AND Keyword = " + keywords[i] + " ");
    }

    return ("Keyword = " + keywords[0] + " ").concat(tempStr);
}

function parseKeywordsObj(keywordsArray) {
    var keywordObj = [],
        keywordArray = [],
        finalkeywordArray = [];

    for (var i = 0; i < keywordsArray.length; i++) {
        keywordObj[i] = { "name": "", value: "", op: "" };
        keywordObj[i].name = "Keyword";
        keywordObj[i].value = keywordsArray[i];
        keywordObj[i].op = 1;
        keywordArray.push(keywordObj[i]);
    }

    finalkeywordArray.push(keywordArray);
    return finalkeywordArray;
}

function parseWhere(query, where) {
    if (!_.isNil(where) && where.trim() !== "") {
        var whereORArray = where.split(" OR "),
            whereORLength = whereORArray.length, i;

        for (i = 0; i < whereORLength; i += 1) {
            whereORArray[i] = whereORArray[i].trim();
            whereORArray[i] = parseWhereANDClause(whereORArray[i]);
        }

        query.where = whereORArray;
    }
}

function parseStatWhere(query, where) {
    if (!_.isNil(where) && where.trim() !== "") {
        var whereORArray = where.split(" OR "),
            whereORLength = whereORArray.length, i;

        for (i = 0; i < whereORLength; i += 1) {
            whereORArray[i] = whereORArray[i].trim();
            whereORArray[i] = parseWhereANDClause(whereORArray[i]);
        }

        query.where = whereORArray;
    } else {
        if (where === "") {
      //set value to '' and op to 7 when a where * is entered
            query.where = [
                [{ name: "name", value: "", op: 7 }]
            ];
        }
    }
}

function parseSLFilter(query, filters) {
    var filtersArray, filtersLength,
        filterClause = [], i, filterObj;

    if (!_.isNil(filters) && filters.trim() !== "") {
        filtersArray = filters.split(" AND ");
        filtersLength = filtersArray.length;

        for (i = 0; i < filtersLength; i += 1) {
            filtersArray[i] = filtersArray[i].trim();
            filterObj = getFilterObj(filtersArray[i]);
            filterClause.push(filterObj);
        }

        for (i = 0; i < query.filter.length; i++) {
            query.filter[i] = query.filter[i].concat(filterClause);
        }
    }
}

function parseFilter(query, filters) {
    var filtersArray, filtersLength,
        filterClause = [], i, filterObj;

    if (!_.isNil(filters) && filters.trim() !== "") {
        filtersArray = filters.split(" AND ");
        filtersLength = filtersArray.length;

        for (i = 0; i < filtersLength; i += 1) {
            filtersArray[i] = filtersArray[i].trim();
            filterObj = getFilterObj(filtersArray[i]);
            filterClause.push(filterObj);
        }

        query.filter = query.filter.concat(filterClause);
    }
}

function getFilterObj(filter) {
    var filterObj;

    if (filter.indexOf("!=") !== -1) {
        filterObj = parseFilterObj(filter, "!=");
    } else if (filter.indexOf(" RegEx= ") !== -1) {
        filterObj = parseFilterObj(filter, "RegEx=");
    } else if (filter.indexOf("=") !== -1) {
        filterObj = parseFilterObj(filter, "=");
    }

    return filterObj;
}

function parseFilterObj(filter, operator) {
    var filterObj, filterArray;

    filterArray = splitString2Array(filter, operator);

    if (filterArray.length > 1 && filterArray[1] !== "") {
        filterObj = { "name": "", value: "", op: "" };
        filterObj.name = filterArray[0];
        filterObj.value = filterArray[1];
        filterObj.op = getOperatorCode(operator);
    }

    return filterObj;
}

function parseFSFilter(query, filters) {
    var arrayStart, arrayEnd, sortFieldsStr, sortFieldsArray,
        limitSortOrderStr, limitSortOrderArray, count, sortOrder, limitArray, limit;

    if (!_.isNil(filters) && filters.trim() !== "") {
        try {
            arrayStart = filters.indexOf("[");
            arrayEnd = filters.indexOf("]");
            if (arrayStart !== -1 && arrayEnd !== -1) {
                sortFieldsStr = filters.slice(arrayStart + 1, arrayEnd);
                sortFieldsArray = splitString2Array(sortFieldsStr, ",");
                limitSortOrderStr = filters.slice(arrayEnd + 1);
            } else {
                limitSortOrderStr = filters;
            }
            limitSortOrderArray = splitString2Array(limitSortOrderStr, ",");
            count = limitSortOrderArray.length;
            for (var i = 0; i < count; i++) {
                if (limitSortOrderArray[i] === "") {
                    continue;
                } else if (limitSortOrderArray[i].indexOf("sort") !== -1) {
                    sortOrder = splitString2Array(limitSortOrderArray[i], ":");
                    if (sortOrder.length > 1 && sortOrder[1] !== "") {
                        if (sortOrder[1].toLowerCase() === "asc") {
                            query.sort = 1;
                        } else {
                            query.sort = 2;
                        }
                        query.sort_fields = sortFieldsArray;
                    }
                } else if (limitSortOrderArray[i].indexOf("limit") !== -1) {
                    limitArray = splitString2Array(limitSortOrderArray[i], ":");
                    if (limitArray.length > 1 && limitArray[1] !== "") {
                        try {
                            limit = parseInt(limitArray[1]);
                            if (limit > 0) {
                                query.limit = limit;
                            }
                        } catch (err) {
                            logutils.logger.error(err.stack);
                        }
                    }
                }
            }
        } catch (error) {
            logutils.logger.error(error.stack);
        }
    }
}

function parseWhereANDClause(whereANDClause) {
    var whereANDArray = whereANDClause.replace("(", "").replace(")", "").split(" AND "),
        whereANDLength = whereANDArray.length,
        i, whereANDClauseArray, operator = "",
        whereANDClauseWithSuffixArrray, whereANDTerm;

    for (i = 0; i < whereANDLength; i += 1) {
        whereANDArray[i] = whereANDArray[i].trim();
        whereANDClause = whereANDArray[i];
        if (whereANDClause.indexOf("&") === -1) {
            if (whereANDClause.indexOf("Starts with") !== -1) {
                operator = "Starts with";
                whereANDClauseArray = whereANDClause.split(operator);
            } else if (whereANDClause.indexOf("=") !== -1) {
                operator = "=";
                whereANDClauseArray = whereANDClause.split(operator);
            }
            whereANDClause = { "name": "", value: "", op: "" };
            populateWhereANDClause(whereANDClause, whereANDClauseArray[0].trim(), whereANDClauseArray[1].trim(), operator);
            whereANDArray[i] = whereANDClause;
        } else {
            whereANDClauseWithSuffixArrray = whereANDClause.split("&");
      // Treat whereANDClauseWithSuffixArrray[0] as a normal AND term and
      // whereANDClauseWithSuffixArrray[1] as a special suffix term
            if (_.isNil(whereANDClauseWithSuffixArrray) && whereANDClauseWithSuffixArrray.length !== 0) {
                var tempWhereANDClauseWithSuffix;
                for (var j = 0; j < whereANDClauseWithSuffixArrray.length; j++) {
                    if (whereANDClauseWithSuffixArrray[j].indexOf("Starts with") !== -1) {
                        operator = "Starts with";
                        whereANDTerm = whereANDClauseWithSuffixArrray[j].split(operator);
                    } else if (whereANDClauseWithSuffixArrray[j].indexOf("=") !== -1) {
                        operator = "=";
                        whereANDTerm = whereANDClauseWithSuffixArrray[j].split(operator);
                    }
                    whereANDClause = { "name": "", value: "", op: "" };
                    populateWhereANDClause(whereANDClause, whereANDTerm[0].trim(), whereANDTerm[1].trim(), operator);
                    if (j === 0) {
                        tempWhereANDClauseWithSuffix = whereANDClause;
                    } else if (j === 1) {
                        tempWhereANDClauseWithSuffix.suffix = whereANDClause;
                    }
                }
                whereANDArray[i] = tempWhereANDClauseWithSuffix;
            }
        }
    }
    return whereANDArray;
}

function populateWhereANDClause(whereANDClause, fieldName, fieldValue, operator) {
    var validLikeOPRFields = global.VALID_LIKE_OPR_FIELDS,
        validRangeOPRFields = global.VALID_RANGE_OPR_FIELDS,
        splitFieldValues;

    whereANDClause.name = fieldName;

    if (validLikeOPRFields.indexOf(fieldName) !== -1 && fieldValue.indexOf("*") !== -1) {
        whereANDClause.value = fieldValue.replace("*", "");
        whereANDClause.op = 7;
    } else if (validRangeOPRFields.indexOf(fieldName) !== -1 && fieldValue.indexOf("-") !== -1) {
        splitFieldValues = splitString2Array(fieldValue, "-");
        whereANDClause.value = splitFieldValues[0];
        whereANDClause.value2 = splitFieldValues[1];
        whereANDClause.op = 3;
    } else {
        whereANDClause.value = fieldValue;
        whereANDClause.op = getOperatorCode(operator);
    }
}

function getOperatorCode(operator) {
    if (operator === "=") {
        return 1;
    } else if (operator === "!=") {
        return 2;
    } else if (operator === "RegEx=") {
        return 8;
    } else if (operator === "Starts with") {
        return 7;
    } else {
        return -1;
    }
}

function getQueryJSON4Table(tableName, autoSort, autoLimit) {
    var queryJSON;

    if (tableName === "MessageTable") {
        queryJSON = {
            "table": tableName,
            "start_time": "",
            "end_time": "",
            "select_fields": [
                "MessageTS", "Type", "Source", "ModuleId",
                "Messagetype", "Xmlmessage", "Level", "Category"
            ],
            "filter": [
        [{ "name": "Type", "value": "1", "op": 1 }],
        [{ "name": "Type", "value": "10", "op": 1 }]
            ],
            "sort_fields": ["MessageTS"],
            "sort": 2,
            "limit": 150000
        };
    } else if (tableName === "ObjectTableQueryTemplate") {
        queryJSON = {
            "table": "",
            "start_time": "",
            "end_time": "",
            "select_fields": ["MessageTS", "Source", "ModuleId"],
            "sort_fields": ["MessageTS"],
            "sort": 2,
            "filter": [],
            "limit": 50000
        };
    } else if (tableName === "FlowSeriesTable") {
        queryJSON = {
            "table": tableName,
            "start_time": "",
            "end_time": "",
            "select_fields": ["flow_class_id", "direction_ing"]
        };

        if (autoSort) {
            queryJSON.select_fields.push("T");
            queryJSON.sort_fields = ["T"];
            queryJSON.sort = 2;
        }
        if (autoLimit) {
            queryJSON.limit = 150000;
        }
    } else if (tableName === "FlowRecordTable") {
        queryJSON = {
            "table": tableName,
            "start_time": "",
            "end_time": "",
            "select_fields": [
                "vrouter", "sourcevn", "sourceip", "sport",
                "destvn", "destip", "dport", "protocol",
                "direction_ing", "UuidKey", "action", "sg_rule_uuid",
                "nw_ace_uuid", "vrouter_ip", "other_vrouter_ip",
                "underlay_proto", "underlay_source_port"
            ],
            "limit": 150000
        };
    } else if (tableName.indexOf("Object") !== -1) {
        queryJSON = {
            "table": tableName,
            "start_time": "",
            "end_time": "",
            "select_fields": ["MessageTS", "Source", "ModuleId"],
            "sort_fields": ["MessageTS"],
            "sort": 2,
            "filter": [],
            "limit": 50000
        };
    } else if (tableName.indexOf("StatTable.") !== -1) {
        queryJSON = {
            "table": tableName,
            "start_time": "",
            "end_time": "",
            "select_fields": [],
            "filter": [],
            "limit": 150000
        };
    } else {
        queryJSON = {
            "table": tableName,
            "start_time": "",
            "end_time": "",
            "select_fields": [],
            "limit": 150000
        };
    }
    return queryJSON;
}

function runGETQuery(req, res, appData) {
    var reqQuery = req.query;
    runQuery(req, res, reqQuery, appData);
}

function runPOSTQuery(req, res, appData) {
    var reqQuery = req.body;
    runQuery(req, res, reqQuery, appData);
}

function runQuery(req, res, reqQuery, appData) {
    var queryId = reqQuery.queryId,
        page = reqQuery.page,
        sort = reqQuery.sort,
        pageSize = parseInt(reqQuery.pageSize),
        options;

    options = {
        "queryId": queryId,
        "page": page,
        "sort": sort,
        "pageSize": pageSize,
        "toSort": true
    };

    logutils.logger.debug("Query Request: " + JSON.stringify(reqQuery));
    if (!_.isNil(queryId)) {
        redisClient.exists(queryId + ":page1", function(err, exists) {
            if (err) {
                logutils.logger.error(err.stack);
                commonUtils.handleJSONResponse(err, res, null);
            } else if (exists === 1) {
                returnCachedQueryResult(res, options, handleQueryResponse);
            } else {
                runNewQuery(req, res, queryId, reqQuery, appData);
            }
        });
    } else {
        runNewQuery(req, res, null, reqQuery, appData);
    }
}

function exportQueryResult(req, res) {
    var queryId = req.query.queryId;

    redisClient.exists(queryId, function(err, exists) {
        if (exists) {
            var stream = redisReadStream(redisClient, queryId);
            res.writeHead(global.HTTP_STATUS_RESP_OK, { "Content-Type": "application/json" });
            stream.on("error", function(err) {
                logutils.logger.error(err.stack);
                var errorJSON = { error: err.message };
                res.write(JSON.stringify(errorJSON));
                res.end();
            }).on("readable", function() {
                var data;
                while ((data = stream.read()) !== null) {
                    res.write(data);
                }
            }).on("end", function() {
                res.end();
            });
        } else {
            commonUtils.handleJSONResponse(null, res, { data: [], total: 0 });
        }
    });
}

function returnCachedQueryResult(res, options, callback) {
    var queryId = options.queryId,
        sort = options.sort,
        statusJSON;

    if (!_.isNil(sort)) {
        redisClient.get(queryId + ":sortStatus", function(error, result) {
            var sort = options.sort;
            if (error) {
                logutils.logger.error(error.stack);
            } else if (!_.isNil(result)) {
                statusJSON = JSON.parse(result);
                if (statusJSON[0].field === sort[0].field && statusJSON[0].dir === sort[0].dir) {
                    options.toSort = false;
                }
            }
            callback(res, options);
        });
    } else {
        options.toSort = false;
        callback(res, options);
    }
}

function handleQueryResponse(res, options) {
    var toSort = options.toSort,
        queryId = options.queryId,
        page = options.page,
        pageSize = options.pageSize,
        sort = options.sort;

    if (_.isNil(page) || toSort) {
        redisClient.exists(queryId, function(err, exists) {
            if (exists) {
                var stream = redisReadStream(redisClient, queryId),
                    chunkedData, accumulatedData = [],
                    dataBuffer, resultJSON;

                stream.on("error", function(err) {
                    logutils.logger.error(err.stack);
                    commonUtils.handleJSONResponse(err, res, null);
                }).on("readable", function() {
                    while ((chunkedData = stream.read()) !== null) {
                        accumulatedData.push(chunkedData);
                    }
                }).on("end", function() {
                    dataBuffer = Buffer.concat(accumulatedData);
                    resultJSON = JSON.parse(dataBuffer);
                    if (toSort) {
                        sortJSON(resultJSON.data, sort, function() {
                            var startIndex, endIndex, total, responseJSON;

                            total = resultJSON.total;
                            startIndex = (page - 1) * pageSize;
                            endIndex = (total < (startIndex + pageSize)) ? total : (startIndex + pageSize);
                            responseJSON = resultJSON.data.slice(startIndex, endIndex);
                            commonUtils.handleJSONResponse(null, res, { data: responseJSON, total: total, queryJSON: resultJSON.queryJSON });
                            saveQueryResult2Redis(resultJSON.data, total, queryId, pageSize, sort, resultJSON.queryJSON);
                        });
                    } else {
                        commonUtils.handleJSONResponse(null, res, resultJSON);
                    }
                });
            } else {
                commonUtils.handleJSONResponse(null, res, { data: [], total: 0 });
            }
        });
    } else {
        redisClient.get(queryId + ":page" + page, function(error, result) {
            var resultJSON = result ? JSON.parse(result) : { data: [], total: 0 };

            if (error) {
                logutils.logger.error(error.stack);
                commonUtils.handleJSONResponse(error, res, null);
            } else if (toSort) {
                sortJSON(resultJSON.data, sort, function() {
                    var startIndex, endIndex, total, responseJSON;

                    total = resultJSON.total;
                    startIndex = (page - 1) * pageSize;
                    endIndex = (total < (startIndex + pageSize)) ? total : (startIndex + pageSize);
                    responseJSON = resultJSON.data.slice(startIndex, endIndex);
                    commonUtils.handleJSONResponse(null, res, { data: responseJSON, total: total, queryJSON: resultJSON.queryJSON });
                    saveQueryResult2Redis(resultJSON.data, total, queryId, pageSize, sort, resultJSON.queryJSON);
                });
            } else {
                commonUtils.handleJSONResponse(null, res, resultJSON);
            }
        });
    }
}

function quickSortPartition(array, left, right, sort) {
    var sortField = sort[0].field,
        sortDir = sort[0].dir === "desc" ? 0 : 1,
        rightFieldValue = array[right - 1][sortField],
        min = left, max;

    for (max = left; max < right - 1; max += 1) {
        if (sortDir && array[max][sortField] <= rightFieldValue) {
            quickSortSwap(array, max, min);
            min += 1;
        } else if (!sortDir && array[max][sortField] >= rightFieldValue) {
            quickSortSwap(array, max, min);
            min += 1;
        }
    }

    quickSortSwap(array, min, right - 1);

    return min;
}

function quickSortSwap(array, max, min) {
    var temp = array[max];

    array[max] = array[min];
    array[min] = temp;

    return array;
}

function quickSort(array, left, right, sort, qsStatus) {
    if (left < right) {
        var p = quickSortPartition(array, left, right, sort);
        qsStatus.started++;
        process.nextTick(function() {
            quickSort(array, left, p, sort, qsStatus);
        });
        qsStatus.started++;
        process.nextTick(function() {
            quickSort(array, p + 1, right, sort, qsStatus);
        });
    }
    qsStatus.ended++;
}

function sortJSON(resultArray, sortParams, callback) {
    var qsStatus = { started: 1, ended: 0 },
        sortField = sortParams[0].field,
        sortBy = [{}];

    sortField = sortField.replace(/(["\[\]])/g, "");
    sortBy[0].field = sortField;
    sortBy[0].dir = sortParams[0].dir;
    quickSort(resultArray, 0, resultArray.length, sortBy, qsStatus);

    qsStatus.intervalId = setInterval(function(qsStatus, callback) {
        if (qsStatus.started === qsStatus.ended) {
            callback();
            clearInterval(qsStatus.intervalId);
        }
    }, 2000, qsStatus, callback);
}

function runNewQuery(req, res, queryId, reqQuery, appData) {
    queryId = reqQuery.queryId;

    var tableName = reqQuery.table,
        tableType = reqQuery.tableType,
        pageSize = parseInt(reqQuery.pageSize),
        async = (!_.isNil(reqQuery.async) && reqQuery.async === "true") ? true : false,
        reRunTimeRange = reqQuery.reRunTimeRange,
        reRunQuery = reqQuery,
        engQueryStr = reqQuery.engQueryStr,
        saveQuery = reqQuery.saveQuery,
        options = {
            queryId: queryId,
            pageSize: pageSize,
            counter: 0,
            status: "run",
            async: async,
            count: 0,
            progress: 0,
            errorMessage: "",
            reRunTimeRange: reRunTimeRange,
            reRunQuery: reRunQuery,
            opsQueryId: "",
            engQueryStr: engQueryStr,
            saveQuery: saveQuery
        },
        queryJSON;

    if (tableName === "MessageTable") {
        queryJSON = parseSLQuery(reqQuery);
        options.queryQueue = "lqq";
    } else if (tableType === "OBJECT" || tableName.indexOf("Object") !== -1) {
        queryJSON = parseOTQuery(reqQuery);
        options.queryQueue = "lqq";
    } else if (tableName === "FlowSeriesTable") {
        queryJSON = parseFSQuery(reqQuery);
        if (queryJSON.select_fields.indexOf("bytes") === -1 && queryJSON.select_fields.indexOf("packets") === -1) {
            options.tg = reqQuery.tgValue;
            options.tgUnit = reqQuery.tgUnits;
        } else {
            options.tg = "";
            options.tgUnit = "";
        }
        options.queryQueue = "fqq";
    } else if (tableName === "FlowRecordTable") {
        queryJSON = parseFRQuery(reqQuery);
        if (!_.isNil(reqQuery.excludeInSelect) && reqQuery.excludeInSelect.length > 0) {
            queryJSON.select_fields = queryJSON.select_fields.filter(function(item) {
                return reqQuery.excludeInSelect.indexOf(item) === -1;
            });
        }
        options.queryQueue = "fqq";
    } else if (tableName.indexOf("StatTable.") !== -1) {
        queryJSON = parseStatsQuery(reqQuery);
        options.tg = reqQuery.tgValue;
        options.tgUnit = reqQuery.tgUnits;
        options.queryQueue = "sqq";
        options.statPlotFields = reqQuery.plotFields;
        options.statGroupFields = reqQuery.groupFields;
        options.statXaxis = reqQuery.Xaxis;
    }
    options.queryJSON = queryJSON;
    executeQuery(res, options, appData);
}

// Handle request to get list of all tables.
function getTables(req, res, appData) {
    var opsUrl = global.GET_TABLES_URL;
    sendCachedJSON4Url(opsUrl, res, 3600, appData);
}

// Handle request to get valid values of a table column.
function getColumnValues(req, res, appData) {
    var opsUrl = global.GET_TABLE_INFO_URL + "/" + req.param("tableName") + "/column-values/" + req.param("column");
    sendCachedJSON4Url(opsUrl, res, 3600, appData);
}

// Handle request to get table schema.
function getTableSchema(req, res, appData) {
    var opsUrl = global.GET_TABLE_INFO_URL + "/" + req.param("tableName") + "/schema";
    sendCachedJSON4Url(opsUrl, res, 3600, appData);
}

function sendCachedJSON4Url(opsUrl, res, expireTime, appData) {
    redisClient.get(opsUrl, function(error, cachedJSONStr) {
        if (error || _.isNil(cachedJSONStr)) {
            opApiServer.apiGet(opsUrl, appData, function(error, jsonData) {
                if (!jsonData) {
                    jsonData = [];
                }
                redisClient.setex(opsUrl, expireTime, JSON.stringify(jsonData));
                commonUtils.handleJSONResponse(error, res, jsonData);
            });
        } else {
            commonUtils.handleJSONResponse(null, res, JSON.parse(cachedJSONStr));
        }
    });
}

// Handle request to get object ids.
function getObjectIds(req, res, appData) {
    var objectTable = req.param("objectType"),
        objectQuery, startTime, endTime, queryOptions;

    startTime = req.param("fromTimeUTC");
    endTime = req.param("toTimeUTC");

    objectQuery = { "start_time": startTime, "end_time": endTime, "select_fields": ["ObjectId"], "table": objectTable };
    setMicroTimeRange(objectQuery, startTime, endTime);
    queryOptions = { queryId: null, async: false, status: "run", queryJSON: objectQuery, errorMessage: "" };

    executeQuery(res, queryOptions, appData);
}

// Handle request to get query queue.
function getQueryQueue(req, res) {
    var queryQueue = req.param("queryQueue");

    redisClient.hvals(queryQueue, function(error, results) {
        if (error) {
            logutils.logger.error(error.stack);
            commonUtils.handleJSONResponse(error, res, null);
        } else {
            for (var i = 0; i < results.length; i++) {
                results[i] = JSON.parse(results[i]);
            }
            commonUtils.handleJSONResponse(error, res, results);
        }
    });
}

// Handle request to get unique flow classes for a flow-series query.
function getFlowClasses(req, res) {
    var queryId = req.param("queryId");

    redisClient.get(queryId + ":flowclasses", function(error, results) {
        if (error) {
            logutils.logger.error(error.stack);
            commonUtils.handleJSONResponse(error, res, null);
        } else {
            commonUtils.handleJSONResponse(error, res, JSON.parse(results));
        }
    });
}

// Handle request to get chart data for a flow-series query.
function getChartData(req, res) {
    var queryId = req.param("queryId");

    redisClient.get(queryId + ":chartdata", function(error, results) {
        if (error) {
            logutils.logger.error(error.stack);
            commonUtils.handleJSONResponse(error, res, null);
        } else {
            commonUtils.handleJSONResponse(error, res, JSON.parse(results));
        }
    });
}

// Handle request to delete redis cache for given query ids.
function deleteQueryCache4Ids(req, res) {
    var queryIds = req.body.queryIds,
        queryQueue = req.body.queryQueue;

    for (var i = 0; i < queryIds.length; i++) {
        redisClient.hdel(queryQueue, queryIds[i]);
        redisClient.keys(queryIds[i] + "*", function(error, keysArray) {
            if (!error && keysArray.length > 0) {
                redisClient.del(keysArray, function(error) {
                    if (error) {
                        logutils.logger.error("Error in delete cache of query key: " + error);
                    }
                });
            } else {
                logutils.logger.error("Error in delete cache of query id: " + error);
            }
        });
    }
    commonUtils.handleJSONResponse(null, res, {});
}

// Handle request to delete redis cache for QE.
function deleteQueryCache4Queue(req, res) {
    var queryQueue = req.body.queryQueue;

    redisClient.hkeys(queryQueue, function(error) {
        if (!error) {
            redisClient.del(queryQueue, function(error) {
                if (error) {
                    logutils.logger.error("Error in delete cache of query queue: " + error);
                    commonUtils.handleJSONResponse(error, res, null);
                } else {
                    logutils.logger.debug("Redis Query Queue " + queryQueue + " flush complete.");
                    commonUtils.handleJSONResponse(null, res, { message: "Redis Query Queue " + queryQueue + " flush complete." });
                }
            });
        } else {
            commonUtils.handleJSONResponse(error, res, null);
        }
    });
}

// Handle request to delete redis cache for QE.
function flushQueryCache(req, res) {
    redisClient.flushdb(function(error) {
        if (error) {
            logutils.logger.error("Redis QE FlushDB Error: " + error);
            commonUtils.handleJSONResponse(error, res, null);
        } else {
            logutils.logger.debug("Redis QE FlushDB Complete.");
            commonUtils.handleJSONResponse(null, res, { message: "Redis QE FlushDB Complete." });
        }
    });
}

// Handle request to get current time of server
function getCurrentTime(req, res) {
    var currentTime = new Date().getTime();
    commonUtils.handleJSONResponse(null, res, { currentTime: currentTime });
}

function isEmptyObject(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            return false;
        }
    }
    return true;
}

exports.runGETQuery = runGETQuery;
exports.runPOSTQuery = runPOSTQuery;
exports.getTables = getTables;
exports.getColumnValues = getColumnValues;
exports.getTableSchema = getTableSchema;
exports.getObjectIds = getObjectIds;
exports.getQueryQueue = getQueryQueue;
exports.getFlowClasses = getFlowClasses;
exports.getChartData = getChartData;
exports.deleteQueryCache4Ids = deleteQueryCache4Ids;
exports.deleteQueryCache4Queue = deleteQueryCache4Queue;
exports.flushQueryCache = flushQueryCache;
exports.exportQueryResult = exportQueryResult;
exports.getQueryJSON4Table = getQueryJSON4Table;
exports.getCurrentTime = getCurrentTime;
