/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

var addressGroupProjectPageLoader = new addressGroupProjectPageLoader();

function addressGroupProjectPageLoader ()
{
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathSecurityPolicyView = rootDir + '/js/views/addressGroupProjectView.js',
            renderFn = paramObject['function'];


        if (self.securityPolicyView == null) {
            requirejs([pathSecurityPolicyView], function (SecurityPolicyView) {
                self.securityPolicyView = new SecurityPolicyView();
                self.renderView(renderFn, hashParams);
            }, function (err) {
                console.info("Firewall Page Load error:" + err);
            });
       } else {
            self.renderView(renderFn, hashParams);
        }
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderAddressGroup':
                this.securityPolicyView[renderFn]({hashParams: hashParams});
                break;
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        /*ctwu.destroyDOMResources(ctwc.GLOBAL_FORWARDING_OPTIONS_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.GLOBAL_BGP_OPTIONS_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.GLOBAL_FLOW_AGING_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.RBAC_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.FORWARDING_CLASS_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.QOS_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.ALARM_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.GLOBAL_COUNTERS_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.GLOBAL_CONTROL_TRAFFIC_PREFIX_ID);*/
    };
}

