/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore','common/test/ui/unit/ct.common.mock.data'], function(_,TestCommonMockdata){
     this.ipamsData =
     {
             "network-ipams": [
               {
                 "network-ipam": {
                   "display_name": "ipam2",
                   "uuid": "b213587f-d677-4c0e-9bb2-5a7b785e50e4",
                   "href": "http://nodeg4:8082/network-ipam/b213587f-d677-4c0e-9bb2-5a7b785e50e4",
                   "ipam_subnet_method": "flat-subnet",
                   "parent_type": "project",
                   "name": "ipam2",
                   "network_ipam_mgmt": {
                     "ipam_dns_method": "default-dns-server"
                   },
                   "ipam_subnets": {
                     "subnets": [
                       {
                         "subnet": {
                           "ip_prefix": "2.2.2.0",
                           "ip_prefix_len": 28
                         },
                         "addr_from_start": true,
                         "enable_dhcp": true,
                         "default_gateway": "2.2.2.1",
                         "subnet_uuid": "59de3af2-068f-4ae6-b64b-2ce07305a214",
                         "allocation_pools": [
                           {
                             "vrouter_specific_pool": true,
                             "start": "2.2.2.0",
                             "end": "2.2.2.5"
                           }
                         ],
                         "subnet_name": "59de3af2-068f-4ae6-b64b-2ce07305a214",
                         "dns_server_address": "2.2.2.2"
                       }
                     ]
                   },
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
                     "created": "2017-11-23T11:56:22.701385",
                     "user_visible": true,
                     "last_modified": "2017-11-23T11:58:34.507097",
                     "permissions": {
                       "owner": "admin",
                       "owner_access": 7,
                       "other_access": 7,
                       "group": "admin",
                       "group_access": 7
                     },
                     "uuid": {
                       "uuid_mslong": 12831697069390910000,
                       "uuid_lslong": 11219129108080250000
                     }
                   },
                   "fq_name": [
                     "default-domain",
                     "admin",
                     "ipam2"
                   ],
                   "parent_uuid": "3ef47950-bfff-4408-97a9-80de1d670c06"
                 }
               }
             ]
           };
       return {
           domainData: TestCommonMockdata.domainData,
           projectData: TestCommonMockdata.projectData,
           ipamsData: ipamsData
       };
 });
