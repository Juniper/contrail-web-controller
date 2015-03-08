/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var mnPageLoader = new MonitorNetworkingLoader();

function MonitorNetworkingLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathMNView = rootDir + '/js/views/MonitorNetworkingView.js',
            renderFn = paramObject['function'];

        check4CTInit(function () {
            if (self.mnView == null) {
                requirejs([pathMNView], function (MonitorNetworkingView) {
                    self.mnView = new MonitorNetworkingView();
                    self.renderView(renderFn, hashParams);
                });
            } else {
                self.renderView(renderFn, hashParams);
            }
        });
    };
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderProjects':
                if (hashParams.type == "project") {
                    if (hashParams.view == "details") {
                        this.mnView.renderProject({hashParams: hashParams});
                    } else {
                        this.mnView.renderProjectList({hashParams: hashParams});
                    }
                } else if (hashParams.type == "flow"){
                    if (hashParams.view == "list") {
                        this.mnView.renderFlowList({hashParams: hashParams});
                    } else if (hashParams.view == "details") {
                        this.mnView.renderFlow({hashParams: hashParams});
                    }
                }
                break;

            case 'renderNetworks':
                if (hashParams.type == "network") {
                    if (hashParams.view == "details") {
                        this.mnView.renderNetwork({hashParams: hashParams});
                    } else {
                        this.mnView.renderNetworkList({hashParams: hashParams});
                    }
                } else if (hashParams.type == "flow"){
                    if (hashParams.view == "list") {
                        this.mnView.renderFlowList({hashParams: hashParams});
                    } else if (hashParams.view == "details") {
                        this.mnView.renderFlow({hashParams: hashParams});
                    }
                }
                break;

            case 'renderInstances':
                if (hashParams.view == "details") {
                    this.mnView.renderInstance({hashParams: hashParams});
                } else {
                    this.mnView.renderInstanceList({hashParams: hashParams});
                }
                break;

            case 'renderFlows':
                if (hashParams.view == "list") {
                    this.mnView.renderFlowList({hashParams: hashParams});
                } else if (hashParams.view == "details") {
                    this.mnView.renderFlow({hashParams: hashParams});
                }
                break;
        }
    },

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;

        if(hashObj.type == "network"){
            renderFn = "renderNetworks";
        } else if (hashObj.type == "project"){
            renderFn = "renderProjects"
        } else if (hashObj.type == "instance"){
            renderFn = "renderInstances"
        } else if (hashObj.type == "flow"){
            renderFn = "renderFlows"
        }
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
    };
};


function check4CTInit(callback) {
    if (!ctInitComplete) {
        requirejs(['controller-init'], function () {
            ctInitComplete = true;
            callback()
        });
    } else {
        callback();
    }
};
