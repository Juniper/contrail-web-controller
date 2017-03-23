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
    var DatabaseNodeAlarmGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this;
            var viewConfig = this.attributes.viewConfig;
            hostname = viewConfig['hostname'];
            var remoteAjaxConfig = {
                    remote: {
                        ajaxConfig: {
                            url: contrail.format(monitorInfraConstants.
                                    monitorInfraUrls['DATABASE_DETAILS'],
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
                    getDatabaseNodeAlarmsViewConfig(viewConfig));
        }
    });

    function parseAlarms(response) {
        var alarmsObj = {};
        alarmsObj =  coreAlarmUtils.wrapUVEAlarms('database-node',hostname,
                getValueByJsonPath(response,'UVEAlarms',[]));
        return coreAlarmParsers.alarmDataParser(alarmsObj);
    }

    var getDatabaseNodeAlarmsViewConfig = function (viewConfig) {
        return {
            elementId : ctwl.DATABASE_NODE_ALARMS_GRID_SECTION_ID,
            view : "AlarmGridView",
            viewPathPrefix: cowc.ALARMS_VIEWPATH_PREFIX,
            viewConfig : viewConfig
        };
    }

    return DatabaseNodeAlarmGridView;
});
