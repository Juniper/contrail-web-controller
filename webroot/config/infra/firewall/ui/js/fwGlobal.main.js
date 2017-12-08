/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

var fwGlobalPageLoader = new FWGlobalPageLoader();

function FWGlobalPageLoader ()
{
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathSecurityPolicyView = ctBaseDir + '/config/infra/firewall/ui/js/views/fwGlobalView.js',
            renderFn = paramObject['function'],
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];


        if (self.securityPolicyView == null) {
            requirejs([pathSecurityPolicyView], function (SecurityPolicyView) {
                self.securityPolicyView = new SecurityPolicyView();
                self.renderView(renderFn, hashParams);
                if(contrail.checkIfExist(loadingStartedDefObj)) {
                    loadingStartedDefObj.resolve();
                }
            }, function (err) {
                console.info("Security Policy Page Load error:" + err);
            });
       } else {
            self.renderView(renderFn, hashParams);
        }
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        if (hashParams.view == "config_security_globalrules") {
            this.securityPolicyView.renderInfraPolicyDetails({
                hashParams: hashParams
            });
        } else {
            this.securityPolicyView.renderFirewall({
                hashParams: hashParams
            });
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwc.SEC_POLICY_ADDRESS_GRP_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.SEC_POLICY_SERVICE_GRP_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.FIREWALL_APPLICATION_POLICY_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.FW_POLICY_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.FW_RULE_PREFIX_ID);
        ctwu.destroyDOMResources(ctwc.FW_POLICY_WIZARD);
        $("#aps-landing-container").remove();
    };
}

