/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var RtTableView = ContrailView.extend({
        el: $(contentContainer),
        renderRtTable: function (viewConfig) {
            var self = this;
            //self.renderRouteTableTabs();
            self.renderView4Config(self.$el, null, getRtTableConfig(viewConfig));
        }
    });

    var getRtTableTabViewConfig = function(viewConfig) {
        return function (projectSelectedValueData) {
            var domain = {
                'name':projectSelectedValueData.parentSelectedValueData.name,
                'uuid':projectSelectedValueData.parentSelectedValueData.value,
            }
            var project = {
                'name':projectSelectedValueData.name,
                'uuid':projectSelectedValueData.value,
            }
            //Store the domain and project along with uuid to be used later.
            ctwu.setGlobalVariable("domain", domain);
            ctwu.setGlobalVariable("project", project);
            var newViewConfig =
                $.extend(true, {}, viewConfig,
                         {projectSelectedValueData: projectSelectedValueData})
            return {
            elementId: ctwl.CONFIG_RT_TABLE_PAGE_ID,
            view: 'SectionView',
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: ctwl.RT_TABLE_TAB_ID,
                        view: 'TabsView',
                        viewConfig: getRtTableTabView(newViewConfig)
                    }]
                }]
            }}
        }
    };

    function getRtTableTabView (viewConfig) {
        return {
            theme: 'default',
            active: 0,
            tabs: [{
               elementId: 'network_route_table',
               title: 'Network Route Tables',
               view: "RtTableListView",
               app: cowc.APP_CONTRAIL_CONTROLLER,
               viewPathPrefix: "config/networking/routetable/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       if ($('#' + ctwl.RT_TABLE_GRID_ID).data('contrailGrid')) {
                           $('#' + ctwl.RT_TABLE_GRID_ID).data('contrailGrid').refreshView();
                       }
                   }
               }
           },
           {
               elementId: 'interface_route_table',
               title: 'Interface Route Tables',
               view: "RtTableInterfaceListView",
               app: cowc.APP_CONTRAIL_CONTROLLER,
               viewPathPrefix: "config/networking/routetable/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       if ($('#' + ctwl.INF_RT_TABLE_GRID_ID).data('contrailGrid')) {
                           $('#' + ctwl.INF_RT_TABLE_GRID_ID).data('contrailGrid').refreshView();
                       }
                    },
                    renderOnActivate: true
                }
            },
            {
                elementId: 'routing_policy_tab',
                title: 'Routing Policies',
                view: "routingPolicyListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/networking/routingpolicy/ui/js/views/",
                viewConfig: viewConfig,
                tabConfig: {
                    activate: function(event, ui) {
                         if ($('#' + ctwl.ROUTING_POLICY_GRID_ID).data('contrailGrid')) {
                             $('#' + ctwl.ROUTING_POLICY_GRID_ID).data('contrailGrid').refreshView();
                         }
                     },
                     renderOnActivate: true
                 }
             },
             {
                 elementId: 'route_aggregates_tab',
                 title: 'Route Aggregates',
                 view: "routeAggregateListView",
                 app: cowc.APP_CONTRAIL_CONTROLLER,
                 viewPathPrefix: "config/networking/routeaggregate/ui/js/views/",
                 viewConfig: viewConfig,
                 tabConfig: {
                     activate: function(event, ui) {
                          if ($('#' + ctwc.ROUTE_AGGREGATE_GRID_ID).data('contrailGrid')) {
                              $('#' + ctwc.ROUTE_AGGREGATE_GRID_ID).data('contrailGrid').refreshView();
                          }
                      },
                      renderOnActivate: true
                  }
              }]
        }
    }
    function getRtTableConfig (viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                config: true,
                childView: {
                    init: getRtTableTabViewConfig(viewConfig),
                }
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

    function getRtTable(viewConfig) {
        return function (projectSelectedValueData) {
            return {
                elementId: cowu.formatElementId([ctwl.CONFIG_QUOTAS_PAGE_ID]),
                view: "RtTableListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/networking/routetable/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                                 {projectSelectedValueData: projectSelectedValueData})
            }
        }
    };
    return RtTableView;
});

