/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/infra/globalconfig/ui/js/globalConfig.utils',
    'config/infra/globalconfig/ui/js/models/vRouterEncryptionTunnelMeshModel'
], function (_, ContrailModel, GlobalConfigUtils,TunnelMeshModel) {
    var gcUtils = new GlobalConfigUtils();
    var vRouterEncryptionModel = ContrailModel.extend({
        defaultConfig: {
        		"encryption_mode": "none",
        		"select_all_endpoints": true,
        		"encryption_tunnel_endpoints": {
                    "endpoint": []
                }
        },
        formatModelConfig: function(modelConfig) {
        	 	var ipsModels = [];
            var ipsCollectionModel;
            modelConfig['encryption_mode'] = getValueByJsonPath(modelConfig,
                    'encryption_mode', 0, null);
            var endPoints = getValueByJsonPath(modelConfig,
                    "encryption_tunnel_endpoints;endpoint", []);
            var vRouterList = getValueByJsonPath(modelConfig, "vrouter", []);
           for(var i = 0; i < endPoints.length; i++){
        	   		var ipAddress={};
        	   		addr = endPoints[i]['tunnel_remote_ip_address']+cowc.DROPDOWN_VALUE_SEPARATOR+'virtual_router_ip_address';
        	   		if(vRouterList != undefined || vRouterList.length > 0  ){
	                	  _.each(vRouterList, function(vRouter) {
	                		  if(endPoints[i]['tunnel_remote_ip_address'] ==  vRouter.key){
	                			  addr = endPoints[i]['tunnel_remote_ip_address'];
	                		  }
	                	  });
                }
        	   		var ipObj = {tunnel_remote_ip_address: addr.trim()};
        	   		var ipModel = new TunnelMeshModel(ipObj);
        	   		ipsModels.push(ipModel);
            }
            ipsCollectionModel = new Backbone.Collection(ipsModels);
            modelConfig['encryption_tunnel_endpoints'] = ipsCollectionModel;
            return modelConfig;
        },
        deleteTunnelMeshIPs: function(data, ips) {
            var ipsCollection = data.model().collection,
                delIPs = ips.model();
            ipsCollection.remove(delIPs);
        },
        addTunnelMeshIPByIndex: function(data,ips) {
           var selectedIPsIndex = data.model().collection.indexOf(ips.model());
           var ips = this.model().attributes['encryption_tunnel_endpoints'];
           var newMesh = new TunnelMeshModel(
                { tunnel_remote_ip_address: ''+cowc.DROPDOWN_VALUE_SEPARATOR+'virtual_router_ip_address'});
           ips.add([newMesh],{at: selectedIPsIndex+1});
        },

        addTunnelMeshIP: function() {
        	 	var ips = this.model().attributes['encryption_tunnel_endpoints'];
        	 	var newIPs = new TunnelMeshModel(
                { tunnel_remote_ip_address: ''+cowc.DROPDOWN_VALUE_SEPARATOR+'virtual_router_ip_address'});
           	ips.add([newIPs]);
        },
        validations: {
        		vrouterEncryptionValidations: {
        			 'encryption_mode' : function(val, attr, data) {
        	                    if (val.trim() == "") {
        	                        return "Select a valid Traffic Encrypt.";
        	                    }
        			 },
        			 'select_all_endpoints' : function(val, attr, data) {
        				 //var endpoints = data.encryption_tunnel_endpoints.models;
        				 var endPoints =[];
        				 var ipsModels = [];
        				  	var vRouterList = vrouter.vRouterList;
        		           for(var i = 0; i < vRouterList.length; i++){
        		        	   		var ipAddress={};
        		        	   		if(vRouterList != undefined || vRouterList.length > 0  ){
        			                	  _.each(vRouterList, function(vRouter) {
        			                		 
        			                			  addr = vRouter.key;

        			                	  });
        		                }
        		        	   		var ipObj = {tunnel_remote_ip_address: addr.trim()};
        		        	   		var ipModel = new TunnelMeshModel(ipObj);
        		        	   		ipsModels.push(ipModel);
        		            }
        		           data.encryption_tunnel_endpoints = new Backbone.Collection(ipsModels);
        		            console.log(val);
        			 }
        		}
        },
        getEndpoints: function(attr) {
        		var endPoints = [];
        		var tunnelMeshCollection = attr.encryption_tunnel_endpoints.toJSON();
        		var vrCnt = tunnelMeshCollection.length; 
        		for (var i = 0; i < vrCnt; i++) {
        			  var ipAddress = tunnelMeshCollection[i].tunnel_remote_ip_address().split(';')[0];
	            	  console.log(ipAddress +" : Remote Address:"+ tunnelMeshCollection[i].tunnel_remote_ip_address());
	            	  if(gcUtils.validateIP(ipAddress)){
	            		  endPoints.push({tunnel_remote_ip_address: ipAddress});
	            	  }
        		}
        		return endPoints;
        },
        configureVRouterEncryption: function (callbackObj) {
            var self = this, ajaxConfig = {}, returnFlag = false,
                newVRouterEncryptionConfig, putData = {}, vEncryptData = {},
                validations = [
                    {
                        key: null,
                        type: cowc.OBJECT_TYPE_MODEL,
                        getValidation: "vrouterEncryptionValidations"
                    }
                ];
            if(self.isDeepValid(validations)) {
	            newVRouterEncryptionConfig = $.extend({}, true, self.model().attributes);
                vEncryptData['global-vrouter-config'] = {};
                ajaxConfig = {};
                
                vEncryptData['global-vrouter-config']['encryption_mode']= newVRouterEncryptionConfig.encryption_mode;
                vEncryptData['global-vrouter-config']['encryption_tunnel_endpoints']={};
                
                vEncryptData['global-vrouter-config']['encryption_tunnel_endpoints'] = {};
                vEncryptData['global-vrouter-config']['encryption_tunnel_endpoints']['endpoint'] = [];
                
                var ipList = self.getEndpoints(newVRouterEncryptionConfig);
                
                vEncryptData['global-vrouter-config']['encryption_tunnel_endpoints']['endpoint'] = ipList;

                if (null != newVRouterEncryptionConfig['uuid']) {
                		vEncryptData['global-vrouter-config']['uuid'] = newVRouterEncryptionConfig['uuid'];
                    putData = {
                    				"global-vrouter-config": vEncryptData["global-vrouter-config"]
                    			};
                }
                ajaxConfig.type = "POST";
                ajaxConfig.data = JSON.stringify(putData);
                ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
                contrail.ajaxHandler(ajaxConfig, function () {
                    if (contrail.checkIfFunction(callbackObj.init)) {
                        callbackObj.init();
                    }
                }, 
                function (response) {
                    if (contrail.checkIfFunction(callbackObj.success)) {
                        callbackObj.success();
                    }
                    returnFlag = true;
                }, 
                function (error) {
                    if (contrail.checkIfFunction(callbackObj.error)) {
                        callbackObj.error(error);
                    }
                    returnFlag = false;
                });
            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(ctwc.GLOBAL_VROUTER_ENCRYPTION_PREFIX_ID));
                }
            }
            return returnFlag;   
        }
    });
    return vRouterEncryptionModel;
});

