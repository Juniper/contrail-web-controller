/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var fatFlowModel = ContrailModel.extend({

        defaultConfig: {
            'protocol': 'tcp',
            'port':'',
            'ignore_address':'none'
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
            fatFlowValidations: {
                'protocol': {
                    required: true,
                    msg: 'Select a protocol.'
                },
                'port': function(value, attr, finalObj) {
                    if(finalObj.protocol != "icmp") {
                        value = String(value).trim();
                        if(value == "") {
                            return "Enter valid port between 0 to 65535 for Fat Flow Record";
                        }
                        if (!isNumber(value)) {
                            return "Fat Flow Protocol's Port has to be a number";
                        }
                        if (value % 1 != 0) {
                            return "Fat Flow Protocol's Port has to be a number";
                        }
                        if (Number(value) < 0 || Number(value) > 65535) {
                            return "Enter valid port between 0 to 65535 for Fat Flow Record";
                        }
                    } else {
                        if(value.trim() != "0") {
                            return "ICMP can have only 0";
                        }
                    }
                }
            }
        }
    });
    return fatFlowModel;
});