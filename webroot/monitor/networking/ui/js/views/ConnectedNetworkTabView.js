/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-view-model'
], function (_, Backbone, ContrailViewModel) {
    var ConnectedNetworkTabView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {

            var self = this, viewConfig = this.attributes.viewConfig;

            cowu.renderView4Config(self.$el, null, getConnectedNetworkTabViewConfig(viewConfig), null, null, null);
        }
    });

    function getConnectedNetworkTabViewConfig(viewConfig) {
        var linkDetails = viewConfig.linkDetails;

        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCE_VIEW_ID, '-section']),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CONNECTED_NETWORK_TABS_ID,
                                view: "TabsView",
                                viewConfig: {
                                    theme: 'classic',
                                    active: 1,
                                    activate: function (e, ui) {
                                        var selTab = $(ui.newTab.context).text();
                                        if (selTab == ctwl.TITLE_TRAFFIC_STATISTICS) {
                                            $('#' + ctwl.CONNECTED_NETWORK_TRAFFIC_STATS_ID).find('svg').trigger('refresh');
                                        }
                                    },
                                    tabs: [
                                        {
                                            elementId: ctwl.CONNECTED_NETWORK_DETAILS_ID,
                                            title: ctwl.TITLE_DETAILS,
                                            view: "DetailsView",
                                            viewConfig: {
                                                data: linkDetails,
                                                templateConfig: getConnectedNetworkDetailsTemplateConfig(),
                                                app: cowc.APP_CONTRAIL_CONTROLLER,

                                            }
                                        },
                                        {
                                            elementId: ctwl.CONNECTED_NETWORK_TRAFFIC_STATS_ID,
                                            title: ctwl.TITLE_TRAFFIC_STATISTICS,
                                            app: cowc.APP_CONTRAIL_CONTROLLER,
                                            view: "ConnectedNetworkTrafficStatsView",
                                            viewConfig: {
                                                linkDetails: linkDetails,
                                                parseFn: ctwp.parseTrafficLineChartData
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

    var getConnectedNetworkDetailsTemplateConfig = function () {
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
                                            title: ctwl.TITLE_CONNECTED_NETWORK_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'src',
                                                    templateGenerator: 'LinkGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'link',
                                                        template: ctwc.URL_NETWORK,
                                                        params: {}
                                                    }
                                                },
                                                {
                                                    key: 'dst',
                                                    templateGenerator: 'LinkGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'link',
                                                        template: ctwc.URL_NETWORK,
                                                        params: {}
                                                    }
                                                },
                                                {
                                                    key: 'service_inst',
                                                    templateGenerator: 'TextGenerator',
                                                },
                                            ]
                                        }
                                    ]
                                },
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
                                            title: ctwl.TITLE_TRAFFIC_STATISTICS_IN,
                                            key: 'more_attributes.in_stats',
                                            templateGeneratorConfig: {
                                                titleColumn: {
                                                    key: 'src',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                dataColumn: [
                                                    {
                                                        key: 'src',
                                                        templateGenerator: 'LinkGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'link',
                                                            template: ctwc.URL_NETWORK,
                                                            params: {}
                                                        }
                                                    },
                                                    {
                                                        key: 'dst',
                                                        templateGenerator: 'LinkGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'link',
                                                            template: ctwc.URL_NETWORK,
                                                            params: {}
                                                        }
                                                    },
                                                    {
                                                        key: 'pkts',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'packet'
                                                        }
                                                    },
                                                    {
                                                        key: 'bytes',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'byte'
                                                        }
                                                    }
                                                ]
                                            }
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
                                            title: ctwl.TITLE_TRAFFIC_STATISTICS_OUT,
                                            key: 'more_attributes.out_stats',
                                            templateGeneratorConfig: {
                                                titleColumn: {
                                                    key: 'src',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                dataColumn: [
                                                    {
                                                        key: 'src',
                                                        templateGenerator: 'LinkGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'link',
                                                            template: ctwc.URL_NETWORK,
                                                            params: {}
                                                        }
                                                    },
                                                    {
                                                        key: 'dst',
                                                        templateGenerator: 'LinkGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'link',
                                                            template: ctwc.URL_NETWORK,
                                                            params: {}
                                                        }
                                                    },
                                                    {
                                                        key: 'pkts',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'packet'
                                                        }
                                                    },
                                                    {
                                                        key: 'bytes',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'byte'
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
                ]
            }
        };
    };

    return ConnectedNetworkTabView;
});
