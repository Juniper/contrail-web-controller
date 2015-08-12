/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwl.LINK_LOCAL_SERVICES_GRID_ID;
    var prefixId = ctwl.LINK_LOCAL_SERVICES_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
    var formId = '#' + modalId + '-form';

    var LinkLocalServicesEditView = ContrailView.extend({
        renderAddLinkLocalServices: function (options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;

            var gridData = options['gridData'];
            var configData = options['configData'];
            cowu.createModal({'modalId': modalId, 'className': 'modal-980',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.configureLinkLocalServices(-1, configData, gridData, {
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

            self.renderView4Config($("#" + modalId).find(formId), this.model, getAddLinkLocalServicesViewConfig(false), "llsConfigValidations", null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model, document.getElementById(modalId));
                kbValidation.bind(self);
            });
        },
        renderEditLinkLocalServices: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            var rowIndex = options['rowIndex'];
            var gridData = options['gridData'];
            var configData = options['configData'];
            cowu.createModal({'modalId': modalId, 'className': 'modal-980',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.configureLinkLocalServices(rowIndex, configData,
                                                      gridData, {
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

            self.renderView4Config($("#" + modalId).find(formId), this.model, getAddLinkLocalServicesViewConfig(true), "llsConfigValidations", null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model, document.getElementById(modalId));
                kbValidation.bind(self);
            });
        },
        renderDeleteLinkLocalServices: function(options) {
            var delTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_DEL),
                that = this;
            var items = "";
            var rowIdxLen = options['rowIndexes'].length;
            var gridData = options['gridData'];
            for (var i = 0; i < rowIdxLen; i++) {
                items +=
                    gridData[options['rowIndexes'][i]]['linklocal_service_name']
                if (i < rowIdxLen - 1) {
                    items += ',';
                }
            }
            var delLayout = delTemplate({prefixId: prefixId,
                                        item: ctwl.TITLE_LINK_LOCAL_SERVICES,
                                        itemId: items}),
                configData = options['configData'];
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout, 'onSave': function () {
                that.model.deleteLinkLocalServices(configData, gridData,
                                                   options['rowIndexes'],{
                    init: function () {
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            that.model.showErrorAttr(prefixId +
                                                     cowc.FORM_SUFFIX_ID,
                                                     error.responseText);
                        });
                    }
                });
                // TODO: Release binding on successful configure
            }, 'onCancel': function () {
                Knockback.release(that.model, document.getElementById(modalId));
                kbValidation.unbind(that);
                $("#" + modalId).modal('hide');
            }});

            this.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(this.model, document.getElementById(modalId));
            kbValidation.bind(this);
        }
    });

    function getAddLinkLocalServicesViewConfig (isDisable) {
        var prefixId = ctwl.LINK_LOCAL_SERVICES_PREFIX_ID;
        var llsViewConfig = {
            elementId: cowu.formatElementId([prefixId, ctwl.TITLE_CREATE_LLS]),
            title: ctwl.TITLE_CREATE_LLS,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'linklocal_service_name',
                                view: 'FormInputView',
                                visible: 'def_visible',
                                viewConfig: {
                                    disabled: isDisable,
                                    path: 'linklocal_service_name',
                                    class: 'span2',
                                    dataBindValue: 'linklocal_service_name'
                                }
                                /*
                                view: "FormDropdownView",
                                viewConfig: {
                                    path : 'linklocal_service_name',
                                    class: 'span2',
                                    dataBindValue : 'linklocal_service_name',
                                    elementConfig : {
                                        dataTextField : "text",
                                        dataValueField : "id",
                                        data : [{id: 'metadata',
                                                text:'metadata'}]
                                    }
                                }
                                */
                            },
                            {
                                elementId: 'linklocal_service_ip',
                                view: 'FormInputView',
                                visible: 'def_visible',
                                viewConfig: {
                                    path: 'linklocal_service_ip',
                                    class: 'span2',
                                    dataBindValue: 'linklocal_service_ip'
                                }
                            },
                            {
                                elementId: 'linklocal_service_port',
                                view: 'FormInputView',
                                visible: 'def_visible',
                                viewConfig: {
                                    path: 'linklocal_service_port',
                                    class: 'span2',
                                    dataBindValue: 'linklocal_service_port'
                                }
                            },
                            {
                                elementId: 'lls_fab_address_ip',
                                view: "FormDropdownView",
                                visible: 'def_visible',
                                viewConfig: {
                                    path : 'lls_fab_address_ip',
                                    class: 'span2',
                                    dataBindValue : 'lls_fab_address_ip',
                                    elementConfig : {
                                        allowClear: true,
                                        dataTextField : "text",
                                        dataValueField : "id",
                                        data : [{id: 'IP', text: 'IP'},
                                                {id: 'DNS', text: 'DNS'}]
                                    }
                                }
                            },
                            {
                                elementId: 'ip_fabric_service_ip',
                                view: 'FormInputView',
                                visible: "showIp",
                                viewConfig: {
                                    path: 'ip_fabric_service_ip',
                                    class: 'span2',
                                    dataBindValue: 'ip_fabric_service_ip'
                                }
                            },
                            {
                                elementId: 'ip_fabric_DNS_service_name',
                                view: 'FormInputView',
                                visible: "showDns",
                                viewConfig: {
                                    path: 'ip_fabric_DNS_service_name',
                                    class: 'span2',
                                    dataBindValue: 'ip_fabric_DNS_service_name'
                                }
                            },
                            {
                                elementId: 'ip_fabric_service_port',
                                view: 'FormInputView',
                                visible: 'def_visible',
                                viewConfig: {
                                    path: 'ip_fabric_service_port',
                                    class: 'span2',
                                    dataBindValue: 'ip_fabric_service_port'
                                }
                            }
                        ]
                    }
                ]
            }
        }
        return llsViewConfig;
    }

    return LinkLocalServicesEditView;
});

