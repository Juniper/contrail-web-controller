/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var IpFabricAddressModel = ContrailModel.extend({

        defaultConfig: {
            "ip_fabric_service_ip" : ""
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
            fabAddressValidation: {
                'ip_fabric_service_ip': function(value, attr, obj) {
                    if ('IP' == $("#lls_fab_address_ip_dropdown").val()) {
                        if (value.trim() === "") {
                            return "Fabric Service IP is required"
                        }
                        var ip = value.trim();
                        if (-1 != ip.indexOf('/')) {
                            return 'Enter valid IP address in ' +
                                'xxx.xxx.xxx.xxx format';
                        }
                        if (!isValidIP(ip)) {
                            return 'Enter valid IP address in ' +
                                'xxx.xxx.xxx.xxx format';
                        }
                    }
                }
            }
        }
    });

    return IpFabricAddressModel;
});

