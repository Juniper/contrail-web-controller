/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model'
], function (_, ContrailConfigModel) {
    var serviceGroupModel = ContrailConfigModel.extend({
        defaultConfig: {
            'name': '',
            'firewall_policy': ''
        },
        formatModelConfig: function(modelConfig) {
//        	var policyRef = getValueByJsonPath(modelConfig, "firewall_policy_refs", []);
//		     if (policyRef.length > 0) {
//		    	 var uuidList = [];
//		    	 for(var i = 0; i < policyRef.length; i++){
//		    		 uuidList.push(policyRef[i].to.join(':'));
//		    	 }
//		         modelConfig["firewall_policy"] = uuidList.join(cowc.DROPDOWN_VALUE_SEPARATOR);
//		     } else {
//		         modelConfig["firewall_policy"] = null;
//		     }
             modelConfig["firewall_policy"] = polRefFormatter(modelConfig);
		     this.formatRBACPermsModelConfig(modelConfig);
        	return modelConfig;
        },
        deleteApplicationPolicy: function (checkedRows, callbackObj) {
            var ajaxConfig = {};
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'application-policy-set',
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
        	applicationPolicyValidation: {
                'name': {
                    required: true,
                    msg: 'Enter a valid Application Policy Set.'
                }
            }
        },
        addEditApplicationPolicy: function (callbackObj, options) {
            var ajaxConfig = {}, returnFlag = true,updatedVal = {};
            var updatedModel = {},policyList = [];
            var self = this;
            var validations = [
                {
                    key : null,
                    type : cowc.OBJECT_TYPE_MODEL,
                    getValidation : "applicationPolicyValidation"
                }];
            if (self.isDeepValid(validations)) {
	            var model = $.extend(true,{},this.model().attributes);
		            if(model.firewall_policy !== null && model.firewall_policy !== ''){
		            	var firewallPolicy = model.firewall_policy.split(';');
		                for(var j = 0; j < firewallPolicy.length;j++){
		                	var obj = {};
		                	var to = firewallPolicy[j].split(':');
		                	obj.to = to;
		                	obj.attr = {};
		                	obj.attr.sequence = j.toString();
		                	policyList.push(obj);
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
	                this.updateRBACPermsAttrs(model);
	                updatedModel.tag_refs = model.tag_refs;
	                updatedModel.firewall_policy_refs = policyList;
                    if (null != model.uuid) {
                        updatedModel.uuid = model.uuid;
                    }
                    var postData = {"application-policy-set": updatedModel};
	                if (options.mode == 'add') {
	                    ajaxConfig.url = ctwc.URL_CREATE_CONFIG_OBJECT;
	                } else {
	                    delete postData["application-policy-set"].name;
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
                    callbackObj.error(this.getFormErrorText(ctwc.FIREWALL_APPLICATION_POLICY_PREFIX_ID));
                }
            }
        }
    });
    function polRefFormatter (dc) {
        var polArr = [];
        var pols   =
            getValueByJsonPath(dc, 'firewall_policy_refs', []);

        if (!pols.length) {
            return '-';
        }

        var sortedPols = 
         _.sortBy(pols, function (pol) {
             var sequence =
                Number(getValueByJsonPath(pol, 'attr;sequence', 0));
             return ((1 + sequence) * 100000 ) - sequence;
        });

        pLen = pols.length;

        $.each(sortedPols,
            function (i, obj) {
                polArr.push(obj.to.join(':'));
            }
        );

        return polArr;
    };
    return serviceGroupModel;
});
