/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var lbCfgView = ContrailView.extend({
        el: $(contentContainer),

        renderLoadBalancer: function (viewConfig) {
            this.renderView4Config(this.$el, null, getLBCfgListConfig(viewConfig));
        },

        renderLBDetails: function(viewConfig) {
            var self = this,
            currentHashParams = layoutHandler.getURLHashParams(),
            loadBalancer = currentHashParams.focusedElement.loadBalancer,
            lbId = currentHashParams.focusedElement.uuid;
            viewConfig.lbId = lbId;
            viewConfig.projectId = currentHashParams.focusedElement.projectId;
            self.renderView4Config(self.$el, null,
                  getLoadBalancerDetails(viewConfig));
        },

        renderListenerDetails: function(viewConfig){
            var self = this,
            currentHashParams = layoutHandler.getURLHashParams(),
            listener = currentHashParams.focusedElement.listener;
            self.renderView4Config(self.$el, null,
                  getListenerDetails(viewConfig));
        },

        renderPoolDetails: function(viewConfig){
            var self = this,
            currentHashParams = layoutHandler.getURLHashParams(),
            pool = currentHashParams.focusedElement.pool;
            self.renderView4Config(self.$el, null,
                  getPoolDetails(viewConfig));
        }
    });

    function getLoadBalancerDetails(viewConfig){
        return {
            elementId: "laod-balancer-childs-page-id",
            view: "SectionView",
            viewConfig: {
                elementId: "laod-balancer-childs-page-tabs",
                rows: [{
                    columns: [{
                        elementId: "laod-balancer-childs-tab-id",
                        view: 'TabsView',
                        viewConfig: getLoadBalancerTabs(viewConfig)
                    }]
                }]
            }
        };
    };
    function getListenerDetails(viewConfig){
        return {
            elementId: "laod-balancer-listener-page-id",
            view: "SectionView",
            viewConfig: {
                elementId: "laod-balancer-listener-page-tabs",
                rows: [{
                    columns: [{
                        elementId: "laod-balancer-listener-tab-id",
                        view: 'TabsView',
                        viewConfig: getListenerTabs(viewConfig)
                    }]
                }]
            }
        };
    };
    function getPoolDetails(viewConfig){
        return {
            elementId: "laod-balancer-pool-page-id",
            view: "SectionView",
            viewConfig: {
                elementId: "laod-balancer-pool-page-tabs",
                rows: [{
                    columns: [{
                        elementId: "laod-balancer-pool-tab-id",
                        view: 'TabsView',
                        viewConfig: getPoolTabs(viewConfig)
                    }]
                }]
            }
        };
    };
    function getPoolTabs(viewConfig){
        return {
            theme: 'default',
            active: 0,
            tabs: [{
                    elementId: 'load_balancer_pool_details_tab',
                    title: 'Pool Info',
                    view: "poolnfoView",
                    viewPathPrefix: "config/networking/loadbalancer/ui/js/views/pool/",
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig,
                    tabConfig: {
                        activate: function(event, ui) {
                            var gridId = $('#' + ctwc.CONFIG_LISTENER_INFO_GRID_ID);
                            if (gridId.data('contrailGrid')) {
                                gridId.data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: true
                    }
                  },{
                    elementId: 'load_balancer_poolmember_info_tab',
                    title: 'Pool Members',
                    view: "poolMemberListView",
                    viewPathPrefix: "config/networking/loadbalancer/ui/js/views/poolmember/",
                    viewConfig: viewConfig,
                    tabConfig: {
                        activate: function(event, ui) {
                            var gridId = $('#' + ctwc.CONFIG_LB_POOL_MEMBER_GRID_ID);
                            if (gridId.data('contrailGrid')) {
                                gridId.data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: true
                    }
                 },{
                    elementId: 'load_balancer_monitor_info_tab',
                    title: 'Monitor',
                    view: "monitorListView",
                    viewPathPrefix: "config/networking/loadbalancer/ui/js/views/monitor/",
                    viewConfig: viewConfig,
                    tabConfig: {
                        activate: function(event, ui) {
                            var gridId = $('#' + ctwc.CONFIG_LB_MONITOR_GRID_ID);
                            if (gridId.data('contrailGrid')) {
                                gridId.data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: true
                    }
                 }
              ]
         };
    };
    function getListenerTabs(viewConfig){
        return {
            theme: 'default',
            active: 0,
            tabs: [{
               elementId: 'load_balancer_listener_details_tab',
               title: 'Listener Info',
               view: "listenerInfoView",
               viewPathPrefix: "config/networking/loadbalancer/ui/js/views/listener/",
               app: cowc.APP_CONTRAIL_CONTROLLER,
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.CONFIG_LISTENER_INFO_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: false
               }
           },{
               elementId: 'load_balancer_pool_info_tab',
               title: 'Pool',
               view: "poolListView",
               viewPathPrefix: "config/networking/loadbalancer/ui/js/views/pool/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.CONFIG_LB_POOL_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: true
               }
           }]
        };
    };
    function getLoadBalancerTabs(viewConfig){
        return {
            theme: 'default',
            active: 0,
            tabs: [{
               elementId: 'load_balancer_info_tab',
               title: 'Load Balancer Info',
               view: "lbInfoView",
               viewPathPrefix: "config/networking/loadbalancer/ui/js/views/",
               app: cowc.APP_CONTRAIL_CONTROLLER,
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.CONFIG_LB_INFO_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: false
               }
           },{
               elementId: 'load_balancer_listener_info_tab',
               title: 'Listener',
               view: "listenerListView",
               viewPathPrefix: "config/networking/loadbalancer/ui/js/views/listener/",
               app: cowc.APP_CONTRAIL_CONTROLLER,
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.CONFIG_LB_LISTENER_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: true
               }
           }]
        };
    };

    function getLBCfgListConfig(viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                config: true,
                includeDefaultProject: true,
                childView: {
                    init: getLBCfgViewConfig(viewConfig),
                },
            },
            customDomainDropdownOptions = {
                childView: {
                    init: ctwvc.getProjectBreadcrumbDropdownViewConfig(hashParams,
                                                 customProjectDropdownOptions)
                }
            };
        return ctwvc.getDomainBreadcrumbDropdownViewConfig(hashParams,
                                                     customDomainDropdownOptions)
    };

    function getLBCfgViewConfig(viewConfig) {
        return function (projectSelectedValueData) {
            return {
                elementId: cowu.formatElementId([ctwl.CFG_LB_PAGE_ID]),
                view: "lbCfgListView",
                viewPathPrefix:
                    "config/networking/loadbalancer/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: $.extend(true, {},
                     viewConfig, {projectSelectedValueData: projectSelectedValueData})
            }
        }
    };

    return lbCfgView;
});
