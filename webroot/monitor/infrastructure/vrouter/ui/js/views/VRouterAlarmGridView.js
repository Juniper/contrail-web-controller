/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var hostname;
    var VRouterAlarmGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this;
            var viewConfig = this.attributes.viewConfig;
            hostname = viewConfig['hostname'];
            var remoteAjaxConfig = {
                    remote: {
                        ajaxConfig: {
                            url: contrail.format(monitorInfraConstants.
                                    monitorInfraUrls['VROUTER_DETAILS'],
                                    hostname,true),
                            type: "GET",
                        },
                        dataParser: parseAlarms
                    },
                    cacheConfig: {
                    }
            }
            var contrailListModel = new ContrailListModel(remoteAjaxConfig);

            self.renderView4Config(this.$el, contrailListModel,
                    getVRouterAlarmsViewConfig(viewConfig));
        }
    });

    function parseAlarms(response) {
        var alarmsObj = {};
        if(response != null && response.UVEAlarms != null) {
            alarmsObj =  coreAlarmUtils.wrapUVEAlarms('vrouter',hostname,response.UVEAlarms);
        }
        return coreAlarmParsers.alarmDataParser(alarmsObj);
    }

    var getVRouterAlarmsViewConfig = function (viewConfig) {
        return {
            elementId : ctwl.VROUTER_ALARMS_GRID_SECTION_ID,
            view : "AlarmGridView",
            viewConfig : viewConfig
        };
    }

    return VRouterAlarmGridView;
});