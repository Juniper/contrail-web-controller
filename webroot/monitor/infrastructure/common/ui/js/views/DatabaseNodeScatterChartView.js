/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view'],function(_, ContrailView){
   var DatabaseNodeScatterChartView = ContrailView.extend({
                                       render : function (){
                                           this.renderView4Config(this.$el,
                                           this.model,
                                           getDatabaseNodeScatterChartViewConfig());
                                       }
                                    });

   function getDatabaseNodeScatterChartViewConfig() {
       return {
           elementId : ctwl.DATABASENODE_SUMMARY_SCATTERCHART_SECTION_ID,
           view : "SectionView",
           viewConfig : {
               rows : [ {
                   columns : [ {
                       elementId : ctwl.DATABASENODE_SUMMARY_SCATTERCHART_ID,
                       title : ctwl.DATABASENODE_SUMMARY_TITLE,
                       view : "ZoomScatterChartView",
                       viewConfig : {
                           loadChartInChunks : true,
                           chartOptions : {
                               xLabel : 'Available Space (GB)',
                               yLabel : 'Used Space (GB)',
                               forceX : [ 0, 1 ],
                               forceY : [ 0, 20 ],
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
                                                   color :
                                                       analyticsNode['color'],
                                                   size : contrail.handleIfNull(
                                                       analyticsNode['size'],
                                                       0),
                                                   rawData : analyticsNode
                                               });
                                   }
                                   return chartDataValues;
                               },
                               tooltipConfigCB : getDatabaseNodeTooltipConfig,
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
           var databaseNodeName = chartConfig.name, hashObj = {
               node : databaseNodeName
           };

           layoutHandler.setURLHashParams(hashObj, {
               p : "monitor_infra_database",
               merge : false,
               triggerHashChange : true
           });
       };

       function getDatabaseNodeTooltipConfig(
               data) {
           var databaseNode = data.rawData;
           var tooltipData = [
              {
                  label : 'Host Name',
                  value : databaseNode['name']
              },
              {
                  label : 'Disk Space',
                  value : '',options:{noLabelColon:true}
              },
              {
                  label : 'Available',
                  value : databaseNode['formattedAvailableSpace']
              },
              {
                  label : 'Used',
                  value : databaseNode['formattedUsedSpace']
              },
              {
                  label : 'Usage',
                  value : databaseNode['formattedUsedPercentage']
              },
              {
                  label : 'Analytics DB',
                  value:'', options:{noLabelColon: true}
              }
           ];
           var tooltipAlerts = monitorInfraUtils.getTooltipAlerts(databaseNode);
           tooltipData = tooltipData.concat(tooltipAlerts);
           var tooltipConfig = {
               title : {
                   name : data.name,
                   type : 'Database Node'
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
                               p : "mon_infra_database",
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
               groups : [ {
                   id : 'by-node-color',
                   title : 'Node Color',
                   items : [ {
                       text : 'Disk space usage warning',
                       labelCssClass : 'icon-circle warning',
                       events : {
                           click : function(
                                   event) {
                           }
                       }
                   }, {
                       text : infraAlertMsgs['UVE_MISSING'] + ' or ' +
                       infraAlertMsgs['NTP_UNSYNCED_ERROR'] + ' or ' +
                       'Disk space usage exceeds threshold',
                       labelCssClass : 'icon-circle error',
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
   return DatabaseNodeScatterChartView;
});