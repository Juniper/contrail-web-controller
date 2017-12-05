/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore','common/test/ui/unit/ct.common.mock.data'], function(_,TestCommonMockdata){
     this.floatingIps =
     {
             "floating_ip_back_refs": [
               {
                 "floating-ip": {
                   "project_refs": [
                     {
                       "to": [
                         "default-domain",
                         "siva"
                       ],
                       "attr": null,
                       "uuid": "e4473f5b-2a65-465f-ad66-8edabba3f6ee"
                     }
                   ],
                   "display_name": "22c7b2aa-46a4-4e62-bb54-f70132b8b03a",
                   "uuid": "22c7b2aa-46a4-4e62-bb54-f70132b8b03a",
                   "href": "http://nodeg4:8082/floating-ip/22c7b2aa-46a4-4e62-bb54-f70132b8b03a",
                   "parent_type": "floating-ip-pool",
                   "name": "22c7b2aa-46a4-4e62-bb54-f70132b8b03a",
                   "perms2": {
                     "owner": "3ef47950bfff440897a980de1d670c06",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "floating_ip_address": "16.16.16.3",
                   "id_perms": {
                     "enable": true,
                     "uuid": {
                       "uuid_mslong": 2506168162054328000,
                       "uuid_lslong": 13498685567654212000
                     },
                     "created": "2017-12-05T05:21:45.624780",
                     "description": null,
                     "creator": null,
                     "user_visible": true,
                     "last_modified": "2017-12-05T05:21:45.624780",
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
                     "vn_16",
                     "default",
                     "22c7b2aa-46a4-4e62-bb54-f70132b8b03a"
                   ],
                   "parent_uuid": "681b6988-9d66-4927-9944-dbba2519d1de"
                 }
               }
             ]
           };
       return {
           domainData: TestCommonMockdata.domainData,
           projectData: TestCommonMockdata.projectData,
           floatingIps: floatingIps
       };
 });
