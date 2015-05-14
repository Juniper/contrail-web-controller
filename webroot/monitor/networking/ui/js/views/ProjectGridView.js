/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var ProjectGridView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var that = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];

            var projectsRemoteConfig = {
                url: networkPopulateFns.getProjectsURL(ctwc.DEFAULT_DOMAIN),
                type: 'GET'
            };

            cowu.renderView4Config(that.$el, this.model, getProjectListViewConfig(projectsRemoteConfig, pagerOptions));
        }
    });

    var getProjectListViewConfig = function (projectsRemoteConfig, pagerOptions) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_PROJECT_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECTS_GRID_ID,
                                title: ctwl.TITLE_PROJECTS,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getProjectGridConfig(projectsRemoteConfig, pagerOptions)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getProjectGridConfig = function (projectsRemoteConfig, pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_PROJECTS_SUMMARY
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
                        template: cowu.generateDetailTemplateHTML(getProjectDetailsTemplateConfig(), cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {
                    remote: {
                        ajaxConfig: projectsRemoteConfig,
                        hlRemoteConfig: ctwgc.getProjectDetailsHLazyRemoteConfig(),
                        dataParser: ctwp.projectDataParser
                    },
                    cacheConfig: {
                        ucid: ctwc.UCID_DEFAULT_DOMAIN_PROJECT_LIST // TODO: Handle multi-tenancy
                    }
                }
            },
            columnHeader: {
                columns: ctwgc.projectsColumns
            },
            footer: {
                pager: contrail.handleIfNull(pagerOptions, { options: { pageSize: 5, pageSizeSelect: [5, 10, 50, 100] } })
            }
        };
        return gridElementConfig;
    };


    function getProjectDetailsTemplateConfig() {
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
                                            title: ctwl.TITLE_PROJECT_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'name',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'vnCnt',
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
                                                    key: 'ingressFlowCount',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'egressFlowCount',
                                                    templateGenerator: 'TextGenerator'
                                                }
                                                /*
                                                {
                                                    key: 'inBytes',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'byte'
                                                    }
                                                },
                                                {
                                                    key: 'outBytes',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'byte'
                                                    }
                                                }
                                                {
                                                    key: 'inTpkts',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'outTpkts',
                                                    templateGenerator: 'TextGenerator'
                                                }
                                                */
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

    return ProjectGridView;
});
