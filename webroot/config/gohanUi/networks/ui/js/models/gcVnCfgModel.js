/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model'
], function (_, ContrailConfigModel) {
    var vnCfgModel = ContrailConfigModel.extend({

        defaultConfig: {
            "cidr": "",
            "contrail_id": 0,
            "description": "",
            "id": "",
            "local_prefix_len": 0,
            "name": "",
            "policies": '',
            "tenant_id": ""
        },

        formatModelConfig: function (modelConfig) {
            return modelConfig;
        },
        deleteVNCfg : function(selectedGridData, callbackObj){
            var ajaxConfig = {}, returnFlag = false;
            var model = {};
            model['network'] = {};
            ajaxConfig.type = "DELETE";
            ajaxConfig.data = JSON.stringify(model);
            ajaxConfig.url = ctwc.GOHAN_NETWORK + '/' + selectedGridData['id'];
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
        },
        addEditVNCfg : function(callbackObj, mode){
            var ajaxConfig = {}, returnFlag = true;
            var newNetworkData = $.extend(true,{},this.model().attributes), newPoliceyRule = [];
                delete(newNetworkData.contrail_id);
                delete(newNetworkData.locks);
                delete(newNetworkData.tenant_id);
                delete(newNetworkData.elementConfigMap);
                delete(newNetworkData.errors);
                if(newNetworkData.policies !== '' && newNetworkData.policies !== undefined){
                    var arr = newNetworkData.policies.split(';');
                    newNetworkData.policies = arr;
                }else{
                    newNetworkData.policies = [];
                }
                var prefixLength = newNetworkData.local_prefix_len;
                newNetworkData.local_prefix_len = parseInt(prefixLength);
                var postData = {};
                var type = "";
                var url = "";
                if(mode === 'POST'){
                    type = "POST";
                    url = ctwc.GOHAN_NETWORK;
                }else{
                    type = "PUT";
                    url = ctwc.GOHAN_NETWORK + '/' + newNetworkData.id;
                    delete(newNetworkData.cgrid);
                    delete(newNetworkData.name);
                    delete(newNetworkData.local_prefix_len);
                    delete(newNetworkData.cidr);
                }
                delete(newNetworkData.id);
                postData["network"] = {};
                postData["network"] = newNetworkData;
                ajaxConfig = {};
                ajaxConfig.type = type;
                ajaxConfig.data = JSON.stringify(postData);
                ajaxConfig.url = url;
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
        }

    });
    return vnCfgModel;
});
