/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwc.SECURITY_POLICY_TAG_GRID_ID,
        prefixId = ctwc.SEC_POLICY_TAG_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        formId = '#' + modalId + '-form';

    var tagEditView = ContrailView.extend({
        renderAddEditTag: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT),
                editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.addEditTag({
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
                }, options);
                // TODO: Release binding on successful configure
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});

            self.renderView4Config($("#" + modalId).find(formId),
                                   this.model,
                                   getTagViewConfig(),
                                   "tagValidation",
                                   null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self);
            },null,false);
        },
        renderDeleteTag: function(options) {
            var delTemplate =
                contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;

            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.deleteTag(options['selectedGridData'], {
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

    var getTagViewConfig = function () {
        return {
            elementId: ctwc.SEC_POLICY_TAG_PREFIX_ID,
            view: 'SectionView',
            title: "Tag",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'tag_type_name',
                                view: "FormComboboxView",
                                viewConfig: {
                                    path:'tag_type_name',
                                    class: 'col-xs-6',
                                    label: 'Type',
                                    dataBindValue: 'tag_type_name',
                                    elementConfig : {
                                        dataTextField: 'text',
                                        placeholder: 'Select Tag Type',
                                        dataValueField: 'value',
                                        dataSource : {
                                            type: 'local',
                                            data:ctwc.RULE_MATCH_TAGS
                                        }
                                    }
                                }
                            },
                            {
                                elementId: 'tag_value',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Value',
                                    path: 'tag_value',
                                    placeholder: 'Select Tag Value',
                                    class: 'col-xs-6',
                                    dataBindValue: 'tag_value',
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return tagEditView;
});
