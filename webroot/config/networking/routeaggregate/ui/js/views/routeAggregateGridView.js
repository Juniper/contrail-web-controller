/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/networking/routeaggregate/ui/js/models/routeAggregateModel',
    'config/networking/routeaggregate/ui/js/views/routeAggregateEditView',
    'config/networking/routeaggregate/ui/js/routeAggregateFormatter'
], function(_, ContrailView,RouteAggregateModel,
    RouteAggregateEditView, RouteAggregateFormatter) {
    var gridElId = '#' + ctwc.ROUTE_AGGREGATE_GRID_ID;
    var routeAggregateEditView = new RouteAggregateEditView();
    var routeAggregateFormatter = new RouteAggregateFormatter();
    var routeAggregateGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            self.renderView4Config(self.$el, self.model,
                getRouteAggregateGridViewConfig(pagerOptions));
        }
    });

    var getRouteAggregateGridViewConfig = function (pagerOptions) {
        return {
            elementId:
                cowu.formatElementId(
                [ctwc.CONFIG_ROUTE_AGGREGATE_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.ROUTE_AGGREGATE_GRID_ID,
                                title: ctwl.TITLE_ROUTE_AGGREGATE,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig:
                                        getConfiguration(pagerOptions)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getConfiguration = function (pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_ROUTE_AGGREGATE
                },
                advanceControls: getHeaderActionConfig()
            },
            body: {
                options: {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeleteRouteAggregate').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeleteRouteAggregate').removeClass('disabled-link');
                        }
                    },
                    actionCell:getRowActionConfig(),
                    detail: {
                        template:
                            cowu.generateDetailTemplateHTML(
                            getRouteAggregateDetailsTemplateConfig(),
                            cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Route Aggregates..'
                    },
                    empty: {
                        text: 'No Route Aggregates Found.'
                    }
                }
            },
            columnHeader: {
                columns: [
                {
                    field: "name",
                    name: "Name",
                    sortable: true,
                    sorter : comparatorIP,
                },
                {
                    field: "aggregate_route_nexthop",
                    name: "Next Hop",
                    sortable: true,
                    formatter: routeAggregateFormatter.nextHopFormatter
                },                {
                    field: "aggregate-route-entries.route",
                    name: "Routes",
                    sortable: true,
                    formatter: routeAggregateFormatter.routesFormatter
                }]
            }
        };
        return gridElementConfig;
    };

    function getRowActionConfig() {
        var rowActionConfig = [
            ctwgc.getEditAction(function (rowIndex) {
                var dataItem =
                    $(gridElId).data("contrailGrid").
                        _dataView.getItem(rowIndex);
                var routeAggregateModel = new RouteAggregateModel(dataItem),
                    checkedRow = dataItem,
                    title =
                        ctwl.TITLE_EDIT_ROUTE_AGGREGATE +
                        ' ('+ dataItem['name'] +')';

                routeAggregateEditView.model = routeAggregateModel;
                routeAggregateEditView.renderAddEditRouteAggregate(
                    {"title": ctwl.EDIT, checkedRow: checkedRow,
                        callback: function () {
                            var dataView =
                                $(gridElId).data("contrailGrid")._dataView;
                            dataView.refreshData();
                        },
                        mode : ctwl.EDIT_ACTION
                    }
                );
            }, "Edit"),
          ctwgc.getDeleteAction(function (rowIndex) {
              var dataItem = $(gridElId).data("contrailGrid").
                  _dataView.getItem(rowIndex),
                  routeAggregateModel = new RouteAggregateModel(dataItem),
                  checkedRow = [dataItem];

              routeAggregateEditView.model = routeAggregateModel;
              routeAggregateEditView.renderDeleteRouteAggregate(
                  {"title": ctwl.TITLE_ROUTE_AGGREGATE_DELETE,
                      checkedRows: checkedRow,
                      callback: function () {
                          var dataView =
                              $(gridElId).data("contrailGrid")._dataView;
                          dataView.refreshData();
                      }
                  }
              );
        })];
        return rowActionConfig;
    };

    function getHeaderActionConfig() {
        var headerActionConfig;
	        var headerActionConfig = [
	            {
                    "type" : "link",
	                "title" : ctwl.TITLE_ROUTE_AGGREGATE_MULTI_DELETE,
	                "iconClass": 'fa fa-trash',
                    "linkElementId": 'btnDeleteRouteAggregate',
	                "onClick" : function() {
	                    var routeAggregateModel = new RouteAggregateModel();
	                    var checkedRows =
	                        $(gridElId).data("contrailGrid").
	                        getCheckedRows();
                        if(checkedRows && checkedRows.length > 0) {
	                        routeAggregateEditView.model = routeAggregateModel;
	                        routeAggregateEditView.renderDeleteRouteAggregate(
	                            {"title": ctwl.TITLE_ROUTE_AGGREGATE_MULTI_DELETE,
	                                checkedRows: checkedRows,
	                                callback: function () {
	                                    var dataView =
	                                        $(gridElId).
	                                        data("contrailGrid")._dataView;
	                                    dataView.refreshData();
	                                }
	                            }
	                        );
                        }
	                }
	            },
	            {
	                "type" : "link",
	                "title" : ctwl.TITLE_ADD_ROUTE_AGGREGATE,
	                "iconClass" : "fa fa-plus",
	                "onClick" : function() {
	                    var routeAggregateModel = new RouteAggregateModel();
	                    routeAggregateEditView.model = routeAggregateModel;
	                    routeAggregateEditView.renderAddEditRouteAggregate(
	                        {"title": ctwl.CREATE,
	                            callback: function () {
	                                var dataView =
	                                    $(gridElId).
	                                    data("contrailGrid")._dataView;
	                                dataView.refreshData();
	                            },
	                            mode : ctwl.CREATE_ACTION
	                        }
	                    );
	                }
	            }
	        ];

        return headerActionConfig;
    };

    function getRouteAggregateDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    templateGenerator: 'ColumnSectionTemplateGenerator',
                    templateGeneratorConfig: {
                        columns: [{
                            class: 'col-xs-6',
                            rows: [{
                                title: 'Details',
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [{
                                    key: 'name',
                                    templateGenerator: 'TextGenerator',
                                    label: 'Name'
                                },{
                                    key: 'display_name',
                                    templateGenerator: 'TextGenerator',
                                    label: 'Display Name'
                                },{
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "UUID"
                                },{
                                    key: "aggregate_route_nexthop",
                                    templateGenerator: "TextGenerator",
                                    label: "Next Hop",
                                    templateGeneratorConfig: {
                                        formatter: "NextHopFormatter"
                                    }
                                },{
                                    key: "aggregate_route_entries.route",
                                    templateGenerator: "TextGenerator",
                                    label: "Routes",
                                    templateGeneratorConfig: {
                                        formatter: "RoutesFormatter"
                                    }
                                },{
                                    key: "service_instance_refs",
                                    templateGenerator: "TextGenerator",
                                    label: "Associate Service Instance(s)",
                                    templateGeneratorConfig: {
                                        formatter: "ServiceInstancesFormatter"
                                    }
                                }]
                            },
                            //permissions
                            ctwu.getRBACPermissionExpandDetails()]
                        }]
                    }
                }]
            }
        };
    };


    this.NextHopFormatter = function(v, dc) {
        return routeAggregateFormatter.nextHopFormatter("", "", v, "", dc);
    };
    this.RoutesFormatter = function(v, dc) {
        return routeAggregateFormatter.routesFormatter("", "", v, "", dc);
    };
    this.ServiceInstancesFormatter = function(v, dc) {
        return routeAggregateFormatter.serviceInstancesFormatter("", "", v, "", dc);
    };

    return routeAggregateGridView;
});

