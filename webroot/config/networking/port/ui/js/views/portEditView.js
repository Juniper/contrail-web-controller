/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model',
    'knockback',
    'contrail-view',
    'config/networking/port/ui/js/views/portFormatters',
    'config/networking/port/ui/js/portViewConfigs',
    'config/common/ui/js/fatFlow.utils'
], function (_, Backbone, ContrailListModel, Knockback, ContrailView,
             PortFormatters, PortViewConfigs, FatFlowUtils) {
    var portFormatter = new PortFormatters();
    var portViewConfigs = new PortViewConfigs();
    var fatFlowUtils = new FatFlowUtils();
    var prefixId = ctwc.PORT_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        editTemplate = contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM),
        self = {};

    var portEditView = ContrailView.extend({
        modalElementId: '#' + modalId,
        renderPortPopup: function (options) {
            var editLayout = editTemplate(
                                {modalId: modalId, prefixId: prefixId}),
                disableElement = false;
            self = this;
            cowu.createModal({'modalId': modalId,
                              'className': 'modal-700',
                              'title': options['title'],
                              'body': editLayout,
                              'onSave': function () {
                self.model.configurePorts(options['mode'],
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
                     disableElement, options['mode']),
                'portValidations', null, null, function(){
                    self.model.showErrorAttr(prefixId +
                                    cowc.FORM_SUFFIX_ID, false);
                    Knockback.applyBindings(self.model,
                                    document.getElementById(modalId));
                    kbValidation.bind(self,
                        {collection:
                          self.model.model().attributes.fixedIPCollection}
                        );
                    kbValidation.bind(self,
                        {collection:
                          self.model.model().attributes.dhcpOptionCollection}
                        );
                    kbValidation.bind(self,
                        {collection:
                          self.model.model().attributes.allowedAddressPairCollection}
                        );
                    kbValidation.bind(self,
                        {collection:
                          self.model.model().attributes.fatFlowCollection}
                        );
                    kbValidation.bind(self,
                        {collection:
                          self.model.model().attributes.portBindingCollection}
                        );
                    //permissions
                   ctwu.bindPermissionsValidation(self);
                }, null, true
            );
            return;
        },
        renderDeletePort: function (options) {
            var selectedGridData = options['selectedGridData'],
                elId = 'deletePortID';
            var items = "";
            var errorString = "";
            var rowIdxLen = selectedGridData.length;
            for (var i = 0; i < rowIdxLen; i++) {
                var isParentPortBool = portFormatter.isParentPort(selectedGridData[i]);
                if (isParentPortBool != true) {
                    if (items != "") {
                        items += ', ';
                    }
                    items += selectedGridData[i]["name"];
                } else {
                    if (errorString != "") {
                        errorString += ", ";
                    }
                    errorString += selectedGridData[i]["name"];
                }
            }
            var delTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_DEL),
                self = this;
            var delLayout = delTemplate({prefixId: prefixId,
                                        item: ctwc.TEXT_PORT,
                                        itemId: items})
            var errorMessage = false;
            if (errorString != "") {
                errorMessage = "Deleting Primary Interface(s) "+errorString+" deletes all its sub interfaces. Do you want to continue?";
            }
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout, 'onSave': function () {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                         errorMessage);
                self.model.deletePort(selectedGridData, {
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
            this.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, errorMessage);
            Knockback.applyBindings(this.model,
                                    document.getElementById(modalId));
            kbValidation.bind(this);
        },
        renderDeleteAllPort: function (options) {
            var elId = 'deleteAllPortID';
            var delTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_DEL),
                self = this;
            var delLayout = delTemplate({prefixId: prefixId,
                                        item: "all port(s)",
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
        getConfigureViewConfig : function(isDisable, mode) {
            return {
                elementId: cowu.formatElementId([prefixId, ctwl.TITLE_EDIT_PORT]),
                view: "SectionView",
                title: "Port",//permissions
                viewConfig:{
                    rows: [
                        portViewConfigs.virtualNetworkSection(self,
                            portFormatter, mode, isDisable),
                        portViewConfigs.secGrpCheckboxSection(),
                        portViewConfigs.securityGroupSection(self,
                            portFormatter, isDisable),
                        portViewConfigs.floatingIPSection(self, portFormatter),
                        portViewConfigs.advancedSection(isDisable,
                            self.selectedProjectId, portFormatter, self),
                        portViewConfigs.dhcpOptionsSection(),
                        fatFlowUtils.fatFlowSection()
                    ]
                }
            };
        }
    });
    return portEditView;
});
