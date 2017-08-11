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
                            kbValidation.bind(self,
                             {collection:
                               self.model.model().attributes.user_created_configured_route_target_list});
                            //permissions
                            ctwu.bindPermissionsValidation(self);
                   }, null, true);
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
        fetchAllData : function(self, callback) {
            self.fetchAllVirtualNetworks(function (allNetworksDS) {
                self.fetchExternalNetworks(function (externalNetworksDS) {
                    callback(allNetworksDS, externalNetworksDS);
                });
            });
        },
        fetchAllVirtualNetworks : function(callback) {
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

    var getConfigureViewConfig = function(isDisable, allNetworksDS,
                                          externalNetworksDS) {
        return {
            elementId: cowu.formatElementId(
                            [prefixId, ctwl.TITLE_EDIT_LOGICAL_ROUTER]),
            view: "SectionView",
            title: "Router",
            viewConfig:{
            rows: [{
                    columns: [{
                        elementId: 'display_name',
                        view: "FormInputView",
                        name: "Name",
                        viewConfig: {
                                    path: 'display_name',
                                    label: 'Name',
                                    dataBindValue: 'display_name',
                                    class: "col-xs-6"}
                    },
                    {
                        elementId: 'enable',
                        view: "FormDropdownView",
                        viewConfig: {path: 'id_perms.enable',
                                     label: "Admin State",
                                     dataBindValue: 'id_perms().enable',
                                     class: "col-xs-6",
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
                                     class: "col-xs-6",
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
                                     class: "col-xs-6"}
                    }]
                },{
                    columns: [{
                        elementId: 'connectedNetwork',
                        view: "FormMultiselectView",
                        name: "Connected Networks",
                        viewConfig: {path: 'connectedNetwork',
                                     label: "Connected Networks",
                                     dataBindValue: 'connectedNetwork',
                                     class: "col-xs-12",
                        elementConfig:{allowClear: true,
                                       placeholder: ctwl.SELECT_CONN_NET,
                                       dataTextField: "text",
                                       dataValueField: "value",
                                       data : allNetworksDS}}
                    }]
                }, {
                    columns: [{
                            elementId: 'user_created_physical_router',
                            view: 'FormDropdownView',
                            viewConfig: {
                                path:
                                'user_created_physical_router',
                                dataBindValue:
                                'user_created_physical_router',
                                label : 'Extend to Physical Router',
                                class: 'col-xs-6',
                                elementConfig : {
                                    dataTextField :
                                    'text',
                                    dataValueField :
                                    'value',
                                    dataSource: {
                                        type : 'remote',
                                        url :
                                        '/api/tenants/config/physical-routers-list',
                                        parse : function(result) {
                                            result = ifNull(result, []);
                                            var prouters =
                                            result['physical-routers'];
                                            var ddData = [
                                                {
                                                    text:'None',
                                                    value:'none'
                                                }
                                            ];
                                            if(prouters.length > 0) {
                                                for(var i = 0; i < prouters.length; i++){
                                                    ddData.push({
                                                        text: prouters[i]['fq_name'][1],
                                                        value: prouters[i]['fq_name'][0] +
                                                        ':' + prouters[i]['fq_name'][1]
                                                    });
                                                }
                                            }
                                             return  ddData;
                                        }
                                    }
                                }
                            }
                    }, {
                        elementId: 'vxlan_network_identifier',
                        view: "FormInputView",
                        viewConfig: {
                            label: 'VNI',
                            placeholder: 'Enter VxLAN Network Indetifier',
                            path: 'vxlan_network_identifier',
                            dataBindValue: 'vxlan_network_identifier',
                            class: "col-xs-6"
                        }
                    }]
                }, {
                columns: [
                    {
                    elementId: 'route_target_accordian',
                    view: "AccordianView",
                    viewConfig: [
                        {
                        elementId: 'route_target_vcfg',
                        title: 'Route Target(s)',
                        view: "SectionView",
                        active:false,
                        viewConfig: {
                                rows: [
                                {
                                    columns: [{
                                        elementId: 'user_created_configured_route_target_list',
                                        view: "FormEditableGridView",
                                        viewConfig: {
                                            path : 'user_created_configured_route_target_list',
                                            class: 'col-xs-12',
                                            validation:
                                           'routeTargetModelConfigValidations',
                                           templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                                            collection:
                                                'user_created_configured_route_target_list',
                                            columns: [
                                                {
                                                 elementId: 'asn',
                                                 name:
                                                   'ASN',
                                                 view: "FormInputView",
                                                 viewConfig:
                                                   {
                                                    class: "", width: 400,
                                                    placeholder: 'ASN 1 - 65534 or IP',
                                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                    path: "asn",
                                                    dataBindValue:
                                                        'asn()',
                                                   }
                                                },
                                                {
                                                 elementId: 'target',
                                                 name:
                                                   'Target',
                                                 view: "FormInputView",
                                                 viewConfig:
                                                   {
                                                    placeholder: 'Target 1 - 4294967295',
                                                    class: "", width: 400,
                                                    path: "target",
                                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                    dataBindValue:
                                                        'target()',
                                                   }
                                                },
                                            ],
                                            rowActions: [
                                                {onClick: "function() {\
                                                    $root.addRouteTargetByIndex('user_created_configured_route_target_list', $data,this);\
                                                    }",
                                                 iconClass: 'fa fa-plus'},
                                                {onClick: "function() {\
                                                    $root.deleteRouteTarget($data, this);\
                                                   }",
                                                 iconClass: 'fa fa-minus'}
                                            ],
                                            gridActions: [
                                                {onClick: "function() {\
                                                    addRouteTarget('user_created_configured_route_target_list');\
                                                    }",
                                                 buttonTitle: ""}
                                            ]
                                        }
                                    }
                                    ]
                                },
                                ]
                            }
                        }]
                    }]
                }
            ]
            }
        }
    }
    return LogicalRouterCreateEditView;
});
