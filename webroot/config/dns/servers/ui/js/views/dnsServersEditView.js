/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view',
    'knockback'
], function(_, ContrailView, Knockback) {
    var gridElId = "#" + ctwc.DNS_SERVER_GRID_ID;
    var prefixId = ctwc.DNS_SERVER_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
    var formId = '#' + modalId + '-form';
    var self;
    var dnsServersEditView = ContrailView.extend({
        renderAddEditDNSServer: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT),
                editLayout = editTemplate({
                    prefixId: prefixId,
                    modalId: modalId
                }),
                disableInput;
            self = this;
            self.mode = options.mode;
            cowu.createModal({
                'modalId': modalId,
                'className': 'modal-700',
                'title': options['title'],
                'body': editLayout,
                'onSave': function() {
                    self.model.addEditDnsServer(
                        self.mode, {
                            init: function() {
                                cowu.enableModalLoading(
                                    modalId
                                );
                            },
                            success: function() {
                                options['callback']();
                                $("#" + modalId).modal('hide');
                            },
                            error: function(
                                error) {
                                cowu.disableModalLoading(
                                    modalId,
                                    function() {
                                        self.model
                                            .showErrorAttr(
                                                prefixId +
                                                cowc.FORM_SUFFIX_ID,
                                                error.responseText
                                            );
                                    }
                                );
                            }
                        });
                },
                'onCancel': function() {
                    Knockback.release(self.model,
                        document.getElementById(
                            modalId));
                    kbValidation.unbind(self);
                    $("#" + modalId).modal(
                        'hide');
                }
            });
            if(self.mode === ctwl.CREATE_ACTION) {
                disableInput = false;
            } else {
                disableInput = true;
            }
            self.renderView4Config($("#" + modalId).find(
                    formId), this.model,
                getAddDnsServerViewConfig(disableInput),
                "dnsConfigValidations", null, null,
                function() {
                    self.model.showErrorAttr(prefixId +
                        cowc.FORM_SUFFIX_ID, false);
                    Knockback.applyBindings(self.model,
                        document.getElementById(
                            modalId));
                    kbValidation.bind(self);
                    //permissions
                    ctwu.bindPermissionsValidation(self);
                }, null, true);
        },

        renderDeleteDnsServer: function(options) {
            var delTemplate =
                contrail.getTemplate4Id("core-generic-delete-form-template");
            self = this;
            var items = "";

            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({
                'modalId': modalId,
                'className': 'modal-680',
                'title': options['title'],
                'btnName': 'Confirm',
                'body': delLayout,
                'onSave': function() {
                    self.model.deleteDnsServer(
                        options[
                            'checkedRows'], {
                            init: function() {
                                cowu.enableModalLoading(
                                    modalId
                                );
                            },
                            success: function() {
                                options
                                    [
                                        'callback'
                                    ]();
                                $("#" +
                                    modalId
                                ).modal(
                                    'hide'
                                );
                            },
                            error: function(
                                error) {
                                cowu.disableModalLoading(
                                    modalId,
                                    function() {
                                        self
                                            .model
                                            .showErrorAttr(
                                                prefixId +
                                                cowc
                                                .FORM_SUFFIX_ID,
                                                error
                                                .responseText
                                            );
                                    }
                                );
                            }
                        });
                    // TODO: Release binding on successful configure
                },
                'onCancel': function() {
                    Knockback.release(self.model,
                        document.getElementById(
                            modalId));
                    kbValidation.unbind(self);
                    $("#" + modalId).modal(
                        'hide');
                }
            });

            self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                false);
            Knockback.applyBindings(self.model, document.getElementById(
                modalId));
            kbValidation.bind(self);
        }
    });

    function formatVirtualDNSs(response) {
        var dnss = [];
        if (null == response) {
            return dnss;
        }
        var vdnsList = response['virtual_DNSs'];
        var vdnsCnt = vdnsList.length;
        for (var i = 0; i < vdnsCnt; i++) {
            var fqn = getValueByJsonPath(vdnsList[i],
                'virtual-DNS;fq_name', []);
            if (fqn.length > 0) {
                if(self.mode == ctwl.EDIT_ACTION && self.model.name() ===
                    fqn[1]) {
                    continue;
                }
                dnss.push({
                    'id': fqn.join(':'),
                    'text': fqn.join(':')
                });
            }
        }
        return dnss;
    }

    function formatNetworkIpams(response) {
        var ipams = [];
        if (null == response) {
            return ipams;
        }
        var ipamsList = response['network-ipams'];
        var ipamsCnt = ipamsList.length;
        for (var i = 0; i < ipamsCnt; i++) {
            var fqn = ipamsList[i].fq_name;
            var fqnString = fqn[0] + ':' + fqn[1] + ':' + fqn[2];
            ipams.push({
                id: getIpamId(fqnString, ipamsList[i].uuid),
                text: fqn[1] + ':' + fqn[2]
            });
        }

        return ipams;
    }

    function getIpamId(fqnString, ipamUUID) {
        return fqnString + cowc.DROPDOWN_VALUE_SEPARATOR + ipamUUID;
    }

    function getAddDnsServerViewConfig(isDisable) {
        var dnsViewConfig = {
            elementId: cowu.formatElementId([prefixId, ctwl.TITLE_CREATE_DNS_SERVER]),
            title: "DNS Server",
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: 'display_name',
                        view: 'FormInputView',
                        viewConfig: {
                            label: 'Name',
                            disabled: isDisable,
                            path: 'display_name',
                            class: 'col-xs-6',
                            dataBindValue: 'display_name'
                        }
                    },{
                        elementId: 'domain_name',
                        view: 'FormInputView',
                        viewConfig: {
                            label: 'Domain Name',
                            disabled: isDisable,
                            path: 'virtual_DNS_data.domain_name',
                            class: 'col-xs-6',
                            dataBindValue: 'virtual_DNS_data().domain_name'
                        }
                    }]
                }, {
                    columns: [{
                        elementId: 'next_virtual_DNS',
                        view: "FormComboboxView",
                        viewConfig: {
                            label: 'DNS Forwarder',
                            path: 'virtual_DNS_data.next_virtual_DNS',
                            class: 'col-xs-6',
                            dataBindValue: 'virtual_DNS_data().next_virtual_DNS',
                            elementConfig: {
                                placeholder: 'Enter Forwarder IP or Select a DNS Server',
                                dataTextField: "text",
                                dataValueField: "id",
                                dataSource: {
                                    type: 'remote',
                                    parse: formatVirtualDNSs,
                                    url: '/api/tenants/config/virtual-DNSs'
                                }
                            }
                        }
                    },{
                        elementId: 'record_order',
                        view: "FormDropdownView",
                        viewConfig: {
                            label: 'Record Resolution Order',
                            path: 'virtual_DNS_data.record_order',
                            class: 'col-xs-6',
                            dataBindValue: 'virtual_DNS_data().record_order',
                            elementConfig: {
                                dataTextField: "text",
                                dataValueField: "id",
                                data: [{
                                    id: 'random',
                                    text: 'Random'
                                }, {
                                    id: 'fixed',
                                    text: 'Fixed'
                                }, {
                                    id: 'round-robin',
                                    text: 'Round-Robin'
                                }]
                            }
                        }
                    }]
                }, {
                    columns: [{
                        elementId: 'floating_ip_record',
                        view: 'FormDropdownView',
                        viewConfig: {
                            label: 'Floating IP Record',
                            path: 'virtual_DNS_data.floating_ip_record',
                            class: 'col-xs-6',
                            dataBindValue: 'virtual_DNS_data().floating_ip_record',
                            elementConfig: {
                                dataTextField: "text",
                                dataValueField: "id",
                                data: [{
                                    id: 'dashed-ip-tenant-name',
                                    text: 'Dashed IP Tenant'
                                }, {
                                    id: 'dashed-ip',
                                    text: 'Dashed IP'
                                }, {
                                    id: 'vm-name',
                                    text: 'VM Name'
                                }, {
                                    id: 'vm-name-tenant-name',
                                    text: 'VM Name Tenant'
                                }]
                            }
                        }
                    },{
                        elementId: 'default_ttl_seconds',
                        view: 'FormInputView',
                        viewConfig: {
                            label: 'Time To Live',
                            placeholder: 'TTL (86400 sec)',
                            path: 'virtual_DNS_data.default_ttl_seconds',
                            class: 'col-xs-6',
                            dataBindValue: 'virtual_DNS_data().default_ttl_seconds'
                        }
                    }]
                }, {
                    columns: [{
                        elementId: 'external_visible',
                        view: 'FormCheckboxView',
                        viewConfig: {
                            label: 'External Visibility',
                            path: 'virtual_DNS_data.external_visible',
                            class: 'col-xs-6',
                            dataBindValue: 'virtual_DNS_data().external_visible'
                        }
                    },{
                        elementId: 'reverse_resolution',
                        view: 'FormCheckboxView',
                        viewConfig: {
                            label: 'Reverse Resolution',
                            path: 'virtual_DNS_data.reverse_resolution',
                            class: 'col-xs-6',
                            dataBindValue: 'virtual_DNS_data().reverse_resolution'
                        }
                    }]
                },{
                    columns: [{
                        elementId: 'user_created_network_ipams',
                        view: 'FormMultiselectView',
                        viewConfig: {
                            label: 'Associate IPAMs',
                            path: 'user_created_network_ipams',
                            class: 'col-xs-12',
                            dataBindValue: 'user_created_network_ipams',
                            elementConfig: {
                                dataTextField: "text",
                                dataValueField: "id",
                                separator: ctwc.MULTISELECT_VALUE_SEPARATOR,
                                dataSource: {
                                    type: 'remote',
                                    parse: formatNetworkIpams,
                                    url: '/api/tenants/config/ipams'
                                }
                            }
                        }
                    }]
                }]
            }
        }
        return dnsViewConfig;
    }

    return dnsServersEditView;
});