/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var packetCaptureView = ContrailView.extend({
        el: $(contentContainer),
        renderPacketCapture: function (viewConfig) {
            var self = this;
            self.renderView4Config(self.$el, null,
                                   getPacketCaptureConfig(viewConfig));
        }
    });

    function getPacketCaptureConfig (viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                config: true,
                childView: {
                    init: getPacketCapture(viewConfig),
                }
            },
            customDomainDropdownOptions = {
                childView: {
                    init: ctwvc.getProjectBreadcrumbDropdownViewConfig(hashParams,
                                                                 customProjectDropdownOptions)
                }
            };
        return ctwvc.getDomainBreadcrumbDropdownViewConfig(hashParams,
                                                     customDomainDropdownOptions)
    };

    function getPacketCapture(viewConfig) {
        return function (projectSelectedValueData) {
            return {
                elementId: cowu.formatElementId([ctwc.PACKET_CAPTURE_LIST_ID]),
                view: "packetCaptureListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "monitor/debug/packetcapture/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                                     {projectSelectedValueData:
                                     projectSelectedValueData})
            }
        }
    };
    return packetCaptureView;
});

