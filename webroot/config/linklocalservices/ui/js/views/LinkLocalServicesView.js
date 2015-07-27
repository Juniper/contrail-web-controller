/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var LinkLocalServicesView = Backbone.View.extend({
        el: $(contentContainer),
        renderLinkLocalServices: function () {
            cowu.renderView4Config(this.$el, null, getLinkLocalServices());
        }
    });

    function getLinkLocalServices() {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_LINK_LOCAL_SERVICES_PAGE_ID]),
            view: "LinkLocalServicesListView",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        }
    };
    return LinkLocalServicesView;
});
