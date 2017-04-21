/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var imageListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            var tenantId = contrail.getCookie('gohanProject');
            var listModelConfig = {
                    remote: {
                        ajaxConfig: {
                            url: ctwc.GOHAN_IMAGES + ctwc.GOHAN_TENANT_PARAM + tenantId,
                            type: "GET"
                        },
                        dataParser: ctwp.gohanImageParser
                    }
             };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el, contrailListModel, getImageListViewConfig());
        }
    });
    var getImageListViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_IMAGE_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_IMAGE_LIST_ID,
                                title: ctwl.CFG_IMAGE_TITLE,
                                view: "gcImageGridView",
                                viewPathPrefix:
                                    "config/gohanUi/image/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {}
                            }
                        ]
                    }
                ]
            }
        }
    };

    return imageListView;
});
