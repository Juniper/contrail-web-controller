/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var configLogicalRouterLoader = new ConfigLogicalRouterLoader();

function ConfigLogicalRouterLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            pathLogicalRouterView = ctBaseDir + '/config/networking/logicalrouter/ui/js/views/logicalRouterView.js',
            renderFn = paramObject['function'];
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];
        require([pathLogicalRouterView], function (LogicalRouterView) {
            self.logicalRouterView = new LogicalRouterView();
            self.renderView(renderFn, hashParams);
            if(contrail.checkIfExist(loadingStartedDefObj)) {
                loadingStartedDefObj.resolve();
            }
        });
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        this.logicalRouterView[renderFn]({hashParams: hashParams});
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.LOGICAL_ROUTER_PREFIX_ID);
    };
}