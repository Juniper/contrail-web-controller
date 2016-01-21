/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/networking/networks/ui/js/models/subnetModel',
    'config/networking/networks/ui/js/models/hostRouteModel',
    'config/networking/networks/ui/js/models/routeTargetModel',
    'config/networking/networks/ui/js/models/fipPoolModel',
    'config/networking/networks/ui/js/models/subnetDNSModel',
    'config/networking/networks/ui/js/views/vnCfgFormatters'
], function (_, ContrailModel, SubnetModel, HostRouteModel,
            RouteTargetModel, FipPoolModel,SubnetDNSModel, VNCfgFormatters) {
    var formatVNCfg = new VNCfgFormatters();

    var vnCfgModel = ContrailModel.extend({

        defaultConfig: {
            'name': '',
            'fq_name': null,
            'display_name': '',
            'parent_type': 'project',
            'virtual_network_properties': {
                'forwarding_mode': 'default', // l2 | l3 | l2_l3 | null = default. Delete property if it is set as default / null
                'allow_transit': false,
                'rpf': 'enable', //cross verify with Manish enable | disable
                'vxlan_network_identifier': null, //delete if it is null
            },
            'external_ipam': false, // set only when vcenter is enabled
            'virtual_network_network_id': 0, // never set at post / put
            'network_policy_refs': [], //ordered collection attr.major,minor
            'route_target_list': {
                'route_target': [], //collection
            },
            'is_shared': false,
            'router_external': false,
            'id_perms' : {
                'enable': true,
            },
            'flood_unknown_unicast': false, //cross verify with Manish
            'network_ipam_refs': [], // subnet collection
            'floating_ip_pools': [], // collection with projects
            'physical_router_back_refs': [],
            'user_created_host_routes': [],//fake created for host routes under each subnet
            'user_created_route_targets': [], //fake created for rt_list.rt collection
            'user_created_dns_servers': [] , //fake created for dns in dhcp options under each subnet
            'pVlanId': null , //fake created for vcenter pvlan
            'sVlanId': null , //fake created for vcenter sec pvlan
            //'routing_instance_refs': [], // not for now
            'route_table_refs': [],
            'disable': false,
        },

        formatModelConfig: function (modelConfig) {
            modelConfig['network_policy_refs'] =
                    formatVNCfg.polRefFormatter(null, null,
                                                        null, null, modelConfig);

            modelConfig['physical_router_back_refs'] =
                    formatVNCfg.phyRouterFormatter(null, null,
                                                        null, -1, modelConfig);

            modelConfig['id_perms']['enable'] =
                         getValueByJsonPath(modelConfig, 'id_perms;enable', true);

            modelConfig['virtual_network_properties'] =
                         getValueByJsonPath(modelConfig, 'virtual_network_properties', {});

            modelConfig['virtual_network_properties']['allow_transit'] =
                         getValueByJsonPath(modelConfig,
                                 'virtual_network_properties;allow_transit', false);

            modelConfig['virtual_network_properties']['forwarding_mode'] =
                         getValueByJsonPath(modelConfig,
                                 'virtual_network_properties;forwarding_mode', 'default');

            modelConfig['virtual_network_properties']['rpf'] =
                    getValueByJsonPath(modelConfig,
                        'virtual_network_properties;rpf', 'disable') == 'disable' ?
                         false : true;

            modelConfig['uuid'] = getValueByJsonPath(modelConfig, 'uuid', null);

            if (modelConfig['uuid'] != null) {
                modelConfig['disable'] = true;
                delete modelConfig['sVlanId'];
            } else if (!isVCenter()) {
                delete modelConfig['pVlanId'];
                delete modelConfig['sVlanId'];
            }

            this.readSubnetHostRoutes(modelConfig);
            this.readRouteTargetList(modelConfig);
            this.readFipPoolList(modelConfig);
            this.readSubnetDNSList(modelConfig);
            this.readSubnetList(modelConfig);

            return modelConfig;
        },

        readSubnetHostRoutes: function (modelConfig) {
            var hostRouteModels = [], hostRouteList = [];
            hostRouteList =
                    formatVNCfg.subnetHostRouteFormatter(null, null,
                                                        null, -1, modelConfig);
            if (hostRouteList.length) {
                for(var i = 0; i < hostRouteList.length; i++) {
                    var hostRouteModel = new HostRouteModel(hostRouteList[i]);
                    hostRouteModels.push(hostRouteModel);
                }
            }
            modelConfig['user_created_host_routes'] =
                                        new Backbone.Collection(hostRouteModels);
        },

        addHostRoute: function() {
            var hostRoute = this.model().attributes['user_created_host_routes'],
                newHostRoute = new HostRouteModel({'prefix': null,
                                                    'next_hop': null,
                                                   });

            hostRoute.add([newHostRoute]);
        },

        deleteHostRoute: function(data, kbHostRoute) {
            var hostRouteCollection = data.model().collection,
                hostRoute = kbHostRoute.model();

            hostRouteCollection.remove(hostRoute);
        },

        getHostRouteList : function(attr) {
            var hostRouteCollection = attr.user_created_host_routes.toJSON(),
                hostRouteArray = [];
            for(var i = 0; i < hostRouteCollection.length; i++) {
                hostRouteArray.push({'prefix': hostRouteCollection[i].prefix(),
                                     'next_hop': hostRouteCollection[i].next_hop()});
            }
            return hostRouteArray;
        },

        getAllocPools: function(subnetObj) {
            var allocPools = [], retAllocPool = [];
            if ('allocation_pools' in subnetObj &&
                        subnetObj.allocation_pools.length) {
                allocPools = subnetObj.allocation_pools.split('\n');
            }
            allocPools.every(function(pool) {
                var poolObj = pool.split('-');
                if (poolObj.length == 2) {
                    retAllocPool.push({'start': poolObj[0].trim(),
                                       'end':  poolObj[1].trim()});
                }
                return true;
            });
            return retAllocPool;
        },

        readRouteTargetList: function (modelConfig) {
            var routeTargetModels = [], routeTargetList = [];
            routeTargetList =
                    formatVNCfg.routeTargetFormatter(null, null,
                                                    null, -1, modelConfig);
            if (routeTargetList.length) {
                for(var i = 0; i < routeTargetList.length; i++) {
                    var routeTargetModel = new RouteTargetModel(routeTargetList[i]);
                    routeTargetModels.push(routeTargetModel);
                }
            }
            modelConfig['user_created_route_targets'] =
                                        new Backbone.Collection(routeTargetModels);
        },

        addRouteTarget: function() {
            var routeTarget = this.model().attributes['user_created_route_targets'],
                newRouteTarget = new RouteTargetModel({'asn': null,
                                                    'target': null,
                                                      });

            routeTarget.add([newRouteTarget]);
        },

        deleteRouteTarget: function(data, kbRouteTarget) {
            var routeTargetCollection = data.model().collection,
                routeTarget = kbRouteTarget.model();

            routeTargetCollection.remove(routeTarget);
        },

        getRouteTargetList : function(attr) {
            var routeTargetCollection = attr.user_created_route_targets.toJSON(),
                routeTargetArray = [];
            for(var i = 0; i < routeTargetCollection.length; i++) {
                routeTargetArray.push('target:' + routeTargetCollection[i].asn().trim() + ':' +
                                        routeTargetCollection[i].target().trim());
            }
            return routeTargetArray;
        },

        readFipPoolList: function (modelConfig) {
            var fipPoolModels = [], fipPoolList = [];

            fipPoolList =
                    formatVNCfg.fipPoolTmplFormatter(null, null,
                                                    null, -1, modelConfig);
            if (fipPoolList.length) {
                for(var i = 0; i < fipPoolList.length; i++) {
                    var fipPoolModel = new FipPoolModel(fipPoolList[i]);
                    fipPoolModels.push(fipPoolModel);
                }
            }
            modelConfig['floating_ip_pools'] =
                                        new Backbone.Collection(fipPoolModels);
        },

        addFipPool: function() {
            var fipPool = this.model().attributes['floating_ip_pools'],
                newFipPool = new FipPoolModel({'name': null,
                                               'projects': null,
                                                'disable': false});
            fipPool.add([newFipPool]);
        },

        deleteFipPool: function(data, kbFipPool) {
            var fipPoolCollection = data.model().collection,
                fipPool = kbFipPool.model();

            fipPoolCollection.remove(fipPool);
        },

        getFipPool : function(attr) {
            var fipPoolCollection = attr.floating_ip_pools.toJSON(),
                fipPoolArray = [];
            for(var i = 0; i < fipPoolCollection.length; i++) {
                fipPoolArray.push(fipPoolCollection[i]);
            }
            return fipPoolArray;
        },

        getFipPools: function(attr) {
            var fipPoolCollection = attr.floating_ip_pools.toJSON(),
                fipPoolArray = [];
            var vnFQN = getValueByJsonPath(attr, 'fq_name', []);

            for(var i = 0; i < fipPoolCollection.length; i++) {
                var fipPoolObj = fipPoolCollection[i];
                var fipFQN = vnFQN.concat(fipPoolObj.name());
                if (fipPoolObj.projects()) {
                    var projList = fipPoolObj.projects().split(',');
                    var projects = []
                    _.each(projList, function (proj) {
                        projects.push({'uuid': proj.trim()});
                    });
                    fipPoolArray.push({'to': fipFQN, 'projects': projects});
                } else {
                    fipPoolArray.push({'to': fipFQN})
                }
            }
            
            attr['floating_ip_pools'] = fipPoolArray; 
        },


        readSubnetDNSList: function(modelConfig) {
            var subnetDNSModels = [], subnetDNSList = [];
            subnetDNSList = formatVNCfg.subnetDNSFormatter(null,
                                                 null, null, -1, modelConfig);
            if(subnetDNSList.length > 0) {
                for(var i = 0; i < subnetDNSList.length; i++) {
                    var subnetDNSModel = new SubnetDNSModel({
                                      'ip_address': subnetDNSList[i]
                                      });
                    subnetDNSModels.push(subnetDNSModel);
                }
            }
            modelConfig['user_created_dns_servers'] =
                                    new Backbone.Collection(subnetDNSModels);
        },

        addSubnetDNS: function() {
            var subnetDNS = this.model().attributes['user_created_dns_servers'],
                newSubnetDNS = new SubnetDNSModel({'ip_address': null});

            subnetDNS.add([newSubnetDNS]);
        },

        deleteSubnetDNS: function(data, kbSubnetDNS) {
            var subnetDNSCollection = data.model().collection,
                subnetDNS = kbSubnetDNS.model();

            subnetDNSCollection.remove(subnetDNS);
        },

        getSubnetDNS: function(attr) {
            var subnetDNSCollection = attr.user_created_dns_servers.toJSON(),
                subnetDNSArray = [];
            for(var i = 0; i < subnetDNSCollection.length; i++) {
                subnetDNSArray.push(subnetDNSCollection[i].ip_address());
            }
            if (subnetDNSArray.length) {
                return [{dhcp_option_value: subnetDNSArray.join(' '),
                        dhcp_option_name: '6'}];
            }
            return subnetDNSArray;
        },

        readSubnetList: function (modelConfig) {
            var self = this;
            var subnetModels = [], subnetList = [];
            subnetList = formatVNCfg.subnetModelFormatter(null,
                                             null, null, -1, modelConfig);
            if(subnetList.length > 0) {
                for(var i = 0; i < subnetList.length; i++) {
                    var subnetModel = new SubnetModel(subnetList[i]);
                    subnetModels.push(subnetModel);
                }
            } else if (isVCenter()) {
                var subnetModel = new SubnetModel();
                self.setSubnetChangeEvent(subnetModel);
                subnetModels.push(subnetModel);
            }

            modelConfig['network_ipam_refs'] = 
                                    new Backbone.Collection(subnetModels);
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
            var subnet = this.model().attributes['network_ipam_refs'],
                subnetModel = new SubnetModel();
            self.setSubnetChangeEvent(subnetModel);
            subnet.add([subnetModel]);
        },

        deleteSubnet: function(data, kbSubnet) {
            var subnetCollection = data.model().collection,
                subnet = kbSubnet.model();

            subnetCollection.remove(subnet);
        },

        setSubnetGateway: function (self, model, text) {
            var subnets = self.model().attributes['network_ipam_refs'].toJSON();
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
            var subnets = self.model().attributes['network_ipam_refs'].toJSON();
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

        getPolicyList: function(attr) {
            var policies = [], policyList = [];

            if (attr.network_policy_refs.length) {
                policies = attr.network_policy_refs.split(',');
            }
            policies.every(function(policy) {
                policyList.push({'to': policy.split(':'),
                                 'attr': {'timer': null}});
                return true;
            });

            attr['network_policy_refs'] = policyList;
        },

        getSubnetList: function(attr) {
            var subnetCollection = attr.network_ipam_refs.toJSON(),
                subnetArray = [], ipamAssocArr = {};
            var dnsServers = this.getSubnetDNS(attr);
            var hostRoutes = this.getHostRouteList(attr);
            var disabledDNS = [{'dhcp_option_name': '6', 'dhcp_option_value' : '0.0.0.0'}];
            for(var i = 0; i < subnetCollection.length; i++) {
                var subnet = $.extend(true, {}, subnetCollection[i].model().attributes);

                if (dnsServers.length && subnet.user_created_enable_dns) {
                    if (typeof subnet.dhcp_option_list == "function") {
                        subnet.dhcp_option_list().dhcp_option = dnsServers;
                    } else {
                        subnet['dhcp_option_list'] = {};
                        subnet['dhcp_option_list']['dhcp_option'] = dnsServers;
                    }
                } else if (!(subnet.user_created_enable_dns)) {
                    if (typeof subnet.dhcp_option_list == "function") {
                        subnet.dhcp_option_list().dhcp_option = disabledDNS; 
                    } else {
                        subnet['dhcp_option_list'] = {};
                        subnet['dhcp_option_list']['dhcp_option'] = disabledDNS;
                    }
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
                    var defGw = genarateGateway(subnet.user_created_cidr(), "start");
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

                var ipam_fqn = subnet['user_created_ipam_fqn'];
                if (allocPool.length == 0) {
                    delete subnet['allocation_pools'];
                }
                if (hostRoutes.length == 0) {
                    delete subnet['host_routes'];
                }

                delete subnet['errors'];
                delete subnet['locks'];
                delete subnet['disable'];
                delete subnet['user_created_enable_dns'];
                delete subnet['user_created_enable_gateway'];
                delete subnet['user_created_ipam_fqn'];
                delete subnet['user_created_cidr'];
               
                if (!(ipam_fqn in ipamAssocArr)) {
                    ipamAssocArr[ipam_fqn] = [];
                }
                ipamAssocArr[ipam_fqn].push(subnet);                   
            }
            for (var ipam in ipamAssocArr) {
                subnetArray.push({'to': ipam.split(':'),
                                  'attr' :
                                  {'ipam_subnets': ipamAssocArr[ipam]}
                                  });
            } 
            attr['network_ipam_refs'] = subnetArray;
        },


        getProperties: function(attr) {
            var forwardingMode = getValueByJsonPath(attr,
                        'virtual_network_properties;forwarding_mode', null);

            if (forwardingMode == null || forwardingMode == 'default') {
                delete attr['virtual_network_properties']['forwarding_mode'];
            }

            var vxLANId = getValueByJsonPath(attr,
                        'virtual_network_properties;vxlan_network_identifier', null);

            if (vxLANId == null || vxLANId == 0 || vxLANId == '') {
                delete attr['virtual_network_properties']['vxlan_network_identifier'];
            } else {
                attr['virtual_network_properties']['vxlan_network_identifier'] =
                                                                         Number(vxLANId);
            }

            var rpf = getValueByJsonPath(attr,
                        'virtual_network_properties;rpf', null);

            if (rpf == null || rpf == true || rpf == 'enable') {
                attr['virtual_network_properties']['rpf'] = 'enable';
            } else {
                attr['virtual_network_properties']['rpf'] = 'false';
            }
        },

        getPhysicalRouters: function(attr) {
            var phyRouters = getValueByJsonPath(attr,
                        'physical_router_back_refs', '');

            attr['physical-routers'] = phyRouters.length ? phyRouters.split(',') : [];
            delete attr['physical_router_back_refs'];
        },

        getAdminState: function(attr) {
            var adminState = getValueByJsonPath(attr, 'id_perms;enable', true);
            adminState = (adminState != 'false');
            attr['id_perms']['enable'] = adminState
        },

        externalRouterHandler: function (value) {
            var fipPoolModel = new FipPoolModel({name: 'default',
                                                 projects: null, disable : true});
            var fipPools = this.model().attributes.floating_ip_pools;
            var fipPoolCollection = fipPools.toJSON();
            var len = fipPoolCollection.length;
            var delArr = []
            for (var i = 0; i < len; i++) {
                if (fipPoolCollection[i].name() == 'default') {
                    delArr.push(i);
                    //make it work for all matches.
                    break;
                }
            }
            $.each(delArr, function (idx, poolIdx) {
                fipPools.remove(fipPools.models[poolIdx]);
            });
            if (value) {
                fipPools.add([fipPoolModel]);
            } 
        }, 

        validations: {
            vnCfgConfigValidations: {
                'name': {
                    required: true,
                    msg: 'Enter Name'
                },
                'virtual_network_properties.vxlan_network_identifier' :
                function (value, attr, finalObj) {
                    var vxMode =
                        (getValueByJsonPath(window.globalObj,
                        'global-vrouter-config;global-vrouter-config;vxlan_network_identifier_mode',
                        'automatic') == 'configured');
                    if (vxMode) {
                        var vxLanId = Number(value);
                        if (isNaN(vxLanId) ||
                            vxLanId < 1 || vxLanId > 16777215) {
                            return "Enter VxLAN Identifier between 1 - 16777215";
                        }
                    }
                },
                'pVlanId' :
                function (value, attr, finalObj) {
                    if (isVCenter()) {
                        var vlan = Number(value);
                        if (isNaN(vlan) ||
                            vlan < 1 || vlan > 4094) {
                            return "Enter Primary VLAN Identifier between 1 - 4094";
                        }
                    }
                },
                'sVlanId' :
                function (value, attr, finalObj) {
                    if (isVCenter()) {
                        var vlan = Number(value);
                        if (isNaN(vlan) ||
                            vlan < 1 || vlan > 4094) {
                            return "Enter Secondary VLAN Identifier between 1 - 4094";
                        }
                    }
                },
            }
        },

        addEditVNCfg: function (callbackObj, ajaxMethod) {
            var ajaxConfig = {}, returnFlag = false;
            var postData = {'virtual-network':{}};

            var validation = [{
                                key: null,
                                type: cowc.OBJECT_TYPE_MODEL,
                                getValidation: 'vnCfgConfigValidations'
                              },
                              {
                                key: 'network_ipam_refs',
                                type: cowc.OBJECT_TYPE_COLLECTION,
                                getValidation: 'subnetModelConfigValidations'
                              },
                              {
                                key: 'floating_ip_pools',
                                type: cowc.OBJECT_TYPE_COLLECTION,
                                getValidation: 'fipPoolModelConfigValidations'
                              },
                              {
                                key: 'user_created_host_routes',
                                type: cowc.OBJECT_TYPE_COLLECTION,
                                getValidation: 'hostRouteModelConfigValidations'
                              },
                              {
                                key: 'user_created_dns_servers',
                                type: cowc.OBJECT_TYPE_COLLECTION,
                                getValidation: 'subnetDNSModelConfigValidations'
                              },
                              {
                                key: 'user_created_route_targets',
                                type: cowc.OBJECT_TYPE_COLLECTION,
                                getValidation: 'routeTargetModelConfigValidations'
                              }
                             ];

            var that = this;
            if (this.isDeepValid(validation)) {
                    locks = this.model().attributes.locks.attributes;

                var newVNCfgData = $.extend(true,
                                            {}, this.model().attributes);

                var domain = contrail.getCookie(cowc.COOKIE_DOMAIN);
                var project = contrail.getCookie(cowc.COOKIE_PROJECT);

                if (newVNCfgData['display_name'] == '') {
                    newVNCfgData['display_name'] = newVNCfgData['name'];
                }
                if (newVNCfgData['fq_name'] == [] ||
                    newVNCfgData['fq_name'] == null) {
                    newVNCfgData['fq_name'] = [];
                    newVNCfgData['fq_name'][0] = domain;
                    newVNCfgData['fq_name'][1] = project;
                    newVNCfgData['fq_name'][2] = newVNCfgData['name'];
                }

                this.getFipPools(newVNCfgData);
                this.getAdminState(newVNCfgData);
                this.getPhysicalRouters(newVNCfgData);
                this.getProperties(newVNCfgData); 
                this.getSubnetList(newVNCfgData);
                this.getPolicyList(newVNCfgData);
                newVNCfgData['route_target_list'] = {};
                newVNCfgData['route_target_list']['route_target'] =
                                                 this.getRouteTargetList(newVNCfgData);

                delete newVNCfgData['virtual_network_network_id'];

                delete newVNCfgData.errors;
                delete newVNCfgData.locks;
                delete newVNCfgData.cgrid;
                //delete newVNCfgData.id_perms;
                delete newVNCfgData.href;
                delete newVNCfgData.elementConfigMap;
                delete newVNCfgData.parent_href;
                delete newVNCfgData.user_created_host_routes;
                delete newVNCfgData.user_created_route_targets;
                delete newVNCfgData.user_created_dns_servers;
                delete newVNCfgData.physical_router_back_refs;
                delete newVNCfgData.sVlanId;
                delete newVNCfgData.disable;

                if (!isVCenter()) {
                    delete newVNCfgData.pVlanId;
                    delete newVNCfgData.external_ipam;
                } else {
                    newVNCfgData['pVlanId'] =
                        Number(getValueByJsonPath(newVNCfgData, 'pVlanId', 0)); 
                }

                postData['virtual-network'] = newVNCfgData;

                var ajaxType       = contrail.checkIfExist(ajaxMethod) ?
                                                           ajaxMethod : "POST";
                var postURL        = (isVCenter() ? '/vcenter' : '') +
                                     '/api/tenants/config/virtual-networks';
                var putURL         = '/api/tenants/config/virtual-network/' +
                                     newVNCfgData['uuid'];
                ajaxConfig.type    = ajaxType;
                ajaxConfig.data    = JSON.stringify(postData);
                ajaxConfig.url     = ajaxType == 'PUT' ? putURL : postURL;
                ajaxConfig.timeout = 300000;


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
                                            ctwl.CFG_VN_PREFIX_ID));
                }
            }

            return returnFlag;
        },

        multiDeleteVNCfg: function (checkedRows, callbackObj) {
            var ajaxConfig = {}, that = this;
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'virtual-network',
                                              'deleteIDs': uuidList}]);

            ajaxConfig.url = '/api/tenants/config/delete';
            ajaxConfig.timeout = 300000;

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
 
    return vnCfgModel;
});
