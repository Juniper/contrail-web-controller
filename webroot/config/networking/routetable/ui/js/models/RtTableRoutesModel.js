/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
], function (_, ContrailModel) {
    var rtTableRoutesModel = ContrailModel.extend({
        defaultConfig: {
            'prefix': '',
            'next_hop': '',
            'next_hop_type': 'ip-address',
            'community_attr': ''
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
            rtTableRoutesValidation: {
                'prefix': function(val, attr, fieldObj) {
                    if ((null == val) || (!val.trim().length)) {
                        return 'Prefix is required';
                    }
                    if (false == isValidIP(val.trim())) {
                        return 'Invalid IP Address';
                    }
                }/*,
                'next_hop_type': {
                    required: true
                }*/,
                'next_hop': function(val, attr, fieldObj) {
                    if(val) {
                        val = val.trim();
                        if ('ip-address' == fieldObj['next_hop_type']) {
                            if (false == isValidIP(val)) {
                                return 'Invalid IP Address';
                            }
                        }
                        if ('service-instance' == fieldObj['next_hop_type']) {
                            var splitArr = val.split(':');
                            if (3 != splitArr.length) {
                                return 'Invalid Service Instance FQN';
                            }
                        }
                    }
                }
            }
        }
    });
    return rtTableRoutesModel;
});


