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

            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
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
                kbValidation.bind(self);
                                    });
        },

        renderEditIpamCfg: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
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
                kbValidation.bind(self);
                                    });
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
            title: ctwl.CFG_IPAM_TITLE_CREATE,
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
                                    class: 'span12',
                                    dataBindValue: 'name',
                                    disabled: disableOnEdit
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'dns_method',
                                view: "FormDropdownView",
                                label: 'DNS Method',
                                viewConfig: {
                                    //path : 'network_ipam_mgmt.ipam_dns_method',
                                    path : 'user_created_dns_method',
                                    class: 'span12',
                                    dataBindValue :
                                        'user_created_dns_method',
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
                                label: 'Virtual DNS',
                                //visible: "network_ipam_mgmt().ipam_dns_method === 'virtual-dns-server'",
                                visible: "user_created_dns_method() == 'virtual-dns-server'",
                                viewConfig: {
                                    path :
                                    'network_ipam_mgmt.ipam_dns_server.virtual_dns_server_name',
                                    class: 'span12',
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
                             //visible: "network_ipam_mgmt().ipam_dns_method === 'tenant-dns-server'",
                             visible: "user_created_dns_method() == 'tenant-dns-server'",
                             viewConfig : {
                                 rows : [
                                     {
                                         columns : [
                                             {
                                                 elementId: 'tenantDNSServer',
                                                 view: "FormEditableGridView",
                                                 viewConfig: {
                                                     path : 'tenant_dns_server',
                                                     validations:
                                                    'ipamTenantDNSConfigValidations',
                                                     //path : 'network_ipam_mgmt.ipam_dns_server.tenant_dns_server_address.ip_address',
                                                     //collection: 'network_ipam_mgmt().ipam_dns_server.tenant_dns_server_address.ip_address',
                                                     collection:
                                                         'tenant_dns_server',
                                                     columns: [
                                                         {
                                                          elementId: 'ip_addr',
                                                          name:
                                                            'Tenant DNS Server IPs',
                                                          view: "GridInputView",
                                                          class: "", width: 200,
                                                          viewConfig:
                                                            {
                                                             path: "ip_addr",
                                                             dataBindValue:
                                                                 'ip_addr()',
                                                            }
                                                         },
                                                     ],
                                                     rowActions: [
                                                         {onClick: "function() {\
                                                             $root.deleteTenantDNS($data, this);\
                                                            }",
                                                          iconClass: 'icon-minus'}
                                                     ],
                                                     gridActions: [
                                                         {onClick: "function() {\
                                                             addTenantDNS();\
                                                             }",
                                                          buttonTitle: "Add"}
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
                            elementId: 'ntpServer',
                            view: 'FormInputView',
                            label: 'NTP Server IP',
                            viewConfig: {
                                path : 'user_created.ntp_server',
                                class: 'span12',
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
                            label:'Domain Name',
                            //visible: "network_ipam_mgmt().ipam_dns_method != 'virtual-dns-server'",
                            visible: "user_created_dns_method() != 'virtual-dns-server'",
                            viewConfig: {
                                path : 'user_created.domain_name',
                                visible: "user_created_dns_method() != 'virtual-dns-server'",
                                class: 'span12',
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

    return ipamCfgEditView;
});
