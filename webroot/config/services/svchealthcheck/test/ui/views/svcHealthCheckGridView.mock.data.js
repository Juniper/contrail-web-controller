/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore'], function(_){
     this.svcHealthCheckDomainsData = {
         "domains": [
           {
             "fq_name": [
               "default-domain"
             ],
             "uuid": "f1f5fd91-8016-4f0f-a0f3-b67e779f1d08"
           }
         ]
     };

     this.svcHealthCheckPojectsData = {
         "projects": [
           {
             "uuid": "36bb47ab-3969-4669-b8e1-b1f5b70f86f1",
             "fq_name": [
               "default-domain",
               "admin"
             ]
           },
           {
             "uuid": "4bd4121b-5d0a-4994-b424-7d7e3656a75b",
             "fq_name": [
               "default-domain",
               "services"
             ]
           },
           {
               "uuid": "9beafc3c-0ff2-490a-86b7-5a81ca6c7a68",
               "fq_name": [
                 "default-domain",
                 "project1"
               ]
           }
         ]
     };
     this.svcHealthCheckProjectRole = null;
     this.svcHealthCheckMockData = [
         {
             "service-health-checks": [
               {
                 "service-health-check": {
                   "fq_name": [
                     "default-domain",
                     "admin",
                     "bfd_shc1"
                   ],
                   "uuid": "23e89df5-f54e-4d23-ad9b-c0272324646f",
                   "href": "http://nodeg4:8082/service-health-check/23e89df5-f54e-4d23-ad9b-c0272324646f",
                   "parent_type": "project",
                   "name": "bfd_shc1",
                   "perms2": {
                     "owner": "6cf81900c5af4e07afd66e11e768e00b",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "id_perms": {
                     "enable": true,
                     "description": null,
                     "creator": null,
                     "created": "2017-11-13T06:08:03.175115",
                     "user_visible": true,
                     "last_modified": "2017-11-15T13:33:30.328427",
                     "permissions": {
                       "owner": "admin",
                       "owner_access": 7,
                       "other_access": 7,
                       "group": "admin",
                       "group_access": 7
                     },
                     "uuid": {
                       "uuid_mslong": 2587491665632448000,
                       "uuid_lslong": 12509803664277530000
                     }
                   },
                   "display_name": "bfd_shc1",
                   "service_health_check_properties": {
                     "timeout": 5,
                     "timeoutUsecs": 0,
                     "enabled": true,
                     "delay": 0,
                     "expected_codes": null,
                     "max_retries": 2,
                     "http_method": null,
                     "delayUsecs": 10,
                     "url_path": "local-ip",
                     "monitor_type": "BFD",
                     "health_check_type": "link-local"
                   },
                   "service_instance_refs": [
                     {
                       "to": [
                         "default-domain",
                         "admin",
                         "new Instance"
                       ],
                       "attr": {
                         "interface_type": "management"
                       },
                       "uuid": "43f2c444-8ad6-4e61-bdd8-e4f9b243fc9d"
                     }
                   ],
                   "parent_uuid": "6cf81900-c5af-4e07-afd6-6e11e768e00b"
                 }
               }
             ]
           }
         ];
     
       return {
           svcHealthCheckDomainsData: svcHealthCheckDomainsData,
           svcHealthCheckPojectsData: svcHealthCheckPojectsData,
           svcHealthCheckProjectRole: svcHealthCheckProjectRole,
           svcHealthCheckMockData: svcHealthCheckMockData
       };
 });
