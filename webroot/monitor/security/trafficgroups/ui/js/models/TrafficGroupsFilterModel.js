/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var TrafficGroupsFilterModel = ContrailModel.extend({

        defaultConfig: {
            'endpoint' : null,
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
            filterRuleValidation: {
                endpoint: function(value, attr, finalObj) {
                    var isValid = true;
                    if(value) {
                        _.each(cowc.TRAFFIC_GROUP_TAG_TYPES, function(tag) {
                            if((value.match(
                                new RegExp(cowc.DROPDOWN_VALUE_SEPARATOR +
                                tag.value, "g")) || []).length > 1) {
                                isValid = false;
                                return false;
                            }
                        });
                    }
                    if(!isValid) {
                        return "Please select only one tag from each Tag type";
                    }
                },
            }
        }
    });

    return TrafficGroupsFilterModel;
});
