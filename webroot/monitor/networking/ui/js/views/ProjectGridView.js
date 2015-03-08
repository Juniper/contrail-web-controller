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
                    checkboxSelectable: false
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

    return ProjectGridView;
});
