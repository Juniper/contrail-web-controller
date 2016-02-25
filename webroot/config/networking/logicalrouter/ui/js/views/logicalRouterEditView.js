/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model',
    'knockback',
    'contrail-view',
    'config/networking/logicalrouter/ui/js/views/logicalRouterFormatters'
], function (_, Backbone, ContrailListModel, Knockback, ContrailView,
             logicalRouterFormatters) {
    var lRFormatters = new logicalRouterFormatters();
    var prefixId = ctwl.LOGICAL_ROUTER_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        editTemplate = contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM),
        externalGatewayDS = [],
        allNetworksDS = [];

    var LogicalRouterCreateEditView = ContrailView.extend({
        modalElementId: '#' + modalId,
        renderLogicalRouterPopup: function (options) {
            var editLayout = editTemplate(
                                {modalId: modalId, prefixId: prefixId}),
                self = this;

            cowu.createModal({'modalId': modalId,
                              'className': 'modal-700',
                              'title': options['title'],
                              'body': editLayout,
                              'onSave': function () {
                self.model.configureLogicalRouter(options['mode'],
                                                  allNetworksDS,
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

           this.fetchRoutingPolicyPopupData(this ,
                function(allNetworksDS, externalNetworksDS) {
                   var disableElement = false
                   if(options['mode'] == "edit") {
                       disableElement = true;
                   }
                   self.renderView4Config(
                        $("#" + modalId).find("#" + modalId + "-form"),
                        self.model, getConfigureLogicalRouterViewConfig
                        (disableElement, allNetworksDS, externalNetworksDS),
                        null, null, null, function(){
                            self.model.showErrorAttr(prefixId +
                                            cowc.FORM_SUFFIX_ID, false);
                            Knockback.applyBindings(self.model,
                                            document.getElementById(modalId));
                            kbValidation.bind(self);
                   });
                   return;
               }
           );
        },
        renderDeleteLogicalRouter: function (options) {
            var selectedGridData = options['selectedGridData'],
                elId = 'deleteLogicalRouterID';
            var items = "";
            var rowIdxLen = selectedGridData.length;
            for (var i = 0; i < rowIdxLen; i++) {
                items +=
                    selectedGridData[i]["name"];
                if (i < rowIdxLen - 1) {
                    items += ',';
                }
            }
            var delTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_DEL),
                self = this;
            var delLayout = delTemplate({prefixId: prefixId,
                                        item: ctwl.TITLE_LOGICAL_ROUTER,
                                        itemId: items})
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout, 'onSave': function () {
                self.model.deleteLogicalRouter(selectedGridData, {
                    init: function () {
                        self.model.showErrorAttr(elId, false);
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            self.model.showErrorAttr(elId, error.responseText);
                        });
                    }
                });
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            this.model.showErrorAttr(elId, false);
            Knockback.applyBindings(this.model,
                                    document.getElementById(modalId));
            kbValidation.bind(this);
        },
        fetchRoutingPolicyPopupData : function(self, callback) {
            self.fetchAllVirtualNetworksForLogicalRouter(function (allNetworksDS) {
                self.fetchExternalNetworks(function (externalNetworksDS) {
                    callback(allNetworksDS, externalNetworksDS);
                });
            });
        },
        fetchAllVirtualNetworksForLogicalRouter : function(callback) {
            var selectedValue = ctwu.getGlobalVariable('project').uuid;
            contrail.ajaxHandler({url : ctwc.get(
                                        ctwc.URL_All_NETWORK_IN_PROJECT,
                                        selectedValue) ,type :'GET'},
                                        null,
                function(result){
                    allNetworksDS =
                             lRFormatters.connectedNetworkParser(result);
                    callback(allNetworksDS);
                },
                function(error) {
                    cowu.disableModalLoading(modalId, function () {
                        self.model.showErrorAttr("", error.responseText);
                    });
                }
            );
        },
        fetchExternalNetworks : function(callback) {
            contrail.ajaxHandler(
                     {url : ctwc.URL_All_EXTERNAL_NETWORK ,type :'GET'}, null,
                function(result){
                    allNetworksDS =
                            lRFormatters.externalNetworkParser(result);
                    callback(allNetworksDS);
                },
                function(error) {
                    cowu.disableModalLoading(modalId, function () {
                        self.model.showErrorAttr("", error.responseText);
                    });
                }
            );
        }
    });

    var getConfigureLogicalRouterViewConfig = function(isDisable, allNetworksDS,
                                          externalNetworksDS) {
        return {
            elementId: cowu.formatElementId(
                            [prefixId, ctwl.TITLE_EDIT_LOGICAL_ROUTER]),
            view: "SectionView",
            viewConfig:{
            rows: [{
                    columns: [{
                        elementId: 'name',
                        view: "FormInputView",
                        name: "Name",
                        viewConfig: {
                                    disabled: isDisable,
                                    placeHolder: ctwl.ENTER_NAME,
                                    path: 'name',
                                    dataBindValue: 'name',
                                    class: "span6"}
                    },
                    {
                        elementId: 'enable',
                        view: "FormDropdownView",
                        viewConfig: {path: 'id_perms.enable',
                                     label: "Admin State",
                                     dataBindValue: 'id_perms().enable',
                                     class: "span6",
                        elementConfig:{allowClear: true,
                                       dataTextField: "text",
                                       dataValueField: "value",
                                       data : [
                                         {"text":"Up","value":"true"},
                                         {"text":"Down","value":"false"}]
                                    }}
                    }]
                },{
                    columns: [{
                        elementId: 'extNetworkUUID',
                        view: "FormDropdownView",
                        viewConfig: {path: 'extNetworkUUID',
                                     label: "External Gateway",
                                     dataBindValue: 'extNetworkUUID',
                                     class: "span6",
                        elementConfig:{placeholder: ctwl.SELECT_EXT_GATEWAY,
                                       dataTextField: "text",
                                       dataValueField: "value",
                                       data : externalNetworksDS}}
                    },{
                        elementId: 'checkSNAT',
                        view: "FormCheckboxView",
                        name: "SNAT",
                        viewConfig: {
                                     disabled: true,
                                     label: "SNAT",
                                     path: 'checkSNAT',
                                     dataBindValue: 'checkSNAT',
                                     class: "span6"}
                    }]
                },{
                    columns: [{
                        elementId: 'connectedNetwork',
                        view: "FormMultiselectView",
                        name: "Connected Networks",
                        viewConfig: {path: 'connectedNetwork',
                                     label: "Connected Networks",
                                     dataBindValue: 'connectedNetwork',
                                     class: "span12",
                        elementConfig:{allowClear: true,
                                       placeholder: ctwl.SELECT_CONN_NET,
                                       dataTextField: "text",
                                       dataValueField: "value",
                                       data : allNetworksDS}}
                    }]
                }
            ]
            }
        }
    }
    return LogicalRouterCreateEditView;
});
