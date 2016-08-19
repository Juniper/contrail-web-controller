/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view'],function(_, ContrailView){
   var ControlNodeScatterChartView = ContrailView.extend({
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
            getControlNodeScatterChartViewConfig()
            );
        }
    });

   function getControlNodeScatterChartViewConfig() {
       return {
           elementId : ctwl.CONTROLNODE_SUMMARY_SCATTERCHART_SECTION_ID,
           view : "SectionView",
           viewConfig : {
               rows : [ {
                   columns : [ {
                       elementId : ctwl.CONTROLNODE_SUMMARY_SCATTERCHART_ID,
                       title : ctwl.CONTROLNODE_SUMMARY_TITLE,
                       view : "ZoomScatterChartView",
                       viewConfig : {
                           loadChartInChunks : true,
                           chartOptions : {
                               sortFn:function(data){
                                   return data.reverse();
                               },
                               xLabel : ctwl.TITLE_CPU,
                               yLabel : 'Memory (MB)',
                               margin: {top:10},
                               forceX : [ 0, 1 ],
                               forceY : [ 0, 20 ],
                               dataParser : function(
                                       response) {
                                   var chartDataValues = [ ];
                                   for ( var i = 0; i < response.length; i++) {
                                       var controlNode = response[i];

                                       chartDataValues
                                               .push({
                                                   name : controlNode['name'],
                                                   y : controlNode['y'],
                                                   x : contrail.handleIfNull(
                                                       controlNode['x'],
                                                       0),
                                                   color : controlNode['color'],
                                                   size : contrail.handleIfNull(
                                                       controlNode['size'],
                                                       0),
                                                   rawData : controlNode
                                               });
                                   }
                                   return chartDataValues;
                               },
                               tooltipConfigCB : getControlNodeTooltipConfig,
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

       function onScatterChartClick(
               chartConfig) {
           var controlNodeName = chartConfig.name, hashObj = {
               type: 'controlNode',
               view: 'details',
               focusedElement: {
                    node:controlNodeName,
                    tab:'details'
               }
           };

           layoutHandler.setURLHashParams(hashObj, {
               p : "mon_infra_control",
               merge : false,
               triggerHashChange : true
           });
       };

       function getControlNodeTooltipConfig(
               data) {
           var controlNode = data.rawData;
           var tooltipData = [
                              {
                                  label : 'Version',
                                  value : controlNode.version
                              },
                              {
                                  label : ctwl.TITLE_CPU,
                                  value : controlNode.cpu,
                              },
                              {
                                  label : 'Memory',
                                  value : controlNode.memory,
                              }];
           var tooltipAlerts = monitorInfraUtils.getTooltipAlerts(controlNode);
           tooltipData = tooltipData.concat(tooltipAlerts);
           var tooltipConfig = {
               title : {
                   name : data.name,
                   type : 'Control Node'
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
               groups : [{
                   id : 'by-node-color',
                   title : 'Node Color',
                   items : [ {
                       text : infraAlertMsgs['UVE_MISSING'] + ' or ' +
                           infraAlertMsgs['CONFIG_MISSING'] + ' or ' +
                           infraAlertMsgs['CONFIG_IP_MISMATCH'] + ' or ' +
                           infraAlertMsgs['IFMAP_DOWN'] + ' or ' +
                           infraAlertMsgs['NTP_UNSYNCED_ERROR'],
                       labelCssClass : 'fa-circle error',
                       events : {
                           click : function(
                                   event) {
                           }
                       }
                   },{
                       text : 'XMPP peer down or BGP peer down ' +
                           infraAlertMsgs['BGP_CONFIG_MISMATCH'],
                       labelCssClass : 'fa-circle warning',
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
   return ControlNodeScatterChartView;
});
