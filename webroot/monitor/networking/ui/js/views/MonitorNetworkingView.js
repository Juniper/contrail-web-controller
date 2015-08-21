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
                changeCB: getProjectChangeCB(hashParams),
                childView: {
                    init: getProjectViewConfig()
                }
            },
            customDomainDropdownOptions = {
                childView: {
                    init: getProjectBreadcrumbDropdownViewConfig(hashParams, customProjectDropdownOptions)
                }
            };

        return getDomainBreadcrumbDropdownViewConfig(hashParams, customDomainDropdownOptions);
    };

    function getProjectListConfig(viewConfig) {
        var hashParams = viewConfig.hashParams,
            customDomainDropdownOptions = {
                childView: {
                    init: getProjectListViewConfig(viewConfig)
                }
            };

        return getDomainBreadcrumbDropdownViewConfig(hashParams, customDomainDropdownOptions);
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
                changeCB: getProjectChangeCB(hashParams),
                childView: {
                    init: getNetworkBreadcrumbDropdownViewConfig(hashParams, customNetworkDropdownOptions),
                    change: getProjectViewConfig()
                }
            },
            customDomainDropdownOptions = {
                childView: {
                    init: getProjectBreadcrumbDropdownViewConfig(hashParams, customProjectDropdownOptions)
                }
            };
        
        return getDomainBreadcrumbDropdownViewConfig(hashParams, customDomainDropdownOptions);
    };

    function getNetworkListConfig(viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                childView: {
                    init: getNetworkListViewConfig(viewConfig),
                },
                allDropdownOption: ctwc.ALL_PROJECT_DROPDOWN_OPTION
            },
            customDomainDropdownOptions = {
                childView: {
                    init: getProjectBreadcrumbDropdownViewConfig(hashParams, customProjectDropdownOptions)
                }
            };

        return getDomainBreadcrumbDropdownViewConfig(hashParams, customDomainDropdownOptions)
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
                    init: getInstanceBreadcrumbTextViewConfig(hashParams, customInstanceTextOptions),
                    change: getNetworkViewConfig()
                }
            },
            customProjectDropdownOptions = {
                changeCB: getProjectChangeCB(hashParams),
                childView: {
                    init: getNetworkBreadcrumbDropdownViewConfig(hashParams, customNetworkDropdownOptions),
                    change: getProjectViewConfig()
                }
            },
            customDomainDropdownOptions = {
                childView: {
                    init: getProjectBreadcrumbDropdownViewConfig(hashParams, customProjectDropdownOptions)
                }
            };

        return getDomainBreadcrumbDropdownViewConfig(hashParams, customDomainDropdownOptions)
    };

    function getInstanceListConfig(viewConfig) {
        var hashParams = viewConfig.hashParams,
            customNetworkDropdownOptions = {
                childView: {
                    init: getInstanceListViewConfig(viewConfig)
                },
                allDropdownOption: ctwc.ALL_NETWORK_DROPDOWN_OPTION
            },
            customProjectDropdownOptions = {
                childView: {
                    init: getNetworkBreadcrumbDropdownViewConfig(hashParams, customNetworkDropdownOptions),
                },
                allDropdownOption: ctwc.ALL_PROJECT_DROPDOWN_OPTION
            },
            customDomainDropdownOptions = {
                childView: {
                    init: getProjectBreadcrumbDropdownViewConfig(hashParams, customProjectDropdownOptions)
                }
            };

        return getDomainBreadcrumbDropdownViewConfig(hashParams, customDomainDropdownOptions)
    }

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

    function getProjectBreadcrumbDropdownViewConfig(hashParams, customProjectDropdownOptions) {
        var urlValue = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.fqName') ? hashParams.focusedElement.fqName : null);

        return function(domainSelectedValueData) {
            var domain = domainSelectedValueData.name,
                defaultDropdownOptions = {
                    urlValue: (urlValue !== null) ? urlValue.split(':').splice(1, 1).join(':') : null,
                    cookieKey: cowc.COOKIE_PROJECT
                },
                dropdownOptions = $.extend(true, {}, defaultDropdownOptions, customProjectDropdownOptions);

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

    function getNetworkBreadcrumbDropdownViewConfig(hashParams, customNetworkDropdownOptions) {
        var urlValue = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.fqName') ? hashParams.focusedElement.fqName : null),
            defaultDropdownOptions = {
                urlValue: (urlValue !== null) ? urlValue.split(':').splice(2, 1).join(':') : null,
                cookieKey: cowc.COOKIE_VIRTUAL_NETWORK
            },
            dropdownOptions = $.extend(true, {}, defaultDropdownOptions, customNetworkDropdownOptions);

        return function(projectSelectedValueData) {
            var domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                projectFQN = domain + ':' + projectSelectedValueData.name,
                modelConfig = (projectSelectedValueData.value === 'all') ? null : ctwu.getNetworkListModelConfig(projectFQN);
            return {
                elementId: ctwl.NETWORKS_BREADCRUMB_DROPDOWN,
                view: "BreadcrumbDropdownView",
                viewConfig: {
                    modelConfig: modelConfig,
                    dropdownOptions: dropdownOptions
                }
            };
        }
    }

    function getInstanceBreadcrumbTextViewConfig(hashParams, customInstanceTextOptions) {
        var instanceUUID = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.uuid')) ? hashParams.focusedElement.uuid : null,
            vmName = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.vmName')) ? hashParams.focusedElement.vmName : null,
            urlValue = (contrail.checkIfExist(vmName) && vmName != "") ? vmName : instanceUUID;


        return function(networkSelectedValueData) {
            var defaultTextOptions = {
                    urlValue: (urlValue !== null) ? urlValue : null,
                    parentViewParams: {
                        networkSelectedValueData: networkSelectedValueData
                    }
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
        return function (instanceSelectedValueData, parentViewParams) {
            var networkSelectedValueData = parentViewParams.networkSelectedValueData,
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

    function getProjectListViewConfig(viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_PROJECT_LIST_PAGE_ID]),
            view: "ProjectListView",
            viewPathPrefix: "monitor/networking/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: viewConfig
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

    function getNetworkChangeCB(hashParams) {
        return function (networkSelectedValueData) {
            var domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                projectFQN = domain + ':' + contrail.getCookie(cowc.COOKIE_PROJECT),
                networkFQN = projectFQN + ':' + networkSelectedValueData.name,
                networkUUID = networkSelectedValueData.value;

            delete hashParams.clickedElement;
            nmwgrc.setNetworkURLHashParams(hashParams, networkFQN, false);
        }
    }

    function getProjectChangeCB(hashParams) {
        return function(projectSelectedValueData) {
            var domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                projectFQN = domain + ':' + projectSelectedValueData.name,
                projectUUID = projectSelectedValueData.value;

            delete hashParams.clickedElement;
            nmwgrc.setProjectURLHashParams(hashParams, projectFQN, false);
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
                                title: ctwl.TITLE_FLOWS,
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