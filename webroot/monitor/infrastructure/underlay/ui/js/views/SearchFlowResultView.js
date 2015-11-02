/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'query-result-view',
    'knockback'
], function (_, QueryResultView, Knockback) {

    var SearchFlowResultView = QueryResultView.extend({
        render: function () {
            var self = this, viewConfig = self.attributes.viewConfig,
                serverCurrentTime = getCurrentTime4MemCPUCharts();

            $.ajax({
                url: '/api/service/networking/web-server-info'
            }).done(function (resultJSON) {
                serverCurrentTime = resultJSON['serverUTCTime'];
            }).always(function() {
                self.renderView4Config(self.$el, null,
                    self.getViewConfig(serverCurrentTime))
            });
        },

        getViewConfig: function (serverCurrentTime) {
            var self = this, viewConfig = self.attributes.viewConfig,
                queryFormModel = this.model,
                reqObj = {
                    async: 'false',
                    chunkSize: parseInt(queryFormModel.limit()),
                    autoLimit: 'false'
                },
                postDataObj =
                    queryFormModel.getQueryRequestPostData(serverCurrentTime, reqObj),
                searchFlowGridColumns =
                    monitorInfraUtils.getSearchFlowGridColumns(),
                gridId = '#' + ctwc.UNDERLAY_SEARCHFLOW_TAB_ID + "-results";
            var endTime = postDataObj['formModelAttrs'].to_time_utc;
            var startTime = postDataObj['formModelAttrs'].from_time_utc;
            if(postDataObj['formModelAttrs'].time_range != -1) {
                endTime = new Date().getTime();
                startTime =
                    endTime - (1000 * parseInt(postDataObj['formModelAttrs'].time_range));
            }
            $(gridId).data('startTimeUTC',startTime);
            $(gridId).data('endTimeUTC', endTime);
            var searchFlowRemoteConfig = {
                url: "/api/qe/query",
                type: 'POST',
                data: JSON.stringify(postDataObj)
            };

            return {
                elementId: ctwl.QE_FLOW_SERIES_GRID_ID,
                title: ctwl.TITLE_RESULTS,
                view: "GridView",
                viewConfig: {
                    elementConfig:
                        getSearchFlowGridConfig(searchFlowRemoteConfig,
                            searchFlowGridColumns)
                }
           }
        }
    });

    function getSearchFlowGridConfig(searchFlowRemoteConfig, searchFlowGridColumns) {
        var gridElementConfig = {
            header: {
                title: {
                    text: 'Flows',
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
                    fixedRowHeight: 30,
                    detail: false,
                    actionCellPosition: 'start',
                    actionCell:[{
                        title: 'Show Underlay Path(s)',
                        iconClass: 'icon-contrail-trace-flow',
                        onClick: function(rowIndex,targetElement){
                            var gridId = '#' + ctwc.UNDERLAY_SEARCHFLOW_TAB_ID + "-results";
                            var dataItem = $(gridId).data('contrailGrid')
                                ._grid.getDataItem(rowIndex);
                            var startTime = $(gridId).data('startTimeUTC');
                            var endTime = $(gridId).data('endTimeUTC');
                            dataItem['startTime'] = startTime;
                            dataItem['endTime'] = endTime;
                            dataItem['startAt'] = new Date().getTime();
                            $(gridId + " div.selected-slick-row").each(
                                function(idx,obj){
                                    $(obj).removeClass('selected-slick-row');
                                }
                            );
                            $(targetElement).parent().parent()
                                .addClass('selected-slick-row');
                            monitorInfraUtils.showUnderlayPaths(dataItem);
                        }
                    }]
                },
                dataSource: {
                    remote: {
                        ajaxConfig: searchFlowRemoteConfig,
                        dataParser: function(response) {
                            var graphView = monitorInfraUtils
                                .getUnderlayGraphInstance();
                            response['vRouters'] = graphView.model.vRouters;
                            return monitorInfraParsers
                                .parseUnderlayFlowRecords(response);
                        }
                    }
                }
            },
            columnHeader: {
                columns: searchFlowGridColumns
            },
            footer: {
                pager: {
                    options: {
                        pageSize: 10,
                    }
                }
            }
        };
        return gridElementConfig;
    };

    return SearchFlowResultView;
});