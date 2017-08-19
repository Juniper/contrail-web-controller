/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore'
], function (_) {
    var pRouterConfigTemplates = function() {
        var self = this;
        /*Start Edit Config Methods*/
        self.snmpVersion = function() {
            return {
                columns: [
                    {
                        elementId: 'version',
                        view: "FormRadioButtonView",
                        viewConfig: {
                            label : "Version",
                            path: "user_created_version",
                            dataBindValue:"user_created_version",
                            class: "col-xs-12",
                            elementConfig: {
                                    dataObj : ctwc.SNMP_VERSION_DATA
                            }
                         }
                    }
                ]
            };
        };
        self.v2VersionView =  function() {
            return {
                 elementId:ctwl.OVSDB_V2_VERSION_ID,
                 view:"SectionView",
                 viewConfig:{
                     visible: "showV2",
                     rows: [
                         {
                             columns: [
                                 {
                                     elementId: 'v2_community',
                                     view: "FormInputView",
                                     viewConfig: {
                                         label : "Community",
                                         path: "physical_router_snmp_credentials.v2_community",
                                         dataBindValue: "physical_router_snmp_credentials().v2_community",
                                         class: "col-xs-12"
                                     }
                                 },
                             ]
                         },
                         self.localPortView(),
                         self.retriesView(),
                         self.timeoutView()
                     ]
                 }
            };
        };
        self.auth_section = function() {
            return{
                elementId: "auth_section",
                view : "SectionView",
                viewConfig : {
                    visible : "showAuth",
                    rows : [
                        {
                            columns : [
                                {
                                    elementId: "snmpv3AuthProtocol",
                                    view: "FormInputView",
                                    viewConfig: {
                                        label : "Authentication Protocol",
                                        path: "physical_router_snmp_credentials().v3_authentication_protocol",
                                        dataBindValue: "physical_router_snmp_credentials().v3_authentication_protocol",
                                        class: "col-xs-6"
                                    }
                                },
                                {
                                    elementId: "snmpv3AuthPasswd",
                                    view: "FormInputView",
                                    viewConfig: {
                                        label : "Password",
                                        path: "physical_router_snmp_credentials().v3_authentication_password",
                                        type: "password",
                                        dataBindValue: "physical_router_snmp_credentials().v3_authentication_password",
                                        class: "col-xs-6"
                                    }
                                }
                            ]
                        }
                    ]
                }
            };
        };
        self.privacy_section = function() {
            return {
                elementId : "privacy_section",
                view : "SectionView",
                viewConfig : {
                    visible : "showPrivacy",
                    rows : [
                        {
                            columns : [
                                {
                                    elementId: 'snmpv3PrivProtocol',
                                    view: "FormInputView",
                                    viewConfig: {
                                        label : "Privacy Protocol",
                                        path: "physical_router_snmp_credentials().v3_privacy_protocol",
                                        dataBindValue: "physical_router_snmp_credentials().v3_privacy_protocol",
                                        class: "col-xs-6"
                                    }
                                 },
                                {
                                    elementId: 'snmpv3PrivPasswd',
                                    view: "FormInputView",
                                    viewConfig: {
                                        label : "Password",
                                        path: "physical_router_snmp_credentials().v3_privacy_password",
                                        type: "password",
                                        dataBindValue: "physical_router_snmp_credentials().v3_privacy_password",
                                        class: "col-xs-6"
                                    }
                                }
                            ]
                        }
                    ]
                }
            };
        };
        self.common_section = function() {
            return{
                elementId : "common_section",
                view : "SectionView",
                viewConfig: {
                    rows : [
                        {
                            columns: [
                                {
                                    elementId: 'snmpV3SecurityEngineId',
                                    view: "FormInputView",
                                    viewConfig: {
                                         label : "Security Engine Id",
                                         path: "physical_router_snmp_credentials().v3_security_engine_id",
                                         dataBindValue:"physical_router_snmp_credentials().v3_security_engine_id",
                                         class: "col-xs-12"
                                     }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'snmpv3Context',
                                    view: "FormInputView",
                                    viewConfig: {
                                        label : "Context",
                                        path: "physical_router_snmp_credentials().v3_context",
                                        dataBindValue: "physical_router_snmp_credentials().v3_context",
                                        class: "col-xs-12"
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'snmpv3ContextEngineId',
                                    view: "FormInputView",
                                    viewConfig: {
                                        label : "Context Engine Id",
                                        path: "physical_router_snmp_credentials().v3_context_engine_id",
                                        dataBindValue: "physical_router_snmp_credentials().v3_context_engine_id",
                                        class: "col-xs-12"
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'snmpv3EngineId',
                                    view: "FormInputView",
                                    viewConfig: {
                                        label : "Engine Id",
                                        path: "physical_router_snmp_credentials().v3_engine_id",
                                        dataBindValue: "physical_router_snmp_credentials().v3_engine_id",
                                        class: "col-xs-12"
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'v3_engine_boots',
                                    view: "FormInputView",
                                    viewConfig: {
                                        label : "Engine Boots",
                                        path: "physical_router_snmp_credentials.v3_engine_boots",
                                        dataBindValue: "physical_router_snmp_credentials().v3_engine_boots",
                                        class: "col-xs-12"
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'v3_engine_time',
                                    view: "FormInputView",
                                    viewConfig: {
                                        label : "Engine Time",
                                        path: "physical_router_snmp_credentials.v3_engine_time",
                                        dataBindValue: "physical_router_snmp_credentials().v3_engine_time",
                                        class: "col-xs-12"
                                    }
                                }
                            ]
                        }
                    ]
                }
            };
        };
        self.localPortView = function(){
            return {
                columns: [
                   {
                       elementId: 'local_port',
                       view: "FormInputView",
                       viewConfig: {
                           label : "Local Port",
                           placeholder: "161",
                           path: "physical_router_snmp_credentials().local_port",
                           dataBindValue: "physical_router_snmp_credentials().local_port",
                           class: "col-xs-12"
                       }
                   }
                ]
            };
        };
        self.timeoutView =  function() {
            return {
                columns: [
                    {
                        elementId: 'timeout',
                        view: "FormInputView",
                        viewConfig: {
                            label : "Timeout (secs)",
                            path: "physical_router_snmp_credentials.timeout",
                            dataBindValue: "physical_router_snmp_credentials().timeout",
                            class: "col-xs-12"
                        }
                    }
                ]
            };
        };
        self.retriesView = function() {
            return {
                columns: [
                    {
                        elementId: 'retries',
                        view: "FormInputView",
                        viewConfig: {
                            label : "Retries",
                            path: "physical_router_snmp_credentials.retries",
                            dataBindValue: "physical_router_snmp_credentials().retries",
                            class: "col-xs-12"
                        }
                    }
                ]
            };
        };
        self.v3VersionView =  function() {
            return {
                elementId:ctwl.OVSDB_V3_VERSION_ID,
                view:"SectionView",
                viewConfig:{
                    visible: 'showV3',
                    rows: [
                        self.localPortView(),
                        self.retriesView(),
                        self.timeoutView(),
                        {
                            columns: [
                                {
                                    elementId: 'snmpV3SecurityName',
                                    view: "FormInputView",
                                    viewConfig: {
                                        label : "Security Name",
                                        path: "physical_router_snmp_credentials().v3_security_name",
                                        dataBindValue: "physical_router_snmp_credentials().v3_security_name",
                                        class: "col-xs-12"
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'snmpV3SecurityLevel',
                                    view: "FormDropdownView",
                                    viewConfig: {
                                        label : "Security Level",
                                        path: "user_created_security_level",
                                        dataBindValue: "user_created_security_level",
                                        class: "col-xs-12",
                                        elementConfig:{
                                            allowClear: true,
                                            dataTextField: "text",
                                            dataValueField: "value",
                                            data : ctwc.SNMP_SECURITY_LEVEL
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                self.auth_section()
                            ]
                        },
                        {
                            columns: [
                                self.privacy_section()
                            ]
                        },
                        {
                            columns : [
                                self.common_section()
                            ]
                        }
                    ]
                }
            };
        };
        self.snmpMntdView = function() {
            return {
                columns: [
                    {
                        elementId: ctwl.OVSDB_ACCORDION,
                        view: "AccordianView",
                        viewConfig: [
                           {
                               elementId: ctwl.OVSDB_SNMP_SECTION,
                               title : ctwl.OVSDB_SNMP_SECTION_TITLE,
                               view: "SectionView",
                               active:false,
                               visible : "snmpMntd",
                               viewConfig:{
                                   rows: [
                                       self.snmpVersion(),
                                       {
                                           columns: [
                                               self.v2VersionView(),
                                               self.v3VersionView()
                                            ]
                                       }
                                   ]
                               }
                           }
                        ]
                    }
                ]
            };
        };
        self.svcPortsBaseView = function() {
            return {
                columns : [
                    {
                        elementId: 'servicePorts',
                        view: "FormEditableGridView",
                        viewConfig: {
                            path: "servicePorts",
                            validation : "servicePortValidation",
                            templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                            collection: "servicePorts",
                            columns: [
                                {
                                    elementId: 'portName',
                                    name: 'JUNOS Service Port',
                                    view: "FormInputView",
                                    class: "",
                                    viewConfig: {
                                        templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                        width: 200,
                                        path: "portName",
                                        dataBindValue: "portName()"
                                    }
                                },
                            ],
                            rowActions: [
                             {
                                    onClick: "function() {\
                                    $root.addPortByIndex($data, this); }",
                                    iconClass: 'fa fa-plus'
                                },
                                {
                                    onClick: "function() {\
                                    $root.deletePort($data, this); }",
                                    iconClass: 'fa fa-minus'
                                }
                            ],
                            gridActions: [
                                {
                                    onClick: "function() { addPort(); }",
                                    buttonTitle: ""
                                }
                            ]
                        }
                    }
                ]
            }
        };
        self.svcPortsSection =  function() {
            return {
                columns: [
                    {
                         elementId : 'netConfSection',
                         view: "SectionView",
                         active:false,
                         viewConfig : {
                             rows : [
                                 self.svcPortsBaseView()
                             ]
                         }
                    }
                ]
            };
        };
        self.snmpMntdChkboxView =  function() {
            return {
                columns: [
                    {
                        elementId: 'snmpMntd',
                        view: "FormCheckboxView",
                        viewConfig: {
                            label : "SNMP Monitored",
                            path: "snmpMntd",
                            dataBindValue: "snmpMntd",
                            class: "col-xs-12"
                        }
                    }
                ]
            };
        };
        self.torAgentSection =  function(torAgentVrouterDS) {
            return {
                columns: [
                    {
                        elementId: 'user_created_torAgent1',
                        view: "FormComboboxView",
                        viewConfig: {
                            label : "TOR Agent(s)",
                            path: "user_created_torAgent1",
                            dataBindValue: "user_created_torAgent1",
                            class: "col-xs-6",
                            elementConfig:{
                                allowClear: true,
                                placeholder: ctwl.SELECT_ENTER_TOR_AGENT_NAME,
                                dataTextField: "text",
                                dataValueField: "value",
                                dataSource : {
                                    type : 'local',
                                    data : torAgentVrouterDS
                                }
                            }
                        }
                    },
                    {
                        elementId: 'user_created_torAgent2',
                        view: "FormComboboxView",
                        viewConfig: {
                            label : "",
                            path: "user_created_torAgent2",
                            dataBindValue: "user_created_torAgent2",
                            class: "col-xs-6 no-label-input",
                            elementConfig:{
                                allowClear: true,
                                placeholder: ctwl.SELECT_ENTER_TOR_AGENT_NAME,
                                dataTextField: "text",
                                dataValueField: "value",
                                dataSource : {
                                    type : 'local',
                                    data : torAgentVrouterDS
                                }
                            }
                        }
                    }
                ]
            };
        };
        self.tsnSection = function(tsnVrouterDS){
            return {
                columns: [
                    {
                        elementId: 'user_created_tsn1',
                        view: "FormComboboxView",
                        viewConfig: {
                            label: "TSN(s)",
                            path: "user_created_tsn1",
                            dataBindValue: "user_created_tsn1",
                            class: "col-xs-6 ",
                            elementConfig:{
                                allowClear: true,
                                placeholder: ctwl.SELECT_ENTER_TSN_NAME,
                                dataTextField: "text",
                                dataValueField: "value",
                                dataSource : {
                                    type : 'local',
                                    data : tsnVrouterDS
                                }
                            }
                        }
                    },
                    {
                        elementId: 'user_created_tsn2',
                        view: "FormComboboxView",
                        viewConfig: {
                            label : "",
                            path: "user_created_tsn2",
                            dataBindValue: "user_created_tsn2",
                            class: "col-xs-6 no-label-input",
                            elementConfig:{
                                allowClear: true,
                                placeholder: ctwl.SELECT_ENTER_TSN_NAME,
                                dataTextField: "text",
                                dataValueField: "value",
                                dataSource : {
                                    type : 'local',
                                    data : tsnVrouterDS
                                }
                            }
                        }
                    }
                ]
            };
        };
        self.pRouterName = function(disableId){
            return {
                columns: [
                    {
                        elementId: 'name',
                        view: "FormInputView",
                        viewConfig: {
                            label: 'Name',
                            disabled: disableId,
                            path: "name",
                            dataBindValue: "name",
                            class: "col-xs-6"
                        }
                    },
                    {
                        elementId: 'physical_router_vendor_name',
                        view: "FormInputView",
                        viewConfig: {
                            label: "Vendor",
                            path: "physical_router_vendor_name",
                            dataBindValue: "physical_router_vendor_name",
                            class: "col-xs-6"
                        }
                    }
                ]
            };
        };
        self.vendorModelSection = function() {
            return {
                columns: [
                    {
                        elementId: 'physical_router_product_name',
                        view: "FormInputView",
                        viewConfig: {
                            label : "Model",
                            path: "physical_router_product_name",
                            dataBindValue: "physical_router_product_name",
                            class: "col-xs-6"
                        }
                    },
                    {
                        elementId: 'physical_router_management_ip',
                        view: "FormInputView",
                        viewConfig: {
                            label : "Management IP",
                            path: "physical_router_management_ip",
                            dataBindValue: "physical_router_management_ip",
                            class: "col-xs-6"
                        }
                    }
                ]
            };
        };
        self.dataIPLoopIPSection = function(){
            return {
                columns : [
                    {
                        elementId: 'physical_router_dataplane_ip',
                        view: "FormInputView",
                        viewConfig: {
                            label : "VTEP Address",
                            path: "physical_router_dataplane_ip",
                            dataBindValue: "physical_router_dataplane_ip",
                            class: "col-xs-6"
                        }
                    },
                    {
                        elementId: 'physical_router_loopback_ip',
                        view: "FormInputView",
                        viewConfig: {
                            label : "Loopback IP",
                            path: "physical_router_loopback_ip",
                            dataBindValue: "physical_router_loopback_ip",
                            class: "col-xs-6"
                        }
                    }
                ]
            };
        };
        self.AssociatedVRSection = function(torAgentVrouterDS, tsnVrouterDS) {
            return {
                elementId: ctwl.ASSOCIATED_VR_SECTION,
                title : ctwl.ASSOCIATED_VR_TITLE,
                view: "SectionView",
                viewConfig:{
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: 'virtualRouterType',
                                    view: "FormDropdownView",
                                    viewConfig: {
                                        label : "Type",
                                        path: "virtualRouterType",
                                        dataBindValue: "virtualRouterType",
                                        class: "col-xs-12",
                                        elementConfig:{
                                            allowClear: true,
                                            dataTextField: "text",
                                            dataValueField: "text",
                                            data : ctwc.VIRTUAL_ROUTER_TYPE
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            columns : [
                                 {
                                     elementId: ctwl.TOR_AGENT_SECTION,
                                     view: "SectionView",
                                     viewConfig: {
                                        visible: "showTorAgentSection",
                                        rows: [
                                            self.torAgentSection(
                                                torAgentVrouterDS),
                                            self.tsnSection(tsnVrouterDS)
                                        ]
                                     }
                                 }
                            ]
                        },
                        {
                            columns : [
                                 {
                                     elementId: 'vrouter_tsn_section',
                                     view: "SectionView",
                                     viewConfig: {
                                        visible: "virtualRouterType() === 'TSN'",
                                        rows: [
                                            self.tsnSection(tsnVrouterDS)
                                        ]
                                     }
                                 }
                            ]
                        }
                    ]
                }
            };
        };
        self.netConfSettings = function() {
            return {
                elementId: ctwl.NETCONF_SETTINGS_SECTION,
                title : ctwl.NETCONF_SETTINGS_TITLE,
                view: "SectionView",
                active:false,
                viewConfig:{
                    rows : [
                        {
                            columns : [
                                {
                                    elementId: 'physical_router_vnc_managed',
                                    view: "FormCheckboxView",
                                    viewConfig: {
                                        label : "Netconf Managed",
                                        path: "physical_router_vnc_managed",
                                        dataBindValue: "physical_router_vnc_managed",
                                        class: "col-xs-12"
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'netConfUserName',
                                    view: "FormInputView",
                                    viewConfig: {
                                        label : "Username",
                                        path: "physical_router_user_credentials().username",
                                        dataBindValue: "physical_router_user_credentials().username",
                                        class: "col-xs-6"
                                    }
                                },
                                {
                                    elementId: 'netConfPasswd',
                                    view: "FormInputView",
                                    viewConfig: {
                                        label : "Password",
                                        path: "physical_router_user_credentials().password",
                                        type: "password",
                                        dataBindValue: "physical_router_user_credentials().password",
                                        class: "col-xs-6"
                                    }
                                }
                            ]
                        },
                        self.svcPortsSection()
                    ]
                }
            };
        };
        self.AssociatedVRAccordion = function(torAgentVrouterDS, tsnVrouterDS) {
            return {
                columns: [
                     {
                         elementId: ctwl.ASSOCIATED_VR_ACCORDION,
                         view: "AccordianView",
                         viewConfig: [
                             self.AssociatedVRSection(torAgentVrouterDS,
                                 tsnVrouterDS),
                             self.netConfSettings()
                         ]
                     }
                ]
            };
        };
    };
    return pRouterConfigTemplates;
});
