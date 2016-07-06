/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var configAlarmProjectView = ContrailView.extend({
        el: $(contentContainer),
        renderProjectAlarm: function (viewConfig) {
            var self = this;
            self.renderView4Config(self.$el, null,
                                   getAlarmProjectConfig(viewConfig));
        }
    });

    function getAlarmProjectConfig (viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                config: true,
                childView: {
                    init: getAlarmProjectListViewConfig(viewConfig),
                }
            },
            customDomainDropdownOptions = {
                childView: {
                    init: ctwvc.getProjectBreadcrumbDropdownViewConfig(
                            hashParams, customProjectDropdownOptions)
                }
            };
        return ctwvc.getDomainBreadcrumbDropdownViewConfig(hashParams,
            customDomainDropdownOptions)
    };

    function getAlarmProjectListViewConfig(viewConfig) {
        return function (projectSelectedValueData) {
            return {
                elementId: cowu.formatElementId(
                        [ctwc.CONFIG_ALARM_LIST_ID]),
                view: "ConfigAlarmProjectListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/alarm/project/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                                     {projectSelectedValueData:
                                     projectSelectedValueData})
            }
        }
    };
    return configAlarmProjectView;
});

