/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view',
        'monitor-infra-confignode-charts-model'],function(_, ContrailView, ConfigNodeChartsModel){
   var ConfigNodeChartView = ContrailView.extend({
        render : function (){
            this.model = new ConfigNodeChartsModel();
            this.renderView4Config(this.$el, this.model,
                    getConfigNodeChartViewConfig());
        }
    });

   function getConfigNodeChartViewConfig() {
       return {
           elementId : ctwl.CONFIGNODE_SUMMARY_CHART_SECTION_ID,
           view : "SectionView",
           viewConfig : {
               rows : [ {
                   columns : [ {
                       elementId : ctwl.CONFIGNODE_SUMMARY_STACKEDCHART_ID,
                       view : "StackedBarChartWithFocusView",
                       viewConfig : {
                           class: 'span7 mon-infra-chart',
                           chartOptions:{
                               brush: false,
                               height: 380,
                               xAxisLabel: '',
                               yAxisLabel: 'Requests Served',
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
                                           type : 'Config Node'
                                       };
                                       tooltipConfig['content'] = {
                                           iconClass : false,
                                           info : [{
                                               label: 'Time',
                                               value: time
                                           }, {
                                               label: 'Requests',
                                               value: ifNull(data['nodeReqCnt'], '-')
                                           }, {
                                               label: 'Failed Requests (%)',
                                               value: ifNull(data['reqFailPercent'], '-')
                                           }, {
                                               label: 'Avg Response Time',
                                               value: ifNull(data['avgResTime'], '-')
                                           }]
                                       };
                                   } else {
                                       tooltipConfig['title'] = {
                                               name : data['name'],
                                               type: 'Across Config Nodes'
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
                                               label: 'Failed Requests',
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
                                           label: 'Config Nodes',
                                       });
                                   }
                               }
                           },
                           parseFn: function (response, chartViewModel) {
                               return monitorInfraParsers.parseConfigNodeRequestsStackChartData(response, chartViewModel);
                           }
                       }
                   }, {
                       elementId: ctwl.CONFIGNODE_SUMMARY_LINEBARCHART_ID,
                       view: 'LineBarWithFocusChartView',
                       viewConfig: {
                           class: 'span5 mon-infra-chart',
                           parseFn: function (response) {
                               return monitorInfraParsers.parseConfigNodeResponseStackedChartData(response);
                           },
                           chartOptions: {
                               y1AxisLabel:ctwl.RESPONSE_TIME,
                               y2AxisLabel:ctwl.RESPONSE_SIZE,
                               xAxisTicksCnt: 8, //In case of time scale for every 15 mins one tick
                               margin: {top: 20, right: 50, bottom: 40, left: 50},
                               axisLabelDistance: -10,
                               y2AxisWidth: 50,
                               //forceY1: [0, 1],
                               focusEnable: false,
                               height: 190,
                               showLegend: true,
                               xAxisLabel: '',
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
                               legendFn: function (data, svg, chart) {
                                   if (data != null && svg != null && chart != null) {
                                       //Remove any existing legend
                                       $(svg).find('g.contrail-legendWrap').remove();
                                       var width = parseInt($(svg).css('width') || svg.getBBox()['width']);
                                       var barsCnt = 0,
                                           lineCnt = 0,
                                           barsData = [],
                                           lineData = [];
                                       $.each(data, function (idx, obj) {
                                           if (obj['bar'] == true) {
                                               barsCnt ++;
                                               barsData.push(obj);
                                           } else {
                                               lineCnt ++;
                                               lineData.push(obj);
                                           }
                                       });
                                       var legendWrap = d3.select(svg)
                                           .append('g')
                                           .attr('transform', 'translate('+width+', 0)')
                                           .attr('class', 'contrail-legendWrap');
                                       monitorInfraUtils.addLegendToSummaryPageCharts({
                                           container: legendWrap,
                                           cssClass: 'contrail-legend-line',
                                           data: lineData,
                                           label: ctwl.RESPONSE_SIZE
                                       });
                                       monitorInfraUtils.addLegendToSummaryPageCharts({
                                           container: legendWrap,
                                           cssClass: 'contrail-legend-bar',
                                           data: barsData,
                                           offset: 90 + lineCnt * 20,
                                           label: 'Config Nodes'
                                       });
                                   }
                               }
                           },
                       }
                   }, {
                       elementId: ctwl.CONFIGNODE_SUMMARY_DONUTCHART_SECTION_ID,
                       view: 'ConfigNodeDonutChartView',
                       viewPathPrefix: ctwl.MONITOR_INFRA_VIEW_PATH,
                       app : cowc.APP_CONTRAIL_CONTROLLER,
                       viewConfig: {
                           class: 'span5 mon-infra-chart'
                       }
                   }]
               }]
           }
       }

   }
   return ConfigNodeChartView;
});
