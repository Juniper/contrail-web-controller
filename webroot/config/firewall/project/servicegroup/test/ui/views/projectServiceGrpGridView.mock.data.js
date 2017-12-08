/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore','common/test/ui/unit/ct.common.mock.data'], function(_,TestCommonMockdata){
     this.serviceGrpMockData = [
         {
             "service-groups": [
               {
                 "service-group": {
                   "display_name": "local sg",
                   "uuid": "2898f88c-1942-4bf4-ab47-d5de7ab36825",
                   "href": "http://nodeg4:8082/service-group/2898f88c-1942-4bf4-ab47-d5de7ab36825",
                   "parent_type": "project",
                   "name": "local sg",
                   "perms2": {
                     "owner": "3ef47950bfff440897a980de1d670c06",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "id_perms": {
                     "enable": true,
                     "uuid": {
                       "uuid_mslong": 2925361238580022300,
                       "uuid_lslong": 12342068455350168000
                     },
                     "created": "2017-11-20T11:05:22.408169",
                     "description": null,
                     "creator": null,
                     "user_visible": true,
                     "last_modified": "2017-11-20T11:05:22.408169",
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
                     "local sg"
                   ],
                   "service_group_firewall_service_list": {
                     "firewall_service": [
                       {
                         "protocol": "tcp",
                         "dst_ports": {
                           "end_port": 543,
                           "start_port": 45
                         },
                         "src_ports": {
                           "end_port": 65535,
                           "start_port": 0
                         },
                         "protocol_id": 6
                       }
                     ]
                   },
                   "parent_uuid": "3ef47950-bfff-4408-97a9-80de1d670c06"
                 }
               }
             ]
           }
         ];
       this.serviceGrpProjectRole = null;
       return {
           serviceGrpDomainsData: TestCommonMockdata.domainData,
           serviceGrpPojectsData: TestCommonMockdata.projectData,
           serviceGrpMockData: serviceGrpMockData,
           serviceGrpProjectRole: serviceGrpProjectRole
           
       };
 });
