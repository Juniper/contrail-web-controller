/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var svcTemplateInterfaceModel = ContrailModel.extend({

        defaultConfig: {
            'static_route_enable': false,
            'shared_ip': false,
            'service_interface_type': 'other'
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
            svcTemplateInterfaceConfigValidations: {
                'service_interface_type': {
                    required: true,
                    msg: 'Select Service Interface Type '
                }
            }
        }
    });
    return svcTemplateInterfaceModel;
});
