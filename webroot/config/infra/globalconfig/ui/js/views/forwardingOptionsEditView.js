/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwc.GLOBAL_FORWARDING_OPTIONS_GRID_ID,
        prefixId = ctwc.GLOBAL_FORWARDING_OPTIONS_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        formId = '#' + modalId + '-form';

    var forwardingOptionsEditView = ContrailView.extend({
        renderEditForwardingOptions: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT),
                editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-560',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.configureForwardingOptions({
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
                                   fwdOptionsViewConfig(),
                                   "forwardingOptionsValidations",
                                   null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self, {collection:
                    self.model.model().attributes.portTranslationCollection});
            }, null, null, false);
        }
    });

    var fwdOptionsViewConfig = function () {
        return {
            elementId: ctwc.GLOBAL_FORWARDING_OPTIONS_PREFIX_ID,
            view: 'SectionView',
            active:false,
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
                                    class: 'col-xs-6',
                                    elementConfig: {
                                        dataTextField : "text",
                                        dataValueField : "id",
                                        data : [{id: 'Default', text: 'Default'},
                                            {id: 'l2_l3', text: 'L2 and L3'},
                                            {id: 'l2', text: 'L2 Only'},
                                            {id: 'l3', text: 'L3 Only'}]
                                    }
                                }
                            },
                            {
                                elementId: 'flow_export_rate',
                                view: 'FormInputView',
                                viewConfig: {
                                    path: 'flow_export_rate',
                                    label: 'Session Export Rate/secs',
                                    dataBindValue: 'flow_export_rate',
                                    class: 'col-xs-6',
                                    placeholder: 'Flow export rate' +
                                            ' in number'
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
                                    class: 'col-xs-12',
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
                                elementId: 'enable_security_logging',
                                view: "FormCheckboxView",
                                viewConfig : {
                                    path : 'enable_security_logging',
                                    class : "col-xs-6",
                                    label:'Security Logging',
                                    templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                    dataBindValue : 'enable_security_logging',
                                    elementConfig : {
                                        isChecked:false
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
                                    class: 'col-xs-12',
                                    collection: 'encapPriorityOrders',
                                    validation: 'encapPriorityOrdersValidation',
                                    templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                                    class: "col-xs-12",
                                    columns: [{
                                        elementId: 'encapsulation_priorities',
                                        name: 'Encapsulation Priority Order',
                                        view: 'FormDropdownView',
                                        viewConfig: {
                                            templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                            width: 250,
                                            path:
                                            'encapsulation_priorities',
                                            dataBindValue:
                                                'encapsulation_priorities()',
                                            elementConfig: {
                                                dataTextField: 'text',
                                                dataValueField: 'id',
                                                data: [{id: 'MPLSoUDP',
                                                        text: 'MPLS Over UDP'},
                                                      {id: 'MPLSoGRE',
                                                       text: 'MPLS Over GRE'},
                                                      {id: 'VXLAN',
                                                       text: 'VxLAN'}]
                                            }
                                        }
                                    }],
                                    rowActions: [
                                        { onClick: "function() { $root.addEncapPriOrders($data, true); }",
                                          iconClass: 'fa fa-plus'},
                                        { onClick: "function() {$root.deleteEncapPriOrders($data, this); }",
                                          iconClass: 'fa fa-minus'}
                                    ],
                                    gridActions: [{
                                        onClick: "function() { $root.addEncapPriOrders($data, false); }",
                                        iconClass: 'fa fa-plus'
                                    }]
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'ecmp_hashing_include_fields',
                                view: 'FormMultiselectView',
                                viewConfig: {
                                    label: 'ECMP Hashing Fields',
                                    path: 'ecmp_hashing_include_fields',
                                    class: 'col-xs-12',
                                    dataBindValue:
                                            'ecmp_hashing_include_fields',
                                    elementConfig: {
                                        dataTextField: "text",
                                        dataValueField: "id",
                                            data: [
                                                {text: 'source-ip',
                                                 id: 'source_ip'},
                                                {text: 'destination-ip',
                                                 id: 'destination_ip'},
                                                {text: 'ip-protocol',
                                                 id: 'ip_protocol'},
                                                {text: 'source-port',
                                                 id: 'source_port'},
                                                {text: 'destination-port',
                                                 id: 'destination_port'}
                                            ]
                                    }
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'portTranslationCollection',
                                view: 'FormCollectionView',
                                viewConfig: {
                                    path: 'portTranslationCollection',
                                    label:"SNAT Port Translation Pools",
                                    class: 'col-xs-12',
                                    collection: 'portTranslationCollection',
                                    validation: 'portTranslationValidation',
                                    templateId: cowc.TMPL_COLLECTION_HEADING_VIEW,
                                    rows:[{
                                        rowActions: [
                                             {onClick: "function() { $root.addPortTranslation(); }",
                                              iconClass: 'fa fa-plus'},
                                              {onClick: "function() { $root.deletePortTranslation($data, this); }",
                                              iconClass: 'fa fa-minus'}
                                        ],
                                     columns: [
                                         {
                                             elementId: 'protocol',
                                             name: 'Protocol',
                                             view: "FormDropdownView",
                                             width: 150,
                                             viewConfig: {
                                                 templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                 width: 150,
                                                 path: "protocol",
                                                 dataBindValue: "protocol()",
                                                 elementConfig:{
                                                     dataTextField: 'text',
                                                     dataValueField: 'id',
                                                     placeholder : 'Select Protocol',
                                                     data:[{text:'tcp', id:'tcp' },
                                                               {text:'udp', id:'udp' }]
                                                     }
                                                }
                                         },
                                         {
                                             elementId: 'port_range',
                                             name: 'Port Range',
                                             view: 'FormInputView',
                                             width: 230,
                                             viewConfig: {
                                                 placeholder: 'Start-End Port',
                                                 templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                 width: 230,
                                                 label: '',
                                                 path: 'port_range',
                                                 class: 'col-xs-4',
                                                 dataBindValue: 'port_range()'
                                             }
                                         },
                                         {
                                             elementId: 'port_count',
                                             name: 'Port Count',
                                             view: 'FormInputView',
                                             width: 170,
                                             viewConfig: {
                                                 placeholder: 'Enter Port Count',
                                                 templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                 width: 170,
                                                 label: '',
                                                 path: 'port_count',
                                                 class: 'col-xs-4',
                                                 dataBindValue: 'port_count()'
                                             }
                                         }
                                       ]
                                     }],
                                     gridActions: [{
                                         onClick: "function() { $root.addPortTranslation(); }",
                                         iconClass: 'fa fa-plus'
                                     }]
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return forwardingOptionsEditView;
});

