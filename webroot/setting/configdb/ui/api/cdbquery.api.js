/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var fs = require('fs')

var cdbqueryapi = module.exports,
    commonUtils = require(process.mainModule.exports.corePath + "/src/serverroot/utils/common.utils"),
    configUtils = require(process.mainModule.exports.corePath +
            "/src/serverroot/common/config.utils"),
    config =  configUtils.getConfig(),
    editEnabled = config.cassandra.enable_edit,
    logutils = require(process.mainModule.exports.corePath + "/src/serverroot/utils/log.utils"),
    cassandra = require("cassandra-driver");

var hosts = getCassandraHostList(config.cassandra.server_ips, config.cassandra.server_port),
    cUsername = config.cassandra.username,
    cPassword = config.cassandra.password,
    cClient;

var cass_options = { contactPoints: hosts, keyspace: "config_db_uuid" };
if (cUsername && cPassword) {
    var cAuthProvider = new cassandra.auth.PlainTextAuthProvider(cUsername, cPassword);
    cass_options.authProvider = cAuthProvider;
}
if (config.cassandra.use_ssl) {
    cass_options.sslOptions = { rejectUnauthorized: false };
    if ('ca_certs' in config.cassandra && config.cassandra.ca_certs) {
        cass_options.sslOptions.ca = [ fs.readFileSync(config.cassandra.ca_certs) ];
    }
}
cClient = new cassandra.Client(cass_options);

cClient.on("error", function (err) {
    logutils.logger.error(err.stack);
});

cdbqueryapi.listKeys4Table = function (req, res) {
    var table = req.param("table"),
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
        value = req.param("value");
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
        key = req.param("key");

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
