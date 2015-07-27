/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'config/linklocalservices/ui/js/models/LinkLocalServicesModel',
    'config/linklocalservices/ui/js/views/LinkLocalServicesEditView'
], function (_, Backbone, LinkLocalServicesModel, LinkLocalServicesEditView) {
    var linkLocalServicesEditView = new LinkLocalServicesEditView(),
    gridElId = "#" + ctwl.LINK_LOCAL_SERVICES_GRID_ID;

    var LinkLocalServicesGridView = Backbone.View.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            cowu.renderView4Config(self.$el, self.model,
                                   getLinkLocalServicesGridViewConfig(pagerOptions));
        }
    });

    var getLinkLocalServicesGridViewConfig = function (pagerOptions) {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_LINK_LOCAL_SERVICES_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.LINK_LOCAL_SERVICES_GRID_ID,
                                title: ctwl.TITLE_LINK_LOCAL_SERVICES,
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
            var gridData =
                $(gridElId).data('contrailGrid')._dataView.getItems();
            var configData = $(gridElId).data('configObj');

            linkLocalServicesModel = new LinkLocalServicesModel(dataItem);
            linkLocalServicesEditView.model = linkLocalServicesModel;
            linkLocalServicesEditView.renderEditLinkLocalServices({
                                  "title": ctwl.TITLE_EDIT_LLS +
                                  ' (' + dataItem['linklocal_service_name'] +
                                     ')',
                                  rowIndex: rowIndex,
                                  gridData: gridData,
                                  configData: configData,
                                  callback: function () {
                var dataView =
                    $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        }),
        ctwgc.doDeleteConfig('Delete', function(rowIndex) {
            var gridData =
                $(gridElId).data('contrailGrid')._dataView.getItems();
            var configData = $(gridElId).data('configObj');

            linkLocalServicesModel = new LinkLocalServicesModel();
            linkLocalServicesEditView.model = linkLocalServicesModel;
            linkLocalServicesEditView.renderDeleteLinkLocalServices({
                                  "title": ctwl.TITLE_DEL_LLS,
                                  rowIndexes: [rowIndex],
                                  gridData: gridData,
                                  configData: configData,
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
                    text: ctwl.TITLE_LINK_LOCAL_SERVICES
                },
                advanceControls: getHeaderActionConfig()
            },
            body: {
                options: {
                    actionCell: rowActionConfig,
                    detail: {
                        template:
                            cowu.generateDetailTemplateHTML(getLLSDetailsTemplateConfig(),
                                                            cowc.APP_CONTRAIL_CONTROLLER)
                    },
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnActionDelLLS').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnActionDelLLS').removeClass('disabled-link');
                        }
                    },
                },
                dataSource: {
                }
            },
            columnHeader: {
                columns: ctwgc.linkLocalServicesColumns
            },
            footer: {
                pager: contrail.handleIfNull(pagerOptions,
                                             {
                                                 options: {
                                                     pageSize: 5,
                                                     pageSizeSelect: [5, 10, 50, 100]
                                                 }
                                             })
            }
        };
        return gridElementConfig;
    };

    function getLLSDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [
                    {
                        templateGenerator: 'ColumnSectionTemplateGenerator',
                        templateGeneratorConfig: {
                            columns: [
                                {
                                    class: 'span6',
                                    rows: [
                                        {
                                            title: ctwl.LINK_LOCAL_SERVICE_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'linklocal_service_name',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'linklocal_service_ip',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'linklocal_service_port',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'ip_fabric_service_ip',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'ip_fabric_service_port',
                                                    templateGenerator: 'TextGenerator'
                                                },
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
    function getHeaderActionConfig() {
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.TITLE_DEL_LLS,
                "iconClass": 'icon-trash',
                "linkElementId": 'btnActionDelLLS',
                "onClick": function() {
                    var rowIndexes =
                        $(gridElId).data('contrailGrid')._grid.getSelectedRows();
                    var gridData =
                        $(gridElId).data('contrailGrid')._dataView.getItems();
                    var configData = $(gridElId).data('configObj');

                    linkLocalServicesModel = new LinkLocalServicesModel();
                    linkLocalServicesEditView.model = linkLocalServicesModel;
                    linkLocalServicesEditView.renderDeleteLinkLocalServices({
                                  "title": ctwl.TITLE_DEL_LLS,
                                  rowIndexes: rowIndexes,
                                  gridData: gridData,
                                  configData: configData,
                                  callback: function() {
                        var dataView =
                            $(gridElId).data("contrailGrid")._dataView;
                        dataView.refreshData();
                    }});
                }
             },
             {
                "type": "link",
                "title": ctwl.TITLE_CREATE_LLS,
                "iconClass": "icon-plus",
                "onClick": function () {
                    var gridData =
                        $(gridElId).data('contrailGrid')._dataView.getItems();
                    var configData = $(gridElId).data('configObj');

                    var linkLocalServicesModel = new LinkLocalServicesModel();
                    linkLocalServicesEditView.model = linkLocalServicesModel;
                    linkLocalServicesEditView.renderAddLinkLocalServices({
                                              "title": ctwl.TITLE_CREATE_LLS,
                                              gridData: gridData,
                                              configData: configData,
                                              callback: function () {
                        var dataView = $(gridElId).data("contrailGrid")._dataView;
                        dataView.refreshData();
                    }});
                }
            },
        ];
        return headerActionConfig;
    }

   return LinkLocalServicesGridView;
});

