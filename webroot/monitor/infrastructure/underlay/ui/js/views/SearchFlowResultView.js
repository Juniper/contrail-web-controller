/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'monitor/infrastructure/underlay/ui/js/underlay.utils',
    'monitor/infrastructure/underlay/ui/js/underlay.parsers',
    'chart-utils'
], function (_, ContrailView, underlayUtils, underlayParsers, chUtils) {
    var SearchFlowResultView = ContrailView.extend({
        render: function () {
            var self = this, viewConfig = self.attributes.viewConfig,
                serverCurrentTime = chUtils.getCurrentTime4MemCPUCharts();

            $.ajax({
                url: '/api/service/networking/web-server-info'
            }).done(function (resultJSON) {
                serverCurrentTime = resultJSON['serverUTCTime'];
            }).always(function() {
                self.renderView4Config(self.$el, null,
                    self.getViewConfig(serverCurrentTime));
            });
        },

        getViewConfig: function (serverCurrentTime) {
            var self = this, viewConfig = self.attributes.viewConfig,
                queryFormModel = this.model,
                limit = parseInt(queryFormModel.limit()),
                reqObj = {
                    async: false,
                    chunkSize: limit,
                    autoLimit: 'false'
                };
                queryFormModel.filters("limit: "+limit);
                queryFormModel.filter_json(JSON.stringify({limit: limit}));
                postDataObj =
                    queryFormModel.getQueryRequestPostData(serverCurrentTime, reqObj),
                searchFlowGridColumns =
                    underlayUtils.getSearchFlowGridColumns(),
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
                },
                advanceControls: getHeaderActionConfig()
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    fixedRowHeight: 30,
                    detail: false,
                    actionCellPosition: 'start',
                    actionCell:[{
                        title: 'Show Underlay Path',
                        iconClass: 'icon-contrail-trace-flow',
                        onClick: function(rowIndex,targetElement){
                            var graphModel = underlayUtils.getUnderlayGraphModel();
                            graphModel.lastInteracted = new Date().getTime();
                            $("#" +ctwc.UNDERLAY_SEARCHFLOW_TAB_ID
                                + "-results  div.grid-canvas div.slick-cell i.fa-spinner")
                                .toggleClass('fa-cog fa-spinner fa-spin');
                            $(targetElement).toggleClass('fa-cog fa-spinner fa-spin');
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
                            var deferredObj = $.Deferred();
                            underlayUtils.showUnderlayPaths(dataItem, graphModel, deferredObj);
                            deferredObj.always(function (resetLoading) {
                                if(resetLoading) {
                                    $(targetElement).toggleClass('fa-cog fa-spinner fa-spin');
                                }
                            });
                        }
                    }]
                },
                dataSource: {
                    remote: {
                        ajaxConfig: searchFlowRemoteConfig,
                        dataParser: function(response) {
                            var graphModel = underlayUtils
                                .getUnderlayGraphModel();
                            return underlayParsers
                                .parseUnderlayFlowRecords(response, graphModel.getVirtualRouters());
                        },
                        successCallback: function() {
                            $("#applySearchFlowsFilter").click();
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
    function getHeaderActionConfig() {
        var headerActionConfig = [{
            "type": "link",
            "title": 'Show all flows',
            "linkElementId": "applySearchFlowsFilter",
            "iconClass": "fa fa-filter disabled",
            "onClick": function () {
                var gridElId =
                '#' + ctwc.UNDERLAY_SEARCHFLOW_TAB_ID + "-results";
                var applyFilter =
                    $("#applySearchFlowsFilter").find('i').hasClass("disabled") ?
                        true : false;
                if(true == applyFilter) {
                    $("#applySearchFlowsFilter").prop("title", "Show all flows");
                    $("#applySearchFlowsFilter").find("i").css("color", "#000");
                } else {
                    $("#applySearchFlowsFilter").prop("title", "Show filtered flows");
                    $("#applySearchFlowsFilter").find("i").css("color", "#898989");
                }
                $(gridElId).data('contrailGrid')._dataView.setFilterArgs({
                    applyFilter: applyFilter
                });
                $(gridElId).data('contrailGrid')._dataView.
                    setFilter(flowsGridFilter);
                $("#applySearchFlowsFilter").find('i').toggleClass("disabled");
            }
        }];
        return headerActionConfig;
    }

    function flowsGridFilter(item, args) {
        var applyFilter = args.applyFilter;
        if(applyFilter == false)
            return true;
        var excludeNetworks =
                ['__UNKNOWN__', 'default-domain:default-project:ip-fabric'],
            keysToCheck = ['sourceip', 'destip', 'vrouter_ip',
                'other_vrouter_ip', 'sourcevn', 'destvn'],
                keysToCheckLen = keysToCheck.length,
                allKeysExists = true;
            for (var i = 0; i < keysToCheckLen; i++) {
                if (_.result(item, keysToCheck[i]) == null) {
                    allKeysExists = false;
                    break;
                }
            }
            if (allKeysExists &&
                excludeNetworks.indexOf(item['sourcevn']) == -1 &&
                excludeNetworks.indexOf(item['destvn']) == -1) {
                return true;
            } else {
                return false;
            }
    };
    return SearchFlowResultView;
});