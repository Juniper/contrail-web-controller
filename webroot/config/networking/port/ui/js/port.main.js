/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var ConfigPortLoader = new ConfigPortLoader();

function ConfigPortLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathMNView = rootDir + '/js/views/portView.js',
            renderFn = paramObject['function'];

        check4CTInit(function () {
            if (self.portView == null) {
                requirejs([pathMNView], function (PortViewParam) {
                    self.portView = new PortViewParam();
                    self.renderView(renderFn, hashParams);
                });
            } else {
                self.renderView(renderFn, hashParams);
            }
        });
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        this.portView[renderFn]({hashParams: hashParams});
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.PORT_PREFIX_ID);
    };
}
function check4CTInit(callback) {
    if (!ctInitComplete) {
        requirejs(['controller-init'], function () {
            ctInitComplete = true;
            callback()
        });
    } else {
        callback();
    }
}