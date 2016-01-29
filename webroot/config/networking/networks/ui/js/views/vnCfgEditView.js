/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/networking/networks/ui/js/views/vnCfgFormatters'],
    function (_, ContrailView, Knockback, VNCfgFormatters) {
    var formatVNCfg = new VNCfgFormatters();
    var gridElId = '#' + ctwl.CFG_VN_GRID_ID;
    var prefixId = ctwl.CFG_VN_PREFIX_ID;
    var modalId = 'configure-' + prefixId;

    var vnCfgEditView = ContrailView.extend({
        renderAddVNCfg: function (options) {
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId}),
                self = this;

            cowu.createModal({'modalId': modalId, 'className': 'modal-980',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.addEditVNCfg({
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
                                    getVNCfgViewConfig(false),
                                    "vnCfgConfigValidations", null, null,
                                    function () {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                         false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self,
                    {collection: self.model.model().attributes.network_ipam_refs});
                kbValidation.bind(self,
                    {collection: self.model.model().attributes.floating_ip_pools});
                kbValidation.bind(self,
                    {collection: self.model.model().attributes.user_created_host_routes});
                kbValidation.bind(self,
                    {collection: self.model.model().attributes.user_created_dns_servers});
                kbValidation.bind(self,
                    {collection: self.model.model().attributes.user_created_route_targets});
                                    });
        },

        renderEditVNCfg: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-980',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.addEditVNCfg({
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
                                    getVNCfgViewConfig(true),
                                    "vnCfgConfigValidations", null, null,
                                    function () {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                //kbValidation.bind(self);
                kbValidation.bind(self,
                    {collection: self.model.model().attributes.network_ipam_refs});
                kbValidation.bind(self,
                    {collection: self.model.model().attributes.floating_ip_pools});
                kbValidation.bind(self,
                    {collection: self.model.model().attributes.user_created_host_routes});
                kbValidation.bind(self,
                    {collection: self.model.model().attributes.user_created_dns_servers});
                kbValidation.bind(self,
                    {collection: self.model.model().attributes.user_created_route_targets});

                                    });
        },

        renderMultiDeleteVNCfg: function(options) {
            var delTemplate =
                //Fix the template to be common delete template
                contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;

            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.multiDeleteVNCfg(options['checkedRows'], {
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

    function getVNCfgViewConfig (disableOnEdit) {
        var prefixId = ctwl.CFG_VN_PREFIX_ID;
        var vnCfgViewConfig = {
            elementId: cowu.formatElementId([prefixId,
                                            ctwl.CFG_VN_TITLE_CREATE]),
            title: ctwl.CFG_VN_TITLE_CREATE,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'display_name',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Name',
                                    path: 'display_name',
                                    class: 'span6',
                                    dataBindValue: 'display_name',
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'pVlanId',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Primary VLAN',
                                    path: 'pVlanId',
                                    class: 'span6',
                                    dataBindValue: 'pVlanId',
                                    visible: '(isVCenter()) && disable() == false',
                                }
                            },
                            {
                                elementId: 'sVlanId',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Secondary VLAN',
                                    path: 'sVlanId',
                                    class: 'span6',
                                    dataBindValue: 'sVlanId',
                                    visible: '(isVCenter()) && disable() == false',
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'network_policy_refs',
                                view: 'FormMultiselectView',
                                viewConfig: {
                                    label: 'Network Policy(s)',
                                    path: 'network_policy_refs',
                                    class: 'span6',
                                    dataBindValue: 'network_policy_refs',
                                    elementConfig: {
                                        placeholder: 'Select Network Policies',
                                        dataTextField: "text",
                                        dataValueField: "id",
                                        dataSource : {
                                            type: 'remote',
                                            url:
                                            '/api/tenants/config/policys',
                                            parse:
                                            formatVNCfg.polMSFormatter,
                                    }
                                }
                            }
                        }
                        ]
                    },
                    {
                    columns: [
                        {
                        elementId: 'subnets',
                        view: "AccordianView",
                        viewConfig: [
                            {
                            elementId: 'subnet_vcfg',
                            title: 'Subnets',
                            view: "SectionView",
                            viewConfig: {
                                    rows: [
                                    {
                                        columns: [
                                        {
                                             elementId: 'network_ipam_refs',
                                             view: "FormEditableGridView",
                                             viewConfig: {
                                                 path : 'network_ipam_refs',
                                                 validation:
                                                'subnetModelConfigValidations',
                                                 collection:
                                                     'network_ipam_refs',
                                                 columns: [
                                                    {
                                                        elementId: 'user_created_ipam_fqn',
                                                        view: "FormDropdownView",
                                                        name: 'IPAM',
                                                        viewConfig: {
                                                            templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                            path : 'user_created_ipam_fqn',
                                                            class: "", width: 160,
                                                            disabled: 'disable()',
                                                            dataBindValue : 'user_created_ipam_fqn()',
                                                            elementConfig : {
                                                                placeholder: 'Select IPAM',
                                                                dataTextField : "text",
                                                                dataValueField : "id",
                                                                defaultValueId : 0,
                                                                dataSource : {
                                                                    type: 'remote',
                                                                    url: '/api/tenants/config/ipams',
                                                                    parse: formatVNCfg.ipamDropDownFormatter
                                                                }
                                                            }
                                                        }
                                                    },
                                                     {
                                                      elementId: 'user_created_cidr',
                                                      name:
                                                        'CIDR',
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
                                                     {
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
                                                     },
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
                                                     },
                                                 ],
                                                 rowActions: [
                                                     {onClick: "function() {\
                                                         if (!isVCenter())\
                                                         $root.deleteSubnet($data, this);\
                                                        }",
                                                      iconClass: 'icon-minus'}
                                                 ],
                                                 gridActions: [
                                                     {onClick: "function() {\
                                                         if (!isVCenter())\
                                                             addSubnet();\
                                                         }",
                                                      buttonTitle: "Subnet"}
                                                 ]
                                             }
                                         }
                                        ]
                                    },
                                    ]
                                }
                            }]
                        }]
                    },
                    {
                    columns: [
                        {
                        elementId: 'host_routes',
                        view: "AccordianView",
                        viewConfig: [
                            {
                            elementId: 'hostRoutes',
                            title: 'Host Route(s)',
                            view: "SectionView",
                            viewConfig: {
                                    rows: [
                                    {
                                        columns: [
                                        {
                                             elementId: 'user_created_host_routes',
                                             view: "FormEditableGridView",
                                             viewConfig: {
                                                 path : 'user_created_host_routes',
                                                 validation:
                                                'hostRouteModelConfigValidations',
                                                 collection:
                                                     'user_created_host_routes',
                                                 columns: [
                                                     {
                                                      elementId: 'prefix',
                                                      name:
                                                        'Route Prefix',
                                                      view: "FormInputView",
                                                      viewConfig:
                                                        {
                                                         class: "", width: 250,
                                                         placeholder: 'Prefix',
                                                         templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                         path: "prefix",
                                                         dataBindValue:
                                                             'prefix()',
                                                        }
                                                     },
                                                     {
                                                      elementId: 'next_hop',
                                                      name:
                                                        'Next Hop',
                                                      view: "FormInputView",
                                                      viewConfig:
                                                        {
                                                         class: "", width: 250,
                                                         placeholder: 'Next Hop',
                                                         path: "next_hop",
                                                         templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                         dataBindValue:
                                                             'next_hop()',
                                                        }
                                                     },
                                                 ],
                                                 rowActions: [
                                                     {onClick: "function() {\
                                                         $root.deleteHostRoute($data, this);\
                                                        }",
                                                      iconClass: 'icon-minus'}
                                                 ],
                                                 gridActions: [
                                                     {onClick: "function() {\
                                                         addHostRoute();\
                                                         }",
                                                      buttonTitle: "Host Route"}
                                                 ]
                                             }
                                         }
                                        ]
                                    },
                                    ]
                                }
                            }]
                        }]
                    },
                    {
                    columns: [
                        {
                        elementId: 'advanced_options',
                        view: "AccordianView",
                        viewConfig: [
                            {
                            elementId: 'advanced',
                            title: 'Advanced Options',
                            view: "SectionView",
                            viewConfig: {
                                    rows: [
                                    {
                                        columns: [
                                        {
                                            elementId: 'admin_state',
                                            view: "FormDropdownView",
                                            viewConfig: {
                                                label: 'Admin State',
                                                path : 'id_perms.enable',
                                                class: 'span6',
                                                dataBindValue :
                                                    'id_perms().enable',
                                                elementConfig : {
                                                    dataTextField : "text",
                                                    dataValueField : "id",
                                                    placeholder : 'Select Admin State',
                                                    data : [{id: 'true', text:'Up'},
                                                            {id: 'false', text:'Down'}]
                                                }
                                            }
                                        },
                                        {
                                            elementId: 'external_ipam',
                                            view: "FormCheckboxView",
                                            viewConfig : {
                                                path : 'external_ipam',
                                                class : "span6",
                                                label:'Static IP Addressing',
                                                dataBindValue : 'external_ipam',
                                                visible : 'isVCenter()',
                                                elementConfig : {
                                                    isChecked:false
                                                }
                                            }
                                        },
                                        ]
                                    },
                                    {
                                        columns: [
                                        {
                                            elementId: 'is_shared',
                                            view: "FormCheckboxView",
                                            viewConfig : {
                                                path : 'is_shared',
                                                class : "span6",
                                                label:'Shared',
                                                dataBindValue : 'is_shared',
                                                elementConfig : {
                                                    isChecked:false
                                                }
                                            }
                                        },
                                        {
                                            elementId: 'router_external',
                                            view: "FormCheckboxView",
                                            viewConfig : {
                                                path : 'router_external',
                                                class : "span6",
                                                label:'External',
                                                dataBindValue : 'router_external',
                                                elementConfig : {
                                                    isChecked:false
                                                }
                                            }
                                        },
                                        ]
                                    },
                                    {
                                        columns: [
                                        {
                                            elementId: 'allow_transit',
                                            view: "FormCheckboxView",
                                            viewConfig : {
                                                path : 'virtual_network_properties.allow_transit',
                                                class : "span6",
                                                label:'Allow Transit',
                                                dataBindValue : 'virtual_network_properties().allow_transit',
                                                elementConfig : {
                                                    isChecked:false
                                                }
                                            }
                                        },
                                        {
                                            elementId: 'flood_unknown_unicast',
                                            view: "FormCheckboxView",
                                            viewConfig : {
                                                path : 'flood_unknown_unicast',
                                                class : "span6",
                                                label:'Flood Unknown Unicast',
                                                dataBindValue : 'flood_unknown_unicast',
                                                elementConfig : {
                                                    isChecked:false
                                                }
                                            }
                                        },
                                        ]
                                    },
                                    {
                                        columns: [
                                        {
                                            elementId: 'rpf',
                                            view: "FormCheckboxView",
                                            viewConfig : {
                                                path : 'virtual_network_properties.rpf',
                                                class : "span6",
                                                label:'Reverse Path Forwarding',
                                                dataBindValue : 'virtual_network_properties().rpf',
                                                elementConfig : {
                                                    isChecked:false
                                                }
                                            }
                                        },
                                        {
                                            elementId: 'multi_policy_service_chains_enabled',
                                            view: "FormCheckboxView",
                                            viewConfig : {
                                                path : 'multi_policy_service_chains_enabled',
                                                class : "span6",
                                                label:'Multiple Service Chains',
                                                dataBindValue : 'multi_policy_service_chains_enabled',
                                                elementConfig : {
                                                    isChecked:false
                                                }
                                            }
                                        },
                                        ]
                                    },
                                    {
                                        columns: [
                                        {
                                            elementId: 'forwarding_mode',
                                            view: "FormDropdownView",
                                            viewConfig: {
                                                label: 'Forwarding Mode',
                                                path : 'virtual_network_properties.forwarding_mode',
                                                class: 'span6',
                                                dataBindValue :
                                                    'virtual_network_properties().forwarding_mode',
                                                elementConfig : {
                                                    dataTextField : "text",
                                                    dataValueField : "id",
                                                    placeholder : 'Select Forwarding Mode',
                                                    data : [{id: 'default', text:'Default'},
                                                            {id: 'l2_l3', text:'L2 and L3'},
                                                            {id: 'l3', text:'L3 Only'},
                                                            {id: 'l2', text:'L2 Only'}]
                                                }
                                            }
                                        },
                                        {
                                            elementId: 'vxlan_network_identifier',
                                            view: 'FormInputView',
                                            viewConfig: {
                                                label: 'VxLAN Identifier',
                                                path: 'virtual_network_properties.vxlan_network_identifier',
                                                class: 'span6',
                                                dataBindValue: 'virtual_network_properties().vxlan_network_identifier',
                                                disabled: function () {
                                                    var vxMode =
                                                        (!(getValueByJsonPath(window.globalObj,
                                                        'global-vrouter-config;global-vrouter-config;vxlan_network_identifier_mode',
                                                        'automatic') == 'configured'));
                                                    return vxMode;

                                                }
                                            }
                                        }
                                        ]
                                    },
                                    {
                                        columns: [
                                            {
                                                elementId: 'physical_router_back_refs',
                                                view: 'FormMultiselectView',
                                                viewConfig: {
                                                    label: 'Extend to Physical Router(s)',
                                                    path: 'physical_router_back_refs',
                                                    class: 'span6',
                                                    dataBindValue: 'physical_router_back_refs',
                                                    elementConfig: {
                                                        dataTextField: "text",
                                                        dataValueField: "id",
                                                        dataSource : {
                                                            type: 'remote',
                                                            url:
                                                            '/api/tenants/config/physical-routers-list',
                                                            parse:
                                                            formatVNCfg.phyRouterMSFormatter,
                                                    }
                                                }
                                            }
                                        },
                                        {
                                                elementId: 'route_table_refs',
                                                view: 'FormMultiselectView',
                                                viewConfig: {
                                                    label: 'Static Route(s)',
                                                    path: 'route_table_refs',
                                                    class: 'span6',
                                                    dataBindValue: 'route_table_refs',
                                                    elementConfig: {
                                                        dataTextField: "text",
                                                        dataValueField: "id",
                                                        dataSource : {
                                                            type: 'remote',
                                                            requestType: 'POST',
                                                            postData: JSON.stringify({'data':
                                                                [{'type':'route-tables'}]}),
                                                            url:
                                                            '/api/tenants/config/get-config-list',
                                                            parse:
                                                            formatVNCfg.staticRouteMSFormatter,
                                                    }
                                                }
                                            }
                                        },
                                        ]
                                    },
                                    {
                                        columns: [
                                        {
                                                elementId: 'ecmp_hashing_include_fields',
                                                view: 'FormMultiselectView',
                                                viewConfig: {
                                                    label: 'ECMP Hashing Fields',
                                                    path: 'ecmp_hashing_include_fields',
                                                    class: 'span12',
                                                    dataBindValue: 'ecmp_hashing_include_fields',
                                                    elementConfig: {
                                                        dataTextField: "text",
                                                        dataValueField: "id",
                                                        data: [
                                                            {text: 'source-mac',
                                                             id: 'source_mac'},
                                                            {text: 'destination-mac',
                                                             id: 'destination_mac'},
                                                            {text: 'source-ip',
                                                             id: 'source_ip'},
                                                            {text: 'destination-ip',
                                                             id: 'destination_ip'},
                                                            {text: 'ip-protocol',
                                                             id: 'ip_protocol'},
                                                            {text: 'source-port',
                                                             id: 'source_port'},
                                                            {text: 'destination-port',
                                                             id: 'destination_port'}
                                                        ]
                                                }
                                            }
                                        }
                                        ]
                                    },
                                    {
                                        columns: [
                                            {
                                                elementId: 'user_created_sriov_enabled',
                                                view: 'FormCheckboxView',
                                                viewConfig: {
                                                    label: 'SRIOV',
                                                    path: 'user_created_sriov_enabled',
                                                    class: 'span2',
                                                    dataBindValue: 'user_created_sriov_enabled',
                                                    elementConfig: {
                                                        isChecked: false
                                                }
                                            }
                                        },
                                        ]
                                    },
                                    {
                                        columns: [
                                        {
                                            elementId: 'physical_network',
                                            view: 'FormInputView',
                                            viewConfig: {
                                                placeholder: 'Network Name',
                                                label: 'Physical Network',
                                                path: 'provider_properties.physical_network',
                                                class: 'span6',
                                                dataBindValue: 'provider_properties().physical_network',
                                                visible: 'user_created_sriov_enabled()',
                                            }
                                        },
                                        {
                                            elementId: 'segmentation_id',
                                            view: 'FormInputView',
                                            viewConfig: {
                                                placeholder: '1 - 4094',
                                                label: 'VLAN',
                                                path: 'provider_properties.segmentation_id',
                                                class: 'span6',
                                                dataBindValue: 'provider_properties().segmentation_id',
                                                visible: 'user_created_sriov_enabled()',
                                            }
                                        },
                                        ]
                                    },
                                    ]
                                }
                            }]
                        }]
                    },
                    {
                    columns: [
                        {
                        elementId: 'dns_servers',
                        view: "AccordianView",
                        viewConfig: [
                            {
                            elementId: 'dnsServers',
                            title: 'DNS Servers',
                            view: "SectionView",
                            viewConfig: {
                                    rows: [
                                    {
                                        columns: [
                                        {
                                            elementId: 'user_created_dns_servers',
                                             view: "FormEditableGridView",
                                             viewConfig: {
                                                 path : 'user_created_dns_servers',
                                                 validation:
                                                'subnetDNSModelConfigValidations',
                                                 collection:
                                                     'user_created_dns_servers',
                                                 columns: [
                                                     {
                                                      elementId: 'ip_address',
                                                      name:
                                                        'DNS IPs',
                                                      view: "FormInputView",
                                                      viewConfig:
                                                        {
                                                         width: 400,
                                                         placeholder: 'Enter space separated IP addresses',
                                                         templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                         path: "ip_address",
                                                         dataBindValue:
                                                             'ip_address()',
                                                        }
                                                     },
                                                 ],
                                                 rowActions: [
                                                    {onClick: "function() {\
                                                         $root.deleteSubnetDNS($data, this);\
                                                        }",
                                                      iconClass: 'icon-minus'
                                                    }
                                                 ],
                                                 gridActions: [
                                                    {onClick: "function() {\
                                                         addSubnetDNS();\
                                                         }",
                                                      buttonTitle: "DNS Server"
                                                    }
                                                 ]
                                             }
                                         }
                                        ]
                                    },
                                    ]
                                }
                            }]
                        }]
                    },
                    {
                    columns: [
                        {
                        elementId: 'fip_pool_accordian',
                        view: "AccordianView",
                        viewConfig: [
                            {
                            elementId: 'fip_pool_vcfg',
                            title: 'Floating IP Pool(s)',
                            view: "SectionView",
                            viewConfig: {
                                    rows: [
                                    {
                                        columns: [
                                        {
                                             elementId: 'floating_ip_pools',
                                             view: "FormEditableGridView",
                                             viewConfig: {
                                                 path : 'floating_ip_pools',
                                                 validation:
                                                'fipPoolModelConfigValidations',
                                                 collection:
                                                     'floating_ip_pools',
                                                 columns: [
                                                    {
                                                      elementId: 'name',
                                                      name:
                                                        'Pool Name',
                                                      view: "FormInputView",
                                                      viewConfig:
                                                        {
                                                         placeholder: 'Enter Pool Name',
                                                         class: "", width: 400,
                                                         templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                         path: "name",
                                                         disabled: 'disable()',
                                                         dataBindValue:
                                                             'name()',
                                                        }
                                                    },
                                                    {
                                                        elementId: 'projects',
                                                        name: 'Projects',
                                                        view: 'FormMultiselectView',
                                                        viewConfig: {
                                                            path: 'projects',
                                                            class: 'span6',
                                                            dataBindValue: 'projects()',
                                                            templateId: cowc.TMPL_EDITABLE_GRID_MULTISELECT_VIEW,
                                                            class: "", width: 400,
                                                            disabled: 'disable()',
                                                            elementConfig: {
                                                                dataTextField: "text",
                                                                dataValueField: "id",
                                                                dataSource : {
                                                                    type: 'remote',
                                                                    url:
                                                                    '/api/tenants/config/projects',
                                                                    parse:
                                                                    formatVNCfg.allProjMSFormatter,
                                                                }
                                                            }
                                                        }
                                                    }
                                                ],
                                                 rowActions: [
                                                     {onClick: "function() {\
                                                         $root.deleteFipPool($data, this);\
                                                        }",
                                                      iconClass: 'icon-minus'}
                                                 ],
                                                 gridActions: [
                                                     {onClick: "function() {\
                                                         addFipPool();\
                                                         }",
                                                      buttonTitle: "Floating IP Pool"}
                                                 ]
                                             }
                                         }
                                        ]
                                    },
                                    ]
                                }
                            }]
                        }]
                    },
                    {
                    columns: [
                        {
                        elementId: 'route_target_accordian',
                        view: "AccordianView",
                        viewConfig: [
                            {
                            elementId: 'route_target_vcfg',
                            title: 'Route Target(s)',
                            view: "SectionView",
                            viewConfig: {
                                    rows: [
                                    {
                                        columns: [
                                        {
                                             elementId: 'user_created_route_targets',
                                             view: "FormEditableGridView",
                                             viewConfig: {
                                                 path : 'user_created_route_targets',
                                                 validation:
                                                'routeTargetModelConfigValidations',
                                                 collection:
                                                     'user_created_route_targets',
                                                 columns: [
                                                     {
                                                      elementId: 'asn',
                                                      name:
                                                        'ASN',
                                                      view: "FormInputView",
                                                      viewConfig:
                                                        {
                                                         class: "", width: 400,
                                                         placeholder: 'ASN 1-65534 or IP',
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
                                                         placeholder: 'Target 1-4294967295',
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
                                                         $root.deleteRouteTarget($data, this);\
                                                        }",
                                                      iconClass: 'icon-minus'}
                                                 ],
                                                 gridActions: [
                                                     {onClick: "function() {\
                                                         addRouteTarget('user_created_route_targets');\
                                                         }",
                                                      buttonTitle: "Route Target"}
                                                 ]
                                             }
                                         }
                                        ]
                                    },
                                    ]
                                }
                            }]
                        }]
                    },
                    {
                    columns: [
                        {
                        elementId: 'export_route_target_accordian',
                        view: "AccordianView",
                        viewConfig: [
                            {
                            elementId: 'export_route_target_vcfg',
                            title: 'Export Route Target(s)',
                            view: "SectionView",
                            viewConfig: {
                                    rows: [
                                    {
                                        columns: [
                                        {
                                             elementId: 'user_created_export_route_targets',
                                             view: "FormEditableGridView",
                                             viewConfig: {
                                                 path : 'user_created_export_route_targets',
                                                 validation:
                                                'routeTargetModelConfigValidations',
                                                 collection:
                                                     'user_created_export_route_targets',
                                                 columns: [
                                                     {
                                                      elementId: 'e_asn',
                                                      name:
                                                        'ASN',
                                                      view: "FormInputView",
                                                      viewConfig:
                                                        {
                                                         class: "", width: 400,
                                                         placeholder: 'ASN 1-65534 or IP',
                                                         templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                         path: "asn",
                                                         dataBindValue:
                                                             'asn()',
                                                        }
                                                     },
                                                     {
                                                      elementId: 'e_target',
                                                      name:
                                                        'Target',
                                                      view: "FormInputView",
                                                      viewConfig:
                                                        {
                                                         placeholder: 'Target 1-4294967295',
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
                                                         $root.deleteRouteTarget($data, this);\
                                                        }",
                                                      iconClass: 'icon-minus'}
                                                 ],
                                                 gridActions: [
                                                     {onClick: "function() {\
                                                         addRouteTarget('user_created_export_route_targets');\
                                                         }",
                                                      buttonTitle: "Export Route Target"}
                                                 ]
                                             }
                                         }
                                        ]
                                    },
                                    ]
                                }
                            }]
                        }]
                    },
                    {
                    columns: [
                        {
                        elementId: 'import_route_target_accordian',
                        view: "AccordianView",
                        viewConfig: [
                            {
                            elementId: 'import_route_target_vcfg',
                            title: 'Import Route Target(s)',
                            view: "SectionView",
                            viewConfig: {
                                    rows: [
                                    {
                                        columns: [
                                        {
                                             elementId: 'user_created_import_route_targets',
                                             view: "FormEditableGridView",
                                             viewConfig: {
                                                 path : 'user_created_import_route_targets',
                                                 validation:
                                                'routeTargetModelConfigValidations',
                                                 collection:
                                                     'user_created_import_route_targets',
                                                 columns: [
                                                     {
                                                      elementId: 'i_asn',
                                                      name:
                                                        'ASN',
                                                      view: "FormInputView",
                                                      viewConfig:
                                                        {
                                                         class: "", width: 400,
                                                         placeholder: 'ASN 1-65534 or IP',
                                                         templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                         path: "asn",
                                                         dataBindValue:
                                                             'asn()',
                                                        }
                                                     },
                                                     {
                                                      elementId: 'i_target',
                                                      name:
                                                        'Target',
                                                      view: "FormInputView",
                                                      viewConfig:
                                                        {
                                                         placeholder: 'Target 1-4294967295',
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
                                                         $root.deleteRouteTarget($data, this);\
                                                        }",
                                                      iconClass: 'icon-minus'}
                                                 ],
                                                 gridActions: [
                                                     {onClick: "function() {\
                                                         addRouteTarget('user_created_import_route_targets');\
                                                         }",
                                                      buttonTitle: "Import Route Target"}
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
                ]  // End Rows
            }
        }
        return vnCfgViewConfig;
    }

    return vnCfgEditView;
});
