/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "knockback",
    "validation",
    "layout-handler",
    "core-constants",
    "query-form-view",
    "controller-basedir/reports/qe/ui/js/models/SessionSeriesFormModel",
    "core-basedir/reports/qe/ui/js/common/qe.utils",
    "controller-basedir/reports/qe/ui/js/views/ControllerQEView"
], function(kb, kbValidation, LayoutHandler, coreConstants, QueryFormView, SessionSeriesFormModel, qeUtils, controllerQEView) {
    var layoutHandler = new LayoutHandler();

    var SessionSeriesFormView = QueryFormView.extend({
        render: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                hashParams = layoutHandler.getURLHashParams(),
                queryPageTmpl = contrail.getTemplate4Id(coreConstants.TMPL_QUERY_PAGE),
                queryType = contrail.checkIfExist(hashParams.queryType) ? hashParams.queryType : null,
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null,
                queryPrefix = cowc.SS_QUERY_PREFIX,
                queryFormId = cowc.QE_HASH_ELEMENT_PREFIX + cowc.SS_QUERY_PREFIX + cowc.QE_FORM_SUFFIX,
                sessionSeriesId = cowl.QE_SESSION_SERIES_ID,
                queryFormAttributes = contrail.checkIfExist(hashParams.queryFormAttributes) ? hashParams.queryFormAttributes : {};

            if (queryType === cowc.QUERY_TYPE_MODIFY) {
                queryFormAttributes.from_time = parseInt(queryFormAttributes.from_time_utc);
                queryFormAttributes.to_time = parseInt(queryFormAttributes.to_time_utc);
            }

            self.model = new SessionSeriesFormModel(queryFormAttributes);
            self.$el.append(queryPageTmpl({ queryPrefix: cowc.SS_QUERY_PREFIX }));

            self.renderView4Config($(queryFormId), self.model, self.getViewConfig(),
                cowc.KEY_RUN_QUERY_VALIDATION, null, modelMap, function () {
                    self.model.showErrorAttr(sessionSeriesId, false);

                    kb.applyBindings(self.model, document.getElementById(sessionSeriesId));
                    kbValidation.bind(self);

                    $("#run_query").on("click", function() {
                        if (self.model.model().isValid(true, cowc.KEY_RUN_QUERY_VALIDATION)) {
                            self.renderQueryResult();
                        }
                    });

                    qeUtils.adjustHeight4FormTextarea(queryPrefix);

                    if (queryType === cowc.QUERY_TYPE_RERUN) {
                        self.renderQueryResult();
                    }
                });

            if (widgetConfig !== null) {
                self.renderView4Config($(queryFormId), self.model, widgetConfig, null, null, null);
            }
        },

        renderQueryResult: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                queryFormModel = self.model,
                queryFormId = cowc.QE_HASH_ELEMENT_PREFIX + cowc.SS_QUERY_PREFIX + cowc.QE_FORM_SUFFIX,
                queryResultId = cowc.QE_HASH_ELEMENT_PREFIX + cowc.SS_QUERY_PREFIX + cowc.QE_RESULTS_SUFFIX,
                queryResultTabId = cowl.QE_SESSION_SERIES_TAB_ID;

            if (widgetConfig !== null) {
                $(queryFormId).parents(".widget-box").data("widget-action").collapse();
            }

            queryFormModel.is_request_in_progress(true);
            qeUtils.fetchServerCurrentTime(function(serverCurrentTime) {
                var queryRequestPostData = queryFormModel.getQueryRequestPostData(serverCurrentTime);

                self.renderView4Config($(queryResultId), self.model,
                    getQueryResultTabViewConfig(queryRequestPostData, queryResultTabId),
                    null, null, modelMap, function() {
                        var queryResultTabView = self.childViewMap[queryResultTabId],
                            queryResultListModel = modelMap[cowc.UMID_QUERY_RESULT_LIST_MODEL];

                        if (!(queryResultListModel.isRequestInProgress()) && queryResultListModel.getItems().length > 0) {
                            self.renderQueryResultChartTab(queryResultTabView,
                                queryResultTabId, queryFormModel, queryRequestPostData);
                            queryFormModel.is_request_in_progress(false);
                        } else {
                            queryResultListModel.onAllRequestsComplete.subscribe(function() {
                                if (queryResultListModel.getItems().length > 0) {
                                    self.renderQueryResultChartTab(queryResultTabView,
                                        queryResultTabId, queryFormModel, queryRequestPostData);
                                }
                                queryFormModel.is_request_in_progress(false);
                            });
                        }
                    });
            });
        },

        renderQueryResultChartTab: function(queryResultTabView, queryResultTabId, queryFormModel, queryRequestPostData) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                queryFormAttributes = contrail.checkIfExist(viewConfig.queryFormAttributes) ? viewConfig.queryFormAttributes : {},
                formQueryIdSuffix = (!$.isEmptyObject(queryFormAttributes)) ? "-" + queryFormAttributes.queryId : "",
                sessionSeriesChartId = cowl.QE_SESSION_SERIES_CHART_ID + formQueryIdSuffix,
                selectArray = queryFormModel.select().replace(/ /g, "").split(",");

            if (selectArray.indexOf("T=") !== -1 && $("#" + sessionSeriesChartId).length === 0) {
                queryResultTabView.renderNewTab(queryResultTabId, getQueryResultChartViewConfig(queryRequestPostData, self.el.id));
            }
        },

        getViewConfig: function() {
            var self = this;

            return {
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: "time_range",
                            view: "FormDropdownView",
                            viewConfig: {
                                path: "time_range",
                                help: {
                                    target: "modal",
                                    content: "reports/qe/sessions/session_series/time_range"
                                },
                                dataBindValue: "time_range",
                                class: "col-xs-3",
                                elementConfig: { dataTextField: "text", dataValueField: "id", data: cowc.TIMERANGE_DROPDOWN_VALUES }
                            }
                        }, {
                            elementId: "from_time",
                            view: "FormDateTimePickerView",
                            viewConfig: {
                                style: "display: none;",
                                path: "from_time",
                                dataBindValue: "from_time",
                                class: "col-xs-3",
                                elementConfig: qeUtils.getFromTimeElementConfig("from_time", "to_time"),
                                visible: "isTimeRangeCustom()"
                            }
                        }, {
                            elementId: "to_time",
                            view: "FormDateTimePickerView",
                            viewConfig: {
                                style: "display: none;",
                                path: "to_time",
                                dataBindValue: "to_time",
                                class: "col-xs-3",
                                elementConfig: qeUtils.getToTimeElementConfig("from_time", "to_time"),
                                visible: "isTimeRangeCustom()"
                            }
                        }]
                    },
                    {
                        columns: [
                            {
                                elementId: "sessiontype",
                                view: "FormDropdownView",
                                viewConfig: {
                                    label: "Session Type",
                                    path: "session_type",
                                    dataBindValue: "session_type",
                                    class: "col-xs-3",
                                    elementConfig: { dataTextField: "text", dataValueField: "id", data: cowc.SESSION_TYPE_DROPDOWN_VALUES }
                                }
                            }
                        ]
                    },
                    {
                        columns: [{
                            elementId: "select",
                            view: "FormTextAreaView",
                            viewConfig: {
                                path: "select",
                                help: {
                                    target: "modal",
                                    content: "reports/qe/sessions/session_series/select"
                                },
                                dataBindValue: "select",
                                class: "col-xs-9",
                                editPopupConfig: {
                                    renderEditFn: function() {
                                        self.renderSelect({ className: cowc.QE_MODAL_CLASS_700 });
                                    }
                                }
                            }
                        }, {
                            elementId: "time-granularity-section",
                            view: "FormCompositeView",
                            viewConfig: {
                                class: "col-xs-3",
                                style: "display: none;",
                                path: "time_granularity",
                                label: "Time Granularity",
                                visible: "isSelectTimeChecked()",
                                childView: [{
                                    elementId: "time_granularity",
                                    view: "FormNumericTextboxView",
                                    viewConfig: {
                                        label: false,
                                        path: "time_granularity",
                                        dataBindValue: "time_granularity",
                                        class: "col-xs-5",
                                        elementConfig: { min: 1 }
                                    }
                                }, {
                                    elementId: "time_granularity_unit",
                                    view: "FormDropdownView",
                                    viewConfig: {
                                        label: false,
                                        path: "time_granularity_unit",
                                        dataBindValue: "time_granularity_unit",
                                        dataBindOptionList: "getTimeGranularityUnits()",
                                        class: "col-xs-7",
                                        elementConfig: {}
                                    }
                                }]

                            }
                        }]
                    }, {
                        viewConfig: {
                            visible: "show_advanced_options()"
                        },
                        columns: [{
                            elementId: "where",
                            view: "FormTextAreaView",
                            viewConfig: {
                                path: "where",
                                dataBindValue: "where",
                                class: "col-xs-9",
                                placeHolder: "*",
                                editPopupConfig: {
                                    renderEditFn: function() {
                                        self.renderWhere({ className: cowc.QE_MODAL_CLASS_700 });
                                    }
                                }
                            }
                        }]
                    }, {
                        viewConfig: {
                            visible: "show_advanced_options()"
                        },
                        columns: [{
                            elementId: "filters",
                            view: "FormTextAreaView",
                            viewConfig: {
                                path: "filters",
                                dataBindValue: "filters",
                                class: "col-xs-9",
                                label: cowl.TITLE_QE_FILTER,
                                editPopupConfig: {
                                    renderEditFn: function() {
                                        self.renderFilters({ className: cowc.QE_MODAL_CLASS_700 });
                                    }
                                }
                            }
                        }]
                    }, {
                        columns: [{
                            elementId: "advanced_options",
                            view: "FormTextView",
                            viewConfig: {
                                text: "getAdvancedOptionsText()",
                                class: "col-xs-6 margin-0-0-10",
                                elementConfig: {
                                    class: "advanced-options-link"
                                },
                                click: "toggleAdvancedFields"
                            }
                        }]
                    }, {
                        columns: [{
                            elementId: "run_query",
                            view: "FormButtonView",
                            label: "Run Query",
                            viewConfig: {
                                class: "display-inline-block margin-0-0-0-15",
                                disabled: "is_request_in_progress()",
                                elementConfig: {
                                    btnClass: "btn-primary"
                                }
                            }
                        }, {
                            elementId: "reset_query",
                            view: "FormButtonView",
                            label: "Reset",
                            viewConfig: {
                                label: "Reset",
                                class: "display-inline-block margin-0-0-0-15",
                                elementConfig: {
                                    onClick: "function(data, event) {reset(data, event, true, false);}"
                                }
                            }
                        }]
                    }]
                }
            };
        }

    });


    function getQueryResultTabViewConfig(queryRequestPostData, queryResultTabId) {
        return {
            elementId: queryResultTabId,
            view: "TabsView",
            viewConfig: {
                theme: cowc.TAB_THEME_WIDGET_CLASSIC,
                tabs: [getQueryResultGridViewConfig(queryRequestPostData)]
            }
        };
    }

    function getQueryResultGridViewConfig(queryRequestPostData) {
        var queryResultGridId = cowl.QE_QUERY_RESULT_GRID_ID;

        return {
            elementId: queryResultGridId,
            title: cowl.TITLE_RESULTS,
            iconClass: "fa fa-table",
            view: "QueryResultGridView",
            tabConfig: {
                activate: function() {
                    if ($("#" + queryResultGridId).data("contrailGrid")) {
                        $("#" + queryResultGridId).data("contrailGrid").refreshView();
                    }
                }
            },
            viewConfig: {
                queryRequestPostData: queryRequestPostData,
                gridOptions: {
                    titleText: cowl.TITLE_SESSION_SERIES,
                    queryQueueUrl: cowc.URL_QUERY_SESSION_QUEUE,
                    queryQueueTitle: cowl.TITLE_SESSION
                }
            }
        };
    }

    function getQueryResultChartViewConfig(queryRequestPostData, clickOutElementId) {
        var queryResultChartId = cowl.QE_SESSION_SERIES_CHART_ID,
            queryResultChartGridId = cowl.QE_SESSION_SERIES_CHART_GRID_ID,
            sessionSeriesChartTabViewConfig = [];

        sessionSeriesChartTabViewConfig.push({
            elementId: queryResultChartId,
            title: cowl.TITLE_CHART,
            iconClass: "fa fa-bar-chart-o",
            view: "QueryResultLineChartView",
            tabConfig: {
                activate: function() {
                    $("#" + queryResultChartId).find("svg").trigger("refresh");
                    if ($("#" + queryResultChartGridId).data("contrailGrid")) {
                        $("#" + queryResultChartGridId).data("contrailGrid").refreshView();
                    }
                },
                renderOnActivate: true
            },
            viewConfig: {
                queryId: queryRequestPostData.queryId,
                queryFormAttributes: queryRequestPostData.formModelAttrs,
                queryResultChartId: queryResultChartId,
                queryResultChartGridId: queryResultChartGridId,
                clickOutElementId: clickOutElementId
            }
        });

        return sessionSeriesChartTabViewConfig;
    }

    return SessionSeriesFormView;
});
