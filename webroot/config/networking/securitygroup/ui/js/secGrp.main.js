/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var secGrpPageLoader = new SecGrpPageLoader();

function SecGrpPageLoader ()
{
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            pathSecGrpView = ctBaseDir + '/config/networking/securitygroup/ui/js/views/SecGrpView.js',
            renderFn = paramObject['function'];
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];
            $(contentContainer).empty();
        require([pathSecGrpView], function (SecGrpView) {
            self.secGrpView = new SecGrpView();
            self.renderView(renderFn, hashParams);
            if(contrail.checkIfExist(loadingStartedDefObj)) {
                loadingStartedDefObj.resolve();
            }
        });
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderSecGrp':
                this.secGrpView[renderFn]({hashParams: hashParams});
                break;
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.SEC_GRP_PREFIX_ID);
    };
}


