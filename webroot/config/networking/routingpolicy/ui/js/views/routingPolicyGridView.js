/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'config/networking/routingpolicy/ui/js/models/routingPolicyModel',
    'config/networking/routingpolicy/ui/js/views/routingPolicyEditView',
    'contrail-view',
    'config/networking/routingpolicy/ui/js/views/routingPolicyFormatter'
], function (_, Backbone, RoutingPolicyModel, RoutingPolicyEditView,
             ContrailView, RoutingPolicyFormatter) {
    var routingPolicyFormatter = new RoutingPolicyFormatter();
    var routingPolicyEditView = new RoutingPolicyEditView(),
        gridElId = "#" + ctwl.ROUTING_POLICY_GRID_ID;

    var RoutingPolicyGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];

            self.renderView4Config(self.$el, self.model,
                                  getRoutingPolicyGridViewConfig(pagerOptions));
        }
    });
    var getRoutingPolicyGridViewConfig = function (pagerOptions) {
        return {
            elementId: cowu.formatElementId
                            ([ctwl.CONFIG_ROUTING_POLICY_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.ROUTING_POLICY_GRID_ID,
                                title: ctwl.CONFIG_ROUTING_POLICY_TITLE,
                                view: "GridView",
                                viewConfig: {
                                   elementConfig: getConfiguration(pagerOptions)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };
    var rowActionConfig = [
        ctwgc.getEditConfig('Edit', function(rowIndex) {
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);

            var routingPolicyModel = new RoutingPolicyModel(dataItem);
            routingPolicyEditView.model = routingPolicyModel;
            routingPolicyEditView.renderRoutingPolicyPopup({
                                  "title": ctwl.EDIT,
                                  mode: "edit",
                                  callback: function () {
                var dataView =
                    $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        }),
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
            var rowNum = this.rowIdentifier;
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);

            var routingPolicyModel = new RoutingPolicyModel(dataItem);
            routingPolicyEditView.model = routingPolicyModel;
            routingPolicyEditView.renderDeleteRoutingPolicy({
                                  "title": ctwl.TITLE_REMOVE,
                                  "selectedGridData": [dataItem],
                                  callback: function() {
                var dataView =
                    $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        })
    ];
    var getConfiguration = function (pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.CONFIG_ROUTING_POLICY_TITLE
                },
                advanceControls : getHeaderActionConfig(
                                     ctwl.ROUTING_POLICY_GRID_ID)
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                        $('#btnDeleteRoutingPolicy').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                        $('#btnDeleteRoutingPolicy').removeClass('disabled-link');
                        }
                    },
                    actionCell:rowActionConfig,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                            getPoliceyDetailsTemplateConfig(),
                                            cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {},
                statusMessages: {
                    loading: {
                        text: 'Loading Routing Policies.',
                    },
                    empty: {
                        text: 'No Routing Policies Found.'
                    }
                }

            },
            columnHeader: {
                columns: RoutingPolicyColumns
            },
            footer: {
                pager: contrail.handleIfNull
                                    (pagerOptions,
                                        { options:
                                          { pageSize: 5,
                                            pageSizeSelect: [5, 10, 50, 100]
                                          }
                                        }
                                    )
            }
        };
        return gridElementConfig;
    };
    this.RoutingPolicyColumns = [
    {
        id:"fq_name",
        field:"fq_name",
        label:"Display Name",
        name:"Routing Policy",
        width: 200,
        sortable: {
           sortBy: 'formattedValue'
        },
        formatter: routingPolicyFormatter.RoutingPoliceyNameFormatter
    },
    {
        id: "routing_policy_entries",
        label:"Term",
        field: "routing_policy_entries",
        name: "Term",
        width: 650,
        sortable: {
           sortBy: 'formattedValue'
        },
        formatter: routingPolicyFormatter.RoutingPolicyTermFormatter
    }];
    function getHeaderActionConfig(gridElId) {
        var headerActionConfig =
        [
            {
                "type": "link",
                "title": ctwl.TITLE_REMOVE_GRID,
                "iconClass": "fa fa-trash",
                "linkElementId": "btnDeleteRoutingPolicy",
                "onClick": function () {
                    var dataItem =
                        $("#"+gridElId).data('contrailGrid').getCheckedRows();
                    if(dataItem.length > 0) {
                        var routingPolicyModel
                                      = new RoutingPolicyModel(dataItem);
                        routingPolicyEditView.model = routingPolicyModel;
                        routingPolicyEditView.renderDeleteRoutingPolicy({
                                      "title": ctwl.TITLE_REMOVE_GRID,
                                      selectedGridData: dataItem,
                                      callback: function() {
                            var dataView =
                                $("#"+gridElId).data("contrailGrid")._dataView;
                            dataView.refreshData();
                        }});
                    }
                }
            },
            {
                "type": "link",
                "title": ctwl.TITLE_ROUTING_ADD_POLICY,
                "iconClass": "fa fa-plus",
                "onClick": function () {
                    var routingPolicyModel = new RoutingPolicyModel();
                    routingPolicyEditView.model = routingPolicyModel;
                    routingPolicyEditView.renderRoutingPolicyPopup({
                                     "title": ctwl.CREATE,
                                     mode : "add",
                                     callback: function () {
                        var dataView =
                            $("#"+gridElId).data("contrailGrid")._dataView;
                        dataView.refreshData();
                    }});
                }
            }
        ];
        return headerActionConfig;
    };
    function getPoliceyDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    templateGenerator: 'ColumnSectionTemplateGenerator',
                    templateGeneratorConfig: {
                        columns: [{
                            class: 'row-fluied',
                            rows: [{
                                title: ctwl.TITLE_ROUTING_POLICY_DETAILS,
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [{
                                    keyClass:'col-xs-3',
                                    key: 'fq_name',
                                    label:'Display Name',
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig:{
                                        formatter: "RoutingPoliceyNameFormatter"
                                    }
                                }, {
                                    keyClass:'col-xs-3',
                                    key: 'uuid',
                                    templateGenerator: 'TextGenerator'
                                }, {
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-11',
                                    label:'Term',
                                    key: 'routing_policy_entries',
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig:{
                                        formatter:
                                            "RoutingPolicyTermExpandFormatter"
                                    }
                                }]
                            },
                            //permissions
                            ctwu.getRBACPermissionExpandDetails('col-xs-3')]
                        }]
                    }
                }]
            }
        };
    };
    this.RoutingPolicyTermExpandFormatter = function (v, dc) {
        return routingPolicyFormatter.RoutingPolicyTermExpandFormatter(
                                                            "", "", v, "", dc);
    };
    this.RoutingPoliceyNameFormatter = function(v, dc) {
        return routingPolicyFormatter.RoutingPoliceyNameFormatter(
                                                            "", "", v, "", dc);
    };
    return RoutingPolicyGridView;
});
