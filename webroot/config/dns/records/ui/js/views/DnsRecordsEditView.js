/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = "#DnsRecordsGrid";
    var prefixId = "DnsRecordsPrefix";
    var modalId = 'configure-' + prefixId;
    var formId = '#' + modalId + '-form';

    var DnsRecordsEditView = ContrailView.extend({
        renderAddDnsRecords: function (options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;

            var gridData = options['gridData'];
            var configData = options['configData'];
            cowu.createModal({'modalId': modalId, 'className': 'modal-680',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
            self.model.addEditDnsRecords('create', {
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
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.renderView4Config($("#" + modalId).find(formId), this.model,
                                   getAddDnsRecordsViewConfig(false),
                                   "dnsConfigValidations",null,null, function(){
            	self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            	Knockback.applyBindings(self.model, document.getElementById(modalId));
            	kbValidation.bind(self);
	    });
        },
        renderEditDnsRecords: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-680',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.addEditDnsRecords('edit', {
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
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});

            self.renderView4Config($("#" + modalId).find(formId), this.model,
                                   getAddDnsRecordsViewConfig(true),
                                   "dnsConfigValidations", null, null, function(){
            self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(self.model, document.getElementById(modalId));
            kbValidation.bind(self);
			});
        },
        renderDeleteDnsRecords: function(options) {
            var delTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_DEL),
                self = this;
            var items = "";
	
            var delLayout = delTemplate({prefixId: prefixId,
                                        item: ctwl.TITLE_DNS_RECORDS,
                                        itemId: items});
            cowu.createModal({'modalId': modalId, 'className': 'modal-680',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout, 'onSave': function () {
                self.model.deleteDnsRecords(options['checkedRows'],{
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
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});

            this.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(this.model, document.getElementById(modalId));
            kbValidation.bind(this);
        }
    });

       function formatVirtualDNSs (response) {
        var dnss = [];
        if (null == response) {
            return dnss;
        }
        var vdnsList = response['virtual_DNSs'];
        var vdnsCnt = vdnsList.length;
	    window.ipams = {};
        for (var i = 0; i < vdnsCnt; i++) {
            var fqn = getValueByJsonPath(vdnsList[i], 'virtual-DNS;fq_name', []);
            if (fqn.length > 0) {
            	dnss.push({'id': fqn.join(':'), 'text': fqn.join(':')});
            }
        }
        return dnss;
    }
    function formatNetworkIpams (response) {
        var ipams = [];
        if (null == response) {
            return ipams;
        }
        var ipamsList = response['network-ipams'];
        var ipamsCnt = ipamsList.length;
        for (var i = 0; i < ipamsCnt; i++) {
            var fqn = ipamsList[i].fq_name;
			var fqnString = fqn[0] + ':' + fqn[1] + ':' + fqn[2];
            ipams.push({'id':fqnString + '**' + ipamsList[i].uuid + '**', 'text': fqn.join(':')});
		    window.ipams[fqn.join(':')] = ipamsList[i]['uuid'];
        }
        return ipams;
    }

    function getAddDnsRecordsViewConfig (isDisable) {
        var prefixId = ctwl.TEST_DNS_RECORDS_PREFIX_ID;
        var dnsViewConfig = {
            elementId: cowu.formatElementId([prefixId, ctwl.TITLE_CREATE_DNS_RECORDS]),
            title: ctwl.TITLE_CREATE_DNS_RECORDS,
            view: "SectionView",
			viewConfig: {
                rows: [
                    {
						 columns:[
                             {
                                elementId: 'record_type',
                                view: 'FormDropdownView',
                                viewConfig: {
									label: 'Type',
									disabled: isDisable,
                                    path: 'user_created_record_type',
                                    class: 'span12',
                                    dataBindValue: 'user_created_record_type',
									elementConfig : {
										dataTextField : "text",
										dataValueField : "id",
										data: [{'text': 'A (IP Address Record)', 'id': 'A'},
                                        {'text': 'CNAME (Alias Record)', 'id': 'CNAME'},
                                        {'text': 'PTR (Reverse DNS Record)', 'id': 'PTR'},
                                        {'text': 'NS (Delegation Record)', 'id': 'NS'}]
								    }
                                }
                            }
						]
                      },					
					  {
                        columns: [
                            {
                                elementId: 'host_record_name',
                                view: 'FormInputView',
                                viewConfig: {
                                    visible: 'hostName',
									placeholder: 'Host Name to be resolved',
									label: 'Host Name',
									path: 'virtual_DNS_record_data.record_name',
                                    class: 'span12',
                                    dataBindValue: 'virtual_DNS_record_data().record_name'
                                }

                            }
                        ]
                    },
					 {
                         columns:[
                             {
                                elementId: 'ip_record_data',
                                view: 'FormInputView',
                                viewConfig: {
									visible: 'ipAddress',
									placeholder: 'Enter an IP Address',
									label: 'IP Address',
                                    path: 'virtual_DNS_record_data.record_data',
                                    class: 'span12',
                                    dataBindValue: 'virtual_DNS_record_data().record_data'
                                }
                            }
						]
                     },
					  {
                         columns:[
                             {
                                elementId: 'rev_ip_record_name',
                                view: 'FormInputView',
                                viewConfig: {
									visible: 'reverseIPAddress',
									placeholder: 'Enter an IP Address',
									label: 'IP Address',
                                    path: 'virtual_DNS_record_data.record_data',
                                    class: 'span12',
                                    dataBindValue: 'virtual_DNS_record_data().record_name'
                                }
                            }
						]
                     },					
					  {
                        columns: [
                            {
                                elementId: 'rev_host_name',
                                view: 'FormInputView',
                                viewConfig: {
                                    visible: 'reverseIPAddress',
									placeholder: 'Host Name',
		                            label: 'Host Name',
                                    path: 'virtual_DNS_record_data.record_name',
                                    class: 'span12',
                                    dataBindValue: 'virtual_DNS_record_data().record_data'
                                }

                            }
                        ]
                    },
					  {
                        columns: [
                            {
                                elementId: 'canonical_host_name',
                                view: 'FormInputView',
                                viewConfig: {
                                    visible: 'canonicalName',
									placeholder: 'Host Name',
		                            label: 'Host Name',
                                    path: 'virtual_DNS_record_data.record_name',
                                    class: 'span12',
                                    dataBindValue: 'virtual_DNS_record_data().record_name'
                                }

                            }
                        ]
                    },					
					  {
                         columns:[
                             {
                                elementId: 'canonical_record_data',
                                view: 'FormInputView',
                                viewConfig: {
									visible:'canonicalName',
									placeholder: 'Enter Canonical Name',
									label: 'Canonical Name',
                                    path: 'virtual_DNS_record_data.record_data',
                                    class: 'span12',
                                    dataBindValue: 'virtual_DNS_record_data().record_data'
                                }
                            }
						]
                     },
					  {
                        columns: [
                            {
                                elementId: 'subdomain_record_name',
                                view: 'FormInputView',
                                viewConfig: {
									visible:'subDomain',
									placeholder:'Enter a Sub Domain',
		                            label: 'Sub Domain',
                                    path: 'virtual_DNS_record_data.record_name',
                                    class: 'span12',
                                    dataBindValue: 'virtual_DNS_record_data().record_name'
                                }

                            }
                        ]
                    },
					{
                         columns:[
                             {
                                elementId: 'dns_record_data',
                                view: 'FormComboboxView',
                                viewConfig: {
									visible:'dnsServ',
									label: 'DNS Server',
                                    path: 'virtual_DNS_record_data.record_data',
                                    class: 'span12',
                                    dataBindValue: 'virtual_DNS_record_data().record_data',
									elementConfig : {
                                        placeholder: 'Enter Host Name or IP or Select a DNS Server',
										dataTextField : "text",
										dataValueField : "id",
										 dataSource: {
                                            type: 'remote',
                                            parse: formatVirtualDNSs,
                                            url: '/api/tenants/config/virtual-DNSs'
                                        }
										}
									}
                            }
						]
                     },
					 {
                         columns:[
                             {
                                elementId: 'record_class',
                                view: 'FormDropdownView',
                                viewConfig: {
									label: 'Class',
									disabled: isDisable,
                                    path: 'virtual_DNS_record_data.record_class',
                                    class: 'span12',
                                    dataBindValue: 'virtual_DNS_record_data().record_class',
									elementConfig : {
										dataTextField : "text",
										dataValueField : "id",
										data: [{'text': 'IN (Internet)', 'id': 'IN'}]
										}
                                }
                            }
						]
                     },
					  {
                         columns:[
                             {
                                elementId: 'record_ttl_seconds',
                                view: 'FormInputView',
                                viewConfig: {
									label: 'Time To Live',
									placeholder: 'TTL(86400 secs)',
                                    path: 'virtual_DNS_record_data.record_ttl_seconds',
                                    class: 'span12',
                                    dataBindValue: 'virtual_DNS_record_data().record_ttl_seconds'
                                }
                            }
						]
                     }
					
                ]
            }
        }
        return dnsViewConfig;
    }

    return DnsRecordsEditView;
});

