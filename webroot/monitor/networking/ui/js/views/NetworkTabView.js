/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var NetworkTabView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;

            self.renderView4Config(self.$el, null, getNetworkViewConfig(viewConfig));
        }
    });

    var getNetworkViewConfig = function (viewConfig) {
        var networkFQN = viewConfig['networkFQN'],
            networkUUID = viewConfig['networkUUID'],
            networkDetailsUrl = ctwc.get(ctwc.URL_NETWORK_SUMMARY, networkFQN);

        return {
            elementId: ctwl.NETWORK_TABS_ID,
            view: "TabsView",
            viewConfig: {
                theme: 'classic',
                active: 1,
                tabs: [
                    {
                        elementId: ctwl.NETWORK_DETAILS_ID,
                        title: ctwl.TITLE_DETAILS,
                        view: "DetailsView",
                        viewConfig: {
                            ajaxConfig: {
                                url: networkDetailsUrl,
                                type: 'GET'
                            },
                            templateConfig: getDetailsViewTemplateConfig(),
                            app: cowc.APP_CONTRAIL_CONTROLLER,
                            dataParser: function (response) {
                                return (!$.isEmptyObject(response)) ? response['value'][0] : response;
                            }
                        }
                    },
                    {
                        elementId: ctwl.NETWORK_INSTANCES_ID,
                        title: ctwl.TITLE_INSTANCES,
                        view: "InstanceGridView",
                        viewPathPrefix: "monitor/networking/ui/js/views/",
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        tabConfig: {
                            activate: function(event, ui) {
                                if ($('#' + ctwl.PROJECT_INSTANCE_GRID_ID).data('contrailGrid')) {
                                    $('#' + ctwl.PROJECT_INSTANCE_GRID_ID).data('contrailGrid').refreshView();
                                }
                            }
                        },
                        viewConfig: {
                            parentUUID: networkUUID,
                            parentFQN: networkFQN,
                            parentType: ctwc.TYPE_VN
                        }
                    },
                    {
                        elementId: ctwl.NETWORK_INTERFACES_ID,
                        title: ctwl.TITLE_INTERFACES,
                        view: "InterfaceGridView",
                        viewPathPrefix: "monitor/networking/ui/js/views/",
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        tabConfig: {
                            activate: function(event, ui) {
                                if ($('#' + ctwl.NETWORK_INTERFACE_GRID_ID).data('contrailGrid')) {
                                    $('#' + ctwl.NETWORK_INTERFACE_GRID_ID).data('contrailGrid').refreshView();
                                }
                            },
                            renderOnActivate: true
                        },
                        viewConfig: {
                            parentType: ctwc.TYPE_VIRTUAL_NETWORK,
                            networkFQN: networkFQN,
                            networkUUID: networkUUID,
                            elementId: ctwl.NETWORK_INTERFACE_GRID_ID
                        }
                    },
                    {
                        elementId: ctwl.NETWORK_TRAFFIC_STATS_ID,
                        title: ctwl.TITLE_TRAFFIC_STATISTICS,
                        view: "LineWithFocusChartView",
                        tabConfig: {
                            activate: function(event, ui) {
                                $('#' + ctwl.NETWORK_TRAFFIC_STATS_ID).find('svg').trigger('refresh');
                            }
                        },
                        viewConfig: {
                            modelConfig: {
                                remote: {
                                    ajaxConfig: {
                                        url: ctwc.get(ctwc.URL_NETWORK_TRAFFIC_STATS, 120, networkFQN, 120),
                                        type: 'GET'
                                    },
                                    dataParser: nmwp.vnTrafficStatsParser
                                },
                                cacheConfig: {
                                    ucid: ctwc.get(ctwc.UCID_NETWORK_TRAFFIC_STATS_LIST, networkFQN)
                                }
                            },
                            parseFn: ctwp.parseTrafficLineChartData
                        }
                    },
                    {
                        elementId: ctwl.NETWORK_PORT_DIST_ID,
                        title: ctwl.TITLE_PORT_DISTRIBUTION,
                        view: "ZoomScatterChartView",
                        tabConfig: {
                            activate: function(event, ui) {
                                $('#' + ctwl.NETWORK_PORT_DIST_ID).trigger('refresh');
                            },
                            visible: cowu.isAdmin()
                        },
                        viewConfig: {
                            modelConfig: {
                                remote: {
                                    ajaxConfig: {
                                        url: ctwc.get(ctwc.URL_NETWORK_PORT_DISTRIBUTION, networkFQN),
                                        type: 'GET'
                                    },
                                    dataParser: function (response) {
                                        return ctwp.parseNetwork4PortDistribution(response, networkFQN);
                                    }
                                },
                                cacheConfig: {
                                    ucid: ctwc.get(ctwc.UCID_PROJECT_VN_PORT_STATS_LIST, networkFQN)
                                }
                            },
                            chartOptions: ctwvc.getPortDistChartOptions()
                        }
                    },
                    {
                        elementId: ctwl.NETWORK_PORT_HEAT_CHART_ID,
                        title: ctwl.TITLE_PORT_MAP,
                        view: "HeatChartView",
                        viewConfig: {
                            ajaxConfig: {
                                url: ctwc.get(ctwc.URL_NETWORK_SUMMARY, networkFQN),
                                type: 'GET'
                            },
                            chartOptions: {getClickFn: ctwvc.getHeatChartClickFn}
                        }
                    }
                ]
            }
        };
    };

    function getDetailsViewTemplateConfig() {
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
                                    rows: [
                                        {
                                            title: ctwl.TITLE_NETWORK_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'value.UveVirtualNetworkConfig.connected_networks',
                                                    templateGenerator: 'LinkGenerator',
                                                    templateGeneratorConfig: {
                                                        template: ctwc.URL_NETWORK,
                                                        params: {}
                                                    }
                                                },
                                                {
                                                    key: 'value.UveVirtualNetworkAgent.acl',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'value.UveVirtualNetworkAgent.total_acl_rules',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'value.UveVirtualNetworkAgent.virtualmachine_list',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'length'
                                                    }
                                                },
                                                {
                                                    key: 'value.UveVirtualNetworkAgent.interface_list',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'length'
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    class: 'col-xs-6',
                                    rows: [
                                        {
                                            title: ctwl.TITLE_TRAFFIC_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'value.UveVirtualNetworkAgent.ingress_flow_count',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'value.UveVirtualNetworkAgent.egress_flow_count',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'value.UveVirtualNetworkAgent.in_bytes',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'byte'
                                                    }
                                                },
                                                {
                                                    key: 'value.UveVirtualNetworkAgent.out_bytes',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'byte'
                                                    }
                                                }
                                            ]
                                        }
                                    ]
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
                                    rows: [
                                        {
                                            title: ctwl.TITLE_VRF_STATS,
                                            key: 'value.UveVirtualNetworkAgent.vrf_stats_list',
                                            templateGenerator: 'BlockGridTemplateGenerator',
                                            templateGeneratorConfig: {
                                                titleColumn: {
                                                    key: 'name',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                dataColumn: [
                                                    {
                                                        key: 'name',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'encaps',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'l2_encaps',
                                                        templateGenerator: 'TextGenerator'
                                                    }

                                                ]
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }
        };
    };

    return NetworkTabView;
});
