/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var rbacView = ContrailView.extend({
        el: $(contentContainer),
        renderRBAC: function (viewConfig) {
            var self = this;
            self.renderView4Config(self.$el, null, getRBACConfig(viewConfig));
        }
    });

    function getRBACConfig(viewConfig){
        return {
            elementId: cowu.formatElementId([ctwl.RBAC_GLOBAL_PAGE_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: ctwc.RBAC_GLOBAL_TAB_ID,
                        view: 'TabsView',
                        viewConfig: getRBACConfigTabs(viewConfig)
                    }]
                }]
            }
        };
    };

    function getRBACConfigTabs(viewConfig) {
        return {
            theme: 'default',
            active: 0,
            tabs: [{
               elementId: 'rbac_global_tab',
               title: 'Global',
               view: "rbacGlobalListView",
               viewPathPrefix: "config/infra/rbac/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.RBAC_GLOBAL_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   }
               }
           },{
               elementId: 'rbac_domain_tab',
               title: 'Domain',
               view: "rbacDomainListView",
               viewPathPrefix: "config/infra/rbac/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.RBAC_DOMAIN_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: true
               }
           },{
               elementId: 'rbac_project_tab',
               title: 'Project',
               view: "rbacProjectListView",
               viewPathPrefix: "config/infra/rbac/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.RBAC_PROJECT_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: true
               }
           }]
        };
    };
    return rbacView;
});
