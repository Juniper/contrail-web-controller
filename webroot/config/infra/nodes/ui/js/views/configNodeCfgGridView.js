/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/infra/nodes/ui/js/models/configNodeCfgModel',
    'config/infra/nodes/ui/js/views/configNodeCfgEditView'],
    function (_, ContrailView, ConfigNodeModel,
                 ConfigNodeEditView) {
    var dataView;

    var configNodeEditView  = new ConfigNodeEditView();

    var configNodeGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this;
            var viewConfig = this.attributes.viewConfig;

            this.renderView4Config(self.$el, self.model,
                                   getConfigNodeGridViewConfig());
        }
    });



    var getConfigNodeGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwc.CFG_CONFIG_NODE_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.CONFIG_NODE_GRID_ID,
                                title: ctwl.TITLE_CONFIG_NODE,
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
                    text: ctwl.TITLE_CONFIG_NODE
                },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    /* Required, modify to use for enabling disabling edit button */
                    autoRefresh: false,
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#linkConfigNodeDelete').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#linkConfigNodeDelete').removeClass('disabled-link');
                        }
                    },
                    actionCell:rowActionConfig,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                       getConfigNodeDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {data: []},
                statusMessages: {
                    loading: {
                        text: 'Loading Config Nodes..'
                    },
                    empty: {
                        text: 'No Config Nodes Found.'
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
                         field:  'config_node_ip_address',
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
                "title": ctwl.TITLE_CONFIG_NODE_MULTI_DELETE,
                "iconClass": "fa fa-trash",
                "linkElementId": "linkConfigNodeDelete",
                "onClick": function () {
                    var gridElId = '#' + ctwc.CONFIG_NODE_GRID_ID;
                    var checkedRows = $(gridElId).data("contrailGrid").getCheckedRows();

                    configNodeEditView.model = new ConfigNodeModel();
                    configNodeEditView.renderDeleteConfigNodes(
                        {"title": ctwl.TITLE_CONFIG_NODE_MULTI_DELETE,
                        checkedRows: checkedRows, callback: function () {
                        $(gridElId).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            },
            {
                "type": "link",
                "title": ctwl.TITLE_ADD_CONFIG_NODE,
                "iconClass": "fa fa-plus",
                "onClick": function () {
                    configNodeEditView.model = new ConfigNodeModel();
                    configNodeEditView.renderAddEditConfigNode({
                                              "title": ctwl.TITLE_ADD_CONFIG_NODE,
                                              mode : ctwl.CREATE_ACTION,
                                              callback: function () {
                    $('#' + ctwc.CONFIG_NODE_GRID_ID).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            }

        ];
        return headerActionConfig;
    }

    var rowActionConfig = [
        ctwgc.getEditConfig('Edit', function(rowIndex) {
            dataView = $('#' + ctwc.CONFIG_NODE_GRID_ID).data("contrailGrid")._dataView;
            configNodeEditView.model = new ConfigNodeModel(dataView.getItem(rowIndex));
            configNodeEditView.renderAddEditConfigNode({
                                  "title": ctwl.TITLE_EDIT_CONFIG_NODE,
                                  mode : ctwl.EDIT_ACTION,
                                  callback: function () {
                                      dataView.refreshData();
            }});
        }),
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
            dataView = $('#' + ctwc.CONFIG_NODE_GRID_ID).data("contrailGrid")._dataView;
            configNodeEditView.model = new ConfigNodeModel();
            configNodeEditView.renderDeleteConfigNodes({
                                  "title": ctwl.TITLE_CONFIG_NODE_DELETE,
                                  checkedRows: [dataView.getItem(rowIndex)],
                                  callback: function () {
                                      dataView.refreshData();
            }});
        })
    ];



    function getConfigNodeDetailsTemplateConfig() {
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
                                            title: ctwl.TITLE_CONFIG_NODE_DETAILS,
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
                                                    key: 'config_node_ip_address',
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

    return configNodeGridView;
});

