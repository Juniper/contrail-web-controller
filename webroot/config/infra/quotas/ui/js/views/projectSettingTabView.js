/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var projectSettingTabView = ContrailView.extend({
        el: $(contentContainer),
        render: function (viewConfig) {
            var self = this,
            viewConfig = this.attributes.viewConfig;
            self.renderView4Config(self.$el, null, getProjectSettingView(viewConfig));
        }
    });
    function getProjectSettingView(viewConfig){
        return {
            elementId: "project-setting",
            view: "SectionView",
            viewConfig: {
                elementId: "project-setting-tabs",
                rows: [{
                    columns: [{
                        elementId: "project-setting-tab-id",
                        view: 'TabsView',
                        viewConfig: getProjectSettingTabs(viewConfig)
                    }]
                }]
            }
        };
    };
    function getProjectSettingTabs(viewConfig) {
        return {
            theme: 'default',
            active: 0,
            tabs: [{
               elementId: 'project-quotas',
               title: 'Quotas',
               view: "QuotasListView",
               viewPathPrefix: "config/infra/quotas/ui/js/views/",
               app: cowc.APP_CONTRAIL_CONTROLLER,
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + 'quotas-grid');
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: false
               }
           }, {
               elementId: 'project-tags',
               title: 'Tags',
               view: "projectTagListView",
               viewPathPrefix: "config/infra/quotas/ui/js/views/",
               app: cowc.APP_CONTRAIL_CONTROLLER,
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + 'project-tag-grid-id');
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: true
               }
           }]
        };
    };
    return projectSettingTabView;
});
