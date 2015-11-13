/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var FlowAgingTimeoutModel = ContrailModel.extend({

        defaultConfig: {
            protocol: 'icmp',
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
            flowAgingTuplesValidation: {
                'port': {
                    required: false,
                    pattern: 'number'
                },
                'timeout_in_seconds': {
                    required: false,
                    pattern: 'number'
                }
            }
        }
    });

    return FlowAgingTimeoutModel;
});

