/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/infra/nodes/ui/js/models/databaseNodeCfgModel',
    'config/infra/nodes/ui/js/views/databaseNodeCfgEditView'],
    function (_, ContrailView, DatabaseNodeModel,
                 DatabaseNodeEditView) {
    var dataView;

    var databaseNodeEditView  = new DatabaseNodeEditView();

    var databaseNodeGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this;
            var viewConfig = this.attributes.viewConfig;

            this.renderView4Config(self.$el, self.model,
                                   getDatabaseNodeGridViewConfig());
        }
    });



    var getDatabaseNodeGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwc.CONFIG_DATABASE_NODE_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.DATABASE_NODE_GRID_ID,
                                title: ctwl.TITLE_DATABASE_NODE,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getConfiguration()
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getConfiguration = function () {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_DATABASE_NODE
                },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    /* Required, modify to use for enabling disabling edit button */
                    autoRefresh: false,
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#linkDatabaseNodeDelete').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#linkDatabaseNodeDelete').removeClass('disabled-link');
                        }
                    },
                    actionCell:rowActionConfig,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                       getDatabaseNodeDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {data: []},
                statusMessages: {
                    loading: {
                        text: 'Loading Database Nodes..'
                    },
                    empty: {
                        text: 'No Database Nodes Found.'
                    }
                }
            },
            columnHeader: {
                columns: [
                     {
                         field:  'name',
                         name:   'Name'
                     },
                     {
                         field:  'database_node_ip_address',
                         name:   'IP Address',
                         sorter: comparatorIP
                     }
                ]
            },
        };
        return gridElementConfig;
    };

    function getHeaderActionConfig() {
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.TITLE_DATABASE_NODE_MULTI_DELETE,
                "iconClass": "fa fa-trash",
                "linkElementId": "linkDatabaseNodeDelete",
                "onClick": function () {
                    var gridElId = '#' + ctwc.DATABASE_NODE_GRID_ID;
                    var checkedRows = $(gridElId).data("contrailGrid").getCheckedRows();

                    databaseNodeEditView.model = new DatabaseNodeModel();
                    databaseNodeEditView.renderDeleteDatabaseNodes(
                        {"title": ctwl.TITLE_DATABASE_NODE_MULTI_DELETE,
                        checkedRows: checkedRows, callback: function () {
                        $(gridElId).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            },
            {
                "type": "link",
                "title": ctwl.TITLE_ADD_DATABASE_NODE,
                "iconClass": "fa fa-plus",
                "onClick": function () {
                    databaseNodeEditView.model = new DatabaseNodeModel();
                    databaseNodeEditView.renderAddEditDatabaseNode({
                                              "title": ctwl.TITLE_ADD_DATABASE_NODE,
                                              mode : ctwl.CREATE_ACTION,
                                              callback: function () {
                    $('#' + ctwc.DATABASE_NODE_GRID_ID).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            }

        ];
        return headerActionConfig;
    }

    var rowActionConfig = [
        ctwgc.getEditConfig('Edit', function(rowIndex) {
            dataView = $('#' + ctwc.DATABASE_NODE_GRID_ID).data("contrailGrid")._dataView;
            databaseNodeEditView.model = new DatabaseNodeModel(dataView.getItem(rowIndex));
            databaseNodeEditView.renderAddEditDatabaseNode({
                                  "title": ctwl.TITLE_EDIT_DATABASE_NODE,
                                  mode : ctwl.EDIT_ACTION,
                                  callback: function () {
                                      dataView.refreshData();
            }});
        }),
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
            dataView = $('#' + ctwc.DATABASE_NODE_GRID_ID).data("contrailGrid")._dataView;
            databaseNodeEditView.model = new DatabaseNodeModel();
            databaseNodeEditView.renderDeleteDatabaseNodes({
                                  "title": ctwl.TITLE_DATABASE_NODE_DELETE,
                                  checkedRows: [dataView.getItem(rowIndex)],
                                  callback: function () {
                                      dataView.refreshData();
            }});
        })
    ];



    function getDatabaseNodeDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [
                    {
                        templateGenerator: 'ColumnSectionTemplateGenerator',
                        templateGeneratorConfig: {
                            columns: [
                                {
                                    class: 'col-xs-6',
                                    rows: [
                                        {
                                            title: ctwl.TITLE_DATABASE_NODE_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'name',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'display_name',
                                                    label: 'Display Name',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'uuid',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'database_node_ip_address',
                                                    label: 'IP Address',
                                                    templateGenerator: 'TextGenerator'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }
        };
    };

    return databaseNodeGridView;
});

