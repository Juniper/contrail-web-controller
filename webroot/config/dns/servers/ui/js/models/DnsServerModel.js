/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-model'
], function(_, ContrailModel) {
    var DnsServerModel = ContrailModel.extend({
        defaultConfig: {
            "name": null,
            "display_name": null,
            "fq_name": [],
            "network_ipam_back_refs": [],
            "parent_type": "domain",
            "virtual_DNS_data": {
                "dynamic_records_from_client": true,
                "floating_ip_record": "dashed-ip-tenant-name",
                "default_ttl_seconds": null,
                "domain_name": null,
                "record_order": "random",
            }
        },
        addEditDnsServer: function(mode, callbackObj,
            ajaxMethod) {
            var ajaxConfig = {},
                returnFlag = false;
            var postData = {
                'virtual-DNS': {}
            };

            var self = this;
            if (self.model().isValid(true,
                    "dnsConfigValidations")) {

                var newdnsServerData = $.extend(true, {},
                    self.model().attributes);

                var domain = contrail.getCookie(cowc.COOKIE_DOMAIN);
                var project = contrail.getCookie(cowc.COOKIE_PROJECT);
                delete newdnsServerData['errors'];
                delete newdnsServerData['locks'];

                if (newdnsServerData['name'] == '') {
                    newdnsServerData['display_name'] =
                        newdnsServerData['name'];
                }
                if (newdnsServerData['fq_name'] == null ||
                    newdnsServerData['fq_name'].length == 0
                ) {
                    newdnsServerData['fq_name'] = [];
                    newdnsServerData['fq_name'][0] = domain;
                    newdnsServerData['fq_name'][1] =
                        newdnsServerData['name'];
                }
                if (newdnsServerData['virtual_DNS_data'][
                        'default_ttl_seconds'
                    ] == null) {
                    newdnsServerData['virtual_DNS_data'][
                        'default_ttl_seconds'
                    ] = 86400;
                } else {
                    newdnsServerData['virtual_DNS_data'][
                        'default_ttl_seconds'
                    ] = parseInt(newdnsServerData[
                        'virtual_DNS_data'][
                        'default_ttl_seconds'
                    ]);
                }
                if (newdnsServerData['virtual_DNS_data'][
                        "next_virtual_DNS"
                    ] == null ||
                    newdnsServerData['virtual_DNS_data'][
                        "next_virtual_DNS"
                    ].trim() == '') {
                    delete newdnsServerData[
                        'virtual_DNS_data'][
                        "next_virtual_DNS"
                    ];
                }
                //handle network ipams
                if (newdnsServerData[
                        'network_ipam_back_refs'] != '') {
                    var nwIpamBackRefs = [];
                    var nwIpams = newdnsServerData[
                        'network_ipam_back_refs'].split(
                        ',');
                    var nwIpamBackRefsCnt = nwIpams.length;
                    for (var i = 0; i < nwIpamBackRefsCnt; i++) {
                        var nwIpam = nwIpams[i];
                        var parts = nwIpam.split('**');
                        var nwIpamBackRef = {};
                        var fqn = parts[0].split(':');
                        nwIpamBackRef['to'] = fqn;
                        nwIpamBackRef['uuid'] = window.ipams[
                            fqn.join(':')];
                        nwIpamBackRefs.push(nwIpamBackRef);
                    }

                    newdnsServerData[
                            'network_ipam_back_refs'] =
                        nwIpamBackRefs;
                }
                delete newdnsServerData['elementConfigMap'];

                var dnsMethod = getValueByJsonPath(
                    newdnsServerData,
                    'user_created_dns_method',
                    'default');

                delete newdnsServerData[
                    'user_created_dns_method'];
                delete newdnsServerData.errors;
                delete newdnsServerData.locks;
                delete newdnsServerData.cgrid;
                delete newdnsServerData.id_perms;
                delete newdnsServerData.user_created;
                delete newdnsServerData.tenant_dns_server;
                delete newdnsServerData.virtual_network_back_refs;
                delete newdnsServerData.href;
                delete newdnsServerData.parent_href;
                delete newdnsServerData.parent_uuid;

                var url, type;
                if (mode === "create") {
                    postData['virtual-DNS'] =
                        newdnsServerData;
                    var ajaxType = contrail.checkIfExist(
                            ajaxMethod) ? ajaxMethod :
                        "POST";
                    ajaxConfig.async = false;
                    ajaxConfig.type = ajaxType;
                    ajaxConfig.data = JSON.stringify(
                        postData);
                    ajaxConfig.url =
                        '/api/tenants/config/virtual-DNSs';

                } else if (mode === "edit") {
                    postData['virtual-DNS'] =
                        newdnsServerData;
                    ajaxConfig.async = false;
                    ajaxConfig.type = 'PUT';
                    ajaxConfig.data = JSON.stringify(
                        postData);
                    ajaxConfig.url =
                        '/api/tenants/config/virtual-DNS/' +
                        newdnsServerData["uuid"];
                }

                contrail.ajaxHandler(ajaxConfig, function() {
                    if (contrail.checkIfFunction(
                            callbackObj.init)) {
                        callbackObj.init();
                    }
                }, function(response) {
                    if (contrail.checkIfFunction(
                            callbackObj.success)) {
                        callbackObj.success();
                    }
                    returnFlag = true;
                }, function(error) {
                    if (contrail.checkIfFunction(
                            callbackObj.error)) {
                        callbackObj.error(error);
                    }
                    returnFlag = false;
                });
            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(
                        'DNS_Server'));
                }
            }

            return returnFlag;
        },
        deleteDnsServer: function(checkedRows, callbackObj) {
            var returnFlag = false;
            var ajaxConfig = {};
            var uuidList = [];
            var cnt = checkedRows.length;

            for (var i = 0; i < cnt; i++) {
                uuidList.push(checkedRows[i]['uuid']);
            }
            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{
                'type': 'virtual-DNS',
                'deleteIDs': uuidList
            }]);
            ajaxConfig.url = '/api/tenants/config/delete';
            contrail.ajaxHandler(ajaxConfig, function() {
                if (contrail.checkIfFunction(
                        callbackObj.init)) {
                    callbackObj.init();
                }
            }, function(response) {

                console.log(response);
                if (contrail.checkIfFunction(
                        callbackObj.success)) {
                    callbackObj.success();
                }
                returnFlag = true;
            }, function(error) {
                console.log(error);
                if (contrail.checkIfFunction(
                        callbackObj.error)) {
                    callbackObj.error(error);
                }
                returnFlag = false;
            });
            return returnFlag;
        },
        validations: {
            dnsConfigValidations: {
                'name': {
                    required: true,
                    msg: 'DNS Server Name is required'
                },
                'virtual_DNS_data.domain_name' : {
                    required: true,
                    msg: 'Domain Name is required'
                },
                'virtual_DNS_data.default_ttl_seconds' : function(value, attr, finalObj){
                    if(value != null && value != '') {
                        if(allowNumeric(value)){
                            if(!validateTTLRange(parseInt(value))){
                                return 'Time To Live value should be in  "0 - 2147483647" range';
                            }
                        }
                    }
                },
                'virtual_DNS_data.next_virtual_DNS' : function(value, attr, finalObj){
                    if(value != null && value != '') {
                        var virtualDNSs = $('#DnsServerGrid').
                            data('contrailGrid')._dataView.getItems();
                        var isSel_fwd = false;
                        for(var i = 0;i < virtualDNSs.length;i++){
	                        var dns = virtualDNSs[i];
                            var fullName = dns.fq_name[0] + ':' + dns.fq_name[1]
	                        if(fullName === value){
                                isSel_fwd = true
                            }
                        }
                        if(!isSel_fwd){
                            if(!validateIPAddress(value)){
                                return 'DNS Forwarder should be either valid IP address or chosen DNS Server';
                            }
                        }
                    }
                }
            }
        }
    });
    return DnsServerModel;
});