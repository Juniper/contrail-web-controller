/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var routeAggregateView = ContrailView.extend({
        el: $(contentContainer),
        renderRouteAggregate: function (viewConfig) {
            var self = this;
            self.renderView4Config(self.$el, null,
                                   getRouteAggregateConfig(viewConfig));
        }
    });

    function getRouteAggregateConfig (viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                config: true,
                childView: {
                    init: getRouteAggregate(viewConfig),
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

    function getRouteAggregate(viewConfig) {
        return function (projectSelectedValueData) {
            selectedDomainProjectData = projectSelectedValueData;
            return {
                elementId: cowu.formatElementId([ctwc.CONFIG_ROUTE_AGGREGATE_LIST_ID]),
                view: "routeAggregateListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/networking/routeaggregate/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                                     {projectSelectedValueData:
                                     projectSelectedValueData})
            }
        }
    };
    return routeAggregateView;
});

