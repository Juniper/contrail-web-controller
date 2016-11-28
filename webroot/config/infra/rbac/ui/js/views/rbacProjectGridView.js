/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/infra/rbac/ui/js/models/rbacModel',
    'config/rbac/common/ui/js/views/rbacEditView',
    'config/rbac/common/ui/js/rbacFormatters',
    'config/rbac/common/ui/js/rbacUtils'
], function(_, ContrailView, RBACModel,
    RBACEditView, RBACFormatters, RBACUtils) {
    var self, gridElId = '#' + ctwc.RBAC_PROJECT_GRID_ID, gridObj,
        rbacEditView = new RBACEditView(),
        rbacFormatters = new RBACFormatters(),
        rbacUtils = new RBACUtils();
    var rbacProjectGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            self = this;
            var viewConfig = self.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            self.renderView4Config(self.$el, self.model,
                getRBACGridViewConfig(viewConfig));
        }
    });

    function showHideModelAttrs(model) {
        model.showDomain = ko.computed(function(){
            return false;
        }, model);
        model.showProject = ko.computed(function(){
            return true;
        }, model);
        rbacUtils.subscribeRBACModelChangeEvents(model);
    };

    function getRBACGridViewConfig (viewConfig) {
        return {
            elementId:
                cowu.formatElementId(
                [ctwc.CONFIG_RBAC_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.RBAC_PROJECT_GRID_ID,
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
                    text: ctwl.TITLE_PROJECT_RBAC
                },
                advanceControls: getHeaderActionConfig(viewConfig)
            },
            body: {
                options: {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeleteProjectRBAC').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeleteProjectRBAC').
                                removeClass('disabled-link');
                        }
                    },
                    actionCell: getRowActionConfig(viewConfig),
                    detail: {
                        template:
                            cowu.generateDetailTemplateHTML(
                            rbacUtils.getRBACDetailsTemplateConfig(),
                            cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading API Access..'
                    },
                    empty: {
                        text: 'No API Access Found.'
                    }
                }
            },
            columnHeader: rbacUtils.rbacProjectGridColumns(rbacFormatters)
        };
        return gridElementConfig;
    };

    function getRowActionConfig(viewConfig) {
        var rowActionConfig = [
            ctwgc.getEditAction(function (rowIndex) {
                var gridObj = $(gridElId).data('contrailGrid'),
                    gridData = gridObj._dataView.getItems(),
                    dataItem = gridObj._dataView.getItem(rowIndex),
                    rbacModel = new RBACModel(dataItem),
                    checkedRow = dataItem,
                    title =
                        ctwl.TITLE_EDIT_RBAC;
                rbacEditView.model = rbacModel;
                showHideModelAttrs(rbacModel);
                rbacEditView.renderAddEditRBAC(
                    {"title": title, checkedRow: checkedRow,
                        callback: function () {
                            gridObj._dataView.refreshData();
                        },
                        mode : ctwl.EDIT_ACTION,
                        gridData: gridData,
                        rowIndex: dataItem.subIndex,
                        configData: rbacUtils.getConfigData(viewConfig),
                        isProject: viewConfig.isProject,
                        isGlobal: viewConfig.isGlobal,
                        isDomain: viewConfig.isDomain
                    }
                );
            }, "Edit"),
            {
                "type" : "link",
                "title" : "Insert After",
                "iconClass" : "fa fa-plus",
                "onClick" : function(rowIndex) {
                    var gridObj = $(gridElId).data('contrailGrid'),
                        gridData = gridObj._dataView.getItems(),
                        dataItem = gridObj._dataView.getItem(rowIndex),
                        rbacModel = new RBACModel({project: dataItem.project});
                    rbacEditView.model = rbacModel;
                    showHideModelAttrs(rbacModel);
                    rbacEditView.renderAddEditRBAC(
                        {"title": ctwl.TITLE_INSERT_RBAC,
                            callback: function () {
                                gridObj._dataView.refreshData();
                            },
                            mode : "insert",
                            gridData: gridData,
                            rowIndex: dataItem.subIndex,
                            configData:
                                rbacUtils.getConfigData(viewConfig),
                            isProject: viewConfig.isProject,
                            isGlobal: viewConfig.isGlobal,
                            isDomain: viewConfig.isDomain
                        }
                    );
                }
            },
            ctwgc.getDeleteAction(function (rowIndex) {
              var gridObj = $(gridElId).data('contrailGrid'),
                  gridData = gridObj._dataView.getItems(),
                  dataItem = gridObj._dataView.getItem(rowIndex),
                  rbacModel = new RBACModel(dataItem),
                  checkedRow = [dataItem];
              rbacEditView.model = rbacModel;
              rbacEditView.renderDeleteRBAC(
                  {"title": ctwl.TITLE_DEL_RBAC,
                      checkedRows: checkedRow,
                      callback: function () {
                          gridObj._dataView.refreshData();
                      },
                      gridData: gridData,
                      configData: rbacUtils.getConfigData(viewConfig),
                      isProject: viewConfig.isProject,
                      isGlobal: viewConfig.isGlobal,
                      isDomain: viewConfig.isDomain
                  }
              );
        })];
        return rowActionConfig;
    };

    function getHeaderActionConfig(viewConfig) {
        var headerActionConfig = [
            {
                "type" : "link",
                "title" : ctwl.TITLE_RBAC_MULTI_DELETE,
                "iconClass": 'fa fa-trash',
                "linkElementId": 'btnDeleteProjectRBAC',
                "onClick" : function() {
                    var gridObj = $(gridElId).data('contrailGrid'),
                        gridData = gridObj._dataView.getItems(),
                        rowIndexes = gridObj._grid.getSelectedRows();
                        rbacModel = new RBACModel(),
                        checkedRows = gridObj.getCheckedRows();
                    if(checkedRows && checkedRows.length > 0) {
                        rbacEditView.model = rbacModel;
                        rbacEditView.renderDeleteRBAC(
                            {
                                "title":
                                    ctwl.TITLE_RBAC_MULTI_DELETE,
                                checkedRows: checkedRows,
                                callback: function () {
                                    gridObj._dataView.refreshData();
                                },
                                gridData: gridData,
                                configData:
                                    rbacUtils.getConfigData(viewConfig),
                                rowIndexes: rowIndexes,
                                isProject: viewConfig.isProject,
                                isGlobal: viewConfig.isGlobal,
                                isDomain: viewConfig.isDomain
                            }
                        );
                    }
                }
            },
            {
                "type" : "link",
                "title" : ctwl.TITLE_CREATE_RBAC,
                "iconClass" : "fa fa-plus",
                "onClick" : function() {
                    var gridObj = $(gridElId).data('contrailGrid'),
                        gridData = gridObj._dataView.getItems(),
                        rbacModel = new RBACModel();
                    rbacEditView.model = rbacModel;
                    showHideModelAttrs(rbacModel);
                    rbacEditView.renderAddEditRBAC(
                        {"title": ctwl.TITLE_CREATE_RBAC,
                            callback: function () {
                                gridObj._dataView.refreshData();
                            },
                            mode : ctwl.CREATE_ACTION,
                            gridData: gridData,
                            rowIndex: -1,
                            configData:
                                rbacUtils.getConfigData(viewConfig),
                            isProject: viewConfig.isProject,
                            isGlobal: viewConfig.isGlobal,
                            isDomain: viewConfig.isDomain
                        }
                    );
                }
            }];

        return headerActionConfig;
    };

    return rbacProjectGridView;
});

