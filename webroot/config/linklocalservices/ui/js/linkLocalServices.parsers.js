/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var LLSParsers = function() {
        var self = this;
        this.llsDataParser = function(results) {
            results = contrail.handleIfNull(results, {});
            var llsData = [];
            if ((null != results) &&
                (null != results['global-vrouter-config']) &&
                (null !=
                 results['global-vrouter-config']['linklocal_services']) &&
                (null !=
                 results['global-vrouter-config']['linklocal_services']
                        ['linklocal_service_entry'])) {
                llsData =
                    results['global-vrouter-config']['linklocal_services']
                           ['linklocal_service_entry'];
            }
            var llsCnt = llsData.length;
            for (var i = 0; i < llsCnt; i++) {
                llsData[i]['lls_fab_address_ip'] = 'IP';
                if (!llsData[i]['ip_fabric_service_ip'].length) {
                    llsData[i]['lls_fab_address_ip'] = 'DNS';
                }
            }
            return llsData;
        };
    }
    return LLSParsers;
});

