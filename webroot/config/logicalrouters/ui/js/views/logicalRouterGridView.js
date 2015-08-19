/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'config/logicalrouters/ui/js/models/LogicalRouterModel',
    'config/logicalrouters/ui/js/views/LogicalRouterCreateEditView',
    'contrail-view'
], function (_, Backbone, LogicalRouterModel, LogicalRouterCreateEditView,
             ContrailView) {
    var logicalRouterCreateEditView = new LogicalRouterCreateEditView(),
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
                                  "title": ctwl.TITLE_EDIT_LOGICAL_ROUTER +
                                  ' (' + dataItem.routerName + ')',
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

            var logicalRouterModel = new LogicalRouterModel(dataItem);
            logicalRouterCreateEditView.model = logicalRouterModel;
            logicalRouterCreateEditView.renderDeleteLogicalRouter({
                                  "title": ctwl.TITLE_LOGICAL_ROUTER_DETETE,
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
                            $('#btnDeleteLogicalRouter').addClass(
                                                         'disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeleteLogicalRouter').removeClass(
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
                }
            },
            columnHeader: {
                columns: LogicalRouterColumns
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
    this.LogicalRouterColumns = [
        {
            id:"routerName",
            field:"routerName",
            name:"Name",
            minWidth : 120,
            sortable: true
        },
        {
            id:"externalGateway",
            field:"externalGateway",
            name:"External Gateway",
            minWidth : 300,
            sortable: true,
        },
        {
            id:"connectedNetwork",
            field:"connectedNetwork",
            name:"Connected Network",
            sortable: true,
            minWidth : 400,
        },
        {
            field:"lRouterStatus",
            name:"Admin State",
            minWidth : 70,
        }
    ];

    function getHeaderActionConfig(gridElId) {
        var headerActionConfig =
        [
            {
                "type": "link",
                "title": ctwl.TITLE_ADD_LOGICAL_ROUTER,
                "iconClass": "icon-plus",
                "onClick": function () {

                    var logicalRouterModel = new LogicalRouterModel();
                    logicalRouterCreateEditView.model = logicalRouterModel;
                    logicalRouterCreateEditView.renderLogicalRouterPopup({
                                     "title": ctwl.TITLE_ADD_LOGICAL_ROUTER,
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
                            class: 'span6',
                            rows: [{
                                title: ctwl.TITLE_LOGICAL_ROUTER_DETAILS,
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [{
                                    key: 'routerName',
                                    templateGenerator: 'TextGenerator'
                                }, {
                                    key: 'uuid',
                                    templateGenerator: 'TextGenerator'
                                }, {
                                    key: 'externalGateway',
                                    templateGenerator: 'TextGenerator',
                                }, {
                                    key: 'connectedNetwork',
                                    templateGenerator: 'TextGenerator',
                                }, {
                                    key: 'InterfaceDetailString',
                                    templateGenerator: 'TextGenerator',
                                }]
                            }]
                        }]
                    }
                }]
            }
        };
    };

    return logicalRouterGridView;
});
