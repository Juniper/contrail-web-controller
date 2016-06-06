/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var rbacRolesModel = ContrailModel.extend({

        defaultConfig: {
            "role_crud": "C,R,U,D",
            "role_name": null
        },

        validateAttr: function (attributePath, validation, data) {
            var model = data.model().attributes.model(),
                attr = cowu.getAttributeFromPath(attributePath),
                errors = model.get(cowc.KEY_MODEL_ERRORS),
                attrErrorObj = {}, isValid;

            isValid = model.isValid(attributePath, validation);

            attrErrorObj[attr + cowc.ERROR_SUFFIX_ID] = (isValid == true) ?
                false : isValid;
            errors.set(attrErrorObj);
        },

        validations: {
            rbacRulePermsValidations: {
                role_name : {
                    required : true,
                    msg : "Role is required"
                },
                role_crud : {
                    required : true,
                    msg : "Access is required"
                }
            }
        }
    });

    return rbacRolesModel;
});
