/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var LinkLocalServicesView = ContrailView.extend({
        el: $(contentContainer),
        renderLinkLocalServices: function () {
            this.renderView4Config(this.$el, null, getLinkLocalServices());
        }
    });

    function getLinkLocalServices() {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_LINK_LOCAL_SERVICES_PAGE_ID]),
            view: "LinkLocalServicesListView",
            viewPathPrefix: "config/infra/linklocalservices/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        }
    };
    return LinkLocalServicesView;
});
