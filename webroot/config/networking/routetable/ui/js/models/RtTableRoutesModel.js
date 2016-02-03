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
            'next_hop_type': 'service-instance',
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
                        return 'prefix is required';
                    }
                    if (false == isValidIP(val.trim())) {
                        return 'provide prefix in xxx.xxx.xxx.xxx or ' +
                            'xxx.xxx.xxx.xxx/xx format';
                    }
                },
                'next_hop_type': {
                    required: true
                },
                'next_hop': function(val, attr, fieldObj) {
                    if ((null == val) || (!val.trim().length)) {
                        return 'next-hop is required';
                    }
                    val = val.trim();
                    if ('ip-address' == fieldObj['next_hop_type']) {
                        if ((-1 != val.indexOf('/')) ||
                             (false == isValidIP(val))) {
                            return 'provide next-hop in xxx.xxx.xxx.xxx format';
                        }
                    }
                    if ('service-instance' == fieldObj['next_hop_type']) {
                        var splitArr = val.split(':');
                        if (3 != splitArr.length) {
                            return 'provide service-instance name in ' +
                                'FQN(domain:project:service-instance) format';
                        }
                    }
                }
            }
        }
    });
    return rtTableRoutesModel;
});


