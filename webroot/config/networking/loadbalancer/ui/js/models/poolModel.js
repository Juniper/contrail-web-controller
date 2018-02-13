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
            'persistence_cookie_visible': false,
            'pool_custom_attr_enable': false,
            'pool_global_max_conn_attr': '',
            'pool_global_max_conn_rate_attr': '',
            'pool_global_max_sess_rate_attr': '',
            'pool_global_max_ssl_conn_aatr': '',
            'pool_global_max_ssl_rate_attr': '',
            'pool_global_ssl_ciphers_attr': '',
            'pool_global_tune_http_max_header_attr': '',
            'pool_global_tune_ssl_max_record_attr': '',
            'pool_default_server_timeout_attr': '',
            'pool_default_client_timeout_attr':'',
            'pool_default_connect_timeout_attr': '',
            'pool_frontend_http_server_close_attr': false,
            'pool_frontend_rate_limit_sessions_attr': ''
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
            var keyPairVal = getValueByJsonPath(modelConfig,
                    "loadbalancer_pool_custom_attributes;key_value_pair", []), customObj = {};
            for(var i = 0; i < keyPairVal.length; i++){
                customObj[keyPairVal[i].key] = keyPairVal[i].value;
            }
            modelConfig["pool_global_max_conn_attr"] = getValueByJsonPath(customObj, "max_conn", '');

            modelConfig["pool_global_max_conn_rate_attr"] = getValueByJsonPath(customObj, "max_conn_rate", '');

            modelConfig["pool_global_max_sess_rate_attr"] = getValueByJsonPath(customObj, "max_sess_rate", '');

            modelConfig["pool_global_max_ssl_conn_aatr"] = getValueByJsonPath(customObj, "max_ssl_conn", '');

            modelConfig["pool_global_max_ssl_rate_attr"] = getValueByJsonPath(customObj, "max_ssl_rate", '');

            modelConfig["pool_global_ssl_ciphers_attr"] = getValueByJsonPath(customObj, "ssl_ciphers", '');

            modelConfig["pool_global_tune_http_max_header_attr"] = getValueByJsonPath(customObj, "tune_http_max_header", '');

            modelConfig["pool_global_tune_ssl_max_record_attr"] = getValueByJsonPath(customObj, "tune_ssl_max_record", '');

            modelConfig["pool_default_server_timeout_attr"] = getValueByJsonPath(customObj, "server_timeout", '');

            modelConfig["pool_default_client_timeout_attr"] = getValueByJsonPath(customObj, "client_timeout", '');

            modelConfig["pool_default_connect_timeout_attr"] = getValueByJsonPath(customObj, "connect_timeout", '');

            modelConfig["pool_frontend_rate_limit_sessions_attr"] = getValueByJsonPath(customObj, "rate_limit_sessions", '');

            var httpServerClose = getValueByJsonPath(customObj, "http_server_close", false);
            if(httpServerClose === 'true'){
                modelConfig["pool_frontend_http_server_close_attr"] = true;
            }else{
                modelConfig["pool_frontend_http_server_close_attr"] = false;
            }
            return modelConfig;
        },

        validations: {
            poolValidation: {
               'pool_global_max_conn_attr': function(value, attr, data) {
                   if(data.lb_provider === 'opencontrail'  && value !== ''){
                       var port = Number(value);
                       if(port < 1 || port > 65535){
                           return "The Maximum Connection must be a number between 1 and 65535.";
                       }
                   } else {
                       return "The Maximum Connection must be a number between 1 and 65535.";
                   }
               },
               'pool_global_max_conn_rate_attr': function(value, attr, data) {
                   if(data.lb_provider === 'opencontrail'  && value !== ''){
                       var port = Number(value);
                       if(port < 1 || port > 65535){
                           return "The Maximum Connection Rate must be a number between 1 and 65535.";
                       }
                   }else {
                       return "The Maximum Connection Rate must be a number between 1 and 65535.";
                   }
               },
               'pool_global_max_sess_rate_attr': function(value, attr, data) {
                   if(data.lb_provider === 'opencontrail'  && value !== ''){
                       var port = Number(value);
                       if(port < 1 || port > 65535){
                           return "The Maximum Session Rate must be a number between 1 and 65535.";
                       }
                   }else {
                       return "The Maximum Session Rate must be a number between 1 and 65535.";
                   }
               },
               'pool_frontend_rate_limit_sessions_attr': function(value, attr, data) {
                   if(data.lb_provider === 'opencontrail'  && value !== ''){
                       var port = Number(value);
                       if(port < 1 || port > 65535){
                           return "The Rate Limit Session must be a number between 1 and 65535.";
                       }
                   }else {
                       return "The Rate Limit Session must be a number between 1 and 65535.";
                   }
               },
               'pool_default_server_timeout_attr': function(value, attr, data) {
                   if(data.lb_provider === 'opencontrail'  && value !== ''){
                       var port = Number(value);
                       if(port < 1 || port > 5000000){
                           return "The Server Timeout must be a number between 1 and 5000000.";
                       }
                   }else {
                       return "The Server Timeout must be a number between 1 and 5000000.";
                   }
               },
               'pool_default_client_timeout_attr': function(value, attr, data) {
                   if(data.lb_provider === 'opencontrail'  && value !== ''){
                       var port = Number(value);
                       if(port < 1 || port > 5000000){
                           return "The Client Timeout must be a number between 1 and 5000000.";
                       }
                   }else {
                       return "The Client Timeout must be a number between 1 and 5000000.";
                   }
               },
               'pool_default_connect_timeout_attr': function(value, attr, data) {
                   if(data.lb_provider === 'opencontrail'  && value !== ''){
                       var port = Number(value);
                       if(port < 1 || port > 5000000){
                           return "The Connect Timeout must be a number between 1 and 5000000.";
                       }
                   }else {
                       return "The Connect Timeout must be a number between 1 and 5000000.";
                   }
               },
               'pool_global_max_ssl_conn_aatr': function(value, attr, data) {
                   if(data.lb_provider === 'opencontrail'  && value !== ''){
                       var port = Number(value);
                       if(port < 1 || port > 65535){
                           return "The Maximum SSL Connection must be a number between 1 and 65535.";
                       }
                   }else {
                       return "The Maximum SSL Connection must be a number between 1 and 65535.";
                   }
               },
               'pool_global_max_ssl_rate_attr': function(value, attr, data) {
                   if(data.lb_provider === 'opencontrail'  && value !== ''){
                       var port = Number(value);
                       if(port < 1 || port > 65535){
                           return "The Maximum SSL Rate must be a number between 1 and 65535.";
                       }
                   }else {
                       return "The Maximum SSL Rate must be a number between 1 and 65535.";
                   }
               },
               'pool_global_ssl_ciphers_attr': function(value, attr, data) {
                   if(data.lb_provider === 'opencontrail'  && value !== ''){
                       var port = Number(value);
                       if(port < 1 || port > 100){
                           return "The SSL Ciphers must be a number between 1 and 100.";
                       }
                   }else {
                       return "The SSL Ciphers must be a number between 1 and 100.";
                   }
               },
               'pool_global_tune_http_max_header_attr': function(value, attr, data) {
                   if(data.lb_provider === 'opencontrail'  && value !== ''){
                       var port = Number(value);
                       if(port < 1 || port > 128){
                           return "The Tune Http Maximum Header Ciphers must be a number between 1 and 128.";
                       }
                   }else {
                       return "The Tune Http Maximum Header Ciphers must be a number between 1 and 128.";
                   }
               },
               'pool_global_tune_ssl_max_record_attr': function(value, attr, data) {
                   if(data.lb_provider === 'opencontrail'  && value !== ''){
                       var port = Number(value);
                       if(port < 1 || port > 16384){
                           return "The Tune SSL Maximum Record Ciphers must be a number between 1 and 16384.";
                       }
                   }else {
                       return "The Tune SSL Maximum Record Ciphers must be a number between 1 and 16384.";
                   }
               }
             }
        },

        updatePool: function(callbackObj, options){
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
            if(options.lbProvider === 'opencontrail'){
                var customObj = {}, customObjList = [];
                if(model.pool_global_max_conn_attr !== ''){
                    customObjList.push({key : 'max_conn', value : model.pool_global_max_conn_attr});
                }
                if(model.pool_global_max_conn_rate_attr !== ''){
                    customObjList.push({key : 'max_conn_rate', value : model.pool_global_max_conn_rate_attr});
                }
                if(model.pool_global_max_sess_rate_attr !== ''){
                    customObjList.push({key : 'max_sess_rate', value : model.pool_global_max_sess_rate_attr});
                }
                if(model.pool_global_max_ssl_conn_aatr !== ''){
                    customObjList.push({key : 'max_ssl_conn', value : model.pool_global_max_ssl_conn_aatr});
                }
                if(model.pool_global_max_ssl_rate_attr !== ''){
                    customObjList.push({key : 'max_ssl_rate', value : model.pool_global_max_ssl_rate_attr});
                }
                if(model.pool_global_ssl_ciphers_attr !== ''){
                    customObjList.push({key : 'ssl_ciphers', value : model.pool_global_ssl_ciphers_attr});
                }
                if(model.pool_global_tune_http_max_header_attr !== ''){
                    customObjList.push({key : 'tune_http_max_header', value : model.pool_global_tune_http_max_header_attr});
                }
                if(model.pool_global_tune_ssl_max_record_attr !== ''){
                    customObjList.push({key : 'tune_ssl_max_record', value : model.pool_global_tune_ssl_max_record_attr});
                }
                if(model.pool_default_server_timeout_attr !== ''){
                    customObjList.push({key : 'server_timeout', value : model.pool_default_server_timeout_attr});
                }
                if(model.pool_default_client_timeout_attr !== ''){
                    customObjList.push({key : 'client_timeout', value : model.pool_default_client_timeout_attr});
                }
                if(model.pool_default_connect_timeout_attr !== ''){
                    customObjList.push({key : 'connect_timeout', value : model.pool_default_connect_timeout_attr});
                }
                if(model.pool_frontend_rate_limit_sessions_attr !== ''){
                    customObjList.push({key : 'rate_limit_sessions', value : model.pool_frontend_rate_limit_sessions_attr});
                }
                if(model.pool_frontend_http_server_close_attr){
                    customObjList.push({key : 'http_server_close', value : 'true'});
                }
                if(customObjList.length > 0){
                    customObj['key_value_pair'] = customObjList;
                    obj['loadbalancer-pool']['loadbalancer_pool_custom_attributes'] = customObj;
                }
            }
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