/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
], function (_, ContrailModel, StaticRTModel) {
    var IntfRtTableModel = ContrailModel.extend({

        defaultConfig: {
            interface_route_table: null,
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
            intfRtTablesValidation: {
                interface_type: {
                    required: true
                },
                interface_route_table: {
                    required: true
                }
            }
        }
    });

    return IntfRtTableModel;
});

