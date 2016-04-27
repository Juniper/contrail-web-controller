/*
 *  Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var svcTemplateCfgLoader = new svcTemplateCfgLoader();

function svcTemplateCfgLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathView = rootDir + '/js/views/svcTemplateCfgView.js',
            renderFn = paramObject['function'];

        if (self.svcTemplateCfgView == null) {
            requirejs([pathView], function (svcTemplateCfgView) {
                 self.svcTemplateCfgView = new svcTemplateCfgView();
                 self.renderView(renderFn, hashParams);
             });
        } else {
            self.renderView(renderFn, hashParams);
        }
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        this.svcTemplateCfgView[renderFn]({hashParams: hashParams});
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.CFG_SVC_TEMPLATE_PREFIX_ID);
    };
}
