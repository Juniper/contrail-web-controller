/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view'
], function(_, ContrailView) {
    var ActiveDnsView = ContrailView.extend({
        el: $(contentContainer),
        renderActiveDns: function(viewConfig) {
            this.renderView4Config(this.$el, null,
                getDnsListConfig(viewConfig));
        }
    });

    function getDnsListConfig(viewConfig) {
        var hashParams = viewConfig.hashParams,

            customDomainDropdownOptions = {
                childView: {
                    init: getActiveDns(viewConfig)
                }
            };

        return getDomainBreadcrumbDropdownViewConfig(hashParams,
            customDomainDropdownOptions)
    };

    function getActiveDns(viewConfig) {
        return function(domainSelectedValueData) {
            return {
                elementId: 'ActiveDnsPageId',
                view: "activeDnsListView",
                viewPathPrefix: "config/dns/servers/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: $.extend(true, {}, viewConfig, {
                    domainSelectedValueData: domainSelectedValueData
                })
            }
        }
    };

    function getActiveDnsDatabase(viewConfig) {
        return function(domainSelectedValueData) {
            return {
                elementId: 'ActiveDnsPageId',
                view: "ActiveDnsDatabaseView",
                viewPathPrefix: "config/dns/servers/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: $.extend(true, {}, viewConfig, {
                    domainSelectedValueData: domainSelectedValueData
                })
            }
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
    }


    return ActiveDnsView;
});