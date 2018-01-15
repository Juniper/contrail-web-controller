/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/physicaldevices/physicalrouters/ui/js/models/physicalRoutersModel',
    'config/physicaldevices/physicalrouters/ui/js/views/physicalRoutersEditView',
    'config/physicaldevices/physicalrouters/ui/js/physicalRoutersFormatters'
], function (_, ContrailView, PhysicalRouterModel, PhysicalRouterEditView,
    PhysicalRoutersFormatters) {
    var physicalRouterEditView = new PhysicalRouterEditView();
    var pRoutersFormatters = new PhysicalRoutersFormatters();
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
                        text: 'No Physical Routers Found.'
                    }
                }
            },
            columnHeader: {
                columns: [
                {
                    field : 'name',
                    name : 'Name' ,
                    cssClass :'cell-hyperlink-blue',
                    events : {
                        onClick : function(e, dc) {
                            contrail.setCookie(ctwl.PROUTER_KEY, dc.name);
                            layoutHandler.setURLHashParams({uuid : dc.uuid},
                            {p : 'config_pd_interfaces' ,merge : false,
                            triggerHashChange : true});
                        }
                    }
                },
                {
                    field : 'physical_router_management_ip',
                    name : 'Management IP',
                    sorter : comparatorIP,
                    formatter : pRoutersFormatters.managementIPFormatter
                },
                {
                    field : 'physical_router_dataplane_ip',
                    name : 'VTEP Address',
                    sorter : comparatorIP,
                    formatter : pRoutersFormatters.dataplaneIPFormatter
                },
                {
                    field : 'physical_router_loopback_ip',
                    name : 'Loopback IP',
                    sorter : comparatorIP,
                    formatter : pRoutersFormatters.loopbackIPFormatter
                },
                {
                    field : 'totalIntfCount',
                    name : 'Interfaces',
                    cssClass :'cell-hyperlink-blue',
                    events : {
                        onClick : function(e, dc) {
                            contrail.setCookie(ctwl.PROUTER_KEY, dc.name);
                            layoutHandler.setURLHashParams({uuid : dc.uuid},
                            {p : 'config_pd_interfaces' ,merge : false,
                            triggerHashChange : true});
                        }
                    },
                    formatter : pRoutersFormatters.infCntFormatter
                }]
            }
        };
        return gridElementConfig;
    };

    function getRowActionConfig() {
        var rowActionConfig = [
            /*ctwgc.getEditAction(function (rowIndex) {
                var dataItem =
                    $('#' + ctwl.PHYSICAL_ROUTERS_GRID_ID).data("contrailGrid").
                        _dataView.getItem(rowIndex),
                    pRouterModel = new PhysicalRouterModel(dataItem),
                    checkedRow = [dataItem],
                    title =
                        ctwl.TITLE_EDIT_OVSDB_MANAGED_TOR +
                        ' ('+ dataItem['name'] +')';
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
                        ' ('+ dataItem['name'] +')';
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
                        ' ('+ dataItem['name'] +')';

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
            }, ctwl.TITLE_EDIT_VCPE_ROUTER),*/
            ctwgc.getEditAction(function (rowIndex) {
                var dataItem =
                    $('#' + ctwl.PHYSICAL_ROUTERS_GRID_ID).data("contrailGrid").
                    _dataView.getItem(rowIndex),
                    pRouterModel = new PhysicalRouterModel(dataItem),
                    checkedRow = [dataItem],
                    title = ctwl.TITLE_EDIT_PHYSICAL_ROUTER +
                        ' ('+ dataItem['name'] +')';
                showHideModelAttrs(pRouterModel);
                pRouterModel.showTorAgentSection = ko.computed((function(){
                    return (this.virtualRouterType() === ctwl.TOR_AGENT) ?
                        true : false;
                }), pRouterModel);
                if(ctwp.isValidQfx5k(pRouterModel.physical_router_product_name())){
                    pRouterModel.roleDataSource(ctwc.PHYSICAL_ROUTER_WITHOUT_SPINE);
                }
                physicalRouterEditView.model = pRouterModel;
                physicalRouterEditView.renderEditPhysicalRouter(
                    {"title": ctwl.EDIT, checkedRows: checkedRow,
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
                    checkedRows = [dataItem];

                physicalRouterEditView.model = pRouterModel;
                physicalRouterEditView.renderDeletePhysicalRouters(
                    {"title": ctwl.TITLE_PHYSICAL_ROUTER_DELETE,
                        checkedRows: checkedRows,
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
            return (this.user_created_version() === '2') ? true : false;
        }), physicalRouterModel);
        physicalRouterModel.showV3 = ko.computed((function(){
            return (this.user_created_version() === '3') ? true : false;
        }), physicalRouterModel);
        physicalRouterModel.showAuth = ko.computed((function(){
            return ((this.user_created_security_level() === ctwl.SNMP_AUTH) ||
                (this.user_created_security_level() === ctwl.SNMP_AUTHPRIV)) ?
                true : false;
        }), physicalRouterModel);
        physicalRouterModel.showPrivacy = ko.computed((function(){
            return (this.user_created_security_level() === ctwl.SNMP_AUTHPRIV) ?
                true : false;
        }), physicalRouterModel);
    }

    function getHeaderActionConfig() {
        var dropdownActions;
        dropdownActions = [
            {
                "iconClass": "fa fa-plus",
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
                        {"title": ctwl.CREATE,
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
                        {"title": ctwl.CREATE,
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
                        {"title": ctwl.CREATE,
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
                        {"title": ctwl.CREATE,
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
                "title" : ctwl.TITLE_PHYSICAL_ROUTER_MULTI_DELETE,
                "iconClass" : "fa fa-trash",
                "linkElementId": 'btnDeletePhysicalRouter',
                "onClick" : function() {
                    var pRouterModel = new PhysicalRouterModel();
                    var checkedRows =
                        $('#' + ctwl.PHYSICAL_ROUTERS_GRID_ID).
                        data("contrailGrid").getCheckedRows();
                    if(checkedRows && checkedRows.length > 0) {
                        physicalRouterEditView.model = pRouterModel;
                        physicalRouterEditView.renderDeletePhysicalRouters(
                            {"title": ctwl.TITLE_PHYSICAL_ROUTER_MULTI_DELETE,
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
                }
            },
            {
                "type": "dropdown",
                "title": ctwl.TITLE_ADD_PHYSICAL_ROUTER,
                "iconClass": "fa fa-plus",
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
                                    class: 'col-xs-6',
                                    rows: [
                                        prProperties(),
                                        prNetconfSettings(),
                                        snmpSettings(),
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

    var prProperties =  function() {
        return {
            title:ctwl.TITLE_PHYSICAL_ROUTER_PROPERTIES,
            templateGenerator: 'BlockListTemplateGenerator',
            templateGeneratorConfig: [
                {
                    key: 'name',
                    label: 'Name',
                    templateGenerator: 'TextGenerator'
                },
                {
                    key: 'uuid',
                    label: 'UUID',
                    templateGenerator: 'TextGenerator'
                },
                {
                    key: 'physical_router_vendor_name',
                    label: 'Vendor',
                    templateGenerator: 'TextGenerator'
                },
                {
                    key: 'physical_router_product_name',
                    label: 'Model',
                    templateGenerator: 'TextGenerator'
                },
                {
                    key: 'physical_router_management_ip',
                    label: 'Management IP',
                    templateGenerator: 'TextGenerator'
                },
                {
                    key: 'physical_router_dataplane_ip',
                    label: 'VTEP Address',
                    templateGenerator: 'TextGenerator'
                },
                {
                    key: 'physical_router_loopback_ip',
                    label: 'Loopback IP',
                    templateGenerator: 'TextGenerator'
                },
                {
                    key: 'virtual_router_refs',
                    label: 'Associated Virtual Router(s)',
                    templateGenerator: 'TextGenerator',
                    templateGeneratorConfig : {
                        formatter : "VirtualRoutersFormatter"
                    }
                },
                {
                    key: 'totalIntfCount',
                    label: 'Interfaces',
                    templateGenerator: 'TextGenerator',
                    templateGeneratorConfig : {
                        formatter : "InfCntFormatter"
                    }
                },
                {
                    key: 'bgp_router_refs',
                    label: 'BGP Gateway',
                    templateGenerator: 'TextGenerator',
                    templateGeneratorConfig : {
                        formatter : "BGPRoutersFormatter"
                    }
                },
                {
                    key: 'virtual_network_refs',
                    label: 'Virtual Networks',
                    templateGenerator: 'TextGenerator',
                    templateGeneratorConfig : {
                        formatter : "VirtualNetworksFormatter"
                    }
                }
            ]
        };
    }
    this.VirtualRoutersFormatter = function(v, dc) {
        return pRoutersFormatters.virtualRoutersFormatter("", "", v, "", dc);
    };
    this.BGPRoutersFormatter = function(v, dc) {
        return pRoutersFormatters.bgpRoutersFormatter("", "", v, "", dc);
    };
    this.VirtualNetworksFormatter = function(v, dc) {
        return pRoutersFormatters.virtualNetworksFormatter("", "", v, "", dc);
    };
    this.InfCntFormatter = function(v, dc) {
        return pRoutersFormatters.infCntFormatter("", "", v, "", dc);
    };

    var prNetconfSettings = function() {
        return {
            title: ctwl.TITLE_NETCONF_SETTINGS,
            templateGenerator: 'BlockListTemplateGenerator',
            templateGeneratorConfig: [
                {
                    key: 'physical_router_user_credentials',
                    label: 'Username',
                    templateGenerator: 'TextGenerator',
                    templateGeneratorConfig : {
                        formatter : "NetConfUserNameFormatter"
                    }
                },
                {
                    key: 'physical_router_role',
                    label: 'Physical Router Role',
                    templateGenerator: 'TextGenerator',
                    templateGeneratorConfig : {
                        formatter : "PhysicalRouterRoleFormatter"
                    }
                },
                {
                    key: 'physical_router_vnc_managed',
                    label: 'Auto Configuration',
                    templateGenerator: 'TextGenerator',
                    templateGeneratorConfig : {
                        formatter : "AutoConfigFormatter"
                    }
                },
                {
                    key : 'physical_router_junos_service_ports',
                    label: 'Junos Service Ports',
                    templateGenerator: 'TextGenerator',
                    templateGeneratorConfig : {
                        formatter : "ServicePortsFormatter"
                    }
                }
            ]
        };
    };

    this.NetConfUserNameFormatter = function(v, dc) {
        return pRoutersFormatters.netConfUserNameFormatter("", "", v, "", dc);
    };
    this.PhysicalRouterRoleFormatter = function(v, dc) {
        return pRoutersFormatters.physicalRouterRoleFormatter("", "", v, "", dc);
    };
    this.AutoConfigFormatter = function(v, dc) {
        return pRoutersFormatters.autoConfigFormatter("", "", v, "", dc);
    };
    this.ServicePortsFormatter = function(v, dc) {
        return pRoutersFormatters.servicePortsFormatter("", "", v, "", dc);
    };

    var snmpSettings =  function() {
        return {
            title: ctwl.TITLE_SNMP_SETTINGS,
            templateGenerator: 'BlockListTemplateGenerator',
            templateGeneratorConfig: [
                {
                    key: 'physical_router_snmp_credentials.version',
                    label: 'Version',
                    templateGenerator: 'TextGenerator',
                    templateGeneratorConfig : {
                        formatter : "VersionFormatter"
                    }
                },
                {
                    key: 'physical_router_snmp_credentials.v2_community',
                    label: 'Community',
                    templateGenerator: 'TextGenerator'
                },
                {
                    key: 'physical_router_snmp_credentials.local_port',
                    label: 'Local Port',
                    templateGenerator: 'TextGenerator'
                },
                {
                    key: 'physical_router_snmp_credentials.retries',
                    label: 'Retries',
                    templateGenerator: 'TextGenerator'
                },
                {
                    key: 'physical_router_snmp_credentials.timeout',
                    label: 'Timeout (secs)',
                    templateGenerator: 'TextGenerator'
                },
                {
                    key: 'physical_router_snmp_credentials.v3_security_engine_id',
                    label: 'Security Engine Id',
                    templateGenerator: 'TextGenerator'
                },
                {
                    key: 'physical_router_snmp_credentials.v3_security_name',
                    label: 'Security Name',
                    templateGenerator: 'TextGenerator'
                },
                {
                    key: 'physical_router_snmp_credentials.v3_security_level',
                    label: 'Security Level',
                    templateGenerator: 'TextGenerator'
                },
                {
                    key: 'physical_router_snmp_credentials.v3_authentication_protocol',
                    label: 'Authrorization Protocol',
                    templateGenerator: 'TextGenerator'
                },
                {
                    key: 'physical_router_snmp_credentials.v3_privacy_protocol',
                    label: 'Privacy Protocol',
                    templateGenerator: 'TextGenerator'
                },
                {
                    key: 'physical_router_snmp_credentials.v3_context',
                    label: 'Context',
                    templateGenerator: 'TextGenerator'
                },
                {
                    key: 'physical_router_snmp_credentials.v3_context_engine_id',
                    label: 'Context Engine Id',
                    templateGenerator: 'TextGenerator'
                },
                {
                    key: 'physical_router_snmp_credentials.v3_engine_id',
                    label: 'Engine Id',
                    templateGenerator: 'TextGenerator'
                },
                {
                    key: 'physical_router_snmp_credentials.v3_engine_boots',
                    label: 'Engine Boots',
                    templateGenerator: 'TextGenerator'
                },
                {
                    key: 'physical_router_snmp_credentials.v3_engine_time',
                    label: 'Engine Time',
                    templateGenerator: 'TextGenerator'
                }
            ]
        };
    };

    this.VersionFormatter = function(v, dc) {
        return pRoutersFormatters.versionFormatter("", "", v, "", dc);
    };

    return PhysicalRoutersGridView;
});

