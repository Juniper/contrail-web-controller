/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var self;
    var poolMemberModel = ContrailModel.extend({
        defaultConfig: {
            'pool_member_ip_address' : '',
            'pool_member_subnet' : '',
            'pool_member_port': '',
            'pool_member_weight':'1',
            'pool_name':''
        },

        formatModelConfig: function (modelConfig) {
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
        validations: {
            poolMemberValidation: {
                'pool_member_port' : function(value, attr, data) {
                    var port = Number(value);
                    if(port < 1 || port > 65535){
                        return "The Port must be a number between 1 and 65535.";
                    }
                }
             }
        }
    });
    return poolMemberModel;
});
