/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'query-form-view',
    'knockback',
    'reports/qe/ui/js/models/FlowSeriesFormModel'
], function (_, QueryFormView, Knockback, FlowSeriesFormModel) {

    var FlowSeriesFormView = QueryFormView.extend({
        render: function () {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                hashParams = layoutHandler.getURLHashParams(),
                queryPageTmpl = contrail.getTemplate4Id(ctwc.TMPL_QUERY_PAGE),
                queryType = contrail.checkIfExist(hashParams.queryType) ? hashParams.queryType : null,
                queryFormAttributes = contrail.checkIfExist(hashParams.queryFormAttributes) ? hashParams.queryFormAttributes : {},
                flowSeriesQueryModel = new FlowSeriesFormModel(queryFormAttributes),
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null,
                queryFormId = cowc.QE_HASH_ELEMENT_PREFIX + cowc.FS_QUERY_PREFIX + cowc.QE_FORM_SUFFIX,
                flowSeriesId = cowl.QE_FLOW_SERIES_ID;

            self.model = flowSeriesQueryModel;
            self.$el.append(queryPageTmpl({queryPrefix: cowc.FS_QUERY_PREFIX}));

            if (queryType === cowc.QUERY_TYPE_MODIFY) {
                self.model.from_time(parseInt(queryFormAttributes.from_time));
                self.model.to_time(parseInt(queryFormAttributes.to_time));
            }

            self.renderView4Config($(queryFormId), self.model, self.getViewConfig(), cowc.KEY_RUN_QUERY_VALIDATION, null, modelMap, function () {
                self.model.showErrorAttr(flowSeriesId, false);
                Knockback.applyBindings(self.model, document.getElementById(flowSeriesId));
                kbValidation.bind(self);
                $("#run_query").on('click', function() {
                    if (self.model.model().isValid(true, cowc.KEY_RUN_QUERY_VALIDATION)) {
                        self.renderQueryResult();
                    }
                });

                qewu.adjustHeight4FormTextarea(self.$el);

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
                queryFormId = cowc.QE_HASH_ELEMENT_PREFIX + cowc.FS_QUERY_PREFIX + cowc.QE_FORM_SUFFIX,
                queryResultId = cowc.QE_HASH_ELEMENT_PREFIX + cowc.FS_QUERY_PREFIX + cowc.QE_RESULTS_SUFFIX,
                queryResultTabId = cowl.QE_FLOW_SERIES_TAB_ID, serverCurrentTime;

            if (widgetConfig !== null) {
                $(queryFormId).parents('.widget-box').data('widget-action').collapse();
            }

            queryFormModel.is_request_in_progress(true);
            qewu.fetchServerCurrentTime(function(serverCurrentTime) {
                var timeRange = parseInt(queryFormModel.time_range()),
                    queryRequestPostData;

                if (timeRange !== -1) {
                    queryFormModel.to_time(serverCurrentTime);
                    queryFormModel.from_time(serverCurrentTime - (timeRange * 1000));
                }

                queryRequestPostData = queryFormModel.getQueryRequestPostData(serverCurrentTime);

                self.renderView4Config($(queryResultId), self.model,
                    getQueryResultTabViewConfig(queryRequestPostData, queryResultTabId), null, null, modelMap,
                    function() {
                        var queryResultTabView = self.childViewMap[queryResultTabId],
                            queryResultListModel = modelMap[cowc.UMID_QUERY_RESULT_LIST_MODEL];

                        if (!(queryResultListModel.isRequestInProgress()) && queryResultListModel.getItems().length > 0) {
                            self.renderQueryResultChartTab(queryResultTabView, queryResultTabId, queryFormModel, queryRequestPostData)
                            queryFormModel.is_request_in_progress(false);
                        } else {
                            queryResultListModel.onAllRequestsComplete.subscribe(function () {
                                if (queryResultListModel.getItems().length > 0) {
                                    self.renderQueryResultChartTab(queryResultTabView, queryResultTabId, queryFormModel, queryRequestPostData)
                                }
                                queryFormModel.is_request_in_progress(false);
                            });
                        }
                });
            });
        },

        renderSessionAnalyzer: function (elementId, sessionAnalyzerViewConfig) {
            var self = this,
                childViewMap = self.childViewMap,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                queryResultTabsId = cowl.QE_FLOW_SERIES_TAB_ID,
                queryResultTabsView = contrail.checkIfExist(childViewMap[queryResultTabsId]) ? childViewMap[queryResultTabsId] : null;

            if (queryResultTabsView != null) {
                queryResultTabsView.renderNewTab(queryResultTabsId, [sessionAnalyzerViewConfig], true, modelMap, null);
            }

        },

        renderQueryResultChartTab: function(queryResultTabView, queryResultTabId, queryFormModel, queryRequestPostData) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                queryFormAttributes = contrail.checkIfExist(viewConfig.queryFormAttributes) ? viewConfig.queryFormAttributes : {},
                formQueryIdSuffix = (!$.isEmptyObject(queryFormAttributes)) ? '-' + queryFormAttributes.queryId : '',
                flowSeriesChartId = cowl.QE_FLOW_SERIES_CHART_ID + formQueryIdSuffix,
                selectArray = queryFormModel.select().replace(/ /g, "").split(",");

            if (selectArray.indexOf("T=") !== -1 && $('#' + flowSeriesChartId).length === 0) {
                queryResultTabView
                    .renderNewTab(queryResultTabId, getQueryResultChartViewConfig(queryRequestPostData, self.el.id));
            }
        },

        getViewConfig: function () {
            var self = this;

            return {
                view: "SectionView",
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: 'time_range', view: "FormDropdownView",
                                    viewConfig: {
                                        path: 'time_range', dataBindValue: 'time_range', class: "span3",
                                        elementConfig: {dataTextField: "text", dataValueField: "id", data: cowc.TIMERANGE_DROPDOWN_VALUES}}
                                },
                                {
                                    elementId: 'from_time', view: "FormDateTimePickerView",
                                    viewConfig: {
                                        style: 'display: none;',
                                        path: 'from_time', dataBindValue: 'from_time', class: "span3",
                                        elementConfig: qewu.getFromTimeElementConfig('from_time', 'to_time'),
                                        visible: "time_range() == -1"
                                    }
                                },
                                {
                                    elementId: 'to_time', view: "FormDateTimePickerView",
                                    viewConfig: {
                                        style: 'display: none;',
                                        path: 'to_time', dataBindValue: 'to_time', class: "span3",
                                        elementConfig: qewu.getToTimeElementConfig('from_time', 'to_time'),
                                        visible: "time_range() == -1"
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'select', view: "FormTextAreaView",
                                    viewConfig: {path: 'select', dataBindValue: 'select', class: "span9", editPopupConfig: {
                                        renderEditFn: function() {
                                            self.renderSelect({className: cowc.QE_MODAL_CLASS_700});
                                        }
                                    }}
                                },
                                {
                                    elementId: 'time-granularity-section',
                                    view: "FormCompositeView",
                                    viewConfig: {
                                        class: "span3",
                                        style: 'display: none;',
                                        path: 'time_granularity',
                                        label: 'Time Granularity',
                                        visible: 'isSelectTimeChecked()',
                                        childView: [
                                            {
                                                elementId: 'time_granularity', view: "FormNumericTextboxView",
                                                viewConfig: {
                                                    label: false,
                                                    path: 'time_granularity',
                                                    dataBindValue: 'time_granularity',
                                                    class: "span4",
                                                    elementConfig: {min: 1}
                                                }
                                            },
                                            {
                                                elementId: 'time_granularity_unit', view: "FormDropdownView",
                                                viewConfig: {
                                                    label: false,
                                                    path: 'time_granularity_unit',
                                                    dataBindValue: 'time_granularity_unit',
                                                    dataBindOptionList: 'getTimeGranularityUnits()',
                                                    class: "span4",
                                                    elementConfig: {}
                                                }
                                            }
                                        ]

                                    }
                                }
                            ]
                        },
                        {
                            viewConfig: {
                                visible: 'show_advanced_options()'
                            },
                            columns: [
                                {
                                    elementId: 'where', view: "FormTextAreaView",
                                    viewConfig: {path: 'where', dataBindValue: 'where', class: "span9", placeHolder: "*", editPopupConfig: {
                                        renderEditFn: function() {
                                            self.renderWhere({className: cowc.QE_MODAL_CLASS_700});
                                        }
                                    }}
                                },
                                {
                                    elementId: 'direction', view: "FormDropdownView",
                                    viewConfig: {
                                        path: 'direction', dataBindValue: 'direction', class: "span3",
                                        elementConfig: {dataTextField: "text", dataValueField: "id", data: cowc.DIRECTION_DROPDOWN_VALUES}
                                    }
                                }
                            ]
                        },
                        {
                            viewConfig: {
                                visible: 'show_advanced_options()'
                            },
                            columns: [
                                {
                                    elementId: 'filters', view: "FormTextAreaView",
                                    viewConfig: {
                                        path: 'filters', dataBindValue: 'filters', class: "span9", label: cowl.TITLE_QE_FILTER, editPopupConfig: {
                                        renderEditFn: function() {
                                            self.renderFilters({className: cowc.QE_MODAL_CLASS_700});
                                        }
                                    }}
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'advanced_options', view: "FormTextView",
                                    viewConfig: {
                                        text: 'getAdvancedOptionsText()',
                                        class: "advanced-options-link",
                                        click: 'toggleAdvancedFields'
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'run_query', view: "FormButtonView", label: "Run Query",
                                    viewConfig: {
                                        class: 'display-inline-block margin-5-10-0-0',
                                        disabled: 'is_request_in_progress()',
                                        elementConfig: {
                                            btnClass: 'btn-primary'
                                        }
                                    }
                                },
                                {
                                    elementId: 'reset_query', view: "FormButtonView", label: "Reset",
                                    viewConfig: {
                                        label: "Reset",
                                        class: 'display-inline-block margin-5-10-0-0',
                                        elementConfig: {
                                            onClick: "reset"
                                        }
                                    }
                                }
                            ]
                        }
                    ]
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
            iconClass: 'icon-table',
            view: 'QueryResultGridView',
            tabConfig: {
                activate: function (event, ui) {
                    if ($('#' + queryResultGridId).data('contrailGrid')) {
                        $('#' + queryResultGridId).data('contrailGrid').refreshView();
                    }
                }
            },
            viewConfig: {
                queryRequestPostData: queryRequestPostData,
                gridOptions: {
                    titleText: cowl.TITLE_FLOW_SERIES,
                    queryQueueUrl: cowc.URL_QUERY_FLOW_QUEUE,
                    queryQueueTitle: cowl.TITLE_FLOW
                }
            }
        }
    }

    function getQueryResultChartViewConfig(queryRequestPostData, clickOutElementId) {
        var queryResultChartId = cowl.QE_FLOW_SERIES_CHART_ID,
            queryResultChartGridId = cowl.QE_FLOW_SERIES_CHART_GRID_ID,
            flowSeriesChartTabViewConfig = [];

        flowSeriesChartTabViewConfig.push({
            elementId: queryResultChartId,
            title: cowl.TITLE_CHART,
            iconClass: 'icon-bar-chart',
            view: "QueryResultLineChartView",
            tabConfig: {
                activate: function (event, ui) {
                    $('#' + queryResultChartId).find('svg').trigger('refresh');
                    if ($('#' + queryResultChartGridId).data('contrailGrid')) {
                        $('#' + queryResultChartGridId).data('contrailGrid').refreshView();
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

        return flowSeriesChartTabViewConfig;
    }

    return FlowSeriesFormView;
});