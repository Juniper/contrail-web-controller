/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var self;
    var forwardingClassPairModel = ContrailModel.extend({

        defaultConfig: {
            "dscp_key": null,
            "vlan_key": null,
            "mpls_key": null,
            "forwarding_class_id": null
        },

        formatModelConfig: function(modelConfig) {
            self = this;
            return modelConfig;
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

        isValidBits: function(arry, txt) {
            var i, arryCnt = arry.length, value = txt, isValid = true;
            for(i = 0; i < arryCnt; i++) {
                if(arry[i].text === txt){
                    value = arry[i].value;
                    break;
                }
            }
            if(isNaN(parseInt(value, 2)) && isNaN(parseInt(value, 10))) {
                isValid = false;
            }
            return isValid;
        },

        validations: {
            dscpValidations: {
                'dscp_key': function(value, attr, finalObj) {
                    if(!self.isValidBits(ctwc.QOS_DSCP_VALUES, value)) {
                        return "Enter valid DSCP bits";
                    }
                },
                'forwarding_class_id': {
                    required: true,
                    pattern: 'number',
                    msg: "Enter valid Forwarding Class ID"
                }
            },
            mplsValidations: {
                'mpls_key': function(value, attr, finalObj) {
                    if(!self.isValidBits(ctwc.QOS_MPLS_EXP_VALUES, value)) {
                        return "Enter valid MPLS EXP bits";
                    }
                },
                'forwarding_class_id': {
                    required: true,
                    pattern: 'number',
                    msg: "Enter valid Forwarding Class ID"
                }
            },
            vlanValidations: {
                'vlan_key': function(value, attr, finalObj) {
                    if(!self.isValidBits(ctwc.QOS_VLAN_PRIORITY_VALUES, value)) {
                        return "Enter valid VLAN Priority bits";
                    }
                },
                'forwarding_class_id': {
                    required: true,
                    pattern: 'number',
                    msg: "Enter valid Forwarding Class ID"
                }
            }
        }
    });
    return forwardingClassPairModel;
});
