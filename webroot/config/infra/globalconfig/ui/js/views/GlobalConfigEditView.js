/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwl.GLOBAL_CONFIG_GRID_ID;
    var prefixId = ctwl.GLOBAL_CONFIG_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
    var formId = '#' + modalId + '-form';

    var GlobalConfigEditView = ContrailView.extend({
        renderEditGlobalConfig: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': '',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.configureGlobalConfig(options['configData'], {
                    init: function () {
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            self.model.showErrorAttr(prefixId +
                                                     cowc.FORM_SUFFIX_ID,
                                                     error.responseText);
                        });
                    }
                });
                // TODO: Release binding on successful configure
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});

            self.renderView4Config($("#" + modalId).find(formId),
                                   this.model,
                                   getEditGlobalConfigViewConfig(),
                                   "globalConfigValidations",
                                   null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self, {collection:
                                  self.model.model().attributes.ipFabricSubnets});
            });
        }
    });

    var fwdOptionsViewConfig = function () {
        return {
            elementId: 'forwarding_option',
            title: 'Forwarding Options',
            view: 'SectionView',
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'forwarding_mode',
                                view: 'FormDropdownView',
                                viewConfig: {
                                    label: 'Forwarding Mode',
                                    path: 'forwarding_mode',
                                    dataBindValue:
                                        'forwarding_mode',
                                    class: 'span7',
                                    elementConfig: {
                                        dataTextField : "text",
                                        dataValueField : "id",
                                        data : [{id: 'Default', text: 'Default'},
                                            {id: 'l2_l3', text: 'L2 and L3'},
                                            {id: 'l2', text: 'L2 Only'},
                                            {id: 'l3', text: 'L3 Only'}]
                                    }
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'vxlan_network_identifier_mode',
                                view: 'FormRadioButtonView',
                                viewConfig: {
                                    label: 'VxLAN Identifier Mode',
                                    path: 'vxlan_network_identifier_mode',
                                    dataBindValue:
                                        'vxlan_network_identifier_mode',
                                    class: 'span12',
                                    elementConfig: {
                                        dataObj: [
                                            {'label': 'Auto Configured',
                                             'value': 'automatic'},
                                            {'label': 'User Configured',
                                             'value': 'configured'}
                                        ]
                                    }
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'encapPriorityOrders',
                                view: 'FormEditableGridView',
                                viewConfig: {
                                    path: 'encapPriorityOrders',
                                    collection: 'encapPriorityOrders',
                                    validation: 'encapPriorityOrdersValidation',
                                    class: "span12",
                                    columns: [{
                                        elementId: 'encapsulation_priorities',
                                        name: 'Encapsulation Priority Order',
                                        view: 'FormDropdownView',
                                        viewConfig: {
                                            templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                            path:
                                            'encapsulation_priorities',
                                            dataBindValue:
                                                'encapsulation_priorities()',
                                            elementConfig: {
                                                dataTextField: 'text',
                                                dataValueField: 'id',
                                                data: [{id: 'MPLS Over UDP', 
                                                        text: 'MPLS Over UDP'},
                                                      {id: 'MPLS Over GRE',
                                                       text: 'MPLS Over GRE'},
                                                      {id: 'VxLAN',
                                                       text: 'VxLAN'}]
                                            }
                                        }
                                    }],
                                    rowActions: [
                                        { onClick: "function() { $root.addEncapPriOrders($data, this); }",
                                          iconClass: 'icon-plus'},
                                        { onClick: "function() {$root.deleteEncapPriOrders($data, this); }",
                                          iconClass: 'icon-minus'}
                                    ],
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var bgpOptionsViewConfig = function () {
        return {
            elementId: 'bgp_option',
            title: 'BGP Options',
            view: 'SectionView',
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'autonomous_system',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Autonomous System',
                                    path: 'autonomous_system',
                                    dataBindValue: 'autonomous_system',
                                    class: 'span7',
                                    placeholder: 'Enter BGP ASN Value'
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'ibgp_auto_mesh',
                                view: 'FormCheckboxView',
                                viewConfig: {
                                    label: 'Enable iBGP Auto Mesh',
                                    path: 'ibgp_auto_mesh',
                                    dataBindValue: 'ibgp_auto_mesh',
                                    class: 'span12'
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'ipFabricSubnets',
                                view: 'FormEditableGridView',
                                viewConfig: {
                                    path: 'ipFabricSubnets',
                                    collection: 'ipFabricSubnets',
                                    validation: 'ipFabricSubnetsValidation',
                                    class: "span8",
                                    columns: [{
                                        elementId: 'ip_fabric_subnets',
                                        name: 'IP Fabric Subnets',
                                        view: 'FormInputView',
                                        viewConfig: {
                                            templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                            path: 'ip_fabric_subnets',
                                            placeholder:'CIDR',
                                            dataBindValue:
                                                'ip_fabric_subnets()',
                                        }
                                    }],
                                    rowActions: [
                                        { onClick: "function() {$root.deleteSubnet($data, this); }",
                                          iconClass: 'icon-minus'}
                                    ],
                                    gridActions: [
                                        { onClick: "function() { $root.addSubnet(); }",
                                          buttonTitle:"Add Subnet"}
                                    ],
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var flowOptionsViewConfig = function () {
        return {
            elementId: 'flow_option',
            title: 'Flow Options',
            view: 'SectionView',
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'flow_export_rate',
                                view: 'FormInputView',
                                viewConfig: {
                                    path: 'flow_export_rate',
                                    dataBindValue: 'flow_export_rate',
                                    class: 'span7'
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'flowAgingTimeout',
                                view: 'FormEditableGridView',
                                viewConfig: {
                                    label: 'Protocol Flow Aging',
                                    path: 'flowAgingTimeout',
                                    collection: 'flowAgingTimeout',
                                    validation: 'flowAgingTimeoutValidation',
                                    class: 'rule span9',
                                    columns: [{
                                        elementId: 'protocol',
                                        name: 'Protocol',
                                        view: 'FormComboboxView',
                                        viewConfig: {
                                            templateId:
                                                cowc.TMPL_EDITABLE_GRID_COMBOBOX_VIEW,
                                            width: 150,
                                            path: 'protocol',
                                            dataBindValue: 'protocol()',
                                            elementConfig: {
                                                dataTextField: 'text',
                                                dataValueField: 'value',
                                                dataSource: {
                                                    type: 'local',
                                                    data: [{text: 'TCP',
                                                            value: 'tcp'},
                                                           {text: 'UDP',
                                                             value: 'udp'},
                                                            {text: 'ICMP',
                                                             value: 'icmp'}]
                                                             }
                                            }
                                        }
                                    },
                                    {
                                        elementId: 'port',
                                        name: 'Port',
                                        view: 'FormInputView',
                                        class: "",
                                        viewConfig: {
                                            templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                            width: 150,
                                            path: 'port',
                                            dataBindValue: 'port()',
                                            placeholder: 'All Ports'
                                        }
                                    },
                                    {
                                        elementId: 'timeout_in_seconds',
                                        name: 'Timeout (Secs)',
                                        view: 'FormInputView',
                                        class: "",
                                        viewConfig: {
                                            width: 150,
                                            templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                            path: 'timeout_in_seconds',
                                            dataBindValue: 'timeout_in_seconds()',
                                            placeholder: '180'
                                        }
                                    }],
                                    rowActions: [{
                                        onClick: "function() {\
                                            $root.deleteFlowAgingTuple($data, this);\
                                        }",
                                        iconClass: 'icon-minus',
                                    }],
                                    gridActions: [{
                                        onClick: "function() {\
                                            $root.addFlowAgingTuple();\
                                        }",
                                        buttonTitle:"Add Protocol"
                                    }]
                                }
                            }
                        ]
                    }
                ]
            }
        }
    }
 
    function getEditGlobalConfigViewConfig () {
        var prefixId = ctwl.GLOBAL_CONFIG_PREFIX_ID;
        var globalConfigViewConfig = {
            elementId: cowu.formatElementId([prefixId, ctwl.TITLE_EDIT_GLOBAL_CONFIG]),
            title: ctwl.TITLE_EDIT_GLOBAL_CONFIG,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'fwdOptions',
                                view: 'AccordianView',
                                viewConfig: [
                                    fwdOptionsViewConfig()
                                ]
                            },
                            {
                                elementId: 'bgpOptions',
                                view: 'AccordianView',
                                viewConfig: [
                                    bgpOptionsViewConfig()
                                ]
                            },
                            {
                                elementId: 'flowOptions',
                                view: 'AccordianView',
                                viewConfig: [
                                    flowOptionsViewConfig()
                                ]
                            }

                        ]
                    }
                ]
            }
        }
        return globalConfigViewConfig;
    }

    return GlobalConfigEditView;
});

