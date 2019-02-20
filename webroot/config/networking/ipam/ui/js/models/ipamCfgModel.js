/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodash',
    'contrail-config-model',
    'config/networking/ipam/ui/js/models/ipamTenantDNSModel',
    'config/networking/ipam/ui/js/views/ipamCfgFormatters',
    'config/networking/ipam/ui/js/models/ipamSubnetModel',
    'config/networking/networks/ui/js/models/hostRouteModel',
    'config/networking/networks/ui/js/models/subnetDNSModel',
    'config/networking/networks/ui/js/views/vnCfgFormatters'
], function (_, ContrailConfigModel, IpamTenantDNSModel, IpamCfgFormatters,
    SubnetModel, HostRouteModel, SubnetDNSModel, VNCfgFormatters) {
    var formatipamCfg = new IpamCfgFormatters(),
        formatVNCfg = new VNCfgFormatters();

    var ipamCfgModel = ContrailConfigModel.extend({

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
            'user_created_dns_method': 'default-dns-server',
            'ipam_subnet_method':  'user-defined-subnet',
            'ipam_subnets':{
                'subnets': []
            },
            'user_created_ipam_subnets': []
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
            //permissions
            this.formatRBACPermsModelConfig(modelConfig);
            //subnets
            this.readSubnetList(modelConfig);
            return modelConfig;
        },

        readSubnetList: function (modelConfig) {
            var self = this;
            var subnetModels = [], subnetList = [];
            subnetList = getValueByJsonPath(modelConfig,
                    "ipam_subnets;subnets", []),
            subnetLen = subnetList.length;
            if(subnetLen > 0) {
                for(var i = 0; i < subnetLen; i++) {
                    var subnetObj = subnetList[i],
                        subnetModel, allocPools, allocPoolStr = '',
                        cidr = subnetObj.subnet.ip_prefix + '/' +
                        subnetObj.subnet.ip_prefix_len;
                    subnetObj["user_created_cidr"] = cidr;
                    subnetObj['allocation_pools'] = getValueByJsonPath(subnetObj,
                          "allocation_pools", [], false);
                    subnetObj['user_created_enable_gateway'] =
                        getValueByJsonPath(subnetObj, 'default_gateway', "");
                    subnetObj['user_created_enable_gateway'] =
                        subnetObj['user_created_enable_gateway'].length &&
                        subnetObj['user_created_enable_gateway'].indexOf("0.0.0.0")
                                    == -1 ? true : false;
                    subnetObj['user_created_enable_dns']  =
                        formatVNCfg.getSubnetDNSStatus(subnetObj);
                    subnetObj['disable'] = true;
                    //below dummy entry is  required to use existing subnet model
                    subnetObj['user_created_ipam_fqn'] = 'dummy';
                    subnetModel = new SubnetModel(subnetObj);
                    subnetModels.push(subnetModel);
                }
            } else if (isVCenter()) {
                var subnetModel = new SubnetModel();
                self.setSubnetChangeEvent(subnetModel);
                subnetModels.push(subnetModel);
            }

            modelConfig['user_created_ipam_subnets'] =
                                    new Backbone.Collection(subnetModels);
        },

        setSubnetGateway: function (self, model, text) {
            var subnets = self.model().attributes['user_created_ipam_subnets'].toJSON();
            var cid = model.cid;
            subnets.every(function(subnet) {
                if (subnet.disable() == true || subnet.model().cid != cid) {
                    return true;
                }
                if (subnet.user_created_enable_gateway() == true) {
                    var gw = genarateGateway(text, "start");
                    gw != false ? subnet.default_gateway(gw) : subnet.default_gateway('');
                } else {
                    subnet.default_gateway('0.0.0.0');
                }
                return true;
            });
        },

        toggleSubnetGateway: function (self, model, text) {
            var subnets = self.model().attributes['user_created_ipam_subnets'].toJSON();
            var cid = model.cid;
            subnets.every(function(subnet) {
                if (subnet.disable() == true || subnet.model().cid != cid) {
                    return true;
                }
                if (text == true) {
                    var gw = false;
                    if (subnet.user_created_cidr() != null) {
                        gw = genarateGateway(subnet.user_created_cidr(), "start");
                    }
                    gw != false ? subnet.default_gateway(gw) : subnet.default_gateway('');
                } else {
                    subnet.default_gateway('0.0.0.0');
                }
                return true;
            });
        },

        setSubnetChangeEvent: function (subnetModel) {
            var self = this;
            subnetModel.__kb.view_model.model().on('change:user_created_cidr',
            function(model, text){
                 self.setSubnetGateway(self, model, text);
            });
            subnetModel.__kb.view_model.model().on('change:user_created_enable_gateway',
            function(model, text){
                 self.toggleSubnetGateway(self, model, text);
            });
        },

        addSubnet: function() {
            var self = this;
            var subnet = this.model().attributes['user_created_ipam_subnets'],
                subnetModel = new SubnetModel({user_created_ipam_fqn: 'dummy'});
            self.setSubnetChangeEvent(subnetModel);
            subnet.add([subnetModel]);
        },
        addSubnetByIndex: function(data, kbSubnet) {
          var self = this;
          var selectedRuleIndex = data.model().collection.indexOf(kbSubnet.model());
          var subnet = this.model().attributes['user_created_ipam_subnets'],
              subnetModel = new SubnetModel({user_created_ipam_fqn: 'dummy'});
          self.setSubnetChangeEvent(subnetModel);
          subnet.add([subnetModel],{at: selectedRuleIndex+1});
        },
        deleteSubnet: function(data, kbSubnet) {
            var subnetCollection = data.model().collection,
                subnet = kbSubnet.model();

            subnetCollection.remove(subnet);
        },

        getAllocPools: function(subnetObj) {
            var allocPools = _.get(subnetObj, 'allocation_pools.models', []),
                retAllocPool = [];
            _.each(allocPools, function(val) {
                var attr = _.get(val,'attributes',null);
                if(attr){
                    retAllocPool.push({
                        'start': attr.start(),
                        'end':  attr.end(),
                        'vrouter_specific_pool':
                            attr.vrouter_specific_pool()});
                }
             });
            return retAllocPool;
        },

        setDHCPOptionList: function(subnet, dhcpOption) {
            if (typeof subnet.dhcp_option_list == "function") {
                subnet.dhcp_option_list().dhcp_option = dhcpOption;
            } else {
                subnet['dhcp_option_list'] = {};
                subnet['dhcp_option_list']['dhcp_option'] = dhcpOption;
            }
        },

        getSubnetList: function(attr) {
            var subnetCollection = attr.user_created_ipam_subnets.toJSON(),
                subnetArray = [], dhcpOption;
            var dnsServers = [];
            var hostRoutes = [];
            var disabledDNS = [{'dhcp_option_name': '6', 'dhcp_option_value' : '0.0.0.0'}];
            for(var i = 0; i < subnetCollection.length; i++) {
                var subnet = $.extend(true, {}, subnetCollection[i].model().attributes);

                if (dnsServers.length && subnet.user_created_enable_dns) {
                    this.setDHCPOptionList(subnet, dnsServers);
                } else if(!dnsServers.length && subnet.user_created_enable_dns){
                    this.setDHCPOptionList(subnet, []);
                } else if (!(subnet.user_created_enable_dns)) {
                    this.setDHCPOptionList(subnet, disabledDNS);
                }
                if (hostRoutes.length) {
                    if (typeof subnet.host_routes == "function") {
                        subnet.host_routes().route = hostRoutes
                    } else {
                         subnet['host_routes'] = {};
                         subnet['host_routes']['route'] = hostRoutes;
                    }
                }
                if (subnet.user_created_enable_gateway == false) {
                    subnet.default_gateway = '0.0.0.0';
                } else if (subnet.default_gateway == null) {
                    var defGw = genarateGateway(subnet.user_created_cidr, "start");
                    //funny api
                    if (defGw != false) {
                        subnet.default_gateway = defGw;
                    }
                }
                var cidr = subnet.user_created_cidr;
                if (subnet.subnet.ip_prefix == null && cidr != null &&
                        cidr.split("/").length == 2) {
                    subnet.subnet.ip_prefix = cidr.split('/')[0];
                    subnet.subnet.ip_prefix_len = Number(cidr.split('/')[1]);
                }
                if (subnet.subnet_uuid == null) {
                    subnet.subnet_uuid = UUIDjs.create()['hex'];
                }
                if (subnet.subnet_name == null) {
                    subnet.subnet_name = subnet.subnet_uuid;
                }

                var allocPool  = this.getAllocPools(subnet);
                subnet.allocation_pools = allocPool;

                if (allocPool.length == 0) {
                    delete subnet['allocation_pools'];
                }
                if (hostRoutes.length == 0) {
                    delete subnet['host_routes'];
                }
                dhcpOption = getValueByJsonPath(subnet,
                    "dhcp_option_list;dhcp_option", []);
                if(dhcpOption.length === 0) {
                    delete subnet['dhcp_option_list'];
                }

                delete subnet['errors'];
                delete subnet['locks'];
                delete subnet['disable'];
                delete subnet['user_created_enable_dns'];
                delete subnet['user_created_enable_gateway'];
                delete subnet['user_created_ipam_fqn'];
                delete subnet['user_created_cidr'];
                subnetArray.push(subnet);
            }
            if(attr.ipam_subnet_method === ctwc.USER_DEFINED_SUBNET) {
                delete attr['ipam_subnets'];
            } else {
                attr['ipam_subnets']['subnets'] = subnetArray;
            }
        },

        addTenantDNS: function() {
            var dns = this.model().attributes['tenant_dns_server'],
                newDNS = new IpamTenantDNSModel({'ip_addr': ""});

            dns.add([newDNS]);
        },
        addTenantDNSByIndex: function(data,kbTenantDNS) {
            var selectedRuleIndex = data.model().collection.indexOf(kbTenantDNS.model());
            var dns = this.model().attributes['tenant_dns_server'],
                newDNS = new IpamTenantDNSModel({'ip_addr': ""});

            dns.add([newDNS],{at: selectedRuleIndex+1});
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
                              },
                              {
                                  key: 'user_created_ipam_subnets',
                                  type: cowc.OBJECT_TYPE_COLLECTION,
                                  getValidation: 'subnetModelConfigValidations'
                              },
                              //permissions
                              ctwu.getPermissionsValidation()
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
                if (newipamCfgData['fq_name'] == null ||
                    !newipamCfgData['fq_name'].length) {
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

                //subnets
                this.getSubnetList(newipamCfgData);

                //permissions
                this.updateRBACPermsAttrs(newipamCfgData);

                ctwu.deleteCGridData(newipamCfgData);
                delete newipamCfgData.id_perms;
                delete newipamCfgData.user_created;
                delete newipamCfgData.tenant_dns_server;
                delete newipamCfgData.virtual_network_back_refs;
                delete newipamCfgData.href;
                delete newipamCfgData.parent_href;
                delete newipamCfgData.parent_uuid;
                delete newipamCfgData.user_created_ipam_subnets;

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
