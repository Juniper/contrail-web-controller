/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var ConfigInterfacesView = ContrailView.extend({
        el: $(contentContainer),
        renderInterfaces : function (viewConfig) {
            this.renderView4Config(this.$el, null,
            getInterfacesListConfig(viewConfig));
        }
    });

    function getInterfacesListConfig(viewConfig) {
        var hashParams = viewConfig.hashParams,
            customPRouterDropdownOptions = {
                childView: {
                    init: getInterfaces(viewConfig),
                },
                allDropdownOption: []
            };

        return getPRouterBreadcrumbDropdownViewConfig(hashParams,
            customPRouterDropdownOptions);
    };

    function getPRouterBreadcrumbDropdownViewConfig(hashParams,
        customPRouterDropdownOptions) {
        var urlValue =
            (contrail.checkIfKeyExistInObject(true, hashParams,
            'focusedElement.fqName') ? hashParams.focusedElement.fqName : null),
            defaultDropdownoptions = {
                urlValue: (urlValue !== null) ?
                    urlValue.split(':').splice(0,1).join(':') : null,
                cookieKey: ctwl.PROUTER_KEY
            },
            dropdownOptions = $.extend(true, {}, defaultDropdownoptions,
                customPRouterDropdownOptions);

        return {
            elementId: ctwl.PROUTER_BREADCRUMB_DROPDOWN,
            view: "BreadcrumbDropdownView",
            viewConfig: {
                modelConfig: getPRouterListModelConfig(),
                dropdownOptions: dropdownOptions
            }
        }
    }

    getPRouterListModelConfig = function() {
         return {
             remote: {
                 ajaxConfig: {
                     url: ctwc.URL_PHYSICAL_ROUTER_LIST
                 },
                 dataParser: function(result) {
                     var pRoutersDS = [];
                     if(result != null &&
                         result['physical-routers'].length > 0) {
                         var physicalRouters = result['physical-routers'];
                         for(var i = 0; i < physicalRouters.length;i++) {
                             var physicalRouter = physicalRouters[i];
                             var name = getValueByJsonPath(physicalRouter,
                                                           "fq_name;1", null);
                             if (null == name) {
                                 continue;
                             }
                             pRoutersDS.push({name : name,
                                 value : physicalRouter.uuid,
                                 display_name: name});
                         }
                     }
                     return pRoutersDS;
                 },
                 failureCallback: function(xhr, ContrailListModel) {
                     var dataErrorTemplate =
                         contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                         dataErrorConfig = $.extend(true, {},
                             cowc.DEFAULT_CONFIG_ERROR_PAGE,
                             {errorMessage: xhr.responseText});

                     $(contentContainer).html(
                         dataErrorTemplate(dataErrorConfig));
                 }
             }
         }
    };

    function getInterfaces(viewConfig) {
        return function (pRouterSelData) {
            return {
                elementId: cowu.formatElementId(
                    [ctwl.CONFIG_INTERFACES_LIST_ID]),
                view: "interfacesListView",
                viewPathPrefix:
                    "config/physicaldevices/interfaces/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: $.extend(true, {}, viewConfig,
                    {pRouterSelData: pRouterSelData})
            };
        };
    };
    return ConfigInterfacesView;
});

