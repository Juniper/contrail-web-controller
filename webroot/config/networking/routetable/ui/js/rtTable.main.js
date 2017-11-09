/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var rtTablePageLoader = new RtTablePageLoader();

function RtTablePageLoader ()
{
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathRtTableView = ctBaseDir +
            '/config/networking/routetable/ui/js/views/RtTableView.js',
            renderFn = paramObject['function'],
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];

        $(contentContainer).empty();

        if (self.rtTableView == null) {
            requirejs([pathRtTableView], function (RtTableView) {
                self.rtTableView = new RtTableView();
                self.renderView(renderFn, hashParams);
                if(contrail.checkIfExist(loadingStartedDefObj)) {
                    loadingStartedDefObj.resolve();
                }
            }, function (err) {
                console.info("RtTable Page Load error:" + err);
            });
       } else {
            self.renderView(renderFn, hashParams);
        }
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderRtTable':
                this.rtTableView[renderFn]({hashParams: hashParams});
                break;
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.RT_TABLE_PREFIX_ID);
    };
}


