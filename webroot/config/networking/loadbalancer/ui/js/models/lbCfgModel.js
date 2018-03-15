/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/networking/loadbalancer/ui/js/models/poolMemberCollectionModel',
    'config/networking/loadbalancer/ui/js/views/lbCfgFormatters'
], function (_, ContrailConfigModel, PoolMemberCollectionModel, LbCfgFormatters) {
    var lbCfgFormatters = new LbCfgFormatters();
    var lbCfgModel = ContrailConfigModel.extend({
        defaultConfig: {
            'name': '',
            'display_name': '',
            'description': '',
            'ip_address': '',
            'lb_provider': 'default-global-system-config;opencontrail',
            'lb_status':'',
            'lb_provisioning_status':'',
            'lb_vipaddress': '',
            'lb_vipsubnetid':'',
            'lb_operating_status':'',
            'lb_admin_state': true,
            'lb_floating_ip': '',
            'lb_subnet': '',
            'listener_name':'',
            'listener_description':'',
            'listener_protocol':'',
            'listener_port':'',
            'listener_admin_state': true,
            'connection_limit': -1,
            'pool_name':'',
            'pool_description':'',
            'pool_method':'',
            'pool_member': [],
            'pool_protocol':'',
            'pool_session_persistence':'',
            'persistence_cookie_name':'',
            'persistence_cookie_visible': false,
            'pool_subnet_id':'',
            'pool_admin_state': true,
            'monitor_type':'',
            'health_check_interval':'5',
            'retry_count':'3',
            'timeout':'5',
            'monitor_http_method': 'GET',
            'monitor_http_status_code':'200',
            'monitor_admin_state': true,
            'monitor_url_path':'/',
            'field_disable': false,
            'existing_port' :'',
            'custom_attr_enable': false,
            'global_max_conn_attr': '',
            'global_max_conn_rate_attr': '',
            'global_max_sess_rate_attr': '',
            'global_max_ssl_conn_aatr': '',
            'global_max_ssl_rate_attr': '',
            'global_ssl_ciphers_attr': '',
            'global_tune_http_max_header_attr': '',
            'global_tune_ssl_max_record_attr': '',
            'default_server_timeout_attr': '',
            'default_client_timeout_attr':'',
            'default_connect_timeout_attr': '',
            'frontend_http_server_close_attr': false,
            'frontend_rate_limit_sessions_attr': ''
        },

        formatModelConfig: function (modelConfig) {
            var poolMemberCollection = [];
            modelConfig["pool_member"] = new Backbone.Collection(poolMemberCollection);
            return modelConfig;
        },

        addPoolMember: function() {
            var poolMember = this.model().attributes['pool_member'],
                newPoolMember = new PoolMemberCollectionModel();
            poolMember.add([newPoolMember]);
        },

        addPoolMemberByIndex: function(data, member) {
            var selectedRuleIndex = data.model().collection.indexOf(member.model());
            var poolMember = this.model().attributes['pool_member'],
                newPoolMember = new PoolMemberCollectionModel();
            poolMember.add([newPoolMember],{at: selectedRuleIndex+1});
        },

        deletePoolMember: function(data, member) {
            var memberCollection = data.model().collection,
                delMember = member.model();
            memberCollection.remove(delMember);
        },

        validations: {
            loadBalancerValidation: {
                'name' : function(value, attr, data) {
                   if(value === ''){
                       return "Enter the name.";
                   }
                },
                'ip_address' : function(value, attr, data) {
                    if(value == null || value.trim() == "") {
                        return;
                    }
                    if(!lbCfgFormatters.validateIP(value)){
                        return "The IP address is not valid.";
                    }
                    if(data.lb_subnet != "") {
                        var subnet = data.lb_subnet.split(';')[1];
                        if(!isIPBoundToRange(subnet, value)){
                            var ip = subnet.split('/')[0];
                            return "Enter a fixed IP within the selected subnet range " + ip;
                        }
                        if(isStartAddress(subnet, value) == true ||
                           isEndAddress(subnet, value) == true) {
                            return "Fixed IP cannot be same as broadcast/start address";
                        }
                    }
                 },
                 'listener_name' : function(value, attr, data) {
                     if(value === ''){
                         return "Enter the name.";
                     }
                },
                'listener_port': function(value, attr, data) {
                   var port = Number(value);
                   if(port < 1 || port > 65535){
                       return "The Port must be a number between 1 and 65535.";
                   }
                   if(data.existing_port.length > 0){
                       if(data.existing_port.indexOf(port) !== -1){
                           return "The port must be unique among all listeners attached to this load balancer";
                       }
                   }
                },
                'pool_name' : function(value, attr, data) {
                    if(value === ''){
                        return "Enter the name.";
                    }
               },
               'global_max_conn_attr': function(value, attr, data) {
                   var lbProvider = data.lb_provider.split(';')[1];
                   if(lbProvider === 'opencontrail' && value !== ''){
                       var cusAttr = Number(value);
                       if(cusAttr < 1 || cusAttr > 65535){
                           return "The Maximum Connection must be a number between 1 and 65535.";
                       }
                   }else{
                	   		return "The Maximum Connection must be a number between 1 and 65535.";
                   }
               },
               'global_max_conn_rate_attr': function(value, attr, data) {
                   var lbProvider = data.lb_provider.split(';')[1];
                   if(lbProvider === 'opencontrail' && value !== ''){
                       var cusAttr = Number(value);
                       if(cusAttr < 1 || cusAttr > 65535){
                           return "The Maximum Connection Rate must be a number between 1 and 65535.";
                       }
                   }else{
                	   	  return "The Maximum Connection Rate must be a number between 1 and 65535.";
                   }
               },
               'global_max_sess_rate_attr': function(value, attr, data) {
                   var lbProvider = data.lb_provider.split(';')[1];
                   if(lbProvider === 'opencontrail' && value !== ''){
                       var cusAttr = Number(value);
                       if(cusAttr < 1 || cusAttr > 65535){
                           return "The Maximum Session Rate must be a number between 1 and 65535.";
                       }
                   }else{
                	   	  return "The Maximum Session Rate must be a number between 1 and 65535.";
                   }
               },
               'frontend_rate_limit_sessions_attr': function(value, attr, data) {
                   var lbProvider = data.lb_provider.split(';')[1];
                   if(lbProvider === 'opencontrail' && value !== ''){
                       var cusAttr = Number(value);
                       if(cusAttr < 1 || cusAttr > 65535){
                           return "The Rate Limit Session must be a number between 1 and 65535.";
                       }
                   }else{
                	   	  return "The Rate Limit Session must be a number between 1 and 65535.";
                   }
               },
               'default_server_timeout_attr': function(value, attr, data) {
                   var lbProvider = data.lb_provider.split(';')[1];
                   if(lbProvider === 'opencontrail' && value !== ''){
                       var cusAttr = Number(value);
                       if(cusAttr < 1 || cusAttr > 5000000){
                           return "The Server Timeout must be a number between 1 and 5000000.";
                       }
                   }else{
                	   	  return "The Server Timeout must be a number between 1 and 5000000.";
                   }
               },
               'default_client_timeout_attr': function(value, attr, data) {
                   var lbProvider = data.lb_provider.split(';')[1];
                   if(lbProvider === 'opencontrail' && value !== ''){
                       var cusAttr = Number(value);
                       if(cusAttr < 1 || cusAttr > 5000000){
                           return "The Client Timeout must be a number between 1 and 5000000.";
                       }
                   }else{
                	   	  return "The Client Timeout must be a number between 1 and 5000000.";
                   }
               },
               'default_connect_timeout_attr': function(value, attr, data) {
                   var lbProvider = data.lb_provider.split(';')[1];
                   if(lbProvider === 'opencontrail' && value !== ''){
                       var cusAttr = Number(value);
                       if(cusAttr < 1 || cusAttr > 5000000){
                           return "The Connect Timeout must be a number between 1 and 5000000.";
                       }
                   }else{
                	   	  return "The Connect Timeout must be a number between 1 and 5000000.";
                   }
               },
               'global_max_ssl_conn_aatr': function(value, attr, data) {
                   var lbProvider = data.lb_provider.split(';')[1];
                   if(lbProvider === 'opencontrail' && value !== ''){
                       var cusAttr = Number(value);
                       if(cusAttr < 1 || cusAttr > 65535){
                           return "The Maximum SSL Connection must be a number between 1 and 65535.";
                       }
                   }else{
                	   	  return "The Maximum SSL Connection must be a number between 1 and 65535.";
                   }
               },
               'global_max_ssl_rate_attr': function(value, attr, data) {
                   var lbProvider = data.lb_provider.split(';')[1];
                   if(lbProvider === 'opencontrail' && value !== ''){
                       var cusAttr = Number(value);
                       if(cusAttr < 1 || cusAttr > 65535){
                           return "The Maximum SSL Rate must be a number between 1 and 65535.";
                       }
                   }else{
                	   	  return "The Maximum SSL Rate must be a number between 1 and 65535.";
                   }
               },
               'global_ssl_ciphers_attr': function(value, attr, data) {
                   var lbProvider = data.lb_provider.split(';')[1];
                   if(lbProvider === 'opencontrail' && value !== ''){
                       var cusAttr = Number(value);
                       if(cusAttr < 1 || cusAttr > 100){
                           return "The SSL Ciphers must be a number between 1 and 100.";
                       }
                   }else{
                	   	  return "The SSL Ciphers must be a number between 1 and 100.";
                   }
               },
               'global_tune_http_max_header_attr': function(value, attr, data) {
                   var lbProvider = data.lb_provider.split(';')[1];
                   if(lbProvider === 'opencontrail' && value !== ''){
                       var cusAttr = Number(value);
                       if(cusAttr < 1 || cusAttr > 128){
                           return "The Tune Http Maximum Header Ciphers must be a number between 1 and 128.";
                       }
                   }else{
                	   	  return "The Tune Http Maximum Header Ciphers must be a number between 1 and 128.";
                   }
               },
               'global_tune_ssl_max_record_attr': function(value, attr, data) {
                   var lbProvider = data.lb_provider.split(';')[1];
                   if(lbProvider === 'opencontrail' && value !== ''){
                       var cusAttr = Number(value);
                       if(cusAttr < 1 || cusAttr > 16384){
                           return "The Tune SSL Maximum Record Ciphers must be a number between 1 and 16384.";
                       }
                   }else{
                	   	  return "The Tune SSL Maximum Record Ciphers must be a number between 1 and 16384.";
                   }
               },
               'health_check_interval': function(value, attr, data) {
                   if(value == ''){
                   		return "Enter valid number.";
                   	}
               },               
               'retry_count': function(value, attr, data) {
                   if(value == ''){
                  		return "Enter valid number.";
                  	}
               },               
               'timeout': function(value, attr, data) {
                  if(value == ''){
                 		return "Enter valid number.";
                 	}
               },
             }
        },

        configureLoadBalancer: function(callbackObj, options, allData, isListener){
            var ajaxConfig = {}, returnFlag = true,updatedVal = {}, postFWRuleData = {};
            var postFWPolicyData = {}, newFWPolicyData, attr;
            var updatedModel = {},policyList = [], isCustom = false;;
            var self = this;
            //Validation we have to update
            var model = $.extend(true,{},this.model().attributes);
            var poolMember = $.extend(true,{},model.pool_member).toJSON();
            var obj = {};
            if(!isListener){
             // Load Balancer
                var loadbalancer = {};
                loadbalancer.name = model.name;
                loadbalancer.display_name = model.name;
                var fqName = [];
                fqName.push(contrail.getCookie(cowc.COOKIE_DOMAIN));
                fqName.push(contrail.getCookie(cowc.COOKIE_PROJECT));
                fqName.push(model.name);
                loadbalancer.fq_name = fqName;
                loadbalancer["parent_type"] = "project";
                if(model.lb_provider !== ''){
                    var providerRef = model.lb_provider.split(';');
                    var providerName = providerRef[1];
                    loadbalancer.loadbalancer_provider = providerName;
                    loadbalancer.service_appliance_set_refs = [];
                    var providerObj = {};
                    providerObj.to = providerRef;
                    loadbalancer.service_appliance_set_refs.push(providerObj);
                }
                loadbalancer.loadbalancer_properties = {};
                loadbalancer.loadbalancer_properties['admin_state'] = model.lb_admin_state;
                if(model.ip_address !== ''){
                  loadbalancer.loadbalancer_properties['vip_address'] = model.ip_address;
                }
                var subnet = model.lb_subnet.split(';')[0];
                loadbalancer.loadbalancer_properties['vip_subnet_id'] = subnet;
                if(model.description !== ''){
                    loadbalancer.id_perms = {};
                    loadbalancer.id_perms.description = model.description;
                }
                // VMI Object formation
                var newVMIObj = {};
                newVMIObj["parent_type"] = "project";
                newVMIObj["virtual_machine_interface_device_owner"] = "neutron:LOADBALANCER";
                var VMIfqName = [];
                VMIfqName.push(contrail.getCookie(cowc.COOKIE_DOMAIN));
                VMIfqName.push(contrail.getCookie(cowc.COOKIE_PROJECT));
                newVMIObj.fq_name = VMIfqName;
                var secfqName = [];
                secfqName.push(contrail.getCookie(cowc.COOKIE_DOMAIN));
                secfqName.push(contrail.getCookie(cowc.COOKIE_PROJECT));
                secfqName.push('default');
                var secList = [];
                var secObj = {};
                secObj.to = secfqName;
                secList.push(secObj);
                newVMIObj['security_group_refs'] = secList;
                var vnList = [];
                var vnObj = {};
                vnObj.to =  model.lb_subnet.split(';')[2].split(':');
                vnList.push(vnObj);
                newVMIObj['virtual_network_refs'] = vnList;
                var instanceIpObj = {};
                if(model.ip_address !== ''){
                    instanceIpObj.fixedIp = model.ip_address;
                }else{
                    instanceIpObj.fixedIp = '';
                }
                instanceIpObj.domain = contrail.getCookie(cowc.COOKIE_DOMAIN);
                instanceIpObj.project = contrail.getCookie(cowc.COOKIE_PROJECT);
                var instanceIpList = [], instanceIpBackRef = [];
                instanceIpList.push(instanceIpObj);
                var instanceIpBackRefObj = {};
                instanceIpBackRefObj.instance_ip_address = instanceIpList;
                instanceIpBackRefObj.subnet_uuid = model.lb_subnet.split(';')[0];
                instanceIpBackRef.push(instanceIpBackRefObj);
                newVMIObj["instance_ip_back_refs"] = instanceIpBackRef;

                loadbalancer['virtual_machine_interface_refs'] = newVMIObj;
                obj.loadbalancer = loadbalancer;
                // Floating IP Formation
                if(model.lb_floating_ip !== ''){
                    var floatingIpColl = allData.floatingIpColl, floatingObj;
                    _.each(floatingIpColl, function(obj) {
                        if(obj.uuid === model.lb_floating_ip){
                            floatingObj = obj;
                        }
                    });
                    var floatingChildObj = {};
                    floatingChildObj['fixed_ip_aap'] = 'fixed-ip';
                    floatingChildObj['floating_ip_fixed_ip_address'] = floatingObj.floating_ip_address;
                    floatingChildObj['fq_name'] = floatingObj.fq_name;
                    floatingChildObj['owner_visible'] = true;
                    floatingChildObj.uuid = floatingObj.uuid;
                    floatingChildObj['user_created_virtual_machine_interface_refs'] = '';
                    floatingChildObj['virtual_machine_interface_refs'] = [];
                    var floatingParentObj = {};
                    floatingParentObj['floating-ip'] = floatingChildObj;
                    obj['loadbalancer_floatingip'] = floatingParentObj;
                }
            }else{
                var lbObj = options.lbObj;
                obj.loadbalancer = lbObj;
            }
            // Listeners
            var listener = {};
            listener.name = model.listener_name;
            var listenerfqName = [];
            listenerfqName.push(contrail.getCookie(cowc.COOKIE_DOMAIN));
            listenerfqName.push(contrail.getCookie(cowc.COOKIE_PROJECT));
            listenerfqName.push(model.listener_name);
            listener.fq_name = listenerfqName;
            listener["parent_type"] = "project";
            if(model.listener_description !== ''){
                listener.id_perms = {};
                listener.id_perms.description = model.listener_description;
            }
            listener.loadbalancer_listener_properties = {};
            listener.loadbalancer_listener_properties['admin_state'] = model.listener_admin_state;
            listener.loadbalancer_listener_properties['protocol'] = model.listener_protocol;
            listener.loadbalancer_listener_properties['protocol_port'] = Number(model.listener_port);
            listener.loadbalancer_listener_properties['connection_limit'] = Number(model.connection_limit);
            obj['loadbalancer-listener'] = listener;

            // Pool
            var pool = {};
            pool.name = model.pool_name;
            var poolfqName = [];
            poolfqName.push(contrail.getCookie(cowc.COOKIE_DOMAIN));
            poolfqName.push(contrail.getCookie(cowc.COOKIE_PROJECT));
            poolfqName.push(model.pool_name);
            pool.fq_name = poolfqName;
            pool["parent_type"] = "project";
            if(model.pool_description !== ''){
                pool.id_perms = {};
                pool.id_perms.description = model.pool_description;
            }
            pool.loadbalancer_pool_properties = {};
            pool.loadbalancer_pool_properties['admin_state'] = model.pool_admin_state;
            pool.loadbalancer_pool_properties['loadbalancer_method'] = model.pool_method;
            if(model.pool_session_persistence !== ''){
                if(model.pool_session_persistence === 'APP_COOKIE'){
                    if(model.persistence_cookie_name !== ''){
                        pool.loadbalancer_pool_properties['persistence_cookie_name'] = model.persistence_cookie_name;
                    }
                }
                pool.loadbalancer_pool_properties['session_persistence'] = model.pool_session_persistence;
            }
            if(model.pool_protocol !== ''){
                pool.loadbalancer_pool_properties['protocol'] = model.pool_protocol;
            }
            if(obj.loadbalancer.loadbalancer_provider === 'opencontrail'){
                isCustom = true;
            }else if(obj.loadbalancer.lbProvider === 'opencontrail'){
                isCustom = true;
            }
            if(isCustom){
                var customObj = {}, customObjList = [];
                if(model.global_max_conn_attr !== ''){
                    customObjList.push({key : 'max_conn', value : model.global_max_conn_attr});
                }
                if(model.global_max_conn_rate_attr !== ''){
                    customObjList.push({key : 'max_conn_rate', value : model.global_max_conn_rate_attr});
                }
                if(model.global_max_sess_rate_attr !== ''){
                    customObjList.push({key : 'max_sess_rate', value : model.global_max_sess_rate_attr});
                }
                if(model.global_max_ssl_conn_aatr !== ''){
                    customObjList.push({key : 'max_ssl_conn', value : model.global_max_ssl_conn_aatr});
                }
                if(model.global_max_ssl_rate_attr !== ''){
                    customObjList.push({key : 'max_ssl_rate', value : model.global_max_ssl_rate_attr});
                }
                if(model.global_ssl_ciphers_attr !== ''){
                    customObjList.push({key : 'ssl_ciphers', value : model.global_ssl_ciphers_attr});
                }
                if(model.global_tune_http_max_header_attr !== ''){
                    customObjList.push({key : 'tune_http_max_header', value : model.global_tune_http_max_header_attr});
                }
                if(model.global_tune_ssl_max_record_attr !== ''){
                    customObjList.push({key : 'tune_ssl_max_record', value : model.global_tune_ssl_max_record_attr});
                }
                if(model.default_server_timeout_attr !== ''){
                    customObjList.push({key : 'server_timeout', value : model.default_server_timeout_attr});
                }
                if(model.default_client_timeout_attr !== ''){
                    customObjList.push({key : 'client_timeout', value : model.default_client_timeout_attr});
                }
                if(model.default_connect_timeout_attr !== ''){
                    customObjList.push({key : 'connect_timeout', value : model.default_connect_timeout_attr});
                }
                if(model.frontend_rate_limit_sessions_attr !== ''){
                    customObjList.push({key : 'rate_limit_sessions', value : model.frontend_rate_limit_sessions_attr});
                }
                if(model.frontend_http_server_close_attr){
                    customObjList.push({key : 'http_server_close', value : 'true'});
                }
                if(customObjList.length > 0){
                    customObj['key_value_pair'] = customObjList;
                    pool.loadbalancer_pool_custom_attributes = customObj;
                }
            }
            obj['loadbalancer-pool'] = pool;

            if(poolMember.length > 0){
                var poolStack = [];
                _.each(poolMember, function(poolObj) {
                    var obj = {};
                    obj.name = poolObj.pool_name();
                    obj.parent_type = "loadbalancer-pool";
                    var memberfqName = [];
                    memberfqName.push(contrail.getCookie(cowc.COOKIE_DOMAIN));
                    memberfqName.push(contrail.getCookie(cowc.COOKIE_PROJECT));
                    memberfqName.push(poolObj.pool_name());
                    obj.fq_name = memberfqName;
                    obj.loadbalancer_member_properties = {};
                    obj.loadbalancer_member_properties['address'] = poolObj.pool_member_ip_address();
                    obj.loadbalancer_member_properties['protocol_port'] = Number(poolObj.pool_member_port());
                    obj.loadbalancer_member_properties['weight'] = Number(poolObj.pool_member_weight());
                    obj.loadbalancer_member_properties['subnet_id'] = poolObj.pool_member_subnet().split(';')[0];
                    obj.loadbalancer_member_properties['admin_state'] = poolObj.pool_member_admin_state();
                    poolStack.push(obj);
                });
                obj['loadbalancer-member'] = poolStack;
            }
            // Monitor
            var monitor = {};
            monitor.name = '';
            var monitorFqName = [];
            monitorFqName.push(contrail.getCookie(cowc.COOKIE_DOMAIN));
            monitorFqName.push(contrail.getCookie(cowc.COOKIE_PROJECT));
            monitorFqName.push('');
            monitor.fq_name = monitorFqName;
            monitor["parent_type"] = "project";
            monitor.loadbalancer_healthmonitor_properties = {};
            monitor.loadbalancer_healthmonitor_properties['delay'] = Number(model.health_check_interval);
            monitor.loadbalancer_healthmonitor_properties['max_retries'] = Number(model.retry_count);
            monitor.loadbalancer_healthmonitor_properties['monitor_type'] = model.monitor_type;
            monitor.loadbalancer_healthmonitor_properties['timeout'] = Number(model.timeout);
            monitor.loadbalancer_healthmonitor_properties['admin_state'] =  model.monitor_admin_state;
            if(model.monitor_type === 'HTTP'){
                monitor.loadbalancer_healthmonitor_properties['url_path'] = model.monitor_url_path;
                monitor.loadbalancer_healthmonitor_properties['expected_codes'] = model.monitor_http_status_code;
                monitor.loadbalancer_healthmonitor_properties['http_method'] = model.monitor_http_method;
            }
            obj['loadbalancer-healthmonitor'] = monitor;

            if(isListener){
                ajaxConfig.url = '/api/tenants/config/lbaas/listener';
            }else{
                ajaxConfig.url = '/api/tenants/config/lbaas/load-balancer';
            }
            ajaxConfig.type  = 'POST';
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
    return lbCfgModel;
});
