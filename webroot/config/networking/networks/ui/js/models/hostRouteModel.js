/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var hostRouteModel = ContrailModel.extend({

        defaultConfig: {
            'prefix': null,
            'next_hop': null,
            'next_hop_type': null
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
            hostRouteModelConfigValidations: {
                'prefix':
                    function (value, attr, finalObj) {
                    if (!((value && value.indexOf('/') != -1) && isValidIP(value))) {
                        return 'Enter Prefix in form xxx.xxx.xxx.xxx/xx';
                    }
                },
                'next_hop':
                    function (value, attr, finalObj) {
                    if ((value && value.indexOf('/') != -1) || !isValidIP(value)) {
                        return 'Enter Next Hop in form xxx.xxx.xxx.xxx';
                    }
                },
            }
        }
    });
    return hostRouteModel;
});
