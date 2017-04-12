/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore'], function(_){
     this.bgpAsAServiceDomainsData = {
         "domains": [
           {
             "href": "http://10.204.217.42:9100/domain/cd1ace9d-60c0-4cbf-aa12-6958722718d1",
             "display_name": "default-domain",
             "fq_name": [
               "default-domain"
             ],
             "uuid": "cd1ace9d-60c0-4cbf-aa12-6958722718d1"
           }
         ]
     };
     this.bgpAsAServicePojectsData = {
         "projects": [
           {
             "uuid": "90ab868a-da21-4ed9-922f-a309967eb0a0",
             "display_name": "admin",
             "fq_name": [
               "default-domain",
               "admin"
             ]
           },
           {
             "uuid": "7943296d-ee0f-47ba-8d7e-ea276eeac9fb",
             "display_name": "demo",
             "fq_name": [
               "default-domain",
               "demo"
             ]
           }
         ]
     };
     this.bgpAsAServiceMockData = {
         "bgp-as-a-services": [
           {
             "bgp-as-a-service": {
               "bgpaas_session_attributes": {
                 "passive": false,
                 "admin_down": false,
                 "loop_count": 0,
                 "auth_data": null,
                 "family_attributes": [],
                 "hold_time": 0,
                 "address_families": {
                   "family": []
                 }
               },
               "fq_name": [
                 "default-domain",
                 "admin",
                 "bgpaas1"
               ],
               "name": "bgpaas1",
               "parent_uuid": "90ab868a-da21-4ed9-922f-a309967eb0a0",
               "parent_href": "http://10.204.217.42:9100/project/90ab868a-da21-4ed9-922f-a309967eb0a0",
               "parent_type": "project",
               "perms2": {
                 "owner": null,
                 "owner_access": 7,
                 "global_access": 0,
                 "share": []
               },
               "href": "http://10.204.217.42:9100/bgp-as-a-service/4f04a11e-b062-48a5-8217-59d4fabbba05",
               "id_perms": {
                 "enable": true,
                 "uuid": {
                   "uuid_mslong": 5693852982083471000,
                   "uuid_lslong": 9374059920669522000
                 },
                 "created": "2016-01-13T04:06:04.098777",
                 "description": null,
                 "creator": null,
                 "user_visible": true,
                 "last_modified": "2016-01-13T04:06:04.098777",
                 "permissions": {
                   "owner": "cloud-admin",
                   "owner_access": 7,
                   "other_access": 7,
                   "group": "cloud-admin-group",
                   "group_access": 7
                 }
               },
               "display_name": "bgpaas1",
               "bgpaas_ip_address": "1.1.1.1",
               "uuid": "4f04a11e-b062-48a5-8217-59d4fabbba05"
             }
           },
           {
             "bgp-as-a-service": {
               "bgpaas_session_attributes": {
                 "passive": false,
                 "admin_down": false,
                 "loop_count": 0,
                 "auth_data": null,
                 "family_attributes": [],
                 "hold_time": 0,
                 "address_families": {
                   "family": [
                     "inet",
                     "e-vpn"
                   ]
                 }
               },
               "fq_name": [
                 "default-domain",
                 "admin",
                 "bgpaas2"
               ],
               "name": "bgpaas2",
               "parent_uuid": "90ab868a-da21-4ed9-922f-a309967eb0a0",
               "parent_href": "http://10.204.217.42:9100/project/90ab868a-da21-4ed9-922f-a309967eb0a0",
               "parent_type": "project",
               "virtual_machine_interface_refs": [
                 {
                   "virtual-machine-interface": {
                     "routing_instance_refs": [
                       {
                         "to": [
                           "default-domain",
                           "demo",
                           "vn1",
                           "vn1"
                         ],
                         "href": "http://10.204.217.42:9100/routing-instance/308d1d76-fa11-47d7-8cab-575c69989ab0",
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
                         "uuid": "308d1d76-fa11-47d7-8cab-575c69989ab0"
                       }
                     ],
                     "parent_uuid": "7943296d-ee0f-47ba-8d7e-ea276eeac9fb",
                     "parent_href": "http://10.204.217.42:9100/project/7943296d-ee0f-47ba-8d7e-ea276eeac9fb",
                     "parent_type": "project",
                     "interface_route_table_refs": [
                       {
                         "to": [
                           "default-domain",
                           "default-project",
                           "default-interface-route-table"
                         ],
                         "href": "http://10.204.217.42:9100/interface-route-table/369d0d2d-ea30-4284-8432-50660ac8a5ca",
                         "attr": null,
                         "uuid": "369d0d2d-ea30-4284-8432-50660ac8a5ca"
                       }
                     ],
                     "virtual_machine_interface_allowed_address_pairs": {},
                     "virtual_machine_interface_mac_addresses": {
                       "mac_address": [
                         "02:6f:f2:3a:76:44"
                       ]
                     },
                     "href": "http://10.204.217.42:9100/virtual-machine-interface/6ff23a76-4434-43df-9b44-150f77c716f0",
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 8066574162198808000,
                         "uuid_lslong": 11188090530473384000
                       },
                       "created": "2016-01-08T03:16:11.994688",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2016-01-08T13:01:14.528765",
                       "permissions": {
                         "owner": "admin",
                         "owner_access": 7,
                         "other_access": 7,
                         "group": "admin",
                         "group_access": 7
                       }
                     },
                     "virtual_machine_interface_device_owner": "",
                     "instance_ip_back_refs": [
                       {
                         "to": [
                           "d1d59772-d076-4d7f-a702-7fb4bc298fd5"
                         ],
                         "href": "http://10.204.217.42:9100/instance-ip/d1d59772-d076-4d7f-a702-7fb4bc298fd5",
                         "attr": null,
                         "uuid": "d1d59772-d076-4d7f-a702-7fb4bc298fd5"
                       }
                     ],
                     "display_name": "port2",
                     "name": "port2",
                     "service_health_check_refs": [
                       {
                         "to": [
                           "default-domain",
                           "default-project",
                           "default-service-health-check"
                         ],
                         "href": "http://10.204.217.42:9100/service-health-check/0bf93e74-0bdc-4d5a-8a84-e42fd7a0af6f",
                         "attr": null,
                         "uuid": "0bf93e74-0bdc-4d5a-8a84-e42fd7a0af6f"
                       }
                     ],
                     "fq_name": [
                       "default-domain",
                       "demo",
                       "port2"
                     ],
                     "uuid": "6ff23a76-4434-43df-9b44-150f77c716f0",
                     "virtual_machine_interface_dhcp_option_list": {},
                     "bgp_as_a_service_back_refs": [
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "bgpaas2"
                         ],
                         "href": "http://10.204.217.42:9100/bgp-as-a-service/b7e8496a-81a2-4a80-8323-01ebdb6374a6",
                         "attr": null,
                         "uuid": "b7e8496a-81a2-4a80-8323-01ebdb6374a6"
                       }
                     ],
                     "security_group_refs": [
                       {
                         "to": [
                           "default-domain",
                           "demo",
                           "default"
                         ],
                         "href": "http://10.204.217.42:9100/security-group/b659828c-d669-42a2-8368-99d3f9fb0e6f",
                         "attr": null,
                         "uuid": "b659828c-d669-42a2-8368-99d3f9fb0e6f"
                       }
                     ],
                     "port_tuple_refs": [
                       {
                         "to": [
                           "default-domain",
                           "demo",
                           "svc-inst1",
                           "11e44145-1b4a-4fab-84e5-31ce4e82d9d0"
                         ],
                         "href": "http://10.204.217.42:9100/port-tuple/017558fb-c025-420a-bb48-d07a36e06041",
                         "attr": null,
                         "uuid": "017558fb-c025-420a-bb48-d07a36e06041"
                       },
                       {
                         "to": [
                           "default-domain",
                           "demo",
                           "svc-inst1",
                           "aa00a4e5-451b-4425-a4f9-06bc4b039d3f"
                         ],
                         "href": "http://10.204.217.42:9100/port-tuple/1f0e22f9-bd0d-451c-a18d-2e5690219b28",
                         "attr": null,
                         "uuid": "1f0e22f9-bd0d-451c-a18d-2e5690219b28"
                       },
                       {
                         "to": [
                           "default-domain",
                           "demo",
                           "svc-inst1",
                           "13d057b5-9167-4a9b-a4f5-7ed9d6949b0d"
                         ],
                         "href": "http://10.204.217.42:9100/port-tuple/2ce39058-15d2-4b1b-9b60-d9502f2f26c8",
                         "attr": null,
                         "uuid": "2ce39058-15d2-4b1b-9b60-d9502f2f26c8"
                       },
                       {
                         "to": [
                           "default-domain",
                           "demo",
                           "svc-inst1",
                           "5d9f3265-f4e3-4654-926d-f73ff5750df4"
                         ],
                         "href": "http://10.204.217.42:9100/port-tuple/6ebed0e3-1612-4820-8841-612160d2548f",
                         "attr": null,
                         "uuid": "6ebed0e3-1612-4820-8841-612160d2548f"
                       }
                     ],
                     "virtual_network_refs": [
                       {
                         "to": [
                           "default-domain",
                           "demo",
                           "vn1"
                         ],
                         "href": "http://10.204.217.42:9100/virtual-network/fd6c5716-8e9c-4911-9d2e-ca6670f7a9a3",
                         "attr": null,
                         "uuid": "fd6c5716-8e9c-4911-9d2e-ca6670f7a9a3"
                       }
                     ],
                     "perms2": {
                       "owner": "7943296dee0f47ba8d7eea276eeac9fb",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "virtual_machine_interface_properties": {
                       "service_interface_type": "left"
                     }
                   }
                 }],
               "perms2": {
                 "owner_access": 7,
                 "global_access": 0,
                 "share": []
               },
               "href": "http://10.204.217.42:9100/bgp-as-a-service/b7e8496a-81a2-4a80-8323-01ebdb6374a6",
               "id_perms": {
                 "enable": true,
                 "uuid": {
                   "uuid_mslong": 13251922625327942000,
                   "uuid_lslong": 9449398555663104000
                 },
                 "created": "2016-01-13T04:06:20.585570",
                 "description": null,
                 "creator": null,
                 "user_visible": true,
                 "last_modified": "2016-01-13T05:57:09.619886",
                 "permissions": {
                   "owner": "cloud-admin",
                   "owner_access": 7,
                   "other_access": 7,
                   "group": "cloud-admin-group",
                   "group_access": 7
                 }
               },
               "display_name": "bgpaas2",
               "bgpaas_ip_address": "2.2.2.2",
               "uuid": "b7e8496a-81a2-4a80-8323-01ebdb6374a6"
             }
           }
         ]
       };
       return {
           bgpAsAServiceDomainsData : bgpAsAServiceDomainsData,
           bgpAsAServicePojectsData : bgpAsAServicePojectsData,
           bgpAsAServiceMockData : bgpAsAServiceMockData
       };
 });
