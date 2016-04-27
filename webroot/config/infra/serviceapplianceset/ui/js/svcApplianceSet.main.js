/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var svcApplianceSetPageLoader = new SvcApplianceSetPageLoader();

function SvcApplianceSetPageLoader ()
{
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathSvcApplianceSetView = rootDir + '/js/views/SvcApplianceSetView.js',
            renderFn = paramObject['function'];

        $(contentContainer).empty();

        if (self.svcApplianceSetView == null) {
            requirejs([pathSvcApplianceSetView], function (SvcApplianceSetView) {
                self.svcApplianceSetView = new SvcApplianceSetView();
                self.renderView(renderFn, hashParams);
            }, function (err) {
                console.info("SvcApplianceSet Page Load error:" + err);
            });
       } else {
            self.renderView(renderFn, hashParams);
        }
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderSvcApplianceSet':
                this.svcApplianceSetView[renderFn]({hashParams: hashParams});
                break;
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.SVC_APPLIANCE_SET_PREFIX_ID);
    };
}

