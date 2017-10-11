/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/networking/slo/common/ui/js/sloFormatters'
], function (_, ContrailView, Knockback, SloFormatters) {
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
                }, null, true
            );
        },

        fetchRuleList : function(options, self, callback) {
                var returnArr = [];
                self.policyList = {}, self.secGrpList = {}, self.sloRuleList = [];
                self.policyObj = [], self.secGrpObj = [];
                $.each(options.policyModel, function (i, obj) {
                    self.policyObj.push(obj);
                    self.policyList[obj.name] = obj.fq_name.join(';');
                    var ruleList = getValueByJsonPath(obj, ctwc.POLICY_RULE, []);
                    if(ruleList.length > 0){
                        for(var j = 0; j < ruleList.length; j++){
                            self.policyList[ruleList[j].rule_uuid] = obj.name;
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
                        }
                    }
                });
                self.sloRuleList.push({text : 'Policy', value : 'network_policy', id :'network_policy', children : []},
                                {text : 'Security Group', value : 'security_group', id : 'security_group', children : []});
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

    function onNetworkPolicyChanged(e){
        var policyRule = [];
        if(e.added !== undefined){
            if(e.added.constructor !== Array){
                _.each(self.policyObj, function(obj) {
                    if(e.added.value === obj.uuid){
                        var ruleList = getValueByJsonPath(obj, ctwc.POLICY_RULE, []);
                        _.each(ruleList, function(rule) {
                            policyRule.push(policyHierarchicalList(rule, obj));
                        });
                    }
                });
                var updatedList = self.sloRuleList[0].children.concat(policyRule);
                self.sloRuleList[0].children = updatedList;
                self.model.model().attributes.sloRuleDetails.reset();
            }else if(e.added.length > 0){
                var existingList = [];
                _.each(e.added, function(obj) {
                    existingList.push(obj.value);
                });
                _.each(self.policyObj, function(obj) {
                    if(existingList.indexOf(obj.uuid) !== -1){
                        var ruleList = getValueByJsonPath(obj, ctwc.POLICY_RULE, []);
                        _.each(ruleList, function(rule) {
                            policyRule.push(policyHierarchicalList(rule, obj));
                        });
                    }
                });
                var updatedList = self.sloRuleList[0].children.concat(policyRule);
                self.sloRuleList[0].children = updatedList;
            }
        }
        if(e.removed !== undefined){
            if(e.removed.constructor !== Array){
                var ruleList;
                _.each(self.policyObj, function(policy) {
                    if(e.removed.value === policy.uuid){
                        ruleList = getValueByJsonPath(policy, ctwc.POLICY_RULE, []);
                    }
                });
                var updatedList = self.sloRuleList[0].children;
                _.each(ruleList, function(rule) {
                    _.each(updatedList, function(list, k) {
                        if(list !== undefined){
                            var ruleUuid = list.id.split(';')[0];
                            if(ruleUuid === rule.rule_uuid){
                                updatedList.splice(k,1);
                            }
                        }
                    });
                });
                self.sloRuleList[0].children = updatedList;
                self.model.model().attributes.sloRuleDetails.reset();
            }
        }
    };

    function onSecurityGroupChanged(e){
        var secGrpRule = [];
        if(e.added !== undefined){
            if(e.added.constructor !== Array){
                _.each(self.secGrpObj, function(obj) {
                    if(e.added.value === obj.uuid){
                        var ruleList = getValueByJsonPath(obj, ctwc.SERVICE_GRP_RULE, []);
                        _.each(ruleList, function(rule) {
                            secGrpRule.push(secGrpHierarchicalList(rule, obj));
                        });
                    }
                });
                var updatedList = self.sloRuleList[1].children.concat(secGrpRule);
                self.sloRuleList[1].children = updatedList;
                self.model.model().attributes.sloRuleDetails.reset();
            }else if(e.added.length > 0){
                var existingList = [];
                _.each(e.added, function(obj) {
                    existingList.push(obj.value);
                });
                _.each(self.secGrpObj, function(obj) {
                    if(existingList.indexOf(obj.uuid) !== -1){
                        var ruleList = getValueByJsonPath(obj, ctwc.SERVICE_GRP_RULE, []);
                        _.each(ruleList, function(rule) {
                            secGrpRule.push(secGrpHierarchicalList(rule, obj));
                        });
                    }
                });
                var updatedList = self.sloRuleList[1].children.concat(secGrpRule);
                self.sloRuleList[1].children = updatedList;
            }
        }
        if(e.removed !== undefined){
            if(e.removed.constructor !== Array){
                var ruleList;
                _.each(self.secGrpObj, function(secGrp) {
                    if(e.removed.value === secGrp.uuid){
                        ruleList = getValueByJsonPath(secGrp, ctwc.SERVICE_GRP_RULE, []);
                    }
                });
                var updatedList = self.sloRuleList[1].children;
                _.each(ruleList, function(rule) {
                    _.each(updatedList, function(list, k) {
                        if(list !== undefined){
                            var ruleUuid = list.id.split(';')[0];
                            if(ruleUuid === rule.rule_uuid){
                                updatedList.splice(k,1);
                            }
                        }
                    });
                });
                self.sloRuleList[1].children = updatedList;
                self.model.model().attributes.sloRuleDetails.reset();
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
                                            elementId: 'network_policy_refs',
                                            view: 'FormMultiselectView',
                                            viewConfig: {
                                                label: 'Network Policy (s)',
                                                path: 'network_policy_refs',
                                                class: 'col-xs-6',
                                                dataBindValue: 'network_policy_refs',
                                                elementConfig: {
                                                    placeholder: 'Select Network Policy (s)',
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
                                               label: 'Security Group (s)',
                                               path: 'security_group_refs',
                                               class: 'col-xs-6',
                                               dataBindValue: 'security_group_refs',
                                               elementConfig: {
                                                   placeholder: 'Select Security Group (s)',
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