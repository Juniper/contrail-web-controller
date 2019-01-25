/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var AnalyticsNodesTabView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;

            self.renderView4Config(self.$el, null,
                    getAnalyticsNodeTabViewConfig(viewConfig));
        }
    });

    var getAnalyticsNodeTabViewConfig = function (viewConfig) {
        var hostname = viewConfig['hostname'];

        return {
            elementId: ctwl.ANALYTICSNODE_DETAILS_SECTION_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.ANALYTICSNODE_TABS_ID,
                                view: "TabsView",
                                viewConfig: getAnalyticsNodeTabsViewConfig(
                                                viewConfig)
                            }
                        ]
                    }
                ]
            }
        }
    };

    function getAnalyticsNodeTabsViewConfig(viewConfig) {
        return {
            theme: 'default',
            active: 0,
            tabs: [
               {
                   elementId: 'analyticsnode_detail_id',
                   title: 'Details',
                   view: "AnalyticsNodeDetailPageView",
                   viewPathPrefix: ctwl.ANALYTICSNODE_VIEWPATH_PREFIX,
                   app: cowc.APP_CONTRAIL_CONTROLLER,
                   viewConfig: viewConfig,
                   tabConfig: {
                       activate: function(event, ui) {
                           if ($('#' + ctwl.ANALYTICSNODE_DETAIL_PAGE_ID)) {
                               $('#' + ctwl.ANALYTICSNODE_DETAIL_PAGE_ID).trigger('refresh');
                           }
                       },
                       renderOnActivate: true
                   }
               },
               {
                   elementId: 'analyticsnode_generators_id',
                   title: 'Generators',
                   view: "AnalyticsNodeGeneratorsGridView",
                   viewPathPrefix: ctwl.ANALYTICSNODE_VIEWPATH_PREFIX,
                   app: cowc.APP_CONTRAIL_CONTROLLER,
                   viewConfig: viewConfig,
                   tabConfig: {
                       activate: function(event, ui) {
                           if ($('#' + ctwl.ANALYTICSNODE_GENERATORS_GRID_ID).
                                   data('contrailGrid')) {
                               $('#' + ctwl.ANALYTICSNODE_GENERATORS_GRID_ID).
                                       data('contrailGrid').refreshView();
                           }
                       },
                       renderOnActivate: true
                   }
               },
               {
                   elementId: 'analyticsnode_qequery_id',
                   title: 'QE Queries',
                   view: "AnalyticsNodeQEQueriesGridView",
                   viewPathPrefix: ctwl.ANALYTICSNODE_VIEWPATH_PREFIX,
                   app: cowc.APP_CONTRAIL_CONTROLLER,
                   viewConfig: viewConfig,
                   tabConfig: {
                       activate: function(event, ui) {
                           if ($('#' + ctwl.ANALYTICSNODE_QEQUERIES_GRID_ID).
                                   data('contrailGrid')) {
                               $('#' + ctwl.ANALYTICSNODE_QEQUERIES_GRID_ID).
                                   data('contrailGrid').refreshView();
                           }
                       },
                       renderOnActivate: true,
                       reqdPackages: cowc.ANALYTICS_QUERY_PACKAGES
                   }
               },
               {
                   elementId: ctwl.ANALYTICSNODE_CONSOLE_LOGS_VIEW_ID,
                   title: 'Console',
                   view: "NodeConsoleLogsView",
                   viewConfig: $.extend(viewConfig,
                           {nodeType:monitorInfraConstants.ANALYTICS_NODE}),
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
                       ctwl.ANALYTICSNODE_ALARMS_GRID_VIEW_ID,
                   title: 'Alarms',
                   view: "AnalyticsNodeAlarmGridView",
                   viewPathPrefix:
                       ctwl.ANALYTICSNODE_VIEWPATH_PREFIX,
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

    return AnalyticsNodesTabView;
});
