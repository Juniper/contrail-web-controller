/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'monitor/infrastructure/underlay/ui/js/underlay.utils',
    'monitor/infrastructure/underlay/ui/js/underlay.parsers'
], function (_, ContrailView, underlayUtils, underlayParsers) {
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
                    self.getViewConfig(serverCurrentTime))
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
                        title: 'Show Underlay Path(s)',
                        iconClass: 'icon-contrail-trace-flow',
                        onClick: function(rowIndex,targetElement){
                            var graphModel = underlayUtils.getUnderlayGraphModel();
                            graphModel.lastInteracted = new Date().getTime();
                            $("#" +ctwc.UNDERLAY_SEARCHFLOW_TAB_ID
                                + "-results  div.grid-canvas div.slick-cell i.icon-spinner")
                                .toggleClass('icon-cog icon-spinner icon-spin');
                            $(targetElement).toggleClass('icon-cog icon-spinner icon-spin');
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
                                    $(targetElement).toggleClass('icon-cog icon-spinner icon-spin');
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
        var headerActionConfig = [
            {
                type: 'checked-multiselect',
                iconClass: 'icon-filter',
                placeholder: 'Filter Flows',
                elementConfig: {
                    elementId: 'flowsFilterMultiselect',
                    dataTextField: 'text',
                    dataValueField: 'id',
                    selectedList: 1,
                    noneSelectedText: 'Filter Flows',
                    filterConfig: {
                        placeholder: 'Search Filter'
                    },
                    minWidth: 150,
                    height: 205,
                    data: [
                             {
                                 id: "filterFlows",
                                 text:"Filter Flows",
                                 children: [
                                     {
                                         id:"mappable",
                                         text:"Mappable",
                                         iconClass:'icon-download-alt'
                                     },{
                                         id:"unmappable",
                                         text:"Unmappable",
                                         iconClass:'icon-download-alt'
                                     },
                                 ]
                             }
                    ],
                    click: applyFlowsFilter,
                    optgrouptoggle: applyFlowsFilter,
                    control: false
                }
            }
        ];
        return headerActionConfig;
    }

    function applyFlowsFilter(event, ui) {
        var checkedRows = $('#flowsFilterMultiselect').data('contrailCheckedMultiselect').getChecked();
        var gridElId = '#' + ctwc.UNDERLAY_SEARCHFLOW_TAB_ID + "-results";
        $(gridElId).data('contrailGrid')._dataView.setFilterArgs({
            checkedRows: checkedRows
        });
        $(gridElId).data('contrailGrid')._dataView.setFilter(flowsGridFilter);
    };

    function flowsGridFilter(item, args) {
        var excludeNetworks =
            ['__UNKNOWN__', 'default-domain:default-project:ip-fabric'],
            mappable = false,
            unmappable = false;
        var checkedRows = args.checkedRows;
        $.each(checkedRows, function (checkedRowKey, checkedRowValue) {
            var checkedRowValueObj = $.parseJSON(unescape($(checkedRowValue).val()));
            if (checkedRowValueObj['value'] == 'mappable') {
                mappable = true;
            } else if (checkedRowValueObj['value'] == 'unmappable') {
                unmappable = true;
            }
        });
        if ((checkedRows.length == 0) ||
             (mappable == true && unmappable == true)) {
            return true;
        } else {
            var keysToCheck = ['sourceip', 'destip',
                'vrouter_ip', 'other_vrouter_ip', 'sourcevn', 'destvn'],
                keysToCheckLen = keysToCheck.length,
                allKeysExists = true;
            for (var i = 0; i < keysToCheckLen; i++) {
                if (_.result(item, keysToCheck[i]) == null) {
                    allKeysExists = false;
                    break;
                }
            }
            if (allKeysExists && excludeNetworks.indexOf(item['sourcevn']) == -1
                && excludeNetworks.indexOf(item['destvn']) == -1) {
                return (mappable && true);
            } else {
                return (unmappable || false);
            }
        }
    };
    return SearchFlowResultView;
});