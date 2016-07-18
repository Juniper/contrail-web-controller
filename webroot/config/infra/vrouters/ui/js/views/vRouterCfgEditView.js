/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwl.CFG_VROUTER_GRID_ID;
    var prefixId = ctwl.CFG_VROUTER_PREFIX_ID;
    var modalId = 'configure-' + prefixId;

    var vRouterCfgEditView = ContrailView.extend({
        renderAddvRouterCfg: function (options) {
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId}),
                self = this;

            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                console.log("onSave clicked");
                self.model.addEditvRouterCfg({
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
                }, 'POST');
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            this.renderView4Config($("#" + modalId).find("#" + prefixId + "-form"),
                                   self.model,
                                   getvRouterCfgViewConfig(false),
                                   "vRouterCfgConfigValidations", null, null,
                                   function () {

                    self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                             false);
                    Knockback.applyBindings(self.model,
                        document.getElementById(modalId));
                    kbValidation.bind(self);
                    //permissions
                    ctwu.bindPermissionsValidation(self);
                                   }, null, true);
        },

        renderEditvRouterCfg: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.addEditvRouterCfg({
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
                }, 'PUT');
                // TODO: Release binding on successful configure
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});

            self.renderView4Config($("#" + modalId).find("#" + prefixId + "-form"),
                                   self.model,
                                   getvRouterCfgViewConfig(true),
                                   "vRouterCfgConfigValidations", null, null,
                                   function () {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self);
                //permissions
                ctwu.bindPermissionsValidation(self);
                                   }, null, true);
        },

        renderMultiDeletevRouterCfg: function(options) {
            var delTemplate =
                contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;

            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.multiDeletevRouterCfg(options['checkedRows'],{
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

    function getvRouterCfgViewConfig (disableOnEdit) {
        var prefixId = ctwl.CFG_VROUTER_PREFIX_ID;
        var vRouterCfgViewConfig = {
            elementId: cowu.formatElementId([prefixId,
                               ctwl.CFG_VROUTER_TITLE_CREATE]),
            title: "Virtual Router",
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'name',
                                view: 'FormInputView',
                                viewConfig: {
                                    path: 'name',
                                    class: 'span4',
                                    dataBindValue: 'name',
                                    disabled: disableOnEdit
                                }
                            },
                            {
                                elementId: 'virtual_router_type',
                                view: "FormDropdownView",
                                viewConfig: {
                                    path : 'virtual_router_type',
                                    class: 'span4',
                                    dataBindValue : 'virtual_router_type',
                                    elementConfig : {
                                        dataTextField : "text",
                                        dataValueField : "id",
                                        data : [{id: 'hypervisor',
                                                    text:'Hypervisor'},
                                                {id: 'embedded',
                                                    text:'Embedded'},
                                                {id: 'tor-agent',
                                                    text:'TOR Agent'},
                                                {id: 'tor-service-node',
                                                    text:'TOR Service Node'}]
                                    }
                                }
                            },
                            {
                                elementId: 'virtual_router_ip_address',
                                view: 'FormInputView',
                                viewConfig: {
                                    path: 'virtual_router_ip_address',
                                    class: 'span4',
                                    dataBindValue: 'virtual_router_ip_address'
                                }
                            }
                        ]
                    }
                ]
            }
        }
        return vRouterCfgViewConfig;
    }

    return vRouterCfgEditView;
});

