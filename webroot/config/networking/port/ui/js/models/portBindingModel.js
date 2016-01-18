/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var portBindingModel = ContrailModel.extend({

        defaultConfig: {
            'key': '',
            'value':'',
            'disablePortBindKey':false
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
            portBindingValidations: {
                'key': {
                    required: true,
                    msg: 'Select or enter a key.'
                },
                'value': {
                    required: true,
                    msg: 'Enter a value.'
                }
            }
        }
    });
    return portBindingModel;
});