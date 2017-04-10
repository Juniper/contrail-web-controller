/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var ProjectTabView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;

            this.renderView4Config(self.$el, null, getProjectViewConfig(viewConfig));
        }
    });

    var getProjectViewConfig = function (viewConfig) {
        var projectFQN = viewConfig['projectFQN'],
            projectUUID = viewConfig['projectUUID'];

        return {
            elementId: ctwl.PROJECT_TABS_ID,
            view: "TabsView",
            viewConfig: {
                theme: 'classic',
                tabs: [
                    {
                        elementId: ctwl.PROJECT_NETWORKS_ID,
                        title: ctwl.TITLE_NETWORKS,
                        view: "NetworkGridView",
                        viewPathPrefix: "monitor/networking/ui/js/views/",
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        tabConfig: {
                            activate: function(event, ui) {
                                if ($('#' + ctwl.PROJECT_NETWORK_GRID_ID).data('contrailGrid')) {
                                    $('#' + ctwl.PROJECT_NETWORK_GRID_ID).data('contrailGrid').refreshView();
                                }
                            }
                        },
                        viewConfig: {
                            projectFQN: projectFQN,
                            parentType: 'project'
                        }
                    },
                    {
                        elementId: ctwl.PROJECT_INSTANCES_ID,
                        title: ctwl.TITLE_INSTANCES,
                        view: "InstanceGridView",
                        viewPathPrefix: "monitor/networking/ui/js/views/",
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        tabConfig: {
                            activate: function(event, ui) {
                                if ($('#' + ctwl.PROJECT_INSTANCE_GRID_ID).data('contrailGrid')) {
                                    $('#' + ctwl.PROJECT_INSTANCE_GRID_ID).data('contrailGrid').refreshView();
                                }
                            },
                            renderOnActivate: true
                        },
                        viewConfig: {
                            parentUUID: projectUUID,
                            parentFQN: projectFQN,
                            parentType: ctwc.TYPE_PROJECT
                        }
                    },
                    {
                        elementId: ctwl.PROJECT_INTERFACES_ID,
                        title: ctwl.TITLE_INTERFACES,
                        view: "InterfaceGridView",
                        viewPathPrefix: "monitor/networking/ui/js/views/",
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        tabConfig: {
                            activate: function(event, ui) {
                                if ($('#' + ctwl.PROJECT_INTERFACE_GRID_ID).data('contrailGrid')) {
                                    $('#' + ctwl.PROJECT_INTERFACE_GRID_ID).data('contrailGrid').refreshView();
                                }
                            },
                            renderOnActivate: true
                        },
                        viewConfig: {
                            parentType: ctwc.TYPE_PROJECT,
                            projectFQN: projectFQN,
                            projectUUID: projectUUID,
                            elementId: ctwl.PROJECT_INTERFACE_GRID_ID
                        }
                    },
                    {
                        elementId: ctwl.PROJECT_PORTS_SCATTER_CHART_ID,
                        title: ctwl.TITLE_PORT_DISTRIBUTION,
                        view: "ZoomScatterChartView",
                        tabConfig: {
                            activate: function(event, ui) {
                                $('#' + ctwl.PROJECT_PORTS_SCATTER_CHART_ID).trigger('refresh');
                            },
                            renderOnActivate: true,
                            visible: cowu.isAdmin()
                        },
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
                            chartOptions: ctwvc.getPortDistChartOptions()
                        }
                    }
                ]
            }
        };
    };

    return ProjectTabView;
});
