/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view',
       'monitor-infra-databasenode-cpu-mem-model',
       'monitor-infra-analytics-database-usage-model'], 
       function(_, ContrailView, DatabaseNodeCPUMemModel, DatabaseUsageModel){
        
    var AnalyticsNodesSummaryChartsView = ContrailView.extend({
        render : function (){
            var self = this,
                anlyticsTemplate = contrail.getTemplate4Id(cowc.TMPL_4COLUMN__2ROW_CONTENT_VIEW),             
                databaseNodeList = [];
           
            self.$el.html(anlyticsTemplate);
            if (self.model != null) {
                var callBackExecuted = false;
                self.model.onDataUpdate.subscribe(function (e, obj) {
                    if (self.model.isPrimaryRequestInProgress() == false
                            && callBackExecuted == false) {
                        callBackExecuted = true;
                        databaseNodeList = self.model.getItems();
                        var topleftColumn = self.$el.find(".top-container .left-column"),
                            toprightCoulmn = self.$el.find(".top-container .right-column"),
                            bottomleftColumn = self.$el.find(".bottom-container .left-column"),
                            bottomrightCoulmn = self.$el.find(".bottom-container .right-column"),
                            dbCPUMemModel = new DatabaseNodeCPUMemModel(),
                            dbUsageModel = new DatabaseUsageModel(),
                            colorMap = monitorInfraUtils.constructNodeColorMap(databaseNodeList);
                        
                        self.renderView4Config(topleftColumn,  dbCPUMemModel,
                                getCPUShareChartViewConfig(colorMap));

                        self.renderView4Config(bottomleftColumn,  dbCPUMemModel,
                                getMemShareChartViewConfig(colorMap));

                        self.renderView4Config(bottomrightCoulmn,  dbUsageModel,
                                getDBDiskSpaceUsageViewConfig(colorMap));

                        self.renderView4Config(toprightCoulmn,  dbUsageModel,
                                getDBPendingCompactionsViewConfig(colorMap));
                    }
                });
            }
        }
    });

    function getCPUShareChartViewConfig(colorMap){
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
                                colorMap: colorMap,
                                brush: false,
                                height: 240,
                                xAxisLabel: '',
                                yAxisLabel: 'CPU Share (%)',                                
                                axisLabelDistance : 0,
                                margin: {
                                    left: 60,
                                    top: 35,
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
                                legendFn: function(data, container, chart){
                                    return getLegend(data, container, chart, colorMap)
                                },
                                defaultZeroLineDisplay: true
                            },
                            parseFn: function(respData){
                                return monitorInfraParsers.getDBNodeCPUdata(respData, 
                                    'name', 'T', 'process_mem_cpu_usage.cpu_share');
                            }
                        }
                    }]
                }]
            }
        };
    }
    
    function getMemShareChartViewConfig(colorMap){
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
                                colorMap: colorMap,
                                brush: false,
                                height: 240,
                                xAxisLabel: '',
                                yAxisLabel: 'Memory',                                
                                axisLabelDistance : 0,
                                margin: {
                                    left: 60,
                                    top: 35,
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
                                legendFn: function(data, container, chart){
                                    return getLegend(data, container, chart, colorMap)
                                },
                                defaultZeroLineDisplay: true
                            },
                            parseFn: function(respData){
                                return monitorInfraParsers.getDBNodeCPUdata(respData, 
                                    'name', 'T', 'process_mem_cpu_usage.mem_res');
                            }
                        }
                    }]
                }]
            }
        };
    }

    function getDBDiskSpaceUsageViewConfig(colorMap){
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
                                colorMap: colorMap,
                                brush: false,
                                height: 240,
                                xAxisLabel: '',
                                yAxisLabel: 'Disk Space Usage',                                
                                axisLabelDistance : 0,
                                margin: {
                                    left: 60,
                                    top: 35,
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
                                legendFn: function(data, container, chart){
                                    return getLegend(data, container, chart, colorMap)
                                },
                                defaultZeroLineDisplay: true
                            },
                            parseFn: function(respData){
                                return monitorInfraParsers.getDBNodeCPUdata(respData, 
                                    'Source', 'T', 'database_usage.disk_space_used_1k');
                            }
                        }
                    }]
                }]
            }
        };
    }

    function getDBPendingCompactionsViewConfig(colorMap){
        return {
            elementId : ctwl.DATABASENODE_DISK_SPACE_USAGE_SCATTER_CHART_SEC_ID,
            view : "SectionView",
            viewConfig : {
                rows : [{
                    columns : [ {
                        elementId : ctwl.DATABASENODE_DISK_SPACE_USAGE_SCATTER_CHART_ID,
                        view : "StackedBarChartWithFocusView",
                        viewConfig : {
                            class: 'mon-infra-chart chartMargin',
                            chartOptions:{
                                colorMap: colorMap,
                                brush: false,
                                height: 255,
                                xAxisLabel: '',
                                yAxisLabel: 'Pending Compactions',
                                yAxisOffset: 25,
                                yAxisFormatter: function (d) {
                                    return formatBytes(d, true);
                                },
                                axisLabelFontSize: 11,
                                tickPadding: 8,
                                margin: {
                                    left: 55,
                                    top: 35,
                                    right: 15,
                                    bottom: 55
                                },
                                bucketSize: monitorInfraConstants.CONFIGNODESTATS_BUCKET_DURATION/(1000 * 1000 * 60),//converting to minutes
                                sliceTooltipFn: function (data) {
                                    var tooltipConfig = {},
                                    time = data['time'];
                                    if(data['name'] != monitorInfraConstants.CONFIGNODE_FAILEDREQUESTS_TITLE) {
                                        tooltipConfig['title'] = {
                                            name : data['name'],
                                            type : ctwl.DATABASENODE_SUMMARY_TITLE
                                        };
                                        
                                        tooltipConfig['content'] = {
                                            iconClass : false,
                                            info : [{
                                                label: 'Time',
                                                value: time
                                            },{
                                                label: 'Disk Space Usage',
                                                value: formatBytes(ifNull(data['perNodeDBUsage'], 0))
                                            }]
                                        };
                                    }
                                    var tooltipElementTemplate = contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP),
                                    tooltipElementTitleTemplate = contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP_TITLE),
                                    tooltipElementContentTemplate = contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP_CONTENT),
                                    tooltipElementObj, tooltipElementTitleObj, tooltipElementContentObj;
                                    tooltipConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_ELEMENT_TOOLTIP, tooltipConfig);
                                    tooltipElementObj = $(tooltipElementTemplate(tooltipConfig));
                                    tooltipElementTitleObj = $(tooltipElementTitleTemplate(tooltipConfig.title));
                                    tooltipElementContentObj = $(tooltipElementContentTemplate(tooltipConfig.content));
                                    tooltipElementObj.css("position","relative");
                                    tooltipElementObj.find('.popover-title').append(tooltipElementTitleObj);
                                    tooltipElementObj.find('.popover-content').append(tooltipElementContentObj);
                                    return $(tooltipElementObj).wrapAll('<div>').parent().html();
                                },
                                showLegend: true,
                                legendFn: function (data, container, chart) {
                                    if (container != null 
                                        && $(container).find('svg') != null 
                                        && data != null && data.length > 0) {

                                        var colorCodes = data[0]['colorCodes'],
                                            svg = $(container).find('svg'),
                                            width = parseInt($(svg).css('width') || svg.getBBox()['width']),
                                            legendWrap = d3.select($(svg)[0]).append('g')
                                              .attr('class','legend-wrap')
                                              .attr('transform','translate('+width+',0)');

                                        monitorInfraUtils.addLegendToSummaryPageCharts({
                                            container: legendWrap,
                                            cssClass: 'contrail-legend-stackedbar',
                                            data: colorCodes,
                                            colors: colorCodes,
                                            nodeColorMap: colorMap,
                                            label: ctwl.DATABASENODE_SUMMARY_TITLE,
                                        });
                                    }
                                }
                            },
                            parseFn: function (response, chartViewModel) {
                                return monitorInfraParsers.parseDatabaseUsageData(response, 
                                    chartViewModel, 'database_usage.disk_space_used_1k');
                            }
                       }
                   }]
               }]
           }
       }
    }

    function getLegend(data, container, chart, colorMap){
        if (container != null && $(container).find('svg') != null
           && data != null && data.length > 0) {
            var colorCodes = data[0]['colorCodes'];
            var svg = $(container).find('svg');
            var width = parseInt($(svg).css('width') || svg.getBBox()['width']);
            var legendWrap = d3.select($(svg)[0]).append('g')
                  .attr('class','legend-wrap')
                  .attr('transform','translate('+width+',0)')
           
            monitorInfraUtils.addLegendToSummaryPageCharts({
                container: legendWrap,
                cssClass: 'contrail-legend-stackedbar',
                data: colorCodes,
                offset: 0,
                colors: colorCodes,
                nodeColorMap: colorMap,
                label: ctwl.DATABASENODE_SUMMARY_TITLE,
            });
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

    return AnalyticsNodesSummaryChartsView;
});
