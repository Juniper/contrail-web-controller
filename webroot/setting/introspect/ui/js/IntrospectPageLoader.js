/*
 * Copyright (c) 2016
 * Juniper Networks, Inc. All rights reserved.
 */

define([
    "controller-basedir/setting/introspect/ui/js/views/IntrospectView"
], function(IntrospectView) {
    var IntrospectPageLoader = function() {
        this.load = function (paramObject) {
            var self = this,
                hashParams = paramObject.hashParams,
                renderFn = paramObject.function,
                loadingStartedDefObj = paramObject.loadingStartedDefObj;

            self.introspectView = new IntrospectView();
            self.renderView(renderFn, hashParams);
            if(contrail.checkIfExist(loadingStartedDefObj)) {
                loadingStartedDefObj.resolve();
            }
        };

        this.renderView = function (renderFn, hashParams) {

            $(window.contentContainer).empty();
            switch (renderFn) {
                case "renderControlNodeIntrospect":
                    this.introspectView.renderControlNodeIntrospect({hashParams: hashParams});
                    break;

                case "renderVirtualRouterIntrospect":
                    this.introspectView.renderVirtualRouterIntrospect({hashParams: hashParams});
                    break;

                case "renderConfigNodeIntrospect":
                    this.introspectView.renderConfigNodeIntrospect({hashParams: hashParams});
                    break;

                case "renderAnalyticsNodeIntrospect":
                    this.introspectView.renderAnalyticsNodeIntrospect({hashParams: hashParams});
                    break;
                case "renderIntrospectXML":
                    this.introspectView.renderIntrospectXML({hashParams: hashParams});
                    break;
            }
        };

        this.updateViewByHash = function (currPageQueryStr) {
            var renderFn;

            this.load({hashParams: currPageQueryStr, "function": renderFn});
        };

        this.destroy = function () {};
    };

    return IntrospectPageLoader;
});

