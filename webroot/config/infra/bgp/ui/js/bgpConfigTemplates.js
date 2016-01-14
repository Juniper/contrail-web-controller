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
                                        elementId: "user_created_admin_state",
                                        view: "FormCheckboxView",
                                        viewConfig: {
                                            path: "user_created_admin_state",
                                            dataBindValue: "user_created_admin_state",
                                            label: "Admin State",
                                            class: "span6"
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
                        title : 'Associate Peer(s)',
                        view : 'SectionView',
                        viewConfig : {
                            rows : [{
                                columns :[{
                                    elementId : 'peer_selection',
                                    view: 'FormCollectionView',
                                    class: 'pull-right',
                                    viewConfig: {
                                        path : 'peers',
                                        collection: 'peers',
                                        validation: 'peerValidation',
                                        templateId: cowc.TMPL_COLLECTION_GRIDACTION_HEADING_VIEW,
                                        gridActions: [
                                            {
                                                onClick: "function() { addPeer(); }",
                                                buttonTitle: ""
                                            }
                                        ],
                                        rows: [{
                                        rowActions: [
                                            {
                                                onClick: "function() {\
                                                $root.deletePeer($data, this); }",
                                                iconClass: 'icon-minus'
                                            }
                                        ],
                                        columns: [
                                            {
                                                elementId: 'peerName',
                                                name: 'Peer',
                                                view: "FormDropdownView",
                                                width: 150,
                                                viewConfig: {
                                                    disabled: "disabled()",
                                                    path: "peerName",
                                                    dataBindValue: "peerName()",
                                                    width: 150,
                                                    dataBindOptionList : "peerDataSource()",
                                                    templateId:
                                                        cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                    elementConfig: {
                                                        placeholder: "Select Peer",
                                                        dataTextField: "name",
                                                        dataValueField: "uuid"
                                                    }
                                                }
                                            },
                                            {
                                                elementId: "admin_state",
                                                name: "State",
                                                view: "FormCheckboxView",
                                                width: 70,
                                                class: "bgp-peer-text-center",
                                                viewConfig: {
                                                    path: "admin_state",
                                                    dataBindValue: "admin_state()",
                                                    width: 70,
                                                    templateId: cowc.TMPL_EDITABLE_GRID_CHECKBOX_VIEW
                                                }
                                            },
                                            {
                                                elementId: "passive",
                                                name: "Passive",
                                                view: "FormCheckboxView",
                                                width: 70,
                                                class: "bgp-peer-text-center",
                                                viewConfig: {
                                                    path: "passive",
                                                    dataBindValue: "passive()",
                                                    width: 70,
                                                    templateId: cowc.TMPL_EDITABLE_GRID_CHECKBOX_VIEW
                                                }
                                            },
                                            {
                                                elementId: "hold_time",
                                                name: "Hold Time",
                                                view: "FormInputView",
                                                width: 120,
                                                viewConfig: {
                                                    path: "hold_time",
                                                    placeholder: "0",
                                                    dataBindValue: "hold_time()",
                                                    width: 120,
                                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW
                                                }
                                            },
                                            {
                                                elementId: "loop_count",
                                                name: "Loop Count",
                                                view: "FormInputView",
                                                width: 120,
                                                viewConfig: {
                                                    path: "loop_count",
                                                    placeholder: "0",
                                                    dataBindValue: "loop_count()",
                                                    width: 120,
                                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW
                                                }
                                            },
                                            {
                                                elementId: 'user_created_auth_key_type',
                                                name: 'Auth',
                                                view: "FormDropdownView",
                                                class: "",
                                                width: 120,
                                                viewConfig: {
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
                                                width: 120,
                                                viewConfig: {
                                                    disabled :
                                                        'disableAuthKey()',
                                                    width: 120,
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
                                                        path: "family_attrs",
                                                        collection: "family_attrs()",
                                                        validation: "familyAttrValidation",
                                                        templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                                                        colSpan: "9",
                                                        columns: [{
                                                            elementId: "address_family",
                                                            name: "Address Family",
                                                            view: "FormDropdownView",
                                                            width: 245,
                                                            viewConfig: {
                                                                disabled: "disableFamilyAttr()",
                                                                width: 245,
                                                                path: "address_family",
                                                                dataBindOptionList : "familyAttrDataSource()",
                                                                templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                                dataBindValue: "address_family()",
                                                                elementConfig: {
                                                                    placeholder: "Select Address Family",
                                                                    dataValueField: "value",
                                                                    dataTextField: "text",
                                                                }
                                                            }
                                                        },{
                                                            elementId: "loop_count",
                                                            name: "Loop Count",
                                                            view: "FormInputView",
                                                            width: 128,
                                                            viewConfig: {
                                                                placeholder: "Enter Loop Count",
                                                                width: 128,
                                                                path: "loop_count",
                                                                templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                                dataBindValue: "loop_count()",
                                                            }
                                                        },{
                                                            elementId: "prefix_limit",
                                                            name: "Prefix Limit",
                                                            view: "FormInputView",
                                                            width: 128,
                                                            viewConfig: {
                                                                placeholder: "Enter Prefix Limit",
                                                                width: 128,
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
                                                                buttonTitle: ""
                                                            }
                                                        ]
                                                    }

                                            }]

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
