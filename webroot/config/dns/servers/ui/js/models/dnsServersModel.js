/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-config-model'
], function(_, ContrailConfigModel) {
    var dnsServersModel = ContrailConfigModel.extend({
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
                "external_visible": false,
                "reverse_resolution": false
            },
            "user_created_network_ipams" : null
        },
        formatModelConfig: function(modelConfig) {
             modelConfig['display_name'] =
                 ctwu.getDisplayNameOrName(modelConfig);

             //populate user_created_network_ipams for edit case
             var ipamBackRefs = modelConfig['network_ipam_back_refs'];
             if(ipamBackRefs instanceof Array) {
                 var ipamStr = '';
                 for(var i = 0; i < ipamBackRefs.length; i++) {
                     var ipam = ipamBackRefs[i];
                     var formattedString = ipam.to[0] + ':' + ipam.to[1] + ':' +
                         ipam.to[2] + cowc.DROPDOWN_VALUE_SEPARATOR + ipam.uuid;
                     if(i === 0) {
                         ipamStr = formattedString;
                     } else {
                         ipamStr += ctwc.MULTISELECT_VALUE_SEPARATOR +
                             formattedString;
                     }
                 }
                 modelConfig['user_created_network_ipams'] = ipamStr;
             }
             //permissions
             this.formatRBACPermsModelConfig(modelConfig);
             return modelConfig;
        },
        addEditDnsServer: function(mode, callbackObj,
            ajaxMethod) {
            var ajaxConfig = {},
                returnFlag = false;
            var postData = {
                'virtual-DNS': {}
            };

            var self = this;
            var validation = [{
                key: null,
                type: cowc.OBJECT_TYPE_MODEL,
                getValidation: 'dnsConfigValidations'
            },
            //permissions
            ctwu.getPermissionsValidation()];

            if (self.isDeepValid(validation)) {

                var newdnsServerData = $.extend(true, {},
                    self.model().attributes);

                var domain = contrail.getCookie(cowc.COOKIE_DOMAIN);
                var project = contrail.getCookie(cowc.COOKIE_PROJECT);

                ctwu.setNameFromDisplayName(newdnsServerData);

                if (newdnsServerData['fq_name'] == null ||
                    newdnsServerData['fq_name'].length == 0
                ) {
                    newdnsServerData['fq_name'] = [];
                    newdnsServerData['fq_name'][0] = domain;
                    newdnsServerData['fq_name'][1] =
                        newdnsServerData['name'];
                }
                if (!newdnsServerData['virtual_DNS_data']
                    ['default_ttl_seconds']) {
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
                if (newdnsServerData['user_created_network_ipams']) {
                    var nwIpamBackRefs = [];
                    var nwIpams = newdnsServerData[
                        'user_created_network_ipams'].split(
                        ctwc.MULTISELECT_VALUE_SEPARATOR);
                    var nwIpamBackRefsCnt = nwIpams.length;
                    for (var i = 0; i < nwIpamBackRefsCnt; i++) {
                        var nwIpam = nwIpams[i];
                        var parts = nwIpam ?
                            nwIpam.split(cowc.DROPDOWN_VALUE_SEPARATOR) : [];
                        if(parts.length === 2) {
                            var nwIpamBackRef = {};
                            var fqn = parts[0].split(':');
                            nwIpamBackRef['to'] = fqn;
                            nwIpamBackRef['uuid'] = parts[1];
                            nwIpamBackRefs.push(nwIpamBackRef);
                        }
                    }

                    newdnsServerData[
                            'network_ipam_back_refs'] =
                        nwIpamBackRefs;
                } else {
                    delete newdnsServerData['network_ipam_back_refs'];
                }

                var dnsMethod = getValueByJsonPath(
                    newdnsServerData,
                    'user_created_dns_method',
                    'default');

                //permissions
                this.updateRBACPermsAttrs(newdnsServerData);

                ctwu.deleteCGridData(newdnsServerData);

                delete newdnsServerData[
                    'user_created_dns_method'];
                delete newdnsServerData.id_perms;
                delete newdnsServerData.user_created;
                delete newdnsServerData.tenant_dns_server;
                delete newdnsServerData.virtual_network_back_refs;
                delete newdnsServerData.href;
                delete newdnsServerData.parent_href;
                delete newdnsServerData.parent_uuid;
                delete newdnsServerData.user_created_network_ipams;

                var url, type;
                if (mode === ctwl.CREATE_ACTION) {
                    postData['virtual-DNS'] =
                        newdnsServerData;
                    var ajaxType = contrail.checkIfExist(
                            ajaxMethod) ? ajaxMethod :
                        "POST";
                    ajaxConfig.type = ajaxType;
                    ajaxConfig.data = JSON.stringify(
                        postData);
                    ajaxConfig.url =
                        '/api/tenants/config/virtual-DNSs';

                } else if (mode === ctwl.EDIT_ACTION) {
                    postData['virtual-DNS'] =
                        newdnsServerData;
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
                        ctwc.DNS_SERVER_PREFIX_ID));
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
                'display_name': {
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
                        var virtualDNSs = $('#' + ctwc.DNS_SERVER_GRID_ID).
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
    return dnsServersModel;
});