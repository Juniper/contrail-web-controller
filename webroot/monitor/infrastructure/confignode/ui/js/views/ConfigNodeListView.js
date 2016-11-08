/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view','node-color-mapping', 'confignode-viewconfig'],
        function(
                _, ContrailView,NodeColorMapping, ConfigNodeViewConfig) {
            var configNodeViewConfig = new ConfigNodeViewConfig();
            var ConfigNodeListView = ContrailView.extend({
                render : function() {
                    var nodeColorMapping = new NodeColorMapping(),
                        colorFn = nodeColorMapping.getNodeColorMap;

                    this.renderView4Config(this.$el, null,
                            getConfigNodeListViewConfig(colorFn));
                }
            });
            function getConfigNodeListViewConfig(colorFn) {
                var viewConfig = {
                    rows : [
                         {
                             columns : [
                                        {
                                 elementId: 'config-node-carousel-view',
                                 view: "CarouselView",
                                 viewConfig: {
                                     pages : [
                                          {
                                              page: {
                                                  elementId : 'config-node-grid-stackview-0',
                                                  view : "GridStackView",
                                                  viewConfig : {
                                                      gridAttr: {
                                                          defaultWidth: 6,
                                                          defaultHeight: 10
                                                      },
                                                      widgetCfgList: [
                                                            configNodeViewConfig.getViewConfig('confignode-requests-served')(),
                                                            configNodeViewConfig.getViewConfig('confignode-response-time-size')(),
                                                            configNodeViewConfig.getViewConfig('confignode-percentile-time-size')(),
                                                            configNodeViewConfig.getViewConfig('confignode-reads-writes-donut-chart')(),
                                                            configNodeViewConfig.getViewConfig('confignode-grid-view')()
                                                      ]
                                                  }
                                              },
                                          },{
                                              page: {
                                                  elementId : 'config-node-grid-stackview-1',
                                                  view: 'GridStackView',
                                                  viewConfig: {
                                                      gridAttr: {
                                                          defaultWidth: 6,
                                                          defaultHeight: 8
                                                      },
                                                      widgetCfgList: [
                                                            configNodeViewConfig.getViewConfig('confignode-top-useragent')(),
                                                            configNodeViewConfig.getViewConfig('confignode-top-objecttypes')(),
                                                            configNodeViewConfig.getViewConfig('confignode-top-remote-ip')(),
                                                            configNodeViewConfig.getViewConfig('confignode-top-projects')(),
                                                            configNodeViewConfig.getViewConfig('confignode-grid-view')()
                                                      ]
                                                  }
                                              }
                                          },{
                                              page: {
                                                  elementId : 'config-node-grid-stackview-2',
                                                  view: 'GridStackView',
                                                  viewConfig: {
                                                      gridAttr: {
                                                          defaultWidth: 6,
                                                          defaultHeight: 8
                                                      },
                                                      widgetCfgList: [
                                                            configNodeViewConfig.getViewConfig('confignode-process-cpu-node-mngr')(),
                                                            configNodeViewConfig.getViewConfig('confignode-process-contrail-schema')(),
                                                            configNodeViewConfig.getViewConfig('confignode-process-contrail-discovery')(),
                                                            configNodeViewConfig.getViewConfig('confignode-process-contrail-api')(),
                                                            configNodeViewConfig.getViewConfig('confignode-grid-view')()
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
                    elementId : cowu.formatElementId(
                        [ctwl.CONFIGNODE_SUMMARY_LIST_SECTION_ID ]),
                    view : "SectionView",
                    viewConfig : viewConfig
                };
            }
            return ConfigNodeListView;
        });
