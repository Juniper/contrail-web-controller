/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var subnetDNSModel = ContrailModel.extend({

        defaultConfig: {
            'ip_address': null,
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
            subnetDNSModelConfigValidations: {
                'ip_address':
                function (value, attr, finalObj) {
                    msg = 'Enter DNS Server IP address(es)';
                    err = [];
                    if (value && value.length) {
                        var dnsServers = value.split(' ');
                        $.each(dnsServers, function (idx, dnsServer) {
                            if (dnsServer.indexOf('/') != -1 || !isValidIP(dnsServer)) {
                                err.push(dnsServer);
                            }
                        });
                        if (err.length) {
                            return msg;
                        }
                    } else {
                        return msg;
                    }
                }
            }
        }
    });
    return subnetDNSModel;
});
