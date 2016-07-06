/*
 *  Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

var configAlarmProjectPageLoader = new ConfigAlarmProjectPageLoader();

function ConfigAlarmProjectPageLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathMNView = ctBaseDir +
                '/config/alarm/project/ui/js/views/ConfigAlarmProjectView.js',
            renderFn = paramObject['function'],
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];

        require([pathMNView], function (AlarmProjectView) {
            self.alarmProjectView = new AlarmProjectView();
            self.renderView(renderFn, hashParams);
            if(contrail.checkIfExist(loadingStartedDefObj)) {
                loadingStartedDefObj.resolve();
            }
        });
    };

    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderProjectAlarm':
                this.alarmProjectView[renderFn]({hashParams: hashParams});
                break;
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwc.ALARM_PREFIX_ID);
    };
}
