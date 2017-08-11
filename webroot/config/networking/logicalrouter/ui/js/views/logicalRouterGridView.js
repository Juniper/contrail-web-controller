/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'config/networking/logicalrouter/ui/js/models/logicalRouterModel',
    'config/networking/logicalrouter/ui/js/views/logicalRouterEditView',
    'config/networking/logicalrouter/ui/js/views/logicalRouterFormatters',
    'config/common/ui/js/routeTarget.utils',
    'contrail-view'
], function (_, Backbone, LogicalRouterModel, LogicalRouterCreateEditView,
             logicalRouterFormatters, RouteTargetUtils, ContrailView) {
    var logicalRouterCreateEditView = new LogicalRouterCreateEditView(),
        lRFormatters = new logicalRouterFormatters(),
        routeTargetUtils = new RouteTargetUtils(),
        gridElId = "#" + ctwl.LOGICAL_ROUTER_GRID_ID;

    var logicalRouterGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            self.renderView4Config(self.$el, self.model,
                                  getLogicalRouterGridViewConfig(pagerOptions));
        }
    });

    var getLogicalRouterGridViewConfig = function (pagerOptions) {
        return {
            elementId: cowu.formatElementId
                            ([ctwl.CONFIG_LOGICAL_ROUTER_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.LOGICAL_ROUTER_GRID_ID,
                                title: ctwl.CONFIG_LOGICAL_ROUTER_TITLE,
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

            var logicalRouterModel = new LogicalRouterModel(dataItem);
            logicalRouterCreateEditView.model = logicalRouterModel;
            logicalRouterCreateEditView.renderLogicalRouterPopup({
                                  "title": ctwl.EDIT,
                                  mode: "edit",
                                  callback: function () {
                var dataView =
                    $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        }),
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);

            var logicalRouterModel = new LogicalRouterModel(dataItem);
            logicalRouterCreateEditView.model = logicalRouterModel;
            logicalRouterCreateEditView.renderDeleteLogicalRouter({
                                  "title": ctwl.TITLE_LOGICAL_ROUTER_DELETE,
                                  selectedGridData: [dataItem],
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
                    text: ctwl.CONFIG_LOGICAL_ROUTER_TITLE
                },
                advanceControls : getHeaderActionConfig(
                                     ctwl.LOGICAL_ROUTER_GRID_ID)
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('.fa-trash').parent().addClass(
                                                         'disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('.fa-trash').parent().removeClass(
                                                         'disabled-link');
                        }
                    },
                    actionCell:rowActionConfig,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                            getLRDetailsTemplateConfig(),
                                            cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Routers.',
                    },
                    empty: {
                        text: 'No Routers Found.'
                    }
                }
            },
            columnHeader: {
                columns: logicalRouterColumns
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

    this.logicalRouterColumns = [
        {
            field:  'display_name',
            name:   'Router',
            minWidth : 120,
            sortable: true,
            formatter: this.showName,
            sortable: {
               sortBy: 'formattedValue'
            }
        },
        {
            field:"virtual_network_refs",
            name:"External Gateway",
            minWidth : 300,
            sortable: {
               sortBy: 'formattedValue'
            },
            formatter: lRFormatters.extGatewayFormatter
        },
        {
            field:"virtual_machine_interface_refs",
            name:"Connected Network",
            sortable: {
               sortBy: 'formattedValue'
            },
            minWidth : 400,
            formatter: lRFormatters.conNetworkFormatter
        },
        {
            name:"Admin State",
            minWidth : 120,
            formatter: lRFormatters.idPermsFormatter
        }
    ];

    function getHeaderActionConfig(gridElId) {
        var headerActionConfig =
        [
            {
                "type": "link",
                "title": ctwl.TITLE_LOGICAL_ROUTER_DELETE,
                "iconClass": "fa fa-trash",
                "onClick": function () {
                    var dataItem =
                        $("#"+gridElId).data('contrailGrid').getCheckedRows();
                    if(dataItem.length > 0) {
                        var logicalRouterModel = new LogicalRouterModel(dataItem);
                        logicalRouterCreateEditView.model = logicalRouterModel;
                        logicalRouterCreateEditView.renderDeleteLogicalRouter({
                                      "title": ctwl.TITLE_LOGICAL_ROUTER_DELETE,
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
                "title": ctwl.TITLE_ADD_LOGICAL_ROUTER,
                "iconClass": "fa fa-plus",
                "onClick": function () {
                    var logicalRouterModel = new LogicalRouterModel();
                    logicalRouterCreateEditView.model = logicalRouterModel;
                    logicalRouterCreateEditView.renderLogicalRouterPopup({
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

    function getLRDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    templateGenerator: 'ColumnSectionTemplateGenerator',
                    templateGeneratorConfig: {
                        columns: [{
                            class: 'row',
                            rows: [{
                                title: ctwl.TITLE_LOGICAL_ROUTER_DETAILS,
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [{
                                    key: 'name',
                                    keyClass:'col-xs-3',
                                    name: 'name',
                                    templateGenerator: 'TextGenerator'
                                },{
                                    label: 'Display Name',
                                    keyClass:'col-xs-3',
                                    key: 'display_name',
                                    name: 'display_name',
                                    templateGenerator: 'TextGenerator'
                                },{
                                    key: 'uuid',
                                    keyClass:'col-xs-3',
                                    name: 'uuid',
                                    templateGenerator: 'TextGenerator'
                                }, {
                                    key: 'virtual_network_refs',
                                    keyClass:'col-xs-3',
                                    name: 'virtual_network_refs',
                                    label:"External Gateway",
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig:{
                                        formatter: "extGatewayFormatter"
                                    }
                                }, {
                                    key: 'id_perms',
                                    keyClass:'col-xs-3',
                                    name: 'id_perms',
                                    label:'SNAT',
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig:{
                                        formatter: "showSNAT"
                                    }
                                }, {
                                    key: 'id_perms',
                                    keyClass:'col-xs-3',
                                    name: 'id_perms',
                                    label:"Connected Network",
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig:{
                                        formatter: "conNetworkFormatterExpand"
                                    }
                                }, {
                                    key: 'uuid',
                                    keyClass:'col-xs-3',
                                    name: 'id_perms',
                                    label:"Extend to Physical Router",
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig:{
                                        formatter: "physicalRouterFormatterExpand"
                                    }
                                }, {
                                    key: 'vxlan_network_identifier',
                                    keyClass:'col-xs-3',
                                    label: 'VNI',
                                    templateGenerator: 'TextGenerator'
                                }, {
                                    key: 'id_perms',
                                    keyClass:'col-xs-3',
                                    name: 'id_perms',
                                    label:"Router Interfaces",
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig:{
                                        formatter: "interfaceDetailFormatter"
                                    }
                                }, {
                                    key: 'id_perms',
                                    keyClass:'col-xs-3',
                                    name: 'id_perms',
                                    label:"Route Target(s)",
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig:{
                                        formatter: "routeTargetFormatterCommon"
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
    this.extGatewayFormatter = function (v, dc) {
        return lRFormatters.extGatewayFormatter("", "", v, "", dc);
    };
    this.showName = function (r, c, v, cd, dc) {
        return ctwu.getDisplayNameOrName(dc);
    }
    this.interfaceDetailFormatter = function (v, dc) {
        return lRFormatters.interfaceDetailFormatter("", "", v, "", dc);
    };
    this.conNetworkFormatterExpand = function(v, dc) {
        return lRFormatters.conNetworkFormatterExpand("", "", v, "", dc);
    };
    this.physicalRouterFormatterExpand = function(v, dc) {
        return lRFormatters.physicalRouterFormatterExpand("", "", v, "", dc);
    };
    this.showSNAT = function(v, dc) {
        return lRFormatters.showSNAT("", "", v, "", dc);
    };
    this.routeTargetFormatterCommon = function (v, dc) {
        var retStr = routeTargetUtils.routeTargetFormatter(null,
                                        null, 'configured_route_target_list', null, dc);
        return retStr.length ? retStr : '-';
    }
    return logicalRouterGridView;
});
