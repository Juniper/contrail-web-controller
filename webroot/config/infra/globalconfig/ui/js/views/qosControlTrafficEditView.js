/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwc.GLOBAL_CONTROL_TRAFFIC_GRID_ID,
        prefixId = ctwc.GLOBAL_CONTROL_TRAFFIC_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        formId = '#' + modalId + '-form';

    var qosControlTrafficEditView = ContrailView.extend({
        renderEditQoSControlTraffic: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT),
                editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-560',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.configureQoSControlTraffic({
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
                                   qosControlTrafficViewConfig(),
                                   "qosControlTrafficValidations",
                                   null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self);
            });
        }
    });

    var qosControlTrafficViewConfig = function () {
        return {
            elementId: ctwc.GLOBAL_control_traffic_dscp_PREFIX_ID,
            view: 'SectionView',
            active:false,
            viewConfig: {
                rows: [
                    {
                        columns:[{
                            elementId: 'control',
                            view: 'FormComboboxView',
                            viewConfig: {
                                label: 'Control DSCP bits',
                                path: 'control_traffic_dscp.control',
                                class: 'col-xs-6',
                                dataBindValue: 'control_traffic_dscp().control',
                                elementConfig: {
                                    placeholder: 'Select or Enter Control DSCP',
                                    dataTextField: 'text',
                                    dataValueField: 'value',
                                    dataSource: {
                                        type: 'local',
                                        data: ctwc.QOS_DSCP_VALUES
                                    }
                                }
                            }
                        }, {
                            elementId: 'analytics',
                            view: 'FormComboboxView',
                            viewConfig: {
                                label: 'Analytics DSCP bits',
                                path: 'control_traffic_dscp.analytics',
                                class: 'col-xs-6',
                                dataBindValue: 'control_traffic_dscp().analytics',
                                elementConfig: {
                                    placeholder: 'Select or Enter Analytics DSCP',
                                    dataTextField: 'text',
                                    dataValueField: 'value',
                                    dataSource: {
                                        type: 'local',
                                        data: ctwc.QOS_DSCP_VALUES
                                    }
                                }
                            }
                        }]
                    },{
                        columns:[{
                            elementId: 'dns',
                            view: 'FormComboboxView',
                            viewConfig: {
                                label: 'DNS DSCP bits',
                                path: 'control_traffic_dscp.dns',
                                class: 'col-xs-6',
                                dataBindValue: 'control_traffic_dscp().dns',
                                elementConfig: {
                                    placeholder: 'Select or Enter DNS DSCP',
                                    dataTextField: 'text',
                                    dataValueField: 'value',
                                    dataSource: {
                                        type: 'local',
                                        data: ctwc.QOS_DSCP_VALUES
                                    }
                                }
                            }
                        }]
                    }
                ]
            }
        }
    };
    return qosControlTrafficEditView;
});

