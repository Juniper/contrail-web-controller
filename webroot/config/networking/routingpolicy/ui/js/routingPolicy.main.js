/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var routingPolicyPageLoader = new RoutingPolicyPageLoader();
function RoutingPolicyPageLoader ()
{
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathRoutingPolicyView = rootDir + '/js/views/routingPolicyView.js',
            renderFn = paramObject['function'];

        $(contentContainer).empty();

        if (self.routingPolicyView == null) {
            requirejs([pathRoutingPolicyView], function (RoutingPolicyView) {
                self.routingPolicyView = new RoutingPolicyView();
                self.renderView(renderFn, hashParams);
            }, function (err) {
                console.info("Routing Policy Page Load error:" + err);
            });
       } else {
            self.renderView(renderFn, hashParams);
        }
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderRoutingPolicy':
                this.routingPolicyView[renderFn]({hashParams: hashParams});
                break;
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.ROUTING_POLICY_PREFIX_ID);
    };
}