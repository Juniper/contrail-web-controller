/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var projectSettingsTabView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;
            self.renderView4Config(self.$el, null, getProjSettingsConfig(viewConfig));
        }
    });

    function getProjSettingsConfig(viewConfig){
        return {
            elementId: cowu.formatElementId([ctwc.CONFIG_PROJECT_SETTINGS_PAGE_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: ctwc.CONFIG_PROJECT_SETTINGS_TAB_ID,
                        view: 'TabsView',
                        viewConfig: getProjSettingsConfigTabs(viewConfig)
                    }]
                }]
            }
        };
    };

    function getProjSettingsConfigTabs(viewConfig) {
        return {
            theme: 'default',
            active: 0,
            tabs: [{
               elementId: ctwc.CONFIG_QUOTAS_PAGE_ID,
               title: ctwl.TITLE_QUOTAS,
               view: "QuotasListView",
               viewPathPrefix: "config/infra/quotas/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.CONFIG_QUOTAS_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   }
               }
           },{
               elementId: ctwc.CONFIG_PROJECT_OTHER_SETTINGS_PAGE_ID,
               title: ctwl.TITLE_OTHER_SETTINGS,
               view: "projectOtherSettingsListView",
               viewPathPrefix: "config/infra/quotas/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.GLOBAL_BGP_OPTIONS_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: true
               }
           }]
        };
    };
    return projectSettingsTabView;
});

