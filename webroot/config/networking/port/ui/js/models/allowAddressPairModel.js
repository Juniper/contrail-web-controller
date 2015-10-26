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
            'ipPrefixVal': '',
            'mac':''
        },
        formatModelConfig: function (config) {
            var ipprefix = getValueByJsonPath(config, 'ip;ip_prefix', null);
            var ipprefixLen = getValueByJsonPath(config,
                              'ip;ip_prefix_len', null);
            if(ipprefix != null && ipprefixLen != null) {
                config['ipPrefixVal'] = ipprefix + "/" + ipprefixLen;
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
        }/*,


        validations: {
            fixedIPValidations: {
                'fixedIp': {
                    required: true,
                    msg: 'Enter Subnet IP address'
                }
            }
        }*/
    });
    return allowAddressPairModel;
});
