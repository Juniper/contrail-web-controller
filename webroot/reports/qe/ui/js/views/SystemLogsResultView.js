/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'query-result-view',
    'contrail-list-model'
], function (_, QueryResultView, ContrailListModel) {

    var SystemLogsResultView = QueryResultView.extend({
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
                                var gridData = response['data'];
                                for (var i = 0 ; i < gridData.length; i++) {
                                    gridData[i]["Xmlmessage"] = contrail.checkIfExist(gridData[i]["Xmlmessage"]) ? qewu.formatXML2JSON(gridData[i]["Xmlmessage"], true) : null;
                                }
                                return gridData;
                            },
                            //TODO: We should not need to implement success callback in each grid to show grid message based on status
                            successCallback: function(resultJSON, contrailListModel, response) {
                                //TODO - Remove this setTimeout
                                setTimeout(function(){
                                    if (response.status === 'queued') {
                                        $('#' + cowl.QE_SYSTEM_LOGS_GRID_ID).data('contrailGrid').showGridMessage(response.status)
                                    }
                                }, 500);
                            }
                        }
                    };

                postDataObj.chunkSize = cowc.QE_RESULT_CHUNK_SIZE_10K;
                contrailListModel = new ContrailListModel(listModelConfig);
                self.renderView4Config(self.$el, contrailListModel, self.getViewConfig(postDataObj, listModelConfig, serverCurrentTime))
            });
        },

        getViewConfig: function (postDataObj, listModelConfig, serverCurrentTime) {
            var self = this, viewConfig = self.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'],
                queryFormModel = this.model,
                selectArray = queryFormModel.select().replace(/ /g, "").split(","),
                olGridColumns = qewgc.getColumnDisplay4Grid(postDataObj.formModelAttrs.table_name, cowc.QE_LOG_TABLE_TYPE, selectArray),
                gridTitle = contrail.checkIfExist(viewConfig['title']) ? viewConfig['title'] : cowl.TITLE_SYSTEM_LOGS;

            var resultsViewConfig = {
                elementId: cowl.QE_SYSTEM_LOGS_TAB_ID,
                view: "TabsView",
                viewConfig: {
                    theme: cowc.TAB_THEME_WIDGET_CLASSIC,
                    activate: function (e, ui) {},
                    tabs: [
                        {
                            elementId: cowl.QE_SYSTEM_LOGS_GRID_ID,
                            title: cowl.TITLE_RESULTS,
                            iconClass: 'icon-table',
                            view: "GridView",
                            viewConfig: {
                                elementConfig: getSystemLogsGridConfig(listModelConfig, olGridColumns, pagerOptions, gridTitle)
                            }
                        }
                    ]
                }
            };

            return resultsViewConfig;
        }
    });

    function getSystemLogsGridConfig(listModelConfig, olGridColumns, pagerOptions, gridTitle) {
        var gridElementConfig = {
            header: {
                title: {
                    text: gridTitle,
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
                    checkboxSelectable: false
                },
                dataSource: { remote: $.extend(true, {}, listModelConfig.remote, { serverSidePagination: true }) },
                statusMessages: {
                    queued: {
                        type: 'status',
                        iconClasses: '',
                        text: 'Your query has been queued.'
                    }
                }
            },
            columnHeader: {
                columns: olGridColumns
            },
            footer: {
                pager: contrail.handleIfNull(pagerOptions, { options: { pageSize: 20, pageSizeSelect: [10, 20, 50, 100] } })
            }
        };
        return gridElementConfig;
    };

    return SystemLogsResultView;
});