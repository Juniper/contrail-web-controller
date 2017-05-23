/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'knockback',
    'contrail-view'
], function(_, Knockback, ContrailView) {
    var prefixId = ctwc.DNS_RECORDS_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
    var formId = '#' + modalId + '-form';
    var dnsRecordsEditView = ContrailView.extend({
        renderAddEditDnsRecords: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({
                    prefixId: prefixId,
                    modalId: modalId
                }),
                self = this;

            var mode = options['mode'];
            var disabled = false;
            cowu.createModal({
                'modalId': modalId,
                'className': 'modal-700',
                'title': options['title'],
                'body': editLayout,
                'onSave': function() {
                    self.model.addEditDnsRecords(
                        mode, {
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
            if(mode === ctwl.EDIT_ACTION) {
                disabled = true;
            }
            self.renderView4Config($("#" + modalId).find(
                    formId), this.model,
                getAddDnsRecordsViewConfig(disabled),
                "dnsRecordsValidations", null, null,
                function() {
                    self.model.showErrorAttr(prefixId +
                        cowc.FORM_SUFFIX_ID, false);
                    //populate user_created_record_type for edit case
                    if(mode === ctwl.EDIT_ACTION) {
                        var recType =
                            getValueByJsonPath(self.model.model().attributes,
                            'virtual_DNS_record_data;record_type', 'A');
                        self.model.user_created_record_type(recType);
                    }
                    Knockback.applyBindings(self.model,
                        document.getElementById(
                            modalId));
                    kbValidation.bind(self);
                    //permissions
                    ctwu.bindPermissionsValidation(self);
                }, null, true);
        },
        renderDeleteDnsRecords: function(options) {
            var delTemplate =
                contrail.getTemplate4Id("core-generic-delete-form-template"),
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
                    self.model.deleteDnsRecords(
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
        for (var i = 0; i < vdnsCnt; i++) {
            var fqn = getValueByJsonPath(vdnsList[i],
                'virtual-DNS;fq_name', []);
            if (fqn.length > 0) {
                dnss.push({
                    'id': fqn.join(':'),
                    'text': fqn.join(':')
                });
            }
        }
        return dnss;
    };

    function getAddDnsRecordsViewConfig(isDisable) {
        var prefixId = ctwl.TEST_DNS_RECORDS_PREFIX_ID;
        var dnsViewConfig = {
            elementId: cowu.formatElementId([prefixId, ctwl.TITLE_CREATE_DNS_RECORDS]),
            title: "DNS Record",
            view: "SectionView",
            viewConfig: {
                rows: [{
                        columns: [{
                            elementId: 'record_type',
                            view: 'FormDropdownView',
                            viewConfig: {
                                label: 'Type',
                                disabled: isDisable,
                                path: 'user_created_record_type',
                                class: 'col-xs-12',
                                dataBindValue: 'user_created_record_type',
                                elementConfig: {
                                    dataTextField: "text",
                                    dataValueField: "value",
                                    data: [{
                                        'text': 'A (IPv4 Address Record)',
                                        'value': 'A'
                                    },{
                                        'text': 'AAAA (IPv6 Address Record)',
                                        'value': 'AAAA'
                                    }, {
                                        'text': 'CNAME (Alias Record)',
                                        'value': 'CNAME'
                                    }, {
                                        'text': 'PTR (Reverse DNS Record)',
                                        'value': 'PTR'
                                    }, {
                                        'text': 'NS (Delegation Record)',
                                        'value': 'NS'
                                    },{
                                        'text': 'MX (Mail Exchanger Record)',
                                        'value': 'MX'
                                    }]
                                }
                            }
                        }]
                    },
                    {
                    columns: [{
                            elementId: 'record_name',
                            view: 'FormInputView',
                            viewConfig: {
                                templateId : 'dns-records-input-view-template',
                                placeholder: 'record_name_placeholder',
                                label: 'record_name_label',
                                path: 'virtual_DNS_record_data.record_name',
                                class: 'col-xs-6',
                                dataBindValue: 'virtual_DNS_record_data().record_name'
                            }

                        },{
                            elementId: 'record_data',
                            view: 'FormInputView',
                            viewConfig: {
                                visible: 'user_created_record_type() !== "NS"',
                                templateId : 'dns-records-input-view-template',
                                placeholder: 'record_data_placeholder',
                                label: 'record_data_label',
                                path: 'virtual_DNS_record_data.record_data',
                                class: 'col-xs-6',
                                dataBindValue: 'virtual_DNS_record_data().record_data'
                            }
                        },
                        {
                            elementId: 'dns_record_data',
                            view: 'FormComboboxView',
                            viewConfig: {
                                visible: 'user_created_record_type() === "NS"',
                                label: 'DNS Server',
                                path: 'virtual_DNS_record_data.record_data',
                                class: 'col-xs-6',
                                dataBindValue: 'virtual_DNS_record_data().record_data',
                                elementConfig: {
                                    placeholder: 'Enter Host Name or IP or Select a DNS',
                                    dataTextField: "text",
                                    dataValueField: "id",
                                    dataSource: {
                                        type: 'remote',
                                        parse: formatVirtualDNSs,
                                        url: '/api/tenants/config/virtual-DNSs'
                                    }
                                }
                            }
                        }]
                 },
                  {
                        columns: [{
                            elementId: 'record_class',
                            view: 'FormDropdownView',
                            viewConfig: {
                                label: 'Class',
                                disabled: isDisable,
                                path: 'virtual_DNS_record_data.record_class',
                                class: 'col-xs-12',
                                dataBindValue: 'virtual_DNS_record_data().record_class',
                                elementConfig: {
                                    dataTextField: "text",
                                    dataValueField: "id",
                                    data: [{
                                        'text': 'IN (Internet)',
                                        'id': 'IN'
                                    }]
                                }
                            }
                        }]
                    }, {
                        columns: [{
                            elementId: 'record_ttl_seconds',
                            view: 'FormInputView',
                            viewConfig: {
                                label: 'Time To Live',
                                placeholder: 'TTL (86400 secs)',
                                path: 'virtual_DNS_record_data.record_ttl_seconds',
                                class: 'col-xs-12',
                                dataBindValue: 'virtual_DNS_record_data().record_ttl_seconds'
                            }
                        }]
                    }, {
                        columns: [{
                            elementId: 'record_mx_preference',
                            view: 'FormInputView',
                            viewConfig: {
                                visible : 'user_created_record_type() === "MX"',
                                label: 'MX Preference',
                                placeholder: 'Enter a MX Preference number (0 - 65535)',
                                path: 'virtual_DNS_record_data.record_mx_preference',
                                class: 'col-xs-12',
                                dataBindValue: 'virtual_DNS_record_data().record_mx_preference'
                            }
                        }]
                    }
                ]
            }
        }
        return dnsViewConfig;
    };

    return dnsRecordsEditView;
});