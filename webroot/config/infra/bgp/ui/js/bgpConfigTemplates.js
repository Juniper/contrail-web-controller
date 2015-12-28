/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function(_){
    var bgpConfigTemplates = function() {
        var self = this;
        self.advancedOptions = function(disableId) {
            return [
                {
                    elementId : 'advance_options_accordion',
                    view : 'AccordianView',
                    viewConfig : [
                        {
                            elementId : 'advance_options_section',
                            title : 'Advanced Options',
                            view : 'SectionView',
                            viewConfig : {
                                rows : [
                               {
                                columns : [
                                    {
                                        elementId: 'port',
                                        view: 'FormInputView',
                                        viewConfig: {
                                            placeholder : '179 (1 - 9999)',
                                            disabled: disableId,
                                            path:
                                            'bgp_router_parameters.port',
                                            dataBindValue:
                                            'bgp_router_parameters().port',
                                            label : 'BGP Port',
                                            class: 'span6'
                                        }
                                    },
                                    {
                                        elementId: 'source_port',
                                        view: 'FormInputView',
                                        viewConfig: {
                                            path:
                                            'bgp_router_parameters.source_port',
                                            dataBindValue:
                                            'bgp_router_parameters().source_port',
                                            label : 'Source Port',
                                            class: 'span6'
                                        }
                                    }
                                ]
                            },
                            {
                                columns: [
                                    {
                                        elementId: 'hold_time',
                                        view: 'FormInputView',
                                        viewConfig: {
                                            placeholder :
                                                '90 (1 - 65535 seconds)',
                                            path:
                                            'bgp_router_parameters.hold_time',
                                            dataBindValue:
                                            'bgp_router_parameters().hold_time',
                                            label : 'Hold Time (seconds)',
                                            class: 'span6'
                                        }
                                    },
                                    {
                                        elementId: "admin_down",
                                        view: "FormDropdownView",
                                        viewConfig: {
                                            path: "bgp_router_parameters.admin_down",
                                            dataBindValue: "bgp_router_parameters().admin_down",
                                            label: "State",
                                            class: "span6",
                                            elementConfig: {
                                                dataTextField: "text",
                                                dataValueField: "value",
                                                data: [
                                                    {
                                                        text: "Up",
                                                        value: "false"
                                                    },
                                                    {
                                                        text: "Down",
                                                        value: "true"
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                columns : [
                                    {
                                        elementId: 'user_created_auth_key_type',
                                        view: 'FormDropdownView',
                                        viewConfig: {
                                            path:
                                                'user_created_auth_key_type',
                                            dataBindValue:
                                                'user_created_auth_key_type',
                                            label : 'Authentication Mode',
                                            class: 'span6',
                                            elementConfig : {
                                                dataTextField :
                                                'text',
                                                dataValueField :
                                                'value',
                                                data : ctwc.AUTHENTICATION_DATA
                                            }
                                        }
                                    },
                                    {
                                        elementId: 'user_created_auth_key',
                                        view: 'FormInputView',
                                        viewConfig: {
                                            disabled: 'disableAuthKey',
                                            type: "password",
                                            path:
                                            'user_created_auth_key',
                                            dataBindValue:
                                            'user_created_auth_key',
                                            label : 'Authentication Key',
                                            class: 'span6'
                                        }
                                    }
                                ]
                            },
                            {
                                columns :[{
                                    elementId: 'user_created_physical_router',
                                    view: 'FormDropdownView',
                                    viewConfig: {
                                        visible : 'showPhysicalRouter',
                                        path:
                                        'user_created_physical_router',
                                        dataBindValue:
                                        'user_created_physical_router',
                                        label : 'Physical Router',
                                        class: 'span6',
                                        elementConfig : {
                                            dataTextField :
                                            'text',
                                            dataValueField :
                                            'value',
                                            dataSource: {
                                                type : 'remote',
                                                url :
                                                '/api/tenants/config/physical-routers-list',
                                                parse : function(result) {
                                                    result = ifNull(result, []);
                                                    var prouters =
                                                    result['physical-routers'];
                                                    var ddData = [
                                                        {
                                                            text:'None',
                                                            value:'none'
                                                        }
                                                    ];
                                                    if(prouters.length > 0) {
                                                        for(var i = 0; i < prouters.length; i++){
                                                            ddData.push({
                                                                text:prouters[i]['fq_name'][1],
                                                                value:prouters[i]['uuid']
                                                            });
                                                        }
                                                    }
                                                     return  ddData;
                                                }
                                            }
                                        }
                                    }
                                }]
                            }]
                          }
                      }
                  ]
                }
            ];
        };
        self.peerSelection = function() {
            return [{
                elementId : 'peer_selection_accordian',
                view : 'AccordianView',
                viewConfig : [
                    {
                        visible : 'showPeersSelection',
                        elementId : 'peer_selection_section',
                        title : 'Select Peer(s)',
                        view : 'SectionView',
                        viewConfig : {
                            rows : [{
                                columns :[{
                                    elementId : 'peer_selection',
                                    view: 'FormCollectionView',
                                    viewConfig: {
                                        path : 'peers',
                                        collection: 'peers',
                                        validation: 'peerValidation',
                                        templateId: cowc.TMPL_COLLECTION_HEADING_VIEW,
                                        rows: [{
                                        columns: [
                                            {
                                                elementId: 'isPeerSelected',
                                                view: 'FormCheckboxView',
                                                name : '',
                                                width: 40,
                                                viewConfig: {
                                                    path: "isPeerSelected",
                                                    dataBindValue:
                                                        "isPeerSelected()",
                                                    width: 40,
                                                    templateId:
                                                        cowc.TMPL_EDITABLE_GRID_CHECKBOX_VIEW
                                                }
                                            },
                                            {
                                                elementId: 'peerName',
                                                name: 'Peer',
                                                view: "FormInputView",
                                                width: 150,
                                                viewConfig: {
                                                    disabled : 'disabled()',
                                                    path: "peerName",
                                                    dataBindValue: "peerName()",
                                                    width: 150,
                                                    templateId:
                                                        cowc.TMPL_EDITABLE_GRID_INPUT_VIEW
                                                }
                                            },
                                            {
                                                elementId: "admin_down",
                                                name: "State",
                                                view: "FormDropdownView",
                                                width: 70,
                                                viewConfig: {
                                                    disabled: "disableUnSelItem()",
                                                    path: "admin_down",
                                                    dataBindValue: "admin_down()",
                                                    width: 70,
                                                    templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                    elementConfig: {
                                                        dataValueField: "value",
                                                        dataTextField: "text",
                                                        data: [
                                                            {
                                                               value: "false",
                                                               text: "Up"
                                                            },
                                                            {
                                                                value: "true",
                                                                text: "Down"
                                                            }
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                elementId: "passive",
                                                name: "Passive",
                                                view: "FormCheckboxView",
                                                width: 80,
                                                viewConfig: {
                                                    disabled: "disableUnSelItem()",
                                                    path: "passive",
                                                    dataBindValue: "passive()",
                                                    width: 80,
                                                    templateId: cowc.TMPL_EDITABLE_GRID_CHECKBOX_VIEW
                                                }
                                            },
                                            {
                                                elementId: "hold_time",
                                                name: "Hold Time",
                                                view: "FormInputView",
                                                width: 70,
                                                viewConfig: {
                                                    disabled: "disableUnSelItem()",
                                                    path: "hold_time",
                                                    placeholder: "0",
                                                    dataBindValue: "hold_time()",
                                                    width: 70,
                                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW
                                                }
                                            },
                                            {
                                                elementId: "loop_count",
                                                name: "Loop Count",
                                                view: "FormInputView",
                                                width: 80,
                                                viewConfig: {
                                                    disabled: "disableUnSelItem()",
                                                    path: "loop_count",
                                                    placeholder: "0",
                                                    dataBindValue: "loop_count()",
                                                    width: 80,
                                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW
                                                }
                                            },
                                            {
                                                elementId: 'user_created_auth_key_type',
                                                name: 'Auth Mode',
                                                view: "FormDropdownView",
                                                class: "",
                                                width: 120,
                                                viewConfig: {
                                                    disabled: "disableUnSelItem()",
                                                    path:
                                                        "user_created_auth_key_type",
                                                    dataBindValue:
                                                        "user_created_auth_key_type()",
                                                    width: 120,
                                                    templateId:
                                                      cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                    elementConfig : {
                                                        dataTextField : "text",
                                                        dataValueField : "value",
                                                        data :
                                                            ctwc.AUTHENTICATION_DATA
                                                    },
                                                }
                                            },
                                            {
                                                elementId: 'user_created_auth_key',
                                                name: 'Auth Key',
                                                view: 'FormInputView',
                                                width: 150,
                                                viewConfig: {
                                                    disabled :
                                                        'disableAuthKey()',
                                                    width: 150,
                                                    type: "password",
                                                    path:
                                                    'user_created_auth_key',
                                                    dataBindValue:
                                                    'user_created_auth_key()',
                                                    templateId:
                                                        cowc.TMPL_EDITABLE_GRID_INPUT_VIEW
                                                }
                                            }]
                                        },{
                                            columns:[
                                                {
                                                    elementId: "family_attrs",
                                                    view: "FormEditableGridView",
                                                    viewConfig: {
                                                        visible: "!disableUnSelItem()()",
                                                        path: "family_attrs",
                                                        collection: "family_attrs()",
                                                        validation: "familyAttrValidation",
                                                        colSpan: "8",
                                                        columns: [{
                                                            elementId: "address_family",
                                                            name: "",
                                                            view: "FormDropdownView",
                                                            //width: "auto",
                                                            viewConfig: {
                                                                //width: "auto",
                                                                path: "address_family",
                                                                templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                                dataBindValue: "address_family()",
                                                                elementConfig: {
                                                                    placeholder: "Select Address Family",
                                                                    dataValueField: "value",
                                                                    dataTextField: "text",
                                                                    data : [
                                                                        {
                                                                            text: "inet",
                                                                            value: "inet"
                                                                        },
                                                                        {
                                                                            text: "inet-vpn",
                                                                            value: "inet-vpn"
                                                                        },
                                                                        {
                                                                            text: "e-vpn",
                                                                            value: "e-vpn"
                                                                        },
                                                                        {
                                                                            text: "erm-vpn",
                                                                            value: "erm-vpn"
                                                                        },
                                                                        {
                                                                            text: "route-target",
                                                                            value: "route-target"
                                                                        },
                                                                        {
                                                                            text: "inet6-vpn",
                                                                            value: "inet6-vpn"
                                                                        }
                                                                    ]
                                                                }
                                                            }
                                                        },{
                                                            elementId: "loop_count",
                                                            name: "",
                                                            view: "FormInputView",
                                                            width: 120,
                                                            viewConfig: {
                                                                placeholder: "Loop Count",
                                                                width: 120,
                                                                path: "loop_count",
                                                                templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                                dataBindValue: "loop_count()",
                                                            }
                                                        },{
                                                            elementId: "prefix_limit",
                                                            name: "",
                                                            view: "FormInputView",
                                                            width: 120,
                                                            viewConfig: {
                                                                placeholder: "Prefix Limit",
                                                                width: 120,
                                                                path: "prefix_limit",
                                                                dataBindValue: "prefix_limit()",
                                                                templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW
                                                            }
                                                        }],
                                                        rowActions: [
                                                            {
                                                                onClick: "function() {\
                                                                ($parent.deleteFamilyAttrs())($data, this)\
                                                                ;}",
                                                                iconClass: 'icon-minus'
                                                            }
                                                        ],
                                                        gridActions: [
                                                            {
                                                                onClick: "function() {\
                                                                (addFamilyAttrs())($root, $index, $data, $rawData); }",
                                                                buttonTitle: "Add Family Attributes"
                                                            }
                                                        ]
                                                    }

                                                }
                                            ]
                                        }]
                                     }
                                }]
                            }]
                        }
                    }
                ]
            }];
        };
    };
    return bgpConfigTemplates
});
