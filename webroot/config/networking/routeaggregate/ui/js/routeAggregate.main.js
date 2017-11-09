/*
 *  Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

var configRouteAggregatePageLoader = new ConfigRouteAggregatePageLoader();

function ConfigRouteAggregatePageLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathMNView = ctBaseDir + '/config/networking/routeaggregate/ui/js/views/routeAggregateView.js',
            renderFn = paramObject['function'];

        require([pathMNView], function (RouteAggregateView) {
            self.routeAggregateView = new RouteAggregateView();
            self.renderView(renderFn, hashParams);
        });
    };

    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderRouteAggregate':
                this.routeAggregateView[renderFn]({hashParams: hashParams});
                break;
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwc.ROUTE_AGGREGATE_PREFIX_ID);
    };
}
