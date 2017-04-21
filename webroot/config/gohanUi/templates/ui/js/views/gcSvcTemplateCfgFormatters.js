/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 *
 */

define([
    'underscore'
], function (_) {
    var svcTemplateCfgFormatters = function() {
        var self = this;

        this.flavorDropDownFormatter = function(response, model) {
            var flavorsResponse = getValueByJsonPath(response,
                    'flavors', []);
            var flavorList = [];

            $.each(flavorsResponse, function (i, obj) {
                var flavorDesc = [], flavorTxt = '';
                var ram  = getValueByJsonPath(obj, 'ram', -1);
                var cpu  = getValueByJsonPath(obj, 'vcpus', -1);
                var disk = getValueByJsonPath(obj, 'disk', -1);
                var swap = getValueByJsonPath(obj, 'swap', '');

                flavorDesc.push('RAM: ' + ram);
                flavorDesc.push('CPU cores: ' + cpu);
                flavorDesc.push('Disk: ' + disk);
                if (swap.length) {
                    flavorDesc.push('Swap: ' + swap);
                } else {
                    flavorDesc.push('Swap: 0');
                }

                flavorTxt = obj.name + ' (' +
                                flavorDesc.join(", ") + ')';
                if (-1 != flavorTxt.indexOf('medium')) {
                    model.flavor(obj.name);
                }

                flavorList.push({id: obj.id, text: flavorTxt});
            });

            return flavorList;
        };

        this.imageDropDownFormatter = function(response, model) {
            var imagesResponse = getValueByJsonPath(response,
                    'images', []);
            var imageList = [];

            $.each(imagesResponse, function (i, obj) {
                imageList.push({id: obj.id, text: obj.name});
            });
            model['user_created_image_list'](imageList);
            return imageList;
        };

        this.interfaceFormatter = function(d, c, v, cd, dc) {
            var  ifList =
                getValueByJsonPath(dc,
                'interface_type', []);
            var count = ifList.length;
            var ifaces = [];

            for (var i = 0; i < count; i++ ) {
                ifaces.push(capitalize(
                    getValueByJsonPath(ifList[i],
                        'service_interface_type', '-')));

            }

             return ifaces.length ? ifaces.join(", "): "-";
        };

        this.imageFormatter = function(d, c, v, cd, dc) {
            var  imageName =
                getValueByJsonPath(dc,
                'image;name', '-');

            return  imageName;

        };
        
        this.flavorFormatter = function(d, c, v, cd, dc) {
            var  flavor =
                getValueByJsonPath(dc,
                'flavor;name', '-');

            return  flavor;

        };

        this.ifTypeDetailsFormatter = function(d, c, v, cd, dc) {
            var  ifList =
                getValueByJsonPath(dc,
                'interface_type', []);
            var count = ifList.length;
            var ifaces = [];

            for (var i = 0; i < count; i++ ) {
                var details = capitalize(getValueByJsonPath(ifList[i],
                                                'service_interface_type', '-'));
                var stRoutes = getValueByJsonPath(ifList[i],
                                                'static_route_enable', false);

                var sharedIP = getValueByJsonPath(ifList[i],
                                                'shared_ip', false);
                details += sharedIP || stRoutes ? ' (': '';
                details += sharedIP ? 'Shared IP' : '';
                details += sharedIP && stRoutes ? ', ' : '';
                details += stRoutes ? 'Static Route' : '';
                details += sharedIP || stRoutes ? ')': '';
                ifaces.push(details);

            }
           return ifaces.length ? ifaces.join("<br>"): "-";
        };

    }
    return svcTemplateCfgFormatters;
});
