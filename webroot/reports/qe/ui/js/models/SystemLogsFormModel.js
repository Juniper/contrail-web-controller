/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockout',
    'query-form-model'
], function (_, Knockout, QueryFormModel) {
    var SystemLogsFormModel = QueryFormModel.extend({

        defaultSelectFields: ["Type"],

        disableSelectFields: ['SequenceNum', 'Context', 'Keyword'],

        disableWhereFields: ['Level'],

        constructor: function (modelData, queryReqConfig) {
            var defaultConfig = qewmc.getQueryModelConfig({table_name: cowc.MESSAGE_TABLE, table_type: cowc.QE_LOG_TABLE_TYPE, query_prefix: cowc.SYSTEM_LOGS_PREFIX, keywords: "",
                                                           log_level: "5", limit: cowc.QE_DEFAULT_LIMIT_50K, select: cowc.DEFAULT_SL_SELECT_FIELDS});

            modelData = $.extend(true, {}, defaultConfig, modelData);
            QueryFormModel.prototype.constructor.call(this, modelData, $.extend(true, queryReqConfig, {chunkSize: cowc.QE_RESULT_CHUNK_SIZE_10K}));

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
            }
        }
    });

    return SystemLogsFormModel;
});
