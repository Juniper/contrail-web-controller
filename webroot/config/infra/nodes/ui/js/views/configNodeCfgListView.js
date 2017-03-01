/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var configNodeListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this;
            var viewConfig = this.attributes.viewConfig;
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.URL_GET_CONFIG_DETAILS,
                        type: "POST",
                        data: JSON.stringify({data: [{type: "config-nodes"}]})
                    },
                    dataParser: self.parseConfigNodeData,
                }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, getConfigNodeGridViewConfig());
        },

        parseConfigNodeData : function(result){
            var gridDS = [];
            var configNodes = getValueByJsonPath(result,
                "0;config-nodes", []);
            _.each(configNodes, function(configNode){
                gridDS.push(configNode["config-node"]);
            });
            return gridDS;
        }
    });

    var getConfigNodeGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwc.CFG_CONFIG_NODE_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.CFG_CONFIG_NODE_ID,
                                view: "configNodeCfgGridView",
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

    return configNodeListView;
});

