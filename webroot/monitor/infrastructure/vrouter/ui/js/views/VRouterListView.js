/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(
    ['underscore', 'contrail-view'
    ],
    function(
        _, ContrailView) {

        var VRouterListView = ContrailView.extend({
            render: function() {
                var self = this;

                this.renderView4Config(this.$el,
                    null,
                    getVRouterListViewConfig(self));
                function getVRouterListViewConfig(self) {
                    return {
                        elementId: "vrouter_list_section",
                        view: "SectionView",
                        viewConfig:{
                            rows:[
                                monitorInfraUtils.getToolbarViewConfig(),
                                {
                                    columns:[
                                        getVRouterListCarouselViewConfig(self)
                                    ]
                                }
                            ]
                        }
                    };
                }
                function getVRouterListCarouselViewConfig(self) {
                    return {
                         elementId: cowu.formatElementId([
                             ctwl.VROUTER_SUMMARY_LIST_SECTION_ID
                         ]),
                         view: "CarouselView",
                         viewConfig: {
                             pages : [
                                  {
                                      page: {
                                          view: 'GridStackView',
                                          elementId: 'grid-stack-view-page-1',
                                          viewConfig: {
                                              elementId: 'grid-stack-view-page-1',
                                              gridAttr: {
                                                  defaultWidth: 12,
                                                  defaultHeight: 10
                                              },
                                              widgetCfgList: [
                                                  {id:'vrouter-flow-rate-area-chart'},
                                                  {id:'vrouter-cpu-mem-scatter-chart'},
                                                  {id:'vrouter-bandwidth-percentile-chart'},
                                                  {id:'vrouter-system-cpu-percentiles-chart'},
                                                  {id:'vrouter-system-memory-percentiles-chart'},
                                                  {id:'vrouter-summary-grid'},
                                                  {id:'vrouter-crossfilters-chart'}
                                              ]
                                          }
                                      },
                                  },
                                  {

                                      page : {
                                          view: 'GridStackView',
                                          elementId: 'grid-stack-view-page-2',
                                          viewConfig: {
                                              elementId: 'grid-stack-view-page-2',
                                              gridAttr: {
                                                  defaultWidth: 12,
                                                  defaultHeight: 10
                                              },
                                              widgetCfgList: [
                                                  {id:'vrouter-system-cpu-mem-chart'},
                                                  {id:'vrouter-vn-int-inst-chart'},
                                                  {id:'vrouter-agent-cpu-percentiles-chart'},
                                                  {id:'vrouter-agent-mem-usage-percentiles-chart'},
                                                  {id:'vrouter-active-flows-percentiles-chart'},
                                                  {id:'vrouter-summary-grid'}
                                              ]
                                          }
                                      }
                                  },
                             ]
                         }
                    };
                };
            }
        });
        return VRouterListView;
    });