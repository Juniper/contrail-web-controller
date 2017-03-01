/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var nodesConfigView = ContrailView.extend({
        el: $(contentContainer),
        renderNodesConfig: function (viewConfig) {
            var self = this;
            self.renderView4Config(self.$el, null, getNodesConfig(viewConfig));
        }
    });

    function getNodesConfig(viewConfig){
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_GLOBAL_CONFIG_PAGE_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: ctwc.GLOBAL_CONFIG_TAB_ID,
                        view: 'TabsView',
                        viewConfig: getNodesConfigTabs(viewConfig)
                    }]
                }]
            }
        };
    };

    function getNodesConfigTabs(viewConfig) {
        return {
            theme: 'default',
            active: 0,
            tabs: [{
                elementId: 'virtual_routers_tab',
                title: ctwl.CFG_VROUTER_TITLE,
                view: "vRouterCfgListView",
                viewPathPrefix: "config/infra/vrouters/ui/js/views/",
                viewConfig: viewConfig,
                tabConfig: {
                    activate: function(event, ui) {
                        var gridId = $('#' + ctwl.CFG_VROUTER_GRID_ID);
                        if (gridId.data('contrailGrid')) {
                            gridId.data('contrailGrid').refreshView();
                        }
                    }
                }
            }, {
               elementId: 'analytics_node_tab',
               title: ctwl.TITLE_ANALYTICS_NODE,
               view: "analyticsNodeCfgListView",
               viewPathPrefix: "config/infra/nodes/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.ANALYTICS_NODE_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: true
               }
           }, {
               elementId: 'config_node_tab',
               title: ctwl.TITLE_CONFIG_NODE,
               view: "configNodeCfgListView",
               viewPathPrefix: "config/infra/nodes/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.CONFIG_NODE_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: true
               }
           }, {
               elementId: 'database_node_tab',
               title: ctwl.TITLE_DATABASE_NODE,
               view: "databaseNodeCfgListView",
               viewPathPrefix: "config/infra/nodes/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.DATABASE_NODE_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: true
               }
           }]
        };
    };
    return nodesConfigView;
});

