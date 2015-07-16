/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var ProjectTabView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;

            cowu.renderView4Config(self.$el, null, getProjectViewConfig(viewConfig));
        }

    });

    var getProjectViewConfig = function (viewConfig) {
        var projectFQN = viewConfig['projectFQN'],
            projectUUID = viewConfig['projectUUID'];

        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_PROJECT_VIEW_ID, '-section']),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECT_TABS_ID,
                                view: "TabsView",
                                viewConfig: {
                                    theme: 'classic',
                                    activate: function (e, ui) {
                                        var selTab = $(ui.newTab.context).text();
                                        if (selTab == ctwl.TITLE_PORT_DISTRIBUTION) {
                                            $('#' + ctwl.PROJECT_PORTS_SCATTER_CHART_ID).trigger('refresh');
                                        } else if (selTab == ctwl.TITLE_NETWORKS) {
                                            $('#' + ctwl.PROJECT_NETWORK_GRID_ID).data('contrailGrid').refreshView();
                                        } else if (selTab == ctwl.TITLE_INSTANCES) {
                                            $('#' + ctwl.PROJECT_INSTANCE_GRID_ID).data('contrailGrid').refreshView();
                                        }
                                    },
                                    tabs: [
                                        {
                                            elementId: ctwl.PROJECT_NETWORKS_ID,
                                            title: ctwl.TITLE_NETWORKS,
                                            view: "NetworkGridView",
                                            app: cowc.APP_CONTRAIL_CONTROLLER,
                                            viewConfig: {
                                                projectFQN: projectFQN,
                                                parentType: 'project'
                                            }
                                        },
                                        {
                                            elementId: ctwl.PROJECT_INSTANCES_ID,
                                            title: ctwl.TITLE_INSTANCES,
                                            view: "InstanceGridView",
                                            app: cowc.APP_CONTRAIL_CONTROLLER,
                                            viewConfig: {
                                                parentUUID: projectUUID,
                                                parentType: ctwc.TYPE_PROJECT
                                            }
                                        },
                                        {
                                            elementId: ctwl.PROJECT_PORTS_SCATTER_CHART_ID,
                                            title: ctwl.TITLE_PORT_DISTRIBUTION,
                                            view: "ZoomScatterChartView",
                                            viewConfig: {
                                                modelConfig: {
                                                    remote: {
                                                        ajaxConfig: {
                                                            url: ctwc.get(ctwc.URL_NETWORK_PORT_DISTRIBUTION, projectFQN),
                                                            type: 'GET'
                                                        },
                                                        dataParser: function (response) {
                                                            return nmwp.parseProject4PortDistribution(response, projectFQN);
                                                        }
                                                    },
                                                    cacheConfig: {
                                                        ucid: ctwc.get(ctwc.UCID_PROJECT_VN_PORT_STATS_LIST, projectFQN)
                                                    }
                                                },
                                                chartOptions: nmwvc.getPortDistChartOptions()
                                            }
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

    return ProjectTabView;
});
