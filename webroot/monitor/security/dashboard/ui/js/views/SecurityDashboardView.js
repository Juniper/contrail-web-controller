/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var SecurityDashboardView = ContrailView.extend({
        el: $(contentContainer),
        render: function (viewConfig) {
            this.renderView4Config(this.$el, null,
                    getBreadCrumbViewConfig(viewConfig));
        }
    });
    
    function getBreadCrumbViewConfig(viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                getProjectsFromIdentity: true,
                includeDefaultProject: true,
                allDropdownOption: ctwc.ALL_PROJECT_DROPDOWN_OPTION,
                childView: {
                    init: function () {
                    	return function (project) {
                    		return getSecurityDashboardViewConfig();
                    	}
                    }()
                }
            },
            customDomainDropdownOptions = {
                childView: {
                    init: ctwvc.getProjectBreadcrumbDropdownViewConfig(hashParams, customProjectDropdownOptions)
                }
            };

        return ctwvc.getDomainBreadcrumbDropdownViewConfig(hashParams, customDomainDropdownOptions);
    };
    function getSecurityDashboardViewConfig() {
        var viewConfig =  {
                rows : [{
                            columns : [{
                                elementId: 'security-dashboard-carousel-view',
                                view: "CarouselView",
                                viewConfig: {
                                    pages : [{
                                             page: {
                                                 elementId : 'security-dashboard-stackview-0',
                                                 view : "GridStackView",
                                                 viewConfig : {
                                                    elementId : 'security-dashboard-stackview-0',
                                                    gridAttr : {
                                                        widthMultiplier : cowc.GRID_STACK_DEFAULT_WIDTH,
                                                        heightMultiplier : 10
                                                    },
                                                    widgetCfgList: [
                                                        {id: 'vmi-implicit-allow-deny-scatterchart'},
                                                        {id: 'top-10-allowed-rules'},
                                                        {id: 'top-5-services'}
                                                        //{id: 'top-10-denied-rules'}
                                                        //{id: 'top-10-deny-rules'},
                                                    ]
                                                 }
                                             },
                                         }]
                                }
                            }]
                }]
        };
        return {
            elementId : cowu.formatElementId([ctwl.ANALYTICSNODE_SUMMARY_LIST_SECTION_ID ]),
            view : "SectionView",
            viewConfig : viewConfig
        }
    };
    return SecurityDashboardView;
});