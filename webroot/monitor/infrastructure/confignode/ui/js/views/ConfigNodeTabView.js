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
                                           elementId: 'confignode_detail_id',
                                           title: 'Details',
                                           view: "ConfigNodeDetailPageView",
                                           viewPathPrefix: "monitor/infrastructure/confignode/ui/js/views/",
                                           viewConfig: viewConfig
                                       }
//                                       {
//                                           elementId: 'confignode_generators_id',
//                                           title: 'Generators',
//                                           view: "ConfigNodeGeneratorsGridView",
//                                           viewPathPrefix: "monitor/infrastructure/confignode/ui/js/views/",
//                                           viewConfig: viewConfig
//                                       }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };
    return ConfigNodesTabView;
});
