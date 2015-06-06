/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model'
], function (_, Backbone, ContrailListModel) {
    var InstanceListView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;

            var ajaxConfig = {
                url: ctwc.get(ctwc.URL_INSTANCE_DETAILS_IN_CHUNKS, 25, $.now()),
                type: 'POST',
                data: JSON.stringify({
                    data: [{"type": ctwc.TYPE_VIRTUAL_MACHINE, "cfilt": ctwc.FILTERS_COLUMN_VM.join(',')}]
                })
            };

            var listModelConfig = {
                remote: {
                    ajaxConfig: ajaxConfig,
                    dataParser: ctwp.instanceDataParser
                },
                vlRemoteConfig: {
                    vlRemoteList: ctwgc.getVMDetailsLazyRemoteConfig(ctwc.TYPE_VIRTUAL_MACHINE)
                },
                cacheConfig : {
                    ucid: ctwc.UCID_ALL_VM_LIST
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
            cowu.renderView4Config(this.$el, contrailListModel, getInstanceListViewConfig());
        }
    });

    var getInstanceListViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCE_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.INSTANCES_CPU_MEM_CHART_ID,
                                title: ctwl.TITLE_INSTANCES,
                                view: "ScatterChartView",
                                viewConfig: {
                                    class: "port-distribution-chart",
                                    loadChartInChunks: true,
                                    parseFn: function (response) {
                                        return {
                                            d: [{key: 'Instances', values: response}],
                                            yLbl: 'Memory Usage',
                                            xLbl: 'CPU Utilization (%)',
                                            forceX: [0, 1],
                                            yLblFormat: function(yValue) {
                                                var formattedValue = formatBytes(yValue * 1024, true);
                                                return formattedValue;
                                            },
                                            xLblFormat: d3.format(".01f"),
                                            chartOptions: {tooltipFn: getInstanceTooltipConfig, clickFn: onScatterChartClick},
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
                                elementId: ctwl.PROJECT_INSTANCES_ID,
                                title: ctwl.TITLE_INSTANCES,
                                view: "InstanceGridView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {pagerOptions: { options: { pageSize: 8, pageSizeSelect: [8, 25, 50, 100] } }}
                            }
                        ]
                    }
                ]
            }
        }
    };

    function onScatterChartClick (chartConfig) {
        var instanceUUID = chartConfig['name'],
            networkFQN = chartConfig['vnFQN'];
        if (contrail.checkIfExist(networkFQN) && !ctwp.isServiceVN(networkFQN)) {
            ctwgrc.setInstanceURLHashParams(null, networkFQN, instanceUUID, true);
        }
    };

    function getInstanceTooltipConfig(data) {
        var vmUUID = data.name,
            vnFQN = data.vnFQN,
            tooltipConfig = {
                title: {
                    name: vmUUID,
                    type: ctwl.TITLE_GRAPH_ELEMENT_VIRTUAL_MACHINE
                },
                content: {
                    iconClass: 'icon-contrail-virtual-machine font-size-30',
                    info: [
                        {label: 'Name', value: data.vmName},
                        {label: 'UUID', value: vmUUID},
                        //{label: 'Network', value: data.vnFQN},
                        {label:'CPU Utilization', value: d3.format('.02f')(data['x']) + " %"},
                        {label:'Memory Usage', value: formatBytes(data['y'] * 1024, false, null, 1)},
                        {label:'Throughput', value:formatThroughput(data['throughput'])}
                    ]
                },
                dimension: {
                    width: 400
                }
            };
        if (contrail.checkIfExist(vnFQN) && !ctwp.isServiceVN(vnFQN)) {
            tooltipConfig['content']['actions'] = [
                {
                    type: 'link',
                    text: 'View',
                    iconClass: 'icon-external-link',
                    callback: onScatterChartClick
                }
            ];
        }

        return tooltipConfig;
    };

    return InstanceListView;
});