/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore','common/test/ui/unit/ct.common.mock.data'], function(_,TestCommonMockdata){
     this.virtualNetworksMockData =
     {
             "virtual-networks": [
               {
                 "virtual-network": {
                   "parent_uuid": "a56e6d1c-cb66-4cd4-8b2e-4d0f2be72382",
                   "address_allocation_mode": "user-defined-subnet-only",
                   "parent_type": "project",
                   "route_target_list": {
                     "route_target": []
                   },
                   "href": "http://nodeg3:8082/virtual-network/c6b2e29d-029b-4467-9aff-fa02e4d2573b",
                   "mac_learning_enabled": false,
                   "pbb_etree_enable": false,
                   "display_name": "vn_test_akhilfSept5th17",
                   "virtual_network_network_id": 12,
                   "name": "vn_test_akhilfSept5th17",
                   "id_perms": {
                     "enable": true,
                     "description": null,
                     "creator": null,
                     "created": "2017-09-05T11:18:22.738399",
                     "user_visible": true,
                     "last_modified": "2017-09-08T09:01:07.038112",
                     "permissions": {
                       "owner": "admin",
                       "owner_access": 7,
                       "other_access": 7,
                       "group": "admin",
                       "group_access": 7
                     },
                     "uuid": {
                       "uuid_mslong": 14317755329345702000,
                       "uuid_lslong": 11168920491237988000
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
                         "pol1"
                       ],
                       "attr": {
                         "timer": null,
                         "sequence": {
                           "major": 0,
                           "minor": 0
                         }
                       },
                       "uuid": "34e5c55d-ebab-47a0-849d-d0cf55422f91"
                     },
                     {
                       "to": [
                         "default-domain",
                         "admin",
                         "hr_sales_policy"
                       ],
                       "attr": {
                         "timer": null,
                         "sequence": {
                           "major": 1,
                           "minor": 0
                         }
                       },
                       "uuid": "f848d824-1fc8-4340-897d-52752bb827cd"
                     }
                   ],
                   "provider_properties": null,
                   "perms2": {
                     "owner": "a56e6d1ccb664cd48b2e4d0f2be72382",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "fq_name": [
                     "default-domain",
                     "admin",
                     "vn_test_akhilfSept5th17"
                   ],
                   "uuid": "c6b2e29d-029b-4467-9aff-fa02e4d2573b",
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
                       "to": [
                         "default-domain",
                         "default-project",
                         "default-network-ipam"
                       ],
                       "attr": {
                         "ipam_subnets": [
                           {
                             "subnet": {
                               "ip_prefix": "200.200.200.0",
                               "ip_prefix_len": 24
                             },
                             "addr_from_start": true,
                             "enable_dhcp": true,
                             "default_gateway": "200.200.200.1",
                             "subnet_uuid": "f5a241bf-931d-4502-bf45-b52af219d9c2",
                             "dhcp_option_list": {
                               "dhcp_option": [
                                 {
                                   "dhcp_option_value": "50.50.50.6",
                                   "dhcp_option_name": "6"
                                 }
                               ]
                             },
                             "subnet_name": "f5a241bf-931d-4502-bf45-b52af219d9c2",
                             "dns_server_address": "20.12.13.35"
                           },
                           {
                             "subnet": {
                               "ip_prefix": "201.201.201.0",
                               "ip_prefix_len": 24
                             },
                             "addr_from_start": true,
                             "enable_dhcp": true,
                             "default_gateway": "201.201.201.1",
                             "subnet_uuid": "1ef146ad-4f79-4fad-aa21-8152158227ef",
                             "dhcp_option_list": {
                               "dhcp_option": [
                                 {
                                   "dhcp_option_value": "50.50.50.6",
                                   "dhcp_option_name": "6"
                                 }
                               ]
                             },
                             "subnet_name": "1ef146ad-4f79-4fad-aa21-8152158227ef",
                             "dns_server_address": "20.12.13.35"
                           }
                         ]
                       },
                       "uuid": "d23d4f0c-3b5d-439a-8764-b86634507cc5"
                     }
                   ]
                 }
               },
               {
                 "virtual-network": {
                   "parent_uuid": "a56e6d1c-cb66-4cd4-8b2e-4d0f2be72382",
                   "address_allocation_mode": "user-defined-subnet-only",
                   "parent_type": "project",
                   "route_target_list": {
                     "route_target": []
                   },
                   "href": "http://nodeg3:8082/virtual-network/b4e1853e-7fe5-4e60-a484-487438871161",
                   "mac_learning_enabled": false,
                   "pbb_etree_enable": false,
                   "fq_name": [
                     "default-domain",
                     "admin",
                     "vn11"
                   ],
                   "virtual_network_network_id": 8,
                   "name": "vn11",
                   "id_perms": {
                     "enable": true,
                     "uuid": {
                       "uuid_mslong": 13033845300067127000,
                       "uuid_lslong": 11854679783147770000
                     },
                     "creator": null,
                     "created": "2017-09-05T12:53:34.730132",
                     "user_visible": true,
                     "last_modified": "2017-09-06T10:55:55.640668",
                     "permissions": {
                       "owner": "admin",
                       "owner_access": 7,
                       "other_access": 7,
                       "group": "admin",
                       "group_access": 7
                     },
                     "description": null
                   },
                   "multi_policy_service_chains_enabled": false,
                   "virtual_network_properties": {
                     "allow_transit": false,
                     "mirror_destination": false,
                     "rpf": "enable"
                   },
                   "ecmp_hashing_include_fields": {},
                   "provider_properties": null,
                   "perms2": {
                     "owner": "a56e6d1ccb664cd48b2e4d0f2be72382",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "display_name": "vn11",
                   "uuid": "b4e1853e-7fe5-4e60-a484-487438871161",
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
                       "to": [
                         "default-domain",
                         "default-project",
                         "default-network-ipam"
                       ],
                       "attr": {
                         "ipam_subnets": [
                           {
                             "subnet": {
                               "ip_prefix": "11.11.11.0",
                               "ip_prefix_len": 24
                             },
                             "addr_from_start": true,
                             "enable_dhcp": true,
                             "default_gateway": "11.11.11.1",
                             "subnet_uuid": "e80b4cd7-a531-47b5-a30d-cc5b447c1ec8",
                             "dhcp_option_list": {
                               "dhcp_option": [
                                 {
                                   "dhcp_option_value": "1.1.1.1 2.2.2.2",
                                   "dhcp_option_name": "6"
                                 }
                               ]
                             },
                             "subnet_name": "e80b4cd7-a531-47b5-a30d-cc5b447c1ec8",
                             "dns_server_address": "3.3.3.3"
                           }
                         ]
                       },
                       "uuid": "d23d4f0c-3b5d-439a-8764-b86634507cc5"
                     }
                   ]
                 }
               },
               {
                 "virtual-network": {
                   "parent_uuid": "a56e6d1c-cb66-4cd4-8b2e-4d0f2be72382",
                   "address_allocation_mode": "user-defined-subnet-only",
                   "parent_type": "project",
                   "route_target_list": {
                     "route_target": []
                   },
                   "href": "http://nodeg3:8082/virtual-network/a7111539-5171-4d8d-a54c-b668c3236979",
                   "mac_learning_enabled": false,
                   "pbb_etree_enable": false,
                   "fq_name": [
                     "default-domain",
                     "admin",
                     "manojvn"
                   ],
                   "virtual_network_network_id": 7,
                   "name": "manojvn",
                   "id_perms": {
                     "enable": true,
                     "description": null,
                     "creator": null,
                     "created": "2017-09-05T06:51:48.550619",
                     "user_visible": true,
                     "last_modified": "2017-09-05T06:52:27.737806",
                     "permissions": {
                       "owner": "admin",
                       "owner_access": 7,
                       "other_access": 7,
                       "group": "admin",
                       "group_access": 7
                     },
                     "uuid": {
                       "uuid_mslong": 12038426614861746000,
                       "uuid_lslong": 11911095675554850000
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
                         "pol1"
                       ],
                       "attr": {
                         "timer": null,
                         "sequence": {
                           "major": 0,
                           "minor": 0
                         }
                       },
                       "uuid": "34e5c55d-ebab-47a0-849d-d0cf55422f91"
                     }
                   ],
                   "provider_properties": null,
                   "perms2": {
                     "owner": "a56e6d1ccb664cd48b2e4d0f2be72382",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "display_name": "manojvn",
                   "uuid": "a7111539-5171-4d8d-a54c-b668c3236979",
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
                       "to": [
                         "default-domain",
                         "default-project",
                         "default-network-ipam"
                       ],
                       "attr": {
                         "ipam_subnets": [
                           {
                             "subnet": {
                               "ip_prefix": "34.34.34.0",
                               "ip_prefix_len": 24
                             },
                             "addr_from_start": true,
                             "enable_dhcp": true,
                             "default_gateway": "34.34.34.1",
                             "subnet_uuid": "04afe885-3e2b-42a0-9753-20842374b8f0",
                             "dhcp_option_list": {
                               "dhcp_option": [
                                 {
                                   "dhcp_option_value": "55.55.55.55",
                                   "dhcp_option_name": "6"
                                 }
                               ]
                             },
                             "subnet_name": "04afe885-3e2b-42a0-9753-20842374b8f0",
                             "dns_server_address": "34.34.34.2"
                           }
                         ]
                       },
                       "uuid": "d23d4f0c-3b5d-439a-8764-b86634507cc5"
                     }
                   ]
                 }
               }
             ]
           };
       this.floatingIPPools = [
           {
               "floating-ip-pools": [
                 {
                   "floating-ip-pool": {
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "dbvn",
                       "fip1"
                     ],
                     "uuid": "b1b5bbc8-373d-4491-aa45-89d98256c9da",
                     "href": "http://nodeg7:8082/floating-ip-pool/b1b5bbc8-373d-4491-aa45-89d98256c9da",
                     "parent_type": "virtual-network",
                     "name": "fip1",
                     "perms2": {
                       "owner": "944e0f33117641e185cee2de4f4073f8",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "project_back_refs": [
                       {
                         "to": [
                           "default-domain",
                           "admin"
                         ],
                         "attr": null,
                         "uuid": "944e0f33-1176-41e1-85ce-e2de4f4073f8"
                       }
                     ],
                     "display_name": "fip1",
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 12805347584092490000,
                         "uuid_lslong": 12269364327128418000
                       },
                       "created": "2017-11-07T13:20:25.118543",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-11-07T13:20:25.118543",
                       "permissions": {
                         "owner": "cloud-admin",
                         "owner_access": 7,
                         "other_access": 7,
                         "group": "cloud-admin-group",
                         "group_access": 7
                       }
                     },
                     "parent_uuid": "b1abd2af-0a77-4065-89f1-97009fc7cb0f"
                   }
                 }
               ]
             }
           ];
       this.globalVrouterConfig = {
               "global-vrouter-config": {
                   "ecmp_hashing_include_fields": {
                     "destination_ip": true,
                     "ip_protocol": true,
                     "source_ip": true,
                     "hashing_configured": true,
                     "source_port": true,
                     "destination_port": true
                   },
                   "parent_uuid": "379685d7-bb35-42ed-ac14-7b16d915c310",
                   "parent_href": "http://nodeg7:8082/global-system-config/379685d7-bb35-42ed-ac14-7b16d915c310",
                   "parent_type": "global-system-config",
                   "flow_export_rate": -1,
                   "perms2": {
                     "owner": "cloud-admin",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "href": "http://nodeg7:8082/global-vrouter-config/028f3f27-7d8b-470e-9552-187ce9269302",
                   "id_perms": {
                     "enable": true,
                     "description": null,
                     "creator": null,
                     "created": "2017-11-06T07:33:56.992986",
                     "user_visible": true,
                     "last_modified": "2017-11-06T11:29:50.726038",
                     "permissions": {
                       "owner": "cloud-admin",
                       "owner_access": 7,
                       "other_access": 7,
                       "group": "cloud-admin-group",
                       "group_access": 7
                     },
                     "uuid": {
                       "uuid_mslong": 184435548588033800,
                       "uuid_lslong": 10759689384508166000
                     }
                   },
                   "vxlan_network_identifier_mode": "automatic",
                   "enable_security_logging": true,
                   "name": "default-global-vrouter-config",
                   "forwarding_mode": null,
                   "fq_name": [
                     "default-global-system-config",
                     "default-global-vrouter-config"
                   ],
                   "uuid": "028f3f27-7d8b-470e-9552-187ce9269302",
                   "linklocal_services": {
                     "linklocal_service_entry": [
                       {
                         "linklocal_service_name": "metadata",
                         "ip_fabric_service_ip": [
                           "10.204.217.47"
                         ],
                         "linklocal_service_ip": "169.254.169.254",
                         "ip_fabric_service_port": 8775,
                         "ip_fabric_DNS_service_name": "",
                         "linklocal_service_port": 80
                       }
                     ]
                   },
                   "encapsulation_priorities": {
                     "encapsulation": [
                       "MPLSoUDP",
                       "MPLSoGRE",
                       "VXLAN"
                     ]
                   },
                   "application_policy_set_back_refs": [
                     {
                       "to": [
                         "default-policy-management",
                         "default-application-policy-set"
                       ],
                       "href": "http://nodeg7:8082/application-policy-set/33434751-b86a-4b09-8e99-b09da2aff376",
                       "attr": null,
                       "uuid": "33434751-b86a-4b09-8e99-b09da2aff376"
                     }
                   ]
                 }
               }
       return {
           domainData: TestCommonMockdata.domainData,
           projectData: TestCommonMockdata.projectData,
           virtualNetworksMockData: virtualNetworksMockData,
           floatingIPPools: floatingIPPools,
           globalVrouterConfig: globalVrouterConfig
       };
 });
