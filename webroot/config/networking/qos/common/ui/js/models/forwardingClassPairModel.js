/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var forwardingClassPairModel = ContrailModel.extend({

        defaultConfig: {
            "dscp_key": null,
            "vlan_key": null,
            "mpls_key": null,
            "forwarding_class_id": null
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
            dscpValidations: {
                'dscp_key': {
                    required: true,
                    msg: "DSCP bits are required"
                },
                'forwarding_class_id': {
                    required: true,
                    msg: "Forwarding Class ID is required"
                }
            },
            mplsValidations: {
                'mpls_key': {
                    required: true,
                    msg: "MPLS Exp bits are required"
                },
                'forwarding_class_id': {
                    required: true,
                    msg: "Forwarding Class ID is required"
                }
            },
            vlanValidations: {
                'vlan_key': {
                    required: true,
                    msg: "VLAN Priority bits are required"
                },
                'forwarding_class_id': {
                    required: true,
                    msg: "Forwarding Class ID is required"
                }
            }
        }
    });
    return forwardingClassPairModel;
});
