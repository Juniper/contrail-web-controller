/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var FlowAgingTimeoutModel = ContrailModel.extend({

        defaultConfig: {
            protocol: null,
            port: 0,
            timeout_in_seconds: 180 /* 3 minutes */
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
            flowAgingTimeoutValidation: {
                'protocol' : function(value, attr, finalObj) {
                    if(value === null || value.trim() === '' ||
                        $.inArray(value, ['6 (TCP)','17 (UDP)','1 (ICMP)', 'tcp', 'udp', 'icmp']) === -1 &&
                        isNaN(value) || Number(value) < 0 || Number(value) > 255) {
                        return "Select a protocol or enter a code between 0 - 255";
                    }
                },
                'port': function(value, attr, finalObj) {
                     if(value && (isNaN(value) ||
                         Number(value) < 0 || Number(value) > 65535)) {
                         return "Enter a valid port between 0 - 65535";
                     }
                },
                'timeout_in_seconds': function(value, attr, finalObj) {
                    if(value && isNaN(value)) {
                        return "Timeout should be a number";
                    }
                }
            }
        }
    });

    return FlowAgingTimeoutModel;
});

