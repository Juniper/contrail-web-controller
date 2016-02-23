/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var svcHealthChkCfgView = ContrailView.extend({
        el: $(contentContainer),
        rendersvcHealthChkCfg: function (viewConfig) {
            this.renderView4Config(this.$el, null, getsvcHealthChkCfgListConfig(viewConfig));
        }
    });


    function getsvcHealthChkCfgListConfig(viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                config: true,
                childView: {
                    init: getsvcHealthChkCfgViewConfig(viewConfig),
                },
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

    function getsvcHealthChkCfgViewConfig(viewConfig) {
        return function (projectSelectedValueData) {
            return {
                elementId: cowu.formatElementId([ctwl.CFG_SVC_HEALTH_CHK_PAGE_ID]),
                view: "svcHealthChkCfgListView",
                viewPathPrefix:
                    "config/services/svchealthcheck/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: $.extend(true, {},
                     viewConfig, {projectSelectedValueData: projectSelectedValueData})
            }
        }
    };

    return svcHealthChkCfgView;
});
