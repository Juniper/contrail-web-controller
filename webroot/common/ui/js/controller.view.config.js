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
            var allTabs = [
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
                    app: cowc.APP_CONTRAIL_CONTROLLER,
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
                    viewConfig: {
                        modelKey: ctwc.get(ctwc.UMID_INSTANCE_UVE, instanceUUID),
                        instanceUUID: instanceUUID,
                        parseFn: ctwp.parseLineChartData
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
                        chartOptions: {getClickFn: self.getHeatChartClickFn}
                    }
                }
            ];
            if (tabsToDisplay == null) {
                tabObjs = allTabs;
            } else if (typeof tabsToDisplay == 'string' || $.isArray(tabsToDisplay)) {
                if (typeof tabsToDisplay == 'string') {
                    tabsToDisplay = [tabsToDisplay];
                }
                for (var i = 0; i < tabsToDisplay.length; i++) {
                    $.each(allTabs, function (idx, obj) {
                        if (obj['view'] == tabsToDisplay[i])
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
                                        activate: function (e, ui) {
                                            var selTab = $(ui.newTab.context).text();
                                            if (selTab == ctwl.TITLE_TRAFFIC_STATISTICS) {
                                                $('#' + ctwl.INSTANCE_TRAFFIC_STATS_ID).find('svg').trigger('refresh');
                                            } else if (selTab == ctwl.TITLE_INTERFACES) {
                                                $('#' + ctwl.INSTANCE_INTERFACE_GRID_ID).data('contrailGrid').refreshView();
                                            }
                                        },
                                        tabs: tabObjs
                                    }
                                }
                            ]
                        }
                    ]
                }
            }

        };

        self.getHeatChartClickFn = function (selector, response) {
            // TODO: Implement click out function for instance port map
            return function (clickData) {
            }
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
                    dataParser: function (response) {
                        return {name: instanceUUID, value: response};
                    }
                },
                vlRemoteConfig: {
                    vlRemoteList: ctwgc.getVMInterfacesLazyRemoteConfig()
                }
            };

            return new ContrailViewModel(viewModelConfig);
        };

        self.getMNConnnectedGraphConfig = function (url, elementNameObject, keySuffix, type) {
            var graphConfig = {
                remote: {
                    ajaxConfig: {
                        url: url,
                        type: 'GET'
                    }
                },
                cacheConfig: {
                    ucid: ctwc.UCID_PREFIX_MN_GRAPHS + elementNameObject.fqName + keySuffix
                },
                focusedElement: {
                    type: type,
                    name: elementNameObject
                }
            };

            if (type == ctwc.GRAPH_ELEMENT_NETWORK || type == ctwc.GRAPH_ELEMENT_INSTANCE) {
                graphConfig['vlRemoteConfig'] = {
                    vlRemoteList: ctwgc.getNetworkVMDetailsLazyRemoteConfig()
                };
            }

            return graphConfig;
        };
    };

    return CTViewConfig;
});