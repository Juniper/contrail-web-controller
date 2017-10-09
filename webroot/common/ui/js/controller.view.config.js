/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    "protocol",
    'contrail-view-model',
    'core-basedir/reports/qe/ui/js/common/qe.utils'
], function (_, protocolUtils, ContrailViewModel, qeUtils) {
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
                elementId: ctwl.INSTANCE_TABS_ID,
                view: "TabsView",
                viewConfig: {
                    theme: 'classic',
                    active: 1,
                    tabs: tabObjs
                }
            };
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
                            parentType: ctwc.TYPE_VIRTUAL_MACHINE,
                            modelKey: ctwc.get(ctwc.UMID_INSTANCE_UVE, instanceUUID),
                            instanceUUID: instanceUUID,
                            networkFQN: networkFQN,
                            elementId: ctwl.INSTANCE_INTERFACE_GRID_ID
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
                                forceY1: [0, 0.5]
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
                    hashParams = {};

                hashParams['fqName'] = currHashObj['q']['fqName'];
                hashParams['port'] = startRange + "-" + endRange;
                hashParams['startTime'] = new XDate().addMinutes(-10).getTime();
                hashParams['endTime'] = new XDate().getTime();
                hashParams['portType'] = response['type'];
                hashParams['protocol'] = protocolUtils.getProtocolCode(response['pType']);
                hashParams['type'] = "flow";
                hashParams['view'] = "list";

                layoutHandler.setURLHashParams(hashParams, {p: 'mon_networking_networks'});
            }
        };

        self.getDomainBreadcrumbDropdownViewConfig = function (hashParams, customDomainDropdownOptions) {
            var urlValue = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.fqName') ? hashParams.focusedElement.fqName : null),
                defaultDropdownoptions = {
                    urlValue: (urlValue !== null) ? urlValue.split(':').splice(0,1).join(':') : null,
                    cookieKey: cowc.COOKIE_DOMAIN_DISPLAY_NAME,
                    preSelectCB : function(selectedValueData) {
                        var domainDispName =
                            getValueByJsonPath(selectedValueData, "display_name");
                        var domainFqn = getValueByJsonPath(selectedValueData,
                                                           "fq_name",
                                                           domainDispName);
                        if (null != domainFqn) {
                            contrail.setCookie(cowc.COOKIE_DOMAIN, domainFqn);
                        }
                    }
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
        self.getGlobalSysConfigBCDropdownViewConfig =
            function (hashParams, customDropdownOptions) {
            var urlValue =
                (contrail.checkIfKeyExistInObject(true,
                                                  hashParams,
                                                  'focusedElement.fqName') ?
                 hashParams.focusedElement.fqName : null),
                defaultDropdownoptions = {
                    urlValue: (urlValue !== null) ? urlValue.split(':').splice(0,1).join(':') : null,
                    cookieKey: 'globalSystemConfig'
                },
                dropdownOptions =
                    $.extend(true, {}, defaultDropdownoptions,
                             customDropdownOptions);

            return {
                elementId: ctwl.GLOBALSYS_BREADCRUMB_DROPDOWN,
                view: "BreadcrumbDropdownView",
                viewConfig: {
                    modelConfig: ctwu.getGlobalSysConfigListModelConfig(),
                    dropdownOptions: dropdownOptions
                }
            };
        };

        self.getSASetBCDropdownViewConfig = function (hashParams,
                                                      customDropDownOptions) {
            var urlValue =
                (contrail.checkIfKeyExistInObject(true, hashParams,
                                                  'focusedElement.fqName') ?
                 hashParams.focusedElement.fqName : null),
                defaultDropdownoptions = {
                    urlValue: (urlValue !== null) ?
                                  urlValue.split(':').splice(0,1).join(':') :
                                  null,
                    cookieKey: 'serviceApplSet'
                },
                dropdownOptions =
                    $.extend(true, {}, defaultDropdownoptions,
                             customDropDownOptions);
            return {
                elementId: ctwl.SASET_BREADCRUMB_DROPDOWN,
                view: "BreadcrumbDropdownView",
                viewConfig: {
                    modelConfig: ctwu.getSASetListModelConfig(),
                    dropdownOptions: dropdownOptions
                }
            }
        }

        self.getProjectBreadcrumbDropdownViewConfig = function(hashParams, customProjectDropdownOptions) {
            var urlValue = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.fqName') ? hashParams.focusedElement.fqName : null);
            var firstRegion = ctwu.getRegionList()[0];
            var currentCookie =  contrail.getCookie('region');
            var url;
            return function(domainSelectedValueData) {

                var defaultDropdownOptions = {
                        urlValue: (urlValue !== null) ? urlValue.split(':').splice(1, 1).join(':') : null,
                        cookieKey: cowc.COOKIE_PROJECT_DISPLAY_NAME,
                        parentSelectedValueData: domainSelectedValueData,
                        preSelectCB : function(selectedValueData) {
                            var projDispName =
                                getValueByJsonPath(selectedValueData,
                                                   "display_name");
                            if (null != projDispName) {
                                projDispName = projDispName + ":" +
                                    projDispName;
                            }
                            var projFqn = getValueByJsonPath(selectedValueData,
                                                             "fq_name",
                                                             projDispName);
                            if (null != projFqn) {
                                projFqnArr = projFqn.split(":");
                                projFqn = projFqnArr[1];
                                contrail.setCookie(cowc.COOKIE_PROJECT,
                                                   projFqn);
                            }
                            if(getValueByJsonPath(selectedValueData,'value') != null) {
                                if(currentCookie === cowc.GLOBAL_CONTROLLER_ALL_REGIONS){
                                    url = '/api/tenants/get-project-role?id='+
                                    selectedValueData['value'] +
                                    '&project=' +
                                    selectedValueData['display_name']+'&reqRegion='+firstRegion
                                }
                                else{
                                    url = '/api/tenants/get-project-role?id='+
                                    selectedValueData['value'] +
                                    '&project=' +
                                    selectedValueData['display_name'];
                                }
                                return $.ajax({
                                            type:"GET",
                                            url:url
                                        });
                            } else {
                                var defObj = $.Deferred();
                                defObj.resolve();
                                return defObj;
                            }
                        }
                    },
                    dropdownOptions = $.extend(true, {}, defaultDropdownOptions, customProjectDropdownOptions);

                return {
                    elementId: ctwl.PROJECTS_BREADCRUMB_DROPDOWN,
                    view: "BreadcrumbDropdownView",
                    viewConfig: {
                        modelConfig:
                            ctwu.getProjectListModelConfig(domainSelectedValueData,
                                                           dropdownOptions),
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
                        viewConfig: {
                            model: viewConfig.model
                        },
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
                        viewConfig: {
                            model: viewConfig.model
                        },
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
                    },
                    tabConfig: {
                        activate: function (event, ui){
                            if($("#"+ ctwc.TRACEFLOW_RESULTS_GRID_ID).data('contrailGrid') != null) {
                                $("#"+ ctwc.TRACEFLOW_RESULTS_GRID_ID).data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: false
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
                  viewConfig: {},
                  tabConfig: {
                      activate: function (event, ui) {
                          if ($('#' + ctwc.UNDERLAY_DETAILS_TAB_ID)) {
                              $('#' + ctwc.UNDERLAY_DETAILS_TAB_ID).trigger('refresh');
                          }
                      },
                      renderOnActivate: false
                  }
              }, {
                  elementId: ctwc.UNDERLAY_PROUTER_INTERFACE_TAB_ID,
                  title: ctwl.UNDERLAY_PROUTER_INTERFACES_TITLE,
                  view: "PRouterInterfaceView",
                  viewPathPrefix:
                      ctwl.UNDERLAY_VIEWPATH_PREFIX,
                  app: cowc.APP_CONTRAIL_CONTROLLER,
                  viewConfig: {},
                  tabConfig: {
                      activate: function (event, ui){
                          if($("#"+ ctwc.UNDERLAY_PROUTER_INTERFACE_TAB_ID).
                               data('contrailGrid') != null) {
                              $("#"+ ctwc.UNDERLAY_PROUTER_INTERFACE_TAB_ID).
                                  data('contrailGrid').refreshView();
                          }
                      },
                      renderOnActivate: false
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
                        iconClass: 'fa fa-filter',
                        title: 'Filter',
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
            var tabViewConfig = [
                {
                    elementId: 'vrouter_detail_tab_id',
                    title: 'Details',
                    view: "VRouterDetailPageView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig,
                    tabConfig: {
                        activate: function(event, ui) {
                            if ($('#' + ctwl.VROUTER_DETAIL_PAGE_ID)) {
                                $('#' + ctwl.VROUTER_DETAIL_PAGE_ID).trigger('refresh');
                            }
                        }
                    }
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
                    }),
                    tabConfig: {
                        activate: function(event, ui) {
                            if ($('#' + ctwl.VROUTER_INTERFACES_GRID_ID).data('contrailGrid')) {
                                $('#' + ctwl.VROUTER_INTERFACES_GRID_ID).data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: true
                    }
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
                    }),
                    tabConfig: {
                        activate: function(event, ui) {
                            if ($('#' + ctwl.VROUTER_NETWORKS_GRID_ID).data('contrailGrid')) {
                                $('#' + ctwl.VROUTER_NETWORKS_GRID_ID).
                                    data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: true
                    }
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
                    }),
                    tabConfig: {
                        activate: function(event, ui) {
                            if ($('#' + ctwl.VROUTER_ACL_GRID_ID).data('contrailGrid')) {
                                $('#' + ctwl.VROUTER_ACL_GRID_ID).
                                    data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: true
                    }
                },{
                    elementId: 'vrouter_flows_tab_id',
                    title: 'Flows',
                    view: "VRouterFlowsFormView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig,
                    tabConfig: {
                        activate: function(event, ui) {
                            if ($('#' + ctwl.VROUTER_FLOWS_GRID_ID).data('contrailGrid')) {
                                $('#' + ctwl.VROUTER_FLOWS_GRID_ID).
                                    data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: true
                    }
                },{
                    elementId: 'vrouter_routes_tab_id',
                    title: 'Routes',
                    view: "VRouterRoutesFormView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig,
                    tabConfig: {
                        activate: function(event, ui) {
                            if ($('#' + ctwl.VROUTER_ROUTES_GRID_ID).data('contrailGrid')) {
                                $('#' + ctwl.VROUTER_ROUTES_GRID_ID).
                                    data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: true
                    }
                },{
                    elementId: ctwl.VROUTER_CONSOLE_LOGS_VIEW_ID,
                    title: 'Console',
                    view: "NodeConsoleLogsView",
                    viewConfig: $.extend(viewConfig,
                            {nodeType:monitorInfraConstants.COMPUTE_NODE}),
                    tabConfig: {
                        activate: function(event, ui) {
                            if ($('#' + cowl.QE_SYSTEM_LOGS_GRID_ID).data('contrailGrid')) {
                                $('#' + cowl.QE_SYSTEM_LOGS_GRID_ID).
                                    data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: true
                    }
                },{
                    elementId:
                        ctwl.VROUTER_ALARMS_GRID_VIEW_ID,
                    title: 'Alarms',
                    view: "VRouterAlarmGridView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig,
                    tabConfig: {
                        activate: function(event, ui) {
                            if ($('#' + ctwl.ALARMS_GRID_ID).data('contrailGrid')) {
                                $('#' + ctwl.ALARMS_GRID_ID).
                                    data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: true
                    }
                }
            ];
            var vRouterType = viewConfig['vRouterType'];
            if (vRouterType != null && vRouterType.indexOf('hypervisor') > -1 ) {
                var instanceTabViewConfig = {
                    elementId: 'vrouter_virtualmachines',
                    title: 'Instances',
                    view: "VRouterVirtualMachinesGridView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig,
                    tabConfig: {
                        activate: function(event, ui) {
                            if ($('#' + ctwl.VROUTER_INSTANCE_GRID_ID).data('contrailGrid')) {
                                $('#' + ctwl.VROUTER_INSTANCE_GRID_ID).
                                    data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: true
                    }
                };
                tabViewConfig.splice(6,0,instanceTabViewConfig);
            }
            return tabViewConfig;
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
                                        class: 'col-xs-6',
                                        rows: [{
                                            title: ctwl.TITLE_INSTANCE_DETAILS,
                                            templateGenerator:
                                                'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'uuid',
                                                    templateGenerator: 'TextGenerator'
                                                },{
                                                    key: "name",
                                                    label: "FQN",
                                                    templateGenerator: "TextGenerator"
                                                },{
                                                    key: 'vRouter',
                                                    templateGenerator: 'LinkGenerator',
                                                    templateGeneratorConfig: {
                                                        template: ctwc.URL_VROUTER,
                                                        params: {}
                                                    }
                                                },{
                                                    key: 'vn',
                                                    templateGenerator: 'TextGenerator'
                                                },{
                                                    key: 'ip',
                                                    templateGenerator: 'TextGenerator'
                                                },{
                                                    key: 'intfCnt',
                                                    templateGenerator: 'TextGenerator'
                                             }]
                                       }]
                                    },
                                    {
                                        class: 'col-xs-6',
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
                        },
                        {
                            templateGenerator: 'ColumnSectionTemplateGenerator',
                            templateGeneratorConfig: {
                                columns: [
                                    {
                                        class: 'col-xs-12',
                                        rows: [{
                                            title: 'Interface Details',
                                            key: 'value.UveVirtualMachineAgent.interface_details',
                                            templateGenerator: 'BlockArrayListTemplateGenerator',
                                            templateGeneratorConfig: {
                                                titleColumn: {
                                                    key: 'name',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                dataColumn: [
                                                    {
                                                        key: 'active',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'status-boolean'
                                                        }
                                                    },
                                                    {
                                                        key: 'ip',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'mac_address',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'virtual_network',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'floatingIP',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'is_health_check_active',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'status-boolean'
                                                        }
                                                    },
                                                    {
                                                        key: 'health_check_instance_list',
                                                        templateGenerator: 'BlockGridTemplateGenerator',
                                                        templateGeneratorConfig: {
                                                            dataColumn: [
                                                                {
                                                                    key: 'uuid',
                                                                    templateGenerator: 'TextGenerator',
                                                                    templateGeneratorConfig: {
                                                                        width: 100
                                                                    }
                                                                },
                                                                {
                                                                    key: 'name',
                                                                    templateGenerator: 'TextGenerator',
                                                                    templateGeneratorConfig: {
                                                                        width: 90
                                                                    }
                                                                },
                                                                {
                                                                    key: 'status',
                                                                    templateGenerator: 'TextGenerator',
                                                                    templateGeneratorConfig: {
                                                                        width: 45
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        }]
                                    }
                                ]
                            }
                        }
                    ]
                }
            };
        };

        self.getTimeRangeConfig = function (format, addSinceOption) {
            var dropdownOptions = ctwc.TIMERANGE_DROPDOWN_VALUES;
            if(addSinceOption) {
                dropdownOptions = dropdownOptions
                            .concat(ctwc.TIMERANGE_DROPDOWN_ADDITIONAL_VALUES);
            }
            var timeRangeConfig = {
                columns: [
                    {
                        elementId: 'time_range',
                        view: "FormDropdownView",
                        viewConfig: {
                            path: 'time_range',
                            dataBindValue: 'time_range',
                            class: "col-xs-4",
                            elementConfig: {
                                dataTextField: "text",
                                dataValueField: "id",
                                data: dropdownOptions
                            }
                        }
                    },{
                        elementId: 'from_time',
                        view: "FormDateTimePickerView",
                        viewConfig: {
                            style: 'display: none;',
                            path: 'from_time',
                            dataBindValue: 'from_time',
                            class: "col-xs-4",
                            elementConfig:
                                qeUtils.getFromTimeElementConfig('from_time', 'to_time', format),
                            visible: "time_range() == -1 || time_range() == -2"
                        }
                    },{
                        elementId: 'to_time',
                        view: "FormDateTimePickerView",
                        viewConfig: {
                            style: 'display: none;',
                            path: 'to_time',
                            dataBindValue: 'to_time',
                            class: "col-xs-4",
                            elementConfig:
                                qeUtils.getToTimeElementConfig('from_time', 'to_time', format),
                            visible: "time_range() == -1"
                        }
                    }
                ]
            };
            return timeRangeConfig;
        };
    };

    function getInstanceCPUMemModelConfig(networkFQN, instanceUUID) {
        var where = "(name = " + instanceUUID + ")";
        var table = "StatTable.VirtualMachineStats.cpu_stats";
        var qObj = {table: table, minsSince: "120", where: where};
        var postData = qeUtils.formatQEUIQuery(qObj);

        var modelConfig = {
            remote: {
                ajaxConfig: {
                    url: cowc.URL_QE_QUERY,
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
                            labelCssClass: 'fa fa-circle default',
                            events: {
                                click: function (event) {}
                            }
                        },
                        {
                            text: 'Destination Port',
                            labelCssClass: 'fa fa-circle medium',
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
                            labelCssClass: 'fa fa-circle',
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
