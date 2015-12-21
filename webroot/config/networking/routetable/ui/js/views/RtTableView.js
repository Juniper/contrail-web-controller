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
            self.renderView4Config(self.$el, null, getRtTableConfig(viewConfig));
        }
    });

    function getRtTableConfig (viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                config: true,
                childView: {
                    init: getRtTable(viewConfig),
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

