/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "underscore",
    "contrail-view",
    "contrail-list-model",
    "core-basedir/reports/qe/ui/js/common/qe.utils"
], function (_, ContrailView, ContrailListModel, qeUtils) {
    var ProjectListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig,
                contrailListModel = new ContrailListModel(getProjectListModelConfig(viewConfig));

            self.renderView4Config(self.$el, contrailListModel, getProjectListViewConfig(viewConfig));
        }
    });

    function getProjectListModelConfig(viewConfig) {
        var selectedDomain = cowu.getValueByJsonPath(viewConfig, 'selectedDomain');
        return {
            remote: {
                ajaxConfig: {
                    url: ctwc.URL_ALL_PROJECTS +
                    "?domainId=" + selectedDomain.value,
                    type: 'GET'
                },
                dataParser: nmwp.projectDataParser,
                hlRemoteConfig: nmwgc.getProjectDetailsHLazyRemoteConfig()
            },
            cacheConfig: {
                ucid: ctwc.UCID_COOKIE_DOMAIN_PROJECT_LIST
            }
        };
    };

    function getProjectListViewConfig(viewConfig) {
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
                                viewConfig: $.extend(viewConfig, {pagerOptions: { options: { pageSize: 10, pageSizeSelect: [10, 50, 100] } }})
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
                        iconClass: 'fa fa-external-link',
                        callback: onScatterChartClick
                    }
                ]
            }
        };
    };

    return ProjectListView;
});
