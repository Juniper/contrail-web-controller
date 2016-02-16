/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var analyzerRulesModel = ContrailModel.extend({

        defaultConfig: {
            "protocol": "any",
            "src_network": "any",
            "src_port": null,
            "direction": "<>",
            "dst_network": "any",
            "dst_port": null
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
            ruleValidation: {
                'protocol' : function(val, attr, data) {
                    if (val == "") {
                        return "Select a valid Protocol.";
                    }
                },
            }
        }
    });

    return analyzerRulesModel;
});
