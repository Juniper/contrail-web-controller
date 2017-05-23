/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var tagModel = ContrailModel.extend({
        defaultConfig: {
        	"uuid": "",
            "name": "",
            "parent_uuid": "",
            "parent_type": "",
            "tag_id": 0,
            "tag_value": "",
            "tag_type": ""
        },
        formatModelConfig: function(modelConfig) {
            return modelConfig;
        },
        validations: {
        	tagValidation: {
                'tag_type' : function(value, attr, finalObj) {
                    if(value === null || value.trim() === '') {
                        return "Enter a Tag Type";
                    }
                },
                'tag_value': function(value, attr, finalObj) {
                    if(value === null || value.trim() === '') {
                        return "Enter a Value";
                    }
                }
            }
        },
        deleteTag: function (checkedRows, callbackObj) {
            var ajaxConfig = {};
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'tag',
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
        addEditTag: function (callbackObj, options) {
            var ajaxConfig = {}, returnFlag = true,updatedVal = {};
            var self = this;
            var validations = [
                {
                    key : null,
                    type : cowc.OBJECT_TYPE_MODEL,
                    getValidation : "tagValidation"
                }];
            if (self.isDeepValid(validations)) {
	            var newTagData = $.extend(true,{},this.model().attributes);
	                delete(newTagData.locks);
	                delete(newTagData.elementConfigMap);
	                delete(newTagData.errors);
	                delete(newTagData.parent_uuid);
	                delete(newTagData.parent_type);
	                delete(newTagData.tag_id);
	                delete(newTagData.name);
	                newTagData.fq_name = [];
	            	var name = newTagData.tag_type + '-'+ newTagData.tag_value;
	            	
	            	if(options.isGlobal) {
	            	    newTagData.fq_name.push(name);
	            	} else {
	            	    newTagData.fq_name.push(contrail.getCookie(cowc.COOKIE_DOMAIN_DISPLAY_NAME));
	            	    newTagData.fq_name.push(contrail.getCookie(cowc.COOKIE_PROJECT_DISPLAY_NAME));
	            	    newTagData.fq_name.push(name);
	            	    newTagData.parent_type = 'project';
	            	}
	                if (options.mode == 'add') {
	                	delete(newTagData.uuid);
	                	var postData = {"data":[{"data":{"tag": newTagData},
	                                "reqUrl": "/tags"}]};
	                    ajaxConfig.url = ctwc.URL_CREATE_CONFIG_OBJECT;
	                } else {
	                	delete(newTagData.cgrid);
	                    delete(newTagData.display_name);
	                    delete(newTagData.href);
	                    delete(newTagData.id_perms);
	                    delete(newTagData.perms2);
	                    delete(newTagData.tag_type);
	                    updatedVal.tag_value = newTagData.tag_value;
	                    updatedVal.fq_name = newTagData.fq_name;
	                	var postData = {"data":[{"data":{"tag": updatedVal},
	                                "reqUrl": "/tag/" +
	                                newTagData.uuid}]};
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
	         }else {
	                if (contrail.checkIfFunction(callbackObj.error)) {
	                    callbackObj.error(this.getFormErrorText(ctwc.SEC_POLICY_TAG_PREFIX_ID));
	                }
	            }
        }   
    });
    return tagModel;
});
