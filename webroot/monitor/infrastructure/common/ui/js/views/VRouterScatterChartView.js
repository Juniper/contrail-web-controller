/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view'], function(_, ContrailView) {
   var VRouterScatterChartView = ContrailView.extend({
       render: function() {
           this.renderView4Config(this.$el,
           this.model,
           getVRouterScatterChartViewConfig());
       }
   });
   
   function getVRouterScatterChartViewConfig() {
       return {
           elementId: ctwl.VROUTER_SUMMARY_SCATTERCHART_SECTION_ID,
           view: "SectionView",
           viewConfig: {
               rows: [{
                   columns: [{
                       elementId: ctwl.VROUTER_SUMMARY_SCATTERCHART_ID,
                       title: ctwl.VROUTER_SUMMARY_TITLE,
                       view: "ZoomScatterChartView",
                       viewConfig: {
                           loadChartInChunks: true,
                           chartOptions: {
                               xLabel: 'CPU (%)',
                               yLabel: 'Memory (MB)',
                               forceX: [0, 1],
                               forceY: [0, 20],
                               dataParser: function(response) {
                                   var chartDataValues = [];
                                   for (var i = 0; i < response.length; i++) {
                                       var vRouterNode = response[i];

                                       chartDataValues.push({
                                           name: vRouterNode['name'],
                                           y: ifNotNumeric(vRouterNode['y'],0),
                                           x: ifNotNumeric(vRouterNode['x'],0),
                                           color: vRouterNode['color'],
                                           size: contrail.handleIfNull(
                                                vRouterNode['size'],0),
                                           rawData: vRouterNode
                                       });
                                   }
                                   return chartDataValues;
                               },
                               tooltipConfigCB: getVRouterTooltipConfig,
                               clickCB: onScatterChartClick
                           }
                       }
                   }]
               }]
           }
       };

       function onScatterChartClick(chartConfig) {
           var controlNodeName = chartConfig.name,
               hashObj = {
                   name: controlNodeName,
                   tab: ''
               };

           layoutHandler.setURLHashParams(hashObj, {
               p: "monitor_infra_vrouter",
               merge: false,
               triggerHashChange: true
           });
       };

       function getVRouterTooltipConfig(data) {
           var controlNode = data.rawData;
           var tooltipData = [{
               label: 'Version',
               value: controlNode.version
           }, {
               label: 'CPU',
               value: controlNode.cpu,
           }, {
               label: 'Memory',
               value: controlNode.memory,
           }];
           var tooltipAlerts = monitorInfraUtils.getTooltipAlerts(controlNode);
           tooltipData = tooltipData.concat(tooltipAlerts);
           var tooltipConfig = {
               title: {
                   name: data.name,
                   type: 'Virtual Router'
               },
               content: {
                   iconClass: false,
                   info: tooltipData,
                   actions: [{
                       type: 'link',
                       text: 'View',
                       iconClass: 'icon-external-link',
                       callback: function(
                       data) {
                           var nodeName = data.name,
                               hashObj = {
                                   node: nodeName
                               };
                           layoutHandler.setURLHashParams(hashObj, {
                               p: "mon_infra_vrouter",
                               merge: false,
                               triggerHashChange: true
                           });
                       }
                   }]
               },
               delay: cowc.TOOLTIP_DELAY
           };

           return tooltipConfig;
       };

       function getControlPanelFilterConfig() {
           return {
               groups: [{
                   id: 'by-node-color',
                   title: 'By Node Color',
                   type: 'radio',
                   items: [{
                       text: 'Filter 1',
                       labelCssClass: 'okay',
                       events: {
                           click: function(
                           event) {
                               console.log('Filter 1');
                           }
                       }
                   }, {
                       text: 'Filter 2',
                       labelCssClass: 'medium',
                       events: {
                           click: function(
                           event) {
                               console.log('Filter 2');
                           }
                       }
                   }]
               }]
           };
       };

       function getControlPanelLegendConfig() {
           return {
               groups: [{
                   id: 'by-node-color',
                   title: 'Cluster Color',
                   items: [{
                       text: 'Provisioned Server = Total Servers',
                       labelCssClass: 'icon-circle okay',
                       events: {
                           click: function(
                           event) {}
                       }
                   }, {
                       text: 'Provisioned Server != Total Servers',
                       labelCssClass: 'icon-circle medium',
                       events: {
                           click: function(
                           event) {}
                       }
                   }]
               }, {
                   id: 'by-node-size',
                   title: 'Cluster Size',
                   items: [{
                       text: 'Total Network Traffic',
                       labelCssClass: 'icon-circle',
                       events: {
                           click: function(
                           event) {}
                       }
                   }]
               }]
           };
       };
   }
   return VRouterScatterChartView;
});
