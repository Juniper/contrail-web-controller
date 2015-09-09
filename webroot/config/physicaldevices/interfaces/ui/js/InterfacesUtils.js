/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore'
], function (_) {
    var infUtils = function() {
        var self = this;
        self.infFixedSection = function(disableId, accrodianData){
            return {
                columns: [
                    {
                        elementId: 'type',
                        view: "FormDropdownView",
                        viewConfig: {
                            path: "type",
                            dataBindValue: "type",
                            disabled: disableId,
                            class: "span4",
                            elementConfig:{
                                allowClear: true,
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
                            class: "span4"
                        }
                    },
                    {
                        elementId: 'parent',
                        view: "FormHierarchicalDropdownView",
                        viewConfig: {
                            path: "parent",
                            dataBindValue: "parent",
                            disabled: disableId,
                            class: "span4",
                            elementConfig:{
                                dataTextField: "text",
                                dataValueField: "value",
                                defaultValueId: 1,
                                minimumResultsForSearch : 1,
                                queryMap: [
                                    {
                                        grpName : 'Physical Router',
                                        iconClass :
                                            'icon-contrail-virtual-network'
                                    },
                                    {
                                        grpName : 'Physical Interface',
                                        iconClass : 'icon-contrail-network-ipam'
                                    }
                                ],
                                data : accrodianData
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
                            elementId: 'logicalInfType',
                            view: "FormDropdownView",
                            viewConfig: {
                                path: "logicalInfType",
                                dataBindValue: "logicalInfType",
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
                            elementId: 'vlan',
                            view: "FormInputView",
                            viewConfig: {
                                path: "vlan",
                                dataBindValue: "vlan",
                                disabled: disableId,
                                class: "span12"
                            }
                        }
                    ]
                },
                {
                    columns : [
                        {
                            elementId: 'virtualNetwork',
                            view: "FormDropdownView",
                            viewConfig: {
                                path: "vnUUID",
                                dataBindValue: "vnUUID",

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
                    logicalInfType() === 'L2') {
                    self.infEditView.model.servers(
                       new Backbone.Collection([]));
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
                                        collection: "servers",
                                        columns: [
                                            {
                                                elementId: 'mac',
                                                name: 'Server',
                                                view: "FormComboboxView",
                                                class: "",
                                                width: 200,
                                                viewConfig: {
                                                    path: "mac",
                                                    dataBindValue: "mac()",
                                                    width: 200,
                                                    templateId:
                                          cowc.TMPL_EDITABLE_GRID_COMBOBOX_VIEW,
                                                    elementConfig : {
                                                        placeholder:
                                                            ctwl.ENTER_SERVER,
                                                        defaultValueId : 0,
                                                        dataTextField : "text",
                                                        dataValueField :
                                                        "value",
                                                        change :
                                                             infEditView.
                                                             onServerMacChange,
                                                        dataSource : {
                                                            type : 'local',
                                                            data :
                                                          infEditView.vmiDataSrc
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                elementId: 'ip',
                                                name: 'IP',
                                                view: "FormInputView",
                                                class: "",
                                                width: 200,
                                                viewConfig: {
                                                    templateId:
                                             cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                    path: "ip",
                                                    dataBindValue: "ip()",
                                                    disabled: disableId,
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
                                                buttonTitle: "Add"
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
                                    elementId: 'infSubnet',
                                    view: "FormInputView",
                                    viewConfig: {
                                        path: "infSubnet",
                                        dataBindValue: "infSubnet",
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
    return infUtils;
});