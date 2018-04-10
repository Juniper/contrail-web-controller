/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodash',
    'contrail-view',
    'config/infra/firewall/ui/js/views/fwGlobalReview'
], function (_, ContrailView, FWGlobalReview) {
    var fwGlobalView = ContrailView.extend({
        el: $(contentContainer),
        renderFirewall: function (viewConfig) {
            var self = this;
            self.viewConfig = viewConfig;
            self.getGlobalSecPolicyDetils();
        },

        renderFWTabs: function (isDraftMode, scopeUUID) {
            var self = this;
            var fwGlobalReview = new FWGlobalReview();
            self.viewConfig.isDraftMode = isDraftMode;
            self.renderView4Config(this.$el, null, self.getSecurityPolicy(self.viewConfig),
                    null, null, null, function(args) {
                if(!isDraftMode){
                    return;
                }
                $('#Apppolicy_toggle').off().on('click', function() {
                    $('.btn.btn-default.btn-sm.option').toggleClass('selected');
                    self.dataType = $('.btn.btn-default.btn-sm.option.selected')[0].innerText === 'Drafted' ?
                            ctwc.FW_DRAFTED : ctwc.FW_COMMITTED;
                    if(self.viewMap != null) {
                        self.refreshFWTabs(self.viewMap, self.dataType);
                    }
                });
                $('#Apppolicy_review').off().on('click', function() {
                		fwGlobalReview.renderReviewFW({
                            "title": 'Review Global Polices',
                            viewConfig:self.viewConfig,
                            scopeUUID: scopeUUID,
                          // 'isDraftMode': viewConfig.isDraftMode,
                            callback: function () {
                            	 self.refreshFWTabs(self.viewMap, self.dataType);
                            }});
                 });
            });
        },

        getGlobalSecPolicyDetils: function() {
            var ajaxConfig = {},
                self = this;
            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify(
                    {data: [{type: 'global-system-configs', fields: ['enable_security_policy_draft']}]});
            ajaxConfig.url = ctwc.URL_GET_CONFIG_DETAILS;
            var scopeUUID ="";
            contrail.ajaxHandler(ajaxConfig, null, function(secPolicyDetails) {
                var result = _.get(secPolicyDetails, '0.global-system-configs', []),
                secPolicyMgmtConfig = _.find(result, function(policyMgmt) {
                         return _.get(policyMgmt, 'global-system-config.fq_name.0', '')
                             === ctwc.DEFAULT_GLOBAL_SYSTEM_CONFIG;
                }),
                secPolicyDraftMode = _.get(secPolicyMgmtConfig,
                        'global-system-config.enable_security_policy_draft', false);
                scopeUUID =  _.get(secPolicyMgmtConfig,
                        'global-system-config.uuid', false);
                self.viewConfig.isDraftMode = secPolicyDraftMode;
                self.viewConfig.scopeUUID = scopeUUID;
                self.renderFWTabs(secPolicyDraftMode, scopeUUID);
            }, function() {
                self.renderFWTabs(false,scopeUUID);
            });
        },
        renderInfraPolicyDetails: function(viewConfig) {
            var self = this,
            currentHashParams = layoutHandler.getURLHashParams(),
            policyName = currentHashParams.focusedElement.policy;
            self.renderView4Config(self.$el, null, self.getInfraPolicyDetails(viewConfig,policyName));
        },

        refreshFWTabs: function(viewMap, dataType, currentTab) {
            var currentHashParams = layoutHandler.getURLHashParams();
            currentTab = currentTab ? currentTab :  _.get(currentHashParams, 'tab.security-policy-tab', '');
            currentTab = currentTab ? currentTab : 'application_policy_tab';
            viewMap[currentTab].attributes.viewConfig.dataType = dataType;
            viewMap[currentTab].render();
        },

        getInfraPolicyDetails: function(viewConfig, policyName) {
            return {
                elementId: "fwrule-global-policy-page-id",
                view: "SectionView",
                viewConfig: {
                    title: ctwc.FIREWALL_POLICY_HEADING + " : " + policyName,
                    elementId: "fwrule-global-policy-page-tabs",
                    rows: [{
                        columns: [{
                            elementId: "fwrule-global-policy-tab-id",
                            view: 'TabsView',
                            viewConfig: this.getfwRulePolicyTabs(viewConfig)
                        }]
                    }]
                }
            };
        },

        getfwRulePolicyTabs: function(viewConfig) {
            return {
                theme: 'default',
                active: 1,
                tabs: [{
                   elementId: 'global_policy_info_tab',
                   title: 'Policy Info',
                   view: "fwPolicyInfoView",
                   app: cowc.APP_CONTRAIL_CONTROLLER,
                   viewPathPrefix: "config/firewall/common/fwpolicy/ui/js/views/",
                   app: cowc.APP_CONTRAIL_CONTROLLER,
                   viewConfig: viewConfig,
                   tabConfig: {
                       activate: function(event, ui) {
                           var gridId = $('#' + 'fw-policy-global-info');
                           if (gridId.data('contrailGrid')) {
                               gridId.data('contrailGrid').refreshView();
                           }
                       },
                       renderOnActivate: false
                   }
               }, {
                   elementId: 'global_policy_rules',
                   title: 'Rules',
                   view: "fwRuleProjectListView",
                   app: cowc.APP_CONTRAIL_CONTROLLER,
                   viewPathPrefix: "config/firewall/project/fwpolicy/ui/js/views/",
                   app: cowc.APP_CONTRAIL_CONTROLLER,
                   viewConfig: viewConfig,
                   tabConfig: {
                       activate: function(event, ui) {
                           var gridId = $('#' + 'global_policy_rules_grid_id');
                           if (gridId.data('contrailGrid')) {
                               gridId.data('contrailGrid').refreshView();
                           }
                       },
                       renderOnActivate: true
                   }
               }, {
                   elementId: 'global_permissions',
                   title: 'Permissions',
                   view: "fwPermissionView",
                   app: cowc.APP_CONTRAIL_CONTROLLER,
                   viewPathPrefix: "config/firewall/common/fwpolicy/ui/js/views/",
                   viewConfig: viewConfig,
                   tabConfig: {
                       activate: function(event, ui) {
                           var gridId = $('#' + 'global_permissions_grid_id');
                           if (gridId.data('contrailGrid')) {
                               gridId.data('contrailGrid').refreshView();
                           }
                       },
                       renderOnActivate: false
                   }
               }]
            };
        },

        getSecurityPolicy: function(viewConfig) {
            var secPolicyColumns = [{
                elementId: ctwc.GLOBAL_SECURITY_POLICY_TAB_ID,
                view: 'TabsView',
                viewConfig: this.getSecurityPolicyTabs(viewConfig)
            }];
            if(viewConfig.isDraftMode) {
                secPolicyColumns = secPolicyColumns.concat([{
                                elementId: ctwc.FW_COMMITTED,
                                view: 'FormRadioButtonView',
                                viewConfig: {
                                    templateId: 'firewall-draft-options-template',
                                    label: ctwl.TITLE_FW_COMMITTED,
                                    elementConfig:{
                                        btnClass:'btn-primary'
                                    }
                                }
                            }]);
            }
            if(cowu.isAdmin() === true){
                return {
                    elementId: cowu.formatElementId([ctwl.CONFIG_SECURITY_POLICY_PAGE_ID]),
                    view: "SectionView",
                    viewConfig: {
                        rows: [{
                            columns: secPolicyColumns
                        }]
                    }
                };
            }
            else{
                return {
                    elementId: cowu.formatElementId([ctwl.CONFIG_SECURITY_POLICY_PAGE_ID]),
                    view: "SectionView",
                    viewConfig: {
                        rows: [{
                            columns: [{
                                elementId: ctwc.GLOBAL_SECURITY_POLICY_TAB_ID,
                                view: 'TabsView',
                                viewConfig: this.getSecurityPolicyTabs(viewConfig)
                            }]
                        }]
                    }
                };
            }
        },

        getSecurityPolicyTabs: function(viewConfig) {
            var that = this;
            return {
                theme: 'default',
                active: 0,
                tabs: [
                {
                    elementId: 'application_policy_tab',
                    title: 'Application Policy Sets',
                    view: "applicationPolicyGlobalListView",
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewPathPrefix: "config/infra/firewall/ui/js/views/",
                    viewConfig: viewConfig,
                    tabConfig: {
                        activate: function(event, ui) {
                            if(that.viewConfig.isDraftMode) {
                                that.refreshFWTabs(that.viewMap, that.dataType, 'application_policy_tab');
                                return;
                            }
                            var gridId = $('#' + ctwc.FIREWALL_APPLICATION_POLICY_GRID_ID);
                            if (gridId.data('contrailGrid')) {
                                gridId.data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: false
                    }
                }, {
                    elementId: 'fw_policy_tab',
                    title: 'Firewall Policies',
                    view: "fwPolicyGlobalListView",
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewPathPrefix: "config/infra/firewall/ui/js/views/",
                    viewConfig: viewConfig,
                    tabConfig: {
                        activate: function(event, ui) {
                            if(that.viewConfig.isDraftMode) {
                                that.refreshFWTabs(that.viewMap, that.dataType, 'fw_policy_tab');
                            }
                            var gridId = $('#' + ctwc.FW_POLICY_GRID_ID);
                            if (gridId.data('contrailGrid')) {
                                gridId.data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: that.viewConfig.isDraftMode ? false : true
                    }
                }, {
                    elementId: 'fw_rule_tab',
                    title: 'Firewall Rules',
                    view: "fwRuleGlobalListView",
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewPathPrefix: "config/infra/firewall/ui/js/views/",
                    viewConfig: viewConfig,
                    _rendered: false,
                    tabConfig: {
                        activate: function(event, ui) {
                            if(that.viewConfig.isDraftMode) {
                                that.refreshFWTabs(that.viewMap, that.dataType, 'fw_rule_tab');
                            }
                            var gridId = $('#' + ctwc.FW_RULE_GRID_ID);
                            if (gridId.data('contrailGrid')) {
                                gridId.data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: that.viewConfig.isDraftMode ? false : true
                    }
                }, {
                   elementId: 'service_group_tab',
                   title: 'Service Groups',
                   view: "serviceGroupGlobalListView",
                   app: cowc.APP_CONTRAIL_CONTROLLER,
                   viewPathPrefix: "config/infra/firewall/ui/js/views/",
                   viewConfig: $.extend(viewConfig, {isWizard: false}),
                   tabConfig: {
                       activate: function(event, ui) {
                           if(that.viewConfig.isDraftMode) {
                               that.refreshFWTabs(that.viewMap, that.dataType, 'service_group_tab');
                           }
                           var gridId = $('#security-policy-service-group_standalone');
                           if (gridId.data('contrailGrid')) {
                               gridId.data('contrailGrid').refreshView();
                           }
                       },
                       renderOnActivate: that.viewConfig.isDraftMode ? false : true
                   }
               }, {
                   elementId: 'address_group_tab',
                   title: 'Address Groups',
                   view: "addressGroupGlobalListView",
                   app: cowc.APP_CONTRAIL_CONTROLLER,
                   viewPathPrefix: "config/infra/firewall/ui/js/views/",
                   viewConfig: $.extend(viewConfig, {isWizard: false}),
                   tabConfig: {
                       activate: function(event, ui) {
                           if(that.viewConfig.isDraftMode) {
                               that.refreshFWTabs(that.viewMap, that.dataType, 'address_group_tab');
                           }
                           var gridId = $('#security-policy-address-grp-grid_standalone');
                           if (gridId.data('contrailGrid')) {
                               gridId.data('contrailGrid').refreshView();
                           }
                       },
                       renderOnActivate: that.viewConfig.isDraftMode ? false : true
                   }
               }]
            };
        }
    });
    return fwGlobalView;
});
