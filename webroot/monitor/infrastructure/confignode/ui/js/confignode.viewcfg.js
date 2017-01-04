/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['lodash', 'contrail-view', 'legend-view', 'monitor-infra-confignode-model', 'node-color-mapping'],
        function(_, ContrailView, LegendView, configNodeListModelCfg, NodeColorMapping){
    var ConfigNodeViewConfig = function () {
        var self = this;
        self.viewConfig = {
            'CONFIGNODE_PERCENTILE_TIME_SIZE_VIEW': {
                elementId: ctwl.CONFIGNODE_CHART_PERCENTILE_TEXT_VIEW,
                title: ctwl.CONFIG_NODE_RESPONSE_PARAMS_PERCENTILE,
                view: "PercentileTextView",
                viewConfig: {
                    percentileTitle: ctwl.CONFIGNODE_CHART_PERCENTILE_TITLE,
                    percentileXvalue: ctwl.CONFIGNODE_CHART_PERCENTILE_TIME,
                    percentileYvalue: ctwl.CONFIGNODE_CHART_PERCENTILE_SIZE,
                }
            },
            'CONFIGNODE_REQUESTS_SERVED_VIEW': {
                elementId: 'confignode_requests_served',
                view: 'StackedAreaChartView',
                viewConfig: {
                    class: 'col-xs-7 mon-infra-chart chartMargin',
                    chartOptions: {
                        showControls: false,
                        title: ctwl.CONFIGNODE_SUMMARY_TITLE,
                        failureLabel: ' Failed Requests (Total)',
                        subTitle: "Requests served per API Server (in 3 mins)",
                        xAxisLabel: '',
                        yAxisLabel: 'Requests Served',
                        groupBy: 'Source',
                        overViewText: true,
                        overviewTextOptions: {
                            label: 'Avg response time',
                            value: '32 ms'
                        },
                        yAxisFormatter: function (d) {
                            return cowu.numberFormatter(d, 0);
                        },
                        failureCheckFn: function (d) {
                            if (parseInt(d['api_stats.resp_code']) != 200) {
                                return 1;
                            } else {
                                return 0;
                            }
                        }
                    }
                }
            },
            'CONFIGNODE_RESPONSE_TIME_SIZE_VIEW': {
                elementId: 'confignode_response_time_size',
                view: 'LineBarWithFocusChartView',
                viewConfig: {
                    class: 'col-xs-5 mon-infra-chart',
                    parseFn: cowu.parseLineBarChartWithFocus,
                    chartOptions: {
                        y1AxisLabel: ctwl.RESPONSE_TIME,
                        y2AxisLabel: ctwl.RESPONSE_SIZE,
                        title: ctwl.CONFIGNODE_SUMMARY_TITLE,
                        xAxisTicksCnt: 8, //In case of time scale for every 15 mins one tick
                        margin: {top: 20, right: 50, bottom: 40, left: 50},
                        axisLabelDistance: -10,
                        y2AxisWidth: 50,
                        focusEnable: false,
                        showLegend: true,
                        xAxisLabel: '',
                        xAxisMaxMin: false,
                        defaultDataStatusMessage: false,
                        insertEmptyBuckets: false,
                        bucketSize: 4,
                        groupBy: 'Source',
                        //Y1 for bar
                        y1Field: 'api_stats.response_time_in_usec',
                        //Y2 for line
                        y2Field: 'api_stats.response_size',
                        y2AxisColor: monitorInfraConstants.CONFIGNODE_RESPONSESIZE_COLOR,
                        y2FieldOperation: 'average',
                        y1FieldOperation: 'average',
                        xFormatter: function (xValue, tickCnt) {
                            // Same function is called for
                            // axis ticks and the tool tip
                            // title
                            var date = new Date(xValue);
                            return d3.time.format('%H:%M')(date);
                        },
                        y1Formatter: function (y1Value) {
                            //Divide by 1000 to convert to milli secs;
                            y1Value = ifNull(y1Value, 0)/1000;
                            var formattedValue = Math.round(y1Value) + ' ms';
                            if (y1Value > 1000){
                                // seconds block
                                formattedValue = Math.round(y1Value/1000);
                                formattedValue = formattedValue + ' secs'
                            } else if (y1Value > 60000) {
                                // minutes block
                                formattedValue = Math.round(y1Value/(60 * 1000))
                                formattedValue = formattedValue + ' mins'
                            }
                            return formattedValue;
                        },
                        y2Formatter: function (y2Value) {
                            var formattedValue = formatBytes(y2Value, true);
                            return formattedValue;
                        },
                        legendView: LegendView,
                    },
                    
                }
            },
            'CONFIGNODE_READS_WRITES_DONUT_CHART': {
                elementId: ctwl.CONFIGNODE_SUMMARY_DONUTCHART_SECTION_ID,
                view: 'ConfigNodeDonutChartView',
                viewPathPrefix: ctwl.MONITOR_INFRA_VIEW_PATH,
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: {
                    class: 'col-xs-5 mon-infra-chart',
                }
            },
            'CONFIGNODE_GRID_VIEW': {
                elementId: ctwl.CONFIGNODE_SUMMARY_GRID_ID,
                title: ctwl.CONFIGNODE_SUMMARY_TITLE,
                view: "GridView",
                viewConfig: {
                    elementConfig:
                        getConfigNodeSummaryGridConfig('confignode-grid-view')
                }
            },
            'CONFIGNODE_TOP_USERAGENT': {
                elementId: 'useragent_top_5',
                view: 'StackedAreaChartView',
                viewConfig: {
                    chartOptions: {
                        colors: cowc.FIVE_NODE_COLOR,
                        subTitle: "API requests per process/client (in 3 mins)",
                        title: 'Process',
                        xAxisLabel: '',
                        yAxisLabel: 'Process Wise Usage',
                        groupBy: 'api_stats.useragent',
                        limit: 5,
                        yField: 'COUNT(api_stats)',
                        showLegend: false,
                        bar: true
                    }
                }
            },
            'CONFIGNODE_TOP_OBJECTTYPES': {
                elementId: 'objecttype_top_5',
                view: 'StackedAreaChartView',
                viewConfig: {
                    elementId: 'objecttype_top_5',
                    view: 'StackedBarChartWithFocusView',
                    viewConfig: {
                        chartOptions: {
                            colors: cowc.FIVE_NODE_COLOR,
                            title: 'Objects',
                            subTitle: "API requests per Config Object type (in 3 mins)",
                            xAxisLabel: '',
                            yAxisLabel: ctwl.CONFIG_NODE_OBJECT_USAGE_TITLE,
                            groupBy: 'api_stats.object_type',
                            limit: 5,
                            yField: 'COUNT(api_stats)',
                            showLegend: false,
                        }
                    }
                }
            },
            'CONFIGNODE_TOP_REMOTE_IP': {
                elementId: 'remote_ip_top_5',
                view: 'StackedBarChartWithFocusView',
                viewConfig: {
                    chartOptions: {
                        colors: cowc.FIVE_NODE_COLOR,
                        title: "Clients",
                        subTitle: "API requests per client [IP:Port] (in 3 mins)",
                        xAxisLabel: '',
                        yAxisLabel: "Client Wise Usage",
                        groupBy: 'api_stats.remote_ip',
                        limit: 5,
                        yField: 'COUNT(api_stats)',
                        showLegend: false,
                    }
                }
            },
            'CONFIGNODE_TOP_PROJECTS': {
                elementId: 'projects_top_5',
                view: 'StackedBarChartWithFocusView',
                viewConfig: {
                    chartOptions: {
                        colors: cowc.FIVE_NODE_COLOR,
                        title: "Projects",
                        subTitle: "API requests per project (in 3 mins)",
                        xAxisLabel: '',
                        yAxisLabel: "Project Wise Usage",
                        groupBy: 'api_stats.project_name',
                        limit: 5,
                        yField: 'COUNT(api_stats)',
                        showLegend: false,
                    }
                }
              },
              'CONFIGNODE_PROCESS_CONTRAIL_SCHEMA': {
                elementId: monitorInfraConstants.CONFIGNODE_CPU_SHARE_SCHEMA_LINE_CHART_ID,
                view: 'LineWithFocusChartView',
                viewConfig: {
                    chartOptions: {
                        yFormatter: d3.format('.2f'),
                        subTitle: ctwl.CPU_SHARE_PERCENTAGE,
                        yAxisLabel: 'Schema CPU Share (%)',
                        groupBy: 'name',
                        yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                        title: ctwl.CONFIGNODE_SUMMARY_TITLE,
                    }
                }
            },
            'CONFIGNODE_PROCESS_CONTRAIL_DISCOVERY': {
                elementId: monitorInfraConstants.CONFIGNODE_CPU_SHARE_DISCOVERYLINE_CHART_ID,
                view: 'LineWithFocusChartView',
                viewConfig: {
                    chartOptions: {
                        yFormatter: d3.format('.2f'),
                        subTitle: ctwl.CPU_SHARE_PERCENTAGE,
                        yAxisLabel: 'Discovery CPU Share (%)',
                        groupBy: 'name',
                        yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                        title: ctwl.CONFIGNODE_SUMMARY_TITLE,
                    }
                }
                
            },
            'CONFIGNODE_PROCESS_CONTRAIL_API': {
                elementId: monitorInfraConstants.CONFIGNODE_CPU_SHARE_API_LINE_CHART_ID,
                view: 'LineWithFocusChartView',
                viewConfig: {
                    chartOptions: {
                        yFormatter: d3.format('.2f'),
                        subTitle: ctwl.CPU_SHARE_PERCENTAGE,
                        yAxisLabel: 'API CPU Share (%)',
                        groupBy: 'name',
                        yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                        title: ctwl.CONFIGNODE_SUMMARY_TITLE,
                    }
                }
            },
            'CONFIGNODE_PROCESS_CONTRAIL_SERVICE_MONITOR': {
                elementId: monitorInfraConstants.CONFIGNODE_CPU_SHARE_SERVICE_MONITOR_LINE_CHART_ID,
                view: 'LineWithFocusChartView',
                viewConfig: {
                    chartOptions: {
                        yFormatter: d3.format('.2f'),
                        subTitle: ctwl.CPU_SHARE_PERCENTAGE,
                        yAxisLabel: ctwl.CONFIG_NODE_SERVICE_MONITOR_CPU_SHARE,
                        groupBy: 'name',
                        yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                        title: ctwl.CONFIGNODE_SUMMARY_TITLE,
                    }
                }
                
            },
            'CONFIGNODE_PROCESS_CONTRAIL_DEVICE_MANAGER': {
                elementId: monitorInfraConstants.CONFIGNODE_CPU_SHARE_DEVICE_MANAGER_LINE_CHART_ID,
                view: 'LineWithFocusChartView',
                viewConfig: {
                    chartOptions: {
                        yFormatter: d3.format('.2f'),
                        subTitle: ctwl.CPU_SHARE_PERCENTAGE,
                        yAxisLabel: ctwl.CONFIG_NODE_DEVICE_MANAGER_CPU_SHARE,
                        groupBy: 'name',
                        yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                        title: ctwl.CONFIGNODE_SUMMARY_TITLE,
                    }
                },
            },
            'CONFIGNODE_PROCESS_IFMAP': {
                elementId: monitorInfraConstants.CONFIGNODE_CPU_SHARE_IFMAP_LINE_CHART_ID,
                view: 'LineWithFocusChartView',
                viewConfig: {
                    chartOptions: {
                        yFormatter: d3.format('.2f'),
                        subTitle: ctwl.CPU_SHARE_PERCENTAGE,
                        yAxisLabel: ctwl.CONFIG_NODE_IFMAP_CPU_SHARE,
                        groupBy: 'name',
                        yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                        title: ctwl.CONFIGNODE_SUMMARY_TITLE,
                    }
                }
            }
        };
        function getConfigNodeSummaryGridConfig(widgetId, colorFn) {
            var columns = [
               {
                   field: "name",
                   name: "Host name",
                   formatter: function(r,c,v,cd,dc) {
                      return cellTemplateLinks({
                                      cellText: 'name',
                                      name: 'name',
                                      statusBubble: true,
                                      rowData: dc,
                                      tagColorMap: colorFn(_.pluck(cowu.getGridItemsForWidgetId(widgetId), 'name'))
                               });
                   },
                   events: {
                      onClick: onClickHostName
                   },
                   cssClass: 'cell-hyperlink-blue',
                   searchFn: function(d) {
                       return d['name'];
                   },
                   minWidth: 90,
                   exportConfig: {
                       allow: true,
                       advFormatter: function(dc) {
                           return dc.name;
                       }
                   },
               },
               {
                   field: "ip",
                   name: "IP Address",
                   minWidth: 90,
                   formatter: function(r,c,v,cd,dc){
                       return monitorInfraParsers.summaryIpDisplay(dc['ip'],
                                       dc['summaryIps']);
                   },
                   exportConfig: {
                       allow: true,
                       advFormatter: function(dc) {
                           return dc.ip;
                       }
                   },
                   sorter: comparatorIP
               },
               {
                   field: "version",
                   name: "Version",
                   minWidth: 90
               },
               {
                   field: "status",
                   name: "Status",
                   formatter: function(r,c,v,cd,dc) {
                       return monitorInfraUtils.getNodeStatusContentForSummayPages(dc,'html');
                   },
                   searchFn: function(dc) {
                       return monitorInfraUtils.getNodeStatusContentForSummayPages(dc,'text');
                   },
                   minWidth: 110,
                   exportConfig: {
                       allow: true,
                       advFormatter: function(dc) {
                           return monitorInfraUtils.getNodeStatusContentForSummayPages(dc,'text');
                       }
                   },
                   sortable: {
                       sortBy: function (d) {
                           return monitorInfraUtils.getNodeStatusContentForSummayPages(d,'text');
                       }
                   },
                   sorter: cowu.comparatorStatus
               },
               {
                   field: "cpu",
                   name: ctwl.TITLE_CPU,
                   formatter: function(r,c,v,cd,dc) {
                       return '<div class="gridSparkline display-inline">' +
                               '</div>' +
                              '<span class="display-inline">' +
                              ifNotNumeric(dc['cpu'],'-') + '</span>';
                   },
                   asyncPostRender: renderSparkLines,
                   searchFn: function(d){
                       return d['cpu'];
                   },
                   minWidth: 110,
                   exportConfig: {
                       allow: true,
                       advFormatter: function(dc) {
                           return dc.cpu;
                       }
                   }
               },
               {
                   field: "memory",
                   name: "Memory",
                   minWidth: 150,
                   sortField: "y"
               },{
                   field: "percentileResponse",
                   id: "percentileTime",
                   sortable: true,
                   name: "95% - Responses",
                   minWidth: 200,
                   formatter: function(r,c,v,cd,dc) {
                       var fomattedPct = "";
                       if(dc && dc.percentileTime && dc.percentileSize) {
                           fomattedPct =  '<span><b>'+"Time "+
                               '</b></span>' +
                              '<span class="display-inline">' +
                              (dc['percentileTime']) + '</span>'+'<span><b>'+", Size "+
                               '</b></span>' +
                              '<span class="display-inline">' +
                              (dc['percentileSize']) + '</span>';
                       }
                       return fomattedPct;
                   }
               }

            ];
            var gridElementConfig = {
                header: {
                    title: {
                        text: ctwl.CONFIGNODE_SUMMARY_TITLE
                    }
                },
                columnHeader: {
                    columns: columns
                },
                body: {
                    options: {
                      detail: false,
                      enableAsyncPostRender: true,
                      checkboxSelectable: false,
                      fixedRowHeight: 30
                    },
                    dataSource: {
                    },
                    statusMessages: {
                        loading: {
                            text: 'Loading Config Nodes..',
                        },
                        empty: {
                            text: 'No Config Nodes Found.'
                        }
                    }
                },footer: {
                    pager: {
                        options: {
                            pageSize: 10,
                        }
                    }
                }
            };
            return gridElementConfig;
        }
        function onClickHostName(e, selRowDataItem) {
            var name = selRowDataItem.name, hashParams = null,
                triggerHashChange = true, hostName;
            hostName = selRowDataItem['name'];
            var hashObj = {
                    type: "configNode",
                    view: "details",
                    focusedElement: {
                        node: name,
                        tab: 'details'
                    }
                };
            if(contrail.checkIfKeyExistInObject(true, hashParams,
                        'clickedElement')) {
                hashObj.clickedElement = hashParams.clickedElement;
            }

            layoutHandler.setURLHashParams(hashObj, {
                p: "mon_infra_config",
                merge: false,
                triggerHashChange: triggerHashChange
            })
        }
        self.getViewConfig = function(id) {
            return self.viewConfig[id];
        };
    };
    return (new ConfigNodeViewConfig()).viewConfig;
});
