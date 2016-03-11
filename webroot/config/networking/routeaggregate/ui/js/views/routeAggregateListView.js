/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var configObj = {};
    var self;
    var routeAggregateListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            self = this;
            var viewConfig = this.attributes.viewConfig;
            currentProject = viewConfig["projectSelectedValueData"];
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.URL_GET_CONFIG_DETAILS,
                        type: "POST",
                        data: JSON.stringify({data: [{type: "route-aggregates",
                                parent_id: currentProject.value}]})
                    },
                    dataParser: self.parseRouteAggregateData,
                }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, getRouteAggregateGridViewConfig());
        },

        parseRouteAggregateData : function(result){
            var gridDS = [];
            var routeAggregates = getValueByJsonPath(result,
                "0;route-aggregates", []);
            _.each(routeAggregates, function(routeAggregate){
                gridDS.push(routeAggregate["route-aggregate"]);
            });
            return gridDS;
        }
    });

    var getRouteAggregateGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwc.CONFIG_ROUTE_AGGREGATE_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.CONFIG_ROUTE_AGGREGATE_ID,
                                view: "routeAggregateGridView",
                                viewPathPrefix: "config/networking/routeaggregate/ui/js/views/",
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

    return routeAggregateListView;
});

