/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'query-result-view',
    'knockback'
], function (_, QueryResultView, Knockback) {

    var FlowSeriesResultView = QueryResultView.extend({
        render: function () {
            var self = this, viewConfig = self.attributes.viewConfig,
                serverCurrentTime = getCurrentTime4MemCPUCharts();

            $.ajax({
                url: '/api/service/networking/web-server-info'
            }).done(function (resultJSON) {
                serverCurrentTime = resultJSON['serverUTCTime'];
            }).always(function() {
                self.renderView4Config(self.$el, null, self.getViewConfig(serverCurrentTime))
            });
        },

        getViewConfig: function (serverCurrentTime) {
            var self = this, viewConfig = self.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'],
                queryFormModel = this.model,
                postDataObj = queryFormModel.getQueryRequestPostData(serverCurrentTime),
                selectArray = queryFormModel.select().replace(/ /g, "").split(","),
                fsGridColumns = qewgc.getColumnDisplay4Grid(qewc.FS_QUERY_PREFIX, selectArray);

            var fsRemoteConfig = {
                url: "/api/qe/query",
                type: 'POST',
                data: JSON.stringify(postDataObj)
            };

            return {
                elementId: ctwl.QE_FLOW_SERIES_TAB_ID,
                view: "TabsView",
                viewConfig: {
                    theme: cowc.TAB_THEME_OVERCAST,
                    activate: function (e, ui) {
                        var selTab = $(ui.newTab.context).text();
                        if (selTab == ctwl.TITLE_FLOW_SERIES_RESULTS) {
                        }
                    },
                    tabs: [
                        {
                            elementId: ctwl.QE_FLOW_SERIES_GRID_ID,
                            title: ctwl.TITLE_RESULTS,
                            view: "GridView",
                            viewConfig: {
                                elementConfig: getFlowSeriesGridConfig(fsRemoteConfig, fsGridColumns, pagerOptions)
                            }
                        }
                    ]
                }
            }
        }
    });

    function getFlowSeriesGridConfig(fsRemoteConfig, fsGridColumns, pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_FLOW_SERIES,
                    icon : 'icon-table'
                },
                defaultControls: {
                    collapseable: true,
                    exportable: true,
                    refreshable: false,
                    searchable: false
                }
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    fixedRowHeight: 30
                },
                dataSource: {
                    remote: {
                        ajaxConfig: fsRemoteConfig,
                        dataParser: function(response) {
                            return response['data'];
                        }
                    }
                }
            },
            columnHeader: {
                columns: fsGridColumns
            },
            footer: {
                pager: contrail.handleIfNull(pagerOptions, { options: { pageSize: 5, pageSizeSelect: [5, 10, 50, 100] } })
            }
        };
        return gridElementConfig;
    };

    return FlowSeriesResultView;
});