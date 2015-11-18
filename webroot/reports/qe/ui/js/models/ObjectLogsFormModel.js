/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockout',
    'query-form-model'
], function (_, Knockout, QueryFormModel) {
    var ObjectLogsFormModel = QueryFormModel.extend({

        defaultSelectFields: [],

        constructor: function (modelData, queryReqConfig) {
            var defaultConfig = qewmc.getQueryModelConfig({table_type: cowc.QE_OBJECT_TABLE_TYPE, query_prefix: cowc.OBJECT_LOGS_PREFIX, limit: cowc.QE_DEFAULT_LIMIT_50K});

            modelData = $.extend(true, {}, defaultConfig, modelData);
            QueryFormModel.prototype.constructor.call(this, modelData, $.extend(true, queryReqConfig, {chunkSize: cowc.QE_RESULT_CHUNK_SIZE_1K}));

            return this;
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

    return ObjectLogsFormModel;
});
