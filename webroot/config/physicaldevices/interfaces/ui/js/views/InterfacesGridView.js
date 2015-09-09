/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/physicaldevices/interfaces/ui/js/models/InterfacesModel',
    'config/physicaldevices/interfaces/ui/js/views/InterfacesEditView',
    'config/physicaldevices/interfaces/ui/js/InterfacesUtils.js'
], function (_, ContrailView, InterfacesModel, InterfacesEditView,
    InterfacesUtils) {
    var interfacesEditView = new InterfacesEditView();
    var infUtils = new InterfacesUtils();
    var self;
    var InterfacesGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            self = this;
            viewConfig = this.attributes.viewConfig;
            interfacesEditView.pRouterSelData = viewConfig.pRouterSelData
            self.renderView4Config(self.$el, self.model,
                getInterfacesGridViewConfig(viewConfig));
        }
    });

    var getInterfacesGridViewConfig = function (vc) {
        return {
            elementId:
                cowu.formatElementId(
                [ctwl.CONFIG_INTERFACES_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.INTERFACES_GRID_ID,
                                title: ctwl.TITLE_INTERFACES,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig : getConfiguration(),
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
                    text: ctwl.TITLE_INTERFACES
                },
                advanceControls: getHeaderActionConfig()
            },
            body: {
                options: {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeleteInterface').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeleteInterface').removeClass('disabled-link');
                        }
                    },
                    actionCell:getRowActionConfig,
                    detail: {
                        /*template:
                            cowu.generateDetailTemplateHTML(
                            getPhysicalRouterDetailsTemplateConfig(),
                            cowc.APP_CONTRAIL_CONTROLLER)*/
                    }
                },
                dataSource: {
                    remote: {
                    }
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Interfaces..'
                    },
                    empty: {
                        text: 'No Interfaces.'
                    },
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'icon-warning',
                        text: 'Error in getting Interfaces.'
                    }
                }
            },
            columnHeader: {
                columns: ctwgc.interfacesColumns
            }
        };
        return gridElementConfig;
    };
    /*Injecting model attributes to show/hide view section
        using knockout computed*/
    function showHideModelAttrs(interfacesModel) {
        interfacesModel.showLogicalInfProp = ko.computed((function(){
            return this.type() === ctwl.LOGICAL_INF;
        }), interfacesModel);
        interfacesModel.showServerDetails = ko.computed((function(){
            return this.logicalInfType() === 'L2' &&
                this.vnUUID() !== 'none';
        }), interfacesModel);
        interfacesModel.showL3Details = ko.computed((function(){
            return this.logicalInfType() === 'L3' &&
                this.vnUUID() !== 'none';
        }), interfacesModel);
    };
    function getRowActionConfig(dc) {
        var rowActionConfig = [];
        if(dc.type != 'Physical' && dc.logicalInfType != 'L3') {
            rowActionConfig.push(ctwgc.getEditAction(function (rowIndex) {
                var dataItem =
                    $('#' + ctwl.INTERFACES_GRID_ID).data("contrailGrid").
                        _dataView.getItem(rowIndex),
                    interfacesModel = new InterfacesModel(dataItem),
                    checkedRow = dataItem,
                    title =
                        ctwl.TITLE_EDIT_INF +
                        ' ('+ dataItem['name'] +')';
                interfacesEditView.model = interfacesModel;
                interfacesModel.infEditView = interfacesEditView;
                showHideModelAttrs(interfacesModel);
                interfacesEditView.renderAddEditInterface(
                    {"title": title, checkedRow: checkedRow,
                        callback: function () {
                            var dataView =
                                $('#' + ctwl.INTERFACES_GRID_ID).
                                data("contrailGrid")._dataView;
                            dataView.refreshData();
                        },
                        mode : ctwl.EDIT_ACTION
                    }
                );
            }, ctwl.TITLE_EDIT_INF));
        }
        rowActionConfig.push(ctwgc.getDeleteAction(function (rowIndex) {
            var dataItem =
                $('#' + ctwl.INTERFACES_GRID_ID).data("contrailGrid").
                _dataView.getItem(rowIndex),
                interfacesModel = new InterfacesModel(dataItem),
                checkedRow = [dataItem],
                title = ctwl.TITLE_DELETE_CONFIG +
                    ' ('+ dataItem['name'] +')';

            interfacesEditView.model = interfacesModel;
            interfacesEditView.renderDeleteInterface(
                {"title": title, checkedRows: checkedRow,
                    callback: function () {
                        var dataView =
                            $('#' + ctwl.INTERFACES_GRID_ID).
                            data("contrailGrid")._dataView;
                        dataView.refreshData();
                    }
                }
            );
        }));
        return rowActionConfig;
    };

    function getHeaderActionConfig() {
        var dropdownActions;
        dropdownActions = [
            {
                "title" : ctwl.TITLE_DELETE_CONFIG,
                "onClick" : function() {
                    var interfacesModel = new InterfacesModel();
                    var checkedRows =
                        $('#' + ctwl.INTERFACES_GRID_ID).data("contrailGrid").
                        getCheckedRows();
                    interfacesEditView.model = interfacesModel;
                    interfacesEditView.renderDeleteInterfaces(
                        {"title": ctwl.TITLE_DELETE_CONFIG,
                            checkedRows: checkedRows,
                            callback: function () {
                                var dataView =
                                    $('#' + ctwl.INTERFACES_GRID_ID).
                                    data("contrailGrid")._dataView;
                                dataView.refreshData();
                            }
                        }
                    );
                }

            },
            {
                "title" : ctwl.TITLE_DELETE_ALL_CONFIG,
                "onClick" : function() {
                    /*var interfacesModel = new InterfacesModel();
                    var checkedRows =
                        $('#' + ctwl.INTERFACES_GRID_ID).data("contrailGrid").
                        getCheckedRows;
                    interfacesEditView.model = interfacesModel;
                    interfacesEditView.renderDeleteInterfaces(
                        {"title": title, checkedRows: checkedRows,
                            callback: function () {
                                var dataView =
                                    $('#' + ctwl.INTERFACES_GRID_ID).
                                    data("contrailGrid")._dataView;
                                dataView.refreshData();
                            }
                        }
                    );*/
                }
            }
        ];

        var headerActionConfig = [
            {
                "type": "dropdown",
                "title": ctwl.TITLE_DELETE_CONFIG,
                "iconClass": "icon-trash",
                "linkElementId": 'btnDeleteInterface',
                "actions": dropdownActions
            },
            {
                "type" : "link",
                "title" : ctwl.TITLE_ADD_INTERFACE,
                "iconClass" : "icon-plus",
                "onClick" : function() {
                    var interfacesModel = new InterfacesModel();
                    interfacesModel.infEditView = interfacesEditView;
                    showHideModelAttrs(interfacesModel);
                    interfacesEditView.model = interfacesModel;
                    interfacesEditView.renderAddEditInterface(
                        {"title": ctwl.TITLE_ADD_INTERFACE,
                            callback: function () {
                                var dataView =
                                    $('#' + ctwl.INTERFACES_GRID_ID).
                                    data("contrailGrid")._dataView;
                                dataView.refreshData();
                            },
                            mode : ctwl.CREATE_ACTION
                        }
                    );
                }
            }
        ];
        return headerActionConfig;
    }

    function getPhysicalRouterDetailsTemplateConfig() {
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
                                        pdUtils.prProperties(),
                                        pdUtils.prNetconfSettings(),
                                        pdUtils.snmpSettings()
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }
        };
    };

    return InterfacesGridView;
});

