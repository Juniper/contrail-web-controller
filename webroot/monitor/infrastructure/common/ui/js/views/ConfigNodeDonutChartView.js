/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view'],function(_, ContrailView){
    var ConfigNodeDonutChartView = ContrailView.extend({
        render : function (){
            var self = this,
                viewConfig = self.attributes.viewConfig;
                chartModel = self.model;
            this.renderView4Config(this.$el, chartModel,
                    getConfigNodeDonutChartViewConfig(ifNull(viewConfig.color, {})), null, null, null, function () {
            });
        }
    });

    function getConfigNodeDonutChartViewConfig (color) {
        return {
            elementId: ctwl.CONFIGNODE_SUMMARY_DONUTCHART_SECTION_ID,
            view: 'SectionView',
            viewConfig: {
                rows:[{
                    columns: [{
                        elementId: ctwl.CONFIGNODE_SUMMARY_DONUTCHART_ONE_ID,
                        view: 'DonutChartView',
                        viewConfig: {
                            class: 'col-xs-6',
                            parseFn: function (response) {
                                return monitorInfraParsers
                                    .parseConfigNodeRequestForDonutChart(
                                         response, ['GET'], color);
                            },
                            chartOptions: {
                                height: 170,
                                margin: {
                                    top: 10,
                                    bottom: 10
                                },
                                showLabels: false,
                                showLegend: false,
                                title: 'Reads',
                                defaultDataStatusMessage: false,
                                showEmptyDonut: true
                            },
                        }
                    }, {
                        elementId: ctwl.CONFIGNODE_SUMMARY_DONUTCHART_TWO_ID,
                        view: 'DonutChartView',
                        viewConfig: {
                            class: 'col-xs-6',
                            parseFn: function (response) {
                                return monitorInfraParsers
                                    .parseConfigNodeRequestForDonutChart(
                                         response, ['POST', 'PUT', 'DELETE'], color);
                            },
                            chartOptions: {
                                height: 170,
                                margin: {
                                    bottom: 10,
                                    top: 10
                                },
                                showLabels: false,
                                title: 'Writes',
                                defaultDataStatusMessage: false,
                                showEmptyDonut: true,
                                showLegend: false,
                            },
                        }
                    }]
                }]
            }
        }
    }
    return ConfigNodeDonutChartView;
});
