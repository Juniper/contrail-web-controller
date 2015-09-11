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
                if (selTab ==
                        'Details') {
                    $('#' + ctwl.VROUTER_DETAIL_ID).
                        trigger('refresh');
                } else if (selTab == 'Interfaces') {
                   $('#' + ctwl.VROUTER_INTERFACES_GRID_ID).
                   data('contrailGrid').refreshView();
                } else if (selTab == 'Networks') {
                   $('#' + ctwl.VROUTER_NETWORKS_GRID_ID).
                   data('contrailGrid').refreshView();
                } else if (selTab == 'ACL') {
                   $('#' + ctwl.VROUTER_ACL_GRID_ID).
                   data('contrailGrid').refreshView();
                } else if (selTab == 'Flows') {
                   $('#' + ctwl.VROUTER_FLOWS_GRID_ID).
                   data('contrailGrid').refreshView();
                } else if (selTab == 'Routes') {
                   $('#' + ctwl.VROUTER_ROUTES_GRID_ID).
                   data('contrailGrid').refreshView();
                }
            },
            tabs: ctwvc.getVRouterDetailsPageTabs(viewConfig)
        }
    }
    return VRouterTabView;
});
