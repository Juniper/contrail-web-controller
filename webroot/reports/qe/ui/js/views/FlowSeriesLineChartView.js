/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'query-line-chart-view'
], function (_, ContrailView, ContrailListModel, QueryLineChartView) {

    var FlowSeriesLineChartView = QueryLineChartView.extend({
        render: function() {
            var self = this;
            if (self.model.getLength() > 0) {
                var viewConfig = self.attributes.viewConfig,
                    queryId = viewConfig['queryId'],
                    selectArray = viewConfig['selectArray'],
                    flowSeriesChartGridId = viewConfig.flowSeriesChartGridId,
                    modelMap = contrail.handleIfNull(self.modelMap, {});

                modelMap[cowc.UMID_FLOW_SERIES_LINE_CHART_MODEL] = new ContrailListModel({data: []});
                modelMap[cowc.UMID_FLOW_SERIES_CHART_MODEL] = getChartDataModel(queryId, modelMap);
                self.renderView4Config(self.$el, null, getQueryChartViewConfig(queryId, selectArray, modelMap, self, flowSeriesChartGridId), null, null, modelMap);
            }
        }
    });

    function getQueryChartViewConfig(queryId, selectArray, modelMap, parentView, flowSeriesChartGridId) {
        var queryFormModel = modelMap[cowc.UMID_FLOW_SERIES_FORM_MODEL],
            flowUrl = '/api/qe/query/chart-groups?queryId=' + queryId,
            queryIdSuffix = '-' + queryId,
            aggregateSelectFields = qewu.getAggregateSelectFields(queryFormModel),
            flowSeriesLineChartId = cowl.QE_FLOW_SERIES_LINE_CHART_ID + queryIdSuffix,
            chartAxesOptions = {};

        $.each(aggregateSelectFields, function(selectFieldKey, selectFieldValue) {
            var yFormatterKey = cowc.MAP_Y_FORMATTER[selectFieldValue];

            chartAxesOptions[selectFieldValue] = {
                axisLabelDistance: 5,
                yAxisLabel: selectFieldValue,
                forceY: [0, 60],
                yFormatter: cowf.getYAxisFormatterFunction4Chart(yFormatterKey)
            };
        });

        return {
            elementId: cowl.QE_FLOW_SERIES_CHART_PAGE_ID + queryIdSuffix,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: flowSeriesLineChartId,
                                title: cowl.TITLE_CHART,
                                view: "LineWithFocusChartView",
                                viewConfig: {
                                    widgetConfig: {
                                        elementId: flowSeriesLineChartId + '-widget',
                                        view: "WidgetView",
                                        viewConfig: {
                                            header: false,
                                            controls: {
                                                top: false,
                                                right: {
                                                    custom: {
                                                        filterChart: {
                                                            enable: true,
                                                            viewConfig: getFilterConfig(queryId, aggregateSelectFields, flowSeriesLineChartId, modelMap)
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    chartOptions: {
                                        chartAxesOptions: chartAxesOptions,
                                        chartAxesOptionKey: aggregateSelectFields[0]
                                    },
                                    loadChartInChunks: true,
                                    modelKey: cowc.UMID_FLOW_SERIES_LINE_CHART_MODEL
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: flowSeriesChartGridId,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getChartGridViewConfig(flowUrl, selectArray, modelMap, parentView)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    function getBadgeColorkey(chartColorAvailableKeys) {
        var badgeColorKey = null;

        $.each(chartColorAvailableKeys, function(colorKey, colorValue) {
           if (colorValue === null) {
               badgeColorKey = colorKey;
               return false;
           }
        });

        return badgeColorKey
    }

    function getChartGridViewConfig(flowUrl, selectArray, modelMap, parentView) {
        var columnDisplay = qewgc.getColumnDisplay4Grid(cowc.FLOW_CLASS, cowc.QE_FLOW_TABLE_TYPE, selectArray),
            lineWithFocusChartModel = modelMap[cowc.UMID_FLOW_SERIES_LINE_CHART_MODEL],
            chartColorAvailableKeys = ['id_0', null, null, null, null],
            display = [
                {
                    id: 'fc-badge', field:"", name:"", resizable: false, sortable: false, width: 30, minWidth: 30, searchable: false, exportConfig: { allow: false },
                    formatter: function(r, c, v, cd, dc){
                        return '<span class="label-icon-badge label-icon-badge-' + dc.cgrid + ((r === 0) ? ' icon-badge-color-0' : '') + '" data-color_key="' + ((r === 0) ? 0 : -1) + '"><i class="icon-circle"></i></span>';
                    },
                    events: {
                        onClick: function(e, dc) {
                            var badgeElement = $(e.target).parent(),
                                badgeColorKey = badgeElement.data('color_key');

                            if (badgeColorKey >= 0 && _.compact(chartColorAvailableKeys).length > 1) {
                                badgeElement.data('color_key', -1);
                                badgeElement.removeClass('icon-badge-color-' + badgeColorKey);
                                chartColorAvailableKeys[badgeColorKey] = null;
                                lineWithFocusChartModel.setData(formatChartData(modelMap, chartColorAvailableKeys));
                            } else if (badgeColorKey < 0) {
                                badgeColorKey =  getBadgeColorkey(chartColorAvailableKeys);

                                if (badgeColorKey !== null) {
                                    badgeElement.data('color_key', badgeColorKey);
                                    badgeElement.addClass('icon-badge-color-' + badgeColorKey);
                                    chartColorAvailableKeys[badgeColorKey] = dc.cgrid;
                                    lineWithFocusChartModel.setData(formatChartData(modelMap, chartColorAvailableKeys));
                                }
                            }
                        }
                    }
                },
                {
                    id: 'fc-details', field:"", name:"", resizable: false, sortable: false, width: 30, minWidth: 30, searchable: false, exportConfig: { allow: false },
                    formatter: function(r, c, v, cd, dc){
                        return '<i class="icon-external-link-sign"></i>';
                    },
                    cssClass: 'cell-hyperlink-blue',
                    events: {
                        onClick: qewgc.getOnClickFlowRecord(parentView, parentView.modelMap[cowc.UMID_FLOW_SERIES_FORM_MODEL])
                    }
                }
            ];

        columnDisplay = display.concat(columnDisplay);

        var viewConfig = {
            header: {},
            columnHeader: {
                columns: columnDisplay
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    fixedRowHeight: 30
                },
                dataSource:{
                    remote: {
                        ajaxConfig: {
                            url: flowUrl,
                            type: 'GET'
                        },
                        serverSidePagination: true
                    }
                }
            },
            footer: {
                pager: {
                    options: {
                        pageSize: 100,
                        pageSizeSelect: [100, 200, 500]
                    }
                }
            }
        };

        return viewConfig;
    };

    function getChartDataModel(queryId, modelMap) {
        var lineWithFocusChartModel = modelMap[cowc.UMID_FLOW_SERIES_LINE_CHART_MODEL],
            chartUrl = '/api/admin/reports/query/chart-data?queryId=' + queryId,
            chartListModel = new ContrailListModel({
            remote: {
                ajaxConfig: {
                    url: chartUrl,
                    type: 'GET'
                },
                dataParser: qewp.fsQueryDataParser
            }
        });

        chartListModel.onAllRequestsComplete.subscribe(function() {
            if (chartListModel.getLength() > 0) {
                var chartColorAvailableKeys = ['id_0', null, null, null, null];
                lineWithFocusChartModel.setData(formatChartData(modelMap, chartColorAvailableKeys));
            } else {
                lineWithFocusChartModel.setData([])
            }

        });

        return chartListModel;
    };

    function formatChartData(modelMap, chartColorAvailableKeys) {
        var queryFormModel = modelMap[cowc.UMID_FLOW_SERIES_FORM_MODEL],
            chartListModel = modelMap[cowc.UMID_FLOW_SERIES_CHART_MODEL],
            aggregateSelectFields = qewu.getAggregateSelectFields(queryFormModel),
            chartData = [];

        $.each(chartColorAvailableKeys, function(colorKey, colorValue) {
            if (colorValue !== null) {

                var chartDataRow = chartListModel.getItemById(colorValue),
                    chartDataValue = {
                        cgrid: 'id_' + colorKey,
                        key: '#' + colorKey + ' Sum(Bytes)',
                        values: [],
                        color: d3_category5[colorKey]
                    };

                qewu.addChartMissingPoints(chartDataRow, queryFormModel, aggregateSelectFields);

                $.each(chartDataRow.values, function (fcItemKey, fcItemValue) {
                    var ts = parseInt(fcItemKey),
                        chartDataValueItemObj = {x: ts};

                    $.each(aggregateSelectFields, function(selectFieldKey, selectFieldValue) {
                        chartDataValueItemObj[selectFieldValue] = fcItemValue[selectFieldValue]
                    });

                    chartDataValue.values.push(chartDataValueItemObj);
                });

                chartData.push(chartDataValue);
            }
        });

        return chartData
    };

    function getFilterConfig(queryId, aggregateSelectFields, flowSeriesLineChartId, modelMap) {
        var filterConfig = {
            groups: [
                {
                    id: 'by-node-color',
                    title: false,
                    type: 'radio',
                    items: []
                }
            ]
        };

        $.each(aggregateSelectFields, function(selectFieldKey, selectFieldValue) {
            filterConfig.groups[0].items.push({
                text: selectFieldValue,
                events: {
                    click: function(event) {
                        var chartModel = $('#' + flowSeriesLineChartId).data('chart'),
                            chartOptions = chartModel.chartOptions,
                            chartAxesOption = chartOptions.chartAxesOptions[selectFieldValue];

                        chartModel.yAxis.axisLabel(chartAxesOption.yAxisLabel)
                            .axisLabelDistance(chartAxesOption.axisLabelDistance)
                            .tickFormat(chartAxesOption['yFormatter'])
                            .showMaxMin(false);

                        $('#' + flowSeriesLineChartId).data('chart').chartOptions.chartAxesOptionKey = selectFieldValue;
                        $('#' + flowSeriesLineChartId).data('chart').update();
                    }
                }
            })
        });

        return filterConfig
    };

    return FlowSeriesLineChartView;
});