/*
 *  Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

var svcHealthChkCfgLoader = new svcHealthChkCfgLoader();

function svcHealthChkCfgLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathView = ctBaseDir + '/config/services/svchealthcheck/ui/js/views/svcHealthChkCfgView.js',
            renderFn = paramObject['function'],
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];

        if (self.svcHealthChkCfgView == null) {
            requirejs([pathView], function (svcHealthChkCfgView) {
                 self.svcHealthChkCfgView = new svcHealthChkCfgView();
                 self.renderView(renderFn, hashParams);
                 if(contrail.checkIfExist(loadingStartedDefObj)) {
                     loadingStartedDefObj.resolve();
                 }
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

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.CFG_SVC_HEALTH_CHK_PREFIX_ID);
    };
}
