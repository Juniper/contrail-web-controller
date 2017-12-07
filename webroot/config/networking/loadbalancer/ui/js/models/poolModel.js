/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var poolModel = ContrailModel.extend({
        defaultConfig: {
            "display_name": "",
            "protocol": "",
            "description":"",
            "loadbalancer_pool_properties": {},
            'session_persistence': "",
            "status_description":"",
            "loadbalancer_method":"",
            "admin_state": true,
            "persistence_cookie_name": '',
            'persistence_cookie_visible': false
        },

        formatModelConfig: function(modelConfig) {
            var protocol = getValueByJsonPath(modelConfig,
                    "loadbalancer_pool_properties;protocol", '');
            if(protocol != ''){
                modelConfig["protocol"] = protocol;
            }
            modelConfig["admin_state"] = getValueByJsonPath(modelConfig,
                    "loadbalancer_pool_properties;admin_state", false);
            var persistence = getValueByJsonPath(modelConfig,
                    "loadbalancer_pool_properties;session_persistence", '');
            if(persistence != ''){
                modelConfig["session_persistence"] = persistence;
            }
            var description = getValueByJsonPath(modelConfig,
                    "loadbalancer_pool_properties;status_description", '');
            if(description != ''){
                modelConfig["status_description"] = description;
            }
            var method = getValueByJsonPath(modelConfig,
                    "loadbalancer_pool_properties;loadbalancer_method", '');
            if(method != ''){
                modelConfig["loadbalancer_method"] = method;
            }
            var description = getValueByJsonPath(modelConfig,
                    "id_perms;description", '');
            if(description != ''){
                modelConfig["description"] = description;
            }
            var cookieName = getValueByJsonPath(modelConfig,
                    "loadbalancer_pool_properties;persistence_cookie_name", '');
            if(cookieName != ''){
                modelConfig["persistence_cookie_name"] = cookieName;
            }
            return modelConfig;
        },
        
        updatePool: function(callbackObj){
            var ajaxConfig = {};
            var self = this;
            var model = $.extend(true,{},this.model().attributes);
            var obj = {};
            obj['loadbalancer-pool'] = {};
            obj['loadbalancer-pool']['fq_name'] = model.fq_name;
            obj['loadbalancer-pool']['display_name'] = model.display_name;
            obj['loadbalancer-pool']['uuid'] = model.uuid;
            model.id_perms.description = model.description;
            obj['loadbalancer-pool'].id_perms = model.id_perms;
            model.loadbalancer_pool_properties.admin_state = model.admin_state;
            model.loadbalancer_pool_properties.protocol = model.protocol;
            if(model.session_persistence !== ''){
                model.loadbalancer_pool_properties.session_persistence = model.session_persistence;
            }
            if(model.session_persistence === 'APP_COOKIE'){
                if(model.persistence_cookie_name !== ''){
                    model.loadbalancer_pool_properties.persistence_cookie_name = model.persistence_cookie_name;
                }
            }else{
                if(model.persistence_cookie_name !== ''){
                    delete model.loadbalancer_pool_properties.persistence_cookie_name;
                }
            }
            obj['loadbalancer-pool']['loadbalancer_pool_properties'] = model.loadbalancer_pool_properties;
            ajaxConfig.url = '/api/tenants/config/lbaas/pool/'+ model.uuid;
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
        },
        
        multiDeletePool: function (checkedRows, callbackObj) {
            var ajaxConfig = {}, that = this;
            var uuidList = [];
            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });
            ajaxConfig.type = "POST";
            ajaxConfig.url = '/api/tenants/config/lbaas/pool/delete';
            ajaxConfig.data = JSON.stringify({'uuids': uuidList});
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
            }, function (error) {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
            });
        }
    });
    return poolModel;
});