/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/networking/qos/common/ui/js/qosViewConfigs'
], function (_, ContrailView, Knockback, QOSViewConfigs) {
    var prefixId = ctwc.QOS_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
    var self, qosViewConfigs = new QOSViewConfigs();
    var qosEditView = ContrailView.extend({
        renderAddEditQOS: function (options) {
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId});
            self = this;

            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                'title': options['title'], 'body': editLayout,
                 'onSave': function () {
                        self.configEditQOS(options);
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.qosRenderView4Config(options);
        },

        configEditQOS : function(options) {
            self.model.configQOS({
                init: function () {
                    cowu.enableModalLoading(modalId);
                },
                success: function () {
                    options['callback']();
                    $("#" + modalId).modal('hide');
                },
                error: function (error) {
                    cowu.disableModalLoading(modalId, function () {
                        self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                                 error.responseText);
                    });
                }
            }, options);
        },

        qosRenderView4Config : function(options) {
            var disableFlag =
                (options.mode === ctwl.EDIT_ACTION) ?  true : false;
            self.renderView4Config(
                $("#" + modalId).find("#" + prefixId + "-form"),
                self.model,
                qosViewConfigs.viewConfig(prefixId, disableFlag),
                "qosValidations", null, null,
                function () {
                    self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                             false);
                    Knockback.applyBindings(self.model,
                        document.getElementById(modalId));
                    kbValidation.bind(self,
                       {collection:
                           self.model.model().attributes.dscp_entries_fc_pair});
                    kbValidation.bind(self,
                        {collection:
                            self.model.model().attributes.
                                vlan_priority_entries_fc_pair});
                    kbValidation.bind(self,
                        {collection:
                            self.model.model().attributes.
                            mpls_exp_entries_fc_pair});
                    //permissions
                    ctwu.bindPermissionsValidation(self);
                }, null, true
            );
        },

        renderDeleteQOS: function(options) {
            var delTemplate =
                contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;

            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.deleteQOS(options['checkedRows'], {
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
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(self.model,
                document.getElementById(modalId));
            kbValidation.bind(self);
        }
    });

    return qosEditView;
});

