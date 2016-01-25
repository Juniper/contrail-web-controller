/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var SvcApplInterfaceModel = ContrailModel.extend({

        defaultConfig: {
            interface_type: "",
            interface_name: ""
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
            svcApplInterfaceValidation: {
                'interface_type': {
                    required: true
                },
                'interface_name': function(val, attr, fieldObj) {
                    if ((null == val) || (!val.trim().length)) {
                        return 'Interface is required';
                    }
                }
            }
        }
    });

    return SvcApplInterfaceModel;
});

