/*
* Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
*/

define([
   'underscore',
   'backbone',
    'contrail-view'
], function (_, Backbone, ContrailView) {
        var self;
    var portView = ContrailView.extend({
        el: $(contentContainer),

        renderPort: function (viewConfig) {
            self = this;
            var projectName = getValueByJsonPath(viewConfig,'hashParams;focusedElement;projectName',undefined);
            if(projectName !== undefined){
            	contrail.setCookie(cowc.COOKIE_PROJECT, projectName);
            	contrail.setCookie(cowc.COOKIE_PROJECT_DISPLAY_NAME, projectName);
            }
            self.renderView4Config(self.$el, null,
                                   self.getPortConfig(viewConfig));
        },
        getPortConfig: function (viewConfig) {
            var hashParams = viewConfig.hashParams,
                customProjectDropdownOptions = {
                    config: true,
                    includeDefaultProject: true,
                    childView: {
                        init: this.getPort(viewConfig),
                    }
                },
                customDomainDropdownOptions = {
                    childView: {
                        init: ctwvc.getProjectBreadcrumbDropdownViewConfig(
                                                hashParams,
                                                customProjectDropdownOptions)
                    }
                };
            return ctwvc.getDomainBreadcrumbDropdownViewConfig(hashParams,
                                                customDomainDropdownOptions)
        },
        getPort: function (viewConfig) {
            return function (projectSelectedValueData) {
                return {
                    elementId: cowu.formatElementId(
                                    [ctwc.CONFIG_PORT_PAGE_ID]),
                    view: "portListView",
                    viewPathPrefix : ctwc.URL_PORT_VIEW_PATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: $.extend(true, {}, viewConfig,
                                     {selectedProjectId:
                                     projectSelectedValueData.value})
                }
            }
        }
    });
    return portView;
});
