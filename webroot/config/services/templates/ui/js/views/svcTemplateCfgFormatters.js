/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 *
 */

define([
    'underscore'
], function (_) {
    var svcTemplateCfgFormatters = function() {
        var self = this;

        /*
         * @serviceModeFormatter
         */
        this.serviceModeFormatter = function(d, c, v, cd, dc) {
            var  serviceMode =
                getValueByJsonPath(dc,
                'service_template_properties;service_mode', '-');

             return capitalize(serviceMode);
        };

        /*
         * displayNameFormatter
         */
        this.displayNameFormatter = function(d, c, v, cd, dc) {
            var dispStr = getValueByJsonPath(dc, 'display_name',
                                             null);
            if (null == dispStr) {
                dispStr =
                    getValueByJsonPath(dc, 'fq_name', []);
                if (dispStr.length > 0) {
                    dispStr = dispStr[1];
                }
            }
            if (null == dispStr) {
                return "";
            }
            return dispStr;
        };

        /*
         * @serviceTypeFormatter
         */
        this.serviceTypeFormatter = function(d, c, v, cd, dc) {
            var  serviceType =
                getValueByJsonPath(dc,
                'service_template_properties;service_type', '-');

            var version =
                getValueByJsonPath(dc,
                                   'service_template_properties;version', 1);
            return (capitalize(serviceType) + ' / v' + version);
        };

        /*
         * @serviceScalingFormatter
         */
        this.serviceScalingFormatter = function(d, c, v, cd, dc) {
            var  serviceScaling =
                getValueByJsonPath(dc,
                'service_template_properties;service_scaling', false);

             return serviceScaling ? 'Enabled' : 'Disabled';
        };

        /*
         * @serviceZoneFormatter
         */
        this.serviceZoneFormatter = function(d, c, v, cd, dc) {
            var  serviceZone =
                getValueByJsonPath(dc,
                'service_template_properties;availability_zone_enable', false);

             return serviceZone ? 'Enabled' : 'Disabled';
        };
        /*
         * @imageNameFormatter
         */
        this.imageNameFormatter = function(d, c, v, cd, dc) {
            var  imageName =
                getValueByJsonPath(dc,
                'service_template_properties;image_name', '-');

             return imageName;
        };


        /*
         * @flavorFormatter
         */
        this.flavorFormatter = function(d, c, v, cd, dc) {
            var  flavor =
                getValueByJsonPath(dc,
                'service_template_properties;flavor', '-');

             return flavor;
        };


        /*
         * @imageFlavorFormatter
         */
        this.imageFlavorFormatter = function(d, c, v, cd, dc) {
            var  flavor =
                getValueByJsonPath(dc,
                'service_template_properties;flavor', '-');

            var  imageName =
                getValueByJsonPath(dc,
                'service_template_properties;image_name', '-');

            return  imageName + ' / ' + flavor;

        };

        /*
         * @servicePropertyFormatter
         */
        this.servicePropertyFormatter = function(d, c, v, cd, dc) {
            var  serviceMode =
                capitalize(getValueByJsonPath(dc,
                'service_template_properties;service_mode', '-'));

            var  serviceType =
                capitalize(getValueByJsonPath(dc,
                'service_template_properties;service_type', '-'));


            var  serviceScaling =
                getValueByJsonPath(dc,
                'service_template_properties;service_scaling', false) ?
                'Enabled' : 'Disabled';

            return  '<b>Mode:</b> ' + serviceMode +
                    ', <br><b>Type:</b> ' + serviceType +
                    ', <br><b>Scaling:</b> ' + serviceScaling;

        };

        /*
         * @interfaceFormatter
         */
        this.interfaceFormatter = function(d, c, v, cd, dc) {
            var  ifList =
                getValueByJsonPath(dc,
                'service_template_properties;interface_type', []);
            var count = ifList.length;
            var ifaces = [];

            for (var i = 0; i < count; i++ ) {
                ifaces.push(capitalize(
                    getValueByJsonPath(ifList[i],
                        'service_interface_type', '-')));

            }

             return ifaces.length ? ifaces.join(", "): "-";
        };

        /*
         * @ifTypeDetailsFormatter
         */
        this.ifTypeDetailsFormatter = function(d, c, v, cd, dc) {
            var  ifList =
                getValueByJsonPath(dc,
                'service_template_properties;interface_type', []);
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

        /*
         * @svcInstancesFormatter
         */
        this.svcInstancesFormatter = function(d, c, v, cd, dc) {

            var  svcInstList =
                getValueByJsonPath(dc, 'service_instance_back_refs', []);

            var svcInstNameList = [];

            $.each(svcInstList, function (i, obj) {
                svcInstNameList.push(obj['to'][1] + ':' + obj['to'][2]);
            });

            return svcInstNameList.length ? svcInstNameList.join(", ") : '';
        };

        /*
         * @svcVirtTypeFormatter
         */
        this.svcVirtTypeFormatter = function(d, c, v, cd, dc) {
            var svcVirtType =
                getValueByJsonPath(dc,
                                   'service_template_properties;service_virtualization_type',
                                   null);
            if (null == svcVirtType) {
                return '-';
            }
            switch(svcVirtType) {
            case 'virtual-machine':
                return 'Virtual Machine';
            case 'physical-device':
                return 'Physical Device';
            case 'network-namespace':
                return 'Network Namespace';
            case 'vrouter-instance':
                return 'vRouter Instance';
            default:
                return svcVirtType;
            }
        }

        /*
         * @svcApplSetFormatter
         */
        this.svcApplSetFormatter = function(d, c, v, cd, dc) {
            var svcApplSet = dc['service_appliance_set'];
            if (null != svcApplSet) {
                return svcApplSet.split(':')[1];
            }
        }

        /*
         * @imageDropDownFormatter
         */
        this.imageDropDownFormatter = function(response, model) {
            var imagesResponse = getValueByJsonPath(response,
                    'images', []);
            var imageList = [];

            $.each(imagesResponse, function (i, obj) {
                imageList.push({id: obj.name, text: obj.name});
            });
            model['user_created_image_list'](imageList);
            return imageList;
        };

        /*
         * @serviceApplianceSetDropDownFormatter
         */
        this.svcApplSetDropDownFormatter = function(response) {
            var sasResponse = getValueByJsonPath(response,
                    'data', []);
            var sasList = [];

            $.each(sasResponse, function (i, obj) {
                if ((null != obj) && (null != obj['service-appliance-set']) &&
                    (null != obj['service-appliance-set'].fq_name)) {
                    sasList.push({id: obj['service-appliance-set'].fq_name.join(':'),
                                  text: obj['service-appliance-set'].name});
                }
            });

            return sasList;
        };

        /*
         * @flavorDropDownFormatter
         */
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
                    model['service_template_properties']().flavor = obj.name;
                }

                flavorList.push({id: obj.name, text: flavorTxt});
            });

            return flavorList;
        };


    }
    return svcTemplateCfgFormatters;
});
