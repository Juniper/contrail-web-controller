/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view','monitor-infra-confignode-model', 'node-color-mapping'],
        function(
                _, ContrailView, ConfigNodeListModel, NodeColorMapping) {
            var ConfigNodeListView = ContrailView.extend({
                render : function() {
                    var nodeColorMapping = new NodeColorMapping(),
                        colorFn = nodeColorMapping.getNodeColorMap;

                    this.renderView4Config(this.$el, null,
                            getConfigNodeListViewConfig(colorFn));
                }
            });


            function getConfigNodeListViewConfig(colorFn) {
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
                                                  elementId :ctwl.CONFIGNODE_SUMMARY_CHART_ID,
                                                  title : ctwl.CONFIGNODE_SUMMARY_TITLE,
                                                  view : "ConfigNodeChartsView",
                                                  viewPathPrefix: ctwl.MONITOR_INFRA_VIEW_PATH,
                                                  app : cowc.APP_CONTRAIL_CONTROLLER,
                                                  viewConfig: {
                                                      colorFn: colorFn
                                                  }
                                              },
                                          },{
                                              page: {
                                                  elementId: 'grid-stack-view-page-1',
                                                  view: 'GridStackView',
                                                  viewConfig: {
                                                      gridAttr: {
                                                          defaultWidth: 6,
                                                          defaultHeight: 10
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
                                                                                             title: 'User Agents',
                                                                                             xAxisLabel: '',
                                                                                             yAxisLabel: 'Top User Agents',
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
                                                                                             title: 'Object Types',
                                                                                             xAxisLabel: '',
                                                                                             yAxisLabel: 'Top Object Types',
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
                                                                                             title: "Remote IPs",
                                                                                             xAxisLabel: '',
                                                                                             yAxisLabel: "Top Remote IPs",
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
                                                                                             yAxisLabel: "Top Projects",
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
                                                                    width: 2
                                                                }
                                                            }
                                                      ]
                                                  }
                                              }
                                          },{
                                              page: {
                                                  elementId: 'grid-stack-view-page-2',
                                                  view: 'GridStackView',
                                                  viewConfig: {
                                                      gridAttr: {
                                                          defaultWidth: 6,
                                                          defaultHeight: 10
                                                      },
                                                      widgetCfgList: [
                                                          {
                                                              modelCfg: monitorInfraUtils.getStatsModelConfig({
                                                                  table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                                                                  select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                                                                  where: 'process_mem_cpu_usage.__key = contrail-config-nodemgr'
                                                              }),
                                                              viewCfg: $.extend(true, {}, monitorInfraConstants.defaultLineChartViewCfg, {
                                                                  elementId : ctwl.DATABASENODE_CPU_SHARE_LINE_CHART_ID,
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
                                                          },{
                                                              modelCfg: monitorInfraUtils.getStatsModelConfig({
                                                                  table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                                                                  select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                                                                  where: 'process_mem_cpu_usage.__key = contrail-schema'
                                                              }),
                                                              viewCfg: $.extend(true, {}, monitorInfraConstants.defaultLineChartViewCfg, {
                                                                  elementId : ctwl.DATABASENODE_CPU_SHARE_LINE_CHART_ID,
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
                                                          },{
                                                              modelCfg: monitorInfraUtils.getStatsModelConfig({
                                                                  table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                                                                  select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                                                                  where: 'process_mem_cpu_usage.__key = contrail-discovery:0'
                                                              }),
                                                              viewCfg: $.extend(true, {}, monitorInfraConstants.defaultLineChartViewCfg, {
                                                                  elementId : ctwl.DATABASENODE_CPU_SHARE_LINE_CHART_ID,
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
                                                          },{
                                                              modelCfg: monitorInfraUtils.getStatsModelConfig({
                                                                  table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                                                                  select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                                                                  where: 'process_mem_cpu_usage.__key = contrail-api:0'
                                                              }),
                                                              viewCfg: $.extend(true, {}, monitorInfraConstants.defaultLineChartViewCfg, {
                                                                  elementId : ctwl.DATABASENODE_CPU_SHARE_LINE_CHART_ID,
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
