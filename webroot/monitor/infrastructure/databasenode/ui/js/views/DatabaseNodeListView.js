/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view', 'monitor-infra-databasenode-model',
          'node-color-mapping','legend-view'],
        function(
                _, ContrailView, DatabaseNodeListModel, NodeColorMapping,LegendView) {
            var DatabaseNodeListView = ContrailView.extend({
                render : function() {
                    var databaseNodeListModel = new DatabaseNodeListModel(),
                        nodeColorMapping = new NodeColorMapping(),
                        colorFn = nodeColorMapping.getNodeColorMap;
                    this.renderView4Config(this.$el, databaseNodeListModel,
                            getDatabaseNodeListViewConfig(colorFn));
                }
            });

            function getDatabaseNodeListViewConfig(colorFn) {
                var databaseNodeListModel = new DatabaseNodeListModel();
                var viewConfig = {
                    rows : [
                        {
                            columns : [{
                                elementId: 'database-node-carousel-view',
                                view: "CarouselView",
                                viewConfig: {
                                pages : [
                                         {
                                             page: {
                                                 elementId : 'database-node-grid-stackview-0',
                                                 view : "GridStackView",
                                                 viewConfig: {
                                                     gridAttr : {
                                                         defaultWidth : 6,
                                                         defaultHeight : 8
                                                     },
                                                     widgetCfgList: [
                                                         {
                                                             modelCfg: databaseNodeListModel,
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
                                                         },
                                                         {
                                                             modelCfg: monitorInfraUtils.getStatsModelConfig({
                                                                 table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                                                                 select: 'name, T=, MAX(process_mem_cpu_usage.mem_res), MAX(process_mem_cpu_usage.cpu_share)',
                                                                 where:'process_mem_cpu_usage.__key = cassandra'
                                                             }),
                                                             viewCfg: {
                                                                 elementId : ctwl.DATABASENODE_CPU_SHARE_LINE_CHART_ID,
                                                                 view : "LineWithFocusChartView",
                                                                 viewConfig: {
                                                                     class: 'mon-infra-chart chartMargin',
                                                                     chartOptions : {
                                                                         brush: false,
                                                                         height: 225,
                                                                         xAxisLabel: '',
                                                                         yAxisLabel: 'CPU Share (%)',
                                                                         groupBy: 'name',
                                                                         yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                                                         bucketSize: monitorInfraConstants.STATS_BUCKET_DURATION,
                                                                         yFieldOperation: 'average',
                                                                         colors: colorFn,
                                                                         title: ctwl.DATABASENODE_SUMMARY_TITLE,
                                                                         axisLabelDistance : 0,
                                                                         margin: {
                                                                             left: 60,
                                                                             top: 20,
                                                                             right: 15,
                                                                             bottom: 35
                                                                         },
                                                                         tickPadding: 8,
                                                                         hideFocusChart: true,
                                                                         forceY: false,
                                                                         yTickFormat: cpuChartYTickFormat,
                                                                         yFormatter : function(d){
                                                                             return d;
                                                                         },
                                                                         xFormatter: xCPUChartFormatter,
                                                                         showLegend: true,
                                                                         defaultZeroLineDisplay: true,
                                                                         legendView: LegendView
                                                                     }
                                                                 }
                                                             },
                                                             itemAttr: {
                                                                title: ctwl.DATABSE_NODE_CPU_SHARE
                                                             }
                                                         },
                                                         {
                                                             modelCfg: monitorInfraUtils.getStatsModelConfig({
                                                                 table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                                                                 select: 'name, T=, MAX(process_mem_cpu_usage.mem_res), MAX(process_mem_cpu_usage.cpu_share)',
                                                                 where:'process_mem_cpu_usage.__key = cassandra'
                                                             }),
                                                             viewCfg: {
                                                                 elementId : ctwl.DATABASENODE_MEM_SHARE_LINE_CHART_ID,
                                                                 view : "LineWithFocusChartView",
                                                                 viewConfig: {
                                                                     class: 'mon-infra-chart chartMargin',
                                                                     chartOptions : {
                                                                         brush: false,
                                                                         height: 225,
                                                                         xAxisLabel: '',
                                                                         yAxisLabel: 'Memory',
                                                                         groupBy: 'name',
                                                                         yField: 'MAX(process_mem_cpu_usage.mem_res)',
                                                                         bucketSize: monitorInfraConstants.STATS_BUCKET_DURATION,
                                                                         yFieldOperation: 'average',
                                                                         colors: colorFn,
                                                                         title: ctwl.DATABASENODE_SUMMARY_TITLE,
                                                                         axisLabelDistance : 0,
                                                                         margin: {
                                                                             left: 60,
                                                                             top: 20,
                                                                             right: 15,
                                                                             bottom: 50
                                                                         },
                                                                         tickPadding: 8,
                                                                         hideFocusChart: true,
                                                                         forceY: false,
                                                                         yFormatter : function(d){
                                                                             return formatBytes(d * 1024, false);
                                                                         },
                                                                         xFormatter: xCPUChartFormatter,
                                                                         showLegend: true,
                                                                         defaultZeroLineDisplay: true,
                                                                         legendView: LegendView
                                                                     },
                                                                 }
                                                             },
                                                             itemAttr: {
                                                                 title: ctwl.DATABSE_NODE_MEMORY
                                                             }
                                                         },
                                                         {
                                                             modelCfg: monitorInfraUtils.getStatsModelConfig({
                                                                 table_name: 'StatTable.DatabaseUsageInfo.database_usage',
                                                                 select: 'Source, T=, MAX(database_usage.analytics_db_size_1k), MAX(database_usage.disk_space_used_1k)',
                                                                 parser: function(response){
                                                                     var stats = response;
                                                                     $.each(stats, function(idx, obj) {
                                                                         obj['MAX(database_usage.analytics_db_size_1k)'] =
                                                                             ifNull(obj['MAX(database_usage.analytics_db_size_1k)'],0) * 1024; //Converting KB to Bytes
                                                                         obj['MAX(database_usage.disk_space_used_1k)'] =
                                                                             ifNull(obj['MAX(database_usage.disk_space_used_1k)'],0) * 1024;
                                                                     });
                                                                     return stats;
                                                                 }
                                                             }),
                                                             viewCfg: {
                                                                 elementId : ctwl.DATABASENODE_DISK_SPACE_USAGE_CHART_ID,
                                                                 view : "LineWithFocusChartView",
                                                                 viewConfig: {
                                                                     class: 'mon-infra-chart chartMargin',
                                                                     chartOptions : {
                                                                         brush: false,
                                                                         height: 225,
                                                                         xAxisLabel: '',
                                                                         yAxisLabel: 'Disk Space Usage',
                                                                         groupBy: 'Source',
                                                                         yField: 'MAX(database_usage.disk_space_used_1k)',
                                                                         yFieldOperation: 'average',
                                                                         bucketSize: monitorInfraConstants.STATS_BUCKET_DURATION,
                                                                         colors: colorFn,
                                                                         title: ctwl.DATABASENODE_SUMMARY_TITLE,
                                                                         axisLabelDistance : 0,
                                                                         margin: {
                                                                             left: 60,
                                                                             top: 20,
                                                                             right: 15,
                                                                             bottom: 50
                                                                         },
                                                                         tickPadding: 8,
                                                                         hideFocusChart: true,
                                                                         forceY: false,
                                                                         yFormatter : function(d){
                                                                             return formatBytes(d, true);
                                                                         },
                                                                         xFormatter: xCPUChartFormatter,
                                                                         showLegend: true,
                                                                         defaultZeroLineDisplay: true,
                                                                         legendView: LegendView
                                                                     },
                                                                 }
                                                             },
                                                             itemAttr: {
                                                                 title: ctwl.DATABSE_NODE_DISK_SPACE_USAGE
                                                             }
                                                         },

                                                         {
                                                             modelCfg: monitorInfraUtils.getStatsModelConfig({
                                                                 table_name: 'StatTable.CassandraStatusData.cassandra_compaction_task',
                                                                 select: 'T=, name, MAX(cassandra_compaction_task.pending_compaction_tasks)'
                                                             }),
                                                             viewCfg: {
                                                                 elementId : ctwl.DATABASENODE_COMPACTIONS_CHART_ID,
                                                                 view : "StackedBarChartWithFocusView",
                                                                 viewConfig : {
                                                                     class: 'mon-infra-chart chartMargin',
                                                                     chartOptions:{
                                                                         colors: colorFn,
                                                                         height: 240,
                                                                         groupBy: 'name',
                                                                         yField: 'MAX(cassandra_compaction_task.pending_compaction_tasks)',
                                                                         xAxisLabel: '',
                                                                         yAxisLabel: 'Pending Compactions',
                                                                         title: ctwl.DATABASENODE_SUMMARY_TITLE,
                                                                         yAxisOffset: 25,
                                                                         yAxisFormatter: d3.format('d'),
                                                                         tickPadding: 8,
                                                                         margin: {
                                                                             left: 55,
                                                                             top: 20,
                                                                             right: 15,
                                                                             bottom: 55
                                                                         },
                                                                         bucketSize: monitorInfraConstants.STATS_BUCKET_DURATION,
                                                                         showControls: false,
                                                                         showLegend: true,
                                                                         defaultZeroLineDisplay: true
                                                                     },
                                                                }
                                                             },
                                                             itemAttr: {
                                                                 title: ctwl.DATABSE_NODE_PENDING_COMPACTIONS
                                                             }
                                                         },{
                                                             modelCfg: new DatabaseNodeListModel(),
                                                             viewCfg: {
                                                                 elementId : ctwl.DATABASENODE_SUMMARY_GRID_ID,
                                                                 title : ctwl.DATABASENODE_SUMMARY_TITLE,
                                                                 view : "GridView",
                                                                 viewConfig : {
                                                                     elementConfig :
                                                                         getDatabaseNodeSummaryGridConfig()
                                                                 }
                                                             },
                                                             itemAttr: {
                                                                 width: 2
                                                             }
                                                         }
                                                     ]
                                                }
                                             },
                                         }
                                   ]
                                }
                            }]
                        }]
                };
                return {
                    elementId : cowu.formatElementId([
                        ctwl.DATABASENODE_SUMMARY_LIST_SECTION_ID ]),
                    view : "SectionView",
                    viewConfig : viewConfig
                };
            }
            function getDatabaseNodeSummaryGridConfig() {
                var columns = [
                   {
                       field:"name",
                       name:"Host name",
                       formatter:function(r,c,v,cd,dc) {
                          return cellTemplateLinks({cellText:'name',
                              name:'name',
                              statusBubble:true,
                              rowData:dc});
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
            return DatabaseNodeListView;
        });
