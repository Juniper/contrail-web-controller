/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var rtAggregateRoutesModel = ContrailModel.extend({

        defaultConfig: {
            'route' : null,
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
            rtAggregateRoutesValidation: {
                route: function(value, attr, finalObj) {
                    var route = getValueByJsonPath(finalObj, "route", ""),
                        routeArry = route.split("/");
                    if(routeArry.length !== 2 || (!isIPv4(routeArry[0]) &&
                            !isIPv6(routeArry[0]))) {
                        return "Enter valid IPv4 or IPv6 Prefix";
                    }
                }
            }
        }
    });

    return rtAggregateRoutesModel;
});
