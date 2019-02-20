/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/networking/networks/ui/js/models/bridgeDomainModel',
    'config/networking/networks/ui/js/models/subnetModel',
    'config/networking/networks/ui/js/models/hostRouteModel',
    'config/networking/networks/ui/js/models/routeTargetModel',
    'config/networking/networks/ui/js/models/fipPoolModel',
    'config/networking/networks/ui/js/models/subnetDNSModel',
    'config/networking/networks/ui/js/views/vnCfgFormatters',
    'config/common/ui/js/models/fatFlowModel'
], function (_, ContrailConfigModel, BridgeDomainModel, SubnetModel, HostRouteModel,
            RouteTargetModel, FipPoolModel,SubnetDNSModel, VNCfgFormatters, FatFlowModel) {
    var formatVNCfg = new VNCfgFormatters();

    var vnCfgModel = ContrailConfigModel.extend({

        defaultConfig: {
            'name': '',
            'fq_name': null,
            'display_name': '',
            'parent_type': 'project',
            'virtual_network_properties': {
                'forwarding_mode': 'default', // l2 | l3 | l2_l3 | null = default. Delete property if it is set as default / null
                'allow_transit': false,
                'rpf': 'enable',
                'vxlan_network_identifier': null, //delete if it is null
                'mirror_destination': false
            },
            'user_created_forwarding_mode': 'default',
            'external_ipam': false, // set only when vcenter is enabled
            'virtual_network_network_id': 0, // never set at post / put
            'network_policy_refs': [], //ordered collection attr.major,minor
            'route_target_list': {
                'route_target': [], //collection
            },
            'import_route_target_list': {
                'route_target': [], //collection
            },
            'export_route_target_list': {
                'route_target': [], //collection
            },
            'is_shared': false,
            'router_external': false,
            'id_perms' : {
                'enable': true,
            },
            'flood_unknown_unicast': false,
            'multi_policy_service_chains_enabled': false,
            'network_ipam_refs': [], // subnet collection
            'floating_ip_pools': [], // collection with projects
            'physical_router_back_refs': [],
            'security_logging_object_refs': [],
            'provider_properties': {
                'segmentation_id': null,
                'physical_network': null
            },
            'ecmp_hashing_include_fields': { /*
                'hashing_configured': false,
                'source_ip': false,
                'destination_ip': false,
                'ip_protocol': false,
                'source_port': false,
                'destination_port': false
                */
            },
            'pbb_evpn_enable': false,
            'pbb_etree_enable': false,
            'layer2_control_word': false,
            'fabric_snat': false,
            'mac_learning_enabled': false,
            'mac_limit_control' : {
                'mac_limit': 0, //unlimited
                'mac_limit_action': 'log'
            },
            'mac_move_control': {
                'mac_move_limit': 0, //unlimited
                'mac_move_time_window': 10, //secs
                'mac_move_limit_action': 'log'
            },
            'mac_aging_time': 300, //secs
            'bridge_domains': [],
            'route_table_refs': [],
            'user_created_host_routes': [],//fake created for host routes under each subnet
            'user_created_route_targets': [], //fake created for rt_list.rt collection
            'user_created_import_route_targets': [], //fake created for import_rt_list.rt collection
            'user_created_export_route_targets': [], //fake created for export_rt_list.rt collection
            'user_created_dns_servers': [] , //fake created for dns in dhcp options under each subnet
            'user_created_sriov_enabled': false , //fake checkbox created for SRIOV
            'pVlanId': null, //fake created for vcenter pvlan
            'sVlanId': null, //fake created for vcenter sec pvlan
            'qos_config_refs': [],
            'user_created_vxlan_mode': false,
            'disable': false,
            'address_allocation_mode': 'user-defined-subnet-only',
            'user_created_flat_subnet_ipam': [],
            'user_created_ip_fabric_forwarding': false,
            'disablePort':false,
            'virtual_network_fat_flow_protocols': {
                'fat_flow_protocol':[]
            },
            'routing_policy_refs':[]
        },

        formatModelConfig: function (modelConfig) {
            modelConfig['network_policy_refs'] =
                    formatVNCfg.polRefFormatter(null, null,
                                                        null, null, modelConfig);

            modelConfig['physical_router_back_refs'] =
                    formatVNCfg.phyRouterFormatter(null, null,
                                                        null, -1, modelConfig);

            modelConfig['route_table_refs'] =
                    formatVNCfg.staticRouteFormatter(null, null,
                                                        null, -1, modelConfig);
            modelConfig['routing_policy_refs'] =
                formatVNCfg.routingPolicyFormatter(null, null,
                                                    null, -1, modelConfig);
            var vnUUID = getValueByJsonPath(modelConfig, 'uuid', null);

            if (vnUUID != null) {
                modelConfig['disable'] = true;
                delete modelConfig['sVlanId'];
            } else if (!isVCenter()) {
                delete modelConfig['pVlanId'];
                delete modelConfig['sVlanId'];
            }

            modelConfig['display_name'] = ctwu.getDisplayNameOrName(modelConfig);
            modelConfig['security_logging_object_refs'] = ctwu.securityLoggingObjectFormatter(modelConfig, 'edit');
            //populate user_created_forwarding_mode
            modelConfig['user_created_forwarding_mode'] =
                getValueByJsonPath(modelConfig,
                'virtual_network_properties;forwarding_mode', 'default', false);

            //ip fabric forwarding
            var ipFabricVn = getValueByJsonPath(modelConfig,
                    'virtual_network_refs;0;to;2', null);

            if(ipFabricVn === ctwc.IP_FABRIC_VN) {
                modelConfig['user_created_ip_fabric_forwarding'] = true;
            } else {
                modelConfig['user_created_ip_fabric_forwarding'] = false;
            }

            this.readSubnetHostRoutes(modelConfig);
            this.readRouteTargetList(modelConfig, 'user_created_route_targets');
            this.readRouteTargetList(modelConfig, 'user_created_import_route_targets');
            this.readRouteTargetList(modelConfig, 'user_created_export_route_targets');
            this.readFipPoolList(modelConfig);
            this.readSubnetDNSList(modelConfig);
            this.readSubnetList(modelConfig);
            this.readSRIOV(modelConfig);
            this.readEcmpHashing(modelConfig);
            this.readProperties(modelConfig);
            this.readQoS(modelConfig);
            this.readBridgeDomains(modelConfig);
            this.readFatFlows(modelConfig);

            //permissions
            this.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },

        readFatFlows: function(modelConfig) {
          //Modal config default Fat Flow option formatting
            var fatFlows = [];
            var fatFlowList =
              modelConfig["virtual_network_fat_flow_protocols"]["fat_flow_protocol"];
            if(fatFlowList != null && fatFlowList.length > 0) {
                var fatFlowLen = fatFlowList.length;
                for(var i = 0; i < fatFlowLen; i++) {
                    var fatFlow_obj = fatFlowList[i];
                    var fatFlowModel = new FatFlowModel(fatFlow_obj);
                    this.enableDisablePort(fatFlowModel);
                    fatFlows.push(fatFlowModel);
                }
            }
            var fatFlowCollectionModel = new Backbone.Collection(fatFlows);
            modelConfig["virtual_network_fat_flow_protocols"]["fat_flow_protocol"]
                                                = fatFlowCollectionModel;
            modelConfig['fatFlowCollection'] = fatFlowCollectionModel;
        },

        //Fat Flow Add
        addFatFlow: function() {
            var fatFlowList = this.model().attributes['fatFlowCollection'],
                fatFlowModel = new FatFlowModel();
            this.enableDisablePort(fatFlowModel);
            fatFlowList.add([fatFlowModel]);
        },

        //Fat Flow Add
        addFatFlowByIndex: function(data, fatFlow) {
            var selectedRuleIndex = data.model().collection.indexOf(fatFlow.model());
            var fatFlowList = this.model().attributes['fatFlowCollection'],
                fatFlowModel = new FatFlowModel();
            this.enableDisablePort(fatFlowModel);
            fatFlowList.add([fatFlowModel],{at: selectedRuleIndex+1});
        },

        //Fat Flow Delete
        deleteFatFlow: function(data, fatFlow) {
            var fatFlowCollection = data.model().collection,
                delFatFlow = fatFlow.model();
            fatFlowCollection.remove(delFatFlow);
        },

        enableDisablePort: function(fatFlowModel) {
            fatFlowModel.disablePort = ko.computed((function() {
                if(this.protocol() == "icmp") {
                    this.port("0");
                    return true;
                }
            }), fatFlowModel);
        },

        readBridgeDomains: function(modelConfig) {
            var bridgeDomainModels = [],
                bridgeDomainList = getValueByJsonPath(modelConfig,
                        'bridge_domains', [], false);
            _.each(bridgeDomainList, function(bridgeDomain){
                if(!bridgeDomain.name) {
                    bridgeDomain.name = getValueByJsonPath(bridgeDomain,
                            'fq_name;3', '', false);
                }
                bridgeDomain = _.extend(bridgeDomain, {"disable": true});
                bridgeDomainModels.push(new BridgeDomainModel(bridgeDomain));
            });
            modelConfig['bridge_domains'] =
                new Backbone.Collection(bridgeDomainModels);
        },

        addBridgeDomain: function() {
            var bridgeDomains = this.model().attributes['bridge_domains'],
                newBridgeDomain = new BridgeDomainModel();
            if(bridgeDomains.length > 0) {
            //    return;
            }
            bridgeDomains.add([newBridgeDomain]);
        },
        addBridgeDomainByIndex: function(data, kbHostRoute) {
            var selectedRuleIndex = data.model().collection.indexOf(kbHostRoute.model());
            var bridgeDomains = this.model().attributes['bridge_domains'],
                newBridgeDomain = new BridgeDomainModel();
            if(bridgeDomains.length > 0) {
                return;
            }
            bridgeDomains.add([newBridgeDomain],{at: selectedRuleIndex+1});
        },
        deleteBridgeDomain: function(data, kbHostRoute) {
            var bridgeDomainCollection = data.model().collection,
                bridgeDomain = kbHostRoute.model();

            bridgeDomainCollection.remove(bridgeDomain);
        },

        getBridgeDomains: function(attr) {
            var bridgeDomains = attr.bridge_domains.toJSON(),
                postData = {}, postDataArray = []
                vnFQN = getValueByJsonPath(attr, 'fq_name', []);;
            _.each(bridgeDomains, function(bridgeDomain){
                var bdAttrs = $.extend(true, {}, bridgeDomain.model().attributes),
                    bridgeDomainData = {};
                if(bdAttrs.uuid){
                    bridgeDomainData.uuid = bdAttrs.uuid;
                }
                bridgeDomainData.to = vnFQN.concat(bdAttrs.name);
                bridgeDomainData.isid = Number(bdAttrs.isid);
                bridgeDomainData.mac_learning_enabled = bdAttrs.mac_learning_enabled;
                //if(bdAttrs.mac_learning_enabled) {
                    bridgeDomainData.mac_limit_control = {};
                    bridgeDomainData.mac_limit_control.mac_limit =
                        Number(bdAttrs.mac_limit_control.mac_limit);
                    bridgeDomainData.mac_limit_control.mac_limit_action =
                        bdAttrs.mac_limit_control.mac_limit_action;
                    bridgeDomainData.mac_move_control = {};
                    bridgeDomainData.mac_move_control.mac_move_limit =
                        Number(bdAttrs.mac_move_control.mac_move_limit);
                    bridgeDomainData.mac_move_control.mac_move_limit_action =
                        bdAttrs.mac_move_control.mac_move_limit_action;
                    bridgeDomainData.mac_move_control.mac_move_time_window =
                        Number(bdAttrs.mac_move_control.mac_move_time_window);
                    bridgeDomainData.mac_aging_time = Number(bdAttrs.mac_aging_time);
                //}
                postDataArray.push(bridgeDomainData);
            });
            attr['bridge_domains'] = postDataArray;
            attr.mac_limit_control.mac_limit =
                Number(attr.mac_limit_control.mac_limit);
            attr.mac_move_control.mac_move_limit =
                Number(attr.mac_move_control.mac_move_limit);
            attr.mac_move_control.mac_move_time_window =
                Number(attr.mac_move_control.mac_move_time_window);
            attr.mac_aging_time = Number(attr.mac_aging_time);
            if(!attr.mac_learning_enabled) {
                delete attr.mac_limit_control;
                delete attr.mac_move_control;
                delete attr.mac_aging_time;
            }
        },
        readQoS: function(modelConfig) {
            var qosToArry = getValueByJsonPath(modelConfig,
                    "qos_config_refs;0;to", []);
            if(qosToArry.length === 3){
                modelConfig["qos_config_refs"] = qosToArry[0] +
                    cowc.DROPDOWN_VALUE_SEPARATOR + qosToArry[1] +
                    cowc.DROPDOWN_VALUE_SEPARATOR + qosToArry[2];
            } else {
                modelConfig["qos_config_refs"] = "";
            }
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
        addHostRouteByIndex: function(data, kbHostRoute) {
          var selectedRuleIndex = data.model().collection.indexOf(kbHostRoute.model());
          var hostRoute = this.model().attributes['user_created_host_routes'],
              newHostRoute = new HostRouteModel({'prefix': null,
                                                  'next_hop': null,
                                                 });
          hostRoute.add([newHostRoute],{at: selectedRuleIndex+1});
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
                                     'next_hop_type': null,
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

        readRouteTargetList: function (modelConfig, type) {
            var rtType = (type == 'user_created_route_targets' ?
                            'route_target_list':
                            type == 'user_created_export_route_targets' ?
                                    'export_route_target_list' : 'import_route_target_list');

            var routeTargetModels = [], routeTargetList = [];
            routeTargetList =
                    formatVNCfg.routeTargetFormatter(null, null,
                                                     rtType, -1, modelConfig);
            if (routeTargetList.length) {
                for(var i = 0; i < routeTargetList.length; i++) {
                    var routeTargetModel = new RouteTargetModel(routeTargetList[i]);
                    routeTargetModels.push(routeTargetModel);
                }
            }
            modelConfig[type] = new Backbone.Collection(routeTargetModels);
        },

        addRouteTarget: function(type) {
            var routeTarget = this.model().attributes[type],
                newRouteTarget = new RouteTargetModel({'asn': null,
                                                    'target': null,
                                                      });

            routeTarget.add([newRouteTarget]);
        },
        addRouteTargetByIndex: function(type, data, kbRouteTarget) {
            var selectedRuleIndex = data.model().collection.indexOf(kbRouteTarget.model());
            var routeTarget = this.model().attributes[type],
                newRouteTarget = new RouteTargetModel({'asn': null,
                                                    'target': null,
                                                      });

            routeTarget.add([newRouteTarget],{at: selectedRuleIndex+1});
        },

        deleteRouteTarget: function(data, kbRouteTarget) {
            var routeTargetCollection = data.model().collection,
                routeTarget = kbRouteTarget.model();

            routeTargetCollection.remove(routeTarget);
        },

        getRouteTargetList : function(attr, type) {
            var routeTargetCollection = attr[type].toJSON(),
                routeTargetArray = [];
            for(var i = 0; i < routeTargetCollection.length; i++) {
                var asn = routeTargetCollection[i].asn();
                var target = routeTargetCollection[i].target();
                if (asn && target) {
                    routeTargetArray.push('target:' +
                                    asn.trim() + ':' + target.trim());
                }
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
        addFipPoolByIndex: function(data, kbFipPool) {
            var selectedRuleIndex = data.model().collection.indexOf(kbFipPool.model());
            var fipPool = this.model().attributes['floating_ip_pools'],
                newFipPool = new FipPoolModel({'name': null,
                                               'projects': null,
                                                'disable': false});
            fipPool.add([newFipPool],{at: selectedRuleIndex+1});
        },
        deleteFipPool: function(data, kbFipPool) {
            var fipPoolCollection = data.model().collection,
                fipPool = kbFipPool.model();
            if (fipPool.attributes.name() != 'default' &&
                fipPool.attributes.disable() != true) {
                fipPoolCollection.remove(fipPool);
            }
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
                    var projList = fipPoolObj.projects().
                        split(cowc.DROPDOWN_VALUE_SEPARATOR);
                    var projects = []
                    _.each(projList, function (proj) {
                        var projData = proj ? proj.trim() : proj;
                        projects.push({'uuid': projData});
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
        addSubnetDNSByIndex: function(data, kbSubnetDNS) {
            var selectedRuleIndex = data.model().collection.indexOf(kbSubnetDNS.model());
            var subnetDNS = this.model().attributes['user_created_dns_servers'],
                newSubnetDNS = new SubnetDNSModel({'ip_address': null});

            subnetDNS.add([newSubnetDNS],{at: selectedRuleIndex+1});
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

            //flat subnet
            var flatIPAMList = formatVNCfg.flatSubnetModelFormatter(null,
                    null, null, -1, modelConfig);
            modelConfig["user_created_flat_subnet_ipam"] =
                flatIPAMList.join(ctwc.MULTISELECT_VALUE_SEPARATOR);

            //user defined subnet
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
        addSubnetByIndex: function(data, kbSubnet) {
          var self = this;
          var selectedRuleIndex = data.model().collection.indexOf(kbSubnet.model());
          var subnet = this.model().attributes['network_ipam_refs'],
              subnetModel = new SubnetModel();
          self.setSubnetChangeEvent(subnetModel);
          subnet.add([subnetModel],{at: selectedRuleIndex+1});
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
                policies = attr.network_policy_refs.split(
                    cowc.DROPDOWN_VALUE_SEPARATOR);
            }
            policies.every(function(policy) {
                policyList.push({'to': policy.split(':'),
                                 'attr': {'timer': null}});
                return true;
            });

            attr['network_policy_refs'] = policyList;
        },

        getStaticRouteList: function(attr) {
            var routes = [], routeList = [];

            if (attr.route_table_refs.length) {
                routes =
                    attr.route_table_refs.split(cowc.DROPDOWN_VALUE_SEPARATOR);
            }
            routes.every(function(route) {
                routeList.push({'to': route.split(':')});
                return true;
            });

            attr['route_table_refs'] = routeList;
        },

        getRoutingPolicyList: function(attr) {
            var policies = [], routingPolicyList = [];

            if (attr.routing_policy_refs.length) {
                policies =
                    attr.routing_policy_refs.split(cowc.DROPDOWN_VALUE_SEPARATOR);
            }
            policies.every(function(policy) {
                routingPolicyList.push({'to': policy.split(':')});
                return true;
            });

            attr['routing_policy_refs'] = routingPolicyList;
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
            var subnetCollection = attr.network_ipam_refs.toJSON(),
                subnetArray = [], ipamAssocArr = {}, dhcpOption;
            var dnsServers = this.getSubnetDNS(attr);
            var hostRoutes = this.getHostRouteList(attr);
            var disabledDNS = [{'dhcp_option_name': '6', 'dhcp_option_value' : '0.0.0.0'}];
            for(var i = 0; i < subnetCollection.length; i++) {
                var subnet = $.extend(true, {}, subnetCollection[i].model().attributes);
                if(subnet['dns_server_address'] === null){
                    delete subnet['dns_server_address'];
                }
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

                var ipam_fqn = subnet['user_created_ipam_fqn'];
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

                if (!(ipam_fqn in ipamAssocArr)) {
                    ipamAssocArr[ipam_fqn] = [];
                }
                ipamAssocArr[ipam_fqn].push(subnet);
            }
            for (var ipam in ipamAssocArr) {
                subnetArray.push({'to': ipam.split(cowc.DROPDOWN_VALUE_SEPARATOR),
                                  'attr' :
                                  {'ipam_subnets': ipamAssocArr[ipam]}
                                  });
            }
            //add flat subnet ipams
            var flatIpams = attr.user_created_flat_subnet_ipam ?
                attr.user_created_flat_subnet_ipam.split(ctwc.MULTISELECT_VALUE_SEPARATOR) : [];
            _.each(flatIpams, function(flatIpam){
                subnetArray.push({'to':
                    flatIpam.split(cowc.DROPDOWN_VALUE_SEPARATOR), 'attr': {'ipam_subnets':[]}});
            });
            delete attr.user_created_flat_subnet_ipam;
            attr['network_ipam_refs'] = subnetArray;
        },


        getProperties: function(attr) {
            var forwardingMode = getValueByJsonPath(attr,
                        'user_created_forwarding_mode', null);

            if (forwardingMode == null || forwardingMode == 'default') {
                delete attr['virtual_network_properties']['forwarding_mode'];
            } else {
                attr["virtual_network_properties"]["forwarding_mode"] =
                    forwardingMode;
            }
            delete attr.user_created_forwarding_mode;

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
                attr['virtual_network_properties']['rpf'] = 'disable';
            }
        },

        readProperties: function(attr) {

            attr['id_perms']['enable'] =
                         getValueByJsonPath(attr, 'id_perms;enable', true);

            attr['virtual_network_properties'] =
                         getValueByJsonPath(attr, 'virtual_network_properties', {});

            attr['virtual_network_properties']['allow_transit'] =
                         getValueByJsonPath(attr,
                                 'virtual_network_properties;allow_transit', false);

            attr['virtual_network_properties']['forwarding_mode'] =
                         getValueByJsonPath(attr,
                                 'virtual_network_properties;forwarding_mode', 'default');

            attr['virtual_network_properties']['rpf'] =
                    getValueByJsonPath(attr,
                        'virtual_network_properties;rpf', 'disable') == 'disable' ?
                         false : true;

            attr['user_created_vxlan_mode'] =
                (getValueByJsonPath(window.globalObj,
                'global-vrouter-config;global-vrouter-config;vxlan_network_identifier_mode',
                                'automatic') == 'configured');
        },


        getRouteTargets: function(attr) {
            attr['route_target_list'] = {};
            attr['route_target_list']['route_target'] =
                                             this.getRouteTargetList(attr,
                                                      'user_created_route_targets');
            if (!attr['route_target_list']['route_target'].length) {
                attr['route_target_list'] = {};
            }

            attr['export_route_target_list'] = {};
            attr['export_route_target_list']['route_target'] =
                                             this.getRouteTargetList(attr,
                                                      'user_created_export_route_targets');
            if (!attr['export_route_target_list']['route_target'].length) {
                attr['export_route_target_list'] = {};
            }

            attr['import_route_target_list'] = {};
            attr['import_route_target_list']['route_target'] =
                                             this.getRouteTargetList(attr,
                                                      'user_created_import_route_targets');
            if (!attr['import_route_target_list']['route_target'].length) {
                attr['import_route_target_list'] = {};
            }
        },

        getPhysicalRouters: function(attr) {
            var phyRouters = getValueByJsonPath(attr,
                        'physical_router_back_refs', '');

            var prList = phyRouters.split(cowc.DROPDOWN_VALUE_SEPARATOR);
            var prListCnt = prList.length;
            attr['physical_router_back_refs'] = [];
            for (var i = 0; i < prListCnt; i++) {
                if (prList[i].length > 0) {
                    attr['physical_router_back_refs'].push({uuid: prList[i]});
                }
            }
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

        updateModelAttrsForCurrentAllocMode: function(value) {
            //update forwarding mode
            if(value !== 'user-defined-subnet-only') {
                this.user_created_forwarding_mode("l3");
            } else {
                this.user_created_forwarding_mode("default");
            }
        },

        readSRIOV: function (modelConfig) {
            var segment_id   = getValueByJsonPath(modelConfig,
                                'provider_properties;segmentation_id', null);
            var physical_net = getValueByJsonPath(modelConfig,
                                'provider_properties;physical_network', null);

            if (segment_id != null && physical_net != null) {
                modelConfig['user_created_sriov_enabled'] = true;
            }
        },

        getSRIOV: function (attr) {
            var sriovEnabled = getValueByJsonPath(attr,
                            'user_created_sriov_enabled', false);
            if (sriovEnabled) {
                attr['provider_properties']['segmentation_id'] =
                    Number(getValueByJsonPath(attr,
                                'provider_properties;segmentation_id', 1));
            } else {
                attr['provider_properties'] = null;
            }
        },

        readEcmpHashing: function (modelConfig) {
            var hashArr       = [];
            var hashingFields = getValueByJsonPath(modelConfig,
                                'ecmp_hashing_include_fields', {});

            var hashingConfigured = getValueByJsonPath(hashingFields,
                    'hashing_configured', false);

            if (hashingConfigured == false) {
                modelConfig['ecmp_hashing_include_fields'] = '';
                return;
            }

            for (var key in hashingFields) {
                if (true == hashingFields[key]
                        && key != 'hashing_configured') {
                    hashArr.push(key);
                }
            }
            modelConfig['ecmp_hashing_include_fields'] = hashArr.join(',');
        },

        getEcmpHashing: function (attr) {
            var hashDisableCnt = 0, keyLen = 0;
            var hashingFields = getValueByJsonPath(attr,
                                'ecmp_hashing_include_fields', "");
            var hashObj       = {
                                    'source_ip': true,
                                    'destination_ip': true,
                                    'ip_protocol': true,
                                    'source_port': true,
                                    'destination_port': true
                                };

            for (var key in hashObj) {
                keyLen++;
                if (hashingFields.indexOf(key) == -1) {
                    hashObj[key] = false;
                    hashDisableCnt++;
                }
            }
            hashObj['hashing_configured'] = true;

            if (hashDisableCnt == keyLen) {
                hashObj = {}
            }

            attr['ecmp_hashing_include_fields'] = hashObj;
        },

        getQoS: function(attr) {
            var qos = getValueByJsonPath(attr, "qos_config_refs", ""),
                qosList = [];
            if(qos !== "none" && qos.trim() !== "") {
                qosList.push({"to": qos.split(cowc.DROPDOWN_VALUE_SEPARATOR)});
            }
            attr["qos_config_refs"] = qosList;
        },

        validations: {
            vnCfgConfigValidations: {
                'display_name': {
                    required: true,
                    msg: 'Enter Name'
                },
                'user_created_flat_subnet_ipam':
                function(value, attr, finalObj) {
                    if(finalObj.address_allocation_mode ===
                        'flat-subnet-only' && !value) {
                        return "Select Flat Subnet IPAM(s)";
                    }
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
                    if (isVCenter() && finalObj['uuid'] == null) {
                        var pVlanId = Number(value);
                        if ((isNaN(pVlanId) ||
                            (pVlanId < 1) || (pVlanId > 4094))) {
                            return "Enter Primary VLAN Identifier between 1 - 4094";
                        }
                    }
                    if (null != finalObj['sVlanId']) {
                        var sVlanId = Number(finalObj['sVlanId']);
                        if (pVlanId == sVlanId) {
                            return "Primany and Secondary VLAN identifier " +
                                "should not be same";
                        } else {
                            /* Remove any error message which was displayed in
                             * sVlanId lostFocus
                             */
                            ctwu.removeAttrErrorMsg(this, 'sVlanId');
                        }
                    }
                },
                'sVlanId' :
                function (value, attr, finalObj) {
                    if (isVCenter() && finalObj['uuid'] == null) {
                        var sVlanId = Number(value);
                        if ((isNaN(sVlanId) ||
                            (sVlanId < 1) || (sVlanId > 4094))) {
                            return "Enter Secondary VLAN Identifier between 1 - 4094";
                        }
                    }
                    if (null != finalObj['pVlanId']) {
                        var pVlanId = Number(finalObj['pVlanId']);
                        if (sVlanId == pVlanId) {
                            return "Primany and Secondary VLAN identifier " +
                                "should not be same";
                        } else {
                            /* Remove any error message which was displayed in
                             * pVlanId lostFocus
                             */
                            ctwu.removeAttrErrorMsg(this, 'pVlanId');
                        }
                    }
                },
                'provider_properties.physical_network':
                function (value, attr, finalObj) {
                    var sriovEnabled =
                        getValueByJsonPath(finalObj,
                        'user_created_sriov_enabled', false);
                    if (sriovEnabled) {
                        if (!value) {
                            return "Enter Physical Network Name";
                        }
                    }
                },
                'provider_properties.segmentation_id':
                function (value, attr, finalObj) {
                    var sriovEnabled =
                        getValueByJsonPath(finalObj,
                        'user_created_sriov_enabled', false),
                        vlanId = Number(value);
                    if (sriovEnabled) {
                        if (isNaN(vlanId) || (vlanId < 0 || vlanId > 4094))  {
                            return "Enter valid VLAN between 0 - 4094";
                        }
                    }
                },
                'mac_limit_control.mac_limit':
                    function (value, attr, finalObj) {
                    var macLimit = Number(value);
                    if (finalObj.mac_learning_enabled && isNaN(macLimit)) {
                        return "MAC Limit should be a number";
                    }
                },
                'mac_move_control.mac_move_limit':
                    function (value, attr, finalObj) {
                    var macMoveLimit = Number(value);
                    if (finalObj.mac_learning_enabled && isNaN(macMoveLimit)) {
                        return "MAC Move Limit should be a number";
                    }
                },
                'mac_move_control.mac_move_time_window':
                    function (value, attr, finalObj) {
                    var timeWindow = Number(value);
                    if (finalObj.mac_learning_enabled && (isNaN(timeWindow) ||
                        (timeWindow < 1) || (timeWindow > 60))) {
                        return "Enter MAC Move Time Window between 1 - 60";
                    }
                },
                'mac_aging_time':
                    function (value, attr, finalObj) {
                    var agingTime = Number(value);
                    if (finalObj.mac_learning_enabled && (isNaN(agingTime) ||
                        (agingTime < 0) || (agingTime > 86400))) {
                        return "Enter MAC Aging Time between 0 - 86400";
                    }
                }
            }
        },

        setVNPolicySequence: function(vnData) {
            var policyRefs =
                getValueByJsonPath(vnData,
                                   "virtual-network;network_policy_refs",
                                   []);
            var policyRefsLen = policyRefs.length;
            for (var i = 0; i < policyRefsLen; i++) {
                if (null == policyRefs[i].attr) {
                    vnData["virtual-network"]["network_policy_refs"][i].attr = {};
                }
                var timer = getValueByJsonPath(policyRefs, i + ";attr;timer", null);
                vnData["virtual-network"]["network_policy_refs"][i].attr.timer = timer;
                vnData["virtual-network"]["network_policy_refs"][i].attr.sequence =
                    {major: i, minor: 0};
            }
        },
        addEditVNCfg: function (callbackObj, ajaxMethod) {
            var ajaxConfig = {}, returnFlag = false;
            var postData = {'virtual-network':{}}, postReq;

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
                              },
                              {
                                key: 'user_created_export_route_targets',
                                type: cowc.OBJECT_TYPE_COLLECTION,
                                getValidation: 'routeTargetModelConfigValidations'
                              },
                              {
                                key: 'user_created_import_route_targets',
                                type: cowc.OBJECT_TYPE_COLLECTION,
                                getValidation: 'routeTargetModelConfigValidations'
                              },
                              {
                                  key: 'bridge_domains',
                                  type: cowc.OBJECT_TYPE_COLLECTION,
                                  getValidation: 'bridgeDomainModelConfigValidations'
                              },
                              //permissions
                              ctwu.getPermissionsValidation()
                             ];

            var that = this;
            if (this.isDeepValid(validation)) {
                    locks = this.model().attributes.locks.attributes;

                var newVNCfgData = $.extend(true,
                                            {}, this.model().attributes);

                var domain = contrail.getCookie(cowc.COOKIE_DOMAIN);
                var project = contrail.getCookie(cowc.COOKIE_PROJECT);

                ctwu.setNameFromDisplayName(newVNCfgData);

                if (newVNCfgData['fq_name'] == null ||
                    !newVNCfgData['fq_name'].length) {
                    newVNCfgData['fq_name'] = [];
                    newVNCfgData['fq_name'][0] = domain;
                    newVNCfgData['fq_name'][1] = project;
                    newVNCfgData['fq_name'][2] = newVNCfgData['name'];
                }
                newVNCfgData['security_logging_object_refs'] = ctwu.setSloToModel(newVNCfgData);
                this.getFipPools(newVNCfgData);
                this.getAdminState(newVNCfgData);
                this.getPhysicalRouters(newVNCfgData);
                this.getProperties(newVNCfgData);
                //reset user defined ipam_subnets for flat subnet only case
                if(newVNCfgData.address_allocation_mode === 'flat-subnet-only') {
                    newVNCfgData.network_ipam_refs.reset();
                }

                //clear flat_subnets for user defined subnet only case
                if(newVNCfgData.address_allocation_mode === 'user-defined-subnet-only') {
                    newVNCfgData.user_created_flat_subnet_ipam = '';
                }
                this.getSubnetList(newVNCfgData);
                this.getPolicyList(newVNCfgData);
                this.getStaticRouteList(newVNCfgData);
                this.getRouteTargets(newVNCfgData);
                this.getSRIOV(newVNCfgData);
                this.getEcmpHashing(newVNCfgData);
                this.getQoS(newVNCfgData);
                this.getBridgeDomains(newVNCfgData);
                this.getRoutingPolicyList(newVNCfgData);

                //ip fabric forwarding
                if(newVNCfgData.user_created_ip_fabric_forwarding === true) {
                    newVNCfgData['virtual_network_refs'] =
                        [{'to': ['default-domain', 'default-project', ctwc.IP_FABRIC_VN]}];
                } else if(newVNCfgData['name'] !== ctwc.IP_FABRIC_VN) {
                    newVNCfgData['virtual_network_refs'] = [];
                }

                //permissions
                this.updateRBACPermsAttrs(newVNCfgData);

                if (!isVCenter()) {
                    delete newVNCfgData.pVlanId;
                    delete newVNCfgData.external_ipam;
                } else {
                    newVNCfgData['pVlanId'] =
                        Number(getValueByJsonPath(newVNCfgData, 'sVlanId', 0));
                }

                delete newVNCfgData.virtual_network_network_id;
                delete newVNCfgData.errors;
                delete newVNCfgData.locks;
                delete newVNCfgData.cgrid;
                //delete newVNCfgData.id_perms;
                delete newVNCfgData.href;
                delete newVNCfgData.elementConfigMap;
                delete newVNCfgData.parent_href;
                delete newVNCfgData.user_created_host_routes;
                delete newVNCfgData.user_created_route_targets;
                delete newVNCfgData.user_created_export_route_targets;
                delete newVNCfgData.user_created_import_route_targets;
                delete newVNCfgData.user_created_sriov_enabled;
                delete newVNCfgData.user_created_dns_servers;
                delete newVNCfgData.sVlanId;
                delete newVNCfgData.disable;
                delete newVNCfgData.user_created_vxlan_mode;
                delete newVNCfgData.user_created_ip_fabric_forwarding;

                postData['virtual-network'] = newVNCfgData;
                /* Set the sequence number in policy_refs */
                this.setVNPolicySequence(postData);

                var ajaxType       = contrail.checkIfExist(ajaxMethod) ?
                                                           ajaxMethod : "POST";
                var postURL         = ctwc.URL_CREATE_CONFIG_OBJECT;
                if (isVCenter()) {
                    postURL         = "/vcenter/api/tenants/config/virtual-networks";
                }
                var putURL         = ctwc.URL_UPDATE_CONFIG_OBJECT;
                ajaxConfig.data    = JSON.stringify(postData);
                ajaxConfig.url     = ajaxType == 'PUT' ? putURL : postURL;
                ajaxConfig.type    = 'POST';
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
