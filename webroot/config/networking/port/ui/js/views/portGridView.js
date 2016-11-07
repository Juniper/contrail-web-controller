/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'config/networking/port/ui/js/models/portModel',
    'config/networking/port/ui/js/views/portEditView',
    'config/networking/port/ui/js/views/portFormatters',
    'contrail-view'
], function (_, Backbone, PortModel, PortEditView,
             PortFormatters, ContrailView) {
    var portEditView = new PortEditView(),
        portFormatters = new PortFormatters(),
        gridElId = "#" + ctwc.PORT_GRID_ID;

    var portGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            portEditView.selectedProjectId = viewConfig.selectedProjectId;
            self.renderView4Config(self.$el, self.model,
                                  getPortGridViewConfig(viewConfig));
        }
    });

    var getPortGridViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId
                            ([ctwc.CONFIG_PORT_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.PORT_GRID_ID,
                                title: ctwl.CONFIG_PORT_TITLE,
                                view: "GridView",
                                viewConfig: {
                                   elementConfig: getConfiguration(viewConfig)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };
    function getRowActionConfig(dc) {
        var rowActionConfig = [];
        rowActionConfig.push(ctwgc.getEditConfig('Edit', function(rowIndex) {
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);

            var portModel = new PortModel(dataItem);
            portEditView.model = portModel;
            //portModel.editViewObj = portEditView;
            showHideModelAttrs(portModel);
            subscribeModelChangeEvents(portModel, ctwl.EDIT_ACTION);
            if (portModel.mirrorToRoutingInstance() == "") {
                portModel.updateMirrorRoutingInterface(portModel,
                                   portModel.virtualNetworkName());
            }
            portEditView.renderPortPopup({
                                  "title": ctwl.EDIT,
                                  mode: ctwl.EDIT_ACTION,
                                  callback: function () {
                var dataView =
                    $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        }));
        if(!portFormatters.isSubInterface(dc)) {
        rowActionConfig.push(ctwgc.getEditConfig('Add SubInterface',
            function(rowIndex) {
            var gridDataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
            var dataItem = {};
            dataItem.virtual_network_refs = gridDataItem.virtual_network_refs;
            var vmiData = {};
            vmiData.uuid = gridDataItem.uuid;
            vmiData.to = gridDataItem.fq_name;
            var virtualMachineInterfaceRefs = [];
            virtualMachineInterfaceRefs.push(vmiData);
            dataItem.virtual_machine_interface_refs = virtualMachineInterfaceRefs;
            dataItem.is_sub_interface = true;
            dataItem.disable_sub_interface = true;
            dataItem.securityGroupValue = portFormatters.getProjectFqn()+":default";
            dataItem.is_sec_grp = true;
            dataItem.virtual_machine_interface_properties = {};
            dataItem.virtual_machine_interface_properties.sub_interface_vlan_tag
                                                            = 'addSubInterface';
            var portModel = new PortModel(dataItem);
            portEditView.model = portModel;
            showHideModelAttrs(portModel);
            subscribeModelChangeEvents(portModel, ctwl.CREATE_ACTION);
            portModel.updateMirrorRoutingInterface(portModel, portModel.virtualNetworkName());
            portEditView.renderPortPopup({
                                  "title": ctwl.TITLE_ADD_SUBINTERFACE +
                                  '  to port (' + gridDataItem.name + ')',
                                  mode: ctwl.CREATE_ACTION,
                                  callback: function () {
                var dataView =
                    $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        }));
        }
        rowActionConfig.push(
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
            var rowNum = this.rowIdentifier;
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);

            var portModel = new PortModel(dataItem);
            portEditView.model = portModel;
            portEditView.renderDeletePort({
                                  "title": ctwl.TITLE_PORT_DETETE,
                                  selectedGridData: [dataItem],
                                  selectedProjectId: viewConfig.selectedProjectId,
                                  callback: function() {
                var dataView =
                    $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        }));
        return rowActionConfig;
    }
    var getConfiguration = function (viewConfig) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.CONFIG_PORT_TITLE
                },
                advanceControls : getHeaderActionConfig(
                                     "#" + ctwc.PORT_GRID_ID, viewConfig)
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('.deletePortClass').parent().addClass(
                                                         'disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('.deletePortClass').parent().removeClass(
                                                         'disabled-link');
                        }
                    },
                    actionCell: getRowActionConfig,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                            getPortDetailsTemplateConfig(),
                                            cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Ports.',
                    },
                    empty: {
                        text: 'No Ports Found.'
                    }
                }
            },
            columnHeader: {
                columns: PortColumns
            },
            footer: {
                pager: contrail.handleIfNull
                                    (viewConfig.pagerOptions,
                                        { options:
                                          { pageSize: 5,
                                            pageSizeSelect: [5, 10, 50, 100]
                                          }
                                        }
                                    )
            }
        };
        return gridElementConfig;
    };

    this.PortColumns = [
        {
            id:"uuid",
            field:"uuid",
            name:"UUID",
            minWidth : 280,
            sortable: {
               sortBy: 'formattedValue'
            },
            formatter: portFormatters.uuidWithName
        },
        {
            id:"network",
            field:"network",
            name:"Network",
            minWidth : 230,
            sortable: {
               sortBy: 'formattedValue'
            },
            formatter: portFormatters.networkFormater
        },
        {
            id:"fixed_ip",
            field:"fixed_ip",
            name:"Fixed IPs",
            sortable: {
               sortBy: 'formattedValue'
            },
            minWidth : 200,
            formatter: portFormatters.fixedIPFormater
        },
        {
            field:"floating_ip",
            name:"Floating IPs",
            sortable: {
               sortBy: 'formattedValue'
            },
            minWidth : 200,
            formatter: portFormatters.floatingIPFormatter
        },
        {
            field:"virtual_machine_interface_device_owner",
            name:"Device",
            sortable: {
               sortBy: 'formattedValue'
            },
            minWidth : 180,
            formatter: portFormatters.deviceOwnerFormatter
        }
    ];

    function getHeaderActionConfig(gridElId, viewConfig) {
        var dropdownActions;
        dropdownActions = [
            {
                "title" : ctwl.TITLE_DELETE_CONFIG,
                "iconClass" : "deletePortClass",
                "onClick" : function() {
                    var checkedRows =
                        $(gridElId).data("contrailGrid").
                        getCheckedRows();
                    if(checkedRows.length > 0 ) {
                        var portModel = new PortModel();
                        portEditView.model = portModel;
                        portEditView.renderDeletePort(
                            {"title": ctwl.TITLE_DELETE_CONFIG,
                                selectedGridData: checkedRows,
                                selectedProjectId: viewConfig.selectedProjectId,
                                callback: function () {
                                    var dataView =
                                        $(gridElId).data("contrailGrid")._dataView;
                                    dataView.refreshData();
                                }
                            }
                        );
                    }
                }

            },
            {
                "title" : ctwl.TITLE_PORT_DETETE_ALL,
                "onClick" : function() {
                    var portModel = new PortModel();
                    portEditView.model = portModel;
                    portEditView.renderDeleteAllPort(
                        {"title": ctwl.TITLE_PORT_DETETE,
                            selectedProjectId: viewConfig.selectedProjectId,
                            callback: function () {
                                var dataView =
                                    $(gridElId).
                                    data("contrailGrid")._dataView;
                                dataView.is_sec_grp = true;
                                dataView.refreshData();
                            }
                        }
                    );
                }
            }
        ];
        var headerActionConfig =
        [
            {
                "type": "dropdown",
                "title": ctwl.TITLE_DELETE_CONFIG,
                "iconClass": "fa fa-trash",
                "actions": dropdownActions
            },
            {
                "type": "link",
                "title": ctwl.TITLE_ADD_PORT,
                "iconClass": "fa fa-plus",
                "onClick": function () {
                    var dataItem = {};
                    dataItem.securityGroupValue = portFormatters.getProjectFqn()+":default";
                    dataItem.is_sec_grp = true;
                    var portModel = new PortModel(dataItem);
                    portEditView.model = portModel;
                    showHideModelAttrs(portModel);
                    subscribeModelChangeEvents(portModel, ctwl.CREATE_ACTION);
                    portEditView.renderPortPopup({
                                     "title": ctwl.CREATE,
                                     mode : ctwl.CREATE_ACTION,
                                     callback: function () {
                        var dataView =
                            $(gridElId).data("contrailGrid")._dataView;
                        dataView.refreshData();
                    }});
                }
            }
        ];
        return headerActionConfig;
    };

    function showHideModelAttrs(portModel) {
        portModel.is_sec_grp_disabled = ko.computed((function() {
            if(this.port_security_enabled() == true) {
                if (this.securityGroupValue() == "") {
                    var sgDefaultVal = [portFormatters.getProjectFqn()+":default"];
                    this.securityGroupValue(sgDefaultVal);
                }
                return false;
            } else {
                this.securityGroupValue([]);
                return true;
            }
        }), portModel);
        portModel.deviceComputeShow = ko.computed((function(){
            return (this.deviceOwnerValue().toLowerCase() === "compute");
        }), portModel);
        portModel.deviceRouterShow = ko.computed((function(){
            return (this.deviceOwnerValue().toLowerCase() === "router");
        }), portModel);
    };
    function getBlockListTemplateGeneratorCfg() {
        var blockList = [{
            key: 'virtual_network_refs',
            name: 'virtual_network_refs',
            label:'Network',
            templateGenerator: 'TextGenerator',
            templateGeneratorConfig:{
                formatter: "networkFormater"
            }
        }, {
            key: 'uuid',
            name: 'uuid',
            templateGenerator: 'TextGenerator'
        }, {
            key: 'name',
            name:"name",
            label:"Name",
            templateGenerator: 'TextGenerator'
        }, {
            key: 'display_name',
            name:"display_name",
            label:"Display Name",
            templateGenerator: 'TextGenerator'
        }, {
            key: 'id_perms',
            name:"id_perms",
            label: 'Admin State',
            templateGenerator: 'TextGenerator',
            templateGeneratorConfig:{
                formatter: "AdminStateFormatter"
            }
        }, {
            key: 'virtual_machine_interface_mac_addresses',
            label: 'MAC Address',
            templateGenerator: 'TextGenerator',
            templateGeneratorConfig:{
                formatter: "MACAddressFormatter"
            }
        }, {
            key: 'instance_ip_back_refs',
            name:"Fixed IPs",
            label:"Fixed IPs",
            templateGenerator: 'TextGenerator',
            templateGeneratorConfig:{
                formatter: "fixedIPFormaterExpand"
            }
        }, {
            key: 'floating_ip_back_refs',
            name:"floating_ip_back_refs",
            label:"Floating IPs",
            templateGenerator: 'TextGenerator',
            templateGeneratorConfig:{
                formatter: "floatingIPFormatter"
            }
        }, {
            key: 'uuid',
            name:"security_group_refs",
            label:"Security Groups",
            templateGenerator: 'TextGenerator',
            templateGeneratorConfig:{
                formatter: "sgFormater"
            }
        }, {
            key: 'virtual_machine_interface_dhcp_option_list',
            name:"virtual_machine_interface_dhcp_option_list",
            label:"DHCP Options",
            templateGenerator: 'TextGenerator',
            templateGeneratorConfig:{
                formatter: "DHCPFormatter"
            }
        }, {
            key: 'interface_route_table_refs',
            name:"interface_route_table_refs",
            label:"Static Routes",
            templateGenerator: 'TextGenerator',
            templateGeneratorConfig:{
                formatter: "staticRoutFormatter"
            }
        }, {
            key: 'service_health_check_refs',
            name:"service_health_check_refs",
            label:"Service Health Check",
            templateGenerator: 'TextGenerator',
            templateGeneratorConfig:{
                formatter: "serviceHealthCheckFormatter"
            }
        }, {
            label: 'QoS',
            key: 'qos_config_refs',
            templateGenerator:
                'TextGenerator',
            templateGeneratorConfig: {
                formatter:
                    'QoSFormatter',
            }
        }, {
            key: 'virtual_machine_interface_properties',
            name:"virtual_machine_interface_properties",
            label:"Local Preference",
            templateGenerator: 'TextGenerator',
            templateGeneratorConfig:{
                formatter: "localPrefFormater"
            }
        }, {
            key: 'ecmp_hashing_include_fields',
            name:"ecmp_hashing_include_fields",
            label:"ECMP Hashing Fields",
            templateGenerator: 'TextGenerator',
            templateGeneratorConfig:{
                formatter: "ECMPHashingFormatter"
            }
        }, {
            key: 'virtual_machine_interface_fat_flow_protocols',
            name:"virtual_machine_interface_fat_flow_protocols",
            label:"FatFlow",
            templateGenerator: 'TextGenerator',
            templateGeneratorConfig:{
                formatter: "FatFlowFormatter"
            }
        }, {
            key: 'virtual_machine_interface_bindings',
            name:"virtual_machine_interface_bindings",
            label:"Bindings",
            templateGenerator: 'TextGenerator',
            templateGeneratorConfig:{
                formatter: "PortBindingFormatter"
            }
        }, {
            key: 'virtual_machine_interface_allowed_address_pairs',
            name:"virtual_machine_interface_allowed_address_pairs",
            label:"Allowed address pairs",
            templateGenerator: 'TextGenerator',
            templateGeneratorConfig:{
                formatter: "AAPFormatter"
            }
        }, {
            key: 'virtual_machine_interface_properties.interface_mirror',
            label:"Mirror to",
            templateGenerator: 'TextGenerator',
            templateGeneratorConfig:{
                formatter: "mirrorFormatter"
            }
        },  {
            key: 'virtual_machine_interface_refs',
            name:"virtual_machine_interface_refs",
            label:"Sub Interfaces",
            templateGenerator: 'TextGenerator',
            templateGeneratorConfig:{
                formatter: "childrensUUID"
            }
        }, {
            key: 'virtual_machine_interface_properties',
            name:"virtual_machine_interface_properties",
            label:"Sub Interface VLAN",
            templateGenerator: 'TextGenerator',
            templateGeneratorConfig:{
                formatter: "subInterfaceVXLANUUID"
            }
        }, {
            key: 'virtual_machine_interface_properties.sub_interface_vlan_tag',
            name:"virtual_machine_interface_refs.sub_interface_vlan_tag",
            label:"Parent Port",
            templateGenerator: 'TextGenerator',
            templateGeneratorConfig:{
                formatter: "parentUUIDFormatter"
            }
        }, {
            key: 'virtual_machine_interface_disable_policy',
            name:"virtual_machine_interface_disable_policy",
            label:"Disable Policy",
            templateGenerator: 'TextGenerator',
            templateGeneratorConfig:{
                formatter: "disablePolicyFormatter"
            }
        }],

        deviceOwnerTemplate = {
                key: 'virtual_machine_interface_device_owner',
                name:"virtual_machine_interface_device_owner",
                label:"Device",
                templateGenerator: 'TextGenerator',
                templateGeneratorConfig:{
                    formatter: "deviceOwnerFormatter"
                }
        },

        deviceOwnerUUIDTemplate = {
                key: 'virtual_machine_interface_device_owner',
                name:"virtual_machine_interface_device_owner",
                label:"Device ID",
                templateGenerator: 'TextGenerator',
                templateGeneratorConfig:{
                    formatter: "deviceUUIDFormatter"
                }
        };

        if(!isVCenter()){
            blockList.splice(10, 0,
                    deviceOwnerTemplate, deviceOwnerUUIDTemplate);
        }
        return blockList;
    };
    function getPortDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    templateGenerator: 'ColumnSectionTemplateGenerator',
                    templateGeneratorConfig: {
                        columns: [{
                            class: 'col-xs-6',
                            rows: [{
                                title: ctwl.TITLE_PORT_DETAILS,
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig:
                                    getBlockListTemplateGeneratorCfg()
                            },
                            //permissions
                            ctwu.getRBACPermissionExpandDetails()]
                        }]
                    }
                }]
            }
        };
    };

    function subscribeModelChangeEvents(portModel, mode) {
        portModel.__kb.view_model.model().on('change:virtualNetworkName',
            function(model, newValue){
                portModel.onVNSelectionChanged(portFormatters, newValue, mode);
                portModel.updateMirrorRoutingInterface(portModel, newValue);
            }
        );
    };
    this.networkFormater = function (v, dc) {
        return portFormatters.networkFormater("", "", v, "", dc);
    };
    this.fqNameFormater = function(v, dc) {
        return portFormatters.fqNameFormater("", "", v, "", dc);
    };
    this.AdminStateFormatter = function (v, dc) {
        return portFormatters.AdminStateFormatter("", "", v, "", dc);
    };
    this.MACAddressFormatter = function(v, dc) {
        return portFormatters.MACAddressFormatter("", "", v, "", dc);
    };
    this.floatingIPFormatter = function(v, dc) {
        return portFormatters.floatingIPFormatterExpand("", "", v, "", dc);
    };
    this.sgFormater = function(v, dc) {
        return portFormatters.sgFormater("", "", v, "", dc);
    };
    this.DHCPFormatter = function(v, dc) {
        return portFormatters.DHCPFormatter("", "", v, "", dc);
    };
    this.staticRoutFormatter = function(v, dc) {
        return portFormatters.staticRoutFormatter("", "", v, "", dc);
    };
    this.ECMPHashingFormatter = function(v, dc) {
        return portFormatters.ECMPHashingFormatter("", "", v, "", dc);
    };
    this.AAPFormatter = function(v, dc) {
        return portFormatters.AAPFormatter("", "", v, "", dc);
    };
    this.FatFlowFormatter = function(v, dc) {
        return portFormatters.FatFlowFormatter("", "", v, "", dc);
    };
    this.PortBindingFormatter = function(v, dc) {
        return portFormatters.PortBindingFormatter("", "", v, "", dc);
    };
    this.fixedIPFormaterExpand = function(v, dc) {
        return portFormatters.fixedIPFormaterExpand("", "", v, "", dc);
    };
    this.deviceUUIDFormatter = function(v, dc) {
        return portFormatters.deviceUUIDFormatter("", "", v, "", dc);
    };
    this.deviceOwnerFormatter = function(v, dc) {
        return portFormatters.deviceOwnerFormatter("", "", v, "", dc);
    };
    this.childrensUUID = function(v, dc) {
        return portFormatters.childrensUUID("", "", v, "", dc);
    };
    this.subInterfaceVXLANUUID = function(v, dc) {
        return portFormatters.subInterfaceVXLANUUID("", "", v, "", dc);
    };
    this.parentUUIDFormatter = function(v, dc) {
        return portFormatters.parentUUIDFormatter("", "", v, "", dc);
    };
    this.mirrorFormatter = function(v, dc) {
        return portFormatters.mirrorFormatter("", "", v, "", dc);
    };
    this.serviceHealthCheckFormatter = function(v, dc) {
        return portFormatters.serviceHealthCheckFormatter("", "", v, "", dc);
    };
    this.localPrefFormater = function(v, dc) {
        return portFormatters.localPrefFormater("", "", v, "", dc);
    };
    this.disablePolicyFormatter = function(v, dc) {
        return portFormatters.disablePolicyFormatter("", "", v, "", dc);
    };
    this.QoSFormatter = function (v, dc) {
        return portFormatters.qosExpansionFormatter(null,
                                        null, null, null, dc);
    };
    return portGridView;
});
