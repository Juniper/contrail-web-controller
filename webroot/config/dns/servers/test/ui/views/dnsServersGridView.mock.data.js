/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore'], function(_){
     this.dnsServerDomainsMockData = {
       "domains": [
         {
           "href": "http://10.204.216.40:9100/domain/07fbaa4b-c7b8-4f3d-996e-9d8b1830b288",
           "fq_name": [
             "default-domain"
           ],
           "uuid": "07fbaa4b-c7b8-4f3d-996e-9d8b1830b288"
         }
       ]
     };
     this.dnsServersMockData = [
       {
         "virtual-DNSs": [
           {
             "virtual-DNS": {
               "fq_name": [
                 "default-domain",
                 "s1"
               ],
               "name": "s1",
               "parent_uuid": "5ffc415b-fa86-4c9d-85d0-792e57b4064a",
               "parent_href": "http://10.204.216.40:9100/domain/5ffc415b-fa86-4c9d-85d0-792e57b4064a",
               "parent_type": "domain",
               "perms2": {
                 "owner": null,
                 "owner_access": 7,
                 "global_access": 0,
                 "share": []
               },
               "href": "http://10.204.216.40:9100/virtual-DNS/bca3b8d6-f93e-4e3b-9d36-3dde9616b22a",
               "virtual_DNS_data": {
                 "floating_ip_record": "dashed-ip-tenant-name",
                 "domain_name": "s1.com",
                 "external_visible": true,
                 "dynamic_records_from_client": true,
                 "reverse_resolution": false,
                 "default_ttl_seconds": 86400,
                 "record_order": "random"
               },
               "id_perms": {
                 "enable": true,
                 "description": null,
                 "creator": null,
                 "created": "2016-03-29T04:56:29.915439",
                 "user_visible": true,
                 "last_modified": "2016-03-29T11:19:59.808696",
                 "permissions": {
                   "owner": "cloud-admin",
                   "owner_access": 7,
                   "other_access": 7,
                   "group": "cloud-admin-group",
                   "group_access": 7
                 },
                 "uuid": {
                   "uuid_mslong": 13592911333778412000,
                   "uuid_lslong": 11328309938907165000
                 }
               },
               "display_name": "s1",
               "uuid": "bca3b8d6-f93e-4e3b-9d36-3dde9616b22a"
             }
           },
           {
             "virtual-DNS": {
               "fq_name": [
                 "default-domain",
                 "s2"
               ],
               "name": "s2",
               "parent_uuid": "5ffc415b-fa86-4c9d-85d0-792e57b4064a",
               "parent_href": "http://10.204.216.40:9100/domain/5ffc415b-fa86-4c9d-85d0-792e57b4064a",
               "parent_type": "domain",
               "perms2": {
                 "owner": null,
                 "owner_access": 7,
                 "global_access": 0,
                 "share": []
               },
               "network_ipam_back_refs": [
                 {
                   "to": [
                     "default-domain",
                     "default-project",
                     "default-network-ipam"
                   ],
                   "href": "http://10.204.216.40:9100/network-ipam/5e506bcb-08e4-4f99-85d1-4ba37e071c08",
                   "attr": null,
                   "uuid": "5e506bcb-08e4-4f99-85d1-4ba37e071c08"
                 }
               ],
               "href": "http://10.204.216.40:9100/virtual-DNS/ffa7431e-7206-40ce-9886-76a254cd19ae",
               "virtual_DNS_data": {
                 "floating_ip_record": "vm-name",
                 "domain_name": "s2.com",
                 "external_visible": true,
                 "next_virtual_DNS": "default-domain:s1",
                 "dynamic_records_from_client": true,
                 "reverse_resolution": false,
                 "default_ttl_seconds": 340,
                 "record_order": "fixed"
               },
               "id_perms": {
                 "enable": true,
                 "uuid": {
                   "uuid_mslong": 18421766598823395000,
                   "uuid_lslong": 10990602380223780000
                 },
                 "creator": null,
                 "created": "2016-03-29T11:32:42.645987",
                 "user_visible": true,
                 "last_modified": "2016-03-29T11:36:28.976707",
                 "permissions": {
                   "owner": "cloud-admin",
                   "owner_access": 7,
                   "other_access": 7,
                   "group": "cloud-admin-group",
                   "group_access": 7
                 },
                 "description": null
               },
               "display_name": "s2",
               "uuid": "ffa7431e-7206-40ce-9886-76a254cd19ae"
             }
           },
           {
             "virtual-DNS": {
               "fq_name": [
                 "default-domain",
                 "s3"
               ],
               "name": "s3",
               "parent_uuid": "5ffc415b-fa86-4c9d-85d0-792e57b4064a",
               "parent_href": "http://10.204.216.40:9100/domain/5ffc415b-fa86-4c9d-85d0-792e57b4064a",
               "parent_type": "domain",
               "perms2": {
                 "owner": null,
                 "owner_access": 7,
                 "global_access": 0,
                 "share": []
               },
               "href": "http://10.204.216.40:9100/virtual-DNS/a951f7d2-63a2-46a0-88c4-157ba8588e3d",
               "virtual_DNS_data": {
                 "floating_ip_record": "dashed-ip-tenant-name",
                 "domain_name": "s3.com",
                 "external_visible": false,
                 "dynamic_records_from_client": true,
                 "reverse_resolution": false,
                 "default_ttl_seconds": 86400,
                 "record_order": "random"
               },
               "id_perms": {
                 "enable": true,
                 "uuid": {
                   "uuid_mslong": 12200805348510157000,
                   "uuid_lslong": 9855025505443025000
                 },
                 "created": "2016-03-29T12:18:02.778271",
                 "description": null,
                 "creator": null,
                 "user_visible": true,
                 "last_modified": "2016-03-29T12:18:02.778271",
                 "permissions": {
                   "owner": "cloud-admin",
                   "owner_access": 7,
                   "other_access": 7,
                   "group": "cloud-admin-group",
                   "group_access": 7
                 }
               },
               "display_name": "s3",
               "uuid": "a951f7d2-63a2-46a0-88c4-157ba8588e3d"
             }
           }
         ]
       }
     ];
     return {
         dnsServerDomainsMockData : dnsServerDomainsMockData,
         dnsServersMockData :dnsServersMockData
     };
 });