/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var rbacDomainView = ContrailView.extend({
        el: $(contentContainer),

        renderRBACDomain: function (viewConfig) {
            this.renderView4Config(this.$el, null,
                                    getRBACDomainListConfig(viewConfig));
        }
    });

    function getRBACDomainListConfig(viewConfig) {
        var hashParams = viewConfig.hashParams,
            customDomainDropdownOptions = {
                childView: {
                    init: getRBACDomainViewConfig(viewConfig),
                }
            };
        return getDomainBreadcrumbDropdownViewConfig(hashParams,
                                              customDomainDropdownOptions)
    };

    function getRBACDomainViewConfig(viewConfig) {
        return function (domainSelectedValueData) {
            return {
                elementId: cowu.formatElementId([ctwc.RBAC_DOMAIN_PAGE_ID]),
                view: "rbacDomainListView",
                viewPathPrefix:
                    "config/rbac/domain/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: $.extend(true, {},
                     viewConfig, {
                         domainSelectedValueData: domainSelectedValueData})
            }
        }
    };

    function getDomainBreadcrumbDropdownViewConfig(hashParams,
        customDomainDropdownOptions) {
        var urlValue = (contrail.checkIfKeyExistInObject(true,
                         hashParams, 'focusedElement.fqName') ?
                         hashParams.focusedElement.fqName : null),
            defaultDropdownoptions = {
                urlValue: (urlValue !== null) ?
                             urlValue.split(':').splice(0,1).join(':') : null,
                cookieKey: cowc.COOKIE_DOMAIN
            },
            dropdownOptions = $.extend(true, {},
                                 defaultDropdownoptions,
                                 customDomainDropdownOptions);

        return {
            elementId: ctwl.DOMAINS_BREADCRUMB_DROPDOWN,
            view: "BreadcrumbDropdownView",
            viewConfig: {
                modelConfig: ctwu.getDomainListModelConfig(),
                dropdownOptions: dropdownOptions
            }
        }
    }

    return rbacDomainView;
});
