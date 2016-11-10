/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view', 'legend-view', 'monitor-infra-analyticsnode-model', 'node-color-mapping'],
        function(_, ContrailView, LegendView, AnalyticsNodeListModel, NodeColorMapping){
    var AnalyticsNodeViewConfig = function () {
        var nodeColorMapping = new NodeColorMapping(),
        colorFn = nodeColorMapping.getNodeColorMap,
        analyticsNodeListModel = new AnalyticsNodeListModel();
        var self = this;
        self.viewConfig = {
            'analyticsnode-percentile-count-size': function (){
                return {
                    modelCfg: {
                        source: 'STATTABLE',
                        config: {
                            "table_name": "StatTable.SandeshMessageStat.msg_info",
                            "select": "PERCENTILES(msg_info.bytes), PERCENTILES(msg_info.messages)",
                            "parser": monitorInfraParsers.percentileAnalyticsNodeSummaryChart
                        }
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
                        height:0.25,
                        width: 2,
                        title: ctwl.ANALYTICS_NODE_MESSAGE_PARAMS_PERCENTILE
                    }
                }
            },
            'analyticsnode-sandesh-message-info': function (){
                return {
                    modelCfg: {
                        source: 'STATTABLE',
                        config: {
                            table_name: 'StatTable.SandeshMessageStat.msg_info',
                            select: 'Source, T=, SUM(msg_info.messages)'
                        }
                    },
                    viewCfg: {
                        elementId : ctwl.ANALYTICS_CHART_SANDESH_STACKEDBARCHART_ID,
                        view: 'StackedAreaChartView',
                        viewConfig: {
                            chartOptions: {
                                colors: colorFn,
                                title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                                xAxisLabel: '',
                                yAxisLabel: ctwl.ANALYTICS_CHART_SANDESH_LABEL,
                                groupBy: 'Source',
                                yField: 'SUM(msg_info.messages)',
                            }
                        }
                    },
                    itemAttr: {
                        height: 1.2,
                        width: 2,
                        title: ctwl.ANALYTICS_NODE_SANDESH_MESSAGE_DISTRIBUTION
                    }
                }
            },
            'analyticsnode-query-stats': function (){
                return {
                    modelCfg: {
                        source: 'STATTABLE',
                        config: {
                            table_name: 'StatTable.QueryPerfInfo.query_stats',
                            select: 'Source, query_stats.error, name,T'
                        }
                    },
                    viewCfg: {
                        elementId : ctwl.ANALYTICS_CHART_QUERIES_STACKEDBARCHART_ID,
                        view:'StackedBarChartWithFocusView',
                        viewConfig: {
                            chartOptions: {
                                colors: colorFn,
                                title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                                xAxisLabel: '',
                                yAxisLabel: ctwl.ANALYTICS_CHART_QUERIES_LABEL,
                                groupBy: 'Source',
                                failureCheckFn: function (d) {
                                    if (d['query_stats.error'] != "None") {
                                        return 1;
                                    } else {
                                        return 0;
                                    }
                                },
                            }
                        }
                    },
                    itemAttr: {
                        width: 0.67,
                        height: 0.9,
                        title: ctwl.ANALYTICS_NODE_QUERY_DISTRIBUTION
                    }
                }
            },
            'analyticsnode-generators-scatterchart': function (){
                return {
                    modelCfg: {
                        source: 'STATTABLE',
                        config: {
                            "table_name": "StatTable.SandeshMessageStat.msg_info",
                            "select": "Source,name, T=, SUM(msg_info.messages),SUM(msg_info.bytes)",
                            "parser": function(response){
                                var apiStats = response;
                                var parsedData = [], parsedDataAll = [];
                                var parsedDataNew = [];
                                var cf = crossfilter(apiStats);
                                var sourceDim = cf.dimension(function (d) {return d['name']});
                                var totalResMessages = sourceDim.group().reduceSum(
                                        function (d) {
                                            return d['SUM(msg_info.messages)'];
                                        });
                                var totalResSize = sourceDim.group().reduceSum(
                                        function (d) {
                                            return d['SUM(msg_info.bytes)'];
                                        });
                                totalResMessagesData = totalResMessages.all();
                                totalResSize = totalResSize.all();
                                    $.each(totalResSize, function (key, value){
                                        var xValue = Math.round(value['value']/120);
                                        var Source = value['key'].substring(0, 6);
                                        xValue = formatBytes(xValue);
                                        xValue = parseFloat(xValue);
                                        xValue = Math.round(xValue);
                                        parsedData.push({
                                            Source : Source,
                                            label: value['key'],
                                            x: parseFloat(xValue)
                                            //color: colors[value['key']]
                                        });
                                    });
                                    $.each(totalResMessagesData, function (key, value){
                                        var dataWithX = _.find(parsedData, function(xValue){
                                            return xValue.label === value["key"];
                                        });
                                        dataWithX.y = value['value']/120;
                                        dataWithX.y = parseFloat(dataWithX.y);
                                        dataWithX.y = Math.round(dataWithX.y);
                                    });
                                return parsedData;

                            }
                        }
                    },
                    viewCfg:{
                        elementId : 'generatorsScatterChart',
                        view:'ZoomScatterChartView',
                        viewConfig: {
                            chartOptions: {
                                xLabelFormat: function(x) {return $.isNumeric(x) ? x : NaN;},
                                xLabel: 'Bytes (KB)/ min',
                                yLabel: 'Generators Messages / min',
                                xTickCount:5,
                                yTickCount:5,
                               // sizeField: 'size',
                                doBucketize:false,
                                tooltipConfigCB: function(currObj,format) {
                                    var options = {};
                                    var nodes = currObj;
                                    options['tooltipContents'] = [
                                          {label:'Node', value: nodes.Source},
                                          {label:'No. of Generators:', value: nodes.size},
                                          {label:'Messages', value:$.isNumeric(currObj['y']) ? currObj['y'].toFixed(2)  : currObj['y']},
                                          {label:'Bytes(KB)', value:Math.round(currObj['x'])}
                                      ];
                                    return monitorInfraUtils.getDefaultScatterChartTooltipFn(currObj,options);
                                },
                                //clickCB: monitorInfraUtils.onvRouterDrillDown,
                            }
                        }
                    },
                itemAttr: {
                    width: 0.83,
                    height: 1.2,
                    title: ctwl.ANALYTICS_NODE_GENERATORS
                    }
                }
            },
            'analyticsnode-database-read-write': function (){
                return {
                    modelCfg: {
                        source:'STATTABLE',
                        config: {
                            table_name: 'StatTable.CollectorDbStats.table_info',
                            select: 'Source,SUM(table_info.reads), SUM(table_info.writes), SUM(table_info.read_fails), SUM(table_info.write_fails),T='
                        }
                    },
                    viewCfg: {
                        elementId : ctwl.ANALYTICS_CHART_DATABASE_WRITE_STACKEDBARCHART_ID,
                        view:'StackedBarChartWithFocusView',
                        viewConfig: {
                            chartOptions: {
                                colors: colorFn,
                                title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                                xAxisLabel: '',
                                yAxisLabel: ctwl.ANALYTICS_CHART_DATABASE_WRITE_LABEL,
                                groupBy: 'Source',
                                failureCheckFn: function (d) {
                                    return d[ctwl.ANALYTICS_CHART_DATABASE_WRITE_FAILS];
                                },
                                yField: ctwl.ANALYTICS_CHART_DATABASE_WRITE,
                            }
                        }
                    },
                    itemAttr: {
                        width: 0.67,
                        height: 0.9,
                        title: ctwl.ANALYTICS_NODE_DB_READ_WRITE
                    }
                }
            },
            'analyticsnode-top-messagetype': function (){
                return {
                    modelCfg: {
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
                                xAxisLabel: '',
                                yAxisLabel: ctwl.ANALYTICS_NODE_TOP_MESSAGE_TYPES,
                                groupBy: 'msg_info.type',
                                limit: 5,
                                yField: 'SUM(msg_info.messages)',
                            }
                        }
                    },itemAttr: {
                        title: ctwl.ANALYTICS_NODE_TOP_MESSAGE_TYPES
                    }
                }
            },
            'analyticsnode-top-generators': function (){
                return {
                    modelCfg: {
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
                                xAxisLabel: '',
                                yAxisLabel: ctwl.ANALYTICS_NODE_TOP_GENERATORS,
                                groupBy: 'name',
                                limit: 5,
                                yField: 'SUM(msg_info.messages)',
                            }
                        }
                    },itemAttr: {
                        title: ctwl.ANALYTICS_NODE_TOP_GENERATORS
                    }
                }
            },
            'analyticsnode-qe-cpu-share': function (){
                return {
                    modelCfg: {
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
                                yAxisLabel: ctwl.ANALYTICS_NODE_QE_CPU_SHARE,
                                groupBy: 'name',
                                colors: colorFn,
                                yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                            }
                        }
                    },itemAttr: {
                        title: ctwl.ANALYTICS_NODE_QE_CPU_SHARE
                    }
                }
            },
            'analyticsnode-collector-cpu-share': function () {
                return {
                    modelCfg: {
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
                                yAxisLabel: ctwl.ANALYTICS_NODE_COLLECTOR_CPU_SHARE,
                                groupBy: 'name',
                                colors: colorFn,
                                yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                            }
                        }
                    },itemAttr: {
                        title: ctwl.ANALYTICS_NODE_COLLECTOR_CPU_SHARE
                    }
                }
            },
            'analyticsnode-alarm-gen-cpu-share': function () {
                return {
                    modelCfg: {
                        source:'STATTABLE',
                        config: {
                            table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                            select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                            where: 'process_mem_cpu_usage.__key = contrail-alarm-gen'
                        }
                    },
                    viewCfg: {
                        elementId : 'analyticsnode_alarm_gen_cpu_share',
                        view: 'LineWithFocusChartView',
                        viewConfig: {
                            chartOptions: {
                                yFormatter: d3.format('.2f'),
                                yAxisLabel: ctwl.ANALYTICS_NODE_ALARM_GEN_CPU_SHARE,
                                groupBy: 'name',
                                colors: colorFn,
                                yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                            }
                        }
                    },itemAttr: {
                        title: ctwl.ANALYTICS_NODE_ALARM_GEN_CPU_SHARE
                    }
                }
            },
            'analyticsnode-snmp-collector-cpu-share': function () {
                return {
                    modelCfg: {
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
                                yAxisLabel: ctwl.ANALYTICS_NODE_SNMP_COLLECTOR_CPU_SHARE,
                                groupBy: 'name',
                                colors: colorFn,
                                yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                            }
                        }
                    },itemAttr: {
                        title: ctwl.ANALYTICS_NODE_SNMP_COLLECTOR_CPU_SHARE
                    }
                }
            },
            'analyticsnode-contrail-topology-cpu-share': function () {
                return {
                    modelCfg: {
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
                                yAxisLabel: ctwl.ANALYTICS_NODE_TOPOLOGY_CPU_SHARE,
                                groupBy: 'name',
                                colors: colorFn,
                                yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                            }
                        }
                    },itemAttr: {
                        title: ctwl.ANALYTICS_NODE_TOPOLOGY_CPU_SHARE
                     }
                 }
             },
            'analyticsnode-manager-cpu-share': function () {
                return {
                    modelCfg: {
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
                                yAxisLabel: ctwl.ANALYTICS_NODE_NODE_MANAGER_CPU_SHARE,
                                groupBy: 'name',
                                colors: colorFn,
                                yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                            }
                        }
                    },
                    itemAttr: {
                        title: ctwl.ANALYTICS_NODE_NODE_MANAGER_CPU_SHARE
                    }
                }
            },'analyticsnode-api-cpu-share': function () {
                return {
                    modelCfg: {
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
                                yAxisLabel: ctwl.ANALYTICS_NODE_API_CPU_SHARE,
                                groupBy: 'name',
                                colors: colorFn,
                                yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                            }
                        }
                    },itemAttr: {
                        title: ctwl.ANALYTICS_NODE_API_CPU_SHARE
                    }
                };
            },'analyticsnode-stats-available-connections': function () {
                return {
                    modelCfg: {
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
                                yAxisLabel: ctwl.ANALYTICS_NODE_AVAILABLE_CONNECTIONS,
                                groupBy: 'Source',
                                colors: colorFn,
                                yField: 'MIN(cql_stats.stats.available_connections)',
                                title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                                yFormatter : function(d){
                                    return cowu.numberFormatter(d,0);
                               }
                            }
                        }
                    },itemAttr: {
                        title: ctwl.ANALYTICS_NODE_AVAILABLE_CONNECTIONS
                    }
                }
            },
            'analyticsnode-grid-view': function () {
                return {
                    modelCfg: {
                      listModel: new AnalyticsNodeListModel()
                    },
                    viewCfg: {
                        elementId : ctwl.ANALYTICSNODE_SUMMARY_GRID_ID,
                        title : ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                        view : "GridView",
                        viewConfig : {
                            elementConfig :
                                getAnalyticsNodeSummaryGridConfig(analyticsNodeListModel, colorFn)
                        }
                    },
                    itemAttr: {
                        width: 2
                    }
                }
             }
         };
        function getAnalyticsNodeSummaryGridConfig(model, colorFn) {
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
                          tagColorMap:colorFn(_.pluck(model.getItems(), 'name'))});
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
                   cssClass: 'cell-hyperlink-blue',
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
                       return '<span><b>'+"Count: "+
                               '</b></span>' +
                              '<span>' +
                              ifNotNumeric(dc['percentileMessages'],'-') + '</span>'+'<span><b>'+", Size: "+
                               '</b></span>' +
                              '<span>' +
                              (dc['percentileSize']) + '</span>';
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
