/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/infra/nodes/ui/js/models/analyticsNodeCfgModel',
    'config/infra/nodes/ui/js/views/analyticsNodeCfgEditView'],
    function (_, ContrailView, AnalyticsNodeModel,
                 AnalyticsNodeEditView) {
    var dataView;

    var analyticsNodeEditView  = new AnalyticsNodeEditView();

    var analyticsNodeGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this;
            var viewConfig = this.attributes.viewConfig;

            this.renderView4Config(self.$el, self.model,
                                   getAnalyticsNodeGridViewConfig());
        }
    });



    var getAnalyticsNodeGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwc.CONFIG_ANALYTICS_NODE_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.ANALYTICS_NODE_GRID_ID,
                                title: ctwl.TITLE_ANALYTICS_NODE,
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
                    text: ctwl.TITLE_ANALYTICS_NODE
                },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    /* Required, modify to use for enabling disabling edit button */
                    autoRefresh: false,
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#linkAnalyticsNodeDelete').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#linkAnalyticsNodeDelete').removeClass('disabled-link');
                        }
                    },
                    actionCell:rowActionConfig,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                       getAnalyticsNodeDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {data: []},
                statusMessages: {
                    loading: {
                        text: 'Loading Analytics Nodes..'
                    },
                    empty: {
                        text: 'No Analytics Nodes Found.'
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
                         field:  'analytics_node_ip_address',
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
                "title": ctwl.TITLE_ANALYTICS_NODE_MULTI_DELETE,
                "iconClass": "fa fa-trash",
                "linkElementId": "linkAnalyticsNodeDelete",
                "onClick": function () {
                    var gridElId = '#' + ctwc.ANALYTICS_NODE_GRID_ID;
                    var checkedRows = $(gridElId).data("contrailGrid").getCheckedRows();

                    analyticsNodeEditView.model = new AnalyticsNodeModel();
                    analyticsNodeEditView.renderDeleteAnalyticsNodes(
                        {"title": ctwl.TITLE_ANALYTICS_NODE_MULTI_DELETE,
                        checkedRows: checkedRows, callback: function () {
                        $(gridElId).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            },
            {
                "type": "link",
                "title": ctwl.TITLE_ADD_ANALYTICS_NODE,
                "iconClass": "fa fa-plus",
                "onClick": function () {
                    analyticsNodeEditView.model = new AnalyticsNodeModel();
                    analyticsNodeEditView.renderAddEditAnalyticsNode({
                                              "title": ctwl.TITLE_ADD_ANALYTICS_NODE,
                                              mode : ctwl.CREATE_ACTION,
                                              callback: function () {
                    $('#' + ctwc.ANALYTICS_NODE_GRID_ID).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            }

        ];
        return headerActionConfig;
    }

    var rowActionConfig = [
        ctwgc.getEditConfig('Edit', function(rowIndex) {
            dataView = $('#' + ctwc.ANALYTICS_NODE_GRID_ID).data("contrailGrid")._dataView;
            analyticsNodeEditView.model = new AnalyticsNodeModel(dataView.getItem(rowIndex));
            analyticsNodeEditView.renderAddEditAnalyticsNode({
                                  "title": ctwl.TITLE_EDIT_ANALYTICS_NODE,
                                  mode : ctwl.EDIT_ACTION,
                                  callback: function () {
                                      dataView.refreshData();
            }});
        }),
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
            dataView = $('#' + ctwc.ANALYTICS_NODE_GRID_ID).data("contrailGrid")._dataView;
            analyticsNodeEditView.model = new AnalyticsNodeModel();
            analyticsNodeEditView.renderDeleteAnalyticsNodes({
                                  "title": ctwl.TITLE_ANALYTICS_NODE_DELETE,
                                  checkedRows: [dataView.getItem(rowIndex)],
                                  callback: function () {
                                      dataView.refreshData();
            }});
        })
    ];



    function getAnalyticsNodeDetailsTemplateConfig() {
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
                                            title: ctwl.TITLE_ANALYTICS_NODE_DETAILS,
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
                                                    key: 'analytics_node_ip_address',
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

    return analyticsNodeGridView;
});

