/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore'
], function (_) {

    var pdUtils = function() {
        var self = this;
        /*Start expand details methods*/
        self.prProperties =  function() {
            return {
                title:ctwl.TITLE_PHYSICAL_ROUTER_PROPERTIES,
                templateGenerator: 'BlockListTemplateGenerator',
                templateGeneratorConfig: [
                    {
                        key: 'pRouterName',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'vendor',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'pmodel',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'mgmtIP',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'dataIP',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'displayVirtualRouters',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'totalInterfacesCount',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'bgpRouters',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'virtualNetworks',
                        templateGenerator: 'TextGenerator'
                    }
                ]
            };
        };
        self.prNetconfSettings = function() {
            return {
                title: ctwl.TITLE_NETCONF_SETTINGS,
                templateGenerator: 'BlockListTemplateGenerator',
                templateGeneratorConfig: [
                    {
                        key: 'netConfUserName',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'autoConfig',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key : 'junosServicePorts',
                        templateGenerator: 'TextGenerator'
                    }
                ]
            };
        };
        self.snmpSettings =  function() {
            return {
                title: ctwl.TITLE_SNMP_SETTINGS,
                templateGenerator: 'BlockListTemplateGenerator',
                templateGeneratorConfig: [
                    {
                        key: 'expDetSnmpVersion',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'snmpV2Community',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'snmpLocalPort',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'snmpRetries',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'snmpTimeout',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'snmpV3SecurityEngineId',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'snmpV3SecurityName',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'snmpV3SecurityLevel',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'snmpv3AuthProtocol',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'snmpv3PrivProtocol',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'snmpv3Context',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'snmpv3ContextEngineId',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'snmpv3EngineId',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'snmpv3EngineBoots',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'snmpv3EngineTime',
                        templateGenerator: 'TextGenerator'
                    }
                ]
            };
        };
        /*Start Edit Config Methods*/
        self.snmpVersion = function() {
            return {
                columns: [
                    {
                        elementId: 'snmpVersion',
                        view: "FormDropdownView",
                        viewConfig: {
                            path: "snmpVersion",
                            dataBindValue:"snmpVersion",
                            class: "span12",
                            elementConfig: {
                                    allowClear: true,
                                    dataTextField:"text",
                                    dataValueField: "value",
                                    data : ctwc.SNMP_VERSION_DATA
                            }
                         }
                    }
                ]
            };
        };
        self.v2VersionView =  function() {
            return {
                 elementId:ctwl.OVSDB_V2_VERSION_ID,
                 visible: "showV2",
                 view:"SectionView",
                 viewConfig:{
                     rows: [
                         {
                             columns: [
                                 {
                                     elementId: 'snmpV2Community',
                                     view: "FormInputView",
                                     viewConfig: {
                                         path: "snmpV2Community",
                                         dataBindValue: "snmpV2Community",
                                         class: "span12"
                                     }
                                 },
                             ]
                         },
                         {
                             columns: [
                                {
                                    elementId: 'snmpLocalPort',
                                    view: "FormInputView",
                                    viewConfig: {
                                        path: "snmpLocalPort",
                                        dataBindValue: "snmpLocalPort",
                                        class: "span12"
                                    }
                                }
                             ]
                         },
                         {
                             columns: [
                                {
                                    elementId: 'snmpRetries',
                                    view: "FormInputView",
                                    viewConfig: {
                                        path: "snmpRetries",
                                        dataBindValue: "snmpRetries",
                                        class: "span12"
                                    }
                                }
                             ]
                         },
                         {
                             columns: [
                                {
                                    elementId: 'snmpTimeout',
                                    view: "FormInputView",
                                    viewConfig: {
                                        path: "snmpTimeout",
                                        dataBindValue: "snmpTimeout",
                                        class: "span12"
                                    }
                                }
                             ]
                         }
                     ]
                 }
            };
        };
        self.auth_section = function() {
            return{
                elementId: "auth_section",
                view : "SectionView",
                visible : "showAuth",
                viewConfig : {
                    rows : [
                        {
                            columns : [
                                {
                                    elementId: "snmpv3AuthProtocol",
                                    view: "FormInputView",
                                    viewConfig: {
                                        path: "snmpv3AuthProtocol",
                                        dataBindValue: "snmpv3AuthProtocol",
                                        class: "span6"
                                    }
                                },
                                {
                                    elementId: "snmpv3AuthPasswd",
                                    view: "FormInputView",
                                    viewConfig: {
                                        path: "snmpv3AuthPasswd",
                                        type: "password",
                                        dataBindValue: "snmpv3AuthPasswd",
                                        class: "span6"
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
                visible : "showPrivacy",
                viewConfig : {
                    rows : [
                        {
                            columns : [
                                {
                                    elementId: 'snmpv3PrivProtocol',
                                    view: "FormInputView",
                                    viewConfig: {
                                        path: "snmpv3PrivProtocol",
                                        dataBindValue: "snmpv3PrivProtocol",
                                        class: "span6"
                                    }
                                 },
                                {
                                    elementId: 'snmpv3PrivPasswd',
                                    view: "FormInputView",
                                    viewConfig: {
                                        path: "snmpv3PrivPasswd",
                                        type: "password",
                                        dataBindValue: "snmpv3PrivPasswd",
                                        class: "span6"
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
                                         path: "snmpV3SecurityEngineId",
                                         dataBindValue:"snmpV3SecurityEngineId",
                                         class: "span12"
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
                                        path: "snmpv3Context",
                                        dataBindValue: "snmpv3Context",
                                        class: "span12"
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
                                        path: "snmpv3ContextEngineId",
                                        dataBindValue: "snmpv3ContextEngineId",
                                        class: "span12"
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
                                        path: "snmpv3EngineId",
                                        dataBindValue: "snmpv3EngineId",
                                        class: "span12"
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'snmpv3EngineBoots',
                                    view: "FormInputView",
                                    viewConfig: {
                                        path: "snmpv3EngineBoots",
                                        dataBindValue: "snmpv3EngineBoots",
                                        class: "span12"
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'snmpv3EngineTime',
                                    view: "FormInputView",
                                    viewConfig: {
                                        path: "snmpv3EngineTime",
                                        dataBindValue: "snmpv3EngineTime",
                                        class: "span12"
                                    }
                                }
                            ]
                        }
                    ]
                }
            };
        };
        self.v3VersionView =  function() {
            return {
                elementId:ctwl.OVSDB_V3_VERSION_ID,
                visible: 'showV3',
                view:"SectionView",
                viewConfig:{
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: 'snmpLocalPort',
                                    view: "FormInputView",
                                    viewConfig: {
                                        path: "snmpLocalPort",
                                        placeHolder: "161",
                                        dataBindValue: "snmpLocalPort",
                                        class: "span12"
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'snmpRetries',
                                    view: "FormInputView",
                                    viewConfig: {
                                        path: "snmpRetries",
                                        dataBindValue: "snmpRetries",
                                        class: "span12"
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'snmpTimeout',
                                    view: "FormInputView",
                                    viewConfig: {
                                        path: "snmpTimeout",
                                        dataBindValue: "snmpTimeout",
                                        class: "span12"
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'snmpV3SecurityName',
                                    view: "FormInputView",
                                    viewConfig: {
                                        path: "snmpV3SecurityName",
                                        dataBindValue: "snmpV3SecurityName",
                                        class: "span12"
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
                                        path: "snmpV3SecurityLevel",
                                        dataBindValue: "snmpV3SecurityLevel",
                                        class: "span12",
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
                        visible : "snmpMntd",
                        viewConfig: [
                           {
                               elementId: ctwl.OVSDB_SNMP_SECTION,
                               title : ctwl.OVSDB_SNMP_SECTION_TITLE,
                               view: "SectionView",
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
                            collection: "servicePorts",
                            columns: [
                                {
                                    elementId: 'portName',
                                    name: 'Port',
                                    view: "GridInputView",
                                    class: "",
                                    width: 200,
                                    viewConfig: {
                                        path: "portName",
                                        dataBindValue: "portName()"
                                    }
                                },
                            ],
                            rowActions: [
                                {
                                    onClick: "function() {\
                                    $root.deletePort($data, this); }",
                                    iconClass: 'icon-minus'
                                }
                            ],
                            gridActions: [
                                {
                                    onClick: "function() { addPort(); }",
                                    buttonTitle: "Add"
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
                         visible : 'isJunosPortEnabled',
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
                            path: "snmpMntd",
                            dataBindValue: "snmpMntd",
                            class: "span12"
                        }
                    }
                ]
            };
        };
        self.torAgentSection =  function(torAgentVrouterDS) {
            return {
                columns: [
                    {
                        elementId: 'torAgent1',
                        view: "FormDropdownView",
                        viewConfig: {
                            path: "torAgent1",
                            dataBindValue: "torAgent1",
                            class: "span6",
                            elementConfig:{
                                allowClear: true,
                                placeholder: ctwl.SELECT_ENTER_NAME,
                                dataTextField: "text",
                                dataValueField: "text",
                                data : torAgentVrouterDS
                            }
                        }
                    },
                    {
                        elementId: 'torAgent2',
                        view: "FormDropdownView",
                        viewConfig: {
                            path: "torAgent2",
                            dataBindValue: "torAgent2",
                            class: "span6",
                            elementConfig:{
                                allowClear: true,
                                placeholder: ctwl.SELECT_ENTER_NAME,
                                dataTextField: "text",
                                dataValueField: "text",
                                data : torAgentVrouterDS
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
                        elementId: 'tsn1',
                        view: "FormDropdownView",
                        viewConfig: {
                            path: "tsn1",
                            dataBindValue: "tsn1",
                            class: "span6",
                            elementConfig:{
                                allowClear: true,
                                placeholder: ctwl.SELECT_ENTER_NAME,
                                dataTextField: "text",
                                dataValueField: "text",
                                data : tsnVrouterDS
                            }
                        }
                    },
                    {
                        elementId: 'tsn2',
                        view: "FormDropdownView",
                        viewConfig: {
                            path: "tsn2",
                            dataBindValue: "tsn2",
                            class: "span6",
                            elementConfig:{
                                allowClear: true,
                                placeholder: ctwl.SELECT_ENTER_NAME,
                                dataTextField: "text",
                                dataValueField: "text",
                                data : tsnVrouterDS
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
                        elementId: 'pRouterName',
                        view: "FormInputView",
                        viewConfig: {
                            disabled: disableId,
                            path: "pRouterName",
                            dataBindValue: "pRouterName",
                            class: "span12"
                        }
                    }
                ]
            };
        };
        self.vendorModelSection = function() {
            return {
                columns: [
                    {
                        elementId: 'vendor',
                        view: "FormInputView",
                        viewConfig: {
                            path: "vendor",
                            dataBindValue: "vendor",
                            class: "span6"
                        }
                    },
                    {
                        elementId: 'pmodel',
                        view: "FormInputView",
                        viewConfig: {
                            path: "pmodel",
                            dataBindValue: "pmodel",
                            class: "span6"
                        }
                    }
                ]
            };
        };
        self.mgmntIPdataIPSection = function(){
            return {
                columns : [
                    {
                        elementId: 'mgmtIP',
                        view: "FormInputView",
                        viewConfig: {
                            path: "mgmtIP",
                            dataBindValue: "mgmtIP",
                            class: "span6"
                        }
                    },
                    {
                        elementId: 'dataIP',
                        view: "FormInputView",
                        viewConfig: {
                            path: "dataIP",
                            dataBindValue: "dataIP",
                            class: "span6"
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
                                        path: "virtualRouterType",
                                        dataBindValue: "virtualRouterType",
                                        class: "span12",
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
                                     visible: "showTorAgentSection",
                                     viewConfig: {
                                        rows: [
                                            self.torAgentSection(
                                                torAgentVrouterDS),
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
                viewConfig:{
                    rows : [
                        {
                            columns : [
                                {
                                    elementId: 'netConfManaged',
                                    view: "FormCheckboxView",
                                    viewConfig: {
                                        path: "netConfManaged",
                                        dataBindValue: "netConfManaged",
                                        class: "span12"
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
                                        path: "netConfUserName",
                                        dataBindValue: "netConfUserName",
                                        class: "span6"
                                    }
                                },
                                {
                                    elementId: 'netConfPasswd',
                                    view: "FormInputView",
                                    viewConfig: {
                                        path: "netConfPasswd",
                                        type: "password",
                                        dataBindValue: "netConfPasswd",
                                        class: "span6"
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'isJunosPortEnabled',
                                    view: "FormCheckboxView",
                                    viewConfig: {
                                        path: "isJunosPortEnabled",
                                        dataBindValue: "isJunosPortEnabled",
                                        class: "span12"
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
    return pdUtils;
});

