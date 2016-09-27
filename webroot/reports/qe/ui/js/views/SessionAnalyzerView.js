/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "contrail-view",
    "contrail-list-model",
    "core-basedir/reports/qe/ui/js/common/qe.utils",
    "core-basedir/reports/qe/ui/js/common/qe.grid.config",
    "controller-basedir/reports/qe/ui/js/models/SessionAnalyzerModel"
], function (_, ContrailView, ContrailListModel, qeUtils, qeGridConfig, SessionAnalyzerModel) {
    var SessionAnalyzerView = ContrailView.extend({
        render: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                saQueryId = contrail.handleIfNull(viewConfig.queryId, qeUtils.generateQueryUUID()),
                saDataMap = cowc.MAP_SESSION_ANALYZER_DATA_KEY;

            self.selectedFlowRecord = viewConfig.selectedFlowRecord;
            self.queryFormAttributes = viewConfig.queryFormAttributes;

            self.model = new SessionAnalyzerModel({
                queryFormAttributes: self.queryFormAttributes,
                selectedFlowRecord: self.selectedFlowRecord,
                parseFn: function(response) {
                    return sessionAnalyzerDataParser(response, saDataMap);
                }
            });
            modelMap[cowc.UMID_SA_SUMMARY_MODEL] = self.model;

            var lineChartModel = new ContrailListModel({ data: [] });
            modelMap[cowc.UMID_SA_SUMMARY_LINE_CHART_MODEL] = lineChartModel;
            modelMap[cowc.UMID_SA_SUMMARY_LIST_MODEL] = self.model.primaryListModel;

            self.model.initComplete.subscribe(function() {
                //Lets extend the main data map with the queryPostData for each keys
                var queryRequestPostDataMap = self.model.getQueryRequestPostDataMap();
                _.forEach([
                    cowc.SESSION_ANALYZER_INGRESS_KEY,
                    cowc.SESSION_ANALYZER_EGRESS_KEY,
                    cowc.SESSION_ANALYZER_REVERSE_INGRESS_KEY,
                    cowc.SESSION_ANALYZER_REVERSE_EGRESS_KEY
                ], function(SA_KEY) {
                    saDataMap[SA_KEY].queryRequestPostData = queryRequestPostDataMap[SA_KEY];
                });
                saDataMap[cowc.SESSION_ANALYZER_KEY].queryRequestPostData = getQueryRequestPostData4SummaryModel(saDataMap, saQueryId);

                var queryPrefix = cowc.SA_QUERY_PREFIX,
                    saQueryIdSuffix = "-" + saQueryId,
                    sessionAnalyzerTmpl = contrail.getTemplate4Id(ctwc.TMPL_SESSION_ANALYZER),
                    sessionAnalyzerChartId = "qe-" + queryPrefix + "-result-chart" + saQueryIdSuffix,
                    sessionAnalyzerResultTabId = "qe-" + queryPrefix + "-result-tab" + saQueryIdSuffix;

                self.$el.html(sessionAnalyzerTmpl({ queryPrefix: queryPrefix, saQueryIdSuffix: saQueryIdSuffix }));

                //Render Line chart.
                self.renderView4Config(self.$el.find("#" + sessionAnalyzerChartId), null,
                    self.getSessionAnalyzerChartViewConfig(saDataMap), null, null, modelMap, null);

                function getChartData() {
                    var chartEnableKeys = _.clone(cowc.SESSION_ANALYZER_CHART_DATA_KEY);

                    return formatChartData(modelMap, saDataMap[cowc.SESSION_ANALYZER_KEY].queryRequestPostData.formModelAttrs,
                        chartEnableKeys);
                }

                self.model.onAllRequestsComplete.subscribe(function() {
                    lineChartModel.setData(getChartData());

                    if (self.model.error) {
                        lineChartModel.error = true;
                        lineChartModel.errorList.concat(self.model.errorList);
                    }
                });

                self.model.onDataUpdate.subscribe(function() {
                    lineChartModel.setData(getChartData());
                    lineChartModel.onDataUpdate.notify();
                });

                //Render Grid Tabs. build the modelMap using the child models.
                _.forEach(self.model.childModelObjs, function(modelObj) {
                    switch (modelObj.modelConfig.id) {
                        case cowc.SESSION_ANALYZER_INGRESS_KEY:
                            modelMap[cowc.UMID_SA_INGRESS_LIST_MODEL] = modelObj.model;
                            break;
                        case cowc.SESSION_ANALYZER_EGRESS_KEY:
                            modelMap[cowc.UMID_SA_EGRESS_LIST_MODEL] = modelObj.model;
                            break;
                        case cowc.SESSION_ANALYZER_REVERSE_INGRESS_KEY:
                            modelMap[cowc.UMID_SA_REVERSE_INGRESS_LIST_MODEL] = modelObj.model;
                            break;
                        case cowc.SESSION_ANALYZER_REVERSE_EGRESS_KEY:
                            modelMap[cowc.UMID_SA_REVERSE_EGRESS_LIST_MODEL] = modelObj.model;
                            break;
                    }
                });
                self.renderView4Config(self.$el.find("#" + sessionAnalyzerResultTabId), self.model,
                    self.getSessionAnalyzerTabViewConfig(modelMap, saDataMap), null, null, modelMap, null);
            });
        },

        getSessionAnalyzerChartViewConfig: function(saDataMap) {
            var queryId = saDataMap[cowc.SESSION_ANALYZER_KEY].queryRequestPostData.queryId,
                queryIdSuffix = "-" + queryId,
                saResultChartId = cowl.QE_SESSION_ANALYZER_RESULT_CHART_ID + queryIdSuffix,
                selectArray = saDataMap[cowc.SESSION_ANALYZER_KEY].queryRequestPostData.formModelAttrs.select.replace(/ /g, "").split(","),
                aggregateSelectFields = qeUtils.getAggregateSelectFields(selectArray),
                chartAxesOptions = {};

            _.forEach(aggregateSelectFields, function(selectFieldValue) {
                var yFormatterKey = cowc.QUERY_COLUMN_FORMATTER[selectFieldValue];

                chartAxesOptions[selectFieldValue] = {
                    axisLabelDistance: 5,
                    yAxisLabel: selectFieldValue,
                    yAxisDataField: selectFieldValue,
                    forceY: [0, 10],
                    yFormatter: function(d) {
                        return cowf.getFormattedValue(yFormatterKey, d);
                    }
                };
            });


            return {
                elementId: saResultChartId,
                title: cowl.TITLE_CHART,
                view: "LineWithFocusChartView",
                viewConfig: {
                    widgetConfig: {
                        elementId: saResultChartId + "-widget",
                        view: "WidgetView",
                        viewConfig: {
                            header: false,
                            controls: {
                                top: false,
                                right: {
                                    custom: {
                                        filterY: {
                                            enable: true,
                                            iconClass: "fa fa-filter",
                                            title: "Filter",
                                            events: cowu.getFilterEvent(),
                                            viewConfig: getLineChartFilterConfig(queryId, aggregateSelectFields, saResultChartId)
                                        }
                                    }
                                }
                            },
                        }
                    },
                    chartOptions: {
                        chartAxesOptions: chartAxesOptions,
                        chartAxesOptionKey: aggregateSelectFields[0],
                        statusMessageHandler: function(requestState) {
                            if (requestState === cowc.DATA_REQUEST_STATE_FETCHING) {
                                return cowm.DATA_FETCHING;
                            } else if (requestState === cowc.DATA_REQUEST_STATE_ERROR) {
                                return cowm.DATA_ERROR;
                            } else if (requestState === cowc.DATA_REQUEST_STATE_SUCCESS_EMPTY) {
                                return cowm.DATA_FETCHING;
                            } else {
                                return "Unhandled request state";
                            }
                        },
                    },
                    loadChartInChunks: true,
                    modelKey: cowc.UMID_SA_SUMMARY_LINE_CHART_MODEL
                }
            };
        },

        getSessionAnalyzerTabViewConfig: function(modelMap, saDataMap) {
            var queryIdSuffix = "-" + saDataMap[cowc.SESSION_ANALYZER_KEY].queryRequestPostData.queryId,
                saGridTabPrefix = cowl.QE_SESSION_ANALYZER_RESULT_GRID_TAB_ID + queryIdSuffix,
                saGridSummaryTabId = saGridTabPrefix + cowl.QE_SESSION_ANALYZER_SUMMARY_SUFFIX_ID,
                saGridIngressTabId = saGridTabPrefix + "-" + saDataMap[cowc.SESSION_ANALYZER_INGRESS_KEY].queryRequestPostData.queryId + cowl.QE_INGRESS_SUFFIX_ID,
                saGridEgressTabId = saGridTabPrefix + "-" + saDataMap[cowc.SESSION_ANALYZER_EGRESS_KEY].queryRequestPostData.queryId + cowl.QE_EGRESS_SUFFIX_ID,
                saGridReverseIngressTabId = saGridTabPrefix + "-" + saDataMap[cowc.SESSION_ANALYZER_REVERSE_INGRESS_KEY].queryRequestPostData.queryId + cowl.QE_REVERSE_INGRESS_SUFFIX_ID,
                saGridReverseEgressTabId = saGridTabPrefix + "-" + saDataMap[cowc.SESSION_ANALYZER_REVERSE_EGRESS_KEY].queryRequestPostData.queryId + cowl.QE_REVERSE_EGRESS_SUFFIX_ID;

            function onActivateGridTab(gridId) {
                var queryGrid = $("#" + gridId).data("contrailGrid");
                if (queryGrid) {
                    queryGrid.refreshView();
                    if (queryGrid._dataView.getItems().length === 0) {
                        setTimeout(function() {
                            queryGrid.showGridMessage("empty");
                        }, 1000);
                    }
                }
            }

            return {
                elementId: saGridTabPrefix,
                view: "TabsView",
                viewConfig: {
                    theme: cowc.TAB_THEME_WIDGET_CLASSIC,
                    tabs: [{
                        elementId: saGridSummaryTabId,
                        title: cowl.TITLE_SESSION_ANALYZER_SUMMARY,
                        view: "GridView",
                        tabConfig: {
                            activate: function() {
                                if ($("#" + saGridSummaryTabId).data("contrailGrid")) {
                                    $("#" + saGridSummaryTabId).data("contrailGrid").refreshView();
                                }
                            }
                        },
                        viewConfig: {
                            elementConfig: getSummaryGridConfig(modelMap,
                                saDataMap[cowc.SESSION_ANALYZER_KEY].queryRequestPostData.formModelAttrs,
                                gridSummaryRowOnClick, {
                                    titleText: cowl.TITLE_FLOW_RECORD,
                                    queryQueueUrl: cowc.URL_QUERY_FLOW_QUEUE,
                                    queryQueueTitle: cowl.TITLE_FLOW,
                                }),
                            modelConfig: {
                                data: []
                            },
                            modelKey: cowc.UMID_SA_SUMMARY_LIST_MODEL
                        }
                    }, {
                        elementId: saGridIngressTabId,
                        title: cowl.TITLE_INGRESS,
                        view: "QueryResultGridView",
                        tabConfig: {
                            activate: function(event, ui) {
                                onActivateGridTab(saGridIngressTabId, event, ui);
                            }
                        },
                        viewConfig: {
                            queryRequestPostData: saDataMap[cowc.SESSION_ANALYZER_INGRESS_KEY].queryRequestPostData,
                            gridOptions: {
                                titleText: cowl.TITLE_FLOW_SERIES,
                                queryQueueUrl: cowc.URL_QUERY_FLOW_QUEUE,
                                queryQueueTitle: cowl.TITLE_FLOW
                            },
                            modelKey: cowc.UMID_SA_INGRESS_LIST_MODEL
                        }
                    }, {
                        elementId: saGridEgressTabId,
                        title: cowl.TITLE_EGRESS,
                        view: "QueryResultGridView",
                        tabConfig: {
                            activate: function(event, ui) {
                                onActivateGridTab(saGridEgressTabId, event, ui);
                            }
                        },
                        viewConfig: {
                            queryRequestPostData: saDataMap[cowc.SESSION_ANALYZER_EGRESS_KEY].queryRequestPostData,
                            gridOptions: {
                                titleText: cowl.TITLE_FLOW_SERIES,
                                queryQueueUrl: cowc.URL_QUERY_FLOW_QUEUE,
                                queryQueueTitle: cowl.TITLE_FLOW
                            },
                            modelKey: cowc.UMID_SA_EGRESS_LIST_MODEL
                        }
                    }, {
                        elementId: saGridReverseIngressTabId,
                        title: cowl.TITLE_REVERSE_INGRESS,
                        view: "QueryResultGridView",
                        tabConfig: {
                            activate: function(event, ui) {
                                onActivateGridTab(saGridReverseIngressTabId, event, ui);
                            }
                        },
                        viewConfig: {
                            queryRequestPostData: saDataMap[cowc.SESSION_ANALYZER_REVERSE_INGRESS_KEY].queryRequestPostData,
                            gridOptions: {
                                titleText: cowl.TITLE_FLOW_SERIES,
                                queryQueueUrl: cowc.URL_QUERY_FLOW_QUEUE,
                                queryQueueTitle: cowl.TITLE_FLOW
                            },
                            modelKey: cowc.UMID_SA_REVERSE_INGRESS_LIST_MODEL
                        }
                    }, {
                        elementId: saGridReverseEgressTabId,
                        title: cowl.TITLE_REVERSE_EGRESS,
                        view: "QueryResultGridView",
                        tabConfig: {
                            activate: function(event, ui) {
                                onActivateGridTab(saGridReverseEgressTabId, event, ui);
                            }
                        },
                        viewConfig: {
                            queryRequestPostData: saDataMap[cowc.SESSION_ANALYZER_REVERSE_EGRESS_KEY].queryRequestPostData,
                            gridOptions: {
                                titleText: cowl.TITLE_FLOW_SERIES,
                                queryQueueUrl: cowc.URL_QUERY_FLOW_QUEUE,
                                queryQueueTitle: cowl.TITLE_FLOW
                            },
                            modelKey: cowc.UMID_SA_REVERSE_EGRESS_LIST_MODEL
                        }
                    }]
                }
            };
        }

    });

    function sessionAnalyzerDataParser(response, saDataMap) {
        var dataSeries = [],
            keyMap = cowc.MAP_SESSION_ANALYZER_DATA_KEY;

        _.forEach(response, function(data, idx) {
            var gridData = {};
            if (contrail.checkIfExist(saDataMap[data.key].queryRequestPostData)) {
                gridData = getSummaryGridColumnValuesFromWhereClause(saDataMap[data.key].queryRequestPostData.formModelAttrs);
            }
            gridData.cgrid = "id_" + idx;
            gridData.key = data.key;
            gridData.name = keyMap[data.key].label;
            gridData.values = data.values;
            dataSeries.push(gridData);
        });
        return dataSeries;
    }

    function getQueryRequestPostData4SummaryModel(saDataMap, queryId) {

        //for primary summary model, for now, we will use that of ingress model.
        var summaryQueryRequestPostData = $.extend(true, {}, saDataMap[cowc.SESSION_ANALYZER_INGRESS_KEY].queryRequestPostData);

        // Add query ID to the map. for primary will generate one and all child query id will be added to its key.
        summaryQueryRequestPostData.queryId = queryId;

        summaryQueryRequestPostData.formModelAttrs.table_name = cowc.SESSION_ANALYZER_TABLE;

        return summaryQueryRequestPostData;
    }

    function getSummaryGridColumnValuesFromWhereClause(formModelAttrs) {
        var gridColumns = {},
            whereClause = formModelAttrs.where;

        var whereClauseArray = whereClause.slice(1, -1).split(" AND ");

        _.forEach(whereClauseArray, function(whereClause) {
            var keyValArray = whereClause.replace(/ /g, "").split("=");
            gridColumns[keyValArray[0]] = keyValArray[1];
        });
        return gridColumns;
    }

    function getLineChartFilterConfig(queryId, aggregateSelectFields, saLineChartId) {
        var filterConfig = {
            groupType: "1-cols",
            groups: [{
                id: "by-node-color-sa-" + queryId,
                title: false,
                type: "radio",
                items: []
            }]
        };
        _.forEach(aggregateSelectFields, function(selectFieldValue) {
            filterConfig.groups[0].items.push({
                text: selectFieldValue,
                events: {
                    click: function() {
                        var chartModel = $("#" + saLineChartId).data("chart"),
                            chartOptions = chartModel.chartOptions,
                            chartAxesOption = chartOptions.chartAxesOptions[selectFieldValue];

                        chartModel.yAxis.axisLabel(chartAxesOption.yAxisLabel)
                            .axisLabelDistance(chartAxesOption.axisLabelDistance)
                            .tickFormat(chartAxesOption.yFormatter)
                            .showMaxMin(false);

                        chartModel.lines.forceY(chartAxesOption.forceY);
                        chartModel.lines2.forceY(chartAxesOption.forceY);

                        chartModel.chartOptions.chartAxesOptionKey = selectFieldValue;
                        chartModel.update();
                    }
                }
            });
        });

        return filterConfig;
    }

    function getBadgeColorkey(chartEnableKeys) {
        var badgeColorKey = null;

        $.each(chartEnableKeys, function(colorKey, colorValue) { // eslint-disable-line
            if (colorValue === null) {
                badgeColorKey = colorKey;
                return false;
            }
        });

        return badgeColorKey;
    }

    function formatChartData(modelMap, formModelAttrs, chartEnableKeys) {
        var chartListModel = modelMap[cowc.UMID_SA_SUMMARY_LIST_MODEL],
            selectArray = formModelAttrs.select.replace(/ /g, "").split(","),
            aggregateSelectFields = qeUtils.getAggregateSelectFields(selectArray),
            chartData = [];

        var chartModelItems = chartListModel.getItems();

        _.forEach(chartModelItems, function(item) {
            var itemValues = {};
            //Indexing values based on timestamp.
            _.forEach(item.values, function(value) {
                itemValues[value.T / 1000] = value;
            });
            item.values = itemValues;

            //Update the missing timestamps.
            qeUtils.addChartMissingPoints(item, formModelAttrs, aggregateSelectFields);
        });

        _.forEach(chartEnableKeys, function(colorValue, colorKey) {
            if (colorValue !== null) {

                _.forEach(chartModelItems, function(item) {
                    if (item.key === colorValue) {
                        var chartDataValue = {
                            cgrid: "id_" + colorKey,
                            key: colorKey,
                            values: [],
                            color: cowc.D3_COLOR_CATEGORY7[colorKey]
                        };

                        _.forEach(item.values, function(fcItemValue, fcItemKey) {
                            var ts = parseInt(fcItemKey),
                                chartDataValueItemObj = { x: ts };

                            _.forEach(aggregateSelectFields, function(selectFieldValue) {
                                chartDataValueItemObj[selectFieldValue] = fcItemValue[selectFieldValue];
                            });

                            chartDataValue.values.push(chartDataValueItemObj);
                        });
                        chartData.push(chartDataValue);
                    }
                });
            }
        });
        return chartData;
    }

    function gridSummaryRowOnClick(e, dc, modelMap, formModelAttrs, chartEnableKeys) {
        var lineChartModel = modelMap[cowc.UMID_SA_SUMMARY_LINE_CHART_MODEL],
            badgeElement = $(e.target).parent(),
            badgeColorKey = badgeElement.data("color_key");

        if (badgeColorKey >= 0 && _.compact(chartEnableKeys).length > 1) {
            badgeElement.data("color_key", -1);
            badgeElement.removeClass("icon-badge-color-" + badgeColorKey);
            chartEnableKeys[badgeColorKey] = null;
            lineChartModel.setData(formatChartData(modelMap, formModelAttrs, chartEnableKeys));
        } else if (badgeColorKey < 0) {
            badgeColorKey = getBadgeColorkey(chartEnableKeys);

            if (badgeColorKey !== null) {
                badgeElement.data("color_key", badgeColorKey);
                badgeElement.addClass("fa icon-badge-color-" + badgeColorKey);
                chartEnableKeys[badgeColorKey] = dc.key;
                lineChartModel.setData(formatChartData(modelMap, formModelAttrs, chartEnableKeys));
            }
        }
    }

    function getSummaryGridConfig(modelMap, formModelAttrs, summaryRowOnClickFn, gridOptions) {
        var chartEnableKeys = _.clone(cowc.SESSION_ANALYZER_CHART_DATA_KEY), //will show all data in chart by default.
            selectArray = formModelAttrs.select.replace(/ /g, "").split(","),
            saDefaultGridColumns = qeGridConfig.getColumnDisplay4Grid(formModelAttrs.table_name, formModelAttrs.table_type, selectArray),
            saDefaultGridIds = ["sourcevn", "destvn", "sourceip", "destip", "sport", "dport", "protocol", "direction_ing"],
            saSummaryGridColumns = [];

        _.forEach(saDefaultGridIds, function(gridId) {
            _.forEach(saDefaultGridColumns, function(gridCol) {
                if (gridId === gridCol.id) {
                    saSummaryGridColumns.push(gridCol);
                }
            });
        });

        var summaryAddColumns = [{
            id: "fc-badge",
            field: "",
            name: "",
            cssClass: "center",
            resizable: false,
            sortable: false,
            width: 30,
            minWidth: 30,
            searchable: false,
            exportConfig: { allow: false },
            formatter: function(r, c, v, cd, dc) {
                return ['<span class="label-icon-badge label-icon-badge-', dc.key, " icon-badge-color-", r,
                    ' " data-color_key="', r, '"><i class="fa fa-square"></i></span>'
                ].join("");
            },
            events: {
                onClick: function(e, dc) {
                    summaryRowOnClickFn(e, dc, modelMap, formModelAttrs, chartEnableKeys);
                }
            }
        }, {
            id: "name",
            field: "name",
            width: 150,
            name: "Type",
            groupable: false,
            formatter: function(r, c, v, cd, dc) {
                return cowu.handleNull4Grid(dc.name);
            }
        }];

        saSummaryGridColumns = summaryAddColumns.concat(saSummaryGridColumns);

        return qeGridConfig.getQueryGridConfig(null, saSummaryGridColumns, gridOptions);
    }

    return SessionAnalyzerView;
});
