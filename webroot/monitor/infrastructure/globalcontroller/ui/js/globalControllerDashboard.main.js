/*
 *  Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */
var globalControllerDashbaordLoader = new globalControllerDashbaordLoader();
function globalControllerDashbaordLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathGCView = rootDir + '/js/views/GlobalControllerListView.js',
            renderFn = paramObject['function'],
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];

        require([pathGCView], function (globalControllerDashboardViews) {
            self.globalControllerDashboardView = new globalControllerDashboardViews();
            self.renderView(renderFn, hashParams);
            if(contrail.checkIfExist(loadingStartedDefObj)) {
                loadingStartedDefObj.resolve();
            }
        });
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderCGCView':
                this.globalControllerDashboardView[renderFn]({hashParams: hashParams});
                break;
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.GLOBAL_CONTROLLER_PREFIX_ID);
    };
}
