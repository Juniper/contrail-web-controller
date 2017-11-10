/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
var trafficGroupsLoader = new TrafficGroupsLoader();

function TrafficGroupsLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathTrafficGroupsInitView = 'controller-basedir/monitor/security/trafficgroups/ui/js/views/TrafficGroupsInitView',
            renderFn = paramObject['renderFn'];

            if (self.TrafficGroupsInitView == null) {
                requirejs([pathTrafficGroupsInitView], function (TrafficGroupsInitView){
                    self.TrafficGroupsInitView = new TrafficGroupsInitView({
                        el: $(contentContainer)
                    });
                    loadingStartedDefObj = paramObject['loadingStartedDefObj'];
                    self.TrafficGroupsInitView.renderTrafficView({hashParams: hashParams});
                    if(loadingStartedDefObj != null)
                        loadingStartedDefObj.resolve();
                });
            } /*else {
                self.renderView(renderFn, hashParams);
            }*/
            $('#page-content').css('padding-top','10px');
    }
    this.renderView = function (renderFn, hashParams, view) {
        $(contentContainer).html("");
        if(hashParams.view == "details") {
            this.trafficGroupsView.renderControlNodeDetails(
                    {hashParams: hashParams});
        } else {
            this.trafficGroupsView.renderControlNode({hashParams: hashParams});
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        this.load({hashParams : hashObj});
    };

    this.destroy = function () {
        $('#page-content').css('padding-top','2px');
    };
}
