/*
 * Copyright (c) 2016
 * Juniper Networks, Inc. All rights reserved.
 */

define([
    "underscore",
    "knockout",
    "contrail-model"
], function (_, Knockout, ContrailModel) {
    var IntrospectSecondaryFormModel = ContrailModel.extend({

        constructor: function (modelData) {
            var defaultConfig = {};

            modelData = $.extend(true, {}, defaultConfig, modelData);
            ContrailModel.prototype.constructor.call(this, modelData);

            return this;
        },

    });

    return IntrospectSecondaryFormModel;
});
