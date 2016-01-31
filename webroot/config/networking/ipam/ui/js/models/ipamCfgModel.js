/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/networking/ipam/ui/js/models/ipamTenantDNSModel',
    'config/networking/ipam/ui/js/views/ipamCfgFormatters'
], function (_, ContrailModel, IpamTenantDNSModel, IpamCfgFormatters) {
    var formatipamCfg = new IpamCfgFormatters();

    var ipamCfgModel = ContrailModel.extend({

        defaultConfig: {
            'name': '',
            'fq_name': null,
            'display_name': '',
            'parent_type': 'project',
            'network_ipam_mgmt': {
                'dhcp_option_list' : {
                    'dhcp_option' : []
                },
                'ipam_dns_method': 'default-dns-server',
                'ipam_dns_server': {
                    'tenant_dns_server_address': {
                        'ip_address' : []
                    },
                    'virtual_dns_server_name': null
                },
            },
            'virtual_DNS_refs': [],
            'user_created': {
                'domain_name': null,
                'ntp_server': null,
            },
            'tenant_dns_server':[],
            'user_created_dns_method': 'default-dns-server'
        },

        formatModelConfig: function (modelConfig) {
           var tenantDNSModels = [], tenantDNSList = [],
                dhcpList = [], vDnsName = null;

           dhcpList =
           modelConfig['network_ipam_mgmt']['dhcp_option_list']['dhcp_option'] =
                getValueByJsonPath(modelConfig,
                'network_ipam_mgmt;dhcp_option_list;dhcp_option', []);

           modelConfig['network_ipam_mgmt']['ipam_dns_method'] =
                getValueByJsonPath(modelConfig,
                'network_ipam_mgmt;ipam_dns_method', 'default-dns-server');

           modelConfig['user_created_dns_method'] = 
                        modelConfig['network_ipam_mgmt']['ipam_dns_method'];

           vDnsName =
             modelConfig['network_ipam_mgmt']
            ['ipam_dns_server']['virtual_dns_server_name'] =
            getValueByJsonPath(modelConfig,
            'network_ipam_mgmt;ipam_dns_server;virtual_dns_server_name', null);

           tenantDNSList = modelConfig['network_ipam_mgmt']['ipam_dns_server']
                ['tenant_dns_server_address']['ip_address'] =
                getValueByJsonPath(modelConfig,
        'network_ipam_mgmt;ipam_dns_server;tenant_dns_server_address;ip_address'
        , []);


           if(tenantDNSList.length > 0) {
                for(var i = 0; i < tenantDNSList.length; i++) {
                    var tenantDNSModel = new IpamTenantDNSModel({
                                      'ip_addr': tenantDNSList[i]
                                      });
                    tenantDNSModels.push(tenantDNSModel)
                }
            }

           var tenantDNSCollectionModel =
                                    new Backbone.Collection(tenantDNSModels);

           modelConfig['tenant_dns_server'] = tenantDNSCollectionModel;

           modelConfig['network_ipam_mgmt']['ipam_dns_server']
                      ['tenant_dns_server_address']['ip_address'] =
                                tenantDNSCollectionModel;

           modelConfig['user_created']['ntp_server'] =
                        formatipamCfg.getDhcpOptions(dhcpList, 4).trim();
           modelConfig['user_created']['domain_name'] =
                        formatipamCfg.getDhcpOptions(dhcpList, 15).trim();


            return modelConfig;
        },

        addTenantDNS: function() {
            var dns = this.model().attributes['tenant_dns_server'],
                newDNS = new IpamTenantDNSModel({'ip_addr': ""});

            dns.add([newDNS]);
        },

        deleteTenantDNS: function(data, kbTenantDNS) {
            var dnsCollection = data.model().collection,
                dns = kbTenantDNS.model();

            dnsCollection.remove(dns);
        },

        getTenantDNSList : function(attr) {
            var dnsCollection = attr.tenant_dns_server.toJSON(),
                dnsArray = [];
            for(var i = 0; i < dnsCollection.length; i++) {
                dnsArray.push(dnsCollection[i].ip_addr());
            }
            return dnsArray;
        },

        validations: {
            ipamCfgConfigValidations: {
                'name': {
                    required: true,
                    msg: 'Enter Name'
                },
                'user_created_dns_method':
                    function (value, attr, finalObj) {
                        var vdns = getValueByJsonPath(finalObj,
                                'network_ipam_mgmt;ipam_dns_server;virtual_dns_server_name',
                                null);
                        if (value == 'virtual-dns-server' &&
                            (vdns == null || vdns.length == 0)) {
                            return "Select a Virtual DNS Server";
                        }
                    },
                'network_ipam_mgmt.ipam_dns_server.virtual_dns_server_name':
                    function (value, attr, finalObj) {
                        if (finalObj.user_created_dns_method == 'virtual-dns-server' &&
                            (value == null || value.length == 0)) {
                            return "Select a Virtual DNS Server";
                        }
                    },
                'user_created.ntp_server':
                    function (value, attr, finalObj) {
                        if ((value != null && value.length != 0) &&
                                !isValidIP(value)) {
                            return "Enter valid NTP IP";
                        }
                    },
            }
        },

        addEditIpamCfg: function (callbackObj, ajaxMethod) {
            var ajaxConfig = {}, returnFlag = false;
            var postData = {'network-ipam':{}};
            var validation = [{
                                key: null,
                                type: cowc.OBJECT_TYPE_MODEL,
                                getValidation: 'ipamCfgConfigValidations'
                              },
                              {
                                key: 'tenant_dns_server',
                                type: cowc.OBJECT_TYPE_COLLECTION,
                                getValidation: 'ipamTenantDNSConfigValidations'
                              }
                            ];

            var self = this;
            if (this.isDeepValid(validation)) {

                var newipamCfgData = $.extend(true,
                                                {}, self.model().attributes);

                var domain = contrail.getCookie(cowc.COOKIE_DOMAIN);
                var project = contrail.getCookie(cowc.COOKIE_PROJECT);

                if (newipamCfgData['display_name'] == '') {
                    newipamCfgData['display_name'] = newipamCfgData['name'];
                }
                if (newipamCfgData['fq_name'] == [] ||
                    newipamCfgData['fq_name'] == null) {
                    newipamCfgData['fq_name'] = [];
                    newipamCfgData['fq_name'][0] = domain;
                    newipamCfgData['fq_name'][1] = project;
                    newipamCfgData['fq_name'][2] = newipamCfgData['name'];
                }

                var dnsMethod = getValueByJsonPath(newipamCfgData,
                               'user_created_dns_method', 'default');

                delete newipamCfgData['user_created_dns_method'];

                newipamCfgData['network_ipam_mgmt']['ipam_dns_method'] = dnsMethod;

                if (dnsMethod != 'virtual-dns-server') {
                    newipamCfgData['virtual_DNS_refs'] = [];
                    delete newipamCfgData['network_ipam_mgmt']
                        ['ipam_dns_server']['virtual_dns_server_name'];
                } else {
                    newipamCfgData['user_created']['domain_name'] = null;
                    vdns = getValueByJsonPath(newipamCfgData,
                            'network_ipam_mgmt;ipam_dns_server;virtual_dns_server_name', '');
                    newipamCfgData['virtual_DNS_refs'] = [{to: vdns.split(":")}];
                }

                if (dnsMethod != 'tenant-dns-server') {
                    delete newipamCfgData['network_ipam_mgmt']
                        ['ipam_dns_server']['tenant_dns_server_address'];
                } else {
                    var tenantDNSList = this.getTenantDNSList(newipamCfgData);

                    newipamCfgData['network_ipam_mgmt']['ipam_dns_server']
                        ['tenant_dns_server_address']['ip_address'] =
                                                                tenantDNSList;
                }

                if (dnsMethod == 'none' ||
                    dnsMethod == 'default-dns-server') {
                    delete
                        newipamCfgData['network_ipam_mgmt']['ipam_dns_server'];
                }

                var ntp = getValueByJsonPath(newipamCfgData,
                                            'user_created;ntp_server', '');
                var domain = getValueByJsonPath(newipamCfgData,
                                            'user_created;domain_name', '');
                var dhcpOptions = [];

                if (ntp.length) {
                    dhcpOptions.push({dhcp_option_name: "4",
                                        dhcp_option_value: ntp});
                }
                if (domain.length) {
                    dhcpOptions.push({dhcp_option_name: "15",
                                        dhcp_option_value: domain});
                }

                if (!ntp.length && !domain.length) {
                    delete 
                        newipamCfgData['network_ipam_mgmt']['dhcp_option_list'];
                } else {
                    newipamCfgData
                        ['network_ipam_mgmt']
                        ['dhcp_option_list']['dhcp_option'] = dhcpOptions;
                }


                ctwu.deleteCGridData(newipamCfgData);
                delete newipamCfgData.id_perms;
                delete newipamCfgData.user_created;
                delete newipamCfgData.tenant_dns_server;
                delete newipamCfgData.virtual_network_back_refs;
                delete newipamCfgData.href;
                delete newipamCfgData.parent_href;
                delete newipamCfgData.parent_uuid;


                postData['network-ipam'] = newipamCfgData;

                var ajaxType     = contrail.checkIfExist(ajaxMethod) ?
                                                        ajaxMethod : "POST";
                ajaxConfig.async = false;
                ajaxConfig.type  = ajaxType;
                ajaxConfig.data  = JSON.stringify(postData);
                ajaxConfig.url   = ajaxType == 'PUT' ?
                                   '/api/tenants/config/ipam/' +
                                            newipamCfgData['uuid'] :
                                            '/api/tenants/config/ipams';

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

        multiDeleteIpamCfg: function (checkedRows, callbackObj) {
            var ajaxConfig = {};
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'network-ipam',
                                              'deleteIDs': uuidList}]);

            ajaxConfig.url = '/api/tenants/config/delete';
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
            }, function (error) {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
            });
        },

    });

    return ipamCfgModel;
});
