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
                                            chartOptions: {tooltipFn: getProjectTooltipConfig, clickFn: onScatterChartClick},
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

    var onScatterChartClick = function(chartConfig) {
        var projectFQN = chartConfig.name;
        ctwgrc.setProjectURLHashParams(null, projectFQN, true);
    };

    var getProjectTooltipConfig = function(data) {
        var projectFQNObj = data.name.split(':'),
            info = [],
            actions = [];

        return {
            title: {
                name: projectFQNObj[1],
                type: ctwl.TITLE_GRAPH_ELEMENT_VIRTUAL_NETWORK
            },
            content: {
                iconClass: 'icon-contrail-project',
                info: [
                    {label: 'Domain', value: projectFQNObj[0]},
                    {label:'Networks', value: data['y']},
                    {label:'Interfaces', value: data['x']},
                    {label:'Throughput', value:formatThroughput(data['throughput'])}
                ],
                actions: [
                    {
                        type: 'link',
                        text: 'View',
                        iconClass: 'icon-external-link',
                        callback: onScatterChartClick
                    }
                ]
            }
        };
    };

    return ProjectListView;
});