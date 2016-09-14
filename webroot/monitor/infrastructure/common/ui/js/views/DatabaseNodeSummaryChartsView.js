/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view',
       'monitor-infra-databasenode-cpu-mem-model',
       'monitor-infra-analytics-database-usage-model',
       'legend-view'],
       function(_, ContrailView, DatabaseNodeCPUMemModel, DatabaseUsageModel, LegendView){

    var DatabaseNodesSummaryChartsView = ContrailView.extend({
        render : function (){
            var self = this,
                anlyticsTemplate = contrail.getTemplate4Id(cowc.TMPL_4COLUMN__2ROW_CONTENT_VIEW),
                viewConfig = self.attributes.viewConfig,
                colorFn = viewConfig['colorFn'];

            self.$el.html(anlyticsTemplate);
            var topleftColumn = self.$el.find(".top-container .left-column"),
            toprightCoulmn = self.$el.find(".top-container .right-column"),
            bottomleftColumn = self.$el.find(".bottom-container .left-column"),
            bottomrightCoulmn = self.$el.find(".bottom-container .right-column"),
            dbCPUMemModel = new DatabaseNodeCPUMemModel();
            dbUsageModel = new DatabaseUsageModel();

            self.renderView4Config(topleftColumn,  dbCPUMemModel,
                getCPUShareChartViewConfig(colorFn));

            self.renderView4Config(bottomleftColumn,  dbCPUMemModel,
                getMemShareChartViewConfig(colorFn));

            self.renderView4Config(bottomrightCoulmn,  dbUsageModel,
                getDBDiskSpaceUsageViewConfig(colorFn));

            self.renderView4Config(toprightCoulmn,  dbUsageModel,
                getDBPendingCompactionsViewConfig(colorFn));
        }
    });

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
                                height: 240,
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
                                height: 240,
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
                                    return formatBytes(d * 1024, true);
                                },
                                xFormatter: xCPUChartFormatter,
                                showLegend:true,
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
                                height: 240,
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
                                showLegend:true,
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
                                height: 255,
                                groupBy: 'Source',
                                yField: 'MAX(database_usage.disk_space_used_1k)',
                                xAxisLabel: '',
                                yAxisLabel: 'Pending Compactions',
                                title: ctwl.DATABASENODE_SUMMARY_TITLE,
                                yAxisOffset: 25,
                                yAxisFormatter: function (d) {
                                    return formatBytes(d, true);
                                },
                                tickPadding: 8,
                                margin: {
                                    left: 55,
                                    top: 20,
                                    right: 15,
                                    bottom: 55
                                },
                                bucketSize: monitorInfraConstants.STATS_BUCKET_DURATION,
                                showControls: false,
                            },
                       }
                   }]
               }]
           }
       }
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
