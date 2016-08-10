/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var NetworkListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                domainFQN = contrail.getCookie(cowc.COOKIE_DOMAIN),
                projectSelectedValueData = viewConfig.projectSelectedValueData,
                projectFQN = (projectSelectedValueData.value === 'all') ? null : domainFQN + ':' + projectSelectedValueData.name,
                contrailListModel = new ContrailListModel(getNetworkListModelConfig(projectFQN));

            self.renderView4Config(self.$el, contrailListModel, getNetworkListViewConfig());
            ctwu.setProject4NetworkListURLHashParams(projectFQN);
        }
    });

    function getNetworkListModelConfig(projectFQN) {
        return {
            remote: {
                ajaxConfig: {
                    url: projectFQN != null ? ctwc.get(ctwc.URL_PROJECT_NETWORKS_IN_CHUNKS, 10, 100, projectFQN, $.now()) : ctwc.get(ctwc.URL_NETWORKS_DETAILS_IN_CHUNKS, 10, 100, $.now()),
                    type: "POST",
                    data: JSON.stringify({
                        data: [{
                            "type": ctwc.TYPE_VIRTUAL_NETWORK,
                            "cfilt": ctwc.FILTERS_COLUMN_VN.join(',')
                        }]
                    })
                },
                dataParser: nmwp.networkDataParser
            },
            vlRemoteConfig: {
                vlRemoteList: nmwgc.getVNDetailsLazyRemoteConfig(ctwc.TYPE_VIRTUAL_NETWORK)
            },
            cacheConfig: {
                ucid: projectFQN != null ? (ctwc.UCID_PREFIX_MN_LISTS + projectFQN + ":virtual-networks") : ctwc.UCID_ALL_VN_LIST
            }
        };
    }

    function getNetworkListViewConfig() {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_NETWORK_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.NETWORKS_PORTS_SCATTER_CHART_ID,
                                title: ctwl.TITLE_NETWORKS,
                                view: "ZoomScatterChartView",
                                viewConfig: {
                                    loadChartInChunks: true,
                                    chartOptions: {
                                        xLabel: 'Interfaces',
                                        yLabel: 'Connected Networks',
                                        forceX: [0, 10],
                                        forceY: [0, 10],
                                        xLabelFormat: d3.format(".01f"),
                                        dataParser: function (response) {
                                            return response;
                                        },
                                        tooltipConfigCB: getNetworkTooltipConfig,
                                        clickCB: onScatterChartClick,
                                        sizeFieldName: 'throughput',
                                        noDataMessage: "No virtual network available."
                                    }
                                }
                            },
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECT_NETWORKS_ID,
                                title: ctwl.TITLE_NETWORKS,
                                view: "NetworkGridView",
                                viewPathPrefix: "monitor/networking/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {projectFQN: null, parentType: 'project', pagerOptions: { options: { pageSize: 8, pageSizeSelect: [8, 50, 100] } }}
                            }
                        ]
                    }
                ]
            }
        }
    };

    var onScatterChartClick = function(chartConfig) {
        var networkFQN = chartConfig['name'];
        ctwu.setNetworkURLHashParams(null, networkFQN, true);
    };

    var getNetworkTooltipConfig = function(data) {
        var networkFQNObj = data.name.split(':'),
            info = [],
            actions = [];

        return {
            title: {
                name: networkFQNObj[2],
                type: ctwl.TITLE_GRAPH_ELEMENT_VIRTUAL_NETWORK
            },
            content: {
                iconClass: 'icon-contrail-virtual-network',
                info: [
                    {label: 'Project', value: networkFQNObj[0] + ":" + networkFQNObj[1]},
                    {label:'Instances', value: data.instCnt},
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
            },
            dimension: {
                width: 300
            }
        };
    };

    return NetworkListView;
});