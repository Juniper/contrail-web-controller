/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/networking/qos/common/ui/js/models/qosModel',
    'config/networking/qos/common/ui/js/views/qosEditView',
    'config/networking/qos/common/ui/js/qosFormatters',
    'config/networking/qos/common/ui/js/qosUtils'
], function(_, ContrailView, QOSModel,
    QOSEditView, QOSFormatters, QOSUtils) {
    var self, gridElId = '#' + ctwc.QOS_GRID_ID, gridObj,
        qosEditView = new QOSEditView(),
        qosFormatters = new QOSFormatters(),
        qosUtils = new QOSUtils();
    var qosGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            self = this;
            var viewConfig = self.attributes.viewConfig;
            self.renderView4Config(self.$el, self.model,
                getQOSGridViewConfig(viewConfig));
        }
    });

    function getQOSGridViewConfig (viewConfig) {
        return {
            elementId:
                cowu.formatElementId(
                [ctwc.CONFIG_QOS_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.QOS_GRID_ID,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig:
                                        getConfiguration(viewConfig)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    function getConfiguration (viewConfig) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_QOS
                },
                advanceControls: getHeaderActionConfig(viewConfig)
            },
            body: {
                options: {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeleteQOS').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeleteQOS').
                                removeClass('disabled-link');
                        }
                    },
                    actionCell: getRowActionConfig(viewConfig),
                    detail: {
                        template:
                            cowu.generateDetailTemplateHTML(
                            qosUtils.getQOSDetailsTemplateConfig(),
                            cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading QOS Config..'
                    },
                    empty: {
                        text: 'No QOS Configs Found.'
                    }
                }
            },
            columnHeader: qosUtils.qosGridColumns(qosFormatters)
        };
        return gridElementConfig;
    };

    function getRowActionConfig(viewConfig) {
        var rowActionConfig = [
            ctwgc.getEditAction(function (rowIndex) {
                var gridObj = $(gridElId).data('contrailGrid'),
                    gridData = gridObj._dataView.getItems(),
                    dataItem = gridObj._dataView.getItem(rowIndex),
                    qosModel = new QOSModel(dataItem),
                    checkedRow = dataItem,
                    title =
                        ctwl.TITLE_EDIT_QOS;
                qosEditView.model = qosModel;
                qosEditView.renderAddEditQOS(
                    {"title": ctwl.EDIT, checkedRow: checkedRow,
                        callback: function () {
                            gridObj._dataView.refreshData();
                        },
                        mode : ctwl.EDIT_ACTION,
                        isGlobal: viewConfig.isGlobal,
                        qosType: checkedRow.qos_config_type
                    }
                );
            }, "Edit"),

            ctwgc.getDeleteAction(function (rowIndex) {
              var gridObj = $(gridElId).data('contrailGrid'),
                  gridData = gridObj._dataView.getItems(),
                  dataItem = gridObj._dataView.getItem(rowIndex),
                  qosModel = new QOSModel(dataItem),
                  checkedRow = [dataItem];
              qosEditView.model = qosModel;
              qosEditView.renderDeleteQOS(
                  {"title": ctwl.TITLE_DEL_QOS,
                      checkedRows: checkedRow,
                      callback: function () {
                          gridObj._dataView.refreshData();
                      },
                      rowIndexes: [rowIndex],
                  }
              );
        })];
        return rowActionConfig;
    };

    function getHeaderActionConfig(viewConfig) {
        var createTemplate;
        if(viewConfig && viewConfig.isGlobal) {
            var dropdownActions = [
                {
                    "iconClass": "fa fa-plus",
                    "title": "Add",
                    "readOnly" : true
                },
                {
                    "divider" : true,
                    "title": "vHost QoS",
                    "onClick": function () {
                        var gridObj = $(gridElId).data('contrailGrid'),
                        gridData = gridObj._dataView.getItems(),
                        qosModel = new QOSModel();
                        qosEditView.model = qosModel;
                        qosEditView.renderAddEditQOS({
                           "title": ctwl.TITLE_GLOBAL_CREATE_VHOST_QOS,
                            callback: function () {
                                gridObj._dataView.refreshData();
                            },
                            mode : ctwl.CREATE_ACTION,
                            isGlobal: viewConfig.isGlobal,
                            qosType: "vhost"
                        });
                    }
                },
                {
                    "title": "Fabric QoS",
                    "onClick": function () {
                        var gridObj = $(gridElId).data('contrailGrid'),
                        gridData = gridObj._dataView.getItems(),
                        qosModel = new QOSModel();
                        qosEditView.model = qosModel;
                        qosEditView.renderAddEditQOS({
                           "title": ctwl.TITLE_GLOBAL_CREATE_PHYSICAL_QOS,
                            callback: function () {
                                gridObj._dataView.refreshData();
                            },
                            mode : ctwl.CREATE_ACTION,
                            isGlobal: viewConfig.isGlobal,
                            qosType: "fabric"
                        });
                    }
                }];
            createTemplate = {
                    "type": "dropdown",
                    "title": ctwl.TITLE_CREATE_QOS,
                    "iconClass": "fa fa-plus",
                    "linkElementId": 'btnCreateQOS',
                    "actions": dropdownActions };
        } else {
            createTemplate = {
                    "type" : "link",
                    "title" : ctwl.TITLE_CREATE_QOS,
                    "iconClass" : "fa fa-plus",
                    "onClick" : function() {
                        var gridObj = $(gridElId).data('contrailGrid'),
                            gridData = gridObj._dataView.getItems(),
                            qosModel = new QOSModel();
                        qosEditView.model = qosModel;
                        qosEditView.renderAddEditQOS(
                            {"title": ctwl.TITLE_CREATE_QOS,
                                callback: function () {
                                    gridObj._dataView.refreshData();
                                },
                                mode : ctwl.CREATE_ACTION,
                                isGlobal: viewConfig.isGlobal,
                                qosType: "project"
                            }
                        );
                    }
            };
        }
        var headerActionConfig = [
            {
                "type" : "link",
                "title" : ctwl.TITLE_QOS_MULTI_DELETE,
                "iconClass": 'fa fa-trash',
                "linkElementId": 'btnDeleteQOS',
                "onClick" : function() {
                    var gridObj = $(gridElId).data('contrailGrid'),
                        gridData = gridObj._dataView.getItems(),
                        rowIndexes = gridObj._grid.getSelectedRows();
                        qosModel = new QOSModel(),
                        checkedRows = gridObj.getCheckedRows();
                    if(checkedRows && checkedRows.length > 0) {
                        qosEditView.model = qosModel;
                        qosEditView.renderDeleteQOS(
                            {
                                "title":
                                    ctwl.TITLE_QOS_MULTI_DELETE,
                                checkedRows: checkedRows,
                                callback: function () {
                                    gridObj._dataView.refreshData();
                                },
                                rowIndexes: rowIndexes
                            }
                        );
                    }
                }
            },
            createTemplate];

        return headerActionConfig;
    };

    return qosGridView;
});

