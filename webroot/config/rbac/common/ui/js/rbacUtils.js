/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

 define(["underscore"], function(_){
     var rbacUtils = function(){
         this.configRBAC = function(model, callbackObj, options) {
             var ajaxConfig = {}, ajaxMethod, returnFlag = false,
                 putData, gridData, rowsCnt, mode,
                 defaultAALName = "default-api-access-list",
                 rbacRuleObj, attr, uuid,
                 domain = options.isGlobal ? "default-domain":
                 contrail.getCookie(cowc.COOKIE_DOMAIN),
                 project, fqName = [], parentType,
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
                 mode = getValueByJsonPath(options, "mode", "");
                 putData = this.getActualConfigData(attr, options);
                 uuid =
                     getValueByJsonPath(putData, "api-access-list;uuid",
                                        null);
                 rbacRuleObj = {
                     rule_object: (attr.rule_object &&
                                           attr.rule_object.trim()) ?
                                           attr.rule_object.trim() : "*",
                     rule_field:
                                       (attr.rule_field &&
                                           attr.rule_field.trim()) ?
                                           attr.rule_field.trim(): "*",
                     rule_perms: model.getRulePerms(attr)
                 };
                 if (null == uuid) {
                     if(options.isProject) {
                         parentType = "project";
                         project = contrail.getCookie(cowc.COOKIE_PROJECT);
                         fqName.push(domain);
                         fqName.push(project);
                     } else if(options.isGlobal) {
                         parentType = "global-system-config";
                         fqName.push("default-global-system-config");
                     } else if (options.isDomain) {
                         parentType = "domain";
                         fqName.push(domain);
                     }
                     fqName.push(defaultAALName);
                     putData = {};
                     putData["api-access-list"] = {};
                     putData["api-access-list"]["parent_type"] = parentType;
                     putData["api-access-list"]["fq_name"] = fqName;
                     putData["api-access-list"]["display_name"] =
                         defaultAALName;
                     putData["api-access-list"]["api_access_list_entries"] = {};
                     putData["api-access-list"]["api_access_list_entries"]["rbac_rule"] = [];
                 }

                 if (mode === ctwl.CREATE_ACTION) {
                     /* Add */
                     putData["api-access-list"]["api_access_list_entries"]
                         ["rbac_rule"].push(rbacRuleObj);
                 } else if(mode === ctwl.EDIT_ACTION) {
                     /* Edit */
                     putData["api-access-list"]["api_access_list_entries"]
                         ['rbac_rule'][attr.subIndex] = rbacRuleObj;
                 } else if(mode === "insert") {
                     /* Insert a rbac rule next to current row */
                     var currentRowRbacRuleObj = gridData[options.rowIndex];
                     putData = this.getApiAccessListByName(options.configData, currentRowRbacRuleObj.apiAccessListName);
                     putData["api-access-list"]["api_access_list_entries"]
                         ["rbac_rule"].splice(currentRowRbacRuleObj.subIndex + 1, 0, rbacRuleObj);
                 }
                 this.removeAdditionalRbacRulesProperties(putData["api-access-list"]
                     ["api_access_list_entries"]['rbac_rule']);

                 if(null == uuid) {
                     ajaxConfig.url = ctwc.URL_CREATE_CONFIG_OBJECT;
                 } else {
                     ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
                 }

                 ajaxConfig.type  = "POST";
                 ajaxConfig.data  = JSON.stringify(putData);

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

         this.getApiAccessListByName = function(configData, apiAccessListName) {
             var i, currentApiAccessListName;
             var defaultAALName = "default-api-access-list";

             for (i = 0; i < configData.length; i++) {
                 currentApiAccessListName = getValueByJsonPath(configData[i], "api-access-list;name");
                 if (currentApiAccessListName === apiAccessListName) {
                     return configData[i];
                 }
             }

             for (i = 0; i < configData.length; i++) {
                 currentApiAccessListName = getValueByJsonPath(configData[i], "api-access-list;name");
                 if (currentApiAccessListName === defaultAALName) {
                     return configData[i];
                 }
             }

             return configData[0];
         };

         this.getActualConfigData = function(attr, options) {
             var configData = getValueByJsonPath(options,
                     "configData", []), actConfigData = {};
             if(options.isDomain === true) {
                 var domain = attr.domain, domainValue, domainName, domainId;
                 for(var i = 0; i < configData.length; i++) {
                     domainTxt = getValueByJsonPath(configData[i],
                             "api-access-list;fq_name;0", {}, false),
                     domainId = getValueByJsonPath(configData[i],
                             "api-access-list;parent_uuid", "", false);
                     domainValue = domainTxt + ":" + domainId;
                     if(domainValue === domain) {
                         actConfigData = configData[i];
                         break;
                     }
                 }
             } else if(options.isProject === true) {
                 var project = attr.project;
                 for(var i = 0; i < configData.length; i++) {
                     var apiAccess = getValueByJsonPath(configData[i],
                             "api-access-list", {}, false),
                         projectId = getValueByJsonPath(configData[i],
                             "api-access-list;parent_uuid", "", false),
                         fqnId = apiAccess.fq_name[0] + ":" +
                             apiAccess.fq_name[1] + ":" + projectId;

                     if(fqnId === project) {
                         actConfigData = configData[i];
                         break;
                     }
                 }
             } else if (options.isGlobal === true) {
                 actConfigData = this.getApiAccessListByName(configData, attr.apiAccessListName);
             }
             return actConfigData;
         };

         this.removeAdditionalRbacRulesProperties = function (rbacRules) {
             _.each(rbacRules, function(rbacRule) {
                 ctwu.deleteCGridData(rbacRule);
                 delete rbacRule.domain;
                 delete rbacRule.project;
                 delete rbacRule.subIndex;
                 delete rbacRule.apiAccessListName;
             });
         };

         this.configAllRBAC = function(model, callbackObj, options) {
             var self = this, ajaxConfig = {}, ajaxMethod, returnFlag = false,
                 putData, gridData, rowsCnt, dataLen, mode,
                 defaultAALName = "default-api-access-list",
                 rbacRuleObj, attr, uuid,
                 domain,
                 project, fqName = [], parentType,
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
                 self.getConfigObject(attr, options, function(){
                     rowIndex = getValueByJsonPath(options, "rowIndex");
                     mode = getValueByJsonPath(options, "mode", "");
                     putData = self.getActualConfigData(attr, options);
                     uuid =
                         getValueByJsonPath(putData, "api-access-list;uuid",
                                            null);
                     rbacRuleObj = {
                         rule_object: (attr.rule_object &&
                                               attr.rule_object.trim()) ?
                                               attr.rule_object.trim() : "*",
                         rule_field:
                                           (attr.rule_field &&
                                               attr.rule_field.trim()) ?
                                               attr.rule_field.trim(): "*",
                         rule_perms: model.getRulePerms(attr)
                     };
                     if (null == uuid) {
                         gridData = [];
                         if(options.isProject) {
                             parentType = "project";
                             project = attr.project ?
                                     attr.project.split(":") : [];
                             if(project.length === 3) {
                                 fqName.push(project[0]);
                                 fqName.push(project[1]);
                             }
                         } else if(options.isGlobal) {
                             parentType = "global-system-config";
                             fqName.push("default-global-system-config");
                         } else if(options.isDomain) {
                             parentType = "domain";
                             domain = attr.domain ? attr.domain.split(":") : [];
                             if(domain.length === 2) {
                                 fqName.push(domain[0]);
                             }
                         }
                         fqName.push(defaultAALName);
                         putData = {};
                         putData["api-access-list"] = {};
                         putData["api-access-list"]["parent_type"] = parentType;
                         putData["api-access-list"]["fq_name"] = fqName;
                         putData["api-access-list"]["display_name"] =
                             defaultAALName;
                         putData["api-access-list"]["api_access_list_entries"]
                             = {};
                         putData["api-access-list"]["api_access_list_entries"]
                             ["rbac_rule"] = [];
                     }

                     if (mode === ctwl.CREATE_ACTION) {
                         /* Add */
                         //gridData.push(rbacRuleObj);
                         putData["api-access-list"]["api_access_list_entries"]
                             ["rbac_rule"].push(rbacRuleObj);
                     } else if(mode === ctwl.EDIT_ACTION) {
                         /* Edit */
                         /*putData["api-access-list"]["api_access_list_entries"]
                             ['rbac_rule'] = gridData;*/
                         putData["api-access-list"]["api_access_list_entries"]
                             ['rbac_rule'][rowIndex] = rbacRuleObj;
                     } else if(mode === "insert") {
                         /* Insert a rbac rule next to current row */
                         //gridData.splice(rowIndex + 1, 0, rbacRuleObj);
                         putData["api-access-list"]["api_access_list_entries"]
                         ["rbac_rule"].splice(rowIndex + 1, 0, rbacRuleObj);
                     }
                     self.removeAdditionalRbacRulesProperties(putData["api-access-list"]
                         ["api_access_list_entries"]['rbac_rule']);

                     if(null == uuid) {
                         ajaxConfig.url = ctwc.URL_CREATE_CONFIG_OBJECT;
                     } else {
                         ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
                     }

                     ajaxConfig.type  = "POST";
                     ajaxConfig.data  = JSON.stringify(putData);

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
                     callbackObj.error(model.getFormErrorText(
                             ctwc.RBAC_PREFIX_ID));
                 }
             }
             return returnFlag;
         };

         this.getConfigObject = function(attr, options, callback) {
             var domainId, projectId, postObj = {};
             postObj["data"] = [];
             if(options.isDomain) {
                 domainId = attr.domain && attr.domain.split(":").length === 2 ?
                         attr.domain.split(":")[1] : "";
                 postObj["data"].push({type: "domain", uuid: domainId})
             } else if(options.isProject){
                 projectId = attr.project &&
                         attr.project.split(":").length === 3 ?
                         attr.project.split(":")[2] : "";
                 postObj["data"].push({type: "project", uuid: projectId})
             }
             contrail.ajaxHandler({url: ctwc.URL_GET_CONFIG_OBJECTS,
                 type: "POST", data: JSON.stringify(postObj)}, null,
                 function(){
                     callback();
                 },
                 function(){
                     callback();
                 }
             );
         };

         this.deleteRBAC = function(callbackObj, options) {
             return this.deleteAllRBAC(callbackObj, options);
         };

         this.deleteAllRBAC = function(callbackObj, options) {
             var ajaxConfig = {}, returnFlag = false, i, rowIdxLen,
                 gridData = getValueByJsonPath(options, "gridData", []),
                 checkedRows = getValueByJsonPath(options, "checkedRows"),
                 putData, uuid, deleteAjax = [], projectIdMap = {},
                 projectList = [], rbacRules, uuidList = [];
             for(var i = 0; i < checkedRows.length; i++) {
                 if(options.isDomain === true) {
                     if(projectIdMap[checkedRows[i].domain] == null) {
                         projectIdMap[checkedRows[i].domain] = [];
                     }

                     projectIdMap[checkedRows[i].domain].push(
                             checkedRows[i].subIndex);
                 } else if(options.isProject === true) {
                     if(projectIdMap[checkedRows[i].project] == null) {
                         projectIdMap[checkedRows[i].project] = [];
                     }

                     projectIdMap[checkedRows[i].project].push(
                             checkedRows[i].subIndex);
                 } else if (options.isGlobal === true) {
                     if (!projectIdMap[checkedRows[i].apiAccessListName]) {
                         projectIdMap[checkedRows[i].apiAccessListName] = [];
                     }

                     projectIdMap[checkedRows[i].apiAccessListName].push(
                        checkedRows[i].subIndex
                    );
                 }
             }
             projectList = _.keys(projectIdMap);

             for(var cnt = 0; cnt < projectList.length; cnt++) {
                 if(options.isDomain === true) {
                     putData = this.getActualConfigData(
                        {domain:projectList[cnt]}, options);
                 } else if(options.isProject === true) {
                     putData = this.getActualConfigData(
                        {project:projectList[cnt]}, options);
                 } else if (options.isGlobal === true) {
                     putData = this.getApiAccessListByName(options.configData, projectList[cnt]);
                 }

                 uuid =
                    getValueByJsonPath(putData, "api-access-list;uuid",
                                   null);
                 var rowIndexes = projectIdMap[projectList[cnt]];
                 rowIndexes.sort(function(a, b) { return (b - a)});
                 rowIdxLen = rowIndexes.length;
                 for (i = 0; i < rowIdxLen; i++) {
                     var rowIndex = rowIndexes[i];
                     putData['api-access-list']['api_access_list_entries']
                        ['rbac_rule'].splice(rowIndex, 1);
                 }
                 rbacRules = getValueByJsonPath(putData,
                    "api-access-list;api_access_list_entries;rbac_rule",
                    [], false);
                 this.removeAdditionalRbacRulesProperties(rbacRules);
                 if(rbacRules.length === 0) {
                     uuidList.push(uuid);
                     continue;
                 }

                 ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
                 ajaxConfig.type = "POST";
                 ajaxConfig.data = JSON.stringify(putData);
                 ajaxConfig.contentType = "application/json; charset=utf-8";
                 deleteAjax.push($.ajax(ajaxConfig));
             }
             if (contrail.checkIfFunction(callbackObj.init)) {
                 callbackObj.init();
             }
             $.when.apply($, deleteAjax).then(function(response){
                 if (contrail.checkIfFunction(callbackObj.success)) {
                     callbackObj.success();
                 }
             }, function(error){
                 if (contrail.checkIfFunction(callbackObj.error)) {
                     callbackObj.error(error);
                 }
             })

             if(uuidList.length > 0) {
                 this.deleteAPIAccessList(callbackObj, uuidList);
             }

             return returnFlag;
         };

         //Deletes api-access-list if no rbac_rule found
         this.deleteAPIAccessList = function(callbackObj, uuidList) {
             var ajaxConfig = {};

             ajaxConfig.type = "POST";
             ajaxConfig.data = JSON.stringify([{'type': 'api-access-list',
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
         };

         this.getConfigData = function(viewConfig){
             return getValueByJsonPath(viewConfig, "rbacData;configData", {});
         };

         this.getTextForRoleCrud = function(roleCrud) {
             var roleCrudArry = roleCrud.split(""), roleCrudStr = "";
             _.each(roleCrudArry, function(roleCrudKey, i){
                 _.each(ctwc.RBAC_ROLE_CRUD_LIST, function(roleCrudItem){
                     if(roleCrudKey === roleCrudItem.value) {
                         if(i === 0) {
                             roleCrudStr = roleCrudItem.text;
                         } else {
                             roleCrudStr += ", " + roleCrudItem.text;
                         }
                     }
                 });
             });
             return roleCrudStr;
         };

         this.getRBACDetailsTemplateConfig = function() {
             return {
                 templateGenerator: 'RowSectionTemplateGenerator',
                 templateGeneratorConfig: {
                     rows: [{
                         templateGenerator: 'ColumnSectionTemplateGenerator',
                         templateGeneratorConfig: {
                             columns: [{
                                 class: 'col-xs-6',
                                 rows: [{
                                     title: 'Details',
                                     templateGenerator:
                                         'BlockListTemplateGenerator',
                                     templateGeneratorConfig: [{
                                         key: "rule_object",
                                         templateGenerator: "TextGenerator",
                                         label: "Object.Property",
                                         templateGeneratorConfig: {
                                             formatter: "ObjPropFormatter"
                                         }
                                     },{
                                         key: "rule_perms",
                                         templateGenerator: "TextGenerator",
                                         label: "API Access Rules",
                                         templateGeneratorConfig: {
                                             formatter: "RoleAccessFormatter"
                                         }
                                     }]
                                 }]
                             }]
                         }
                     }]
                 }
             };
         };

         this.rbacGridColumns = function(rbacFormatters) {
             return {
                 columns: [
                     {
                         field: "rule_object",
                         name: "Object.Property",
                         sortable: true,
                         formatter: rbacFormatters.objPropFormatter
                     },
                     {
                         field: "role_name",
                         name: "Role",
                         sortable: true,
                         formatter: rbacFormatters.roleFormatter
                     },
                     {
                         field: "role_crud",
                         name: "Access",
                         sortable: true,
                         formatter: rbacFormatters.accessFormatter
                     }
                 ]
             };

         };

         this.rbacDomainGridColumns = function(rbacFormatters) {
             return {
                 columns: [
                     {
                         field: "domain",
                         name: "Domain",
                         sortable: false,
                         formatter: rbacFormatters.formatDomain
                     },
                     {
                         field: "rule_object",
                         name: "Object.Property",
                         sortable: false,
                         formatter: rbacFormatters.objPropFormatter
                     },
                     {
                         field: "role_name",
                         name: "Role",
                         sortable: false,
                         formatter: rbacFormatters.roleFormatter
                     },
                     {
                         field: "role_crud",
                         name: "Access",
                         sortable: false,
                         formatter: rbacFormatters.accessFormatter
                     }
                 ]
             };

         };

         this.rbacProjectGridColumns = function(rbacFormatters) {
             return {
                 columns: [
                     {
                         field: "project",
                         name: "Project",
                         sortable: false,
                         formatter: rbacFormatters.formatProject
                     },
                     {
                         field: "rule_object",
                         name: "Object.Property",
                         sortable: false,
                         formatter: rbacFormatters.objPropFormatter
                     },
                     {
                         field: "role_name",
                         name: "Role",
                         sortable: false,
                         formatter: rbacFormatters.roleFormatter
                     },
                     {
                         field: "role_crud",
                         name: "Access",
                         sortable: false,
                         formatter: rbacFormatters.accessFormatter
                     }
                 ]
             };

         };

         this.subscribeRBACModelChangeEvents = function (rbacModel) {
             var self = this;
             rbacModel.__kb.view_model.model().on("change:rule_object",
                     function(model, newValue){
                         if(!newValue || newValue.trim() === "" ||
                             newValue.trim() === '*') {
                             return;
                         }
                         var ajaxConfig = {
                             url : "/api/tenants/config/get-object-properties/"
                                      + newValue,
                             type : 'GET'
                         };
                         contrail.ajaxHandler(ajaxConfig, null,
                             function(result) {
                                 rbacModel.rule_field_ds(
                                         self.getParsedObjectPropData(
                                             result));
                             }
                         );

                     }
               );
         };

         this.getParsedObjectPropData =  function(result) {
             var parsedData = [];
             if(result instanceof Array) {
                 _.each(result, function(property){
                     parsedData.push({"text": property, "value": property});
                 });
             }
             return parsedData;
         };
     };
     return rbacUtils;
 });

