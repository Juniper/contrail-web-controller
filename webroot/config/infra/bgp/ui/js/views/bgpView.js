/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var bgpView = ContrailView.extend({
        el: $(contentContainer),
        renderBGP: function () {
            this.renderView4Config(this.$el, null, getBGPListViewConfig());
        }
    });

    function getBGPListViewConfig() {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_BGP_LIST_ID]),
            view: "bgpListView",
            viewPathPrefix: "config/infra/bgp/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        }
    };
    return bgpView;
});
