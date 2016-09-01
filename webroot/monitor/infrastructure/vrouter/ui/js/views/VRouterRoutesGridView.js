/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {

    var VRouterRoutesGridView = ContrailView.extend({
        render: function () {
            var self = this, viewConfig = self.attributes.viewConfig;
            var gridGroupingOpt = {
                    groupingField :"prefix",
                    groupHeadingPrefix : 'Prefix: ',
                    rowCountSuffix : ['Route','Routes']
            };
            if(viewConfig.route_type == 'l2'){
                gridGroupingOpt.groupHeadingPrefix = 'MAC: ';
            }
            self.renderView4Config(self.$el, self.model, 
                    self.getViewConfig(self.attributes),null,null,null,
                    function(){
                        cowu.addGridGrouping ('vrouter_routes-results', gridGroupingOpt);
                    });
        },
        getViewConfig: function (attributes) {
            var viewConfig = attributes.viewConfig,
                hostname = viewConfig['hostname'],
                pagerOptions = viewConfig['pagerOptions'];
            var unicastRouteColumns = [
                                {
                                    field:"dispPrefix",
                                    id:"Prefix",
                                    name:"Prefix",
                                    hide:true,
                                    minWidth:50,
                                    searchFn:function(d){
                                        return d['prefix'];
                                    },
                                },
                                {
                                    field:"next_hop",
                                    id:"next_hop",
                                    name:"Next hop Type",
                                    formatter:function(r,c,v,cd,dc){
                                        return monitorInfraParsers.getNextHopType(dc);
                                    },
                                    minWidth:50
                                },
                                {
                                    field:"label",
                                    id:"label",
                                    name:"Next hop details",
                                    minWidth:200,
                                    formatter:function(r,c,v,cd,dc){
                                        return monitorInfraParsers.getNextHopDetails(dc);
                                    },
                                    exportConfig: {
                                        allow: true,
                                        advFormatter: function(dc) {
                                            return $(monitorInfraParsers.getNextHopDetails(dc)).text();
                                        }
                                    }
                                }
                            ];
            var l2RouteColumns = [
                                {
                                    field:"next_hop",
                                    id:"next_hop",
                                    name:"Next hop Type",
                                    formatter:function(r,c,v,cd,dc){
                                        return monitorInfraParsers.getNextHopType(dc);
                                    },
                                    minWidth:100
                                },
                                {
                                    field:"label",
                                    id:"label",
                                    name:"Next hop details",
                                    minWidth:200,
                                    formatter:function(r,c,v,cd,dc){
                                        return monitorInfraParsers.getNextHopDetailsForL2(dc);
                                    },
                                    exportConfig: {
                                        allow: true,
                                        advFormatter: function(dc) {
                                            return $(monitorInfraParsers.getNextHopDetails(dc)).text();
                                        }
                                    }
                                }
                            ];
            var unicast6RouteColums = [
                                {
                                    field:"dispPrefix",
                                    id:"Prefix",
                                    name:"Prefix",
                                    searchFn:function(d){
                                        return d['prefix'];
                                    },
                                    minWidth:50
                                },
                                {
                                    field:"next_hop",
                                    id:"next_hop",
                                    name:"Next hop Type",
                                    formatter:function(r,c,v,cd,dc){
                                        return monitorInfraParsers.getNextHopType(dc);
                                    },
                                    minWidth:50
                                },
                                {
                                    field:"label",
                                    id:"label",
                                    name:"Next hop details",
                                    minWidth:200,
                                    formatter:function(r,c,v,cd,dc){
                                        return monitorInfraParsers.getNextHopDetails(dc);
                                    },
                                    exportConfig: {
                                        allow: true,
                                        advFormatter: function(dc) {
                                            return $(monitorInfraParsers.getNextHopDetails(dc)).text();
                                        }
                                    }
                                }
                            ];
            var routeColumnMap = {
                'ucast' : unicastRouteColumns,
                'ucast6' : unicast6RouteColums,
                'l2'    : l2RouteColumns
            };
            var columns = routeColumnMap[viewConfig['route_type']];

            return {
                elementId: ctwl.VROUTER_ROUTES_GRID_VIEW_ID,
                title: 'Routes',
                view: "GridView",
                viewConfig: {
                    elementConfig: getGridConfig( columns)
                }
            }
        }
    });

    function getGridConfig( columns) {
        var gridElementConfig = {
            header: {
                title: {
                    text: 'Routes'
                },
                customControls : monitorInfraUtils.getGridPaginationControls(),
                defaultControls: {
                    collapseable: false,
                    exportable: true,
                    refreshable: false,
                    searchable: true
                }
            },
            footer:false,
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    // fixedRowHeight: 30,
                    sortable: false,
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
                columns: columns
            }
        };
        return gridElementConfig;
    };

    return VRouterRoutesGridView;
});
