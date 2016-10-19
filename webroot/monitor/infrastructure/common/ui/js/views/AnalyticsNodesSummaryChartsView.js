/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view',
       'monitor-infra-analyticsnode-model',
       'monitor-infra-analytics-sandesh-chart-model',
       'monitor-infra-analytics-queries-chart-model',
       'monitor-infra-analytics-database-read-write-chart-model',
       'monitor-infra-analytics-database-usage-model','gs-view'],
       function(_, ContrailView,AnalyticsNodeListModel,AnalyticsNodeSandeshChartModel,
            AnalyticsNodeQueriesChartModel, AnalyticsNodeDataBaseReadWriteChartModel,
            AanlyticsNodeDatabaseUsageModel,GridStackView){
        var AnalyticsNodesSummaryChartsView = ContrailView.extend({
        render : function (){
            var self = this,
                viewConfig = self.attributes.viewConfig,
                colorFn = viewConfig['colorFn'];

            self.$el.append($("<div class='gs-container'></div>"));
            self.renderView4Config(self.$el.find('.gs-container'),{},getGridStackWidgetConfig(colorFn));

        }
    });

   function getGridStackWidgetConfig(colorFn) {
        var sandeshModel = new AnalyticsNodeSandeshChartModel(),
            queriesModel = new AnalyticsNodeQueriesChartModel(),
            dbUsageModel = new AanlyticsNodeDatabaseUsageModel();
            databseReadWritemodel = new AnalyticsNodeDataBaseReadWriteChartModel();
       return {
           elementId : 'analyticsGridStackSection',
           view : "SectionView",
           viewConfig : {
               rows : [ {
                   columns : [ {
                       elementId : 'analyticsGridStackComponent',
                       view : "GridStackView",
                       viewConfig : {
                            gridAttr : {
                                defaultWidth : 6,
                                defaultHeight : 10
                            },
                            widgetCfgList: [
                                {
                                    modelCfg: monitorInfraUtils.getStatsModelConfig({
                                        "table_name": "StatTable.SandeshMessageStat.msg_info",
                                        "select": "PERCENTILES(msg_info.bytes), PERCENTILES(msg_info.messages)",
                                        "parser": monitorInfraParsers.percentileAnalyticsNodeSummaryChart
                                    }),
                                    viewCfg: {
                                        elementId : ctwl.ANALYTICS_CHART_PERCENTILE_SECTION_ID,
                                        view : "SectionView",
                                        viewConfig : {
                                            rows : [ {
                                                columns : [ {
                                                    elementId :ctwl.ANALYTICS_CHART_PERCENTILE_TEXT_VIEW,
                                                    title : '',
                                                    view : "PercentileTextView",
                                                    viewPathPrefix:
                                                        ctwl.ANALYTICSNODE_VIEWPATH_PREFIX,
                                                    app : cowc.APP_CONTRAIL_CONTROLLER,
                                                    viewConfig : {
                                                        percentileTitle : ctwl.ANALYTICSNODE_CHART_PERCENTILE_TITLE,
                                                        percentileXvalue : ctwl.ANALYTICSNODE_CHART_PERCENTILE_COUNT,
                                                        percentileYvalue : ctwl.ANALYTICSNODE_CHART_PERCENTILE_SIZE,
                                                    }
                                                }]
                                            }]
                                        }
                                    },
                                    itemAttr: {
                                        width: 2,
                                        height:0.2
                                    }
                                },
                                {
                                    modelCfg: sandeshModel,
                                    viewCfg: getAnalyticsNodeSandeshChartViewConfig(colorFn)
                                },
                                {
                                    modelCfg: queriesModel,
                                    viewCfg: getAnalyticsNodeQueriesChartViewConfig(colorFn)
                                },
                                /*{
                                    modelCfg: monitorInfraUtils.getStatsModelConfig({
                                        table_name: 'StatTable.SandeshMessageStat.msg_info',
                                        select: 'Source,name, T=, SUM(msg_info.messages),SUM(msg_info.bytes)',
                                        parser: monitorInfraParsers.generatorsChartsParseData
                                    }),
                                    viewCfg: getGeneratorsScatterChartViewConfig()
                                },*/
                                {
                                    modelCfg: dbUsageModel,
                                    viewCfg: getAnalyticsNodeDatabaseUsageChartViewConfig(colorFn)
                                },

                                {
                                    modelCfg: databseReadWritemodel,
                                    viewCfg: getAnalyticsNodeDatabaseWriteChartViewConfig(colorFn),
                                },{
                                    modelCfg: new AnalyticsNodeListModel(),
                                    viewCfg: {
                                        elementId :
                                            ctwl.ANALYTICSNODE_SUMMARY_GRID_ID,
                                        title : ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                                        view : "AnalyticsNodeSummaryGridView",
                                        viewPathPrefix:
                                            ctwl.ANALYTICSNODE_VIEWPATH_PREFIX,
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

   function getAnalyticsNodeSandeshChartViewConfig(colorFn) {
       return {
           elementId : ctwl.ANALYTICS_CHART_SANDESH_SECTION_ID,
           view : "SectionView",
           viewConfig : {
               rows : [{
                   columns : [ $.extend(true, {}, monitorInfraConstants.stackChartDefaultViewConfig, {
                       elementId : ctwl.ANALYTICS_CHART_SANDESH_STACKEDBARCHART_ID,
                       viewConfig: {
                           chartOptions: {
                               colors: colorFn,
                               title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                               xAxisLabel: '',
                               yAxisLabel: ctwl.ANALYTICS_CHART_SANDESH_LABEL,
                               groupBy: 'Source',
                               yField: 'SUM(msg_info.messages)',
                           }
                       }
                   })]
               }]
           }
       }

   }

   function getAnalyticsNodeQueriesChartViewConfig(colorFn) {
       return {
           elementId : ctwl.ANALYTICS_CHART_QUERIES_SECTION_ID,
           view : "SectionView",
           viewConfig : {
               rows : [ {
                   columns : [ $.extend(true, {}, monitorInfraConstants.stackChartDefaultViewConfig, {
                       elementId : ctwl.ANALYTICS_CHART_QUERIES_STACKEDBARCHART_ID,
                       viewConfig: {
                           chartOptions: {
                               colors: colorFn,
                               title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                               xAxisLabel: '',
                               yAxisLabel: ctwl.ANALYTICS_CHART_QUERIES_LABEL,
                               groupBy: 'Source',
                               failureCheckFn: function (d) {
                                   if (d['query_stats.error'] != "None") {
                                       return 1;
                                   } else {
                                       return 0;
                                   }
                               },
                           }
                       }
                   })]
               }]
           }
       }

   }

   function getAnalyticsNodeDatabaseUsageChartViewConfig() {
       return {
           elementId : ctwl.ANALYTICS_CHART_DATABASE_READ_SECTION_ID,
           view : "SectionView",
           viewConfig : {
               rows : [ {
                   columns : [ $.extend(true, {}, monitorInfraConstants.stackChartDefaultViewConfig, {
                       elementId : ctwl.ANALYTICS_CHART_DATABASE_READ_STACKEDBARCHART_ID,
                       viewConfig: {
                           chartOptions: {
                               title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                               xAxisLabel: '',
                               yAxisLabel: ctwl.ANALYTICS_CHART_DATABASE_USAGE,
                               yField: 'MAX(database_usage.analytics_db_size_1k)',
                           }
                       }
                   })]
               }]
           }
       }

   }

   function getGeneratorsScatterChartViewConfig() {
       return {
           elementId :"generatorsScatterChartView",
           view : "SectionView",
           viewConfig : {
               rows: [{
                   columns: [{
                       elementId: "generatorsScatterChart",
                       //title: ctwl.VROUTER_SUMMARY_TITLE,
                       view: "ZoomScatterChartView",
                       //app: cowc.APP_CONTRAIL_CONTROLLER,
                       viewConfig: {
                           loadChartInChunks: true,
                           cfDataSource : self.cfDataSource,
                           chartOptions:{
                               sortFn:function(data){
                                   return data.reverse();
                               },
                               fetchDataLabel : false,
                               doBucketize: true,
                               xLabel: 'Bytes (KB)/ min',
                               yLabel: 'Generators (Messages /min)',
                               forceX : [ 0, 1 ],
                               forceY : [ 0, 20 ],
                               margin: {top:5},
                               doBucketize:false,

                               showLegend: false,
                              bubbleCfg : {
                                   defaultMaxValue : monitorInfraConstants.VROUTER_DEFAULT_MAX_THROUGHPUT
                              },

                              tooltipConfigCB: monitorInfraUtils.generatorsTooltipFn,
                              bucketTooltipFn: monitorInfraUtils.generatorsBucketTooltipFn,
                           },

                       }

                   }]
               }]
           }
       }

   }
   function getAnalyticsNodeDatabaseWriteChartViewConfig(colorFn) {
       return {
           elementId : ctwl.ANALYTICS_CHART_DATABASE_WRITE_SECTION_ID,
           view : "SectionView",
           viewConfig : {
               rows : [ {

                   columns : [
                               $.extend(true, {}, monitorInfraConstants.stackChartDefaultViewConfig, {
                       elementId : ctwl.ANALYTICS_CHART_DATABASE_WRITE_STACKEDBARCHART_ID,
                       viewConfig: {
                           chartOptions: {
                               colors: colorFn,
                               title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                               xAxisLabel: '',
                               yAxisLabel: ctwl.ANALYTICS_CHART_DATABASE_WRITE_LABEL,
                               groupBy: 'Source',
                               failureCheckFn: function (d) {
                                   return d[ctwl.ANALYTICS_CHART_DATABASE_WRITE_FAILS];
                               },
                               yField: ctwl.ANALYTICS_CHART_DATABASE_WRITE,
                           }
                       }
                   })]
               }]
           }
       }

   }
   function getPercentileTextViewConfig() {
       var queryPostData = {
           "autoSort": true,
           "async": false,
           "formModelAttrs": {
            "table_name": "StatTable.SandeshMessageStat.msg_info",
             "table_type": "STAT",
             "query_prefix": "stat",
             "from_time": Date.now() - (2 * 60 * 60 * 1000),
             "from_time_utc": Date.now() - (2 * 60 * 60 * 1000),
             "to_time": Date.now(),
             "to_time_utc": Date.now(),
             "select": "PERCENTILES(msg_info.bytes), PERCENTILES(msg_info.messages)",
             "time_granularity": 30,
             "time_granularity_unit": "mins",
             "limit": "150000"
           },
       };
       return {
           elementId : ctwl.ANALYTICS_CHART_PERCENTILE_SECTION_ID,
           view : "SectionView",
           viewConfig : {
               rows : [ {
                   columns : [ {
                       elementId :ctwl.ANALYTICS_CHART_PERCENTILE_TEXT_VIEW,
                       title : '',
                       view : "PercentileTextView",
                       viewPathPrefix:
                           ctwl.ANALYTICSNODE_VIEWPATH_PREFIX,
                       app : cowc.APP_CONTRAIL_CONTROLLER,
                       viewConfig : {
                              modelConfig : {
                                   remote : {
                                       ajaxConfig : {
                                           url : "/api/qe/query",
                                           type: 'POST',
                                           data: JSON.stringify(queryPostData),
                                       },
                                       dataParser : function (response) {
                                           return monitorInfraParsers.percentileAnalyticsNodeSummaryChart(response['data']);
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
   return AnalyticsNodesSummaryChartsView;
});
