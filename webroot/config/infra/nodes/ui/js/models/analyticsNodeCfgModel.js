/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var analyticsNodeModel = ContrailModel.extend({
        defaultConfig: {
            'name': '',
            'fq_name': null,
            'display_name': '',
            'parent_type': 'global-system-config',
            'analytics_node_ip_address': null
        },

        formatModelConfig : function(modelConfig) {
            modelConfig['display_name'] =
                ctwu.getDisplayNameOrName(modelConfig);
            return modelConfig;
        },

        addEditAnalyticsNodeCfg: function (callbackObj, ajaxMethod) {
            var ajaxConfig = {}, returnFlag = false,
                postAnalyticsNodeData = {},
                newAnalyticsNodeData,
                self  = this,
                validations = [
                    {
                        key : null,
                        type : cowc.OBJECT_TYPE_MODEL,
                        getValidation : "analyticsNodeValidations"
                    }
                ];

            if (this.isDeepValid(validations)) {
                newAnalyticsNodeData = $.extend(true,
                        {}, this.model().attributes);

                ctwu.setNameFromDisplayName(newAnalyticsNodeData);

                if(newAnalyticsNodeData["fq_name"] === null ||
                    !newAnalyticsNodeData["fq_name"].length) {
                    newAnalyticsNodeData["fq_name"] =
                        [
                            'default-global-system-config',
                            newAnalyticsNodeData["name"]
                        ];
                }

                ctwu.deleteCGridData(newAnalyticsNodeData);
                delete newAnalyticsNodeData.id_perms;

                var postAnalyticsNodeData = {"analytics-node":
                    newAnalyticsNodeData};
                if(ajaxMethod === "POST") {
                    ajaxConfig.url = ctwc.URL_CREATE_CONFIG_OBJECT;
                } else {
                    ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
                }

                ajaxConfig.type  = "POST";
                ajaxConfig.data  = JSON.stringify(postAnalyticsNodeData);

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
            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(
                            ctwc.ANALYTICS_NODE_PREFIX_ID));
                }
            }

            return returnFlag;
        },

        deleteAnalyticsNodes : function(checkedRows, callbackObj) {
            var ajaxConfig = {}, that = this;
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'analytics-node',
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
            analyticsNodeValidations: {
                'display_name': {
                    required: true,
                    msg: 'Enter Analytics Node Name'
                },

                'analytics_node_ip_address': {
                    required: true,
                    pattern: cowc.PATTERN_IP_ADDRESS,
                    msg: 'Enter valid IP Address'
                }
            }
        },
    });
    return analyticsNodeModel;
});

