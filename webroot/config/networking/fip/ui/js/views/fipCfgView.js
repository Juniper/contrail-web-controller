/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var fipCfgView = ContrailView.extend({
        el: $(contentContainer),
        renderFipCfg: function (viewConfig) {
            this.renderView4Config(this.$el, null, getFipCfgListConfig(viewConfig));
        }
    });

    function getFipCfgListConfig(viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                childView: {
                    init: getFipCfgViewConfig(viewConfig),
                },
            },
            customDomainDropdownOptions = {
                childView: {
                    init: getProjectBreadcrumbDropdownViewConfig(hashParams,
                                                 customProjectDropdownOptions)
                }
            };
        return getDomainBreadcrumbDropdownViewConfig(hashParams,
                                                     customDomainDropdownOptions)
    };

    function getFipCfgViewConfig(viewConfig) {
        return function (projectSelectedValueData) {
            return {
                elementId: cowu.formatElementId([ctwl.CFG_FIP_PAGE_ID]),
                view: "fipCfgListView",
                viewPathPrefix:
                        "config/networking/fip/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: $.extend(true, {},
                     viewConfig, {projectSelectedValueData: projectSelectedValueData})
            }
        }
    };

    function getDomainBreadcrumbDropdownViewConfig(hashParams,
                                                     customDomainDropdownOptions) {
        var urlValue = (contrail.checkIfKeyExistInObject(true,
                         hashParams, 'focusedElement.fqName') ?
                         hashParams.focusedElement.fqName : null),
            defaultDropdownoptions = {
                urlValue: (urlValue !== null) ?
                             urlValue.split(':').splice(0,1).join(':') : null,
                cookieKey: cowc.COOKIE_DOMAIN
            },
            dropdownOptions = $.extend(true, {},
                             defaultDropdownoptions, customDomainDropdownOptions);

        return {
            elementId: ctwl.DOMAINS_BREADCRUMB_DROPDOWN,
            view: "BreadcrumbDropdownView",
            viewConfig: {
                modelConfig: ctwu.getDomainListModelConfig(),
                dropdownOptions: dropdownOptions
            }
        }
    }

    function getProjectBreadcrumbDropdownViewConfig(hashParams,
                                                     customProjectDropdownOptions) {
        var urlValue = (contrail.checkIfKeyExistInObject(true,
                             hashParams, 'focusedElement.fqName') ?
                             hashParams.focusedElement.fqName : null);

        return function(domainSelectedValueData) {
            var domain = domainSelectedValueData.name,
                defaultDropdownOptions = {
                    urlValue: (urlValue !== null) ?
                             urlValue.split(':').splice(1, 1).join(':') : null,
                    cookieKey: cowc.COOKIE_PROJECT
                },
                dropdownOptions = $.extend(true, {},
                             defaultDropdownOptions, customProjectDropdownOptions);

            return {
                elementId: ctwl.PROJECTS_BREADCRUMB_DROPDOWN,
                view: "BreadcrumbDropdownView",
                viewConfig: {
                    modelConfig: ctwu.getProjectListModelConfig(domain),
                    dropdownOptions: dropdownOptions
                }
            }
        };
    }

    return fipCfgView;
});
