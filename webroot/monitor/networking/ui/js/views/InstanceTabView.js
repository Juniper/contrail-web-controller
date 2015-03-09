/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var InstanceTabView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig,
                modelMap = this.modelMap;

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
                                    activate: function (e, ui) {
                                        var selTab = $(ui.newTab.context).text();
                                        if (selTab == ctwl.TITLE_TRAFFIC_STATISTICS) {
                                            $('#' + ctwl.INSTANCE_TRAFFIC_STATS_ID).find('svg').trigger('refresh');
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
                                            elementId: ctwl.INSTANCE_TRAFFIC_STATS_ID,
                                            title: ctwl.TITLE_TRAFFIC_STATISTICS,
                                            app: cowc.APP_CONTRAIL_CONTROLLER,
                                            view: "InstanceTrafficStatsView",
                                            viewConfig: {
                                                modelKey: ctwc.get(ctwc.UMID_INSTANCE_UVE, instanceUUID),
                                                instanceUUID: instanceUUID,
                                                parseFn: ctwp.parseLineChartData
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
                                                    key: 'name',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'value.UveVirtualMachineAgent.vrouter',
                                                    templateGenerator: 'TextGenerator'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    class: 'span6',
                                    rows: [
                                        {
                                            title: ctwl.TITLE_CPU_INFO,
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
                    },
                    {
                        templateGenerator: 'ColumnSectionTemplateGenerator',
                        templateGeneratorConfig: {
                            columns: [
                                {
                                    class: 'span12',
                                    rows: [
                                        {
                                            templateGenerator: 'BlockGridTemplateGenerator',
                                            title: ctwl.TITLE_INTERFACES,
                                            key: 'value.UveVirtualMachineAgent.interface_list',
                                            templateGeneratorConfig: {
                                                titleColumn: {
                                                    key: 'uuid',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                dataColumn: [
                                                    {
                                                        key: 'name',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'uuid',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'mac_address',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'ip_address',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'ip6_address',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'label',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'Gateway',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'active',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'l2_active',
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

    return InstanceTabView;
});
