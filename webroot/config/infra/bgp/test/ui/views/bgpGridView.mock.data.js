/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore'], function(_){
     this.bgpMockData = [
         {
           "bgp-router": {
             "fq_name": [
               "default-domain",
               "default-project",
               "ip-fabric",
               "__default__",
               "nodea2"
             ],
             "name": "nodea2",
             "parent_uuid": "a20aa20f-8088-40b1-9d81-b6f22f6ebf86",
             "parent_href": "http://10.204.216.40:9100/routing-instance/a20aa20f-8088-40b1-9d81-b6f22f6ebf86",
             "parent_type": "routing-instance",
             "bgp_router_parameters": {
               "vendor": "contrail",
               "admin_down": false,
               "port": 179,
               "local_autonomous_system": null,
               "auth_data": null,
               "address": "10.204.216.40",
               "router_type": null,
               "identifier": "10.204.216.40",
               "hold_time": 90,
               "autonomous_system": 64512,
               "address_families": {
                 "family": [
                   "route-target",
                   "inet-vpn",
                   "e-vpn",
                   "erm-vpn",
                   "inet6-vpn"
                 ]
               }
             },
             "perms2": {
               "owner": "e9a7b1af07c147889169045c5f2caafb",
               "owner_access": 7,
               "global_access": 0,
               "share": []
             },
             "href": "http://10.204.216.40:9100/bgp-router/a6e0447a-ceb9-42fa-bf03-179ca3ead9e0",
             "id_perms": {
               "enable": true,
               "description": null,
               "created": "2015-11-20T10:12:23.725617",
               "creator": null,
               "uuid": {
                 "uuid_mslong": 12024686299324170000,
                 "uuid_lslong": 13763870847706782000
               },
               "user_visible": true,
               "last_modified": "2015-11-20T10:15:29.330528",
               "permissions": {
                 "owner": "admin",
                 "owner_access": 7,
                 "other_access": 7,
                 "group": "KeystoneServiceAdmin",
                 "group_access": 7
               }
             },
             "display_name": "nodea2",
             "uuid": "a6e0447a-ceb9-42fa-bf03-179ca3ead9e0"
           }
         }
       ];
       return { bgpMockData : bgpMockData };
 });