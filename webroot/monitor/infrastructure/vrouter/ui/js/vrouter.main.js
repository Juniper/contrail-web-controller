/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var vRoutersLoader  = new VRoutersLoader();

function VRoutersLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathVRouterView = rootDir + '/js/views/VRouterView.js',
            renderFn = paramObject['function'];

            if (self.vrouterView == null) {
                requirejs([pathVRouterView], function (VRouterView){
                    self.vrouterView = new VRouterView();
                    self.renderView(renderFn, hashParams);
                });
            } else {
                self.renderView(renderFn, hashParams);
            }
    }

    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        if(hashParams.view == "details") {
            this.vrouterView.renderVRouterDetails(
                    {hashParams: hashParams});
        } else {
            this.vrouterView.renderVRouter({hashParams: hashParams});
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
    };
}
