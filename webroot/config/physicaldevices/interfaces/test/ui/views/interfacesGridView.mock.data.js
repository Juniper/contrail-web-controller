/*
 * Copyright (c) 2015 Junper Networks, Inc. All rights reserved.
 */

 define(['underscore'], function(_){
     this.physicalRouterListMockData = {
         "physical-routers": [
           {
             "href": "http://10.204.216.40:9100/physical-router/8d2dd1b7-279b-4237-873e-41cf4fbcfe1d",
             "fq_name": [
               "default-global-system-config",
               "pr1"
             ],
             "uuid": "8d2dd1b7-279b-4237-873e-41cf4fbcfe1d"
           }
         ]
     };
     this.physicalInterfacesMockData = [
       {
         "physical-interface": {
           "fq_name": [
             "default-global-system-config",
             "pr1",
             "ge-1/1/1"
           ],
           "name": "ge-1/1/1",
           "parent_uuid": "8d2dd1b7-279b-4237-873e-41cf4fbcfe1d",
           "parent_href": "http://10.204.216.40:9100/physical-router/8d2dd1b7-279b-4237-873e-41cf4fbcfe1d",
           "parent_type": "physical-router",
           "perms2": {
             "owner": "e9a7b1af07c147889169045c5f2caafb",
             "owner_access": 7,
             "global_access": 0,
             "share": []
           },
           "href": "http://10.204.216.40:9100/physical-interface/b72f8214-23f0-480d-8694-d44ac59bef62",
           "id_perms": {
             "enable": true,
             "uuid": {
               "uuid_mslong": 13199912055860120000,
               "uuid_lslong": 9697609315243520000
             },
             "created": "2015-11-23T10:06:27.234511",
             "description": null,
             "creator": null,
             "user_visible": true,
             "last_modified": "2015-11-23T10:06:27.234511",
             "permissions": {
               "owner": "admin",
               "owner_access": 7,
               "other_access": 7,
               "group": "KeystoneServiceAdmin",
               "group_access": 7
             }
           },
           "display_name": "ge-1/1/1",
           "logical_interfaces": [
             {
               "to": [
                 "default-global-system-config",
                 "pr1",
                 "ge-1/1/1",
                 "ge-1/1/1.1"
               ],
               "href": "http://10.204.216.40:9100/logical-interface/fe3d4a90-27a1-4fe6-80ea-82eb6fd8ae0d",
               "uuid": "fe3d4a90-27a1-4fe6-80ea-82eb6fd8ae0d"
             }
           ],
           "uuid": "b72f8214-23f0-480d-8694-d44ac59bef62"
         }
       }
     ];
     this.logicalInterfacesMockData = [
       {
         "logical-interface": {
           "fq_name": [
             "default-global-system-config",
             "pr1",
             "ge-1/1/1",
             "ge-1/1/1.1"
           ],
           "name": "ge-1/1/1.1",
           "logical_interface_vlan_tag": 1,
           "parent_uuid": "b72f8214-23f0-480d-8694-d44ac59bef62",
           "parent_href": "http://10.204.216.40:9100/physical-interface/b72f8214-23f0-480d-8694-d44ac59bef62",
           "parent_type": "physical-interface",
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
                     "href": "http://10.204.216.40:9100/routing-instance/562a0397-18ce-4e01-b9e4-e8340338db48",
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
                     "uuid": "562a0397-18ce-4e01-b9e4-e8340338db48"
                   }
                 ],
                 "virtual_machine_interface_mac_addresses": {
                   "mac_address": [
                     "aa:bb:cc:11:22:33"
                   ]
                 },
                 "parent_href": "http://10.204.216.40:9100/project/21f70ece-a889-4c8b-a254-db7c5bba6551",
                 "parent_type": "project",
                 "href": "http://10.204.216.40:9100/virtual-machine-interface/967d4a02-5031-442e-9caf-bdb3b3bb5f5b",
                 "id_perms": {
                   "enable": true,
                   "description": null,
                   "creator": null,
                   "created": "2015-11-23T10:07:47.718850",
                   "user_visible": true,
                   "last_modified": "2015-11-23T10:07:47.731992",
                   "permissions": {
                     "owner": "admin",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "admin",
                     "group_access": 7
                   },
                   "uuid": {
                     "uuid_mslong": 10843904851573820000,
                     "uuid_lslong": 11290451370353320000
                   }
                 },
                 "virtual_machine_interface_device_owner": "",
                 "display_name": "967d4a02-5031-442e-9caf-bdb3b3bb5f5b",
                 "uuid": "967d4a02-5031-442e-9caf-bdb3b3bb5f5b",
                 "fq_name": [
                   "default-domain",
                   "demo",
                   "967d4a02-5031-442e-9caf-bdb3b3bb5f5b"
                 ],
                 "name": "967d4a02-5031-442e-9caf-bdb3b3bb5f5b",
                 "security_group_refs": [
                   {
                     "to": [
                       "default-domain",
                       "demo",
                       "default"
                     ],
                     "href": "http://10.204.216.40:9100/security-group/7b3e5d70-22ec-41e1-849f-aae5b28d7381",
                     "attr": null,
                     "uuid": "7b3e5d70-22ec-41e1-849f-aae5b28d7381"
                   }
                 ],
                 "parent_uuid": "21f70ece-a889-4c8b-a254-db7c5bba6551",
                 "virtual_network_refs": [
                   {
                     "to": [
                       "default-domain",
                       "demo",
                       "vn1"
                     ],
                     "href": "http://10.204.216.40:9100/virtual-network/8483ed09-d1a6-4a66-ae48-db7fd8f7ee9b",
                     "attr": null,
                     "uuid": "8483ed09-d1a6-4a66-ae48-db7fd8f7ee9b"
                   }
                 ],
                 "perms2": {
                   "owner": "21f70ecea8894c8ba254db7c5bba6551",
                   "owner_access": 7,
                   "global_access": 0,
                   "share": []
                 },
                 "instance_ip_back_refs": [
                   {
                     "instance-ip": {
                       "display_name": "8d149a8f-f12f-4328-9e08-6af5e4ef3aaf",
                       "name": "8d149a8f-f12f-4328-9e08-6af5e4ef3aaf",
                       "instance_ip_address": "1.1.1.25",
                       "virtual_machine_interface_refs": [
                         {
                           "to": [
                             "default-domain",
                             "demo",
                             "967d4a02-5031-442e-9caf-bdb3b3bb5f5b"
                           ],
                           "href": "http://10.204.216.40:9100/virtual-machine-interface/967d4a02-5031-442e-9caf-bdb3b3bb5f5b",
                           "attr": null,
                           "uuid": "967d4a02-5031-442e-9caf-bdb3b3bb5f5b"
                         }
                       ],
                       "perms2": {
                         "owner": "21f70ecea8894c8ba254db7c5bba6551",
                         "owner_access": 7,
                         "global_access": 0,
                         "share": []
                       },
                       "virtual_network_refs": [
                         {
                           "to": [
                             "default-domain",
                             "demo",
                             "vn1"
                           ],
                           "href": "http://10.204.216.40:9100/virtual-network/8483ed09-d1a6-4a66-ae48-db7fd8f7ee9b",
                           "attr": null,
                           "uuid": "8483ed09-d1a6-4a66-ae48-db7fd8f7ee9b"
                         }
                       ],
                       "href": "http://10.204.216.40:9100/instance-ip/8d149a8f-f12f-4328-9e08-6af5e4ef3aaf",
                       "id_perms": {
                         "enable": true,
                         "uuid": {
                           "uuid_mslong": 10165920201899459000,
                           "uuid_lslong": 11387469262146714000
                         },
                         "created": "2015-11-23T10:07:47.762511",
                         "description": null,
                         "creator": null,
                         "user_visible": true,
                         "last_modified": "2015-11-23T10:07:47.762511",
                         "permissions": {
                           "owner": "cloud-admin",
                           "owner_access": 7,
                           "other_access": 7,
                           "group": "cloud-admin-group",
                           "group_access": 7
                         }
                       },
                       "fq_name": [
                         "8d149a8f-f12f-4328-9e08-6af5e4ef3aaf"
                       ],
                       "uuid": "8d149a8f-f12f-4328-9e08-6af5e4ef3aaf"
                     }
                   }
                 ]
               }
             }
           ],
           "logical_interface_type": "l2",
           "perms2": {
             "owner": "21f70ecea8894c8ba254db7c5bba6551",
             "owner_access": 7,
             "global_access": 0,
             "share": []
           },
           "href": "http://10.204.216.40:9100/logical-interface/fe3d4a90-27a1-4fe6-80ea-82eb6fd8ae0d",
           "id_perms": {
             "enable": true,
             "uuid": {
               "uuid_mslong": 18319880842213675000,
               "uuid_lslong": 9289381129110467000
             },
             "created": "2015-11-23T10:07:48.030154",
             "description": null,
             "creator": null,
             "user_visible": true,
             "last_modified": "2015-11-23T10:07:48.030154",
             "permissions": {
               "owner": "admin",
               "owner_access": 7,
               "other_access": 7,
               "group": "admin",
               "group_access": 7
             }
           },
           "display_name": "ge-1/1/1.1",
           "uuid": "fe3d4a90-27a1-4fe6-80ea-82eb6fd8ae0d"
         }
       }
     ];
     return {
         physicalRouterListMockData : physicalRouterListMockData,
         physicalInterfacesMockData : physicalInterfacesMockData,
         logicalInterfacesMockData : logicalInterfacesMockData
     };
 });
