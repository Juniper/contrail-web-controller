/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var VRouterNetworksFormModel = ContrailModel.extend({
        defaultConfig: {
            'vn_name': '',
        },

        validations: {
        },
        //Build the object to be sent in the req.
        getQueryParams : function () {
            var queryParams = {};
            var modelAttrs = this.model().attributes;
            if (modelAttrs.vn_name != '')
                queryParams['vnNameFilter'] = modelAttrs.vn_name;
            return queryParams;
        },

        reset: function (data, event) {
            this.vn_name('');
        },
    });
    return VRouterNetworksFormModel;
});

