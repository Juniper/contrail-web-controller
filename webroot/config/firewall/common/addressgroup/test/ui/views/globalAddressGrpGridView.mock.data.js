/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore'], function(_){
     this.addressGrpMockData = [
         {
             "address-groups": [
               {
                 "address-group": {
                   "address_group_prefix": {
                     "subnet": [
                       {
                         "ip_prefix": "22.1.1.1",
                         "ip_prefix_len": "32"
                       }
                     ]
                   },
                   "display_name": "test address",
                   "uuid": "c0ab4bc7-dd5b-44bb-8b10-ff1047cb789d",
                   "href": "http://nodeg4:8082/address-group/c0ab4bc7-dd5b-44bb-8b10-ff1047cb789d",
                   "parent_type": "policy-management",
                   "name": "test address",
                   "perms2": {
                     "owner": "cloud-admin",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "id_perms": {
                     "enable": true,
                     "uuid": {
                       "uuid_mslong": 13883273598084008000,
                       "uuid_lslong": 10020789616288430000
                     },
                     "created": "2017-11-24T06:26:20.767860",
                     "description": null,
                     "creator": null,
                     "user_visible": true,
                     "last_modified": "2017-11-24T06:26:20.767860",
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
                     "test address"
                   ],
                   "parent_uuid": "6beb9b08-5c9a-4f0b-945e-50b5a56a4a23"
                 }
               }
             ]
           }
         ];
       return {
           addressGrpMockData: addressGrpMockData
       };
 });
