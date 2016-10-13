/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view', 'legend-view',
        'monitor-infra-confignode-charts-model'],
        function(_, ContrailView, LegendView, ConfigNodeChartsModel){
   var ConfigNodeChartView = ContrailView.extend({
        render : function (){
            var self = this,
                viewConfig = self.attributes.viewConfig,
                colorFn = viewConfig['colorFn'];
            var chartModel = new ConfigNodeChartsModel();
            var configNodechartTemplate = contrail.getTemplate4Id(cowc.TMPL_1COLUMN__1ROW_CONTENT_VIEW);
            var percentileWrapperTemplate = contrail.getTemplate4Id(cowc.TMPL_1COLUMN__1ROW_CONTENT_VIEW);
            self.$el.append(percentileWrapperTemplate({cssClass: 'percentileWrapper col-xs-6'}));
            self.$el.append(configNodechartTemplate({cssClass: 'configNodePercentile'}));
            var topleftColumn = self.$el.find(".configNodePercentile");
            var bottomRow = self.$el.find(".percentileWrapper");
            self.renderView4Config(bottomRow, null,getPercentileTextViewConfig());
            self.renderView4Config(topleftColumn, chartModel,
                    getConfigNodeChartViewConfig(colorFn));
            
        }
    });

   function getConfigNodeChartViewConfig(colorFn) {
       return {
           elementId : ctwl.CONFIGNODE_SUMMARY_CHART_SECTION_ID,
           view : "SectionView",
           viewConfig : {
               rows : [ {
                   columns : [{
                       elementId : ctwl.CONFIGNODE_SUMMARY_STACKEDCHART_ID,
                       view : "StackedBarChartWithFocusView",
                       viewConfig : {
                           class: 'col-xs-7 mon-infra-chart',
                           chartOptions:{
                               height: 480,
                               xAxisLabel: '',
                               yAxisLabel: 'Requests Served',
                               title: ctwl.CONFIGNODE_SUMMARY_TITLE,
                               groupBy: 'Source',
                               failureCheckFn: function (d) {
                                   if (parseInt(d['api_stats.resp_code']) != 200) {
                                       return 1;
                                   } else {
                                       return 0;
                                   }
                               },
                               yAxisOffset: 25,
                               tickPadding: 8,
                               margin: {
                                   left: 40,
                                   top: 20,
                                   right: 0,
                                   bottom: 40
                               },
                               bucketSize: monitorInfraConstants.STATS_BUCKET_DURATION,
                               showControls: false,
                               colors: colorFn
                           }
                       }
                   },{
                       elementId: ctwl.CONFIGNODE_SUMMARY_LINEBARCHART_ID,
                       view: 'LineBarWithFocusChartView',
                       viewConfig: {
                           class: 'col-xs-5 mon-infra-chart',
                           parseFn: function (response) {
                               return monitorInfraParsers.parseConfigNodeResponseStackedChartData(response, colorFn);
                           },
                           chartOptions: {
                               y1AxisLabel:ctwl.RESPONSE_TIME,
                               y2AxisLabel:ctwl.RESPONSE_SIZE,
                               title: ctwl.CONFIGNODE_SUMMARY_TITLE,
                               xAxisTicksCnt: 8, //In case of time scale for every 15 mins one tick
                               margin: {top: 20, right: 50, bottom: 40, left: 50},
                               axisLabelDistance: -10,
                               y2AxisWidth: 50,
                               //forceY1: [0, 1],
                               focusEnable: false,
                               height: 245,
                               showLegend: true,
                               xAxisLabel: '',
                               //xAxisLabel: 'Time',
                               xAxisMaxMin: false,
                               defaultDataStatusMessage: false,
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
                               legendView: LegendView
                           },
                       }
                   }, {
                       elementId: ctwl.CONFIGNODE_SUMMARY_DONUTCHART_SECTION_ID,
                       view: 'ConfigNodeDonutChartView',
                       viewPathPrefix: ctwl.MONITOR_INFRA_VIEW_PATH,
                       app : cowc.APP_CONTRAIL_CONTROLLER,
                       viewConfig: {
                           class: 'col-xs-5 mon-infra-chart',
                           color: colorFn
                       }
                   }]
               }]
           }
       }

   }
   function getPercentileTextViewConfig() {
       var queryPostData = {
           "autoSort": true,
           "async": false,
           "formModelAttrs": {
            "table_name": "StatTable.VncApiStatsLog.api_stats",
             "table_type": "STAT",
             "query_prefix": "stat",
             "from_time": Date.now() - (2 * 60 * 60 * 1000),
             "from_time_utc": Date.now() - (2 * 60 * 60 * 1000),
             "to_time": Date.now(),
             "to_time_utc": Date.now(),
             "select": "PERCENTILES(api_stats.response_time_in_usec), PERCENTILES(api_stats.response_size)",
             "time_granularity": 30,
             "time_granularity_unit": "mins",
             "limit": "150000"
           },
       };
       return {
           elementId : ctwl.CONFIGNODE_CHART_PERCENTILE_SECTION_ID,
           view : "SectionView",
           viewConfig : {
               rows : [ {
                   columns : [ {
                       elementId :ctwl.CONFIGNODE_CHART_PERCENTILE_TEXT_VIEW,
                       view : "PercentileTextView",
                       viewPathPrefix:
                           ctwl.ANALYTICSNODE_VIEWPATH_PREFIX,
                       app : cowc.APP_CONTRAIL_CONTROLLER,
                       viewConfig : {
                           percentileTitle : ctwl.CONFIGNODE_CHART_PERCENTILE_TITLE,
                           percentileXvalue : ctwl.CONFIGNODE_CHART_PERCENTILE_TIME,
                           percentileYvalue : ctwl.CONFIGNODE_CHART_PERCENTILE_SIZE,
                              modelConfig : {
                                   remote : {
                                       ajaxConfig : {
                                           url : "/api/qe/query",
                                           type: 'POST',
                                           data: JSON.stringify(queryPostData),
                                           timeout : 120000 //2 mins
                                       },
                                       dataParser : function (response) {
                                           console.log(response['data']);
                                           return monitorInfraParsers.percentileConfigNodeNodeSummaryChart(response['data']);
                                       }
                                   },
                                   cacheConfig : {}
                               },
                       }
                   }]
               }]
           }
       }

   }

   return ConfigNodeChartView;
});
