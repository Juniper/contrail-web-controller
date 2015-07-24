/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view'],function(_, ContrailView){
   var ConfigNodeScatterChartView = ContrailView.extend({
                                       render : function (){
                                           this.renderView4Config(this.$el, 
                                           this.model, 
                                           getConfigNodeScatterChartViewConfig()
                                           );
                                       }
                                    });
   
   function getConfigNodeScatterChartViewConfig() {
       return {
           elementId : ctwl.CONFIGNODE_SUMMARY_SCATTERCHART_SECTION_ID,
           view : "SectionView",
           viewConfig : {
               rows : [ {
                   columns : [ {
                       elementId : ctwl.CONFIGNODE_SUMMARY_SCATTERCHART_ID,
                       title : ctwl.CONFIGNODE_SUMMARY_TITLE,
                       view : "ZoomScatterChartView",
                       viewConfig : {
                           loadChartInChunks : true,
                           chartOptions : {
                               xLabel : 'CPU (%)',
                               yLabel : 'Memory (MB)',
                               forceX : [ 0, 1 ],
                               forceY : [ 0, 20 ],
                               dataParser : function(
                                       response) {
                                   var chartDataValues = [ ];
                                   for ( var i = 0; i < response.length; i++) {
                                       var configNode = response[i];

                                       chartDataValues
                                               .push({
                                                   name : configNode['name'],
                                                   y : configNode['y'],
                                                   x : contrail.handleIfNull(
                                                       configNode['x'],
                                                       0),
                                                   color : configNode['color'],
                                                   size : contrail.handleIfNull(
                                                       configNode['size'],
                                                       0),
                                                   rawData : configNode
                                               });
                                   }
                                   return chartDataValues;
                               },
                               tooltipConfigCB : getConfigNodeTooltipConfig,
                               controlPanelConfig: {
                                   legend: {
                                       enable: true,
                                       viewConfig: getControlPanelLegendConfig()
                                   }
                               },
                               clickCB : onScatterChartClick
                           }
                       }
                   } ]
               } ]
           }
       };
       
       function onScatterChartClick(
               chartConfig) {
           var configNodeName = chartConfig.name, hashObj = {
               name : configNodeName,
               tab : ''
           };

           layoutHandler.setURLHashParams(hashObj, {
               p : "monitor_infra_config",
               merge : false,
               triggerHashChange : true
           });
       };

       function getConfigNodeTooltipConfig(
               data) {
           var configNode = data.rawData;
           var tooltipData = [
                              {
                                  label : 'Version',
                                  value : configNode.version
                              },
                              {
                                  label : 'CPU',
                                  value : configNode.cpu,
                              },
                              {
                                  label : 'Memory',
                                  value : configNode.memory,
                              }];          
           var tooltipAlerts = monitorInfraUtils.getTooltipAlerts(configNode);
           tooltipData = tooltipData.concat(tooltipAlerts);
           var tooltipConfig = {
               title : {
                   name : data.name,
                   type : 'Config Node'
               },
               content : {
                   iconClass : false,
                   info : tooltipData,
                   actions : [ {
                       type : 'link',
                       text : 'View',
                       iconClass : 'icon-external-link',
                       callback : function(
                               data) {
                           var nodeName = data.name, hashObj = {
                               node : nodeName
                           };
                           layoutHandler.setURLHashParams(hashObj, {
                               p : "mon_infra_config",
                               merge : false,
                               triggerHashChange : true
                           });
                       }
                   } ]
               },
               delay : cowc.TOOLTIP_DELAY
           };

           return tooltipConfig;
       };

       function getControlPanelLegendConfig() {
           return {
               groups : [{
                   id : 'by-node-color',
                   title : 'Node Color',
                   items : [{
                       text : infraAlertMsgs['UVE_MISSING']+ ' or ' + 
                           infraAlertMsgs['NTP_UNSYNCED_ERROR'],
                       labelCssClass : 'icon-circle error',
                       events : {
                           click : function(
                               event) {
                       }
                   }
                   }]
               }]
           };
       };
   }
   return ConfigNodeScatterChartView;
});