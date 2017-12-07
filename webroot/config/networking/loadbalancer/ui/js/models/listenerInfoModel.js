/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var listenerInfoModel = ContrailModel.extend({
        defaultConfig: {
            "display_name": "",
            "description":"",
            "loadbalancer_listener_properties": {},
            "protocol": "",
            "admin_state": true,
            "connection_limit": "",
            "protocol_port": ""
        },

        formatModelConfig: function(modelConfig) {
            var protocol = getValueByJsonPath(modelConfig,
                    "loadbalancer_listener_properties;protocol", '');
            if(protocol != ''){
                modelConfig["protocol"] = protocol;
            }
            modelConfig["admin_state"] = getValueByJsonPath(modelConfig,
                    "loadbalancer_listener_properties;admin_state", false);

            var conLimit = getValueByJsonPath(modelConfig,
                    "loadbalancer_listener_properties;connection_limit", '');
            if(conLimit != ''){
                modelConfig["connection_limit"] = conLimit;
            }
            var port = getValueByJsonPath(modelConfig,
                    "loadbalancer_listener_properties;protocol_port", '');
            if(port != ''){
                modelConfig["protocol_port"] = port;
            }
            var description = getValueByJsonPath(modelConfig,
                    "id_perms;description", '');
            if(description != ''){
                modelConfig["description"] = description;
            }
            return modelConfig;
        },

        updateListener: function(callbackObj){
            var ajaxConfig = {};
            var self = this;
            var model = $.extend(true,{},this.model().attributes);
            var obj = {};
            obj['loadbalancer-listener'] = {};
            obj['loadbalancer-listener']['fq_name'] = model.fq_name;
            obj['loadbalancer-listener']['display_name'] = model.display_name;
            obj['loadbalancer-listener']['uuid'] = model.uuid;
            model.id_perms.description = model.description;
            obj['loadbalancer-listener'].id_perms = model.id_perms;
            model.loadbalancer_listener_properties.admin_state = model.admin_state;
            model.loadbalancer_listener_properties.connection_limit = Number(model.connection_limit);
            obj['loadbalancer-listener']['loadbalancer_listener_properties'] = model.loadbalancer_listener_properties;
            ajaxConfig.url = '/api/tenants/config/lbaas/listener/'+ model.uuid;
            ajaxConfig.type  = 'PUT';
            ajaxConfig.data  = JSON.stringify(obj);
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
                returnFlag = true;
            }, function (error) {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
                returnFlag = false;
            });
        }
    });
    return listenerInfoModel;
});