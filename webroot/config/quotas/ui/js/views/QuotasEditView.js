/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwl.QUOTAS_GRID_ID;
    var prefixId = ctwl.QUOTAS_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
    var formId = '#' + modalId + '-form';

    var QuotasEditView = ContrailView.extend({
        renderEditQuotas: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-400',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.configureQuotas(options['projUUID'], {
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
                                   getEditQuotasViewConfig(),
                                   "quotasConfigValidations",
                                   null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self);
            });
        }
    });

    function getEditQuotasViewConfig () {
        var prefixId = ctwl.QUOTAS_PREFIX_ID;
        var quotasViewConfig = {
            elementId: cowu.formatElementId([prefixId, ctwl.TITLE_EDIT_QUOTAS]),
            title: ctwl.TITLE_EDIT_QUOTAS,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'virtual_network',
                                view: 'FormInputView',
                                viewConfig: {
                                    path: 'virtual_network',
                                    class: 'span6',
                                    dataBindValue: 'virtual_network'
                                }
                            },
                            {
                                elementId: 'subnet',
                                view: 'FormInputView',
                                viewConfig: {
                                    path: 'subnet',
                                    class: 'span6',
                                    dataBindValue: 'subnet'
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'virtual_machine_interface',
                                view: 'FormInputView',
                                viewConfig: {
                                    path: 'virtual_machine_interface',
                                    class: 'span6',
                                    dataBindValue: 'virtual_machine_interface'
                                }
                            },
                            {
                                elementId: 'floating_ip',
                                view: "FormInputView",
                                viewConfig: {
                                    path : 'floating_ip',
                                    class: 'span6',
                                    dataBindValue : 'floating_ip',
                                }
                            },
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'floating_ip_pool',
                                view: "FormInputView",
                                viewConfig: {
                                    path: 'floating_ip_pool',
                                    class: "span6",
                                    dataBindValue: 'floating_ip_pool'
                                }
                            },
                            {
                                elementId: 'access_control_list',
                                view: 'FormInputView',
                                viewConfig: {
                                    path: 'access_control_list',
                                    class: 'span6',
                                    dataBindValue: 'access_control_list',
                                    elementConfig: {
                                        placeholder: 'Not Set'
                                    }
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'logical_router',
                                view: 'FormInputView',
                                viewConfig: {
                                    path: 'logical_router',
                                    class: 'span6',
                                    dataBindValue: 'logical_router'
                                }
                            },
                            {
                                elementId: 'network_ipam',
                                view: 'FormInputView',
                                viewConfig: {
                                    path: 'network_ipam',
                                    class: 'span6',
                                    dataBindValue: 'network_ipam'
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'service_instance',
                                view: 'FormInputView',
                                viewConfig: {
                                    path: 'service_instance',
                                    class: 'span6',
                                    dataBindValue: 'service_instance'
                                }
                            },
                            {
                                elementId: 'security_group',
                                view: 'FormInputView',
                                viewConfig: {
                                    path: 'security_group',
                                    class: 'span6',
                                    dataBindValue: 'security_group'
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'security_group_rule',
                                view: 'FormInputView',
                                viewConfig: {
                                    path: 'security_group_rule',
                                    class: 'span6',
                                    dataBindValue: 'security_group_rule'
                                }
                            },
                            {
                                elementId: 'loadbalancer_pool',
                                view: 'FormInputView',
                                viewConfig: {
                                    path: 'loadbalancer_pool',
                                    class: 'span6',
                                    dataBindValue: 'loadbalancer_pool'
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'loadbalancer_member',
                                view: 'FormInputView',
                                viewConfig: {
                                    path: 'loadbalancer_member',
                                    class: 'span6',
                                    dataBindValue: 'loadbalancer_member'
                                }
                            },
                            {
                                elementId: 'loadbalancer_healthmonitor',
                                view: 'FormInputView',
                                viewConfig: {
                                    path: 'loadbalancer_healthmonitor',
                                    class: 'span6',
                                    dataBindValue: 'loadbalancer_healthmonitor'
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'virtual_ip',
                                view: 'FormInputView',
                                viewConfig: {
                                    path: 'virtual_ip',
                                    class: 'span6',
                                    dataBindValue: 'virtual_ip'
                                }
                            }
                        ]
                    }
                ]
            }
        }
        return quotasViewConfig;
    }

    return QuotasEditView;
});

