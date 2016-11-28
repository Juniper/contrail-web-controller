/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var FlowGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig,
                hashParams = viewConfig['hashParams'],
                pagerOptions = viewConfig['pagerOptions'];

            var reqUrlParms =
                ctwc.constructReqURLParams($.extend({},
                                                    nmwgc.getURLConfigForFlowGrid(hashParams),
                                                    {protocol:
                                                        ["tcp", "icmp", "udp"]
                                                    })
                                          );
            var postData = {
                async: false,
                formModelAttrs: reqUrlParms.reqParams
            };
            var flowRemoteConfig = {
                url: cowc.URL_QE_QUERY,
                type: "POST",
                data: JSON.stringify(postData)
            };

            self.renderView4Config(self.$el, this.model, getFlowListViewConfig(flowRemoteConfig, pagerOptions));
        }
    });

    function getFlowListViewConfig(flowRemoteConfig, pagerOptions) {
        return {
            elementId: ctwl.PROJECT_FLOW_GRID_ID,
            title: ctwl.TITLE_FLOW_SERIES,
            view: "GridView",
            viewConfig: {
                elementConfig: getProjectFlowGridConfig(flowRemoteConfig, pagerOptions)
            }
        };
    };

    function getProjectFlowGridConfig(flowRemoteConfig, pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_FLOWS_SUMMARY
                },
                defaultControls: {
                    collapseable: false,
                    exportable: true,
                    refreshable: false,
                    searchable: true
                },
                advanceControls: getProtocolFilterActionConfig()
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    //actionCell: [
                    //    {
                    //        title: 'Start Packet Capture',
                    //        iconClass: 'icon-edit',
                    //        onClick: function(rowIndex){
                    //            startPacketCapture4Flow(ctwl.PROJECT_FLOW_GRID_ID, rowIndex, 'parseAnalyzerRuleParams4FlowByPort');
                    //        }
                    //    }
                    //]
                },
                dataSource: {
                    remote: {
                        ajaxConfig: flowRemoteConfig,
                        dataParser: function(response) {
                            return response.data
                        }
                    }
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Flows..'
                    },
                    empty: {
                        text: 'No Flows Found.'
                    }
                }
            },
            columnHeader: {
                columns: nmwgc.projectFlowsColumns
            },
            footer: {
                pager: contrail.handleIfNull(pagerOptions, { options: { pageSize: 5, pageSizeSelect: [5, 10, 50, 100] } })
            }
        };
        return gridElementConfig;
    };

    function getProtocolFilterActionConfig (){
        var headerActionConfig = [
            {
                type: 'checked-multiselect',
                iconClass: 'fa fa-filter',
                placeholder: ctwl.TITLE_FILTER_BY_PROTOCOL,
                elementConfig: {
                    elementId: ctwl.PROJECT_FILTER_PROTOCOL_MULTISELECT_ID,
                    dataTextField: 'text',
                    dataValueField: 'id',
                    noneSelectedText: ctwl.TITLE_FILTER_PROTOCOL,
                    filterConfig: {
                        placeholder: ctwl.TITLE_FILTER_BY_PROTOCOL
                    },
                    minWidth: 160,
                    height: 150,
                    emptyOptionText: 'No Protocol found',
                    data: [{
                        id: 'Protocol',
                        text: 'Protocol',
                        children: ctwc.PROTOCOL_MAP
                    }],
                    click: applyProtocolFilter,
                    optgrouptoggle: applyProtocolFilter,
                    control: false
                }
            }
        ];
        return headerActionConfig;
    };

    function applyProtocolFilter (event, ui) {
        var checkedRows = $('#' + ctwl.PROJECT_FILTER_PROTOCOL_MULTISELECT_ID).data('contrailCheckedMultiselect').getChecked(),
            flowsGrid = $('#' + ctwl.FLOWS_GRID_ID).data('contrailGrid'),
            checkedProtocols = [];

        $.each(checkedRows, function (checkedRowKey, checkedRowValue) {
            checkedProtocols.push(parseInt($.parseJSON(unescape($(checkedRowValue).val())).value));
        });

        flowsGrid._dataView.setFilterArgs({checkedProtocols: checkedProtocols});
        flowsGrid._dataView.setFilter(function (item, args) {
            if (args['checkedProtocols'].length == 0) {
                return true;
            }
            if (args['checkedProtocols'].indexOf(item['protocol']) > -1)
                return true;
            return false;
        });
    };

    return FlowGridView;
});
