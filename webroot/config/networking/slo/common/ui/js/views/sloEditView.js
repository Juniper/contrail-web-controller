/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/networking/slo/common/ui/js/sloFormatters',
    'config/networking/slo/common/ui/js/models/sloRulesModel'
], function (_, ContrailView, Knockback, SloFormatters, SloRulesModel) {
    var prefixId = ctwc.SLO_PREFIX_ID;
    var modalId = 'configure-' + prefixId,
    sloFormatters = new SloFormatters();
    var self;
    var sloEditView = ContrailView.extend({
        renderAddEditSol: function (options) {
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId});
            self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                'title': options['title'], 'body': editLayout,
                 'onSave': function () {
                        self.configEditSlo(options);
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            this.fetchRuleList(options, this ,
                    function(allData) {
                       self.sloRenderView4Config(options, allData);
                       return;
                   }
            );
        },

        configEditSlo : function(options) {
            self.model.addEditSecLoggingObj({
                init: function () {
                    cowu.enableModalLoading(modalId);
                },
                success: function () {
                    options['callback']();
                    $("#" + modalId).modal('hide');
                },
                error: function (error) {
                    cowu.disableModalLoading(modalId, function () {
                        self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                                 error.responseText);
                    });
                }
            }, options);
        },

        sloRenderView4Config : function(options, allData) {
            var disableFlag =
                (options.mode === ctwl.EDIT_ACTION) ?  true : false;
            self.renderView4Config(
                $("#" + modalId).find("#" + prefixId + "-form"),
                self.model,
                getSloViewConfig(disableFlag, allData, options),
                "sloValidations", null, null,
                function () {
                    self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                             false);
                    Knockback.applyBindings(self.model,
                        document.getElementById(modalId));
                   kbValidation.bind(self);
                   kbValidation.bind(self, {collection: self.model.model().attributes.rules});
                   kbValidation.bind(self,{collection: self.model.model().attributes.sloRuleDetails});
                   //permissions
                   ctwu.bindPermissionsValidation(self);
                   var secLoggingInfo = $('<i class="fa fa-info-circle" aria-hidden="true" title="Every nth matching session will be logged."></i>');
                   var ruleInfo = $('<i class="fa fa-info-circle" aria-hidden="true" title="Every nth matching session will be logged."></i>');
                   var labelInfo = $('<i class="fa fa-info-circle" style = "margin-left: 3px" aria-hidden="true" title="Select Rules form unselected Network Policy and Security Group."></i>');
                   var policyInfo = $('<i class="fa fa-info-circle" aria-hidden="true" title="All Rules of selected Network Policy."></i>');
                   var securityGrpInfo = $('<i class="fa fa-info-circle" aria-hidden="true" title="All Rules of selected Security Group."></i>');
                   $('#security_logging_object_rate label').append(secLoggingInfo);
                   $('#sloRuleDetails  table thead tr th:nth-child(2)').append(ruleInfo);
                   $('#sloRuleDetails > label').append(labelInfo);
                   $('#network_policy_refs label').append(policyInfo);
                   $('#security_group_refs label').append(securityGrpInfo);
                }, null, true
            );
        },

        fetchRuleList : function(options, self, callback) {
                var returnArr = [], networkPolicyChildList = [], secGrpChildList = [];
                self.policyList = {}, self.secGrpList = {}, self.sloRuleList = [];
                self.policyObj = [], self.secGrpObj = [];
                $.each(options.policyModel, function (i, obj) {
                    self.policyObj.push(obj);
                    self.policyList[obj.name] = obj.fq_name.join(';');
                    var ruleList = getValueByJsonPath(obj, ctwc.POLICY_RULE, []);
                    if(ruleList.length > 0){
                        for(var j = 0; j < ruleList.length; j++){
                            self.policyList[ruleList[j].rule_uuid] = obj.name;
                            networkPolicyChildList.push(policyHierarchicalList(ruleList[j], obj));
                        }
                    }
                });
                $.each(options.secGrpModel, function (i, obj) {
                    self.secGrpObj.push(obj);
                    self.secGrpList[obj.name] = obj.fq_name.join(';');
                    var ruleList = getValueByJsonPath(obj, ctwc.SERVICE_GRP_RULE, []);
                    if(ruleList.length > 0){
                        for(var k = 0; k < ruleList.length; k++){
                            self.secGrpList[ruleList[k].rule_uuid] = obj.name;
                            secGrpChildList.push(secGrpHierarchicalList(ruleList[k], obj));
                        }
                    }
                });
                self.sloRuleList.push({text : 'Policy', value : 'network_policy', id :'network_policy', children : networkPolicyChildList},
                                {text : 'Security Group', value : 'security_group', id : 'security_group', children : secGrpChildList});
                callback(returnArr);
        },

        renderDeleteSlo: function(options) {
            var delTemplate = contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;
            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.deleteSlo(options['checkedRows'], {
                    init: function () {
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            self.model.showErrorAttr(prefixId +
                                                     cowc.FORM_SUFFIX_ID,
                                                     error.responseText);
                        });
                    }
                });
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(self.model, document.getElementById(modalId));
            kbValidation.bind(self);
        }
    });

    function policyHierarchicalList(rule, obj){
        var text = rule.rule_uuid +' ('+ obj.name + ')';
        var hierarchicalList = {text : text,
            value : rule.rule_uuid + cowc.DROPDOWN_VALUE_SEPARATOR + "network_policy",
            id : rule.rule_uuid + cowc.DROPDOWN_VALUE_SEPARATOR + "network_policy",
            parent : "network_policy" };
        return hierarchicalList;
    }

    function secGrpHierarchicalList(rule, obj){
        var text = rule.rule_uuid +' ('+ obj.name + ')';
        var hierarchicalList = {text : text,
            value : rule.rule_uuid + cowc.DROPDOWN_VALUE_SEPARATOR + "security_group",
            id : rule.rule_uuid + cowc.DROPDOWN_VALUE_SEPARATOR + "security_group",
            parent : "security_group" };
        return hierarchicalList;
    }

    function retainingPreviousRecords(updatedList, mode, ruleUUID){
        var sloRules = $.extend(true,{}, self.model.model().attributes.rules_entries.rules).toJSON();
        var existingRuleList = [];
        _.each(sloRules, function(obj) {
            var newObj = {};
            newObj.rule_uuid = obj.rule_uuid();
            newObj.rate = obj.rate();
            if(mode === 'network'){
                obj.dataSource()[0].children = updatedList;
            }else{
                obj.dataSource()[1].children = updatedList;
            }
            newObj.dataSource = obj.dataSource();
            existingRuleList.push(newObj);
        });
        if(existingRuleList.length > 0){
            var ruleModelColl = [];
            _.each(existingRuleList, function(obj) {
               var uuid = obj.rule_uuid.split(';')[0];
               if(ruleUUID.indexOf(uuid) === -1){
                   var newRuleModel = new SloRulesModel(obj);
                   self.model.subscribeSloRuleModelChangeEvents(newRuleModel);
                   ruleModelColl.push(newRuleModel);
               }
            });
            var coll = new Backbone.Collection(ruleModelColl);
            self.model.sloRuleDetails([]);
            self.model.sloRuleDetails(coll);
            self.model.rules_entries().rules = coll;
        }else{
            var emptyColl = new Backbone.Collection([]);
            self.model.sloRuleDetails(emptyColl);
            self.model.rules_entries().rules = emptyColl;
        }
    }

    function onNetworkPolicyChanged(e){
        var policyRule = [], ruleUuid = [],updatedChild = [], existingChild;
        if(e.added !== undefined){
            if(e.added.constructor !== Array){
                _.each(self.policyObj, function(obj) {
                    if(e.added.value === obj.uuid){
                        var ruleList = getValueByJsonPath(obj, ctwc.POLICY_RULE, []);
                        _.each(ruleList, function(rule) {
                            policyRule.push(rule.rule_uuid);
                            ruleUuid.push(rule.rule_uuid);
                        });
                    }
                });
                existingChild = self.sloRuleList[0].children;
                _.each(existingChild, function(child) {
                    var id = child.id.split(';')[0];
                   if(policyRule.indexOf(id) === -1){
                       updatedChild.push(child);
                   }
                });
                self.sloRuleList[0].children = updatedChild;
                retainingPreviousRecords(updatedChild, 'network', ruleUuid);
            }else if(e.added.length > 0){
                var existingList = [];
                _.each(e.added, function(obj) {
                    existingList.push(obj.value);
                });
                _.each(self.policyObj, function(obj) {
                    if(existingList.indexOf(obj.uuid) !== -1){
                        var ruleList = getValueByJsonPath(obj, ctwc.POLICY_RULE, []);
                        _.each(ruleList, function(rule) {
                            policyRule.push(rule.rule_uuid);
                            ruleUuid.push(rule.rule_uuid);
                        });
                    }
                });
                existingChild = self.sloRuleList[0].children;
                _.each(existingChild, function(child) {
                    var id = child.id.split(';')[0];
                   if(policyRule.indexOf(id) === -1){
                       updatedChild.push(child);
                   }
                });
                self.sloRuleList[0].children = updatedChild;
            }
        }
        if(e.removed !== undefined){
            if(e.removed.constructor !== Array){
                var ruleList;
                _.each(self.policyObj, function(policy) {
                    if(e.removed.value === policy.uuid){
                        ruleList = getValueByJsonPath(policy, ctwc.POLICY_RULE, []);
                        _.each(ruleList, function(rule) {
                            ruleUuid.push(rule.rule_uuid);
                            policyRule.push(policyHierarchicalList(rule, policy));
                        });
                    }
                });
                var updatedList = self.sloRuleList[0].children.concat(policyRule);
                self.sloRuleList[0].children = updatedList;
                retainingPreviousRecords(updatedList, 'network', ruleUuid);
            }
        }
    };

    function onSecurityGroupChanged(e){
        var secGrpRule = [], ruleUuid = [], updatedChild = [], existingChild;
        if(e.added !== undefined){
            if(e.added.constructor !== Array){
                _.each(self.secGrpObj, function(obj) {
                    if(e.added.value === obj.uuid){
                        var ruleList = getValueByJsonPath(obj, ctwc.SERVICE_GRP_RULE, []);
                        _.each(ruleList, function(rule) {
                            secGrpRule.push(rule.rule_uuid);
                            ruleUuid.push(rule.rule_uuid);
                        });
                    }
                });
                existingChild = self.sloRuleList[1].children;
                _.each(existingChild, function(child) {
                    var id = child.id.split(';')[0];
                   if(secGrpRule.indexOf(id) === -1){
                       updatedChild.push(child);
                   }
                });
                self.sloRuleList[1].children = updatedChild;
                retainingPreviousRecords(updatedChild, 'sgp', ruleUuid);
            }else if(e.added.length > 0){
                var existingList = [];
                _.each(e.added, function(obj) {
                    existingList.push(obj.value);
                });
                _.each(self.secGrpObj, function(obj) {
                    if(existingList.indexOf(obj.uuid) !== -1){
                        var ruleList = getValueByJsonPath(obj, ctwc.SERVICE_GRP_RULE, []);
                        _.each(ruleList, function(rule) {
                            secGrpRule.push(rule.rule_uuid);
                            ruleUuid.push(rule.rule_uuid);
                        });
                    }
                });
                existingChild = self.sloRuleList[1].children;
                _.each(existingChild, function(child) {
                    var id = child.id.split(';')[0];
                   if(secGrpRule.indexOf(id) === -1){
                       updatedChild.push(child);
                   }
                });
                self.sloRuleList[1].children = updatedChild;
            }
        }
        if(e.removed !== undefined){
            if(e.removed.constructor !== Array){
                var ruleList;
                _.each(self.secGrpObj, function(secGrp) {
                    if(e.removed.value === secGrp.uuid){
                        ruleList = getValueByJsonPath(secGrp, ctwc.SERVICE_GRP_RULE, []);
                        _.each(ruleList, function(rule) {
                            ruleUuid.push(rule.rule_uuid);
                            secGrpRule.push(secGrpHierarchicalList(rule, secGrp));
                        });
                    }
                });
                var updatedList = self.sloRuleList[1].children.concat(secGrpRule);
                self.sloRuleList[1].children = updatedList;
                retainingPreviousRecords(updatedList, 'sgp', ruleUuid);
            }
        }
    };
    function getSloViewConfig (disableOnEdit, allData, options) {
        var prefixId = ctwc.SLO_PREFIX_ID;
        var sloViewConfig = {
            elementId: cowu.formatElementId([prefixId,
                                            ctwl.TITLE_SLO]),
            title: "Security Logging Object",
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                                    elementId: 'name',
                                    view: 'FormInputView',
                                    viewConfig: {
                                        label: 'Name',
                                        path : 'name',
                                        class: 'col-xs-6',
                                        disabled: disableOnEdit,
                                        dataBindValue : 'name',
                                        placeholder: 'Enter Name'
                                   }
                                },
                                {
                                    elementId: 'security_logging_object_rate',
                                    view: 'FormInputView',
                                    viewConfig: {
                                        label: 'Rate',
                                        path : 'security_logging_object_rate',
                                        class: 'col-xs-6',
                                        dataBindValue : 'security_logging_object_rate',
                                        placeholder: 'Enter Rate'
                                   }
                                }]},
                                {
                                    columns: [
                                    {
                                        elementId: 'admin_state',
                                        view: "FormDropdownView",
                                        viewConfig: {
                                            label: 'Admin State',
                                            path : 'admin_state',
                                            class: 'col-xs-6',
                                            dataBindValue : 'admin_state',
                                            elementConfig : {
                                                dataTextField : "text",
                                                dataValueField : "id",
                                                placeholder : 'Select Admin State',
                                                data : [{id: 'true', text:'Up'},
                                                        {id: 'false', text:'Down'}]
                                            }
                                        }
                                    }
                                  ]
                                },
                                {
                                    columns: [
                                        {
                                            elementId: 'network_policy_refs',
                                            view: 'FormMultiselectView',
                                            viewConfig: {
                                                label: 'Network Policy(s)',
                                                path: 'network_policy_refs',
                                                class: 'col-xs-6',
                                                dataBindValue: 'network_policy_refs',
                                                elementConfig: {
                                                    placeholder: 'Select Network Policy(s)',
                                                    dataTextField: "text",
                                                    dataValueField: "id",
                                                    change : onNetworkPolicyChanged,
                                                    separator: cowc.DROPDOWN_VALUE_SEPARATOR,
                                                    dataSource : {
                                                        type: "remote",
                                                        url: options.policyUrl,
                                                        parse: sloFormatters.networkPolicyFormatter
                                                    }
                                                 }
                                            }
                                       },
                                       {
                                           elementId: 'security_group_refs',
                                           view: 'FormMultiselectView',
                                           viewConfig: {
                                               label: 'Security Group(s)',
                                               path: 'security_group_refs',
                                               class: 'col-xs-6',
                                               dataBindValue: 'security_group_refs',
                                               elementConfig: {
                                                   placeholder: 'Select Security Group(s)',
                                                   dataTextField: "text",
                                                   dataValueField: "id",
                                                   change : onSecurityGroupChanged,
                                                   separator: cowc.DROPDOWN_VALUE_SEPARATOR,
                                                   dataSource : {
                                                       type: "remote",
                                                       url: options.secGrpUrl,
                                                       parse: sloFormatters.securityGroupFormatter
                                                   }
                                                }
                                           }
                                      }]
                                },
                                {
                                    columns: [{
                                        elementId: 'sloRuleDetails',
                                        view: "FormCollectionView",
                                        viewConfig: {
                                            label:"Rule(s)",
                                            path: "sloRuleDetails",
                                            class: 'col-xs-12',
                                            validation: 'sloRuleValidation',
                                            templateId: cowc.TMPL_COLLECTION_HEADING_VIEW,
                                            collection: "sloRuleDetails",
                                            rows:[{
                                               rowActions: [
                                                    {onClick: "function() { $root.addSloRule(); }",
                                                     iconClass: 'fa fa-plus'},
                                                     {onClick: "function() { $root.deleteSloRule($data, this); }",
                                                     iconClass: 'fa fa-minus'}
                                               ],
                                            columns: [{elementId: 'rule_uuid',
                                                       view:
                                                           "FormHierarchicalDropdownView",
                                                       name: 'Rule UUID',
                                                       class: "",
                                                       width: 400,
                                                       viewConfig: {
                                                           templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                           path: 'rule_uuid',
                                                           dataBindValue: 'rule_uuid()',
                                                           dataBindOptionList : "dataSource()",
                                                           elementConfig: {
                                                               minimumResultsForSearch : 1,
                                                               placeholder:"Select Policy or Security Group Rule",
                                                               dataTextField: "text",
                                                               dataValueField: "value",
                                                               //data: allData.sloRuleList,
                                                               queryMap: [
                                                                   {
                                                                       name : 'Policy',
                                                                       value : 'network_policy',
                                                                       iconClass: 'icon-contrail-network-policy'
                                                                   },
                                                                   {
                                                                       name :'Security Group',
                                                                       value : 'security_group',
                                                                       iconClass: 'icon-contrail-security-group'
                                                                   }
                                                               ]
                                                           }
                                                       }
                                                  },
                                                  {
                                                      elementId: 'rate',
                                                      name: 'Rate',
                                                      view: "FormInputView",
                                                      class: "",
                                                      width: 200,
                                                      viewConfig: {
                                                         templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                         path: 'rate',
                                                         dataBindValue: 'rate()'
                                                      }
                                                   }
                                              ]
                                            }],
                                            gridActions: [
                                                {onClick: "function() { addSloRule(); }",
                                                 buttonTitle: ""}
                                            ]
                                      }
                                  }]
                              }
                             ]
                      }
               }
        return sloViewConfig;
    };

    return sloEditView;
});