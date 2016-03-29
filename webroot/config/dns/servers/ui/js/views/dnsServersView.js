/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view'
], function(_, ContrailView) {
    var dnsServersView = ContrailView.extend({
        el: $(contentContainer),
        renderDnsServer: function(viewConfig) {
            this.renderView4Config(this.$el, null,
                getDnsListConfig(viewConfig));
        },
        renderActiveDns: function(viewConfig) {
            this.renderView4Config(this.$el, null,
                getActiveDns(viewConfig));
        }
    });

    function getDnsListConfig(viewConfig) {
        var hashParams = viewConfig.hashParams,

            customDomainDropdownOptions = {
                childView: {
                    init: getDnsServer(viewConfig)
                }
            };

        return getDomainBreadcrumbDropdownViewConfig(hashParams,
            customDomainDropdownOptions)
    };

    function getDnsServer(viewConfig) {
        return function(domainSelectedValueData) {
            return {
                elementId: ctwc.CONFIG_DNS_SERVER_PAGE_ID,
                view: "dnsServersListView",
                viewPathPrefix: "config/dns/servers/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: $.extend(true, {}, viewConfig, {
                    domainSelectedValueData: domainSelectedValueData
                })
            }
        }
    };

    function getActiveDns(viewConfig) {
        return {
            elementId: 'ActiveDnsPageId',
            view: "activeDnsListView",
            viewPathPrefix: "config/dns/servers/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: viewConfig
        }
    };

    function getDomainBreadcrumbDropdownViewConfig(hashParams,
        customDomainDropdownOptions) {
        var urlValue = (contrail.checkIfKeyExistInObject(true,
                    hashParams, 'focusedElement.fqName') ? hashParams.focusedElement
                .fqName : null),
            defaultDropdownoptions = {
                urlValue: (urlValue !== null) ? urlValue.split(':').splice(
                    0, 1).join(':') : null,
                cookieKey: cowc.COOKIE_DOMAIN
            },
            dropdownOptions = $.extend(true, {}, defaultDropdownoptions,
                customDomainDropdownOptions);

        return {
            elementId: ctwl.DOMAINS_BREADCRUMB_DROPDOWN,
            view: "BreadcrumbDropdownView",
            viewConfig: {
                modelConfig: ctwu.getDomainListModelConfig(),
                dropdownOptions: dropdownOptions
            }
        }
    };
    return dnsServersView;
});