/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 *
 */

define([
    'underscore'
], function (_) {
    var vRouterCfgFormatters = function() {
        var self = this;

        /*
         * @pRouterFormatter
         */
        this.pRouterFormatter = function(d, c, v, cd, dc) {
            var  pRouterList =
                getValueByJsonPath(dc, 'physical_router_back_refs', []);

            var pRouterNameList = [];

            $.each(pRouterList, function (i, obj) {
                pRouterNameList.push(obj['to'][1]);
            });
             return pRouterNameList.length ? pRouterNameList.join(", ") : '';
        };

    }
    return vRouterCfgFormatters;
});
