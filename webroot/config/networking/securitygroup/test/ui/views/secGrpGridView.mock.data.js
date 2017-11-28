/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore','common/test/ui/unit/ct.common.mock.data'], function(_,TestCommonMockdata){
     this.securityGrpDetails =
     {
             "security-groups": [
               {
                 "security-group": {
                   "display_name": "default",
                   "uuid": "0ea1c96d-e3a2-40c3-8d9d-2b26988428c0",
                   "name": "default",
                   "href": "http://nodeg4:8082/security-group/0ea1c96d-e3a2-40c3-8d9d-2b26988428c0",
                   "parent_type": "project",
                   "security_group_id": 8000001,
                   "perms2": {
                     "owner": "3ef47950-bfff-4408-97a9-80de1d670c06",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "id_perms": {
                     "enable": true,
                     "description": "Default security group",
                     "creator": null,
                     "created": "2017-11-17T05:54:45.030159",
                     "user_visible": true,
                     "last_modified": "2017-11-17T05:54:45.125874",
                     "permissions": {
                       "owner": "admin",
                       "owner_access": 7,
                       "other_access": 7,
                       "group": "admin",
                       "group_access": 7
                     },
                     "uuid": {
                       "uuid_mslong": 1054345261589086500,
                       "uuid_lslong": 10204359775458961000
                     }
                   },
                   "security_group_entries": {
                     "policy_rule": [
                       {
                         "direction": ">",
                         "protocol": "any",
                         "dst_addresses": [
                           {
                             "security_group": "local",
                             "subnet": null,
                             "virtual_network": null,
                             "subnet_list": [],
                             "network_policy": null
                           }
                         ],
                         "action_list": null,
                         "created": null,
                         "rule_uuid": "37c2bb2a-3500-497c-a5ff-06c1040ee187",
                         "dst_ports": [
                           {
                             "end_port": 65535,
                             "start_port": 0
                           }
                         ],
                         "application": [],
                         "last_modified": null,
                         "ethertype": "IPv4",
                         "src_addresses": [
                           {
                             "security_group": "default-domain:admin:default",
                             "subnet": null,
                             "virtual_network": null,
                             "subnet_list": [],
                             "network_policy": null
                           }
                         ],
                         "rule_sequence": null,
                         "src_ports": [
                           {
                             "end_port": 65535,
                             "start_port": 0
                           }
                         ]
                       },
                       {
                         "direction": ">",
                         "protocol": "any",
                         "dst_addresses": [
                           {
                             "security_group": "local",
                             "subnet": null,
                             "virtual_network": null,
                             "subnet_list": [],
                             "network_policy": null
                           }
                         ],
                         "action_list": null,
                         "created": null,
                         "rule_uuid": "dd9c79f7-2c00-43fd-93b0-63fa33266333",
                         "dst_ports": [
                           {
                             "end_port": 65535,
                             "start_port": 0
                           }
                         ],
                         "application": [],
                         "last_modified": null,
                         "ethertype": "IPv6",
                         "src_addresses": [
                           {
                             "security_group": "default-domain:admin:default",
                             "subnet": null,
                             "virtual_network": null,
                             "subnet_list": [],
                             "network_policy": null
                           }
                         ],
                         "rule_sequence": null,
                         "src_ports": [
                           {
                             "end_port": 65535,
                             "start_port": 0
                           }
                         ]
                       },
                       {
                         "direction": ">",
                         "protocol": "any",
                         "dst_addresses": [
                           {
                             "security_group": null,
                             "subnet": {
                               "ip_prefix": "0.0.0.0",
                               "ip_prefix_len": 0
                             },
                             "virtual_network": null,
                             "subnet_list": [],
                             "network_policy": null
                           }
                         ],
                         "action_list": null,
                         "created": null,
                         "rule_uuid": "4cabcb08-cf8b-450b-b36b-66f6b8514f83",
                         "dst_ports": [
                           {
                             "end_port": 65535,
                             "start_port": 0
                           }
                         ],
                         "application": [],
                         "last_modified": null,
                         "ethertype": "IPv4",
                         "src_addresses": [
                           {
                             "security_group": "local",
                             "subnet": null,
                             "virtual_network": null,
                             "subnet_list": [],
                             "network_policy": null
                           }
                         ],
                         "rule_sequence": null,
                         "src_ports": [
                           {
                             "end_port": 65535,
                             "start_port": 0
                           }
                         ]
                       },
                       {
                         "direction": ">",
                         "protocol": "any",
                         "dst_addresses": [
                           {
                             "security_group": null,
                             "subnet": {
                               "ip_prefix": "::",
                               "ip_prefix_len": 0
                             },
                             "virtual_network": null,
                             "subnet_list": [],
                             "network_policy": null
                           }
                         ],
                         "action_list": null,
                         "created": null,
                         "rule_uuid": "53c4df59-474c-4092-afd5-fbec33b3b101",
                         "dst_ports": [
                           {
                             "end_port": 65535,
                             "start_port": 0
                           }
                         ],
                         "application": [],
                         "last_modified": null,
                         "ethertype": "IPv6",
                         "src_addresses": [
                           {
                             "security_group": "local",
                             "subnet": null,
                             "virtual_network": null,
                             "subnet_list": [],
                             "network_policy": null
                           }
                         ],
                         "rule_sequence": null,
                         "src_ports": [
                           {
                             "end_port": 65535,
                             "start_port": 0
                           }
                         ]
                       }
                     ]
                   },
                   "fq_name": [
                     "default-domain",
                     "admin",
                     "default"
                   ],
                   "parent_uuid": "3ef47950-bfff-4408-97a9-80de1d670c06"
                 }
               }
             ]
      };
     this.securityGrp =
     { 
                 "security-groups": [
                   {
                     "href": "http://nodeg7:8082/security-group/51ddd806-519a-4736-a229-3017333af1ae",
                     "fq_name": [
                       "default-domain",
                       "HRdev",
                       "default"
                     ],
                     "uuid": "51ddd806-519a-4736-a229-3017333af1ae"
                   },
                   {
                     "href": "http://nodeg7:8082/security-group/f4eb4407-41cf-4a92-b8d5-f70c84b7024c",
                     "fq_name": [
                       "default-domain",
                       "sapdev",
                       "sg1"
                     ],
                     "uuid": "f4eb4407-41cf-4a92-b8d5-f70c84b7024c"
                   },
                   {
                     "href": "http://nodeg7:8082/security-group/23c31363-fb99-4ce4-b446-c21a1e64a361",
                     "fq_name": [
                       "default-domain",
                       "sapprod",
                       "sg1"
                     ],
                     "uuid": "23c31363-fb99-4ce4-b446-c21a1e64a361"
                   },
                   {
                     "href": "http://nodeg7:8082/security-group/e45cd399-6b10-4241-a7f7-6b5d5c2ff4de",
                     "fq_name": [
                       "default-domain",
                       "sapdev",
                       "default"
                     ],
                     "uuid": "e45cd399-6b10-4241-a7f7-6b5d5c2ff4de"
                   },
                   {
                     "href": "http://nodeg7:8082/security-group/81fe9060-9870-4706-8362-7dcaa1d747d7",
                     "fq_name": [
                       "default-domain",
                       "sapprod",
                       "default"
                     ],
                     "uuid": "81fe9060-9870-4706-8362-7dcaa1d747d7"
                   },
                   {
                     "href": "http://nodeg7:8082/security-group/ba32c70a-82cd-4be6-8fed-e45d3f4ebb9c",
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "default"
                     ],
                     "uuid": "ba32c70a-82cd-4be6-8fed-e45d3f4ebb9c"
                   },
                   {
                     "href": "http://nodeg7:8082/security-group/567efc38-7ba4-4181-862c-0e76d6869111",
                     "fq_name": [
                       "default-domain",
                       "services",
                       "default"
                     ],
                     "uuid": "567efc38-7ba4-4181-862c-0e76d6869111"
                   }
                 ]
       }
       return {
           domainData: TestCommonMockdata.domainData,
           projectData: TestCommonMockdata.projectData,
           securityGrpDetails: securityGrpDetails,
           securityGrp: securityGrp
       };
 });
