/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var monInfraDashboardLoader = new MonInfraDashboardLoader();

function MonInfraDashboardLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathMonInfraDashboardView = rootDir + '/js/views/MonitorInfraDashboardView.js',
            renderFn = paramObject['function'];

        if (self.monInfraDashboardView == null) {
            requirejs([pathMonInfraDashboardView], function (MonInfraDashboardView) {
                self.monInfraDashboardView = new MonInfraDashboardView();
                self.monInfraDashboardView.render();
            });
        } else {
            self.renderView(renderFn, hashParams);
        }
    };

    this.destroy = function()  {
    }
}

