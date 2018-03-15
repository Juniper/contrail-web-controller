/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/networking/loadbalancer/ui/js/models/poolMemberCollectionModel',
    'config/networking/loadbalancer/ui/js/views/lbCfgFormatters'
], function (_, ContrailModel, PoolMemberCollectionModel, LbCfgFormatters) {
    var poolMemberModel = ContrailModel.extend({
        defaultConfig: {
            "display_name": "",
            "ip_address":"",
            "description":"",
            "port":"80",
            "weight":"1",
            "admin_state": true,
            "pool_member_subnet": "",
            'pool_member_admin_state': true,
            "status_description": "",
            "loadbalancer_member_properties": {},
            'pool_member': []
        },

        formatModelConfig: function(modelConfig) {
           var poolMemberCollection = [];
           modelConfig["pool_member"] = new Backbone.Collection(poolMemberCollection);
           var protocolPort = getValueByJsonPath(modelConfig,
                    "loadbalancer_member_properties;protocol_port", '');
            if(protocolPort != ''){
                modelConfig["port"] = protocolPort;
            }
            modelConfig["pool_member_admin_state"] = getValueByJsonPath(modelConfig,
                    "loadbalancer_member_properties;admin_state", false);
            var address = getValueByJsonPath(modelConfig,
                    "loadbalancer_member_properties;address", '');
            if(address != ''){
                modelConfig["ip_address"] = address;
            }
            var weight = getValueByJsonPath(modelConfig,
                    "loadbalancer_member_properties;weight", 0);
            if(weight != 0){
                modelConfig["weight"] = weight;
            }
            var description = getValueByJsonPath(modelConfig,
                    "loadbalancer_member_properties;status_description", '');
            if(description != ''){
                modelConfig["status_description"] = description;
            }
            var description = getValueByJsonPath(modelConfig,
                    "id_perms;description", '');
            if(description != ''){
                modelConfig["description"] = description;
            }
            var subnet = getValueByJsonPath(modelConfig,
                    "loadbalancer_member_properties;subnet_id", '');
            if(subnet != ''){
                modelConfig["pool_member_subnet"] = subnet;
            }
            return modelConfig;
        },

        validations: {
            poolListMemberValidation: {
                'weight': function(value, attr, data) {
                   var weight = Number(value);
                   if(weight==""){
                       return " Enter vaild number";
                   }
                }
             }
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
        createPoolMember: function(callbackObj, options){
            var ajaxConfig = {}, returnFlag = true;
            var self = this;
            var poolId = options.poolId;
            var validations = [
                {
                    key : 'pool_member',
                    type : cowc.OBJECT_TYPE_COLLECTION,
                    getValidation : 'poolMemberValidation'
                }
            ];
            if (self.isDeepValid(validations)) {
                var model = $.extend(true,{},this.model().attributes);
                var poolMember = $.extend(true,{},model.pool_member).toJSON();
                var obj = {};
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
                        if(poolObj.pool_member_ip_address() !== ''){
                            obj.loadbalancer_member_properties['address'] = poolObj.pool_member_ip_address();
                        }
                        if(poolObj.pool_member_port() !== ''){
                            obj.loadbalancer_member_properties['protocol_port'] = Number(poolObj.pool_member_port());
                        }
                        if(poolObj.pool_member_weight() !== ''){
                            obj.loadbalancer_member_properties['weight'] = Number(poolObj.pool_member_weight());
                        }
                        if(poolObj.pool_member_admin_state() !== ''){
                            obj.loadbalancer_member_properties['admin_state'] = poolObj.pool_member_admin_state();
                        }
                        if(poolObj.pool_member_subnet() !== ''){
                            var subnet = poolObj.pool_member_subnet();
                            obj.loadbalancer_member_properties['subnet_id'] = subnet;
                        }
                        poolStack.push(obj);
                    });
                    obj['loadbalancer-member'] = poolStack;
                    ajaxConfig.url = '/api/tenants/config/lbaas/pool/' + poolId +'/member';
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
                }else{
                    var errorObj = {};
                    errorObj.responseText = 'Please add the row.'
                    callbackObj.error(errorObj);
                }
            }else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText
                                     (ctwc.CONFIG_LB_POOL_MEMBER_PREFIX_ID));
                }
            }
        },

        updateMember: function(callbackObj){
        		var self = this;
        	 	var validations = [
                 {
                     key : null,
                     type : cowc.OBJECT_TYPE_MODEL,
                     getValidation : 'poolListMemberValidation'
                 }
             ];
             if (self.isDeepValid(validations)) {
	            var ajaxConfig = {};
	            var self = this;
	            var model = $.extend(true,{},this.model().attributes);
	            var obj = {};
	            obj['loadbalancer-member'] = {};
	            obj['loadbalancer-member']['fq_name'] = model.fq_name;
	            obj['loadbalancer-member']['display_name'] = model.display_name;
	            obj['loadbalancer-member']['uuid'] = model.uuid;
	            if(model.description !== ''){
	                model.id_perms.description = model.description;
	                obj['loadbalancer-member'].id_perms = model.id_perms;
	            }
	            model.loadbalancer_member_properties['address'] = model.ip_address;
	            model.loadbalancer_member_properties['weight'] = model.weight;
	            model.loadbalancer_member_properties['protocol_port'] = Number(model.port);
	            model.loadbalancer_member_properties['admin_state'] = model.admin_state;
	            obj['loadbalancer-member']['loadbalancer_member_properties'] = model.loadbalancer_member_properties;
	            ajaxConfig.url = '/api/tenants/config/lbaas/member/'+ model.uuid;
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
                                      (ctwc.CONFIG_LB_POOL_MEMBER_PREFIX_ID));
                 }
             }
        },

        multiDeleteMember: function (checkedRows, callbackObj) {
            var ajaxConfig = {}, that = this;
            var uuidList = [];
            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });
            ajaxConfig.type = "POST";
            ajaxConfig.url = '/api/tenants/config/lbaas/member/delete';
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
    return poolMemberModel;
});