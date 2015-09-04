/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var svcTemplateCfgView = ContrailView.extend({
        el: $(contentContainer),
        renderSvcTemplateCfg: function (viewConfig) {
            this.renderView4Config(this.$el, null,
                                    getSvcTemplateCfgListConfig(viewConfig));
        }
    });

    function getSvcTemplateCfgListConfig(viewConfig) {
        var hashParams = viewConfig.hashParams,
            customDomainDropdownOptions = {
                childView: {
                    init: getSvcTemplateCfgViewConfig(viewConfig),
                }
            };
        return getDomainBreadcrumbDropdownViewConfig(hashParams,
                                                     customDomainDropdownOptions)
    };

    function getSvcTemplateCfgViewConfig(viewConfig) {
        return function (domainSelectedValueData) {
            return {
                elementId: cowu.formatElementId([ctwl.CFG_IPAM_PAGE_ID]),
                view: "svcTemplateCfgListView",
                viewPathPrefix:
                    "config/services/templates/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: $.extend(true, {},
                     viewConfig, {domainSelectedValueData: domainSelectedValueData})
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

    return svcTemplateCfgView;
});
