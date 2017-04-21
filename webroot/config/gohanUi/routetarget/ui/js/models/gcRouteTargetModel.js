/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model'
], function (_, ContrailConfigModel) {
    var idPoolModel = ContrailConfigModel.extend({

        defaultConfig: {
            'network_id': '',
            'route_target': 0
        },

        formatModelConfig: function (modelConfig) {
            return modelConfig;
        },
        addRouteTarget: function (callbackObj) {
            var ajaxConfig = {}, returnFlag = true;
            var newRouteTargetData = $.extend(true,{},this.model().attributes);
                delete(newRouteTargetData.locks);
                delete(newRouteTargetData.errors);
                delete(newRouteTargetData.elementConfigMap);
                newRouteTargetData.route_target = parseInt(newRouteTargetData.route_target);
                var postData = {}, type = "", url = "";
                type = "POST";
                url = ctwc.GOHAN_ROUTE_TARGET;
                postData["route_target_association"] = {};
                postData["route_target_association"] = newRouteTargetData;
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
        deleteRouteTarget: function(selectedGridData, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var type = "DELETE";
            var url = ctwc.GOHAN_ROUTE_TARGET + '/' + selectedGridData.id;
            var postData = {};
            postData["route_target_association"] = {};
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
