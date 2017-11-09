/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore'], function(_){
     this.qosDomainsData = {
         "domains": [
           {
             "fq_name": [
               "default-domain"
             ],
             "uuid": "f1f5fd91-8016-4f0f-a0f3-b67e779f1d08"
           }
         ]
     };

     this.qosPojectsData = {
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

     this.qosMockData = [
         {
             "qos-configs": [
               {
                 "qos-config": {
                   "qos_config_type": "project",
                   "vlan_priority_entries": {
                     "qos_id_forwarding_class_pair": [
                       {
                         "key": 1,
                         "forwarding_class_id": 22
                       }
                     ]
                   },
                   "display_name": "test Qos",
                   "uuid": "b9de8e98-3802-4565-a482-99478f3c5db1",
                   "href": "http://nodea16:8082/qos-config/b9de8e98-3802-4565-a482-99478f3c5db1",
                   "default_forwarding_class_id": 1,
                   "parent_type": "project",
                   "name": "test Qos",
                   "mpls_exp_entries": {
                     "qos_id_forwarding_class_pair": [
                       {
                         "key": 0,
                         "forwarding_class_id": 22
                       }
                     ]
                   },
                   "perms2": {
                     "owner": "36bb47ab39694669b8e1b1f5b70f86f1",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "global_system_config_refs": [
                     {
                       "to": [
                         "default-global-system-config"
                       ],
                       "attr": null,
                       "uuid": "67044ab6-e3c1-46e8-9e10-451e345613a1"
                     }
                   ],
                   "id_perms": {
                     "enable": true,
                     "uuid": {
                       "uuid_mslong": 13393299126272280000,
                       "uuid_lslong": 11854205701817393000
                     },
                     "created": "2017-11-13T08:31:51.838853",
                     "description": null,
                     "creator": null,
                     "user_visible": true,
                     "last_modified": "2017-11-13T08:31:51.838853",
                     "permissions": {
                       "owner": "admin",
                       "owner_access": 7,
                       "other_access": 7,
                       "group": "admin",
                       "group_access": 7
                     }
                   },
                   "dscp_entries": {
                     "qos_id_forwarding_class_pair": [
                       {
                         "key": 10,
                         "forwarding_class_id": 12
                       }
                     ]
                   },
                   "fq_name": [
                     "default-domain",
                     "admin",
                     "test Qos"
                   ],
                   "parent_uuid": "36bb47ab-3969-4669-b8e1-b1f5b70f86f1"
                 }
               }
             ]
           }
         ];
       return {
           qosDomainsData: qosDomainsData,
           qosPojectsData: qosPojectsData,
           qosMockData: qosMockData
           
       };
 });
