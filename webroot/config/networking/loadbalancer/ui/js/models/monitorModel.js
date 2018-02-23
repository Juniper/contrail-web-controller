/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var MonitorModel = ContrailModel.extend({
        defaultConfig: {
            "display_name": "",
            "delay":"5",
            "description":"",
            "max_retries":"3",
            "admin_state": true,
            "timeout": "5",
            "monitor_type":"",
            "loadbalancer_healthmonitor_properties": {},
            "field_disable": false,
            'http_method': '',
            'expected_codes':'',
            'url_path':''
        },

        formatModelConfig: function(modelConfig) {
            var delay = getValueByJsonPath(modelConfig,
                    "loadbalancer_healthmonitor_properties;delay", '');
            if(delay != ''){
                modelConfig["delay"] = delay;
            }
            modelConfig["admin_state"] = getValueByJsonPath(modelConfig,
                    "loadbalancer_healthmonitor_properties;admin_state", false);

            var retries = getValueByJsonPath(modelConfig,
                    "loadbalancer_healthmonitor_properties;max_retries", '');
            if(retries != ''){
                modelConfig["max_retries"] = retries;
            }
            var httpMethod = getValueByJsonPath(modelConfig,
                    "loadbalancer_healthmonitor_properties;http_method", '');
            if(httpMethod != ''){
                modelConfig["http_method"] = httpMethod;
            }
            var expectedCodes = getValueByJsonPath(modelConfig,
                    "loadbalancer_healthmonitor_properties;expected_codes", '');
            if(expectedCodes != ''){
                modelConfig["expected_codes"] = expectedCodes;
            }
            var urlPath = getValueByJsonPath(modelConfig,
                    "loadbalancer_healthmonitor_properties;url_path", '');
            if(urlPath != ''){
                modelConfig["url_path"] = urlPath;
            }
            var timeout = getValueByJsonPath(modelConfig,
                    "loadbalancer_healthmonitor_properties;timeout", '');
            if(timeout != ''){
                modelConfig["timeout"] = timeout;
            }
            var monitorType = getValueByJsonPath(modelConfig,
                    "loadbalancer_healthmonitor_properties;monitor_type", '');
            if(monitorType != ''){
                modelConfig["monitor_type"] = monitorType;
            }
            var description = getValueByJsonPath(modelConfig,
                    "id_perms;description", '');
            if(description != ''){
                modelConfig["description"] = description;
            }
            return modelConfig;
        },
        validations: {
            poolMonitorValidation: {
                'max_retries': function(value, attr, data) {
                   var weight = Number(value);
                   if(weight==""){
                       return " Enter vaild number";
                   }
                },
                'timeout': function(value, attr, data) {
                    var weight = Number(value);
                    if(weight==""){
                        return " Enter vaild number";
                    }
                 },
                 'delay': function(value, attr, data) {
                     var weight = Number(value);
                     if(weight==""){
                         return " Enter vaild number";
                     }
                  }
             }
        },

        updateMonitor: function(callbackObj){
	        	var self = this;
	    	 	var validations = [
	             {
	                 key : null,
	                 type : cowc.OBJECT_TYPE_MODEL,
	                 getValidation : 'poolMonitorValidation'
	             }
	         ];
	         if (self.isDeepValid(validations)) {
	            var ajaxConfig = {};
	            var self = this;
	            var model = $.extend(true,{},this.model().attributes);
	            var obj = {};
	            obj['loadbalancer-healthmonitor'] = {};
	            obj['loadbalancer-healthmonitor']['fq_name'] = model.fq_name;
	            obj['loadbalancer-healthmonitor']['display_name'] = model.display_name;
	            obj['loadbalancer-healthmonitor']['uuid'] = model.uuid;
	            model.id_perms.description = model.description;
	            obj['loadbalancer-healthmonitor'].id_perms = model.id_perms;
	            if(model.monitor_type === 'HTTP'){
	                model.loadbalancer_healthmonitor_properties['url_path'] = model.url_path;
	                model.loadbalancer_healthmonitor_properties['expected_codes'] = model.expected_codes;
	                model.loadbalancer_healthmonitor_properties['http_method'] = model.http_method;
	            }else{
	                delete model.loadbalancer_healthmonitor_properties['url_path'];
	                delete model.loadbalancer_healthmonitor_properties['expected_codes'];
	                delete model.loadbalancer_healthmonitor_properties['http_method'];
	            }
	            model.loadbalancer_healthmonitor_properties['admin_state'] = model.admin_state;
	            model.loadbalancer_healthmonitor_properties['delay'] = model.delay;
	            model.loadbalancer_healthmonitor_properties['monitor_type'] = model.monitor_type;
	            model.loadbalancer_healthmonitor_properties['timeout'] = model.timeout;
	            model.loadbalancer_healthmonitor_properties['max_retries'] = model.max_retries;
	            obj['loadbalancer-healthmonitor']['loadbalancer_healthmonitor_properties'] = model.loadbalancer_healthmonitor_properties;
	            ajaxConfig.url = '/api/tenants/config/lbaas/health-monitor/'+ model.uuid;
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
	         }else {
                 if (contrail.checkIfFunction(callbackObj.error)) {
                     callbackObj.error(this.getFormErrorText
                                      (ctwc.CONFIG_LB_MONITOR_PREFIX_ID));
                 }
             }
        },

        multiDeleteMonitor: function (checkedRows, callbackObj) {
            var ajaxConfig = {}, that = this;
            var uuidList = [];
            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });
            ajaxConfig.type = "POST";
            ajaxConfig.url = '/api/tenants/config/lbaas/health-monitor/delete';
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
    return MonitorModel;
});