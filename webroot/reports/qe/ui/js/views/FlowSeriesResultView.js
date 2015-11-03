/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'query-result-view',
    'contrail-list-model',
    'reports/qe/ui/js/models/FlowSeriesFormModel'
], function (_, QueryResultView, ContrailListModel, FlowSeriesFormModel) {

    var FlowSeriesResultView = QueryResultView.extend({
        render: function () {
            var self = this, viewConfig = self.attributes.viewConfig,
                serverCurrentTime = qewu.getCurrentTime4Client(),
                formData = contrail.checkIfExist(viewConfig.formData) ? viewConfig.formData : {},
                queryFormModel = contrail.checkIfExist(self.model) ? self.model : new FlowSeriesFormModel(formData),
                postDataObj;

            if (!contrail.checkIfExist(self.model)) {
                self.model = queryFormModel;
            }

            if (viewConfig.queryType == 'queue') {

                postDataObj = {
                    pageSize: 50,
                    page: 1,
                    queryId: formData.queryId
                };

                self.renderFlowSeriesResult(postDataObj, queryFormModel);
            } else {
                $.ajax({
                    url: '/api/service/networking/web-server-info'
                }).done(function (resultJSON) {
                    serverCurrentTime = resultJSON['serverUTCTime'];
                }).always(function() {
                    var timeRange = parseInt(queryFormModel.time_range());

                    postDataObj = queryFormModel.getQueryRequestPostData(serverCurrentTime)

                    if (timeRange !== -1) {
                        queryFormModel.to_time(serverCurrentTime);
                        queryFormModel.from_time(serverCurrentTime - (timeRange * 1000));
                    }

                    self.renderFlowSeriesResult(postDataObj, queryFormModel);
                });
            }
        },

        renderFlowSeriesResult: function(postDataObj, queryFormModel) {
            var self = this,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                contrailListModel,
                fsRemoteConfig = {
                    url: "/api/qe/query",
                    type: 'POST',
                    data: JSON.stringify(postDataObj)
                },
                listModelConfig = {
                    remote: {
                        ajaxConfig: fsRemoteConfig,
                        dataParser: function(response) {
                            return response['data'];
                        },
                        //TODO: We should not need to implement success callback in each grid to show grid message based on status
                        successCallback: function(resultJSON, contrailListModel, response) {
                            //TODO - Remove this setTimeout
                            setTimeout(function(){
                                if (response.status === 'queued') {
                                    $('#' + cowl.QE_FLOW_SERIES_GRID_ID).data('contrailGrid').showGridMessage(response.status)
                                }
                            }, 500);

                        }
                    }
                };

            contrailListModel = new ContrailListModel(listModelConfig);
            modelMap[cowc.UMID_FLOW_SERIES_FORM_MODEL] = queryFormModel;
            self.renderView4Config(self.$el, contrailListModel, self.getFlowSeriesResultGridTabViewConfig(postDataObj, fsRemoteConfig), null, null, modelMap, function(flowSeriesResultView) {
                var selectArray = queryFormModel.select().replace(/ /g, "").split(",");

                if(selectArray.indexOf("T=") != -1) {
                    contrailListModel.onAllRequestsComplete.subscribe(function () {
                        //TODO: Load chart only if data is not queued.
                        if (contrailListModel.getItems().length > 0) {
                            flowSeriesResultView.childViewMap[cowl.QE_FLOW_SERIES_TAB_ID].renderNewTab(cowl.QE_FLOW_SERIES_TAB_ID, self.getFlowSeriesResultChartTabViewConfig(postDataObj));
                        }
                    });
                }
            });
        },

        getFlowSeriesResultGridTabViewConfig: function (postDataObj, fsRemoteConfig) {
            var self = this, viewConfig = self.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'],
                queryFormModel = this.model,
                selectArray = queryFormModel.select().replace(/ /g, "").split(","),
                fsGridColumns = qewgc.getColumnDisplay4Grid(cowc.FLOW_SERIES_TABLE, cowc.QE_FLOW_TABLE_TYPE, selectArray);

            var resultsViewConfig = {
                elementId: cowl.QE_FLOW_SERIES_TAB_ID,
                view: "TabsView",
                viewConfig: {
                    theme: cowc.TAB_THEME_OVERCAST,
                    tabs: [
                        {
                            elementId: cowl.QE_FLOW_SERIES_GRID_ID,
                            title: cowl.TITLE_RESULTS,
                            view: "GridView",
                            tabConfig: {
                                activate: function(event, ui) {
                                    if ($('#' + cowl.QE_FLOW_SERIES_GRID_ID).data('contrailGrid')) {
                                        $('#' + cowl.QE_FLOW_SERIES_GRID_ID).data('contrailGrid').refreshView();
                                    }
                                }
                            },
                            viewConfig: {
                                elementConfig: getFlowSeriesGridConfig(fsRemoteConfig, fsGridColumns, pagerOptions)
                            }
                        }
                    ]
                }
            };

            return resultsViewConfig;
        },

        getFlowSeriesResultChartTabViewConfig: function(postDataObj) {
            var queryFormModel = this.model,
                selectArray = queryFormModel.select().replace(/ /g, "").split(","),
                flowSeriesChartTabViewConfig = [];

            flowSeriesChartTabViewConfig.push({
                elementId: cowl.QE_FLOW_SERIES_CHART_ID,
                title: cowl.TITLE_CHART,
                view: "FlowSeriesLineChartView",
                viewPathPrefix: "reports/qe/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                tabConfig: {
                    activate: function (event, ui) {
                        $('#' + cowl.QE_FLOW_SERIES_CHART_ID).find('svg').trigger('refresh');
                        if ($('#' + cowl.QE_FLOW_SERIES_CHART_GRID_ID).data('contrailGrid')) {
                            $('#' + cowl.QE_FLOW_SERIES_CHART_GRID_ID).data('contrailGrid').refreshView();
                        }
                    },
                    renderOnActivate: true
                },
                viewConfig: {
                    queryId: postDataObj.queryId,
                    selectArray: selectArray
                }
            });

            return flowSeriesChartTabViewConfig;
        }
    });

    function getFlowSeriesGridConfig(fsRemoteConfig, fsGridColumns, pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: cowl.TITLE_FLOW_SERIES,
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
                        ajaxConfig: fsRemoteConfig,
                        dataParser: function(response) {
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
                pager: contrail.handleIfNull(pagerOptions, { options: { pageSize: 100, pageSizeSelect: [100, 200, 300, 500] } })
            }
        };
        return gridElementConfig;
    };

    return FlowSeriesResultView;
});