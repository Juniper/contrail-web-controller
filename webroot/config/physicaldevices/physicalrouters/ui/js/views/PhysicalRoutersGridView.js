/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/physicaldevices/physicalrouters/ui/js/models/PhysicalRoutersModel',
    'config/physicaldevices/physicalrouters/ui/js/views/PhysicalRoutersEditView',
    'config/physicaldevices/physicalrouters/ui/js/PhysicalRoutersUtils'
], function (_, ContrailView, PhysicalRouterModel, PhysicalRouterEditView,
    PhysicalRoutersUtils) {
    var physicalRouterEditView = new PhysicalRouterEditView();
    var pdUtils =  new PhysicalRoutersUtils();
    var PhysicalRoutersGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                projectFQN = viewConfig['projectFQN'],
                pagerOptions = viewConfig['pagerOptions'];
            self.renderView4Config(self.$el, self.model,
                getPhysicalRoutersGridViewConfig(pagerOptions));
        }
    });

    var getPhysicalRoutersGridViewConfig = function (pagerOptions) {
        return {
            elementId:
                cowu.formatElementId(
                [ctwl.CONFIG_PHYSICAL_ROUTERS_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.PHYSICAL_ROUTERS_GRID_ID,
                                title: ctwl.TITLE_PHYSICAL_ROUTERS,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig:
                                        getConfiguration(pagerOptions)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getConfiguration = function (pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_PHYSICAL_ROUTERS
                },
                advanceControls: getHeaderActionConfig()
            },
            body: {
                options: {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeletePhysicalRouter').
                                addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeletePhysicalRouter').
                                removeClass('disabled-link');
                        }
                    },
                    actionCell:getRowActionConfig(),
                    detail: {
                        template:
                            cowu.generateDetailTemplateHTML(
                            getPhysicalRouterDetailsTemplateConfig(),
                            cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {

                },
                statusMessages: {
                    loading: {
                        text: 'Loading Physical Routers..'
                    },
                    empty: {
                        text: 'No Physical Routers.'
                    },
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'icon-warning',
                        text: 'Error in getting Physical Routers.'
                    }
                }
            },
            columnHeader: {
                columns: ctwgc.physicalRoutersColumns
            }/*,
            footer: {
                pager: contrail.handleIfNull(pagerOptions,
                    { options: { pageSize: 5,
                        pageSizeSelect: [5, 10, 50, 100] } })
            }*/
        };
        return gridElementConfig;
    };

    function getRowActionConfig() {
        var rowActionConfig = [
            ctwgc.getEditAction(function (rowIndex) {
                var dataItem =
                    $('#' + ctwl.PHYSICAL_ROUTERS_GRID_ID).data("contrailGrid").
                        _dataView.getItem(rowIndex),
                    pRouterModel = new PhysicalRouterModel(dataItem),
                    checkedRow = [dataItem],
                    title =
                        ctwl.TITLE_EDIT_OVSDB_MANAGED_TOR +
                        ' ('+ dataItem['pRouterName'] +')';
                showHideModelAttrs(pRouterModel);
                physicalRouterEditView.model = pRouterModel;
                physicalRouterEditView.renderEditOVSDBManagedTor(
                    {"title": title, checkedRows: checkedRow,
                        callback: function () {
                            var dataView =
                                $('#' + ctwl.PHYSICAL_ROUTERS_GRID_ID).
                                data("contrailGrid")._dataView;
                            dataView.refreshData();
                        }
                    }
                );
            }, ctwl.TITLE_EDIT_OVSDB_MANAGED_TOR),
            ctwgc.getEditAction(function (rowIndex) {
                var dataItem =
                    $('#' + ctwl.PHYSICAL_ROUTERS_GRID_ID).data("contrailGrid").
                    _dataView.getItem(rowIndex),
                    pRouterModel = new PhysicalRouterModel(dataItem),
                    checkedRow = [dataItem],
                    title = ctwl.TITLE_EDIT_NETCONF_MANAGED_PR +
                        ' ('+ dataItem['pRouterName'] +')';
                showHideModelAttrs(pRouterModel);
                physicalRouterEditView.model = pRouterModel;
                physicalRouterEditView.renderEditNetconfMngdPR(
                    {"title": title, checkedRows: checkedRow,
                        callback: function () {
                            var dataView =
                                $('#' + ctwl.PHYSICAL_ROUTERS_GRID_ID).
                                data("contrailGrid")._dataView;
                            dataView.refreshData();
                        }
                    }
                );
            }, ctwl.TITLE_EDIT_NETCONF_MANAGED_PR),
            ctwgc.getEditAction(function (rowIndex) {
                var dataItem =
                    $('#' + ctwl.PHYSICAL_ROUTERS_GRID_ID).data("contrailGrid").
                    _dataView.getItem(rowIndex),
                    pRouterModel = new PhysicalRouterModel(dataItem),
                    checkedRow = [dataItem],
                    title = ctwl.TITLE_EDIT_VCPE_ROUTER +
                        ' ('+ dataItem['pRouterName'] +')';

                physicalRouterEditView.model = pRouterModel;
                physicalRouterEditView.renderEditCPERouter(
                    {"title": title, checkedRows: checkedRow,
                        callback: function () {
                            var dataView =
                                $('#' + ctwl.PHYSICAL_ROUTERS_GRID_ID).
                                data("contrailGrid")._dataView;
                            dataView.refreshData();
                        }
                    }
                );
            }, ctwl.TITLE_EDIT_VCPE_ROUTER),
            ctwgc.getEditAction(function (rowIndex) {
                var dataItem =
                    $('#' + ctwl.PHYSICAL_ROUTERS_GRID_ID).data("contrailGrid").
                    _dataView.getItem(rowIndex),
                    pRouterModel = new PhysicalRouterModel(dataItem),
                    checkedRow = [dataItem],
                    title = ctwl.TITLE_EDIT_PHYSICAL_ROUTER +
                        ' ('+ dataItem['pRouterName'] +')';
                showHideModelAttrs(pRouterModel);
                pRouterModel.showTorAgentSection = ko.computed((function(){
                    return (this.virtualRouterType() === ctwl.TOR_AGENT) ?
                        true : false;
                }), pRouterModel);
                physicalRouterEditView.model = pRouterModel;
                physicalRouterEditView.renderEditPhysicalRouter(
                    {"title": title, checkedRows: checkedRow,
                        callback: function () {
                            var dataView =
                                $('#' + ctwl.PHYSICAL_ROUTERS_GRID_ID).
                                data("contrailGrid")._dataView;
                            dataView.refreshData();
                        }
                    }
                );
            }, ctwl.TITLE_EDIT_PHYSICAL_ROUTER),
            ctwgc.getDeleteAction(function (rowIndex) {
                var dataItem =
                    $('#' + ctwl.PHYSICAL_ROUTERS_GRID_ID).data("contrailGrid").
                    _dataView.getItem(rowIndex),
                    pRouterModel = new PhysicalRouterModel(dataItem),
                    checkedRows = [dataItem],
                    title = ctwl.TITLE_DELETE_CONFIG +
                        ' ('+ dataItem['pRouterName'] +')';

                physicalRouterEditView.model = pRouterModel;
                physicalRouterEditView.renderDeletePhysicalRouter(
                    {"title": title, checkedRows: checkedRows,
                        callback: function () {
                            var dataView =
                                $('#' + ctwl.PHYSICAL_ROUTERS_GRID_ID).
                                data("contrailGrid")._dataView;
                            dataView.refreshData();
                        }
                    }
                );
            })
        ]
        return rowActionConfig;
    };

    /*Injecting model attributes to show/hide view section
        using knockout computed*/
    function showHideModelAttrs(physicalRouterModel) {
        physicalRouterModel.showV2 = ko.computed((function(){
            return (this.snmpVersion() === 'v2') ? true : false;
        }), physicalRouterModel);
        physicalRouterModel.showV3 = ko.computed((function(){
            return (this.snmpVersion() === 'v3') ? true : false;
        }), physicalRouterModel);
        physicalRouterModel.showAuth = ko.computed((function(){
            return ((this.snmpV3SecurityLevel() === ctwl.SNMP_AUTH) ||
                (this.snmpV3SecurityLevel() === ctwl.SNMP_AUTHPRIV)) ?
                true : false;
        }), physicalRouterModel);
        physicalRouterModel.showPrivacy = ko.computed((function(){
            return (this.snmpV3SecurityLevel() === ctwl.SNMP_AUTHPRIV) ?
                true : false;
        }), physicalRouterModel);
    }

    function getHeaderActionConfig() {
        var dropdownActions;
        dropdownActions = [
            {
                "iconClass": "icon-plus",
                "title": ctwl.PHYSICAL_ROUTER_ADD,
                "readOnly" : true
            },
            {
                "divider" : true,
                "title": ctwl.CREATE_OVSDB_MANAGED_TOR,
                "onClick": function () {
                    var physicalRouterModel = new PhysicalRouterModel();
                    showHideModelAttrs(physicalRouterModel);
                    physicalRouterEditView.model = physicalRouterModel;
                    physicalRouterEditView.renderAddOVSDBManagedToR(
                        {"title": ctwl.TITLE_OVSDB_MANAGED_TOR,
                            callback: function () {
                                var dataView =
                                    $('#' + ctwl.PHYSICAL_ROUTERS_GRID_ID).
                                    data("contrailGrid")._dataView;
                                dataView.refreshData();
                            }
                        }
                    );
                }
            },
            {
                "title": ctwl.CREATE_NETCONF_MANAGED_PHYSICAL_ROUTER,
                "onClick": function () {
                    var physicalRouterModel = new PhysicalRouterModel();
                    showHideModelAttrs(physicalRouterModel);
                    physicalRouterEditView.model = physicalRouterModel;
                    physicalRouterEditView.renderAddNetconfMngdPR(
                        {"title": ctwl.TITLE_NETCONF_MANAGED_TOR,
                            callback: function () {
                                var dataView =
                                    $('#' + ctwl.PHYSICAL_ROUTERS_GRID_ID).
                                    data("contrailGrid")._dataView;
                                dataView.refreshData();
                            }
                        }
                    );
                }
            },
            {
                "title": ctwl.CREATE_CPE_ROUTER,
                "onClick": function () {
                    var physicalRouterModel = new PhysicalRouterModel();
                    physicalRouterEditView.model = physicalRouterModel;
                    physicalRouterEditView.renderAddCPERouter(
                        {"title": ctwl.TITLE_CPE_ROUTER,
                            callback: function () {
                                var dataView =
                                    $('#' + ctwl.PHYSICAL_ROUTERS_GRID_ID).
                                    data("contrailGrid")._dataView;
                                dataView.refreshData();
                            }
                        }
                    );
                }
            },
            {
                "title": ctwl.CREATE_PHYSICAL_ROUTER,
                "onClick": function () {
                    var physicalRouterModel = new PhysicalRouterModel();
                    showHideModelAttrs(physicalRouterModel);
                    physicalRouterModel.showTorAgentSection =
                        ko.computed((function(){
                        return (this.virtualRouterType() === ctwl.TOR_AGENT) ?
                            true : false;
                    }), physicalRouterModel);
                    physicalRouterEditView.model = physicalRouterModel;
                    physicalRouterEditView.renderAddPhysicalRouter(
                        {"title": ctwl.TITLE_ADD_PHYSICAL_ROUTER,
                            callback: function () {
                                var dataView =
                                    $('#' + ctwl.PHYSICAL_ROUTERS_GRID_ID).
                                    data("contrailGrid")._dataView;
                                dataView.refreshData();
                            }
                        }
                    );
                }
            }
        ];
        var headerActionConfig = [
            {
                "type" : "link",
                "title" : ctwl.TITLE_DELETE_CONFIG,
                "iconClass" : "icon-trash",
                "linkElementId": 'btnDeletePhysicalRouter',
                "onClick" : function() {
                    var pRouterModel = new PhysicalRouterModel();
                    var checkedRows =
                        $('#' + ctwl.PHYSICAL_ROUTERS_GRID_ID).
                        data("contrailGrid").getCheckedRows();
                    physicalRouterEditView.model = pRouterModel;
                    physicalRouterEditView.renderDeletePhysicalRouters(
                        {"title": ctwl.TITLE_DELETE_CONFIG,
                            checkedRows: checkedRows,
                            callback: function () {
                                var dataView =
                                    $('#' + ctwl.PHYSICAL_ROUTERS_GRID_ID).
                                    data("contrailGrid")._dataView;
                                dataView.refreshData();
                            }
                        }
                    );
                }
            },
            {
                "type": "dropdown",
                "title": ctwl.TITLE_ADD_PHYSICAL_ROUTER,
                "iconClass": "icon-plus",
                "linkElementId": 'btnAddPhysicalRouter',
                "actions": dropdownActions
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

    return PhysicalRoutersGridView;
});

