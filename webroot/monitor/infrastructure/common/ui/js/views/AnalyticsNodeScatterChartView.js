/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view'],function(_, ContrailView){
   var AnalyticsNodeScatterChartView = ContrailView.extend({
        render : function (){
            var widgetConfig = getValueByJsonPath(this,'attributes;viewConfig;widgetConfig');
            if(widgetConfig != null) {
                this.renderView4Config(this.$el,
                this.model,
                widgetConfig
                );
            }
            this.renderView4Config(this.$el,
            this.model,
            getConfigNodeScatterChartViewConfig()
            );
        }
    });

   function getConfigNodeScatterChartViewConfig() {
       return {
           elementId : ctwl.ANALYTICSNODE_SUMMARY_SCATTERCHART_SECTION_ID,
           view : "SectionView",
           viewConfig : {
               rows : [ {
                   columns : [ {
                       elementId : ctwl.ANALYTICSNODE_SUMMARY_SCATTERCHART_ID,
                       title : ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                       view : "ZoomScatterChartView",
                       viewConfig : {
                           loadChartInChunks : true,
                           chartOptions : {
                               xLabel : ctwl.TITLE_CPU,
                               yLabel : 'Memory (MB)',
                               forceX : [ 0, 1 ],
                               forceY : [ 0, 20 ],
                               margin: {top:10},
                               dataParser : function(
                                       response) {
                                   var chartDataValues = [ ];
                                   for ( var i = 0; i < response.length; i++) {
                                       var analyticsNode = response[i];
                                       chartDataValues
                                           .push({
                                               name : analyticsNode['name'],
                                               y : analyticsNode['y'],
                                               x : contrail.handleIfNull(
                                                   analyticsNode['x'],
                                                   0),
                                               color : analyticsNode['color'],
                                               size : contrail.handleIfNull(
                                                   analyticsNode['size'],
                                                   0),
                                               rawData : analyticsNode
                                           });
                                   }
                                   return chartDataValues;
                               },
                               tooltipConfigCB : getAnalyticsNodeTooltipConfig,
                               controlPanelConfig: {
                                   // legend: {
                                   //     enable: true,
                                   //     viewConfig: getControlPanelLegendConfig()
                                   // }
                               },
                               clickCB : onScatterChartClick
                           }
                       }
                   } ]
               } ]
           }
       };

       function onScatterChartClick(chartConfig) {
           var analyticsNode = chartConfig.name, hashObj = {
                type: "analyticsNode",
                view: "details",
                focusedElement: {
                    node: analyticsNode,
                    tab: 'details'
                }
            };

           layoutHandler.setURLHashParams(hashObj, {
               p : "mon_infra_analytics",
               merge : false,
               triggerHashChange : true
           });
       };

       function getAnalyticsNodeTooltipConfig(data) {
           var analyticsNode = data.rawData;
           var tooltipData = [
                              {
                                  label : 'Version',
                                  value : analyticsNode.version
                              },
                              {
                                  label : ctwl.TITLE_CPU,
                                  value : analyticsNode.cpu,
                              },
                              {
                                  label : 'Memory',
                                  value : analyticsNode.memory,
                              }];
           var tooltipAlerts = monitorInfraUtils.getTooltipAlerts(analyticsNode);
           tooltipData = tooltipData.concat(tooltipAlerts);
           var tooltipConfig = {
               title : {
                   name : data.name,
                   type : 'Analytics Node'
               },
               content : {
                   iconClass : false,
                   info : tooltipData,
                   actions : [ {
                       type : 'link',
                       text : 'View',
                       iconClass : 'fa fa-external-link',
                       callback : onScatterChartClick
                   } ]
               },
               delay : cowc.TOOLTIP_DELAY
           };

           return tooltipConfig;
       };

       function getControlPanelLegendConfig() {
           return {
               groups : [ {
                   id : 'by-node-color',
                   title : 'Node Color',
                   items : [{
                       text : 'Errors in UVE', //TODO need to discuss the format
                       labelCssClass : 'fa-circle warning',
                       events : {
                           click : function(
                                   event) {
                           }
                       }
                   },{
                       text : infraAlertMsgs['UVE_MISSING']+ ' or ' +
                       infraAlertMsgs['NTP_UNSYNCED_ERROR'],
                       labelCssClass : 'fa-circle error',
                       events : {
                           click : function(
                                   event) {
                           }
                       }
                   } ]
               }]
           };
       };
   }
   return AnalyticsNodeScatterChartView;
});
