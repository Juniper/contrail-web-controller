/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore'
], function (_) {
    var infConfigTemplates = function() {
        var self = this;
        self.piPostData = {data: [{type: "physical-interfaces"}]};
        self.infFixedSection = function(disableId, infModel){
            return {
                columns: [
                    {
                        elementId: 'type',
                        view: "FormDropdownView",
                        viewConfig: {
                            path: "type",
                            dataBindValue: "type",
                            disabled: disableId,
                            class: "col-xs-3",
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
                            class: "col-xs-3"
                        }
                    },
                    {
                        elementId: 'user_created_physical_interface',
                        view: "FormDropdownView",
                        viewConfig: {
                            label: "Connected Physical Interface",
                            path: "user_created_physical_interface",
                            dataBindValue: "user_created_physical_interface",
                            visible : "showPhysicalInterfaceRefs",
                            class: "col-xs-6",
                            elementConfig:{
                                dataTextField: "text",
                                dataValueField: "value",
                                placeholder : "Select Physical Interface",
                                dataSource: {
                                    type: "remote",
                                    requestType: 'POST',
                                    postData: JSON.stringify(self.piPostData),
                                    url: '/api/tenants/config/get-config-list',
                                    parse: function(result) {
                                        return self.parsePhysicalInfLinkData(result, infModel);
                                    }
                                }
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
                            class: "col-xs-3",
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
                            class: "col-xs-3",
                            elementConfig:{
                                dataTextField: "text",
                                dataValueField: "value",
                                placeholder : "Enter or Select a Interface",
                                dataSource : {
                                    type : 'local',
                                    data : infModel.getPhysicalInterfaceData()
                                }
                            }
                        }
                    }
                ]
            };
        };

        self.parsePhysicalInfLinkData = function(result, infModel) {
            var piDS = [{text: "None", value: "none"}], piValue, piText, piFqName,
                currentPRName = contrail.getCookie(ctwl.PROUTER_KEY);
                physicalInfs =
                getValueByJsonPath(result, "0;physical-interfaces", []);
            _.each(physicalInfs, function(pi) {
                piFqName = getValueByJsonPath(pi,
                    "fq_name", [], false);
                if(piFqName.length === 3) {
                    if(currentPRName === piFqName[1] &&
                        infModel.name() === piFqName[2]) {
                        return;
                    }
                    piValue = piFqName[0] + ctwc.PHYSICAL_INF_LINK_PATTERN +
                        piFqName[1] + ctwc.PHYSICAL_INF_LINK_PATTERN + piFqName[2];
                    if(currentPRName !== piFqName[1]) {
                        piText = piFqName[2] + " (" + piFqName[1] + ")";
                    } else {
                        piText = piFqName[2];
                    }
                    piDS.push({text: piText, value: piValue});
                }
            });
            return piDS;
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
                               active:false,
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
                                class: "col-xs-12",
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
                                placeholder : '0',
                                dataBindValue: ctwl.VLAN,
                                disabled: disableId,
                                class: "col-xs-12"
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
                                class: "col-xs-12",
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
                                        templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                                        validation: "serverValidation",
                                        collection: "servers",
                                        columns: [
                                            {
                                                elementId: 'user_created_mac_address',
                                                name: 'Server MAC',
                                                view: "FormComboboxView",
                                                class: "",
                                                width: 290,
                                                viewConfig: {
                                                    path: "user_created_mac_address",
                                                    dataBindValue: "user_created_mac_address()",
                                                    dataBindOptionList : "dataSource()",
                                                    width: 290,
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
                                                width: 290,
                                                viewConfig: {
                                                    templateId:
                                             cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                    width: 290,
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
                                                $root.addServerByIndex($data, this); }",
                                                iconClass: 'fa fa-plus'
                                            },
                                            {
                                                onClick: "function() {\
                                                $root.deleteServer($data, this)\
                                                ;}",
                                                iconClass: 'fa fa-minus'
                                            }
                                        ],
                                        gridActions: [
                                            {
                                                onClick: "function() {\
                                                addServer(); }",
                                                buttonTitle: ""
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
                                        class: "col-xs-12"
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
                                        class: "col-xs-12"
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
