/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var svcInstPageLoader = new SvcInstPageLoader();

function SvcInstPageLoader ()
{
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathSvcInstView = ctBaseDir + '/config/services/instances/ui/js/views/svcInstView.js',
            renderFn = paramObject['function'],
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];

        if (self.svcInstView == null) {
            requirejs([pathSvcInstView], function (SvcInstView) {
                self.svcInstView = new SvcInstView();
                self.renderView(renderFn, hashParams);
                if(contrail.checkIfExist(loadingStartedDefObj)) {
                    loadingStartedDefObj.resolve();
                }
            }, function (err) {
                console.info("SvcInst Page Load error:" + err);
            });
       } else {
            self.renderView(renderFn, hashParams);
        }
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderSvcInst':
                this.svcInstView[renderFn]({hashParams: hashParams});
                break;
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.SERVICE_INSTANCES_PREFIX_ID);
    };
}

