/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'config/alarm/common/ui/js/ConfigAlarmFormatters'
], function (_, ContrailView, ContrailListModel, ConfigAlarmFormatters) {
    var self, configAlarmFormatters = new ConfigAlarmFormatters();
    var alarmGlobalListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            self = this;
            var listModelConfig, contrailListModel,
                viewConfig = self.attributes.viewConfig;

            listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.URL_GET_CONFIG_DETAILS,
                        type: "POST",
                        data: JSON.stringify({
                            data: [{
                                type: "alarms",
                                parent_type: "global-system-config",
                                parent_fq_name_str: 'default-global-system-config'
                            }]})
                    },
                    dataParser: configAlarmFormatters.parseAlarmDetails,
                }
            };
            contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(self.$el,
                    contrailListModel, self.getAlarmRuleGlobalGridViewConfig());
        },

        getAlarmRuleGlobalGridViewConfig: function() {
            return {
                elementId:
                    cowu.formatElementId([ctwc.CONFIG_ALARM_GLOBAL_SECTION_ID]),
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [
                            {
                                elementId: ctwc.CONFIG_ALARM_GLOBAL_ID,
                                view: "ConfigAlarmGridView",
                                viewPathPrefix:
                                    "config/alarm/common/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    isProject: false,
                                    isGlobal: true
                                }
                            }
                        ]
                    }]
                }
            }
        }
    });

    return alarmGlobalListView;
});

