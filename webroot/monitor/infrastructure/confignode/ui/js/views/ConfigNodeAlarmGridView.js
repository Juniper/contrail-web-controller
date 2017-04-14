/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'core-alarm-utils',
    'core-alarm-parsers'
], function (_, ContrailView, ContrailListModel,coreAlarmUtils,coreAlarmParsers) {
    var hostname;
    var ConfigNodeAlarmGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this;
            var viewConfig = this.attributes.viewConfig;
            hostname = viewConfig['hostname'];
            var remoteAjaxConfig = {
                    remote: {
                        ajaxConfig: {
                            url: contrail.format(monitorInfraConstants.
                                    monitorInfraUrls['CONFIG_DETAILS'],
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
                    getConfigNodeAlarmsViewConfig(viewConfig));
        }
    });

    function parseAlarms(response) {
        var alarmsObj = {};
        alarmsObj =  coreAlarmUtils.wrapUVEAlarms('config-node',hostname,
                getValueByJsonPath(response,'UVEAlarms',[]));
        return coreAlarmParsers.alarmDataParser(alarmsObj);
    }

    var getConfigNodeAlarmsViewConfig = function (viewConfig) {
        return {
            elementId : ctwl.CONFIG_NODE_ALARMS_GRID_SECTION_ID,
            view : "AlarmGridView",
            viewPathPrefix: cowc.ALARMS_VIEWPATH_PREFIX,
            viewConfig : viewConfig
        };
    }

    return ConfigNodeAlarmGridView;
});
