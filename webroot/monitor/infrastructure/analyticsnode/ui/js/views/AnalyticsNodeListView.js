/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view', 'node-color-mapping'],
        function(
                _, ContrailView, NodeColorMapping) {
            var AnalyticsNodeListView = ContrailView.extend({
                render : function() {
                    nodeColorMapping = new NodeColorMapping(),
                    colorFn = nodeColorMapping.getNodeColorMap;
                    this.renderView4Config(this.$el, null,
                            getAnalyticsNodeListViewConfig(colorFn));
                }
            });
            function getAnalyticsNodeListViewConfig(colorFn) {
                var viewConfig = {
                        rows : [
                                {
                                    columns : [
                                               {
                                        elementId: 'analytics-node-carousel-view',
                                        view: "CarouselView",
                                        viewConfig: {
                                            pages : [
                                                 {
                                                     page: {
                                                         elementId : 'analytics-node-grid-stackview-0',
                                                         view : "GridStackView",
                                                         viewConfig : {
                                                            elementId : 'analytics-node-grid-stackview-0',
                                                            gridAttr : {
                                                                defaultWidth : 6,
                                                                defaultHeight : 8
                                                            },
                                                            widgetCfgList: [
                                                                {id:'analyticsnode-percentile-count-size'},
                                                                {id:'analyticsnode-database-read-write'},
                                                                {id:'analyticsnode-query-stats'},
                                                                {id:'analyticsnode-generators-scatterchart'},
                                                                {id:'analyticsnode-sandesh-message-info'},
                                                                {id:'analyticsnode-grid-view'}
                                                            ]
                                                         }
                                                     },
                                                 },{
                                                     page: {
                                                         elementId: 'analytics-node-grid-stackview-1',
                                                         view: 'GridStackView',
                                                         viewConfig: {
                                                             elementId: 'analytics-node-grid-stackview-1',
                                                             gridAttr: {
                                                                 defaultWidth: 6,
                                                                 defaultHeight: 8
                                                             },
                                                             widgetCfgList: [
                                                                {id:'analyticsnode-top-messagetype'},
                                                                {id:'analyticsnode-top-generators'},
                                                                {id:'analyticsnode-collector-cpu-share'},
                                                                {id:'analyticsnode-alarm-gen-cpu-share'},
                                                                {id:'analyticsnode-grid-view'}
                                                             ]
                                                         }
                                                     }
                                                 },{
                                                     page: {
                                                         elementId: 'analytics-node-grid-stackview-2',
                                                         view: 'GridStackView',
                                                         viewConfig: {
                                                            elementId: 'analytics-node-grid-stackview-2',
                                                            gridAttr: {
                                                                defaultWidth: 6,
                                                                defaultHeight: 8
                                                            },
                                                            widgetCfgList: [
                                                            {id:'analyticsnode-qe-cpu-share'},
                                                            {id:'analyticsnode-snmp-collector-cpu-share'},
                                                            {id:'analyticsnode-api-cpu-share'},
                                                            {id:'analyticsnode-stats-available-connections'},
                                                            {id:'analyticsnode-grid-view'}
                                                            ]
                                                         }
                                                     }
                                                 },{
                                                     page: {
                                                         elementId: 'analytics-node-grid-stackview-3',
                                                         view: 'GridStackView',
                                                         viewConfig: {
                                                             elementId: 'analytics-node-grid-stackview-3',
                                                             gridAttr: {
                                                                 defaultWidth: 6,
                                                                 defaultHeight: 8
                                                             },
                                                             widgetCfgList: [
                                                                {id:'disk-usage-info'},
                                                                {id:'system-cpu-share'},
                                                                {id:'system-memory-usage'},
                                                                {id:'analyticsnode-grid-view'}
                                                             ]
                                                         }
                                                     }
                                                 }
                                            ]
                                        }
                                    }]
                                }]
                       };
                return {
                    elementId : cowu.formatElementId([
                         ctwl.ANALYTICSNODE_SUMMARY_LIST_SECTION_ID ]),
                    view : "SectionView",
                    viewConfig : viewConfig
                };
            }
            return AnalyticsNodeListView;
        });
