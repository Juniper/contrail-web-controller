/*
 *  Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

var configlBaaSLoader = new configlBaaSLoader();

function configlBaaSLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathView = ctBaseDir + '/config/networking/loadbalancer/ui/js/views/lbCfgView.js',
            renderFn = paramObject['function'],
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];

        if (self.lbCfgView == null) {
            requirejs([pathView], function (lbCfgView) {
                 self.lbCfgView = new lbCfgView();
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
        if(hashParams.view === 'config_loadbalancer_details'){
           this.lbCfgView.renderLBDetails({hashParams: hashParams});
        }else if(hashParams.view === 'config_listener_details'){
           this.lbCfgView.renderListenerDetails({hashParams: hashParams});
        }else if(hashParams.view === 'config_pool_details'){
            this.lbCfgView.renderPoolDetails({hashParams: hashParams});
        }else{
            this.lbCfgView.renderLoadBalancer({hashParams: hashParams});
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.CFG_LB_PREFIX_ID);
    };
}