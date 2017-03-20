/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/networking/ipam/ui/js/views/ipamCfgFormatters'],
    function (_, ContrailView, Knockback, IpamCfgFormatters) {
    var formatipamCfg = new IpamCfgFormatters();
    var gridElId = '#' + ctwl.CFG_IPAM_GRID_ID;
    var prefixId = ctwl.CFG_IPAM_PREFIX_ID;
    var modalId = 'configure-' + prefixId;

    var ipamCfgEditView = ContrailView.extend({
        renderAddIpamCfg: function (options) {
            //template has SM references needs to be fixed
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId}),
                self = this;

            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.addEditIpamCfg({
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
            self.renderView4Config($("#" +
                                    modalId).find("#" + prefixId + "-form"),
                                    self.model,
                                    getIpamCfgViewConfig(false),
                                    "ipamCfgConfigValidations", null, null,
                                    function () {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                         false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self,
                    {collection: self.model.model().attributes.tenant_dns_server});
                kbValidation.bind(self,
                        {collection: self.model.model().attributes.user_created_ipam_subnets});
                //permissions
                ctwu.bindPermissionsValidation(self);
                                    }, null, true);
        },

        renderEditIpamCfg: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.addEditIpamCfg({
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
                // TODO: Release binding on successful configure
            }, 'onCancel': function () {
                Knockback.release(self.model,
                                    document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});

            self.renderView4Config($("#" +
                                    modalId).find("#" + prefixId + "-form"),
                                    self.model,
                                    getIpamCfgViewConfig(true),
                                    "ipamCfgConfigValidations", null, null,
                                    function () {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self,
                    {collection: self.model.model().attributes.tenant_dns_server});
                //permissions
                ctwu.bindPermissionsValidation(self);
                                    }, null, true);
        },

        renderMultiDeleteIpamCfg: function(options) {
            var delTemplate =
                //Fix the template to be common delete template
                contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;

            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.multiDeleteIpamCfg(options['checkedRows'], {
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

    function getIpamCfgViewConfig (disableOnEdit) {
        var prefixId = ctwl.CFG_IPAM_PREFIX_ID;
        var ipamCfgViewConfig = {
            elementId: cowu.formatElementId([prefixId,
                                            ctwl.CFG_IPAM_TITLE_CREATE]),
            title: "IPAM",
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        //Change this once AJAX / model is fixed
                        columns: [
                            {
                                elementId: 'name',
                                view: 'FormInputView',
                                viewConfig: {
                                    path: 'name',
                                    class: 'col-xs-12',
                                    dataBindValue: 'name',
                                    disabled: disableOnEdit
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'ipam_subnet_method',
                                view: 'FormRadioButtonView',
                                viewConfig: {
                                    path: 'ipam_subnet_method',
                                    class: 'col-xs-12',
                                    dataBindValue: 'ipam_subnet_method',
                                    disabled: disableOnEdit,
                                    label: 'Subnet Method',
                                    elementConfig: {
                                         dataObj: [{"label": "User Defined",
                                           "value": "user-defined-subnet"},
                                           {"label": "Flat", "value": "flat-subnet"}]
                                    }
                                }
                            }
                        ]
                    },
                    getSubnetViewConfig(),
                    {
                        columns: [
                            {
                                elementId: 'dns_method',
                                view: "FormDropdownView",
                                viewConfig: {
                                    //path : 'network_ipam_mgmt.ipam_dns_method',
                                    path : 'user_created_dns_method',
                                    class: 'col-xs-12',
                                    dataBindValue :
                                        'user_created_dns_method',
                                    label: 'DNS Method',
                                    elementConfig : {
                                        dataTextField : "text",
                                        dataValueField : "id",
                                        placeholder : 'Select DNS Method',
                                        data : [{id: 'default-dns-server',
                                                    text:'Default'},
                                                {id: 'virtual-dns-server',
                                                    text:'Virtual DNS'},
                                                {id: 'tenant-dns-server',
                                                    text:'Tenant'},
                                                {id: 'none', text:'None'}]
                                    }
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'virtual_dns_server_name',
                                view: "FormDropdownView",
                                //visible: "network_ipam_mgmt().ipam_dns_method === 'virtual-dns-server'",
                                viewConfig: {
                                    label: 'Virtual DNS',
                                    visible: "user_created_dns_method() == 'virtual-dns-server'",
                                    path :
                                    'network_ipam_mgmt.ipam_dns_server.virtual_dns_server_name',
                                    class: 'col-xs-12',
                                    dataBindValue :
                                    'network_ipam_mgmt().ipam_dns_server.virtual_dns_server_name',
                                    elementConfig : {
                                        placeholder: 'Select Virtual DNS server',
                                        dataTextField : "text",
                                        dataValueField : "id",
                                        dataSource : {
                                            type: 'remote',
                                            url:
                                            'api/tenants/config/virtual-DNSs',
                                            parse:
                                            formatipamCfg.dnsDropDownFormatter
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    {
                        columns: [{
                             elementId : 'tenantDNSIPSection',
                             view: "SectionView",
                             viewConfig : {
                                visible: "user_created_dns_method() == 'tenant-dns-server'",
                                 rows : [
                                     {
                                         columns : [
                                             {
                                                 elementId: 'tenant_dns_server',
                                                 view: "FormEditableGridView",
                                                 viewConfig: {
                                                     path : 'tenant_dns_server',
                                                     validation:
                                                    'ipamTenantDNSConfigValidations',
                                                    templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                                                     collection:
                                                         'tenant_dns_server',
                                                     columns: [
                                                         {
                                                          elementId: 'ip_addr',
                                                          name:
                                                            'Tenant DNS Server IPs',
                                                          view: "FormInputView",
                                                          class: "",
                                                          viewConfig:
                                                            {
                                                             templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                             width: 200,
                                                             path: "ip_addr",
                                                             dataBindValue: 'ip_addr()',
                                                            }
                                                         },
                                                     ],
                                                     rowActions: [
                                                         {onClick: "function() {\
                                                             $root.addTenantDNSByIndex($data, this);\
                                                             }",
                                                             iconClass: 'fa fa-plus'},
                                                         {onClick: "function() {\
                                                             $root.deleteTenantDNS($data, this);\
                                                            }",
                                                          iconClass: 'fa fa-minus'}
                                                     ],
                                                     gridActions: [
                                                         {onClick: "function() {\
                                                             addTenantDNS();\
                                                             }",
                                                          buttonTitle: ""}
                                                     ]
                                                 }
                                             }
                                         ]
                                     }
                                 ]
                             }
                        }
                    ]
                },
                {
                    columns: [
                        {
                            elementId: 'ntp_server',
                            view: 'FormInputView',
                            viewConfig: {
                                label: 'NTP Server IP',
                                path : 'user_created.ntp_server',
                                class: 'col-xs-12',
                                dataBindValue : 'user_created().ntp_server',
                                placeholder: 'Enter NTP Server IP'
                           }
                        }
                    ]
                },
                {
                    columns: [
                        {
                            elementId: 'domainName',
                            view: 'FormInputView',
                            //visible: "network_ipam_mgmt().ipam_dns_method != 'virtual-dns-server'",
                            viewConfig: {
                                label:'Domain Name',
                                path : 'user_created.domain_name',
                                visible: "user_created_dns_method() != 'virtual-dns-server'",
                                class: 'col-xs-12',
                                dataBindValue : 'user_created().domain_name',
                                placeholder: 'Enter domain name'
                           }
                        }
                    ]
                }
                ]  // End Rows
            }
        }
        return ipamCfgViewConfig;
    }

    function getSubnetViewConfig () {
        var subnetViewConfig = {
                columns: [{
                    elementId: 'ipamsubnets',
                    view: "AccordianView",
                    viewConfig: [{
                        visible: 'ipam_subnet_method() == "flat-subnet"',
                        elementId: 'subnet_vcfg',
                        title: 'Subnets',
                        view: "SectionView",
                        viewConfig: {
                            rows: [{
                                columns: [{
                                    elementId: 'user_created_ipam_subnets',
                                    view: "FormEditableGridView",
                                    viewConfig: {
                                         path : 'user_created_ipam_subnets',
                                         class: 'col-xs-12',
                                         validation:
                                             'subnetModelConfigValidations',
                                         collection:
                                             'user_created_ipam_subnets',
                                         templateId:
                                             cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                                         gridActions: [{
                                             onClick: "function() {\
                                                 if (!isVCenter())\
                                                     addSubnet();\
                                                 }",
                                              buttonTitle: ""
                                          }],
                                          rowActions: [{
                                              onClick: "function() {\
                                                  if (!isVCenter())\
                                                      $root.addSubnetByIndex($data, this);\
                                                  }",
                                              iconClass: 'fa fa-plus'
                                              }, {
                                              onClick: "function() {\
                                                  if (!isVCenter())\
                                                      $root.deleteSubnet($data, this);\
                                                  }",
                                              iconClass: 'fa fa-minus'
                                           }],
                                           columns: [
                                               {
                                                elementId: 'user_created_cidr',
                                                name:
                                                  'CIDR',
                                                width:160,
                                                view: "FormInputView",
                                                viewConfig:
                                                  {
                                                  class: "", width: 160,
                                                  disabled: 'disable()',
                                                  placeholder: 'xxx.xxx.xxx.xxx/xx',
                                                  path: "user_created_cidr",
                                                  templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                  dataBindValue:
                                                       'user_created_cidr()',
                                                  }
                                               },
                                               {
                                                elementId: 'allocation_pools',
                                                name:
                                                  'Allocation Pools',
                                                width:160,
                                                view: "FormTextAreaView",
                                                viewConfig:
                                                  {
                                                   class: "", width: 160,
                                                   placeHolder: 'start-end <enter>...',
                                                   disabled: 'disable()',
                                                   templateId: cowc.TMPL_EDITABLE_GRID_TEXTAREA_VIEW,
                                                   path: "allocation_pools",
                                                   dataBindValue:
                                                       'allocation_pools()',
                                                  }
                                               },
                                               {
                                                elementId: 'user_created_enable_gateway',
                                                name:
                                                  '',
                                                width:50,
                                                view: "FormCheckboxView",
                                                viewConfig:
                                                  {
                                                  disabled: 'disable()',
                                                  path: "user_created_enable_gateway",
                                                  width: 50,
                                                  templateId: cowc.TMPL_EDITABLE_GRID_CHECKBOX_VIEW,
                                                  label: "",
                                                  dataBindValue:
                                                       'user_created_enable_gateway()',
                                                  elementConfig : {
                                                       isChecked:true
                                                       }
                                                  }
                                               },
                                               {
                                                elementId: 'default_gateway',
                                                name:
                                                  'Gateway',
                                                width:160,
                                                view: "FormInputView",
                                                viewConfig:
                                                  {
                                                   class: "", width: 160,
                                                   disabled: 'disable()',
                                                   placeholder: 'xxx.xxx.xxx.xxx',
                                                   path: "default_gateway",
                                                   templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                   dataBindValue:
                                                       'default_gateway()',
                                                  }
                                               },
                                               /*{
                                                elementId: 'user_created_enable_dns',
                                                name:
                                                  'DNS',
                                                view: "FormCheckboxView",
                                                viewConfig:
                                                  {
                                                   disabled: 'disable()',
                                                   path: "user_created_enable_dns",
                                                   width: 50,
                                                   label: "",
                                                  templateId: cowc.TMPL_EDITABLE_GRID_CHECKBOX_VIEW,
                                                   dataBindValue:
                                                       'user_created_enable_dns()',
                                                   elementConfig : {
                                                       isChecked:true
                                                       }
                                                  }
                                               },*/
                                               {
                                                elementId: 'enable_dhcp',
                                                name:
                                                  'DHCP',
                                                view: "FormCheckboxView",
                                                viewConfig:
                                                  {
                                                   disabled: 'disable()',
                                                   path: "enable_dhcp",
                                                   width: 50,
                                                   label: "",
                                                  templateId: cowc.TMPL_EDITABLE_GRID_CHECKBOX_VIEW,
                                                   dataBindValue:
                                                       'enable_dhcp()',
                                                   elementConfig : {
                                                       isChecked:true
                                                       }
                                                  }
                                               }]
                                           }
                                       }]
                                   }]
                              }
                          }]
                      }]
                };
        return subnetViewConfig;
    }

    return ipamCfgEditView;
});
