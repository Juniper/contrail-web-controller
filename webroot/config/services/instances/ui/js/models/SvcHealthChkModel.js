/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
], function (_, ContrailModel, StaticRTModel) {
    var SvcHealthChkModel = ContrailModel.extend({

        defaultConfig: {
            service_health_check: null,
            interface_type: null,
            interfaceTypesData: []
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
            svcHealtchChecksValidation: {
                'service_health_check': function(val, attr, finalObj) {
                    if ((null == val) || (!val.trim().length)) {
                        return 'Service health check entry required';
                    }
                },
                'interface_type': function(val, attr, finalObj) {
                    if ((null == val) || (!val.trim().length)) {
                        return 'Interface type1 is rquired';
                    }
                }
            }
        }
    });

    return SvcHealthChkModel;
});

