/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var vnCfgView = ContrailView.extend({
        el: $(contentContainer),
        renderTrafficView: function (viewConfig) {
            this.renderView4Config(this.$el, null, getVNCfgListConfig(viewConfig));
        }
    });


    function getVNCfgListConfig(viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                config: true,
                childView: {
                    init: getVNCfgViewConfig(viewConfig)
                },
                allDropdownOption: ctwc.ALL_PROJECT_DROPDOWN_OPTION
            },
            customDomainDropdownOptions = {
                childView: {
                    init: ctwvc.getProjectBreadcrumbDropdownViewConfig(hashParams,
                                                 customProjectDropdownOptions)
                }
            };
        return ctwvc.getDomainBreadcrumbDropdownViewConfig(hashParams,
                                                     customDomainDropdownOptions);
    };

    function getVNCfgViewConfig(viewConfig) {
        return function (projectSelectedValueData) {
            return {
                elementId: cowu.formatElementId([ctwl.NETWORK_TRAFFIC_VIEW_ID]),
                view: "TrafficGroupsView",
                viewPathPrefix:
                    "monitor/networking/trafficgroups/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: $.extend(true, {},
                     viewConfig, {projectSelectedValueData: projectSelectedValueData})
            }
        }
    };

    return vnCfgView;
});
