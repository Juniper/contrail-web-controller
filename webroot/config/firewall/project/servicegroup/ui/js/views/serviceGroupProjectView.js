/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var serviceGroupProjectView = ContrailView.extend({
        el: $(contentContainer),
        renderServiceGroup: function () {
            var self = this,
                viewConfig = self.attributes.viewConfig;
            self.renderView4Config(self.$el, null,
                                   getServiceGroupConfig(viewConfig));
        }
    });

    function getServiceGroupConfig (viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                config: true,
                childView: {
                    init: getServiceGroup(viewConfig),
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

    function getServiceGroup(viewConfig) {
        return function (projectSelectedValueData) {
            selectedDomainProjectData = projectSelectedValueData;
            return {
                elementId:
                    cowu.formatElementId([ctwc.SECURITY_POLICY_TAG_LIST_VIEW_ID]),
                view: "serviceGroupProjectListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/firewall/project/servicegroup/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                                     {projectSelectedValueData:
                                     projectSelectedValueData})
            }
        }
    };
    return serviceGroupProjectView;
});

