/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/firewall/common/fwpolicy/ui/js/models/fwRuleCollectionModel',
    'config/networking/policy/ui/js/views/policyFormatters',
    'core-basedir/js/models/RBACPermsShareModel'
], function (_, ContrailConfigModel, RuleModel, PolicyFormatters,RBACPermsShareModel) {
    var self;
    var policyFormatters = new PolicyFormatters();
    var fwPolicyModel = ContrailConfigModel.extend({
        defaultConfig: {
            "name": null,
            "display_name": null,
            "fq_name": null,
            "parent_type": '',
            "firewall_rules": [],
            "perms2": {
                "owner": "",
                "owner_access": "",
                "global_access": "",
                "share": []
            },
            "tag_refs":[],
            "tenant": null,
            "tenant_access": "4,2,1",
            "id_perms": {"description": null}
        },

        formatModelConfig : function(modelData) {
            modelData = (modelData == null) ? this.defaultConfig : modelData;
            var self = this, shareModel, shareModelCol = [],
            share;
            var fwRuleModel, fwRuleModelCol = [];
            modelData["firewall_rules"] = new Backbone.Collection(fwRuleModelCol);
            if((modelData["perms2"]["owner_access"] != "") || (modelData["perms2"]["global_access"] != "")) {
                modelData["perms2"]["owner_access"] =
                    self.formatAccessList(modelData["perms2"]["owner_access"]);
                modelData["perms2"]["global_access"] =
                    self.formatAccessList(modelData["perms2"]["global_access"]);
                modelData["owner_visible"] = true;
            } else {//required for create case
                modelData["perms2"] = {};
                modelData["perms2"]["owner_access"] = "4,2,1";
                modelData["perms2"]["global_access"] = "";
                modelData["owner_visible"] = false;
            }

            share = getValueByJsonPath(modelData,
                    "perms2;share", []);
            _.each(share, function(s){
                shareModel = new RBACPermsShareModel({
                    tenant : s.tenant,
                    tenant_access: self.formatAccessList(s.tenant_access)
                });
                shareModelCol.push(shareModel);
            });
            modelData["share_list"] =
                new Backbone.Collection(shareModelCol);
            var editApplicationRefs = "" , editagSiteRefs = "",
                editagDeploymentRefs = "", editagTierRefs = "", editagLabelsRef = '';
            var editTagsRefsArray = [];
            var tagrefs = getValueByJsonPath(modelData,
                    "tag_refs", []);
            if(tagrefs.length > 0) {
                _.each(tagrefs, function(refs){
                    var fqName = refs.to;
                    if((fqName[fqName.length -1].indexOf('application') > -1)) {
                        if(editApplicationRefs === '') {
                            editApplicationRefs = fqName.join(":");
                        } else {
                            editApplicationRefs += ',' + fqName.join(":");
                        }
                    }
                    if((fqName[fqName.length -1].indexOf('site') > -1)) {
                        if(editagSiteRefs === '') {
                            editagSiteRefs = fqName.join(":");
                        } else {
                            editagSiteRefs += ',' + fqName.join(":");
                        }
                    }
                    if((fqName[fqName.length -1].indexOf('deployment') > -1)) {
                        if(editagDeploymentRefs === '') {
                            editagDeploymentRefs = fqName.join(":");
                        } else {
                            editagDeploymentRefs += ',' + fqName.join(":");
                        }
                    }
                    if((fqName[fqName.length -1].indexOf('tier') > -1)) {
                        if(editagTierRefs === '') {
                            editagTierRefs = fqName.join(":");
                        } else {
                            editagTierRefs += ',' + fqName.join(":");
                        }
                    }
                    if((fqName[fqName.length -1].indexOf('label') > -1)) {
                        if(editagLabelsRef === '') {
                            editagLabelsRef = fqName.join(":");
                        } else {
                            editagLabelsRef += ',' + fqName.join(":");
                        }
                    }
                });
            }
            modelData["Application"] = editApplicationRefs;
            modelData["Site"] = editagSiteRefs;
            modelData["Deployment"] = editagDeploymentRefs;
            modelData["Tier"] = editagTierRefs;
            modelData["Labels"] = editagLabelsRef;
            return modelData;
        },
        formatAccessList: function(access) {
            var retStr = "";
            switch (access) {
                case 1:
                    retStr = "1";
                    break;
                case 2:
                    retStr = "2";
                    break;
                case 3:
                    retStr = "2,1";
                    break;
                case 4:
                    retStr = "4";
                    break;
                case 5:
                    retStr = "4,1";
                    break;
                case 6:
                    retStr = "4,2";
                    break;
                case 7:
                    retStr = "4,2,1";
                    break;
                default:
                    retStr = "";
                    break;
            };
            return retStr;
        },
        setModelDataSources: function(allData) {
            self.SIDataSource = getValueByJsonPath(allData,
                    "service_instances_ref", []);
            self.analyzerSIDataSource = getValueByJsonPath(allData,
                    "analyzerInsts", []);
            var policeyRule = (self.model().attributes.PolicyRules).toJSON(),
                policeyRuleLen = policeyRule.length;
            for (var i = 0; i < policeyRuleLen; i++){
                var SI = policeyRule[i].service_instance();
                if (SI != null) {
                    var SIArr = SI.split(cowc.DROPDOWN_VALUE_SEPARATOR);
                    SIArr = this.getApplyService(SIArr, self.SIDataSource);
                    policeyRule[i].service_instance(SIArr);
                }
            }
        },
        getApplyService: function(applyService, SIDataSource) {
            var applyServiceLen = applyService.length;
            for (var j = 0; j < applyServiceLen; j++) {
                applyService[j] = SIDataSource[applyService[j]];
            }
            return applyService;
        },
        addRule: function() {
            var rulesList = this.model().attributes['firewall_rules'],
                newRuleModel = new RuleModel();
            this.showHideServiceInstance(newRuleModel);
            rulesList.add([newRuleModel]);
        },
        addRuleByIndex: function(data,rules) {
            var selectedRuleIndex = data.model().collection.indexOf(rules.model());
            var rulesList = this.model().attributes['firewall_rules'],
                newRuleModel = new RuleModel();
            this.showHideServiceInstance(newRuleModel);

            rulesList.add([newRuleModel],{at: selectedRuleIndex+1});
        },
        deleteRules: function(data, rules) {
            var rulesCollection = data.model().collection,
                delRule = rules.model();
            rulesCollection.remove(delRule);
        },
        showHideServiceInstance: function(ruleModels) {
            ruleModels.showService = ko.computed((function() {
                if (this.apply_service_check() == true) {
                        this.direction("<>");
                        this.simple_action("PASS");
                        return true;
                } else {
                    return false;
                }
            }), ruleModels);
            ruleModels.showMirror = ko.computed((function(){
                if (this.mirror_to_check() == true) {
                    this.protocol("ANY");
                    this.src_ports_text("ANY");
                    this.dst_ports_text("ANY");
                    return (this.mirror_to_check);
                } else {
                    return false;
                }
            }), ruleModels);
        },

        getPostAddressFormat: function(arr, selectedDomain, selectedProject) {
            var array = arr.split(":");
            var returnval = null;
            if (array.length == 1) {
                if (String(array[0]).toLowerCase() != "any" &&
                    String(array[0]).toLowerCase() != "local") {
                    returnval = selectedDomain + ":" +
                                selectedProject + ":" +
                                array[0];
                } else {
                    returnval = array[0].toLowerCase();
                }
            } else if(array.length == 3) {
                returnval = arr;
            }
            return returnval;
        },

        populateEndpointData : function(inputAddress) {
            var self = this;
            var selectedDomain = contrail.getCookie(cowc.COOKIE_DOMAIN_DISPLAY_NAME);
            var selectedProject = contrail.getCookie(cowc.COOKIE_PROJECT_DISPLAY_NAME);
            var srcArrs = inputAddress.split(',');//If multiple selected.
            endpoint  = {};
            endpoint["virtual_network"] = null;
            //endpoint["security_group"] = null;
            endpoint["address_group"] = null;
            endpoint["any"] = null;
            endpoint["tags"] = [];
            for(var i = 0 ; i < srcArrs.length; i++) {
                var srcArr = srcArrs[i].split(cowc.DROPDOWN_VALUE_SEPARATOR),
                    vnSubnetObj, subnet, endpoint;
                //tags
                if(srcArr.length == 2 && (srcArr[1] === 'Application' ||
                        srcArr[1] === 'Deployment' ||  srcArr[1] === 'Site' ||
                        srcArr[1] === 'Tier'|| srcArr[1] === 'label')) {
                    endpoint["tags"].push(srcArr[0]);
                } else if(srcArr.length == 2 && srcArr[1] === 'address_group'){
                    endpoint[srcArr[1]] = srcArr[0];
                } else if(srcArr.length == 2 && srcArr[1] === 'virtual_network'){
                    endpoint[srcArr[1]] = self.getPostAddressFormat(srcArr[0], selectedDomain,
                            selectedProject)
                } else if(srcArr.length == 2 && srcArr[1] === 'any_workload') {
                    endpoint["any"] = true;
                }
            }
            return endpoint;
        },
        getFormatedService : function(selectedData, list){
            var svcListRef = [], service = {};
            for(var i = 0; i < list.length; i++){
                if(list[i].text === selectedData){
                    svcListRef.push(list[i].fq_name);
                    break;
                }
            }
            if(svcListRef.length > 0){
                service['service_group_refs'] = [{to:svcListRef[svcListRef.length - 1]}];
                service['isServiceGroup'] = true;
            }else{
                var ports = selectedData.split(':');
                if(ports.length === 2) {
                    service['service'] = {};
                    service['service']['protocol'] = ports[0];
                    service['service']['dst_ports'] =
                        policyFormatters.formatPort(ports[1])[0];
                    service['service']['src_ports'] =
                        policyFormatters.formatPort('0-65535')[0];
                    service['isServiceGroup'] = false;
                }else{
                    service['isServiceGroup'] = false;
                }
            }
        return service;
        },
        configFWPolicy: function (callbackObj, options) {
            var ajaxConfig = {}, returnFlag = false,
                postFWPolicyData = {},
                newFWPolicyData, attr,
                self  = this,
                validations = [
                    {
                        key : null,
                        type : cowc.OBJECT_TYPE_MODEL,
                        getValidation : "addValidation"
                    }
                ];

            if (this.isDeepValid(validations)) {
                attr = this.model().attributes;
                newFWPolicyData = $.extend(true, {}, attr);

                if(options.isGlobal) {
                    newFWPolicyData["fq_name"] =
                        [
                          "default-policy-management",
                           newFWPolicyData["name"]
                        ];
                    newFWPolicyData['parent_type'] = "policy-management";
                } else {
                    newFWPolicyData["fq_name"] =
                        [
                          contrail.getCookie(cowc.COOKIE_DOMAIN_DISPLAY_NAME),
                          contrail.getCookie(cowc.COOKIE_PROJECT_DISPLAY_NAME),
                          newFWPolicyData["name"]
                        ];
                    newFWPolicyData['parent_type'] = "project";
                }
                this.updateRBACPermsAttrs(newFWPolicyData);

                ctwu.deleteCGridData(newFWPolicyData);

                newFWPolicyData.id_perms;

                postFWPolicyData['firewall-policy'] = newFWPolicyData;

                if(options.mode === ctwl.CREATE_ACTION) {
                    postFWPolicyData = {"data":[{"data": postFWPolicyData,
                                "reqUrl": ctwc.URL_CREATE_FW_POLICY}]};
                    ajaxConfig.url = ctwc.URL_CREATE_CONFIG_OBJECT;
                } else {
                    postFWPolicyData = {"data":[{"data": postFWPolicyData,
                                "reqUrl": ctwc.URL_UPDATE_FW_POLICY +
                                newFWPolicyData['uuid']}]};
                    ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
                }
                ajaxConfig.async = false;
                ajaxConfig.type  = "POST";
                ajaxConfig.data  = JSON.stringify(postFWPolicyData);

                contrail.ajaxHandler(ajaxConfig, function () {
                    if (contrail.checkIfFunction(callbackObj.init)) {
                        callbackObj.init();
                    }
                }, function (response) {
                    self.fwPolicyId = getValueByJsonPath(response,
                            '0;firewall-policy;uuid', '');
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
                            ctwc.FW_POLICY_PREFIX_ID));
                }
            }

            return returnFlag;
        },

        configFWRule: function (callbackObj, options, serviceGroupList) {
            var ajaxConfig = {}, returnFlag = false,
                postFWRuleData = {},
                self  = this,
                validations = [
                    {
                        key : null,
                        type : cowc.OBJECT_TYPE_MODEL,
                        getValidation : "configureValidation"
                    }
                ];
            validations.push({
                key : "firewall_rules",
                type : cowc.OBJECT_TYPE_COLLECTION,
                getValidation : "ruleValidation"
            });

            if (this.isDeepValid(validations)) {
                fwRules = this.model().attributes.firewall_rules ?
                        this.model().attributes.firewall_rules.toJSON(): [],
                postFWRules = [];

                _.each(fwRules, function(rule) {
                    var attr = $.extend(true, {}, rule.model().attributes),
                        newFWRuleData = {};
                    attr.name = UUIDjs.create().hex;
                    if(options.isGlobal) {
                        newFWRuleData["fq_name"] =
                            [
                              "default-policy-management",
                              attr.name
                            ];
                        newFWRuleData['parent_type'] = "policy-management";
                    } else {
                        newFWRuleData["fq_name"] =
                            [
                              contrail.getCookie(cowc.COOKIE_DOMAIN_DISPLAY_NAME),
                              contrail.getCookie(cowc.COOKIE_PROJECT_DISPLAY_NAME),
                              attr.name
                            ];
                        newFWRuleData['parent_type'] = "project";
                    }
                    newFWRuleData['name'] = attr.name;
                    newFWRuleData['uuid'] = attr.name;
                    newFWRuleData['endpoint_1'] = self.populateEndpointData(attr['endpoint_1']);
                    newFWRuleData['endpoint_2'] = self.populateEndpointData(attr['endpoint_2']);
                    if(attr['user_created_service'] !== ''){
                        var getSelectedService = self.getFormatedService(attr['user_created_service'], serviceGroupList);
                        if(getSelectedService.isServiceGroup){
                            newFWRuleData['service_group_refs'] = getSelectedService['service_group_refs'];
                        }else{
                            if(getSelectedService['service'] !== undefined){
                                newFWRuleData['service'] = getSelectedService['service'];
                            }
                        }
                    }
                    newFWRuleData['action_list'] = {};
                    newFWRuleData['action_list']['simple_action'] = attr['simple_action'];
                    newFWRuleData['direction'] = attr['direction'];
                    //newFWRuleData['sequence'] = attr['sequence'];
                    newFWRuleData['match_tags'] = {};
                    newFWRuleData['id_perms'] = {};
                    newFWRuleData['id_perms']["enable"] = attr["status"];
                    newFWRuleData['match_tags']['tag_list'] =
                        attr.match_tags ? attr.match_tags.split(',') : [];
                    postFWRules.push({'firewall-rule': $.extend(true, {}, newFWRuleData)});
                });

                postFWRuleData['firewall-rules'] = postFWRules;
                postFWRuleData['fwPolicyId'] = self.fwPolicyId;
                ajaxConfig.async = false;
                ajaxConfig.url = ctwc.URL_CREATE_POLICY_RULES;
                ajaxConfig.type  = "POST";
                ajaxConfig.data  = JSON.stringify(postFWRuleData);

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
                            ctwc.FW_POLICY_PREFIX_ID));
                }
            }

            return returnFlag;
        },

        deleteFWPolicies : function(checkedRows, callbackObj) {
            var ajaxConfig = {}, that = this;
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'firewall-policy',
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
            addValidation: {
                'name': {
                    required: true,
                    msg: 'Enter Firewall Policy Name'
                }
            }
        },
    });
    return fwPolicyModel;
});
