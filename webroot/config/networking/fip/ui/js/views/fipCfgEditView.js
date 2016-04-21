/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/networking/fip/ui/js/views/fipCfgFormatters'
], function (_, ContrailView, Knockback, FipCfgFormatters) {
    var formatFipCfg = new FipCfgFormatters();
    var gridElId = '#' + ctwl.CFG_FIP_GRID_ID;
    var prefixId = ctwl.CFG_FIP_PREFIX_ID;
    var modalId = 'configure-' + prefixId;

    var fipCfgEditView = ContrailView.extend({
        renderAllocateFipCfg: function (options) {
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId}),
                self = this;

            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.allocateFipCfg({
                    init: function () {
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        //Needs to be fixed, id doesnt work
                        cowu.disableModalLoading(modalId, function () {
                            self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                                     error.responseText);
                        });
                    }
                });
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.renderView4Config($("#" + modalId).find("#" + prefixId + "-form"),
                                   self.model,
                                   getAllocateFipCfgViewConfig(false),
                                   "fipCfgConfigValidations", null, null,
                                   function () {
                    self.model.showErrorAttr(prefixId +
                        cowc.FORM_SUFFIX_ID, false);
                    Knockback.applyBindings(self.model,
                                document.getElementById(modalId));
                    kbValidation.bind(self);
                                   });
        },

        renderAssociateFipCfg: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.associateFipCfg({
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

            self.renderView4Config($("#" + modalId).find("#" + prefixId + "-form"),
                                   self.model,
                                   getAssociateFipCfgViewConfig(true),
                                   "fipPortCfgConfigValidations", null, null,
                                   function () {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self);
                                   });
        },

        renderMultiReleaseFipCfg: function(options) {
            var delTemplate =
                //Fix the template to be common delete template
                contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;

            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.multiReleaseFipCfg(options['checkedRows'], {
                    init: function () {
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        //Fix the form modal id for error
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
            this.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(self.model, document.getElementById(modalId));
            kbValidation.bind(self);
        },

        renderDisAssociateFipCfg: function(options) {
            var delTemplate =
                //Fix the template to be common delete template
                contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;

            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.disAssociateFipCfg({
                    init: function () {
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        //Fix the form modal id for error
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
            Knockback.applyBindings(self.model, document.getElementById(modalId));
            kbValidation.bind(self);
        }
    });

    function getAllocateFipCfgViewConfig(disableOnEdit) {
        var prefixId = ctwl.CFG_FIP_PREFIX_ID;
        var fipCfgViewConfig = {
            elementId: cowu.formatElementId([prefixId, ctwl.CFG_FIP_TITLE_ALLOCATE]),
            title: ctwl.CFG_FIP_TITLE_ALLOCATE,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'user_created_floating_ip_pool',
                                view: "FormDropdownView",
                                viewConfig: {
                                    path : 'user_created_floating_ip_pool',
                                    label: 'Floating IP Pool',
                                    class: 'span12',
                                    dataBindValue : 'user_created_floating_ip_pool',
                                    elementConfig : {
                                        placeholder: 'Select Floating IP Pool',
                                        dataTextField : "text",
                                        dataValueField : "id",
                                        dataSource : {
                                            type: 'remote',
                                            //Fix, find a way to get proj id
                                            //here. For now try using name
                                            url: '/api/tenants/config/floating-ip-pools/' +
                                                contrail.getCookie(cowc.COOKIE_DOMAIN) + ':' +
                                                contrail.getCookie(cowc.COOKIE_PROJECT),
                                            parse: formatFipCfg.fipPoolDropDownFormatter
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'user_created_alloc_type',
                                view: "FormDropdownView",
                                viewConfig: {
                                    label: 'Allocation Type',
                                    path : 'user_created_alloc_type',
                                    class: 'span12',
                                    dataBindValue : 'user_created_alloc_type',
                                    elementConfig : {
                                        dataTextField : "text",
                                        dataValueField : "id",
                                        data : [{id: 'dynamic', text:'Dynamic'},
                                                {id: 'specific', text:'Specific IP'}]
                                    }
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'user_created_alloc_count',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Number of IP Addresses',
                                    visible: "user_created_alloc_type() == 'dynamic'",
                                    path: 'user_created_alloc_count',
                                    class: 'span12',
                                    dataBindValue: 'user_created_alloc_count'
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'floating_ip_address',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'IP Address',
                                    visible: "user_created_alloc_type() == 'specific'",
                                    placeHolder: 'Enter a Floating IP',
                                    path: 'floating_ip_address',
                                    class: 'span12',
                                    dataBindValue: 'floating_ip_address'
                                }
                            }
                        ]
                    },
                ]  // End Rows
            }
        }
        return fipCfgViewConfig;
    }

    function getAssociateFipCfgViewConfig(disableOnEdit) {
        var prefixId = ctwl.CFG_FIP_PREFIX_ID;
        var fipCfgViewConfig = {
            elementId: cowu.formatElementId([prefixId, ctwl.CFG_FIP_TITLE_ASSOCIATE]),
            title: ctwl.CFG_FIP_TITLE_ASSOCIATE,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [{
                                elementId: 'is_specific_ip',
                                view: 'FormCheckboxView',
                                name: 'is_specific_ip',
                                viewConfig: {
                                    label: 'Map Specific Fixed IP',
                                    templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                    path: 'is_specific_ip',
                                    class: 'span6',
                                    dataBindValue: 'is_specific_ip'
                                }
                            }
                        ],
                    }, {
                        columns: [
                            {
                                elementId: 'virtual_machine_interface_refs',
                                view: "FormDropdownView",
                                viewConfig: {
                                    label: 'Port',
                                    path : 'virtual_machine_interface_refs',
                                    class: 'span12',
                                    dataBindValue : 'virtual_machine_interface_refs',
                                    elementConfig : {
                                        placeholder: 'Select Port to Associate',
                                        dataTextField : "text",
                                        dataValueField : "id",
                                        dataSource : {
                                            type: 'remote',
                                            //Fix, find a way to get project id
                                            //here. Right now we can only get
                                            //name.
                                            url: '/api/tenants/config/get-virtual-machine-details?proj_fqn=' +
                                                contrail.getCookie(cowc.COOKIE_DOMAIN) + ':' +
                                                contrail.getCookie(cowc.COOKIE_PROJECT),
                                            parse: formatFipCfg.fipPortDropDownFormatter
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]  // End Rows
            }
        }
        return fipCfgViewConfig;
    }

    return fipCfgEditView;
});
