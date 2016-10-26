/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view', 'monitor-infra-controlnode-model', 'node-color-mapping',
          'monitor-infra-controlnode-sent-update-model',
          'monitor-infra-controlnode-received-update-model',
          'monitor-infra-controlnode-cpu-mem-chart-model',
          'legend-view'],
        function(
                _, ContrailView, ControlNodeListModel, NodeColorMapping,ControlNodeSentUpdateChartModel,
                ControlNodeReceivedUpdateChartModel,
                ControlNodeCPUMemChartModel, LegendView) {
            var ControlNodeListView = ContrailView.extend({
                render : function() {
                    var controlNodeListModel = new ControlNodeListModel(),
                        nodeColorMapping = new NodeColorMapping(),
                        colorFn = nodeColorMapping.getNodeColorMap;
                    this.renderView4Config(this.$el, controlNodeListModel,
                            getControlNodeListViewConfig(colorFn));
                }
            });

            function getControlNodeListViewConfig(colorFn) {
                var sentUpdateModel = new ControlNodeSentUpdateChartModel(),
                        receivedUpdateModel = new ControlNodeReceivedUpdateChartModel(),
                        cpuMemChartModel = new ControlNodeCPUMemChartModel();
                var viewConfig = {
                    rows : [{
                        columns : [{
                            elementId: 'control-node-carousel-view',
                            view: "CarouselView",
                            viewConfig: {
                            pages : [
                                     {
                                         page: {
                                             elementId : 'control-node-grid-stackview-0',
                                             view : "GridStackView",
                                             viewConfig: {
                                                     gridAttr : {
                                                         defaultWidth : 6,
                                                         defaultHeight : 8
                                                     },
                                                     widgetCfgList: [
                                                         {
                                                             modelCfg: sentUpdateModel,
                                                             viewCfg: getSentUpdatesChartViewConfig(colorFn),
                                                             itemAttr: {
                                                                 title: ctwl.CONTROL_NODE_SENT_UPDATES
                                                             }
                                                         },
                                                         {
                                                             modelCfg: receivedUpdateModel,
                                                             viewCfg: getReceivedUpdatesChartViewConfig(colorFn),
                                                             itemAttr: {
                                                                 title: ctwl.CONTROL_NODE_RECEIVED_UPDATES
                                                             }
                                                         },
                                                         {
                                                             modelCfg: cpuMemChartModel,
                                                             viewCfg: getCPUShareChartViewConfig(colorFn),
                                                             itemAttr: {
                                                                 title: ctwl.CONTROL_NODE_CPU_SHARE
                                                             }
                                                         },
                                                         {
                                                             modelCfg: cpuMemChartModel,
                                                             viewCfg: getMemShareChartViewConfig(colorFn),
                                                             itemAttr: {
                                                                 title: ctwl.CONTROL_NODE_MEMORY
                                                             }
                                                         },
                                                         {
                                                             modelCfg: new ControlNodeListModel(),
                                                             viewCfg: {
                                                                 elementId : ctwl.CONTROLNODE_SUMMARY_GRID_ID,
                                                                 title : ctwl.CONTROLNODE_SUMMARY_TITLE,
                                                                 view : "ControlNodeSummaryGridView",
                                                                 viewPathPrefix: ctwl.CONTROLNODE_VIEWPATH_PREFIX,
                                                                 app : cowc.APP_CONTRAIL_CONTROLLER,
                                                                 viewConfig : {
                                                                     colorFn: colorFn
                                                                 }},
                                                             itemAttr: {
                                                                 width: 2
                                                             }
                                                         }
                                                     ]
                                             }
                                         },
                                     }
                               ]
                            }
                        }]
                    }]
                };
                return {
                    elementId : cowu.formatElementId([
                         ctwl.CONTROLNODE_SUMMARY_LIST_SECTION_ID ]),
                    view : "SectionView",
                    viewConfig :viewConfig
                };
            }
            function getSentUpdatesChartViewConfig(colorFn) {
                return {
                    elementId : ctwl.CONTROLNODE_SENT_UPDATES_SCATTER_CHART_SEC_ID,
                    view : "SectionView",
                    viewConfig : {
                        rows : [ {
                            columns : [ {
                                elementId : ctwl.CONTROLNODE_SENT_UPDATES_SCATTER_CHART_ID,
                                view : "StackedBarChartWithFocusView",
                                viewConfig : {
                                    class: 'mon-infra-chart chartMargin',
                                    chartOptions:{
                                        height: 230,
                                        title: ctwl.CONTROLNODE_SUMMARY_TITLE,
                                        xAxisLabel: '',
                                        yAxisLabel: 'Sent Updates',
                                        groupBy: 'Source',
                                        yField: 'SUM(tx_update_stats.reach)',
                                        yAxisOffset: 25,
                                        tickPadding: 8,
                                        margin: {
                                            left: 55,
                                            top: 20,
                                            right: 0,
                                            bottom: 40
                                        },
                                        bucketSize: monitorInfraConstants.STATS_BUCKET_DURATION,
                                        colors: colorFn,
                                        failureLabel:'Unreach',
                                        showControls: false,
                                        showLegend: true,
                                        failureCheckFn: function (d) {
                                            return ifNull(d['SUM(tx_update_stats.unreach)'],0);
                                        },
                                        defaultZeroLineDisplay: true
                                    }
                                }
                            }]
                        }]
                    }
                }

            }

            function getReceivedUpdatesChartViewConfig(colorFn) {
                return {
                    elementId : ctwl.CONTROLNODE_RECEIVED_UPDATES_SCATTER_CHART_SEC_ID,
                    view : "SectionView",
                    viewConfig : {
                        rows : [ {

                            columns : [ {
                                elementId : ctwl.CONTROLNODE_RECEIVED_UPDATES_SCATTER_CHART_ID,
                                view : "StackedBarChartWithFocusView",
                                viewConfig : {
                                    class: 'mon-infra-chart chartMargin',
                                    chartOptions:{
                                        height: 230,
                                        xAxisLabel: '',
                                        yAxisLabel: 'Received Updates',
                                        title: ctwl.CONTROLNODE_SUMMARY_TITLE,
                                        groupBy: 'Source',
                                        yField: 'SUM(rx_update_stats.reach)',
                                        yAxisOffset: 25,
                                        tickPadding: 4,
                                        margin: {
                                            left: 55,
                                            top: 20,
                                            right: 0,
                                            bottom: 40
                                        },
                                        bucketSize: monitorInfraConstants.STATS_BUCKET_DURATION,
                                        colors: colorFn,
                                        failureLabel:'Unreach',
                                        showControls: false,
                                        showLegend: true,
                                        failureCheckFn: function (d) {
                                            return ifNull(d['SUM(rx_update_stats.unreach)'],0);
                                        },
                                        defaultZeroLineDisplay: true
                                    }
                                }
                            }]
                        }]
                    }
                }

            }

            function getCPUShareChartViewConfig(colorFn){
                return {
                    elementId : ctwl.CONTROLNODE_CPU_SHARE_LINE_CHART_SEC_ID,
                    view : "SectionView",
                    viewConfig : {
                        rows : [{
                            columns : [{
                                elementId : ctwl.CONTROLNODE_CPU_SHARE_LINE_CHART_ID,
                                view : "LineWithFocusChartView",
                                viewConfig: {
                                    class: 'mon-infra-chart chartMargin',
                                    chartOptions : {
                                        brush: false,
                                        height: 240,
                                        xAxisLabel: '',
                                        yAxisLabel: 'CPU Share (%)',
                                        groupBy: 'name',
                                        yField: 'MAX(cpu_info.cpu_share)',
                                        yFieldOperation: 'average',
                                        bucketSize: monitorInfraConstants.STATS_BUCKET_DURATION,
                                        colors: colorFn,
                                        title: ctwl.CONTROLNODE_SUMMARY_TITLE,
                                        axisLabelDistance : 0,
                                        margin: {
                                            left: 60,
                                            top: 20,
                                            right: 15,
                                            bottom: 50
                                        },
                                        tickPadding: 8,
                                        hideFocusChart: true,
                                        forceY: false,
                                        yFormatter : function(d){
                                            return d;
                                        },
                                        xFormatter: xCPUChartFormatter,
                                        showLegend: true,
                                        defaultZeroLineDisplay: true,
                                        legendView: LegendView
                                    },
                                }
                            }]
                        }]
                    }
                };
            }

            function getMemShareChartViewConfig(colorFn){
                return {
                    elementId : ctwl.CONTROLNODE_MEM_SHARE_LINE_CHART_SEC_ID,
                    view : "SectionView",
                    viewConfig : {
                        rows : [{
                            columns : [{
                                elementId : ctwl.CONTROLNODE_MEM_SHARE_LINE_CHART_ID,
                                view : "LineWithFocusChartView",
                                viewConfig: {
                                    class: 'mon-infra-chart chartMargin',
                                    chartOptions : {
                                        brush: false,
                                        height: 240,
                                        xAxisLabel: '',
                                        yAxisLabel: 'Memory',
                                        groupBy: 'name',
                                        yField: 'MAX(cpu_info.mem_res)',
                                        yFieldOperation: 'average',
                                        bucketSize: monitorInfraConstants.STATS_BUCKET_DURATION,
                                        colors: colorFn,
                                        title: ctwl.CONTROLNODE_SUMMARY_TITLE,
                                        axisLabelDistance : 0,
                                        margin: {
                                            left: 60,
                                            top: 20,
                                            right: 15,
                                            bottom: 50
                                        },
                                        tickPadding: 8,
                                        hideFocusChart: true,
                                        forceY: false,
                                        yFormatter : function(d){
                                            return formatBytes(d * 1024, true);
                                        },
                                        xFormatter: xCPUChartFormatter,
                                        showLegend: true,
                                        defaultZeroLineDisplay: true,
                                        legendView: LegendView
                                    },
                                }
                            }]
                        }]
                    }
                };
            }
            function xCPUChartFormatter(xValue, tickCnt) {
                var date = xValue > 1 ? new Date(xValue) : new Date();
                if (tickCnt != null) {
                   var mins = date.getMinutes();
                   date.setMinutes(Math.ceil(mins/15) * 15);
                }
                return d3.time.format('%H:%M')(date);
            }

            function cpuChartYTickFormat(value){
                return d3.format('.2f')(value);
            }
        return ControlNodeListView;
    });
