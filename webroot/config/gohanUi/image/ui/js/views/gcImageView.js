/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var imageView = ContrailView.extend({
        el: $('#gohanGrid'),
        renderImage: function (viewConfig) {
            this.renderView4Config(this.$el, null, getImageViewConfig(viewConfig));
        }
    });

    function getImageViewConfig(viewConfig) {
        return {
                elementId: cowu.formatElementId([ctwl.CFG_IMAGE_PAGE_ID]),
                view: "gcImageListView",
                viewPathPrefix:
                    "config/gohanUi/image/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: viewConfig
            }
    };
    return imageView;
});
