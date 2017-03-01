/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwc.GLOBAL_MAC_LEARNING_GRID_ID,
        prefixId = ctwc.GLOBAL_MAC_LEARNING_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        formId = '#' + modalId + '-form';

    var macLearningEditView = ContrailView.extend({
        renderEditMACLearning: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT),
                editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-560',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.configureMACLearning({
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
                                   macLearningViewConfig(),
                                   "macLearningValidations",
                                   null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self);
            });
        }
    });

    var macLearningViewConfig = function () {
        return {
            elementId: ctwc.GLOBAL_MAC_LEARNING_PREFIX_ID,
            view: 'SectionView',
            active:false,
            viewConfig: {
                rows: [
                    {
                        columns:[{
                            elementId: 'mac_limit',
                            view: 'FormInputView',
                            viewConfig: {
                                placeholder: 'Enter MAC Limit',
                                label: 'MAC Limit',
                                path: 'mac_limit_control.mac_limit',
                                class: 'col-xs-6',
                                dataBindValue: 'mac_limit_control().mac_limit'
                            }
                        },{
                            elementId: 'mac_limit_action',
                            view: 'FormInputView',
                            viewConfig: {
                                disabled: "true",
                                label: 'MAC Limit Action',
                                path: 'mac_limit_control.mac_limit_action',
                                class: 'col-xs-6',
                                dataBindValue: 'mac_limit_control().mac_limit_action'
                            }
                        }]
                    },{
                        columns:[{
                            elementId: 'mac_move_limit',
                            view: 'FormInputView',
                            viewConfig: {
                                placeholder: 'Enter MAC Move Limit',
                                label: 'MAC Move Limit',
                                path: 'mac_move_control.mac_move_limit',
                                class: 'col-xs-6',
                                dataBindValue: 'mac_move_control().mac_move_limit'
                            }
                        }, {
                            elementId: 'mac_move_limit_action',
                            view: 'FormInputView',
                            viewConfig: {
                                disabled: "true",
                                label: 'MAC Move Limit Action',
                                path: 'mac_move_control.mac_move_limit_action',
                                class: 'col-xs-6',
                                dataBindValue: 'mac_move_control().mac_move_limit_action'
                            }
                        }]
                    },{
                        columns:[{
                            elementId: 'mac_move_time_window',
                            view: 'FormInputView',
                            viewConfig: {
                                placeholder: '1 - 60',
                                label: 'MAC Move Time Window (secs)',
                                path: 'mac_move_control.mac_move_time_window',
                                class: 'col-xs-6',
                                dataBindValue: 'mac_move_control().mac_move_time_window'
                            }
                        },{
                            elementId: 'mac_aging_time',
                            view: 'FormInputView',
                            viewConfig: {
                                placeholder: '0 - 86400',
                                label: 'MAC Aging Time (secs)',
                                path: 'mac_aging_time',
                                class: 'col-xs-6',
                                dataBindValue: 'mac_aging_time'
                            }
                        }]
                    }
                ]
            }
        }
    };
    return macLearningEditView;
});

