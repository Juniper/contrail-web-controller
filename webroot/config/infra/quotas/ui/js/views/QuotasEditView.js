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
            cowu.createModal({'modalId': modalId, 'className': 'modal-420',
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
                                view: 'FormComboboxView',
                                viewConfig: {
                                    label: 'Virtual Networks',
                                    path: 'virtual_network',
                                    class: 'span12',
                                    dataBindValue: 'virtual_network',
                                    elementConfig: {
                                        placeholder: 'Not Set',
                                        dataTextField : "text",
                                        dataValueField : "value",
                                        dataSource: {
                                            type: 'local',
                                            data : [
                                                {'value': -1,
                                                 'text': 'Unlimited'}
                                            ]
                                        }
                                    }
                                }
                            },
                            {
                                elementId: 'subnet',
                                view: 'FormComboboxView',
                                viewConfig: {
                                    path: 'subnet',
                                    label: 'Subnets',
                                    class: 'span12',
                                    dataBindValue: 'subnet',
                                    elementConfig: {
                                        placeholder: 'Not Set',
                                        dataTextField : "text",
                                        dataValueField : "value",
                                        dataSource: {
                                            type: 'local',
                                            data : [
                                                {'value': -1,
                                                 'text': 'Unlimited'}
                                            ]
                                        }
                                    }
                                }
                            },
                            {
                                elementId: 'virtual_machine_interface',
                                view: 'FormComboboxView',
                                viewConfig: {
                                    label: 'Ports',
                                    path: 'virtual_machine_interface',
                                    class: 'span12',
                                    dataBindValue: 'virtual_machine_interface',
                                    elementConfig: {
                                        placeholder: 'Not Set',
                                        dataTextField : "text",
                                        dataValueField : "value",
                                        dataSource: {
                                            type: 'local',
                                            data : [
                                                {'value': -1,
                                                 'text': 'Unlimited'}
                                            ]
                                        }
                                    }
                                }
                            },
                            {
                                elementId: 'floating_ip',
                                view: "FormComboboxView",
                                viewConfig: {
                                    label: 'Floating IPs',
                                    path : 'floating_ip',
                                    class: 'span12',
                                    dataBindValue : 'floating_ip',
                                    elementConfig: {
                                        placeholder: 'Not Set',
                                        dataTextField : "text",
                                        dataValueField : "value",
                                        dataSource: {
                                            type: 'local',
                                            data : [
                                                {'value': -1,
                                                 'text': 'Unlimited'}
                                            ]
                                        }
                                    }
                                }
                            },
                            {
                                elementId: 'floating_ip_pool',
                                view: "FormComboboxView",
                                viewConfig: {
                                    label: 'Floating IP Pools',
                                    path: 'floating_ip_pool',
                                    class: "span12",
                                    dataBindValue: 'floating_ip_pool',
                                    elementConfig: {
                                        placeholder: 'Not Set',
                                        dataTextField : "text",
                                        dataValueField : "value",
                                        dataSource: {
                                            type: 'local',
                                            data : [
                                                {'value': -1,
                                                 'text': 'Unlimited'}
                                            ]
                                        }
                                    }
                                }
                            },
                            {
                                elementId: 'access_control_list',
                                view: 'FormComboboxView',
                                viewConfig: {
                                    label: 'Policies',
                                    path: 'access_control_list',
                                    class: 'span12',
                                    dataBindValue: 'access_control_list',
                                    elementConfig: {
                                        placeholder: 'Not Set',
                                        dataTextField : "text",
                                        dataValueField : "value",
                                        dataSource: {
                                            type: 'local',
                                            data : [
                                                {'value': -1,
                                                 'text': 'Unlimited'}
                                            ]
                                        }
                                    }
                                }
                            },
                            {
                                elementId: 'logical_router',
                                view: 'FormComboboxView',
                                viewConfig: {
                                    label: 'Routers',
                                    path: 'logical_router',
                                    class: 'span12',
                                    dataBindValue: 'logical_router',
                                    elementConfig: {
                                        placeholder: 'Not Set',
                                        dataTextField : "text",
                                        dataValueField : "value",
                                        dataSource: {
                                            type: 'local',
                                            data : [
                                                {'value': -1,
                                                 'text': 'Unlimited'}
                                            ]
                                        }
                                    }
                                }
                            },
                            {
                                elementId: 'network_ipam',
                                view: 'FormComboboxView',
                                viewConfig: {
                                    label: 'Network IPAMs',
                                    path: 'network_ipam',
                                    class: 'span12',
                                    dataBindValue: 'network_ipam',
                                    elementConfig: {
                                        placeholder: 'Not Set',
                                        dataTextField : "text",
                                        dataValueField : "value",
                                        dataSource: {
                                            type: 'local',
                                            data : [
                                                {'value': -1,
                                                 'text': 'Unlimited'}
                                            ]
                                        }
                                    }
                                }
                            },
                            {
                                elementId: 'service_instance',
                                view: 'FormComboboxView',
                                viewConfig: {
                                    label: 'Service Instances',
                                    path: 'service_instance',
                                    class: 'span12',
                                    dataBindValue: 'service_instance',
                                    elementConfig: {
                                        placeholder: 'Not Set',
                                        dataTextField : "text",
                                        dataValueField : "value",
                                        dataSource: {
                                            type: 'local',
                                            data : [
                                                {'value': -1,
                                                 'text': 'Unlimited'}
                                            ]
                                        }
                                    }
                                }
                            },
                            {
                                elementId: 'security_group',
                                view: 'FormComboboxView',
                                viewConfig: {
                                    label: 'Security Groups',
                                    path: 'security_group',
                                    class: 'span12',
                                    dataBindValue: 'security_group',
                                    elementConfig: {
                                        placeholder: 'Not Set',
                                        dataTextField : "text",
                                        dataValueField : "value",
                                        dataSource: {
                                            type: 'local',
                                            data : [
                                                {'value': -1,
                                                 'text': 'Unlimited'}
                                            ]
                                        }
                                    }
                                }
                            },
                            {
                                elementId: 'security_group_rule',
                                view: 'FormComboboxView',
                                viewConfig: {
                                    label: 'Security Group Rules',
                                    path: 'security_group_rule',
                                    class: 'span12',
                                    dataBindValue: 'security_group_rule',
                                    elementConfig: {
                                        placeholder: 'Not Set',
                                        dataTextField : "text",
                                        dataValueField : "value",
                                        dataSource: {
                                            type: 'local',
                                            data : [
                                                {'value': -1,
                                                 'text': 'Unlimited'}
                                            ]
                                        }
                                    }
                                }
                            },
                            {
                                elementId: 'loadbalancer_pool',
                                view: 'FormComboboxView',
                                viewConfig: {
                                    label: 'Loadbalancer Pools',
                                    path: 'loadbalancer_pool',
                                    class: 'span12',
                                    dataBindValue: 'loadbalancer_pool',
                                    elementConfig: {
                                        placeholder: 'Not Set',
                                        dataTextField : "text",
                                        dataValueField : "value",
                                        dataSource: {
                                            type: 'local',
                                            data : [
                                                {'value': -1,
                                                 'text': 'Unlimited'}
                                            ]
                                        }
                                    }
                                }
                            },
                            {
                                elementId: 'loadbalancer_member',
                                view: 'FormComboboxView',
                                viewConfig: {
                                    label: 'Loadbalancer Members',
                                    path: 'loadbalancer_member',
                                    class: 'span12',
                                    dataBindValue: 'loadbalancer_member',
                                    elementConfig: {
                                        placeholder: 'Not Set',
                                        dataTextField : "text",
                                        dataValueField : "value",
                                        dataSource: {
                                            type: 'local',
                                            data : [
                                                {'value': -1,
                                                 'text': 'Unlimited'}
                                            ]
                                        }
                                    }
                                }
                            },
                            {
                                elementId: 'loadbalancer_healthmonitor',
                                view: 'FormComboboxView',
                                viewConfig: {
                                    label: 'Loadbalancer Health Monitors',
                                    path: 'loadbalancer_healthmonitor',
                                    class: 'span12',
                                    dataBindValue: 'loadbalancer_healthmonitor',
                                    elementConfig: {
                                        placeholder: 'Not Set',
                                        dataTextField : "text",
                                        dataValueField : "value",
                                        dataSource: {
                                            type: 'local',
                                            data : [
                                                {'value': -1,
                                                 'text': 'Unlimited'}
                                            ]
                                        }
                                    }
                                }
                            },
                            {
                                elementId: 'virtual_ip',
                                view: 'FormComboboxView',
                                viewConfig: {
                                    label: 'Virtual IPs',
                                    path: 'virtual_ip',
                                    class: 'span12',
                                    dataBindValue: 'virtual_ip',
                                    elementConfig: {
                                        placeholder: 'Not Set',
                                        dataTextField : "text",
                                        dataValueField : "value",
                                        dataSource: {
                                            type: 'local',
                                            data : [
                                                {'value': -1,
                                                 'text': 'Unlimited'}
                                            ]
                                        }
                                    }
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

