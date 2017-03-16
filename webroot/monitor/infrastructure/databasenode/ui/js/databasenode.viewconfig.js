/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view', 'legend-view', 'monitor-infra-databasenode-model', 'node-color-mapping', 'monitor-infra-viewconfig'],
        function(_, ContrailView, LegendView, databaseNodeListModelCfg, NodeColorMapping, monitorInfraViewConfig){
    var DatabseNodeViewConfig = function () {
        var nodeColorMapping = new NodeColorMapping(),
        colorFn = nodeColorMapping.getNodeColorMap;
        var self = this;
        self.viewConfig = {
            'databsenode-percentile-bar-view': function (){
                return {
                    modelCfg:{
                        modelId: 'DATABASENODE_LIST_MODEL',
                        config: databaseNodeListModelCfg,
                    },
                    viewCfg: {
                        elementId :ctwl.DATABASENODE_PERCENTILE_BAR_VIEW,
                        title : '',
                        view : "PercentileBarView",
                        viewPathPrefix:
                            ctwl.DATABASENODE_VIEWPATH_PREFIX,
                        app : cowc.APP_CONTRAIL_CONTROLLER,
                        viewConfig : {
                        }
                },
                    itemAttr: {
                        height:0.30
                    }
                }
            },
            'databasenode-cpu-share': function (){
                return {
                    modelCfg: {
                        modelId: 'DATABASENODE_CPU_SHARE',
                        source:'STATTABLE',
                        config: {
                            table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                            select: 'name, T=, MAX(process_mem_cpu_usage.mem_res), MAX(process_mem_cpu_usage.cpu_share)',
                            where:'process_mem_cpu_usage.__key = cassandra'
                        }
                     },
                     viewCfg: {
                         elementId : ctwl.DATABASENODE_CPU_SHARE_LINE_CHART_ID,
                         view:'LineWithFocusChartView',
                         viewConfig: {
                             chartOptions: {
                                 yAxisLabel: ctwl.DATABSE_NODE_CPU_SHARE,
                                 subTitle:ctwl.CPU_SHARE_PERCENTAGE,
                                 groupBy: 'name',
                                 yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                 colors: colorFn,
                                 title: ctwl.DATABASENODE_SUMMARY_TITLE,
                                 yTickFormat: cpuChartYTickFormat,
                                 yFormatter : function(d){
                                     return d;
                                 },
                             }
                         }
                     },
                     itemAttr: {
                         title: ctwl.DATABSE_NODE_CPU_SHARE,
                     }
                }
            },
            'databasenode-memory': function (){
                return {
                  modelCfg: {
                      modelId: 'DATABASENODE_CPU_SHARE',
                      source:'STATTABLE',
                      config: {
                          table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                          select: 'name, T=, MAX(process_mem_cpu_usage.mem_res), MAX(process_mem_cpu_usage.cpu_share)',
                          where:'process_mem_cpu_usage.__key = cassandra'
                      }
                   },
                   viewCfg: {
                       elementId : ctwl.DATABASENODE_MEM_SHARE_LINE_CHART_ID,
                       view:'LineWithFocusChartView',
                       viewConfig: {
                           chartOptions: {
                                   yAxisLabel: 'Cassandra Memory Usage',
                                   subTitle:ctwl.CPU_SHARE_PERCENTAGE,
                                   groupBy: 'name',
                                   yField: 'MAX(process_mem_cpu_usage.mem_res)',
                                   colors: colorFn,
                                   title: ctwl.DATABASENODE_SUMMARY_TITLE,
                                   yFormatter : function(d){
                                       return formatBytes(d * 1024, true);
                                   },
                                   //xFormatter: xCPUChartFormatter,
                            }
                        }
                   },
                   itemAttr: {
                       title: ctwl.DATABSE_NODE_MEMORY,
                   }
                }
            },
            'databasenode-system-cpu-share': function (cfg) {
                var config = monitorInfraViewConfig['system-cpu-share'](cfg);
                return $.extend(true, config,{
                    viewCfg: {
                        viewConfig: {
                            chartOptions: {
                                colors:colorFn
                            }
                        }
                    }
                });
            },
            'databasenode-system-memory-usage': function (cfg) {
                var config = monitorInfraViewConfig['system-memory-usage'](cfg);
                return $.extend(true, config, {
                    viewCfg: {
                        viewConfig: {
                            chartOptions: {
                                colors:colorFn
                            }
                        }
                    }
                });
            },
            'databasenode-disk-usage-info': function (cfg) {
                var config = monitorInfraViewConfig['disk-usage-info'](cfg);
                return $.extend(true, config, {
                    viewCfg: {
                        viewConfig: {
                            chartOptions: {
                                colors:colorFn
                            }
                        }
                    }
                });
            },
            'databasenode-pending-compactions': function (){
                return {
                    modelCfg: {
                        source:'STATTABLE',
                        modelId: 'DATABASENODE_PENDING_COMPACTIONS',
                        config: {
                            table_name: 'StatTable.CassandraStatusData.cassandra_compaction_task',
                            select: 'T=, name, MAX(cassandra_compaction_task.pending_compaction_tasks)'
                        }
                    },
                    viewCfg: {
                         elementId : ctwl.DATABASENODE_COMPACTIONS_CHART_ID,
                         view:'StackedBarChartWithFocusView',
                         viewConfig: {
                            chartOptions: {
                                colors: colorFn,
                                title: ctwl.DATABASENODE_SUMMARY_TITLE,
                                subTitle:"Pending compactions per DB (in 3 mins)",
                                yAxisLabel: ctwl.DATABSE_NODE_PENDING_COMPACTIONS,
                                xAxisLabel: '',
                                groupBy: 'name',
                                yField: 'MAX(cassandra_compaction_task.pending_compaction_tasks)',
                            }
                        }
                    },
                    itemAttr: {
                        title: ctwl.DATABSE_NODE_PENDING_COMPACTIONS,
                        height: 1.3,
                    }
                }
            },
            'databasenode-zookeeper': function (){
                return {
                    modelCfg:{
                        source:'STATTABLE',
                        modelId: 'DATABASENODE_ZOO_KEEPER_CPU_SHARE',
                        config: {
                            table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                            select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                            where: 'process_mem_cpu_usage.__key = zookeeper'
                        }
                    },
                    viewCfg:{
                        view:'LineWithFocusChartView',
                        elementId : 'database_node_zookeeper',
                        viewConfig: {
                            chartOptions: {
                                yFormatter: d3.format('.2f'),
                                subTitle:ctwl.CPU_SHARE_PERCENTAGE,
                                yAxisLabel: ctwl.DATABASE_NODE_ZOOKEEPER_CPU_SHARE,
                                groupBy: 'name',
                                colors: colorFn,
                                yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                title: ctwl.DATABASENODE_SUMMARY_TITLE,
                            }
                        }
                    },itemAttr: {
                        title: ctwl.DATABASE_NODE_ZOOKEEPER_CPU_SHARE
                    }
                }
            },
            'databasenode-kafka': function (){
                return {
                    modelCfg: {
                        source:'STATTABLE',
                        modelId: 'DATABASENODE_KAFKA_CPU_SHARE',
                        config: {
                            table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                            select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                            where: 'process_mem_cpu_usage.__key = kafka'
                        }
                    },
                    viewCfg:{
                        view:'LineWithFocusChartView',
                        elementId : 'database_node_kafka',
                        viewConfig: {
                            chartOptions: {
                                yFormatter: d3.format('.2f'),
                                subTitle:ctwl.CPU_SHARE_PERCENTAGE,
                                yAxisLabel: ctwl.DATABASE_NODE_KAFKA_CPU_SHARE,
                                groupBy: 'name',
                                colors: colorFn,
                                yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                title: ctwl.DATABASENODE_SUMMARY_TITLE,
                            }
                        }
                    },itemAttr: {
                        title: ctwl.DATABASE_NODE_KAFKA_CPU_SHARE
                    }
                }
            },
            'database-grid-view': function () {
                return {
                    modelCfg: {
                        modelId: 'DATABASENODE_LIST_MODEL',
                        config: databaseNodeListModelCfg
                    },
                    viewCfg: {
                        elementId : ctwl.DATABASENODE_SUMMARY_GRID_ID,
                        title : ctwl.DATABASENODE_SUMMARY_TITLE,
                        view : "GridView",
                        viewConfig : {
                            elementConfig :
                                getDatabaseNodeSummaryGridConfig('database-grid-view', colorFn)
                        }
                    },
                    itemAttr: {
                        height: 2,
                        width: 2
                    }
                }
            },
        };
        function getDatabaseNodeSummaryGridConfig(widgetId, colorFn) {
            var columns = [
                           {
                               field:"name",
                               name:"Host name",
                               formatter:function(r,c,v,cd,dc) {
                                  return cellTemplateLinks({cellText:'name',
                                      name:'name',
                                      statusBubble:true,
                                      rowData:dc,
                                      tagColorMap:colorFn(_.pluck(cowu.getGridItemsForWidgetId(widgetId), 'name'))});
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
                               minWidth:110,
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
                               field:"formattedAnalyticsDbSize",
                               name:"Analytics DB Size",
                               minWidth:110,
                               sortField:"analyticsDbSize"
                           },
                           {
                               field:"formattedAvailableSpace",
                               name:"Available Space",
                               minWidth:110,
                               sortField:"dbSpaceAvailable"
                           },
                           {
                               field:"formattedUsedSpace",
                               name:"Used Space",
                               minWidth:110,
                               sortField:"dbSpaceUsed"
                           }
                        ];
                        var dbPurgeTemplate = contrail.getTemplate4Id('purge-action-template');
                        var gridElementConfig = {
                            header : {
                                title : {
                                    text : ctwl.DATABASENODE_SUMMARY_TITLE
                                },
                                customControls: [dbPurgeTemplate()]
                            },
                            columnHeader : {
                                columns : columns
                            },
                            body : {
                                options : {
                                  detail : false,
                                  checkboxSelectable : false,
                                  fixedRowHeight: 30
                                },
                                dataSource : {
                                    remote : {
                                        ajaxConfig : {
                                            url : ctwl.DATABASENODE_SUMMARY
                                        }
                                    },
                                    cacheConfig : {
                                        ucid: ctwl.CACHE_DATABASENODE
                                    }
                                },
                                statusMessages: {
                                    loading: {
                                        text: 'Loading Database Nodes..',
                                    },
                                    empty: {
                                        text: 'No Database Nodes Found.'
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
                    type: "databaseNode",
                    view: "details",
                    focusedElement: {
                        node: name,
                        tab: 'details'
                    }
                };
            if(contrail.checkIfKeyExistInObject(true,
                    hashParams, 'clickedElement')) {
                hashObj.clickedElement = hashParams.clickedElement;
            }

            layoutHandler.setURLHashParams(hashObj, {
                p: "mon_infra_database",
                merge: false,
                triggerHashChange: triggerHashChange});

        };
        function xCPUChartFormatter(xValue, tickCnt) {
            var date = xValue > 1 ? new Date(xValue) : new Date();
            if (tickCnt != null) {
               var mins = date.getMinutes();
               date.setMinutes(Math.ceil(mins/15) * 15);
            }
            return d3.time.format('%H:%M')(date);
        }

        function cpuChartYTickFormat(value){
            return d3.format('.2f')(value);
        }
        self.getViewConfig = function(id) {
            return self.viewConfig[id];
        };
    };
    return (new DatabseNodeViewConfig()).viewConfig;
});
