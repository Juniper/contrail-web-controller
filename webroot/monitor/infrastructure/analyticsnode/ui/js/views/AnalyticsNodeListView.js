/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view','legend-view', 'monitor-infra-analyticsnode-model',
          'node-color-mapping','monitor-infra-analytics-sandesh-chart-model',
          'monitor-infra-analytics-queries-chart-model',
          'monitor-infra-analytics-database-read-write-chart-model',
          'monitor-infra-analytics-database-usage-model'],
        function(
                _, ContrailView, LegendView, AnalyticsNodeListModel, NodeColorMapping, AnalyticsNodeSandeshChartModel,
                AnalyticsNodeQueriesChartModel, AnalyticsNodeDataBaseReadWriteChartModel,
                AanlyticsNodeDatabaseUsageModel) {
            var AnalyticsNodeListView = ContrailView.extend({
                render : function() {
                    nodeColorMapping = new NodeColorMapping(),
                    colorFn = nodeColorMapping.getNodeColorMap;
                    this.renderView4Config(this.$el, null,
                            getAnalyticsNodeListViewConfig(colorFn));
                }
            });

            function getAnalyticsNodeListViewConfig(colorFn) {
                var sandeshModel = new AnalyticsNodeSandeshChartModel(),
                queriesModel = new AnalyticsNodeQueriesChartModel(),
                dbUsageModel = new AanlyticsNodeDatabaseUsageModel();
                databseReadWritemodel = new AnalyticsNodeDataBaseReadWriteChartModel();
                var viewConfig = {
                        rows : [
                                {
                                    columns : [
                                               {
                                        elementId: 'analytics-node-carousel-view',
                                        view: "CarouselView",
                                        viewConfig: {
                                            pages : [
                                                 {
                                                     page: {
                                                         elementId : 'analytics-node-grid-stackview-0',
                                                         view : "GridStackView",
                                                         viewConfig : {
                                                              gridAttr : {
                                                                  defaultWidth : 6,
                                                                  defaultHeight : 8
                                                              },
                                                              widgetCfgList: [
                                                                  {
                                                                      modelCfg: monitorInfraUtils.getStatsModelConfig({
                                                                          "table_name": "StatTable.SandeshMessageStat.msg_info",
                                                                          "select": "PERCENTILES(msg_info.bytes), PERCENTILES(msg_info.messages)",
                                                                          "parser": monitorInfraParsers.percentileAnalyticsNodeSummaryChart
                                                                      }),
                                                                      viewCfg: {
                                                                          elementId : ctwl.ANALYTICS_CHART_PERCENTILE_SECTION_ID,
                                                                          view : "SectionView",
                                                                          viewConfig : {
                                                                              rows : [ {
                                                                                  columns : [ {
                                                                                      elementId :ctwl.ANALYTICS_CHART_PERCENTILE_TEXT_VIEW,
                                                                                      title : ctwl.ANALYTICS_NODE_MESSAGE_PARAMS_PERCENTILE,
                                                                                      view : "PercentileTextView",
                                                                                      viewPathPrefix:
                                                                                          ctwl.ANALYTICSNODE_VIEWPATH_PREFIX,
                                                                                      app : cowc.APP_CONTRAIL_CONTROLLER,
                                                                                      viewConfig : {
                                                                                          percentileTitle : ctwl.ANALYTICSNODE_CHART_PERCENTILE_TITLE,
                                                                                          percentileXvalue : ctwl.ANALYTICSNODE_CHART_PERCENTILE_COUNT,
                                                                                          percentileYvalue : ctwl.ANALYTICSNODE_CHART_PERCENTILE_SIZE,
                                                                                      }
                                                                                  }]
                                                                              }]
                                                                          }
                                                                      },
                                                                      itemAttr: {
                                                                          height:0.25,
                                                                          title: ctwl.ANALYTICS_NODE_MESSAGE_PARAMS_PERCENTILE
                                                                      }
                                                                  },
                                                                  {
                                                                      modelCfg: sandeshModel,
                                                                      viewCfg: getAnalyticsNodeSandeshChartViewConfig(colorFn),
                                                                      itemAttr: {
                                                                          title: ctwl.ANALYTICS_NODE_SANDESH_MESSAGE_DISTRIBUTION
                                                                      }
                                                                  },
                                                                  {
                                                                      modelCfg: queriesModel,
                                                                      viewCfg: getAnalyticsNodeQueriesChartViewConfig(colorFn),
                                                                      itemAttr: {
                                                                          title: ctwl.ANALYTICS_NODE_QUERY_DISTRIBUTION
                                                                      }
                                                                  },
                                                                  /*{
                                                                      modelCfg: monitorInfraUtils.getStatsModelConfig({
                                                                          table_name: 'StatTable.SandeshMessageStat.msg_info',
                                                                          select: 'Source,name, T=, SUM(msg_info.messages),SUM(msg_info.bytes)',
                                                                          parser: monitorInfraParsers.generatorsChartsParseData
                                                                      }),
                                                                      viewCfg: getGeneratorsScatterChartViewConfig()
                                                                  },*/
                                                                  {
                                                                      modelCfg: dbUsageModel,
                                                                      viewCfg: getAnalyticsNodeDatabaseUsageChartViewConfig(colorFn),
                                                                      itemAttr: {
                                                                          title: ctwl.ANALYTICS_NODE_DB_USAGE
                                                                      }
                                                                  },

                                                                  {
                                                                      modelCfg: databseReadWritemodel,
                                                                      viewCfg: getAnalyticsNodeDatabaseWriteChartViewConfig(colorFn),
                                                                      itemAttr: {
                                                                          title: ctwl.ANALYTICS_NODE_DB_READ_WRITE
                                                                      }
                                                                  },{
                                                                      modelCfg: new AnalyticsNodeListModel(),
                                                                      viewCfg: {
                                                                          elementId :
                                                                              ctwl.ANALYTICSNODE_SUMMARY_GRID_ID,
                                                                          title : ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                                                                          view : "AnalyticsNodeSummaryGridView",
                                                                          viewPathPrefix:
                                                                              ctwl.ANALYTICSNODE_VIEWPATH_PREFIX,
                                                                          app : cowc.APP_CONTRAIL_CONTROLLER,
                                                                          viewConfig : {
                                                                              colorFn: colorFn
                                                                          }},
                                                                      itemAttr: {
                                                                          width: 2
                                                                      }
                                                                  }
                                                              ]
                                                         }
                                                     },
                                                 },{
                                                     page: {
                                                         elementId: 'analytics-node-grid-stackview-1',
                                                         view: 'GridStackView',
                                                         viewConfig: {
                                                             gridAttr: {
                                                                 defaultWidth: 6,
                                                                 defaultHeight: 8
                                                             },
                                                             widgetCfgList: [
                                                                   {
                                                                       modelCfg: monitorInfraUtils.getStatsModelConfig({
                                                                           table_name: 'StatTable.SandeshMessageStat.msg_info',
                                                                           select: 'T=, msg_info.type, SUM(msg_info.messages)'
                                                                       }),
                                                                       viewCfg: {
                                                                           elementId : 'message_type_top_5_section',
                                                                           view : "SectionView",
                                                                           viewConfig : {
                                                                               rows : [ {
                                                                                   columns :[
                                                                                        $.extend(true, {}, monitorInfraConstants.stackChartDefaultViewConfig, {
                                                                                            elementId : 'message_type_top_5',
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
                                                                                        })
                                                                                   ]
                                                                               }]
                                                                           }
                                                                       },itemAttr: {
                                                                           title: ctwl.ANALYTICS_NODE_TOP_MESSAGE_TYPES
                                                                       }
                                                                   },{
                                                                       modelCfg: monitorInfraUtils.getStatsModelConfig({
                                                                           table_name: 'StatTable.SandeshMessageStat.msg_info',
                                                                           select: 'T=, name, SUM(msg_info.messages)'
                                                                       }),
                                                                       viewCfg: {
                                                                           elementId : 'generator_top_5_section',
                                                                           view : "SectionView",
                                                                           viewConfig : {
                                                                               rows : [ {
                                                                                   columns :[
                                                                                        $.extend(true, {}, monitorInfraConstants.stackChartDefaultViewConfig, {
                                                                                            elementId : 'generator_top_5',
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
                                                                                        })
                                                                                   ]
                                                                               }]
                                                                           }
                                                                       },itemAttr: {
                                                                           title: ctwl.ANALYTICS_NODE_TOP_GENERATORS
                                                                       }
                                                                   }, {
                                                                       modelCfg: monitorInfraUtils.getStatsModelConfig({
                                                                           table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                                                                           select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                                                                           where: 'process_mem_cpu_usage.__key = contrail-query-engine'
                                                                       }),
                                                                       viewCfg: $.extend(true, {}, monitorInfraConstants.defaultLineChartViewCfg, {
                                                                           elementId : 'analytics_node_qe_cpu_share',
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
                                                                       }),itemAttr: {
                                                                           title: ctwl.ANALYTICS_NODE_QE_CPU_SHARE
                                                                       }
                                                                   },{
                                                                       modelCfg: monitorInfraUtils.getStatsModelConfig({
                                                                           table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                                                                           select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                                                                           where: 'process_mem_cpu_usage.__key = contrail-collector'
                                                                       }),
                                                                       viewCfg: $.extend(true, {}, monitorInfraConstants.defaultLineChartViewCfg, {
                                                                           elementId : 'analytics_node_node_collector_cpu_share',
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
                                                                       }),itemAttr: {
                                                                           title: ctwl.ANALYTICS_NODE_COLLECTOR_CPU_SHARE
                                                                       }
                                                                   },{
                                                                       modelCfg: new AnalyticsNodeListModel(),
                                                                       viewCfg: {
                                                                           elementId :
                                                                               ctwl.ANALYTICSNODE_SUMMARY_GRID_ID,
                                                                           title : ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                                                                           view : "AnalyticsNodeSummaryGridView",
                                                                           viewPathPrefix:
                                                                               ctwl.ANALYTICSNODE_VIEWPATH_PREFIX,
                                                                           app : cowc.APP_CONTRAIL_CONTROLLER,
                                                                           viewConfig : {
                                                                               colorFn: colorFn
                                                                           }},
                                                                       itemAttr: {
                                                                           width: 2
                                                                       }
                                                                   }
                                                             ]
                                                         }
                                                     }
                                                 },{
                                                     page: {
                                                         elementId: 'analytics-node-grid-stackview-2',
                                                         view: 'GridStackView',
                                                         viewConfig: {
                                                             gridAttr: {
                                                                 defaultWidth: 6,
                                                                 defaultHeight: 8
                                                             },
                                                             widgetCfgList: [
                                                                 {
                                                                     modelCfg: monitorInfraUtils.getStatsModelConfig({
                                                                         table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                                                                         select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                                                                         where: 'process_mem_cpu_usage.__key = contrail-alarm-gen'
                                                                     }),
                                                                     viewCfg: $.extend(true, {}, monitorInfraConstants.defaultLineChartViewCfg, {
                                                                         elementId : 'analytics_node_alarm_gen_cpu_share',
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
                                                                     }),itemAttr: {
                                                                         title: ctwl.ANALYTICS_NODE_ALARM_GEN_CPU_SHARE
                                                                     }
                                                                 },{
                                                                     modelCfg: monitorInfraUtils.getStatsModelConfig({
                                                                         table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                                                                         select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                                                                         where: 'process_mem_cpu_usage.__key = contrail-snmp-collector'
                                                                     }),
                                                                     viewCfg: $.extend(true, {}, monitorInfraConstants.defaultLineChartViewCfg, {
                                                                         elementId : 'analytics_node_snmp_collector_cpu_share',
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
                                                                     }),itemAttr: {
                                                                         title: ctwl.ANALYTICS_NODE_SNMP_COLLECTOR_CPU_SHARE
                                                                     }
                                                                 },{
                                                                     modelCfg: monitorInfraUtils.getStatsModelConfig({
                                                                         table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                                                                         select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                                                                         where: 'process_mem_cpu_usage.__key = contrail-analytics-nodemgr'
                                                                     }),
                                                                     viewCfg: $.extend(true, {}, monitorInfraConstants.defaultLineChartViewCfg, {
                                                                         elementId : 'analytics_node_node_manager_cpu_share',
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
                                                                     }),
                                                                     itemAttr: {
                                                                         title: ctwl.ANALYTICS_NODE_NODE_MANAGER_CPU_SHARE
                                                                     }
                                                                 },{
                                                                     modelCfg: monitorInfraUtils.getStatsModelConfig({
                                                                         table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                                                                         select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                                                                         where: 'process_mem_cpu_usage.__key = contrail-analytics-api'
                                                                     }),
                                                                     viewCfg: $.extend(true, {}, monitorInfraConstants.defaultLineChartViewCfg, {
                                                                         elementId : 'analytics_node_api_cpu_share',
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
                                                                     }),itemAttr: {
                                                                         title: ctwl.ANALYTICS_NODE_API_CPU_SHARE
                                                                     }
                                                                 },{
                                                                     modelCfg: new AnalyticsNodeListModel(),
                                                                     viewCfg: {
                                                                         elementId :
                                                                             ctwl.ANALYTICSNODE_SUMMARY_GRID_ID,
                                                                         title : ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                                                                         view : "AnalyticsNodeSummaryGridView",
                                                                         viewPathPrefix:
                                                                             ctwl.ANALYTICSNODE_VIEWPATH_PREFIX,
                                                                         app : cowc.APP_CONTRAIL_CONTROLLER,
                                                                         viewConfig : {
                                                                             colorFn: colorFn
                                                                         }},
                                                                     itemAttr: {
                                                                         width: 2
                                                                     }
                                                                 }
                                                             ]
                                                         }
                                                     }
                                                 }
                                            ]
                                        }
                                    }]
                                }]
                       };
                return {
                    elementId : cowu.formatElementId([
                         ctwl.ANALYTICSNODE_SUMMARY_LIST_SECTION_ID ]),
                    view : "SectionView",
                    viewConfig : viewConfig
                };
            }
            function getAnalyticsNodeSandeshChartViewConfig(colorFn) {
                return {
                    elementId : ctwl.ANALYTICS_CHART_SANDESH_SECTION_ID,
                    view : "SectionView",
                    viewConfig : {
                        rows : [{
                            columns : [ $.extend(true, {}, monitorInfraConstants.stackChartDefaultViewConfig, {
                                elementId : ctwl.ANALYTICS_CHART_SANDESH_STACKEDBARCHART_ID,
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
                            })]
                        }]
                    }
                }

            }

            function getAnalyticsNodeQueriesChartViewConfig(colorFn) {
                return {
                    elementId : ctwl.ANALYTICS_CHART_QUERIES_SECTION_ID,
                    view : "SectionView",
                    viewConfig : {
                        rows : [ {
                            columns : [ $.extend(true, {}, monitorInfraConstants.stackChartDefaultViewConfig, {
                                elementId : ctwl.ANALYTICS_CHART_QUERIES_STACKEDBARCHART_ID,
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
                            })]
                        }]
                    }
                }

            }

            function getAnalyticsNodeDatabaseUsageChartViewConfig() {
                return {
                    elementId : ctwl.ANALYTICS_CHART_DATABASE_READ_SECTION_ID,
                    view : "SectionView",
                    viewConfig : {
                        rows : [ {
                            columns : [ $.extend(true, {}, monitorInfraConstants.stackChartDefaultViewConfig, {
                                elementId : ctwl.ANALYTICS_CHART_DATABASE_READ_STACKEDBARCHART_ID,
                                viewConfig: {
                                    chartOptions: {
                                        title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                                        xAxisLabel: '',
                                        yAxisLabel: ctwl.ANALYTICS_CHART_DATABASE_USAGE,
                                        yField: 'MAX(database_usage.analytics_db_size_1k)',
                                    }
                                }
                            })]
                        }]
                    }
                }

            }

            function getGeneratorsScatterChartViewConfig() {
                return {
                    elementId :"generatorsScatterChartView",
                    view : "SectionView",
                    viewConfig : {
                        rows: [{
                            columns: [{
                                elementId: "generatorsScatterChart",
                                //title: ctwl.VROUTER_SUMMARY_TITLE,
                                view: "ZoomScatterChartView",
                                //app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    loadChartInChunks: true,
                                    cfDataSource : self.cfDataSource,
                                    chartOptions:{
                                        sortFn:function(data){
                                            return data.reverse();
                                        },
                                        fetchDataLabel : false,
                                        doBucketize: true,
                                        xLabel: 'Bytes (KB)/ min',
                                        yLabel: 'Generators (Messages /min)',
                                        forceX : [ 0, 1 ],
                                        forceY : [ 0, 20 ],
                                        margin: {top:5},
                                        doBucketize:false,

                                        showLegend: false,
                                       bubbleCfg : {
                                            defaultMaxValue : monitorInfraConstants.VROUTER_DEFAULT_MAX_THROUGHPUT
                                       },

                                       tooltipConfigCB: monitorInfraUtils.generatorsTooltipFn,
                                       bucketTooltipFn: monitorInfraUtils.generatorsBucketTooltipFn,
                                    },

                                }

                            }]
                        }]
                    }
                }

            }
            function getAnalyticsNodeDatabaseWriteChartViewConfig(colorFn) {
                return {
                    elementId : ctwl.ANALYTICS_CHART_DATABASE_WRITE_SECTION_ID,
                    view : "SectionView",
                    viewConfig : {
                        rows : [ {

                            columns : [
                                        $.extend(true, {}, monitorInfraConstants.stackChartDefaultViewConfig, {
                                elementId : ctwl.ANALYTICS_CHART_DATABASE_WRITE_STACKEDBARCHART_ID,
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
                            })]
                        }]
                    }
                }

            }
            function getPercentileTextViewConfig() {
                var queryPostData = {
                    "autoSort": true,
                    "async": false,
                    "formModelAttrs": {
                     "table_name": "StatTable.SandeshMessageStat.msg_info",
                      "table_type": "STAT",
                      "query_prefix": "stat",
                      "from_time": Date.now() - (2 * 60 * 60 * 1000),
                      "from_time_utc": Date.now() - (2 * 60 * 60 * 1000),
                      "to_time": Date.now(),
                      "to_time_utc": Date.now(),
                      "select": "PERCENTILES(msg_info.bytes), PERCENTILES(msg_info.messages)",
                      "time_granularity": 30,
                      "time_granularity_unit": "mins",
                      "limit": "150000"
                    },
                };
                return {
                    elementId : ctwl.ANALYTICS_CHART_PERCENTILE_SECTION_ID,
                    view : "SectionView",
                    viewConfig : {
                        rows : [ {
                            columns : [ {
                                elementId :ctwl.ANALYTICS_CHART_PERCENTILE_TEXT_VIEW,
                                title : '',
                                view : "PercentileTextView",
                                viewPathPrefix:
                                    ctwl.ANALYTICSNODE_VIEWPATH_PREFIX,
                                app : cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig : {
                                       modelConfig : {
                                            remote : {
                                                ajaxConfig : {
                                                    url : "/api/qe/query",
                                                    type: 'POST',
                                                    data: JSON.stringify(queryPostData),
                                                },
                                                dataParser : function (response) {
                                                    return monitorInfraParsers.percentileAnalyticsNodeSummaryChart(response['data']);
                                                }
                                            },
                                            cacheConfig : {}
                                        },
                                }
                            }]
                        }]
                    }
                }

            }
            return AnalyticsNodeListView;
        });
