/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var DnsServerLoader = new DnsServerLoader();

function DnsServerLoader ()
{
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathLLSView = rootDir + '/js/views/DnsServerView.js',
            renderFn = paramObject['function'];

        $(contentContainer).empty();

        if (self.dnsView == null) {
            requirejs([pathLLSView], function (DnsServerView) {
                self.dnsView = new DnsServerView();
                self.renderView(renderFn, hashParams);
            }, function (err) {
                console.info("LLS Load error:" + err);
            });
       } else {
            self.renderView(renderFn, hashParams);
        }
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
		 if(hashParams.view == "config_dns_activeDatabase") {
		 this.dnsView.renderActiveDns({hashParams: hashParams});
         } else {
         this.dnsView.renderDnsServer({hashParams: hashParams});
		 }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
    };
}

