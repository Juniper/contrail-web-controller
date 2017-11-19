/*
 *  Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var vnCfgLoader = new vnCfgLoader();

function vnCfgLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            pathView = ctBaseDir + '/config/networking/networks/ui/js/views/vnCfgView.js',
            renderFn = paramObject['function'];
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];
        require([pathView], function (vnCfgView) {
            self.vnCfgView = new vnCfgView();
            self.renderView(renderFn, hashParams);
            if(contrail.checkIfExist(loadingStartedDefObj)) {
                loadingStartedDefObj.resolve();
            }
        });
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        this.vnCfgView[renderFn]({hashParams: hashParams});
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.CFG_VN_PREFIX_ID);
    };
}
