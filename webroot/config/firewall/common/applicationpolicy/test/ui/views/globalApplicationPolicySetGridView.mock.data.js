/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore'], function(_){
     this.apsMockData = [
         {
             "application-policy-sets": [
               {
                 "application-policy-set": {
                   "fq_name": [
                     "default-policy-management",
                     "default-application-policy-set"
                   ],
                   "uuid": "17ad1367-a6a4-4ab4-a4eb-c1d87199595d",
                   "href": "http://nodeg4:8082/application-policy-set/17ad1367-a6a4-4ab4-a4eb-c1d87199595d",
                   "parent_type": "policy-management",
                   "name": "default-application-policy-set",
                   "perms2": {
                     "owner": "cloud-admin",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "id_perms": {
                     "enable": true,
                     "uuid": {
                       "uuid_mslong": 1706041169741630200,
                       "uuid_lslong": 11883805177110157000
                     },
                     "created": "2017-11-17T05:49:35.028627",
                     "description": null,
                     "creator": null,
                     "user_visible": true,
                     "last_modified": "2017-11-30T01:44:46.329867",
                     "permissions": {
                       "owner": "cloud-admin",
                       "owner_access": 7,
                       "other_access": 7,
                       "group": "cloud-admin-group",
                       "group_access": 7
                     }
                   },
                   "global_vrouter_config_refs": [
                     {
                       "to": [
                         "default-global-system-config",
                         "default-global-vrouter-config"
                       ],
                       "attr": null,
                       "uuid": "37d94063-9c54-4698-aee8-de10962d1bbd"
                     }
                   ],
                   "all_applications": true,
                   "parent_uuid": "6beb9b08-5c9a-4f0b-945e-50b5a56a4a23"
                 }
               },
               {
                 "application-policy-set": {
                   "fq_name": [
                     "default-policy-management",
                     "new APS"
                   ],
                   "uuid": "5843f726-4166-4025-bf3e-b8a9ecbe9be6",
                   "href": "http://nodeg4:8082/application-policy-set/5843f726-4166-4025-bf3e-b8a9ecbe9be6",
                   "parent_type": "policy-management",
                   "name": "new APS",
                   "tag_refs": [
                     {
                       "to": [
                         "application=data"
                       ],
                       "attr": null,
                       "uuid": "cae0fb44-2426-4f0d-a9cf-4af06b4d9478"
                     }
                   ],
                   "firewall_policy_refs": [
                     {
                       "to": [
                         "default-policy-management",
                         "global policy two"
                       ],
                       "attr": {
                         "sequence": "0"
                       },
                       "uuid": "e166fb7d-0ca2-4ed7-b422-afc3d2f36f9b"
                     }
                   ],
                   "perms2": {
                     "owner": "cloud-admin",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "id_perms": {
                     "enable": true,
                     "uuid": {
                       "uuid_mslong": 6360198842455310000,
                       "uuid_lslong": 13780654949761194000
                     },
                     "created": "2017-11-20T10:51:35.095141",
                     "description": null,
                     "creator": null,
                     "user_visible": true,
                     "last_modified": "2017-11-20T10:51:35.095141",
                     "permissions": {
                       "owner": "admin",
                       "owner_access": 7,
                       "other_access": 7,
                       "group": "admin",
                       "group_access": 7
                     }
                   },
                   "display_name": "new APS",
                   "parent_uuid": "6beb9b08-5c9a-4f0b-945e-50b5a56a4a23"
                 }
               }
             ]
           }
         ];
       return {
           apsMockData: apsMockData
       };
 });
