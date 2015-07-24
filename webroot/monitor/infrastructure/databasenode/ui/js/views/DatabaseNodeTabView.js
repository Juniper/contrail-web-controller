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
            activate: function (e, ui) {
                var selTab = $(ui.newTab.context).text();
                if (selTab == ctwl.TITLE_PORT_DISTRIBUTION) {
                    $('#' + ctwl.NETWORK_PORT_DIST_ID).trigger('refresh');
                } else if (selTab == ctwl.TITLE_INSTANCES) {
                    $('#' + ctwl.PROJECT_INSTANCE_GRID_ID).data('contrailGrid').
                        refreshView();
                }
            },
            tabs: [
               {
                   elementId: 'databasenode_detail_id',
                   title: 'Details',
                   view: "DatabaseNodeDetailPageView",
                   viewPathPrefix: ctwl.DATABASENODE_VIEWPATH_PREFIX,
                   viewConfig: viewConfig
               }
            ]
        }
    }
    return DatabaseNodesTabView;
});
