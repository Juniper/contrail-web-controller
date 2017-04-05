/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var controllerInfraDashboardLoader = new ControllerInfraDashboardLoader();


function ControllerInfraDashboardLoader() {
    this.load = function (paramObject) {
        var self = this,
            hashParams = paramObject['hashParams'],
            renderFn = paramObject['function'];
        $("#page-content").removeClass("dashboard-no-padding").addClass("dashboard-padding");
        if(monInfraDashboardLoader.loadedControllerInfoboxes != true) {
            monInfraDashboardLoader.loadedControllerInfoboxes = true;
            require(['mon-infra-dashboard-view'],function() {
                require(['mon-infra-controller-dashboard'], function (ControllerDashboardView) {
                    self.monInfraDashboardView = new ControllerDashboardView({
                        el: $(contentContainer)
                    });
                    self.monInfraDashboardView.render();
                });
            });
        }
    };
    this.destroy = function()  {
    }
}

