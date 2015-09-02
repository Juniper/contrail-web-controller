/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-list-model',
    'contrail-view'
], function (_, ContrailListModel, ContrailView) {
    var fipCfgListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;

            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_CFG_FIP_DETAILS) + '/' +
                            viewConfig.projectSelectedValueData.value,
                        type: "GET"
                    },
                    dataParser: ctwp.fipCfgDataParser
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el, contrailListModel, getFipCfgListViewConfig());
        }
    });

    var getFipCfgListViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_FIP_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_FIP_LIST_ID,
                                title: ctwl.CFG_FIP_TITLE,
                                view: "fipCfgGridView",
                                viewPathPrefix:
                                    "config/networking/fip/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {}
                            }
                        ]
                    }
                ]
            }
        }
    };

    return fipCfgListView;
});
