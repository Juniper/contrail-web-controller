/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'],
    function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwl.CFG_LOCATION_GRID_ID;
    var prefixId = ctwl.CFG_LOCATION_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
    var locationEditView = ContrailView.extend({
        renderAddLocation: function (options) {
            var editTemplate = contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId}),
                self = this;

            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
               self.model.addEditLocation({
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
                }, 'POST');
            }, 'onCancel': function () {
                Knockback.release(self.model,
                                    document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.renderView4Config($("#" + modalId).find("#" + prefixId + "-form"),
                                    self.model,
                                    getLocationViewConfig(false),
                                    "", null, null,
                                    function () {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                         false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                                    }, null, false);
        },
        renderEditLocation: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.addEditLocation({
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
                }, 'PUT');
            }, 'onCancel': function () {
                Knockback.release(self.model,
                                    document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});

            self.renderView4Config($("#" + modalId).find("#" + prefixId + "-form"),
                                    self.model,
                                    getLocationViewConfig(true),
                                    "", null, null,
                                    function () {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                }, null, false);
        },
        renderDeleteLocation: function(options) {
            var delTemplate = contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;
            var selectedGridData = options['selectedGridData'];
            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.deleteLocation(selectedGridData[0], {
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

    function getLocationViewConfig (isDisable) {
        var prefixId = ctwl.CFG_LOCATION_PREFIX_ID;
        var locationViewConfig = {
            elementId: cowu.formatElementId([prefixId, ctwl.CFG_LOCATION_TITLE_CREATE]),
            title: "Location",//permissions
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
                                    disabled: isDisable,
                                    placeholder: 'Name',
                                    path: 'name',
                                    class: 'col-xs-6',
                                    dataBindValue: 'name',
                                }
                            },
                            {
                                elementId: 'description',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Description',
                                    placeholder: 'Description',
                                    path: 'description',
                                    class: 'col-xs-6',
                                    dataBindValue: 'description',
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'keystone_endpoint',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Keystone endpoint',
                                    placeholder: 'Keystone endpoint',
                                    path: 'keystone_endpoint',
                                    class: 'col-xs-6',
                                    dataBindValue: 'keystone_endpoint',
                                }
                            },
                            {
                                elementId: 'contrail_endpoint',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Contrail endpoint',
                                    placeholder: 'Contrail endpoint',
                                    path: 'contrail_endpoint',
                                    class: 'col-xs-6',
                                    dataBindValue: 'contrail_endpoint',
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'webui',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Horizon WebUI',
                                    placeholder: 'Horizon WebUI Link',
                                    path: 'webui',
                                    class: 'col-xs-6',
                                    dataBindValue: 'webui',
                                }
                            },
                            {
                                elementId: 'contrail_webui',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Contrail WebUI',
                                    placeholder: 'Contrail WebUI Link',
                                    path: 'contrail_webui',
                                    class: 'col-xs-6',
                                    dataBindValue: 'contrail_webui',
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'region',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Region',
                                    placeholder: 'Region',
                                    path: 'region',
                                    class: 'col-xs-6',
                                    dataBindValue: 'region',
                                }
                            },
                            {
                                elementId: 'address',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Endpoint address',
                                    placeholder: 'Endpoint address',
                                    path: 'address',
                                    class: 'col-xs-6',
                                    dataBindValue: 'address',
                                }
                            }
                        ]
                    }
                ]  // End Rows
            }
        }
        return locationViewConfig;
    }
    return locationEditView;
});
