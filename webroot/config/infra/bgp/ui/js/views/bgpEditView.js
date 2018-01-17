/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/infra/bgp/ui/js/bgpConfigTemplates'
], function (_, ContrailView, Knockback, BGPConfigTemplates) {
    var gridElId = '#' + ctwl.BGP_GRID_ID;
    var prefixId = ctwl.BGP_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
    var bgpConfigTemplates =  new BGPConfigTemplates();
    var self;
    var bgpEditView = ContrailView.extend({
        renderAddEditBGP: function (options) {
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId});
            self = this;

            cowu.createModal({'modalId': modalId, 'className': 'modal-980',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                if((!self.model.isAutoMeshEnabled() ||
                    self.model.user_created_router_type() !== ctwl.CONTROL_NODE_TYPE) &&
                    self.model.getPeers(self.model.model().attributes).length === 0) {
                    /* the below line is required to solve Maximum
                        call stack size exceeded issue  */
                    $.fn.modal.Constructor.prototype.enforceFocus =
                        function() {};
                    var confTemplate = contrail.getTemplate4Id("controller-bgp-peer-conf-form-template");
                    var confTempLayout = confTemplate();
                    cowu.createModal({"modalId": modalId + "_conf", "className": "modal-280",
                        "title": "Information",
                        "btnName": "Continue",
                        "body": confTempLayout,
                        "onSave": function() {
                           $("#" + modalId + "_conf").modal("hide");
                           self.configEditBGPRouter(options)
                        },
                        "onCancel": function(){$("#" + modalId + "_conf").modal("hide")}
                    });
                    $("#" + modalId + "_conf").css("z-index",1052);
                    $(".modal-backdrop:last-child").css("z-index",1051);
                } else{
                    self.configEditBGPRouter(options);
                }

            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.getASN(options);
        },

        configEditBGPRouter : function(options) {
            self.model.configBGPRouter({
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
            }, options.mode === ctwl.CREATE_ACTION ? 'POST' : 'PUT');
        },

        getASN : function(options){
            var ajaxConfig = {
                url : ctwc.get(ctwc.URL_GET_ASN),
                type : 'GET'
            };
            contrail.ajaxHandler(ajaxConfig, null,
                function(result) {
                    self.model.setGlobalASNAttributes(options.mode, result);
                    self.bgpRenderView4Config(options);
                },
                function(error) {
                    $("#" + modalId).modal('hide');
                    showInfoWindow(error.responseText, error.statusText);
                }
            );
        },

        bgpRenderView4Config : function(options) {
            var disableFlag =
                (options.mode === ctwl.CREATE_ACTION) ?  false : true;
            self.renderView4Config($("#" + modalId).find("#" + prefixId + "-form"),
                self.model,
                self.getBGPViewConfig(disableFlag),
                "configureValidation", null, null,
                function () {
                    self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                             false);
                    Knockback.applyBindings(self.model,
                        document.getElementById(modalId));
                    var peers = self.model.model().attributes.peers;
                    if(peers instanceof Backbone.Collection) {
                        kbValidation.bind(self, {collection: peers});
                        var peerModels = peers.toJSON();
                        for(var i = 0; i < peerModels.length; i++) {
                            kbValidation.bind(self,
                                {collection: peerModels[i].model().attributes.family_attrs});
                        }
                    }
                    //permissions
                    ctwu.bindPermissionsValidation(self);
                }, null, true
            );
        },

        renderDeleteBGPRouters: function(options) {
            var delTemplate =
                //Fix the template to be common delete template
                contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;

            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.deleteBGPRouters(options['checkedRows'], {
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
            self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(self.model, document.getElementById(modalId));
            kbValidation.bind(self);
        },

        getBGPViewConfig : function(disableId) {
            var prefixId = ctwl.CFG_VROUTER_PREFIX_ID;
            var bgpViewConfig = {
                elementId: cowu.formatElementId([prefixId,
                                   ctwl.TITLE_ADD_BGP]),
                title: "BGP",
                view: "SectionView",
                viewConfig :{
                    rows : [
                        {
                            columns : [
                                {
                                    elementId: "user_created_router_type",
                                    view: "FormDropdownView",
                                    viewConfig: {
                                        label: "Router Type",
                                        path: "user_created_router_type",
                                        dataBindValue: "user_created_router_type",
                                        class:"col-xs-6",
                                        elementConfig: {
                                            dataTextField: "text",
                                            dataValueField: "value",
                                            data: [
                                                {
                                                    value: "control-node",
                                                    text: "Control Node"
                                                },
                                                {
                                                    value: "external-control-node",
                                                    text: "External Control Node"
                                                },
                                                {
                                                    value: "router",
                                                    text: "BGP Router"
                                                }/*,
                                                {
                                                    value: "bgpaas-server",
                                                    text: "BGP as a service Server"
                                                },
                                                {
                                                    value: "bgpaas-client",
                                                    text: "BGP as a service Client"
                                                }*/
                                            ]
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            columns : [
                                {
                                    elementId: 'display_name',
                                    view: 'FormInputView',
                                    viewConfig: {
                                        disabled: disableId,
                                        path: 'display_name',
                                        dataBindValue: 'display_name',
                                        label : 'Host Name',
                                        class: 'col-xs-6'
                                    }
                                },
                                {
                                    elementId: 'user_created_vendor',
                                    view: 'FormInputView',
                                    viewConfig: {
                                        disabled : 'disableAttr',
                                        path: 'user_created_vendor',
                                        dataBindValue: 'user_created_vendor',
                                        label : 'Vendor ID',
                                        class: "col-xs-6"
                                    }
                                }
                            ]
                        },
                        {
                            columns : [
                                {
                                    elementId: 'user_created_address',
                                    view: 'FormInputView',
                                    viewConfig: {
                                        placeholder : 'xxx.xxx.xxx.xxx',
                                        path: 'user_created_address',
                                        dataBindValue: 'user_created_address',
                                        label : 'IP Address',
                                        class: "col-xs-6"
                                    }
                                },
                                {
                                    elementId: 'user_created_identifier',
                                    view: 'FormInputView',
                                    viewConfig: {
                                        placeholder : 'xxx.xxx.xxx.xxx',
                                        path: 'user_created_identifier',
                                        dataBindValue: 'user_created_identifier',
                                        label : 'Router ID',
                                        class: "col-xs-6"
                                    }
                                }
                            ]
                        },
                        {
                            columns : [
                                {
                                    elementId:
                                        'user_created_autonomous_system',
                                    view: 'FormInputView',
                                    viewConfig: {
                                        //disabled : 'disableAttr',
                                        placeholder : '1 - 65535',
                                        path:
                                            'user_created_autonomous_system',
                                        dataBindValue:
                                            'user_created_autonomous_system',
                                        label : 'Autonomous System',
                                        class: 'col-xs-6'
                                    }
                                },
                                {
                                    elementId: "local_autonomous_system",
                                    view: "FormInputView",
                                    viewConfig: {
                                       path: "bgp_router_parameters.local_autonomous_system",
                                       placeholder : '1 - 65535',
                                       dataBindValue: "bgp_router_parameters().local_autonomous_system",
                                       label: "BGP Router ASN",
                                       class: "col-xs-6"
                                    }
                                }
                            ]
                        },
                        {
                            columns : [
                               {
                                    elementId: 'user_created_address_family',
                                    view: 'FormMultiselectView',
                                    viewConfig: {
                                        path: 'user_created_address_family',
                                        dataBindValue:
                                            'user_created_address_family',
                                        dataBindOptionList: 'addressFamilyData',
                                        label : 'Address Families',
                                        class: 'col-xs-12',
                                        elementConfig: {
                                             dataTextField: "text",
                                             dataValueField: "value",
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            columns :
                                bgpConfigTemplates.advancedOptions(disableId)
                        },
                        {
                            columns :
                               bgpConfigTemplates.peerSelection(self.model.name())
                        }

                    ]
                }
            };
            return bgpViewConfig

        }
    });

    return bgpEditView;
});

