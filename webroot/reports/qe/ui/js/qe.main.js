/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var qeLoader = new QELoader();

function QELoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            pathQEView = ctBaseDir + '/reports/qe/ui/js/views/QueryEngineView.js',
            renderFn = paramObject['function'],
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];

        require([pathQEView], function (QueryEngineView) {
            self.qeView = new QueryEngineView();
            self.renderView(renderFn, hashParams);
            if(contrail.checkIfExist(loadingStartedDefObj)) {
                loadingStartedDefObj.resolve();
            }
        });
    };
    this.renderView = function (renderFn, hashParams, view) {
        $(contentContainer).empty();
        switch (renderFn) {
            case 'renderFlowSeries':
                this.qeView.renderFlowSeries({hashParams: hashParams});
                break;

            case 'renderStatQuery':
                this.qeView.renderStatQuery({hashParams: hashParams});
                break;

            case 'renderObjectLogs':
                this.qeView.renderObjectLogs({hashParams: hashParams});
                break;

            case 'renderFlowQueue':
                this.qeView.renderFlowQueue({hashParams: hashParams});
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
