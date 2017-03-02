/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var chartView = ContrailView.extend({
        render: function (viewConfig) {
            var self = this,
                chartViewTemplate = contrail.getTemplate4Id("chartView-template"),
                model = this.model;
                var region = model.getItems()[0].regionName;
                this.$el.append(chartViewTemplate);
                var secondRowSysCPU = self.$el.find(".row .col1 .syscpu");
                var secondRowSysMemory = self.$el.find(".row .col2 .sysmemory");
                var secondRowColumnBandWdth = self.$el.find(".row .col3 .bandwdth");
                var secondRowColumnDiskUsage = self.$el.find(".row .col4 .diskusage");
                if(region != null || region != 'undefined')
                self.renderView4Config(secondRowSysCPU,
                        null, getSystemCPUPercentilesView(region));
                if(region != null || region != 'undefined')
                self.renderView4Config(secondRowSysMemory,
                        null, getSystemMemoryPercentilesView(region));
                if(region != null || region != 'undefined')
                self.renderView4Config(secondRowColumnBandWdth,
                        null, getBandWidthPercentilesChart(region));
                if(region != null || region != 'undefined')
                self.renderView4Config(secondRowColumnDiskUsage,
                        null, getDiskUsageInfo(region));
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
            elementId: ctwl.GLOBAL_CONTROLLER_CHARTVIEW_CPU_MAX+region,
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: ctwl.GLOBAL_CONTROLLER_CHARTVIEW_CPU_MAX_SECTION+region,
                        view: "LineWithFocusChartView",
                        viewConfig: {
                            modelConfig: {
                                remote: {
                                    ajaxConfig : {
                                        url : ctwl.GLOBAL_CONTROLLER_CHARTS_URL+ region,
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
                                }
                            },
                            parseFn : cowu.chartDataFormatter,
                            chartOptions: {
                                staticColor: true,
                                xAxisLabel: ctwl.VROUTER_SYSTEM_CPU_PERCENTILES,
                                showTicks: false,
                                height: 30,
                                area: true,
                                spliceAtBorders: false,
                                bucketSize: 2.5,
                                defaultDataStatusMessage: false,
                                hideFocusChart: true,
                                showYaxis: false,
                                showXaxis: false,
                               // groupBy:null,
                                yAxisLabel: "Max System CPU",
                                yFormatter: function(y) {
                                    return formatBytes(y * 1024, true, null, null,
                                            null);
                                },
                                margin: {
                                    left: 10,
                                    top: 5,
                                    right: 10,
                                    bottom: 10
                                },
                                yField: getYFieldsForPercentile('system_cpu_usage.cpu_share')
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
            elementId: ctwl.GLOBAL_CONTROLLER_CHARTVIEW_MEMORY_MAX+region,
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: ctwl.GLOBAL_CONTROLLER_CHARTVIEW_MEMORY_MAX_SECTION+region,
                        view: "LineWithFocusChartView",
                        viewConfig: {
                            modelConfig: {
                                remote: {
                                    ajaxConfig : {
                                        url : ctwl.GLOBAL_CONTROLLER_CHARTS_URL+ region,
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
                                }
                            },
                            parseFn : cowu.chartDataFormatter,
                            chartOptions: {
                                staticColor: true,
                                yAxisLabel: "Max System Memory",
                                showTicks: false,
                                height: 30,
                                area: true,
                                spliceAtBorders: false,
                                bucketSize: 2.5,
                                defaultDataStatusMessage: false,
                                hideFocusChart: true,
                                showYaxis: false,
                                showXaxis: false,
                                yField: getYFieldsForPercentile('system_mem_usage.used'),
                                yFormatter: function(y) {
                                    return formatBytes(y * 1024, true, null, null,
                                            null);
                                },
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
            elementId: "chartview_bandwdth_percentile"+region,
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: "chartview_grid_bandwdth"+region,
                        view: "LineWithFocusChartView",
                        viewConfig: {
                            modelConfig: {
                                remote: {
                                    ajaxConfig : {
                                        url : ctwl.GLOBAL_CONTROLLER_CHARTS_URL+region,
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
                                }
                            },
                            parseFn : cowu.parseDataForLineChart,
                            chartOptions: {
                                colors:cowc.FIVE_NODE_COLOR,
                                xAxisLabel: '',
                                yAxisLabel: ctwl.VROUTER_BANDWIDTH_PERCENTILE,
                                yLabels: ['Bandwidth In', 'Bandwidth Out'],
                                height: 35,
                                area: true,
                                spliceAtBorders: false,
                                bucketSize: 2.5,
                                defaultDataStatusMessage: false,
                                hideFocusChart: true,
                                showYaxis: false,
                                showXaxis: false,
                               // showTicks: false,
                                yAxisLabel: '',
                                yFields: ['PERCENTILES(phy_band_in_bps.__value);95','PERCENTILES(phy_band_out_bps.__value);95'],
                                yFormatter: function(y) {
                                    return formatBytes(y, null, null, null, null, true);
                                },
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
                    "select": "T=, Source, MAX(disk_usage_info.partition_space_used_1k)"
                }
            };
        return {
            elementId: ctwl.GLOBAL_CONTROLLER_CHARTVIEW_DISK_USAGE+region,
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: ctwl.GLOBAL_CONTROLLER_CHARTVIEW_DISK_USAGE_SECTION+region,
                        view: "LineWithFocusChartView",
                        viewConfig: {
                            modelConfig: {
                                remote: {
                                    ajaxConfig : {
                                        url : ctwl.GLOBAL_CONTROLLER_CHARTS_URL+ region,
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
                                }
                            },
                            parseFn : cowu.chartDataFormatter,
                            chartOptions: {
                                yAxisLabel: "Max Disk usage",
                                height: 35,
                                area: true,
                                spliceAtBorders: false,
                                bucketSize: 2.5,
                                defaultDataStatusMessage: false,
                                hideFocusChart: true,
                                showTicks: false,
                                showYaxis: false,
                                showXaxis: false,
                                yField: 'MAX(disk_usage_info.partition_space_used_1k)',
                                yFormatter : function(d){
                                    return formatBytes(d * 1024, true);
                               },
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
    function getYFieldsForPercentile (field) {
        return 'PERCENTILES('+field+');95';
    }
    return chartView;
});