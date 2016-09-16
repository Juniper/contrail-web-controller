/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'controller-basedir/reports/qe/ui/js/views/ControllerQEView'
], function(ControllerQEView) {
    var ControllerQEPageLoader = function() {
        this.load = function (paramObject) {
            var self = this, currMenuObj = globalObj.currMenuObj,
                hashParams = paramObject['hashParams'],
                renderFn = paramObject['function'],
                loadingStartedDefObj = paramObject['loadingStartedDefObj'];

            self.controllerQEView = new ControllerQEView();
            self.renderView(renderFn, hashParams);
            if(contrail.checkIfExist(loadingStartedDefObj)) {
                loadingStartedDefObj.resolve();
            }
        };

        this.renderView = function (renderFn, hashParams, view) {
            $(contentContainer).empty();
            switch (renderFn) {
                case 'renderFlowSeries':
                    this.controllerQEView.renderFlowSeries({hashParams: hashParams});
                    break;

                case 'renderFlowRecord':
                    this.controllerQEView.renderFlowRecord({hashParams: hashParams});
                    break;

                case 'renderFlowQueue':
                    this.controllerQEView.renderFlowQueue({hashParams: hashParams});
                    break;
            }
        };

        this.updateViewByHash = function (currPageQueryStr) {
            var renderFn;

            //TODO: The renderFunction should be passed from ContentHandler
            if (currPageQueryStr.type == "flow"){
                renderFn = "renderFlows"
            }

            this.load({hashParams: currPageQueryStr, 'function': renderFn});
        };

        this.destroy = function () {};
    };

    return ControllerQEPageLoader;
});

