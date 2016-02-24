/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var allowAddressPairModel = ContrailModel.extend({

        defaultConfig: {
            'ip': {'ip_prefix':'',
                  'ip_prefix_len':''},
            'user_created_ip': '',
            'mac':'',
            'address_mode': '',
            'interface_type': null,
            'interfaceTypesData': []
        },
        formatModelConfig: function (config) {
            var ipprefix = getValueByJsonPath(config, 'ip;ip_prefix', null);
            var ipprefixLen = getValueByJsonPath(config,
                              'ip;ip_prefix_len', null);
             if(ipprefix != null && ipprefixLen != null &&
                ipprefix != '' && ipprefixLen != '') {
                config['user_created_ip'] = ipprefix + "/" + ipprefixLen;
            }
            return config;
        },
        validateAttr: function (attributePath, validation, data) {
            var model = data.model().attributes.model(),
                attr = cowu.getAttributeFromPath(attributePath),
                errors = model.get(cowc.KEY_MODEL_ERRORS),
                attrErrorObj = {}, isValid;

            isValid = model.isValid(attributePath, validation);

            attrErrorObj[attr + cowc.ERROR_SUFFIX_ID] =
                        (isValid == true) ? false : isValid;
            errors.set(attrErrorObj);
        },

        validations: {
            allowedAddressPairValidations: {
                'user_created_ip': function(value, attr, finalObj) {
                    if(value.trim() == ""){
                        return "Enter Valid IP Address";
                    }
                    if (!isValidIP(value.trim())) {
                        return "Enter valid IP Address";
                    }
                },
                'mac': function(value, attr, finalObj) {
                    if(value != "" &&
                       isValidMACAddress(value) == false){
                        return "Enter valid MAC Address";
                    }
                }
            }
        }
    });
    return allowAddressPairModel;
});
