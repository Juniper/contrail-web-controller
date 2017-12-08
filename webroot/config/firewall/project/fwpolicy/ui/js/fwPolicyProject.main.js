/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

var fwPolicyProjectPageLoader = new FWPolicyProjectPageLoader();

function FWPolicyProjectPageLoader ()
{
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathSecurityPolicyView = ctBaseDir + '/config/firewall/project/fwpolicy/ui/js/views/fwPolicyProjectView.js',
            renderFn = paramObject['function'],
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];


        if (self.fwPolicyView == null) {
            requirejs([pathSecurityPolicyView], function (FWPolicyView) {
                self.fwPolicyView = new FWPolicyView();
                self.renderView(renderFn, hashParams);
                if(contrail.checkIfExist(loadingStartedDefObj)) {
                    loadingStartedDefObj.resolve();
                }
            }, function (err) {
                console.info("Firewall Page Load error:" + err);
            });
       } else {
            self.renderView(renderFn, hashParams);
        }
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        if (hashParams.view == "config_firewall_rules") {
            this.fwPolicyView.renderFWRule({
                hashParams: hashParams
            });
        } else {
            this.fwPolicyView.renderFWPolicy({
                hashParams: hashParams
            });
        }        
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwc.FW_POLICY_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.FW_RULE_PREFIX_ID);
    };
}

