/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view','contrail-list-model', 'cf-datasource', 'legend-view', 'monitor-infra-vrouter-model'],
        function(_, ContrailView, ContrailListModel, CFDataSource, LegendView, VRouterListModel){
    var VRouterViewConfig = function () {
        var self = this;
        var vRouterListModel,vRouterUIListModel;   

        self.populateVRouterListModels = function() {
            vRouterListModel = new VRouterListModel();
            self.vRouterListModel = vRouterListModel;
            //ListModel that is kept in sync with crossFilter
            vRouterUIListModel = new ContrailListModel({data:[]});
            var cfDataSource = new CFDataSource();
            self.cfDataSource = cfDataSource;
            //vRouterListModel -> crossFilter(optional) & vRouterUIListModel
            //crossFilter -> vRouterListModel
            //Update cfDataSource on vRouterListModel update

            if(cfDataSource.getDimension('gridFilter') == null) {
                cfDataSource.addDimension('gridFilter',function(d) {
                    return d['name'];
                });
            }
            if(cfDataSource.getDimension('colorFilter') == null) {
                cfDataSource.addDimension('colorFilter',function(d) {
                    return d['color'];
                });
            }

            function onUpdatevRouterListModel() {
                cfDataSource.updateData(vRouterListModel.getItems());

                cfDataSource.fireCallBacks({source:'fetch'});
            }

            function onUpdatevRouterUIListModel() {
                if(vRouterUIListModel.updateFromcrossFilter != true) {
                    var selRecords = vRouterUIListModel.getFilteredItems();
                    var selIds = $.map(selRecords,function(obj,idx) {
                        return obj.name;
                    });

                    self.vRouterListModel.updateFromUIListModel = true;
                    //Apply filter only if filteredRows is < totalRows else remove the filter
                    if(vRouterUIListModel.getFilteredItems().length < vRouterUIListModel.getItems().length) {
                        cfDataSource.applyFilter('gridFilter',function(d) {
                            return $.inArray(d,selIds) > -1;
                        });
                        cfDataSource.fireCallBacks({source:'grid'});
                    } else {
                        //Remove if an earlier filter exists
                        if(cfDataSource.getFilter('gridFilter') != null) {
                            cfDataSource.removeFilter('gridFilter');
                            cfDataSource.fireCallBacks({source:'grid'});
                        }
                    }
                } else {
                    vRouterUIListModel.updateFromcrossFilter = false;
                }
            }

            //As cfDataSource is core one,triggered whenever filters applied/removed
            //If udpate is triggered from
            //  1. vRouterListModel, update both crossfilter & grid
            //  2. crossfilter, update grid
            //  3. grid, update crossfilter
            cfDataSource.addCallBack('updateCFListModel',function(data) {
                vRouterUIListModel.updateFromcrossFilter = false;
                //Update listUIModel with crossfilter data
                if(data['cfg']['source'] != 'grid') {
                    //Need to get the data after filtering from dimensions other than gridFilter
                    var currGridFilter = cfDataSource.removeFilter('gridFilter');
                    vRouterUIListModel.setData(cfDataSource.getDimension('gridFilter').top(Infinity).sort(dashboardUtils.sortNodesByColor));
                    if(currGridFilter != null) {
                        cfDataSource.applyFilter('gridFilter',currGridFilter);
                    }
                }
                if(data['cfg']['source'] == 'crossFilter')
                    vRouterUIListModel.updateFromcrossFilter = true;
            });

            //Need to trigger/register the event once callbacks are registered
            vRouterListModel.onDataUpdate.subscribe(onUpdatevRouterListModel);
            //Adding grid search filter
            vRouterUIListModel.onDataUpdate.subscribe(onUpdatevRouterUIListModel);
            if(vRouterListModel.loadedFromCache) {
                onUpdatevRouterListModel();
            }
        }

        self.viewConfig = {
             "vrouter-flow-rate-area-chart" :  function (){
              return   {
                    modelCfg: {
                        source:"STATTABLE",
                        config: {
                                table_name: 'StatTable.VrouterStatsAgent.flow_rate',
                                select: 'T=, Source, MAX(flow_rate.active_flows)',
                                parser: function(d){return parseDataForFlowsDrops(d,'MAX(flow_rate.active_flows)')},
                            }
                    },
                    viewCfg: {
                         elementId : 'flow_rate_area_chart',
                         view: 'LineWithFocusChartView',
                         viewConfig: {
                             chartOptions: {
                                 title: ctwl.VROUTER_ACTIVE_FLOWS_DROPS_LABEL,
                                 subTitle:"Sampled Active Flows across vRouters",
                                 colors: cowc.FIVE_NODE_COLOR,
                                 xAxisLabel: '',
                                 forceY: [0, 5],
                                 yFormatter: function(y) {
                                     return _.isNaN(y)? y : parseInt(y);
                                 },
                                 groupBy:null,
                                 yAxisLabel: ctwl.VROUTER_ACTIVE_FLOWS_DROPS_LABEL,
                                 yField: 'MAX(flow_rate.active_flows)'
                             }
                         }
                    },
                    itemAttr: {
                        title: ctwl.VROUTER_ACTIVE_FLOWS_DROP_STATS,
                        height: 1,
                        width: 1.4
                    }
                }
             },
             "vrouter-cpu-mem-scatter-chart" : function(){
                 if(self.vRouterListModel == null)
                    self.populateVRouterListModels();
                 return {
                     modelCfg: {listModel:vRouterUIListModel},
                     viewCfg: {
                         elementId : 'vrouter-cpu-mem-chart',
                         view:"ZoomScatterChartView",
                         viewConfig: {
                             chartOptions: {
                                 xLabel: 'Agent CPU Share (%)',
                                 yLabel: 'Agent Memory (MB)',
                                 xFormatter: function(x) {
                                     return cowu.numberFormatter(x,0);
                                 },
                                 bubbleCfg : {
                                     defaultMaxValue : monitorInfraConstants.VROUTER_DEFAULT_MAX_THROUGHPUT
                                 },
                                 showColorFilter:false,
                                 bucketTooltipFn: monitorInfraUtils.vRouterBucketTooltipFn,
                                 clickCB: monitorInfraUtils.onvRouterDrillDown,
                                 tooltipConfigCB: monitorInfraUtils.vRouterTooltipFn
                             },
                             cfDataSource : self.cfDataSource,
                         }
                     },
                     itemAttr: {
                         title: ctwl.VROUTER_CPU_MEM_UTILIZATION,
                         height: 1,
                         width: 0.7
                     }
                 }
             },
             "vrouter-summary-cpu-mem-scatter-chart" : function(){
                 if(self.vRouterListModel == null)
                    self.populateVRouterListModels();
                 return {
                     modelCfg: {listModel:vRouterUIListModel},
                     viewCfg: {
                         elementId : 'vrouter-cpu-mem-chart',
                         view:"ZoomScatterChartView",
                         viewConfig: {
                             chartOptions: {
                                 xLabel: 'CPU Share (%)',
                                 yLabel: 'Memory (MB)',
                                 xFormatter: function(x) {
                                     return cowu.numberFormatter(x,0);
                                 },
                                 bubbleCfg : {
                                     defaultMaxValue : monitorInfraConstants.VROUTER_DEFAULT_MAX_THROUGHPUT
                                 },
                                 showColorFilter:true,
                                 bucketTooltipFn: monitorInfraUtils.vRouterBucketTooltipFn,
                                 clickCB: monitorInfraUtils.onvRouterDrillDown,
                                 tooltipConfigCB: monitorInfraUtils.vRouterTooltipFn
                             },
                             cfDataSource : self.cfDataSource,
                         }
                     },
                     itemAttr: {
                         title: ctwl.VROUTER_CPU_MEM_UTILIZATION,
                         height: 1.5,
                         width: 2
                     }
                 }
             },
             "vrouter-drop-packets-chart": function() {
                 return {

                     modelCfg: {
                         source:"STATTABLE",
                         config: {
                             table_name: 'StatTable.VrouterStatsAgent.drop_stats',
                             select: 'T=, SUM(drop_stats.ds_drop_pkts)'
                         }
                     },
                     viewCfg: {
                          elementId : 'drop_packets_chart',
                          view: 'LineWithFocusChartView',
                          viewConfig: {
                              chartOptions: {
                                  title: ctwl.VROUTER_DROP_PACKETS,
                                  subTitle:" Packet Drops across vRouters",
                                  colors: monitorInfraConstants.VROUTER_DROP_PACKETS_COLORS,
                                  staticColor: true,
                                  xAxisLabel: '',
                                  forceY: [0, 5],
                                  yFormatter: function(y) {
                                      return _.isNaN(y)? y : parseInt(y);
                                  },
                                  groupBy:null,
                                  yField:'SUM(drop_stats.ds_drop_pkts)',
                                  yAxisLabel: ctwl.VROUTER_DROP_PACKETS,
                              }
                          }
                     },
                     itemAttr: {
                         title: ctwl.VROUTER_DROP_PACKETS,
                         height: 0.7,
                         width: 0.7
                     }
                 }
             },
             "vrouter-bandwidth-percentile-chart" : function() {
                 return {
                     modelCfg: {
                        source:"STATTABLE",
                        config: [
                            {
                                table_name: 'StatTable.VrouterStatsAgent.phy_band_in_bps',
                                select: 'T=, PERCENTILES(phy_band_in_bps.__value)'
                            },
                            {
                                table_name: 'StatTable.VrouterStatsAgent.phy_band_out_bps',
                                select: 'T=, PERCENTILES(phy_band_out_bps.__value)',
                                mergeFn: cowu.parseAndMergeStats
                            }
                        ]
                    },
                    viewCfg: {
                      elementId : 'band-in-out-chart',
                      view: "LineWithFocusChartView",
                      viewConfig: {
                          parseFn : cowu.parsePercentilesData,
                          chartOptions: {
                              colors:cowc.FIVE_NODE_COLOR,
                              title: 'Bandwidth Utilization',
                              subTitle: 'vRouter Bandwidth in/out (95th Percentile)',
                              xAxisLabel: '',
                              yAxisLabel: ctwl.VROUTER_BANDWIDTH_PERCENTILE,
                              yLabels: ['Bandwidth In', 'Bandwidth Out'],
                              yFormatter: function(y) {
                                  return formatBytes(y, null, null, null, null, true);
                              },
                              yFields: ['PERCENTILES(phy_band_in_bps.__value);95','PERCENTILES(phy_band_out_bps.__value);95']
                          }
                      }
                    },
                    itemAttr: {
                      title: ctwl.VROUTER_BANDWIDTH_PERCENTILE,
                      height: 0.7,
                      width: 0.7
                    }
                 }
             },
             "vrouter-system-cpu-percentiles-chart" : function(config) {
                 return {
                     modelCfg: {
                        modelId:'VROUTER_SYSTEM_CPU_PERCENTILE_MODEL',
                         source:"STATTABLE",
                         config : [
                                   monitorInfraUtils.getNodeListQueryConfig(config),
                                   {
                                       "table_name": "StatTable.NodeStatus.system_cpu_usage",
                                       "select": "T=, PERCENTILES(system_cpu_usage.cpu_share)",
//                                       "primary_depends" : true,
                                       "getAjaxConfig": function(primaryResponse, postData) {
                                           //Modify post data as required
                                           var whereClause = monitorInfraUtils.getWhereClauseForSystemStats(primaryResponse);
                                           postData['formModelAttrs']['where'] = whereClause;
                                           return {
                                               url : "/api/qe/query",
                                               type: 'POST',
                                               data: JSON.stringify(postData)
                                           }
                                       },
                                       mergeFn: function(response,primaryDS) {
                                           primaryDS.setData([]);
                                           cowu.parseAndMergeStats(response,primaryDS);
                                       }
                                   }
                               ]
                     },
                     viewCfg: {
                         view:"LineWithFocusChartView",
                         elementId : 'system-cpu-chart',
                         viewConfig: {
                             parseFn : cowu.parsePercentilesData,
//                             parseFn : function(data, chartOptions) {
//                                 var data = cowu.parsePercentilesDataForStack(data,chartOptions);
//                                 return cowu.chartDataFormatter(data, chartOptions);
//                             },
                             chartOptions: {
                                 title: ctwl.VROUTER_SYSTEM_CPU_PERCENTILES,
                                 subTitle:ctwl.VROUTER_MIN_MAX_CPU_UTILIZATION,
                                 colors: cowc.THREE_NODE_COLOR,
                                 xAxisLabel: '',
//                                 yField: 'percentileValue',
                                 yAxisLabel: ctwl.VROUTER_SYSTEM_CPU_PERCENTILES,
//                                 groupBy:'Source',
                                 yFields: getYFieldsForPercentile('system_cpu_usage.cpu_share'),
                                 yFormatter: d3.format('.2f')
                             }
                         }
                     },
                     itemAttr: {
                         title: ctwl.VROUTER_SYSTEM_CPU_PERCENTILES,
                         height: 0.7,
                         width: 0.7
                     }
                 }
             },
             "vrouter-system-memory-percentiles-chart" : function(config) {
                 return {
                     modelCfg: {
                         modelId:'VROUTER_SYSTEM_MEMORY_PERCENTILE_MODEL',
                         source:"STATTABLE",
                         config: [
                              monitorInfraUtils.getNodeListQueryConfig(config),
                              {
                                  "table_name": "StatTable.NodeStatus.system_mem_usage",
                                  "select": "T=, PERCENTILES(system_mem_usage.used)",
//                                      "primary_depends" : true,
                                  "getAjaxConfig": function(primaryResponse, postData) {
                                      //Modify post data as required
                                      var whereClause = monitorInfraUtils.getWhereClauseForSystemStats(primaryResponse);
                                      postData['formModelAttrs']['where'] = whereClause;
                                      return {
                                          url : "/api/qe/query",
                                          type: 'POST',
                                          data: JSON.stringify(postData)
                                      }
                                  },
                                  mergeFn: function(response,primaryDS) {
                                      primaryDS.setData([]);
                                      cowu.parseAndMergeStats(response,primaryDS);
                                  }
                              }
                          ]
                     },
                     viewCfg: {
                         view:"LineWithFocusChartView",
                         elementId : 'system-memory-chart',
                         viewConfig: {
                             parseFn : cowu.parsePercentilesData,
//                             parseFn : function(data, chartOptions) {
//                                 var data = cowu.parsePercentilesDataForStack(data,chartOptions);
//                                 return cowu.chartDataFormatter(data, chartOptions);
//                             },
                             chartOptions: {
                                 title: ctwl.VROUTER_SYSTEM_MEMORY_PERCENTILES,
                                 xAxisLabel: '',
                                 colors: cowc.THREE_NODE_COLOR,
                                 yAxisLabel: ctwl.VROUTER_SYSTEM_MEMORY_PERCENTILES,
                                 subTitle:"Max Avg Min Memory Utilization",
//                                 groupBy:'Source',
//                                 yField: 'percentileValue',
                                 yFields: getYFieldsForPercentile('system_mem_usage.used'),
                                 yFormatter: function(y) {
                                     return formatBytes(y * 1024, true, null, null,
                                             null);
                                 }
                             }
                         }
                     },
                     itemAttr: {
                         title: ctwl.VROUTER_SYSTEM_MEMORY_PERCENTILES,
                         height: 0.7,
                         width: 0.7
                     }
                 }
             },
             "vrouter-summary-grid" : function() {
                 if(self.vRouterListModel == null)
                    self.populateVRouterListModels();
                 return {
                     modelCfg: {listModel: vRouterUIListModel},
                     viewCfg: {
                         elementId: ctwl.VROUTER_SUMMARY_GRID_ID,
                         class:"y-overflow-scroll",
                         title: ctwl.VROUTER_SUMMARY_TITLE,
                         view: "VRouterSummaryGridView",
                         viewPathPrefix: ctwl.VROUTER_VIEWPATH_PREFIX,
                         app: cowc.APP_CONTRAIL_CONTROLLER,
                         viewConfig: {
                             cfDataSource : self.cfDataSource,
                             colorFn: {},
                             cssClass:"y-overflow-scroll"
                         }
                     },itemAttr: {
                        height: 10,
                        width: 2
                     }
                 }
             },
             "vrouter-crossfilters-chart" : function() {
                 if(self.vRouterListModel == null) {
                    self.populateVRouterListModels();
                 }
                 return {
                     modelCfg: {listModel: vRouterUIListModel},
                     viewCfg: {
                         elementId: ctwl.VROUTER_SUMMARY_CROSSFILTER_ID,
                         title: ctwl.VROUTER_SUMMARY_TITLE,
                         view: "VRouterCrossFiltersView",
                         viewPathPrefix: ctwl.VROUTER_VIEWPATH_PREFIX,
                         app: cowc.APP_CONTRAIL_CONTROLLER,
                         viewConfig: {
                             vRouterListModel:self.vRouterListModel,
                             cfDataSource: self.cfDataSource,
                             config:[{
                                 field:'vnCnt',
                                 title:'vRouters over Virtual Networks'
                             },
                             {
                                 field:'instCnt',
                                 title:'vRouters over Instances'
                             },{
                                 field:'intfCnt',
                                 title:'vRouters over Interfaces'
                             }
                             ]
                         }
                     },itemAttr: {
                         title: ctwl.VROUTER_CROSSFILTERS,
                         height: 0.5,
                         width: 2
//                         width:0.4
                     }
                 }
             },
             "vrouter-system-cpu-mem-chart" : function() {
                 if(self.vRouterListModel == null)
                    self.populateVRouterListModels();
                 return {
                     modelCfg: {
                         modelId:'VROUTER_LIST_MODEL',
                         listModel: vRouterUIListModel
                     },
                     viewCfg: {
                         elementId : 'vrouter-system-cpu-mem-chart',
                         view: 'ZoomScatterChartView',
                         viewConfig: {
                             chartOptions: {
                                 xField: 'NodeStatus;system_cpu_usage;cpu_share',
                                 xFormatter: function(x) {return $.isNumeric(x) ? x : NaN;},
                                 xLabelFormat: function(x) {return $.isNumeric(x) ? x : NaN;},
                                 yField: 'NodeStatus;system_mem_usage;used',
                                 yFormatter: function(y) {
                                                 return $.isNumeric(y) ? parseFloat(
                                                 parseFloat(y / 1024).toFixed(2)) : NaN;
                                             },
                                 yLabelFormat: function(y) {
                                     return $.isNumeric(y) ? parseFloat(
                                     parseFloat(y / 1024/ 1024).toFixed(2)) : NaN;
                                 },
                                 xLabel: 'System CPU Share (%)',
                                 yLabel: 'System Memory (GB)',
                                 sizeField: 'size',
                                 showColorFilter:false,
                                 bucketTooltipFn: monitorInfraUtils.vRouterBucketTooltipFn,
                                 tooltipConfigCB: function(currObj,format) {
                                     var options = {};
                                     options['tooltipContents'] = [
                                           {label:'Host Name', value: currObj['name']},
                                           {label:'Version', value:currObj['version']},
                                           {label: 'System CPU Share (%)', value:getValueByJsonPath(currObj,'NodeStatus;system_cpu_usage;cpu_share','-')},
                                           {label: 'System Memory (GB)', value:function(){
                                                   var mem = getValueByJsonPath(currObj,'NodeStatus;system_mem_usage;used','-');
                                                   mem = $.isNumeric(mem) ? parseFloat(
                                                           parseFloat(mem / 1024).toFixed(2)) : NaN;
                                                   return formatBytes(mem * 1024 * 1024);
                                               }()
                                           },
                                           {label: 'Virtual Networks', value:currObj['vnCnt']},
                                           {label: 'Instances', value:currObj['instCnt']},
                                           {label: 'Interfaces', value:currObj['intfCnt']}
                                       ];
                                     return monitorInfraUtils.getVRouterScatterChartTooltipFn(currObj,format,options);
                                 },
                                 clickCB: monitorInfraUtils.onvRouterDrillDown,
                             },
                             cfDataSource : self.cfDataSource
                         }
                     },
                     itemAttr: {
                         title: ctwl.VROUTER_SYSTEM_CPU_MEMORY,
                         height: 1,
                     }
                 }
             },
             "vrouter-vn-int-inst-chart" : function() {
                 if(self.vRouterListModel == null)
                    self.populateVRouterListModels();
                 return {
                     modelCfg: {listModel:vRouterUIListModel},
                     viewCfg: {
                         elementId : 'vrouter-vn-int-chart',
                         view: 'ZoomScatterChartView',
                         viewConfig: {
                             chartOptions: {
                                 xField: 'vnCnt',
                                 yField: 'instCnt',
                                 xLabel: 'Virtual Networks',
                                 yLabel: 'Instances',
                                 sizeField : 'intfCnt',
                                 showColorFilter:false,
                                 xFormatter: function(x) {
                                     return cowu.numberFormatter(x,0);
                                 },
                                 bucketTooltipFn: monitorInfraUtils.vRouterBucketTooltipFn,
                                 tooltipConfigCB: function(currObj,format) {
                                     var options = {};
                                     options['tooltipContents'] = [
                                           {label: 'Host Name', value: currObj['name']},
                                           {label: 'Version', value:currObj['version']},
                                           {label: 'Virtual Networks', value:currObj['vnCnt']},
                                           {label: 'Instances', value:currObj['instCnt']},
                                           {label: 'Interfaces', value:currObj['intfCnt']}
                                       ];
                                     return monitorInfraUtils.getVRouterScatterChartTooltipFn(currObj,format,options);
                                 },
                                 clickCB: monitorInfraUtils.onvRouterDrillDown
                             },
                             cfDataSource : self.cfDataSource
                         }
                     },
                     itemAttr: {
                         title: ctwl.VROUTER_VN_INTF_INST,
                         height: 1,
                     }
                 }
             },
             "vrouter-agent-cpu-percentiles-chart" : function() {
                 return {
                     modelCfg: {
                         modelId:'VROUTER_CPU_PERCENTILE_MODEL',
                         source:"STATTABLE",
                         config:{
                             table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                             select: 'T=, PERCENTILES(process_mem_cpu_usage.cpu_share)',
                             where: 'process_mem_cpu_usage.__key = contrail-vrouter-agent'
                         }
                     },
                     viewCfg: {
                         elementId : 'agent-cpu-share-chart',
                         view: 'LineWithFocusChartView',
                         viewConfig: {
                             parseFn : cowu.parsePercentilesData,
                             chartOptions: {
                                 title: ctwl.VROUTER_AGENT_CPU_PERCENTILES,
                                 subTitle:ctwl.VROUTER_MIN_MAX_CPU_UTILIZATION,
                                 colors: cowc.THREE_NODE_COLOR,
                                 xAxisLabel: '',
                                 yAxisLabel: ctwl.VROUTER_AGENT_CPU_PERCENTILES,
                                 yFields: getYFieldsForPercentile('process_mem_cpu_usage.cpu_share'),
                                 yFormatter: d3.format('.2f')
                             }
                         }
                     },
                     itemAttr: {
                         title: ctwl.VROUTER_AGENT_CPU_PERCENTILES,
                         height: 0.7,
                         width: 0.7
                     }
                 }
             },
             "vrouter-agent-mem-usage-percentiles-chart" : function() {
                 return {
                     modelCfg:{
                        modelId:'VROUTER_MEM_PERCENTIL_MODEL',
                         source:"STATTABLE",
                         config:{
                             table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                             select: 'T=, PERCENTILES(process_mem_cpu_usage.mem_res)',
                             where: 'process_mem_cpu_usage.__key = contrail-vrouter-agent'
                         }
                     },
                     viewCfg: {
                         elementId : 'agent-memory-chart',
                         view: 'LineWithFocusChartView',
                         viewConfig: {
                             parseFn : cowu.parsePercentilesData,
                             chartOptions: {
                                 title: ctwl.VROUTER_AGENT_MEMORY_PERCENTILES,
                                 subTitle:"Max Avg Min Memory Utilization",
                                 colors: cowc.THREE_NODE_COLOR,
                                 xAxisLabel: '',
                                 yAxisLabel: ctwl.VROUTER_AGENT_MEMORY_PERCENTILES,
                                 yFields: getYFieldsForPercentile('process_mem_cpu_usage.mem_res'),
                                 yFormatter: function(y) {
                                     return formatBytes(y * 1024, true, null, null,
                                             null);
                                 }
                             }
                         }
                     },
                     itemAttr: {
                         title: ctwl.VROUTER_AGENT_MEMORY_PERCENTILES,
                         height: 0.7,
                         width: 0.7
                     }
                 }
             },
             "vrouter-active-flows-percentiles-chart" : function() {
                 return {
                     modelCfg: {
                        modelId:'VROUTER_ACTIVE_FLOWS_PERCENTILE_MODEL',
                         source:"STATTABLE",
                         config:{
                             table_name: 'StatTable.VrouterStatsAgent.flow_rate',
                             select: 'T=, PERCENTILES(flow_rate.active_flows)'
                         }
                     },
                     viewCfg: {
                         elementId : 'active-flows-chart',
                         view: 'LineWithFocusChartView',
                         viewConfig: {
                             parseFn : cowu.parsePercentilesData,
                             chartOptions: {
                                 title: 'Active Flows Percentiles',
                                 subTitle:"Max Avg Min Flow Count",
                                 colors: cowc.THREE_NODE_COLOR,
                                 xAxisLabel: '',
                                 yAxisLabel: 'Active Flows Percentiles',
                                 yFields: getYFieldsForPercentile('flow_rate.active_flows')
                             }
                         }
                     },
                     itemAttr: {
                         title: ctwl.VROUTER_ACTIVE_FLOWS_PERCENTILES,
                         height: 0.7,
                         width: 0.7
                     }
                 }
             }
        }
        self.getViewConfig = function(id) {
            return self.viewConfig[id]();
        };
        function getYFieldsForPercentile (field) {
            return [
                        'PERCENTILES('+field+');95',
                        'PERCENTILES('+field+');50',
                        'PERCENTILES('+field+');05'
                    ];
        }

        function parseDataForFlowsDrops (response,field) {
            var ret = [];
            var data = getValueByJsonPath(response,'data',[]);
            var groupedByTime = _.groupBy(data,'T=');
            for(var key in groupedByTime) {
                var tmp = {"T=":_.isNaN(key)? key: parseInt(key)};
                var arr = groupedByTime[key];
                var sum = _.reduce(arr,function(memo,num){return memo + num[field]},0);
                tmp[field] = sum;
                ret.push(tmp);
            }
            return ret;
        }

        function getWhereClauseForDropStats() {
            var keycount = monitorInfraConstants.dropStatsKeyList.length;
            var ret = "(";
            $.each(monitorInfraConstants.dropStatsKeyList,function(i,key){
                if(i != keycount -1 ){
                    ret += "drop_stats.__key = "+ key +" OR ";
                } else {
                    ret += "drop_stats.__key = "+ key +")";
                }
            });
            return ret;
        }
    }
    return (new VRouterViewConfig()).viewConfig;
});
