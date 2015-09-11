/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var secGrpRulesModel = ContrailModel.extend({
        defaultConfig: {
            'direction': '>',
            'ethertype': 'IPv4',
            'protocol': 'ANY',
            'portrange': '0 - 65535',
            'remoteAddr': ""
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
            secGrpRulesConfigValidations: {
            }
        }
    });
    return secGrpRulesModel;
});


