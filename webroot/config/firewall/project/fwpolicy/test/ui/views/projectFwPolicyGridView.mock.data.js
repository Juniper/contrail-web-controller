/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore','common/test/ui/unit/ct.common.mock.data'], function(_,TestCommonMockdata){
     this.fwPolicyMockData = [
         {
             "firewall-policys": [
               {
                 "firewall-policy": {
                   "fq_name": [
                     "default-domain",
                     "admin",
                     "new Policy"
                   ],
                   "uuid": "fc287ff9-56cb-4d79-8d4a-6c5f4527451a",
                   "href": "http://nodeg4:8082/firewall-policy/fc287ff9-56cb-4d79-8d4a-6c5f4527451a",
                   "parent_type": "project",
                   "name": "new Policy",
                   "perms2": {
                     "owner": "3ef47950bfff440897a980de1d670c06",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "id_perms": {
                     "enable": true,
                     "uuid": {
                       "uuid_mslong": 18169913405506015000,
                       "uuid_lslong": 10181069064062323000
                     },
                     "created": "2017-11-21T05:28:40.474133",
                     "description": null,
                     "creator": null,
                     "user_visible": true,
                     "last_modified": "2017-11-21T05:28:40.474133",
                     "permissions": {
                       "owner": "admin",
                       "owner_access": 7,
                       "other_access": 7,
                       "group": "admin",
                       "group_access": 7
                     }
                   },
                   "display_name": "new Policy",
                   "parent_uuid": "3ef47950-bfff-4408-97a9-80de1d670c06"
                 }
               },
               {
                 "firewall-policy": {
                   "display_name": "dsfsd",
                   "uuid": "a20e9377-149b-4538-bb0c-8af89ea201df",
                   "href": "http://nodeg4:8082/firewall-policy/a20e9377-149b-4538-bb0c-8af89ea201df",
                   "parent_type": "project",
                   "name": "dsfsd",
                   "firewall_rule_refs": [
                     {
                       "to": [
                         "default-domain",
                         "admin",
                         "ed468b20-9119-47fe-b68d-4f97cf7e1645"
                       ],
                       "attr": {
                         "sequence": "0"
                       },
                       "uuid": "ed468b20-9119-47fe-b68d-4f97cf7e1645"
                     }
                   ],
                   "perms2": {
                     "owner": "3ef47950bfff440897a980de1d670c06",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "id_perms": {
                     "enable": true,
                     "description": null,
                     "creator": null,
                     "created": "2017-11-21T07:34:17.675270",
                     "user_visible": true,
                     "last_modified": "2017-11-21T07:34:27.527067",
                     "permissions": {
                       "owner": "admin",
                       "owner_access": 7,
                       "other_access": 7,
                       "group": "admin",
                       "group_access": 7
                     },
                     "uuid": {
                       "uuid_mslong": 11677433023474387000,
                       "uuid_lslong": 13478300585230991000
                     }
                   },
                   "fq_name": [
                     "default-domain",
                     "admin",
                     "dsfsd"
                   ],
                   "parent_uuid": "3ef47950-bfff-4408-97a9-80de1d670c06"
                 }
               }
             ]
           }
         ];
       this.fwPolicyProjectRole = null;
       this.apsMockData = [
           {
               "application-policy-sets": [
                 {
                   "application-policy-set": {
                     "display_name": "default-application-policy-set",
                     "uuid": "38b89768-7ac3-4c03-be26-0bb4c00144bb",
                     "href": "http://nodeg4:8082/application-policy-set/38b89768-7ac3-4c03-be26-0bb4c00144bb",
                     "parent_type": "project",
                     "name": "default-application-policy-set",
                     "perms2": {
                       "owner": "3ef47950bfff440897a980de1d670c06",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 4087183136830737400,
                         "uuid_lslong": 13701651787264641000
                       },
                       "created": "2017-11-17T05:54:44.927746",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-11-17T05:54:44.927746",
                       "permissions": {
                         "owner": "contrail-api",
                         "owner_access": 7,
                         "other_access": 7,
                         "group": "admin",
                         "group_access": 7
                       }
                     },
                     "all_applications": true,
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "default-application-policy-set"
                     ],
                     "parent_uuid": "3ef47950-bfff-4408-97a9-80de1d670c06"
                   }
                 },
                 {
                   "application-policy-set": {
                     "display_name": "new Testdsad",
                     "uuid": "da34ca78-c071-4bf1-b61a-8b30a2a1cb3e",
                     "href": "http://nodeg4:8082/application-policy-set/da34ca78-c071-4bf1-b61a-8b30a2a1cb3e",
                     "parent_type": "project",
                     "name": "new Testdsad",
                     "tag_refs": [
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "application=source"
                         ],
                         "attr": null,
                         "uuid": "a79ec673-00b6-4206-b011-41f89ad14c3a"
                       }
                     ],
                     "firewall_policy_refs": [
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "test @121"
                         ],
                         "attr": {
                           "sequence": "0"
                         },
                         "uuid": "a8e23c26-3ce7-46d0-998a-7aff0fae79e4"
                       }
                     ],
                     "perms2": {
                       "owner": "3ef47950bfff440897a980de1d670c06",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 15723414819030780000,
                         "uuid_lslong": 13121953505300564000
                       },
                       "created": "2017-11-20T11:04:02.202371",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-11-20T11:04:02.202371",
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
                       "new Testdsad"
                     ],
                     "parent_uuid": "3ef47950-bfff-4408-97a9-80de1d670c06"
                   }
                 }
               ]
             }
           ];
       return {
           fwPolicyDomainsData: TestCommonMockdata.domainData,
           fwPolicyPojectsData: TestCommonMockdata.projectData,
           fwPolicyMockData: fwPolicyMockData,
           fwPolicyProjectRole: fwPolicyProjectRole,
           apsMockData: apsMockData
           
       };
 });
