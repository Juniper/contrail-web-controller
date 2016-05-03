/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var dhcpOptionModel = ContrailModel.extend({

        defaultConfig: {
            'dhcp_option_name': '',
            'dhcp_option_value': '',
            'dhcp_option_value_bytes': ''
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
            dhcpValidations: {
                'dhcp_option_name': {
                    required: true,
                    msg: 'Enter DHCP Code.'
                }
            }
        }
    });
    return dhcpOptionModel;
});
