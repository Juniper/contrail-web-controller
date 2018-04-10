/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodash',
    'contrail-view',
    'config/firewall/common/ui/js/views/fwProjectReview'
], function (_, ContrailView, FWProjectReview) {
    var fwProjectView = ContrailView.extend({
        el: $(contentContainer),
        renderFirewall: function (viewConfig) {
            var self = this;
            self.newViewConfig = {viewConfig: {}};
            self.viewConfig = viewConfig;
            self.renderFWTabs();
        },

        renderFWTabs: function(dataType) {
            var self = this;
            var fwProjectReview = new FWProjectReview();
            self.renderView4Config(this.$el, null, self.getDomainProjectDetails(self.viewConfig),
                    null, null, null, function(args) {
                $('#Apppolicy_toggle').off().on('click', function() {
                    $('.btn.btn-default.btn-sm.option').toggleClass('selected');
                    self.dataType = $('.btn.btn-default.btn-sm.option.selected')[0].innerText === 'Drafted' ?
                            ctwc.FW_DRAFTED : ctwc.FW_COMMITTED;
                    if(self.viewMap != null) {
                        self.refreshFWTabs(self.viewMap, self.dataType);
                    }
                });
                $('#Apppolicy_review').off().on('click', function() {
                    fwProjectReview.renderReviewFW({
                        "title": 'Review Project Polices',
                        viewConfig:self.viewConfig,
                        callback: function () {
                             self.refreshFWTabs(self.viewMap, self.dataType);
                        }});
                });
            });
        },

        getProjectSecPolicyDetils: function(projectId) {
            var ajaxConfig = {},
                self = this,
                scopeUUID="";
            ajaxConfig.type = "POST";
            ajaxConfig.async = false;
            ajaxConfig.data = JSON.stringify(
                    {data: [{type: 'projects', obj_uuids: [projectId]}]});
            ajaxConfig.url = ctwc.URL_GET_CONFIG_DETAILS;
            contrail.ajaxHandler(ajaxConfig, null, function(secPolicyDetails) {
                var secPolicyDraftMode = _.get(secPolicyDetails,
                        '0.projects.0.project.enable_security_policy_draft', false);
                scopeUUID =  _.get(secPolicyDetails,
                        '0.projects.0.project.uuid', "");
                self.viewConfig.isDraftMode = secPolicyDraftMode;
                self.viewConfig.scopeUUID = scopeUUID;
            }, function() {
                self.viewConfig.isDraftMode = false;
                self.viewConfig.scopeUUID = scopeUUID;
            });
        },

        refreshFWTabs: function(viewMap, dataType, currentTab) {
            var currentHashParams = layoutHandler.getURLHashParams();
            currentTab = currentTab ? currentTab :  _.get(currentHashParams, 'tab.security-policy-tab', '');
            currentTab = currentTab ? currentTab : 'application_policy_tab';
            viewMap[currentTab].attributes.viewConfig.dataType = dataType;
            viewMap[currentTab].render();
        },

        renderProjectPolicyDetails: function(viewConfig) {
            var self = this,
            currentHashParams = layoutHandler.getURLHashParams(),
            policyName = currentHashParams.focusedElement.policy,
            projectDisplayName = contrail.getCookie(cowc.COOKIE_PROJECT_DISPLAY_NAME),
            policyNameFormat;
            if(currentHashParams.focusedElement.isGlobal === "false"){
                policyNameFormat = policyName + " ("+projectDisplayName+")";
            }
            else{
                policyNameFormat = policyName;
            }
            self.renderView4Config(self.$el, null,
                    self.getProjectPolicyDetails(viewConfig,policyNameFormat));
        },
        /*openFWPolicyWizard: function () {
            var self = this;
            require(['config/firewall/fwpolicywizard/common/ui/js/models/fwPolicyWizardModel',
            'config/firewall/fwpolicywizard/common/ui/js/views/fwPolicyWizardEditView'],
            function (FWPolicyWizardModel, FWPolicyWizardEditView) {
                var fwPolicyWizardModel =  new FWPolicyWizardModel(),
                    fwPolicyWizardEditView = new FWPolicyWizardEditView();
                fwPolicyWizardEditView.model = fwPolicyWizardModel;
                fwPolicyWizardEditView.renderFwWizard({
                                "title": ctwc.APS_MODAL_HEADER,
                                'viewConfig': $.extend(self.newViewConfig.viewConfig, { isGlobal: false , isWizard: true }),
                                 callback: function () {
                                 }
                });
            });
        },*/
        getDomainProjectDetails: function(viewConfig) {
            var hashParams = viewConfig.hashParams,
                self = this,
                customProjectDropdownOptions = {
                    config: true,
                    childView: {
                        init: self.getSecurityTabsConfig(viewConfig),
                    }
                },
                customDomainDropdownOptions = {
                    childView: {
                        init: ctwvc.getProjectBreadcrumbDropdownViewConfig(hashParams,
                                                                     customProjectDropdownOptions)
                    }
                };
            return ctwvc.getDomainBreadcrumbDropdownViewConfig(hashParams,
                                                     customDomainDropdownOptions);
        },

        getSecurityTabsConfig: function(viewConfig) {
            var that = this;
            return function (projectSelectedValueData) {
                selectedDomainProjectData = projectSelectedValueData;
                var domain = {
                        'name':projectSelectedValueData.parentSelectedValueData.name,
                        'uuid':projectSelectedValueData.parentSelectedValueData.value,
                    }
                    var project = {
                        'name':projectSelectedValueData.name,
                        'uuid':projectSelectedValueData.value,
                    }
                    ctwu.setGlobalVariable("domain", domain);
                    ctwu.setGlobalVariable("project", project);
                var newViewConfig =
                    $.extend(true, {}, viewConfig,
                             {projectSelectedValueData: projectSelectedValueData});
                that.newViewConfig.viewConfig = newViewConfig;

                that.getProjectSecPolicyDetils(projectSelectedValueData.value);
                var secPolColumns = [{
                    elementId: ctwc.GLOBAL_SECURITY_POLICY_TAB_ID,
                    view: 'TabsView',
                    viewConfig: that.getSecurityPolicyTabs(newViewConfig)
                }];
                if(that.viewConfig.isDraftMode) {
                    secPolColumns = secPolColumns.concat([{
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

                return {
                    elementId: 'fw_project_tab_section_view',
                    view: "SectionView",
                    viewConfig: {
                        rows: [{
                            columns: secPolColumns
                        }]
                    }
                };
            };
        },

        getProjectPolicyDetails: function(viewConfig, policyNameFormat) {
            return {
                elementId: "fwrule-project-policy-page-id",
                view: "SectionView",
                viewConfig: {
                    title: ctwc.FIREWALL_POLICY_HEADING + " : " + policyNameFormat,
                    elementId: "fwrule-project-policy-page-tabs",
                    rows: [{
                        columns: [{
                            elementId: "fwrule-project-policy-tab-id",
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
                   elementId: 'project_policy_info_tab',
                   title: 'Policy Info',
                   view: "fwPolicyInfoView",
                   viewPathPrefix: "config/firewall/common/fwpolicy/ui/js/views/",
                   app: cowc.APP_CONTRAIL_CONTROLLER,
                   viewConfig: viewConfig,
                   tabConfig: {
                       activate: function(event, ui) {
                           var gridId = $('#' + 'fw-policy-Project-info');
                           if (gridId.data('contrailGrid')) {
                               gridId.data('contrailGrid').refreshView();
                           }
                       },
                       renderOnActivate: false
                   }
               }, {
                   elementId: 'project_policy_rules',
                   title: 'Rules',
                   view: "fwRuleProjectListView",
                   app: cowc.APP_CONTRAIL_CONTROLLER,
                   viewPathPrefix: "config/firewall/project/fwpolicy/ui/js/views/",
                   app: cowc.APP_CONTRAIL_CONTROLLER,
                   viewConfig: viewConfig,
                   tabConfig: {
                       activate: function(event, ui) {
                           var gridId = $('#' + 'Project_policy_rules_grid_id');
                           if (gridId.data('contrailGrid')) {
                               gridId.data('contrailGrid').refreshView();
                           }
                       },
                       renderOnActivate: true
                   }
               }, {
                   elementId: 'project_permissions',
                   title: 'Permissions',
                   view: "fwPermissionView",
                   app: cowc.APP_CONTRAIL_CONTROLLER,
                   viewPathPrefix: "config/firewall/common/fwpolicy/ui/js/views/",
                   viewConfig: viewConfig,
                   tabConfig: {
                       activate: function(event, ui) {
                           var gridId = $('#' + 'Project_permissions_grid_id');
                           if (gridId.data('contrailGrid')) {
                               gridId.data('contrailGrid').refreshView();
                           }
                       },
                       renderOnActivate: false
                   }
               }]
            };
        },

        getSecurityPolicyTabs: function(viewConfig) {
            var that = this;
            return {
                theme: 'default',
                active: 0,
                tabs: [{
                    elementId: 'application_policy_tab',
                    title: 'Application Policy Sets',
                    view: "applicationPolicyProjectListView",
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewPathPrefix: "config/firewall/project/applicationpolicy/ui/js/views/",
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
                    view: "fwPolicyProjectListView",
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewPathPrefix: "config/firewall/project/fwpolicy/ui/js/views/",
                    viewConfig: viewConfig,
                    tabConfig: {
                        activate: function(event, ui) {
                            if(that.viewConfig.isDraftMode) {
                                that.refreshFWTabs(that.viewMap, that.dataType, 'fw_policy_tab');
                                return;
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
                    view: "fwRulesProjectTabListView",
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewPathPrefix: "config/firewall/common/ui/js/views/",
                    viewConfig: viewConfig,
                    tabConfig: {
                        activate: function(event, ui) {
                            if(that.viewConfig.isDraftMode) {
                                that.refreshFWTabs(that.viewMap, that.dataType, 'fw_rule_tab');
                                return;
                            }
                            var gridId = $('#' + ctwc.FW_POLICY_GRID_ID);
                            if (gridId.data('contrailGrid')) {
                                gridId.data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: that.viewConfig.isDraftMode ? false : true
                    }
                }, {
                   elementId: 'service_group_tab',
                   title: 'Service Groups',
                   view: "serviceGroupProjectListView",
                   app: cowc.APP_CONTRAIL_CONTROLLER,
                   viewPathPrefix: "config/firewall/project/servicegroup/ui/js/views/",
                   viewConfig: viewConfig,
                   tabConfig: {
                       activate: function(event, ui) {
                           if(that.viewConfig.isDraftMode) {
                               that.refreshFWTabs(that.viewMap, that.dataType, 'service_group_tab');
                               return;
                           }
                           var gridId = $('#' + ctwc.SECURITY_POLICY_SERVICE_GRP_GRID_ID);
                           if (gridId.data('contrailGrid')) {
                               gridId.data('contrailGrid').refreshView();
                           }
                       },
                       renderOnActivate: that.viewConfig.isDraftMode ? false : true
                   }
               }, {
                   elementId: 'address_group_tab',
                   title: 'Address Groups',
                   view: "addressGroupProjectListView",
                   app: cowc.APP_CONTRAIL_CONTROLLER,
                   viewPathPrefix: "config/firewall/project/addressgroup/ui/js/views/",
                   viewConfig: viewConfig,
                   tabConfig: {
                       activate: function(event, ui) {
                           if(that.viewConfig.isDraftMode) {
                               that.refreshFWTabs(that.viewMap, that.dataType, 'address_group_tab');
                               return;
                           }
                           var gridId = $('#' + ctwc.SECURITY_POLICY_ADDRESS_GRP_GRID_ID);
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
    return fwProjectView;
});
