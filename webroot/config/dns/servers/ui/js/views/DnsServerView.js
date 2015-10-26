/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var DnsServerView = ContrailView.extend({
        el: $(contentContainer),
        renderDnsServer: function (viewConfig) {
            this.renderView4Config(this.$el, null, getDnsListConfig(viewConfig));
        },
		renderActiveDns: function (viewConfig) {
            this.renderView4Config(this.$el, null, getActiveDns(viewConfig));
        }
    });
    
    function getDnsListConfig(viewConfig) {
        var hashParams = viewConfig.hashParams,
           
            customDomainDropdownOptions = {
                childView: {
                    init: getDnsServer(viewConfig)
                }
            };

        return getDomainBreadcrumbDropdownViewConfig(hashParams, customDomainDropdownOptions)
    };
	/*  function getActiveDnsListConfig(viewConfig) {
        var hashParams = viewConfig.hashParams,
           
            customInstanceTextOptions = {
                childView: {
                    init: getActiveDns(viewConfig)
                }
            };

        return getDomainBreadcrumbTextViewConfig(hashParams, customInstanceTextOptions)
    };*/
	
    function getDnsServer(viewConfig) {
      return function (domainSelectedValueData) {
            return {
                elementId: 'DnsServerPageId',
                view: "DnsServerListView",
                viewPathPrefix: "config/dns/servers/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: $.extend(true, {}, viewConfig, {domainSelectedValueData: domainSelectedValueData})
				   }
        }
    };
	
	function getActiveDns(viewConfig) {
            return {
                elementId: 'ActiveDnsPageId',
                view: "ActiveDnsListView",
                viewPathPrefix: "config/dns/servers/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig:  viewConfig
				   }
    };
    
    function getDomainBreadcrumbDropdownViewConfig(hashParams, customDomainDropdownOptions) {
        var urlValue = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.fqName') ? hashParams.focusedElement.fqName : null),
            defaultDropdownoptions = {
                urlValue: (urlValue !== null) ? urlValue.split(':').splice(0,1).join(':') : null,
                cookieKey: cowc.COOKIE_DOMAIN
            },
            dropdownOptions = $.extend(true, {}, defaultDropdownoptions, customDomainDropdownOptions);

        return {
            elementId: ctwl.DOMAINS_BREADCRUMB_DROPDOWN,
            view: "BreadcrumbDropdownView",
            viewConfig: {
                modelConfig: ctwu.getDomainListModelConfig(),
                dropdownOptions: dropdownOptions
            }
        }
    }

    /*function getDomainBreadcrumbTextViewConfig(hashParams, customInstanceTextOptions) {
   		var instanceUUID = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.uuid')) ? hashParams.focusedElement.uuid : null,
                vmName = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.vmName')) ? hashParams.focusedElement.vmName : null,
                urlValue = (contrail.checkIfExist(vmName) && vmName != "") ? vmName : instanceUUID;


            return function(networkSelectedValueData) {
                var defaultTextOptions = {
                        urlValue: (urlValue !== null) ? urlValue : null,
                        parentSelectedValueData: networkSelectedValueData
                    },
                    textOptions = $.extend(true, {}, defaultTextOptions, customInstanceTextOptions);

                return {
                    elementId: ctwl.INSTANCE_BREADCRUMB_TEXT,
                    view: "BreadcrumbTextView",
                    viewConfig: {
                        textOptions: textOptions
                    }
                };
            }
        };
   */ 
    return DnsServerView;
});
