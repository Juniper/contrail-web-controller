/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var quotasPageLoader = new QuotasPageLoader();

function QuotasPageLoader ()
{
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathQuotasView = rootDir + '/js/views/QuotasView.js',
            renderFn = paramObject['function'];

        $(contentContainer).empty();

        if (self.quotasView == null) {
            requirejs([pathQuotasView], function (QuotasView) {
                self.quotasView = new QuotasView();
                self.renderView(renderFn, hashParams);
            }, function (err) {
                console.info("Quotas Page Load error:" + err);
            });
       } else {
            self.renderView(renderFn, hashParams);
        }
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderQuotas':
                this.quotasView[renderFn]({hashParams: hashParams});
                break;
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.QUOTAS_PREFIX_ID);
    };
}

