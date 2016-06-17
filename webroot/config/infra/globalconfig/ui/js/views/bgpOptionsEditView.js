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
                                    class: 'span6',
                                    placeholder: 'Enter BGP ASN Value'
                                }
                            },
                            {
                                elementId: 'ibgp_auto_mesh',
                                view: 'FormCheckboxView',
                                viewConfig: {
                                    label: 'Enable iBGP Auto Mesh',
                                    path: 'ibgp_auto_mesh',
                                    dataBindValue: 'ibgp_auto_mesh',
                                    class: 'span6'
                                }
                            }
                        ]
                    },
                    {
                        columns : [
                            {
                                elementId: "ipFabric_subnets_accordion",
                                view: "AccordianView",
                                viewConfig: [
                                   {
                                       elementId: "ipFabric_subnets_section",
                                       title : "IP Fabric Subnets",
                                       view : "SectionView",
                                       active:false,
                                       viewConfig : {
                                           rows : ipFabriSubnetSection()
                                       }
                                   }
                                ]
                            }
                        ]
                    },
                    {
                        columns : [
                            {
                                elementId: "graceful_restart_accordion",
                                view: "AccordianView",
                                viewConfig: [
                                   {
                                       elementId: "graceful_restart_section",
                                       title : "Graceful Restart Params",
                                       view : "SectionView",
                                       active:false,
                                       viewConfig : {
                                           rows : gracefulRestartTimeSection()
                                       }
                                   }
                                ]
                            }
                        ]
                    }
                ]
            }
        }
    };

    function ipFabriSubnetSection() {
        return [{
            columns: [
                {
                    elementId: 'ipFabricSubnets',
                    view: 'FormEditableGridView',
                    viewConfig: {
                        path: 'ipFabricSubnets',
                        collection: 'ipFabricSubnets',
                        validation: 'ipFabricSubnetsValidation',
                        templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                        class: "span12",
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
                            { onClick: "function() { $root.addSubnet(); }",
                              iconClass: 'icon-plus'},
                            { onClick:
                                "function() {$root.deleteSubnet($data, this); }",
                              iconClass: 'icon-minus'}
                        ],
                        gridActions: [
                            { onClick: "function() { $root.addSubnet(); }",
                              iconClass: 'icon-plus'}
                        ],
                    }
                }
            ]
        }];
    };

    function gracefulRestartTimeSection() {
        return [
                {
                    columns : [
                        {
                            elementId:
                                "graceful_restart_time",
                            view: "FormInputView",
                            viewConfig: {
                                path:
                                    "graceful_restart_params." +
                                    "graceful_restart_time",
                                label : "Restart Time (seconds)",
                                placeholder : "0 - 600",
                                dataBindValue: "graceful_restart_params()." +
                                    "graceful_restart_time",
                                class: "span6"
                            }
                        },
                        {
                            elementId: "long_lived_graceful_restart_time",
                            view: "FormInputView",
                            viewConfig: {
                                path: "graceful_restart_params." +
                                    "long_lived_graceful_restart_time",
                                label : "Long Lived Restart Time (seconds)",
                                placeholder : "0",
                                dataBindValue:
                                    "graceful_restart_params()." +
                                    "long_lived_graceful_restart_time",
                                class: "span6"
                            }
                        }
                    ]
                },
                {
                    columns : [
                        {
                            elementId: "end_of_rib_receive_time",
                            view: "FormInputView",
                            viewConfig: {
                                path: "graceful_restart_params." +
                                    "end_of_rib_receive_time",
                                label : "End of RIB Receive Time (seconds)",
                                placeholder : '30',
                                dataBindValue: "graceful_restart_params()." +
                                    "end_of_rib_receive_time",
                                class: "span6"
                            }
                        }
                    ]
                }
            ];
    };

    return bgpOptionsEditView;
});

