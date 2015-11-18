/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var VRouterTabView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;

            self.renderView4Config(self.$el, null,
                    getVRouterTabsViewConfig(viewConfig));
        }
    });

    var getVRouterTabsViewConfig = function (viewConfig) {
        var hostname = viewConfig['hostname'];

        return {
            elementId: ctwl.VROUTER_DETAILS_SECTION_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.VROUTER_DETAILS_TABS_ID,
                                view: "TabsView",
                                viewConfig: getVRouterTabViewConfig(
                                                viewConfig)
                            }
                        ]
                    }
                ]
            }
        }
    };

    function getVRouterTabViewConfig (viewConfig) {
        return {
            theme: 'default',
            active: 0,
            activate: function (e, ui) {
                var selTab = $(ui.newTab.context).text();
                var currGrid;
                if (selTab == 'Details') {
                    $('#' + ctwl.VROUTER_DETAIL_ID).
                        trigger('refresh');
                    return;
                } else if (selTab == 'Interfaces') {
                   currGrid = $('#' + ctwl.VROUTER_INTERFACES_GRID_ID).
                   data('contrailGrid');
                } else if (selTab == 'Networks') {
                   currGrid = $('#' + ctwl.VROUTER_NETWORKS_GRID_ID).
                   data('contrailGrid');
                } else if (selTab == 'ACL') {
                   currGrid = $('#' + ctwl.VROUTER_ACL_GRID_ID).
                   data('contrailGrid');
                } else if (selTab == 'Flows') {
                   currGrid = $('#' + ctwl.VROUTER_FLOWS_GRID_ID).
                   data('contrailGrid');
                } else if (selTab == 'Routes') {
                   currGrid = $('#' + ctwl.VROUTER_ROUTES_GRID_ID).
                   data('contrailGrid');
                } else if (selTab == 'Instances') {
                    currGrid = $('#' + ctwl.VROUTER_INSTANCE_GRID_ID).
                    data('contrailGrid');
                 }
                if(currGrid != null)
                    currGrid.refreshView();
            },
            tabs: ctwvc.getVRouterDetailsPageTabs(viewConfig)
        }
    }
    return VRouterTabView;
});
