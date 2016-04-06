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

     this.portMockData =
       [
         {
           "virtual-machine-interface": {
             "ecmp_hashing_include_fields": {},
             "routing_instance_refs": [
               {
                 "to": [
                   "default-domain",
                   "admin",
                   "vn1",
                   "vn1"
                 ],
                 "href": "http://10.204.216.40:9100/routing-instance/cdc89406-f527-47c4-bdf8-8203a4a2346c",
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
                 "uuid": "cdc89406-f527-47c4-bdf8-8203a4a2346c"
               }
             ],
             "virtual_machine_interface_mac_addresses": {
               "mac_address": [
                 "02:b5:57:7a:6e:01"
               ]
             },
             "virtual_machine_interface_bindings": {
               "key_value_pair": [
                 {
                   "key": "vif_type",
                   "value": "vrouter"
                 },
                 {
                   "key": "vnic_type",
                   "value": "normal"
                 }
               ]
             },
             "parent_href": "http://10.204.216.40:9100/project/6ddecd27-6ac1-4007-8eaf-eb6fdc7442e4",
             "parent_type": "project",
             "virtual_machine_interface_allowed_address_pairs": {},
             "href": "http://10.204.216.40:9100/virtual-machine-interface/b5577a6e-0102-448e-af7b-89ca473e6f3a",
             "id_perms": {
               "enable": true,
               "description": null,
               "creator": null,
               "created": "2016-04-11T06:14:11.519137",
               "user_visible": true,
               "last_modified": "2016-04-11T06:14:11.537360",
               "permissions": {
                 "owner": "cloud-admin",
                 "owner_access": 7,
                 "other_access": 7,
                 "group": "cloud-admin-group",
                 "group_access": 7
               },
               "uuid": {
                 "uuid_mslong": 13067047456720701000,
                 "uuid_lslong": 12644851880644473000
               }
             },
             "virtual_machine_interface_device_owner": "",
             "instance_ip_back_refs": [
               {
                 "to": [
                   "c5e91377-4017-447a-a2e4-baa5732c5579"
                 ],
                 "href": "http://10.204.216.40:9100/instance-ip/c5e91377-4017-447a-a2e4-baa5732c5579",
                 "attr": null,
                 "uuid": "c5e91377-4017-447a-a2e4-baa5732c5579",
                 "fixedip": {
                   "ip": "1.1.1.3",
                   "subnet_uuid": "da99b8fe-dfe9-4857-927f-b0a02844933f"
                 }
               }
             ],
             "display_name": "port1",
             "uuid": "b5577a6e-0102-448e-af7b-89ca473e6f3a",
             "fq_name": [
               "default-domain",
               "admin",
               "port1"
             ],
             "name": "port1",
             "virtual_machine_interface_dhcp_option_list": {},
             "security_group_refs": [
               {
                 "to": [
                   "default-domain",
                   "admin",
                   "default"
                 ],
                 "href": "http://10.204.216.40:9100/security-group/172bd71b-8b30-4e82-9eb3-4a85e2ef6d52",
                 "attr": null,
                 "uuid": "172bd71b-8b30-4e82-9eb3-4a85e2ef6d52"
               }
             ],
             "parent_uuid": "6ddecd27-6ac1-4007-8eaf-eb6fdc7442e4",
             "virtual_network_refs": [
               {
                 "to": [
                   "default-domain",
                   "admin",
                   "vn1"
                 ],
                 "href": "http://10.204.216.40:9100/virtual-network/221e6ad8-fdb1-4261-bb9b-c42a1a590695",
                 "attr": null,
                 "uuid": "221e6ad8-fdb1-4261-bb9b-c42a1a590695"
               }
             ],
             "perms2": {
               "owner": null,
               "owner_access": 7,
               "global_access": 0,
               "share": []
             },
             "virtual_machine_interface_properties": {
               "local_preference": null,
               "interface_mirror": {}
             }
           }
         },
         {
           "virtual-machine-interface": {
             "ecmp_hashing_include_fields": {},
             "routing_instance_refs": [
               {
                 "to": [
                   "default-domain",
                   "admin",
                   "vn1",
                   "vn1"
                 ],
                 "href": "http://10.204.216.40:9100/routing-instance/cdc89406-f527-47c4-bdf8-8203a4a2346c",
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
                 "uuid": "cdc89406-f527-47c4-bdf8-8203a4a2346c"
               }
             ],
             "virtual_machine_interface_mac_addresses": {
               "mac_address": [
                 "02:70:4c:cb:89:94"
               ]
             },
             "virtual_machine_interface_bindings": {
               "key_value_pair": [
                 {
                   "key": "vif_type",
                   "value": "vrouter"
                 },
                 {
                   "key": "vnic_type",
                   "value": "normal"
                 }
               ]
             },
             "parent_href": "http://10.204.216.40:9100/project/6ddecd27-6ac1-4007-8eaf-eb6fdc7442e4",
             "parent_type": "project",
             "virtual_machine_interface_allowed_address_pairs": {},
             "href": "http://10.204.216.40:9100/virtual-machine-interface/704ccb89-94d6-43ab-a245-c7b825b409dd",
             "id_perms": {
               "enable": true,
               "description": null,
               "creator": null,
               "created": "2016-04-11T06:14:16.028958",
               "user_visible": true,
               "last_modified": "2016-04-11T06:14:16.050048",
               "permissions": {
                 "owner": "cloud-admin",
                 "owner_access": 7,
                 "other_access": 7,
                 "group": "cloud-admin-group",
                 "group_access": 7
               },
               "uuid": {
                 "uuid_mslong": 8092066422245967000,
                 "uuid_lslong": 11692971601257826000
               }
             },
             "virtual_machine_interface_device_owner": "",
             "instance_ip_back_refs": [
               {
                 "to": [
                   "90028667-b2c3-4b4c-8527-8ce2c1ae2a6b"
                 ],
                 "href": "http://10.204.216.40:9100/instance-ip/90028667-b2c3-4b4c-8527-8ce2c1ae2a6b",
                 "attr": null,
                 "uuid": "90028667-b2c3-4b4c-8527-8ce2c1ae2a6b",
                 "fixedip": {
                   "ip": "1.1.1.4",
                   "subnet_uuid": "da99b8fe-dfe9-4857-927f-b0a02844933f"
                 }
               }
             ],
             "display_name": "704ccb89-94d6-43ab-a245-c7b825b409dd",
             "uuid": "704ccb89-94d6-43ab-a245-c7b825b409dd",
             "fq_name": [
               "default-domain",
               "admin",
               "704ccb89-94d6-43ab-a245-c7b825b409dd"
             ],
             "name": "704ccb89-94d6-43ab-a245-c7b825b409dd",
             "virtual_machine_interface_dhcp_option_list": {},
             "security_group_refs": [
               {
                 "to": [
                   "default-domain",
                   "admin",
                   "default"
                 ],
                 "href": "http://10.204.216.40:9100/security-group/172bd71b-8b30-4e82-9eb3-4a85e2ef6d52",
                 "attr": null,
                 "uuid": "172bd71b-8b30-4e82-9eb3-4a85e2ef6d52"
               }
             ],
             "parent_uuid": "6ddecd27-6ac1-4007-8eaf-eb6fdc7442e4",
             "virtual_network_refs": [
               {
                 "to": [
                   "default-domain",
                   "admin",
                   "vn1"
                 ],
                 "href": "http://10.204.216.40:9100/virtual-network/221e6ad8-fdb1-4261-bb9b-c42a1a590695",
                 "attr": null,
                 "uuid": "221e6ad8-fdb1-4261-bb9b-c42a1a590695"
               }
             ],
             "perms2": {
               "owner": null,
               "owner_access": 7,
               "global_access": 0,
               "share": []
             },
             "virtual_machine_interface_properties": {
               "local_preference": null,
               "interface_mirror": {}
             }
           }
         }
       ];
       return {
           portDomainsData: portDomainsData,
           portPojectsData: portPojectsData,
           portUUIDListData: portUUIDListData,
           portMockData: portMockData
       };
 });
