/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "contrail-model"
], function (_, ContrailModel) {
    var ConfigDatabaseModel = ContrailModel.extend({

        deleteRecord: function (checkedRow, callbackObj, type) {
            var ajaxConfig = {}, url;

            if (type === ctwc.DELETE_KEY_TYPE) {
                url = "/api/query/cassandra/key/" + checkedRow.table + "/" + checkedRow.key;
            } else if (type === ctwc.DELETE_KEY_VALUE_TYPE) {
                url = "/api/query/cassandra/value/" + checkedRow.table + "/" + checkedRow.key + "/" + checkedRow.keyvalue;
            }

            ajaxConfig.type = "DELETE";
            ajaxConfig.url = url;

            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function () {
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
            }, function (error) {
                console.log(error);
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
            });
        },
        validations : {}
    });
    return ConfigDatabaseModel;
});
