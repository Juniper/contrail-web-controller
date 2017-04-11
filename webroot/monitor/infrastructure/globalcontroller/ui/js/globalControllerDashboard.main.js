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
            renderFn = paramObject['function'];
            // Remove padding of page content if the page is multi-region dashbaord
            $("#page-content").removeClass("dashboard-padding").addClass("dashboard-no-padding");
            //hide the project dropdown in multiregion dashbaord
            $('#gohan-config-role').hide();
            if (self.globalControllerDashboardView == null) {
                requirejs([pathGCView], function (globalControllerDashboardView){
                    self.globalControllerDashboardView = new globalControllerDashboardView();
                    self.renderView(renderFn, hashParams);
                });
            } else {
                self.renderView(renderFn, hashParams);
            }
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
    };
}
