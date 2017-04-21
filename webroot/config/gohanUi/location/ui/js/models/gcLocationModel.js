/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model'
], function (_, ContrailConfigModel) {
    var imageModel = ContrailConfigModel.extend({

        defaultConfig: {
            'address': '',
            'contrail_endpoint': '',
            'contrail_webui': '',
            'description': '',
            'id': '',
            'keystone_endpoint': '',
            'name': '',
            'region': '',
            'tenant_id': '',
            'webui': ''
        },

        formatModelConfig: function (modelConfig) {
            return modelConfig;
        },
        addEditLocation: function (callbackObj, mode) {
            var ajaxConfig = {}, returnFlag = true;
            var newLocationData = $.extend(true,{},this.model().attributes);
                delete(newLocationData.tenant_id);
                delete(newLocationData.errors);
                delete(newLocationData.locks);
                var postData = {}, type = "", url = "";
                if(mode === 'POST'){
                    type = "POST";
                    url = ctwc.GOHAN_LOCATION;
                    postData["location"] = {};
                    postData["location"] = newLocationData;
                }else{
                    delete(newLocationData.name);
                    type = "PUT";
                    url = ctwc.GOHAN_LOCATION + '/' + newLocationData.id;
                    postData["location"] = {};
                    postData["location"] = newLocationData;
                    delete(newLocationData.cgrid);
                }
                delete(newLocationData.id);
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
        deleteLocation: function(selectedGridData, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var type = "DELETE";
            var url = ctwc.GOHAN_LOCATION + '/' + selectedGridData.id;
            var postData = {};
            postData["location"] = {};
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
    return imageModel;
});
