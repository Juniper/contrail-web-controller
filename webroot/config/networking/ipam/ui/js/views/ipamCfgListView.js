/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var ipamCfgListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;

            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_CFG_IPAM_DETAILS) + '/' +
                            viewConfig.projectSelectedValueData.value,
                        type: "GET"
                    },
                    dataParser: ctwp.ipamCfgDataParser
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el, contrailListModel,
                                   getipamCfgListViewConfig(viewConfig));
        }
    });

    var getipamCfgListViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_IPAM_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_IPAM_LIST_ID,
                                title: ctwl.CFG_IPAM_TITLE,
                                view: "ipamCfgGridView",
                                viewPathPrefix:
                                    "config/networking/ipam/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    selectedProjectId:
                                        viewConfig.projectSelectedValueData.value,
                                    selectedProjectFQN:
                                        viewConfig.projectSelectedValueData.fq_name
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return ipamCfgListView;
});
