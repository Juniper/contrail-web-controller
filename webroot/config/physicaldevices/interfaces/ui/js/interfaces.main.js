/*
 *  Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var configInterfacesPageLoader = new ConfigInterfacesLoader();

function ConfigInterfacesLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathMNView = rootDir + '/js/views/interfacesView.js',
            renderFn = paramObject['function'];

        check4CTInit(function () {
            if (self.mnView == null) {
                requirejs([pathMNView], function (PhysicalDevicesView) {
                    self.mnView = new PhysicalDevicesView();
                    self.renderView(renderFn, hashParams);
                });
            } else {
                self.renderView(renderFn, hashParams);
            }
        });
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderInterfaces':
                this.mnView[renderFn]({hashParams: hashParams});
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

