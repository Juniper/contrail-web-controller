/*
 *  Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var ipamCfgLoader = new ipamCfgLoader();

function ipamCfgLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathView = rootDir + '/js/views/ipamCfgView.js',
            renderFn = paramObject['function'];

        if (self.ipamCfgView == null) {
            requirejs([pathView], function (ipamCfgView) {
                 self.ipamCfgView = new ipamCfgView();
                 self.renderView(renderFn, hashParams);
             });
        } else {
            self.renderView(renderFn, hashParams);
        }
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        this.ipamCfgView[renderFn]({hashParams: hashParams});
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        this.load({hashParams: hashObj});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.CFG_IPAM_PREFIX_ID);
    };
}
