/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-model'
], function(_, ContrailModel) {
    var self;
    var DnsRecordsModel = ContrailModel.extend({
        defaultConfig: {
            "uuid": null,
            "virtual_DNS_record_data": {
                "record_type": "A",
                "record_ttl_seconds": null,
                "record_name": null,
                "record_class": "IN",
                "record_data": null
            },
            "user_created_record_type": "A",
            "record_name_label" : "Host Name",
            'record_name_placeholder' : "Host Name to be resolved",
            "record_data_label" : "IP Address",
            "record_data_placeholder" : "Enter an IP Address"
        },
        addEditDnsRecords: function(mode, callbackObj,
            ajaxMethod) {
            var ajaxConfig = {},
                returnFlag = false;
            var postData = {
                'virtual-DNS': {}
            };

            self = this;
            if (self.model().isValid(true,
                    "dnsRecordsValidations")) {

                var newdnsRecordsData = $.extend(true, {},
                    self.model().attributes);

                var domain = contrail.getCookie(cowc.COOKIE_DOMAIN);
                var project = contrail.getCookie(cowc.COOKIE_PROJECT);
                delete newdnsRecordsData['errors'];
                delete newdnsRecordsData['locks'];

                if (newdnsRecordsData['uuid'] == '') {
                    newdnsRecordsData['display_name'] =
                        newdnsRecordsData['name'];
                }
                if (newdnsRecordsData['fq_name'] == null ||
                    newdnsRecordsData['fq_name'].length ==
                    0) {
                    newdnsRecordsData['fq_name'] = [];
                    newdnsRecordsData['fq_name'] = window.dnsSelectedValueData
                        .fq_name.split(':');
                }
                var nwIpams = newdnsRecordsData[
                    'network_ipam_back_refs'];
                if (newdnsRecordsData[
                        'virtual_DNS_record_data'][
                        'record_ttl_seconds'
                    ] == null) {
                    newdnsRecordsData[
                        'virtual_DNS_record_data'][
                        'record_ttl_seconds'
                    ] = 86400;
                } else {
                    newdnsRecordsData[
                        'virtual_DNS_record_data'][
                        'record_ttl_seconds'
                    ] = parseInt(newdnsRecordsData[
                        'virtual_DNS_record_data'][
                        'record_ttl_seconds'
                    ]);
                }

                newdnsRecordsData['virtual_DNS_record_data']
                    ['record_type'] = newdnsRecordsData[
                        'user_created_record_type'];
                newdnsRecordsData['parent_type'] = 'domain';
                newdnsRecordsData['parent_uuid'] = window.dnsSelectedValueData
                    .parentSelectedValueData.value;
                var virtDNSRecData = newdnsRecordsData[
                    'virtual_DNS_record_data'];
                delete newdnsRecordsData[
                    'virtual_DNS_record_data'];
                delete newdnsRecordsData[
                    'user_created_record_type'];
                newdnsRecordsData['virtual_DNS_records'] = [];
                newdnsRecordsData['virtual_DNS_records'][0] = {};
                newdnsRecordsData['virtual_DNS_records'][0]
                    ['virtual_DNS_record_data'] =
                    virtDNSRecData;
                newdnsRecordsData['virtual_DNS_records'][0]
                    ['to'] =
                    newdnsRecordsData['fq_name'];
                delete newdnsRecordsData['elementConfigMap'];
                delete newdnsRecordsData[
                    'user_created_dns_method'];
                delete newdnsRecordsData.errors;
                delete newdnsRecordsData.locks;
                delete newdnsRecordsData.cgrid;
                delete newdnsRecordsData.id_perms;
                delete newdnsRecordsData.user_created;
                delete newdnsRecordsData.tenant_dns_records;
                delete newdnsRecordsData.virtual_network_back_refs;
                delete newdnsRecordsData.href;
                delete newdnsRecordsData.parent_href;

                var url, type;
                if (mode === "create") {
                    delete newdnsRecordsData['uuid'];
                    postData['virtual-DNS'] =
                        newdnsRecordsData;
                    var ajaxType = contrail.checkIfExist(
                            ajaxMethod) ? ajaxMethod :
                        "POST";
                    ajaxConfig.async = false;
                    ajaxConfig.type = ajaxType;
                    ajaxConfig.data = JSON.stringify(
                        postData);
                    ajaxConfig.url =
                        '/api/tenants/config/virtual-DNS/' +
                        window.dnsSelectedValueData.value +
                        '/virtual-DNS-records';

                } else if (mode === "edit") {
                    postData['virtual-DNS'] =
                        newdnsRecordsData;
                    ajaxConfig.async = false;
                    ajaxConfig.type = 'PUT';
                    ajaxConfig.data = JSON.stringify(
                        postData);
                    ajaxConfig.url =
                        '/api/tenants/config/virtual-DNS/' +
                        window.dnsSelectedValueData.value +
                        '/virtual-DNS-record/' +
                        newdnsRecordsData['uuid'];
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
                        'DNS_Record'));
                }
            }

            return returnFlag;
        },
        deleteDnsRecords: function(checkedRows, callbackObj) {
            var returnFlag = false;
            var ajaxConfig = {};
            var uuidList = [];
            var cnt = checkedRows.length;
            for (var i = 0; i < cnt; i++) {
                uuidList.push(checkedRows[i]['uuid']);
            }
            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{
                'type': 'virtual-DNS-record',
                'deleteIDs': uuidList
            }]);
            ajaxConfig.url = '/api/tenants/config/delete';
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
            return returnFlag;
        },
        validations: {
            dnsRecordsValidations: {
                'virtual_DNS_record_data.record_name':  function(value, attr, finalObj){
                     var recType = finalObj.user_created_record_type;
                     if(recType === 'A' || recType === 'CNAME') {
                         if(value == null || value.trim() == '') {
                             return 'Host Name is required';
                         }
                     } else if(recType === 'PTR'){
                         if(!validateIPAddress(value)){
                             return 'Enter a valid IP address in xxx.xxx.xxx.xxx format';
                         }
                     } else if(recType === 'NS') {
                         if(value == null || value.trim() == '') {
                             return 'Sub domain is required';
                         }
                     }
                },
                'virtual_DNS_record_data.record_data':  function(value, attr, finalObj){
                     var recType = finalObj.user_created_record_type;
                     if(recType === 'PTR') {
                         if(value == null || value.trim() == '') {
                             return 'Host Name is required';
                         }
                     } else if(recType === 'A'){
                         if(!validateIPAddress(value)){
                             return 'Enter a valid IP address in xxx.xxx.xxx.xxx format';
                         }
                     }
                     //validating special characters
                     if(value != null) {
                         var iChars = "!@#$%^&*()+=_[]|';,/{}|\"<>?~`";
                         for(var i = 0;i < value.length;i++) {
                             if(iChars.indexOf(value[i]) != -1) {
                                 return 'Record data field has special characters';
                             }
                         }
                     }
                },
                'virtual_DNS_record_data.record_ttl_seconds':  function(value, attr, finalObj){
                    if(value != null && value !== '') {
                        if(allowNumeric(value)){
                             if(!validateTTLRange(parseInt(value))){
                                 return 'Time To Live value should be in  "0 - 2147483647" range';
                             }
                        } else {
                            return 'Time To Live value should be  a number';
                        }
                    }
                }
            }
        }
    });
    return DnsRecordsModel;
});