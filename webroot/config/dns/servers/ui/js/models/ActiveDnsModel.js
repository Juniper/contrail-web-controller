/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var ActiveDnsModel = ContrailModel.extend({
        defaultConfig:  {
		"installed":null,
		"name":null,
		"rec_class":null,
		"rec_name":null,
		"rec_ttl":86400,
		"rec_type":null,
	    "source": null
	    },

       /* validations: {
            dnsConfigValidations: {
                'display_name': {
                    required: true,
                    msg: 'Enter DNS Server Name'
                }
            }
        },*/
          addEditActiveDns: function (mode, callbackObj, ajaxMethod) {
            var ajaxConfig = {}, returnFlag = false;
            var postData = {'VirtualDnsRecordTraceData':{}};

            var self = this;
            if (self.model().isValid(true, "dnsServerValidations")) {

                var newactiveDnsData = $.extend(true,
                                                {}, self.model().attributes);

                var domain = contrail.getCookie(cowc.COOKIE_DOMAIN);
                var project = contrail.getCookie(cowc.COOKIE_PROJECT);
		delete newactiveDnsData['errors'];
		delete newactiveDnsData['locks'];
				
                if (newactiveDnsData['display_name'] == '') {
                    newactiveDnsData['display_name'] = newactiveDnsData['name'];
                }
                if (newactiveDnsData['fq_name'] == null || newactiveDnsData['fq_name'].length == 0) {
	            newactiveDnsData['fq_name'] = [];
                    newactiveDnsData['fq_name'][0] = domain;
                    newactiveDnsData['fq_name'][1] = newactiveDnsData['display_name'];
                }
                var nwIpams = newactiveDnsData['network_ipam_back_refs'];
                newactiveDnsData['virtual_DNS_data']['default_ttl_seconds'] = parseInt( newactiveDnsData['virtual_DNS_data']['default_ttl_seconds']);
               
                if (!(nwIpams instanceof Array)) {
                    nwIpams = [nwIpams];
                }
		var nwIpamBackRefs = [];
                var nwIpamBackRefsCnt = nwIpams.length;
                for (var i = 0; i < nwIpamBackRefsCnt; i++) {
					var nwIpam = nwIpams[i];
					var parts = nwIpam.split('**');
					var nwIpamBackRef = {} ;
					var fqn = parts[0].split(':');
					nwIpamBackRef['to'] = fqn;
					nwIpamBackRef['uuid'] = window.ipams[fqn.join(':')];
                                	nwIpamBackRefs.push(nwIpamBackRef);
                	
				}
		
		newactiveDnsData['network_ipam_back_refs'] = nwIpamBackRefs;
		delete newactiveDnsData['elementConfigMap'];
		
		console.log(newactiveDnsData['network_ipam_back_refs']);
                var dnsMethod = getValueByJsonPath(newactiveDnsData, 'user_created_dns_method', 'default');

                delete newactiveDnsData['user_created_dns_method'];
                delete newactiveDnsData.errors;
                delete newactiveDnsData.locks;
                delete newactiveDnsData.cgrid;
                delete newactiveDnsData.id_perms;
                delete newactiveDnsData.user_created;
                delete newactiveDnsData.tenant_dns_server;
                delete newactiveDnsData.virtual_network_back_refs;
                delete newactiveDnsData.href;
                delete newactiveDnsData.parent_href;
                delete newactiveDnsData.parent_uuid;
      											
                var url,type;
             /*   if(mode === "create"){
					postData['VirtualDnsRecordTraceData'] = newactiveDnsData;
					var ajaxType = contrail.checkIfExist(ajaxMethod) ? ajaxMethod : "POST";
					ajaxConfig.async = false;
					ajaxConfig.type = ajaxType;
					ajaxConfig.data = JSON.stringify(postData);
					ajaxConfig.url='/api/tenants/config/virtual-DNSs';
									
                }
                else if(mode ==="edit"){
			postData['virtual-DNS'] = newactiveDnsData;
			ajaxConfig.async = false;
			ajaxConfig.type = 'PUT';
			ajaxConfig.data = JSON.stringify(postData);
			ajaxConfig.url = '/api/tenants/config/virtual-DNS/'+ newactiveDnsData["uuid"];
                }*/
        
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
		/*
        deleteActiveDns: function(checkedRows, callbackObj) {
            var returnFlag = false;
            var ajaxConfig = {};
             var uuidList = [];
            var cnt = checkedRows.length;

            for (var i = 0; i < cnt; i++) {
                uuidList.push(checkedRows[i]['uuid']);
            }
            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'virtual-DNS',
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
        }*/
    });
    return ActiveDnsModel;
});

