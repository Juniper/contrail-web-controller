/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model',
    'controller-basedir/monitor/networking/ui/js/views/BreadcrumbView'
], function (_, Backbone, ContrailListModel, BreadcrumbView) {
    var ProjectListView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig,
                hashParams = viewConfig.hashParams,
                fqName = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.fqName') ? hashParams.focusedElement.fqName : null),
                breadcrumbView = new BreadcrumbView();

            breadcrumbView.renderDomainBreadcrumbDropdown(fqName, function (selectedValueData, domainBreadcrumbChanged) {
                var contrailListModel = new ContrailListModel(getProjectListModelConfig());
                cowu.renderView4Config(self.$el, contrailListModel, getProjectListViewConfig());
            });
        }
    });

    function getProjectListModelConfig() {
        return {
            remote: {
                ajaxConfig: {
                    url: ctwc.getProjectsURL(ctwc.DEFAULT_DOMAIN),
                        type: 'GET'
                },
                hlRemoteConfig: nmwgc.getProjectDetailsHLazyRemoteConfig(),
                    dataParser: nmwp.projectDataParser
            },
            cacheConfig: {
                ucid: ctwc.UCID_DEFAULT_DOMAIN_PROJECT_LIST //TODO: Handle multi-tenancy
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
                                        forceX: [0, 5],
                                        forceY: [0, 10],
                                        dataParser: function (response) {
                                            return response;
                                        },
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
        nmwgrc.setProjectURLHashParams(null, projectFQN, true);
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