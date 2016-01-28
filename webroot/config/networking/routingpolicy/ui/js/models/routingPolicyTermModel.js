/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/networking/routingpolicy/ui/js/views/routingPolicyFormatter'
], function (_, ContrailModel, RoutingPolicyFormatter) {
    var routingPolicyFormatter = new RoutingPolicyFormatter();
    var RoutingPolicyTermModel = ContrailModel.extend({
        defaultConfig: {
            "fromxx":{
                "community":"",
                "prefix":{
                    "prefix":"",
                    "type":""
                }
            },
            "then":{
                "update": {
                    "community":{},
                    "local_pref" : "",
                },
                "action": ""
            },
            "fromValue":"",
            "thenValue":"",
            "action":"Default"
        },
        formatModelConfig: function (config) {
            var modelConfig = $.extend({},true,config);
            var community =
                getValueByJsonPath(modelConfig, "fromxx;community", "");
            var prefix =
                getValueByJsonPath(modelConfig, "fromxx;prefix;prefix", "");
            if(community != "" || prefix != "") {
                modelConfig["fromValue"] =
                    routingPolicyFormatter.fromObjToStr(modelConfig["fromxx"]);
            }
            var thenComm =
                getValueByJsonPath(modelConfig, "then;update;community", "");
            var localpref =
                getValueByJsonPath(modelConfig, "then;update;local_pref", "");
            if(thenComm != "" || localpref != "") {
                modelConfig["thenValue"] =
                  routingPolicyFormatter.thenObjToStr(modelConfig["then"]["update"]);
            }
            switch(modelConfig["then"]["action"]) {
                case "accept":
                {
                    modelConfig["action"] = "Accept";
                    break;
                }
                case "next":
                {
                    modelConfig["action"] = "Next";
                    break;
                }
                case "reject":
                {
                    modelConfig["action"] = "Reject";
                    break;
                }
                case "":
                case "Default":
                case "default":
                {
                    modelConfig["action"] = "Default";
                    break;
                }
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
        },
        validations: {
            termValidation: {
                'fromValue': function(value, attr, finalObj) {
                    if(value.trim() != ""){
                        var result =
                            routingPolicyFormatter.buildFromStructure(value);
                        if(result.error.available == true) {
                            return result.error.message;
                        }
                    }
                },
                'thenValue': function(value, attr, finalObj) {
                    if(value.trim() != ""){
                        var result =
                            routingPolicyFormatter.buildThenStructure(value);
                        if(result.error.available == true) {
                            return result.error.message;
                        }
                    }
                }
            }
        }
    });
    return RoutingPolicyTermModel;
});