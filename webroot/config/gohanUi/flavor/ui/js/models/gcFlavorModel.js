/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model'
], function (_, ContrailConfigModel) {
    var flavorModel = ContrailConfigModel.extend({

        defaultConfig: {
            'description': '',
            'disk': 0,
            'ephemeral': 0,
            'id': '',
            'name': '',
            'ram': 0,
            'swap': 0,
            'tenant_id': '',
            'vcpus': 0
        },

        formatModelConfig: function (modelConfig) {
            return modelConfig;
        },
        addEditFlavor: function (callbackObj, mode) {
            var ajaxConfig = {}, returnFlag = true;
            var newFlavorData = $.extend(true,{},this.model().attributes);
                delete(newFlavorData.locks);
                delete(newFlavorData.tenant_id);
                delete(newFlavorData.errors);
                newFlavorData.disk = parseInt(newFlavorData.disk);
                newFlavorData.ephemeral = parseInt(newFlavorData.ephemeral);
                newFlavorData.ram = parseInt(newFlavorData.ram);
                newFlavorData.swap = parseInt(newFlavorData.swap);
                newFlavorData.vcpus = parseInt(newFlavorData.vcpus);
                var postData = {}, type = "", url = "";
                if(mode === 'POST'){
                    type = "POST";
                    url = ctwc.GOHAN_FLAVOR_URL;
                    postData["flavor"] = {};
                    postData["flavor"] = newFlavorData;
                }else{
                    type = "PUT";
                    url = ctwc.GOHAN_FLAVOR_URL + '/' + newFlavorData.id;
                    postData["flavor"] = {};
                    postData["flavor"] = {description : newFlavorData.description};
                }
                delete(newFlavorData.id);
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
        deleteFlavor: function(selectedGridData, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var type = "DELETE";
            var url = ctwc.GOHAN_FLAVOR_URL + '/' + selectedGridData.id;
            var postData = {};
            postData["flavor"] = {};
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
    return flavorModel;
});
