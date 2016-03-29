/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view'
], function(_, ContrailView) {
    var dnsRecordsView = ContrailView.extend({
        el: $(contentContainer),
        renderDnsRecords: function(viewConfig) {
            this.renderView4Config(this.$el, null,
                getDnsListConfig(viewConfig));
        }
    });

    function getDnsListConfig(viewConfig) {
        var hashParams = viewConfig.hashParams,

            customDNSDropdownOptions = {
                childView: {
                    init: getDnsRecords(viewConfig)
                }
            };
        customDomainDropdownOptions = {
            childView: {
                init: ctwvc.getDNSBreadcrumbDropdownViewConfig(
                    hashParams,
                    customDNSDropdownOptions)
            }
        };
        return ctwvc.getDomainBreadcrumbDropdownViewConfig(hashParams,
            customDomainDropdownOptions)
    };

    function getDnsRecords(viewConfig) {
        return function(dnsSelectedValueData) {
            return {
                elementId: ctwc.CONFIG_DNS_RECORDS_PAGE_ID,
                view: "dnsRecordsListView",
                viewPathPrefix: "config/dns/records/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: $.extend(true, {}, viewConfig, {
                    dnsSelectedValueData: dnsSelectedValueData
                })
            }
        }
    };

    return dnsRecordsView;
});