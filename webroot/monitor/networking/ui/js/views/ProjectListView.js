/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model'
], function (_, Backbone, ContrailListModel) {
    var ProjectListView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;

            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: networkPopulateFns.getProjectsURL(ctwc.DEFAULT_DOMAIN),
                        type: 'GET'
                    },
                    hlRemoteConfig: ctwgc.getProjectDetailsHLazyRemoteConfig(),
                    dataParser: ctwp.projectDataParser
                },
                cacheConfig: {
                    ucid: ctwc.UCID_DEFAULT_DOMAIN_PROJECT_LIST //TODO: Handle multi-tenancy
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
            cowu.renderView4Config(this.$el, contrailListModel, getProjectListViewConfig());
        }
    });

    var getProjectListViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_PROJECT_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECTS_SCATTER_CHART_ID,
                                title: ctwl.TITLE_PROJECTS,
                                view: "ScatterChartView",
                                viewConfig: {
                                    class: "port-distribution-chart",
                                    loadChartInChunks: true,
                                    parseFn: function (response) {
                                        return {
                                            d: [{
                                                key: 'Projects',
                                                values: response
                                            }],
                                            xLbl: 'Interfaces',
                                            yLbl: 'Networks',
                                            forceX: [0, 5],
                                            forceY: [0, 10],
                                            link: {
                                                hashParams: {
                                                    q: {
                                                        view: 'details',
                                                        type: 'project',
                                                        source: 'uve'
                                                    }
                                                },
                                                conf: {p: 'mon_networking_project', merge: false}
                                            },
                                            chartOptions: {tooltipFn: tenantNetworkMonitor.projectTooltipFn, clickFn: onScatterChartClick},
                                            hideLoadingIcon: false
                                        }
                                    }
                                }
                            },
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECTS_ID,
                                title: ctwl.TITLE_PROJECTS,
                                view: "ProjectGridView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {pagerOptions: { options: { pageSize: 10, pageSizeSelect: [10, 50, 100] } }}
                            }
                        ]
                    }
                ]
            }
        }
    };

    function onScatterChartClick(chartConfig) {
        var projectFQN = chartConfig['name'];

        ctwgrc.setProjectURLHashParams(null, projectFQN, true);
    };

    return ProjectListView;
});