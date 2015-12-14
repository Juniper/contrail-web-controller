/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var SvcApplianceView = ContrailView.extend({
        el: $(contentContainer),
        renderSvcAppliance: function (viewConfig) {
            var self = this;
            self.renderView4Config(self.$el, null,
                                   getSvcApplianceConfig(viewConfig));
        }
    });


    function getSvcApplianceConfig (viewConfig) {
        var hashParams = viewConfig.hashParams,
            customSASetDropdownOptions = {
                childView: {
                    init: getSvcAppliance(viewConfig),
                }
            };
        return ctwvc.getSASetBCDropdownViewConfig(hashParams,
                                                  customSASetDropdownOptions)
    };

    function getSvcAppliance (viewConfig) {
        return function (saSetValueData) {
            return {
                elementId: cowu.formatElementId([ctwl.CONFIG_SVC_APPLIANCE_PAGE_ID]),
                view: "SvcApplianceListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/infra/serviceappliance/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                    {saSetValueData: saSetValueData})
            }
        }
    };
    return SvcApplianceView;
});

