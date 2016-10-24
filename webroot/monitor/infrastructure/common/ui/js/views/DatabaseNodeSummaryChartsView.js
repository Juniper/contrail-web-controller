/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view','monitor-infra-databasenode-model',
       'monitor-infra-databasenode-cpu-mem-model',
       'monitor-infra-analytics-database-usage-model',
       'monitor-infra-databasenode-pending-compact-model',
       'legend-view','gs-view'],
       function(_, ContrailView, DatabaseNodeListModel, DatabaseNodeCPUMemModel, DatabaseUsageModel,
               PendingCompactionModel, LegendView,GridStackView){

    var DatabaseNodesSummaryChartsView = ContrailView.extend({
        render : function (){
            var self = this,
                viewConfig = self.attributes.viewConfig,
                colorFn = viewConfig['colorFn'];
                self.$el.append($("<div class='gs-container'></div>"));
                self.renderView4Config(self.$el.find('.gs-container'),{},getGridStackWidgetConfig(colorFn));
        }
    });
    function getGridStackWidgetConfig(colorFn) {
        var dbCPUMemModel = new DatabaseNodeCPUMemModel(),
        dbUsageModel = new DatabaseUsageModel(),
        pendingCompactModel = new PendingCompactionModel(),
        databaseNodeListModel = new DatabaseNodeListModel();
       return {
           elementId : 'databasenodeGridStackSection',
           view : "SectionView",
           viewConfig : {
               rows : [ {
                   columns : [ {
                       elementId : 'databaseNodeGridStackComponent',
                       view : "GridStackView",
                       viewConfig : {
                            gridAttr : {
                                defaultWidth : 6,
                                defaultHeight : 10
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
                                        width: 2,
                                        height:0.2
                                    }
                                },
                                {
                                    modelCfg: dbCPUMemModel,
                                    viewCfg: getCPUShareChartViewConfig(colorFn)
                                },
                                {
                                    modelCfg: dbCPUMemModel,
                                    viewCfg: getMemShareChartViewConfig(colorFn)
                                },
                                {
                                    modelCfg: dbUsageModel,
                                    viewCfg: getDBDiskSpaceUsageViewConfig(colorFn)
                                },

                                {
                                    modelCfg: pendingCompactModel,
                                    viewCfg: getDBPendingCompactionsViewConfig(colorFn),
                                },{
                                    modelCfg: new DatabaseNodeListModel(),
                                    viewCfg: {
                                        elementId : ctwl.DATABASENODE_SUMMARY_GRID_ID,
                                        title : ctwl.DATABASENODE_SUMMARY_TITLE,
                                        view : "DatabaseNodeSummaryGridView",
                                        viewPathPrefix:ctwl.DATABASENODE_VIEWPATH_PREFIX,
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
                   }]
               }]
           }
       }
   }

    function getCPUShareChartViewConfig(colorFn){
        return {
            elementId : ctwl.DATABASENODE_CPU_SHARE_LINE_CHART_SEC_ID,
            view : "SectionView",
            viewConfig : {
                rows : [{
                    columns : [{
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
                    }]
                }]
            }
        };
    }

    function getMemShareChartViewConfig(colorFn){
        return {
            elementId : ctwl.DATABASENODE_MEM_SHARE_LINE_CHART_SEC_ID,
            view : "SectionView",
            viewConfig : {
                rows : [{
                    columns : [{
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
                    }]
                }]
            }
        };
    }

    function getDBDiskSpaceUsageViewConfig(colorFn){
        return {
            elementId : ctwl.DATABASENODE_DISK_SPACE_USAGE_CHART_SEC_ID,
            view : "SectionView",
            viewConfig : {
                rows : [{
                    columns : [{
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
                    }]
                }]
            }
        };
    }

    function getDBPendingCompactionsViewConfig(colorFn){
        return {
            elementId : ctwl.DATABASENODE_COMPACTIONS_CHART_SEC_ID,
            view : "SectionView",
            viewConfig : {
                rows : [{
                    columns : [ {
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
                   }]
               }]
           }
       };
    }

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

    return DatabaseNodesSummaryChartsView;
});
