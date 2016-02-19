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
            'service_interface_type': 'other',
            'interfaceTypesData': []
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
                'service_interface_type': function (val, attr, obj) {
                    if ((null == val) || ("" == val)) {
                        return 'Interface type is required';
                    }
                    var errStr = 'Interface types can be either management, left, ' +
                           'right or otherX';
                    var arrSplit = val.split('other');
                    var len = arrSplit.length;
                    if (len > 2) {
                        return errStr;
                    }
                    if (2 == len) {
                        if (("" == arrSplit[1]) || (isNaN(arrSplit[1]))) {
                            return errStr;
                        }
                        return;
                    }
                    if (('left' != val) && ('right' != val) &&
                        ('management' != val)) {
                        return errStr;
                    }
                }
            }
        }
    });
    return svcTemplateInterfaceModel;
});
