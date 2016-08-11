/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/infra/linklocalservices/ui/js/models/LinkLocalServicesModel',
    'config/infra/linklocalservices/ui/js/views/LinkLocalServicesEditView'
], function (_, ContrailView, LinkLocalServicesModel, LinkLocalServicesEditView) {
    var linkLocalServicesEditView = new LinkLocalServicesEditView(),
    gridElId = "#" + ctwl.LINK_LOCAL_SERVICES_GRID_ID;

    var LinkLocalServicesGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            self.renderView4Config(self.$el, self.model, getLinkLocalServicesGridViewConfig(pagerOptions));
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

    function showHideModelAttr (linkLocalServicesModel)
    {
        linkLocalServicesModel.showIP = ko.computed((function() {
            return ('IP' == this.lls_fab_address_ip()) ? true : false;
        }), linkLocalServicesModel);
        linkLocalServicesModel.showDNS = ko.computed((function() {
            return ('DNS' == this.lls_fab_address_ip()) ? true : false;
        }), linkLocalServicesModel);
    }

    var rowActionConfig = [
        ctwgc.getEditConfig('Edit', function(rowIndex) {
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
            var gridData =
                $(gridElId).data('contrailGrid')._dataView.getItems();
            var configData = $(gridElId).data('configObj');
            var self = this;

            var linkLocalServicesModel = new LinkLocalServicesModel(dataItem);
            showHideModelAttr(linkLocalServicesModel);
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
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
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

    var linkLocalServicesColumns = [
        {
            id: 'linklocal_service_name',
            field: 'linklocal_service_name',
            name: 'Service Name',
        },
        {
            id: 'linklocal_service_ip',
            field: 'linklocal_service_ip',
            name: 'Service Address',
            formatter: function(row, col, val, d, rowData) {
                var dispStr = "";
                if (null != rowData) {
                    if (null != rowData['linklocal_service_ip']) {
                        dispStr = rowData['linklocal_service_ip'];
                    }
                    if (null != rowData['linklocal_service_port']) {
                        dispStr += ":" +
                            rowData['linklocal_service_port'].toString();
                    }
                    return dispStr;
                }
                return "";
            },
            sortable: {
                sortBy: 'formattedValue'
            }
        },
        {
            id: 'ip_fabric_service_ip',
            field: 'ip_fabric_service_ip',
            name: 'Fabric Address',
            formatter: function(row, col, val, d, rowData) {
                var dispStr = "";
                if (null != rowData) {
                    if ((null != rowData['ip_fabric_service_ip']) &&
                        (rowData['ip_fabric_service_ip'] instanceof Array) &&
                        (rowData['ip_fabric_service_ip'].length > 0)) {
                        dispStr = rowData['ip_fabric_service_ip'].join(',');
                    } else {
                        dispStr = rowData['ip_fabric_DNS_service_name'];
                    }
                    if (null != rowData['ip_fabric_service_port']) {
                        dispStr += ":" +
                            rowData['ip_fabric_service_port'].toString();
                    }
                    return dispStr;
                }
                return "";
            },
            sortable: {
                sortBy: 'formattedValue'
            }
        }
    ];

    var getConfiguration = function (pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_LINK_LOCAL_SERVICES
                },
                advanceControls: getHeaderActionConfig(),
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
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Link Local Services..'
                    },
                    empty: {
                        text: 'No Link Local Services Found.'
                    }
                }
            },
            columnHeader: {
                columns: linkLocalServicesColumns
            },
            footer: {
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
                                    class: 'col-xs-6',
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
                                                    templateGenerator: 'TextGenerator',
                                                },
                                                {
                                                    key: 'ip_fabric_DNS_service_name',
                                                    templateGenerator: 'TextGenerator',
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
                "iconClass": 'fa fa-trash',
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
                "iconClass": "fa fa-plus",
                "onClick": function () {
                    var gridData =
                        $(gridElId).data('contrailGrid')._dataView.getItems();
                    var configData = $(gridElId).data('configObj');

                    var linkLocalServicesModel = new LinkLocalServicesModel();
                    showHideModelAttr(linkLocalServicesModel);
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

