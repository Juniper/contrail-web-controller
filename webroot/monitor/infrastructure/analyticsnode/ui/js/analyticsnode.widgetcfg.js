/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view', 'legend-view', 'monitor-infra-analyticsnode-model', 'node-color-mapping'],
        function(_, ContrailView, LegendView, analyticsNodeListModelCfg, NodeColorMapping){
    var AnalyticsNodeViewConfig = function () {
        var self = this;
        self.viewConfig = {
            'analyticsnode-percentile-count-size': {
                baseModel:'ANALYTICSNODE_PERCENTILE_MODEL',
                modelCfg: {
                },
                viewCfg: {
                    elementId : ctwl.ANALYTICS_CHART_PERCENTILE_SECTION_ID,
                    view : "PercentileTextView",
                    viewConfig : {
                        percentileTitle : ctwl.ANALYTICSNODE_CHART_PERCENTILE_TITLE,
                        percentileXvalue : ctwl.ANALYTICSNODE_CHART_PERCENTILE_COUNT,
                        percentileYvalue : ctwl.ANALYTICSNODE_CHART_PERCENTILE_SIZE,
                    }
                },
                itemAttr: {
                    height: 0.3,
                    width: 0.98,
                    title: ctwl.ANALYTICS_NODE_MESSAGE_PARAMS_PERCENTILE
                }
            },
            'analyticsnode-sandesh-message-info': {
                baseModel:'ANALYTICSNODE_SANDESH_MSG_MODEL',
                modelCfg: {
                },
                viewCfg: {
                    elementId : ctwl.ANALYTICS_CHART_SANDESH_STACKEDBARCHART_ID,
                    view: 'StackedAreaChartView',
                    viewConfig: {
                        chartOptions: {
                            title: 'Analytics Messages',
                            subTitle:"Messages received per Collector (in 3 mins)",
                            xAxisLabel: '',
                            yAxisLabel: ctwl.ANALYTICS_CHART_SANDESH_LABEL,
                            //yAxisLabel: '',
                            groupBy: 'Source',
                            yField: 'SUM(msg_info.messages)',
                            overViewText: false,
                            overviewTextOptions: {
                                label: 'Avg Size',
                                value: '200',
                                key: 'AVG(msg_info.bytes)',
                                operator: 'average',
                                formatter: function (d) {
                                    return formatBytes(d , true);
                                }
                            },
                            margin: {
                                left: 40,
                                top: 15,
                                right: 10,
                                bottom: 20
                            },
                        }
                    }
                },
                itemAttr: {
                    height: 1.2,
                    title: ctwl.ANALYTICS_NODE_SANDESH_MESSAGE_DISTRIBUTION
                }
            },
            'analyticsnode-query-stats': {
                baseModel:'ANALYTICSNODE_QUERYSTATS_MODEL',
                modelCfg: {
                },
                viewCfg: {
                    elementId : ctwl.ANALYTICS_CHART_QUERIES_STACKEDBARCHART_ID,
                    view:'StackedBarChartWithFocusView',
                    viewConfig: {
                        chartOptions: {
                            title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                            subTitle:"Queries per Collector (in 3 mins)",
                            xAxisLabel: '',
                            yAxisLabel: ctwl.ANALYTICS_CHART_QUERIES_LABEL,
                            yField: 'COUNT(query_stats)',
                            groupBy: 'Source',
                            margin: {
                                left: 40,
                                top: 5,
                                right: 15,
                                bottom: 50
                            },
                            //bar: true,
                            /*failureCheckFn: function (d) {
                                if (d['query_stats.error'] != "None") {
                                    return 1;
                                } else {
                                    return 0;
                                }
                            },*/
                        }
                    }
                },
                itemAttr: {
                    width: 1/3,
                    height: 0.9,
                    title: ctwl.ANALYTICS_NODE_QUERY_DISTRIBUTION
                }
            },
            'analyticsnode-system-cpu-share': {
                baseModel: 'SYSTEM_CPU_MODEL',
                baseView: 'SYSTEM_CPU_SHARE_VIEW',
                modelCfg : {
                    type: 'analyticsNode',
                    modelId: 'ANALYTICSNODE_SYSTEM_CPU_MODEL',
                    config: {
                        where:'node-type = analytics-node'
                    }
                },
                itemAttr: {
                    width: 1/2,
                }
            },
            'analyticsnode-system-memory-usage': {
                baseModel: 'SYSTEM_MEMORY_MODEL',
                baseView:'SYSTEM_MEMORY_USAGE_VIEW',
                modelCfg : {
                    type: 'analyticsNode',
                    modelId: 'ANALYTICSNODE_SYSTEM_MEMORY_MODEL',
                    config: {
                        where:'node-type = analytics-node'
                    }
                },
                itemAttr: {
                    width: 1/2,
                }
            },
            'analyticsnode-disk-usage-info': {
                baseModel:'SYSTEM_DISK_USAGE_MODEL',
                baseView:'SYSTEM_DISK_USAGE_VIEW',
                modelCfg : {
                    type: 'analyticsNode',
                    modelId: 'ANALYTICSNODE_DISK_USAGE_MODEL',
                    config: {
                        where:'node-type = analytics-node'
                    }
                },
                itemAttr: {
                    width: 1/2,
                }
            },
            'analyticsnode-generators-scatterchart': {
                    baseModel:'ANALYTICSNODE_GENERATORS_MODEL',
                    modelCfg: {
                    },
                    viewCfg:{
                        elementId : 'generatorsScatterChart',
                        view:'ZoomScatterChartView',
                        viewConfig: {
                            chartOptions: {
                                xLabelFormat: function(x) {return $.isNumeric(x) ? x : NaN;},
                                xLabel: 'Bytes (KB)/ min',
                                yLabel: 'Generators Messages / min',
                                subtitle:'Messages / Bytes sent per min',
                                xTickCount:5,
                                yTickCount:5,
                               // sizeField: 'size',
                                doBucketize:false,
                                tooltipConfigCB: function(currObj,format) {
                                    var options = {};
                                    var nodes = currObj;
                                    options['tooltipContents'] = [
                                          {label:'', value: nodes.label},
                                          {label:nodes.label, value: ''},
                                          {label:'Messages', value:$.isNumeric(currObj['y']) ? parseInt(currObj['y'])  : currObj['y']},
                                          {label:'Bytes(KB)', value:Math.round(currObj['x'])}
                                      ];
                                    return monitorInfraUtils.getDefaultGeneratorScatterChartTooltipFn(currObj,options);
                                },
                            }
                        }
                    },
                    itemAttr: {
                        width: 1/3,
                        height: 0.9,
                        title: ctwl.ANALYTICS_NODE_GENERATORS
                    }
            },
            'analyticsnode-database-read-write': {
                    baseModel:'ANALYTICSNODE_DB_READWRITE_MODEL',
                    modelCfg: {
                    },
                    viewCfg: {
                        elementId : ctwl.ANALYTICS_CHART_DATABASE_WRITE_STACKEDBARCHART_ID,
                        view:'StackedBarChartWithFocusView',
                        viewConfig: {
                            chartOptions: {
                                title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                                subTitle:"Writes per Collector (in 3 mins)",
                                xAxisLabel: '',
                                //bar: true,
                                yAxisLabel: ctwl.ANALYTICS_CHART_DATABASE_WRITE_LABEL,
                                groupBy: 'Source',
                                failureCheckFn: function (d) {
                                    return d[ctwl.ANALYTICS_CHART_DATABASE_WRITE_FAILS];
                                },
                                yField: ctwl.ANALYTICS_CHART_DATABASE_WRITE,
                                margin: {
                                    left: 45,
                                    top: 5,
                                    right: 15,
                                    bottom: 50
                                },
                            }
                        }
                    },
                    itemAttr: {
                        width: 1/3,
                        height: 0.9,
                        title: ctwl.ANALYTICS_NODE_DB_READ_WRITE
                    }
            },
            'analyticsnode-top-messagetype': {
                    modelCfg: {
                        modelId:'ANALYTICSNODE_MESSAGETYPE_MODEL',
                        type: 'analyticsNode',
                        source: 'STATTABLE',
                        config: {
                            table_name: 'StatTable.SandeshMessageStat.msg_info',
                            select: 'T=, msg_info.type, SUM(msg_info.messages)'
                        }
                    },
                    viewCfg: {
                        elementId : 'message_type_top_5_section',
                        view : "StackedBarChartWithFocusView",
                        viewConfig: {
                            chartOptions: {
                                colors: cowc.FIVE_NODE_COLOR,
                                title: 'Message Types',
                                subTitle:"Messages per Object type (in 3 mins)",
                                xAxisLabel: '',
                                //bar: true,
                                yAxisLabel: ctwl.ANALYTICS_NODE_TOP_MESSAGE_TYPES,
                                groupBy: 'msg_info.type',
                                limit: 5,
                                yField: 'SUM(msg_info.messages)',
                                showLegend: false,
                                margin: {
                                    left: 40,
                                    top: 5,
                                    right: 15,
                                    bottom: 50
                                },
                            }
                        }
                    },itemAttr: {
                        width: 1/2,
                        title: ctwl.ANALYTICS_NODE_TOP_MESSAGE_TYPES
                    }
            },
            'analyticsnode-top-generators': {
                    modelCfg: {
                        modelId:'ANALYTICSNODE_TOP_GENERATORS_MODEL',
                        type: 'analyticsNode',
                        source:'STATTABLE',
                        config: {
                            table_name: 'StatTable.SandeshMessageStat.msg_info',
                            select: 'T=, name, SUM(msg_info.messages)'
                        }
                    },
                    viewCfg: {
                        elementId : 'generator_top_5_section',
                        view : "StackedBarChartWithFocusView",
                        viewConfig: {
                            chartOptions: {
                                colors: cowc.FIVE_NODE_COLOR,
                                title: 'Generators',
                                subTitle:"Messages per Generator (in 3 mins)",
                                xAxisLabel: '',
                                yAxisLabel: ctwl.ANALYTICS_NODE_TOP_GENERATORS,
                                groupBy: 'name',
                                limit: 5,
                                //bar: true,
                                yField: 'SUM(msg_info.messages)',
                                showLegend: false,
                                margin: {
                                    left: 40,
                                    top: 5,
                                    right: 15,
                                    bottom: 50
                                },
                            }
                        }
                    },itemAttr: {
                        title: ctwl.ANALYTICS_NODE_TOP_GENERATORS,
                        width: 1/2
                    }
            },
            'analyticsnode-qe-cpu-share': {
                    modelCfg: {
                        modelId:'ANALYTICSNODE_QE_CPU_MODEL',
                        type: 'analyticsNode',
                        source: 'STATTABLE',
                        config: {
                            table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                            select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                            where: 'process_mem_cpu_usage.__key = contrail-query-engine'
                        }
                    },
                    viewCfg: {
                        elementId : 'analytics_node_qe_cpu_share',
                        view:'LineWithFocusChartView',
                        viewConfig: {
                            chartOptions: {
                                yFormatter: d3.format('.2f'),
                                subTitle:ctwl.CPU_SHARE_PERCENTAGE,
                                yAxisLabel: ctwl.ANALYTICS_NODE_QE_CPU_SHARE,
                                groupBy: 'name',
                                yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                            }
                        }
                    },itemAttr: {
                        title: ctwl.ANALYTICS_NODE_QE_CPU_SHARE,
                        width: 1/2
                    }
            },
            'analyticsnode-collector-cpu-share': {
                    modelCfg: {
                        modelId:'ANALYTICSNODE_COLLECTOR_CPU_MODEL',
                        type: 'analyticsNode',
                        source:'STATTABLE',
                        config: {
                            table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                            select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                            where: 'process_mem_cpu_usage.__key = contrail-collector'
                        }
                    },
                    viewCfg: {
                        elementId : 'analytics_node_node_collector_cpu_share',
                        view: 'LineWithFocusChartView',
                        viewConfig: {
                            chartOptions: {
                                yFormatter: d3.format('.2f'),
                                subTitle:ctwl.CPU_SHARE_PERCENTAGE,
                                yAxisLabel: ctwl.ANALYTICS_NODE_COLLECTOR_CPU_SHARE,
                                groupBy: 'name',
                                yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                            }
                        }
                    },itemAttr: {
                        title: ctwl.ANALYTICS_NODE_COLLECTOR_CPU_SHARE,
                        width: 1/2
                    }
            },
            'analyticsnode-alarm-gen-cpu-share': {
                    modelCfg: {
                        modelId:'ANALYTICSNODE_ALARMGEN_CPU_MODEL',
                        type: 'analyticsNode',
                        source:'STATTABLE',
                        config: {
                            table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                            select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                            where: 'process_mem_cpu_usage.__key = contrail-alarm-gen:0'
                        }
                    },
                    viewCfg: {
                        elementId : 'analyticsnode_alarm_gen_cpu_share',
                        view: 'LineWithFocusChartView',
                        viewConfig: {
                            chartOptions: {
                                yFormatter: d3.format('.2f'),
                                subTitle:ctwl.CPU_SHARE_PERCENTAGE,
                                yAxisLabel: ctwl.ANALYTICS_NODE_ALARM_GEN_CPU_SHARE,
                                groupBy: 'name',
                                yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                            }
                        }
                    },itemAttr: {
                        title: ctwl.ANALYTICS_NODE_ALARM_GEN_CPU_SHARE,
                        width: 1/2
                    }
            },
            'analyticsnode-snmp-collector-cpu-share': {
                    modelCfg: {
                        modelId:'ANALYTICSNODE_SNMP_COLLECTOR_CPU_MODEL',
                        type: 'analyticsNode',
                        source:'STATTABLE',
                        config: {
                            table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                            select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                            where: 'process_mem_cpu_usage.__key = contrail-snmp-collector'
                        }
                    },
                    viewCfg: {
                        elementId : 'analytics_node_snmp_collector_cpu_share',
                        view:'LineWithFocusChartView',
                        viewConfig: {
                            chartOptions: {
                                yFormatter: d3.format('.2f'),
                                subTitle:ctwl.CPU_SHARE_PERCENTAGE,
                                yAxisLabel: ctwl.ANALYTICS_NODE_SNMP_COLLECTOR_CPU_SHARE,
                                groupBy: 'name',
                                yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                            }
                        }
                    },itemAttr: {
                        title: ctwl.ANALYTICS_NODE_SNMP_COLLECTOR_CPU_SHARE,
                        width: 1/2
                    }
            },
            'analyticsnode-contrail-topology-cpu-share': {
                    modelCfg: {
                        modelId:'ANALYTICSNODE_TOPOLOGY_CPU_MODEL',
                        type: 'analyticsNode',
                        source:'STATTABLE',
                        config: {
                            table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                            select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                            where: 'process_mem_cpu_usage.__key = contrail-topology'
                        }
                    },
                    viewCfg: {
                        elementId : 'analytics_node_topology_cpu_share',
                        view:'LineWithFocusChartView',
                        viewConfig: {
                            chartOptions: {
                                yFormatter: d3.format('.2f'),
                                subTitle:ctwl.CPU_SHARE_PERCENTAGE,
                                yAxisLabel: ctwl.ANALYTICS_NODE_TOPOLOGY_CPU_SHARE,
                                groupBy: 'name',
                                yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                            }
                        }
                    },itemAttr: {
                        title: ctwl.ANALYTICS_NODE_TOPOLOGY_CPU_SHARE,
                        width: 1/2
                     }
             },
            'analyticsnode-manager-cpu-share': {
                    modelCfg: {
                        modelId:'ANALYTICSNODE_NODEMGR_CPU_MODEL',
                        type: 'analyticsNode',
                        source:'STATTABLE',
                        config: {
                            table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                            select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                            where: 'process_mem_cpu_usage.__key = contrail-analytics-nodemgr'
                        }
                    },
                    viewCfg: {
                        elementId : 'analytics_node_node_manager_cpu_share',
                        view:'LineWithFocusChartView',
                        viewConfig: {
                            chartOptions: {
                                yFormatter: d3.format('.2f'),
                                subTitle:ctwl.CPU_SHARE_PERCENTAGE,
                                yAxisLabel: ctwl.ANALYTICS_NODE_NODE_MANAGER_CPU_SHARE,
                                groupBy: 'name',
                                yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                            }
                        }
                    },
                    itemAttr: {
                        title: ctwl.ANALYTICS_NODE_NODE_MANAGER_CPU_SHARE,
                        width: 1/2
                    }
            },
            'analyticsnode-api-cpu-share': {
                    modelCfg: {
                        modelId:'ANALYTICSNODE_API_CPU_MODEL',
                        type: 'analyticsNode',
                        source:'STATTABLE',
                        config: {
                            table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                            select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                            where: 'process_mem_cpu_usage.__key = contrail-analytics-api'
                        }
                    },
                    viewCfg: {
                        elementId : 'analytics_node_api_cpu_share',
                        view:'LineWithFocusChartView',
                        viewConfig: {
                            chartOptions: {
                                yFormatter: d3.format('.2f'),
                                subTitle:ctwl.CPU_SHARE_PERCENTAGE,
                                yAxisLabel: ctwl.ANALYTICS_NODE_API_CPU_SHARE,
                                groupBy: 'name',
                                yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                            }
                        }
                    },itemAttr: {
                        title: ctwl.ANALYTICS_NODE_API_CPU_SHARE,
                        width: 1/2
                    }
            },
            'analyticsnode-stats-available-connections': {
                    modelCfg: {
                        modelId:'ANALYTICSNODE_DB_CONNECTIONS_MODEL',
                        type: 'analyticsNode',
                        source:'STATTABLE',
                        config: {
                            table_name: 'StatTable.CollectorDbStats.cql_stats.stats',
                            select: 'T=, Source, MIN(cql_stats.stats.available_connections)'
                        }
                    },
                    viewCfg:{
                        elementId : 'analytics_node_avilable_connections',
                        view:'LineWithFocusChartView',
                        viewConfig: {
                            chartOptions: {
                                yFormatter: d3.format('.2f'),
                                subTitle:ctwl.CPU_SHARE_PERCENTAGE,
                                yAxisLabel: ctwl.ANALYTICS_NODE_AVAILABLE_CONNECTIONS,
                                groupBy: 'Source',
                                yField: 'MIN(cql_stats.stats.available_connections)',
                                title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                                yFormatter : function(d){
                                    return cowu.numberFormatter(d,0);
                               }
                            }
                        }
                    },itemAttr: {
                        title: ctwl.ANALYTICS_NODE_AVAILABLE_CONNECTIONS,
                        width: 1/2
                    }
            },
            'analyticsnode-grid-view': {
                    modelCfg: {
                      modelId:'ANAYTICSNODE_LIST_MODEL',
                      type: 'analyticsNode',
                      config:analyticsNodeListModelCfg
                    },
                    viewCfg: {
                        elementId : ctwl.ANALYTICSNODE_SUMMARY_GRID_ID,
                        title : ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                        view : "GridView",
                        viewConfig : {
                            elementConfig :
                                getAnalyticsNodeSummaryGridConfig('analyticsnode-grid-view','analyticsNode')
                        }
                    },
                    itemAttr: {
                        height: 2
                    }
            }
         };
        function getAnalyticsNodeSummaryGridConfig(widgetId, type) {
            var columns = [
               {
                   field:"name",
                   id:"name",
                   name:"Host name",
                   formatter:function(r,c,v,cd,dc) {
                      return cellTemplateLinks({
                          cellText:'name',
                          name:'name',
                          statusBubble:true,
                          rowData:dc,
                          tagColorMap: NodeColorMapping.getNodeColorMap(_.pluck(cowu.getGridItemsForWidgetId(widgetId), 'name'),null, type)
                      })
                   },
                   exportConfig: {
                       allow: true,
                       advFormatter: function(dc) {
                           return dc.name;
                       }
                   },
                   events: {
                      onClick: onClickHostName
                   },
                   cssClass: 'cell-hyperlink-blue show-ellipses',
                   minWidth:110,
                   sortable:true
               },
               {
                   field:"ip",
                   id:"ip",
                   name:"IP Address",
                   minWidth:110,
                   sortable:true,
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
                   id:"version",
                   name:"Version",
                   sortable:true,
                   minWidth:110
               },
               {
                   field:"status",
                   id:"status",
                   name:"Status",
                   sortable:true,
                   formatter:function(r,c,v,cd,dc) {
                       return monitorInfraUtils.getNodeStatusContentForSummayPages(dc,'html');
                   },
                   searchFn:function(d) {
                       return monitorInfraUtils.getNodeStatusContentForSummayPages(d,'text');
                   },
                   minWidth:110,
                   exportConfig: {
                       allow: true,
                       advFormatter: function(dc) {
                           return monitorInfraUtils.getNodeStatusContentForSummayPages(dc,
                               'text');
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
                   id:"analyticsCpu",
                   name: ctwl.TITLE_CPU,
                   formatter:function(r,c,v,cd,dc) {
                       return '<div class="gridSparkline display-inline">' +
                              '</div><span class="display-inline">' +
                              ifNotNumeric(dc['cpu'],'-')  + '</span>';
                   },
                   asyncPostRender: renderSparkLines,
                   searchFn:function(d){
                       return d['cpu'];
                   },
                   minWidth:120,
                   exportConfig: {
                       allow: true,
                       advFormatter: function(dc) {
                           return dc.cpu
                       }
                   }
               },
               {
                   field:"memory",
                   id:"analyticsMem",
                   sortable:true,
                   name:"Memory",
                   minWidth:150,
                   sortField:"y"
               },
               {
                   field:"genCount",
                   id:"genCount",
                   sortable:true,
                   name:"Generators",
                   minWidth:85
               },{
                   id:"percentileMessagesSize",
                   sortable:true,
                   name:"95% - Messages",
                   minWidth:200,
                   formatter:function(r,c,v,cd,dc) {
                    if(typeof dc['percentileMessages'] != 'undefined' || typeof dc['percentileSize'] != 'undefined'){
                       return '<span><b>'+"Count: "+
                               '</b></span>' +
                              '<span>' +
                              ifNotNumeric(dc['percentileMessages'],'-') + '</span>'+'<span><b>'+", Size: "+
                               '</b></span>' +
                              '<span>' +
                              (dc['percentileSize']) + '</span>';
                       }
                    else{
                        return '<span><b>'+"Count: "+
                        '</b></span>' +
                       '<span>' +
                       '-' + '</span>'+'<span><b>'+", Size: "+
                        '</b></span>' +
                       '<span>' +
                       '-' + '</span>';
                    }
                   }
               }
            ];
            var gridElementConfig = {
                header : {
                    title : {
                        text : ctwl.ANALYTICSNODE_SUMMARY_TITLE
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
                        remote : {
                            ajaxConfig : {
                                url : ctwl.ANALYTICSNODE_SUMMARY
                            }
                        },
                        cacheConfig : {
                            ucid: ctwl.CACHE_ANALYTICSNODE
                        }
                    },
                    statusMessages: {
                        loading: {
                            text: 'Loading Analytics Nodes..',
                        },
                        empty: {
                            text: 'No Analytics Nodes Found.'
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
                    type: "analyticsNode",
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
                p: "mon_infra_analytics",
                merge: false,
                triggerHashChange: triggerHashChange});

        };
        self.getViewConfig = function(id) {
            return self.viewConfig[id];
        };
    };
    return (new AnalyticsNodeViewConfig()).viewConfig;
});
