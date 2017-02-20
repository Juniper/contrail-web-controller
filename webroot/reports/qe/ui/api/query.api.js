/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * API for communication with Query Engine.
 */

var qeapi = module.exports,
    rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api'),
    logutils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/log.utils'),
    commonUtils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/common.utils'),
    messages = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/messages'),
    global = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/global'),
    opApiServer = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/common/opServer.api'),
    config = process.mainModule.exports["config"],
    redisReadStream = require('redis-rstream'),
    qs = require('querystring'),
    _ = require('underscore');

var redis = require("redis"),
    redisServerPort = (config.redis_server_port) ? config.redis_server_port : global.DFLT_REDIS_SERVER_PORT,
    redisServerIP = (config.redis_server_ip) ? config.redis_server_ip : global.DFLT_REDIS_SERVER_IP,
    redisClient = redis.createClient(redisServerPort, redisServerIP);

redisClient.select(global.QE_DFLT_REDIS_DB, function (error) {
    if (error) {
        logutils.logger.error('Redis DB ' + global.QE_DFLT_REDIS_DB + ' Select Error:' + error);
    }
});

if (!module.parent) {
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call, module.filename));
    process.exit(1);
}

function runGETQuery(req, res, appData) {
    var reqQuery = req.query;
    runQuery(req, res, reqQuery, appData);
}

function runPOSTQuery(req, res, appData) {
    var queryReqObj = req.body;
    runQuery(req, res, queryReqObj, appData);
}

// Handle request to get list of all tables.
function getTables(req, res, appData) {
    var opsUrl = global.GET_TABLES_URL;
    sendCachedJSON4Url(opsUrl, res, 3600, appData);
};

// Handle request to get table schema.
function getTableSchema(req, res, appData) {
    var opsUrl = global.GET_TABLE_INFO_URL + '/' + req.param('tableName') + '/schema';
    sendCachedJSON4Url(opsUrl, res, 3600, appData);
};

// Handle request to get columns values.
function getTableColumnValues(req, res, appData) {
    var reqQueryObj = req.body,
        tableName = reqQueryObj['table_name'],
        selectFields = reqQueryObj['select'],
        where = reqQueryObj['where'],
        objectQuery, startTime, endTime, queryOptions;

    startTime = reqQueryObj['fromTimeUTC'];
    endTime = reqQueryObj['toTimeUTC'];

    if(tableName == null) {
        commonUtils.handleJSONResponse(null, res, {});
    } else {
        objectQuery = {"start_time": startTime, "end_time": endTime, "select_fields": selectFields, "table": tableName, "where": where};
        setMicroTimeRange(objectQuery, startTime, endTime);
        queryOptions = {queryId: null, async: false, status: "run", queryJSON: objectQuery, errorMessage: ""};

        executeQuery(res, queryOptions, appData);
    }
};

// Handle request to get query queue.
function getQueryQueue(req, res) {
    var queryQueue = req.param('queryQueue'),
        responseArray = [];
    redisClient.hvals(queryQueue, function (error, results) {
        if (error) {
            logutils.logger.error(error.stack);
            commonUtils.handleJSONResponse(error, res, null);
        } else {
            for (var i = 0; i < results.length; i++) {
                responseArray[i] = JSON.parse(results[i])
            }
            commonUtils.handleJSONResponse(error, res, responseArray);
        }
    });
};

// Handle request to get unique flow classes for a flow-series query.
function getChartGroups(req, res) {
    var queryId = req.param('queryId');
    redisClient.get(queryId + ':chartgroups', function (error, results) {
        if (error) {
            logutils.logger.error(error.stack);
            commonUtils.handleJSONResponse(error, res, null);
        } else {
            commonUtils.handleJSONResponse(error, res, JSON.parse(results));
        }
    });
};

// Handle request to get chart data for a flow-series query.
function getChartData(req, res) {
    var queryId = req.param('queryId');
    redisClient.get(queryId + ':chartdata', function (error, results) {
        if (error) {
            logutils.logger.error(error.stack);
            commonUtils.handleJSONResponse(error, res, null);
        } else {
            commonUtils.handleJSONResponse(error, res, JSON.parse(results));
        }
    });
};

// Handle request to delete redis cache for given query ids.
function deleteQueryCache4Ids(req, res) {
    var queryIds = req.body.queryIds,
        queryQueue = req.body.queryQueue;


    for (var i = 0; i < queryIds.length; i++) {
        redisClient.hdel(queryQueue, queryIds[i]);
        redisClient.keys(queryIds[i] + "*", function (error, keysArray) {
            if (!error && keysArray.length > 0) {
                redisClient.del(keysArray, function (error) {
                    if (error) {
                        logutils.logger.error('Error in delete cache of query key: ' + error);
                    }
                });
            } else {
                logutils.logger.error('Error in delete cache of query id: ' + error);
            }
        });
    }
    commonUtils.handleJSONResponse(null, res, {});
};

// Handle request to delete redis cache for QE.
function deleteQueryCache4Queue(req, res) {
    var queryQueue = req.body.queryQueue;
    redisClient.hkeys(queryQueue, function (error, results) {
        if (!error) {
            redisClient.del(queryQueue, function (error) {
                if (error) {
                    logutils.logger.error('Error in delete cache of query queue: ' + error);
                    commonUtils.handleJSONResponse(error, res, null);
                } else {
                    logutils.logger.debug('Redis Query Queue ' + queryQueue + ' flush complete.');
                    commonUtils.handleJSONResponse(null, res, {message: 'Redis Query Queue ' + queryQueue + ' flush complete.'});
                }
            });
        } else {
            commonUtils.handleJSONResponse(error, res, null);
        }
    });
};

// Handle request to delete redis cache for QE.
function flushQueryCache(req, res) {
    redisClient.flushdb(function (error) {
        if (error) {
            logutils.logger.error("Redis QE FlushDB Error: " + error);
            commonUtils.handleJSONResponse(error, res, null);
        } else {
            logutils.logger.debug("Redis QE FlushDB Complete.");
            commonUtils.handleJSONResponse(null, res, {message: 'Redis QE FlushDB Complete.'});
        }
    });
};

// Handle request to get current time of server
function getCurrentTime(req, res) {
    var currentTime = new Date().getTime();
    commonUtils.handleJSONResponse(null, res, {currentTime: currentTime});
};

function runQuery(req, res, queryReqObj, appData) {
    queryReqObj = commonUtils.sanitizeXSS(queryReqObj);

    var queryId = queryReqObj['queryId'],
        chunk = queryReqObj['chunk'], chunkSize = parseInt(queryReqObj['chunkSize']),
        sort = queryReqObj['sort'], cachedResultConfig;

    cachedResultConfig = {"queryId": queryId, "chunk": chunk, "sort": sort, "chunkSize": chunkSize, "toSort": true};

    logutils.logger.debug('Query Request: ' + JSON.stringify(queryReqObj));

    if (queryId != null) {
        redisClient.exists(queryId + ':chunk1', function (err, exists) {
            if (err) {
                logutils.logger.error(err.stack);
                commonUtils.handleJSONResponse(err, res, null);
            } else if (exists == 1) {
                returnCachedQueryResult(res, cachedResultConfig, handleQueryResponse);
            } else {
                runNewQuery(req, res, queryId, queryReqObj, appData);
            }
        });
    } else {
        runNewQuery(req, res, null, queryReqObj, appData);
    }
};

function runNewQuery(req, res, queryId, queryReqObj, appData) {
    var queryOptions = getQueryOptions(queryReqObj),
        queryJSON = getQueryJSON4Table(queryReqObj);

    queryOptions.queryJSON = queryJSON;
    executeQuery(res, queryOptions, appData);
};

function getQueryOptions(queryReqObj) {
    var formModelAttrs = queryReqObj['formModelAttrs'], tableType = formModelAttrs['table_type'],
        queryId = queryReqObj['queryId'], chunkSize = parseInt(queryReqObj['chunkSize']),
        async = (queryReqObj['async'] != null) ? queryReqObj['async'] : false;

    var queryOptions = {
        queryId: queryId, chunkSize: chunkSize, counter: 0, status: "run", async: async, count: 0, progress: 0, errorMessage: "",
        queryReqObj: queryReqObj, opsQueryId: "", tableType: tableType
    };

    if (tableType == 'LOG' || tableType == 'OBJECT') {
        queryOptions.queryQueue = 'lqq';
    } else if (tableType == 'FLOW') {
        queryOptions.queryQueue = 'fqq';
    } else if (tableType == 'STAT') {
        queryOptions.queryQueue = 'sqq';
    }

    return queryOptions;
};

function executeQuery(res, queryOptions, appData) {
    var queryJSON = queryOptions.queryJSON,
        async = queryOptions.async, asyncHeader = {"Expect": "202-accepted"};

        logutils.logger.debug("Query sent to Opserver at " + new Date() + ' ' + JSON.stringify(queryJSON));
        queryOptions['startTime'] = new Date().getTime();
        opApiServer.apiPost(global.RUN_QUERY_URL, queryJSON, appData,
                            function (error, jsonData) {
            if (error) {
                logutils.logger.error('Error Run Query: ' + error.stack);
                commonUtils.handleJSONResponse(error, res, null);
            } else if (async) {
                initPollingConfig(queryOptions, queryJSON.start_time, queryJSON.end_time)
                queryOptions['url'] = jsonData['href'];
                queryOptions['opsQueryId'] = parseOpsQueryIdFromUrl(jsonData['href']);
                setTimeout(fetchQueryResults, 3000, res, jsonData, queryOptions,
                           appData);
                queryOptions['intervalId'] =
                setInterval(fetchQueryResults, queryOptions.pollingInterval, res,
                            jsonData, queryOptions, appData);
                queryOptions['timeoutId'] = setTimeout(stopFetchQueryResult, queryOptions.pollingTimeout, queryOptions);
            } else {
                processQueryResults(res, jsonData, queryOptions);
            }
        }, async ? asyncHeader : {});
};

function initPollingConfig(options, fromTime, toTime) {
    var timeRange = null;
    if (true == isNaN(fromTime)) {
        var str = 'now-';
        /* Check if we have keyword now in that */
        var pos = fromTime.indexOf(str);
        if (pos != -1) {
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
        options.pollingInterval = 10000;
        options.maxCounter = 1;
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
};

function fetchQueryResults(res, jsonData, queryOptions, appData) {
    var queryId = queryOptions['queryId'], chunkSize = queryOptions['chunkSize'],
        queryJSON = queryOptions['queryJSON'], progress;

        opApiServer.apiGet(jsonData['href'], appData, function (error, queryResults) {
            progress = queryResults['progress'];
            queryOptions['counter'] += 1;
            if (error) {
                logutils.logger.error(error.stack);
                clearInterval(queryOptions['intervalId']);
                clearTimeout(queryOptions['timeoutId']);
                queryOptions['progress'] = progress;
                if (queryOptions.status == 'run') {
                    commonUtils.handleJSONResponse(error, res, null);
                } else if (queryOptions.status == 'queued') {
                    queryOptions.status = 'error';
                    queryOptions.errorMessage = error;
                    updateQueryStatus(queryOptions);
                }
            } else if (progress == 100) {
                clearInterval(queryOptions['intervalId']);
                clearTimeout(queryOptions['timeoutId']);
                queryOptions['progress'] = progress;
                queryOptions['count'] = queryResults.chunks[0]['count'];
                jsonData['href'] = queryResults.chunks[0]['href'];

                if (queryOptions['count'] > 10000 && queryOptions['status'] != 'queued') {
                    queryOptions['progress'] = progress;
                    queryOptions['status'] = 'queued';
                    updateQueryStatus(queryOptions);
                    commonUtils.handleJSONResponse(null, res, {status: "queued", data: []});
                }
                fetchQueryResults(res, jsonData, queryOptions, appData);
            } else if (progress == null || progress === 'undefined') {
                processQueryResults(res, queryResults, queryOptions);
                queryOptions['endTime'] = new Date().getTime();
                queryOptions['status'] = 'completed';
                updateQueryStatus(queryOptions);
            } else if (queryOptions['counter'] == queryOptions.maxCounter) {
                queryOptions['progress'] = progress;
                queryOptions['status'] = 'queued';
                updateQueryStatus(queryOptions);
                commonUtils.handleJSONResponse(null, res, {status: "queued", data: []});
            }
        });
};

function sendCachedJSON4Url(opsUrl, res, expireTime, appData) {
    redisClient.get(opsUrl, function (error, cachedJSONStr) {
        if (error || cachedJSONStr == null) {
                opApiServer.apiGet(opsUrl, appData, function (error, jsonData) {
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
};


function returnCachedQueryResult(res, queryOptions, callback) {
    var queryId = queryOptions.queryId,
        sort = queryOptions.sort, statusJSON;

    if (sort != null) {
        redisClient.get(queryId + ':sortStatus', function (error, result) {
            var sort = queryOptions.sort;
            if (error) {
                logutils.logger.error(error.stack);
            } else if (result != null) {
                statusJSON = JSON.parse(result);
                if (statusJSON[0]['field'] == sort[0]['field'] && statusJSON[0]['dir'] == sort[0]['dir']) {
                    queryOptions.toSort = false;
                }
            }
            callback(res, queryOptions);
        });
    } else {
        queryOptions.toSort = false;
        callback(res, queryOptions);
    }
};

function handleQueryResponse(res, options) {
    var toSort = options.toSort, queryId = options.queryId,
        chunk = options.chunk, chunkSize = options.chunkSize,
        sort = options.sort;

    if (chunk == null || toSort) {
        redisClient.exists(queryId, function (err, exists) {
            if (exists) {
                var stream = redisReadStream(redisClient, queryId),
                    chunkedData, accumulatedData = [], dataBuffer, resultJSON;
                stream.on('error', function (err) {
                    logutils.logger.error(err.stack);
                    commonUtils.handleJSONResponse(err, res, null);
                }).on('readable', function () {
                    while ((chunkedData = stream.read()) !== null) {
                        accumulatedData.push(chunkedData)
                    }
                }).on('end', function () {
                    dataBuffer = Buffer.concat(accumulatedData);
                    resultJSON = JSON.parse(dataBuffer);
                    if (toSort) {
                        sortJSON(resultJSON['data'], sort, function () {
                            var startIndex, endIndex, total, responseJSON
                            total = resultJSON['total'];
                            startIndex = (chunk - 1) * chunkSize;
                            endIndex = (total < (startIndex + chunkSize)) ? total : (startIndex + chunkSize);
                            responseJSON = resultJSON['data'].slice(startIndex, endIndex);
                            commonUtils.handleJSONResponse(null, res, {data: responseJSON, total: total, queryJSON: resultJSON['queryJSON']});
                            saveQueryResult2Redis(resultJSON['data'], total, queryId, chunkSize, sort, resultJSON['queryJSON']);
                        });
                    } else {
                        commonUtils.handleJSONResponse(null, res, resultJSON);
                    }
                });
            } else {
                commonUtils.handleJSONResponse(null, res, {data: [], total: 0});
            }
        });
    } else {
        redisClient.get(queryId + ":chunk" + chunk, function (error, result) {
            var resultJSON = result ? JSON.parse(result) : {data: [], total: 0};
            if (error) {
                logutils.logger.error(error.stack);
                commonUtils.handleJSONResponse(error, res, null);
            } else if (toSort) {
                sortJSON(resultJSON['data'], sort, function () {
                    var startIndex, endIndex, total, responseJSON
                    total = resultJSON['total'];
                    startIndex = (chunk - 1) * chunkSize;
                    endIndex = (total < (startIndex + chunkSize)) ? total : (startIndex + chunkSize);
                    responseJSON = resultJSON['data'].slice(startIndex, endIndex);
                    commonUtils.handleJSONResponse(null, res, {data: responseJSON, total: total, queryJSON: resultJSON['queryJSON']});
                    saveQueryResult2Redis(resultJSON['data'], total, queryId, chunkSize, sort, resultJSON['queryJSON']);
                });
            } else {
                commonUtils.handleJSONResponse(null, res, resultJSON);
            }
        });
    }
};

function exportQueryResult(req, res) {
    var queryId = req.query['queryId'];
    redisClient.exists(queryId, function (err, exists) {
        if (exists) {
            var stream = redisReadStream(redisClient, queryId)
            res.writeHead(global.HTTP_STATUS_RESP_OK, {'Content-Type': 'application/json'});
            stream.on('error', function (err) {
                logutils.logger.error(err.stack);
                var errorJSON = {error: err.message};
                res.write(JSON.stringify(errorJSON));
                res.end();
            }).on('readable', function () {
                var data;
                while ((data = stream.read()) !== null) {
                    res.write(data);
                }
            }).on('end', function () {
                res.end();
            });
        } else {
            commonUtils.handleJSONResponse(null, res, {data: [], total: 0});
        }
    });
};

function quickSortPartition(array, left, right, sort) {
    var sortField = sort[0]['field'],
        sortDir = sort[0]['dir'] == 'desc' ? 0 : 1,
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
        process.nextTick(function () {
            quickSort(array, left, p, sort, qsStatus);
        });
        qsStatus.started++;
        process.nextTick(function () {
            quickSort(array, p + 1, right, sort, qsStatus)
        });
    }
    qsStatus.ended++
}

function sortJSON(resultArray, sortParams, callback) {
    var qsStatus = {started: 1, ended: 0},
        sortField = sortParams[0]['field'], sortBy = [{}];
    sortField = sortField.replace(/([\"\[\]])/g, '');
    sortBy[0]['field'] = sortField;
    sortBy[0]['dir'] = sortParams[0]['dir'];
    quickSort(resultArray, 0, resultArray.length, sortBy, qsStatus);
    qsStatus['intervalId'] = setInterval(function (qsStatus, callback) {
        if (qsStatus.started == qsStatus.ended) {
            callback();
            clearInterval(qsStatus['intervalId']);
        }
    }, 2000, qsStatus, callback);
};

function parseOpsQueryIdFromUrl(url) {
    var opsQueryId = "", urlArray;

    if (url != null) {
        urlArray = url.split('/');
        opsQueryId = urlArray[urlArray.length - 1];
    }

    return opsQueryId;
};

function stopFetchQueryResult(queryOptions) {
    clearInterval(queryOptions['intervalId']);
    queryOptions['status'] = 'timeout';
    updateQueryStatus(queryOptions);
};

function updateQueryStatus(queryOptions) {
    var queryStatus = {
        startTime: queryOptions.startTime, queryJSON: queryOptions.queryJSON, progress: queryOptions.progress, status: queryOptions.status,
        tableName: queryOptions.queryJSON['table'], count: queryOptions.count, timeTaken: -1, errorMessage: queryOptions.errorMessage,
        queryReqObj: queryOptions.queryReqObj, opsQueryId: queryOptions.opsQueryId
    };

    if (queryOptions.progress == 100) {
        queryStatus.timeTaken = (queryOptions.endTime - queryStatus.startTime) / 1000;
    }

    redisClient.hmset(queryOptions.queryQueue, queryOptions.queryId, JSON.stringify(queryStatus));
};

function processQueryResults(res, queryResults, queryOptions) {
    var startDate = new Date(), startTime = startDate.getTime(),
        queryId = queryOptions.queryId, chunkSize = queryOptions.chunkSize,
        queryJSON = queryOptions.queryJSON, endDate = new Date(),
        table = queryJSON.table, tableType = queryOptions.tableType,
        endTime, total, responseJSON, resultJSON;

    endTime = endDate.getTime();
    resultJSON = (queryResults && !isEmptyObject(queryResults)) ? queryResults.value : [];
    logutils.logger.debug("Query results (" + resultJSON.length + " records) received from opserver at " + endDate + ' in ' + ((endTime - startTime) / 1000) + 'secs. ' + JSON.stringify(queryJSON));
    total = resultJSON.length;

    if (queryOptions.status == 'run') {
        if (queryId == null || total <= chunkSize) {
            responseJSON = resultJSON;
            chunkSize = total;
        } else {
            responseJSON = resultJSON.slice(0, chunkSize);
        }
        commonUtils.handleJSONResponse(null, res, {data: responseJSON, total: total, queryJSON: queryJSON, chunk: 1, chunkSize: chunkSize, serverSideChunking: true});
    }

    saveQueryResult2Redis(resultJSON, total, queryId, chunkSize, getSortStatus4Query(queryJSON), queryJSON);

    if (table == 'FlowSeriesTable') {
        saveData4Chart2Redis(queryId, resultJSON, queryJSON['select_fields'], 'flow_class_id', "T");
    } else if (tableType = "STAT") {
        saveData4Chart2Redis(queryId, resultJSON, queryJSON['select_fields'], 'CLASS(T=)', "T=");
    }
};

function saveQueryResult2Redis(resultData, total, queryId, chunkSize, sort, queryJSON) {
    var endRow;
    if (sort != null) {
        redisClient.set(queryId + ":sortStatus", JSON.stringify(sort));
    }
    // TODO: Should we need to save every chunk?
    redisClient.set(queryId, JSON.stringify({data: resultData, total: total, queryJSON: queryJSON}));
    if (total == 0) {
        redisClient.set(queryId + ':chunk1', JSON.stringify({data: [], total: 0, queryJSON: queryJSON}));
    } else {
        for (var j = 0, k = 1; j < total; k++) {
            endRow = k * chunkSize;
            if (endRow > resultData.length) {
                endRow = resultData.length;
            }
            var spliceData = resultData.slice(j, endRow);
            redisClient.set(queryId + ':chunk' + k, JSON.stringify({data: spliceData, total: total, queryJSON: queryJSON, chunk: k, chunkSize: chunkSize, serverSideChunking: true}));
            j = endRow;
        }
    }
};

function getSortStatus4Query(queryJSON) {
    var sortFields, sortDirection, sortStatus;
    sortFields = queryJSON['sort_fields'];
    sortDirection = queryJSON['sort'];

    if (sortFields != null && sortFields.length > 0 && sortDirection != null) {
        sortStatus = [{"field": sortFields[0], "dir": sortDirection == 2 ? 'desc' : 'asc'}];
    }
    return sortStatus;
};

function saveData4Chart2Redis(queryId, dataJSON, selectFields, groupFieldName, timeFieldName) {
    var resultData = {}, uniqueChartGroupArray = [], charGroupArray = [],
        result, i, k, chartGroupId, chartGroup, secTime;

    if (selectFields.length != 0) {
        for (i = 0; i < dataJSON.length; i++) {
            chartGroupId = dataJSON[i][groupFieldName];

            if (uniqueChartGroupArray.indexOf(chartGroupId) == -1) {
                chartGroup = getGroupRecord4Chart(dataJSON[i], groupFieldName);
                uniqueChartGroupArray.push(chartGroupId);
                charGroupArray.push(chartGroup);
            }

            secTime = Math.floor(dataJSON[i][timeFieldName] / 1000);
            result = {'date': new Date(secTime)};
            result[groupFieldName] = chartGroupId;

            for (k = 0; k < selectFields.length; k++) {
                result[selectFields[k]] = dataJSON[i][selectFields[k]];
            }

            if (resultData[chartGroupId] == null) {
                resultData[chartGroupId] = {};
                resultData[chartGroupId][secTime] = result;
            } else {
                resultData[chartGroupId][secTime] = result;
            }
        }
    }

    redisClient.set(queryId + ':chartgroups', JSON.stringify(charGroupArray));
    redisClient.set(queryId + ':chartdata', JSON.stringify(resultData));
};

function getGroupRecord4Chart(row, groupFieldName) {
    var groupRecord = {chart_group_id: row[groupFieldName]};

    for (var fieldName in row) {
        if(!isAggregateField(fieldName)) {
            groupRecord[fieldName] = row[fieldName];
        }
    }

    return groupRecord;
};

function setMicroTimeRange(query, fromTime, toTime) {
    if (true == isNaN(fromTime)) {
        query.start_time = fromTime;
    } else {
        query.start_time = fromTime * 1000;
    }
    if (true == isNaN(toTime)) {
        query.end_time = toTime;
    } else {
        query.end_time = toTime * 1000;
    }
};

function getQueryJSON4Table(queryReqObj) {
    var formModelAttrs = queryReqObj['formModelAttrs'],
        tableName = formModelAttrs['table_name'], tableType = formModelAttrs['table_type'],
        queryJSON = {
            "table" : tableName,
            "start_time": "",
            "end_time": "",
            "select_fields": [],
            // "filter" is a array of arrays ie. AND clauses inside just one OR clause
            "filter": [[]]
        };

    var fromTimeUTC = formModelAttrs['from_time_utc'], toTimeUTC = formModelAttrs['to_time_utc'],
        select = formModelAttrs['select'], where = formModelAttrs['where'], filters = formModelAttrs['filters'],
        autoSort = queryReqObj['autoSort'], direction = formModelAttrs['direction'];

    autoSort = (autoSort != null && (autoSort == "true" || autoSort)) ? true : false;

    if (tableType == 'LOG') {
        queryJSON = _.extend({}, queryJSON, {
            "select_fields": ["Type", "Level"],
            "filter": [[{"name": "Type", "value": "1", "op": 1}], [{"name": "Type", "value": "10", "op": 1}]]
        });
        autoSort = (select.indexOf('MessageTS') == -1) ? false : autoSort;

        if (autoSort) {
            queryJSON['sort_fields'] = ['MessageTS'];
            queryJSON['sort'] = 2;
        }

        if(formModelAttrs['log_level'] != null && formModelAttrs['log_level'] != "") {
            for(var i = 0; i < queryJSON.filter.length; i++) {
                queryJSON.filter[i].push({"name": "Level", "value": formModelAttrs['log_level'], "op": 5})
            }
        }
    } else if (tableName == 'FlowSeriesTable') {
        autoSort = (select.indexOf('T=') == -1 && select.indexOf('T') == -1) ? false : autoSort;
        queryJSON = _.extend({}, queryJSON, {"select_fields": ['flow_class_id', 'direction_ing']});

        if (autoSort) {
            if(select.indexOf('T=') != -1) {
                queryJSON['select_fields'].push('T');
            }
            queryJSON['sort_fields'] = ['T'];
            queryJSON['sort'] = 2;
        }

    } else if (tableName == 'FlowRecordTable') {
        queryJSON = _.extend({}, queryJSON, {"select_fields": ['direction_ing']});

    } else if (tableType == "OBJECT") {
        autoSort = (select.indexOf('MessageTS') == -1) ? false : autoSort;

        if (autoSort) {
            queryJSON['sort_fields'] = ['MessageTS'];
            queryJSON['sort'] = 2;
        }

    } else if (tableType == "STAT") {
        queryJSON = _.extend({}, queryJSON, {
            "where": [[{"name": "name", "value": "", "op": 7}]],
        });
    };

    setMicroTimeRange(queryJSON, fromTimeUTC, toTimeUTC);
    parseSelect(queryJSON, formModelAttrs);
    parseWhere(queryJSON, where);

    if (tableName == 'MessageTable' && formModelAttrs['keywords'] != null && formModelAttrs['keywords'] != "") {
        parseSLWhere(queryJSON, where, formModelAttrs['keywords'])
    }

    if(filters != null && filters != "") {
        parseFilters(queryJSON, filters);
    }

    if (direction != "" && parseInt(direction) >= 0) {
        queryJSON['dir'] = parseInt(direction);
    }

    if(queryJSON['limit'] == null) {
        queryJSON['limit'] = getDefaultQueryLimit(tableType);
    }

    return queryJSON;
};

function getDefaultQueryLimit(tableType) {
    var limit = (tableType == "OBJECT" || tableType == "LOG") ? 50000 : 150000;

    return limit;
};

function parseSelect(query, formModelAttrs) {
    var select = formModelAttrs['select'],
        tgValue = formModelAttrs['time_granularity'],
        tgUnit = formModelAttrs['time_granularity_unit'],
        queryPrefix = formModelAttrs['query_prefix'],
        selectArray = splitString2Array(select, ','),
        classTEqualToIndex = selectArray.indexOf('T=');


    if (classTEqualToIndex != -1) {
        selectArray[classTEqualToIndex] = 'T=' + getTGSecs(tgValue, tgUnit);
    }

    query['select_fields'] = query['select_fields'].concat(selectArray);

    // CLASS(T=) should be added to the select fields only if user has selected T= for stat queries
    if (classTEqualToIndex > -1 && queryPrefix == 'stat') {
        query['select_fields'] = query['select_fields'].concat('CLASS(T=)');
    }
};

function parseSLWhere (query, where, keywords) {
    var keywordsArray = keywords.split(','), keywordAndClause = [];
    if (keywords != null && keywords.trim() != '') {
        for (var i = 0; i < keywordsArray.length; i++){
            keywordsArray[i] = keywordsArray[i].trim();
        }
        keywordAndClause = parseKeywordsObj(keywordsArray);
    }
    if (where != null && where.trim() != '') {
        // where clause is not empty case
        var whereORArray = where.split(' OR '),
            whereORLength = whereORArray.length, i,
            newWhereOR, newWhereORArray = [], where = [];
        for (i = 0; i < whereORLength; i += 1) {
            whereORArray[i] = whereORArray[i].trim();
            newWhereOR = whereORArray[i].substr(0, whereORArray[i].length - 1);
            where[i] = parseWhereANDClause(newWhereOR);
            // append keyword array to individual where OR clause
            where[i] = where[i].concat(keywordAndClause);
        }
        query['where'] = where;
    } else{
        // where clause is empty but keywords are non empty case
        if (keywords != null && keywords.trim() != '') {
            var where = [];
            where.push(keywordAndClause);
            query['where'] = where;
        }
    }
}

function getKeywordsStrFromArray (keywords) {
    var tempStr = "";
    for (var i = 1; i < keywords.length; i++) {
        tempStr = tempStr.concat("AND Keyword = " + keywords[i] + " ");
    }
    var final = ("Keyword = " + keywords[0] + " ").concat(tempStr);
    return final;
}

function parseKeywordsObj(keywordsArray)
{
    var keywordObj = [], keywordArray = [];
    for(var i=0; i<keywordsArray.length; i++){
        keywordObj[i] = {"name":"", value:"", op:""};
        keywordObj[i].name = "Keyword";
        var keywordStrLen = keywordsArray[i].length;
        //check if the keyword has a star in the end: if yes change op to 7 and delete trailing star; else let it be 1
        if(keywordsArray[i].charAt(keywordStrLen - 1) === '*'){
            keywordObj[i].value = keywordsArray[i].slice(0, -1);
            keywordObj[i].op = 7;
        } else {
            keywordObj[i].value = keywordsArray[i];
            keywordObj[i].op = 1;
        }
        keywordArray.push(keywordObj[i]);
    }
    return keywordArray;
};

function parseWhere(query, where) {
    if (where != null && where.trim() != '') {
        var whereORArray = where.split(' OR '),
            whereORLength = whereORArray.length,
            i;
        for (i = 0; i < whereORLength; i += 1) {
            whereORArray[i] = whereORArray[i].trim();
            whereORArray[i] = parseWhereANDClause(whereORArray[i]);
        }
        query['where'] = whereORArray;
    }
};

function parseFilters(query, filters) {
    var filtersArray = splitString2Array(filters, "&"),
        filter, filterBy, limitBy, sortFields, sortOrder;

    for (var i = 0; i < filtersArray.length; i++) {
        filter = filtersArray[i];

        if(filter.indexOf('filter:') != -1) {
            filterBy = splitString2Array(filter, "filter:")[1];

            if(filterBy.length > 0) {
                parseFilterBy(query, filterBy);
            }

        } else if (filter.indexOf('limit:') != -1) {
            limitBy = splitString2Array(filter, "limit:")[1];

            if(limitBy.length > 0) {
                parseLimitBy(query, limitBy);
            }
        } else if (filter.indexOf('sort_fields:') != -1){
            sortFields = splitString2Array(filter, "sort_fields:")[1];

            if(sortFields.length > 0) {
                parseSortFields(query, sortFields);
            }
        } else if (filter.indexOf('sort:') != -1){
            sortOrder = splitString2Array(filter, "sort:")[1];

            if(sortOrder.length > 0) {
                parseSortOrder(query, sortOrder);
            }
        }
    }
};

function parseFilterBy(query, filterBy) {
    var filtersArray, filtersLength, filterClause = [], i, filterObj;
    if (filterBy != null && filterBy.trim() != '') {
        filtersArray = filterBy.split(' AND ');
        filtersLength = filtersArray.length;
        for (i = 0; i < filtersLength; i += 1) {
            filtersArray[i] = filtersArray[i].trim();
            filterObj = getFilterObj(filtersArray[i]);
            filterClause.push(filterObj);
        }
        // Loop through the default filters and add the UI submitted ones to each
        for(var j = 0; j < query['filter'].length; j++) {
            var filterArr = query['filter'][j];
            filterArr = filterArr.concat(filterClause);
            query['filter'][j] = filterArr;
        }
    }
};

function parseFilterObj(filter, operator) {
    var filterObj, filterArray;
    filterArray = splitString2Array(filter, operator);
    if (filterArray.length > 1 && filterArray[1] != '') {
        filterObj = {"name": "", value: "", op: ""};
        filterObj.name = filterArray[0];
        filterObj.value = filterArray[1];
        filterObj.op = getOperatorCode(operator);
    }
    return filterObj
};

function parseLimitBy(query, limitBy) {
    try {
        var parsedLimit = parseInt(limitBy);
        query['limit'] = parsedLimit;
    } catch (error) {
        logutils.logger.error(error.stack);
    }
};

function parseSortOrder(query, sortOrder) {
    try {
        query['sort'] = sortOrder;
    } catch (error) {
        logutils.logger.error(error.stack);
    }
};

function parseSortFields(query, sortFields) {
    try {
        query['sort_fields'] = sortFields.split(',');
    } catch (error) {
        logutils.logger.error(error.stack);
    }
};

function parseWhereANDClause(whereANDClause) {
    var whereANDArray = whereANDClause.replace('(', '').replace(')', '').split(' AND '),
        whereANDLength = whereANDArray.length, i, whereANDClause, whereANDClauseArray, operator = '',
        whereANDClauseWithSuffixArrray, whereANDTerm;

    for (i = 0; i < whereANDLength; i += 1) {
        whereANDArray[i] = whereANDArray[i].trim();
        whereANDClause = whereANDArray[i];
        if (whereANDClause.indexOf('&') == -1) {
            if (whereANDClause.indexOf('Starts with') != -1) {
                operator = 'Starts with';
                whereANDClauseArray = whereANDClause.split(operator);
            } else if (whereANDClause.indexOf('=') != -1) {
                operator = '=';
                whereANDClauseArray = whereANDClause.split(operator);
            }
            whereANDClause = {"name": "", value: "", op: ""};
            populateWhereANDClause(whereANDClause, whereANDClauseArray[0].trim(), whereANDClauseArray[1].trim(), operator);
            whereANDArray[i] = whereANDClause;
        } else {
            whereANDClauseWithSuffixArrray = whereANDClause.split('&');
            // Treat whereANDClauseWithSuffixArrray[0] as a normal AND term and
            // whereANDClauseWithSuffixArrray[1] as a special suffix term
            if (whereANDClauseWithSuffixArrray != null && whereANDClauseWithSuffixArrray.length != 0) {
                var tempWhereANDClauseWithSuffix;
                for (var j = 0; j < whereANDClauseWithSuffixArrray.length; j++) {
                    if (whereANDClauseWithSuffixArrray[j].indexOf('Starts with') != -1) {
                        operator = 'Starts with';
                        whereANDTerm = whereANDClauseWithSuffixArrray[j].split(operator);
                    } else if (whereANDClauseWithSuffixArrray[j].indexOf('=') != -1) {
                        operator = '=';
                        whereANDTerm = whereANDClauseWithSuffixArrray[j].split(operator);
                    }
                    whereANDClause = {"name": "", value: "", op: ""};
                    populateWhereANDClause(whereANDClause, whereANDTerm[0].trim(), whereANDTerm[1].trim(), operator);
                    if (j == 0) {
                        tempWhereANDClauseWithSuffix = whereANDClause;
                    } else if (j == 1) {
                        tempWhereANDClauseWithSuffix.suffix = whereANDClause;
                    }
                }
                whereANDArray[i] = tempWhereANDClauseWithSuffix;
            }
        }
    }
    return whereANDArray;
};

function populateWhereANDClause(whereANDClause, fieldName, fieldValue, operator) {
    var validLikeOPRFields = global.VALID_LIKE_OPR_FIELDS,
        validRangeOPRFields = global.VALID_RANGE_OPR_FIELDS,
        splitFieldValues;
    whereANDClause.name = fieldName;
    if (validLikeOPRFields.indexOf(fieldName) != -1 && fieldValue.indexOf('*') != -1) {
        whereANDClause.value = fieldValue.replace('*', '');
        whereANDClause.op = 7;
    } else if (validRangeOPRFields.indexOf(fieldName) != -1 && fieldValue.indexOf('-') != -1) {
        splitFieldValues = splitString2Array(fieldValue, '-');
        whereANDClause.value = splitFieldValues[0];
        whereANDClause['value2'] = splitFieldValues[1];
        whereANDClause.op = 3;
    } else {
        whereANDClause.value = fieldValue;
        whereANDClause.op = getOperatorCode(operator);
    }
};

function splitString2Array(strValue, delimiter) {
    var strArray = strValue.split(delimiter),
        count = strArray.length;
    for (var i = 0; i < count; i++) {
        strArray[i] = strArray[i].trim();
    }
    return strArray;
};

function getTGSecs(tg, tgUnit) {
    if (tgUnit == 'secs') {
        return tg;
    } else if (tgUnit == 'mins') {
        return tg * 60;
    } else if (tgUnit == 'hrs') {
        return tg * 3600;
    } else if (tgUnit == 'days') {
        return tg * 86400;
    }
};

function getFilterObj(filter) {
    var filterObj;
    // order of if's is important here
    // '=' should be last one to be checked else '!=', '>=', '<='
    // will be matched as '='
    if (filter.indexOf('!=') != -1) {
        filterObj = parseFilterObj(filter, '!=');
    } else if (filter.indexOf(" RegEx= ") != -1) {
        filterObj = parseFilterObj(filter, 'RegEx=');
    }  else if (filter.indexOf("<=") != -1) {
        filterObj = parseFilterObj(filter, '<=');
    } else if (filter.indexOf(">=") != -1) {
        filterObj = parseFilterObj(filter, '>=');
    } else if (filter.indexOf("=") != -1) {
        filterObj = parseFilterObj(filter, '=');
    }
    return filterObj;
};

function getOperatorCode(operator) {
    if (operator == '=') {
        return 1;
    } else if (operator == '!=') {
        return 2;
    } else if (operator == '<=') {
        return 5;
    } else if (operator == '>=') {
        return 6;
    } else if (operator == 'RegEx=') {
        return 8;
    } else if ((operator == 'Starts with') || (operator == '*')) {
        return 7;
    } else {
        return -1
    }
};

function isEmptyObject(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }
    return true;
};

function isAggregateField(fieldName) {
    var fieldNameLower = fieldName.toLowerCase(),
        isAggregate = false;

    var AGGREGATE_PREFIX_ARRAY = ['min(', 'max(', 'count(', 'sum('];

    for (var i = 0; i < AGGREGATE_PREFIX_ARRAY.length; i++) {
        if(fieldNameLower.indexOf(AGGREGATE_PREFIX_ARRAY[i]) != -1) {
            isAggregate = true;
            break;
        }
    }

    return isAggregate;
};

exports.runGETQuery = runGETQuery;
exports.runPOSTQuery = runPOSTQuery;
exports.getTables = getTables;
exports.getTableColumnValues = getTableColumnValues;
exports.getTableSchema = getTableSchema;
exports.getQueryQueue = getQueryQueue;
exports.getChartGroups = getChartGroups;
exports.getChartData = getChartData;
exports.deleteQueryCache4Ids = deleteQueryCache4Ids;
exports.deleteQueryCache4Queue = deleteQueryCache4Queue;
exports.flushQueryCache = flushQueryCache;
exports.exportQueryResult = exportQueryResult;
exports.getQueryJSON4Table = getQueryJSON4Table;
exports.getCurrentTime = getCurrentTime;
