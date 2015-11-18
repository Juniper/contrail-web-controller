/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'query-result-view',
    'contrail-list-model',
    'reports/qe/ui/js/models/FlowSeriesFormModel'
], function (_, QueryResultView, ContrailListModel, FlowSeriesFormModel) {

    var FlowRecordDetailsView = QueryResultView.extend({
        render: function () {
            var self = this, viewConfig = self.attributes.viewConfig,
                serverCurrentTime = qewu.getCurrentTime4Client(),
                formData = contrail.checkIfExist(viewConfig.formData) ? viewConfig.formData : {},
                queryFormModel = contrail.checkIfExist(self.model) ? self.model : new FlowSeriesFormModel(formData),
                postDataObj;

            if (!contrail.checkIfExist(self.model)) {
                self.model = queryFormModel;
            }

            $.ajax({
                url: '/api/service/networking/web-server-info'
            }).done(function (resultJSON) {
                serverCurrentTime = resultJSON['serverUTCTime'];
            }).always(function () {
                var timeRange = parseInt(queryFormModel.time_range());

                postDataObj = queryFormModel.getQueryRequestPostData(serverCurrentTime, null, true);

                if (timeRange !== -1) {
                    queryFormModel.to_time(serverCurrentTime);
                    queryFormModel.from_time(serverCurrentTime - (timeRange * 1000));
                }

                self.renderFlowDetails(postDataObj, queryFormModel);
            });
        },

        renderFlowDetails: function (postDataObj) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                flowDetailsGridId = viewConfig['flowDetailsGridId'],
                flowDetailsTabId = viewConfig['flowDetailsTabId'],
                contrailListModel,
                fsRemoteConfig = {
                    url: "/api/qe/query",
                    type: 'POST',
                    data: JSON.stringify(postDataObj)
                },
                listModelConfig = {
                    remote: {
                        ajaxConfig: fsRemoteConfig,
                        dataParser: function (response) {
                            return response['data'];
                        },
                        successCallback: function(resultJSON, contrailListModel, response) {
                            if (response.status === 'queued') {
                                //TODO fix elementId inside gridView
                                $('#' + flowDetailsTabId).data('contrailGrid').showGridMessage(response.status)
                            }
                        }
                    }
                };

            contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(self.$el, contrailListModel, self.getFlowDetailsGridViewConfig(postDataObj, fsRemoteConfig));
        },

        getFlowDetailsGridViewConfig: function (postDataObj, fsRemoteConfig) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                flowDetailsGridId = viewConfig['flowDetailsGridId'],
                pagerOptions = viewConfig['pagerOptions'],
                queryFormModel = this.model,
                selectArray = queryFormModel.select().replace(/ /g, "").split(","),
                fsGridColumns = qewgc.getColumnDisplay4Grid(cowc.FLOW_SERIES_TABLE, cowc.QE_FLOW_TABLE_TYPE, selectArray);

            var resultsViewConfig = {
                elementId: flowDetailsGridId,
                title: cowl.TITLE_RESULTS,
                iconClass: 'icon-table',
                view: "GridView",
                viewConfig: {
                    elementConfig: getFlowDetailsGridConfig(fsRemoteConfig, fsGridColumns, pagerOptions)
                }
            };

            return resultsViewConfig;
        }
    });

    function getFlowDetailsGridConfig(fsRemoteConfig, fsGridColumns, pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: cowl.TITLE_FLOWS,
                    icon: 'icon-table'
                },
                defaultControls: {
                    collapseable: false,
                    exportable: false,
                    refreshable: false,
                    searchable: true
                }
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    fixedRowHeight: 30,
                    defaultDataStatusMessage: false
                },
                dataSource: {
                    remote: {
                        ajaxConfig: fsRemoteConfig,
                        dataParser: function (response) {
                            return response['data'];
                        },
                        serverSidePagination: true
                    }
                },
                statusMessages: {
                    queued: {
                        type: 'status',
                        iconClasses: '',
                        text: 'Your query has been queued.'
                    }
                }
            },
            columnHeader: {
                columns: fsGridColumns
            },
            footer: {
                pager: contrail.handleIfNull(pagerOptions, {
                    options: {
                        pageSize: 5,
                        pageSizeSelect: [5, 10, 25, 50]
                    }
                })
            }
        };
        return gridElementConfig;
    };

    return FlowRecordDetailsView;
});