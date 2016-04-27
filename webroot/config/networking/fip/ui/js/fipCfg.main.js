/*
 *  Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var fipCfgLoader = new fipCfgLoader();

function fipCfgLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathView = rootDir + '/js/views/fipCfgView.js',
            renderFn = paramObject['function'];

        if (self.fipCfgView == null) {
            requirejs([pathView], function (fipCfgView) {
                 self.fipCfgView = new fipCfgView();
                 self.renderView(renderFn, hashParams);
             });
        } else {
            self.renderView(renderFn, hashParams);
        }
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        this.fipCfgView[renderFn]({hashParams: hashParams});
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.CFG_FIP_PREFIX_ID);
    };
}
