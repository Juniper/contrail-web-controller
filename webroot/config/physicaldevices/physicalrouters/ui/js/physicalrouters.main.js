/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var configPhysicalRoutersPageLoader = new ConfigPhysicalRoutersLoader();

function ConfigPhysicalRoutersLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            pathMNView = ctBaseDir + '/config/physicaldevices/physicalrouters/ui/js/views/physicalRoutersView.js',
            renderFn = paramObject['function'],
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];

        require([pathMNView], function (PhysicalRoutersView) {
            self.physicalRoutersView = new PhysicalRoutersView();
            self.renderView(renderFn, hashParams);
            if(contrail.checkIfExist(loadingStartedDefObj)) {
                loadingStartedDefObj.resolve();
            }
        });
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderPhysicalRouters':
                this.physicalRoutersView[renderFn]({hashParams: hashParams});
                break;
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.PHYSICAL_ROUTER_PREFIX_ID);
    };
}
