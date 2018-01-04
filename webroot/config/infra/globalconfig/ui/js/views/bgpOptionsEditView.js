/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwc.GLOBAL_BGP_OPTIONS_GRID_ID,
        prefixId = ctwc.GLOBAL_BGP_OPTIONS_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        formId = '#' + modalId + '-form';

    var bgpOptionsEditView = ContrailView.extend({
        renderEditBGPOptions: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT),
                editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.configureBGPOptions({
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
                                   bgpOptionsViewConfig(),
                                   "bgpOptionsValidations",
                                   null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self, {collection:
                                  self.model.model().attributes.ipFabricSubnets});
            });
        }
    });

    var bgpOptionsViewConfig = function () {
        return {
            elementId: ctwc.GLOBAL_BGP_OPTIONS_PREFIX_ID,
            view: 'SectionView',
            active:false,
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'autonomous_system',
                                view: 'FormInputView',
                                viewConfig: {
                                    path: 'autonomous_system',
                                    dataBindValue: 'autonomous_system',
                                    class: 'col-xs-6',
                                    placeholder: 'Enter BGP ASN Value'
                                }
                            },
                            {
                                elementId: 'ibgp_auto_mesh',
                                view: 'FormRadioButtonView',
                                viewConfig: {
                                    label: 'iBGP Auto Mesh',
                                    path: 'ibgp_auto_mesh',
                                    dataBindValue: 'ibgp_auto_mesh',
                                    class: 'col-xs-6',
                                    elementConfig: {
                                        dataObj: [
                                            {'label': 'Enable',
                                             'value': 'true'},
                                            {'label': 'Disable',
                                             'value': 'false'}
                                        ]
                                    }
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'user_created_bgpaas_parameters',
                                view: 'FormInputView',
                                viewConfig: {
                                    path: 'user_created_bgpaas_parameters',
                                    dataBindValue: 'user_created_bgpaas_parameters',
                                    class: 'col-xs-6',
                                    label: 'BGP as a Service Port Range (Start Port - End Port)',
                                    placeholder: 'Start Port - End Port'
                                }
                            },
                            {
                                elementId: 'bgp_always_compare_med',
                                view: 'FormRadioButtonView',
                                viewConfig: {
                                    label: 'Always Compare MED',
                                    path: 'bgp_always_compare_med',
                                    dataBindValue: 'bgp_always_compare_med',
                                    class: 'col-xs-6',
                                    elementConfig: {
                                        dataObj: [
                                            {'label': 'Enable',
                                             'value': 'true'},
                                            {'label': 'Disable',
                                             'value': 'false'}
                                        ]
                                    }
                                }
                            }
                        ]
                    },
                    {
                        columns : [
                            {
                                elementId: 'graceful_restart_enable',
                                view: "FormCheckboxView",
                                viewConfig : {
                                    path : 'graceful_restart_enable',
                                    class : "col-xs-4",
                                    label:'Graceful Restart',
                                    templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                    dataBindValue : 'graceful_restart_enable',
                                    elementConfig : {
                                        isChecked:false
                                    }
                                }
                            }
                        ]
                    },
                    {
                        columns: [{
                            elementId: 'bgp_helper_enable',
                            view: "FormCheckboxView",
                            viewConfig : {
                                visible: "graceful_restart_enable",
                                path : 'graceful_restart_parameters.bgp_helper_enable',
                                class : "col-xs-6",
                                label:'BGP Helper',
                                templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                dataBindValue :
                                    'graceful_restart_parameters().bgp_helper_enable',
                                elementConfig : {
                                    isChecked:false
                                }
                            }
                        }, {
                            elementId: 'xmpp_helper_enable',
                            view: "FormCheckboxView",
                            viewConfig : {
                                visible: "graceful_restart_enable",
                                path : 'graceful_restart_parameters.xmpp_helper_enable',
                                class : "col-xs-6",
                                label:'XMPP Helper',
                                templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                dataBindValue :
                                    'graceful_restart_parameters().xmpp_helper_enable',
                                elementConfig : {
                                    isChecked:false
                                }
                            }
                        }]
                    },
                    {
                        columns:[{
                            elementId:
                                "restart_time",
                            view: "FormInputView",
                            viewConfig: {
                                visible: "graceful_restart_enable",
                                path:
                                    "graceful_restart_parameters." +
                                    "restart_time",
                                label : "Restart Time (secs)",
                                placeholder : "0 - 4095 (300)",
                                dataBindValue: "graceful_restart_parameters()." +
                                    "restart_time",
                                class: "col-xs-6"
                            }
                        }, {
                            elementId: "long_lived_restart_time",
                            view: "FormInputView",
                            viewConfig: {
                                visible: "graceful_restart_enable",
                                path: "graceful_restart_parameters." +
                                    "long_lived_restart_time",
                                label : "LLGR Time (secs)",
                                placeholder : "0 - 16777215 (300)",
                                dataBindValue:
                                    "graceful_restart_parameters()." +
                                    "long_lived_restart_time",
                                class: "col-xs-6"
                            }
                        }]
                    },
                    {
                        columns:[{
                            elementId: "end_of_rib_timeout",
                            view: "FormInputView",
                            viewConfig: {
                                visible: "graceful_restart_enable",
                                path: "graceful_restart_parameters." +
                                    "end_of_rib_timeout",
                                label : "End of RIB (secs)",
                                placeholder : '0 - 4095 (300)',
                                dataBindValue: "graceful_restart_parameters()." +
                                    "end_of_rib_timeout",
                                class: "col-xs-6"
                            }
                        }]
                    },
                    ipFabriSubnetSection(),
                ]
            }
        }
    };

    function ipFabriSubnetSection() {
        return {
            columns: [
                {
                    elementId: 'ipFabricSubnets',
                    view: 'FormEditableGridView',
                    viewConfig: {
                        path: 'ipFabricSubnets',
                        class: 'col-xs-12',
                        collection: 'ipFabricSubnets',
                        validation: 'ipFabricSubnetsValidation',
                        templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                        columns: [{
                            elementId: 'ip_fabric_subnets',
                            name: 'IP Fabric Subnets',
                            view: 'FormInputView',
                            viewConfig: {
                                templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                placeholder: 'xxx.xxx.xxx.xxx/xx',
                                width: 300,
                                path: 'ip_fabric_subnets',
                                dataBindValue:
                                    'ip_fabric_subnets()',
                            }
                        }],
                        rowActions: [
                            { onClick: "function() { $root.addSubnetByIndex($data, this); }",
                              iconClass: 'fa fa-plus'},
                            { onClick:
                                "function() {$root.deleteSubnet($data, this); }",
                              iconClass: 'fa fa-minus'}
                        ],
                        gridActions: [
                            { onClick: "function() { $root.addSubnet(); }",
                              iconClass: 'fa fa-plus'}
                        ],
                    }
                }
            ]
        };
    };

    return bgpOptionsEditView;
});
