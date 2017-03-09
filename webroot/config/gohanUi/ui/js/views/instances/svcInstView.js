/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var SvcInstView = ContrailView.extend({
        el: $('#main-content'),
        renderSvcInst: function (viewConfig) {
           this.renderView4Config(this.$el, null, getSvcInst(viewConfig));
        }
    });

    function getSvcInst(viewConfig) {
        return {
                elementId: cowu.formatElementId([ctwl.CONFIG_SERVICE_INSTANCES_PAGE_ID]),
                view: "svcInstListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/gohanUi/ui/js/views/instances/",
                viewConfig: viewConfig
            }
    };
    return SvcInstView;
});

