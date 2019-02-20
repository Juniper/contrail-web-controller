/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var configNodeModel = ContrailModel.extend({
        defaultConfig: {
            'name': '',
            'fq_name': null,
            'display_name': '',
            'parent_type': 'global-system-config',
            'config_node_ip_address': null
        },

        formatModelConfig : function(modelConfig) {
            modelConfig['display_name'] =
                ctwu.getDisplayNameOrName(modelConfig);
            return modelConfig;
        },

        addEditConfigNodeCfg: function (callbackObj, ajaxMethod) {
            var ajaxConfig = {}, returnFlag = false,
                postConfigNodeData = {},
                newConfigNodeData,
                self  = this,
                validations = [
                    {
                        key : null,
                        type : cowc.OBJECT_TYPE_MODEL,
                        getValidation : "configNodeValidations"
                    }
                ];

            if (this.isDeepValid(validations)) {
                newConfigNodeData = $.extend(true,
                        {}, this.model().attributes);

                ctwu.setNameFromDisplayName(newConfigNodeData);

                if(newConfigNodeData["fq_name"] === null ||
                    !newConfigNodeData["fq_name"].length) {
                    newConfigNodeData["fq_name"] =
                        [
                            'default-global-system-config',
                            newConfigNodeData["name"]
                        ];
                }

                ctwu.deleteCGridData(newConfigNodeData);
                delete newConfigNodeData.id_perms;

                postConfigNodeData = {"config-node": newConfigNodeData};
                if(ajaxMethod === "POST") {
                    ajaxConfig.url = ctwc.URL_CREATE_CONFIG_OBJECT;
                } else {
                    ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
                }

                ajaxConfig.type  = "POST";
                ajaxConfig.data  = JSON.stringify(postConfigNodeData);

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
                            ctwc.CONFIG_NODE_PREFIX_ID));
                }
            }

            return returnFlag;
        },

        deleteConfigNodes : function(checkedRows, callbackObj) {
            var ajaxConfig = {}, that = this;
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'config-node',
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
            configNodeValidations: {
                'display_name': {
                    required: true,
                    msg: 'Enter Config Node Name'
                },

                'config_node_ip_address': {
                    required: true,
                    pattern: cowc.PATTERN_IP_ADDRESS,
                    msg: 'Enter valid IP Address'
                }
            }
        },
    });
    return configNodeModel;
});

