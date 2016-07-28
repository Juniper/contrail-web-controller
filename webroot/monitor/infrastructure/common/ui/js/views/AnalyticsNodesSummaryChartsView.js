/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view',
       'monitor-infra-analytics-sandesh-chart-model', 'monitor-infra-analytics-queries-chart-model', 'monitor-infra-analytics-database-read-write-chart-model'],function(_, ContrailView,AnalyticsNodeSandeshChartModel, AnalyticsNodeQueriesChartModel, AnalyticsNodeDataBaseReadWriteChartModel){
        var AnalyticsNodesSummaryChartsView = ContrailView.extend({
        render : function (){
            var anlyticsTemplate = contrail.getTemplate4Id(
                    cowc.TMPL_4COLUMN__2ROW_CONTENT_VIEW);
            var self = this;
            this.$el.html(anlyticsTemplate);
            var topleftColumn = this.$el.find(".top-container .left-column"),
                toprightCoulmn = this.$el.find(".top-container .right-column"),
                bottomleftColumn = this.$el.find(".bottom-container .left-column"),
                bottomrightCoulmn = this.$el.find(".bottom-container .right-column"),
                sandeshModel = new AnalyticsNodeSandeshChartModel(),
                queriesModel = new AnalyticsNodeQueriesChartModel(),
                databseReadWritemodel = new AnalyticsNodeDataBaseReadWriteChartModel();

            self.renderView4Config(topleftColumn,  sandeshModel,
                    getAnalyticsNodeSandeshChartViewConfig());

            self.renderView4Config(toprightCoulmn,  queriesModel,
                    getAnalyticsNodeQueriesChartViewConfig());

            self.renderView4Config(bottomrightCoulmn,  databseReadWritemodel,
                    getAnalyticsNodeDatabaseReadChartViewConfig());

            self.renderView4Config(bottomleftColumn,  databseReadWritemodel,
                    getAnalyticsNodeDatabaseWriteChartViewConfig());
        }
    });
   function getAnalyticsNodeSandeshChartViewConfig() {
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
                               brush: false,
                               height: 230,
                               xAxisLabel: '',
                               yAxisLabel: ctwl.ANALYTICS_CHART_SANDESH_LABEL,
                               yAxisOffset: 25,
                               axisLabelFontSize: 11,
                               tickPadding: 8,
                               margin: {
                                   left: 40,
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

   function getAnalyticsNodeQueriesChartViewConfig() {
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
                               brush: false,
                               height: 230,
                               xAxisLabel: '',
                               yAxisLabel: ctwl.ANALYTICS_CHART_QUERIES_LABEL,
                               yAxisOffset: 25,
                               axisLabelFontSize: 11,
                               tickPadding: 4,
                               margin: {
                                   left: 40,
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
                                           colors: monitorInfraConstants.CONFIGNODE_FAILEDREQUESTS_COLOR,
                                           label: 'Failures',
                                       });
                                       monitorInfraUtils.addLegendToSummaryPageCharts({
                                           container: legendWrap,
                                           cssClass: 'contrail-legend-stackedbar',
                                           data: colorCodes,
                                           offset: 70,
                                           colors: colorCodes,
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

   function getAnalyticsNodeDatabaseReadChartViewConfig() {
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
                               brush: false,
                               height: 230,
                               xAxisLabel: '',
                               yAxisLabel: ctwl.ANALYTICS_CHART_DATABASE_READ_LABEL,
                               yAxisOffset: 25,
                               axisLabelFontSize: 11,
                               tickPadding: 8,
                               margin: {
                                   left: 40,
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
                                           label: ctwl.ANALYTICS_CHART_DATABASE_READ_LABEL,
                                           value: ifNull(data['nodeReqCnt'], '-')
                                       }, {
                                           label: ctwl.ANALYTICS_CHART_FAILED_DATABASE_READS+'(%)',
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
                                           label: 'Total Requests',
                                           value: ifNull(data['totalReqs'], '-')
                                       }, {
                                           label: ctwl.ANALYTICS_CHART_FAILED_DATABASE_READS,
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
                                           label: 'Failures',
                                       });
                                       monitorInfraUtils.addLegendToSummaryPageCharts({
                                           container: legendWrap,
                                           cssClass: 'contrail-legend-stackedbar',
                                           data: colorCodes,
                                           offset: 70,
                                           colors: colorCodes,
                                           label: ctwl.ANALYTICS_NODES,
                                       });
                                   }
                               }
                           },
                           parseFn: function (response, chartViewModel) {
                               var dataBaseReadfailed = ctwl.ANALYTICS_CHART_DATABASE_READ_FAILS;
                               var dataBaseReaddata = ctwl.ANALYTICS_CHART_DATABASE_READ;
                               return monitorInfraParsers.parseAnlyticsNodeDataBaseReadWriteChartData(response, chartViewModel, dataBaseReadfailed, dataBaseReaddata);
                           }
                       }
                   }]
               }]
           }
       }

   }

   function getAnalyticsNodeDatabaseWriteChartViewConfig() {
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
                               brush: false,
                               height: 230,
                               xAxisLabel: '',
                               yAxisLabel: ctwl.ANALYTICS_CHART_DATABASE_WRITE_LABEL,
                               yAxisOffset: 25,
                               axisLabelFontSize: 11,
                               tickPadding: 8,
                               margin: {
                                   left: 40,
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
                                           label: 'Failures',
                                       });
                                       monitorInfraUtils.addLegendToSummaryPageCharts({
                                           container: legendWrap,
                                           cssClass: 'contrail-legend-stackedbar',
                                           data: colorCodes,
                                           offset: 70,
                                           colors: colorCodes,
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
   return AnalyticsNodesSummaryChartsView;
});
