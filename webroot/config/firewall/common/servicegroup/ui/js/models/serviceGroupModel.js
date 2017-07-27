/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/firewall/common/servicegroup/ui/js/models/serviceTypeModel'
], function (_, ContrailConfigModel, ServiceTypeModel) {
    var serviceGroupModel = ContrailConfigModel.extend({
        defaultConfig: {
        	'uuid': '',
            'name': '',
            'svcTypes':[],
            'type_entries':{"types":[]},
            'parent_type': 'policy-management',
            'parent_uuid': '',
            'service_group_firewall_service_list': {
                'firewall_service': [
                ]
              }
        },
        formatModelConfig: function(modelConfig) {
        	var ruleModels = [];
            deletedRule = [],rule_obj = {};
            var list = modelConfig["service_group_firewall_service_list"];
            var svcList = list['firewall_service'];
            if (svcList != null && svcList.length > 0) {
                for (var i = 0; i < svcList.length; i++) {
                	rule_obj.protocol = svcList[i].protocol;
                	rule_obj.dst_start_port = svcList[i].dst_ports.start_port;
                	rule_obj.dst_end_port = svcList[i].dst_ports.end_port;
                	rule_obj.src_end_port = svcList[i].src_ports.end_port;
                	rule_obj.src_start_port = svcList[i].src_ports.start_port;
                    var ruleModel = new ServiceTypeModel(rule_obj);
                    ruleModels.push(ruleModel)
                }
            }
            var svcTypeCollectionModel = new Backbone.Collection(ruleModels);
            modelConfig['serviceTypeCollection'] = svcTypeCollectionModel;
            modelConfig["type_entries"]["types"] = svcTypeCollectionModel;
            this.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },
        addSvcType: function(){
            var typeList = this.model().attributes['serviceTypeCollection'],
            newSvcTypeModel = new ServiceTypeModel();
            typeList.add([newSvcTypeModel]);
        },
        deleteSvcType: function(data, rules) {
            var rulesCollection = data.model().collection,
            delRule = rules.model();
            var model = $.extend(true,{},delRule.attributes);
            rulesCollection.remove(delRule);
        },
        deleteServiceGroup: function (checkedRows, callbackObj) {
            var ajaxConfig = {};
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'service-group',
                                              'deleteIDs': uuidList}]);

            ajaxConfig.url = '/api/tenants/config/delete';
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
        },
        validations: {
        	serviceGroupValidation: {
                'name': {
                    required: true,
                    msg: 'Enter a valid Service Group Name.'
                }
            }
        },
        addEditServiceGroup: function (callbackObj, options) {
            var ajaxConfig = {}, returnFlag = true,updatedVal = {};
            var self = this;
            var validations = [
                {
                    key : null,
                    type : cowc.OBJECT_TYPE_MODEL,
                    getValidation : "serviceGroupValidation"
                },
                {
                    key : 'serviceTypeCollection',
                    type : cowc.OBJECT_TYPE_COLLECTION,
                    getValidation : 'serviceCollectionValidation'
                }];
            var updatedModel = {},firewallService = [];
            if (self.isDeepValid(validations)) {
	            var model = $.extend(true,{},this.model().attributes);
	            var type = $.extend(true,{},model.type_entries.types);
	            var collection = type.toJSON();
	                for(var j = 0; j < collection.length;j++){
	                	var obj = {};
	                	var srcStr = collection[j].src_port().toString();
	                    var srcPort = srcStr.split('-');
	                    var dstStr = collection[j].dst_port().toString();
	                    if(dstStr === ''){
	                        dstStr = '0-65535';
	                    }
	                    var dstPort = dstStr.split('-');
	                	if(srcPort[0] === ''){
	                		var srcStartPort = 0;
	                    	var srcEndPort = 0;
	                	}else{
	                		var srcStartPort = parseInt(srcPort[0].trim());
	                    	var srcEndPort = parseInt(srcPort[srcPort.length-1].trim());
	                	}
	                	if(dstPort[0] === ''){
	                		var dstStartPort = 0;
	                    	var dstEndPort = 0;
	                	}else{
	                		var dstStartPort = parseInt(dstPort[0].trim());
	                    	var dstEndPort = parseInt(dstPort[dstPort.length-1].trim());
	                	}
	                	obj.protocol = collection[j].protocol();
	                	obj.dst_ports = {};
	                	obj.dst_ports.end_port = dstEndPort;
	                	obj.dst_ports.start_port = dstStartPort;
	                	obj.src_ports = {};
	                	obj.src_ports.start_port = srcStartPort;
	                	obj.src_ports.end_port = srcEndPort;
	                	firewallService.push(obj);
	                }
	                updatedModel.fq_name = [];
	                if(options.isGlobal) {
	                    updatedModel.fq_name.push('default-policy-management');
	                    updatedModel.fq_name.push(model.name);
	                    updatedModel.parent_type = 'policy-management';
	                } else {
	                    updatedModel.fq_name.push(
	                            contrail.getCookie(cowc.COOKIE_DOMAIN_DISPLAY_NAME));
	                    updatedModel.fq_name.push(
	                            contrail.getCookie(cowc.COOKIE_PROJECT_DISPLAY_NAME));
	                    updatedModel.fq_name.push(model.name);
	                    updatedModel.parent_type = 'project';
	                }
	                updatedModel.name = model.name;
	                updatedModel.service_group_firewall_service_list = {};
	                updatedModel.service_group_firewall_service_list.firewall_service = firewallService;
	                this.updateRBACPermsAttrs(model);
	                updatedModel.tag_refs = model.tag_refs;
	                if (options.mode == 'add') {
	                	var postData = {"data":[{"data":{"service-group": updatedModel},
	                                "reqUrl": "/service-groups"}]};
	                    ajaxConfig.url = ctwc.URL_CREATE_CONFIG_OBJECT;
	                } else {
	                	delete(updatedModel.name);
	                	var postData = {"data":[{"data":{"service-group": updatedModel},
	                                "reqUrl": "/service-group/" +
	                                model.uuid}]};
	                    ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
	                }
	                ajaxConfig.type  = 'POST';
	                ajaxConfig.data  = JSON.stringify(postData);
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
	            return returnFlag;
            }else{
            	if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(ctwc.SEC_POLICY_SERVICE_GRP_PREFIX_ID));
                }
            }
        }
    });
    return serviceGroupModel;
});
