/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view', 'legend-view',
        'monitor-infra-confignode-charts-model', 'monitor-infra-confignode-model'],
        function(_, ContrailView, LegendView, ConfigNodeChartsModel, ConfigNodeListModel){
   var ConfigNodeChartView = ContrailView.extend({
        render : function (){
            var self = this,
                viewConfig = self.attributes.viewConfig,
                colorFn = viewConfig['colorFn'];

            self.$el.append($("<div class='gs-container'></div>"));
            self.renderView4Config(self.$el.find('.gs-container'), null ,getGridStackWidgetConfig(colorFn));
        }
    });

   function getGridStackWidgetConfig(colorFn) {
       var chartModel = new ConfigNodeChartsModel();
       return {
           elementId : ctwl.CONFIGNODE_SUMMARY_CHART_SECTION_ID,
           view : "SectionView",
           viewConfig : {
               rows : [ {
                   columns : [{
                       elementId : 'confignode-gridstack-0',
                       view : "GridStackView",
                       viewConfig : {
                           gridAttr: {
                               defaultWidth: 6,
                               defaultHeight: 10
                           },
                           widgetCfgList: [{
                               modelCfg: monitorInfraUtils.getStatsModelConfig({
                                   "table_name": "StatTable.VncApiStatsLog.api_stats",
                                   "select": "PERCENTILES(api_stats.response_time_in_usec), PERCENTILES(api_stats.response_size)",
                                   "parser": monitorInfraParsers.percentileConfigNodeNodeSummaryChart
                               }),
                               viewCfg: {
                                   elementId : ctwl.CONFIGNODE_CHART_PERCENTILE_SECTION_ID,
                                   view : "SectionView",
                                   viewConfig : {
                                       rows : [ {
                                           columns : [ {
                                               elementId :ctwl.CONFIGNODE_CHART_PERCENTILE_TEXT_VIEW,
                                               title : '',
                                               view : "PercentileTextView",
                                               viewPathPrefix:
                                                   ctwl.ANALYTICSNODE_VIEWPATH_PREFIX,
                                               app : cowc.APP_CONTRAIL_CONTROLLER,
                                               viewConfig : {
                                                   percentileTitle : ctwl.CONFIGNODE_CHART_PERCENTILE_TITLE,
                                                   percentileXvalue : ctwl.CONFIGNODE_CHART_PERCENTILE_TIME,
                                                   percentileYvalue : ctwl.CONFIGNODE_CHART_PERCENTILE_SIZE,
                                               }
                                           }]
                                       }]
                                   }
                               },
                               itemAttr: {
                                   width: 2,
                                   height:0.2
                               }
                           },{
                                   modelCfg: chartModel,
                                   viewCfg:
                                       $.extend(true, {}, monitorInfraConstants.stackChartDefaultViewConfig, {
                                           elementId : ctwl.CONFIGNODE_SUMMARY_STACKEDCHART_ID,
                                           view: 'StackedAreaChartView',
                                           viewConfig: {
                                               class: 'col-xs-7 mon-infra-chart chartMargin',
                                               chartOptions: {
                                                   showControls: false,
                                                   height: 480,
                                                   colors: colorFn,
                                                   title: ctwl.CONFIGNODE_SUMMARY_TITLE,
                                                   xAxisLabel: '',
                                                   yAxisLabel: 'Requests Served',
                                                   groupBy: 'Source',
                                                   failureCheckFn: function (d) {
                                                       if (parseInt(d['api_stats.resp_code']) != 200) {
                                                           return 1;
                                                       } else {
                                                           return 0;
                                                       }
                                                   },
                                                   margin: {
                                                       left: 40,
                                                       top: 20,
                                                       right: 0,
                                                       bottom: 40
                                                   }
                                               }
                                           }
                                       }),
                                   itemAttr: {
                                       height: 2
                                   }
                               },{
                                   modelCfg: chartModel,
                                   viewCfg: {
                                       elementId: ctwl.CONFIGNODE_SUMMARY_LINEBARCHART_ID,
                                       view: 'LineBarWithFocusChartView',
                                       viewConfig: {
                                           class: 'col-xs-5 mon-infra-chart',
                                           parseFn: cowu.parseLineBarChartWithFocus,
                                           chartOptions: {
                                               y1AxisLabel:ctwl.RESPONSE_TIME,
                                               y2AxisLabel:ctwl.RESPONSE_SIZE,
                                               title: ctwl.CONFIGNODE_SUMMARY_TITLE,
                                               xAxisTicksCnt: 8, //In case of time scale for every 15 mins one tick
                                               margin: {top: 20, right: 50, bottom: 40, left: 50},
                                               axisLabelDistance: -10,
                                               y2AxisWidth: 50,
                                               focusEnable: false,
                                               height: 245,
                                               showLegend: true,
                                               xAxisLabel: '',
                                               xAxisMaxMin: false,
                                               defaultDataStatusMessage: false,
                                               insertEmptyBuckets: false,
                                               bucketSize: 4,
                                               groupBy: 'Source',
                                               //Y1 for bar
                                               y1Field: 'api_stats.response_time_in_usec',
                                               //Y2 for line
                                               y2Field: 'api_stats.response_size',
                                               y2AxisColor: monitorInfraConstants.CONFIGNODE_RESPONSESIZE_COLOR,
                                               y2FieldOperation: 'average',
                                               y1FieldOperation: 'average',
                                               colors: colorFn,
                                               xFormatter: function (xValue, tickCnt) {
                                                   // Same function is called for
                                                   // axis ticks and the tool tip
                                                   // title
                                                   var date = new Date(xValue);
                                                   if (tickCnt != null) {
                                                       var mins = date.getMinutes();
                                                       date.setMinutes(Math.ceil(mins/15) * 15);
                                                   }
                                                   return d3.time.format('%H:%M')(date);
                                               },
                                               y1Formatter: function (y1Value) {
                                                   //Divide by 1000 to convert to milli secs;
                                                   y1Value = ifNull(y1Value, 0)/1000;
                                                   var formattedValue = Math.round(y1Value) + ' ms';
                                                   if (y1Value > 1000){
                                                       // seconds block
                                                       formattedValue = Math.round(y1Value/1000);
                                                       formattedValue = formattedValue + ' secs'
                                                   } else if (y1Value > 60000) {
                                                       // minutes block
                                                       formattedValue = Math.round(y1Value/(60 * 1000))
                                                       formattedValue = formattedValue + ' mins'
                                                   }
                                                   return formattedValue;
                                               },
                                               y2Formatter: function (y2Value) {
                                                   var formattedValue = formatBytes(y2Value, true);
                                                   return formattedValue;
                                               },
                                               legendView: LegendView,
                                           },
                                       }
                                   },
                               },{
                                   modelCfg: chartModel,
                                   viewCfg: {
                                       elementId: ctwl.CONFIGNODE_SUMMARY_DONUTCHART_SECTION_ID,
                                       view: 'ConfigNodeDonutChartView',
                                       viewPathPrefix: ctwl.MONITOR_INFRA_VIEW_PATH,
                                       app : cowc.APP_CONTRAIL_CONTROLLER,
                                       viewConfig: {
                                           class: 'col-xs-5 mon-infra-chart',
                                           color: colorFn
                                       }
                                   }
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
                   }]
               }]
           }
       }

   }
   return ConfigNodeChartView;
});
