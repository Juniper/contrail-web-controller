/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var ConfigLogicalRouterLoader = new ConfigLogicalRouterLoader();

function ConfigLogicalRouterLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathMNView = rootDir + '/js/views/logicalRouterView.js',
            renderFn = paramObject['function'];

        check4CTInit(function () {
            if (self.mnView == null) {
                requirejs([pathMNView], function (LogicalRouterViewParam) {
                    self.mnView = new LogicalRouterViewParam();
                    self.renderView(renderFn, hashParams);
                });
            } else {
                self.renderView(renderFn, hashParams);
            }
        });
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        this.mnView[renderFn]({hashParams: hashParams});
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };
}
function check4CTInit(callback) {
    if (!ctInitComplete) {
        requirejs(['controller-init'], function () {
            ctInitComplete = true;
            if(callback != null) {
                callback()
            }
        });
    } else {
        if(callback != null) {
            callback();
        }
    }
}