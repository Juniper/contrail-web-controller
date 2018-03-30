/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var securityDashboardLoader = new SecurityDashboardLoader();


function SecurityDashboardLoader() {
    this.load = function (paramObject) {
        var self = this;
    	var hashParams = paramObject['hashParams'];
        requirejs(['security-dashboard'], function (SecurityDashboard) {
            self.securityDashboard = new SecurityDashboard();
            self.securityDashboard.render({hashParams: hashParams});
        });

    };
    this.destroy = function()  {
    }
}

