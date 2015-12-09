/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var SvcApplianceSetView = ContrailView.extend({
        el: $(contentContainer),
        renderSvcApplianceSet: function (viewConfig) {
            var self = this;
            self.renderView4Config(self.$el, null,
                                   getSvcApplianceSetConfig());
        }
    });

    function getSvcApplianceSetConfig () {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_SVC_APPLIANCE_PAGE_ID]),
            view: "SvcApplianceSetListView",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewPathPrefix: "config/infra/serviceapplianceset/ui/js/views/",
            viewConfig: {}
        }
    };
    return SvcApplianceSetView;
});

