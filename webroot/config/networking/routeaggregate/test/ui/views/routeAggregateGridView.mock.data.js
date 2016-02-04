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
     this.routeAggregateMockData = {
         "route-aggregates": [
           {
             "route-aggregate": {
               "fq_name": [
                 "default-domain",
                 "admin",
                 "test_route_aggregate"
               ],
               "name": "test_route_aggregate",
               "aggregate_route_nexthop": "12.12.12.1",
               "parent_uuid": "ee14bbf4-a3fc-4f98-a7b3-f1fe1d8b29bb",
               "parent_href": "http://10.204.216.12:9100/project/ee14bbf4-a3fc-4f98-a7b3-f1fe1d8b29bb",
               "parent_type": "project",
               "perms2": {
                 "owner": null,
                 "owner_access": 7,
                 "global_access": 0,
                 "share": []
               },
               "href": "http://10.204.216.12:9100/route-aggregate/1b2bf39a-85ea-4dbb-bf72-072e1950970e",
               "id_perms": {
                 "enable": true,
                 "uuid": {
                   "uuid_mslong": 1957926308019850800,
                   "uuid_lslong": 13795096503163853000
                 },
                 "created": "2016-02-03T10:30:13.813523",
                 "description": null,
                 "creator": null,
                 "user_visible": true,
                 "last_modified": "2016-02-03T10:30:13.813523",
                 "permissions": {
                   "owner": "cloud-admin",
                   "owner_access": 7,
                   "other_access": 7,
                   "group": "cloud-admin-group",
                   "group_access": 7
                 }
               },
               "aggregate_route_entries": {
                 "route": [
                   "route1",
                   "route2",
                   "route3"
                 ]
               },
               "display_name": "test_route_aggregate",
               "uuid": "1b2bf39a-85ea-4dbb-bf72-072e1950970e"
             }
           }
         ]
       };
       return {
           routeAggregateDomainsData : routeAggregateDomainsData,
           routeAggregatePojectsData : routeAggregatePojectsData,
           routeAggregateMockData : routeAggregateMockData
       };
 });
