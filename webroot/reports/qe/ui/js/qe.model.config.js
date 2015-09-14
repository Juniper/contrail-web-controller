/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var QEDefaultConfig = function () {

        this.getQueryModel = function (tableName, queryPrefix) {
            var queryModelConfig = {
                "table_name": tableName,
                "query_prefix": contrail.checkIfExist(queryPrefix) ? queryPrefix : qewc.DEFAULT_QUERY_PREFIX,
                "time_range": 1800,
                "from_time": Date.now() - (10 * 60 * 1000),
                "to_time": Date.now(),
                "select": null,
                "time_granularity": 60,
                "time_granularity_unit": 'secs',
                "where": null,
                "direction": '1',
                "filter": null,
                "select_data_object": getSelectDataObject()
            };

            return $.extend(true, {}, queryModelConfig);
        };
    };

    function getSelectDataObject() {
        var selectDataObject = {};

        selectDataObject.fields = ko.observableArray([]);
        selectDataObject.enable_map = {};

        selectDataObject.select_all_text = ko.observable("Select All");
        selectDataObject.checked_fields = ko.observableArray([]);

        selectDataObject.on_select = function (data, event) {
            var fieldName = $(event.currentTarget).attr('name'),
                dataObject = data.select_data_object(),
                isEnableMap = dataObject.enable_map,
                key, nonAggKey;

            if (fieldName == 'T') {
                if (dataObject.checked_fields.indexOf('T') != -1) {
                    dataObject.checked_fields.remove('T=');
                    for (key in isEnableMap) {
                        if (key.indexOf('sum(') != -1 || key.indexOf('count(') != -1 || key.indexOf('min(') != -1 || key.indexOf('max(') != -1) {
                            dataObject.checked_fields.remove(key);
                            isEnableMap[key](false);
                            nonAggKey = key.substring(key.indexOf('(') + 1, key.indexOf(')'));
                            isEnableMap[nonAggKey](true);
                            dataObject.checked_fields.push(nonAggKey);
                        }
                    }
                } else {
                    for (key in isEnableMap) {
                        if (key.indexOf('sum(') != -1 || key.indexOf('count(') != -1 || key.indexOf('min(') != -1 || key.indexOf('max(') != -1) {
                            isEnableMap[key](true);
                        }
                    }
                }
            } else if (fieldName == 'T=') {
                if (dataObject.checked_fields.indexOf('T=') != -1) {
                    dataObject.checked_fields.remove('T');
                    for (key in isEnableMap) {
                        if (key.indexOf('sum(') != -1 || key.indexOf('count(') != -1 || key.indexOf('min(') != -1 || key.indexOf('max(') != -1) {
                            isEnableMap[key](true);
                            dataObject.checked_fields.push(key);
                            nonAggKey = key.substring(key.indexOf('(') + 1, key.indexOf(')'));
                            dataObject.checked_fields.remove(nonAggKey);
                            isEnableMap[nonAggKey](false);
                        }
                    }
                } else {
                    for (key in isEnableMap) {
                        if (key.indexOf('sum(') != -1 || key.indexOf('count(') != -1 || key.indexOf('min(') != -1 || key.indexOf('max(') != -1) {
                            dataObject.checked_fields.remove(key);
                            nonAggKey = key.substring(key.indexOf('(') + 1, key.indexOf(')'));
                            isEnableMap[nonAggKey](true);
                        }
                    }
                }
            }
            return true;
        };

        selectDataObject.on_select_all = function (data, event) {
            var dataObject = data.select_data_object(),
                selectAllText = dataObject.select_all_text(),
                isEnableMap = dataObject.enable_map,
                checkedFields = dataObject.checked_fields,
                key, nonAggKey;

            if (selectAllText == 'Select All') {
                dataObject.select_all_text('Clear All');

                for (key in isEnableMap) {
                    isEnableMap[key](true);
                    checkedFields.remove(key);
                }

                for (key in isEnableMap) {
                    if (key.indexOf('sum(') != -1 || key.indexOf('count(') != -1 || key.indexOf('min(') != -1 || key.indexOf('max(') != -1) {
                        checkedFields.push(key);
                        nonAggKey = key.substring(key.indexOf('(') + 1, key.indexOf(')'));
                        if(checkedFields.indexOf(nonAggKey) != -1) {
                            checkedFields.remove(nonAggKey);
                        }
                        isEnableMap[nonAggKey](false);
                    } else if (key != "T" && isEnableMap[key]) {
                        checkedFields.push(key);
                    }
                }
            } else {
                dataObject.select_all_text('Select All');
                for (key in isEnableMap) {
                    isEnableMap[key](true);
                    checkedFields.remove(key);
                }
            }
        };

        selectDataObject.reset = function(data, event) {
            var dataObject = data.select_data_object(),
                isEnableMap = dataObject.enable_map,
                checkedFields = dataObject.checked_fields;

            dataObject.select_all_text("Select All");

            for(var key in isEnableMap) {
                checkedFields.remove(key);
                isEnableMap[key](true);
            }
        };

        return selectDataObject;
    }

    return QEDefaultConfig;
});