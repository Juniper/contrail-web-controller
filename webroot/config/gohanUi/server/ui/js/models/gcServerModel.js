/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model'
], function (_, ContrailConfigModel) {
    var serverModel = ContrailConfigModel.extend({

        defaultConfig: {
            'description': '',
            'flavor_id': '',
            'id': '',
            'image_id': '',
            'name': '',
            'network_id': '',
            'security_group_id': '',
            'tenant_id': ''
        },

        formatModelConfig: function (modelConfig) {
            return modelConfig;
        },
        addEditServer: function (callbackObj, mode) {
            var ajaxConfig = {}, returnFlag = true;
            var newServerData = $.extend(true,{},this.model().attributes);
                delete(newServerData.locks);
                delete(newServerData.tenant_id);
                delete(newServerData.elementConfigMap);
                delete(newServerData.errors);
                var postData = {}, type = "", url = "";
                if(mode === 'POST'){
                    type = "POST";
                    url = ctwc.GOHAN_SERVER;
                    postData["server"] = {};
                    postData["server"] = newServerData;
                }else{
                    type = "PUT";
                    url = ctwc.GOHAN_SERVER + '/' + newServerData.id;
                    postData["server"] = {};
                    postData["server"] = {description : newServerData.description};
                }
                delete(newServerData.id);
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
        },
        deleteServer: function(selectedGridData, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var type = "DELETE";
            var url = ctwc.GOHAN_SERVER + '/' + selectedGridData.id;
            var postData = {};
            postData["server"] = {};
            ajaxConfig.type = type;
            ajaxConfig.data = JSON.stringify(postData);
            ajaxConfig.url = url;
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                console.log(response);
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
    return serverModel;
});
