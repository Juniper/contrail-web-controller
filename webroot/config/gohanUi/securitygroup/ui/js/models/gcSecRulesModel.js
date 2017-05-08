/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var self;
    var secRulesModel = ContrailModel.extend({
        defaultConfig: {
            "direction": "Ingress",
            "ethertype": "IPv4",
            "port_range_max": '65535',
            "port_range_min": '0',
            "protocol": "ANY",
            "ruleId": "",
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
            modelConfig["protocol"] = getValueByJsonPath(modelConfig,"protocol");
            var remoteGroupid = getValueByJsonPath(modelConfig,"remote_group_id");
            var remoteIpPrefix = getValueByJsonPath(modelConfig,"remote_ip_prefix");
            if(remoteGroupid !== undefined && remoteGroupid !== null && remoteGroupid !== ''){
                modelConfig["remote_ip_prefix"] = remoteGroupid+';security_group';
            }else{
                modelConfig["remote_ip_prefix"] = remoteIpPrefix+';subnet';
            }
            modelConfig["security_group_id"] = getValueByJsonPath(modelConfig,"security_group_id");
            var rangeMax = getValueByJsonPath(modelConfig,"port_range_max");
            var rangeMin = getValueByJsonPath(modelConfig,"port_range_min");
            var portRange = rangeMin +' - '+ rangeMax;
            modelConfig["port_range"] = portRange;
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
    return secRulesModel;
});
