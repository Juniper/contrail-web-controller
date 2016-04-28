/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var linkLocalServicesPageLoader = new LinkLocalServicesPageLoader();

function LinkLocalServicesPageLoader ()
{
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathLLSView = rootDir + '/js/views/LinkLocalServicesView.js',
            renderFn = paramObject['function'];

        $(contentContainer).empty();

        if (self.llsView == null) {
            requirejs([pathLLSView], function (LinkLocalServicesView) {
                self.llsView = new LinkLocalServicesView();
                self.renderView(renderFn, hashParams);
            }, function (err) {
                console.info("LLS Load error:" + err);
            });
       } else {
            self.renderView(renderFn, hashParams);
        }
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderLinkLocalServices':
                this.llsView[renderFn]({hashParams: hashParams});
                break;
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.LINK_LOCAL_SERVICES_PREFIX_ID);
    };
}

