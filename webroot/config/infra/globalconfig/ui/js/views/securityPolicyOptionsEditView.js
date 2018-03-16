/*
 * Copyright (c) 2018 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwc.GLOBAL_POLICY_MGMT_OPTIONS_GRID_ID,
        prefixId = ctwc.GLOBAL_POLICY_MGMT_OPTIONS_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        formId = '#' + modalId + '-form';

    var secPolicyOptionsEditView = ContrailView.extend({
        renderEditSecPolicyOptions: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT),
                editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.configureSecPolicyOptions({
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
                }, options.isGlobal);
                // TODO: Release binding on successful configure
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});

            self.renderView4Config($("#" + modalId).find(formId),
                                   this.model,
                                   secPolicyOptionsViewConfig(),
                                   null,
                                   null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self);
            });
        }
    });

    var secPolicyOptionsViewConfig = function () {
        return {
            elementId: ctwc.GLOBAL_POLICY_MGMT_OPTIONS_PREFIX_ID,
            view: 'SectionView',
            active:false,
            viewConfig: {
                rows: [{
                        columns: [{
                            elementId: 'enable_security_policy_draft',
                            view: "FormCheckboxView",
                            viewConfig : {
                                path : 'enable_security_policy_draft',
                                class : "col-xs-6",
                                label:'Security Policy Draft',
                                templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                dataBindValue :
                                    'enable_security_policy_draft',
                                elementConfig : {
                                    isChecked:false
                                }
                            }
                        }]
                    }]
            }
        }
    };

    return secPolicyOptionsEditView;
});
