/*
 *  Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

var svcHealthChkCfgLoader = new svcHealthChkCfgLoader();

function svcHealthChkCfgLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathView = rootDir + '/js/views/svcHealthChkCfgView.js',
            renderFn = paramObject['function'];

        if (self.svcHealthChkCfgView == null) {
            requirejs([pathView], function (svcHealthChkCfgView) {
                 self.svcHealthChkCfgView = new svcHealthChkCfgView();
                 self.renderView(renderFn, hashParams);
             });
        } else {
            self.renderView(renderFn, hashParams);
        }
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        this.svcHealthChkCfgView[renderFn]({hashParams: hashParams});
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        this.load({hashParams: hashObj});
    };
}
