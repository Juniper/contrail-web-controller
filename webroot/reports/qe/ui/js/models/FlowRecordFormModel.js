/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockout',
    'query-form-model'
], function (_, Knockout, QueryFormModel) {
    var FormRecordFormModel = QueryFormModel.extend({

        defaultSelectFields: ['direction_ing'],

        constructor: function (modelData, queryReqConfig) {
            var defaultConfig = qewmc.getQueryModelConfig({ table_name: cowc.FLOW_RECORD_TABLE, table_type: cowc.QE_FLOW_TABLE_TYPE, query_prefix: cowc.FR_QUERY_PREFIX,
                                                            select: cowc.DEFAULT_FR_SELECT_FIELDS });

            modelData = $.extend(true, {}, defaultConfig, modelData);
            QueryFormModel.prototype.constructor.call(this, modelData, queryReqConfig);

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

    return FormRecordFormModel;
});
