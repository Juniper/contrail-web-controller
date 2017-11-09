/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/infra/vrouters/ui/js/views/vRouterCfgFormatters'
], function (_, ContrailView, Knockback,VRouterCfgFormatters) {
    var formatVRouterCfg = new VRouterCfgFormatters();
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
        var prefixId = ctwl.CFG_VROUTER_PREFIX_ID,
        ipamPostData = {};
        ipamPostData.data = [];
        ipamPostData.data[0] = {'type':'network-ipams', 'fields':''};
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
                                    class: 'col-xs-4',
                                    dataBindValue: 'name',
                                    disabled: disableOnEdit
                                }
                            },
                            {
                                elementId: 'virtual_router_type',
                                view: "FormDropdownView",
                                viewConfig: {
                                    path : 'virtual_router_type',
                                    class: 'col-xs-4',
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
                                    class: 'col-xs-4',
                                    dataBindValue: 'virtual_router_ip_address'
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                        {
                             elementId: 'virtual_router_network_ipam_refs',
                             view: "FormEditableGridView",
                             viewConfig: {
                                 path : 'network_ipam_refs',
                                 class: 'col-xs-12',
                                 validation:
                                'subnetModelConfigValidations',
                                 collection:
                                     'network_ipam_refs',
                                     templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                                 gridActions:[
                                     {onClick: "function() {\
                                         if (!isVCenter())\
                                             addSubnet();\
                                         }",
                                      buttonTitle: ""}
                                 ],
                                 rowActions: [
                                     {onClick: "function() {\
                                         if (!isVCenter())\
                                             $root.addSubnetByIndex($data, this);\
                                         }",
                                      iconClass: 'fa fa-plus'},
                                     {onClick: "function() {\
                                         if (!isVCenter())\
                                         $root.deleteSubnet($data, this);\
                                        }",
                                      iconClass: 'fa fa-minus'}
                                 ],
                                 columns: [
                                    {
                                        elementId: 'vr_user_created_ipam_fqn',
                                        view: "FormDropdownView",
                                        name: 'IPAM',
                                        viewConfig: {
                                            templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                            path : 'user_created_ipam_fqn',
                                            class: "", width: 220,
                                            disabled: 'disable()',
                                            dataBindValue : 'user_created_ipam_fqn()',
                                            elementConfig : {
                                                placeholder: 'Select IPAM',
                                                dataTextField : "text",
                                                dataValueField : "id",
                                                defaultValueId : 0,
                                                dataSource : {
                                                    type: "remote",
                                                    requestType: 'post',
                                                    url:'/api/tenants/config/get-config-details',
                                                    postData: JSON.stringify(ipamPostData),
                                                    parse: formatVRouterCfg.ipamSubnetDropDownFormatter
                                                }
                                            }
                                        }
                                    },
                                     {
                                      elementId: 'vr_user_created_cidr',
                                      name:
                                        'CIDR',
                                      width:160,
                                      view: "FormInputView",
                                      viewConfig:
                                        {
                                        class: "", width: 160,
                                        disabled: 'disable()',
                                        placeholder: 'xxx.xxx.xxx.xxx/xx',
                                        path: "vr_user_created_cidr",
                                        templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                        dataBindValue:
                                             'vr_user_created_cidr()',
                                        }
                                     },
                                     {
                                      elementId: 'allocation_pools',
                                      name:
                                        'Allocation Pools',
                                      width:200,
                                      view: "FormInputView",
                                      viewConfig:
                                        {
                                         width:200,
                                         disabled: 'alloc_pool_flag()',
                                         placeHolder: 'start-end <enter>...',
                                         templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                         path: "allocation_pools",
                                         dataBindValue:
                                             'allocation_pools()',
                                        }
                                     }
                                 ],
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

