/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
var configDNSServerLoader = new ConfigDNSServerLoader();

function ConfigDNSServerLoader() {
    this.load = function(paramObject) {
        var self = this,
            currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathDNSServersView = ctBaseDir + '/config/dns/servers/ui/js/views/dnsServersView.js',
            renderFn = paramObject['function'],
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];

        if(self.dnsServersView == null) {
            require([pathDNSServersView], function(DNSServersView){
                self.dnsServersView = new DNSServersView();
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
        if (hashParams.view == "config_dns_activeDatabase") {
            this.dnsServersView.renderActiveDns({
                hashParams: hashParams
            });
        } else {
            this.dnsServersView.renderDnsServer({
                hashParams: hashParams
            });
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
        ctwu.destroyDOMResources(ctwc.DNS_SERVER_PREFIX_ID);
    };
}
