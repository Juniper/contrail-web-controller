/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var DnsRecordsLoader = new DnsRecordsLoader();

function DnsRecordsLoader ()
{
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathLLSView = rootDir + '/js/views/DnsRecordsView.js',
            renderFn = paramObject['function'];

        $(contentContainer).empty();

        if (self.dnsView == null) {
            requirejs([pathLLSView], function (DnsRecordsView) {
                self.dnsView = new DnsRecordsView();
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
        switch (renderFn) {
            case 'renderDnsRecords':
                this.dnsView[renderFn]({hashParams: hashParams});
                break;
		}
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
    };
}

