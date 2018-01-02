/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore','common/test/ui/unit/ct.common.mock.data'], function(_,TestCommonMockdata){
     this.projectTagMockData = [
             {
               "tags": [
                 {
                   "tag": {
                     "tag_type_refs": [
                       {
                         "to": [
                           "site"
                         ],
                         "attr": null,
                         "uuid": "75a41e1b-06d4-4dfa-b698-a52c03a7a04a"
                       }
                     ],
                     "tag_type_name": "site",
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "site=188"
                     ],
                     "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99",
                     "name": "site=188",
                     "href": "http://nodeg4:8082/tag/da45379f-473f-4de1-ad69-25c81c3b1e35",
                     "parent_type": "project",
                     "tag_id": "0x00040002",
                     "tag_value": "188",
                     "perms2": {
                       "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 15728038430895985000,
                         "uuid_lslong": 12495560182513476000
                       },
                       "created": "2018-01-02T15:50:24.915474",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2018-01-02T15:50:24.915474",
                       "permissions": {
                         "owner": "admin",
                         "owner_access": 7,
                         "other_access": 7,
                         "group": "admin",
                         "group_access": 7
                       }
                     },
                     "display_name": "site=188",
                     "uuid": "da45379f-473f-4de1-ad69-25c81c3b1e35"
                   }
                 },
                 {
                   "tag": {
                     "tag_type_refs": [
                       {
                         "to": [
                           "label"
                         ],
                         "attr": null,
                         "uuid": "34c15561-ce9f-4d87-80a8-187e25fac3d5"
                       }
                     ],
                     "tag_type_name": "label",
                     "display_name": "label=label2",
                     "uuid": "bc881dab-bfa3-4daa-98da-d8b5a651e742",
                     "name": "label=label2",
                     "href": "http://nodeg4:8082/tag/bc881dab-bfa3-4daa-98da-d8b5a651e742",
                     "parent_type": "project",
                     "tag_id": "0x00000001",
                     "tag_value": "label2",
                     "virtual_network_back_refs": [
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "vn2"
                         ],
                         "attr": null,
                         "uuid": "a18857db-ed4a-4131-b564-2f2ec7269515"
                       }
                     ],
                     "perms2": {
                       "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "project_back_refs": [
                       {
                         "to": [
                           "default-domain",
                           "admin"
                         ],
                         "attr": null,
                         "uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99"
                       }
                     ],
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "label=label2"
                     ],
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 13585140899454865000,
                         "uuid_lslong": 11014354113379035000
                       },
                       "created": "2017-12-29T09:15:01.686860",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-12-29T09:15:01.686860",
                       "permissions": {
                         "owner": "admin",
                         "owner_access": 7,
                         "other_access": 7,
                         "group": "admin",
                         "group_access": 7
                       }
                     },
                     "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99"
                   }
                 },
                 {
                   "tag": {
                     "tag_type_refs": [
                       {
                         "to": [
                           "custom"
                         ],
                         "attr": null,
                         "uuid": "9f4a2458-390b-4fc7-8eef-4640bf26c56d"
                       }
                     ],
                     "tag_type_name": "custom",
                     "display_name": "custom=val1",
                     "uuid": "77178359-10e6-4f0a-ad04-35e3145ec24c",
                     "name": "custom=val1",
                     "href": "http://nodeg4:8082/tag/77178359-10e6-4f0a-ad04-35e3145ec24c",
                     "parent_type": "project",
                     "tag_id": "0x010a0006",
                     "tag_value": "val1",
                     "perms2": {
                       "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 8581472033536627000,
                         "uuid_lslong": 12467148917883978000
                       },
                       "created": "2018-01-06T02:06:20.381827",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2018-01-06T02:06:20.381827",
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
                       "custom=val1"
                     ],
                     "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99"
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
                         "uuid": "0d7aa5b7-bc4e-4ba0-acf2-69aacd25ca2c"
                       }
                     ],
                     "tag_type_name": "application",
                     "display_name": "application=1444",
                     "uuid": "c26367b5-6e4f-472f-9cc1-d7735c7e3b63",
                     "name": "application=1444",
                     "href": "http://nodeg4:8082/tag/c26367b5-6e4f-472f-9cc1-d7735c7e3b63",
                     "parent_type": "project",
                     "tag_id": "0x00010036",
                     "tag_value": "1444",
                     "perms2": {
                       "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 14007153294989806000,
                         "uuid_lslong": 11295546230894901000
                       },
                       "created": "2018-01-05T11:34:34.926489",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2018-01-05T11:34:34.926489",
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
                       "application=1444"
                     ],
                     "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99"
                   }
                 },
                 {
                   "tag": {
                     "tag_type_refs": [
                       {
                         "to": [
                           "custom1"
                         ],
                         "attr": null,
                         "uuid": "3f3a3f4c-3ec5-485f-99f2-ebccc579d635"
                       }
                     ],
                     "tag_type_name": "custom1",
                     "display_name": "custom1=custom1value",
                     "uuid": "e2597c77-7426-4b01-a56d-d63526598ea4",
                     "name": "custom1=custom1value",
                     "href": "http://nodeg4:8082/tag/e2597c77-7426-4b01-a56d-d63526598ea4",
                     "parent_type": "project",
                     "tag_id": "0x01080001",
                     "tag_value": "custom1value",
                     "perms2": {
                       "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 16310204377990580000,
                         "uuid_lslong": 11920419312484585000
                       },
                       "created": "2018-01-05T11:26:25.918881",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2018-01-05T11:26:25.918881",
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
                       "custom1=custom1value"
                     ],
                     "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99"
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
                         "uuid": "50b2037d-f4fa-469b-95a3-c80eeaa0fcc8"
                       }
                     ],
                     "tag_type_name": "tier",
                     "display_name": "tier=111",
                     "uuid": "0945442f-b558-4ded-8018-d547f3d29994",
                     "name": "tier=111",
                     "href": "http://nodeg4:8082/tag/0945442f-b558-4ded-8018-d547f3d29994",
                     "parent_type": "project",
                     "tag_id": "0x00020005",
                     "tag_value": "111",
                     "perms2": {
                       "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 668015091431001600,
                         "uuid_lslong": 9230361941305890000
                       },
                       "created": "2018-01-02T15:39:50.710348",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2018-01-02T15:39:50.710348",
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
                       "tier=111"
                     ],
                     "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99"
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
                         "uuid": "0d7aa5b7-bc4e-4ba0-acf2-69aacd25ca2c"
                       }
                     ],
                     "tag_type_name": "application",
                     "display_name": "application=app27",
                     "uuid": "8d5837d8-3e0f-4bfa-85a7-e57be28c0870",
                     "name": "application=app27",
                     "href": "http://nodeg4:8082/tag/8d5837d8-3e0f-4bfa-85a7-e57be28c0870",
                     "parent_type": "project",
                     "tag_id": "0x00010034",
                     "tag_value": "app27",
                     "perms2": {
                       "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 10184951959192030000,
                         "uuid_lslong": 9630918648399661000
                       },
                       "created": "2018-01-05T11:21:58.336671",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2018-01-05T11:21:58.336671",
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
                       "application=app27"
                     ],
                     "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99"
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
                         "uuid": "0d7aa5b7-bc4e-4ba0-acf2-69aacd25ca2c"
                       }
                     ],
                     "tag_type_name": "application",
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "application=app26"
                     ],
                     "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99",
                     "name": "application=app26",
                     "href": "http://nodeg4:8082/tag/78f981cb-6bec-48b9-bf35-236d19bcc2f9",
                     "parent_type": "project",
                     "tag_id": "0x00010033",
                     "tag_value": "app26",
                     "perms2": {
                       "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 8717141264441297000,
                         "uuid_lslong": 13777957586500108000
                       },
                       "created": "2018-01-05T11:20:47.564648",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2018-01-05T11:20:47.564648",
                       "permissions": {
                         "owner": "admin",
                         "owner_access": 7,
                         "other_access": 7,
                         "group": "admin",
                         "group_access": 7
                       }
                     },
                     "display_name": "application=app26",
                     "uuid": "78f981cb-6bec-48b9-bf35-236d19bcc2f9"
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
                         "uuid": "0d7aa5b7-bc4e-4ba0-acf2-69aacd25ca2c"
                       }
                     ],
                     "tag_type_name": "application",
                     "display_name": "application=proTag1",
                     "uuid": "6473336f-9c90-4d73-a9c6-af146fbfd1f2",
                     "name": "application=proTag1",
                     "href": "http://nodeg4:8082/tag/6473336f-9c90-4d73-a9c6-af146fbfd1f2",
                     "parent_type": "project",
                     "tag_id": "0x00010040",
                     "tag_value": "proTag1",
                     "perms2": {
                       "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 7238185580575608000,
                         "uuid_lslong": 12233657940107580000
                       },
                       "created": "2018-01-05T13:00:13.383493",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2018-01-05T13:00:13.383493",
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
                       "application=proTag1"
                     ],
                     "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99"
                   }
                 },
                 {
                   "tag": {
                     "tag_type_refs": [
                       {
                         "to": [
                           "label"
                         ],
                         "attr": null,
                         "uuid": "34c15561-ce9f-4d87-80a8-187e25fac3d5"
                       }
                     ],
                     "tag_type_name": "label",
                     "display_name": "label=label1",
                     "uuid": "dcb6322e-f8f4-49fd-bc25-b1a38ee2cdb5",
                     "name": "label=label1",
                     "href": "http://nodeg4:8082/tag/dcb6322e-f8f4-49fd-bc25-b1a38ee2cdb5",
                     "parent_type": "project",
                     "tag_id": "0x00000000",
                     "tag_value": "label1",
                     "virtual_network_back_refs": [
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "vn2"
                         ],
                         "attr": null,
                         "uuid": "a18857db-ed4a-4131-b564-2f2ec7269515"
                       }
                     ],
                     "perms2": {
                       "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 15903954311432129000,
                         "uuid_lslong": 13557437569303760000
                       },
                       "created": "2017-12-29T09:14:47.496450",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-12-29T09:14:47.496450",
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
                       "label=label1"
                     ],
                     "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99"
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
                         "uuid": "0d7aa5b7-bc4e-4ba0-acf2-69aacd25ca2c"
                       }
                     ],
                     "tag_type_name": "application",
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "application=test501"
                     ],
                     "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99",
                     "name": "application=test501",
                     "href": "http://nodeg4:8082/tag/43fe427b-ea8e-4a59-a71f-3d892a0a97da",
                     "parent_type": "project",
                     "tag_id": "0x0001002f",
                     "tag_value": "test501",
                     "perms2": {
                       "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 4899426544609283000,
                         "uuid_lslong": 12042411587937147000
                       },
                       "created": "2018-01-05T10:54:39.784373",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2018-01-05T10:54:39.784373",
                       "permissions": {
                         "owner": "admin",
                         "owner_access": 7,
                         "other_access": 7,
                         "group": "admin",
                         "group_access": 7
                       }
                     },
                     "display_name": "application=test501",
                     "uuid": "43fe427b-ea8e-4a59-a71f-3d892a0a97da"
                   }
                 },
                 {
                   "tag": {
                     "tag_type_refs": [
                       {
                         "to": [
                           "customtab"
                         ],
                         "attr": null,
                         "uuid": "46e50d4c-de04-4221-996e-2869381e5b7b"
                       }
                     ],
                     "tag_type_name": "customtab",
                     "display_name": "customtab=valtag",
                     "uuid": "22186f5a-b7fe-44e9-b4bd-c88da03a1640",
                     "name": "customtab=valtag",
                     "href": "http://nodeg4:8082/tag/22186f5a-b7fe-44e9-b4bd-c88da03a1640",
                     "parent_type": "project",
                     "tag_id": "0x01070000",
                     "tag_value": "valtag",
                     "perms2": {
                       "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 2456836032155239400,
                         "uuid_lslong": 13023786208029448000
                       },
                       "created": "2018-01-05T00:10:35.116826",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2018-01-05T00:10:35.116826",
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
                       "customtab=valtag"
                     ],
                     "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99"
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
                         "uuid": "0d7aa5b7-bc4e-4ba0-acf2-69aacd25ca2c"
                       }
                     ],
                     "tag_type_name": "application",
                     "display_name": "application=dsfsf",
                     "uuid": "4e7fb188-8015-497a-8f22-bbb121c835bd",
                     "name": "application=dsfsf",
                     "href": "http://nodeg4:8082/tag/4e7fb188-8015-497a-8f22-bbb121c835bd",
                     "parent_type": "project",
                     "tag_id": "0x0001000d",
                     "tag_value": "dsfsf",
                     "perms2": {
                       "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 5656434856823179000,
                         "uuid_lslong": 10314012466082232000
                       },
                       "created": "2018-01-03T12:11:30.963731",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2018-01-03T12:11:30.963731",
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
                       "application=dsfsf"
                     ],
                     "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99"
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
                         "uuid": "0d7aa5b7-bc4e-4ba0-acf2-69aacd25ca2c"
                       }
                     ],
                     "tag_type_name": "application",
                     "display_name": "application=app25",
                     "uuid": "9185d2ec-80b8-43e8-8dac-e17f99960b09",
                     "name": "application=app25",
                     "href": "http://nodeg4:8082/tag/9185d2ec-80b8-43e8-8dac-e17f99960b09",
                     "parent_type": "project",
                     "tag_id": "0x00010032",
                     "tag_value": "app25",
                     "perms2": {
                       "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 10486019220615741000,
                         "uuid_lslong": 10208782393495914000
                       },
                       "created": "2018-01-05T11:20:32.522844",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2018-01-05T11:20:32.522844",
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
                       "application=app25"
                     ],
                     "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99"
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
                         "uuid": "0d7aa5b7-bc4e-4ba0-acf2-69aacd25ca2c"
                       }
                     ],
                     "tag_type_name": "application",
                     "display_name": "application=sales",
                     "uuid": "bc9a25c5-1a0a-4a89-abdc-bc96ed1f3a4d",
                     "name": "application=sales",
                     "href": "http://nodeg4:8082/tag/bc9a25c5-1a0a-4a89-abdc-bc96ed1f3a4d",
                     "parent_type": "project",
                     "tag_id": "0x00010043",
                     "tag_value": "sales",
                     "perms2": {
                       "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 13590216354019560000,
                         "uuid_lslong": 12383980431771384000
                       },
                       "created": "2018-01-06T02:15:59.884949",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2018-01-06T02:15:59.884949",
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
                       "application=sales"
                     ],
                     "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99"
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
                         "uuid": "0d7aa5b7-bc4e-4ba0-acf2-69aacd25ca2c"
                       }
                     ],
                     "tag_type_name": "application",
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "application=DB"
                     ],
                     "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99",
                     "name": "application=DB",
                     "href": "http://nodeg4:8082/tag/66e4f688-1936-4681-97e3-e8967f1dcc35",
                     "parent_type": "project",
                     "tag_id": "0x00010004",
                     "tag_value": "DB",
                     "perms2": {
                       "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 7414321950957652000,
                         "uuid_lslong": 10944847252515836000
                       },
                       "created": "2017-12-28T11:16:34.375736",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-12-28T11:16:34.375736",
                       "permissions": {
                         "owner": "admin",
                         "owner_access": 7,
                         "other_access": 7,
                         "group": "admin",
                         "group_access": 7
                       }
                     },
                     "display_name": "application=DB",
                     "uuid": "66e4f688-1936-4681-97e3-e8967f1dcc35"
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
                         "uuid": "0d7aa5b7-bc4e-4ba0-acf2-69aacd25ca2c"
                       }
                     ],
                     "tag_type_name": "application",
                     "display_name": "application=LT",
                     "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99",
                     "name": "application=LT",
                     "href": "http://nodeg4:8082/tag/b64db2fa-cc31-4aab-bce2-de0590fd30b0",
                     "parent_type": "project",
                     "tag_id": "0x00010005",
                     "tag_value": "LT",
                     "perms2": {
                       "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 13136352478346955000,
                         "uuid_lslong": 13610685139355775000
                       },
                       "created": "2017-12-28T11:16:42.327446",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-12-28T11:16:42.327446",
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
                       "application=LT"
                     ],
                     "uuid": "b64db2fa-cc31-4aab-bce2-de0590fd30b0"
                   }
                 },
                 {
                   "tag": {
                     "tag_type_refs": [
                       {
                         "to": [
                           "custom2"
                         ],
                         "attr": null,
                         "uuid": "9f736f83-cbd0-4a66-88ee-28d55edda6a5"
                       }
                     ],
                     "tag_type_name": "custom2",
                     "display_name": "custom2=custom2value",
                     "uuid": "6bcf0cf9-4f07-4011-830a-8ab0e0181a9f",
                     "name": "custom2=custom2value",
                     "href": "http://nodeg4:8082/tag/6bcf0cf9-4f07-4011-830a-8ab0e0181a9f",
                     "parent_type": "project",
                     "tag_id": "0x01090000",
                     "tag_value": "custom2value",
                     "perms2": {
                       "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 7768442147149660000,
                         "uuid_lslong": 9442512061014219000
                       },
                       "created": "2018-01-05T11:27:18.579252",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2018-01-05T11:27:18.579252",
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
                       "custom2=custom2value"
                     ],
                     "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99"
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
                         "uuid": "0d7aa5b7-bc4e-4ba0-acf2-69aacd25ca2c"
                       }
                     ],
                     "tag_type_name": "application",
                     "display_name": "application=test502",
                     "uuid": "15a05bf0-4e38-425f-a110-b0ee0c70756e",
                     "name": "application=test502",
                     "href": "http://nodeg4:8082/tag/15a05bf0-4e38-425f-a110-b0ee0c70756e",
                     "parent_type": "project",
                     "tag_id": "0x00010030",
                     "tag_value": "test502",
                     "perms2": {
                       "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 1558346558732780000,
                         "uuid_lslong": 11605970776191170000
                       },
                       "created": "2018-01-05T10:57:23.919362",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2018-01-05T10:57:23.919362",
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
                       "application=test502"
                     ],
                     "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99"
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
                         "uuid": "0d7aa5b7-bc4e-4ba0-acf2-69aacd25ca2c"
                       }
                     ],
                     "tag_type_name": "application",
                     "display_name": "application=app23",
                     "uuid": "dbd7ad0a-1809-4a1a-95c1-3c83dd743301",
                     "name": "application=app23",
                     "href": "http://nodeg4:8082/tag/dbd7ad0a-1809-4a1a-95c1-3c83dd743301",
                     "parent_type": "project",
                     "tag_id": "0x00010031",
                     "tag_value": "app23",
                     "perms2": {
                       "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 15841320473163549000,
                         "uuid_lslong": 10790972719210180000
                       },
                       "created": "2018-01-05T11:01:09.226596",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2018-01-05T11:01:09.226596",
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
                       "application=app23"
                     ],
                     "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99"
                   }
                 },
                 {
                   "tag": {
                     "tag_type_refs": [
                       {
                         "to": [
                           "custom1"
                         ],
                         "attr": null,
                         "uuid": "3f3a3f4c-3ec5-485f-99f2-ebccc579d635"
                       }
                     ],
                     "tag_type_name": "custom1",
                     "display_name": "custom1=app23",
                     "uuid": "4c7262cc-f407-4f68-b4a5-eddec486cc3a",
                     "name": "custom1=app23",
                     "href": "http://nodeg4:8082/tag/4c7262cc-f407-4f68-b4a5-eddec486cc3a",
                     "parent_type": "project",
                     "tag_id": "0x01080000",
                     "tag_value": "app23",
                     "perms2": {
                       "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 5508573926634508000,
                         "uuid_lslong": 13017071839019979000
                       },
                       "created": "2018-01-05T11:02:16.412696",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2018-01-05T11:02:16.412696",
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
                       "custom1=app23"
                     ],
                     "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99"
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
                         "uuid": "0d7aa5b7-bc4e-4ba0-acf2-69aacd25ca2c"
                       }
                     ],
                     "tag_type_name": "application",
                     "display_name": "application=app28",
                     "uuid": "8b6eaf3f-0ce8-4a5f-aa5a-53565bc7c447",
                     "name": "application=app28",
                     "href": "http://nodeg4:8082/tag/8b6eaf3f-0ce8-4a5f-aa5a-53565bc7c447",
                     "parent_type": "project",
                     "tag_id": "0x00010035",
                     "tag_value": "app28",
                     "perms2": {
                       "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 10047160504044505000,
                         "uuid_lslong": 12275215364723820000
                       },
                       "created": "2018-01-05T11:25:17.181030",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2018-01-05T11:25:17.181030",
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
                       "application=app28"
                     ],
                     "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99"
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
                         "uuid": "0d7aa5b7-bc4e-4ba0-acf2-69aacd25ca2c"
                       }
                     ],
                     "tag_type_name": "application",
                     "display_name": "application=test500",
                     "uuid": "cbc0cb52-5dbe-4dda-9810-233721be1b9b",
                     "name": "application=test500",
                     "href": "http://nodeg4:8082/tag/cbc0cb52-5dbe-4dda-9810-233721be1b9b",
                     "parent_type": "project",
                     "tag_id": "0x0001002e",
                     "tag_value": "test500",
                     "perms2": {
                       "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 14681958339848327000,
                         "uuid_lslong": 10957296613088696000
                       },
                       "created": "2018-01-05T10:53:27.176367",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2018-01-05T10:53:27.176367",
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
                       "application=test500"
                     ],
                     "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99"
                   }
                 },
                 {
                   "tag": {
                     "tag_type_refs": [
                       {
                         "to": [
                           "custom"
                         ],
                         "attr": null,
                         "uuid": "9f4a2458-390b-4fc7-8eef-4640bf26c56d"
                       }
                     ],
                     "tag_type_name": "custom",
                     "display_name": "custom=custom_value",
                     "uuid": "22eeade7-1799-499f-ad65-23e354b8df9e",
                     "name": "custom=custom_value",
                     "href": "http://nodeg4:8082/tag/22eeade7-1799-499f-ad65-23e354b8df9e",
                     "parent_type": "project",
                     "tag_id": "0x010a0007",
                     "tag_value": "custom_value",
                     "perms2": {
                       "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 2517140449791658500,
                         "uuid_lslong": 12494432200495260000
                       },
                       "created": "2018-01-06T02:19:00.378955",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2018-01-06T02:19:00.378955",
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
                       "custom=custom_value"
                     ],
                     "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99"
                   }
                 }
               ]
             }
           ]
       this.projectTagProjectRole = null;
       this.projectTagModalInput = {
               "tag_type": "Application",
               "tag_value": "sales"
       };
       this.projectTagModalOutput = {
                "tag": {
                    "tag_value": "sales",
                    "tag_type_name": "application",
                    "fq_name": ["default-domain", "admin", "application-sales"],
                    "parent_type": "project"
                }
       };
       this.customTagModalInput = {
               "tag_type": "Custom",
               "tag_value": "custom_value"
       };
       this.customTagModalOutput = {
               "tag": {
                    "tag_value": "custom_value",
                    "tag_type_name": "Custom",
                    "fq_name": ["default-domain", "admin", "Custom=custom_value"],
                    "parent_type": "project"
                }
       };
       return {
           projectTagDomainsData: TestCommonMockdata.domainData,
           projectTagPojectsData: TestCommonMockdata.projectData,
           projectTagMockData: projectTagMockData,
           projectTagProjectRole: projectTagProjectRole,
           projectTagModalInput: projectTagModalInput,
           projectTagModalOutput: projectTagModalOutput,
           customTagModalInput: customTagModalInput,
           customTagModalOutput: customTagModalOutput
       };
 });
