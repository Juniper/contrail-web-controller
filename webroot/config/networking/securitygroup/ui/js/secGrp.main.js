/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var secGrpPageLoader = new SecGrpPageLoader();

function SecGrpPageLoader ()
{
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathSecGrpView = rootDir + '/js/views/SecGrpView.js',
            renderFn = paramObject['function'];

        $(contentContainer).empty();

        if (self.secGrpView == null) {
            requirejs([pathSecGrpView], function (SecGrpView) {
                self.secGrpView = new SecGrpView();
                self.renderView(renderFn, hashParams);
            }, function (err) {
                console.info("SecGrp Page Load error:" + err);
            });
       } else {
            self.renderView(renderFn, hashParams);
        }
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderSecGrp':
                this.secGrpView[renderFn]({hashParams: hashParams});
                break;
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.SEC_GRP_PREFIX_ID);
    };
}


