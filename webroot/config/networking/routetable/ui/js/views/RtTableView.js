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
            theme: 'classic',
            active: 0,
            tabs: [{
               elementId: 'network_route_table',
               title: 'Network Route Table',
               view: "RtTableListView",
               viewPathPrefix: "config/networking/routetable/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       if ($('#' + ctwl.NETWORK_ROUTE_TABLE_ID)) {
                           $('#' + ctwl.NETWORK_ROUTE_TABLE_ID).trigger('refresh');
                       }
                   }
               }
           },
           {
               elementId: 'interface_route_table',
               title: 'Interface Route Table',
               view: "RtTableInterfaceListView",
               viewPathPrefix: "config/networking/routetable/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                        if ($('#' + ctwl.INTERFACE_ROUTE_TABLE_ID)) {
                            $('#' + ctwl.INTERFACE_ROUTE_TABLE_ID).trigger('refresh');
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

