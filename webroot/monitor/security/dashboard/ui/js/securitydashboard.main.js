/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var securityDashboardLoader = new SecurityDashboardLoader();


function SecurityDashboardLoader() {
    this.load = function (paramObject) {
        requirejs(['security-dashboard'], function (SecurityDashboard) {
            var securityDashboard = new SecurityDashboard();
            securityDashboard.render();
        })

    };
    this.destroy = function()  {
    }
}

