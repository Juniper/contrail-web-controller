/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var InstanceListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig,
                networkSelectedValueData = viewConfig.networkSelectedValueData,
                domainFQN = contrail.getCookie(cowc.COOKIE_DOMAIN),
                projectSelectedValueData = $('#' + ctwl.PROJECTS_BREADCRUMB_DROPDOWN).data('contrailDropdown').getSelectedData()[0],
                projectUUID = (projectSelectedValueData.value === 'all') ? null : projectSelectedValueData.value,
                projectFQN = (projectSelectedValueData.value === 'all') ? null : domainFQN + ':' + projectSelectedValueData.name,
                contrailListModel;

            if(projectUUID != null) {
                var networkUUID = (networkSelectedValueData.value === 'all') ? null : networkSelectedValueData.value,
                    networkFQN = (networkSelectedValueData.value === 'all') ? null : projectFQN + ':' + networkSelectedValueData.name,
                    parentUUID = (networkUUID == null) ? projectUUID : networkUUID,
                    parentFQN = (networkUUID == null) ? projectFQN : networkFQN,
                    parentType = (networkUUID == null) ? ctwc.TYPE_PROJECT : ctwc.TYPE_VN,
                    parentHashtype = (networkUUID == null) ? ctwc.TYPE_PROJECT : ctwc.TYPE_NETWORK,
                    extendedHashOb = {};

                contrailListModel = new ContrailListModel(getInstanceListModelConfig(parentUUID, parentType));

                self.renderView4Config(self.$el, contrailListModel, getInstanceListViewConfig());
                extendedHashOb[parentHashtype] = parentFQN;
                ctwu.setNetwork4InstanceListURLHashParams(extendedHashOb);

            } else {
                contrailListModel = new ContrailListModel(getInstanceListModelConfig(null, null));

                self.renderView4Config(self.$el, contrailListModel, getInstanceListViewConfig());
                ctwu.setNetwork4InstanceListURLHashParams({});
            }
        }
    });

    function getInstanceListModelConfig(parentUUID, parentType) {
        var ajaxConfig = {
            url: parentUUID != null ? ctwc.get(ctwc.URL_PROJECT_INSTANCES_IN_CHUNKS, parentUUID, 10, 100, parentType, $.now()) : ctwc.get(ctwc.URL_INSTANCE_DETAILS_IN_CHUNKS, 10, 250, $.now()),
            type: 'POST',
            data: JSON.stringify({
                data: [{"type": ctwc.TYPE_VIRTUAL_MACHINE, "cfilt": ctwc.FILTERS_COLUMN_VM.join(',')}]
            })
        };

        return {
            remote: {
                ajaxConfig: ajaxConfig,
                dataParser: ctwp.instanceDataParser
            },
            vlRemoteConfig: {
                vlRemoteList: ctwgc.getVMDetailsLazyRemoteConfig(ctwc.TYPE_VIRTUAL_MACHINE)
            },
            cacheConfig : {
                ucid: (parentUUID != null) ? (ctwc.UCID_PREFIX_MN_LISTS + parentUUID + ":" + 'virtual-machines') : ctwc.UCID_ALL_VM_LIST
            }
        };
    }

    function getInstanceListViewConfig() {
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
                                view: "ZoomScatterChartView",
                                viewConfig: {
                                    loadChartInChunks: true,
                                    chartOptions: {
                                        xLabel: 'CPU Utilization (%)',
                                        yLabel: 'Memory Usage',
                                        forceX: [0, 1],
                                        forceY: [0, 1000],
                                        dataParser: function (response) {
                                            return response;
                                        },
                                        yLabelFormat: function(yValue) {
                                            var formattedValue = formatBytes(yValue * 1024, true);
                                            return formattedValue;
                                        },
                                        xLabelFormat: d3.format(".01f"),
                                        tooltipConfigCB: getInstanceTooltipConfig,
                                        clickCB: onScatterChartClick,
                                        sizeFieldName: 'throughput',
                                        margin: {left: 60},
                                        noDataMessage: "No virtual machine available."
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
                                viewPathPrefix: "monitor/networking/ui/js/views/",
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
            networkFQN = chartConfig['vnFQN'],
            vmName = chartConfig['vmName'];

        if (contrail.checkIfExist(networkFQN) && !ctwu.isServiceVN(networkFQN)) {
            ctwu.setInstanceURLHashParams(null, networkFQN, instanceUUID, vmName, true);
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
        if (contrail.checkIfExist(vnFQN) && !ctwu.isServiceVN(vnFQN)) {
            tooltipConfig['content']['actions'] = [
                {
                    type: 'link',
                    text: 'View',
                    iconClass: 'fa fa-external-link',
                    callback: onScatterChartClick
                }
            ];
        }

        return tooltipConfig;
    };

    return InstanceListView;
});