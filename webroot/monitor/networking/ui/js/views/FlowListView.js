/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var FlowListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig,
                config = viewConfig['config'],
                hashParams = config['hashParams'];
            var reqUrlParms =
                ctwc.constructReqURLParams($.extend({},
                                                    nmwgc.getURLConfigForFlowGrid(hashParams),
                                                    {protocol:
                                                        ["tcp", "icmp", "udp"]
                                                    })
                                          );
            var postData = {
                async: false,
                formModelAttrs: reqUrlParms.reqParams
            };
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: cowc.URL_QE_QUERY,
                        type: "POST",
                        data: JSON.stringify(postData)
                    },
                    dataParser: nmwp.flowsDataParser
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(this.$el, contrailListModel, getFlowListViewConfig(hashParams));
        }
    });

    function getFlowListViewConfig(hashParams) {
        var url = ctwc.constructReqURL($.extend({}, nmwgc.getURLConfigForFlowGrid(hashParams), {protocol: ['tcp', 'icmp', 'udp']})),
            portRange = [], startPort, endPort;

        if (hashParams['port'].indexOf('-') > -1) {
            portRange = hashParams['port'].split("-");
            startPort = parseInt(portRange[0]);
            endPort = parseInt(portRange[1]);
            //TODO pushBreadcrumb([viewConfig['fqName'],portTitle + 's (' + viewConfig['port'] + ')']);
        } else {
            portRange = [hashParams['port'], hashParams['port']];
            //TODO pushBreadcrumb([viewConfig['fqName'],portTitle + ' ' + viewConfig['port']]);
        }

        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_FLOW_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.FLOWS_SCATTER_CHART_ID,
                                title: ctwl.TITLE_FLOW_SERIES,
                                view: "ZoomScatterChartView",
                                viewConfig: {
                                    loadChartInChunks: true,
                                    chartOptions: {
                                        xLabel: ctwl.X_AXIS_TITLE_PORT,
                                        yLabel: ctwl.Y_AXIS_TITLE_BW,
                                        forceX: [startPort, endPort],
                                        dataParser: function (response) {
                                            var portData = constructDataForPortDist(response, nmwgc.getURLConfigForFlowGrid(hashParams)),
                                                portDistributionParams = cowu.deparamURLArgs(url),
                                                portType = 'port', flowCntField = 'flowCnt',
                                                chartData = [];

                                            portData = $.map(portData, function (currObj, idx) {
                                                if (currObj[portType] >= portRange[0] && currObj[portType] <= parseInt(portRange[1])) {
                                                    return currObj;
                                                } else {
                                                    return null;
                                                }
                                            });

                                            portData = ctwp.parsePortDistribution(portData, $.extend({
                                                startTime: portDistributionParams['startTime'],
                                                endTime: portDistributionParams['endTime'],
                                                bandwidthField: 'bytes',
                                                flowCntField: flowCntField,
                                                portField: 'port',
                                                startPort: startPort,
                                                endPort: endPort,
                                                ipAddress: hashParams['ip']
                                            }, { portType: hashParams['portType'], fqName: hashParams['fqName']}));

                                            chartData = chartData.concat(portData);
                                            return chartData;
                                        },
                                        tooltipConfigCB: ctwgrc.getPortDistributionTooltipConfig(onScatterChartClick),
                                        clickCB: onScatterChartClick,
                                        xLabelFormat: d3.format(','),
                                        yLabelFormat: function(yValue) {
                                            var formattedValue = formatBytes(yValue, false, null, 1);
                                            return formattedValue;
                                        },
                                        margin: {left: 70}
                                    }
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: ctwl.FLOWS_GRID_ID,
                                title: ctwl.TITLE_FLOW_SERIES,
                                view: "FlowGridView",
                                viewPathPrefix: "monitor/networking/ui/js/views/",
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
            return d["SUM(bytes)"]
        });
        $.each(portGroup.top(Infinity), function (idx, portObj) {
            portDim.filterAll();
            var flowCnt = 0,
                matchedRecords = portDim.filter(portObj['key']).top(Infinity);

            portArr.push({
                port: portObj['key'],
                bytes: portObj['value'],
                flowCnt: flowCnt
            });
        });
        return portArr;
    };

    function onScatterChartClick(chartConfig) {
        var hashParams = {
            fqName: chartConfig['fqName'],
            port: chartConfig['range']
        };
        if (chartConfig['startTime'] != null && chartConfig['endTime'] != null) {
            hashParams['startTime'] = chartConfig['startTime'];
            hashParams['endTime'] = chartConfig['endTime'];
        }

        if (chartConfig['type'] == 'sport')
            hashParams['portType'] = 'src';
        else if (chartConfig['type'] == 'dport')
            hashParams['portType'] = 'dst';

        hashParams['type'] = "flow";
        hashParams['view'] = "details";

        if(contrail.checkIfExist(chartConfig['ipAddress'])) {
            hashParams['ip'] = chartConfig['ipAddress'];
        }

        // dont change the 'p' of hash here as FlowListView is used
        // on multiple pages w/ different hash
        layoutHandler.setURLHashParams(hashParams, { merge: false });
    };

    return FlowListView;
});
