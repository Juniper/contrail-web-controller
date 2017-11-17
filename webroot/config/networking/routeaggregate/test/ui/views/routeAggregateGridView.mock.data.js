/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore'], function(_){
     this.routeAggregateDomainsData = {
         "domains": [
           {
             "href": "http://10.204.216.12:9100/domain/efa3feca-769d-4583-b38f-86614cde1810",
             "fq_name": [
               "default-domain"
             ],
             "uuid": "efa3feca-769d-4583-b38f-86614cde1810"
           }
         ]
     };
     this.routeAggregatePojectsData = {
         "projects": [
           {
             "uuid": "ee14bbf4-a3fc-4f98-a7b3-f1fe1d8b29bb",
             "fq_name": [
               "default-domain",
               "admin"
             ]
           },
           {
             "uuid": "fc176b78-28ff-4e0e-88f7-cc1e0224d237",
             "fq_name": [
               "default-domain",
               "demo"
             ]
           }
         ]
     };
     this.routeAggregateMockData = [
         {
             "route-aggregates": [
               {
                 "route-aggregate": {
                   "display_name": "Test11",
                   "uuid": "e0d5278e-53d9-4af2-877f-0eef1b3b73dd",
                   "href": "http://nodea16:8082/route-aggregate/e0d5278e-53d9-4af2-877f-0eef1b3b73dd",
                   "parent_type": "project",
                   "name": "Test11",
                   "perms2": {
                     "owner": "36bb47ab39694669b8e1b1f5b70f86f1",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "id_perms": {
                     "enable": true,
                     "uuid": {
                       "uuid_mslong": 16200898726780815000,
                       "uuid_lslong": 9763538937279377000
                     },
                     "created": "2017-11-10T06:11:23.424964",
                     "description": null,
                     "creator": null,
                     "user_visible": true,
                     "last_modified": "2017-11-10T06:11:23.424964",
                     "permissions": {
                       "owner": "admin",
                       "owner_access": 7,
                       "other_access": 7,
                       "group": "admin",
                       "group_access": 7
                     }
                   },
                   "aggregate_route_entries": {
                     "route": [
                       "22.2.22.22/16"
                     ]
                   },
                   "fq_name": [
                     "default-domain",
                     "admin",
                     "Test11"
                   ],
                   "parent_uuid": "36bb47ab-3969-4669-b8e1-b1f5b70f86f1"
                 }
               }
             ]
           }
         ];
       return {
           routeAggregateDomainsData : routeAggregateDomainsData,
           routeAggregatePojectsData : routeAggregatePojectsData,
           routeAggregateMockData : routeAggregateMockData
       };
 });
