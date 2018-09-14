/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var ConfigNodesTabView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;

            self.renderView4Config(self.$el, null, getConfigNodeTabViewConfig(viewConfig));
        }
    });

    var getConfigNodeTabViewConfig = function (viewConfig) {
        var hostname = viewConfig['hostname'];

        return {
            elementId: ctwl.CONFIGNODE_DETAILS_SECTION_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CONFIGNODE_TABS_ID,
                                view: "TabsView",
                                viewConfig: getConfigNodeTabView(viewConfig)
                            }
                        ]
                    }
                ]
            }
        }
    };
    
    function getConfigNodeTabView (viewConfig) {
        return {
            theme: 'default',
            active: 0,
            tabs: [
               {
                   elementId: 'confignode_detail_id',
                   title: 'Details',
                   view: "ConfigNodeDetailPageView",
                   viewPathPrefix: "monitor/infrastructure/confignode/ui/js/views/",
                   viewConfig: viewConfig,
                   tabConfig: {
                       activate: function(event, ui) {
                           if ($('#' + ctwl.CONFIGNODE_DETAIL_PAGE_ID)) {
                               $('#' + ctwl.CONFIGNODE_DETAIL_PAGE_ID).trigger('refresh');
                           }
                       },
                       renderOnActivate: true
                   }
               },
               {
                   elementId: ctwl.CONFIGNODE_CONSOLE_LOGS_VIEW_ID,
                   title: 'Console',
                   view: "NodeConsoleLogsView",
                   viewConfig: $.extend(viewConfig,
                           {nodeType:monitorInfraConstants.CONFIG_NODE}),
                   tabConfig: {
                       activate: function(event, ui) {
                           if ($('#' + cowl.QE_SYSTEM_LOGS_GRID_ID).data('contrailGrid')) {
                               $('#' + cowl.QE_SYSTEM_LOGS_GRID_ID).
                                   data('contrailGrid').refreshView();
                           }
                       },
                       renderOnActivate: true,
                       reqdPackages: cowc.ANALYTICS_QUERY_PACKAGES
                   }
               },
               {
                   elementId:
                       ctwl.CONFIGNODE_ALARMS_GRID_VIEW_ID,
                   title: 'Alarms',
                   view: "ConfigNodeAlarmGridView",
                   viewPathPrefix:
                       "monitor/infrastructure/confignode/ui/js/views/",
                   app: cowc.APP_CONTRAIL_CONTROLLER,
                   viewConfig: viewConfig,
                   tabConfig: {
                       activate: function(event, ui) {
                           if ($('#' + ctwl.ALARMS_GRID_ID).data('contrailGrid')) {
                               $('#' + ctwl.ALARMS_GRID_ID).
                                   data('contrailGrid').refreshView();
                           }
                       },
                       renderOnActivate: true,
                       reqdPackages: cowc.ANALYTICS_ALARM_PACKAGES
                   }
               }
            ]
        }
    }
    return ConfigNodesTabView;
});
