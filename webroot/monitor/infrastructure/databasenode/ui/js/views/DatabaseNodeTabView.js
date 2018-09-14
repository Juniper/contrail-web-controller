/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var DatabaseNodesTabView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;

            self.renderView4Config(self.$el, null, getDatabaseNodeTabViewConfig(viewConfig));
        }
    });

    var getDatabaseNodeTabViewConfig = function (viewConfig) {
        var hostname = viewConfig['hostname'];

        return {
            elementId: ctwl.DATABASENODE_DETAILS_SECTION_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.DATABASENODE_TABS_ID,
                                view: "TabsView",
                                viewConfig: getTabViewConfig(viewConfig)
                            }
                        ]
                    }
                ]
            }
        }
    };

    function getTabViewConfig(viewConfig){
        return {
            theme: 'default',
            active: 0,
            tabs: [
               {
                   elementId: 'databasenode_detail_id',
                   title: 'Details',
                   view: "DatabaseNodeDetailPageView",
                   viewPathPrefix: ctwl.DATABASENODE_VIEWPATH_PREFIX,
                   viewConfig: viewConfig,
                   tabConfig: {
                       activate: function(event, ui) {
                           if ($('#' + ctwl.DBNODE_DETAIL_PAGE_ID)) {
                               $('#' + ctwl.DBNODE_DETAIL_PAGE_ID).trigger('refresh');
                           }
                       },
                       renderOnActivate: true
                   }
               },
               {
                   elementId:
                       ctwl.DATABASENODE_ALARMS_GRID_VIEW_ID,
                   title: 'Alarms',
                   view: "DatabaseNodeAlarmGridView",
                   viewPathPrefix:
                       ctwl.DATABASENODE_VIEWPATH_PREFIX,
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
    return DatabaseNodesTabView;
});
