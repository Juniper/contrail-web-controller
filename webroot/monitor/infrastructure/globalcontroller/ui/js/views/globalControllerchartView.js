/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view',
    'chart-utils'
], function (_, ContrailView, ChartUtils) {
    var chartView = ContrailView.extend({
        render: function (viewConfig) {
            var self = this,
                chartViewTemplate = contrail.getTemplate4Id("chartView-template"),
                model = this.model;
                var region = getValueByJsonPath(model.getItems()[0], 'regionName', null);
                this.$el.append(chartViewTemplate);
                var secondRowtopLeftchartContainer = self.$el.find(".row .col1 .topleft-chart-container");
                var secondRowtopRightchartContainer = self.$el.find(".row .col2 .topright-chart-container");
                var secondRowbottomLeftchartContainer = self.$el.find(".row .col3 .bottomleft-chart-container");
                var secondRowbottomRightchartContainer = self.$el.find(".row .col4 .bottomright-chart-container");
                if(region != null){
                    self.renderView4Config(secondRowtopLeftchartContainer,
                            null, getSystemCPUPercentilesView(region));
                    self.renderView4Config(secondRowtopRightchartContainer,
                            null, getSystemMemoryPercentilesView(region));
                    self.renderView4Config(secondRowbottomLeftchartContainer,
                            null, getBandWidthPercentilesChart(region));
                    self.renderView4Config(secondRowbottomRightchartContainer,
                            null, getDiskUsageInfo(region));
                }
        }
    });
    var getSystemCPUPercentilesView = function (region) {
        var postData = {
                "autoSort": true,
                "async": false,
                "formModelAttrs": {
                    "table_type": "STAT",
                    "query_prefix": "stat",
                    "from_time": Date.now() - (cowc.DEFAULT_CHART_DURATION * 60 * 60 * 1000),
                    "from_time_utc": Date.now() - (cowc.DEFAULT_CHART_DURATION * 60 * 60 * 1000),
                    "to_time": Date.now(),
                    "to_time_utc": Date.now(),
                    "time_granularity_unit": "secs",
                    "time_granularity": 150,
                    "limit": "150000",
                    "table_name": "StatTable.NodeStatus.system_cpu_usage",
                    "select": "T=, PERCENTILES(system_cpu_usage.cpu_share)",
                }
            };
        return {
            elementId: ctwc.GLOBAL_CONTROLLER_CHARTVIEW_CPU_MAX_SECTION_ID+region,
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: ctwc.GLOBAL_CONTROLLER_CHARTVIEW_CPU_MAX+region,
                        view: "LineWithFocusChartView",
                        viewConfig: {
                            modelConfig: {
                                remote: {
                                    ajaxConfig : {
                                        url : ctwc.GLOBAL_CONTROLLER_CHARTS_URL+ region,
                                        type: 'POST',
                                        data: JSON.stringify(postData)
                                    },
                                    dataParser : function(response) {
                                        var data = getValueByJsonPath(response,'data;data',[]);
                                        if (response['queryJSON'] != null) {
                                            data = _.map(data, function(obj) {
                                                return _.extend({}, obj, {queryJSON: response['queryJSON']});
                                            });
                                        }
                                        return data;
                                    }
                                },
                                cacheConfig : {
                                    ucid: "globalController_system_cpu_chart"+region
                              }
                            },
                            parseFn : cowu.chartDataFormatter,
                            chartOptions: {
                                    title:ctwl.GLOBAL_CONTROLLER_SYSTEM_CPU_TITLE,
                                    subtitle:ctwl.GLOBAL_CONTROLLER_SYSTEM_MAX_CPU_UTILIZATION,
                                    staticColor: true,
                                    colors: monitorInfraConstants.GLOBAL_CONTROLLER_CHART_COLOR,
                                    xAxisLabel:'',
                                    height: 30,
                                    area: true,
                                    spliceAtBorders: false,
                                    bucketSize: 2.5,
                                    defaultDataStatusMessage: false,
                                    hideFocusChart: true,
                                    showYAxis: false,
                                    showXAxis: false,
                                    showTicks: false,
                                    yFormatter:d3.format(".2f"),
                                    yFormatter: function(y){
                                        return y+' %';
                                    },
                                   yAxisLabel: "System CPU",
                                   tooltipFn:ChartUtils.defaultLineWithFocusChartTooltipFn,
                                    margin: {
                                        left: 10,
                                        top: 5,
                                        right: 10,
                                        bottom: 10
                                    },
                                    yField: getYFieldsForPercentile('system_cpu_usage.cpu_share')
                               //})
                            }
                        }
                    }]}]
                }
        }
    }
    var getSystemMemoryPercentilesView = function (region) {
        var postData = {
                "autoSort": true,
                "async": false,
                "formModelAttrs": {
                    "table_type": "STAT",
                    "query_prefix": "stat",
                    "from_time": Date.now() - (cowc.DEFAULT_CHART_DURATION * 60 * 60 * 1000),
                    "from_time_utc": Date.now() - (cowc.DEFAULT_CHART_DURATION * 60 * 60 * 1000),
                    "to_time": Date.now(),
                    "to_time_utc": Date.now(),
                    "time_granularity_unit": "secs",
                    "time_granularity": 150,
                    "limit": "150000",
                    "table_name": "StatTable.NodeStatus.system_mem_usage",
                    "select": "T=, PERCENTILES(system_mem_usage.used)"
                }
            };
        return {
            elementId: ctwc.GLOBAL_CONTROLLER_CHARTVIEW_MEMORY_MAX_SECTION_ID+region,
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: ctwc.GLOBAL_CONTROLLER_CHARTVIEW_MEMORY_MAX+region,
                        view: "LineWithFocusChartView",
                        viewConfig: {
                            modelConfig: {
                                remote: {
                                    ajaxConfig : {
                                        url : ctwc.GLOBAL_CONTROLLER_CHARTS_URL+ region,
                                        type: 'POST',
                                        data: JSON.stringify(postData)
                                    },
                                    dataParser : function(response) {
                                        var data = getValueByJsonPath(response,'data;data',[]);
                                        if (response['queryJSON'] != null) {
                                            data = _.map(data, function(obj) {
                                                return _.extend({}, obj, {queryJSON: response['queryJSON']});
                                            });
                                        }
                                        return data;
                                    }
                                },
                                cacheConfig : {
                                    ucid: "globalController_system_memory_chart"+region
                              }
                            },
                            parseFn : cowu.chartDataFormatter,
                            chartOptions: {
                                title:ctwl.GLOBAL_CONTROLLER_SYSTEM_MEMORY_TITLE,
                                subtitle:ctwl.GLOBAL_CONTROLLER_SYSTEM_MAX_MEMORY_UTILIZATION,
                                staticColor: true,
                                colors: monitorInfraConstants.GLOBAL_CONTROLLER_CHART_COLOR,
                                yAxisLabel: "System Memory",
                                height: 30,
                                area: true,
                                spliceAtBorders: false,
                                bucketSize: 2.5,
                                defaultDataStatusMessage: false,
                                hideFocusChart: true,
                                showYAxis: false,
                                showXAxis: false,
                                showTicks: false,
                                yField: getYFieldsForPercentile('system_mem_usage.used'),
                                yFormatter: function(y) {
                                    return formatBytes(y * 1024, true, null, null,
                                            null);
                                },
                                tooltipFn:ChartUtils.defaultLineWithFocusChartTooltipFn,
                                margin: {
                                    left: 10,
                                    top: 5,
                                    right: 10,
                                    bottom: 10
                                }
                            }
                        }
                    }]}]
                }
        }
    }
    var getBandWidthPercentilesChart = function (region) {
        var postData = {
                "autoSort": true,
                "async": false,
                "formModelAttrs": {
                    "table_type": "STAT",
                    "query_prefix": "stat",
                    "from_time": Date.now() - (cowc.DEFAULT_CHART_DURATION * 60 * 60 * 1000),
                    "from_time_utc": Date.now() - (cowc.DEFAULT_CHART_DURATION * 60 * 60 * 1000),
                    "to_time": Date.now(),
                    "to_time_utc": Date.now(),
                    "time_granularity_unit": "secs",
                    "time_granularity": 150,
                    "limit": "150000",
                    "table_name": "StatTable.VrouterStatsAgent.phy_band_in_bps",
                    "select": "T=, PERCENTILES(phy_band_in_bps.__value)"
                }
            };
        return {
            elementId: ctwc.GLOBAL_CONTROLLER_CHARTVIEW_BANDWDTH_PERCENTILE_SECTION_ID+region,
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: ctwc.GLOBAL_CONTROLLER_CHARTVIEW_BANDWDTH_PERCENTILE+region,
                        view: "LineWithFocusChartView",
                        viewConfig: {
                            modelConfig: {
                                remote: {
                                    ajaxConfig : {
                                        url : ctwc.GLOBAL_CONTROLLER_CHARTS_URL+region,
                                        type: 'POST',
                                        data: JSON.stringify(postData)
                                    },
                                    dataParser : function(response) {
                                        var data = getValueByJsonPath(response,'data;data',[]);
                                        if (response['queryJSON'] != null) {
                                            data = _.map(data, function(obj) {
                                                return _.extend({}, obj, {queryJSON: response['queryJSON']});
                                            });
                                        }
                                        return data;
                                    }
                                },
                                cacheConfig : {
                                    ucid: "globalController_bandwidth_chart"+region
                              }
                            },
                            parseFn : cowu.parseDataForLineChart,
                            chartOptions: {
                                title:ctwl.GLOBAL_CONTROLLER_BANDWIDTH_IN_TITLE,
                                subtitle:ctwl.GLOBAL_CONTROLLER_SYSTEM_MAX_BANDWIDTH_IN,
                                staticColor: true,
                                colors: monitorInfraConstants.GLOBAL_CONTROLLER_CHART_COLOR,
                                xAxisLabel: '',
                                yAxisLabel: "Bandwidth In",
                                height: 35,
                                area: true,
                                spliceAtBorders: false,
                                bucketSize: 2.5,
                                defaultDataStatusMessage: false,
                                hideFocusChart: true,
                                showYAxis: false,
                                showXAxis: false,
                                showTicks: false,
                                yFields: ['PERCENTILES(phy_band_in_bps.__value);95'],
                                yFormatter: function(y) {
                                    return formatBytes(y, null, null, null, null, true);
                                },
                                tooltipFn:ChartUtils.defaultLineWithFocusChartTooltipFn,
                                margin: {
                                    left: 10,
                                    right: 10,
                                    bottom:10
                                }
                            }
                        }
                    }]}]
                }
        }
    }
    var getDiskUsageInfo = function (region) {
        var postData = {
                "autoSort": true,
                "async": false,
                "formModelAttrs": {
                    "table_type": "STAT",
                    "query_prefix": "stat",
                    "from_time": Date.now() - (cowc.DEFAULT_CHART_DURATION * 60 * 60 * 1000),
                    "from_time_utc": Date.now() - (cowc.DEFAULT_CHART_DURATION * 60 * 60 * 1000),
                    "to_time": Date.now(),
                    "to_time_utc": Date.now(),
                    "time_granularity_unit": "secs",
                    "time_granularity": 150,
                    "limit": "150000",
                    "table_name": "StatTable.NodeStatus.disk_usage_info",
                    "select": "T=,PERCENTILES(disk_usage_info.partition_space_used_1k)"
                }
            };
        return {
            elementId: ctwc.GLOBAL_CONTROLLER_CHARTVIEW_DISK_USAGE_SECTION_ID+region,
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: ctwc.GLOBAL_CONTROLLER_CHARTVIEW_DISK_USAGE+region,
                        view: "LineWithFocusChartView",
                        viewConfig: {
                            modelConfig: {
                                remote: {
                                    ajaxConfig : {
                                        url : ctwc.GLOBAL_CONTROLLER_CHARTS_URL+ region,
                                        type: 'POST',
                                        data: JSON.stringify(postData)
                                    },
                                    dataParser : function(response) {
                                        var data = getValueByJsonPath(response,'data;data',[]);
                                        if (response['queryJSON'] != null) {
                                            data = _.map(data, function(obj) {
                                                return _.extend({}, obj, {queryJSON: response['queryJSON']});
                                            });
                                        }
                                        return data;
                                    }
                                },
                                cacheConfig : {
                                    ucid: "globalController_diskusage_chart"+region
                              }
                            },
                            parseFn : cowu.chartDataFormatter,
                            chartOptions: {
                                title:ctwl.GLOBAL_CONTROLLER_DISK_USAGE_TITLE,
                                subtitle:ctwl.GLOBAL_CONTROLLER_SYSTEM_CPU_UTILIZATION,
                                staticColor: true,
                                colors: monitorInfraConstants.GLOBAL_CONTROLLER_CHART_COLOR,
                                yAxisLabel: "Disk usage",
                                height: 35,
                                area: true,
                                spliceAtBorders: false,
                                bucketSize: 2.5,
                                defaultDataStatusMessage: false,
                                hideFocusChart: true,
                                showTicks: false,
                                showYAxis: false,
                                showXAxis: false,
                                yField: getYFieldsForPercentile('disk_usage_info.partition_space_used_1k'),
                                yFormatter : function(d){
                                    return formatBytes(d * 1024, true);
                               },
                               tooltipFn:ChartUtils.defaultLineWithFocusChartTooltipFn,
                                margin: {
                                    left: 10,
                                    right: 10,
                                    bottom:10
                                }
                            }
                        }
                    }]}]
                }
        }
    }
    var getYFieldsForPercentile = function (field) {
        return 'PERCENTILES('+field+');95';
    }
    return chartView;
});