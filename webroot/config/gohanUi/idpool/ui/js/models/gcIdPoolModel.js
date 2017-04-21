/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model'
], function (_, ContrailConfigModel) {
    var idPoolModel = ContrailConfigModel.extend({

        defaultConfig: {
            'assigned': false,
            'end': 0,
            'name': '',
            'start': 0
        },

        formatModelConfig: function (modelConfig) {
            return modelConfig;
        },
        addIdPool: function (callbackObj) {
            var ajaxConfig = {}, returnFlag = true;
            var newIdPoolData = $.extend(true,{},this.model().attributes);
                delete(newIdPoolData.locks);
                delete(newIdPoolData.errors);
                newIdPoolData.start = parseInt(newIdPoolData.start);
                newIdPoolData.end = parseInt(newIdPoolData.end);
                var postData = {}, type = "", url = "";
                type = "POST";
                url = ctwc.GOHAN_ID_POOL;
                postData["id_pool"] = {};
                postData["id_pool"] = newIdPoolData;
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
        deleteIdPool: function(selectedGridData, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var type = "DELETE";
            var url = ctwc.GOHAN_ID_POOL + '/' + selectedGridData.id;
            var postData = {};
            postData["id_pool"] = {};
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
    return idPoolModel;
});
