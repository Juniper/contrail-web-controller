/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore'], function(_){
     this.loadbalancerDomainsData = {
         "domains": [
           {
             "fq_name": [
               "default-domain"
             ],
             "uuid": "f1f5fd91-8016-4f0f-a0f3-b67e779f1d08"
           }
         ]
     };

     this.loadbalancerPojectsData = {
         "projects": [
           {
             "uuid": "36bb47ab-3969-4669-b8e1-b1f5b70f86f1",
             "fq_name": [
               "default-domain",
               "admin"
             ]
           },
           {
             "uuid": "4bd4121b-5d0a-4994-b424-7d7e3656a75b",
             "fq_name": [
               "default-domain",
               "services"
             ]
           },
           {
               "uuid": "9beafc3c-0ff2-490a-86b7-5a81ca6c7a68",
               "fq_name": [
                 "default-domain",
                 "project1"
               ]
           }
         ]
     };
     this.loadbalancerProjectRole = null;
     this.loadbalancerMockData = {
             "loadbalancers": [
                 {
                   "href": "http://10.84.30.201:8082/loadbalancer/82d76d46-2095-42f5-a796-2cd11845a75d",
                   "fq_name": [
                     "default-domain",
                     "admin",
                     "Load balancer Demo-82d76d46-2095-42f5-a796-2cd11845a75d"
                   ],
                   "uuid": "82d76d46-2095-42f5-a796-2cd11845a75d",
                   "loadbalancer": {
                     "loadbalancer-listener": [
                       {
                         "loadbalancer_listener_properties": {
                           "admin_state": true,
                           "protocol_port": 80,
                           "protocol": "HTTP",
                           "connection_limit": -1
                         },
                         "display_name": "Listener 1",
                         "uuid": "d7bd5583-7c49-4e7c-ab59-3a8c69bbb97e",
                         "parent_uuid": "fc60bd09-7db9-4125-ae10-d76f386f43c3",
                         "parent_type": "project",
                         "perms2": {
                           "owner": "fc60bd097db94125ae10d76f386f43c3",
                           "owner_access": 7,
                           "global_access": 0,
                           "share": []
                         },
                         "id_perms": {
                           "enable": true,
                           "uuid": {
                             "uuid_mslong": 15545675511967076000,
                             "uuid_lslong": 12346964228156668000
                           },
                           "created": "2017-11-14T19:07:10.199761",
                           "description": "s11",
                           "creator": null,
                           "user_visible": true,
                           "last_modified": "2017-11-17T08:59:23.919824",
                           "permissions": {
                             "owner": "admin",
                             "owner_access": 7,
                             "other_access": 7,
                             "group": "admin",
                             "group_access": 7
                           }
                         },
                         "loadbalancer_refs": [
                           {
                             "to": [
                               "default-domain",
                               "admin",
                               "Load balancer Demo-82d76d46-2095-42f5-a796-2cd11845a75d"
                             ],
                             "attr": null,
                             "uuid": "82d76d46-2095-42f5-a796-2cd11845a75d"
                           }
                         ],
                         "fq_name": [
                           "default-domain",
                           "admin",
                           "Listener 1-d7bd5583-7c49-4e7c-ab59-3a8c69bbb97e"
                         ],
                         "loadbalancer-pool": [
                           {
                             "to": [
                               "default-domain",
                               "admin",
                               "Pool 1-3bc93c51-61f8-4821-b9f2-e795444b43b9"
                             ],
                             "attr": null,
                             "uuid": "3bc93c51-61f8-4821-b9f2-e795444b43b9"
                           }
                         ],
                         "name": "Listener 1-d7bd5583-7c49-4e7c-ab59-3a8c69bbb97e"
                       },
                       {
                         "loadbalancer_listener_properties": {
                           "admin_state": true,
                           "protocol_port": 86,
                           "protocol": "HTTP",
                           "connection_limit": -1
                         },
                         "display_name": "Listener 23",
                         "uuid": "27ba7c2f-5428-4fbc-818f-9c0bc0b248a5",
                         "parent_uuid": "fc60bd09-7db9-4125-ae10-d76f386f43c3",
                         "parent_type": "project",
                         "perms2": {
                           "owner": "fc60bd097db94125ae10d76f386f43c3",
                           "owner_access": 7,
                           "global_access": 0,
                           "share": []
                         },
                         "id_perms": {
                           "enable": true,
                           "uuid": {
                             "uuid_mslong": 2862737055864606700,
                             "uuid_lslong": 9335852126853810000
                           },
                           "created": "2017-11-17T09:07:57.689921",
                           "description": "test listener",
                           "creator": null,
                           "user_visible": true,
                           "last_modified": "2017-11-17T09:08:39.174007",
                           "permissions": {
                             "owner": "admin",
                             "owner_access": 7,
                             "other_access": 7,
                             "group": "admin",
                             "group_access": 7
                           }
                         },
                         "loadbalancer_refs": [
                           {
                             "to": [
                               "default-domain",
                               "admin",
                               "Load balancer Demo-82d76d46-2095-42f5-a796-2cd11845a75d"
                             ],
                             "attr": null,
                             "uuid": "82d76d46-2095-42f5-a796-2cd11845a75d"
                           }
                         ],
                         "fq_name": [
                           "default-domain",
                           "admin",
                           "Listener 23-27ba7c2f-5428-4fbc-818f-9c0bc0b248a5"
                         ],
                         "loadbalancer-pool": [
                           {
                             "to": [
                               "default-domain",
                               "admin",
                               "Pool 1-5848fe8c-059b-4ffd-ae49-a585b85fc0b5"
                             ],
                             "attr": null,
                             "uuid": "5848fe8c-059b-4ffd-ae49-a585b85fc0b5"
                           }
                         ],
                         "name": "Listener 23-27ba7c2f-5428-4fbc-818f-9c0bc0b248a5"
                       }
                     ],
                     "loadbalancer_provider": "opencontrail",
                     "display_name": "Load balancer ",
                     "uuid": "82d76d46-2095-42f5-a796-2cd11845a75d",
                     "service_appliance_set_refs": [
                       {
                         "to": [
                           "default-global-system-config",
                           "opencontrail"
                         ],
                         "attr": null,
                         "uuid": "11ebe43e-13cc-4667-a50c-86cb184a38dc"
                       }
                     ],
                     "parent_uuid": "fc60bd09-7db9-4125-ae10-d76f386f43c3",
                     "parent_type": "project",
                     "virtual_machine_interface_refs": [
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "18fd6a55-e13c-40d2-ab83-777b92df6986"
                         ],
                         "attr": null,
                         "uuid": "18fd6a55-e13c-40d2-ab83-777b92df6986",
                         "name": "18fd6a55-e13c-40d2-ab83-777b92df6986",
                         "display_name": "18fd6a55-e13c-40d2-ab83-777b92df6986",
                         "floating-ip": {
                           "ip": "10.30.84.3",
                           "uuid": "7b79c257-85e9-45e1-822e-34f8e03644e9",
                           "floating_ip_fixed_ip_address": "22.1.1.6"
                         },
                         "instance-ip": {
                           "instance_ip_address": "22.1.1.6",
                           "uuid": "61851703-3ace-48b6-bf5d-ad9b82256386",
                           "instance_ip_mode": "active-standby"
                         },
                         "virtual-network": {
                           "uuid": "5a1fcc79-f6a1-498c-86e5-e5ffa5353d4f",
                           "display_name": "testvn1",
                           "name": "testvn1",
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
                                       "ip_prefix": "22.1.0.0",
                                       "ip_prefix_len": 16
                                     },
                                     "dns_server_address": "22.1.0.2",
                                     "enable_dhcp": true,
                                     "created": "2017-10-03T01:36:56.009563",
                                     "default_gateway": "22.1.0.1",
                                     "dns_nameservers": [],
                                     "dhcp_option_list": null,
                                     "subnet_uuid": "6198cd63-7b3a-47cb-b858-b6d7d11c0e3a",
                                     "alloc_unit": 1,
                                     "last_modified": "2017-10-03T01:36:56.009563",
                                     "host_routes": null,
                                     "addr_from_start": true,
                                     "subnet_name": "test1_subnet",
                                     "allocation_pools": []
                                   }
                                 ],
                                 "host_routes": null
                               },
                               "uuid": "89721f29-a951-4df7-927d-51c60daec910"
                             }
                           ]
                         }
                       }
                     ],
                     "loadbalancer_properties": {
                       "vip_subnet_id": "6198cd63-7b3a-47cb-b858-b6d7d11c0e3a",
                       "vip_address": "22.1.1.6",
                       "admin_state": true,
                       "operating_status": "ONLINE",
                       "provisioning_status": "ACTIVE"
                     },
                     "perms2": {
                       "owner": "fc60bd097db94125ae10d76f386f43c3",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 9428124492885213000,
                         "uuid_lslong": 12075888727407569000
                       },
                       "created": "2017-11-14T19:07:10.151982",
                       "description": "swws",
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-11-17T07:05:03.779759",
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
                       "Load balancer Demo-82d76d46-2095-42f5-a796-2cd11845a75d"
                     ],
                     "service_instance_refs": [
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "82d76d46-2095-42f5-a796-2cd11845a75d"
                         ],
                         "attr": null,
                         "uuid": "6ce391b4-43ee-46e9-926c-431600d25d00",
                         "name": "82d76d46-2095-42f5-a796-2cd11845a75d",
                         "display_name": "82d76d46-2095-42f5-a796-2cd11845a75d",
                         "service_instance_properties": {
                           "right_virtual_network": null,
                           "left_ip_address": null,
                           "availability_zone": null,
                           "management_virtual_network": null,
                           "auto_policy": false,
                           "ha_mode": "active-standby",
                           "virtual_router_id": null,
                           "interface_list": [
                             {
                               "virtual_network": "default-domain:admin:testvn1",
                               "ip_address": "22.1.1.6",
                               "static_routes": null,
                               "allowed_address_pairs": null
                             }
                           ],
                           "right_ip_address": null,
                           "left_virtual_network": null,
                           "scale_out": {
                             "auto_scale": false,
                             "max_instances": 2
                           }
                         }
                       }
                     ],
                     "name": "Load balancer Demo-82d76d46-2095-42f5-a796-2cd11845a75d"
                   }
                 },
                 {
                   "href": "http://10.84.30.201:8082/loadbalancer/c47f6c90-ebca-4c27-8a6a-38a8f4aa2417",
                   "fq_name": [
                     "default-domain",
                     "admin",
                     "Load balancer Demo 1-c47f6c90-ebca-4c27-8a6a-38a8f4aa2417"
                   ],
                   "uuid": "c47f6c90-ebca-4c27-8a6a-38a8f4aa2417",
                   "loadbalancer": {
                     "loadbalancer-listener": [
                       {
                         "loadbalancer_listener_properties": {
                           "admin_state": true,
                           "protocol_port": 83,
                           "protocol": "HTTP",
                           "connection_limit": -1
                         },
                         "display_name": "Listener 122",
                         "uuid": "687329f1-fc32-482b-b99e-191a4a8d527e",
                         "parent_uuid": "fc60bd09-7db9-4125-ae10-d76f386f43c3",
                         "parent_type": "project",
                         "perms2": {
                           "owner": "fc60bd097db94125ae10d76f386f43c3",
                           "owner_access": 7,
                           "global_access": 0,
                           "share": []
                         },
                         "id_perms": {
                           "enable": true,
                           "uuid": {
                             "uuid_mslong": 7526405521561242000,
                             "uuid_lslong": 13375155544047570000
                           },
                           "created": "2017-11-15T06:03:17.648132",
                           "description": "sd",
                           "creator": null,
                           "user_visible": true,
                           "last_modified": "2017-11-17T09:00:13.757780",
                           "permissions": {
                             "owner": "admin",
                             "owner_access": 7,
                             "other_access": 7,
                             "group": "admin",
                             "group_access": 7
                           }
                         },
                         "loadbalancer_refs": [
                           {
                             "to": [
                               "default-domain",
                               "admin",
                               "Load balancer Demo 1-c47f6c90-ebca-4c27-8a6a-38a8f4aa2417"
                             ],
                             "attr": null,
                             "uuid": "c47f6c90-ebca-4c27-8a6a-38a8f4aa2417"
                           }
                         ],
                         "fq_name": [
                           "default-domain",
                           "admin",
                           "Listener 122-687329f1-fc32-482b-b99e-191a4a8d527e"
                         ],
                         "loadbalancer-pool": [
                           {
                             "to": [
                               "default-domain",
                               "admin",
                               "Pool 1-0e87b7ef-481c-46f9-b66a-23bf98f534ea"
                             ],
                             "attr": null,
                             "uuid": "0e87b7ef-481c-46f9-b66a-23bf98f534ea"
                           }
                         ],
                         "name": "Listener 122-687329f1-fc32-482b-b99e-191a4a8d527e"
                       },
                       {
                         "loadbalancer_listener_properties": {
                           "admin_state": true,
                           "protocol_port": 88,
                           "protocol": "HTTP",
                           "connection_limit": -1
                         },
                         "display_name": "Listener Demo 1",
                         "uuid": "6cb74fe7-b093-4f1c-b3ee-ca839fe6a848",
                         "parent_uuid": "fc60bd09-7db9-4125-ae10-d76f386f43c3",
                         "parent_type": "project",
                         "perms2": {
                           "owner": "fc60bd097db94125ae10d76f386f43c3",
                           "owner_access": 7,
                           "global_access": 0,
                           "share": []
                         },
                         "id_perms": {
                           "enable": true,
                           "uuid": {
                             "uuid_mslong": 7833817933352751000,
                             "uuid_lslong": 12965523043918457000
                           },
                           "created": "2017-11-14T19:11:13.847030",
                           "description": "",
                           "creator": null,
                           "user_visible": true,
                           "last_modified": "2017-11-17T09:00:32.116284",
                           "permissions": {
                             "owner": "admin",
                             "owner_access": 7,
                             "other_access": 7,
                             "group": "admin",
                             "group_access": 7
                           }
                         },
                         "loadbalancer_refs": [
                           {
                             "to": [
                               "default-domain",
                               "admin",
                               "Load balancer Demo 1-c47f6c90-ebca-4c27-8a6a-38a8f4aa2417"
                             ],
                             "attr": null,
                             "uuid": "c47f6c90-ebca-4c27-8a6a-38a8f4aa2417"
                           }
                         ],
                         "fq_name": [
                           "default-domain",
                           "admin",
                           "Listener 1-6cb74fe7-b093-4f1c-b3ee-ca839fe6a848"
                         ],
                         "loadbalancer-pool": [
                           {
                             "to": [
                               "default-domain",
                               "admin",
                               "Pool Demo-fd54e471-508c-4d0e-b857-b25d3dde1d1e"
                             ],
                             "attr": null,
                             "uuid": "fd54e471-508c-4d0e-b857-b25d3dde1d1e"
                           }
                         ],
                         "name": "Listener 1-6cb74fe7-b093-4f1c-b3ee-ca839fe6a848"
                       },
                       {
                         "loadbalancer_listener_properties": {
                           "admin_state": true,
                           "protocol_port": 90,
                           "protocol": "HTTP",
                           "connection_limit": -1
                         },
                         "display_name": "Listener Demo 2",
                         "uuid": "14dbc546-b3c7-4d53-9fb2-2bd47ddaed66",
                         "parent_uuid": "fc60bd09-7db9-4125-ae10-d76f386f43c3",
                         "parent_type": "project",
                         "perms2": {
                           "owner": "fc60bd097db94125ae10d76f386f43c3",
                           "owner_access": 7,
                           "global_access": 0,
                           "share": []
                         },
                         "id_perms": {
                           "enable": true,
                           "uuid": {
                             "uuid_mslong": 1503011808112758000,
                             "uuid_lslong": 11507308189529600000
                           },
                           "created": "2017-11-14T19:10:45.927497",
                           "description": "",
                           "creator": null,
                           "user_visible": true,
                           "last_modified": "2017-11-17T09:00:51.734947",
                           "permissions": {
                             "owner": "admin",
                             "owner_access": 7,
                             "other_access": 7,
                             "group": "admin",
                             "group_access": 7
                           }
                         },
                         "loadbalancer_refs": [
                           {
                             "to": [
                               "default-domain",
                               "admin",
                               "Load balancer Demo 1-c47f6c90-ebca-4c27-8a6a-38a8f4aa2417"
                             ],
                             "attr": null,
                             "uuid": "c47f6c90-ebca-4c27-8a6a-38a8f4aa2417"
                           }
                         ],
                         "fq_name": [
                           "default-domain",
                           "admin",
                           "Listener 1-14dbc546-b3c7-4d53-9fb2-2bd47ddaed66"
                         ],
                         "loadbalancer-pool": [
                           {
                             "to": [
                               "default-domain",
                               "admin",
                               "Pool 1-bb2484e0-67e4-4463-ba63-39abbc775f42"
                             ],
                             "attr": null,
                             "uuid": "bb2484e0-67e4-4463-ba63-39abbc775f42"
                           }
                         ],
                         "name": "Listener 1-14dbc546-b3c7-4d53-9fb2-2bd47ddaed66"
                       }
                     ],
                     "display_name": "Load balancer Demo 1",
                     "uuid": "c47f6c90-ebca-4c27-8a6a-38a8f4aa2417",
                     "service_appliance_set_refs": [
                       {
                         "to": [
                           "default-global-system-config",
                           "opencontrail"
                         ],
                         "attr": null,
                         "uuid": "11ebe43e-13cc-4667-a50c-86cb184a38dc"
                       }
                     ],
                     "parent_uuid": "fc60bd09-7db9-4125-ae10-d76f386f43c3",
                     "parent_type": "project",
                     "virtual_machine_interface_refs": [
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "4b1ead1a-8174-4bc1-a075-e7732addbc00"
                         ],
                         "attr": null,
                         "uuid": "4b1ead1a-8174-4bc1-a075-e7732addbc00",
                         "name": "4b1ead1a-8174-4bc1-a075-e7732addbc00",
                         "display_name": "4b1ead1a-8174-4bc1-a075-e7732addbc00",
                         "floating-ip": {},
                         "instance-ip": {
                           "instance_ip_address": "22.1.0.4",
                           "uuid": "66cab9fa-ed67-49a4-a99f-3b3b17297f19"
                         },
                         "virtual-network": {
                           "uuid": "5a1fcc79-f6a1-498c-86e5-e5ffa5353d4f",
                           "display_name": "testvn1",
                           "name": "testvn1",
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
                                       "ip_prefix": "22.1.0.0",
                                       "ip_prefix_len": 16
                                     },
                                     "dns_server_address": "22.1.0.2",
                                     "enable_dhcp": true,
                                     "created": "2017-10-03T01:36:56.009563",
                                     "default_gateway": "22.1.0.1",
                                     "dns_nameservers": [],
                                     "dhcp_option_list": null,
                                     "subnet_uuid": "6198cd63-7b3a-47cb-b858-b6d7d11c0e3a",
                                     "alloc_unit": 1,
                                     "last_modified": "2017-10-03T01:36:56.009563",
                                     "host_routes": null,
                                     "addr_from_start": true,
                                     "subnet_name": "test1_subnet",
                                     "allocation_pools": []
                                   }
                                 ],
                                 "host_routes": null
                               },
                               "uuid": "89721f29-a951-4df7-927d-51c60daec910"
                             }
                           ]
                         }
                       }
                     ],
                     "loadbalancer_properties": {
                       "vip_subnet_id": "6198cd63-7b3a-47cb-b858-b6d7d11c0e3a",
                       "admin_state": true,
                       "operating_status": "ONLINE",
                       "provisioning_status": "ACTIVE",
                       "vip_address": "22.1.0.4"
                     },
                     "perms2": {
                       "owner": "fc60bd097db94125ae10d76f386f43c3",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 14159155123163124000,
                         "uuid_lslong": 9973846623075838000
                       },
                       "created": "2017-11-14T19:10:45.866720",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-11-14T19:10:45.866720",
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
                       "Load balancer Demo 1-c47f6c90-ebca-4c27-8a6a-38a8f4aa2417"
                     ],
                     "loadbalancer_provider": "opencontrail",
                     "name": "Load balancer Demo 1-c47f6c90-ebca-4c27-8a6a-38a8f4aa2417"
                   }
                 },
                 {
                   "href": "http://10.84.30.201:8082/loadbalancer/ea771d38-1499-4ba0-a759-420508f7b3c4",
                   "fq_name": [
                     "default-domain",
                     "admin",
                     "Load balancer new-ea771d38-1499-4ba0-a759-420508f7b3c4"
                   ],
                   "uuid": "ea771d38-1499-4ba0-a759-420508f7b3c4",
                   "loadbalancer": {
                     "loadbalancer-listener": [
                       {
                         "loadbalancer_listener_properties": {
                           "admin_state": true,
                           "protocol_port": 84,
                           "protocol": "HTTP",
                           "connection_limit": -1
                         },
                         "display_name": "Listener 1",
                         "uuid": "b3fdb13c-735d-4c0f-a373-d4de0a982c85",
                         "parent_uuid": "fc60bd09-7db9-4125-ae10-d76f386f43c3",
                         "parent_type": "project",
                         "perms2": {
                           "owner": "fc60bd097db94125ae10d76f386f43c3",
                           "owner_access": 7,
                           "global_access": 0,
                           "share": []
                         },
                         "id_perms": {
                           "enable": true,
                           "uuid": {
                             "uuid_mslong": 12969717375088546000,
                             "uuid_lslong": 11777991500629553000
                           },
                           "created": "2017-11-17T09:09:55.512886",
                           "description": "sdwd",
                           "creator": null,
                           "user_visible": true,
                           "last_modified": "2017-11-17T09:09:55.512886",
                           "permissions": {
                             "owner": "admin",
                             "owner_access": 7,
                             "other_access": 7,
                             "group": "admin",
                             "group_access": 7
                           }
                         },
                         "loadbalancer_refs": [
                           {
                             "to": [
                               "default-domain",
                               "admin",
                               "Load balancer new-ea771d38-1499-4ba0-a759-420508f7b3c4"
                             ],
                             "attr": null,
                             "uuid": "ea771d38-1499-4ba0-a759-420508f7b3c4"
                           }
                         ],
                         "fq_name": [
                           "default-domain",
                           "admin",
                           "Listener 1-b3fdb13c-735d-4c0f-a373-d4de0a982c85"
                         ],
                         "loadbalancer-pool": [
                           {
                             "to": [
                               "default-domain",
                               "admin",
                               "Pool 1-4e7ad25c-4dd4-4373-862e-fdcc85395925"
                             ],
                             "attr": null,
                             "uuid": "4e7ad25c-4dd4-4373-862e-fdcc85395925"
                           }
                         ],
                         "name": "Listener 1-b3fdb13c-735d-4c0f-a373-d4de0a982c85"
                       }
                     ],
                     "service_instance_refs": [
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "ea771d38-1499-4ba0-a759-420508f7b3c4"
                         ],
                         "attr": null,
                         "uuid": "c7692644-3c5c-44b0-8422-aadfcef3f3b4",
                         "name": "ea771d38-1499-4ba0-a759-420508f7b3c4",
                         "display_name": "ea771d38-1499-4ba0-a759-420508f7b3c4",
                         "service_instance_properties": {
                           "right_virtual_network": null,
                           "left_ip_address": null,
                           "availability_zone": null,
                           "management_virtual_network": null,
                           "auto_policy": false,
                           "ha_mode": "active-standby",
                           "virtual_router_id": null,
                           "interface_list": [
                             {
                               "virtual_network": "default-domain:admin:testvn1",
                               "ip_address": "22.1.1.1",
                               "static_routes": null,
                               "allowed_address_pairs": null
                             }
                           ],
                           "right_ip_address": null,
                           "left_virtual_network": null,
                           "scale_out": {
                             "auto_scale": false,
                             "max_instances": 2
                           }
                         }
                       }
                     ],
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "Load balancer new-ea771d38-1499-4ba0-a759-420508f7b3c4"
                     ],
                     "uuid": "ea771d38-1499-4ba0-a759-420508f7b3c4",
                     "service_appliance_set_refs": [
                       {
                         "to": [
                           "default-global-system-config",
                           "opencontrail"
                         ],
                         "attr": null,
                         "uuid": "11ebe43e-13cc-4667-a50c-86cb184a38dc"
                       }
                     ],
                     "parent_uuid": "fc60bd09-7db9-4125-ae10-d76f386f43c3",
                     "parent_type": "project",
                     "virtual_machine_interface_refs": [
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "3edf6bd1-c442-40e6-a8c3-00cab8f6519f"
                         ],
                         "attr": null,
                         "uuid": "3edf6bd1-c442-40e6-a8c3-00cab8f6519f",
                         "name": "3edf6bd1-c442-40e6-a8c3-00cab8f6519f",
                         "display_name": "3edf6bd1-c442-40e6-a8c3-00cab8f6519f",
                         "floating-ip": {},
                         "instance-ip": {
                           "instance_ip_address": "22.1.1.1",
                           "uuid": "5c8a82d7-87c3-4498-aa85-dd4f692721c7",
                           "instance_ip_mode": "active-standby"
                         },
                         "virtual-network": {
                           "uuid": "5a1fcc79-f6a1-498c-86e5-e5ffa5353d4f",
                           "display_name": "testvn1",
                           "name": "testvn1",
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
                                       "ip_prefix": "22.1.0.0",
                                       "ip_prefix_len": 16
                                     },
                                     "dns_server_address": "22.1.0.2",
                                     "enable_dhcp": true,
                                     "created": "2017-10-03T01:36:56.009563",
                                     "default_gateway": "22.1.0.1",
                                     "dns_nameservers": [],
                                     "dhcp_option_list": null,
                                     "subnet_uuid": "6198cd63-7b3a-47cb-b858-b6d7d11c0e3a",
                                     "alloc_unit": 1,
                                     "last_modified": "2017-10-03T01:36:56.009563",
                                     "host_routes": null,
                                     "addr_from_start": true,
                                     "subnet_name": "test1_subnet",
                                     "allocation_pools": []
                                   }
                                 ],
                                 "host_routes": null
                               },
                               "uuid": "89721f29-a951-4df7-927d-51c60daec910"
                             }
                           ]
                         }
                       }
                     ],
                     "loadbalancer_properties": {
                       "vip_subnet_id": "6198cd63-7b3a-47cb-b858-b6d7d11c0e3a",
                       "vip_address": "22.1.1.1",
                       "admin_state": true,
                       "operating_status": "ONLINE",
                       "provisioning_status": "ACTIVE"
                     },
                     "perms2": {
                       "owner": "fc60bd097db94125ae10d76f386f43c3",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "description": "test",
                       "creator": null,
                       "created": "2017-11-17T09:09:53.989420",
                       "user_visible": true,
                       "last_modified": "2017-11-17T09:09:54.073741",
                       "permissions": {
                         "owner": "admin",
                         "owner_access": 7,
                         "other_access": 7,
                         "group": "admin",
                         "group_access": 7
                       },
                       "uuid": {
                         "uuid_mslong": 16895004653804669000,
                         "uuid_lslong": 12058742066653934000
                       }
                     },
                     "display_name": "Load balancer new",
                     "loadbalancer_provider": "opencontrail",
                     "name": "Load balancer new-ea771d38-1499-4ba0-a759-420508f7b3c4"
                   }
                 }
               ]
             };
       return {
           loadbalancerDomainsData: loadbalancerDomainsData,
           loadbalancerPojectsData: loadbalancerPojectsData,
           loadbalancerProjectRole: loadbalancerProjectRole,
           loadbalancerMockData: loadbalancerMockData
       };
 });