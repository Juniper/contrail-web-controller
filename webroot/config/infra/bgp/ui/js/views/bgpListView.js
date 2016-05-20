/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var configObj = {};
    var gridElId = '#' + ctwl.BGP_GRID_ID;
    var self;
    var bgpListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            self = this, viewConfig = this.attributes.viewConfig;
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_GET_BGP),
                        type: "GET"
                    },
                    dataParser: self.parseBGPData,

                }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, getBGPGridViewConfig());
        },

        parseBGPData : function(result){
            var gridDS = [];
            if(result instanceof Array) {
               /*the below code is required to maintain router type backward
                   compatibility with vendor */
                for(var i = 0; i < result.length;i++) {
                    var bgpParams = getValueByJsonPath(result[i],
                        "bgp-router;bgp_router_parameters", "");
                    if(bgpParams) {
                        var routerType = getValueByJsonPath(bgpParams,
                            "router_type", "");
                        if($.inArray(routerType, ctwc.BGP_AAS_ROUTERS) !== -1) {
                            continue;
                        }
                        if(!routerType) {
                            var vendor = getValueByJsonPath(bgpParams,
                                "vendor", "");
                            if(vendor.trim().toLowerCase() === "" ||
                                vendor.trim().toLowerCase() === "contrail") {
                                routerType = "control-node";
                            } else {
                                routerType = "router";
                            }
                            result[i]["bgp-router"]["bgp_router_parameters"]
                                ["router_type"] = routerType;
                        }
                    }
                    gridDS.push(result[i]['bgp-router']);
                }
            }
            return gridDS;
        }
    });

    var getBGPGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_BGP_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CONFIG_BGP_SECTION_ID,
                                title: ctwl.TITLE_BGP,
                                view: "bgpGridView",
                                viewPathPrefix: "config/infra/bgp/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return bgpListView;
});

