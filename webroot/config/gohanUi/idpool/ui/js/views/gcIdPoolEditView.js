/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'],
    function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwl.CFG_ID_POOL_GRID_ID;
    var prefixId = ctwl.CFG_ID_POOL_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
    var idPoolEditView = ContrailView.extend({
        renderAddIdPool: function (options) {
            var editTemplate = contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId}),
                self = this;

            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
               self.model.addIdPool({
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
                Knockback.release(self.model,
                                    document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.renderView4Config($("#" + modalId).find("#" + prefixId + "-form"),
                                    self.model,
                                    getIdPoolViewConfig(),
                                    "", null, null,
                                    function () {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                         false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                                    }, null, false);
        },
        renderDeleteIdPool: function(options) {
            var delTemplate = contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;
            var selectedGridData = options['selectedGridData'];
            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.deleteIdPool(selectedGridData[0], {
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
                Knockback.release(self.model,
                                    document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            this.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
            kbValidation.bind(self);
        }
    });

    function getIdPoolViewConfig () {
        var prefixId = ctwl.CFG_ID_POOL_PREFIX_ID;
        var idPoolViewConfig = {
            elementId: cowu.formatElementId([prefixId, ctwl.CFG_ID_POOL_TITLE_CREATE]),
            title: "ID Pool",//permissions
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'name',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Name',
                                    placeholder: 'Name',
                                    path: 'name',
                                    class: 'col-xs-6',
                                    dataBindValue: 'name',
                                }
                            },
                            {
                                elementId: 'start',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Start',
                                    path: 'start',
                                    class: 'col-xs-6',
                                    dataBindValue: 'start',
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'end',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'End',
                                    path: 'end',
                                    class: 'col-xs-6',
                                    dataBindValue: 'end',
                                }
                            },
                            {
                                elementId: 'assigned',
                                view: "FormCheckboxView",
                                viewConfig:
                                  {
                                       class: 'col-xs-6 no-label-input',
                                       label: 'Assigned',
                                       path: "assigned",
                                       dataBindValue: 'assigned',
                                       templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                       elementConfig : {
                                            label:'Assigned',
                                            isChecked:false
                                        }
                                  }
                            }
                        ]
                    }
                ]  // End Rows
            }
        }
        return idPoolViewConfig;
    }
    return idPoolEditView;
});
