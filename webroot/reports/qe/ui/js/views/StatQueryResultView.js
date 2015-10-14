/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'query-result-view',
    'contrail-list-model'
], function (_, QueryResultView, ContrailListModel) {

    var StatQueryResultView = QueryResultView.extend({
        render: function () {
            var self = this, viewConfig = self.attributes.viewConfig,
                serverCurrentTime = qewu.getCurrentTime4Client(),
                queryFormModel = self.model,
                contrailListModel;

            $.ajax({
                url: '/api/service/networking/web-server-info'
            }).done(function (resultJSON) {
                serverCurrentTime = resultJSON['serverUTCTime'];
            }).always(function() {
                var postDataObj = queryFormModel.getQueryRequestPostData(serverCurrentTime),
                    statRemoteConfig = {
                        url: "/api/qe/query",
                        type: 'POST',
                        data: JSON.stringify(postDataObj)
                    },
                    listModelConfig = {
                        remote: {
                            ajaxConfig: statRemoteConfig,
                            dataParser: function(response) {
                                return response['data'];
                            }
                        }
                    };

                contrailListModel = new ContrailListModel(listModelConfig);
                self.renderView4Config(self.$el, contrailListModel, self.getViewConfig(postDataObj, statRemoteConfig, serverCurrentTime))
            });
        },

        getViewConfig: function (postDataObj, statRemoteConfig, serverCurrentTime) {
            var self = this, viewConfig = self.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'],
                queryFormModel = this.model,
                selectArray = queryFormModel.select().replace(/ /g, "").split(","),
                statGridColumns = qewgc.getColumnDisplay4Grid(postDataObj.formModelAttrs.table_name, cowc.QE_STAT_TABLE_TYPE, selectArray);

            var resultsViewConfig = {
                elementId: cowl.QE_STAT_QUERY_TAB_ID,
                view: "TabsView",
                viewConfig: {
                    theme: cowc.TAB_THEME_OVERCAST,
                    activate: function (e, ui) {
                        var selTab = $(ui.newTab.context).text();
                        if (selTab == cowl.TITLE_RESULTS) {
                            $('#' + cowl.QE_STAT_QUERY_GRID_ID).data('contrailGrid').refreshView();
                        } else if (selTab == cowl.TITLE_CHART) {
                            $('#' + cowl.QE_STAT_QUERY_CHART_ID).find('svg').trigger('refresh');
                            $('#' + cowl.QE_STAT_QUERY_CHART_GRID_ID).data('contrailGrid').refreshView();
                        }
                    },
                    tabs: [
                        {
                            elementId: cowl.QE_STAT_QUERY_GRID_ID,
                            title: cowl.TITLE_RESULTS,
                            view: "GridView",
                            viewConfig: {
                                elementConfig: getStatQueryGridConfig(statRemoteConfig, statGridColumns, pagerOptions)
                            }
                        }
                    ]
                }
            };

            return resultsViewConfig;
        }
    });

    function getStatQueryGridConfig(statRemoteConfig, statGridColumns, pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: cowl.TITLE_STATS_QUERY,
                    icon : 'icon-table'
                },
                defaultControls: {
                    collapseable: true,
                    exportable: true,
                    refreshable: false,
                    searchable: true
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
                        ajaxConfig: statRemoteConfig,
                        dataParser: function(response) {
                            console.log(response);
                            return response['data'];
                        },
                        serverSidePagination: true
                    }
                }
            },
            columnHeader: {
                columns: statGridColumns
            },
            footer: {
                pager: contrail.handleIfNull(pagerOptions, { options: { pageSize: 100, pageSizeSelect: [100, 200, 300, 500] } })
            }
        };
        return gridElementConfig;
    };

    return StatQueryResultView;
});