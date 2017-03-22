/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'contrail-utils',
    'core-basedir/reports/qe/ui/js/common/qe.utils'
], function (_, ContrailView, ContrailListModel, coUtils, qeUtils) {
    var NetworkListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                projectSelectedValueData = viewConfig.projectSelectedValueData,
                projectFQN = (projectSelectedValueData.value === 'all') ? null : 
                    coUtils.getCurrentProjectFQN().join(":"),
                projectUUID = (projectSelectedValueData.value === 'all') ? null :
                    coUtils.getCurrentProjectId(),
                contrailListModel = new ContrailListModel(getNetworkListModelConfig(projectFQN,
                                                                                    projectUUID));

            self.renderView4Config(self.$el, contrailListModel,
                                   getNetworkListViewConfig(projectFQN, projectUUID));
            ctwu.setProject4NetworkListURLHashParams(projectFQN);
        }
    });

    function updateNetworkModel (contrailListModel, parentListModelArray) {
        var fqnList = contrailListModel.getItems();
        var detailsList = parentListModelArray[0].getItems();
        var uniqList = nmwu.getUniqElements(detailsList, fqnList, "name");
        parentListModelArray[0].addData(uniqList);
    }

    function getNetworkListModelConfig(parentFQN, parentUUID) {
        var ajaxConfig = {
            url : ctwc.get(ctwc.URL_GET_VIRTUAL_NETWORKS, 100, 1000, $.now()),
            type: 'POST',
            data: JSON.stringify({
                id: qeUtils.generateQueryUUID(),
                FQN: parentFQN,
                fqnUUID: parentUUID
            })
        };

        return {
            remote: {
                ajaxConfig: ajaxConfig,
                dataParser: nmwp.networkDataParser,
                hlRemoteConfig: {
                    remote: {
                        ajaxConfig: {
                            url: ctwc.get(ctwc.URL_GET_VIRTUAL_NETWORKS_LIST, $.now()),
                            type: 'POST',
                            data: JSON.stringify({
                                reqId: qeUtils.generateQueryUUID(),
                                FQN: parentFQN,
                                fqnUUID: parentUUID
                            })
                        },
                        dataParser: function(vnList) {
                            var retArr = [];
                            var opVNList = vnList.opVNList;
                            var configVNList = vnList.configVNList;
                            var configVNListLen = 0;
                            var tmpOpVNObjs = {};
                            if ((null == opVNList) || (!opVNList.length)) {
                                return retArr;
                            }
                            _.each(opVNList, function(vn) {
                                tmpOpVNObjs[vn] = vn;
                                retArr.push({name: vn, source: "analytics"});
                            });
                            if (!cowu.isNil(configVNList) && !cowu.isNil(configVNList.vnFqnList)) {
                                configVNListLen = configVNList.length;
                            }
                            for (var i = 0; i < configVNListLen; i++) {
                                var vn = configVNList.vnFqnList[i];
                                if (cowu.isNil(tmpOpVNObjs[vn])) {
                                    retArr.push({name: vn, source: "config"});
                                }
                            }
                            return retArr;
                        },
                        completeCallback: function(response, contrailListModel, parentListModelArray) {
                            if (contrail.checkIfExist(parentListModelArray) &&
                                contrail.checkIfFunction(parentListModelArray[0].isRequestInProgress)) {
                                if (parentListModelArray[0].isRequestInProgress()) {
                                    var updateNetworkModelCB = function() {
                                        return updateNetworkModel(contrailListModel, parentListModelArray);
                                    };
                                    parentListModelArray[0].onAllRequestsComplete.subscribe(updateNetworkModelCB);
                                }
                            } else {
                                updateNetworkModel(contrailListModel, parentListModelArray);
                            }
                        }
                    },
                    vlRemoteConfig: {
                        vlRemoteList: nmwgc.getVNStatsVLOfHLRemoteConfig(ctwc.TYPE_VIRTUAL_NETWORK)
                    }
                },
            },
            cacheConfig: {
                ucid: parentFQN != null ? (ctwc.UCID_PREFIX_MN_LISTS + parentFQN + ":virtual-networks") : ctwc.UCID_ALL_VN_LIST
            }
        };
    }

    function getNetworkListViewConfig(projectFQN, projectUUID) {
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
                                viewConfig: {projectFQN: projectFQN, projectUUID: projectUUID,
                                    pagerOptions: { options: { pageSize: 8, pageSizeSelect: [8, 50, 100] } }}
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
