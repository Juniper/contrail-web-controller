/*
 *  Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var ipamCfgLoader = new ipamCfgLoader();

function ipamCfgLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
              hashParams = paramObject['hashParams'],
              pathIpamCfgView = ctBaseDir + '/config/networking/ipam/ui/js/views/ipamCfgView.js',
              renderFn = paramObject['function'];
              loadingStartedDefObj = paramObject['loadingStartedDefObj'];
              $(contentContainer).empty();
          require([pathIpamCfgView], function (ipamCfgView) {
              self.ipamCfgView = new ipamCfgView();
              self.renderView(renderFn, hashParams);
              if(contrail.checkIfExist(loadingStartedDefObj)) {
                  loadingStartedDefObj.resolve();
              }
          });
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
