/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/firewall/common/addressgroup/ui/js/models/addressPrefixModel'
], function (_, ContrailConfigModel, AddressRoleModel) {
    var serviceGroupModel = ContrailConfigModel.extend({
        defaultConfig: {
            'uuid': '',
            'name': '',
            'Labels':'',
            'role_entries':{"roles":[]},
            'parent_type': 'policy-management',
            'parent_uuid': '',
            'address_group_prefix': {
                'subnet': [
                ]
              }
        },
        formatModelConfig: function(modelConfig) {
            var roleModels = [];
            deletedRule = [],rule_obj = {};
            var list = modelConfig["address_group_prefix"];
            var subnetList = list['subnet'];
            if (subnetList != null && subnetList.length > 0) {
                for (var i = 0; i < subnetList.length; i++) {
                	rule_obj = subnetList[i];
                    var roleModel = new AddressRoleModel(rule_obj);
                    roleModels.push(roleModel)
                }
            }
            var subnetCollectionModel = new Backbone.Collection(roleModels);
            modelConfig['subnetCollection'] = subnetCollectionModel;
            modelConfig["role_entries"]["roles"] = subnetCollectionModel;
            this.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },
        addSubnet: function(){
            var subnetList = this.model().attributes['subnetCollection'],
            newAddressRoleModel = new AddressRoleModel();
            subnetList.add([newAddressRoleModel]);
        },
        deleteSubnet: function(data, role) {
            var roleCollection = data.model().collection,
            delRole = role.model();
            var model = $.extend(true,{},delRole.attributes);
            roleCollection.remove(delRole);
        },
        deleteAddressGroup: function (checkedRows, callbackObj) {
            var ajaxConfig = {};
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'address-group',
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
        	addressGroupValidation: {
                'name': {
                    required: true,
                    msg: 'Enter a valid Address Group Name.'
                }
            }
        },
        addEditAddressGroup: function (callbackObj, options) {
            var ajaxConfig = {}, returnFlag = true,updatedVal = {};
            var self = this;
            var updatedModel = {},subnetList = [];
            var validations = [
                {
                    key : null,
                    type : cowc.OBJECT_TYPE_MODEL,
                    getValidation : "addressGroupValidation"
                },
                {
                    key: 'subnetCollection',
                    type: cowc.OBJECT_TYPE_COLLECTION,
                    getValidation: 'addressPrefixConfigValidations'
                }];
            if (self.isDeepValid(validations)) {
		            var model = $.extend(true,{},this.model().attributes);
		            var role = $.extend(true,{},model.role_entries.roles);
		            var collection = role.toJSON();
		                for(var j = 0; j < collection.length;j++){
		                	if(collection[j].prefix() !== ''){
		                		var role = collection[j].prefix().split('/');
			                	if(role.length < 2){
			                		role.push('32');
			                	}
			                	var ipPrefix = role[0].trim();
			                	var ipPrefixLen = role[role.length-1].trim();
			                	var subnetObj = {};
			                	subnetObj.ip_prefix = ipPrefix;
			                	subnetObj.ip_prefix_len = ipPrefixLen;
			                	subnetList.push(subnetObj);
		                	}
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
		                updatedModel.address_group_prefix = {};
		                updatedModel.address_group_prefix.subnet = subnetList;
                        if (null != model.uuid) {
                            updatedModel.uuid = model.uuid;
                        }
		                this.updateRBACPermsAttrs(model);
	                    updatedModel.tag_refs = model.tag_refs;
	                    updatedModel.Labels = model.Labels;
                        var postData = {"address-group": updatedModel};
		                if (options.mode == 'add') {
		                    ajaxConfig.url = ctwc.URL_CREATE_CONFIG_OBJECT;
		                } else {
		                	delete(updatedModel.name);
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
                    callbackObj.error(this.getFormErrorText(ctwc.SEC_POLICY_ADDRESS_GRP_PREFIX_ID));
                }
            }
        }
    });
    return serviceGroupModel;
});
