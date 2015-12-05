/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view',
    'knockback'
], function(_, ContrailView, Knockback) {
    var gridElId = "#DnsServerGrid";
    var prefixId = "DnsServerPrefix";
    var modalId = 'configure-' + prefixId;
    var formId = '#' + modalId + '-form';
    var self;
    var DnsServerEditView = ContrailView.extend({
        renderAddDnsServer: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({
                prefixId: prefixId,
                modalId: modalId
            });
            self = this;
            self.mode = options.mode;
            var gridData = options['gridData'];
            var configData = options['configData'];
            cowu.createModal({
                'modalId': modalId,
                'className': 'modal-680',
                'title': options['title'],
                'body': editLayout,
                'onSave': function() {
                    self.model.addEditDnsServer(
                        'create', {
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
            self.renderView4Config($("#" + modalId).find(
                    formId), this.model,
                getAddDnsServerViewConfig(false),
                "dnsConfigValidations", null, null,
                function() {
                    self.model.showErrorAttr(prefixId +
                        cowc.FORM_SUFFIX_ID, false);
                    Knockback.applyBindings(self.model,
                        document.getElementById(
                            modalId));
                    kbValidation.bind(self);
                });
        },
        renderEditDnsServer: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({
                prefixId: prefixId,
                modalId: modalId
            });
            self = this;
            self.mode = options.mode;
            cowu.createModal({
                'modalId': modalId,
                'className': 'modal-680',
                'title': options['title'],
                'body': editLayout,
                'onSave': function() {
                    self.model.addEditDnsServer(
                        'edit', {
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

            self.renderView4Config($("#" + modalId).find(
                    formId), this.model,
                getAddDnsServerViewConfig(true),
                "dnsConfigValidations", null, null,
                function() {
                    self.model.showErrorAttr(prefixId +
                        cowc.FORM_SUFFIX_ID, false);
                    Knockback.applyBindings(self.model,
                        document.getElementById(
                            modalId));
                    kbValidation.bind(self);
                });
        },
        renderDeleteDnsServer: function(options) {
            var delTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_DEL);
            self = this;
            var items = "";

            var delLayout = delTemplate({
                prefixId: prefixId,
                item: ctwl.TITLE_DNS_SERVER,
                itemId: items
            });
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

            this.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                false);
            Knockback.applyBindings(this.model, document.getElementById(
                modalId));
            kbValidation.bind(this);
        }
    });

    function formatVirtualDNSs(response) {
        var dnss = [];
        if (null == response) {
            return dnss;
        }
        var vdnsList = response['virtual_DNSs'];
        var vdnsCnt = vdnsList.length;
        window.ipams = {};
        for (var i = 0; i < vdnsCnt; i++) {
            var fqn = getValueByJsonPath(vdnsList[i],
                'virtual-DNS;fq_name', []);
            if (fqn.length > 0) {
                if (self.mode == 'Create') {
                    dnss.push({
                        'id': fqn.join(':'),
                        'text': fqn.join(':')
                    });
                } else if (self.mode == 'Edit' && self.model.name() !=
                    fqn[1]) {
                    dnss.push({
                        'id': fqn.join(':'),
                        'text': fqn.join(':')
                    });
                }
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
            //  ipams.push({'id':ipamsList[i].uuid,'data': JSON.stringify(ipamsList[i]), 'text': fqn.join(':')});
            ipams.push({
                id: getIpamId(fqnString, ipamsList[i].uuid),
                text: fqn[1] + ':' + fqn[2]
            });


            window.ipams[fqn.join(':')] = ipamsList[i]['uuid'];
        }

        return ipams;
    }

    function getIpamId(fqnString, ipamUUID) {
        return fqnString + '**' + ipamUUID;
    }

    function getAddDnsServerViewConfig(isDisable) {
        var prefixId = ctwl.TEST_DNS_SERVER_PREFIX_ID;
        var dnsViewConfig = {
            elementId: cowu.formatElementId([prefixId, ctwl.TITLE_CREATE_DNS_SERVER]),
            title: ctwl.TITLE_CREATE_DNS_SERVER,
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: 'name',
                        view: 'FormInputView',
                        viewConfig: {
                            label: 'Name',
                            disabled: isDisable,
                            path: 'name',
                            class: 'span6',
                            dataBindValue: 'name'
                        }
                    },{
                        elementId: 'domain_name',
                        view: 'FormInputView',
                        viewConfig: {
                            label: 'Domain Name',
                            disabled: isDisable,
                            path: 'virtual_DNS_data.domain_name',
                            class: 'span6',
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
                            class: 'span6',
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
                            class: 'span6',
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
                            class: 'span6',
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
                            class: 'span6',
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
                            class: 'span6',
                            dataBindValue: 'virtual_DNS_data().external_visible'
                        }
                    },{
                        elementId: 'reverse_resolution',
                        view: 'FormCheckboxView',
                        viewConfig: {
                            label: 'Reverse Resolution',
                            path: 'virtual_DNS_data.reverse_resolution',
                            class: 'span6',
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
                            class: 'span12',
                            dataBindValue: 'user_created_network_ipams',
                            elementConfig: {
                                dataTextField: "text",
                                dataValueField: "id",
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

    return DnsServerEditView;
});