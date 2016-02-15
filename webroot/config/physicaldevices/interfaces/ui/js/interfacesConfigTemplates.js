/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore'
], function (_) {
    var infConfigTemplates = function() {
        var self = this;
        self.infFixedSection = function(disableId, parentData){
            return {
                columns: [
                    {
                        elementId: 'type',
                        view: "FormDropdownView",
                        viewConfig: {
                            path: "type",
                            dataBindValue: "type",
                            disabled: disableId,
                            class: "span3",
                            elementConfig:{
                                dataTextField: "text",
                                dataValueField: "value",
                                data : ctwc.INTERFACE_TYPE_DATA
                            }
                        }
                    },
                    {
                        elementId: 'name',
                        view: "FormInputView",
                        viewConfig: {
                            disabled: disableId,
                            path: "name",
                            dataBindValue: "name",
                            class: "span3"
                        }
                    },
                    {
                        elementId: 'user_created_physical_interface',
                        view: "FormDropdownView",
                        viewConfig: {
                            label: "Parent Physical Interface",
                            path: "user_created_physical_interface",
                            dataBindValue: "user_created_physical_interface",
                            visible : "showPhysicalInterfaceRefs",
                            class: "span6",
                            dataBindOptionList: "physicalInfRefsDataSrc",
                            elementConfig:{
                                dataTextField: "text",
                                dataValueField: "text",
                                placeholder : "Select Physical Interface",
                            }
                        }
                    },
                    {
                        elementId: 'parent_type',
                        view: "FormDropdownView",
                        viewConfig: {
                            path: "parent_type",
                            dataBindValue: "parent_type",
                            disabled: disableId,
                            visible : "showLogicalInfProp",
                            class: "span3",
                            elementConfig:{
                                dataTextField: "text",
                                dataValueField: "value",
                                placeholder : "Select Parent Type",
                                data : ctwc.INF_PARENT_TYPE_DATA
                            }
                        }
                    },
                    {
                        elementId: 'parent',
                        view: "FormComboboxView",
                        viewConfig: {
                            path: "parent",
                            dataBindValue: "parent",
                            disabled: disableId,
                            visible : "showParent",
                            class: "span3",
                            elementConfig:{
                                dataTextField: "text",
                                dataValueField: "value",
                                placeholder : "Enter or Select a Interface",
                                dataSource : {
                                    type : 'local',
                                    data : parentData
                                }
                            }
                        }
                    }
                ]
            };
        };
        self.infVariableSection =  function(disableId, infEditView) {
            return {
                columns : [
                    {
                        elementId: ctwl.LOGICAL_INF_ACCORDION,
                        view: "AccordianView",
                        viewConfig: [
                           {
                               visible : "showLogicalInfProp",
                               elementId: ctwl.LOGICAL_INF_SECTION,
                               title : ctwl.LOGICAL_INF_SECTION_TITLE,
                               view : "SectionView",
                               viewConfig : {
                                   rows : self.logicalInfProp(disableId,
                                       infEditView)
                               }
                           }
                        ]
                    }
                ]
            };
        };
        self.logicalInfProp = function(disableId, infEditView) {
            return [
                {
                    columns : [
                        {
                            elementId: ctwl.LOGICAL_INF_TYPE,
                            view: "FormDropdownView",
                            viewConfig: {
                                path: ctwl.LOGICAL_INF_TYPE,
                                dataBindValue: ctwl.LOGICAL_INF_TYPE,
                                disabled: disableId,
                                class: "span12",
                                elementConfig:{
                                    allowClear: true,
                                    dataTextField: "text",
                                    dataValueField: "value",
                                    data : ctwc.LOGICAL_INF_TYPE_DATA
                                }
                            }
                        }
                    ]
                },
                {
                    columns : [
                        {
                            elementId: ctwl.VLAN,
                            view: "FormInputView",
                            viewConfig: {
                                path: ctwl.VLAN,
                                label : 'VLAN ID',
                                dataBindValue: ctwl.VLAN,
                                disabled: disableId,
                                class: "span12"
                            }
                        }
                    ]
                },
                {
                    columns : [
                        {
                            elementId: 'user_created_virtual_network',
                            view: "FormDropdownView",
                            viewConfig: {
                                path: "user_created_virtual_network",
                                dataBindValue: "user_created_virtual_network",
                                label : 'Virtual Network',
                                class: "span12",
                                elementConfig:{
                                    allowClear: true,
                                    dataTextField: "text",
                                    dataValueField: "value",
                                    change : self.onVNSelectionChanged,
                                    data : infEditView.vnDataSrc
                                }
                            }
                        }
                    ]
                },
                {
                    columns : [
                        self.l3Details(),
                        self.serverDetails(disableId, infEditView),
                        self.clearPorts()

                    ]
                }
            ];
        };

        self.onVNSelectionChanged = function(e){
            if(!self.infEditView.offChangeEvnt && e.added != null) {
                if(self.infEditView.model.
                    logical_interface_type() === ctwl.LOGICAL_INF_L2_TYPE) {
                    self.infEditView.model.model().attributes.servers.reset();
                    if(e.added.value != 'none') {
                        var id = e.added.value;
                        self.infEditView.
                            fetchVMIDetails(id);
                    }
                } else {
                    if(e.added.value != 'none') {
                        self.infEditView.model.
                           isSubnetVMICreate(true);
                    } else {
                        self.infEditView.model.
                           isSubnetVMICreate(false);
                    }
                }
            }
        };
        self.serverDetails = function(disableId, infEditView) {
            return {
                elementId: 'serverDetailsSection',
                view : 'SectionView',
                viewConfig : {
                    visible : 'showServerDetails',
                    rows : [
                        {
                            columns : [
                                {
                                    elementId: 'infServer',
                                    view: "FormEditableGridView",
                                    viewConfig: {
                                        path: "server",
                                        validation: "serverValidation",
                                        collection: "servers",
                                        columns: [
                                            {
                                                elementId: 'user_created_mac_address',
                                                name: 'Server MAC',
                                                view: "FormComboboxView",
                                                class: "",
                                                width: 200,
                                                viewConfig: {
                                                    path: "user_created_mac_address",
                                                    dataBindValue: "user_created_mac_address()",
                                                    dataBindOptionList : "dataSource()",
                                                    width: 200,
                                                    templateId:
                                          cowc.TMPL_EDITABLE_GRID_COMBOBOX_VIEW,
                                                    elementConfig : {
                                                        placeholder:
                                                            ctwl.ENTER_SERVER,
                                                        defaultValueId : 0,
                                                        dataTextField : "text",
                                                        dataValueField : "value"
                                                    }
                                                }
                                            },
                                            {
                                                elementId: 'user_created_instance_ip_address',
                                                name: 'IP Address',
                                                view: "FormInputView",
                                                class: "",
                                                width: 200,
                                                viewConfig: {
                                                    templateId:
                                             cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                    path: "user_created_instance_ip_address",
                                                    placeholder:ctwl.IP_PH,
                                                    dataBindValue: "user_created_instance_ip_address()",
                                                    disabled: 'disable()',
                                                }
                                            }
                                        ],
                                        rowActions: [
                                            {
                                                onClick: "function() {\
                                                $root.deleteServer($data, this)\
                                                ;}",
                                                iconClass: 'icon-minus'
                                            }
                                        ],
                                        gridActions: [
                                            {
                                                onClick: "function() {\
                                                addServer(); }",
                                                buttonTitle: "Add Server"
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    ]
                }
            };
        };
        self.l3Details = function() {
            return {
                elementId: 'l3DetailsSection',
                view : 'SectionView',
                viewConfig : {
                    visible : 'showL3Details',
                    rows : [
                        {
                            columns : [
                                {
                                    elementId: 'user_created_subnet',
                                    view: "FormInputView",
                                    viewConfig: {
                                        label : 'Subnet',
                                        path: "user_created_subnet",
                                        dataBindValue: "user_created_subnet",
                                        class: "span12"
                                    }
                                }
                            ]
                        }
                    ]
                }
            };
        };
        self.clearPorts = function() {
            return {
                elementId: 'clearPortsSection',
                view : 'SectionView',
                viewConfig : {
                    visible : 'showClearPorts',
                    rows : [
                        {
                            columns : [
                                {
                                    elementId: 'clearPorts',
                                    view: "FormCheckboxView",
                                    viewConfig: {
                                        label : "Clear Ports",
                                        path: "clearPorts",
                                        dataBindValue: "clearPorts",
                                        class: "span12"
                                    }
                                }
                            ]
                        }
                    ]
                }
            };
        };
    };
    return infConfigTemplates;
});