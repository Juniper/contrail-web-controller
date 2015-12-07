/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var vRouterInterfacesFormModel = ContrailModel.extend({
        defaultConfig: {
            'mac': '',
            'network' :'',
            'name': '',
            'type': '',
            'ip_address':''
        },

        validations: {
        },
        //Build the object to be sent in the req.
        getQueryParams : function () {
            var queryParams = {};
            var modelAttrs = this.model().attributes;
            if (modelAttrs.mac != '')
                queryParams['mac'] = modelAttrs.mac;
            if (modelAttrs.network != '')
                queryParams['vn'] = modelAttrs.network;
            if (modelAttrs.name != '')
                queryParams['name'] = modelAttrs.name;
            if (modelAttrs.type != null) {
                if (modelAttrs.type == 'any') {
                    queryParams['type'] = '';
                } else {
                    queryParams['type'] = modelAttrs.type.trim();
                }
            }
            var ipFilter = modelAttrs.ip_address;
            if(isIPv4(ipFilter)) {
                queryParams['ipv4_address'] = ipFilter.trim();
            }
            if(isIPv6(ipFilter)) {
                queryParams['ipv6_address'] = ipFilter.trim();
            }
            return queryParams;
        },

        reset: function (data, event) {
            this.mac('');
            this.network('');
            this.type('any');
            this.name('');
            this.ip_address('');
        },
    });
    return vRouterInterfacesFormModel;
});

