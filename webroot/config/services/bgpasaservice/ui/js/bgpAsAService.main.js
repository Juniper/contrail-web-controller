/*
 *  Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

var configBGPAsAServicePageLoader = new ConfigBGPAsAServicePageLoader();

function ConfigBGPAsAServicePageLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathMNView = ctBaseDir + '/config/services/bgpasaservice/ui/js/views/bgpAsAServiceView.js',
            renderFn = paramObject['function'],
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];

        require([pathMNView], function (BGPAsAServiceView) {
            self.bgpAsAServiceView = new BGPAsAServiceView();
            self.renderView(renderFn, hashParams);
            if(contrail.checkIfExist(loadingStartedDefObj)) {
                loadingStartedDefObj.resolve();
            }
        });
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderBGPAsAService':
                this.bgpAsAServiceView[renderFn]({hashParams: hashParams});
                break;
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwc.BGP_AS_A_SERVICE_PREFIX_ID);
    };
}
