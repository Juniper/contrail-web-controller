/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var bridgeDomainModel = ContrailModel.extend({

        defaultConfig: {
            'name': null,
            'isid': null,
            'mac_learning_enabled': true,
            'mac_limit_control' : {
                'mac_limit': 0, //unlimited
                'mac_limit_action': 'log'
            },
            'mac_move_control': {
                'mac_move_limit': 0, //unlimited
                'mac_move_time_window': 10,
                'mac_move_limit_action': 'log'
            },
            'mac_aging_time': 300,
            'disable': false
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
            bridgeDomainModelConfigValidations: {
                'name': {
                    required: true,
                    msg: 'Enter Name'
                },
                'isid':
                    function (value, attr, finalObj) {
                    var isid = Number(value);
                    if ((isNaN(isid) ||
                        (isid < 1) || (isid > 16777215))) {
                        return "Enter I-SID between 1 - 16777215";
                    }
                },
                'mac_limit_control.mac_limit':
                    function (value, attr, finalObj) {
                    var macLimit = Number(value);
                    if (finalObj.mac_learning_enabled && isNaN(macLimit)) {
                        return "MAC Limit should be a number";
                    }
                },
                'mac_move_control.mac_move_limit':
                    function (value, attr, finalObj) {
                    var macMoveLimit = Number(value);
                    if (finalObj.mac_learning_enabled && isNaN(macMoveLimit)) {
                        return "MAC Move limit should be a number";
                    }
                },
                'mac_move_control.mac_move_time_window':
                    function (value, attr, finalObj) {
                    var timeWindow = Number(value);
                    if (finalObj.mac_learning_enabled && (isNaN(timeWindow) ||
                        (timeWindow < 1) || (timeWindow > 60))) {
                        return "Enter Time Window between 1 - 60";
                    }
                },
                'mac_aging_time':
                    function (value, attr, finalObj) {
                    var agingTime = Number(value);
                    if (finalObj.mac_learning_enabled && (isNaN(agingTime) ||
                        (agingTime < 0) || (agingTime > 86400))) {
                        return "Enter Aging Time between 0 - 86400";
                    }
                }
            }
        }
    });
    return bridgeDomainModel;
});
