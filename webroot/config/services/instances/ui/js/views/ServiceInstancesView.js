/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var ServiceInstancesView = ContrailView.extend({
        el: $(contentContainer),
        renderServiceInstances: function (viewConfig) {
            var self = this;
            self.renderView4Config(self.$el, null,
                                   getServiceInstConfig(viewConfig));
        }
    });

    function getServiceInstConfig (viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                childView: {
                    init: getServiceInstances(viewConfig),
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

    function getServiceInstances(viewConfig) {
        return function (projectSelectedValueData) {
            selectedDomainProjectData = projectSelectedValueData;
            return {
                elementId: cowu.formatElementId([ctwl.CONFIG_SERVICE_INSTANCES_PAGE_ID]),
                view: "ServiceInstancesListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/services/instances/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                                     {projectSelectedValueData:
                                     projectSelectedValueData})
            }
        }
    };
    return ServiceInstancesView;
});

