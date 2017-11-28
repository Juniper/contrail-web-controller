/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore','common/test/ui/unit/ct.common.mock.data'], function(_,TestCommonMockdata){
     this.getData =
     {
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
                         "rule_uuid": "bc092044-c894-43d6-b3b0-1a1104e24bef",
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
                   "uuid": "68f8145d-69c5-4668-bfe8-a09091658044",
                   "parent_uuid": "3ef47950-bfff-4408-97a9-80de1d670c06",
                   "parent_href": "http://nodeg4:8082/project/3ef47950-bfff-4408-97a9-80de1d670c06",
                   "parent_type": "project",
                   "perms2": {
                     "owner": "3ef47950bfff440897a980de1d670c06",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "fq_name": [
                     "default-domain",
                     "admin",
                     "policy1"
                   ],
                   "display_name": "policy1",
                   "name": "policy1"
                 }
               }
             ],
             "lastKey": null,
             "more": false
           };
       return {
           domainData: TestCommonMockdata.domainData,
           projectData: TestCommonMockdata.projectData,
           getData: getData
       };
 });
