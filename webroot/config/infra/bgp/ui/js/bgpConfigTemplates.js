/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function(_){
    var bgpConfigTemplates = function() {
        var self = this;
        self.advancedOptions = function(disableId) {
            return [
                {
                    elementId : 'advance_options_accrodion',
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
                                        elementId: 'hold_time',
                                        view: 'FormInputView',
                                        viewConfig: {
                                            placeholder :
                                                '90 (1 - 65535 seconds)',
                                            path:
                                            'bgp_router_parameters.hold_time',
                                            dataBindValue:
                                            'bgp_router_parameters().hold_time',
                                            label : 'Hold Time',
                                            class: 'span6'
                                        }
                                    },
                                    {
                                        elementId: 'bgp_port',
                                        view: 'FormInputView',
                                        viewConfig: {
                                            placeholder : '1 - 9999',
                                            disabled: disableId,
                                            path:
                                            'bgp_router_parameters.port',
                                            dataBindValue:
                                            'bgp_router_parameters().port',
                                            label : 'BGP Port',
                                            class: 'span6'
                                        }
                                    }
                                ]
                            },
                            {
                                columns : [
                                    {
                                        elementId: 'auth_key_type',
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
                                        elementId: 'auth_key',
                                        view: 'FormInputView',
                                        viewConfig: {
                                            placeholder :  'Enter a key',
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
                                    elementId: 'physical_router',
                                    view: 'FormDropdownView',
                                    viewConfig: {
                                        visible : 'showPhysicalRouter',
                                        path:
                                        'user_created_physical_router',
                                        dataBindValue:
                                        'user_created_physical_router',
                                        label : 'Physical Router',
                                        class: 'span12',
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
                                    view: 'FormEditableGridView',
                                    viewConfig: {
                                        path : 'peers',
                                        collection: 'peers',
                                        validation: 'peerValidation',
                                        columns: [
                                            {
                                                elementId: 'isPeerSelected',
                                                view: 'FormCheckboxView',
                                                name : 'Enable',
                                                width: 100,
                                                viewConfig: {
                                                    path: "isPeerSelected",
                                                    dataBindValue:
                                                        "isPeerSelected()",
                                                    width: 100,
                                                    templateId:
                                                        cowc.TMPL_EDITABLE_GRID_CHECKBOX_VIEW
                                                }
                                            },
                                            {
                                                elementId: 'peerName',
                                                name: 'Peer Name',
                                                view: "FormInputView",
                                                width: 200,
                                                viewConfig: {
                                                    disabled : 'disabled()',
                                                    path: "peerName",
                                                    dataBindValue: "peerName()",
                                                    width: 200,
                                                    templateId:
                                                        cowc.TMPL_EDITABLE_GRID_INPUT_VIEW
                                                }
                                            },
                                            {
                                                elementId: 'authenticationType',
                                                name: 'Authentication Mode',
                                                view: "FormDropdownView",
                                                class: "",
                                                width: 200,
                                                viewConfig: {
                                                    path:
                                                        "user_created_auth_key_type",
                                                    dataBindValue:
                                                        "user_created_auth_key_type()",
                                                    width: 200,
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
                                                elementId: 'authenticationKey',
                                                name: 'Authentication Key',
                                                view: 'FormInputView',
                                                width: 200,
                                                viewConfig: {
                                                    disabled :
                                                        'disableAuthKey()',
                                                    /*placeholder :
                                                        'Enter a key',*/
                                                    width: 200,
                                                    type: "password",
                                                    path:
                                                    'user_created_auth_key',
                                                    dataBindValue:
                                                    'user_created_auth_key()',
                                                    templateId:
                                                        cowc.TMPL_EDITABLE_GRID_INPUT_VIEW
                                                }
                                            }
                                        ]
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