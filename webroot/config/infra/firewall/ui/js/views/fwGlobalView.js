/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var fwGlobalView = ContrailView.extend({
        el: $(contentContainer),
        renderFirewall: function (viewConfig) {
            var self = this;
            self.renderView4Config(self.$el, null, getSecurityPolicy(viewConfig),
                    null, null, null, function() {
                $('#' + ctwc.FW_POLICY_WIZARD).on('click', function() {self.openFWPolicyWizard();});
            });
        },
        renderInfraPolicyDetails: function(viewConfig) {
            var self = this,
            currentHashParams = layoutHandler.getURLHashParams(),
            policyName = currentHashParams.focusedElement.policy;
            self.renderView4Config(self.$el, null, getInfraPolicyDetails(viewConfig,policyName));            
        },
        openFWPolicyWizard: function () {
            require(['config/firewall/fwpolicywizard/common/ui/js/models/fwPolicyWizardModel',
            'config/firewall/fwpolicywizard/common/ui/js/views/fwPolicyWizardEditView'],
            function (FWPolicyWizardModel, FWPolicyWizardEditView) {
                var fwPolicyWizardModel =  new FWPolicyWizardModel(),
                    fwPolicyWizardEditView = new FWPolicyWizardEditView();
                fwPolicyWizardEditView.model = fwPolicyWizardModel;
                fwPolicyWizardEditView.renderFwWizard({
                                "title": ctwc.APS_MODAL_HEADER,
                                'viewConfig': { isGlobal: true , isWizard: true },
                                 callback: function () {
                                 }
                });
            });
        }
    });
    
    function getInfraPolicyDetails(viewConfig,policyName){
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
                        viewConfig: getfwRulePolicyTabs(viewConfig)
                    }]
                }]
            }
        };
    };

    function getSecurityPolicy(viewConfig){
        if(cowu.isAdmin() === true){
            return {
                elementId: cowu.formatElementId([ctwl.CONFIG_SECURITY_POLICY_PAGE_ID]),
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: ctwc.GLOBAL_SECURITY_POLICY_TAB_ID,
                            view: 'TabsView',
                            viewConfig: getSecurityPolicyTabs(viewConfig)
                        }, {
                            elementId: ctwc.FW_POLICY_WIZARD,
                            view: 'FormButtonView',
                            viewConfig: {
                                label: ctwl.FW_POLICY_WIZARD,
                                elementConfig:{
                                    btnClass:'btn-primary'
                                }
                            }
                        }]
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
                            viewConfig: getSecurityPolicyTabs(viewConfig)
                        }]
                    }]
                }
            };
        }
    };

    function getfwRulePolicyTabs(viewConfig){
        return {
            theme: 'default',
            active: 1,
            tabs: [{
               elementId: 'global_policy_info_tab',
               title: 'Policy Info',
               view: "fwPolicyInfoView",
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
    };
    function getSecurityPolicyTabs(viewConfig) {
        return {
            theme: 'default',
            active: 0,
            tabs: [
            {
                elementId: 'application_policy_tab',
                title: 'Application Policy Sets',
                view: "applicationPolicyGlobalListView",
                viewPathPrefix: "config/infra/firewall/ui/js/views/",
                viewConfig: viewConfig,
                tabConfig: {
                    activate: function(event, ui) {
                        var gridId = $('#' + ctwc.FIREWALL_APPLICATION_POLICY_GRID_ID);
                        if (gridId.data('contrailGrid')) {
                            gridId.data('contrailGrid').refreshView();
                        }
                    },
                    renderOnActivate: true
                }
            }, {
                elementId: 'fw_policy_tab',
                title: 'Firewall Policies',
                view: "fwPolicyGlobalListView",
                viewPathPrefix: "config/infra/firewall/ui/js/views/",
                viewConfig: viewConfig,
                tabConfig: {
                    activate: function(event, ui) {
                        var gridId = $('#' + ctwc.FW_POLICY_GRID_ID);
                        if (gridId.data('contrailGrid')) {
                            gridId.data('contrailGrid').refreshView();
                        }
                    },
                    renderOnActivate: true
                }
            },
            {
               elementId: 'service_group_tab',
               title: 'Service Groups',
               view: "serviceGroupGlobalListView",
               viewPathPrefix: "config/infra/firewall/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.SECURITY_POLICY_SERVICE_GRP_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: true
               }
           }, {
               elementId: 'address_group_tab',
               title: 'Address Groups',
               view: "addressGroupGlobalListView",
               viewPathPrefix: "config/infra/firewall/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.SECURITY_POLICY_ADDRESS_GRP_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: true
               }
           }]
        };
    };
    return fwGlobalView;
});
