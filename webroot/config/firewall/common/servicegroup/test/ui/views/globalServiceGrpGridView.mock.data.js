/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore'], function(_){
     this.serviceGrpMockData = [
         {
             "service-groups": [
               {
                 "service-group": {
                   "display_name": "new sg",
                   "uuid": "31cb7f24-4c56-4ba5-8a5c-7a84351eca49",
                   "href": "http://nodeg4:8082/service-group/31cb7f24-4c56-4ba5-8a5c-7a84351eca49",
                   "parent_type": "policy-management",
                   "name": "new sg",
                   "perms2": {
                     "owner": "cloud-admin",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "id_perms": {
                     "enable": true,
                     "description": null,
                     "creator": null,
                     "created": "2017-11-20T11:04:36.239323",
                     "user_visible": true,
                     "last_modified": "2017-11-20T11:04:45.987967",
                     "permissions": {
                       "owner": "admin",
                       "owner_access": 7,
                       "other_access": 7,
                       "group": "admin",
                       "group_access": 7
                     },
                     "uuid": {
                       "uuid_mslong": 3588101322007006000,
                       "uuid_lslong": 9969978383336917000
                     }
                   },
                   "fq_name": [
                     "default-policy-management",
                     "new sg"
                   ],
                   "service_group_firewall_service_list": {
                     "firewall_service": [
                       {
                         "protocol": "tcp",
                         "dst_ports": {
                           "end_port": -1,
                           "start_port": -1
                         },
                         "src_ports": {
                           "end_port": 65535,
                           "start_port": 0
                         },
                         "protocol_id": 6
                       }
                     ]
                   },
                   "parent_uuid": "6beb9b08-5c9a-4f0b-945e-50b5a56a4a23"
                 }
               },
               {
                 "service-group": {
                   "display_name": "new global sg",
                   "uuid": "054cbe33-7371-4b0d-a057-24518aad8069",
                   "href": "http://nodeg4:8082/service-group/054cbe33-7371-4b0d-a057-24518aad8069",
                   "parent_type": "policy-management",
                   "name": "new global sg",
                   "perms2": {
                     "owner": "cloud-admin",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "id_perms": {
                     "enable": true,
                     "uuid": {
                       "uuid_mslong": 381889196609063700,
                       "uuid_lslong": 11553743301679874000
                     },
                     "created": "2017-11-20T11:05:07.961488",
                     "description": null,
                     "creator": null,
                     "user_visible": true,
                     "last_modified": "2017-11-20T11:05:07.961488",
                     "permissions": {
                       "owner": "admin",
                       "owner_access": 7,
                       "other_access": 7,
                       "group": "admin",
                       "group_access": 7
                     }
                   },
                   "fq_name": [
                     "default-policy-management",
                     "new global sg"
                   ],
                   "service_group_firewall_service_list": {
                     "firewall_service": [
                       {
                         "protocol": "tcp",
                         "dst_ports": {
                           "end_port": 223,
                           "start_port": 22
                         },
                         "src_ports": {
                           "end_port": 65535,
                           "start_port": 0
                         },
                         "protocol_id": 6
                       }
                     ]
                   },
                   "parent_uuid": "6beb9b08-5c9a-4f0b-945e-50b5a56a4a23"
                 }
               }
             ]
           }
         ];
       return {
           serviceGrpMockData: serviceGrpMockData
       };
 });
