/*
 * Copyright (c) 2018 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model',
    'knockback',
    'contrail-view',
    'config/networking/fippool/ui/js/views/fipPoolFormatters',
], function (_, Backbone, ContrailListModel, Knockback, ContrailView,
        FipPoolFormatter) {
    var fipPoolFormatter = new FipPoolFormatter();
    var prefixId = ctwc.FIP_POOL_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        editTemplate = contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM),
        self = {};

    var fipPoolCfgEditView = ContrailView.extend({
        modalElementId: '#' + modalId,
        renderFipPoolPopup: function (options) {
            var editLayout = editTemplate(
                                {modalId: modalId, prefixId: prefixId}),
                disableElement = false;
            self = this;
            cowu.createModal({'modalId': modalId,
                              'className': 'modal-700',
                              'title': options['title'],
                              'body': editLayout,
                              'onSave': function () {
                self.model.configurefipPool(options['mode'],
                {
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
                            self.model.showErrorAttr(
                                       prefixId + cowc.FORM_SUFFIX_ID,
                                       error.responseText);
                        });
                    }
                });
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});

            if(options['mode'] == ctwl.EDIT_ACTION) {
                disableElement = true;
            }
            self.renderView4Config(
                $("#" + modalId).find("#" + modalId + "-form"),
                self.model, self.getConfigureViewConfig(
                     disableElement, options['mode'], options),
                'fipPoolValidations', null, null,function(){
                    self.model.showErrorAttr(prefixId +
                                    cowc.FORM_SUFFIX_ID, false);
                    Knockback.applyBindings(self.model,
                                    document.getElementById(modalId));
                    //permissions
                   ctwu.bindPermissionsValidation(self);
                }, null, true, false
            );
            return;
        },
        renderDeleteFloatingIPPools: function (options) {
            var delTemplate =
                contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;

            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.deleteFloatingIpPools(options['selectedGridData'], {
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
        },
        renderDeleteAllfipPools: function (options) {
            var elId = 'deleteAllfipPools';
            var delTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_DEL),
                self = this;
            var delLayout = delTemplate({prefixId: prefixId,
                                        item: "all fip(s)",
                                        itemId:""})
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout, 'onSave': function () {
                self.model.deleteAllPort(options.selectedProjectId, {
                    init: function () {
                        self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
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
                });
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            this.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(this.model,
                                    document.getElementById(modalId));
            kbValidation.bind(this);
        },
        getConfigureViewConfig : function(isDisable, mode, options) {
            return {
                elementId: cowu.formatElementId([prefixId, ctwl.TITLE_EDIT_PORT]),
                view: "SectionView",
                title: "Floating IP Pools",//permissions
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: 'virtualNetworkName',
                                    view: "FormDropdownView",
                                    name: "Network",
                                    viewConfig: {
                                        label: 'Network',
                                        disabled: isDisable,
                                        path: 'virtualNetworkName',
                                        dataBindValue: 'virtualNetworkName',
                                        dropdownAutoWidth : false,
                                        class: "col-xs-10",
                                        elementConfig:{
                                            allowClear: true,
                                            dataTextField: "text",
                                            dataValueField: "value",
                                            defaultValueId : 0,
                                            dataSource : {
                                                type: "remote",
                                                requestType: "POST",
                                                url: '/api/tenants/config/get-config-details',
                                                postData: JSON.stringify({
                                                    'data': [
                                                    {type: 'virtual-networks',
                                                    parent_id:options.selectedProjectId}]
                                                }),
                                                parse: function(result) {
                                                    return fipPoolFormatter.formatNetworksData(self,
                                                        result, mode);
                                                }
                                            }
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            columns: [{
                                elementId: 'pool_name',
                                name: "Name",
                                view: "FormInputView",
                                viewConfig: {
                                    disabled: false,
                                    path: 'display_name',
                                    label: 'Name',
                                    placeholder: 'Pool Name',
                                    dataBindValue: 'display_name',
                                    class: "col-xs-10"
                                }
                            }]
                        },
                        {
                            columns: [{
                                elementId: 'pool_description',
                                name: "Pool Description",
                                view: "FormTextAreaView",
                                viewConfig: {
                                    disabled: false,
                                    path: 'description',
                                    label: 'Description',
                                    placeholder: 'Pool Description',
                                    dataBindValue: 'description',
                                    rows:"1",
                                    cols:"100%",
                                    class: "col-xs-10"
                                }
                            }]
                        }
                    ]
                }
            };
        }
    });
    return fipPoolCfgEditView;
});
