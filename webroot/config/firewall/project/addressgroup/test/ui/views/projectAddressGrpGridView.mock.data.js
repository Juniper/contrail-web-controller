/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore','common/test/ui/unit/ct.common.mock.data'], function(_,TestCommonMockdata){
     this.addressGrpMockData = [
         {
             "address-groups": [
               {
                 "address-group": {
                   "address_group_prefix": {
                     "subnet": [
                       {
                         "ip_prefix": "22.2.2.2",
                         "ip_prefix_len": "32"
                       }
                     ]
                   },
                   "display_name": "local Address",
                   "uuid": "e150f4a2-e3a5-487f-a4fc-5a3300a3816f",
                   "href": "http://nodeg4:8082/address-group/e150f4a2-e3a5-487f-a4fc-5a3300a3816f",
                   "parent_type": "project",
                   "name": "local Address",
                   "perms2": {
                     "owner": "3ef47950bfff440897a980de1d670c06",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "id_perms": {
                     "enable": true,
                     "uuid": {
                       "uuid_mslong": 16235745637111777000,
                       "uuid_lslong": 11888476291451814000
                     },
                     "created": "2017-11-24T09:20:38.240758",
                     "description": null,
                     "creator": null,
                     "user_visible": true,
                     "last_modified": "2017-11-24T09:20:38.240758",
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
                     "local Address"
                   ],
                   "parent_uuid": "3ef47950-bfff-4408-97a9-80de1d670c06"
                 }
               }
             ]
           }
         ];
       this.addressGrpProjectRole = null;
       return {
           addressGrpDomainsData: TestCommonMockdata.domainData,
           addressGrpPojectsData: TestCommonMockdata.projectData,
           addressGrpMockData: addressGrpMockData,
           addressGrpProjectRole: addressGrpProjectRole
           
       };
 });
