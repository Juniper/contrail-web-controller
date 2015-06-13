/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model'
], function (_, Backbone, ContrailListModel) {
    var FlowListView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig,
                config = viewConfig['config'],
                hashParams = config['hashParams'];

            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: constructReqURL($.extend({}, getURLConfigForGrid(hashParams), {protocol: ['tcp', 'icmp', 'udp']})),
                        type: 'GET'
                    },
                    dataParser: ctwp.flowsDataParser
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
            cowu.renderView4Config(this.$el, contrailListModel, getFlowListViewConfig(hashParams));
        }
    });

    function getFlowListViewConfig(hashParams) {
        var url = constructReqURL($.extend({}, getURLConfigForGrid(hashParams), {protocol: ['tcp', 'icmp', 'udp']}));

        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_FLOW_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.FLOWS_SCATTER_CHART_ID,
                                title: ctwl.TITLE_FLOWS,
                                view: "ScatterChartView",
                                viewConfig: {
                                    class: "port-distribution-chart",
                                    loadChartInChunks: true,
                                    parseFn: function (chartData) {
                                        var portData = constructDataForPortDist(chartData, getURLConfigForGrid(hashParams)),
                                            portTitle = (hashParams['portType'] == 'src') ? ctwl.SOURCE_PORT : ctwl.DESTINATION_PORT,
                                            portRange = [], startPort, endPort,
                                            portDistributionParams = $.deparamURLArgs(url),
                                            valueField, portType,
                                            portType = 'port', flowCntField = 'flowCnt';

                                        if (hashParams['port'].indexOf('-') > -1) {
                                            portRange = hashParams['port'].split("-");
                                            startPort = parseInt(portRange[0]);
                                            endPort = parseInt(portRange[1]);
                                            //TODO pushBreadcrumb([viewConfig['fqName'],portTitle + 's (' + viewConfig['port'] + ')']);
                                        } else {
                                            portRange = [hashParams['port'], hashParams['port']];
                                            //TODO pushBreadcrumb([viewConfig['fqName'],portTitle + ' ' + viewConfig['port']]);
                                        }

                                        portData = $.map(portData, function (currObj, idx) {
                                            if (currObj[portType] >= portRange[0] && currObj[portType] <= parseInt(portRange[1])) {
                                                return currObj;
                                            }
                                            else {
                                                return null;
                                            }
                                        });

                                        portData = tenantNetworkMonitorUtils.parsePortDistribution(portData, $.extend({
                                            startTime: portDistributionParams['startTime'],
                                            endTime: portDistributionParams['endTime'],
                                            bandwidthField: 'bytes',
                                            flowCntField: flowCntField,
                                            portField: 'port',
                                            startPort: startPort,
                                            endPort: endPort
                                        }, {portType: hashParams['portType']}));

                                        var retObj = {
                                            d: [{key: ctwl.SOURCE_PORT, values: portData}],
                                            forceX: [startPort, endPort],
                                            xLblFormat: d3.format(''),
                                            yDataType: 'bytes',
                                            fqName: hashParams['fqName'],
                                            yLbl: ctwl.Y_AXIS_TITLE_BW,
                                            link: {
                                                hashParams: {
                                                    q: {
                                                        view: 'list',
                                                        type: 'network',
                                                        fqName: hashParams['fqName'],
                                                        context: 'domain'
                                                    }
                                                }
                                            },
                                            chartOptions: {
                                                clickFn: onScatterChartClick,
                                                tooltipFn: ctwgrc.getPortDistributionTooltipConfig(onScatterChartClick)
                                            },
                                            title: ctwl.TITLE_PORT_DISTRIBUTION,
                                            xLbl: ctwl.X_AXIS_TITLE_PORT
                                        };

                                        return retObj;
                                    }
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: ctwl.FLOWS_GRID_ID,
                                title: ctwl.TITLE_FLOWS,
                                view: "FlowGridView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    hashParams: hashParams,
                                    pagerOptions: {options: {pageSize: 10, pageSizeSelect: [10, 50, 100]}}
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    function constructDataForPortDist(chartData, obj) {
        var portCF = crossfilter(chartData), portDim, portArr = [], portGroup;

        if (obj['port'].indexOf('-') > -1) {
            var data = {
                portType: obj['portType'],
                minPort: obj['port'].split('-')[0],
                maxPort: obj['port'].split('-')[1],
                data: chartData
            };
            //manageDataSource.setPortRangeData(obj['fqName'], data);
        }

        if (obj['portType'] == 'src') {
            portDim = portCF.dimension(function (d) {
                return d['sport'];
            });
        }
        else {
            portDim = portCF.dimension(function (d) {
                return d['dport'];
            });
        }

        portGroup = portDim.group().reduceSum(function (d) {
            return d['sum_bytes']
        });
        $.each(portGroup.top(Infinity), function (idx, portObj) {
            portDim.filterAll();
            var flowCnt = 0,
                matchedRecords = portDim.filter(portObj['key']).top(Infinity);

            $.each(matchedRecords, function (idx, currPortObj) {
                flowCnt += currPortObj['flow_count'];
            });

            portArr.push({
                port: portObj['key'],
                bytes: portObj['value'],
                flowCnt: flowCnt
            });
        });
        return portArr;
    };

    function getURLConfigForGrid(viewConfig) {
        var urlConfigObj = {
            'container': "#content-container",
            'context': "network",
            'type': "portRangeDetail",
            'startTime': viewConfig['startTime'],
            'endTime': viewConfig['endTime'],
            'fqName': viewConfig['fqName'],
            'port': viewConfig['port'],
            'portType': viewConfig['portType']
        };
        return urlConfigObj;
    };

    var onScatterChartClick = function(chartConfig) {
        var obj = {
            fqName: chartConfig['fqName'],
            port: chartConfig['range']
        };
        if (chartConfig['startTime'] != null && chartConfig['endTime'] != null) {
            obj['startTime'] = chartConfig['startTime'];
            obj['endTime'] = chartConfig['endTime'];
        }

        if (chartConfig['type'] == 'sport')
            obj['portType'] = 'src';
        else if (chartConfig['type'] == 'dport')
            obj['portType'] = 'dst';

        obj['type'] = "flow";
        obj['view'] = "details";
        // dont change the 'p' of hash here as FlowListView is used
        // on multiple pages w/ different hash
        layoutHandler.setURLHashParams(obj, {
            merge: false
        });
    };

    return FlowListView;
});