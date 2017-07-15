/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'core-basedir/reports/qe/ui/js/common/qe.utils'
], function (_, ContrailView, ContrailListModel, qewu) {
    var InterfaceListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig,
                networkSelectedValueData = viewConfig.networkSelectedValueData,
                domainFQN = contrail.getCookie(cowc.COOKIE_DOMAIN),
                projectSelectedValueData = $('#' + ctwl.PROJECTS_BREADCRUMB_DROPDOWN).data('contrailDropdown').getSelectedData()[0],
                projectUUID = (projectSelectedValueData.value === 'all') ? null : projectSelectedValueData.value,
                projectFQN = (projectSelectedValueData.value === 'all') ? null : domainFQN + ':' + projectSelectedValueData.name,
                parentFQN = null,
                contrailListModel;

            if(projectUUID != null) {
                var networkUUID = (networkSelectedValueData.value === 'all') ? null : networkSelectedValueData.value,
                    networkFQN = (networkSelectedValueData.value === 'all') ? null : projectFQN + ':' + networkSelectedValueData.name,
                    parentUUID = (networkUUID == null) ? projectUUID : networkUUID,
                    parentFQN = (networkUUID == null) ? projectFQN : networkFQN,

                    parentHashtype = (networkUUID == null) ? ctwc.TYPE_PROJECT : ctwc.TYPE_NETWORK,
                    extendedHashOb = {};

                contrailListModel = new ContrailListModel(nmwvc.getInterfaceListModelConfig(parentUUID,
                                                                                      parentFQN));

                self.renderView4Config(self.$el, contrailListModel, getInterfaceListViewConfig(networkFQN));
                extendedHashOb[parentHashtype] = parentFQN;
                //ctwu.setNetwork4InstanceListURLHashParams(extendedHashOb);

            } else {
                contrailListModel = new ContrailListModel(nmwvc.getInterfaceListModelConfig(null,
                                                                                      parentFQN));

                self.renderView4Config(self.$el, contrailListModel, getInterfaceListViewConfig());
                //ctwu.setNetwork4InstanceListURLHashParams({});
            }
        }
    });

    function updateInterfaceModel (contrailListModel, parentListModelArray) {
        var uuidList = contrailListModel.getItems();
        var detailsList = parentListModelArray[0].getItems();
        var uniqList = nmwu.getUniqElements(detailsList, uuidList, "name");
        parentListModelArray[0].addData(uniqList);
    }
    function getInterfaceListViewConfig(networkFQN) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_INTERFACE_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.INTERFACES_TRAFFIC_THROUGHPUT_CHART_ID,
                                title: ctwl.TITLE_INTERFACES,
                                view: "ZoomScatterChartView",
                                viewConfig: {
                                    loadChartInChunks: true,
                                    chartOptions: {
                                        xLabel: 'Throughput Out',
                                        yLabel: 'Throughput In',
                                        forceX: [0, 1],
                                        forceY: [0, 1000],
                                        xField: 'in_bw_usage',
                                        yField: 'out_bw_usage',
                                        dataParser: function (response) {
                                            return response;
                                        },
                                        yLabelFormat: function(yValue) {
                                            var formattedValue = formatThroughput(yValue, true);
                                            return formattedValue;
                                        },
                                        xLabelFormat: function(xValue) {
                                            var formattedValue = formatThroughput(xValue, true);
                                            return formattedValue;
                                        },
                                        clickCB: function(){},
                                        tooltipConfigCB: getInterfaceTooltipConfig,
                                        margin: {left: 60},
                                        noDataMessage: ctwl.TITLE_NO_INTERFACES_AVAIL
                                    }
                                }
                            },
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECT_INTERFACES_ID,
                                title: ctwl.TITLE_INTERFACES,
                                view: "InterfaceGridView",
                                viewPathPrefix: "monitor/networking/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    parentType: ctwc.TYPE_VIRTUAL_NETWORK,
                                    networkFQN: networkFQN,
                                    elementId: ctwl.INTERFACE_GRID_ID
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    function getInterfaceTooltipConfig (data) {
        var tooltipConfig = {
            title: {
                name: data.ip,
                type: ctwl.TITLE_GRAPH_ELEMENT_INTERFACE
            },
            content: {
                iconClass: 'icon-contrail-virtual-machine-interface-top',
                info: [
                    {label: 'UUID', value: data.uuid},
                    {label: 'MAC Address', value: data.mac_address},
                    {label: 'Instance Name', value: data.vm_name},
                    {label: 'Virtual Network', value: data.virtual_network},
                    {label: 'Total Throughput', value: formatThroughput(data['throughput'])},
                    {label: 'Total Traffic', value: formatBytes(data.inBytes60 + data.outBytes60, false, null, 1)}
                ]
            },
            dimension: {
                width: 400
            }
        };
        return tooltipConfig;
    };

    return InterfaceListView;
});
