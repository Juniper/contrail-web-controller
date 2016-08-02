/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var ControlNodeRoutesModel = ContrailModel.extend({
        defaultConfig: {
            'routing_instance': 'All',
            'address_family': 'All',
            'routes_limit': '50',
            'peer_source': 'All',
            'prefix': '',
            'protocol': 'All',
            'prefixOptionList':[],
            'routingInstanceOptionList':[]
        },

        validations: {
            controlNodeRoutesValidations: {}
        },
        //Build the object to be sent in the req.
        getControlRoutesQueryString : function () {
            var routeQueryString = {};
            var modelAttrs = this.model().attributes;
            if (modelAttrs.routing_instance != 'All')
                routeQueryString['routingInst'] = modelAttrs.routing_instance;
            if (modelAttrs.address_family != 'All') {
              routeQueryString['addrFamily'] = modelAttrs.address_family;
            } else
              routeQueryString['addrFamily'] = '';
            if (modelAttrs.peer_source != 'All')
                routeQueryString['peerSource'] = modelAttrs.peer_source;
            if (modelAttrs.protocol != 'All')
                routeQueryString['protocol'] = modelAttrs.protocol;
            if (modelAttrs.prefix != '')
                routeQueryString['prefix'] = modelAttrs.prefix;
            if (modelAttrs.routes_limit != 'All')
                routeQueryString['limit'] = modelAttrs.routes_limit;
            return routeQueryString;
        },

        reset: function (data, event) {
            this.routing_instance('All');
            this.address_family('All');
            this.routes_limit('50');
            this.peer_source('All');
            this.prefix('');
            this.protocol("All");
        },
    });
    return ControlNodeRoutesModel;
});

