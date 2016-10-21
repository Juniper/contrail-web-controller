/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view', 'legend-view','monitor-infra-confignode-model',
          'monitor-infra-confignode-charts-model', 'node-color-mapping'],
        function(
                _, ContrailView, LegendView, ConfigNodeListModel,
                ConfigNodeChartsModel,NodeColorMapping) {
            var ConfigNodeListView = ContrailView.extend({
                render : function() {
                    var nodeColorMapping = new NodeColorMapping(),
                        colorFn = nodeColorMapping.getNodeColorMap;

                    this.renderView4Config(this.$el, null,
                            getConfigNodeListViewConfig(colorFn));
                }
            });


            function getConfigNodeListViewConfig(colorFn) {
                var chartModel = new ConfigNodeChartsModel();
                var viewConfig = {
                    rows : [
                         {
                             columns : [
                                        {
                                 elementId: 'config-node-carousel-view',
                                 view: "CarouselView",
                                 viewConfig: {
                                     pages : [
                                          {
                                              page: {
                                                  elementId : 'config-node-grid-stackview-0',
                                                  view : "GridStackView",
                                                  viewConfig : {
                                                      gridAttr: {
                                                          defaultWidth: 6,
                                                          defaultHeight: 10
                                                      },
                                                      widgetCfgList: [{
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
                                                      },{
                                                              modelCfg: chartModel,
                                                              viewCfg:
                                                                  $.extend(true, {}, monitorInfraConstants.stackChartDefaultViewConfig, {
                                                                      elementId : ctwl.CONFIGNODE_SUMMARY_STACKEDCHART_ID,
                                                                      view: 'StackedAreaChartView',
                                                                      viewConfig: {
                                                                          class: 'col-xs-7 mon-infra-chart chartMargin',
                                                                          chartOptions: {
                                                                              showControls: false,
                                                                              height: 480,
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
                                                                              },
                                                                              margin: {
                                                                                  left: 40,
                                                                                  top: 20,
                                                                                  right: 0,
                                                                                  bottom: 40
                                                                              }
                                                                          }
                                                                      }
                                                                  }),
                                                              itemAttr: {
                                                                  height: 1.8,
                                                                  width: 1.2,
                                                                  title: ctwl.CONFIG_NODE_REQUESTS_SERVED
                                                              }
                                                          },{
                                                              modelCfg: chartModel,
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
                                                                  width: 0.9,
                                                                  title: ctwl.CONFIG_NODE_RESPONSE_TIME_VS_SIZE
                                                              }
                                                          },{
                                                              modelCfg: chartModel,
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
                                                                  height: 0.6,
                                                                  title: ctwl.CONFIG_NODE_REQUESTS_READ_VS_WRITE
                                                              }
                                                          },{
                                                              modelCfg: new ConfigNodeListModel(),
                                                              viewCfg: {
                                                                  title : ctwl.CONFIGNODE_SUMMARY_TITLE,
                                                                  view : "ConfigNodeSummaryGridView",
                                                                  viewPathPrefix:
                                                                      ctwl.CONFIGNODE_VIEWPATH_PREFIX,
                                                                  app : cowc.APP_CONTRAIL_CONTROLLER,
                                                                  viewConfig : {
                                                                      colorFn: colorFn
                                                                  }
                                                              },
                                                              itemAttr: {
                                                                  width: 2
                                                              }
                                                          }
                                                      ]
                                                  }
                                              },
                                          },{
                                              page: {
                                                  elementId : 'config-node-grid-stackview-1',
                                                  view: 'GridStackView',
                                                  viewConfig: {
                                                      gridAttr: {
                                                          defaultWidth: 6,
                                                          defaultHeight: 8
                                                      },
                                                      widgetCfgList: [
                                                            {
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
                                                                                             yAxisLabel: ctwl.CONFIG_NODE_TOP_5_USER_AGENTS,
                                                                                             groupBy: 'api_stats.useragent',
                                                                                             limit: 5,
                                                                                             yField: 'COUNT(api_stats)',
                                                                                             margin: {
                                                                                                 left: 40,
                                                                                                 top: 20,
                                                                                                 right: 0,
                                                                                                 bottom: 40
                                                                                             }
                                                                                         }
                                                                                     }
                                                                                 })
                                                                            ]
                                                                        }]
                                                                    }
                                                                },itemAttr: {
                                                                    title: ctwl.CONFIG_NODE_TOP_5_USER_AGENTS
                                                                }
                                                            },{
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
                                                                                             yAxisLabel: ctwl.CONFIG_NODE_TOP_5_OBJECT,
                                                                                             groupBy: 'api_stats.object_type',
                                                                                             limit: 5,
                                                                                             yField: 'COUNT(api_stats)',
                                                                                             margin: {
                                                                                                 left: 40,
                                                                                                 top: 20,
                                                                                                 right: 0,
                                                                                                 bottom: 40
                                                                                             }
                                                                                         }
                                                                                     }
                                                                                 })
                                                                            ]
                                                                        }]
                                                                    }
                                                                },itemAttr: {
                                                                    title: ctwl.CONFIG_NODE_TOP_5_OBJECT
                                                                }
                                                            }, {
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
                                                                                             yAxisLabel:ctwl.CONFIG_NODE_TOP_REMOTE_IP,
                                                                                             groupBy: 'api_stats.remote_ip',
                                                                                             limit: 5,
                                                                                             yField: 'COUNT(api_stats)',
                                                                                             margin: {
                                                                                                 left: 40,
                                                                                                 top: 20,
                                                                                                 right: 0,
                                                                                                 bottom: 40
                                                                                             }
                                                                                         }
                                                                                     }
                                                                                 })
                                                                            ]
                                                                        }]
                                                                    }
                                                                },itemAttr: {
                                                                    title: ctwl.CONFIG_NODE_TOP_REMOTE_IP,
                                                                }
                                                            }, {
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
                                                                                             yAxisLabel: ctwl.CONFIG_NODE_TOP_5_PROJECTS,
                                                                                             groupBy: 'api_stats.project_name',
                                                                                             limit: 5,
                                                                                             yField: 'COUNT(api_stats)',
                                                                                             margin: {
                                                                                                 left: 40,
                                                                                                 top: 20,
                                                                                                 right: 0,
                                                                                                 bottom: 40
                                                                                             }
                                                                                         }
                                                                                     }
                                                                                 })
                                                                            ]
                                                                        }]
                                                                    }
                                                                },itemAttr: {
                                                                    title: ctwl.CONFIG_NODE_TOP_5_PROJECTS
                                                                }
                                                            }, {
                                                                modelCfg: new ConfigNodeListModel(),
                                                                viewCfg: {
                                                                    title : ctwl.CONFIGNODE_SUMMARY_TITLE,
                                                                    view : "ConfigNodeSummaryGridView",
                                                                    viewPathPrefix:
                                                                        ctwl.CONFIGNODE_VIEWPATH_PREFIX,
                                                                    app : cowc.APP_CONTRAIL_CONTROLLER,
                                                                    viewConfig : {
                                                                        colorFn: colorFn
                                                                    }
                                                                },
                                                                itemAttr: {
                                                                    width: 2,
                                                                }
                                                            }
                                                      ]
                                                  }
                                              }
                                          },{
                                              page: {
                                                  elementId : 'config-node-grid-stackview-2',
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
                                                                  where: 'process_mem_cpu_usage.__key = contrail-config-nodemgr'
                                                              }),
                                                              viewCfg: $.extend(true, {}, monitorInfraConstants.defaultLineChartViewCfg, {
                                                                  elementId : 'config_node_node_manager_cpu_share',
                                                                  viewConfig: {
                                                                      chartOptions: {
                                                                          yFormatter: d3.format('.2f'),
                                                                          yAxisLabel: ctwl.CONFIG_NODE_NODE_MANAGER_CPU_SHARE,
                                                                          groupBy: 'name',
                                                                          colors: colorFn,
                                                                          yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                                                          title: ctwl.CONFIGNODE_SUMMARY_TITLE,
                                                                      }
                                                                  }
                                                              }),
                                                              itemAttr: {
                                                                 title: ctwl.CONFIG_NODE_NODE_MANAGER_CPU_SHARE
                                                              }
                                                          },{
                                                              modelCfg: monitorInfraUtils.getStatsModelConfig({
                                                                  table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                                                                  select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                                                                  where: 'process_mem_cpu_usage.__key = contrail-schema'
                                                              }),
                                                              viewCfg: $.extend(true, {}, monitorInfraConstants.defaultLineChartViewCfg, {
                                                                  elementId : 'config_node_schema_cpu_share',
                                                                  viewConfig: {
                                                                      chartOptions: {
                                                                          yFormatter: d3.format('.2f'),
                                                                          yAxisLabel: ctwl.CONFIG_NODE_SCHEMA_CPU_SHARE,
                                                                          groupBy: 'name',
                                                                          colors: colorFn,
                                                                          yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                                                          title: ctwl.CONFIGNODE_SUMMARY_TITLE,
                                                                      }
                                                                  }
                                                              }),itemAttr: {
                                                                  title: ctwl.CONFIG_NODE_SCHEMA_CPU_SHARE
                                                              }
                                                          },{
                                                              modelCfg: monitorInfraUtils.getStatsModelConfig({
                                                                  table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                                                                  select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                                                                  where: 'process_mem_cpu_usage.__key = contrail-discovery:0'
                                                              }),
                                                              viewCfg: $.extend(true, {}, monitorInfraConstants.defaultLineChartViewCfg, {
                                                                  elementId : 'config_node_discovery_cpu_share',
                                                                  viewConfig: {
                                                                      chartOptions: {
                                                                          yFormatter: d3.format('.2f'),
                                                                          yAxisLabel: ctwl.CONFIG_NODE_DISCOVERY_CPU_SHARE,
                                                                          groupBy: 'name',
                                                                          colors: colorFn,
                                                                          yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                                                          title: ctwl.CONFIGNODE_SUMMARY_TITLE,
                                                                      }
                                                                  }
                                                              }),
                                                              itemAttr: {
                                                                  title: ctwl.CONFIG_NODE_DISCOVERY_CPU_SHARE
                                                              }
                                                          },{
                                                              modelCfg: monitorInfraUtils.getStatsModelConfig({
                                                                  table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                                                                  select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                                                                  where: 'process_mem_cpu_usage.__key = contrail-api:0'
                                                              }),
                                                              viewCfg: $.extend(true, {}, monitorInfraConstants.defaultLineChartViewCfg, {
                                                                  elementId : 'config_node_api_cpu_share',
                                                                  viewConfig: {
                                                                      chartOptions: {
                                                                          yFormatter: d3.format('.2f'),
                                                                          yAxisLabel: ctwl.CONFIG_NODE_API_CPU_SHARE,
                                                                          groupBy: 'name',
                                                                          colors: colorFn,
                                                                          yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                                                          title: ctwl.CONFIGNODE_SUMMARY_TITLE,
                                                                      }
                                                                  }
                                                              }),
                                                              itemAttr: {
                                                                  title: ctwl.CONFIG_NODE_API_CPU_SHARE
                                                              }
                                                          },{
                                                              modelCfg: new ConfigNodeListModel(),
                                                              viewCfg: {
                                                                  title : ctwl.CONFIGNODE_SUMMARY_TITLE,
                                                                  view : "ConfigNodeSummaryGridView",
                                                                  viewPathPrefix:
                                                                      ctwl.CONFIGNODE_VIEWPATH_PREFIX,
                                                                  app : cowc.APP_CONTRAIL_CONTROLLER,
                                                                  viewConfig : {
                                                                      colorFn: colorFn
                                                                  }
                                                              },
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
                    elementId : cowu.formatElementId(
                        [ctwl.CONFIGNODE_SUMMARY_LIST_SECTION_ID ]),
                    view : "SectionView",
                    viewConfig : viewConfig
                };
            }
            return ConfigNodeListView;
        });
