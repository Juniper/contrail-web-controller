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
             "to": [
               "default-domain",
               "s1"
             ],
             "href": "http://10.204.216.40:9100/virtual-DNS/e59247c6-280f-47b7-a3f3-994f3108cf93",
             "uuid": "e59247c6-280f-47b7-a3f3-994f3108cf93"
           }
         ],
         dnsRecordsMockData : {
             "data": {
               "virtual-DNS": {
                 "fq_name": [
                   "default-domain",
                   "s1"
                 ],
                 "uuid": "e59247c6-280f-47b7-a3f3-994f3108cf93",
                 "network_ipam_back_refs": [
                   {
                     "to": [
                       "default-domain",
                       "default-project",
                       "default-network-ipam"
                     ],
                     "href": "http://10.204.216.40:9100/network-ipam/f89712df-bef7-449a-97c8-504811115b17",
                     "attr": null,
                     "uuid": "f89712df-bef7-449a-97c8-504811115b17"
                   }
                 ],
                 "parent_uuid": "07fbaa4b-c7b8-4f3d-996e-9d8b1830b288",
                 "parent_href": "http://10.204.216.40:9100/domain/07fbaa4b-c7b8-4f3d-996e-9d8b1830b288",
                 "parent_type": "domain",
                 "perms2": {
                   "owner": "e9a7b1af07c147889169045c5f2caafb",
                   "owner_access": 7,
                   "global_access": 0,
                   "share": []
                 },
                 "virtual_DNS_records": [
                   {
                     "to": [
                       "default-domain",
                       "s1",
                       "9104933f-c179-44c7-8656-3d0529adb45f"
                     ],
                     "href": "http://10.204.216.40:9100/virtual-DNS-record/9104933f-c179-44c7-8656-3d0529adb45f",
                     "uuid": "9104933f-c179-44c7-8656-3d0529adb45f",
                     "virtual_DNS_record_data": {
                       "record_type": "A",
                       "record_ttl_seconds": 86400,
                       "record_name": "h1",
                       "record_class": "IN",
                       "record_data": "1.1.1.1"
                     }
                   }
                 ],
                 "href": "http://10.204.216.40:9100/virtual-DNS/e59247c6-280f-47b7-a3f3-994f3108cf93",
                 "virtual_DNS_data": {
                   "floating_ip_record": "dashed-ip-tenant-name",
                   "domain_name": "s1.com",
                   "external_visible": true,
                   "dynamic_records_from_client": true,
                   "reverse_resolution": true,
                   "default_ttl_seconds": 86400,
                   "record_order": "random"
                 },
                 "id_perms": {
                   "enable": true,
                   "uuid": {
                     "uuid_mslong": 16542363297686440000,
                     "uuid_lslong": 11813954812927070000
                   },
                   "created": "2015-11-24T08:45:13.176071",
                   "description": null,
                   "creator": null,
                   "user_visible": true,
                   "last_modified": "2015-11-24T08:45:13.176071",
                   "permissions": {
                     "owner": "admin",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "KeystoneServiceAdmin",
                     "group_access": 7
                   }
                 },
                 "display_name": "s1",
                 "name": "s1"
               }
             },
             "lastKey": null,
             "more": false
         }
     });
 });