/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var self;
    var addressPrefixModel = ContrailModel.extend({
        defaultConfig: {
            "ip_prefix": "",
            "ip_prefix_len": ""
        },
        formatModelConfig: function (modelConfig) {
            self = this;
            var prefixLen = getValueByJsonPath(modelConfig,"ip_prefix_len");
            var prefix = getValueByJsonPath(modelConfig,"ip_prefix");
            if(prefix !== '' && prefixLen !== ''){
                var role = prefix +'/'+ prefixLen;
                modelConfig["prefix"] = role;
            }else{
                modelConfig["prefix"] = '';
            }
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
        }
    });
    return addressPrefixModel;
});