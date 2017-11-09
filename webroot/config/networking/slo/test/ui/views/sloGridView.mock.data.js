/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore'], function(_){
     this.sloDomainsData = {
         "domains": [
           {
             "fq_name": [
               "default-domain"
             ],
             "uuid": "f1f5fd91-8016-4f0f-a0f3-b67e779f1d08"
           }
         ]
     };

     this.sloPojectsData = {
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

     this.portUUIDListData =
     [
       "b5577a6e-0102-448e-af7b-89ca473e6f3a",
       "704ccb89-94d6-43ab-a245-c7b825b409dd"
     ];
     this.secGrpMockData = {
             "security-groups": [
                 {
                   "security-group": {
                     "display_name": "default",
                     "uuid": "3d9afc19-472d-4897-8955-6c072255b637",
                     "name": "default",
                     "href": "http://nodea16:8082/security-group/3d9afc19-472d-4897-8955-6c072255b637",
                     "configured_security_group_id": 0,
                     "parent_type": "project",
                     "security_group_id": 8000001,
                     "perms2": {
                       "owner": "36bb47ab-3969-4669-b8e1-b1f5b70f86f1",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "description": "Default security group",
                       "created": "2017-10-06T08:45:24.434604",
                       "creator": null,
                       "uuid": {
                         "uuid_mslong": 4439137568225577000,
                         "uuid_lslong": 9895934534113147000
                       },
                       "user_visible": true,
                       "last_modified": "2017-10-25T11:17:11.376750",
                       "permissions": {
                         "owner": "admin",
                         "owner_access": 7,
                         "other_access": 7,
                         "group": "admin",
                         "group_access": 7
                       }
                     },
                     "security_group_entries": {
                       "policy_rule": []
                     },
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "default"
                     ],
                     "parent_uuid": "36bb47ab-3969-4669-b8e1-b1f5b70f86f1"
                   }
                 },
                 {
                   "security-group": {
                     "display_name": "test_slo_sg",
                     "uuid": "5f1f835f-bdfc-4f2d-9cec-e872737155c1",
                     "name": "test_slo_sg",
                     "href": "http://nodea16:8082/security-group/5f1f835f-bdfc-4f2d-9cec-e872737155c1",
                     "configured_security_group_id": 0,
                     "parent_type": "project",
                     "security_group_id": 8000004,
                     "perms2": {
                       "owner": "36bb47ab39694669b8e1b1f5b70f86f1",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 6854341605113745000,
                         "uuid_lslong": 11307668342681197000
                       },
                       "created": "2017-10-27T05:52:18.207041",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-10-27T05:52:18.207041",
                       "permissions": {
                         "owner": "admin",
                         "owner_access": 7,
                         "other_access": 7,
                         "group": "admin",
                         "group_access": 7
                       }
                     },
                     "security_group_entries": {
                       "policy_rule": [
                         {
                           "direction": ">",
                           "protocol": "any",
                           "dst_addresses": [
                             {
                               "security_group": null,
                               "network_policy": null,
                               "virtual_network": null,
                               "subnet": {
                                 "ip_prefix": "2.2.2.0",
                                 "ip_prefix_len": 24
                               }
                             }
                           ],
                           "ethertype": "IPv4",
                           "dst_ports": [
                             {
                               "end_port": 65535,
                               "start_port": 0
                             }
                           ],
                           "rule_uuid": "df1e29c0-e1cf-4263-be1e-75cc650359e3",
                           "src_addresses": [
                             {
                               "security_group": "local",
                               "subnet": null,
                               "virtual_network": null,
                               "network_policy": null
                             }
                           ],
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
                               "security_group": "default-domain:services:default",
                               "network_policy": null,
                               "virtual_network": null,
                               "subnet": null
                             }
                           ],
                           "ethertype": "IPv6",
                           "dst_ports": [
                             {
                               "end_port": 65535,
                               "start_port": 0
                             }
                           ],
                           "rule_uuid": "14c76293-4538-4c2a-b01d-68f9bb8100bb",
                           "src_addresses": [
                             {
                               "security_group": "local",
                               "subnet": null,
                               "virtual_network": null,
                               "network_policy": null
                             }
                           ],
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
                       "test_slo_sg"
                     ],
                     "parent_uuid": "36bb47ab-3969-4669-b8e1-b1f5b70f86f1"
                   }
                 }
               ]
             };
     this.networkPolicyMockData = {
             "data": [
                 {
                   "network-policy": {
                     "network_policy_entries": {
                       "policy_rule": [
                         {
                           "direction": "<>",
                           "protocol": "any",
                           "dst_addresses": [
                             {
                               "security_group": null,
                               "virtual_network": "default-domain:admin:vn2",
                               "subnet": null,
                               "network_policy": null
                             }
                           ],
                           "action_list": {
                             "mirror_to": null,
                             "gateway_name": null,
                             "log": false,
                             "qos_action": null,
                             "simple_action": "pass",
                             "apply_service": null
                           },
                           "rule_uuid": "9a8ea35c-3986-4125-96c6-c39d6b03d6d3",
                           "dst_ports": [
                             {
                               "end_port": -1,
                               "start_port": -1
                             }
                           ],
                           "application": [],
                           "src_addresses": [
                             {
                               "security_group": null,
                               "virtual_network": "default-domain:admin:vn1",
                               "subnet": null,
                               "network_policy": null
                             }
                           ],
                           "rule_sequence": {
                             "major": 1,
                             "minor": 0
                           },
                           "src_ports": [
                             {
                               "end_port": -1,
                               "start_port": -1
                             }
                           ]
                         }
                       ]
                     },
                     "uuid": "200837df-a6e2-4355-85a1-67164d1084b7",
                     "parent_uuid": "36bb47ab-3969-4669-b8e1-b1f5b70f86f1",
                     "parent_href": "http://nodea16:8082/project/36bb47ab-3969-4669-b8e1-b1f5b70f86f1",
                     "parent_type": "project",
                     "perms2": {
                       "owner": "36bb47ab39694669b8e1b1f5b70f86f1",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "virtual_network_back_refs": [
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "vn2"
                         ],
                         "href": "http://nodea16:8082/virtual-network/0eecd67b-8ccf-4cb2-90f7-5da321edd3f9",
                         "attr": {
                           "timer": null,
                           "sequence": {
                             "major": 0,
                             "minor": 0
                           }
                         },
                         "uuid": "0eecd67b-8ccf-4cb2-90f7-5da321edd3f9"
                       },
                       {
                         "to": [
                           "default-domain",
                           "default-project",
                           "ip-fabric"
                         ],
                         "href": "http://nodea16:8082/virtual-network/22d228e3-09c3-4f02-a174-6fa5cab47403",
                         "attr": {
                           "timer": null,
                           "sequence": {
                             "major": 0,
                             "minor": 0
                           }
                         },
                         "uuid": "22d228e3-09c3-4f02-a174-6fa5cab47403"
                       },
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "vn1"
                         ],
                         "href": "http://nodea16:8082/virtual-network/2eab30cc-4835-44b2-baa8-9ccec8c8f31e",
                         "attr": {
                           "timer": null,
                           "sequence": {
                             "major": 0,
                             "minor": 0
                           }
                         },
                         "uuid": "2eab30cc-4835-44b2-baa8-9ccec8c8f31e"
                       }
                     ],
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "vn1-vn2"
                     ],
                     "display_name": "vn1-vn2",
                     "name": "vn1-vn2"
                   }
                 },
                 {
                   "network-policy": {
                     "network_policy_entries": {
                       "policy_rule": [
                         {
                           "direction": "<>",
                           "protocol": "any",
                           "dst_addresses": [
                             {
                               "security_group": null,
                               "virtual_network": null,
                               "subnet": {
                                 "ip_prefix": "2.2.2.0",
                                 "ip_prefix_len": 24
                               },
                               "network_policy": null
                             }
                           ],
                           "action_list": {
                             "mirror_to": null,
                             "gateway_name": null,
                             "log": false,
                             "qos_action": null,
                             "simple_action": "pass",
                             "apply_service": null
                           },
                           "rule_uuid": "fb4ab5f8-d988-40a8-bf95-28f83c6e79c8",
                           "dst_ports": [
                             {
                               "end_port": -1,
                               "start_port": -1
                             }
                           ],
                           "application": [],
                           "src_addresses": [
                             {
                               "security_group": null,
                               "virtual_network": null,
                               "subnet": {
                                 "ip_prefix": "1.1.1.0",
                                 "ip_prefix_len": 24
                               },
                               "network_policy": null
                             }
                           ],
                           "rule_sequence": {
                             "major": 1,
                             "minor": 0
                           },
                           "src_ports": [
                             {
                               "end_port": -1,
                               "start_port": -1
                             }
                           ]
                         },
                         {
                           "direction": "<>",
                           "protocol": "any",
                           "dst_addresses": [
                             {
                               "security_group": null,
                               "virtual_network": "default-domain:admin:vn22",
                               "subnet": null,
                               "network_policy": null
                             }
                           ],
                           "action_list": {
                             "mirror_to": null,
                             "gateway_name": null,
                             "log": false,
                             "qos_action": null,
                             "simple_action": "pass",
                             "apply_service": null
                           },
                           "rule_uuid": "dd6d856c-0174-46f4-86af-309571f803e8",
                           "dst_ports": [
                             {
                               "end_port": -1,
                               "start_port": -1
                             }
                           ],
                           "application": [],
                           "src_addresses": [
                             {
                               "security_group": null,
                               "virtual_network": "default-domain:admin:vn11",
                               "subnet": null,
                               "network_policy": null
                             }
                           ],
                           "rule_sequence": {
                             "major": 2,
                             "minor": 0
                           },
                           "src_ports": [
                             {
                               "end_port": -1,
                               "start_port": -1
                             }
                           ]
                         }
                       ]
                     },
                     "uuid": "579705f6-004b-4273-9eaa-442f10895185",
                     "parent_uuid": "36bb47ab-3969-4669-b8e1-b1f5b70f86f1",
                     "parent_href": "http://nodea16:8082/project/36bb47ab-3969-4669-b8e1-b1f5b70f86f1",
                     "parent_type": "project",
                     "perms2": {
                       "owner": "36bb47ab39694669b8e1b1f5b70f86f1",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "test_slo_policy"
                     ],
                     "display_name": "test_slo_policy",
                     "security_logging_object_back_refs": [
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "Test1223"
                         ],
                         "href": "http://nodea16:8082/security-logging-object/814fbae6-6a74-49a3-ad35-6f2f1fcc451d",
                         "attr": {
                           "rule": [
                             {
                               "rule_uuid": "dd6d856c-0174-46f4-86af-309571f803e8",
                               "rate": 100
                             }
                           ]
                         },
                         "uuid": "814fbae6-6a74-49a3-ad35-6f2f1fcc451d"
                       },
                       {
                         "to": [
                           "default-global-system-config",
                           "default-global-vrouter-config",
                           "test_slo1"
                         ],
                         "href": "http://nodea16:8082/security-logging-object/224d1eb1-d9dc-4ef1-ae78-08e64e247081",
                         "attr": {
                           "rule": [
                             {
                               "rule_uuid": "fb4ab5f8-d988-40a8-bf95-28f83c6e79c8",
                               "rate": 200
                             }
                           ]
                         },
                         "uuid": "224d1eb1-d9dc-4ef1-ae78-08e64e247081"
                       }
                     ],
                     "name": "test_slo_policy"
                   }
                 },
                 {
                   "network-policy": {
                     "network_policy_entries": {
                       "policy_rule": [
                         {
                           "direction": "<>",
                           "protocol": "any",
                           "dst_addresses": [
                             {
                               "security_group": null,
                               "virtual_network": "any",
                               "subnet": null,
                               "network_policy": null
                             }
                           ],
                           "action_list": {
                             "mirror_to": null,
                             "gateway_name": null,
                             "log": false,
                             "qos_action": null,
                             "simple_action": "pass",
                             "apply_service": null
                           },
                           "rule_uuid": "6bd076cc-4c1c-484e-a711-5f8ce8537864",
                           "dst_ports": [
                             {
                               "end_port": -1,
                               "start_port": -1
                             }
                           ],
                           "application": [],
                           "src_addresses": [
                             {
                               "security_group": null,
                               "virtual_network": "any",
                               "subnet": null,
                               "network_policy": null
                             }
                           ],
                           "rule_sequence": {
                             "major": 1,
                             "minor": 0
                           },
                           "src_ports": [
                             {
                               "end_port": -1,
                               "start_port": -1
                             }
                           ]
                         },
                         {
                           "direction": "<>",
                           "protocol": "any",
                           "dst_addresses": [
                             {
                               "security_group": null,
                               "virtual_network": "any",
                               "subnet": null,
                               "network_policy": null
                             }
                           ],
                           "action_list": {
                             "mirror_to": null,
                             "gateway_name": null,
                             "log": false,
                             "qos_action": null,
                             "simple_action": "pass",
                             "apply_service": null
                           },
                           "rule_uuid": "0ab0fa84-ca24-45f4-ac1f-d7edc95b127a",
                           "dst_ports": [
                             {
                               "end_port": -1,
                               "start_port": -1
                             }
                           ],
                           "application": [],
                           "src_addresses": [
                             {
                               "security_group": null,
                               "virtual_network": "any",
                               "subnet": null,
                               "network_policy": null
                             }
                           ],
                           "rule_sequence": {
                             "major": 2,
                             "minor": 0
                           },
                           "src_ports": [
                             {
                               "end_port": 22,
                               "start_port": 22
                             }
                           ]
                         }
                       ]
                     },
                     "uuid": "7622381c-9cce-4643-9059-b16659349b44",
                     "display_name": "HR_Finance_Sales",
                     "parent_uuid": "36bb47ab-3969-4669-b8e1-b1f5b70f86f1",
                     "parent_href": "http://nodea16:8082/project/36bb47ab-3969-4669-b8e1-b1f5b70f86f1",
                     "parent_type": "project",
                     "perms2": {
                       "owner": "36bb47ab39694669b8e1b1f5b70f86f1",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "virtual_network_back_refs": [
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "vn31"
                         ],
                         "href": "http://nodea16:8082/virtual-network/d6a9e783-3869-49a0-9a5c-dc479c311bc7",
                         "attr": {
                           "timer": null,
                           "sequence": {
                             "major": 0,
                             "minor": 0
                           }
                         },
                         "uuid": "d6a9e783-3869-49a0-9a5c-dc479c311bc7"
                       },
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "vn12"
                         ],
                         "href": "http://nodea16:8082/virtual-network/350ef876-c998-4e2b-85b7-e137a25a8af8",
                         "attr": {
                           "timer": null,
                           "sequence": {
                             "major": 0,
                             "minor": 0
                           }
                         },
                         "uuid": "350ef876-c998-4e2b-85b7-e137a25a8af8"
                       },
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "vn32"
                         ],
                         "href": "http://nodea16:8082/virtual-network/d7fc3cd7-6368-4db3-84db-8fd8f90e4707",
                         "attr": {
                           "timer": null,
                           "sequence": {
                             "major": 0,
                             "minor": 0
                           }
                         },
                         "uuid": "d7fc3cd7-6368-4db3-84db-8fd8f90e4707"
                       },
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "vn11"
                         ],
                         "href": "http://nodea16:8082/virtual-network/85bb2905-2761-4926-af1d-5b4f879eb430",
                         "attr": {
                           "timer": null,
                           "sequence": {
                             "major": 0,
                             "minor": 0
                           }
                         },
                         "uuid": "85bb2905-2761-4926-af1d-5b4f879eb430"
                       },
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "vn21"
                         ],
                         "href": "http://nodea16:8082/virtual-network/e014db23-8ced-44c5-90ba-dedd57a22690",
                         "attr": {
                           "timer": null,
                           "sequence": {
                             "major": 0,
                             "minor": 0
                           }
                         },
                         "uuid": "e014db23-8ced-44c5-90ba-dedd57a22690"
                       },
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "vn22"
                         ],
                         "href": "http://nodea16:8082/virtual-network/0b36b2b7-c386-49cb-8f0d-206ac425598d",
                         "attr": {
                           "timer": null,
                           "sequence": {
                             "major": 0,
                             "minor": 0
                           }
                         },
                         "uuid": "0b36b2b7-c386-49cb-8f0d-206ac425598d"
                       },
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "vn29"
                         ],
                         "href": "http://nodea16:8082/virtual-network/bcf157e0-3202-4768-a308-fd3f06128ca1",
                         "attr": {
                           "timer": null,
                           "sequence": {
                             "major": 0,
                             "minor": 0
                           }
                         },
                         "uuid": "bcf157e0-3202-4768-a308-fd3f06128ca1"
                       }
                     ],
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "HR_Finance_Sales"
                     ],
                     "security_logging_object_back_refs": [
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "@resa"
                         ],
                         "href": "http://nodea16:8082/security-logging-object/85a93dca-edd5-4e0c-aa7a-3ace027dcbc2",
                         "attr": {
                           "rule": [
                             {
                               "rule_uuid": "6bd076cc-4c1c-484e-a711-5f8ce8537864",
                               "rate": 100
                             }
                           ]
                         },
                         "uuid": "85a93dca-edd5-4e0c-aa7a-3ace027dcbc2"
                       },
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "@slo24324"
                         ],
                         "href": "http://nodea16:8082/security-logging-object/203b3d99-03d0-49b0-83c8-ade22b050f01",
                         "attr": {
                           "rule": [
                             {
                               "rule_uuid": "6bd076cc-4c1c-484e-a711-5f8ce8537864",
                               "rate": 333
                             }
                           ]
                         },
                         "uuid": "203b3d99-03d0-49b0-83c8-ade22b050f01"
                       }
                     ],
                     "name": "HR_Finance_Sales"
                   }
                 },
                 {
                   "network-policy": {
                     "network_policy_entries": {
                       "policy_rule": [
                         {
                           "direction": "<>",
                           "protocol": "any",
                           "dst_addresses": [
                             {
                               "security_group": null,
                               "virtual_network": "default-domain:admin:vn11",
                               "subnet": null,
                               "network_policy": null
                             }
                           ],
                           "action_list": {
                             "mirror_to": null,
                             "gateway_name": null,
                             "log": false,
                             "qos_action": null,
                             "simple_action": "pass",
                             "apply_service": null
                           },
                           "rule_uuid": "f308e8bb-767f-4863-8572-a51f950dd5f8",
                           "dst_ports": [
                             {
                               "end_port": -1,
                               "start_port": -1
                             }
                           ],
                           "application": [],
                           "src_addresses": [
                             {
                               "security_group": null,
                               "virtual_network": "default-domain:admin:vn22",
                               "subnet": null,
                               "network_policy": null
                             }
                           ],
                           "rule_sequence": {
                             "major": 1,
                             "minor": 0
                           },
                           "src_ports": [
                             {
                               "end_port": -1,
                               "start_port": -1
                             }
                           ]
                         }
                       ]
                     },
                     "uuid": "7ef7e52c-d16e-419e-9ad5-37a51553d90b",
                     "parent_uuid": "36bb47ab-3969-4669-b8e1-b1f5b70f86f1",
                     "parent_href": "http://nodea16:8082/project/36bb47ab-3969-4669-b8e1-b1f5b70f86f1",
                     "parent_type": "project",
                     "perms2": {
                       "owner": "36bb47ab39694669b8e1b1f5b70f86f1",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "Test Policy1"
                     ],
                     "display_name": "Test Policy1",
                     "security_logging_object_back_refs": [
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "@slo24324"
                         ],
                         "href": "http://nodea16:8082/security-logging-object/203b3d99-03d0-49b0-83c8-ade22b050f01",
                         "attr": {
                           "rule": [
                             {
                               "rule_uuid": "f308e8bb-767f-4863-8572-a51f950dd5f8",
                               "rate": 100
                             }
                           ]
                         },
                         "uuid": "203b3d99-03d0-49b0-83c8-ade22b050f01"
                       }
                     ],
                     "name": "Test Policy1"
                   }
                 },
                 {
                   "network-policy": {
                     "network_policy_entries": {
                       "policy_rule": [
                         {
                           "direction": "<>",
                           "protocol": "any",
                           "dst_addresses": [
                             {
                               "security_group": null,
                               "virtual_network": "any",
                               "subnet": null,
                               "network_policy": null
                             }
                           ],
                           "action_list": {
                             "mirror_to": null,
                             "gateway_name": null,
                             "log": false,
                             "qos_action": null,
                             "simple_action": "pass",
                             "apply_service": null
                           },
                           "rule_uuid": "787f0bec-7b14-4ec5-b31a-f61798c36dc0",
                           "dst_ports": [
                             {
                               "end_port": -1,
                               "start_port": -1
                             }
                           ],
                           "application": [],
                           "src_addresses": [
                             {
                               "security_group": null,
                               "virtual_network": "any",
                               "subnet": null,
                               "network_policy": null
                             }
                           ],
                           "rule_sequence": {
                             "major": 1,
                             "minor": 0
                           },
                           "src_ports": [
                             {
                               "end_port": -1,
                               "start_port": -1
                             }
                           ]
                         },
                         {
                           "direction": "<>",
                           "protocol": "any",
                           "dst_addresses": [
                             {
                               "security_group": null,
                               "virtual_network": "default-domain:admin:vn12",
                               "subnet": null,
                               "network_policy": null
                             }
                           ],
                           "action_list": {
                             "mirror_to": null,
                             "gateway_name": null,
                             "log": false,
                             "qos_action": null,
                             "simple_action": "pass",
                             "apply_service": null
                           },
                           "rule_uuid": "4289616e-e291-44b7-90b7-bac457a1a298",
                           "dst_ports": [
                             {
                               "end_port": -1,
                               "start_port": -1
                             }
                           ],
                           "application": [],
                           "src_addresses": [
                             {
                               "security_group": null,
                               "virtual_network": null,
                               "subnet": null,
                               "network_policy": "default-domain:project1:project"
                             }
                           ],
                           "rule_sequence": {
                             "major": 2,
                             "minor": 0
                           },
                           "src_ports": [
                             {
                               "end_port": -1,
                               "start_port": -1
                             }
                           ]
                         },
                         {
                           "direction": "<>",
                           "protocol": "any",
                           "dst_addresses": [
                             {
                               "security_group": null,
                               "virtual_network": "any",
                               "subnet": null,
                               "network_policy": null
                             }
                           ],
                           "action_list": {
                             "mirror_to": null,
                             "gateway_name": null,
                             "log": false,
                             "qos_action": null,
                             "simple_action": "pass",
                             "apply_service": null
                           },
                           "rule_uuid": "da587b26-32dd-48f9-8bab-0f80c378ee3b",
                           "dst_ports": [
                             {
                               "end_port": -1,
                               "start_port": -1
                             }
                           ],
                           "application": [],
                           "src_addresses": [
                             {
                               "security_group": null,
                               "virtual_network": "local",
                               "subnet": null,
                               "network_policy": null
                             }
                           ],
                           "rule_sequence": {
                             "major": 3,
                             "minor": 0
                           },
                           "src_ports": [
                             {
                               "end_port": -1,
                               "start_port": -1
                             }
                           ]
                         }
                       ]
                     },
                     "uuid": "ed5ba98f-fe34-4b80-9446-a5d77183470f",
                     "parent_uuid": "36bb47ab-3969-4669-b8e1-b1f5b70f86f1",
                     "parent_href": "http://nodea16:8082/project/36bb47ab-3969-4669-b8e1-b1f5b70f86f1",
                     "parent_type": "project",
                     "perms2": {
                       "owner": "36bb47ab39694669b8e1b1f5b70f86f1",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "Test Policy"
                     ],
                     "display_name": "Test Policy",
                     "security_logging_object_back_refs": [
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "@resa"
                         ],
                         "href": "http://nodea16:8082/security-logging-object/85a93dca-edd5-4e0c-aa7a-3ace027dcbc2",
                         "attr": {
                           "rule": [
                             {
                               "rule_uuid": "787f0bec-7b14-4ec5-b31a-f61798c36dc0",
                               "rate": 100
                             }
                           ]
                         },
                         "uuid": "85a93dca-edd5-4e0c-aa7a-3ace027dcbc2"
                       }
                     ],
                     "name": "Test Policy"
                   }
                 }
               ],
               "lastKey": null,
               "more": false
     };
     this.sloMockData =
         [
             {
               "security-logging-objects": [
                 {
                   "security-logging-object": {
                     "security_logging_object_rules": {
                       "rule": []
                     },
                     "display_name": "@slo",
                     "uuid": "865cf939-aa03-4d86-b2ea-dfbda557ac0d",
                     "name": "@slo",
                     "href": "http://nodea16:8082/security-logging-object/865cf939-aa03-4d86-b2ea-dfbda557ac0d",
                     "parent_type": "project",
                     "security_logging_object_rate": 454,
                     "perms2": {
                       "owner": "36bb47ab39694669b8e1b1f5b70f86f1",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "description": null,
                       "creator": null,
                       "created": "2017-10-23T09:58:10.140208",
                       "user_visible": true,
                       "last_modified": "2017-10-25T08:59:51.174878",
                       "permissions": {
                         "owner": "admin",
                         "owner_access": 7,
                         "other_access": 7,
                         "group": "admin",
                         "group_access": 7
                       },
                       "uuid": {
                         "uuid_mslong": 9681887325000520000,
                         "uuid_lslong": 12892362888917266000
                       }
                     },
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "@slo"
                     ],
                     "parent_uuid": "36bb47ab-3969-4669-b8e1-b1f5b70f86f1"
                   }
                 },
                 {
                   "security-logging-object": {
                     "security_logging_object_rules": {
                       "rule": []
                     },
                     "display_name": "slo_project2",
                     "uuid": "9f7515e0-9b8c-4759-9cb2-fc59b03ed4ab",
                     "name": "slo_project2",
                     "href": "http://nodea16:8082/security-logging-object/9f7515e0-9b8c-4759-9cb2-fc59b03ed4ab",
                     "parent_type": "project",
                     "security_logging_object_rate": 434,
                     "perms2": {
                       "owner": "36bb47ab39694669b8e1b1f5b70f86f1",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "description": null,
                       "creator": null,
                       "created": "2017-10-17T06:41:41.880711",
                       "user_visible": true,
                       "last_modified": "2017-10-25T09:20:24.275552",
                       "permissions": {
                         "owner": "admin",
                         "owner_access": 7,
                         "other_access": 7,
                         "group": "admin",
                         "group_access": 7
                       },
                       "uuid": {
                         "uuid_mslong": 11490114078732208000,
                         "uuid_lslong": 11291364677910452000
                       }
                     },
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "slo_project2"
                     ],
                     "parent_uuid": "36bb47ab-3969-4669-b8e1-b1f5b70f86f1"
                   }
                 },
                 {
                   "security-logging-object": {
                     "display_name": "@testSlo",
                     "uuid": "c8dc1681-b924-4351-8389-da0f484d5ead",
                     "name": "@testSlo",
                     "href": "http://nodea16:8082/security-logging-object/c8dc1681-b924-4351-8389-da0f484d5ead",
                     "parent_type": "project",
                     "perms2": {
                       "owner": "36bb47ab39694669b8e1b1f5b70f86f1",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "security_logging_object_rate": 1001,
                     "firewall_policy_back_refs": [
                       {
                         "to": [
                           "default-policy-management",
                           "pol111"
                         ],
                         "attr": null,
                         "uuid": "9ba1f228-3fac-4ef2-b5fd-dcdf5eb5930f"
                       }
                     ],
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 14473468048874684000,
                         "uuid_lslong": 9478346649950314000
                       },
                       "created": "2017-10-27T13:07:26.805897",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-10-27T13:07:43.582345",
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
                       "@testSlo"
                     ],
                     "parent_uuid": "36bb47ab-3969-4669-b8e1-b1f5b70f86f1"
                   }
                 },
                 {
                   "security-logging-object": {
                     "security_logging_object_rules": {
                       "rule": []
                     },
                     "display_name": "slo_roject1",
                     "uuid": "a08e036c-4528-4800-a7a3-b54e30305792",
                     "name": "slo_roject1",
                     "href": "http://nodea16:8082/security-logging-object/a08e036c-4528-4800-a7a3-b54e30305792",
                     "parent_type": "project",
                     "security_logging_object_rate": 200,
                     "perms2": {
                       "owner": "36bb47ab39694669b8e1b1f5b70f86f1",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "description": null,
                       "creator": null,
                       "created": "2017-10-17T06:41:09.065304",
                       "user_visible": true,
                       "last_modified": "2017-10-25T08:53:16.503822",
                       "permissions": {
                         "owner": "admin",
                         "owner_access": 7,
                         "other_access": 7,
                         "group": "admin",
                         "group_access": 7
                       },
                       "uuid": {
                         "uuid_mslong": 11569188256313002000,
                         "uuid_lslong": 12079697972958353000
                       }
                     },
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "slo_roject1"
                     ],
                     "parent_uuid": "36bb47ab-3969-4669-b8e1-b1f5b70f86f1"
                   }
                 },
                 {
                   "security-logging-object": {
                     "security_logging_object_rules": {
                       "rule": [
                         {
                           "rule_uuid": "787f0bec-7b14-4ec5-b31a-f61798c36dc0",
                           "rate": 100
                         },
                         {
                           "rule_uuid": "6bd076cc-4c1c-484e-a711-5f8ce8537864",
                           "rate": 100
                         }
                       ]
                     },
                     "display_name": "@resa",
                     "uuid": "85a93dca-edd5-4e0c-aa7a-3ace027dcbc2",
                     "name": "@resa",
                     "network_policy_refs": [
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "Test Policy"
                         ],
                         "attr": {
                           "rule": [
                             {
                               "rule_uuid": "787f0bec-7b14-4ec5-b31a-f61798c36dc0",
                               "rate": 100
                             }
                           ]
                         },
                         "uuid": "ed5ba98f-fe34-4b80-9446-a5d77183470f"
                       },
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "HR_Finance_Sales"
                         ],
                         "attr": {
                           "rule": [
                             {
                               "rule_uuid": "6bd076cc-4c1c-484e-a711-5f8ce8537864",
                               "rate": 100
                             }
                           ]
                         },
                         "uuid": "7622381c-9cce-4643-9059-b16659349b44"
                       }
                     ],
                     "href": "http://nodea16:8082/security-logging-object/85a93dca-edd5-4e0c-aa7a-3ace027dcbc2",
                     "parent_type": "project",
                     "security_logging_object_rate": 100,
                     "perms2": {
                       "owner": "36bb47ab39694669b8e1b1f5b70f86f1",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "description": null,
                       "creator": null,
                       "created": "2017-10-25T11:11:34.520363",
                       "user_visible": true,
                       "last_modified": "2017-10-25T11:34:34.635047",
                       "permissions": {
                         "owner": "admin",
                         "owner_access": 7,
                         "other_access": 7,
                         "group": "admin",
                         "group_access": 7
                       },
                       "uuid": {
                         "uuid_mslong": 9631297219891384000,
                         "uuid_lslong": 12284195590085920000
                       }
                     },
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "@resa"
                     ],
                     "parent_uuid": "36bb47ab-3969-4669-b8e1-b1f5b70f86f1"
                   }
                 },
                 {
                   "security-logging-object": {
                     "security_logging_object_rules": {
                       "rule": [
                         {
                           "rule_uuid": "f308e8bb-767f-4863-8572-a51f950dd5f8",
                           "rate": 100
                         },
                         {
                           "rule_uuid": "6bd076cc-4c1c-484e-a711-5f8ce8537864",
                           "rate": 333
                         }
                       ]
                     },
                     "display_name": "@slo24324",
                     "uuid": "203b3d99-03d0-49b0-83c8-ade22b050f01",
                     "name": "@slo24324",
                     "network_policy_refs": [
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "Test Policy1"
                         ],
                         "attr": {
                           "rule": [
                             {
                               "rule_uuid": "f308e8bb-767f-4863-8572-a51f950dd5f8",
                               "rate": 100
                             }
                           ]
                         },
                         "uuid": "7ef7e52c-d16e-419e-9ad5-37a51553d90b"
                       },
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "HR_Finance_Sales"
                         ],
                         "attr": {
                           "rule": [
                             {
                               "rule_uuid": "6bd076cc-4c1c-484e-a711-5f8ce8537864",
                               "rate": 333
                             }
                           ]
                         },
                         "uuid": "7622381c-9cce-4643-9059-b16659349b44"
                       }
                     ],
                     "href": "http://nodea16:8082/security-logging-object/203b3d99-03d0-49b0-83c8-ade22b050f01",
                     "parent_type": "project",
                     "security_logging_object_rate": 100,
                     "perms2": {
                       "owner": "36bb47ab39694669b8e1b1f5b70f86f1",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "description": null,
                       "creator": null,
                       "created": "2017-10-25T09:27:54.168420",
                       "user_visible": true,
                       "last_modified": "2017-10-25T11:34:29.123727",
                       "permissions": {
                         "owner": "admin",
                         "owner_access": 7,
                         "other_access": 7,
                         "group": "admin",
                         "group_access": 7
                       },
                       "uuid": {
                         "uuid_mslong": 2322517760242895400,
                         "uuid_lslong": 9496031001206657000
                       }
                     },
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "@slo24324"
                     ],
                     "parent_uuid": "36bb47ab-3969-4669-b8e1-b1f5b70f86f1"
                   }
                 },
                 {
                   "security-logging-object": {
                     "security_logging_object_rules": {
                       "rule": [
                         {
                           "rule_uuid": "df1e29c0-e1cf-4263-be1e-75cc650359e3",
                           "rate": 100
                         },
                         {
                           "rule_uuid": "dd6d856c-0174-46f4-86af-309571f803e8",
                           "rate": 100
                         }
                       ]
                     },
                     "display_name": "Test1223",
                     "uuid": "814fbae6-6a74-49a3-ad35-6f2f1fcc451d",
                     "name": "Test1223",
                     "network_policy_refs": [
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "test_slo_policy"
                         ],
                         "attr": {
                           "rule": [
                             {
                               "rule_uuid": "dd6d856c-0174-46f4-86af-309571f803e8",
                               "rate": 100
                             }
                           ]
                         },
                         "uuid": "579705f6-004b-4273-9eaa-442f10895185"
                       }
                     ],
                     "security_group_refs": [
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "test_slo_sg"
                         ],
                         "attr": {
                           "rule": [
                             {
                               "rule_uuid": "df1e29c0-e1cf-4263-be1e-75cc650359e3",
                               "rate": 100
                             }
                           ]
                         },
                         "uuid": "5f1f835f-bdfc-4f2d-9cec-e872737155c1"
                       }
                     ],
                     "parent_type": "project",
                     "security_logging_object_rate": 100,
                     "href": "http://nodea16:8082/security-logging-object/814fbae6-6a74-49a3-ad35-6f2f1fcc451d",
                     "perms2": {
                       "owner": "36bb47ab39694669b8e1b1f5b70f86f1",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "description": null,
                       "creator": null,
                       "created": "2017-10-27T13:09:03.278972",
                       "user_visible": true,
                       "last_modified": "2017-10-27T13:09:17.116782",
                       "permissions": {
                         "owner": "admin",
                         "owner_access": 7,
                         "other_access": 7,
                         "group": "admin",
                         "group_access": 7
                       },
                       "uuid": {
                         "uuid_mslong": 9317871652844095000,
                         "uuid_lslong": 12481004190514825000
                       }
                     },
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "Test1223"
                     ],
                     "parent_uuid": "36bb47ab-3969-4669-b8e1-b1f5b70f86f1"
                   }
                 }
               ]
             }
           ];
       return {
           sloDomainsData: sloDomainsData,
           sloPojectsData: sloPojectsData,
           //portUUIDListData: portUUIDListData,
           sloMockData: sloMockData,
           secGrpMockData: secGrpMockData,
           networkPolicyMockData: networkPolicyMockData
       };
 });
