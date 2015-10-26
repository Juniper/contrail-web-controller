/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var DnsRecordsModel = ContrailModel.extend({
        defaultConfig:  {
        "uuid": null,
        "virtual_DNS_record_data": {
        "record_type": "A",
        "record_ttl_seconds":null,
        "record_name": null,
        "record_class": "IN",
        "record_data":null 
        },
		"user_created_record_type":"A"
        },
		
		formatModelConfig : function(modelConfig) {
			//set user_created_type
			if(modelConfig['virtual_DNS_record_data'] != null) {
				 recData = modelConfig['virtual_DNS_record_data'];
			     modelConfig['user_created_record_type'] = recData['record_type'];
			}
			return modelConfig;
	    },

        validations: {
         /*   dnsConfigValidations: {
                'display_name': {
                    required: true,
                    msg: 'Enter DNS Records Name'
                }
            }*/
        },
          addEditDnsRecords: function (mode, callbackObj, ajaxMethod) {
            var ajaxConfig = {}, returnFlag = false;
            var postData = {'virtual-DNS':{}};

            var self = this;
            if (self.model().isValid(true, "dnsRecordsValidations")) {

                var newdnsRecordsData = $.extend(true,
                                                {}, self.model().attributes);

                var domain = contrail.getCookie(cowc.COOKIE_DOMAIN);
                var project = contrail.getCookie(cowc.COOKIE_PROJECT);
		        delete newdnsRecordsData['errors'];
		        delete newdnsRecordsData['locks'];
				
                if (newdnsRecordsData['uuid'] == '') {
                    newdnsRecordsData['display_name'] = newdnsRecordsData['name'];
                }
                if (newdnsRecordsData['fq_name'] == null || newdnsRecordsData['fq_name'].length == 0) {
	                newdnsRecordsData['fq_name'] = [];
                    newdnsRecordsData['fq_name'] = window.dnsSelectedValueData.fq_name.split(':');
                }
                var nwIpams = newdnsRecordsData['network_ipam_back_refs'];
                newdnsRecordsData['virtual_DNS_record_data']['record_ttl_seconds'] = parseInt( newdnsRecordsData['virtual_DNS_record_data']['record_ttl_seconds']);
				 newdnsRecordsData['virtual_DNS_record_data']['record_type']=newdnsRecordsData['user_created_record_type'];
                newdnsRecordsData['parent_type'] = 'domain';
                newdnsRecordsData['parent_uuid'] = window.dnsSelectedValueData.parentSelectedValueData.value;
                var virtDNSRecData = newdnsRecordsData['virtual_DNS_record_data'];
                delete newdnsRecordsData['virtual_DNS_record_data'];
				delete newdnsRecordsData['user_created_record_type'];
                newdnsRecordsData['virtual_DNS_records'] =[];
                newdnsRecordsData['virtual_DNS_records'][0] = {};
                newdnsRecordsData['virtual_DNS_records'][0]['virtual_DNS_record_data'] =
                    virtDNSRecData;
                newdnsRecordsData['virtual_DNS_records'][0]['to'] =
                    newdnsRecordsData['fq_name'];
		        delete newdnsRecordsData['elementConfigMap'];
                delete newdnsRecordsData['user_created_dns_method'];
                delete newdnsRecordsData.errors;
                delete newdnsRecordsData.locks;
                delete newdnsRecordsData.cgrid;
                delete newdnsRecordsData.id_perms;
                delete newdnsRecordsData.user_created;
                delete newdnsRecordsData.tenant_dns_records;
                delete newdnsRecordsData.virtual_network_back_refs;
                delete newdnsRecordsData.href;
                delete newdnsRecordsData.parent_href;
				

                var url,type;
                if(mode === "create"){
                    delete newdnsRecordsData['uuid'];
					postData['virtual-DNS'] = newdnsRecordsData;
					var ajaxType = contrail.checkIfExist(ajaxMethod) ? ajaxMethod : "POST";
					ajaxConfig.async = false;
					ajaxConfig.type = ajaxType;
					ajaxConfig.data = JSON.stringify(postData);
					ajaxConfig.url='/api/tenants/config/virtual-DNS/' +
                        window.dnsSelectedValueData.value + '/virtual-DNS-records';
									
                }
                else if(mode ==="edit"){
			postData['virtual-DNS'] = newdnsRecordsData;
			ajaxConfig.async = false;
			ajaxConfig.type = 'PUT';
			ajaxConfig.data = JSON.stringify(postData);
			ajaxConfig.url = '/api/tenants/config/virtual-DNS/'+window.dnsSelectedValueData.value+'/virtual-DNS-record/'+newdnsRecordsData['uuid'];
                }
        
                contrail.ajaxHandler(ajaxConfig, function () {
                    if (contrail.checkIfFunction(callbackObj.init)) {
                        callbackObj.init();
                    }
                }, function (response) {
                    if (contrail.checkIfFunction(callbackObj.success)) {
                        callbackObj.success();
                    }
                    returnFlag = true;
                }, function (error) {
                    if (contrail.checkIfFunction(callbackObj.error)) {
                        callbackObj.error(error);
                    }
                    returnFlag = false;
                });
            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(
                                            ctwl.CFG_IPAM_PREFIX_ID));
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
            ajaxConfig.data = JSON.stringify([{'type': 'virtual-DNS-record',
                                             'deleteIDs': uuidList}]);
            ajaxConfig.url = '/api/tenants/config/delete';
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                console.log(response);
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
                returnFlag = true;
            }, function (error) {
                console.log(error);
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
                returnFlag = false;
            });
            return returnFlag;
        }
    });
    return DnsRecordsModel;
});

