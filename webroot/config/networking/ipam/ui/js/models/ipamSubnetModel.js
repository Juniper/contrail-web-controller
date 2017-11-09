/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/networking/ipam/ui/js/models/ipamCfgAllocAttrsModel'
], function (_, ContrailModel,IpamAllocAttrsModel) {
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
        formatModelConfig: function(modelConfig){
            var allocfamilyAttrs = getValueByJsonPath(modelConfig,
                    "allocation_pools", []);
                var allocfamilyAttrArray = [];
                if(allocfamilyAttrs.length > 0) {
                    for(var i = 0; i < allocfamilyAttrs.length; i++) {
                        var allocfamilyAttr =  new IpamAllocAttrsModel({
                                               start: allocfamilyAttrs[i].start,
                                               end: allocfamilyAttrs[i].end,
                                               vrouter_specific_pool :
                                                   allocfamilyAttrs[i].vrouter_specific_pool,
                                              disableAllocationPoolAttr:true
                                           });
                        allocfamilyAttrArray.push(allocfamilyAttr);
                    }
                }
                modelConfig["allocation_pools"] = new Backbone.Collection(allocfamilyAttrArray);
                return modelConfig;
        },
        addAllocAttrs: function(root, index) {
            var allocAttrs = root.model().attributes.user_created_ipam_subnets.toJSON()[index()].
                model().attributes.allocation_pools;
            var newFamilyAttr;
            newAllocAttr = new IpamAllocAttrsModel(
                {
                    start: null,
                    end: null,
                    vrouter_specific_pool:true
                }
            );
            allocAttrs.add([newAllocAttr]);
        },
        deleteAllocAttrs: function(data, kbInterface) {
            data.model().collection.remove(kbInterface.model())
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
                'user_created_ipam_fqn' : {
                    required: true,
                    msg: 'Select IPAM',
                }
            }
        }
    });
    return subnetModel;
});
