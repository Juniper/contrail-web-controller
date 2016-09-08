/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view',
       'monitor-infra-analytics-sandesh-chart-model',
       'monitor-infra-analytics-queries-chart-model',
       'monitor-infra-analytics-database-read-write-chart-model',
       'monitor-infra-analytics-database-usage-model'],
       function(_, ContrailView,AnalyticsNodeSandeshChartModel,
            AnalyticsNodeQueriesChartModel, AnalyticsNodeDataBaseReadWriteChartModel,
            AanlyticsNodeDatabaseUsageModel){
        var AnalyticsNodesSummaryChartsView = ContrailView.extend({
        render : function (){
            var anlyticsTemplate = contrail.getTemplate4Id(
                    cowc.TMPL_4COLUMN__2ROW_CONTENT_VIEW);
            var percentileWrapperTemplate = contrail.getTemplate4Id(
                    cowc.TMPL_1COLUMN__1ROW_CONTENT_VIEW);
            var self = this,
                analyticsNodeList = [];
            self.$el.append(anlyticsTemplate);
            self.$el.append(percentileWrapperTemplate({cssClass: 'percentileWrapper col-xs-6 col-xs-offset-6'}));
            if (self.model != null) {
                var callBackExecuted = false;
                // Data loaded from cache
                if (self.model.loadedFromCache) {
                    renderCharts();
                // Ajax call completed
                } else if (!self.model.loadedFromCache && !self.model.isPrimaryRequestInProgress()){
                    renderCharts();
                // Ajax call is in progress, so subscribe for dataupdate
                } else {
                    self.model.onDataUpdate.subscribe(function (e, obj) {
                        renderCharts();
                    });
                }
                function renderCharts() {
                    if (callBackExecuted == false) {
                        callBackExecuted = true;
                        if(self.model.loadedFromCache) {
                            var cacheObj = cowch.getDataFromCache(ctwl.CACHE_ANALYTICSNODE),
                            cacheListModel = getValueByJsonPath(cacheObj, 'dataObject;listModel');
                            if (cacheListModel != null) {
                                analyticsNodeList = cacheListModel.getItems();
                            }
                        } else {
                            analyticsNodeList = self.model.getItems();
                        }
                        var topleftColumn = self.$el.find(".top-container .left-column"),
                            toprightCoulmn = self.$el.find(".top-container .right-column"),
                            bottomleftColumn = self.$el.find(".bottom-container .left-column"),
                            bottomrightCoulmn = self.$el.find(".bottom-container .right-column"),
                            bottomRow = self.$el.find(".percentileWrapper"),
                            sandeshModel = new AnalyticsNodeSandeshChartModel(),
                            queriesModel = new AnalyticsNodeQueriesChartModel(),
                            dbUsageModel = new AanlyticsNodeDatabaseUsageModel();
                            databseReadWritemodel = new AnalyticsNodeDataBaseReadWriteChartModel();
                        var colorMap = monitorInfraUtils.constructNodeColorMap(analyticsNodeList);
                        self.renderView4Config(topleftColumn,  sandeshModel,
                                getAnalyticsNodeSandeshChartViewConfig(colorMap));

                        self.renderView4Config(toprightCoulmn,  queriesModel,
                                getAnalyticsNodeQueriesChartViewConfig(colorMap));

                        self.renderView4Config(bottomrightCoulmn,  dbUsageModel,
                                getAnalyticsNodeDatabaseUsageChartViewConfig(colorMap));

                        self.renderView4Config(bottomleftColumn,  databseReadWritemodel,
                                getAnalyticsNodeDatabaseWriteChartViewConfig(colorMap));

                        self.renderView4Config(bottomRow, null,getPercentileTextViewConfig());}
                }
           }
        }
    });
   function getAnalyticsNodeSandeshChartViewConfig(colorMap) {
       return {
           elementId : ctwl.ANALYTICS_CHART_SANDESH_SECTION_ID,
           view : "SectionView",
           viewConfig : {
               rows : [ {
                   columns : [ {
                       elementId : ctwl.ANALYTICS_CHART_SANDESH_STACKEDBARCHART_ID,
                       view : "StackedBarChartWithFocusView",
                       viewConfig : {
                           class: 'mon-infra-chart chartMargin',
                           chartOptions:{
                               colorMap: colorMap,
                               brush: false,
                               height: 230,
                               xAxisLabel: '',
                               yAxisLabel: ctwl.ANALYTICS_CHART_SANDESH_LABEL,
                               yAxisOffset: 25,
                               axisLabelFontSize: 11,
                               tickPadding: 8,
                               margin: {
                                   left: 55,
                                   top: 35,
                                   right: 0,
                                   bottom: 40
                               },
                               bucketSize: monitorInfraConstants.CONFIGNODESTATS_BUCKET_DURATION/(1000 * 1000 * 60),//converting to minutes
                               sliceTooltipFn: function (data) {
                                   var tooltipConfig = {},
                                       time = data['time'];
                                       tooltipConfig['title'] = {
                                               name : data['name'],
                                               type: ctwl.ANALYTICS_NODES
                                       };
                                       tooltipConfig['content'] = {
                                           iconClass : false,
                                           info : [{
                                               label: 'Time',
                                               value: time
                                           },{
                                               label: ctwl.ANALYTICS_CHART_SANDESH_LABEL,
                                               value: ifNull(data['nodeReqCnt'], '-')
                                           }
                                           ]
                                       };
                                   var tooltipElementTemplate = contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP),
                                   tooltipElementTitleTemplate = contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP_TITLE),
                                   tooltipElementContentTemplate = contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP_CONTENT),
                                   tooltipElementObj, tooltipElementTitleObj, tooltipElementContentObj;
                                   tooltipConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_ELEMENT_TOOLTIP, tooltipConfig);
                                   tooltipElementObj = $(tooltipElementTemplate(tooltipConfig));
                                   tooltipElementTitleObj = $(tooltipElementTitleTemplate(tooltipConfig.title));
                                   tooltipElementContentObj = $(tooltipElementContentTemplate(tooltipConfig.content));
                                   tooltipElementObj.find('.popover-title').append(tooltipElementTitleObj);
                                   tooltipElementObj.css("position","relative");
                                   tooltipElementObj.find('.popover-content').append(tooltipElementContentObj);
                                   return $(tooltipElementObj).wrapAll('<div>').parent().html();
                               },
                               showLegend: true,
                               legendFn: function (data, container, chart) {
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
                                           colors: colorCodes,
                                           nodeColorMap: colorMap,
                                           label: ctwl.ANALYTICS_NODES,
                                       });
                                   }
                               }
                           },
                           parseFn: function (response, chartViewModel) {
                               return monitorInfraParsers.parseSandeshMessageStackChartData(response, chartViewModel);
                           }
                       }
                   }]
               }]
           }
       }

   }

   function getAnalyticsNodeQueriesChartViewConfig(colorMap) {
       return {
           elementId : ctwl.ANALYTICS_CHART_QUERIES_SECTION_ID,
           view : "SectionView",
           viewConfig : {
               rows : [ {

                   columns : [ {
                       elementId : ctwl.ANALYTICS_CHART_QUERIES_STACKEDBARCHART_ID,
                       view : "StackedBarChartWithFocusView",
                       viewConfig : {
                           class: 'mon-infra-chart chartMargin',
                           chartOptions:{
                               colorMap: colorMap,
                               brush: false,
                               height: 230,
                               xAxisLabel: '',
                               yAxisLabel: ctwl.ANALYTICS_CHART_QUERIES_LABEL,
                               yAxisOffset: 25,
                               axisLabelFontSize: 11,
                               tickPadding: 4,
                               margin: {
                                   left: 55,
                                   top: 35,
                                   right: 0,
                                   bottom: 40
                               },
                               bucketSize: monitorInfraConstants.CONFIGNODESTATS_BUCKET_DURATION/(1000 * 1000 * 60),//converting to minutes
                              sliceTooltipFn: function (data) {
                                  var tooltipConfig = {},
                                  time = data['time'];
                              if (data['name'] != monitorInfraConstants.CONFIGNODE_FAILEDREQUESTS_TITLE) {
                                  tooltipConfig['title'] = {
                                      name : data['name'],
                                      type : ctwl.ANALYTICS_NODES
                                  };
                                  tooltipConfig['content'] = {
                                      iconClass : false,
                                      info : [{
                                          label: 'Time',
                                          value: time
                                      }, {
                                          label: ctwl.ANALYTICS_CHART_QUERIES_LABEL,
                                          value: ifNull(data['nodeReqCnt'], '-')
                                      }, {
                                          label: ctwl.ANALYTICS_CHART_FAILED_QUERIES+'(%)',
                                          value: ifNull(data['reqFailPercent'], '-')
                                      }]
                                  };
                              } else {
                                  tooltipConfig['title'] = {
                                          name : data['name'],
                                          type: ctwl.ANALYTICS_NODES
                                  };
                                  tooltipConfig['content'] = {
                                      iconClass : false,
                                      info : [{
                                          label: 'Time',
                                          value: time
                                      },{
                                          label: ctwl.ANALYTICS_CHART_QUERIES_LABEL,
                                          value: ifNull(data['totalReqs'], '-')
                                      }, {
                                          label: ctwl.ANALYTICS_CHART_FAILED_QUERIES,
                                          value: ifNull(data['totalFailedReq'], '-')
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
                                           cssClass: 'contrail-legend-error',
                                           data: [data],
                                           offset: -10,
                                           nodeColorMap: {
                                               'Failures': monitorInfraConstants.CONFIGNODE_FAILEDREQUESTS_COLOR,
                                           },
                                           colors: monitorInfraConstants.CONFIGNODE_FAILEDREQUESTS_COLOR,
                                           label: 'Failures',
                                       });
                                       monitorInfraUtils.addLegendToSummaryPageCharts({
                                           container: legendWrap,
                                           cssClass: 'contrail-legend-stackedbar',
                                           data: colorCodes,
                                           offset: 70,
                                           colors: colorCodes,
                                           nodeColorMap: colorMap,
                                           label: ctwl.ANALYTICS_NODES,
                                       });
                                   }
                               }
                           },
                           parseFn: function (response, chartViewModel) {
                               return monitorInfraParsers.parseAnlyticsQueriesChartData(response, chartViewModel);
                           }
                       }
                   }]
               }]
           }
       }

   }

   function getAnalyticsNodeDatabaseUsageChartViewConfig(colorMap) {
       return {
           elementId : ctwl.ANALYTICS_CHART_DATABASE_READ_SECTION_ID,
           view : "SectionView",
           viewConfig : {
               rows : [ {

                   columns : [ {
                       elementId : ctwl.ANALYTICS_CHART_DATABASE_READ_STACKEDBARCHART_ID,
                       view : "StackedBarChartWithFocusView",
                       viewConfig : {
                           class: 'mon-infra-chart chartMargin',
                           chartOptions:{
                               colorMap: colorMap,
                               brush: false,
                               height: 230,
                               xAxisLabel: '',
                               yAxisLabel: ctwl.ANALYTICS_CHART_DATABASE_USAGE,
                               yAxisOffset: 25,
                               yAxisFormatter: function (d) {
                                   return formatBytes(d, true);
                               },
                               axisLabelFontSize: 11,
                               tickPadding: 8,
                               margin: {
                                   left: 55,
                                   top: 35,
                                   right: 0,
                                   bottom: 40
                               },
                               bucketSize: monitorInfraConstants.CONFIGNODESTATS_BUCKET_DURATION/(1000 * 1000 * 60),//converting to minutes
                               sliceTooltipFn: function (data) {
                                   var tooltipConfig = {},
                                   time = data['time'];
                               if (data['name'] != monitorInfraConstants.CONFIGNODE_FAILEDREQUESTS_TITLE) {
                                   tooltipConfig['title'] = {
                                       name : data['name'],
                                       type : ctwl.ANALYTICS_NODES
                                   };
                                   tooltipConfig['content'] = {
                                       iconClass : false,
                                       info : [{
                                           label: 'Time',
                                           value: time
                                       }, {
                                           label: ctwl.ANALYTICS_CHART_DATABASE_USAGE,
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
                                           colors: colorCodes,
                                           nodeColorMap: {
                                               'DB Usage': monitorInfraConstants.SINGLE_NODE_COLOR[0]
                                           },
                                           label: ctwl.ANALYTICS_CHART_DATABASE_USAGE,
                                       });
                                   }
                               }
                           },
                           parseFn: function (response, chartViewModel) {
                               return monitorInfraParsers.parseDatabaseUsageData(response, chartViewModel, 'MAX(database_usage.analytics_db_size_1k)');
                           }
                       }
                   }]
               }]
           }
       }

   }

   function getAnalyticsNodeDatabaseWriteChartViewConfig(colorMap) {
       return {
           elementId : ctwl.ANALYTICS_CHART_DATABASE_WRITE_SECTION_ID,
           view : "SectionView",
           viewConfig : {
               rows : [ {

                   columns : [ {
                       elementId : ctwl.ANALYTICS_CHART_DATABASE_WRITE_STACKEDBARCHART_ID,
                       view : "StackedBarChartWithFocusView",
                       viewConfig : {
                           class: 'mon-infra-chart chartMargin',
                           chartOptions:{
                               colorMap: colorMap,
                               brush: false,
                               height: 230,
                               xAxisLabel: '',
                               yAxisLabel: ctwl.ANALYTICS_CHART_DATABASE_WRITE_LABEL,
                               yAxisOffset: 25,
                               axisLabelFontSize: 11,
                               tickPadding: 8,
                               margin: {
                                   left: 55,
                                   top: 35,
                                   right: 0,
                                   bottom: 40
                               },
                               bucketSize: monitorInfraConstants.CONFIGNODESTATS_BUCKET_DURATION/(1000 * 1000 * 60),//converting to minutes
                               sliceTooltipFn: function (data) {
                                   var tooltipConfig = {},
                                   time = data['time'];
                               if (data['name'] != monitorInfraConstants.CONFIGNODE_FAILEDREQUESTS_TITLE) {
                                   tooltipConfig['title'] = {
                                       name : data['name'],
                                       type : ctwl.ANALYTICS_NODES
                                   };
                                   tooltipConfig['content'] = {
                                       iconClass : false,
                                       info : [{
                                           label: 'Time',
                                           value: time
                                       }, {
                                           label: ctwl.ANALYTICS_CHART_DATABASE_WRITE_LABEL,
                                           value: ifNull(data['nodeReqCnt'], '-')
                                       }, {
                                           label: ctwl.ANALYTICS_CHART_FAILED_DATABASE_WRITES+'(%)',
                                           value: ifNull(data['reqFailPercent'], '-')
                                       }]
                                   };
                               } else {
                                   tooltipConfig['title'] = {
                                           name : data['name'],
                                           type: 'Analytics'
                                   };
                                   tooltipConfig['content'] = {
                                       iconClass : false,
                                       info : [{
                                           label: 'Time',
                                           value: time
                                       },{
                                           label: 'Total Requests',
                                           value: ifNull(data['totalReqs'], '-')
                                       }, {
                                           label: ctwl.ANALYTICS_CHART_FAILED_DATABASE_WRITES,
                                           value: ifNull(data['totalFailedReq'], '-')
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
                                           cssClass: 'contrail-legend-error',
                                           data: [data],
                                           offset: -10,
                                           colors: monitorInfraConstants.CONFIGNODE_FAILEDREQUESTS_COLOR,
                                           nodeColorMap: {
                                               'Failures': monitorInfraConstants.CONFIGNODE_FAILEDREQUESTS_COLOR,
                                           },
                                           label: 'Failures',
                                       });
                                       monitorInfraUtils.addLegendToSummaryPageCharts({
                                           container: legendWrap,
                                           cssClass: 'contrail-legend-stackedbar',
                                           data: colorCodes,
                                           offset: 70,
                                           colors: colorCodes,
                                           nodeColorMap: colorMap,
                                           label: ctwl.ANALYTICS_NODES,
                                       });
                                   }
                               }
                           },
                           parseFn: function (response, chartViewModel) {
                               var dataBaseWritefailed = ctwl.ANALYTICS_CHART_DATABASE_WRITE_FAILS;
                               var dataBaseWritedata = ctwl.ANALYTICS_CHART_DATABASE_WRITE;
                               return monitorInfraParsers.parseAnlyticsNodeDataBaseReadWriteChartData(response, chartViewModel, dataBaseWritefailed, dataBaseWritedata);
                           }
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
                                           timeout : 120000 //2 mins
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
