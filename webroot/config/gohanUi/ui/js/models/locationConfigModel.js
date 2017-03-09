/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/networking/policy/ui/js/views/policyFormatters'
], function (_, ContrailModel, PolicyFormatters) {
    var policyFormatters = new PolicyFormatters(),
        self;
    var LocationConfigModel = ContrailModel.extend({
        defaultConfig: {
            'locationName' : '',
            'status' : '',
            'name' : '',
            'description' : '',
            'taskStatus' : '',
            'locationId' : '',
            'svcTempId': ''
        },
        formatModelConfig: function (modelConfig) {
            self = this;
            var locationName = getValueByJsonPath(modelConfig, "locationName");
            modelConfig["locationName"] = locationName+';location_value';
            var status = getValueByJsonPath(modelConfig,"status", "");
            modelConfig["status"] = status;
            var name = getValueByJsonPath(modelConfig,"name", "");
            modelConfig["name"] = name;
            var description = getValueByJsonPath(modelConfig,"description", "");
            modelConfig["description"] = description;
            var locationId = getValueByJsonPath(modelConfig,"taskStatus", "");
            modelConfig["taskStatus"] = locationId;
            var svcTemId = getValueByJsonPath(modelConfig,"svcTempId", "");
            modelConfig["svcTempId"] = svcTemId;
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
    return LocationConfigModel;
});
