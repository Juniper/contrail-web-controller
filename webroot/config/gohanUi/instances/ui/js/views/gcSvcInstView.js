/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var SvcInstView = ContrailView.extend({
        el: $('#gohanGrid'),
        renderSvcInst: function (viewConfig) {
           this.renderView4Config(this.$el, null, getSvcInst(viewConfig));
        }
    });

    function getSvcInst(viewConfig) {
        return {
                elementId: cowu.formatElementId([ctwl.CONFIG_SERVICE_INSTANCES_PAGE_ID]),
                view: "gcSvcInstListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/gohanUi/instances/ui/js/views/",
                viewConfig: viewConfig
            }
    };
    return SvcInstView;
});

