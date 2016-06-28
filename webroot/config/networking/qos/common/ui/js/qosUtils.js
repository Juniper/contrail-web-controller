/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

 define(["underscore"], function(_){
     var qosUtils = function(){
         this.configGlobalQOSconfig = function(model, callbackObj, options) {
             var ajaxConfig = {}, ajaxMethod, returnFlag = false,
             putData, qosPostData, gridData, rowsCnt, dataLen, mode,
             defaultGlobalQOSName = "default-global-qos-config",
             rbacRuleObj, attr, uuid,
             fqName = [], parentType,
             validations = [
                 {
                     key : null,
                     type : cowc.OBJECT_TYPE_MODEL,
                     getValidation : "rbacValidations"
                 },
                 {
                     key : 'rule_perms',
                     type : cowc.OBJECT_TYPE_COLLECTION,
                     getValidation : 'rbacRulePermsValidations'
                 }
             ];
             if (model.isDeepValid(validations)) {
                 attr = model.model().attributes;
                 gridData = getValueByJsonPath(options, "gridData", []);
                 rowIndex = getValueByJsonPath(options, "rowIndex");
                 mode = getValueByJsonPath(options, "mode", "");
                 putData = getValueByJsonPath(options,
                         "configData", null);
                 uuid =
                     getValueByJsonPath(putData, "api-access-list;uuid",
                                        null);
                 rbacRuleObj = {
                                   rule_object: attr.rule_object,
                                   rule_field: attr.rule_field,
                                   rule_perms: model.getRulePerms(attr)
                               };
                 if (null == uuid) {
                     fqName.push(domain);
                     if(options.isProject) {
                         parentType = "project";
                         project = contrail.getCookie(cowc.COOKIE_PROJECT);
                         fqName.push(project);
                     } else {
                         parentType = "domain";
                     }
                     fqName.push(defaultAALName);
                     putData = {};
                     putData["api-access-list"] = {};
                     putData["api-access-list"]["parent_type"] = parentType;
                     putData["api-access-list"]["fq_name"] = fqName;
                     putData["api-access-list"]["display_name"] =
                         defaultAALName;
                     putData["api-access-list"]["api_access_list_entries"] = {};
                 }

                 if (mode === ctwl.CREATE_ACTION) {
                     /* Add */
                     gridData.push(rbacRuleObj);
                     putData["api-access-list"]["api_access_list_entries"]
                         ["rbac_rule"] = gridData;
                 } else if(mode === ctwl.EDIT_ACTION) {
                     /* Edit */
                     putData["api-access-list"]["api_access_list_entries"]
                         ['rbac_rule'] = gridData;
                     putData["api-access-list"]["api_access_list_entries"]
                         ['rbac_rule'][rowIndex] = rbacRuleObj;
                 }

                 dataLen =
                     putData["api-access-list"]["api_access_list_entries"]
                     ['rbac_rule'].length;
                 for (var i = 0; i < dataLen; i++) {
                     ctwu.deleteCGridData(
                         putData["api-access-list"]["api_access_list_entries"]
                             ['rbac_rule'][i]);
                 }

                 if(null == uuid) {
                     rbacPostData = {"data":[{"data": putData,
                                 "reqUrl": "/api-access-lists"}]};
                     ajaxConfig.url = ctwc.URL_CREATE_CONFIG_OBJECT;
                 } else {
                     rbacPostData = {"data":[{"data": putData,
                                 "reqUrl": "/api-access-list/" +
                                 uuid}]};
                     ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
                 }

                 ajaxConfig.type  = "POST";
                 ajaxConfig.data  = JSON.stringify(rbacPostData);

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
                     callbackObj.error(model.getFormErrorText(
                             ctwc.RBAC_PREFIX_ID));
                 }
             }
             return returnFlag;
         };

         this.deleteRBAC = function(callbackObj, options) {
             var ajaxConfig = {}, returnFlag = false, i, rowIdxLen, dataLen,
             gridData = getValueByJsonPath(options, "gridData", []),
             rowIndexes = getValueByJsonPath(options, "rowIndexes"),
             putData = getValueByJsonPath(options,
                     "configData", null),
             uuid =
                 getValueByJsonPath(putData, "api-access-list;uuid",
                                null), rbacPostData;
             putData['api-access-list']['api_access_list_entries'] = {};
             putData['api-access-list']['api_access_list_entries']
                 ['rbac_rule'] = gridData;
             rowIndexes.sort(function(a, b) { return (b - a)});
             rowIdxLen = rowIndexes.length;
             for (i = 0; i < rowIdxLen; i++) {
                 var rowIndex = rowIndexes[i];
                 putData['api-access-list']['api_access_list_entries']
                     ['rbac_rule'].splice(rowIndex, 1);
             }
             dataLen =
                 putData['api-access-list']['api_access_list_entries']
                     ['rbac_rule'].length;
             for (i = 0; i < dataLen; i++) {
                 delete
                     putData['api-access-list']['api_access_list_entries']
                         ['rbac_rule'][i]['cgrid'];
             }

             rbacPostData = {"data":[{"data": putData,
                 "reqUrl": "/api-access-list/" +
                 uuid}]};
             ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
             ajaxConfig.type  = "POST";
             ajaxConfig.data  = JSON.stringify(rbacPostData);

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
         };

         this.getQOSDetailsTemplateConfig = function() {
             return {
                 templateGenerator: 'RowSectionTemplateGenerator',
                 templateGeneratorConfig: {
                     rows: [{
                         templateGenerator: 'ColumnSectionTemplateGenerator',
                         templateGeneratorConfig: {
                             columns: [{
                                 class: 'span6',
                                 rows: [{
                                     title: 'Details',
                                     templateGenerator:
                                         'BlockListTemplateGenerator',
                                     templateGeneratorConfig: [{
                                         key: "name",
                                         templateGenerator: "TextGenerator",
                                         label: "Name"
                                     },{
                                         key: "display_name",
                                         templateGenerator: "TextGenerator",
                                         label: "Display Name"
                                     },{
                                         key: "uuid",
                                         templateGenerator: "TextGenerator",
                                         label: "UUID"
                                     },{
                                         key: "qos_config_type",
                                         templateGenerator: "TextGenerator",
                                         label: "QOS Config Type",
                                         templateGeneratorConfig: {
                                             formatter: "QOSTypeFormatter"
                                         }
                                     },{
                                         key: "trusted",
                                         templateGenerator: "TextGenerator",
                                         label: "Trusted",
                                         templateGeneratorConfig: {
                                             formatter: "TrustedFormatter"
                                         }
                                     },{
                                         key: "trusted",
                                         templateGenerator: "TextGenerator",
                                         label: "DSCP",
                                         templateGeneratorConfig: {
                                             formatter:
                                                 "DSCPEntriesExpFormatter"
                                         }
                                     },{
                                         key: "trusted",
                                         templateGenerator: "TextGenerator",
                                         label: "VLAN Priority",
                                         templateGeneratorConfig: {
                                             formatter:
                                              "VLANPriorityEntriesExpFormatter"
                                         }
                                     },{
                                         key: "trusted",
                                         templateGenerator: "TextGenerator",
                                         label: "MPLS Exp",
                                         templateGeneratorConfig: {
                                             formatter:
                                                 "MPLSEntriesExpandFormatter"
                                         }
                                     }]
                                 }]
                             }]
                         }
                     }]
                 }
             };
         };

         this.qosGridColumns = function(qosFormatters) {
             return {
                 columns: [
                    {
                         field: "display_name",
                         name: "Name",
                         sortable: true,
                         formatter: this.showName
                     },
                     /*{
                         field: "qos_config_type",
                         name: "Type",
                         sortable: true,
                         formatter: qosFormatters.qosTypeFormatter
                     },*/
                     {
                         field: "trusted",
                         name: "Trusted",
                         sortable: true,
                         formatter: qosFormatters.trustedFormatter
                     },
                     {
                         field: "dscp_enttries",
                         name: "DSCP",
                         sortable: true,
                         formatter: qosFormatters.dscpEntriesFormatter
                     },
                     {
                         field: "vlan_priority_entries",
                         name: "VLAN Priority",
                         sortable: true,
                         formatter: qosFormatters.vlanPriorityEntriesFormatter
                     },
                     {
                         field: "mpls_exp_entries",
                         name: "MPLS Exp",
                         sortable: true,
                         formatter: qosFormatters.mplsExpEntriesFormatter
                     }

                 ]
             };

         };

         this.showName = function (r, c, v, cd, dc) {
             return ctwu.getDisplayNameOrName(dc);
         };
     };
     return qosUtils;
 });

