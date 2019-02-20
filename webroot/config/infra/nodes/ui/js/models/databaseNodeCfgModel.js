/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var databaseNodeModel = ContrailModel.extend({
        defaultConfig: {
            'name': '',
            'fq_name': null,
            'display_name': '',
            'parent_type': 'global-system-config',
            'database_node_ip_address': null
        },

        formatModelConfig : function(modelConfig) {
            modelConfig['display_name'] =
                ctwu.getDisplayNameOrName(modelConfig);
            return modelConfig;
        },

        addEditDatabaseNodeCfg: function (callbackObj, ajaxMethod) {
            var ajaxConfig = {}, returnFlag = false,
                postDatabaseNodeData = {},
                newDatabaseNodeData,
                self  = this,
                validations = [
                    {
                        key : null,
                        type : cowc.OBJECT_TYPE_MODEL,
                        getValidation : "databaseNodeValidations"
                    }
                ];

            if (this.isDeepValid(validations)) {
                newDatabaseNodeData = $.extend(true,
                        {}, this.model().attributes);

                ctwu.setNameFromDisplayName(newDatabaseNodeData);

                if(newDatabaseNodeData["fq_name"] === null ||
                    !newDatabaseNodeData["fq_name"].length) {
                    newDatabaseNodeData["fq_name"] =
                        [
                            'default-global-system-config',
                            newDatabaseNodeData["name"]
                        ];
                }

                ctwu.deleteCGridData(newDatabaseNodeData);
                delete newDatabaseNodeData.id_perms;

                postDatabaseNodeData = {"database-node": newDatabaseNodeData};
                if(ajaxMethod === "POST") {
                    ajaxConfig.url = ctwc.URL_CREATE_CONFIG_OBJECT;
                } else {
                    ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
                }

                ajaxConfig.type  = "POST";
                ajaxConfig.data  = JSON.stringify(postDatabaseNodeData);

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
                            ctwc.DATABASE_NODE_PREFIX_ID));
                }
            }

            return returnFlag;
        },

        deleteDatabaseNodes : function(checkedRows, callbackObj) {
            var ajaxConfig = {}, that = this;
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'database-node',
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
            databaseNodeValidations: {
                'display_name': {
                    required: true,
                    msg: 'Enter Database Node Name'
                },

                'database_node_ip_address': {
                    required: true,
                    pattern: cowc.PATTERN_IP_ADDRESS,
                    msg: 'Enter valid IP Address'
                }
            }
        },
    });
    return databaseNodeModel;
});

