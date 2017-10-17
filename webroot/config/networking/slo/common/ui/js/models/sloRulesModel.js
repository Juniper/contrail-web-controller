/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var self;
    var sloRulesModel = ContrailModel.extend({
        defaultConfig: {
            "rule_uuid": "",
            "rate": '',
            "dataSource" : []
        },

        formatModelConfig: function (modelConfig) {
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

        validations: {
            sloRuleValidation: {
               'rate' : function(value, attr, data) {
                   var rate = Number(value);
                       if (isNaN(rate)) {
                           return "Rate should be a number.";
                       }
                },
                'rule_uuid' : function(value, attr, data) {
                    var selectedUuidList = data.selectedUUID;
                    if(selectedUuidList !== undefined){
                        if(selectedUuidList.length > 0){
                            for(var i = 0; i < selectedUuidList.length; i++){
                                if(selectedUuidList[i] === value){
                                    return "Please select unique UUID.";
                                }
                            }
                        }
                    }
                    if(value === ''){
                        return "Please select the UUID.";
                    }
                 }
             }
        }
    });
    return sloRulesModel;
});
