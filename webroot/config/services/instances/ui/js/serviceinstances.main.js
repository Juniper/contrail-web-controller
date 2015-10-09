/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var serviceInstancesPageLoader = new ServiceInstancesPageLoader();

function ServiceInstancesPageLoader ()
{
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathServiceInstancesView = rootDir + '/js/views/ServiceInstancesView.js',
            renderFn = paramObject['function'];

        if (self.serviceInstancesView == null) {
            requirejs([pathServiceInstancesView], function (ServiceInstancesView) {
                self.serviceInstancesView = new ServiceInstancesView();
                self.renderView(renderFn, hashParams);
            }, function (err) {
                console.info("ServiceInstances Page Load error:" + err);
            });
       } else {
            self.renderView(renderFn, hashParams);
        }
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderServiceInstances':
                this.serviceInstancesView[renderFn]({hashParams: hashParams});
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

