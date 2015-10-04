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

        constructor: function (modelData) {
            var defaultConfig = qewmc.getQueryModel(null, qewc.STAT_QUERY_PREFIX);

            modelData = $.extend(true, {}, defaultConfig, modelData);
            QueryFormModel.prototype.constructor.call(this, modelData);

            return this;
        },

        validations: {}
    });

    return StatQueryFormModel;
});
