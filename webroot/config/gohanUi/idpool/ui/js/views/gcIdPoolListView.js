/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var idPoolListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            var tenantId = contrail.getCookie('gohanProject');
            var listModelConfig = {
                    remote: {
                        ajaxConfig: {
                            url: ctwc.GOHAN_ID_POOL + ctwc.GOHAN_PARAM,
                            type: "GET"
                        },
                        dataParser: ctwp.gohanIdPoolParser
                    }
             };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el, contrailListModel, getIdPoolListViewConfig());
        }
    });
    var getIdPoolListViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_ID_POOL_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_ID_POOL_LIST_ID,
                                title: ctwl.CFG_ID_POOL_TITLE,
                                view: "gcIdPoolGridView",
                                viewPathPrefix:
                                    "config/gohanUi/idpool/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {}
                            }
                        ]
                    }
                ]
            }
        }
    };

    return idPoolListView;
});
