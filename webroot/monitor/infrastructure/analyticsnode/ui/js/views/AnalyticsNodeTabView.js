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
            activate: function (e, ui) {
                var selTab = $(ui.newTab.context).text();
                if (selTab == 'Details') {
                    $('#' + ctwl.ANALYTICSNODE_DETAIL_PAGE_ID).trigger('refresh');
                } else if (selTab == 'Generators') {
                    $('#analytics_node_generators_grid').
                        data('contrailGrid').refreshView();
                }
            },
            tabs: [
               {
                   elementId: 'analyticsnode_detail_id',
                   title: 'Details',
                   view: "AnalyticsNodeDetailPageView",
                   viewPathPrefix: ctwl.ANALYTICSNODE_VIEWPATH_PREFIX,
                   app: cowc.APP_CONTRAIL_CONTROLLER,
                   viewConfig: viewConfig
               },
               {
                   elementId: 'analyticsnode_generators_id',
                   title: 'Generators',
                   view: "AnalyticsNodeGeneratorsGridView",
                   viewPathPrefix: ctwl.ANALYTICSNODE_VIEWPATH_PREFIX,
                   app: cowc.APP_CONTRAIL_CONTROLLER,
                   viewConfig: viewConfig
               }
            ]
        }
    }

    return AnalyticsNodesTabView;
});
