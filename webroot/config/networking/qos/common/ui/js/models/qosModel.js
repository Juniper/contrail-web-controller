/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "underscore",
    "contrail-config-model",
    "config/networking/qos/common/ui/js/models/forwardingClassPairModel",
    "config/infra/globalconfig/ui/js/globalConfig.utils"
], function (_, ContrailConfigModel, FCPairModel, globalConfigUtils) {
    var gcUtils = new globalConfigUtils();
    var rbacModel = ContrailConfigModel.extend({
        defaultConfig: {
            "name": null,
            "fq_name": null,
            "display_name": null,
            "parent_type": null,
            "qos_config_type": null,
            "dscp_entries": {
                "qos_id_forwarding_class_pair": []
            },
            "vlan_priority_entries": {
                "qos_id_forwarding_class_pair": []
            },
            "mpls_exp_entries": {
                "qos_id_forwarding_class_pair": []
            },
            "default_forwarding_class_id": 0
        },

        validations: {
            qosValidations: {
                'display_name': {
                    required: true,
                    msg: "QoS Config Name is required"
                },

                'default_forwarding_class_id': function(value, attr, finalObj) {
                    if(isNaN(value)){
                        return "Default Forwarding Class ID " +
                               "should be a number";
                    }
                }
            }
        },

        formatModelConfig: function(modelConfig){
            //update default config values
            var dscpEntries = getValueByJsonPath(modelConfig,
                    "dscp_entries;qos_id_forwarding_class_pair", []),
                dscpEntryModelArry = [],
                vlanEntries = getValueByJsonPath(modelConfig,
                    "vlan_priority_entries;qos_id_forwarding_class_pair", []),
                vlanEntryModelArry = [],
                mplsEntries = getValueByJsonPath(modelConfig,
                    "mpls_exp_entries;qos_id_forwarding_class_pair", []),
                mplsEntryModelArry = [];

                //dscp
                _.each(dscpEntries, function(dscpEntry){
                    dscpEntryModelArry.push(new FCPairModel({
                            dscp_key: gcUtils.getTextByValue(
                                    ctwc.QOS_DSCP_VALUES, dscpEntry.key),
                            forwarding_class_id: dscpEntry.forwarding_class_id
                        })
                    );
                });
                modelConfig["dscp_entries_fc_pair"] =
                    new Backbone.Collection(dscpEntryModelArry);

                //vlan priority
                _.each(vlanEntries, function(vlanEntry){
                    vlanEntryModelArry.push(new FCPairModel({
                            vlan_key: gcUtils.getTextByValue(
                                  ctwc.QOS_VLAN_PRIORITY_VALUES, vlanEntry.key),
                            forwarding_class_id: vlanEntry.forwarding_class_id
                       })
                    );
                });
                modelConfig["vlan_priority_entries_fc_pair"] =
                    new Backbone.Collection(vlanEntryModelArry);

                //mpls exp
                _.each(mplsEntries, function(mplsEntry){
                    mplsEntryModelArry.push(new FCPairModel({
                            mpls_key: gcUtils.getTextByValue(
                                    ctwc.QOS_MPLS_EXP_VALUES, mplsEntry.key),
                            forwarding_class_id: mplsEntry.forwarding_class_id
                        })
                    );
                });
                modelConfig["mpls_exp_entries_fc_pair"] =
                    new Backbone.Collection(mplsEntryModelArry);
                modelConfig['display_name'] =
                    ctwu.getDisplayNameOrName(modelConfig);
               //permissions
               this.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },

        addDSCPEntry: function() {
            var dscpFCPair = this.model().attributes["dscp_entries_fc_pair"];
            dscpFCPair.add([new FCPairModel()]);
        },
        addDSCPEntryByIndex: function(data, kbInterface) {
            var selectedRuleIndex = data.model().collection.indexOf(kbInterface.model());
            var dscpFCPair = this.model().attributes["dscp_entries_fc_pair"];
            dscpFCPair.add([new FCPairModel()],{at: selectedRuleIndex+1});
        },
        deleteDSCPEntry: function(data, kbInterface) {
            data.model().collection.remove(kbInterface.model())
        },

        getDSCPEntries: function(attr) {
            var dscpEntries = attr && attr.dscp_entries_fc_pair ?
                    attr.dscp_entries_fc_pair.toJSON() : [],
                actDSCPEntries = [];
            _.each(dscpEntries, function(r){
                actDSCPEntries.push({
                    key: Number(gcUtils.getValueByText(ctwc.QOS_DSCP_VALUES,
                            r.dscp_key())),
                    forwarding_class_id: Number(r.forwarding_class_id())
                });
            });
            return actDSCPEntries;
        },

        addVlanPriorityEntry: function() {
            var vlanFCPair =
                this.model().attributes["vlan_priority_entries_fc_pair"];
            vlanFCPair.add([new FCPairModel()]);
        },
        addVlanPriorityEntryByIndex: function(data, kbInterface) {
            var selectedRuleIndex = data.model().collection.indexOf(kbInterface.model());
            var vlanFCPair =
                this.model().attributes["vlan_priority_entries_fc_pair"];
            vlanFCPair.add([new FCPairModel()],{at: selectedRuleIndex+1});
        },
        deleteVlanPriorityEntry: function(data, kbInterface) {
            data.model().collection.remove(kbInterface.model())
        },

        getVlanPriorityEntries: function(attr) {
            var vlanPriorityEntries =
                attr && attr.vlan_priority_entries_fc_pair ?
                    attr.vlan_priority_entries_fc_pair.toJSON() : [],
                actVlanPriorityEntries = [];
            _.each(vlanPriorityEntries, function(r){
                actVlanPriorityEntries.push({
                    key: Number(gcUtils.getValueByText(
                            ctwc.QOS_VLAN_PRIORITY_VALUES, r.vlan_key())),
                    forwarding_class_id: Number(r.forwarding_class_id())
                });
            });
            return actVlanPriorityEntries;
        },

        addMPLSExpEntry: function() {
            var mplsFCPair = this.model().attributes["mpls_exp_entries_fc_pair"];
            mplsFCPair.add([new FCPairModel()]);
        },
        addMPLSExpEntryByIndex: function(data, kbInterface) {
            var selectedRuleIndex = data.model().collection.indexOf(kbInterface.model());
            var mplsFCPair = this.model().attributes["mpls_exp_entries_fc_pair"];
            mplsFCPair.add([new FCPairModel()],{at: selectedRuleIndex+1});
        },
        deleteMPLSExpEntry: function(data, kbInterface) {
            data.model().collection.remove(kbInterface.model())
        },

        getMPLSExpEntries: function(attr) {
            var mplsExpEntries = attr && attr.mpls_exp_entries_fc_pair ?
                    attr.mpls_exp_entries_fc_pair.toJSON() : [],
                actMPLSExpEntries = [];
            _.each(mplsExpEntries, function(r){
                actMPLSExpEntries.push({
                    key: Number(gcUtils.getValueByText(ctwc.QOS_MPLS_EXP_VALUES,
                            r.mpls_key())),
                    forwarding_class_id: Number(r.forwarding_class_id())
                });
            });
            return actMPLSExpEntries;
        },

        configQOS: function (callbackObj, options) {
            var ajaxConfig = {}, returnFlag = false, mode, isGlobal, qosType,
                postQOSConfigData = {},
                newQOSConfigData, attr,
                self  = this,
                validations = [
                    {
                        key : null,
                        type : cowc.OBJECT_TYPE_MODEL,
                        getValidation : "qosValidations"
                    },
                    {
                        key : "dscp_entries_fc_pair",
                        type : cowc.OBJECT_TYPE_COLLECTION,
                        getValidation : "dscpValidations"
                    },
                    {
                        key : "vlan_priority_entries_fc_pair",
                        type : cowc.OBJECT_TYPE_COLLECTION,
                        getValidation : "vlanValidations"
                    },
                    {
                        key : "mpls_exp_entries_fc_pair",
                        type : cowc.OBJECT_TYPE_COLLECTION,
                        getValidation : "mplsValidations"
                    },
                    //permissions
                    ctwu.getPermissionsValidation()
                ];

            if (this.isDeepValid(validations)) {
                mode = getValueByJsonPath(options, "mode", ctwl.CREATE_ACTION);
                isGlobal = getValueByJsonPath(options, "isGlobal", true);
                qosType =
                    getValueByJsonPath(options, "qosType", "vhost");
                attr = this.model().attributes;
                newQOSConfigData = $.extend(true, {}, attr);
                ctwu.setNameFromDisplayName(newQOSConfigData);
                if(isGlobal) {
                    if(newQOSConfigData["fq_name"] === null ||
                        !newQOSConfigData["fq_name"].length) {
                            newQOSConfigData["fq_name"] =
                                [
                                    "default-global-system-config",
                                    "default-global-qos-config",
                                    newQOSConfigData["name"]
                                ];
                    }
                    newQOSConfigData["parent_type"] = "global-qos-config";

                } else {
                    if(newQOSConfigData["fq_name"] === null ||
                        !newQOSConfigData["fq_name"].length) {
                        newQOSConfigData["fq_name"] =
                            [
                                contrail.getCookie(cowc.COOKIE_DOMAIN),
                                contrail.getCookie(cowc.COOKIE_PROJECT),
                                newQOSConfigData["name"]
                            ];
                    }
                    newQOSConfigData["parent_type"] = "project";
                }
                newQOSConfigData["qos_config_type"] = qosType;
                //default fc
                newQOSConfigData["default_forwarding_class_id"] =
                    Number(newQOSConfigData["default_forwarding_class_id"]);
                //dscp
                newQOSConfigData["dscp_entries"]
                   ["qos_id_forwarding_class_pair"] =
                    self.getDSCPEntries(attr);

                //vlan priority
                newQOSConfigData["vlan_priority_entries"]
                   ["qos_id_forwarding_class_pair"] =
                    self.getVlanPriorityEntries(attr);

                //mpls exp
                newQOSConfigData["mpls_exp_entries"]
                   ["qos_id_forwarding_class_pair"] =
                    self.getMPLSExpEntries(attr);

                //permissions
                this.updateRBACPermsAttrs(newQOSConfigData);

                ctwu.deleteCGridData(newQOSConfigData);

                delete newQOSConfigData.id_perms;
                delete newQOSConfigData.dscp_entries_fc_pair;
                delete newQOSConfigData.vlan_priority_entries_fc_pair;
                delete newQOSConfigData.mpls_exp_entries_fc_pair;


                postQOSConfigData = {"qos-config": newQOSConfigData};
                if(mode === ctwl.CREATE_ACTION) {
                    ajaxConfig.url = ctwc.URL_CREATE_CONFIG_OBJECT;
                } else {
                    ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
                }

                ajaxConfig.type  = "POST";
                ajaxConfig.data  = JSON.stringify(postQOSConfigData);

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
                    callbackObj.error(this.getFormErrorText(ctwc.QOS_PREFIX_ID));
                }
            }

            return returnFlag;
        },

        deleteQOS: function(checkedRows, callbackObj) {
            var ajaxConfig = {}, that = this;
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'qos-config',
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
        }
    });
    return rbacModel;
});
