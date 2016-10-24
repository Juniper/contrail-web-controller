/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view','monitor-infra-controlnode-model',
       'monitor-infra-controlnode-sent-update-model',
       'monitor-infra-controlnode-received-update-model',
       'monitor-infra-controlnode-cpu-mem-chart-model',
       'legend-view','gs-view'],
       function(_, ContrailView, ControlNodeListModel, ControlNodeSentUpdateChartModel,
               ControlNodeReceivedUpdateChartModel,
               ControlNodeCPUMemChartModel, LegendView, GridStackView){
        var ControlNodeSummaryChartsView = ContrailView.extend({
        render : function (){
            var anlyticsTemplate = contrail.getTemplate4Id(
                    cowc.TMPL_4COLUMN__2ROW_CONTENT_VIEW);
            var self = this,
                viewConfig = self.attributes.viewConfig,
                colorFn = viewConfig['colorFn'];
                self.$el.append($("<div class='gs-container'></div>"));
                self.renderView4Config(self.$el.find('.gs-container'),{},getGridStackWidgetConfig(colorFn));
        }
    });
        function getGridStackWidgetConfig(colorFn) {
            var sentUpdateModel = new ControlNodeSentUpdateChartModel(),
                receivedUpdateModel = new ControlNodeReceivedUpdateChartModel(),
                cpuMemChartModel = new ControlNodeCPUMemChartModel();
           return {
               elementId : 'controlnodeGridStackSection',
               view : "SectionView",
               viewConfig : {
                   rows : [ {
                       columns : [ {
                           elementId : 'controlNodeGridStackComponent',
                           view : "GridStackView",
                           viewConfig : {
                                gridAttr : {
                                    defaultWidth : 6,
                                    defaultHeight : 10
                                },
                                widgetCfgList: [
                                    {
                                        modelCfg: sentUpdateModel,
                                        viewCfg: getSentUpdatesChartViewConfig(colorFn)
                                    },
                                    {
                                        modelCfg: receivedUpdateModel,
                                        viewCfg: getReceivedUpdatesChartViewConfig(colorFn)
                                    },
                                    {
                                        modelCfg: cpuMemChartModel,
                                        viewCfg: getCPUShareChartViewConfig(colorFn)
                                    },

                                    {
                                        modelCfg: cpuMemChartModel,
                                        viewCfg: getMemShareChartViewConfig(colorFn),
                                    },{
                                        modelCfg: new ControlNodeListModel(),
                                        viewCfg: {
                                            elementId : ctwl.CONTROLNODE_SUMMARY_GRID_ID,
                                            title : ctwl.CONTROLNODE_SUMMARY_TITLE,
                                            view : "ControlNodeSummaryGridView",
                                            viewPathPrefix: ctwl.CONTROLNODE_VIEWPATH_PREFIX,
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
   function getSentUpdatesChartViewConfig(colorFn) {
       return {
           elementId : ctwl.CONTROLNODE_SENT_UPDATES_SCATTER_CHART_SEC_ID,
           view : "SectionView",
           viewConfig : {
               rows : [ {
                   columns : [ {
                       elementId : ctwl.CONTROLNODE_SENT_UPDATES_SCATTER_CHART_ID,
                       view : "StackedBarChartWithFocusView",
                       viewConfig : {
                           class: 'mon-infra-chart chartMargin',
                           chartOptions:{
                               height: 230,
                               title: ctwl.CONTROLNODE_SUMMARY_TITLE,
                               xAxisLabel: '',
                               yAxisLabel: 'Sent Updates',
                               groupBy: 'Source',
                               yField: 'SUM(tx_update_stats.reach)',
                               yAxisOffset: 25,
                               tickPadding: 8,
                               margin: {
                                   left: 55,
                                   top: 20,
                                   right: 0,
                                   bottom: 40
                               },
                               bucketSize: monitorInfraConstants.STATS_BUCKET_DURATION,
                               colors: colorFn,
                               failureLabel:'Unreach',
                               showControls: false,
                               showLegend: true,
                               failureCheckFn: function (d) {
                                   return ifNull(d['SUM(tx_update_stats.unreach)'],0);
                               },
                               defaultZeroLineDisplay: true
                           }
                       }
                   }]
               }]
           }
       }

   }

   function getReceivedUpdatesChartViewConfig(colorFn) {
       return {
           elementId : ctwl.CONTROLNODE_RECEIVED_UPDATES_SCATTER_CHART_SEC_ID,
           view : "SectionView",
           viewConfig : {
               rows : [ {

                   columns : [ {
                       elementId : ctwl.CONTROLNODE_RECEIVED_UPDATES_SCATTER_CHART_ID,
                       view : "StackedBarChartWithFocusView",
                       viewConfig : {
                           class: 'mon-infra-chart chartMargin',
                           chartOptions:{
                               height: 230,
                               xAxisLabel: '',
                               yAxisLabel: 'Received Updates',
                               title: ctwl.CONTROLNODE_SUMMARY_TITLE,
                               groupBy: 'Source',
                               yField: 'SUM(rx_update_stats.reach)',
                               yAxisOffset: 25,
                               tickPadding: 4,
                               margin: {
                                   left: 55,
                                   top: 20,
                                   right: 0,
                                   bottom: 40
                               },
                               bucketSize: monitorInfraConstants.STATS_BUCKET_DURATION,
                               colors: colorFn,
                               failureLabel:'Unreach',
                               showControls: false,
                               showLegend: true,
                               failureCheckFn: function (d) {
                                   return ifNull(d['SUM(rx_update_stats.unreach)'],0);
                               },
                               defaultZeroLineDisplay: true
                           }
                       }
                   }]
               }]
           }
       }

   }

   function getCPUShareChartViewConfig(colorFn){
       return {
           elementId : ctwl.CONTROLNODE_CPU_SHARE_LINE_CHART_SEC_ID,
           view : "SectionView",
           viewConfig : {
               rows : [{
                   columns : [{
                       elementId : ctwl.CONTROLNODE_CPU_SHARE_LINE_CHART_ID,
                       view : "LineWithFocusChartView",
                       viewConfig: {
                           class: 'mon-infra-chart chartMargin',
                           chartOptions : {
                               brush: false,
                               height: 240,
                               xAxisLabel: '',
                               yAxisLabel: 'CPU Share (%)',
                               groupBy: 'name',
                               yField: 'MAX(cpu_info.cpu_share)',
                               yFieldOperation: 'average',
                               bucketSize: monitorInfraConstants.STATS_BUCKET_DURATION,
                               colors: colorFn,
                               title: ctwl.CONTROLNODE_SUMMARY_TITLE,
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
                                   return d;
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

   function getMemShareChartViewConfig(colorFn){
       return {
           elementId : ctwl.CONTROLNODE_MEM_SHARE_LINE_CHART_SEC_ID,
           view : "SectionView",
           viewConfig : {
               rows : [{
                   columns : [{
                       elementId : ctwl.CONTROLNODE_MEM_SHARE_LINE_CHART_ID,
                       view : "LineWithFocusChartView",
                       viewConfig: {
                           class: 'mon-infra-chart chartMargin',
                           chartOptions : {
                               brush: false,
                               height: 240,
                               xAxisLabel: '',
                               yAxisLabel: 'Memory',
                               groupBy: 'name',
                               yField: 'MAX(cpu_info.mem_res)',
                               yFieldOperation: 'average',
                               bucketSize: monitorInfraConstants.STATS_BUCKET_DURATION,
                               colors: colorFn,
                               title: ctwl.CONTROLNODE_SUMMARY_TITLE,
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
   return ControlNodeSummaryChartsView;
});
