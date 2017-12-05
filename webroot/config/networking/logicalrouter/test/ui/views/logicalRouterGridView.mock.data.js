/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore','common/test/ui/unit/ct.common.mock.data'], function(_,TestCommonMockdata){
     this.logicalRouter =
     {
             "data": [
               {
                 "logical-router": {
                   "parent_uuid": "e4473f5b-2a65-465f-ad66-8edabba3f6ee",
                   "parent_href": "http://nodeg4:8082/project/e4473f5b-2a65-465f-ad66-8edabba3f6ee",
                   "parent_type": "project",
                   "href": "http://nodeg4:8082/logical-router/74384a2c-b4f1-4323-bf31-d43eb9761b75",
                   "configured_route_target_list": {
                     "route_target": []
                   },
                   "id_perms": {
                     "enable": true,
                     "uuid": {
                       "uuid_mslong": 8374525062970164000,
                       "uuid_lslong": 13777026100967643000
                     },
                     "creator": null,
                     "created": "2017-12-08T19:14:36.479201",
                     "user_visible": true,
                     "last_modified": "2017-12-08T19:14:36.973202",
                     "permissions": {
                       "owner": "admin",
                       "owner_access": 7,
                       "other_access": 7,
                       "group": "admin",
                       "group_access": 7
                     },
                     "description": null
                   },
                   "fq_name": [
                     "default-domain",
                     "siva",
                     "route1"
                   ],
                   "physical_router_refs": [
                     {
                       "to": [
                         "default-global-system-config",
                         "dwd"
                       ],
                       "href": "http://nodeg4:8082/physical-router/1357a337-3084-4252-b28d-fd4829a4bf63",
                       "attr": null,
                       "uuid": "1357a337-3084-4252-b28d-fd4829a4bf63"
                     }
                   ],
                   "name": "route1",
                   "display_name": "route1",
                   "uuid": "74384a2c-b4f1-4323-bf31-d43eb9761b75",
                   "virtual_machine_interface_refs": [
                     {
                       "to": [
                         "default-domain",
                         "siva",
                         "8d440f70-37e4-4de5-b6b6-ea57b2837fb2"
                       ],
                       "href": "http://nodeg4:8082/virtual-machine-interface/8d440f70-37e4-4de5-b6b6-ea57b2837fb2",
                       "attr": null,
                       "uuid": "8d440f70-37e4-4de5-b6b6-ea57b2837fb2",
                       "virtual_network_refs": [
                         {
                           "to": [
                             "default-domain",
                             "siva",
                             "vn23"
                           ],
                           "href": "http://nodeg4:8082/virtual-network/68b61622-bab7-4350-9cbb-012b330b9002",
                           "attr": null,
                           "uuid": "68b61622-bab7-4350-9cbb-012b330b9002"
                         }
                       ],
                       "instance_ip_back_refs": [
                         {
                           "to": [
                             "d58aad44-9ec9-439a-aefd-471719530491"
                           ],
                           "href": "http://nodeg4:8082/instance-ip/d58aad44-9ec9-439a-aefd-471719530491",
                           "attr": null,
                           "uuid": "d58aad44-9ec9-439a-aefd-471719530491",
                           "ip": "23.23.23.3"
                         }
                       ]
                     }
                   ],
                   "virtual_network_refs": [
                     {
                       "to": [
                         "default-domain",
                         "admin",
                         "vn_16"
                       ],
                       "href": "http://nodeg4:8082/virtual-network/ccc3869f-7df9-4236-8d2c-9513adb0a7a3",
                       "attr": null,
                       "uuid": "ccc3869f-7df9-4236-8d2c-9513adb0a7a3"
                     }
                   ],
                   "perms2": {
                     "owner": "e4473f5b2a65465fad668edabba3f6ee",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "route_table_refs": [
                     {
                       "to": [
                         "default-domain",
                         "siva",
                         "rt_74384a2c-b4f1-4323-bf31-d43eb9761b75"
                       ],
                       "href": "http://nodeg4:8082/route-table/4ad8cd9d-403e-4f3a-82a0-fcd598ef4233",
                       "attr": null,
                       "uuid": "4ad8cd9d-403e-4f3a-82a0-fcd598ef4233"
                     }
                   ],
                   "route_target_refs": [
                     {
                       "to": [
                         "target:64510:8000014"
                       ],
                       "href": "http://nodeg4:8082/route-target/7eaea5e2-572c-42d3-8a53-c22abe613a2c",
                       "attr": null,
                       "uuid": "7eaea5e2-572c-42d3-8a53-c22abe613a2c"
                     }
                   ],
                   "service_instance_refs": [
                     {
                       "to": [
                         "default-domain",
                         "siva",
                         "snat_74384a2c-b4f1-4323-bf31-d43eb9761b75_1eee1bee-f13c-4f96-83f8-2907f9f9bca4"
                       ],
                       "href": "http://nodeg4:8082/service-instance/fa65e1b1-79c7-4c1b-aef3-a5f070d05c73",
                       "attr": null,
                       "uuid": "fa65e1b1-79c7-4c1b-aef3-a5f070d05c73"
                     }
                   ]
                 }
               }
             ],
             "lastKey": null,
             "more": false
           };
       return {
           domainData: TestCommonMockdata.domainData,
           projectData: TestCommonMockdata.projectData,
           logicalRouter: logicalRouter
       };
 });
