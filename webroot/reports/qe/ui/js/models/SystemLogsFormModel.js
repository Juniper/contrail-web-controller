/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockout',
    'query-form-model'
], function (_, Knockout, QueryFormModel) {
    var SystemLogsFormModel = QueryFormModel.extend({

        defaultSelectFields: [],

        disableSelectFields: ['Type', 'SequenceNum', 'Context', 'Keyword'],

        constructor: function (modelData) {
            var defaultConfig = qewmc.getQueryModelConfig({table_name: cowc.MESSAGE_TABLE, table_type: cowc.QE_LOG_TABLE_TYPE, query_prefix: cowc.SYSTEM_LOGS_PREFIX});

            modelData = $.extend(true, {}, defaultConfig, modelData);
            QueryFormModel.prototype.constructor.call(this, modelData);

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

    return SystemLogsFormModel;
});
