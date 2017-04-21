/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 *
 */

define([
    'underscore'
], function (_) {
    var vnCfgFormatters = function() {
        var self = this;
        this.imageDropDownFormatter = function(response) {
            var imagesResponse = getValueByJsonPath(response,
                    'images', []);
            var imageList = [];

            $.each(imagesResponse, function (i, obj) {
                imageList.push({id: obj.id, text: obj.name});
            });
            return imageList;
        };

        this.networkDropDownFormatter = function(response){
            var networkResponse = getValueByJsonPath(response,
                    'networks', []);
            var networkList = [];

            $.each(networkResponse, function (i, obj) {
                networkList.push({id: obj.id, text: obj.name});
            });
            return networkList;
        };

        this.secGrpDropDownFormatter = function(response){
            var secGrpResponse = getValueByJsonPath(response,
                    'security_groups', []);
            var secGrpList = [];

            $.each(secGrpResponse, function (i, obj) {
                secGrpList.push({id: obj.id, text: obj.name});
            });
            return secGrpList;
        };

        this.flavorDropDownFormatter = function(response){
            var flavorResponse = getValueByJsonPath(response,
                    'flavors', []);
            var flavorList = [];

            $.each(flavorResponse, function (i, obj) {
                flavorList.push({id: obj.id, text: obj.name});
            });
            return flavorList;
        };
    }
    return vnCfgFormatters;
});
