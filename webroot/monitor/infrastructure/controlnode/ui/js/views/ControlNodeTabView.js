/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var ControlNodesTabView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;

            self.renderView4Config(self.$el, null, getControlNodeTabsViewConfig(viewConfig));
        }
    });

    var getControlNodeTabsViewConfig = function (viewConfig) {
        var hostname = viewConfig['hostname'];

        return {
            elementId: ctwl.CONTROLNDOE_DETAILS_SECTION_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CONTROLNODE_DETAILS_TABS_ID,
                                view: "TabsView",
                                viewConfig: getControlNodeTabViewConfig(
                                                viewConfig)
                            }
                        ]
                    }
                ]
            }
        }
    };
    
    function getControlNodeTabViewConfig (viewConfig) {
        return {
            theme: 'default',
            active: 0,
            activate: function (e, ui) {
                var selTab = $(ui.newTab.context).text();
                if (selTab == 
                        ctwl.TITLE_PORT_DISTRIBUTION) {
                    $('#' + ctwl.NETWORK_PORT_DIST_ID).
                        trigger('refresh');
                } else if (selTab == 'Peers') {
    //                $('#' + ctwl.CONTROLNODE_PEERS_GRID_ID).
//                    data('contrailGrid').refreshView();
                }
            },
            tabs: [
                   {
                       elementId: 'controlnode_detail_id',
                       title: 'Details',
                       view: "ControlNodeDetailPageView",
                       viewPathPrefix: 
                           ctwl.CONTROLNODE_VIEWPATH_PREFIX,
                       viewConfig: viewConfig
                   },
                   {
                       elementId: 
                           ctwl.CONTROLNODE_PEERS_GRID_VIEW_ID,
                       title: 'Peers',
                       view: "ControlNodePeersGridView",
                       viewPathPrefix: 
                           ctwl.CONTROLNODE_VIEWPATH_PREFIX,
                       viewConfig: viewConfig
                   }
    
                /*{
                    elementId: 'controlnode_routes_id',
                    title: 'Routes',
                    view: "DetailsView",
                    viewConfig: {
                        ajaxConfig: {
                            url: 
                        },
                        templateConfig: getDetailsViewTemplateConfig(),
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        dataParser: function(result) {
                            return monitorInfraParsers.
                            parseControlNodesDashboardData([result])[0];
                        }
                    }
                },
                {
                    elementId: 'controlnode_console_id',
                    title: 'Console',
                    view: "DetailsView",
                    viewConfig: {
                        ajaxConfig: {
                            url: '',
                            type: 'GET'
                        },
                        templateConfig: getDetailsViewTemplateConfig(),
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        dataParser: function(result) {
                            return monitorInfraParsers.
                            parseControlNodesDashboardData([result])[0];
                        }
                    }
                }*/
            ]
        }
    }
    return ControlNodesTabView;
});
