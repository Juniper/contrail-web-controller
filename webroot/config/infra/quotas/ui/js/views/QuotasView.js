/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var QuotasView = ContrailView.extend({
        el: $(contentContainer),
        renderQuotas: function (viewConfig) {
            var self = this;
            self.renderView4Config(self.$el, null, getQuotasConfig(viewConfig));
        }
    });

    function getQuotasConfig (viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                childView: {
                    init: getQuotas(viewConfig),
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
                                                     customDomainDropdownOptions)
    };

    function getQuotas(viewConfig) {
        return function (projectSelectedValueData) {
            return {
                elementId: cowu.formatElementId([ctwl.CONFIG_QUOTAS_PAGE_ID]),
                view: "QuotasListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/infra/quotas/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                                     {projectSelectedValueData:
                                     projectSelectedValueData})
            }
        }
    };
    return QuotasView;
});
