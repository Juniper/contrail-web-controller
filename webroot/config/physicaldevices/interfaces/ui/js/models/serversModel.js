/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var serversModel = ContrailModel.extend({

        defaultConfig: {
            'index' : '',
            'virtual-machine-interface' : {
                'uuid' : '',
                'virtual_machine_interface_mac_addresses' : {
                    'mac_address' : []
                },
                'instance_ip_back_refs' : [],
                'virtual_network_refs' : []
            },
            'user_created_mac_address' : null,
            'user_created_instance_ip_address' : null,
            "isVMICreate" : false,
            "dataSource" : [],
            "disable" : false
        },
        formatModelConfig: function (modelConfig) {
            var vmi = modelConfig['virtual-machine-interface'];
            var mac = vmi['virtual_machine_interface_mac_addresses']['mac_address'][0];
            var ip;
            if(vmi['instance_ip_back_refs'].length > 0) {
                var ipBackRefs = vmi['instance_ip_back_refs'][0];
                ip = ipBackRefs['instance-ip']['instance_ip_address'];
                if(ip != null && ip != '-' && ip != ''){
                    mac = mac + ' (' + ip + ')';
                }              
            }
            modelConfig['user_created_mac_address'] = mac != null ? mac : '';
            if(modelConfig['user_created_instance_ip_address'] != '') {
                modelConfig['user_created_instance_ip_address'] =
                    ip != null ? ip : ' ';
            }    
            return modelConfig;            
        },
        validateAttr: function (attributePath, validation, data) {
            var model = data.model().attributes.model(),
                attr = cowu.getAttributeFromPath(attributePath),
                errors = model.get(cowc.KEY_MODEL_ERRORS),
                attrErrorObj = {}, isValid;

            isValid = model.isValid(attributePath, validation);

            attrErrorObj[attr + cowc.ERROR_SUFFIX_ID] = (isValid == true) ?
                false : isValid;
            errors.set(attrErrorObj);
        },

        validations: {
            serverValidation : {
                user_created_mac_address : function(value, attr, finalObj){
                    if(!isValidMACAddress(value)) {
                        return 'Enter a valid MAC Address ' + value;
                    }
                },
                user_created_instance_ip_address : function(value, attr, finalObj){
                    if(value != '') {
                        if(!finalObj.disable && !isValidIP(value)) {
                            return 'Invalid IP ' + value;
                        }
                    }
                }                
            }
        }
    });

    return serversModel;
});

