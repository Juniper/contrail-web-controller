/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/physicaldevices/interfaces/ui/js/models/interfacesModel',
    'config/physicaldevices/interfaces/ui/js/views/interfacesEditView',
    'config/physicaldevices/interfaces/ui/js/interfacesFormatters'
], function (_, ContrailView, InterfacesModel, InterfacesEditView,
    InterfacesFormatters) {
    var interfacesEditView = new InterfacesEditView();
    var infFormatters = new InterfacesFormatters();
    var self;
    var InterfacesGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            self = this;
            viewConfig = this.attributes.viewConfig;
            interfacesEditView.pRouterSelData = viewConfig.pRouterSelData
            self.interfaceData = viewConfig.interfaceData;
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
                            $('.btnDeleteInterface').parent().
                                addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('.btnDeleteInterface').parent().
                                removeClass('disabled-link');
                        }
                    },
                    actionCell:getRowActionConfig,
                    detail: {
                        template:
                            cowu.generateDetailTemplateHTML(
                            getInterfaceDetailsTemplateConfig(),
                            cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {
                    data: []
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Interfaces..'
                    },
                    empty: {
                        text: 'No Interfaces Found.'
                    }
                }
            },
            columnHeader: {
                columns: [
                {
                    id : 'name',
                    field : 'name',
                    name : 'Name',
                    formatter : infFormatters.interfaceNameFormatter
                },
                {
                    id : 'type',
                    field : 'type',
                    name : 'Type',
                    formatter : infFormatters.interfaceTypeFormatter
                },
                {
                    id : 'parent',
                    field : 'parent',
                    name : 'Parent',
                    formatter : infFormatters.parentFormatter
                },
                {
                    id : ctwl.VLAN,
                    field : ctwl.VLAN,
                    name : 'VLAN',
                    formatter : infFormatters.vlanFormatter
                },
                {
                    id : 'server',
                    field : 'server',
                    name : 'Servers',
                    formatter: infFormatters.serversFormatter,
                    searchFn:function(d) {
                        return d['server'];
                    }
                }]
            }
        };
        return gridElementConfig;
    };
    /*Injecting model attributes to show/hide view section
        using knockout computed*/
    function showHideModelAttrs(interfacesModel) {
        interfacesModel.showLogicalInfProp = ko.computed((function(){
            return (this.type() === ctwl.LOGICAL_INF);
        }), interfacesModel);

        interfacesModel.showPhysicalInterfaceRefs = ko.computed((function(){
            return (this.type() === ctwl.PHYSICAL_INF);
        }), interfacesModel);

        interfacesModel.showParent = ko.computed((function(){
            return (this.type() === ctwl.LOGICAL_INF &&
                this.parent_type() === ctwl.PARENT_TYPE_PINF);
        }), interfacesModel);

        interfacesModel.showServerDetails = ko.computed((function(){
            return this.logical_interface_type() === ctwl.LOGICAL_INF_L2_TYPE &&
                this.user_created_virtual_network() !== 'none';
        }), interfacesModel);
        interfacesModel.showL3Details = ko.computed((function(){
            return this.logical_interface_type() === ctwl.LOGICAL_INF_L3_TYPE &&
                this.user_created_virtual_network() !== 'none';
        }), interfacesModel);
        interfacesModel.__kb.view_model.model().on('change:user_created_subnet',
            function(model, text){
                var subnet = interfacesModel.subnet_back_refs().subnet;
                var subnetArry = text.split('/');
                if(subnetArry.length === 2) {
                    subnet.subnet_ip_prefix.ip_prefix =
                        subnetArry[0].trim();
                    subnet.subnet_ip_prefix.ip_prefix_len =
                        parseInt(subnetArry[1].trim());
                }
            }
        );
    };
    function getRowActionConfig(dc) {
        var rowActionConfig = [];
        if(dc.logical_interface_type != ctwl.LOGICAL_INF_L3_TYPE) {
            rowActionConfig.push(ctwgc.getEditAction(function (rowIndex) {
                var dataItem =
                    $('#' + ctwl.INTERFACES_GRID_ID).data("contrailGrid").
                        _dataView.getItem(rowIndex),
                    interfacesModel = new InterfacesModel(dataItem),
                    checkedRow = dataItem,
                    title =
                        ctwl.TITLE_EDIT_INF +
                        ' ('+ dataItem['name'] +')';
                interfacesModel.interfaceData = self.interfaceData;
                interfacesEditView.model = interfacesModel;
                interfacesModel.infEditView = interfacesEditView;
                interfacesEditView.model.showClearPorts(true);
                showHideModelAttrs(interfacesModel);
                //read clear ports value from cookie
                var isClearPorts =
                    getCookie(ctwl.BM_CLEAR_VMI).toString().toLowerCase() ===
                        'true' ?  true : false;
                interfacesEditView.model.clearPorts(isClearPorts);
                interfacesEditView.renderAddEditInterface(
                    {"title": ctwl.EDIT, checkedRow: checkedRow,
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
                checkedRow = [dataItem];

            interfacesEditView.model = interfacesModel;
            interfacesEditView.renderDeleteInterfaces(
                {"title": ctwl.TITLE_INTERFACE_DELETE, checkedRows: checkedRow,
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
                "title" : ctwl.TITLE_INTERFACE_MULTI_DELETE,
                "iconClass": 'btnDeleteInterface',
                "onClick" : function() {
                    var interfacesModel = new InterfacesModel();
                    var checkedRows =
                        $('#' + ctwl.INTERFACES_GRID_ID).data("contrailGrid").
                        getCheckedRows();
                    if(checkedRows && checkedRows.length > 0) {
                        interfacesEditView.model = interfacesModel;
                        interfacesEditView.renderDeleteInterfaces(
                            {"title": ctwl.TITLE_INTERFACE_MULTI_DELETE,
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
                }

            },
            {
                "title" : ctwl.TITLE_DELETE_ALL_CONFIG,
                "onClick" : function() {
                    var interfacesModel = new InterfacesModel();
                    interfacesEditView.model = interfacesModel;
                    interfacesEditView.renderDeleteAllInterface(
                        {"title": ctwl.TITLE_DELETE_CONFIG,
                            callback: function () {
                                var dataView =
                                    $('#' + ctwl.INTERFACES_GRID_ID).
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
                "type": "dropdown",
                "title": ctwl.TITLE_DELETE_CONFIG,
                "iconClass": "fa fa-trash",
                "actions": dropdownActions
            },
            {
                "type" : "link",
                "title" : ctwl.TITLE_ADD_INTERFACE,
                "iconClass" : "fa fa-plus",
                "onClick" : function() {
                    var interfacesModel = new InterfacesModel();
                    interfacesModel.interfaceData = self.interfaceData;
                    interfacesModel.infEditView = interfacesEditView;
                    showHideModelAttrs(interfacesModel);
                    interfacesEditView.model = interfacesModel;
                    interfacesEditView.renderAddEditInterface(
                        {"title": ctwl.CREATE,
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

    function getInterfaceDetailsTemplateConfig() {
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
                                            title : ctwl.INF_PROPERTIES,
                                            templateGenerator: ctwl.INF_ED_TMPL,
                                            templateGeneratorConfig : [
                                                {
                                                   key : 'name',
                                                   templateGenerator:ctwl.INF_TG,
                                                   templateGeneratorConfig : {
                                                       formatter : "InterfaceNameFormatter"
                                                   }
                                                },
                                                {
                                                   key : 'uuid',
                                                   templateGenerator:ctwl.INF_TG

                                                },
                                                {
                                                   key : 'parent_type',
                                                   label : 'Parent',
                                                   templateGenerator:ctwl.INF_TG,
                                                   templateGeneratorConfig : {
                                                       formatter : "ParentFormatter"
                                                   }
                                                },
                                                {
                                                   key : "physical_interface_refs",
                                                   label : "Connected Physical Interface(s)",
                                                   templateGenerator:ctwl.INF_TG,
                                                   templateGeneratorConfig : {
                                                       formatter : "PhysicalInfRefsFormatter"
                                                   }
                                                },
                                                {
                                                    key : 'ethernet_segment_identifier',
                                                    label: 'Ethernet Segment Identifier',
                                                    templateGenerator:ctwl.INF_TG

                                                },
                                                {
                                                   key : 'logical_interfaces',
                                                   label : 'Logical Interfaces',
                                                   templateGenerator:ctwl.INF_TG,
                                                   templateGeneratorConfig : {
                                                       formatter :
                                                           "LogicalInterfacesFormatter"
                                                   }
                                                 },
                                                {
                                                   key : ctwl.LOGICAL_INF_TYPE,
                                                   label : 'Logical Interface Type',
                                                   templateGenerator:ctwl.INF_TG,
                                                   templateGeneratorConfig : {
                                                       formatter :
                                                           "LogicalInterfaceTypeFormatter"
                                                   }
                                                },
                                                {
                                                   key : ctwl.VLAN,
                                                   label : 'VLAN ID',
                                                   templateGenerator:ctwl.INF_TG,
                                                   templateGeneratorConfig : {
                                                       formatter :
                                                           "infVLANFormatter"
                                                   }
                                                },
                                                {
                                                   key : 'virtual_machine_interface_refs',
                                                   label : 'Virtual Network',
                                                   templateGenerator:ctwl.INF_TG,
                                                   templateGeneratorConfig : {
                                                       formatter : "VirtualNetworkFormatter"
                                                   }
                                                },
                                                {
                                                   key : 'virtual_machine_interface_refs',
                                                   label : 'Servers',
                                                   templateGenerator:ctwl.INF_TG,
                                                   templateGeneratorConfig : {
                                                       formatter : "ServersFormatter"
                                                   }
                                                },
                                                {
                                                   key : 'virtual_machine_interface_refs',
                                                   label : 'Subnet',
                                                   templateGenerator:ctwl.INF_TG,
                                                   templateGeneratorConfig : {
                                                       formatter : "SubnetFormatter"
                                                   }
                                                }
                                            ]
                                        },
                                        //permissions
                                        ctwu.getRBACPermissionExpandDetails()
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }
        };
    };

    this.VirtualNetworkFormatter =  function(v, dc) {
        return infFormatters.virtualNetworkFormatter("", "", v, "", dc);
    };

    this.ServersFormatter =  function(v, dc) {
        return infFormatters.serversFormatter("", "", v, "", dc);
    };

    this.SubnetFormatter =  function(v, dc) {
        return infFormatters.subnetFormatter("", "", v, "", dc);
    };

    this.InterfaceNameFormatter =  function(v, dc) {
        return infFormatters.interfaceNameFormatter("", "", v, "", dc);
    };

    this.ParentFormatter =  function(v, dc) {
        return infFormatters.parentFormatter("", "", v, "", dc);
    };

    this.PhysicalInfRefsFormatter =  function(v, dc) {
        return infFormatters.physicalInfRefsFormatter("", "", v, "", dc);
    };

    this.LogicalInterfacesFormatter =  function(v, dc) {
        return infFormatters.logicalInterfacesFormatter("", "", v, "", dc);
    };

    this.LogicalInterfaceTypeFormatter =  function(v, dc) {
        return infFormatters.logicalInterfaceTypeFormatter("", "", v, "", dc);
    };

    this.infVLANFormatter =  function(v, dc) {
        return infFormatters.vlanFormatter("", "", v, "", dc);
    };

    return InterfacesGridView;
});

