/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var ProjectGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'],
                selectedDomain = viewConfig['selectedDomain'];

            var projectsRemoteConfig = {
                url: ctwc.URL_ALL_PROJECTS +
                "?domainId=" + selectedDomain.value,
                type: 'GET'
            };
            this.renderView4Config(self.$el, this.model, getProjectListViewConfig(projectsRemoteConfig, pagerOptions));
        }
    });

    var getProjectListViewConfig = function (projectsRemoteConfig, pagerOptions) {
        return {
            elementId: ctwl.PROJECTS_GRID_ID,
            title: ctwl.TITLE_PROJECTS,
            view: "GridView",
            viewConfig: {
                elementConfig: getProjectGridConfig(projectsRemoteConfig, pagerOptions)
            }
        };
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
                    },
                    fixedRowHeight: 30
                },
                dataSource: {
                    remote: {
                        ajaxConfig: projectsRemoteConfig,
                        hlRemoteConfig: nmwgc.getProjectDetailsHLazyRemoteConfig(),
                        dataParser: nmwp.projectDataParser
                    },
                    cacheConfig: {
                        ucid: ctwc.UCID_COOKIE_DOMAIN_PROJECT_LIST
                    }
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Projects..'
                    },
                    empty: {
                        text: 'No Projects Found.'
                    }
                }
            },
            columnHeader: {
                columns: nmwgc.projectsColumns
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
                                    class: 'col-xs-6',
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
