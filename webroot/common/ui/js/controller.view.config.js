/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view-model'
], function (_, ContrailViewModel) {
    var CTViewConfig = function () {
        var self = this;

        self.getInstanceTabViewConfig = function (viewConfig) {
            var instanceUUID = viewConfig['instanceUUID'],
                instanceDetailsUrl = ctwc.get(ctwc.URL_INSTANCE_DETAIL, instanceUUID),
                networkFQN = viewConfig['networkFQN'],
                tabsToDisplay = viewConfig['tabsToDisplay'],
                tabObjs = [];
            var allTabs = self.getInstanceDetailPageTabConfig(viewConfig);
            if (tabsToDisplay == null) {
                tabObjs = allTabs;
            } else if (typeof tabsToDisplay =='string' || $.isArray(tabsToDisplay)) {
                if(typeof tabsToDisplay == 'string') {
                    tabsToDisplay = [tabsToDisplay];
                }
                for(var i = 0; i < tabsToDisplay.length; i++ ) {
                    $.each(allTabs,function(idx,obj) {
                        if(obj['view'] == tabsToDisplay[i])
                            tabObjs.push(obj);
                    });
                }
            }
            return {
                elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCE_VIEW_ID, '-section']),
                view: "SectionView",
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: ctwl.INSTANCE_TABS_ID,
                                    view: "TabsView",
                                    viewConfig: {
                                        theme: 'classic',
                                        active: 1,
                                        tabs: tabObjs
                                    }
                                }
                            ]
                        }
                    ]
                }
            }

        };

        self.getInstanceDetailPageTabConfig = function (viewConfig) {
            var instanceUUID = viewConfig['instanceUUID'];
            var networkFQN = viewConfig['networkFQN'];
            var instanceDetailsUrl = ctwc.get(ctwc.URL_INSTANCE_DETAIL, instanceUUID);
            return [
                    {
                        elementId: ctwl.INSTANCE_DETAILS_ID,
                        title: ctwl.TITLE_DETAILS,
                        view: "DetailsView",
                        viewConfig: {
                            ajaxConfig: {
                                url: instanceDetailsUrl,
                                type: 'GET'
                            },
                            modelKey: ctwc.get(ctwc.UMID_INSTANCE_UVE, instanceUUID),
                            templateConfig: ctwu.getInstanceDetailsTemplateConfig(),
                            app: cowc.APP_CONTRAIL_CONTROLLER,
                            dataParser: function (response) {
                                return {
                                    name: instanceUUID,
                                    value: response
                                };
                            }
                        }
                    },
                    {
                        elementId: ctwl.INSTANCE_INTERFACE_ID,
                        title: ctwl.TITLE_INTERFACES,
                        view: "InterfaceGridView",
                        viewPathPrefix: "monitor/networking/ui/js/views/",
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        tabConfig: {
                            activate: function(event, ui) {
                                if ($('#' + ctwl.INSTANCE_INTERFACE_GRID_ID).data('contrailGrid')) {
                                    $('#' + ctwl.INSTANCE_INTERFACE_GRID_ID).data('contrailGrid').refreshView();
                                }
                            }
                        },
                        viewConfig: {
                            modelKey: ctwc.get(ctwc.UMID_INSTANCE_UVE, instanceUUID),
                            instanceUUID: instanceUUID,
                            networkFQN: networkFQN
                        }
                    },
                    {
                        elementId: ctwl.INSTANCE_TRAFFIC_STATS_ID,
                        title: ctwl.TITLE_TRAFFIC_STATISTICS,
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        view: "InstanceTrafficStatsView",
                        viewPathPrefix: "monitor/networking/ui/js/views/",
                        tabConfig: {
                            activate: function(event, ui) {
                                $('#' + ctwl.INSTANCE_TRAFFIC_STATS_ID).find('svg').trigger('refresh');
                            }
                        },
                        viewConfig: {
                            modelKey: ctwc.get(ctwc.UMID_INSTANCE_UVE, instanceUUID),
                            instanceUUID: instanceUUID,
                            parseFn: ctwp.parseTrafficLineChartData
                        }
                    },
                    {
                        elementId: ctwl.INSTANCE_PORT_DIST_ID,
                        title: ctwl.TITLE_PORT_DISTRIBUTION,
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        view: "InstancePortDistributionView",
                        viewPathPrefix: "monitor/networking/ui/js/views/",
                        tabConfig: {
                            activate: function(event, ui) {
                                $('#' + ctwl.INSTANCE_PORT_DIST_CHART_ID).trigger('refresh');
                            }
                        },
                        viewConfig: {
                            modelKey: ctwc.get(ctwc.UMID_INSTANCE_UVE, instanceUUID),
                            instanceUUID: instanceUUID
                        }
                    },
                    {
                        elementId: ctwl.INSTANCE_PORT_HEAT_CHART_ID,
                        title: ctwl.TITLE_PORT_MAP,
                        view: "HeatChartView",
                        viewConfig: {
                            ajaxConfig: {
                                url: ctwc.get(ctwc.URL_INSTANCE_DETAIL, instanceUUID),
                                type: 'GET'
                            },
                            chartOptions: {getClickFn: function(){}}
                        }
                    },
                    {
                        elementId: ctwl.INSTANCE_CPU_MEM_STATS_ID,
                        title: ctwl.TITLE_CPU_MEMORY,
                        view: "LineBarWithFocusChartView",
                        tabConfig: {
                            activate: function(event, ui) {
                                $('#' + ctwl.INSTANCE_CPU_MEM_STATS_ID).find('svg').trigger('refresh');
                            }
                        },
                        viewConfig: {
                            modelConfig: getInstanceCPUMemModelConfig(networkFQN, instanceUUID),
                            parseFn: ctwp.parseCPUMemLineChartData,
                            chartOptions: {
                                forceY1: [0, 1]
                            }
                        }
                    }
            ];
        };

        self.getInstanceTabViewModelConfig = function (instanceUUID) {
            var modelKey = ctwc.get(ctwc.UMID_INSTANCE_UVE, instanceUUID);
            var viewModelConfig = {
                modelKey: modelKey,
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_INSTANCE_DETAIL, instanceUUID),
                        type: 'GET'
                    },
                    dataParser: function(response) {
                        return {name: instanceUUID, value: response};
                    }
                },
                cacheConfig: {
                    ucid: ctwc.UCID_PREFIX_MN_UVES + instanceUUID
                },
                vlRemoteConfig: {
                    vlRemoteList: ctwgc.getVMInterfacesLazyRemoteConfig()
                }
            };

            return new ContrailViewModel(viewModelConfig);
        };

        self.getHeatChartClickFn = function(selector, response) {
            return function(clickData) {
                var currHashObj = layoutHandler.getURLHashObj(),
                    startRange = ((64 * clickData.y) + clickData.x) * 256,
                    endRange = startRange + 255,
                    hashParams = {}, protocolMap = {'icmp': 1, 'tcp': 6, 'udp': 17};

                hashParams['fqName'] = currHashObj['q']['fqName'];
                hashParams['port'] = startRange + "-" + endRange;
                hashParams['startTime'] = new XDate().addMinutes(-10).getTime();
                hashParams['endTime'] = new XDate().getTime();
                hashParams['portType'] = response['type'];
                hashParams['protocol'] = protocolMap[response['pType']];
                hashParams['type'] = "flow";
                hashParams['view'] = "list";

                layoutHandler.setURLHashParams(hashParams, {p: 'mon_networking_networks'});
            }
        };

        self.getDomainBreadcrumbDropdownViewConfig = function (hashParams, customDomainDropdownOptions) {
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
            };
        };

        self.getProjectBreadcrumbDropdownViewConfig = function(hashParams, customProjectDropdownOptions) {
            var urlValue = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.fqName') ? hashParams.focusedElement.fqName : null);

            return function(domainSelectedValueData) {
                var domain = domainSelectedValueData.name,
                    defaultDropdownOptions = {
                        urlValue: (urlValue !== null) ? urlValue.split(':').splice(1, 1).join(':') : null,
                        cookieKey: cowc.COOKIE_PROJECT,
                        parentSelectedValueData: domainSelectedValueData
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
        };
        self.getDNSBreadcrumbDropdownViewConfig = function(hashParams, customDNSDropdownOptions) {
            var urlValue = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.fqName') ? hashParams.focusedElement.fqName : null);

            return function(domainSelectedValueData) {
                var domain = domainSelectedValueData.value,
                    defaultDropdownOptions = {
                        urlValue: (urlValue !== null) ? urlValue.split(':').splice(1, 1).join(':') : null,
                        cookieKey: 'dnsServer',
                        parentSelectedValueData: domainSelectedValueData
                    },
                    dropdownOptions = $.extend(true, {}, defaultDropdownOptions, customDNSDropdownOptions);

                return {
                    elementId: ctwl.DNS_BREADCRUMB_DROPDOWN,
                    view: "BreadcrumbDropdownView",
                    viewConfig: {
                        modelConfig: ctwu.getDNSListModelConfig(domain),
                        dropdownOptions: dropdownOptions
                    }
                }
            };
        };

        self.getNetworkBreadcrumbDropdownViewConfig = function(hashParams, customNetworkDropdownOptions) {
            var urlValue = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.fqName') ? hashParams.focusedElement.fqName : null);

            return function(projectSelectedValueData) {
                var domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                    projectFQN = domain + ':' + projectSelectedValueData.name,
                    defaultDropdownOptions = {
                        urlValue: (urlValue !== null) ? urlValue.split(':').splice(2, 1).join(':') : null,
                        cookieKey: cowc.COOKIE_VIRTUAL_NETWORK,
                        parentSelectedValueData: projectSelectedValueData
                    },
                    dropdownOptions = $.extend(true, {}, defaultDropdownOptions, customNetworkDropdownOptions),
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
        };

        self.getInstanceBreadcrumbTextViewConfig = function(hashParams, customInstanceTextOptions) {
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

        self.getUnderlayDefaultTabConfig = function (viewConfig) {
            return [
                {
                    elementId: ctwc.UNDERLAY_SEARCHFLOW_TAB_ID,
                    title: ctwl.UNDERLAY_SEARCHFLOW_TITLE,
                    view: "SearchFlowFormView",
                    viewPathPrefix: ctwl.UNDERLAY_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: {
                        widgetConfig: {
                            elementId: ctwc.UNDERLAY_SEARCHFLOW_TAB_ID + '-widget',
                            view: "WidgetView",
                            viewConfig: {
                                header: {
                                    title: ctwl.UNDERLAY_SEARCHFLOW_WIDGET_TITLE,
                                },
                                controls: {
                                    top: {
                                        default: {
                                            collapseable: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },{
                    elementId: ctwc.UNDERLAY_TRACEFLOW_TAB_ID,
                    title: ctwl.UNDERLAY_TRACEFLOW_TITLE,
                    view: "TraceFlowTabView",
                    viewPathPrefix:
                        ctwl.UNDERLAY_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: {
                        widgetConfig: {
                            elementId: ctwc.UNDERLAY_TRACEFLOW_TAB_ID + '-widget',
                            view: "WidgetView",
                            viewConfig: {
                                header: {
                                    title: ctwl.UNDERLAY_TRACEFLOW_TITLE,
                                },
                                controls: {
                                    top: {
                                        default: {
                                            collapseable: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            ];
        };

        self.getUnderlayPRouterTabConfig = function (viewConfig) {
          return [
              {
                  elementId: ctwc.UNDERLAY_DETAILS_TAB_ID,
                  title: ctwl.TITLE_DETAILS,
                  view: "UnderlayDetailsView",
                  viewPathPrefix:
                      ctwl.UNDERLAY_VIEWPATH_PREFIX,
                  app: cowc.APP_CONTRAIL_CONTROLLER,
                  viewConfig: {

                  }
              }, {
                  elementId: ctwc.UNDERLAY_PROUTER_INTERFACE_TAB_ID,
                  title: ctwl.UNDERLAY_PROUTER_INTERFACES_TITLE,
                  view: "PRouterInterfaceView",
                  viewPathPrefix:
                      ctwl.UNDERLAY_VIEWPATH_PREFIX,
                  app: cowc.APP_CONTRAIL_CONTROLLER,
                  viewConfig: {

                  }
              }
          ];
        };

        self.getUnderlayPRouterLinkTabConfig = function () {
            return [
                {
                    elementId: ctwc.UNDERLAY_TRAFFICSTATS_TAB_ID,
                    title: ctwl.UNDERLAY_TRAFFIC_STATISTICS,
                    view: "TrafficStatisticsView",
                    viewPathPrefix:
                        ctwl.UNDERLAY_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: {

                    }
                }
            ];
        };

        self.getPortDistChartOptions = function() {
            return {
                xLabel: ctwl.X_AXIS_TITLE_PORT,
                yLabel: ctwl.Y_AXIS_TITLE_BW,
                forceX: [0, 1000],
                forceY: [0, 1000],
                tooltipConfigCB: ctwgrc.getPortDistributionTooltipConfig(onScatterChartClick),
                controlPanelConfig: {
                    filter: {
                        enable: true,
                        viewConfig: getControlPanelFilterConfig()
                    },
                    legend: {
                        enable: true,
                        viewConfig: getControlPanelLegendConfig()
                    }
                },
                clickCB: onScatterChartClick,
                sizeFieldName: 'flowCnt',
                xLabelFormat: d3.format(','),
                yLabelFormat: function (yValue) {
                    var formattedValue = formatBytes(yValue, false, null, 1);
                    return formattedValue;
                },
                margin: {left: 70},
                noDataMessage: cowm.DATA_SUCCESS_EMPTY
            }
        };

        self.getVRouterDetailsPageTabs = function (viewConfig) {
            return [
                {
                    elementId: 'vrouter_detail_tab_id',
                    title: 'Details',
                    view: "VRouterDetailPageView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig
                },{
                    elementId: 'vrouter_interfaces_tab_id',
                    title: 'Interfaces',
                    view: "VRouterInterfacesFormView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: $.extend({},viewConfig,{
                        widgetConfig: {
                            elementId: ctwl.VROUTER_INTERFACES_GRID_ID + '-widget',
                            view: "WidgetView",
                            viewConfig: {
                                header: {
                                    title: ctwl.VROUTER_TAB_SEARCH_PREFIX +
                                        ' ' + ctwl.VROUTER_INTERFACES_TITLE,
                                    // iconClass: "icon-search"
                                },
                                controls: {
                                    top: {
                                        default: {
                                            collapseable: true,
                                            collapsedOnLoad:true
                                        }
                                    }
                                }
                            }
                        }
                    })
                },{
                    elementId: 'vrouter_networks_tab_id',
                    title: 'Networks',
                    view: "VRouterNetworksFormView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: $.extend({},viewConfig,{
                        widgetConfig: {
                            elementId: ctwl.VROUTER_NETWORKS_GRID_ID + '-widget',
                            view: "WidgetView",
                            viewConfig: {
                                header: {
                                    title: ctwl.VROUTER_TAB_SEARCH_PREFIX + ' ' + ctwl.VROUTER_NETWORKS_TITLE,
                                    // iconClass: "icon-search"
                                },
                                controls: {
                                    top: {
                                        default: {
                                            collapseable: true,
                                            collapsedOnLoad:true
                                        }
                                    }
                                }
                            }
                        }
                    })
                },{
                    elementId: 'vrouter_acl_tab_id',
                    title: 'ACL',
                    view: "VRouterACLFormView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: $.extend({},viewConfig,{
                        widgetConfig: {
                            elementId: ctwl.VROUTER_ACL_GRID_ID + '-widget',
                            view: "WidgetView",
                            viewConfig: {
                                header: {
                                    title: ctwl.VROUTER_TAB_SEARCH_PREFIX +
                                        ' ' + ctwl.VROUTER_ACL_TITLE,
                                    // iconClass: "icon-search"
                                },
                                controls: {
                                    top: {
                                        default: {
                                            collapseable: true,
                                            collapsedOnLoad:true
                                        }
                                    }
                                }
                            }
                        }
                    })
                },{
                    elementId: 'vrouter_flows_tab_id',
                    title: 'Flows',
                    view: "VRouterFlowsFormView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig
                },{
                    elementId: 'vrouter_routes_tab_id',
                    title: 'Routes',
                    view: "VRouterRoutesFormView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig
                },{
                    elementId: 'vrouter_virtualmachines',
                    title: 'Instances',
                    view: "VRouterVirtualMachinesGridView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig
                }
            ]
        };
        self.getDetailRowInstanceTemplateConfig = function () {
            return {
                templateGenerator: 'RowSectionTemplateGenerator',
                templateGeneratorConfig: {
                    rows: [
                        {
                            templateGenerator: 'ColumnSectionTemplateGenerator',
                            templateGeneratorConfig: {
                                columns: [
                                    {
                                        class: 'span6',
                                        rows: [{
                                            title: ctwl.TITLE_INSTANCE_DETAILS,
                                            templateGenerator:
                                                'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'uuid',
                                                    templateGenerator:
                                                        'TextGenerator'
                                                },{
                                                    key: 'vRouter',
                                                    templateGenerator:
                                                        'LinkGenerator',
                                                    templateGeneratorConfig: {
                                                        template:
                                                            ctwc.URL_VROUTER,
                                                        params: {}
                                                    }
                                                },{
                                                    key: 'vn',
                                                    templateGenerator:
                                                        'TextGenerator'
                                                },{
                                                    key: 'ip',
                                                    templateGenerator:
                                                        'TextGenerator'
                                                },{
                                                    key: 'intfCnt',
                                                    templateGenerator:
                                                        'TextGenerator'
                                             }]
                                       }]
                                    },
                                    {
                                        class: 'span6',
                                        rows: [{
                                            title: ctwl.TITLE_CPU_MEMORY_INFO,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'value.UveVirtualMachineAgent.cpu_info.cpu_one_min_avg',
                                                    templateGenerator: 'TextGenerator'
                                                },{
                                                    key: 'value.UveVirtualMachineAgent.cpu_info.rss',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'kilo-byte'
                                                    }
                                                },{
                                                    key: 'value.UveVirtualMachineAgent.cpu_info.vm_memory_quota',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'kilo-byte'
                                                    }
                                                }
                                             ]
                                        }]
                                    }
                                ]
                            }
                        }
                    ]
                }
            };
        };
    };

    function getInstanceCPUMemModelConfig(networkFQN, instanceUUID) {
        var postData = {
            async: false,
            fromTimeUTC: "now-120m",
            toTimeUTC: "now",
            select: "Source, T, cpu_stats.cpu_one_min_avg, cpu_stats.rss, name",
            table: "StatTable.VirtualMachineStats.cpu_stats",
            where: "(name = " + instanceUUID + ")"
        };

        var modelConfig = {
            remote: {
                ajaxConfig: {
                    url: ctwc.URL_QUERY,
                    type: 'POST',
                    data: JSON.stringify(postData)
                },
                dataParser: function (response) {
                    return response['data']
                }
            },
            cacheConfig: {
                ucid: ctwc.get(ctwc.UCID_INSTANCE_CPU_MEMORY_LIST, networkFQN, instanceUUID)
            }
        };

        return modelConfig;
    };

    function onScatterChartClick(chartConfig) {
        var hashParams= {
            fqName:chartConfig['fqName'],
            port:chartConfig['range'],
            type: 'flow',
            view: 'list'
        };

        if(chartConfig['startTime'] != null && chartConfig['endTime'] != null) {
            hashParams['startTime'] = chartConfig['startTime'];
            hashParams['endTime'] = chartConfig['endTime'];
        }

        if(chartConfig['type'] == 'sport') {
            hashParams['portType'] = 'src';
        } else if(chartConfig['type'] == 'dport') {
            hashParams['portType'] = 'dst';
        }

        if(contrail.checkIfExist(chartConfig['ipAddress'])) {
            hashParams['ip'] = chartConfig['ipAddress'];
        }

        layoutHandler.setURLHashParams(hashParams, {p:"mon_networking_networks", merge:false});
    };

    function getControlPanelFilterConfig() {
        return {
            groups: [
                {
                    id: 'by-node-color',
                    title: false,
                    type: 'checkbox-circle',
                    items: [
                        {
                            text: 'Source Port',
                            labelCssClass: 'default',
                            filterFn: function(d) { return d.type === 'sport'; }
                        },
                        {
                            text: 'Destination Port',
                            labelCssClass: 'medium',
                            filterFn: function(d) { return d.type === 'dport'; }
                        }
                    ]
                }
            ]
        };
    };

    function getControlPanelLegendConfig() {
        return {
            groups: [
                {
                    id: 'by-node-color',
                    title: 'Port Type',
                    items: [
                        {
                            text: 'Source Port',
                            labelCssClass: 'icon-circle default',
                            events: {
                                click: function (event) {}
                            }
                        },
                        {
                            text: 'Destination Port',
                            labelCssClass: 'icon-circle medium',
                            events: {
                                click: function (event) {}
                            }
                        }
                    ]
                },
                {
                    id: 'by-node-size',
                    title: 'Port Size',
                    items: [
                        {
                            text: 'Flow Count',
                            labelCssClass: 'icon-circle',
                            events: {
                                click: function (event) {}
                            }
                        }
                    ]
                }
            ]
        };
    };

    return CTViewConfig;
});
