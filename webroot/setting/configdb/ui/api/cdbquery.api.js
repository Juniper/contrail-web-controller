/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var cdbqueryapi = module.exports,
    commonUtils = require(process.mainModule.exports.corePath + "/src/serverroot/utils/common.utils"),
    configUtils = require(process.mainModule.exports.corePath +
            "/src/serverroot/common/config.utils"),
    editEnabled,
    logutils = require(process.mainModule.exports.corePath + "/src/serverroot/utils/log.utils"),
    cassandra = require("cassandra-driver");

function getCassandraClient ()
{
    var config = configUtils.getConfig(),
        hosts = getCassandraHostList(config.cassandra.server_ips,
                config.cassandra.server_port),
        cClient = new cassandra.Client({ contactPoints: hosts,
            keyspace: "config_db_uuid"});
    cClient.on("error", function (err) {
        logutils.logger.error(err.stack);
    });
    editEnabled = config.cassandra.enable_edit;
    return cClient;
}

cdbqueryapi.listKeys4Table = function (req, res) {
    var table = req.param("table"),
        cClient = getCassandraClient(),
        responseJSON = {"table": table, "keys": [], "editEnabled": editEnabled};
    cClient.execute("SELECT DISTINCT key FROM " + table, [], function (err, results) {
        console.log(err);
        if (err) {
            logutils.logger.error(err.stack);
            commonUtils.handleJSONResponse(err, res, null);
        } else {
            results.rows.forEach(function (row) {
                responseJSON.keys.push({"table": table, "key": (row.key).toString()});
            });
            commonUtils.handleJSONResponse(null, res, responseJSON);
        }
    });
};

cdbqueryapi.listValues4Key = function (req, res) {
    var key = req.param("key"),
        table = req.param("table"),
        cClient = getCassandraClient(),
        responseJSON = {"editEnabled": editEnabled, "keyvalues": []};

    cClient.execute("SELECT * FROM " + table + " WHERE key = asciiAsBlob('" + key + "')", [], function (err, results) {
        if (err) {
            logutils.logger.error(err.stack);
            commonUtils.handleJSONResponse(err, res, null);
        } else {
            results.rows.forEach(function (row) {
                responseJSON.keyvalues.push({"key": key, "table": table, "keyvalue": (row.column1).toString()});
            });
            commonUtils.handleJSONResponse(null, res, responseJSON);
        }
    });
};

cdbqueryapi.deleteValue4Key = function (req, res) {
    var key = req.param("key"),
        table = req.param("table"),
        value = req.param("value"),
        cClient = getCassandraClient ();
    if (value && value === "") {
        value = null;
    }

    //TODO:
    cClient.execute("DELETE FROM " + table + " WHERE KEY = asciiAsBlob('" + key + "') AND COLUMN1 = asciiAsBlob('" + value + "')", [], function (err, results) {
        if (err) {
            logutils.logger.error(err.stack);
            commonUtils.handleJSONResponse(err, res, null);
        } else {
            commonUtils.handleJSONResponse(null, res, results);
        }
    });
};

cdbqueryapi.deleteKeyFromTable = function (req, res) {
    var table = req.param("table"),
        key = req.param("key"),
        cClient = getCassandraClient ();

    //TODO:
    cClient.execute("DELETE FROM " + table + " WHERE KEY = asciiAsBlob('" + key + "')", [], function (err, results) {
        if (err) {
            logutils.logger.error(err.stack);
            commonUtils.handleJSONResponse(err, res, null);
        } else {
            commonUtils.handleJSONResponse(null, res, results);
        }
    });
};

function getCassandraHostList(serverIPs, port) {
    var hosts = [];
    for (var i = 0; i < serverIPs.length; i++) {
        hosts.push(serverIPs[i] + ":" + port);
    }
    return hosts;
}
