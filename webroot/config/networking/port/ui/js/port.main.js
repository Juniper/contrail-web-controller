/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var configPortLoader = new ConfigPortLoader();

function ConfigPortLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathPortView = ctBaseDir + '/config/networking/port/ui/js/views/portView.js',
            renderFn = paramObject['function'];
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];

        require([pathPortView], function (portView) {
            self.portView = new portView();
            self.renderView(renderFn, hashParams);
            if(contrail.checkIfExist(loadingStartedDefObj)) {
                loadingStartedDefObj.resolve();
            }
        });
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        this.portView[renderFn]({hashParams: hashParams});
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwc.PORT_PREFIX_ID);
    };
}