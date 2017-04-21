/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model'
], function (_, ContrailConfigModel) {
    var imageModel = ContrailConfigModel.extend({

        defaultConfig: {
            'container_format': 'ami',
            'description': '',
            'disk_format': 'raw',
            'id': '',
            'is_public': false,
            'min_disk': 0,
            'min_ram': 0,
            'name': '',
            'protected': false,
            'tenant_id': '',
            'url': ''
        },

        formatModelConfig: function (modelConfig) {
            return modelConfig;
        },
        addEditImage: function (callbackObj, mode) {
            var ajaxConfig = {}, returnFlag = true;
            var newImageData = $.extend(true,{},this.model().attributes);
                delete(newImageData.elementConfigMap);
                delete(newImageData.tenant_id);
                delete(newImageData.errors);
                delete(newImageData.locks);
                newImageData.min_disk = parseInt(newImageData.min_disk);
                newImageData.min_ram = parseInt(newImageData.min_ram);
                var postData = {}, type = "", url = "";
                if(mode === 'POST'){
                    type = "POST";
                    url = ctwc.GOHAN_IMAGES;
                    postData["image"] = {};
                    postData["image"] = newImageData;
                }else{
                    type = "PUT";
                    url = ctwc.GOHAN_IMAGES + '/' + newImageData.id;
                    postData["image"] = {};
                    postData["image"] = {description : newImageData.description};
                }
                delete(newImageData.id);
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
        deleteImage: function(selectedGridData, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var type = "DELETE";
            var url = ctwc.GOHAN_IMAGES + '/' + selectedGridData.id;
            var postData = {};
            postData["image"] = {};
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
