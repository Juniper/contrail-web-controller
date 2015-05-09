/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-view-model'
], function (_, Backbone, ContrailViewModel) {
    var InstanceTabView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig,
                instanceUUID = viewConfig.instanceUUID,
                modelMap = contrail.handleIfNull(this.modelMap, {}),
                modelKey = ctwc.get(ctwc.UMID_INSTANCE_UVE, instanceUUID);

            var viewModelConfig = {
                modelKey: modelKey,
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_INSTANCE_SUMMARY, instanceUUID),
                        type: 'GET'
                    },
                    dataParser: function(response) {
                        return {name: instanceUUID, value: response};
                    }
                },
                vlRemoteConfig: {
                    vlRemoteList: ctwgc.getVMInterfacesLazyRemoteConfig()
                }
            };

            var contrailViewModel = new ContrailViewModel(viewModelConfig);
            modelMap[viewModelConfig['modelKey']] = contrailViewModel;

            cowu.renderView4Config(self.$el, null, getInstanceTabViewConfig(viewConfig), null, null, modelMap);
        }
    });

    function getInstanceTabViewConfig(viewConfig) {
        var instanceUUID = viewConfig['instanceUUID'],
            instanceDetailsUrl = ctwc.get(ctwc.URL_INSTANCE_SUMMARY, instanceUUID),
            networkFQN = viewConfig['networkFQN'];

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
                                    activate: function (e, ui) {
                                        var selTab = $(ui.newTab.context).text();
                                        if (selTab == ctwl.TITLE_TRAFFIC_STATISTICS) {
                                            $('#' + ctwl.INSTANCE_TRAFFIC_STATS_ID).find('svg').trigger('refresh');
                                        } else if (selTab == ctwl.TITLE_INTERFACES) {
                                            $('#' + ctwl.INSTANCE_INTERFACE_GRID_ID).data('contrailGrid').refreshView();
                                        }
                                    },
                                    tabs: [
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
                                                templateConfig: getInstanceDetailsTemplateConfig(),
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
                                                    url: ctwc.get(ctwc.URL_INSTANCE_SUMMARY, instanceUUID),
                                                    type: 'GET'
                                                },
                                                chartOptions: {getClickFn: getHeatChartClickFn}
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getInstanceDetailsTemplateConfig = function () {
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
                                    rows: [
                                        {
                                            title: ctwl.TITLE_INSTANCE_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'vm_name',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'value.UveVirtualMachineAgent.uuid',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'value.UveVirtualMachineAgent.vrouter',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'value.UveVirtualMachineAgent.interface_list',
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
                                    class: 'span6',
                                    rows: [
                                        {
                                            title: ctwl.TITLE_CPU_MEMORY_INFO,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'value.UveVirtualMachineAgent.cpu_info.cpu_one_min_avg',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'value.UveVirtualMachineAgent.cpu_info.rss',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'kilo-byte'
                                                    }
                                                },
                                                {
                                                    key: 'value.UveVirtualMachineAgent.cpu_info.vm_memory_quota',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'kilo-byte'
                                                    }
                                                }
                                            ]
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

    function getHeatChartClickFn (selector, response) {
        // TODO: Implement click out function for instance port map
        return function(clickData) {}
    };

    return InstanceTabView;
});
