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

            self.renderView4Config(self.$el, null, getAnalyticsNodeTabViewConfig(viewConfig));
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
                                viewConfig: {
                                    theme: 'default',
                                    active: 0,
                                    activate: function (e, ui) {
                                        var selTab = $(ui.newTab.context).text();
                                        if (selTab == ctwl.TITLE_PORT_DISTRIBUTION) {
                                            $('#' + ctwl.NETWORK_PORT_DIST_ID).trigger('refresh');
                                        } else if (selTab == ctwl.TITLE_INSTANCES) {
                                            $('#' + ctwl.PROJECT_INSTANCE_GRID_ID).data('contrailGrid').refreshView();
                                        }
                                    },
                                    tabs: [
                                       {
                                           elementId: 'analyticsnode_detail_id',
                                           title: 'Details',
                                           view: "AnalyticsNodeDetailPageView",
                                           viewPathPrefix: "monitor/infrastructure/analyticsnode/ui/js/views/",
                                           viewConfig: viewConfig
                                       },
                                       {
                                           elementId: 'analyticsnode_generators_id',
                                           title: 'Generators',
                                           view: "AnalyticsNodeGeneratorsGridView",
                                           viewPathPrefix: "monitor/infrastructure/analyticsnode/ui/js/views/",
                                           viewConfig: viewConfig
                                       }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };
    return AnalyticsNodesTabView;
});
