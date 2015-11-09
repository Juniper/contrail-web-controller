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

            self.renderView4Config(self.$el, null,
                    getControlNodeTabsViewConfig(viewConfig));
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
            tabs: [
                   {
                       elementId: 'controlnode_detail_id',
                       title: 'Details',
                       view: "ControlNodeDetailPageView",
                       viewPathPrefix:
                           ctwl.CONTROLNODE_VIEWPATH_PREFIX,
                       app: cowc.APP_CONTRAIL_CONTROLLER,
                       viewConfig: viewConfig,
                       tabConfig: {
                           activate: function(event, ui) {
                               if ( $('#' + ctwl.CONTROLNODE_DETAIL_PAGE_ID)) {
                                   $('#' + ctwl.CONTROLNODE_DETAIL_PAGE_ID).
                                                       trigger('refresh');
                               }
                           }
                       }
                   },
                   {
                       elementId:
                           ctwl.CONTROLNODE_PEERS_GRID_VIEW_ID,
                       title: 'Peers',
                       view: "ControlNodePeersGridView",
                       viewPathPrefix:
                           ctwl.CONTROLNODE_VIEWPATH_PREFIX,
                       app: cowc.APP_CONTRAIL_CONTROLLER,
                       viewConfig: viewConfig,
                       tabConfig: {
                           activate: function(event, ui) {
                               if ($('#' + ctwl.CONTROLNODE_PEERS_GRID_ID).data('contrailGrid')) {
                                   $('#' + ctwl.CONTROLNODE_PEERS_GRID_ID).
                                       data('contrailGrid').refreshView();
                               }
                           },
                           renderOnActivate: true
                       }
                   },
                   {
                       elementId: ctwl.CONTROLNODE_ROUTES_GRID_VIEW_ID,
                       title: 'Routes',
                       view: "ControlNodeRoutesFormView",
                       viewPathPrefix:
                           ctwl.CONTROLNODE_VIEWPATH_PREFIX,
                       app: cowc.APP_CONTRAIL_CONTROLLER,
                       viewConfig: viewConfig,
                       tabConfig: {
                           activate: function(event, ui) {
                               if ($('#' + ctwl.CONTROLNODE_ROUTES_RESULTS).data('contrailGrid')) {
                                   $('#' + ctwl.CONTROLNODE_ROUTES_RESULTS).
                                       data('contrailGrid').refreshView();
                               }
                           },
                           renderOnActivate: true
                       }
                   }
                /*{
                       elementId: ctwl.CONTROLNODE_CONSOLE_LOGS_VIEW_ID,
                       title: 'Console',
                       view: "NodeConsoleLogsView",
                       viewConfig: {}
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
