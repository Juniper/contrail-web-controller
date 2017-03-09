/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var self;
    var SecRulesModel = ContrailModel.extend({
        defaultConfig: {
            "direction": "Ingress",
            "ethertype": "IPv4",
            "port_range_max": '65535',
            "port_range_min": '0',
            "protocol": "ANY",
            "port_range": "0 - 65535",
            "remote_group_id": "",
            "remote_ip_prefix": "",
            "security_group": {
              "contrail_id": null,
              "description": "",
              "id": "",
              "name": "",
              "tenant_id": ""
            },
            "security_group_id": "",
            "tenant_id": null
        },
        formatModelConfig: function (modelConfig) {
            self = this;
            modelConfig["direction"] = getValueByJsonPath(modelConfig, "direction");
            modelConfig["ethertype"] = getValueByJsonPath(modelConfig,"ethertype", "");
            modelConfig["port_range_max"] = getValueByJsonPath(modelConfig,"port_range_max");
            modelConfig["port_range_min"] = getValueByJsonPath(modelConfig,"port_range_min");
            modelConfig["protocol"] = getValueByJsonPath(modelConfig,"protocol");
            modelConfig["remote_group_id"] = getValueByJsonPath(modelConfig,"remote_group_id");
            modelConfig["remote_ip_prefix"] = getValueByJsonPath(modelConfig,"remote_ip_prefix");
            modelConfig["security_group_id"] = getValueByJsonPath(modelConfig,"security_group_id");
            modelConfig["remote_group_id"] = getValueByJsonPath(modelConfig,"remote_group_id");
            modelConfig["port_range"] = getValueByJsonPath(modelConfig,"port_range");
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
    return SecRulesModel;
});
