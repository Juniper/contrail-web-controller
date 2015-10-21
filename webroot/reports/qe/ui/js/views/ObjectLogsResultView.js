/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'query-result-view',
    'contrail-list-model'
], function (_, QueryResultView, ContrailListModel) {

    var ObjectLogsResultView = QueryResultView.extend({
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
                    olRemoteConfig = {
                        url: "/api/qe/query",
                        type: 'POST',
                        data: JSON.stringify(postDataObj)
                    },
                    listModelConfig = {
                        remote: {
                            ajaxConfig: olRemoteConfig,
                            dataParser: function(response) {
                                return response['data'];
                            }
                        }
                    };

                contrailListModel = new ContrailListModel(listModelConfig);
                self.renderView4Config(self.$el, contrailListModel, self.getViewConfig(postDataObj, olRemoteConfig, serverCurrentTime))
            });
        },

        getViewConfig: function (postDataObj, olRemoteConfig, serverCurrentTime) {
            var self = this, viewConfig = self.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'],
                queryFormModel = this.model,
                selectArray = queryFormModel.select().replace(/ /g, "").split(","),
                olGridColumns = qewgc.getColumnDisplay4Grid(postDataObj.formModelAttrs.table_name, cowc.QE_OBJECT_TABLE_TYPE, selectArray);

            var resultsViewConfig = {
                elementId: cowl.QE_OBJECT_LOGS_TAB_ID,
                view: "TabsView",
                viewConfig: {
                    theme: cowc.TAB_THEME_OVERCAST,
                    activate: function (e, ui) {},
                    tabs: [
                        {
                            elementId: cowl.QE_OBJECT_LOGS_GRID_ID,
                            title: cowl.TITLE_RESULTS,
                            view: "GridView",
                            viewConfig: {
                                elementConfig: getObjectLogsGridConfig(olRemoteConfig, olGridColumns, pagerOptions)
                            }
                        }
                    ]
                }
            };

            return resultsViewConfig;
        }
    });

    function getObjectLogsGridConfig(olRemoteConfig, olGridColumns, pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: cowl.TITLE_OBJECT_LOGS,
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
                        ajaxConfig: olRemoteConfig,
                        dataParser: function(response) {
                            console.log(response);
                            return response['data'];
                        },
                        serverSidePagination: true
                    }
                }
            },
            columnHeader: {
                columns: olGridColumns
            },
            footer: {
                pager: contrail.handleIfNull(pagerOptions, { options: { pageSize: 100, pageSizeSelect: [100, 200, 300, 500] } })
            }
        };
        return gridElementConfig;
    };

    return ObjectLogsResultView;
});