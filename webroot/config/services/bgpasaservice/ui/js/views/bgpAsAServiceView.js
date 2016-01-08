/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var bgpAsAServiceView = ContrailView.extend({
        el: $(contentContainer),
        renderBGPAsAService: function (viewConfig) {
            var self = this;
            self.renderView4Config(self.$el, null,
                                   getbgpAsAServiceConfig(viewConfig));
        }
    });

    function getbgpAsAServiceConfig (viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                config: true,
                childView: {
                    init: getbgpAsAService(viewConfig),
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

    function getbgpAsAService(viewConfig) {
        return function (projectSelectedValueData) {
            selectedDomainProjectData = projectSelectedValueData;
            return {
                elementId: cowu.formatElementId([ctwc.CONFIG_BGP_AS_A_SERVICE_LIST_ID]),
                view: "bgpAsAServiceListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/services/bgpasaservice/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                                     {projectSelectedValueData:
                                     projectSelectedValueData})
            }
        }
    };
    return bgpAsAServiceView;
});

