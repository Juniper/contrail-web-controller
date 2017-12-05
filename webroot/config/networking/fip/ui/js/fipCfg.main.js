/*
 *  Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var fipCfgLoader = new fipCfgLoader();

function fipCfgLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            pathfipCfgView = ctBaseDir + '/config/networking/fip/ui/js/views/fipCfgView.js',
            renderFn = paramObject['function'];
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];
            require([pathfipCfgView], function (fipCfgView) {
                self.fipCfgView = new fipCfgView();
                self.renderView(renderFn, hashParams);
                if(contrail.checkIfExist(loadingStartedDefObj)) {
                    loadingStartedDefObj.resolve();
                }
            });
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
