/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/networking/securitygroup/ui/js/SecGrpUtils'
], function (_, ContrailView, Knockback, SecGrpUtils) {
    var gridElId = '#' + ctwl.SEC_GRP_GRID_ID;
    var prefixId = ctwl.SEC_GRP_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
    var formId = '#' + modalId + '-form';
    var sgUtils = new SecGrpUtils();

    var SecGrpEditView = ContrailView.extend({
        renderConfigureSecGrp: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-840',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.configureSecGrp(options['projFqn'],
                                           options['dataItem'], {
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

            self.renderView4Config($("#" + modalId).find(formId),
                                   this.model,
                                   getEditSecGrpViewConfig(options['isEdit'],
                                       self.sgDataObj),
                                   "secGrpConfigValidations",
                                   null, null, function() {
                sgUtils.deleteCurrentSG(self.sgDataObj);
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self,
                                  {collection:
                                  self.model.model().attributes.rules});
                //permissions
                ctwu.bindPermissionsValidation(self);
            }, null, true);
        },
        renderDeleteSecGrps: function(options) {
            var delTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_DEL);
            var delLayout = delTemplate({prefixId: prefixId});
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'body': delLayout,
                             'btnName': 'Confirm', 'onSave': function () {
                self.model.deleteSecGrps(options['checkedRows'], {
                    init: function () {
                        self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                                 false);
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

            this.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(self.model,
                                    document.getElementById(modalId));
            kbValidation.bind(self);
        }
    });

    function getEditSecGrpViewConfig (isDisable, sgDataObj) {
        var prefixId = ctwl.SEC_GRP_PREFIX_ID;
        var secGrpViewConfig = {
            elementId: cowu.formatElementId([prefixId, ctwl.TITLE_EDIT_SEC_GRP]),
            title: "Security Group",//permissions
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'display_name',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Name',
                                    path: 'display_name',
                                    class: 'col-xs-9',
                                    dataBindValue: 'display_name',
                                    placeHolder: 'Security Group Name',
                                    onBlur: function() {
                                        sgUtils.addCurrentSG(sgDataObj);
                                    }
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'is_sec_grp_id_auto',
                                view: 'FormDropdownView',
                                viewConfig: {
                                    label: 'Security Group ID',
                                    path: 'is_sec_grp_id_auto',
                                    class: 'col-xs-3',
                                    dataBindValue: 'is_sec_grp_id_auto',
                                    elementConfig: {
                                        dataTextField: 'text',
                                        dataValueField: 'value',
                                        data: [
                                            {text: 'Auto',
                                             value: true},
                                            {text: 'Configured',
                                             value: false}
                                        ]
                                    }
                                }
                            },
                            {
                                elementId: 'configured_security_group_id',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: "",
                                    visible: 'showConfigSecGrpID',
                                    path: 'configured_security_group_id',
                                    class: 'col-xs-6 no-label-input',
                                    dataBindValue:
                                            'configured_security_group_id',
                                    placeHolder: 'Enter Security Group ID'
                                }
                            }
                        ]
                    },
                    sgUtils.getSecGrpRulesView(sgDataObj)
                ]
            }
        }
        return secGrpViewConfig;
    }

    return SecGrpEditView;
});


