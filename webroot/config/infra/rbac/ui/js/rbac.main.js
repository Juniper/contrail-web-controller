/*
 *  Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

var configRBACPageLoader = new ConfigRBACPageLoader();

function ConfigRBACPageLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathMNView = ctBaseDir +
                '/config/infra/rbac/ui/js/views/rbacView.js',
            renderFn = paramObject['function'],
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];

        require([pathMNView], function (RBACView) {
            self.rbacView = new RBACView();
            self.renderView(renderFn, hashParams);
            if(contrail.checkIfExist(loadingStartedDefObj)) {
                loadingStartedDefObj.resolve();
            }
        });
    };

    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderRBAC':
                this.rbacView[renderFn]({hashParams: hashParams});
                break;
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwc.RBAC_PREFIX_ID);
    };
}
