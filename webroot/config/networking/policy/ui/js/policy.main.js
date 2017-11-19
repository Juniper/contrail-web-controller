/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var configPoliciesLoader = new ConfigPoliciesLoader();

function ConfigPoliciesLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            pathPolicyView = ctBaseDir + '/config/networking/policy/ui/js/views/policyView.js',
            renderFn = paramObject['function'];
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];

        require([pathPolicyView], function (PolicyView) {
            self.policyView = new PolicyView();
            self.renderView(renderFn, hashParams);
            if(contrail.checkIfExist(loadingStartedDefObj)) {
                loadingStartedDefObj.resolve();
            }
        })
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        this.policyView[renderFn]({hashParams: hashParams});
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.POLICY_PREFIX_ID);
    };
}
