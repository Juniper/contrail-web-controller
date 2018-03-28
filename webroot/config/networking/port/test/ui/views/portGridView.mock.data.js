/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore'], function(_){
     this.portDomainsData = {
         "domains": [
           {
             "fq_name": [
               "default-domain"
             ],
             "uuid": "a62c5b74-808b-4295-9c83-8c61588e5d39"
           }
         ]
     };

     this.portPojectsData = {
         "projects": [
           {
             "uuid": "6ddecd27-6ac1-4007-8eaf-eb6fdc7442e4",
             "fq_name": [
               "default-domain",
               "admin"
             ]
           },
           {
             "uuid": "1034c63f-dc15-4788-b746-0ee22378befc",
             "fq_name": [
               "default-domain",
               "demo"
             ]
           }
         ]
     };

     this.portUUIDListData =
     [
       "b5577a6e-0102-448e-af7b-89ca473e6f3a",
       "704ccb89-94d6-43ab-a245-c7b825b409dd"
     ];
     this.portModalMockCNInput = {
             "virtualNetworkName": "test_refs"
     };
     this.portModalMockCNOutput = {
        "virtual-machine-interface" : {
            "fq_name" : [ "default-domain", "admin" ],
            "parent_type" : "project",
            "id_perms" : {
                "enable" : true
            },
            "virtual_network_refs" : [ {
                "to" : [ "default-domain", "admin", "test_refs" ]
            } ],
            "port_security_enabled" : true,
            "floating_ip_back_refs" : [],
            "virtual_machine_interface_allowed_address_pairs" : {},
            "virtual_machine_interface_device_owner" : "",
            "security_logging_object_refs" : [],
            "service_health_check_refs" : [],
            "instance_ip_back_refs" : [ {
                "instance_ip_address" : [ {
                    "fixedIp" : "",
                    "domain" : "default-domain",
                    "project" : "admin"
                } ],
                "subnet_uuid" : "26ca114a-5fb9-488a-892d-b76041530fff",
                "instance_ip_family" : "v4"
            } ],
            "interface_route_table_refs" : [],
            "virtual_machine_interface_dhcp_option_list" : {},
            "virtual_machine_interface_fat_flow_protocols" : {
                "fat_flow_protocol" : []
            },
            "virtual_machine_interface_bindings" : {
                "key_value_pair" : []
            },
            "virtual_machine_interface_properties" : {
                "local_preference" : null,
                "interface_mirror" : null
            },
            "virtual_machine_interface_refs" : [],
            "ecmp_hashing_include_fields" : {},
            "virtual_machine_interface_disable_policy" : false,
            "qos_config_refs" : [],
            "bridge_domain_refs" : [],
            "perms2" : {
                "owner_access" : 7,
                "global_access" : 0,
                "share" : []
            },
            "tag_refs" : []
        }
     };
     this.portMockData =
         [
             {
               "virtual-machine-interface": {
                 "routing_instance_refs": [
                   {
                     "to": [
                       "default-domain",
                       "admin",
                       "test_refs"
                     ],
                     "attr": {
                       "direction": "both",
                       "protocol": null,
                       "ipv6_service_chain_address": null,
                       "dst_mac": null,
                       "mpls_label": null,
                       "vlan_tag": null,
                       "src_mac": null,
                       "service_chain_address": null
                     },
                     "uuid": "1bb8a04e-d559-4501-976a-3e7d0a917f11"
                   }
                 ],
                 "virtual_machine_interface_mac_addresses": {
                   "mac_address": [
                     "02:1a:5d:0c:a4:d9"
                   ]
                 },
                 "virtual_machine_interface_bindings": {
                   "key_value_pair": [
                     {
                       "key": "vnic_type",
                       "value": "normal"
                     }
                   ]
                 },
                 "parent_type": "project",
                 "href": "http://nodeg7:8082/virtual-machine-interface/1a5d0ca4-d969-47fc-ba9e-d302fc30a63f",
                 "virtual_machine_interface_device_owner": "",
                 "port_security_enabled": true,
                 "parent_uuid": "bebe0474-6c75-492c-a5dc-fef977374915",
                 "display_name": "1a5d0ca4-d969-47fc-ba9e-d302fc30a63f",
                 "uuid": "1a5d0ca4-d969-47fc-ba9e-d302fc30a63f",
                 "security_group_refs": [
                   {
                     "to": [
                       "default-domain",
                       "admin",
                       "default"
                     ],
                     "attr": null,
                     "uuid": "0b550b5c-f240-4fa2-8840-aa571a84be00"
                   }
                 ],
                 "virtual_machine_interface_disable_policy": false,
                 "virtual_network_refs": [
                   {
                     "to": [
                       "default-domain",
                       "admin",
                       "test_refs"
                     ],
                     "attr": null,
                     "uuid": "f353a90f-6e0e-4641-aff9-8d0fe74ca548"
                   }
                 ],
                 "id_perms": {
                   "enable": true,
                   "uuid": {
                     "uuid_mslong": 1899688519981942800,
                     "uuid_lslong": 13447417547149322000
                   },
                   "created": "2018-01-22T12:03:19.886487",
                   "description": null,
                   "creator": null,
                   "user_visible": true,
                   "last_modified": "2018-01-23T09:56:41.660806",
                   "permissions": {
                     "owner": "admin",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "admin",
                     "group_access": 7
                   }
                 },
                 "virtual_machine_interface_properties": {
                   "local_preference": null,
                   "interface_mirror": null
                 },
                 "ecmp_hashing_include_fields": {},
                 "virtual_machine_interface_allowed_address_pairs": {},
                 "perms2": {
                   "owner": "bebe04746c75492ca5dcfef977374915",
                   "owner_access": 7,
                   "global_access": 0,
                   "share": []
                 },
                 "bgp_router_refs": [
                   {
                     "to": [
                       "default-domain",
                       "admin",
                       "test_refs",
                       "1a5d0ca4-d969-47fc-ba9e-d302fc30a63f"
                     ],
                     "attr": null,
                     "uuid": "5c906bdc-8423-404d-942c-7432d6daae2b"
                   }
                 ],
                 "fq_name": [
                   "default-domain",
                   "admin",
                   "1a5d0ca4-d969-47fc-ba9e-d302fc30a63f"
                 ],
                 "name": "1a5d0ca4-d969-47fc-ba9e-d302fc30a63f",
                 "virtual_machine_interface_dhcp_option_list": {}
               }
             },
             {
               "virtual-machine-interface": {
                 "routing_instance_refs": [
                   {
                     "to": [
                       "default-domain",
                       "admin",
                       "test_refs"
                     ],
                     "attr": {
                       "direction": "both",
                       "protocol": null,
                       "ipv6_service_chain_address": null,
                       "dst_mac": null,
                       "mpls_label": null,
                       "vlan_tag": null,
                       "src_mac": null,
                       "service_chain_address": null
                     },
                     "uuid": "1bb8a04e-d559-4501-976a-3e7d0a917f11"
                   }
                 ],
                 "virtual_machine_interface_mac_addresses": {
                   "mac_address": [
                     "02:65:b6:b2:3b:79"
                   ]
                 },
                 "virtual_machine_interface_bindings": {
                   "key_value_pair": [
                     {
                       "key": "vnic_type",
                       "value": "normal"
                     }
                   ]
                 },
                 "parent_type": "project",
                 "href": "http://nodeg7:8082/virtual-machine-interface/65b6b23b-79d1-47e5-a5db-ff48830337a1",
                 "virtual_machine_interface_device_owner": "",
                 "port_security_enabled": true,
                 "parent_uuid": "bebe0474-6c75-492c-a5dc-fef977374915",
                 "display_name": "port1",
                 "uuid": "65b6b23b-79d1-47e5-a5db-ff48830337a1",
                 "security_group_refs": [
                   {
                     "to": [
                       "default-domain",
                       "admin",
                       "default"
                     ],
                     "attr": null,
                     "uuid": "0b550b5c-f240-4fa2-8840-aa571a84be00"
                   }
                 ],
                 "virtual_machine_interface_disable_policy": false,
                 "virtual_network_refs": [
                   {
                     "to": [
                       "default-domain",
                       "admin",
                       "test_refs"
                     ],
                     "attr": null,
                     "uuid": "f353a90f-6e0e-4641-aff9-8d0fe74ca548"
                   }
                 ],
                 "id_perms": {
                   "enable": true,
                   "description": null,
                   "creator": null,
                   "created": "2018-01-27T10:16:36.326121",
                   "user_visible": true,
                   "last_modified": "2018-01-27T10:16:36.357365",
                   "permissions": {
                     "owner": "cloud-admin",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "cloud-admin-group",
                     "group_access": 7
                   },
                   "uuid": {
                     "uuid_mslong": 7329241412108634000,
                     "uuid_lslong": 11951426723058498000
                   }
                 },
                 "virtual_machine_interface_properties": {
                   "local_preference": null,
                   "interface_mirror": null
                 },
                 "ecmp_hashing_include_fields": {},
                 "virtual_machine_interface_allowed_address_pairs": {},
                 "virtual_machine_interface_fat_flow_protocols": {
                   "fat_flow_protocol": [
                     {
                       "protocol": "tcp",
                       "port": 100,
                       "ignore_address": "remote"
                     }
                   ]
                 },
                 "perms2": {
                   "owner": "bebe04746c75492ca5dcfef977374915",
                   "owner_access": 7,
                   "global_access": 0,
                   "share": []
                 },
                 "instance_ip_back_refs": [
                   {
                     "to": [
                       "b2e1b93e-ad5c-48c8-833c-bc89afcf5f74"
                     ],
                     "attr": null,
                     "uuid": "b2e1b93e-ad5c-48c8-833c-bc89afcf5f74",
                     "fixedip": {
                       "ip": "11.11.11.3",
                       "subnet_uuid": "26ca114a-5fb9-488a-892d-b76041530fff"
                     }
                   }
                 ],
                 "fq_name": [
                   "default-domain",
                   "admin",
                   "port1"
                 ],
                 "name": "port1",
                 "virtual_machine_interface_dhcp_option_list": {}
               }
             }
       ];
       this.allVirtualnetworks = [
           {
               "virtual-network": {
                 "parent_uuid": "bebe0474-6c75-492c-a5dc-fef977374915",
                 "address_allocation_mode": "user-defined-subnet-only",
                 "parent_type": "project",
                 "route_target_list": {
                   "route_target": []
                 },
                 "mac_learning_enabled": false,
                 "pbb_etree_enable": false,
                 "fq_name": [
                   "default-domain",
                   "admin",
                   "test_refs"
                 ],
                 "uuid": "f353a90f-6e0e-4641-aff9-8d0fe74ca548",
                 "name": "test_refs",
                 "id_perms": {
                   "enable": true,
                   "uuid": {
                     "uuid_mslong": 17533543658019506000,
                     "uuid_lslong": 12680321325282929000
                   },
                   "created": "2018-01-22T11:34:12.024537",
                   "description": null,
                   "creator": null,
                   "user_visible": true,
                   "last_modified": "2018-01-22T11:40:20.698938",
                   "permissions": {
                     "owner": "admin",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "admin",
                     "group_access": 7
                   }
                 },
                 "multi_policy_service_chains_enabled": false,
                 "virtual_network_properties": {
                   "allow_transit": false,
                   "mirror_destination": false,
                   "rpf": "enable"
                 },
                 "ecmp_hashing_include_fields": {},
                 "network_policy_refs": [
                   {
                     "to": [
                       "default-domain",
                       "admin",
                       "pol2"
                     ],
                     "attr": {
                       "timer": null
                     },
                     "uuid": "9c5da855-f558-4a42-9d91-2b0bb2941b28"
                   }
                 ],
                 "provider_properties": null,
                 "perms2": {
                   "owner": "bebe04746c75492ca5dcfef977374915",
                   "owner_access": 7,
                   "global_access": 0,
                   "share": []
                 },
                 "display_name": "test_refs",
                 "virtual_network_network_id": 5,
                 "import_route_target_list": {
                   "route_target": []
                 },
                 "is_shared": false,
                 "router_external": false,
                 "pbb_evpn_enable": false,
                 "export_route_target_list": {
                   "route_target": []
                 },
                 "flood_unknown_unicast": false,
                 "layer2_control_word": false,
                 "network_ipam_refs": [
                   {
                     "subnet": {
                       "ipam_subnet": "11.11.11.0/24",
                       "default_gateway": "11.11.11.1",
                       "enable_dhcp": true,
                       "dns_server_address": "11.11.11.2",
                       "allocation_pools": "",
                       "host_routes": "",
                       "dhcp_option_list": "",
                       "subnet_uuid": "26ca114a-5fb9-488a-892d-b76041530fff",
                       "ipam": [
                         "default-domain",
                         "default-project",
                         "default-network-ipam"
                       ]
                     }
                   }
                 ]
               }
             },
             {
               "virtual-network": {
                 "virtual_network_properties": {
                   "allow_transit": false,
                   "mirror_destination": false,
                   "rpf": "enable"
                 },
                 "ecmp_hashing_include_fields": {},
                 "display_name": "vn_networks1",
                 "is_shared": false,
                 "address_allocation_mode": "user-defined-subnet-only",
                 "export_route_target_list": {
                   "route_target": []
                 },
                 "router_external": false,
                 "name": "vn_networks1",
                 "parent_uuid": "bebe0474-6c75-492c-a5dc-fef977374915",
                 "parent_type": "project",
                 "import_route_target_list": {
                   "route_target": []
                 },
                 "route_target_list": {
                   "route_target": []
                 },
                 "perms2": {
                   "owner": "bebe04746c75492ca5dcfef977374915",
                   "owner_access": 7,
                   "global_access": 0,
                   "share": []
                 },
                 "flood_unknown_unicast": false,
                 "id_perms": {
                   "enable": true,
                   "uuid": {
                     "uuid_mslong": 13604473922492647000,
                     "uuid_lslong": 10643489204459215000
                   },
                   "created": "2018-01-22T11:17:20.684271",
                   "description": null,
                   "creator": null,
                   "user_visible": true,
                   "last_modified": "2018-01-22T11:17:20.684271",
                   "permissions": {
                     "owner": "admin",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "admin",
                     "group_access": 7
                   }
                 },
                 "fq_name": [
                   "default-domain",
                   "admin",
                   "vn_networks1"
                 ],
                 "uuid": "bcccccf3-f23d-4434-93b5-450a327f19fe",
                 "multi_policy_service_chains_enabled": false,
                 "virtual_network_network_id": 4,
                 "network_ipam_refs": []
               }
             }
           ];
       this.securityGrpData = {
               "security-groups": [
                   {
                     "href": "http://nodeg7:8082/security-group/0b550b5c-f240-4fa2-8840-aa571a84be00",
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "default"
                     ],
                     "uuid": "0b550b5c-f240-4fa2-8840-aa571a84be00"
                   }
                 ]
               };

       return {
           portDomainsData: portDomainsData,
           portPojectsData: portPojectsData,
           portUUIDListData: portUUIDListData,
           portMockData: portMockData,
           portModalMockCNInput: portModalMockCNInput,
           portModalMockCNOutput: portModalMockCNOutput,
           allVirtualnetworks: allVirtualnetworks,
           securityGrpData: securityGrpData
       };
 });
