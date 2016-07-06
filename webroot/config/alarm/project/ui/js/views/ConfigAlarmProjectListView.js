/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'config/alarm/common/ui/js/ConfigAlarmFormatters'
], function (_, ContrailView, ContrailListModel, AlarmFormatters) {
    var self, alarmFormatters = new AlarmFormatters();
    var configAlarmProjectListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            self = this;
            var listModelConfig, contrailListModel,
                viewConfig = self.attributes.viewConfig,
                currentProject = viewConfig["projectSelectedValueData"];

            listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.URL_GET_CONFIG_DETAILS,
                        type: "POST",
                        data: JSON.stringify({data: [{type: "alarms",
                                parent_id: currentProject.value}]})
                    },
                    dataParser: alarmFormatters.parseAlarmDetails,
                }
            };
            contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(self.$el,
                    contrailListModel, self.getAlarmProjectGridViewConfig());
        },

        getAlarmProjectGridViewConfig: function() {
            return {
                elementId:
                    cowu.formatElementId([ctwc.CONFIG_ALARM_PROJECT_SECTION_ID]),
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [
                            {
                                elementId: ctwc.CONFIG_ALARM_PROJECT_ID,
                                view: "ConfigAlarmGridView",
                                viewPathPrefix:
                                    "config/alarm/common/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    isProject: true,
                                    isGlobal: false
                                }
                            }
                        ]
                    }]
                }
            }
        }
    });

    return configAlarmProjectListView;
});

