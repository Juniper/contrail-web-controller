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
                                                        heightMultiplier : 11
                                                    },
                                                    widgetCfgList: [
                                                        {
                                                            id: 'top-tags',
                                                            itemAttr: {
                                                                dropdown: {
                                                                    id: 'top-tags-dropdown',
                                                                    data: [{
                                                                        'text': 'Top Applications',
                                                                        'id': {
                                                                            viewCfg: {
                                                                              viewConfig: {
                                                                                  chartOptions: {
                                                                                      groupBy: ['app', 'remote_app_id.name'],
                                                                                      title: 'Top Applications'
                                                                                  }
                                                                              }  
                                                                            },
                                                                            modelCfg: [{
                                                                                source: 'APISERVER',
                                                                                mergeFn: {
                                                                                    modelKey: 'remote_app_id'
                                                                                }
                                                                            }]   
                                                                        }
                                                                    },{
                                                                        'text': 'Top Tiers',
                                                                        'id': {
                                                                         viewCfg: {
                                                                           viewConfig: {
                                                                               chartOptions: {
                                                                                   groupBy: ['tier', 'remote_tier_id.name'],
                                                                                   title: 'Top Tiers'
                                                                               }
                                                                           }  
                                                                         },
                                                                         modelCfg: [{
                                                                             source: 'APISERVER',
                                                                             mergeFn: {
                                                                                 modelKey: 'remote_tier_id'
                                                                             }
                                                                         }]   
                                                                        }
                                                                    },{
                                                                        'text': 'Top Sites',
                                                                        'id': {
                                                                            viewCfg: {
                                                                              viewConfig: {
                                                                                  chartOptions: {
                                                                                      groupBy: ['site', 'remote_site_id.name'],
                                                                                      title: 'Top Sites'
                                                                                  }
                                                                              }  
                                                                            },
                                                                            modelCfg: [{
                                                                                source: 'APISERVER',
                                                                                mergeFn: {
                                                                                    modelKey: 'remote_site_id'
                                                                                }
                                                                            }]
                                                                        }
                                                                    },{
                                                                        'text': 'Top Deployments',
                                                                        'id': {
                                                                            viewCfg: {
                                                                              viewConfig: {
                                                                                  chartOptions: {
                                                                                      groupBy: ['deployment', 'remote_deployment_id.name'],
                                                                                      title: 'Top Deployments'
                                                                                  }
                                                                              }  
                                                                            },
                                                                            modelCfg: [{
                                                                                source: 'APISERVER',
                                                                                mergeFn: {
                                                                                    modelKey: 'remote_deployment_id'
                                                                                }
                                                                            }]   
                                                                        }
                                                                    }]
                                                                },
                                                            }
                                                        },{
                                                            id: 'top-vns'
                                                        },{
                                                            id: 'all-tags-traffic'
                                                        },{
                                                            id: 'top-vmis-with-deny'
                                                        },{
                                                            id: 'top-acl-with-deny'
                                                        }
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