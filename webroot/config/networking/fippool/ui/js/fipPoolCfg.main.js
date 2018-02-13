/*
 *  Copyright (c) 2018 Juniper Networks, Inc. All rights reserved.
 */

var fipPoolCfgLoader = new fipPoolCfgLoader();

function fipPoolCfgLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            pathfipPoolCfgView = ctBaseDir + '/config/networking/fippool/ui/js/views/fipPoolCfgView.js',
            renderFn = paramObject['function'];
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];
            require([pathfipPoolCfgView], function (fipPoolCfgView) {
                self.fipPoolCfgView = new fipPoolCfgView();
                self.renderView(renderFn, hashParams);
                if(contrail.checkIfExist(loadingStartedDefObj)) {
                    loadingStartedDefObj.resolve();
                }
            });
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        this.fipPoolCfgView[renderFn]({hashParams: hashParams});
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.CFG_FIPPOOL_PREFIX_ID);
    };
}
