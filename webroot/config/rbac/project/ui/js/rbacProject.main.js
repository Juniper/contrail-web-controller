/*
 *  Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

var configRBACProjectPageLoader = new ConfigRBACProjectPageLoader();

function ConfigRBACProjectPageLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathMNView = ctBaseDir +
                '/config/rbac/project/ui/js/views/rbacProjectView.js',
            renderFn = paramObject['function'],
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];

        require([pathMNView], function (RBACProjectView) {
            self.rbacProjectView = new RBACProjectView();
            self.renderView(renderFn, hashParams);
            if(contrail.checkIfExist(loadingStartedDefObj)) {
                loadingStartedDefObj.resolve();
            }
        });
    };

    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderRBACProject':
                this.rbacProjectView[renderFn]({hashParams: hashParams});
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
