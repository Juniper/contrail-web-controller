/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var fwRuleTabView = ContrailView.extend({
        el: $(contentContainer),
        render: function (viewConfig) {
            var self = this,
            viewConfig = this.attributes.viewConfig,
            currentHashParams = layoutHandler.getURLHashParams(),
            policyName = currentHashParams.focusedElement.policy;
            self.renderView4Config(self.$el, null, getfwRulePolicy(viewConfig,policyName));
        }
    });
    function getfwRulePolicy(viewConfig, policyName){
        return {
            elementId: "fwrule-policy-page-id",
            view: "SectionView",
            class:"page-header-text",
            viewConfig: {
                title: policyName,
                elementId: "fwrule-policy-page-tabs",
                rows: [{
                    columns: [{
                        elementId: "fwrule-policy-tab-id",
                        view: 'TabsView',
                        viewConfig: getfwRulePolicyTabs(viewConfig)
                    }]
                }]
            }
        };
    };
    function getfwRulePolicyTabs(viewConfig) {
        return {
            theme: 'default',
            active: 1,
            tabs: [{
               elementId: 'policy_info_tab',
               title: 'Policy Info',
               view: "fwPolicyInfoView",
               viewPathPrefix: "config/firewall/common/fwpolicy/ui/js/views/",
               app: cowc.APP_CONTRAIL_CONTROLLER,
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + 'policy_info_tab-tab');
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: false
               }
           }, {
               elementId: 'policy_rules',
               title: 'Rules',
               view: "fwRuleProjectListView",
               viewPathPrefix: "config/firewall/project/fwpolicy/ui/js/views/",
               app: cowc.APP_CONTRAIL_CONTROLLER,
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + 'fw-rule-grid');
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: true
               }
           }, {
               elementId: 'permissions',
               title: 'Permissions',
               view: "fwPermissionView",
               viewPathPrefix: "config/firewall/common/fwpolicy/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + 'permissions_grid_id');
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: false
               }
           }]
        };
    };
    return fwRuleTabView;
});
