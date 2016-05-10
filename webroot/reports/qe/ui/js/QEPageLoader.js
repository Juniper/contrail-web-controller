/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'controller-basedir/reports/qe/ui/js/views/QueryEngineView'
], function(QueryEngineView) {
    var QEPageLoader = function() {
        this.load = function (paramObject) {
            var self = this, currMenuObj = globalObj.currMenuObj,
                hashParams = paramObject['hashParams'],
                renderFn = paramObject['function'],
                loadingStartedDefObj = paramObject['loadingStartedDefObj'];
            
                self.qeView = new QueryEngineView();
                self.renderView(renderFn, hashParams);
                if(contrail.checkIfExist(loadingStartedDefObj)) {
                    loadingStartedDefObj.resolve();
                }
        };
        this.renderView = function (renderFn, hashParams, view) {
            $(contentContainer).empty();
            switch (renderFn) {
                case 'renderFlowSeries':
                    this.qeView.renderFlowSeries({hashParams: hashParams});
                    break;

                case 'renderFlowRecord':
                    this.qeView.renderFlowRecord({hashParams: hashParams});
                    break;

                case 'renderFlowQueue':
                    this.qeView.renderFlowQueue({hashParams: hashParams});
                    break;

                case 'renderSystemLogs':
                    this.qeView.renderSystemLogs({hashParams: hashParams});
                    break;

                case 'renderObjectLogs':
                    this.qeView.renderObjectLogs({hashParams: hashParams});
                    break;

                case 'renderLogQueue':
                    this.qeView.renderLogQueue({hashParams: hashParams});
                    break;

                case 'renderStatQuery':
                    this.qeView.renderStatQuery({hashParams: hashParams});
                    break;

                case 'renderStatQueue':
                    this.qeView.renderStatQueue({hashParams: hashParams});
                    break;
            }
        },

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
    
    return QEPageLoader;
});

