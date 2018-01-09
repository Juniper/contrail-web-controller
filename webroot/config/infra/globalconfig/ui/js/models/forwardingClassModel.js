/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodash',
    'contrail-config-model',
    'config/infra/globalconfig/ui/js/globalConfig.utils'
], function (_, ContrailConfigModel, GlobalConfigUtils) {
    var gcUtils = new GlobalConfigUtils();
    var forwardingClassModel = ContrailConfigModel.extend({

        defaultConfig: {
            'name': null,
            'display_name': null,
            'fq_name': null,
            'parent_type': 'global-qos-config',
            'forwarding_class_id': null,
            'forwarding_class_dscp': null,
            'forwarding_class_vlan_priority': null,
            'forwarding_class_mpls_exp': null,
            'qos_queue_refs': null
        },

        validations: {
            fwdClassConfigValidations: {
                'forwarding_class_id': function(value, attr, finalObj){
                    if(value === null ||
                        value.toString().trim() === "" ||
                        isNaN(Number(value))) {
                        return "Forwarding Class ID should be a number";
                    }
                },
                'qos_queue_refs': {
                    required: false,
                    pattern: cowc.TYPE_NUMBER,
                    msg: 'QoS queue identifier must be a number'
                }
            }
        },

        formatModelConfig: function(modelConfig) {
            //dscp
            var dscp = getValueByJsonPath(modelConfig,
                    "forwarding_class_dscp", "");
            if(dscp.toString().trim() !== "") {
                modelConfig["forwarding_class_dscp"] =
                    gcUtils.getTextByValue(ctwc.QOS_DSCP_VALUES, dscp);
            }

            //vlan
            var vlan = getValueByJsonPath(modelConfig,
                    "forwarding_class_vlan_priority", "");
            if(vlan.toString().trim() !== "") {
                modelConfig["forwarding_class_vlan_priority"] =
                    gcUtils.getTextByValue(ctwc.QOS_VLAN_PRIORITY_VALUES,
                            vlan);
            }

            //mpls
            var mpls = getValueByJsonPath(modelConfig,
                    "forwarding_class_mpls_exp", "");
            if(mpls.toString().trim() !== "") {
                modelConfig["forwarding_class_mpls_exp"] =
                    gcUtils.getTextByValue(ctwc.QOS_MPLS_EXP_VALUES, mpls);
            }

            //qos queue
            modelConfig["qos_queue_refs"] =
                getValueByJsonPath(modelConfig, "qos_queue_refs;0;to;2", "");

            //permissions
            this.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },

        addEditForwardingClass: function (callbackObj, options) {
            var ajaxConfig = {}, returnFlag = false, newUUID, mode, fcId,
                dscp, vlan, mpls, postData;

            var self = this,
            validations = [{
                               key : null,
                               type : cowc.OBJECT_TYPE_MODEL,
                               getValidation : "fwdClassConfigValidations"
                           },
                           //permissions
                           ctwu.getPermissionsValidation()];
            if (self.isDeepValid(validations)) {
                self.createQosQueue(self.model().attributes, function(queueRef){
                    var newForwardingClass = $.extend(true,
                            {}, self.model().attributes);
                    mode = getValueByJsonPath(options, "mode",
                            ctwl.CREATE_ACTION);

                    fcId = getValueByJsonPath(newForwardingClass,
                            "forwarding_class_id", "").toString();
                    if(mode === ctwl.CREATE_ACTION) {
                        newForwardingClass["fq_name"] = [];
                        newForwardingClass["fq_name"].push(
                                "default-global-system-config");
                        newForwardingClass["fq_name"].push(
                        "default-global-qos-config");
                        newForwardingClass["fq_name"].push(fcId);
                        newForwardingClass["display_name"] = fcId;
                        newForwardingClass["name"] = fcId;
                    }

                    dscp = getValueByJsonPath(newForwardingClass,
                                    'forwarding_class_dscp', '').toString();
                    dscp = gcUtils.getValueByText(ctwc.QOS_DSCP_VALUES, dscp);
                    vlan = getValueByJsonPath(newForwardingClass,
                        'forwarding_class_vlan_priority', '').toString();
                    vlan= gcUtils.getValueByText(ctwc.QOS_VLAN_PRIORITY_VALUES,
                            vlan);
                    mpls = getValueByJsonPath(newForwardingClass,
                                    'forwarding_class_mpls_exp', '').toString();
                    mpls = gcUtils.getValueByText(
                            ctwc.QOS_MPLS_EXP_VALUES, mpls);
                    fcId = fcId.trim().length != 0 ? Number(fcId) : null;
                    newForwardingClass['forwarding_class_id'] = fcId;

                    dscp = dscp.toString().trim().length != 0 ?
                            Number(dscp) : null;
                    newForwardingClass['forwarding_class_dscp'] = dscp;

                    vlan = vlan.toString().trim().length != 0 ?
                            Number(vlan) : null;
                    newForwardingClass['forwarding_class_vlan_priority'] = vlan;

                    mpls = mpls.toString().trim().length != 0 ?
                            Number(mpls) : null;
                    newForwardingClass['forwarding_class_mpls_exp'] = mpls;

                    //set qos_queue_refs
                    if(getValueByJsonPath(queueRef, "2", null) !== null) {
                        newForwardingClass["qos_queue_refs"] =
                            [{"to": queueRef}];
                    } else {
                        newForwardingClass["qos_queue_refs"] = []
                    }
                    //permissions
                    self.updateRBACPermsAttrs(newForwardingClass);
                    ctwu.deleteCGridData(newForwardingClass);
                    delete newForwardingClass.id_perms;
                    delete newForwardingClass.href;
                    delete newForwardingClass.parent_href;
                    delete newForwardingClass.parent_uuid;


                    postData = {"forwarding-class": newForwardingClass};
                    if (mode == ctwl.CREATE_ACTION) {
                        ajaxConfig.url = ctwc.URL_CREATE_CONFIG_OBJECT;
                    } else {
                        ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
                    }
                    ajaxConfig.type  = 'POST';
                    ajaxConfig.data  = JSON.stringify(postData);

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
                });

            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(
                                            ctwc.FORWARDING_CLASS_PREFIX_ID));
                }
            }

            return returnFlag;
        },

        isQoSQueueExists:function(queueId) {
           var qosQueueDS = _.get(this, 'qosQueueDS', []);
           var isQueueExist = _.find(qosQueueDS, function(queue){
                                  return queue.value === queueId;
                              });
           return isQueueExist;
        },

        createQosQueue: function(attr, callback) {
            var ajaxConfig = {}, postData = {},
                qosQueueIdStr = getValueByJsonPath(attr,
                        "qos_queue_refs", "").toString();
                qosQueueId = qosQueueIdStr.trim().length !== 0 ?
                    Number(qosQueueIdStr) : null,
                fqName = ["default-global-system-config",
                    "default-global-qos-config"];
            if(!this.isQoSQueueExists(qosQueueId)) {
                fqName.push(qosQueueIdStr);
                postData["qos-queue"] = {};
                postData["qos-queue"]["parent_type"] = "global-qos-config";
                postData["qos-queue"]["fq_name"] = fqName;
                postData["qos-queue"]["display_name"] = qosQueueIdStr;
                postData["qos-queue"]["name"] = qosQueueIdStr;
                postData["qos-queue"]["qos_queue_identifier"] = qosQueueId;

                ajaxConfig.url = ctwc.URL_CREATE_CONFIG_OBJECT;
                ajaxConfig.type  = 'POST';
                ajaxConfig.data  = JSON.stringify(postData);
                contrail.ajaxHandler(ajaxConfig, null,
                        function() {
                            callback(fqName);

                        },
                        function() {
                            callback(fqName)
                        }
                );
            } else {
                fqName.push(qosQueueIdStr);
                callback(fqName);
            }
        },

        deleteForwardingClass: function (checkedRows, callbackObj) {
            var ajaxConfig = {};
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'forwarding-class',
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

    });

    return forwardingClassModel;
});
