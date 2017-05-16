/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/gohanUi/idpool/ui/js/models/gcIdPoolModel',
    'config/gohanUi/idpool/ui/js/views/gcIdPoolEditView'],
    function (_, ContrailView, GcIdPoolModel, GcIdPoolEditView) {
    var dataView;
    var gcIdPoolEditView = new GcIdPoolEditView();
    var idPoolGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
            viewConfig = this.attributes.viewConfig;
            this.renderView4Config(self.$el, self.model,
                                   getIdPoolGridViewConfig());
        }
    });


    var getIdPoolGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_ID_POOL_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_ID_POOL_GRID_ID,
                                title: ctwl.CFG_ID_POOL_TITLE,
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
                    text: ctwl.CFG_ID_POOL_TITLE
                },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    checkboxSelectable: false,
                    actionCell: rowActionConfig,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                       getIdPoolDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {},
                statusMessages: {
                    loading: {
                        text: 'Loading ID Pool..'
                    },
                    empty: {
                        text: 'No ID Pool Found.'
                    }
                }
            },
            columnHeader: {
                columns: [
                     {
                         field: 'name',
                         name: 'Name',
                         id: 'name'
                     },
                     {
                         field: 'group',
                         name: 'Group',
                         id: 'group'
                     },
                     {
                         id: "start",
                         field: "start",
                         name: "Start"
                     },
                     {
                         id: "end",
                         field: "end",
                         name: "End"
                     },
                     {
                         id: "assigned",
                         field: "assigned",
                         name: "Assigned"
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
                "title": ctwl.CFG_ID_POOL_TITLE_CREATE,
                "iconClass": "fa fa-plus",
                "onClick": function () {
                    gcIdPoolEditView.model = new GcIdPoolModel();
                    gcIdPoolEditView.renderAddIdPool({
                                              "title": 'Create ID Pool',
                                              callback: function () {
                       $('#' + ctwl.CFG_ID_POOL_GRID_ID).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            }

        ];
        return headerActionConfig;
    }

    var rowActionConfig = [
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
           var dataItem = $('#' + ctwl.CFG_ID_POOL_GRID_ID).data('contrailGrid')._dataView.getItem(rowIndex);
           gcIdPoolEditView.model = new GcIdPoolModel(dataItem);
           gcIdPoolEditView.renderDeleteIdPool({
                                  "title": 'Delete ID Pool',
                                  selectedGridData: [dataItem],
                                  callback: function () {
                                      var dataView = $('#' + ctwl.CFG_ID_POOL_GRID_ID).data("contrailGrid")._dataView;
                                      dataView.refreshData();
            }});
        })
    ];
    function getIdPoolDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [
                       {
                        templateGenerator: 'ColumnSectionTemplateGenerator',
                        templateGeneratorConfig: {
                            columns: [
                                {
                                    class: 'col-xs-12',
                                    rows: [
                                        {
                                            title: ctwl.CFG_VN_TITLE_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    label: 'Name',
                                                    key: 'name',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Group',
                                                    key: 'group',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'ID',
                                                    key: 'id',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Start',
                                                    key: 'start',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'End',
                                                    key: 'end',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Assigned',
                                                    key: 'assigned',
                                                    keyClass:'col-xs-3',
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
    return idPoolGridView;
});
