/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var svcAppliancePageLoader = new SvcAppliancePageLoader();

function SvcAppliancePageLoader ()
{
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathSvcApplianceView = rootDir + '/js/views/SvcApplianceView.js',
            renderFn = paramObject['function'];

        $(contentContainer).empty();

        if (self.svcApplianceView == null) {
            requirejs([pathSvcApplianceView], function (SvcApplianceView) {
                self.svcApplianceView = new SvcApplianceView();
                self.renderView(renderFn, hashParams);
            }, function (err) {
                console.info("SvcAppliance Page Load error:" + err);
            });
       } else {
            self.renderView(renderFn, hashParams);
        }
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderSvcAppliance':
                this.svcApplianceView[renderFn]({hashParams: hashParams});
                break;
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.SVC_APPLIANCE_PREFIX_ID);
    };
}

