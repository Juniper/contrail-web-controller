/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view', 'contrail-list-model', 'cf-datasource', 'monitor-infra-vrouter-model'],
        function(_, ContrailView, ContrailListModel, CFDataSource, VRouterListModel){
    var VRouterViewConfig = function () {
        var self = this;
        self.vRouterListModel = new ContrailListModel({data:[]});
        self.vRouterUIListModel = new ContrailListModel({data:[]});
        self.currentRegion = null;
        self.isRegionChanged = function() {
            var currentRegionFromCookie = contrail.getCookie('region');
            if (self.currentRegion != currentRegionFromCookie) {
                self.currentRegion = currentRegionFromCookie;
                return true;
            } else {
                return false;
            }
        };
        self.populateVRouterListModels = function() {
            self.vRouterListModel = new ContrailListModel(VRouterListModel);
            //ListModel that is kept in sync with crossFilter
            self.vRouterUIListModel = new ContrailListModel({data:[]});
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
                cfDataSource.updateData(self.vRouterListModel.getItems());

                cfDataSource.fireCallBacks({source:'fetch'});
            }

            function onUpdatevRouterUIListModel() {
                if(self.vRouterUIListModel.updateFromcrossFilter != true) {
                    var selRecords = self.vRouterUIListModel.getFilteredItems();
                    var selIds = $.map(selRecords,function(obj,idx) {
                        return obj.name;
                    });

                    self.vRouterListModel.updateFromUIListModel = true;
                    //Apply filter only if filteredRows is < totalRows else remove the filter
                    if(self.vRouterUIListModel.getFilteredItems().length < self.vRouterUIListModel.getItems().length) {
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
                    self.vRouterUIListModel.updateFromcrossFilter = false;
                }
            }

            //As cfDataSource is core one,triggered whenever filters applied/removed
            //If udpate is triggered from
            //  1. vRouterListModel, update both crossfilter & grid
            //  2. crossfilter, update grid
            //  3. grid, update crossfilter
            cfDataSource.addCallBack('updateCFListModel',function(data) {
                self.vRouterUIListModel.updateFromcrossFilter = false;
                //Update listUIModel with crossfilter data
                if(data['cfg']['source'] != 'grid') {
                    //Need to get the data after filtering from dimensions other than gridFilter
                    var currGridFilter = cfDataSource.removeFilter('gridFilter');
                    self.vRouterUIListModel.setData(cfDataSource.getDimension('gridFilter').top(Infinity).sort(dashboardUtils.sortNodesByColor));
                    if(currGridFilter != null) {
                        cfDataSource.applyFilter('gridFilter',currGridFilter);
                    }
                }
                if(data['cfg']['source'] == 'crossFilter')
                    self.vRouterUIListModel.updateFromcrossFilter = true;
            });

            //Need to trigger/register the event once callbacks are registered
            self.vRouterListModel.onDataUpdate.subscribe(onUpdatevRouterListModel);
            //Adding grid search filter
            self.vRouterUIListModel.onDataUpdate.subscribe(onUpdatevRouterUIListModel);
            if(self.vRouterListModel.loadedFromCache) {
                onUpdatevRouterListModel();
            }
        }
        self.viewConfig = {
             "vrouter-flow-rate-area-chart": {
                baseModel: 'VROUTER_FLOW_RATE_MODEL',
                modelCfg: {
                    
                },
                viewCfg: {
                     elementId: 'flow_rate_area_chart',
                     view: 'LineWithFocusChartView',
                     viewConfig: {
                         chartOptions: {
                             title: ctwl.VROUTER_ACTIVE_FLOWS_DROPS_LABEL,
                             subTitle: "Sampled Active Flows across vRouters",
                             colors: cowc.FIVE_NODE_COLOR,
                             xAxisLabel: '',
                             forceY: [0, 5],
                             yFormatter: function(y) {
                                 return _.isNaN(y)? y : parseInt(y);
                             },
                             groupBy: null,
                             yAxisLabel: ctwl.VROUTER_ACTIVE_FLOWS_DROPS_LABEL,
                             yField: 'MAX(flow_rate.active_flows)'
                         }
                     }
                },
                itemAttr: {
                    title: ctwl.VROUTER_ACTIVE_FLOWS_DROP_STATS,
                    height: 1,
                    width: 2/3
                }
             },
             "vrouter-cpu-mem-scatter-chart": {
                 baseModel: 'VROUTER_LIST_MODEL',
                 modelCfg: {

                 },
                 viewCfg: {
                     elementId: 'vrouter-cpu-mem-chart',
                     view: "ZoomScatterChartView",
                     viewConfig: {
                         chartOptions: {
                             xLabel: 'Agent CPU Share (%)',
                             yLabel: 'Agent Memory (MB)',
                             xFormatter: function(x) {
                                 return cowu.numberFormatter(x,0);
                             },
                             bubbleCfg: {
                                 defaultMaxValue: monitorInfraConstants.VROUTER_DEFAULT_MAX_THROUGHPUT
                             },
                             showColorFilter: false,
                             bucketTooltipFn: monitorInfraUtils.vRouterBucketTooltipFn,
                             clickCB: monitorInfraUtils.onvRouterDrillDown,
                             tooltipConfigCB: monitorInfraUtils.vRouterTooltipFn
                         }
                     }
                 },
                 itemAttr: {
                     title: ctwl.VROUTER_CPU_MEM_UTILIZATION,
                     height: 1,
                     width: 1/3
                 }
             },
             "vrouter-drop-packets-chart": {                 
                 baseModel: 'VROUTER_DROP_PACKET_MODEL',
                 modelCfg: {

                 },
                 viewCfg: {
                      elementId: 'drop_packets_chart',
                      view: 'LineWithFocusChartView',
                      viewConfig: {
                          chartOptions: {
                              title: ctwl.VROUTER_DROP_PACKETS,
                              subTitle: " Packet Drops across vRouters",
                              colors: monitorInfraConstants.VROUTER_DROP_PACKETS_COLORS,
                              staticColor: true,
                              xAxisLabel: '',
                              forceY: [0, 5],
                              yFormatter: function(y) {
                                  return _.isNaN(y)? y : parseInt(y);
                              },
                              groupBy: null,
                              yField: 'SUM(drop_stats.ds_drop_pkts)',
                              yAxisLabel: ctwl.VROUTER_DROP_PACKETS
                          }
                      }
                 },
                 itemAttr: {
                     title: ctwl.VROUTER_DROP_PACKETS,
                     height: 0.7,
                     width: 1/3
                 }
             },
             "vrouter-bandwidth-percentile-chart": function() {
                 return {
                     modelCfg: {
                        source: "STATTABLE",
                        type: 'vRouter',
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
                      elementId: 'band-in-out-chart',
                      view: "LineWithFocusChartView",
                      viewConfig: {
                          parseFn: cowu.parsePercentilesData,
                          chartOptions: {
                              colors: cowc.FIVE_NODE_COLOR,
                              title: 'Bandwidth Utilization',
                              subTitle: 'vRouter Bandwidth in/out (95th Percentile)',
                              xAxisLabel: '',
                              yAxisLabel: ctwl.VROUTER_BANDWIDTH_PERCENTILE,
                              yLabels: ['Bandwidth In', 'Bandwidth Out'],
                              yUnit: 'bps',
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
                      width: 1/3
                    }
                 }
             },
             "vrouter-system-cpu-percentiles-chart": {
                     baseModel: 'SYSTEM_CPU_PERCENTILES_MODEL',
                     modelCfg: {
                        type: 'vRouter',
                        modelId: 'VROUTER_SYSTEM_CPU_PERCENTILES_MODEL',
                        config: {
                            where: 'node-type = vrouter'
                        }
                     },
                     viewCfg: {
                         view: "LineWithFocusChartView",
                         elementId: 'system-cpu-chart',
                         viewConfig: {
                             parseFn: cowu.parsePercentilesData,
//                             parseFn : function(data, chartOptions) {
//                                 var data = cowu.parsePercentilesDataForStack(data,chartOptions);
//                                 return cowu.chartDataFormatter(data, chartOptions);
//                             },
                             chartOptions: {
                                 title: ctwl.VROUTER_SYSTEM_CPU_PERCENTILES,
                                 subTitle: ctwl.VROUTER_MIN_MAX_CPU_UTILIZATION,
                                 colors: cowc.THREE_NODE_COLOR,
                                 xAxisLabel: '',
//                                 yField: 'percentileValue',
                                 yAxisLabel: ctwl.VROUTER_SYSTEM_CPU_PERCENTILES,
//                                 groupBy:'Source',
                                 yFields: monitorInfraUtils.getYFieldsForPercentile('system_cpu_usage.cpu_share')
                             }
                         }
                     },
                     itemAttr: {
                         title: ctwl.VROUTER_SYSTEM_CPU_PERCENTILES,
                         height: 0.7,
                         width: 1/3
                     }
             },
             "vrouter-system-memory-percentiles-chart": {
                baseModel: 'SYSTEM_MEMORY_PERCENTILES_MODEL',
                modelCfg: {
                    type: 'vRouter',
                    modelId: 'VROUTER_SYSTEM_MEMORY_PERCENTILE_MODEL',
                    config: {
                        where: 'node-type = vrouter'
                    }
                },
                viewCfg: {
                    view: "LineWithFocusChartView",
                    elementId: 'system-memory-chart',
                    viewConfig: {
                        parseFn: cowu.parsePercentilesData,
//                             parseFn : function(data, chartOptions) {
//                                 var data = cowu.parsePercentilesDataForStack(data,chartOptions);
//                                 return cowu.chartDataFormatter(data, chartOptions);
//                             },
                        chartOptions: {
                            title: ctwl.VROUTER_SYSTEM_MEMORY_PERCENTILES,
                            xAxisLabel: '',
                            colors: cowc.THREE_NODE_COLOR,
                            yAxisLabel: ctwl.VROUTER_SYSTEM_MEMORY_PERCENTILES,
                            subTitle: "Max Avg Min Memory Utilization",
//                                 groupBy:'Source',
//                                 yField: 'percentileValue',
                            yFields: monitorInfraUtils.getYFieldsForPercentile('system_mem_usage.used'),
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
                    width: 1/3
                }
             },
             /*"vrouter-summary-grid": {
                 baseModel: 'VROUTER_LIST_MODEL',
                 baseView: 'VROUTER_GRID_VIEW',
                 viewCfg: {
                     class: "y-overflow-scroll",
                     title: ctwl.VROUTER_SUMMARY_TITLE,
                     viewConfig: {
                         colorFn: {},
                         cssClass: "y-overflow-scroll"
                     }
                 },
                 itemAttr: {
                    height: 10
                 }                 
             },*/
             "vrouter-summary-grid" : function(cfg,i) {
                 if(self.vRouterListModel == null || self.isRegionChanged() || i == 0) {
                    self.populateVRouterListModels();
                 }
                 return {
                     modelCfg: {listModel: self.vRouterUIListModel},
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
             "vrouter-system-cpu-mem-chart": {
                 baseModel: 'VROUTER_LIST_MODEL',
                 modelCfg: {
                     
                 },
                 viewCfg: {
                     elementId: 'vrouter-system-cpu-mem-chart',
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
                             yUnit: 'bytes',
                             sizeField: 'size',
                             showColorFilter: false,
                             bucketTooltipFn: monitorInfraUtils.vRouterBucketTooltipFn,
                             tooltipConfigCB: function(currObj,format) {
                                 var options = {};
                                 options['tooltipContents'] = [
                                       {label: 'Host Name', value: currObj['name']},
                                       {label: 'Version', value: currObj['version']},
                                       {label: 'System CPU Share (%)', value: getValueByJsonPath(currObj,'NodeStatus;system_cpu_usage;cpu_share','-')},
                                       {label: 'System Memory (GB)', value: function(){
                                               var mem = getValueByJsonPath(currObj,'NodeStatus;system_mem_usage;used','-');
                                               mem = $.isNumeric(mem) ? parseFloat(
                                                       parseFloat(mem / 1024).toFixed(2)) : NaN;
                                               return formatBytes(mem * 1024 * 1024);
                                           }()
                                       },
                                       {label: 'Virtual Networks', value: currObj['vnCnt']},
                                       {label: 'Instances', value: currObj['instCnt']},
                                       {label: 'Interfaces', value: currObj['intfCnt']}
                                   ];
                                 return monitorInfraUtils.getVRouterScatterChartTooltipFn(currObj,format,options);
                             },
                             clickCB: monitorInfraUtils.onvRouterDrillDown
                         }
                     }
                 },
                 itemAttr: {
                     title: ctwl.VROUTER_SYSTEM_CPU_MEMORY,
                     height: 1,
                     width: 0.5
                 }
             },
             "vrouter-vn-int-inst-chart": {
                 baseModel: 'VROUTER_LIST_MODEL',
                 modelCfg: {

                 },
                 viewCfg: {
                     elementId: 'vrouter-vn-int-chart',
                     view: 'ZoomScatterChartView',
                     viewConfig: {
                         chartOptions: {
                             xField: 'vnCnt',
                             yField: 'instCnt',
                             xLabel: 'Virtual Networks',
                             yLabel: 'Instances',
                             sizeField: 'intfCnt',
                             showColorFilter: false,
                             xFormatter: function(x) {
                                 return cowu.numberFormatter(x,0);
                             },
                             bucketTooltipFn: monitorInfraUtils.vRouterBucketTooltipFn,
                             tooltipConfigCB: function(currObj,format) {
                                 var options = {};
                                 options['tooltipContents'] = [
                                       {label: 'Host Name', value: currObj['name']},
                                       {label: 'Version', value: currObj['version']},
                                       {label: 'Virtual Networks', value: currObj['vnCnt']},
                                       {label: 'Instances', value: currObj['instCnt']},
                                       {label: 'Interfaces', value: currObj['intfCnt']}
                                   ];
                                 return monitorInfraUtils.getVRouterScatterChartTooltipFn(currObj,format,options);
                             },
                             clickCB: monitorInfraUtils.onvRouterDrillDown
                         },
                         cfDataSource: self.cfDataSource
                     }
                 },
                 itemAttr: {
                     title: ctwl.VROUTER_VN_INTF_INST,
                     height: 1,
                     width: 0.5
                 }
             },
             "vrouter-agent-cpu-percentiles-chart": {
                 baseModel: 'VROUTER_AGENT_CPU_PERCENTILES_MODEL',
                 modelCfg: {
                 },
                 viewCfg: {
                     elementId: 'agent-cpu-share-chart',
                     view: 'LineWithFocusChartView',
                     viewConfig: {
                         parseFn: cowu.parsePercentilesData,
                         chartOptions: {
                             title: ctwl.VROUTER_AGENT_CPU_PERCENTILES,
                             subTitle: ctwl.VROUTER_MIN_MAX_CPU_UTILIZATION,
                             colors: cowc.THREE_NODE_COLOR,
                             xAxisLabel: '',
                             yAxisLabel: ctwl.VROUTER_AGENT_CPU_PERCENTILES,
                             yFields: monitorInfraUtils.getYFieldsForPercentile('process_mem_cpu_usage.cpu_share'),
                             yFormatter: function(y) {
                                 return y;
                             }
                         }
                     }
                 },
                 itemAttr: {
                     title: ctwl.VROUTER_AGENT_CPU_PERCENTILES,
                     height: 0.7,
                     width: 1/3
                 }
             },
             "vrouter-agent-mem-usage-percentiles-chart": {
                 baseModel: 'VROUTER_AGENT_MEMORY_PERCENTILES_MODEL',
                 modelCfg: {
                    
                 },
                 viewCfg: {
                     elementId: 'agent-memory-chart',
                     view: 'LineWithFocusChartView',
                     viewConfig: {
                         parseFn: cowu.parsePercentilesData,
                         chartOptions: {
                             title: ctwl.VROUTER_AGENT_MEMORY_PERCENTILES,
                             subTitle: "Max Avg Min Memory Utilization",
                             colors: cowc.THREE_NODE_COLOR,
                             xAxisLabel: '',
                             yAxisLabel: ctwl.VROUTER_AGENT_MEMORY_PERCENTILES,
                             yFields: monitorInfraUtils.getYFieldsForPercentile('process_mem_cpu_usage.mem_res'),
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
                     width: 1/3
                 }
             },
             "vrouter-active-flows-percentiles-chart": {
                 baseModel: 'VROUTER_ACTIVE_FLOWS_PERCENTILE_MODEL',
                 modelCfg: {
                    
                 },
                 viewCfg: {
                     elementId: 'active-flows-chart',
                     view: 'LineWithFocusChartView',
                     viewConfig: {
                         parseFn: cowu.parsePercentilesData,
                         chartOptions: {
                             title: 'Active Flows Percentiles',
                             subTitle: "Max Avg Min Flow Count",
                             colors: cowc.THREE_NODE_COLOR,
                             xAxisLabel: '',
                             yAxisLabel: 'Active Flows Percentiles',
                             yFields: monitorInfraUtils.getYFieldsForPercentile('flow_rate.active_flows')
                         }
                     }
                 },
                 itemAttr: {
                     title: ctwl.VROUTER_ACTIVE_FLOWS_PERCENTILES,
                     height: 0.7,
                     width: 1/3
                 }
             },
             "vrouter-summary-cpu-mem-scatter-chart" : function(cfg,i) {
                 if(self.vRouterListModel == null || self.isRegionChanged() || i == 0) {
                    self.populateVRouterListModels();
                 }
                 return {
                     modelCfg: {listModel:self.vRouterUIListModel},
                     viewCfg: {
                         elementId : 'vrouter-cpu-mem-chart',
                         view:"ZoomScatterChartView",
                         viewConfig: {
                             widgetConfig: {
                                 elementId: ctwl.VROUTER_SUMMARY_CHART_ID + '-widget',
                                 view: "WidgetView",
                                 viewConfig: {
                                     header: {
                                         title: ctwl.VROUTER_SUMMARY_TITLE,
                                         // iconClass: "icon-search"
                                     },
                                     controls: {
                                         top: {
                                             default: {
                                                 collapseable: false
                                             }
                                         }
                                     }
                                 }
                             },
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
                             cfDataSource : self.cfDataSource
                         }
                     },
                     itemAttr: {
                         title: ctwl.VROUTER_CPU_MEM_UTILIZATION,
                         height: 1.5,
                         width: 2
                     }
                 }
            },
            "vrouter-crossfilters-chart" : function(cfg,i) {
                 if(self.vRouterListModel == null || self.isRegionChanged() || i == 0) {
                    self.populateVRouterListModels();
                 }
                 return {
                     modelCfg: {listModel: self.vRouterUIListModel},
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
            }
        }
        self.getViewConfig = function(id) {
            return self.viewConfig[id]();
        };
    }
    return (new VRouterViewConfig()).viewConfig;
});
