/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define([
    'controller-basedir/monitor/networking/ui/js/views/MonitorNetworkingView',
], function(MonitorNetworkingView) {
    var MNPageLoader = function() {
        this.load = function (paramObject) {
            var self = this, currMenuObj = globalObj.currMenuObj,
                hashParams = paramObject['hashParams'],
                renderFn = paramObject['function'],
                loadingStartedDefObj = paramObject['loadingStartedDefObj'];

                self.mnView = new MonitorNetworkingView();
                self.renderView(renderFn, hashParams);
                if(contrail.checkIfExist(loadingStartedDefObj)) {
                    loadingStartedDefObj.resolve();
                }
        };
        this.renderView = function (renderFn, hashParams, view) {
            $(contentContainer).empty();
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
                            if(view != undefined) {
                                view.renderNetworkList({hashParams: hashParams});
                            } else {
                                this.mnView.renderNetworkList({hashParams: hashParams});
                            }
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

                case 'renderInterfaces':
                    this.mnView.renderInterfaceList({hashParams: hashParams});
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

            this.updateViewByHash = function (currPageQueryStr) {
                var renderFn;

                //TODO: The renderFunction should be passed from ContentHandler
                if(currPageQueryStr.type == "network"){
                    renderFn = "renderNetworks";
                } else if (currPageQueryStr.type == "project"){
                    renderFn = "renderProjects"
                } else if (currPageQueryStr.type == "instance"){
                    renderFn = "renderInstances"
                } else if (currPageQueryStr.type == "interface"){
                    renderFn = "renderInterfaces"
                } else if (currPageQueryStr.type == "flow"){
                    renderFn = "renderFlows"
                }

                this.load({hashParams: currPageQueryStr, 'function': renderFn});
            };

        this.destroy = function () {};
    };

    return MNPageLoader;
});
