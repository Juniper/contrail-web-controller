/*
 *  Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

var configNodesLoader = new ConfigNodesPageLoader();

function ConfigNodesPageLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathMNView = ctBaseDir + '/config/infra/nodes/ui/js/views/nodesCfgView.js',
            renderFn = paramObject['function'],
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];

        require([pathMNView], function (NodesCfgView) {
            self.nodesCfgView = new NodesCfgView();
            self.renderView(renderFn, hashParams);
            if(contrail.checkIfExist(loadingStartedDefObj)) {
                loadingStartedDefObj.resolve();
            }
        });
    };

    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderNodesConfig':
                this.nodesCfgView[renderFn]({hashParams: hashParams});
                break;
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.CFG_VROUTER_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.ANALYTICS_NODE_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.CONFIG_NODE_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.DATABASE_NODE_PREFIX_ID);
    };
}
