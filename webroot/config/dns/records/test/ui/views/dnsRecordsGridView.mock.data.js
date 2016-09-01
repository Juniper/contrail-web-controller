/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore'], function(_){
     return({
         dnsRecordsDomainMockData : {
           "domains": [
             {
               "href": "http://10.204.216.40:9100/domain/07fbaa4b-c7b8-4f3d-996e-9d8b1830b288",
               "fq_name": [
                 "default-domain"
               ],
               "uuid": "07fbaa4b-c7b8-4f3d-996e-9d8b1830b288"
             }
           ]
         },
         dnsServerListMockData : [
           {
             "fq_name": [
               "default-domain",
               "s1"
             ],
             "href": "http://10.204.216.40:9100/virtual-DNS/e59247c6-280f-47b7-a3f3-994f3108cf93",
             "uuid": "e59247c6-280f-47b7-a3f3-994f3108cf93"
           }
         ],
         dnsRecordsMockData : [
           {
             "virtual-DNS-records": [
               {
                 "virtual-DNS-record": {
                   "fq_name": [
                     "default-domain",
                     "s2",
                     "47815646-001f-45f7-9766-ea81d6b1614b"
                   ],
                   "name": "47815646-001f-45f7-9766-ea81d6b1614b",
                   "virtual_DNS_record_data": {
                     "record_type": "A",
                     "record_ttl_seconds": 86400,
                     "record_name": "h1",
                     "record_class": "IN",
                     "record_data": "1.1.1.1"
                   },
                   "parent_uuid": "ffa7431e-7206-40ce-9886-76a254cd19ae",
                   "parent_href": "http://10.204.216.40:9100/virtual-DNS/ffa7431e-7206-40ce-9886-76a254cd19ae",
                   "parent_type": "virtual-DNS",
                   "perms2": {
                     "owner": null,
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "href": "http://10.204.216.40:9100/virtual-DNS-record/47815646-001f-45f7-9766-ea81d6b1614b",
                   "id_perms": {
                     "enable": true,
                     "uuid": {
                       "uuid_mslong": 5152494307338307000,
                       "uuid_lslong": 10909664990725235000
                     },
                     "created": "2016-03-29T11:44:50.274978",
                     "description": null,
                     "creator": null,
                     "user_visible": true,
                     "last_modified": "2016-03-29T11:44:50.274978",
                     "permissions": {
                       "owner": "cloud-admin",
                       "owner_access": 7,
                       "other_access": 7,
                       "group": "cloud-admin-group",
                       "group_access": 7
                     }
                   },
                   "display_name": "47815646-001f-45f7-9766-ea81d6b1614b",
                   "uuid": "47815646-001f-45f7-9766-ea81d6b1614b"
                 }
               },
               {
                 "virtual-DNS-record": {
                   "fq_name": [
                     "default-domain",
                     "s2",
                     "d156b94f-3428-4ce2-a668-667b67459b69"
                   ],
                   "name": "d156b94f-3428-4ce2-a668-667b67459b69",
                   "virtual_DNS_record_data": {
                     "record_type": "A",
                     "record_ttl_seconds": 45,
                     "record_name": "h2",
                     "record_class": "IN",
                     "record_data": "2.2.2.2"
                   },
                   "parent_uuid": "ffa7431e-7206-40ce-9886-76a254cd19ae",
                   "parent_href": "http://10.204.216.40:9100/virtual-DNS/ffa7431e-7206-40ce-9886-76a254cd19ae",
                   "parent_type": "virtual-DNS",
                   "perms2": {
                     "owner": null,
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "href": "http://10.204.216.40:9100/virtual-DNS-record/d156b94f-3428-4ce2-a668-667b67459b69",
                   "id_perms": {
                     "enable": true,
                     "description": null,
                     "creator": null,
                     "created": "2016-03-29T12:18:21.199282",
                     "user_visible": true,
                     "last_modified": "2016-03-29T12:18:35.565607",
                     "permissions": {
                       "owner": "cloud-admin",
                       "owner_access": 7,
                       "other_access": 7,
                       "group": "cloud-admin-group",
                       "group_access": 7
                     },
                     "uuid": {
                       "uuid_mslong": 15084447751752667000,
                       "uuid_lslong": 11990946688073570000
                     }
                   },
                   "display_name": "d156b94f-3428-4ce2-a668-667b67459b69",
                   "uuid": "d156b94f-3428-4ce2-a668-667b67459b69"
                 }
               },
               {
                 "virtual-DNS-record": {
                   "fq_name": [
                     "default-domain",
                     "s2",
                     "d1bdc0cb-9f96-43d8-b329-c51b8922371b"
                   ],
                   "name": "d1bdc0cb-9f96-43d8-b329-c51b8922371b",
                   "virtual_DNS_record_data": {
                     "record_type": "A",
                     "record_ttl_seconds": 86400,
                     "record_name": "h3",
                     "record_class": "IN",
                     "record_data": "3.3.3.3"
                   },
                   "parent_uuid": "ffa7431e-7206-40ce-9886-76a254cd19ae",
                   "parent_href": "http://10.204.216.40:9100/virtual-DNS/ffa7431e-7206-40ce-9886-76a254cd19ae",
                   "parent_type": "virtual-DNS",
                   "perms2": {
                     "owner": null,
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "href": "http://10.204.216.40:9100/virtual-DNS-record/d1bdc0cb-9f96-43d8-b329-c51b8922371b",
                   "id_perms": {
                     "enable": true,
                     "uuid": {
                       "uuid_mslong": 15113447905313570000,
                       "uuid_lslong": 12910066528889747000
                     },
                     "created": "2016-03-29T12:24:21.954924",
                     "description": null,
                     "creator": null,
                     "user_visible": true,
                     "last_modified": "2016-03-29T12:24:21.954924",
                     "permissions": {
                       "owner": "cloud-admin",
                       "owner_access": 7,
                       "other_access": 7,
                       "group": "cloud-admin-group",
                       "group_access": 7
                     }
                   },
                   "display_name": "d1bdc0cb-9f96-43d8-b329-c51b8922371b",
                   "uuid": "d1bdc0cb-9f96-43d8-b329-c51b8922371b"
                 }
               }
             ]
           }
         ]
     });
 });