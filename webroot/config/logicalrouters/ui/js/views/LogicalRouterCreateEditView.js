/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model',
    'knockback',
    'contrail-view',
    'config/logicalrouters/ui/js/views/logicalRouterFormatters'
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

           this.fetchAllData(this ,
                function(allNetworksDS, externalNetworksDS) {
                   var disableElement = false
                   if(options['mode'] == "edit") {
                       disableElement = true;
                   }
                   self.renderView4Config(
                        $("#" + modalId).find("#" + modalId + "-form"),
                        self.model, getConfigureViewConfig
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
                    selectedGridData[i]["routerName"]
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
        fetchAllData : function(self, callback) {
            self.fetchAllVirtualNetworks(function (allNetworksDS) {
                self.fetchExternalNetworks(function (externalNetworksDS) {
                    callback(allNetworksDS, externalNetworksDS);
                });
            });
        },
        fetchAllVirtualNetworks : function(callback) {
            var selectedValue = cobdcb.getSelectedValue("project");
            contrail.ajaxHandler({url : ctwc.get(
                                        ctwc.URL_All_NETWORK_IN_PROJECT,
                                        selectedValue.value) ,type :'GET'},
                                        null,
                function(result){
                    allNetworksDS =
                             lRFormatters.connectedNetworkParser_LR(result);
                    callback(allNetworksDS);
                },
                function(error) {}
            );
        },
        fetchExternalNetworks : function(callback) {
            contrail.ajaxHandler(
                     {url : ctwc.URL_All_EXTERNAL_NETWORK ,type :'GET'}, null,
                function(result){
                    allNetworksDS =
                            lRFormatters.externalNetworkParser_LR(result);
                    callback(allNetworksDS);
                },
                function(error) {}
            );
        }
    });

    var getConfigureViewConfig = function(isDisable, allNetworksDS,
                                          externalNetworksDS) {
        return {
            elementId: cowu.formatElementId(
                            [prefixId, ctwl.TITLE_EDIT_LOGICAL_ROUTER]),
            view: "SectionView",
            viewConfig:{
            rows: [{
                    columns: [{
                        elementId: 'routerName',
                        view: "FormInputView",
                        viewConfig: {
                                    disabled: isDisable,
                                    path: 'routerName',
                                    dataBindValue: 'routerName',
                                    class: "span6"}
                    },
                    {
                        elementId: 'lRouterStatus',
                        view: "FormDropdownView",
                        viewConfig: {path: 'lRouterStatus',
                                     dataBindValue: 'lRouterStatus',
                                     class: "span6",
                        elementConfig:{allowClear: true,
                                       placeholder: ctwl.SELECT_ENTER_NAME,
                                       dataTextField: "text",
                                       dataValueField: "text",
                                       data : [
                                         {"text":"Up","value":true},
                                         {"text":"Down","value":false}]
                                    }}
                    }]
                },{
                    columns: [{
                        elementId: 'externalGatewayVal',
                        view: "FormDropdownView",
                        viewConfig: {path: 'externalGatewayVal',
                                     dataBindValue: 'externalGatewayVal',
                                     class: "span6",
                        elementConfig:{allowClear: true,
                                       placeholder: ctwl.SELECT_ENTER_NAME,
                                       dataTextField: "text",
                                       dataValueField: "value",
                                       data : externalNetworksDS}}
                    },{
                        elementId: 'checkSNAT',
                        view: "FormCheckboxView",
                        viewConfig: {
                                     disabled: true,
                                     path: 'checkSNAT',
                                     dataBindValue: 'checkSNAT',
                                     class: "span6"}
                    }]

                },{
                    columns: [{
                        elementId: 'connectedNetworkArr',
                        view: "FormMultiselectView",
                        viewConfig: {path: 'connectedNetworkArr',
                                     dataBindValue: 'connectedNetworkArr',
                                     class: "span12",
                        elementConfig:{allowClear: true,
                                       placeholder: ctwl.SELECT_ENTER_NAME,
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
