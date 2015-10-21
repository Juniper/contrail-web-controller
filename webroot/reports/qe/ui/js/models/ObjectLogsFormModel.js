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

        constructor: function (modelData) {
            var defaultConfig = qewmc.getQueryModelConfig({table_type: cowc.QE_OBJECT_TABLE_TYPE, query_prefix: cowc.OBJECT_LOGS_PREFIX});

            modelData = $.extend(true, {}, defaultConfig, modelData);
            QueryFormModel.prototype.constructor.call(this, modelData);

            return this;
        },

        validations: {}
    });

    return ObjectLogsFormModel;
});
