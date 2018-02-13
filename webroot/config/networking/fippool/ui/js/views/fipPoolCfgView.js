/*
 * Copyright (c) 2018 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var fipPoolCfgView = ContrailView.extend({
        el: $(contentContainer),
        renderFipPoolCfg: function (viewConfig) {
            this.renderView4Config(this.$el, null, getFipPoolCfgListConfig(viewConfig));
        }
    });

    function getFipPoolCfgListConfig(viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                config: true,
                childView: {
                    init: getFipPoolCfgViewConfig(viewConfig),
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

    function getFipPoolCfgViewConfig(viewConfig) {
        return function (projectSelectedValueData) {
            return {
                elementId: cowu.formatElementId([ctwc.CFG_FIP_POOL_PAGE_ID]),
                view: "fipPoolCfgListView",
                viewPathPrefix:
                        "config/networking/fippool/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: $.extend(true, {}, viewConfig,
                        {selectedProjectId:
                        projectSelectedValueData.value})
            }
        }
    };

    return fipPoolCfgView;
});
