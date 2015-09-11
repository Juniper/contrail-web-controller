/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var UnderlayTabView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;
            var tabsToDisable = ctwc.UNDERLAY_PROUTER_TAB_INDEXES.concat(
                ctwc.UNDERLAY_LINK_TAB_INDEX, ctwc.UNDERLAY_VM_TAB_INDEXES,
                ctwc.UNDERLAY_VROUTER_TAB_INDEXES);
            viewConfig['tabsToDisable'] = tabsToDisable;
            this.renderView4Config(self.$el, self.model,
                 getUnderlayTabConfig(viewConfig), null, null, null,
                 function () {
                    var contrailTabObj =
                        $(self.$el).find('#contrail-tabs').data('contrailTabs');
                    contrailTabObj.disableTab(tabsToDisable,true);
                 }
            );
        }
    });

    var getUnderlayTabConfig = function (viewConfig) {
        
        var underlayModel = monitorInfraUtils.getUnderlayGraphInstance();
        
        /*
         * Instance tab config (Details, Interfaces, Traffic Statistics,
         *  Port Distribution, Port Map, CPU/Memory)
         */ 
        var instanceTabConfig =
            ctwvc.getInstanceDetailPageTabConfig(viewConfig);
        
        // Underlay default tab config (Search flows & Trace flow)
        var underlayDefaultTabConfig =
            ctwvc.getUnderlayDefaultTabConfig(viewConfig);
        
        // pRouter tab config (Interface tab, Traffic statistics tab, Details tab)
        var underlayPRouterTabConfig =
            ctwvc.getUnderlayPRouterTabConfig(viewConfig);
        
        // TrafficStatistics tab for prouter  link
        var underlayPRouterLinkTabConfig =
            ctwvc.getUnderlayPRouterLinkTabConfig(viewConfig);
        
        // vRouter tab config (Details, Interfaces, Networks, ACL, Flows, Routes)
        /*var vRouterViewConfig =
            monitorInfraUtils.getUnderlayVRouterParams(underlayModel['model']['vRouters'][0]);*/
         
        var underlayVRouterTabConfig = ctwvc.getVRouterDetailsPageTabs({});
        
        var underlayTabConfig = underlayDefaultTabConfig.concat(
            underlayPRouterTabConfig,underlayPRouterLinkTabConfig,
            instanceTabConfig, underlayVRouterTabConfig);
        return {
            elementId: cowu.formatElementId([ctwc.UNDERLAY_TAB_ID, 'section']),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.UNDERLAY_TAB_ID,
                                view: "TabsView",
                                viewConfig: {
                                    theme: 'classic',
                                    disabled: ifNull(
                                        viewConfig['tabsToDisable'], []),
                                    activate: function (e, ui) {
                                        activate(e, ui);
                                    },
                                    tabs: underlayTabConfig
                                }
                            }
                        ]
                    }
                ]
            }
        };
    };
    
    function activate (e, ui) {
        var selTab = $(ui.newTab.context).text();
        if (selTab == ctwl.UNDERLAY_TRACEFLOW_TITLE &&
             $("#" + ctwc.TRACEFLOW_RESULTS_GRID_ID).data('contrailGrid') != null) {
            $("#" + ctwc.TRACEFLOW_RESULTS_GRID_ID).data('contrailGrid')
                                                   .refreshView();
        } else if (selTab == ctwl.TITLE_TRAFFIC_STATISTICS) {
            $('#' + ctwl.INSTANCE_TRAFFIC_STATS_ID).
            find('svg').trigger('refresh');
        } else if (selTab == ctwl.TITLE_INTERFACES) {
            $(ui.newPanel).find('.contrail-grid').
            data('contrailGrid').refreshView();
        } else if (selTab == ctwl.TITLE_CPU_MEMORY) {
            $('#' + ctwl.INSTANCE_CPU_MEM_STATS_ID).
            find('svg').trigger('refresh');
        } else if (selTab == ctwl.TITLE_PORT_DISTRIBUTION) {
            $('#' + ctwl.INSTANCE_PORT_DIST_CHART_ID).trigger('refresh');
        } else if (selTab == 'Networks') {
            $("#" + ctwl.VROUTER_NETWORKS_RESULTS).
            data('contrailGrid').refreshView();
        } else if (selTab == 'ACL') {
            $('#' + ctwl.VROUTER_ACL_GRID_ID).
            data('contrailGrid').refreshView();
        } else if (selTab == 'Flows') {
            $('#' + ctwl.VROUTER_FLOWS_GRID_ID).
            data('contrailGrid').refreshView();
        } else if (selTab == 'Routes') {
            $('#' + ctwl.VROUTER_ROUTES_GRID_ID).
            data('contrailGrid').refreshView();
        }
    }
    
    return UnderlayTabView;
});
