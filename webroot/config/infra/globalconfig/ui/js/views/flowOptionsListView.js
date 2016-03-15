/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var flowOptionsListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: "/api/tenants/config/get-config-details",
                        type: "POST",
                        data: JSON.stringify(
                            {data: [{type: 'global-vrouter-configs'}]})
                    },
                    dataParser: self.parseFlowOptionsData,
                }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, getFlowOptionsGridViewConfig());
        },
        parseFlowOptionsData : function(result){
            var gridDS = [],
                globalvRouterConfig = getValueByJsonPath(result,
                    "0;global-vrouter-configs;0;global-vrouter-config", {});
            _.each(ctwc.GLOBAL_FLOW_OPTIONS_MAP, function(flowOption){
                    gridDS.push({name: flowOption.name, key: flowOption.key,
                    value: globalvRouterConfig[flowOption.key]});
            });
            return gridDS;
        }
    });

    var getFlowOptionsGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwc.GLOBAL_FLOW_OPTIONS_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.GLOBAL_FLOW_OPTIONS_ID,
                                view: "flowOptionsGridView",
                                viewPathPrefix: "config/infra/globalconfig/ui/js/views/",
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

    return flowOptionsListView;
});

