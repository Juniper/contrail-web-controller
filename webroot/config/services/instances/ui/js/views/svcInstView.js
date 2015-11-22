/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var SvcInstView = ContrailView.extend({
        el: $(contentContainer),
        renderSvcInst: function (viewConfig) {
            var self = this;
            self.renderView4Config(self.$el, null,
                                   getSvcInstConfig(viewConfig));
        }
    });

    function getSvcInstConfig (viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                config: true,
                childView: {
                    init: getSvcInst(viewConfig),
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

    function getSvcInst(viewConfig) {
        return function (projectSelectedValueData) {
            selectedDomainProjectData = projectSelectedValueData;
            return {
                elementId: cowu.formatElementId([ctwl.CONFIG_SERVICE_INSTANCES_PAGE_ID]),
                view: "svcInstListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/services/instances/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                                     {projectSelectedValueData:
                                     projectSelectedValueData})
            }
        }
    };
    return SvcInstView;
});

