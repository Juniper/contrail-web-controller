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
        render: function () {
            var self = this,
                contrailListModel = self.model;

            if(!(contrailListModel.isRequestInProgress())) {
               self.renderFlowSeriesLineChart()
            }

            contrailListModel.onAllRequestsComplete.subscribe(function() {
                self.renderFlowSeriesLineChart()
            });
        },

        renderFlowSeriesLineChart: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                queryId = viewConfig['queryId'],
                selectArray = viewConfig['selectArray'],
                modelMap = contrail.handleIfNull(self.modelMap, {});

            modelMap[qewc.UMID_FLOW_SERIES_LINE_CHART_MODEL] = new ContrailListModel({data: []});
            modelMap[qewc.UMID_FLOW_SERIES_CHART_MODEL] = getChartDataModel(queryId, modelMap);
            self.renderView4Config(self.$el, null, getQueryChartViewConfig(queryId, selectArray, modelMap), null, null, modelMap);
        }
    });

    function getQueryChartViewConfig(queryId, selectArray, modelMap) {
        var flowUrl = '/api/admin/reports/query/flow-classes?queryId=' + queryId;

        return {
            elementId: ctwl.QE_FLOW_SERIES_CHART_PAGE_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.QE_FLOW_SERIES_LINE_CHART_ID,
                                title: cowl.TITLE_CHART,
                                view: "LineWithFocusChartView",
                                viewConfig: {
                                    widgetConfig: {
                                        elementId: ctwl.QE_FLOW_SERIES_LINE_CHART_ID + '-widget',
                                        view: "WidgetView",
                                        viewConfig: {
                                            header: false,
                                            controls: {
                                                top: false,
                                                right: {
                                                    custom: {
                                                        zoomBySelectedArea: {
                                                            iconClass: 'icon-filter',
                                                            title: 'Filter',
                                                            events: {
                                                                click: function (event, self, controlPanelSelector) {
                                                                    console.log(event)
                                                                    console.log(self)
                                                                    console.log(controlPanelSelector)
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    chartOptions: {
                                        axisLabelDistance: 5,
                                        yAxisLabel: 'Sum(Bytes)',
                                        forceY: [0, 60],
                                        yFormatter: function(d) { return cowu.addUnits2Bytes(d, false, false, 1); }
                                    },
                                    loadChartInChunks: true,
                                    modelKey: qewc.UMID_FLOW_SERIES_LINE_CHART_MODEL
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: ctwl.QE_FLOW_SERIES_CHART_GRID_ID,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getChartGridViewConfig(flowUrl, selectArray, modelMap)
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

    function getChartGridViewConfig(flowUrl, selectArray, modelMap) {
        var columnDisplay = qewgc.getColumnDisplay4Grid(cowc.FLOW_CLASS, cowc.QE_FLOW_TABLE_TYPE, selectArray),
            lineWithFocusChartModel = modelMap[qewc.UMID_FLOW_SERIES_LINE_CHART_MODEL],
            chartListModel = modelMap[qewc.UMID_FLOW_SERIES_CHART_MODEL],
            chartColorAvailableKeys = ['id_0', null, null, null, null],
            display = [
                {
                    id: 'fc-badge', field:"", name:"", resizable: false, sortable: false,
                    width: 30, minWidth: 30, searchable: false, exportConfig: { allow: false },
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
        var lineWithFocusChartModel = modelMap[qewc.UMID_FLOW_SERIES_LINE_CHART_MODEL],
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
        var queryFormModel = modelMap[qewc.UMID_FLOW_SERIES_FORM_MODEL],
            chartListModel = modelMap[qewc.UMID_FLOW_SERIES_CHART_MODEL],
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

                qewu.addFSMissingPoints(chartDataRow, queryFormModel, ['sum(bytes)','sum(packets)'])

                $.each(chartDataRow.values, function (fcItemKey, fcItemValue) {
                    var ts = parseInt(fcItemKey);
                    chartDataValue.values.push({x: ts, y: fcItemValue['sum(bytes)'], 'sum(bytes)': fcItemValue['sum(bytes)'], 'sum(packets)': fcItemValue['sum(packets)']});
                });

                chartData.push(chartDataValue);
            }
        });

        return chartData
    }

    return FlowSeriesLineChartView;
});