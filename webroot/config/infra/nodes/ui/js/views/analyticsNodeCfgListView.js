/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var analyticsNodeListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this;
            var viewConfig = this.attributes.viewConfig;
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.URL_GET_CONFIG_DETAILS,
                        type: "POST",
                        data: JSON.stringify({data: [{type: "analytics-nodes"}]})
                    },
                    dataParser: self.parseAnalyticsNodeData,
                }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, getAnalyticsNodeGridViewConfig());
        },

        parseAnalyticsNodeData : function(result){
            var gridDS = [];
            var analyticsNodes = getValueByJsonPath(result,
                "0;analytics-nodes", []);
            _.each(analyticsNodes, function(analyticsNode){
                gridDS.push(analyticsNode["analytics-node"]);
            });
            return gridDS;
        }
    });

    var getAnalyticsNodeGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwc.CONFIG_ANALYTICS_NODE_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.CONFIG_ANALYTICS_NODE_ID,
                                view: "analyticsNodeCfgGridView",
                                viewPathPrefix: "config/infra/nodes/ui/js/views/",
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

    return analyticsNodeListView;
});

