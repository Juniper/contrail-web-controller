/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view', 'legend-view', 'monitor-infra-confignode-model', 'node-color-mapping'],
        function(_, ContrailView, LegendView, ConfigNodeListModel, NodeColorMapping){
    var ConfigNodeViewConfig = function () {
        var nodeColorMapping = new NodeColorMapping(),
        colorFn = nodeColorMapping.getNodeColorMap,
        configNodeListModel = new ConfigNodeListModel();
        var self = this;
        self.viewConfig = {
            'confignode-percentile-time-size': function (){
                return {
                    modelCfg: monitorInfraUtils.getStatsModelConfig({
                        "table_name": "StatTable.VncApiStatsLog.api_stats",
                        "select": "PERCENTILES(api_stats.response_time_in_usec), PERCENTILES(api_stats.response_size)",
                        "parser": monitorInfraParsers.percentileConfigNodeNodeSummaryChart
                    }),
                    viewCfg: {
                        elementId : ctwl.CONFIGNODE_CHART_PERCENTILE_SECTION_ID,
                        view : "SectionView",
                        viewConfig : {
                            rows : [ {
                                columns : [ {
                                    elementId :ctwl.CONFIGNODE_CHART_PERCENTILE_TEXT_VIEW,
                                    title : ctwl.CONFIG_NODE_RESPONSE_PARAMS_PERCENTILE,
                                    view : "PercentileTextView",
                                    viewPathPrefix:
                                        ctwl.ANALYTICSNODE_VIEWPATH_PREFIX,
                                    app : cowc.APP_CONTRAIL_CONTROLLER,
                                    viewConfig : {
                                        percentileTitle : ctwl.CONFIGNODE_CHART_PERCENTILE_TITLE,
                                        percentileXvalue : ctwl.CONFIGNODE_CHART_PERCENTILE_TIME,
                                        percentileYvalue : ctwl.CONFIGNODE_CHART_PERCENTILE_SIZE,
                                    }
                                }]
                            }]
                        }
                    },
                    itemAttr: {
                        width:0.9,
                        height:0.2,
                        title: ctwl.CONFIG_NODE_RESPONSE_PARAMS_PERCENTILE
                    }
                }
            },
            'confignode-requests-served': function (){
                return {
                    modelCfg: monitorInfraUtils.getStatsModelConfig({
                        table_name: 'StatTable.VncApiStatsLog.api_stats',
                        select: "Source, T, UUID, api_stats.operation_type," +
                            " api_stats.response_time_in_usec, api_stats.response_size," +
                            " api_stats.resp_code, name"
                    }),
                    viewCfg:
                        $.extend(true, {}, monitorInfraConstants.stackChartDefaultViewConfig, {
                            elementId : ctwl.CONFIGNODE_SUMMARY_STACKEDCHART_ID,
                            view: 'StackedAreaChartView',
                            viewConfig: {
                                class: 'col-xs-7 mon-infra-chart chartMargin',
                                chartOptions: {
                                    showControls: false,
                                    colors: colorFn,
                                    title: ctwl.CONFIGNODE_SUMMARY_TITLE,
                                    xAxisLabel: '',
                                    yAxisLabel: 'Requests Served',
                                    groupBy: 'Source',
                                    failureCheckFn: function (d) {
                                        if (parseInt(d['api_stats.resp_code']) != 200) {
                                            return 1;
                                        } else {
                                            return 0;
                                        }
                                    }
                                }
                            }
                        }),
                    itemAttr: {
                        height: 0.9,
                        width: 2,
                        title: ctwl.CONFIG_NODE_REQUESTS_SERVED
                    }
                }
            },
            'confignode-response-time-size': function (){
                return {
                    modelCfg: monitorInfraUtils.getStatsModelConfig({
                        table_name: 'StatTable.VncApiStatsLog.api_stats',
                        select: "Source, T, UUID, api_stats.operation_type," +
                            " api_stats.response_time_in_usec, api_stats.response_size," +
                            " api_stats.resp_code, name"
                    }),
                    viewCfg: {
                        elementId: ctwl.CONFIGNODE_SUMMARY_LINEBARCHART_ID,
                        view: 'LineBarWithFocusChartView',
                        viewConfig: {
                            class: 'col-xs-5 mon-infra-chart',
                            parseFn: cowu.parseLineBarChartWithFocus,
                            chartOptions: {
                                y1AxisLabel:ctwl.RESPONSE_TIME,
                                y2AxisLabel:ctwl.RESPONSE_SIZE,
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
                                colors: colorFn,
                                xFormatter: function (xValue, tickCnt) {
                                    // Same function is called for
                                    // axis ticks and the tool tip
                                    // title
                                    var date = new Date(xValue);
                                    if (tickCnt != null) {
                                        var mins = date.getMinutes();
                                        date.setMinutes(Math.ceil(mins/15) * 15);
                                    }
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
                    itemAttr:{
                        width: 1.2,
                        height: 0.9,
                        title: ctwl.CONFIG_NODE_RESPONSE_TIME_VS_SIZE
                    }
                }
            },
            'confignode-reads-writes-donut-chart': function (){
                return {
                    modelCfg: monitorInfraUtils.getStatsModelConfig({
                        table_name: 'StatTable.VncApiStatsLog.api_stats',
                        select: "Source, T, UUID, api_stats.operation_type," +
                            " api_stats.response_time_in_usec, api_stats.response_size," +
                            " api_stats.resp_code, name"
                    }),
                    viewCfg: {
                        elementId: ctwl.CONFIGNODE_SUMMARY_DONUTCHART_SECTION_ID,
                        view: 'ConfigNodeDonutChartView',
                        viewPathPrefix: ctwl.MONITOR_INFRA_VIEW_PATH,
                        app : cowc.APP_CONTRAIL_CONTROLLER,
                        viewConfig: {
                            class: 'col-xs-5 mon-infra-chart',
                            color: colorFn
                        }
                    },
                    itemAttr: {
                        width: 0.9,
                        height: 0.7,
                        title: ctwl.CONFIG_NODE_REQUESTS_READ_VS_WRITE
                    }
                }
            },
            'confignode-grid-view': function () {
              return {
                  modelCfg: configNodeListModel,
                  viewCfg: {
                      elementId : ctwl.CONFIGNODE_SUMMARY_GRID_ID,
                      title : ctwl.CONFIGNODE_SUMMARY_TITLE,
                      view : "GridView",
                      viewConfig : {
                          elementConfig :
                              getConfigNodeSummaryGridConfig(configNodeListModel, colorFn)
                      }
                  },
                  itemAttr: {
                      width: 2
                  }
              }
            },
            'confignode-top-useragent': function (){
                return {
                    modelCfg: monitorInfraUtils.getStatsModelConfig({
                    table_name: 'StatTable.VncApiStatsLog.api_stats',
                    select: "T=, api_stats.useragent, COUNT(api_stats)"
                    }),
                    viewCfg: {
                        elementId : 'useragent_top_5_section',
                        view : "SectionView",
                        viewConfig : {
                            rows : [ {
                                columns :[
                                     $.extend(true, {}, monitorInfraConstants.stackChartDefaultViewConfig, {
                                         elementId : 'useragent_top_5',
                                         viewConfig: {
                                             chartOptions: {
                                                 colors: cowc.FIVE_NODE_COLOR,
                                                 title: 'Process',
                                                 xAxisLabel: '',
                                                 yAxisLabel: 'Process Wise Usage',
                                                 groupBy: 'api_stats.useragent',
                                                 limit: 5,
                                                 yField: 'COUNT(api_stats)',
                                             }
                                         }
                                     })
                                ]
                            }]
                        }
                    }
                };
            },
            'confignode-top-objecttypes': function (){
                return {
                    modelCfg: monitorInfraUtils.getStatsModelConfig({
                    table_name: 'StatTable.VncApiStatsLog.api_stats',
                    select: "T=, api_stats.object_type, COUNT(api_stats)"
                    }),
                    viewCfg: {
                        elementId : 'objecttype_top_5_section',
                        view : "SectionView",
                        viewConfig : {
                            rows : [ {
                                columns :[
                                     $.extend(true, {}, monitorInfraConstants.stackChartDefaultViewConfig, {
                                         elementId : 'objecttype_top_5',
                                         viewConfig: {
                                             chartOptions: {
                                                 colors: cowc.FIVE_NODE_COLOR,
                                                 title: 'Objects',
                                                 xAxisLabel: '',
                                                 yAxisLabel: 'Object Wise Usage',
                                                 groupBy: 'api_stats.object_type',
                                                 limit: 5,
                                                 yField: 'COUNT(api_stats)',
                                             }
                                         }
                                     })
                                ]
                            }]
                        }
                    }
                };
            },
            'confignode-top-remote-ip': function (){
                return {
                    modelCfg: monitorInfraUtils.getStatsModelConfig({
                        table_name: 'StatTable.VncApiStatsLog.api_stats',
                        select: "T=, api_stats.remote_ip, COUNT(api_stats)"
                    }),
                    viewCfg: {
                        elementId : 'remote_ip_top_5_section',
                        view : "SectionView",
                        viewConfig : {
                            rows : [ {
                                columns :[
                                     $.extend(true, {}, monitorInfraConstants.stackChartDefaultViewConfig, {
                                         elementId : 'remote_ip_top_5',
                                         viewConfig: {
                                             chartOptions: {
                                                 colors: cowc.FIVE_NODE_COLOR,
                                                 title: "Clients",
                                                 xAxisLabel: '',
                                                 yAxisLabel: "Client Wise Usage",
                                                 groupBy: 'api_stats.remote_ip',
                                                 limit: 5,
                                                 yField: 'COUNT(api_stats)',
                                             }
                                         }
                                     })
                                ]
                            }]
                        }
                    }
                };
            },
            'confignode-top-projects': function () {
                return {
                    modelCfg: monitorInfraUtils.getStatsModelConfig({
                        table_name: 'StatTable.VncApiStatsLog.api_stats',
                        select: "T=, api_stats.project_name, COUNT(api_stats)"
                    }),
                    viewCfg: {
                        elementId : 'projects_top_5_section',
                        view : "SectionView",
                        viewConfig : {
                            rows : [ {
                                columns :[
                                     $.extend(true, {}, monitorInfraConstants.stackChartDefaultViewConfig, {
                                         elementId : 'projects_top_5',
                                         viewConfig: {
                                             chartOptions: {
                                                 colors: cowc.FIVE_NODE_COLOR,
                                                 title: "Projects",
                                                 xAxisLabel: '',
                                                 yAxisLabel: "Project Wise Usage",
                                                 groupBy: 'api_stats.project_name',
                                                 limit: 5,
                                                 yField: 'COUNT(api_stats)',
                                             }
                                         }
                                     })
                                ]
                            }]
                        }
                    }
                };
            },
            'confignode-process-cpu-node-mngr': function (colorFn) {
                return {
                    modelCfg: monitorInfraUtils.getStatsModelConfig({
                        table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                        select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                        where: 'process_mem_cpu_usage.__key = contrail-config-nodemgr'
                    }),
                    viewCfg: $.extend(true, {}, monitorInfraConstants.defaultLineChartViewCfg, {
                        elementId : monitorInfraConstants.CONFIGNODE_CPU_SHARE_NODE_MNGR_LINE_CHART_ID,
                        viewConfig: {
                            chartOptions: {
                                yFormatter: d3.format('.2f'),
                                yAxisLabel: 'Node Manager CPU Share (%)',
                                groupBy: 'name',
                                colors: colorFn,
                                yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                title: ctwl.CONFIGNODE_SUMMARY_TITLE,
                            }
                        }
                    })
                };
            },
            'confignode-process-contrail-schema': function () {
                return {
                    modelCfg: monitorInfraUtils.getStatsModelConfig({
                        table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                        select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                        where: 'process_mem_cpu_usage.__key = contrail-schema'
                    }),
                    viewCfg: $.extend(true, {}, monitorInfraConstants.defaultLineChartViewCfg, {
                        elementId : monitorInfraConstants.CONFIGNODE_CPU_SHARE_SCHEMA_LINE_CHART_ID,
                        viewConfig: {
                            chartOptions: {
                                yFormatter: d3.format('.2f'),
                                yAxisLabel: 'Schema CPU Share (%)',
                                groupBy: 'name',
                                colors: colorFn,
                                yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                title: ctwl.CONFIGNODE_SUMMARY_TITLE,
                            }
                        }
                    })
                };
            },
            'confignode-process-contrail-discovery': function () {
                return {
                    modelCfg: monitorInfraUtils.getStatsModelConfig({
                        table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                        select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                        where: 'process_mem_cpu_usage.__key = contrail-discovery:0'
                    }),
                    viewCfg: $.extend(true, {}, monitorInfraConstants.defaultLineChartViewCfg, {
                        elementId : monitorInfraConstants.CONFIGNODE_CPU_SHARE_DISCOVERYLINE_CHART_ID,
                        viewConfig: {
                            chartOptions: {
                                yFormatter: d3.format('.2f'),
                                yAxisLabel: 'Discovery CPU Share (%)',
                                groupBy: 'name',
                                colors: colorFn,
                                yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                title: ctwl.CONFIGNODE_SUMMARY_TITLE,
                            }
                        }
                    })
                };
            },'confignode-process-contrail-api': function () {
                return {
                    modelCfg: monitorInfraUtils.getStatsModelConfig({
                        table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                        select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                        where: 'process_mem_cpu_usage.__key = contrail-api:0'
                    }),
                    viewCfg: $.extend(true, {}, monitorInfraConstants.defaultLineChartViewCfg, {
                        elementId : monitorInfraConstants.CONFIGNODE_CPU_SHARE_API_LINE_CHART_ID,
                        viewConfig: {
                            chartOptions: {
                                yFormatter: d3.format('.2f'),
                                yAxisLabel: 'Api CPU Share (%)',
                                groupBy: 'name',
                                colors: colorFn,
                                yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                title: ctwl.CONFIGNODE_SUMMARY_TITLE,
                            }
                        }
                    })
                };
            },
        };
        function getConfigNodeSummaryGridConfig(model, colorFn) {
            var columns = [
               {
                   field:"name",
                   name:"Host name",
                   formatter:function(r,c,v,cd,dc) {
                      return cellTemplateLinks({
                                      cellText:'name',
                                      name:'name',
                                      statusBubble:true,
                                      rowData:dc,
                                      tagColorMap:colorFn(_.pluck(model.getItems(), 'name'))
                               });
                   },
                   events: {
                      onClick: onClickHostName
                   },
                   cssClass: 'cell-hyperlink-blue',
                   searchFn:function(d) {
                       return d['name'];
                   },
                   minWidth:90,
                   exportConfig: {
                       allow: true,
                       advFormatter: function(dc) {
                           return dc.name;
                       }
                   },
               },
               {
                   field:"ip",
                   name:"IP Address",
                   minWidth:90,
                   formatter:function(r,c,v,cd,dc){
                       return monitorInfraParsers.summaryIpDisplay(dc['ip'],
                                       dc['summaryIps']);
                   },
                   exportConfig: {
                       allow: true,
                       advFormatter: function(dc) {
                           return dc.ip;
                       }
                   },
                   sorter : comparatorIP
               },
               {
                   field:"version",
                   name:"Version",
                   minWidth:90
               },
               {
                   field:"status",
                   name:"Status",
                   formatter:function(r,c,v,cd,dc) {
                       return monitorInfraUtils.getNodeStatusContentForSummayPages(dc,'html');
                   },
                   searchFn:function(dc) {
                       return monitorInfraUtils.getNodeStatusContentForSummayPages(dc,'text');
                   },
                   minWidth:110,
                   exportConfig: {
                       allow: true,
                       advFormatter: function(dc) {
                           return monitorInfraUtils.getNodeStatusContentForSummayPages(dc,'text');
                       }
                   },
                   sortable:{
                       sortBy: function (d) {
                           return monitorInfraUtils.getNodeStatusContentForSummayPages(d,'text');
                       }
                   },
                   sorter:cowu.comparatorStatus
               },
               {
                   field:"cpu",
                   name: ctwl.TITLE_CPU,
                   formatter:function(r,c,v,cd,dc) {
                       return '<div class="gridSparkline display-inline">' +
                               '</div>' +
                              '<span class="display-inline">' +
                              ifNotNumeric(dc['cpu'],'-') + '</span>';
                   },
                   asyncPostRender: renderSparkLines,
                   searchFn:function(d){
                       return d['cpu'];
                   },
                   minWidth:110,
                   exportConfig: {
                       allow: true,
                       advFormatter: function(dc) {
                           return dc.cpu;
                       }
                   }
               },
               {
                   field:"memory",
                   name:"Memory",
                   minWidth:150,
                   sortField:"y"
               },{
                   field:"percentileResponse",
                   id:"percentileTime",
                   sortable:true,
                   name:"95% - Responses",
                   minWidth:200,
                   formatter:function(r,c,v,cd,dc) {
                       return '<span><b>'+"Time "+
                               '</b></span>' +
                              '<span class="display-inline">' +
                              (dc['percentileTime']) + '</span>'+'<span><b>'+", Size "+
                               '</b></span>' +
                              '<span class="display-inline">' +
                              (dc['percentileSize']) + '</span>';
                   }
               }

            ];
            var gridElementConfig = {
                header : {
                    title : {
                        text : ctwl.CONFIGNODE_SUMMARY_TITLE
                    }
                },
                columnHeader : {
                    columns : columns
                },
                body : {
                    options : {
                      detail : false,
                      enableAsyncPostRender:true,
                      checkboxSelectable : false,
                      fixedRowHeight: 30
                    },
                    dataSource : {
                    },
                    statusMessages: {
                        loading: {
                            text: 'Loading Config Nodes..',
                        },
                        empty: {
                            text: 'No Config Nodes Found.'
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
                triggerHashChange: triggerHashChange});

        };
        self.getViewConfig = function(id) {
            return self.viewConfig[id];
        };
};
return ConfigNodeViewConfig;
});