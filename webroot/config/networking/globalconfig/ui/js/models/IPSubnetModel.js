/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var IPSubnetModel = ContrailModel.extend({

        defaultConfig: {
            "ip_fabric_subnets" : {
                'subnet': []
            }
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
            ipFabricSubnetsValidation: {
                'ip_fabric_subnets': function(val, attr, obj) {
                    console.log("Getting val as:", val);
                },
                'ipFabricSubnets': function(val, attr, obj) {
                    console.log("Getting val 1as:", val);
                }
            }
        }
    });

    return IPSubnetModel;
});

