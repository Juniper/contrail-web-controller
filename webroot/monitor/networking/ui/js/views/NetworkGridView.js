/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "underscore",
    "contrail-view",
    "core-basedir/reports/qe/ui/js/common/qe.utils"
], function (_, ContrailView, qeUtils) {
    var NetworkGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                projectSelectedValueData = viewConfig.projectSelectedValueData,
                projectFQN = viewConfig.projectFQN,
                projectUUID = viewConfig.projectUUID,
                pagerOptions = viewConfig['pagerOptions'];

            var networkRemoteConfig = {
                url: ctwc.get(ctwc.URL_GET_VIRTUAL_NETWORKS, 100, 1000, $.now()),
                type: 'POST',
                data: JSON.stringify({
                    id: qeUtils.generateQueryUUID(),
                    FQN: projectFQN,
                    fqnUUID: projectUUID
                })
            };

            // TODO: Handle multi-tenancy
            var ucid = projectFQN != null ? (ctwc.UCID_PREFIX_MN_LISTS + projectFQN + ":virtual-networks") : ctwc.UCID_ALL_VN_LIST;

            self.renderView4Config(self.$el, self.model, getNetworkGridViewConfig(networkRemoteConfig, ucid, pagerOptions));

        }
    });

    var getNetworkGridViewConfig = function (networkRemoteConfig, ucid, pagerOptions) {
        return {
            elementId: ctwl.PROJECT_NETWORK_GRID_ID,
            title: ctwl.TITLE_NETWORKS,
            view: "GridView",
            viewConfig: {
                elementConfig: getProjectNetworkGridConfig(networkRemoteConfig, ucid, pagerOptions)
            }
        };
    };

    var getProjectNetworkGridConfig = function (networkRemoteConfig, ucid, pagerOptions) {
        var currentCookie =  contrail.getCookie('region');
        var columns;
        if(currentCookie === cowc.GLOBAL_CONTROLLER_ALL_REGIONS){
            columns = nmwgc.projectNetworksColumnsAllregions;
        }
        else{
            columns = nmwgc.projectNetworksColumns;
        }
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
                    lazyLoading:false,
                    autoRefresh: false,
                    checkboxSelectable: false,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(getNetworkDetailsTemplateConfig(), cowc.APP_CONTRAIL_CONTROLLER, 'rawData'),
                        onExpand : function() {
                            $(".detail-foundation-content-advanced .key:contains(RegionName)").addClass('grid-regionname-heading regionname-label-text');
                            $(".detail-foundation-content-advanced .key:contains(RegionName)~span").addClass('grid-regionname-heading regionname-value-text');
                        }
                    },
                    fixedRowHeight: 30
                },
                dataSource: {
                    remote: {
                        ajaxConfig: networkRemoteConfig,
                        dataParser: nmwp.networkDataParser
                    },
                    vlRemoteConfig: {
                        vlRemoteList: nmwgc.getVNStatsVLOfPrimaryRemoteConfig(ctwc.TYPE_VIRTUAL_NETWORK)
                    },
                    cacheConfig: {
                        ucid: ucid
                    }
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Networks..'
                    },
                    empty: {
                        text: 'No Networks Found.'
                    }
                }
            },
            columnHeader: {
                    columns: columns
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
                                                        params: {
                                                            fqName: 'value.UveVirtualNetworkConfig.connected_networks'
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
                                                    key: 'instCnt',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'intfCnt',
                                                    templateGenerator: 'TextGenerator'
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

    return NetworkGridView;
});
