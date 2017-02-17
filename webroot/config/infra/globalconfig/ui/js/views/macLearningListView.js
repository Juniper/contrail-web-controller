/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var macLearningListView = ContrailView.extend({
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
                            {data: [{type: 'global-system-configs'}]})
                    },
                    dataParser: self.parseMACLearningData,
                }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, getMACLearningGridViewConfig());
        },
        parseMACLearningData : function(result){
            var gridDS = [],
                globalSysConfig = getValueByJsonPath(result,
                    "0;global-system-configs;0;global-system-config", {});
            _.each(ctwc.GLOBAL_MAC_LEARNING_MAP, function(macLearning){
                gridDS.push({name: macLearning.name, key: macLearning.key,
                    value: getValueByJsonPath(globalSysConfig, macLearning.key, "-", false)});
            });
            return gridDS;
        }
    });

    var getMACLearningGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwc.GLOBAL_MAC_LEARNING_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.GLOBAL_MAC_LEARNING_ID,
                                view: "macLearningGridView",
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

    return macLearningListView;
});

