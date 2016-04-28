/*
 *  Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var vRouterCfgLoader = new vRouterCfgLoader();

function vRouterCfgLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathView = rootDir + '/js/views/vRouterCfgView.js',
            renderFn = paramObject['function'];

        if (self.vRouterCfgView == null) {
            requirejs([pathView], function (vRouterCfgView) {
                 self.vRouterCfgView = new vRouterCfgView();
                 self.renderView(renderFn, hashParams);
             });
        } else {
            self.renderView(renderFn, hashParams);
        }
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        this.vRouterCfgView[renderFn]({hashParams: hashParams});
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        this.load({hashParams: hashObj});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.CFG_VROUTER_PREFIX_ID);
    };
}
