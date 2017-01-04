/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view'],
        function(_, ContrailView) {
            var ConfigNodeListView = ContrailView.extend({
                render : function() {
                    this.renderView4Config(this.$el, null,
                            getConfigNodeListViewConfig());
                }
            });
            function getConfigNodeListViewConfig() {
                var viewConfig = {
                    rows: [{
                        columns: [{
                            elementId: 'config-node-carousel-view',
                            view: "CarouselView",
                            viewConfig: {
                                pages: [{
                                    page: {
                                        elementId: 'config-node-grid-stackview-0',
                                        view: "GridStackView",
                                        viewConfig: {
                                            elementId: 'config-node-grid-stackview-0',
                                            gridAttr: {
                                                widthMultiplier: cowc.GRID_STACK_DEFAULT_WIDTH,
                                                heightMultiplier: 10
                                            },
                                            widgetCfgList: [{
                                                id: 'confignode-requests-served'
                                            }, {
                                                id: 'confignode-response-time-size'
                                            }, {
                                                id: 'confignode-percentile-time-size'
                                            }, {
                                                id: 'confignode-reads-writes-donut-chart',
                                                itemAttr: {
                                                    cssClass: 'confignode-donut-chart'
                                                }
                                            }, {
                                                id: 'confignode-grid-view'
                                            }]
                                        }
                                    },
                                },{
                                    page: {
                                        elementId: 'config-node-grid-stackview-1',
                                        view: 'GridStackView',
                                        viewConfig: {
                                            elementId: 'config-node-grid-stackview-1',
                                            gridAttr: {
                                                widthMultiplier: cowc.GRID_STACK_DEFAULT_WIDTH,
                                                heightMultiplier: 8
                                            },
                                            widgetCfgList: [{
                                                id: 'confignode-top-useragent'
                                            }, {
                                                id: 'confignode-top-objecttypes'
                                            }, {
                                                id: 'confignode-top-remote-ip'
                                            }, {
                                                id: 'confignode-top-projects'
                                            }, {
                                                id: 'confignode-grid-view'
                                            }]
                                        }
                                    }
                                },{
                                    page: {
                                        elementId: 'config-node-grid-stackview-2',
                                        view: 'GridStackView',
                                        viewConfig: {
                                            elementId: 'config-node-grid-stackview-2',
                                            gridAttr: {
                                                widthMultiplier: cowc.GRID_STACK_DEFAULT_WIDTH,
                                                heightMultiplier: 8
                                            },
                                            widgetCfgList: [{
                                                id: 'confignode-process-contrail-api'
                                            }, {
                                                id: 'confignode-process-contrail-schema'
                                            }, {
                                                id: 'confignode-process-contrail-service-monitor'
                                            }, {
                                                id: 'confignode-process-contrail-device-manager'
                                            }, {
                                                id: 'confignode-grid-view'
                                            }]
                                        }
                                    }
                                },{
                                    page: {
                                        elementId: 'config-node-grid-stackview-3',
                                        view: 'GridStackView',
                                        viewConfig: {
                                            elementId: 'config-node-grid-stackview-3',
                                            gridAttr: {
                                                widthMultiplier: cowc.GRID_STACK_DEFAULT_WIDTH,
                                                heightMultiplier: 8
                                            },
                                            widgetCfgList: [{
                                                id: 'confignode-process-ifmap'
                                            }, {
                                                id: 'confignode-process-contrail-discovery'
                                            }, {
                                                id: 'confignode-system-cpu-share'
                                            }, {
                                                id: 'confignode-system-memory-usage',
                                            }, {
                                                id: 'confignode-grid-view'
                                            }]
                                        }
                                    }
                                },{
                                    page: {
                                        elementId: 'config-node-grid-stackview-4',
                                        view: 'GridStackView',
                                        viewConfig: {
                                            elementId: 'config-node-grid-stackview-4',
                                            gridAttr: {
                                                widthMultiplier: cowc.GRID_STACK_DEFAULT_WIDTH,
                                                heightMultiplier: 8
                                            },
                                            widgetCfgList: [{
                                                id: 'confignode-disk-usage-info'
                                            },{
                                                id: 'confignode-grid-view'
                                            }]
                                        }
                                    }
                                }]
                            }
                        }]
                    }]
                };
                return {
                    elementId : cowu.formatElementId([ctwl.CONFIGNODE_SUMMARY_LIST_SECTION_ID ]),
                    view : "SectionView",
                    viewConfig : viewConfig
                };
            }
            return ConfigNodeListView;
        });