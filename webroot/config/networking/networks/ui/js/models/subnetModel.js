/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var subnetModel = ContrailModel.extend({

        defaultConfig: {
            'subnet': {
                'ip_prefix': null,
                'ip_prefix_len': null,
            },
            'user_created_cidr': null, //fake ui
            'dns_server_address': null,
            'addr_from_start': true,
            'enable_dhcp': true,
            'default_gateway': null,
            'allocation_pools': [], // {'start': null, 'end': null}
            'subnet_name': null,
            'subnet_uuid': null,
            'dhcp_option_list': {
                'dhcp_option': [],
            },
            'user_created_enable_dns': true, //fake ui
            'user_created_enable_gateway': true, //fake ui
            'user_created_ipam_fqn': null, //fake ui
            'disable': false
        },


        validateAttr: function (attributePath, validation, data) {
            var model = data.model().attributes.model(),
                attr = cowu.getAttributeFromPath(attributePath),
                errors = model.get(cowc.KEY_MODEL_ERRORS),
                attrErrorObj = {}, isValid;

            isValid = model.isValid(attributePath, validation);

            attrErrorObj[attr + cowc.ERROR_SUFFIX_ID] = (isValid == true) ? false : isValid;
            errors.set(attrErrorObj);
        },

        validations: {
            subnetModelConfigValidations: {
                'user_created_cidr':
                function (value, attr, finalObj) {
                    if ((value && value.indexOf('/') == -1) || value && !isValidIP(value) ||
                            !value || !value.length) {
                        return "Enter valid IPv4 or IPv6 Subnet/Mask";
                    }
                },
                'default_gateway':
                function (value, attr, finalObj) {
                    if (value && value.indexOf('/') != -1 || value && !isValidIP(value)
                            || !value || !value.length) {
                        return "Enter valid IPv4 or IPv6 Gateway";
                    }
                },
                'dns_server_address':
                 function (value, attr, finalObj){
                    if(value && !isValidIP(value)){
                        return "Enter the valid IP address";
                    }
                },
                'user_created_ipam_fqn' : {
                    required: true,
                    msg: 'Select IPAM',
                },
                'allocation_pools' :
                    function (value, attr, finalObj) {
                    msg = 'e.g. 192.168.2.3-192.168.2.10 <enter>... and IPs should be from CIDR';
                    err = [];
                    var cidr = finalObj.user_created_cidr,
                        gateway = finalObj.default_gateway;
                    if (value && value.length) {
                        var allocPools = value.split('\n');
                        $.each(allocPools, function (idx, allocPool) {
                            if (!allocPool.length) {
                                return;
                            }

                            var allocRange = allocPool.split('-');

                            if (allocRange.length != 2) {
                                err.push(msg);
                            } else {
                                var start = allocRange[0].trim(),
                                    end = allocRange[1].trim();
                                if (!isValidIP(start) ||
                                    !isValidIP(end)) {
                                    err.push('Enter valid IP Addresses');
                                } else if ((start.indexOf('/') != -1) ||
                                            (end.indexOf('/') != -1)) {
                                    err.push('Enter valid IP Addresses without prefix');
                                }
                                if (cidr && !(isIPBoundToRange(cidr, start) == true &&
                                     isIPBoundToRange(cidr, end) == true)) {
                                    err.push('Enter IP Addresses within range ' + cidr);
                                }
                                if (gateway && isIPBoundToIPRange(start, end, gateway) === 0) {
                                    err.push('IP Address conflicts with gateway');
                                }
                            }
                        });
                    }
                    if (err.length) {
                        return err[0];
                    }
                },
            }
        }
    });
    return subnetModel;
});
