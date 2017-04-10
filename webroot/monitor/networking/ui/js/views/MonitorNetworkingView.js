/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var MonitorNetworkingView = ContrailView.extend({
        el: $(contentContainer),

        renderProjectList: function (viewConfig) {
            this.renderView4Config(this.$el, null, getProjectListConfig(viewConfig));
        },

        renderProject: function (viewConfig) {
            this.renderView4Config(this.$el, null, getProjectConfig(viewConfig));
       },

        renderNetwork: function (viewConfig) {
            this.renderView4Config(this.$el, null, getNetworkConfig(viewConfig));
        },

        renderNetworkList: function (viewConfig) {
            this.renderView4Config(this.$el, null, getNetworkListConfig(viewConfig));
        },

        renderInstance: function (viewConfig) {
            this.renderView4Config(this.$el, null, getInstanceConfig(viewConfig));
        },

        renderInstanceList: function (viewConfig) {
            this.renderView4Config(this.$el, null, getInstanceListConfig(viewConfig));
        },

        renderInterfaceList: function (viewConfig) {
            this.renderView4Config(this.$el, null, getInterfaceListConfig(viewConfig));
        },

        renderFlowList: function (viewConfig) {
            this.renderView4Config(this.$el, null, getFlowListConfig(viewConfig));
        },

        renderFlow: function (viewConfig) {
            this.renderView4Config(this.$el, null, getFlowConfig(viewConfig));
        }
    });

    function getProjectConfig(viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                getProjectsFromIdentity: true,
                includeDefaultProject: true,
                changeCB: getProjectChangeCB(hashParams),
                childView: {
                    init: getProjectViewConfig()
                }
            },
            customDomainDropdownOptions = {
                childView: {
                    init: ctwvc.getProjectBreadcrumbDropdownViewConfig(hashParams, customProjectDropdownOptions)
                }
            };

        return ctwvc.getDomainBreadcrumbDropdownViewConfig(hashParams, customDomainDropdownOptions);
    };

    function getProjectListConfig(viewConfig) {
        var hashParams = viewConfig.hashParams,
            customDomainDropdownOptions = {
                childView: {
                    init: function (selectedDomain) {
                        return getProjectListViewConfig(viewConfig, selectedDomain);
                    }
                }
            };

        return ctwvc.getDomainBreadcrumbDropdownViewConfig(hashParams, customDomainDropdownOptions);
    };

    function getNetworkConfig(viewConfig) {
        var hashParams = viewConfig.hashParams,
            customNetworkDropdownOptions = {
                changeCB: getNetworkChangeCB(hashParams),
                childView: {
                    init: getNetworkViewConfig()
                }
            },
            customProjectDropdownOptions = {
                getProjectsFromIdentity: true,
                changeCB: getProjectChangeCB(hashParams),
                includeDefaultProject: true,
                childView: {
                    init: ctwvc.getNetworkBreadcrumbDropdownViewConfig(hashParams, customNetworkDropdownOptions),
                    change: getProjectViewConfig()
                }
            },
            customDomainDropdownOptions = {
                childView: {
                    init: ctwvc.getProjectBreadcrumbDropdownViewConfig(hashParams, customProjectDropdownOptions)
                }
            };
        return ctwvc.getDomainBreadcrumbDropdownViewConfig(hashParams, customDomainDropdownOptions);
    };

    function getNetworkListConfig(viewConfig) {
        var hashParams = viewConfig.hashParams,
            roles = globalObj.webServerInfo.role,
            customProjectDropdownOptions = {
                getProjectsFromIdentity: true,
                includeDefaultProject: true,
                defaultValueIndex: 1,
                childView: {
                    init: getNetworkListViewConfig(viewConfig)
                },
                allDropdownOption: ctwc.ALL_PROJECT_DROPDOWN_OPTION
            },
            customDomainDropdownOptions = {
                childView: {
                    init: ctwvc.getProjectBreadcrumbDropdownViewConfig(hashParams, customProjectDropdownOptions)
                }
            };
        var currentCookie =  contrail.getCookie('region');
        if (currentCookie == cowc.GLOBAL_CONTROLLER_ALL_REGIONS || !cowu.isAdmin()){
            delete customProjectDropdownOptions['allDropdownOption'];
            customProjectDropdownOptions['defaultValueIndex'] = 0;
        }
        return ctwvc.getDomainBreadcrumbDropdownViewConfig(hashParams, customDomainDropdownOptions)
    };

    function getInstanceConfig(viewConfig) {
        var hashParams = viewConfig.hashParams,
            customInstanceTextOptions = {
                childView: {
                    init: getInstanceViewConfig(hashParams)
                }
            },
            customNetworkDropdownOptions = {
                changeCB: getNetworkChangeCB(hashParams),
                childView: {
                    init: ctwvc.getInstanceBreadcrumbTextViewConfig(hashParams, customInstanceTextOptions),
                    change: getNetworkViewConfig()
                }
            },
            customProjectDropdownOptions = {
                getProjectsFromIdentity: true,
                includeDefaultProject: true,
                changeCB: getProjectChangeCB(hashParams),
                childView: {
                    init: ctwvc.getNetworkBreadcrumbDropdownViewConfig(hashParams, customNetworkDropdownOptions),
                    change: getProjectViewConfig()
                }
            },
            customDomainDropdownOptions = {
                childView: {
                    init: ctwvc.getProjectBreadcrumbDropdownViewConfig(hashParams, customProjectDropdownOptions)
                }
            };

        return ctwvc.getDomainBreadcrumbDropdownViewConfig(hashParams, customDomainDropdownOptions)
    };

    function getInstanceListConfig(viewConfig) {
        var hashParams = viewConfig.hashParams,
            roles = globalObj.webServerInfo.role,
            customNetworkDropdownOptions = {
                defaultValueIndex: 1,
                childView: {
                    init: getInstanceListViewConfig(viewConfig)
                },
                allDropdownOption: ctwc.ALL_NETWORK_DROPDOWN_OPTION
            },
            customProjectDropdownOptions = {
                getProjectsFromIdentity: true,
                includeDefaultProject: true,
                defaultValueIndex: 1,
                childView: {
                    init: ctwvc.getNetworkBreadcrumbDropdownViewConfig(hashParams, customNetworkDropdownOptions),
                },
                allDropdownOption: ctwc.ALL_PROJECT_DROPDOWN_OPTION
            },
            customDomainDropdownOptions = {
                childView: {
                    init: ctwvc.getProjectBreadcrumbDropdownViewConfig(hashParams, customProjectDropdownOptions)
                }
            };
        if (!cowu.isAdmin()){
            delete customProjectDropdownOptions['allDropdownOption'];
            customProjectDropdownOptions['defaultValueIndex'] = 0;
            delete customNetworkDropdownOptions['allDropdownOption'];
            customNetworkDropdownOptions['defaultValueIndex'] = 0;
        }
        return ctwvc.getDomainBreadcrumbDropdownViewConfig(hashParams, customDomainDropdownOptions)
    };

    function getInterfaceListConfig(viewConfig) {
        var hashParams = viewConfig.hashParams,
            roles = globalObj.webServerInfo.role,
            customNetworkDropdownOptions = {
                defaultValueIndex: 1,
                childView: {
                    init: getInterfaceListViewConfig(viewConfig)
                },
                allDropdownOption: ctwc.ALL_NETWORK_DROPDOWN_OPTION
            },
            customProjectDropdownOptions = {
                getProjectsFromIdentity: true,
                includeDefaultProject: true,
                defaultValueIndex: 0,
                childView: {
                    init: ctwvc.getNetworkBreadcrumbDropdownViewConfig(hashParams, customNetworkDropdownOptions),
                },
                allDropdownOption: ctwc.ALL_PROJECT_DROPDOWN_OPTION
            },
            customDomainDropdownOptions = {
                childView: {
                    init: ctwvc.getProjectBreadcrumbDropdownViewConfig(hashParams, customProjectDropdownOptions)
                }
            };
        if (!cowu.isAdmin()){
            delete customProjectDropdownOptions['allDropdownOption'];
            customProjectDropdownOptions['defaultValueIndex'] = 0;
            delete customNetworkDropdownOptions['allDropdownOption'];
            customNetworkDropdownOptions['defaultValueIndex'] = 0;
        }
        return ctwvc.getDomainBreadcrumbDropdownViewConfig(hashParams, customDomainDropdownOptions)
    }

    function getProjectViewConfig() {

        return function(projectSelectedValueData) {
            var domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                projectFQN = domain + ':' + projectSelectedValueData.name,
                projectUUID = projectSelectedValueData.value;

            return {
                elementId: cowu.formatElementId([ctwl.MONITOR_PROJECT_PAGE_ID]),
                view: "ProjectView",
                viewPathPrefix: "monitor/networking/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: {projectFQN: projectFQN, projectUUID: projectUUID}
            };
        }
    }

    function getNetworkViewConfig() {
        return function (networkSelectedValueData) {
            var domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                projectFQN = domain + ':' + contrail.getCookie(cowc.COOKIE_PROJECT),
                networkFQN = projectFQN + ':' + networkSelectedValueData.name,
                networkUUID = networkSelectedValueData.value;

            return {
                elementId: cowu.formatElementId([ctwl.MONITOR_NETWORK_PAGE_ID]),
                view: "NetworkView",
                viewPathPrefix: "monitor/networking/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: {
                    networkFQN: networkFQN,
                    networkUUID: networkUUID
                }
            }
        }
    }

    function getInstanceViewConfig(hashParams) {
        return function (instanceSelectedValueData, parentSelectedValueData) {
            var networkSelectedValueData = parentSelectedValueData,
                domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                projectFQN = domain + ':' + contrail.getCookie(cowc.COOKIE_PROJECT),
                networkFQN = projectFQN + ':' + networkSelectedValueData.name,
                instanceUUID = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.uuid')) ? hashParams.focusedElement.uuid : null,
                networkUUID = networkSelectedValueData.value;

            return {
                elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCE_PAGE_ID]),
                view: "InstanceView",
                viewPathPrefix: "monitor/networking/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: {networkFQN: networkFQN, networkUUID: networkUUID, instanceUUID: instanceUUID}
            }
        }
    };

    function getProjectListViewConfig(viewConfig, selectedDomain) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_PROJECT_LIST_PAGE_ID]),
            view: "ProjectListView",
            viewPathPrefix: "monitor/networking/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: $.extend(viewConfig, {selectedDomain: selectedDomain})
        }
    };

    function getNetworkListViewConfig(viewConfig) {
        return function (projectSelectedValueData) {
            return {
                elementId: cowu.formatElementId([ctwl.MONITOR_NETWORK_LIST_PAGE_ID]),
                view: "NetworkListView",
                viewPathPrefix: "monitor/networking/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: $.extend(true, {}, viewConfig, {projectSelectedValueData: projectSelectedValueData})
            }
        };
    };

    function getInstanceListViewConfig(viewConfig) {
        return function (networkSelectedValueData) {
            return {
                elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCE_LIST_PAGE_ID]),
                view: "InstanceListView",
                viewPathPrefix: "monitor/networking/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: $.extend(true, {}, viewConfig, {networkSelectedValueData: networkSelectedValueData})
            }
        }
    };

    function getInterfaceListViewConfig(viewConfig) {
        return function (networkSelectedValueData) {
            return {
                elementId: cowu.formatElementId([ctwl.MONITOR_INTERFACE_LIST_PAGE_ID]),
                view: "InterfaceListView",
                viewPathPrefix: "monitor/networking/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: $.extend(true, {}, viewConfig, {networkSelectedValueData: networkSelectedValueData})

            }
        }
    };

    function getNetworkChangeCB(hashParams) {
        return function (networkSelectedValueData) {
            var domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                projectFQN = domain + ':' + contrail.getCookie(cowc.COOKIE_PROJECT),
                networkFQN = projectFQN + ':' + networkSelectedValueData.name,
                networkUUID = networkSelectedValueData.value;

            delete hashParams.clickedElement;
            ctwu.setNetworkURLHashParams(hashParams, networkFQN, false);
        }
    }

    function getProjectChangeCB(hashParams) {
        return function(projectSelectedValueData) {
            var domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                projectFQN = domain + ':' + projectSelectedValueData.name,
                projectUUID = projectSelectedValueData.value;

            delete hashParams.clickedElement;
            ctwu.setProjectURLHashParams(hashParams, projectFQN, false);
        }
    }

    function getFlowListConfig(viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_FLOWS_PAGE_ID]),
            view: "FlowListView",
            viewPathPrefix: "monitor/networking/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {config: viewConfig}
        };
    };

    function getFlowConfig(config) {
        var hashParams = config['hashParams'],
            url = ctwc.constructReqURL($.extend({}, nmwgc.getURLConfigForFlowGrid(hashParams), {protocol:['tcp','icmp','udp']}));

        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_FLOW_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.FLOWS_GRID_ID,
                                title: ctwl.TITLE_FLOW_SERIES,
                                view: "FlowGridView",
                                viewPathPrefix: "monitor/networking/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {hashParams: hashParams, pagerOptions: { options: { pageSize: 25, pageSizeSelect: [25, 50, 100] } } }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return MonitorNetworkingView;
});