/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var SecGrpView = ContrailView.extend({
        el: $(contentContainer),
        renderSecGrp: function (viewConfig) {
            var self = this;
            self.renderView4Config(self.$el, null, getSecGrpConfig(viewConfig));
        }
    });

    function getSecGrpConfig (viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                config: true,
                childView: {
                    init: getSecGrp(viewConfig),
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

    function getSecGrp(viewConfig) {
        return function (projectSelectedValueData) {
            return {
                elementId: cowu.formatElementId([ctwl.CONFIG_QUOTAS_PAGE_ID]),
                view: "SecGrpListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/networking/securitygroup/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                                 {projectSelectedValueData: projectSelectedValueData})
            }
        }
    };
    return SecGrpView;
});

