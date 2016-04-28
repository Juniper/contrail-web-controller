/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
var configDNSRecordsLoader = new ConfigDNSRecordsLoader();

function ConfigDNSRecordsLoader() {
    this.load = function(paramObject) {
        var self = this,
            currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathDNSRecordsView = ctBaseDir + '/config/dns/records/ui/js/views/dnsRecordsView.js',
            renderFn = paramObject['function'],
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];

        $(contentContainer).empty();

        if (self.dnsRecordsView == null) {
            requirejs([pathDNSRecordsView], function(DnsRecordsView) {
                self.dnsRecordsView = new DnsRecordsView();
                self.renderView(renderFn, hashParams);
                if(contrail.checkIfExist(loadingStartedDefObj)) {
                    loadingStartedDefObj.resolve();
                }
            });
        } else {
            self.renderView(renderFn, hashParams);
        }
    };

    this.renderView = function(renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderDnsRecords':
                this.dnsRecordsView[renderFn]({
                    hashParams: hashParams
                });
                break;
        }
    };

    this.updateViewByHash = function(hashObj, lastHashObj) {
        var renderFn;
        this.load({
            hashParams: hashObj,
            'function': renderFn
        });
    };

    this.destroy = function() {
        ctwu.destroyDOMResources(ctwc.DNS_RECORDS_PREFIX_ID);
    };
}