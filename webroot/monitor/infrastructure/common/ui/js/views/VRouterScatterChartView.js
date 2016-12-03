/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view'], function(_, ContrailView) {
   var VRouterScatterChartView = ContrailView.extend({
       render: function() {
            var widgetConfig = getValueByJsonPath(this,'attributes;viewConfig;widgetConfig');
            var self = this;
            var viewConfig = (this.attributes)? this.attributes.viewConfig : null;
            self.cfDataSource = getValueByJsonPath(self,'attributes;viewConfig;cfDataSource',null,false);
            if(widgetConfig != null) {
                this.renderView4Config(this.$el,this.model,widgetConfig);
            }
           this.renderView4Config(this.$el,
                       this.model,getVRouterScatterChartViewConfig(self,viewConfig));
       }
   });

   function getVRouterScatterChartViewConfig(self,viewConfig) {
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
                           loadChartInChunks: false,
                           cfDataSource : self.cfDataSource,
                           chartOptions: {
                               sortFn:function(data){
                                   return data.reverse();
                               },
                               doBucketize: true,
                               xLabel: ctwl.TITLE_CPU,
                               yLabel: 'Memory (MB)',
                               xField: getValueByJsonPath(viewConfig,'xField','x'),
                               yField: getValueByJsonPath(viewConfig,'xField','y'),
                               sizeField: getValueByJsonPath(viewConfig,'xField','size'),
                               forceX: [0, 1],
                               forceY: [0, 20],
                               margin: {top:5},
                               // yLabelFormat: d3.format(".02f"),
                               // xLabelFormat: d3.format(".02f"),
                               // dataParser: function(response) {
                               //     var chartDataValues = [];
                               //     for (var i = 0; i < response.length; i++) {
                               //         var vRouterNode = response[i];
                               //
                               //         chartDataValues.push({
                               //             name: vRouterNode['name'],
                               //             y: ifNotNumeric(vRouterNode['y'],0),
                               //             x: ifNotNumeric(vRouterNode['x'],0),
                               //             color: vRouterNode['color'],
                               //             size: contrail.handleIfNull(
                               //                  vRouterNode['size'],0),
                               //             rawData: vRouterNode
                               //         });
                               //     }
                               //     return chartDataValues;
                               // },
                               // tooltipConfigCB: getVRouterTooltipConfig,
                               bubbleSizeFn: function(d) {
                                    return d3.max(d,function(d) { return d.size;});
                               },
                               bubbleCfg : {
                                    defaultMaxValue : monitorInfraConstants.VROUTER_DEFAULT_MAX_THROUGHPUT
                               },
                               tooltipConfigCB: monitorInfraUtils.vRouterTooltipFn,
                               controlPanelConfig: {
                                   // legend: {
                                   //     enable: true,
                                   //     viewConfig: monitorInfraUtils.getScatterChartLegendConfigForNodes()
                                   // },
                                    filter: {
                                        enable: false,
                                        viewConfig: monitorInfraUtils.getScatterChartFilterConfigForNodes()
                                    },
                               },
                               bucketTooltipFn: monitorInfraUtils.vRouterBucketTooltipFn,
                               showColorFilter:true,
                               clickCB: monitorInfraUtils.onvRouterDrillDown
                           }
                       }
                   }]
               }]
           }
       };
   }
   return VRouterScatterChartView;
});
