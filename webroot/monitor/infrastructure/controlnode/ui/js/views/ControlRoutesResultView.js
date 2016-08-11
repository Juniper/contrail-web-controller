/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {

    var ControlRoutesResultView = ContrailView.extend({
        render: function () {
            var self = this, viewConfig = self.attributes.viewConfig;
            self.renderView4Config(self.$el, self.model, self.getViewConfig(),null,null,null,
                    function(){
                        cowu.addGridGrouping ('controlroutes-results',{
                            groupingField :"table",
                            groupHeadingPrefix : 'Routing Table: ',
                            rowCountSuffix : ['Route','Routes']
                        });
                    });
        },
        getViewConfig: function () {
            var self = this, viewConfig = self.attributes.viewConfig,
                hostname = viewConfig['hostname'],peerList = [];
                pagerOptions = viewConfig['pagerOptions'];
                var ajaxConfig = {
                        url: contrail.format(
                                monitorInfraConstants.
                                monitorInfraUrls['CONTROLNODE_PEER_LIST'],
                                hostname),
                        type:'Get',
                        async:false
                };
                contrail.ajaxHandler(ajaxConfig, null, function(model) {
                    for(var i=0; i < model.length ; i++){
                        peerList.push({id: model[i], text : model[i]});
                    }
                });
            var routesGridColumns = [
                                     {
                                        field:"table",
                                        name:"Routing Table",
                                        sortField:'table',
                                        hide:true,
                                        minWidth:200
                                     },
                                     {
                                         field:"dispPrefix",
                                         name:"Prefix",
                                         minWidth:200
                                     },
                                     {
                                         field:"protocol",
                                         name:"Protocol",
                                         minWidth:40
                                     },
                                     {
                                         field:"source",
                                         name:"Source",
                                         minWidth:130
                                     },
                                     {
                                         field:"next_hop",
                                         name:"Next hop",
                                         minWidth:70
                                     },
                                     {
                                         field:"label",
                                         name:"Label",
                                         minWidth:40
                                     },
                                     {
                                         field:"sg",
                                         name:"Security Group",
                                         minWidth:80
                                     },
                                     {
                                        field:"originVn",
                                        name:"Origin VN",
                                        minWidth:180
                                     }
                                  ];
            return {
                elementId: ctwl.CONTROLNODE_ROUTES_GRID_ID,
                title: 'Routes',
                view: "GridView",
                viewConfig: {
                    elementConfig: getControlRoutesGridConfig( routesGridColumns, peerList)
                }
            }
        }
    });
    function getHeaderActionConfig(peerList) {
        var headerActionConfig = [
            {
                type: 'checked-multiselect',
                iconClass: 'fa fa-filter',
                placeholder: 'Filter Routes',
                elementConfig: {
                    elementId: 'routeFilterMultiselect',
                    dataTextField: 'text',
                    dataValueField: 'id',
                    selectedList: 1,
                    noneSelectedText: 'Filter Routes',
                    filterConfig: {
                        placeholder: 'Search Filter'
                    },
                    minWidth: 150,
                    height: 205,
                     data : [{
                                id:"addrFamily",
                                text:"Address Family",
                                children: monitorInfraConstants.controlRouteAddressFamily
                            },
                            {
                               id:"source",
                               text:"Peer Source",
                               children: peerList
                            },
                            {
                                id:"protocol",
                                text:"Protocol",
                                children: monitorInfraConstants.controlRouteProtocol
                            }],
                    click: applyRoutesFilter,
                    optgrouptoggle: applyRoutesFilter,
                    control: false
                }
            }
        ];
        return headerActionConfig;
    }
    function routeGridFilter(item, args) {
        console.log(args);
        console.log(item);
        if (args.checkedRows.length == 0) {
            return true;
        } else {
            var returnObj = {},
                returnFlag = true;
            $.each(args.checkedRows, function (checkedRowKey, checkedRowValue) {
                console.log(checkedRowKey);
                console.log(checkedRowValue);
                var checkedRowValueObj = $.parseJSON(unescape($(checkedRowValue).val()));
                if(!contrail.checkIfExist(returnObj[checkedRowValueObj.parent])){
                    returnObj[checkedRowValueObj.parent] = false;
                }
                returnObj[checkedRowValueObj.parent] = returnObj[checkedRowValueObj.parent] || (item[checkedRowValueObj.parent] == checkedRowValueObj.value);
            });

            $.each(returnObj, function(returnObjKey, returnObjValue) {
                returnFlag = returnFlag && returnObjValue;
            });

            return returnFlag;
        }
    };

    function applyRoutesFilter(event, ui) {
        var checkedRows = $('#routeFilterMultiselect').data('contrailCheckedMultiselect').getChecked();
        var gridElId = '#controlroutes-results';
        $(gridElId).data('contrailGrid')._dataView.setFilterArgs({
            checkedRows: checkedRows
        });
        $(gridElId).data('contrailGrid')._dataView.setFilter(routeGridFilter);
    };
    function getControlRoutesGridConfig( routesGridColumns, peerList) {
        var gridElementConfig = {
            header: {
                title: {
                    text: 'Routes'
                },
                customControls : [
                                  '<a class="widget-toolbar-icon"><i class="fa fa-forward"></i></a>',
                                  '<a class="widget-toolbar-icon"><i class="fa fa-backward"></i></a>',
                              ],
                defaultControls: {
                    collapseable: false,
                    exportable: true,
                    refreshable: false,
                    searchable: true
                },
                advanceControls: getHeaderActionConfig(peerList)
            },
            footer:false,
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    fixedRowHeight: 30,
                    detail: ctwu.getDetailTemplateConfigToDisplayRawJSON()
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Routes..',
                    },
                    empty: {
                        text: 'No Routes Found.'
                    }
                }
            },
            columnHeader: {
                columns: routesGridColumns
            }
        };
        return gridElementConfig;
    };


    return ControlRoutesResultView;
});