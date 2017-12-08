/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore'], function(_){
     this.fwPolicyMockData = [
         {
             "firewall-policys": [
               {
                 "firewall-policy": {
                   "fq_name": [
                     "default-policy-management",
                     "ewrwer"
                   ],
                   "uuid": "c1b60aff-df25-443e-af7a-dedb30eeadc8",
                   "href": "http://nodeg4:8082/firewall-policy/c1b60aff-df25-443e-af7a-dedb30eeadc8",
                   "parent_type": "policy-management",
                   "name": "ewrwer",
                   "perms2": {
                     "owner": "cloud-admin",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "id_perms": {
                     "enable": true,
                     "uuid": {
                       "uuid_mslong": 13958356189158132000,
                       "uuid_lslong": 12644663936796242000
                     },
                     "created": "2017-12-05T13:19:08.798722",
                     "description": null,
                     "creator": null,
                     "user_visible": true,
                     "last_modified": "2017-12-05T13:19:08.798722",
                     "permissions": {
                       "owner": "admin",
                       "owner_access": 7,
                       "other_access": 7,
                       "group": "admin",
                       "group_access": 7
                     }
                   },
                   "display_name": "ewrwer",
                   "parent_uuid": "6beb9b08-5c9a-4f0b-945e-50b5a56a4a23"
                 }
               },
               {
                 "firewall-policy": {
                   "fq_name": [
                     "default-policy-management",
                     "werwertert"
                   ],
                   "uuid": "897f52cb-591f-4334-8182-e45c5f758d7e",
                   "href": "http://nodeg4:8082/firewall-policy/897f52cb-591f-4334-8182-e45c5f758d7e",
                   "parent_type": "policy-management",
                   "name": "werwertert",
                   "perms2": {
                     "owner": "cloud-admin",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "id_perms": {
                     "enable": true,
                     "uuid": {
                       "uuid_mslong": 9907728738565440000,
                       "uuid_lslong": 9332272463254753000
                     },
                     "created": "2017-12-05T13:14:18.479628",
                     "description": null,
                     "creator": null,
                     "user_visible": true,
                     "last_modified": "2017-12-05T13:14:18.479628",
                     "permissions": {
                       "owner": "admin",
                       "owner_access": 7,
                       "other_access": 7,
                       "group": "admin",
                       "group_access": 7
                     }
                   },
                   "display_name": "werwertert",
                   "parent_uuid": "6beb9b08-5c9a-4f0b-945e-50b5a56a4a23"
                 }
               }
             ]
           }
         ];
       return {
           fwPolicyMockData: fwPolicyMockData
       };
 });
