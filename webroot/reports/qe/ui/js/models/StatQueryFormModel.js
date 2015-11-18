/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockout',
    'query-form-model'
], function (_, Knockout, QueryFormModel) {
    var StatQueryFormModel = QueryFormModel.extend({

        defaultSelectFields: [],

        constructor: function (modelData, queryReqConfig) {
            var defaultConfig = qewmc.getQueryModelConfig({table_type: cowc.QE_STAT_TABLE_TYPE, query_prefix: cowc.STAT_QUERY_PREFIX});

            modelData = $.extend(true, {}, defaultConfig, modelData);
            QueryFormModel.prototype.constructor.call(this, modelData, queryReqConfig);

            return this;
        },

        isTableNameAvailable: function() {
            var tableName = this.table_name();

            return !(tableName === null || tableName === '');
        },

        validations: {
            runQueryValidation: {
                'table_name': {
                    required: true,
                    msg: ctwm.getRequiredMessage('table name')
                },
                'select': {
                    required: true,
                    msg: ctwm.getRequiredMessage('select')
                }
            },
        }
    });

    return StatQueryFormModel;
});
