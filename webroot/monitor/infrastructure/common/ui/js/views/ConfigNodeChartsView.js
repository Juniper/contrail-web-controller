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
                           widgetConfig: {
                               elementId: ctwl.CONFIGNODE_SUMMARY_STACKEDCHART_ID + '-widget',
                               view: "WidgetView",
                               viewConfig: {
                                   header: {
                                       title: 'Request Served',
                                   },
                                   controls: {
                                       top: {
                                           default: {
                                               collapseable: false
                                           }
                                       }
                                   }
                               }
                           },
                           class: 'span7 confignode-chart',
                           chartOptions:{
                               brush: false,
                               height: 380,
                               xAxisLabel: 'Time (hrs)',
                               yAxisLabel: 'Request Served',
                               yAxisOffset: 25,
                               axisLabelFontSize: 11,
                               tickPadding: 8,
                               margin: {
                                   left: 45,
                                   top: 25,
                                   right: 0,
                                   bottom: 40
                               },
                               bucketSize: monitorInfraConstants.CONFIGNODESTATS_BUCKET_DURATION/(1000 * 1000 * 60),//converting to minutes
                               sliceTooltipFn: function (data) {
                                   var tooltipConfig = {};
                                   if (data['name'] != monitorInfraConstants.CONFIGNODE_FAILEDREQUESTS_TITLE) {
                                       tooltipConfig['title'] = {
                                           name : data['name'],
                                           type : 'Config Node'
                                       };
                                       tooltipConfig['content'] = {
                                           iconClass : false,
                                           info : [{
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
                                      //legend for failure requests
                                      legendWrap.selectAll('.contrail-legend')
                                          .data([data])
                                          .enter()
                                          .append('g')
                                          .attr('transform','translate('+(-10)+',0)')
                                          .attr('class', 'contrail-legend')
                                          .append('rect')
                                          .style('fill', monitorInfraConstants.CONFIGNODE_FAILEDREQUESTS_COLOR);
                                       legendWrap.append('g')
                                           .attr('class', 'contrail-legend')
                                           .attr('transform','translate('+(- 20)+',0)')
                                           .append('text')
                                           .attr('dy', 8)
                                           .attr('text-anchor', 'end')
                                           .text('Failure');
                                       var legend = legendWrap.selectAll('.contrail-slegend')
                                              .data(colorCodes)
                                              .enter()
                                              .append('g')
                                              .attr('class','contrail-legend')
                                              .attr('transform',function (d, i) { return 'translate('+ - (( colorCodes.length - i) * 20 + 70)+',0)';})
                                       legend.append('rect')
                                             .style('fill', function (d, i) {
                                                 return colorCodes[i];
                                             }).on('click', function () {
                                                 //need to write the click handler
                                             });
                                       legendWrap.append('g')
                                           .attr('class','contrail-legend')
                                           .attr('transform','translate('+ (-((colorCodes.length * 20) + 10 + 70)) +',0)')
                                           .append('text')
                                           .attr('dy', 8)
                                           .attr('text-anchor', 'end')
                                           .text('Config Nodes');
                                   }
                               }
                           },
                           parseFn: function (response) {
                               return monitorInfraParsers.parseConfigNodeRequestsStackChartData(response);
                           }
                       }
                   }, {
                       elementId: ctwl.CONFIGNODE_SUMMARY_LINEBARCHART_ID,
                       view: 'LineBarWithFocusChartView',
                       viewConfig: {
                           widgetConfig: {
                               elementId: ctwl.CONFIGNODE_SUMMARY_LINEBARCHART_ID + '-widget',
                               view: "WidgetView",
                               viewConfig: {
                                   header: {
                                       title: 'Response Parameters',
                                   },
                                   controls: {
                                       top: {
                                           default: {
                                               collapseable: false
                                           }
                                       }
                                   }
                               }
                           },
                           class: 'span5 confignode-chart',
                           parseFn: function (response) {
                               return monitorInfraParsers.parseConfigNodeResponseStackedChartData(response);
                           },
                           chartOptions: {
                               y1AxisLabel:ctwl.RESPONSE_TIME,
                               y2AxisLabel:ctwl.RESPONSE_SIZE,
                               xAxisTicksCnt: 8, //(for every 15 mins, total duration is 2 hrs)
                               margin: {top: 20, right: 70, bottom: 40, left: 60},
                               axisLabelDistance: -10,
                               //forceY1: [0, 1],
                               focusEnable: false,
                               height: 190,
                               showLegend: true,
                               xAxisLabel: 'Time (hrs)',
                               xFormatter: function (xValue) {
                                   return d3.time.format('%H:%M')(new Date(xValue));
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
                                       //Appending the line chart legend
                                       legendWrap.selectAll('g')
                                               .data(lineData)
                                               .enter()
                                               .append('g')
                                               .attr('transform', function (d, i) {
                                                   return 'translate('+ (- (i + 1) * 20) +', 0)';
                                               }).attr('class','contrail-legend')
                                               .append('rect')
                                               .attr('fill', function (d, i) {
                                                   return d['color'];
                                               })
                                       legendWrap.append('g')
                                           .attr('transform', 'translate('+ (- ((lineCnt * 20 ) + 10))+', 0)')
                                           .attr('class', 'contrail-legend')
                                           .append('text')
                                           .attr('dy', 8)
                                           .attr('text-anchor', 'end')
                                           .text(ctwl.RESPONSE_SIZE);
                                       //Appending the bar chart legend
                                       var legend = legendWrap.selectAll('g.contrail-legend-bar')
                                           .data(barsData)
                                           .enter()
                                           .append('g')
                                           .attr('transform', function (d, i) {
                                               return 'translate('+ (- (((barsData.length - i) + lineCnt + 1) * 20 + 80) )+', 0)';
                                           })
                                           .attr('class', 'contrail-legend')
                                           .append('rect')
                                           .attr('fill', function (d, i) {
                                               return d['color'];
                                           });
                                         legendWrap.append('g')
                                             .attr('transform', 'translate('+(- ((lineCnt + barsCnt + 1) * 20 + 90))+', 0)')
                                             .attr('class', 'contrail-legend')
                                             .append('text')
                                             .attr('text-anchor', 'end')
                                             .attr('dy', 8)
                                             .text('Config Nodes');
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
                           widgetConfig: {
                               elementId: ctwl.CONFIGNODE_SUMMARY_DONUTCHART_SECTION_ID + '-widget',
                               view: "WidgetView",
                               viewConfig: {
                                   header: {
                                       title: 'Config Node',
                                   },
                                   controls: {
                                       top: {
                                           default: {
                                               collapseable: false
                                           }
                                       }
                                   }
                               }
                           },
                           class: 'span5 confignode-chart'
                       }
                   }]
               }]
           }
       }

   }
   return ConfigNodeChartView;
});
