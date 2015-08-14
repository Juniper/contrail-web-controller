/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var cdbqueryapi = module.exports,
    commonUtils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/common.utils'),
    config = process.mainModule.exports["config"],
    editEnabled = config.cassandra.enable_edit,
    logutils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/log.utils');

var helenus = require('helenus'),
    hosts = getCassandraHostList(config.cassandra.server_ips, config.cassandra.server_port),
    defaultConPool = new helenus.ConnectionPool({
        hosts: hosts,
        keyspace: 'config_db_uuid',
        timeout: 5000
    }),
    cql3ConPool = new helenus.ConnectionPool({
        hosts: hosts,
        keyspace: 'config_db_uuid',
        timeout: 5000,
        cqlVersion : '3.0.0'
    });;

defaultConPool.on('error', function (err) {
    logutils.logger.error(err.stack);
});

cql3ConPool.on('error', function (err) {
    logutils.logger.error(err.stack);
});

cdbqueryapi.listKeys4Table = function (req, res) {
    var table = req.param('table'),
        responseJSON = {"table":table, "keys":[], "editEnabled":editEnabled};
    defaultConPool.connect(function (err, keyspace) {
        if (err) {
            logutils.logger.error(err.stack);
            commonUtils.handleJSONResponse(err, res, null);
        } else {
            defaultConPool.cql("SELECT key FROM " + table, [], function (err, results) {
                if (err) {
                    logutils.logger.error(err.stack);
                    commonUtils.handleJSONResponse(err, res, null);
                } else {
                    results.forEach(function (row) {
                        responseJSON.keys.push({"table":table, "key":(row.get('key').value).toString()});
                    });
                    commonUtils.handleJSONResponse(null, res, responseJSON);
                }
            });

        }
    });
};

cdbqueryapi.listValues4Key = function (req, res) {
    var key = req.param("key"),
        table = req.param("table"),
        responseJSON = {"editEnabled": editEnabled, "keyvalues": []};
    cql3ConPool.connect(function (err, keyspace) {
        if (err) {
            logutils.logger.error(err.stack);
            commonUtils.handleJSONResponse(err, res, null);
        } else {
            cql3ConPool.cql("SELECT * FROM " + table + " WHERE key = ?", [convertString2Hex(key)], function (err, results) {
                if (err) {
                    logutils.logger.error(err.stack);
                    commonUtils.handleJSONResponse(err, res, null);
                } else {
                    results.forEach(function (row) {
                        responseJSON.keyvalues.push({"key": key, "table": table, "keyvalue": (row.get('column1').value).toString()});
                    });
                    commonUtils.handleJSONResponse(null, res, responseJSON);
                }
            });
        }
    });
};

cdbqueryapi.deleteValue4Key = function (req, res) {
    var key = req.param("key"),
        table = req.param("table"),
        value = req.param("value");
    if (value && value == "") {
        value = null;
    }
    defaultConPool.connect(function (err, keyspace) {
        if (err) {
            logutils.logger.error(err.stack);
            commonUtils.handleJSONResponse(err, res, null);
        } else {
            keyspace.get(table, function (err, cf) {
                if (err) {
                    logutils.logger.error(err.stack);
                    commonUtils.handleJSONResponse(err, res, null);
                } else {
                    cf.remove(key, value, null, {consistency: helenus.ConsistencyLevel.ONE}, function (err) {
                        if (err) {
                            commonUtils.handleJSONResponse(err, res, null);
                        } else {
                            commonUtils.handleJSONResponse(null, res, {"success": 1});
                        }
                    });
                }
            });
        }
    });
};

cdbqueryapi.deleteKeyFromTable = function (req, res) {
    var table = req.param('table'),
        key = req.param('key'),
        hexKey = new Buffer(key).toString('hex');
    defaultConPool.connect(function (err, keyspace) {
        if (err) {
            logutils.logger.error(err.stack);
            commonUtils.handleJSONResponse(err, res, null);
        } else {
            defaultConPool.cql("DELETE FROM " + table + " WHERE KEY = ?", [hexKey], function (err, results) {
                if (err) {
                    logutils.logger.error(err.stack);
                    commonUtils.handleJSONResponse(err, res, null);
                } else {
                    commonUtils.handleJSONResponse(null, res, results);
                }
            });
        }
    });
};

function convertString2Hex(strName) {
    var hexResult = "", hex, i;

    for (i = 0; i < strName.length; ++i) {
        hex = strName.charCodeAt(i).toString(16);
        hexResult += (hex);
    }

    return hexResult;
};

function getCassandraHostList(serverIPs, port) {
    var hosts = [];
    for (var i = 0; i < serverIPs.length; i++) {
        hosts.push(serverIPs[i] + ":" + port);
    }
    return hosts;
};
