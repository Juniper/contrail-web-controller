/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view'],
        function(
                _, ContrailView) {
            var AnalyticsNodeListView = ContrailView.extend({
                render : function() {
                    this.renderView4Config(this.$el, null,
                            getAnalyticsNodeListViewConfig());
                }
            });
            function getAnalyticsNodeListViewConfig() {
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
                                                                widthMultiplier : 24,
                                                                heightMultiplier : 8
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
                                                                 widthMultiplier: 24,
                                                                 heightMultiplier: 8
                                                             },
                                                             widgetCfgList: [
                                                                {id:'analyticsnode-top-messagetype'},
                                                                {id:'analyticsnode-top-generators'},
                                                                {id:'analyticsnode-collector-cpu-share'},
                                                                {id:'analyticsnode-stats-available-connections'},
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
                                                                widthMultiplier: 24,
                                                                heightMultiplier: 8
                                                            },
                                                            widgetCfgList: [
	                                                            {id:'analyticsnode-qe-cpu-share'},
	                                                            {id:'analyticsnode-alarm-gen-cpu-share'},
	                                                            {id:'analyticsnode-snmp-collector-cpu-share'},
	                                                            {id:'analyticsnode-api-cpu-share'},
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
                                                                 widthMultiplier: 24,
                                                                 heightMultiplier: 8
                                                             },
                                                             widgetCfgList: [
                                                                {id:'analyticsnode-contrail-topology-cpu-share'},
                                                                {id:'analyticsnode-disk-usage-info'},
                                                                {id:'analyticsnode-system-cpu-share'},
                                                                {id:'analyticsnode-system-memory-usage'},
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
