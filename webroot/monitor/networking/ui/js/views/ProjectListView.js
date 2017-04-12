/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var ProjectListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig,
                contrailListModel = new ContrailListModel(getProjectListModelConfig());

            self.renderView4Config(self.$el, contrailListModel, getProjectListViewConfig());
        }
    });

    function getProjectListModelConfig() {
        return {
            remote: {
                ajaxConfig: {
                        url: ctwc.getProjectsURL({name:
                                                 contrail.getCookie(cowc.COOKIE_DOMAIN)}, {getProjectsFromIdentity: true}),
                        type: 'GET'
                },
                hlRemoteConfig: nmwgc.getProjectDetailsHLazyRemoteConfig(),
                    dataParser: nmwp.projectDataParser
            },
            cacheConfig: {
                ucid: ctwc.UCID_COOKIE_DOMAIN_PROJECT_LIST
            }
        };
    };

    function getProjectListViewConfig() {
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
                                view: "ZoomScatterChartView",
                                viewConfig: {
                                    loadChartInChunks: true,
                                    chartOptions: {
                                        xLabel: 'Interfaces',
                                        yLabel: 'Networks',
                                        forceX: [0, 10],
                                        forceY: [0, 10],
                                        dataParser: function (response) {
                                            return response;
                                        },
                                        xLabelFormat: d3.format(".01f"),
                                        tooltipConfigCB: getProjectTooltipConfig,
                                        clickCB: onScatterChartClick,
                                        sizeFieldName: 'throughput',
                                        noDataMessage: "No project available."
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
                                viewPathPrefix: "monitor/networking/ui/js/views/",
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
        ctwu.setProjectURLHashParams(null, projectFQN, true);
    };

    var getProjectTooltipConfig = function(data) {
        var projectFQNObj = data.name.split(':');

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
