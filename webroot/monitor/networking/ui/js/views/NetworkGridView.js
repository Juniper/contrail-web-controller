/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var NetworkGridView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                projectFQN = viewConfig['projectFQN'],
                pagerOptions = viewConfig['pagerOptions'];

            var networkRemoteConfig = {
                url: projectFQN != null ? ctwc.get(ctwc.URL_PROJECT_NETWORKS_IN_CHUNKS, 25, projectFQN, $.now()) : ctwc.get(ctwc.URL_NETWORKS_DETAILS_IN_CHUNKS, 25, $.now()),
                type: 'POST',
                data: JSON.stringify({
                    data: [{
                        "type": ctwc.TYPE_VIRTUAL_NETWORK,
                        "cfilt": ctwc.FILTERS_COLUMN_VN.join(',')
                    }]
                })
            };

            // TODO: Handle multi-tenancy
            var ucid = projectFQN != null ? (ctwc.UCID_PREFIX_MN_LISTS + projectFQN + ":virtual-networks") : ctwc.UCID_ALL_VN_LIST;

            cowu.renderView4Config(self.$el, self.model, getNetworkGridViewConfig(networkRemoteConfig, ucid, pagerOptions));

        }
    });

    var getNetworkGridViewConfig = function (networkRemoteConfig, ucid, pagerOptions) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_NETWORK_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECT_NETWORK_GRID_ID,
                                title: ctwl.TITLE_NETWORKS,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getProjectNetworkGridConfig(networkRemoteConfig, ucid, pagerOptions)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getProjectNetworkGridConfig = function (networkRemoteConfig, ucid, pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_NETWORKS_SUMMARY
                },
                defaultControls: {
                    collapseable: false,
                    exportable: true,
                    refreshable: true,
                    searchable: true
                }
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(getNetworkDetailsTemplateConfig(), cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {
                    remote: {
                        ajaxConfig: networkRemoteConfig,
                        dataParser: ctwp.networkDataParser
                    },
                    vlRemoteConfig: {
                        vlRemoteList: ctwgc.getVNDetailsLazyRemoteConfig(ctwc.TYPE_VIRTUAL_NETWORK)
                    },
                    cacheConfig: {
                        ucid: ucid
                    }
                }
            },
            columnHeader: {
                columns: ctwgc.projectNetworksColumns
            },
            footer: {
                pager: contrail.handleIfNull(pagerOptions, { options: { pageSize: 5, pageSizeSelect: [5, 10, 50, 100] } })
            }
        };
        return gridElementConfig;
    };


    function getNetworkDetailsTemplateConfig() {
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
                                            title: ctwl.TITLE_NETWORK_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'value.UveVirtualNetworkConfig.connected_networks',
                                                    templateGenerator: 'LinkGenerator',
                                                    templateGeneratorConfig: {
                                                        template: ctwc.URL_NETWORK,
                                                        params: {
                                                            fqName: 'value.UveVirtualNetworkConfig.connected_networks'
                                                        }
                                                    }
                                                },
                                                {
                                                    key: 'value.UveVirtualNetworkAgent.virtualmachine_list',
                                                    templateGenerator: 'LinkGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'link',
                                                        template: ctwc.URL_INSTANCE,
                                                        params: {
                                                            vn: 'name'
                                                        }
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
                                    class: 'span6',
                                    rows: [
                                        {
                                            title: ctwl.TITLE_TRAFFIC_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'throughput',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'throughput'
                                                    }
                                                },
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
                                                },
                                                {
                                                    key: 'in_tpkts',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'out_tpkts',
                                                    templateGenerator: 'TextGenerator'
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

    return NetworkGridView;
});
