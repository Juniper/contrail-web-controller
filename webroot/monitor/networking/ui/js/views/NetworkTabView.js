/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var NetworkTabView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;
            cowu.renderView4Config(self.$el, null, getNetworkViewConfig(viewConfig));
        }
    });

    var getNetworkViewConfig = function (viewConfig) {
        var networkFQN = viewConfig['networkFQN'],
            networkUUID = viewConfig['networkUUID'],
            networkDetailsUrl = ctwc.get(ctwc.URL_NETWORK_SUMMARY, networkFQN);

        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_NETWORK_VIEW_ID, '-section']),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.NETWORK_TABS_ID,
                                view: "TabsView",
                                viewConfig: {
                                    theme: 'classic',
                                    activate: function (e, ui) {
                                        var selTab = $(ui.newTab.context).text();
                                        if (selTab == ctwl.TITLE_PORT_DISTRIBUTION) {
                                            $('#' + ctwl.NETWORK_PORT_DIST_ID).find('svg').trigger('refresh');
                                        } else if (selTab == ctwl.TITLE_INSTANCES) {
                                            $('#' + ctwl.PROJECT_INSTANCE_GRID_ID).data('contrailGrid').refreshView();
                                        } else if (selTab == ctwl.TITLE_TRAFFIC_STATISTICS) {
                                            $('#' + ctwl.NETWORK_TRAFFIC_STATS_ID).find('svg').trigger('refresh');
                                        }
                                    },
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
                                            app: cowc.APP_CONTRAIL_CONTROLLER,
                                            viewConfig: {
                                                parentUUID: networkUUID,
                                                parentType: 'vn'
                                            }
                                        },
                                        {
                                            elementId: ctwl.NETWORK_TRAFFIC_STATS_ID,
                                            title: ctwl.TITLE_TRAFFIC_STATISTICS,
                                            view: "LineWithFocusChartView",
                                            viewConfig: {
                                                modelConfig: {
                                                    remote: {
                                                        ajaxConfig: {
                                                            url: ctwc.get(ctwc.URL_NETWORK_TRAFFIC_STATS, 60, networkFQN, 120),
                                                            type: 'GET'
                                                        },
                                                        dataParser: ctwp.vnTrafficStatsParser
                                                    },
                                                    cacheConfig: {
                                                        ucid: ctwc.get(ctwc.UCID_NETWORK_TRAFFIC_STATS_LIST, networkFQN)
                                                    }
                                                },
                                                parseFn: ctwp.parseLineChartData
                                            }
                                        },
                                        {
                                            elementId: ctwl.NETWORK_PORT_DIST_ID,
                                            title: ctwl.TITLE_PORT_DISTRIBUTION,
                                            view: "ScatterChartView",
                                            viewConfig: {
                                                class: "port-distribution-chart",
                                                modelConfig: {
                                                    remote: {
                                                        ajaxConfig: {
                                                            url: ctwc.get(ctwc.URL_PORT_DISTRIBUTION, networkFQN),
                                                            type: 'GET'
                                                        },
                                                        dataParser: ctwp.projectVNPortStatsParser
                                                    },
                                                    cacheConfig: {
                                                        ucid: ctwc.get(ctwc.UCID_PROJECT_VN_PORT_STATS_LIST, networkFQN)
                                                    }
                                                },
                                                parseFn: function (responseArray) {
                                                    var response = responseArray[0];
                                                    var retObj = {
                                                        d: [{
                                                            key: 'Source Port',
                                                            values: response ? ctwp.parsePortDistribution(ifNull(response['sport'], []), {
                                                                startTime: response['startTime'],
                                                                endTime: response['endTime'],
                                                                bandwidthField: 'outBytes',
                                                                flowCntField: 'outFlowCount',
                                                                portField: 'sport'
                                                            }) : []
                                                        },
                                                            {
                                                                key: 'Destination Port',
                                                                values: response ? ctwp.parsePortDistribution(ifNull(response['dport'], []), {
                                                                    startTime: response['startTime'],
                                                                    endTime: response['endTime'],
                                                                    bandwidthField: 'inBytes',
                                                                    flowCntField: 'inFlowCount',
                                                                    portField: 'dport'
                                                                }) : []
                                                            }],
                                                        forceX: [0, 1000],
                                                        xLblFormat: d3.format(''),
                                                        yDataType: 'bytes',
                                                        fqName: networkFQN,
                                                        yLbl: ctwl.Y_AXIS_TITLE_BW,
                                                        link: {
                                                            hashParams: {
                                                                q: {
                                                                    view: 'list',
                                                                    type: 'network',
                                                                    fqName: networkFQN,
                                                                    context: 'domain'
                                                                }
                                                            }
                                                        },
                                                        chartOptions: {
                                                            clickFn: onScatterChartClick,
                                                            tooltipFn: ctwgrc.getPortDistributionTooltipConfig(onScatterChartClick)
                                                        },
                                                        title: ctwl.TITLE_PORT_DISTRIBUTION,
                                                        xLbl: ctwl.X_AXIS_TITLE_PORT
                                                    };
                                                    return retObj;
                                                }
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
                                                        formatter: 'link',
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
                                    class: 'span6',
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

    var onScatterChartClick = function(chartConfig) {
        var obj= {
            fqName:chartConfig['fqName'],
            port:chartConfig['range']
        };
        if(chartConfig['startTime'] != null && chartConfig['endTime'] != null) {
            obj['startTime'] = chartConfig['startTime'];
            obj['endTime'] = chartConfig['endTime'];
        }

        if(chartConfig['type'] == 'sport')
            obj['portType']='src';
        else if(chartConfig['type'] == 'dport')
            obj['portType']='dst';

        obj['type'] = "flow";
        obj['view'] = "list";
        layoutHandler.setURLHashParams(obj, {p:"mon_networking_networks", merge:false});
    };

    function getHeatChartClickFn (selector, response) {
        return function(clickData) {
            var currHashObj = layoutHandler.getURLHashObj();
            var startRange = ((64 * clickData.y) + clickData.x) * 256;
            var endRange = startRange + 255;
            var params = {};
            var protocolMap = {'icmp': 1, 'tcp': 6, 'udp': 17};
            var divId = $($(selector)[0]).attr('id');
            params['fqName'] = currHashObj['q']['fqName'];
            params['port'] = startRange + "-" + endRange;
            params['startTime'] = new XDate().addMinutes(-10).getTime();
            params['endTime'] = new XDate().getTime();
            params['portType'] = response['type'];
            params['protocol'] = protocolMap[response['pType']];
            params['type'] = "flow";
            params['view'] = "list";
            layoutHandler.setURLHashParams(params, {p: 'mon_networking_networks'});
        }
    };

    return NetworkTabView;
});
