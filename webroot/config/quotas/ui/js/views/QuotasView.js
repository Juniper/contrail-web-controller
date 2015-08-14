/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var QuotasView = ContrailView.extend({
        el: $(contentContainer),
        renderQuotas: function () {
            var self = this;
            cowu.renderDomainProjectBreadcrumbDropDown(function() {
                self.renderView4Config(self.$el, null, getQuotas());
            });
        }
    });

    function getQuotas() {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_QUOTAS_PAGE_ID]),
            view: "QuotasListView",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewPathPrefix: "config/quotas/ui/js/views/",
            viewConfig: {}
        }
    };
    return QuotasView;
});
