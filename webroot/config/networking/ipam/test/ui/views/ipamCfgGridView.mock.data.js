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
                   "uuid": "fbe108bf-23d0-4583-905e-173ac9c36bc3",
                   "href": "http://nodeg4:8082/network-ipam/fbe108bf-23d0-4583-905e-173ac9c36bc3",
                   "ipam_subnet_method": "user-defined-subnet",
                   "parent_type": "project",
                   "name": "ipam2",
                   "network_ipam_mgmt": {
                     "ipam_dns_method": "default-dns-server"
                   },
                   "perms2": {
                     "owner": "3ef47950bfff440897a980de1d670c06",
                     "owner_access": 7,
                     "global_access": 0,
                     "share": []
                   },
                   "id_perms": {
                     "enable": true,
                     "uuid": {
                       "uuid_mslong": 18149797590312438000,
                       "uuid_lslong": 10402777730532993000
                     },
                     "created": "2017-12-18T06:35:47.936975",
                     "description": null,
                     "creator": null,
                     "user_visible": true,
                     "last_modified": "2017-12-18T06:35:47.936975",
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
                     "ipam2"
                   ],
                   "parent_uuid": "3ef47950-bfff-4408-97a9-80de1d670c06"
                 }
               }
             ]
        };
       this.virtualDNsData = {
               "virtual_DNSs": []
       };
       this.tagsMockData = [
           {
               "tags": [
                 {
                   "tag": {
                     "tag_type_refs": [
                       {
                         "to": [
                           "tier"
                         ],
                         "attr": null,
                         "uuid": "11c1c7e8-5ed2-4007-a918-7916e50faf76"
                       }
                     ],
                     "tag_type_name": "tier",
                     "fq_name": [
                       "tier=list"
                     ],
                     "uuid": "95db3588-c9e6-474b-b41c-4461be3c7d3f",
                     "href": "http://nodeg4:8082/tag/95db3588-c9e6-474b-b41c-4461be3c7d3f",
                     "tag_id": "0x00020000",
                     "tag_value": "list",
                     "perms2": {
                       "owner": "3ef47950bfff440897a980de1d670c06",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 10798283393170033000,
                         "uuid_lslong": 12978323412769080000
                       },
                       "created": "2017-11-20T08:53:55.636342",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-11-20T08:53:55.636342",
                       "permissions": {
                         "owner": "cloud-admin",
                         "owner_access": 7,
                         "other_access": 7,
                         "group": "cloud-admin-group",
                         "group_access": 7
                       }
                     },
                     "display_name": "tier=list",
                     "name": "tier=list"
                   }
                 },
                 {
                   "tag": {
                     "tag_type_refs": [
                       {
                         "to": [
                           "tier"
                         ],
                         "attr": null,
                         "uuid": "11c1c7e8-5ed2-4007-a918-7916e50faf76"
                       }
                     ],
                     "tag_type_name": "tier",
                     "display_name": "tier=one",
                     "uuid": "e5c3e49a-6d73-4986-ade3-59ec71e9c573",
                     "name": "tier=one",
                     "href": "http://nodeg4:8082/tag/e5c3e49a-6d73-4986-ade3-59ec71e9c573",
                     "parent_type": "project",
                     "tag_id": "0x00020001",
                     "tag_value": "one",
                     "perms2": {
                       "owner": "3ef47950bfff440897a980de1d670c06",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 16556328007056443000,
                         "uuid_lslong": 12529957460333152000
                       },
                       "created": "2017-11-20T08:54:23.738592",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-11-20T08:54:23.738592",
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
                       "tier=one"
                     ],
                     "parent_uuid": "3ef47950-bfff-4408-97a9-80de1d670c06"
                   }
                 },
                 {
                   "tag": {
                     "tag_type_refs": [
                       {
                         "to": [
                           "application"
                         ],
                         "attr": null,
                         "uuid": "88a86b25-8b57-424a-bc53-c422977eb438"
                       }
                     ],
                     "tag_type_name": "application",
                     "display_name": "application=source",
                     "uuid": "a79ec673-00b6-4206-b011-41f89ad14c3a",
                     "name": "application=source",
                     "href": "http://nodeg4:8082/tag/a79ec673-00b6-4206-b011-41f89ad14c3a",
                     "parent_type": "project",
                     "tag_id": "0x00010001",
                     "tag_value": "source",
                     "perms2": {
                       "owner": "3ef47950bfff440897a980de1d670c06",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 12078309447889732000,
                         "uuid_lslong": 12686994161284502000
                       },
                       "created": "2017-11-20T08:54:12.977996",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-11-20T08:54:12.977996",
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
                       "application=source"
                     ],
                     "parent_uuid": "3ef47950-bfff-4408-97a9-80de1d670c06"
                   }
                 },
                 {
                   "tag": {
                     "tag_type_refs": [
                       {
                         "to": [
                           "deployment"
                         ],
                         "attr": null,
                         "uuid": "e737612d-1a2d-42a4-bdd8-b6f4aba67d32"
                       }
                     ],
                     "tag_type_name": "deployment",
                     "display_name": "deployment=deployment11",
                     "uuid": "49d58c93-a82c-4441-b2b5-ca3d51ac57da",
                     "name": "deployment=deployment11",
                     "href": "http://nodeg4:8082/tag/49d58c93-a82c-4441-b2b5-ca3d51ac57da",
                     "parent_type": "project",
                     "tag_id": "0x00030001",
                     "tag_value": "deployment11",
                     "perms2": {
                       "owner": "e4473f5b2a65465fad668edabba3f6ee",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 5320313100617663000,
                         "uuid_lslong": 12877421074247866000
                       },
                       "created": "2017-11-20T11:25:35.562284",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-11-20T11:25:35.562284",
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
                       "siva",
                       "deployment=deployment11"
                     ],
                     "parent_uuid": "e4473f5b-2a65-465f-ad66-8edabba3f6ee"
                   }
                 },
                 {
                   "tag": {
                     "tag_type_refs": [
                       {
                         "to": [
                           "application"
                         ],
                         "attr": null,
                         "uuid": "88a86b25-8b57-424a-bc53-c422977eb438"
                       }
                     ],
                     "tag_type_name": "application",
                     "display_name": "application=app1",
                     "uuid": "6f34c1f4-794a-4b5b-b639-e8c18310561f",
                     "name": "application=app1",
                     "href": "http://nodeg4:8082/tag/6f34c1f4-794a-4b5b-b639-e8c18310561f",
                     "parent_type": "project",
                     "tag_id": "0x00010002",
                     "tag_value": "app1",
                     "perms2": {
                       "owner": "e4473f5b2a65465fad668edabba3f6ee",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 8013242892750048000,
                         "uuid_lslong": 13130782106400610000
                       },
                       "created": "2017-11-20T11:25:01.169694",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-11-20T11:25:01.169694",
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
                       "siva",
                       "application=app1"
                     ],
                     "parent_uuid": "e4473f5b-2a65-465f-ad66-8edabba3f6ee"
                   }
                 },
                 {
                   "tag": {
                     "tag_type_refs": [
                       {
                         "to": [
                           "application"
                         ],
                         "attr": null,
                         "uuid": "88a86b25-8b57-424a-bc53-c422977eb438"
                       }
                     ],
                     "tag_type_name": "application",
                     "display_name": "application=app2",
                     "uuid": "808c64df-68aa-4818-809f-9904f84f6bc8",
                     "name": "application=app2",
                     "href": "http://nodeg4:8082/tag/808c64df-68aa-4818-809f-9904f84f6bc8",
                     "parent_type": "project",
                     "tag_id": "0x00010003",
                     "tag_value": "app2",
                     "perms2": {
                       "owner": "e4473f5b2a65465fad668edabba3f6ee",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 9262889444290742000,
                         "uuid_lslong": 9268294804776643000
                       },
                       "created": "2017-11-20T11:25:08.953950",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-11-20T11:25:08.953950",
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
                       "siva",
                       "application=app2"
                     ],
                     "parent_uuid": "e4473f5b-2a65-465f-ad66-8edabba3f6ee"
                   }
                 },
                 {
                   "tag": {
                     "tag_type_refs": [
                       {
                         "to": [
                           "application"
                         ],
                         "attr": null,
                         "uuid": "88a86b25-8b57-424a-bc53-c422977eb438"
                       }
                     ],
                     "tag_type_name": "application",
                     "fq_name": [
                       "application=data"
                     ],
                     "uuid": "cae0fb44-2426-4f0d-a9cf-4af06b4d9478",
                     "href": "http://nodeg4:8082/tag/cae0fb44-2426-4f0d-a9cf-4af06b4d9478",
                     "tag_id": "0x00010000",
                     "tag_value": "data",
                     "perms2": {
                       "owner": "3ef47950bfff440897a980de1d670c06",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 14618960660527469000,
                         "uuid_lslong": 12236081109041780000
                       },
                       "created": "2017-11-20T08:53:45.586502",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-11-20T08:53:45.586502",
                       "permissions": {
                         "owner": "cloud-admin",
                         "owner_access": 7,
                         "other_access": 7,
                         "group": "cloud-admin-group",
                         "group_access": 7
                       }
                     },
                     "display_name": "application=data",
                     "name": "application=data"
                   }
                 }
               ]
             }
           ];
       this.ipamModalMockCNInput = {
               "name": "ipam2",
               "display_name":"ipam2",
               'ipam_dns_method': 'default-dns-server',
        };
       this.ipamModalMockCNIOutput = {
               "network-ipam": {
                   "name": "ipam2",
                   "fq_name": [
                     "default-domain",
                     "admin",
                     "ipam2"
                   ],
                   "display_name":"ipam2",
                   "parent_type":"project",
                   "network_ipam_mgmt":{"ipam_dns_method":"default-dns-server"},
                   "virtual_DNS_refs":[],
                   "ipam_subnet_method":"flat-subnet",
                   "ipam_subnets":{"subnets":[]},
                    "perms2":{"owner_access":7,"global_access":0,"share":[]},
                    "tag_refs":[]
                 }
       };
       return {
           domainData: TestCommonMockdata.domainData,
           projectData: TestCommonMockdata.projectData,
           ipamsData: ipamsData,
           virtualDNsData: virtualDNsData,
           tagsMockData:tagsMockData,
           ipamModalMockCNInput:ipamModalMockCNInput,
           ipamModalMockCNIOutput:ipamModalMockCNIOutput
       };
 });
