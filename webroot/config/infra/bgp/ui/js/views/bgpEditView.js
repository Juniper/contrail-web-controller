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

            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
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
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.getASN(options);
        },
        getASN : function(options){
            var ajaxConfig = {
                url : ctwc.get(ctwc.URL_GET_ASN),
                type : 'GET'
            };
            contrail.ajaxHandler(ajaxConfig, null,
                function(result) {
                    if(result != null &&
                        result['global-system-config'] != null) {
                        var ggasn = result['global-system-config'];
                        self.model.bgp_router_parameters().autonomous_system =
                            ggasn['autonomous_system'];
                        self.model.isAutoMeshEnabled(
                            ggasn['ibgp_auto_mesh'] == null ? true :
                            ggasn['ibgp_auto_mesh']);
                    }
                    self.bgpRenderView4Config(options);
                },
                function(error) {
                }
            );
        },
        bgpRenderView4Config : function(options) {
            var disableFlag =
                (options.mode === ctwl.CREATE_ACTION) ?  false : true;
            self.renderView4Config($("#" + modalId).find("#" + prefixId + "-form"),
                                   self.model,
                                   self.getBGPViewConfig(disableFlag),
                                   "configureValidations", null, null,
                                   function () {

                    self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                             false);
                    Knockback.applyBindings(self.model,
                        document.getElementById(modalId));
                    kbValidation.bind(self);
                                   });
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
                title: ctwl.TITLE_ADD_BGP,
                view: "SectionView",
                viewConfig :{
                    rows : [
                        {
                            columns : [
                                {
                                    elementId: 'name',
                                    view: 'FormInputView',
                                    viewConfig: {
                                        disabled: disableId,
                                        path: 'name',
                                        dataBindValue: 'name',
                                        label : 'Hostname',
                                        class: 'span6'
                                    }
                                },
                                {
                                    elementId: 'bgp_router_parameters_vendor',
                                    view: 'FormInputView',
                                    viewConfig: {
                                        disabled : 'disableAttr',
                                        path: 'user_created_vendor',
                                        dataBindValue: 'user_created_vendor',
                                        label : 'Vendor ID',
                                        class: "span6"
                                    }
                                }
                            ]
                        },
                        {
                            columns : [
                                {
                                    elementId: 'router_type',
                                    view: 'FormRadioButtonView',
                                    viewConfig: {
                                        label : 'Router Type',
                                        path: 'user_created_role',
                                        dataBindValue:'user_created_role',
                                        class: 'span12',
                                        elementConfig: {
                                            dataObj : [
                                                {
                                                  label : 'Control Node',
                                                  value : 'control_node'
                                                },
                                                {
                                                  label : 'BGP Router',
                                                  value : 'bgp_router'
                                                }
                                            ]
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            columns : [
                                {
                                    elementId: 'bgp_router_parameters_address',
                                    view: 'FormInputView',
                                    viewConfig: {
                                        placeholder : 'xxx.xxx.xxx.xxx',
                                        path: 'user_created_address',
                                        dataBindValue: 'user_created_address',
                                        label : 'IP Address',
                                        class: "span6"
                                    }
                                },
                                {
                                    elementId: 'bgp_router_parameters_identifier',
                                    view: 'FormInputView',
                                    viewConfig: {
                                        placeholder : 'xxx.xxx.xxx.xxx',
                                        path: 'user_created_identifier',
                                        dataBindValue: 'user_created_identifier',
                                        label : 'Router ID',
                                        class: "span6"
                                    }
                                }
                            ]
                        },
                        {
                            columns : [
                                {
                                    elementId:
                                        'bgp_router_parameters_autonomous_system',
                                    view: 'FormInputView',
                                    viewConfig: {
                                        disabled : 'disableAttr',
                                        placeholder : '1 - 65535',
                                        path:
                                            'bgp_router_parameters.autonomous_system',
                                        dataBindValue:
                                            'bgp_router_parameters().autonomous_system',
                                        label : 'Autonomous System',
                                        class: 'span6'
                                    }
                                },
                                {
                                    elementId: 'address_families_family',
                                    view: 'FormMultiselectView',
                                    viewConfig: {
                                        disabled : 'disableAttr',
                                        path: 'user_created_address_family',
                                        dataBindValue:
                                            'user_created_address_family',
                                        dataBindOptionList: 'addressFamilyData',
                                        label : 'Address Families',
                                        class: 'span6',
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
                               bgpConfigTemplates.peerSelection()
                        }

                    ]
                }
            };
            return bgpViewConfig

        }
    });

    return bgpEditView;
});

