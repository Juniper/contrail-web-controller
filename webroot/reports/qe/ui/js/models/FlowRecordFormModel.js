/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockout',
    'query-form-model',
    'core-basedir/js/common/qe.model.config'
], function (_, Knockout, QueryFormModel,qewmc) {
    var FormRecordFormModel = QueryFormModel.extend({

        defaultSelectFields: ['direction_ing'],

        constructor: function (modelData, queryReqConfig) {
            var defaultConfig = qewmc.getQueryModelConfig({ table_name: cowc.FLOW_RECORD_TABLE, table_type: cowc.QE_FLOW_TABLE_TYPE, query_prefix: cowc.FR_QUERY_PREFIX,
                                                            select: cowc.DEFAULT_FR_SELECT_FIELDS });

            modelData = $.extend(true, {}, defaultConfig, modelData);
            QueryFormModel.prototype.constructor.call(this, modelData, queryReqConfig);

            return this;
        }
    });

    return FormRecordFormModel;
});
