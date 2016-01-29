/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
], function (_, ContrailModel, StaticRTModel) {
    var RtPolicyModel = ContrailModel.extend({

        defaultConfig: {
            routing_policy: null,
            interface_type: null,
            rtPolicyInterfaceTypesData: []
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
            rtPolicysValidation: {
                interface_type: {
                    required: true
                },
                routing_policy: {
                    required: true
                }
            }
        }
    });

    return RtPolicyModel;
});

