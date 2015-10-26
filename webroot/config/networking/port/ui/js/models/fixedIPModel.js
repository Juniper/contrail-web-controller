/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var fixedIPModel = ContrailModel.extend({

        defaultConfig: {
            'fixedIp': null,
            'subnet_uuid':'',
            'subnetDataSource' : [],
            'uuid':''
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
            fixedIPValidations: {
                'fixedIp': {
                    required: true,
                    msg: 'Enter Subnet IP address'
                }
            }
        }
    });
    return fixedIPModel;
});
