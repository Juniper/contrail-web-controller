/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore','common/test/ui/unit/ct.common.mock.data'], function(_,TestCommonMockdata){
     this.projectTagMockData = [
         {
             "tags": [
               {
                 "tag": {
                   "tag_type_refs": [
                     {
                       "to": [
                         "tier"
                       ],
                       "attr": null,
                       "uuid": "11c1c7e8-5ed2-4007-a918-7916e50faf76"
                     }
                   ],
                   "tag_type_name": "tier",
                   "fq_name": [
                     "default-domain",
                     "admin",
                     "tier=one"
                   ],
                   "uuid": "e5c3e49a-6d73-4986-ade3-59ec71e9c573",
                   "name": "tier=one",
                   "href": "http://nodeg4:8082/tag/e5c3e49a-6d73-4986-ade3-59ec71e9c573",
                   "parent_type": "project",
                   "tag_id": "0x00020001",
                   "tag_value": "one",
                   "perms2": {
                     "owner": "3ef47950bfff440897a980de1d670c06",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "project_back_refs": [
                     {
                       "to": [
                         "default-domain",
                         "admin"
                       ],
                       "attr": null,
                       "uuid": "3ef47950-bfff-4408-97a9-80de1d670c06"
                     }
                   ],
                   "display_name": "tier=one",
                   "id_perms": {
                     "enable": true,
                     "uuid": {
                       "uuid_mslong": 16556328007056443000,
                       "uuid_lslong": 12529957460333152000
                     },
                     "created": "2017-11-20T08:54:23.738592",
                     "description": null,
                     "creator": null,
                     "user_visible": true,
                     "last_modified": "2017-11-20T08:54:23.738592",
                     "permissions": {
                       "owner": "admin",
                       "owner_access": 7,
                       "other_access": 7,
                       "group": "admin",
                       "group_access": 7
                     }
                   },
                   "parent_uuid": "3ef47950-bfff-4408-97a9-80de1d670c06"
                 }
               },
               {
                 "tag": {
                   "tag_type_refs": [
                     {
                       "to": [
                         "application"
                       ],
                       "attr": null,
                       "uuid": "88a86b25-8b57-424a-bc53-c422977eb438"
                     }
                   ],
                   "tag_type_name": "application",
                   "fq_name": [
                     "default-domain",
                     "admin",
                     "application=source"
                   ],
                   "uuid": "a79ec673-00b6-4206-b011-41f89ad14c3a",
                   "name": "application=source",
                   "href": "http://nodeg4:8082/tag/a79ec673-00b6-4206-b011-41f89ad14c3a",
                   "parent_type": "project",
                   "tag_id": "0x00010001",
                   "tag_value": "source",
                   "perms2": {
                     "owner": "3ef47950bfff440897a980de1d670c06",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "application_policy_set_back_refs": [
                     {
                       "to": [
                         "default-domain",
                         "admin",
                         "new Testdsad"
                       ],
                       "attr": null,
                       "uuid": "da34ca78-c071-4bf1-b61a-8b30a2a1cb3e"
                     }
                   ],
                   "display_name": "application=source",
                   "id_perms": {
                     "enable": true,
                     "uuid": {
                       "uuid_mslong": 12078309447889732000,
                       "uuid_lslong": 12686994161284502000
                     },
                     "created": "2017-11-20T08:54:12.977996",
                     "description": null,
                     "creator": null,
                     "user_visible": true,
                     "last_modified": "2017-11-20T08:54:12.977996",
                     "permissions": {
                       "owner": "admin",
                       "owner_access": 7,
                       "other_access": 7,
                       "group": "admin",
                       "group_access": 7
                     }
                   },
                   "parent_uuid": "3ef47950-bfff-4408-97a9-80de1d670c06"
                 }
               }
             ]
           }
         ];
       this.projectTagProjectRole = null;
       this.projectTagModalInput = {
               "tag_type": "Application",
               "tag_value": "sales"
       };
       this.projectTagModalOutput = {
                "tag": {
                    "tag_value": "sales",
                    "tag_type_name": "Application",
                    "fq_name": ["default-domain", "admin", "Application-sales"],
                    "parent_type": "project"
                }
       };
       this.customTagModalInput = {
               "tag_type": "Custom",
               "tag_value": "custom_value"
       };
       this.customTagModalOutput = {
               "tag": {
                    "tag_value": "custom_value",
                    "tag_type_name": "Custom",
                    "fq_name": ["default-domain", "admin", "Custom-custom_value"],
                    "parent_type": "project"
                }
       };
       return {
           projectTagDomainsData: TestCommonMockdata.domainData,
           projectTagPojectsData: TestCommonMockdata.projectData,
           projectTagMockData: projectTagMockData,
           projectTagProjectRole: projectTagProjectRole,
           projectTagModalInput: projectTagModalInput,
           projectTagModalOutput: projectTagModalOutput,
           customTagModalInput: customTagModalInput,
           customTagModalOutput: customTagModalOutput
       };
 });
