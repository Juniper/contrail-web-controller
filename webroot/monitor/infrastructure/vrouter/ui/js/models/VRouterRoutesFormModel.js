/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var VRouterRoutesFormModel = ContrailModel.extend({
        defaultConfig: {
            'vrf_name': '',
            'route_type': 'ucast',
        },

        validations: {
        },
        //Build the object to be sent in the req.
        getQueryParams : function () {
            var queryParams = {};
            var modelAttrs = this.model().attributes;
            if (modelAttrs.vrf_name != '')
                queryParams['vrfindex'] = modelAttrs.vrf_name;
            return queryParams;
        },

        reset: function (data, event) {
            this.route_type('unicast');
        },
    });
    return VRouterRoutesFormModel;
});

