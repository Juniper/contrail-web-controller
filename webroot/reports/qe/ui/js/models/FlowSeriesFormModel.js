/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockout',
    'query-form-model'
], function (_, Knockout, QueryFormModel) {
    var FormSeriesFormModel = QueryFormModel.extend({

        defaultSelectFields: ['flow_class_id', 'direction_ing'],

        constructor: function (modelData) {
            var defaultConfig = qewmc.getQueryModelConfig({table_name: cowc.FLOW_SERIES_TABLE, table_type: cowc.QE_FLOW_TABLE_TYPE, query_prefix: qewc.FS_QUERY_PREFIX});

            modelData = $.extend(true, {}, defaultConfig, modelData);
            QueryFormModel.prototype.constructor.call(this, modelData);

            return this;
        },

        validations: {}
    });

    return FormSeriesFormModel;
});
