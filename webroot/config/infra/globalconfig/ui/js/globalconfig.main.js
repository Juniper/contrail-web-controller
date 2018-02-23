/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var globalConfigPageLoader = new GlobalConfigPageLoader();

function GlobalConfigPageLoader ()
{
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathGlobalConfigView = ctBaseDir + '/config/infra/globalconfig/ui/js/views/globalConfigView.js',
            renderFn = paramObject['function'],
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];

//        $(contentContainer).empty();

        if (self.globalConfigView == null) {
            requirejs([pathGlobalConfigView], function (GlobalConfigView) {
                self.globalConfigView = new GlobalConfigView();
                self.renderView(renderFn, hashParams);
                if(contrail.checkIfExist(loadingStartedDefObj)) {
                    loadingStartedDefObj.resolve();
                }
            }, function (err) {
                console.info("GlobalConfig Page Load error:" + err);
            });
       } else {
            self.renderView(renderFn, hashParams);
        }
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderGlobalConfig':
                this.globalConfigView[renderFn]({hashParams: hashParams});
                break;
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwc.GLOBAL_FORWARDING_OPTIONS_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.GLOBAL_BGP_OPTIONS_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.GLOBAL_FLOW_AGING_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.RBAC_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.FORWARDING_CLASS_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.QOS_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.ALARM_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.GLOBAL_COUNTERS_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.GLOBAL_CONTROL_TRAFFIC_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.SLO_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.GLOBAL_VROUTER_ENCRYPTION_PREFIX_ID);
    };
}

