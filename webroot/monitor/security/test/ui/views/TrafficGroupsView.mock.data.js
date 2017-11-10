/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function (_) {
    this.epsClientMockData = {
      "data": [
        {
          "eps.__key": "default-policy-management:sap_fw_policy:aa83c659-11b3-47ed-9dd2-337d7a4f8ad4",
          "eps.client.app": "application=sap",
          "eps.client.deployment": "default-domain:sapdev:deployment=dev",
          "eps.client.local_vn": "default-domain:sapdev:webvn",
          "eps.client.remote_app_id": "0x00010006",
          "eps.client.remote_deployment_id": "0x00030003",
          "eps.client.remote_prefix": "",
          "eps.client.remote_site_id": "0x00000000",
          "eps.client.remote_tier_id": "0x0002000d",
          "eps.client.remote_vn": "default-domain:sapdev:appvn",
          "eps.client.site": "",
          "eps.client.tier": "tier=web",
          "name": "default-domain:sapdev:3851f57a-2376-434e-8cc7-37a45ab02bdc",
          "SUM(eps.client.added)": 0,
          "SUM(eps.client.deleted)": 0,
          "SUM(eps.client.in_bytes)": 352800,
          "SUM(eps.client.in_pkts)": 3600,
          "SUM(eps.client.out_bytes)": 0,
          "SUM(eps.client.out_pkts)": 0,
          "MAX(eps.client.active)": 1,
          "MIN(eps.client.active)": 1
        },
        {
          "eps.__key": "default-policy-management:sap_fw_policy:24cbc76a-235f-4f45-9275-d0b34cace705",
          "eps.client.app": "application=sap",
          "eps.client.deployment": "default-domain:sapdev:deployment=dev",
          "eps.client.local_vn": "default-domain:sapdev:appvn",
          "eps.client.remote_app_id": "0x00010006",
          "eps.client.remote_deployment_id": "0x00030003",
          "eps.client.remote_prefix": "",
          "eps.client.remote_site_id": "0x00000000",
          "eps.client.remote_tier_id": "0x0002000e",
          "eps.client.remote_vn": "default-domain:sapdev:dbvn",
          "eps.client.site": "",
          "eps.client.tier": "tier=app",
          "name": "default-domain:sapdev:e3d5fbab-8061-40b8-bc88-e35028c995cc",
          "SUM(eps.client.added)": 0,
          "SUM(eps.client.deleted)": 0,
          "SUM(eps.client.in_bytes)": 352800,
          "SUM(eps.client.in_pkts)": 3600,
          "SUM(eps.client.out_bytes)": 352800,
          "SUM(eps.client.out_pkts)": 3600,
          "MAX(eps.client.active)": 1,
          "MIN(eps.client.active)": 1
        },
        {
          "eps.__key": "default-policy-management:sap_fw_policy:aa83c659-11b3-47ed-9dd2-337d7a4f8ad4",
          "eps.client.app": "application=sap",
          "eps.client.deployment": "default-domain:sapdev:deployment=dev",
          "eps.client.local_vn": "default-domain:sapdev:webvn",
          "eps.client.remote_app_id": "0x00010006",
          "eps.client.remote_deployment_id": "0x00030002",
          "eps.client.remote_prefix": "",
          "eps.client.remote_site_id": "0x00000000",
          "eps.client.remote_tier_id": "0x0002000d",
          "eps.client.remote_vn": "default-domain:sapprod:appvn",
          "eps.client.site": "",
          "eps.client.tier": "tier=web",
          "name": "default-domain:sapdev:3851f57a-2376-434e-8cc7-37a45ab02bdc",
          "SUM(eps.client.added)": 0,
          "SUM(eps.client.deleted)": 0,
          "SUM(eps.client.in_bytes)": 352800,
          "SUM(eps.client.in_pkts)": 3600,
          "SUM(eps.client.out_bytes)": 0,
          "SUM(eps.client.out_pkts)": 0,
          "MAX(eps.client.active)": 1,
          "MIN(eps.client.active)": 1
        }
      ],
      "total": 3,
      "queryJSON": {
        "table": "StatTable.EndpointSecurityStats.eps.client",
        "start_time": "now-60m",
        "end_time": "now-0m",
        "select_fields": [
          "eps.client.remote_app_id",
          "eps.client.remote_tier_id",
          "eps.client.remote_site_id",
          "eps.client.remote_deployment_id",
          "eps.client.remote_prefix",
          "eps.client.remote_vn",
          "eps.__key",
          "eps.client.app",
          "eps.client.tier",
          "eps.client.site",
          "eps.client.deployment",
          "eps.client.local_vn",
          "name",
          "SUM(eps.client.in_bytes)",
          "SUM(eps.client.out_bytes)",
          "SUM(eps.client.in_pkts)",
          "SUM(eps.client.out_pkts)",
          "SUM(eps.client.added)",
          "SUM(eps.client.deleted)",
          "MIN(eps.client.active)",
          "MAX(eps.client.active)"
        ],
        "filter": [
          []
        ],
        "where": [
          [
            {
              "name": "name",
              "value": "default-domain:sapdev:",
              "op": 7
            }
          ]
        ],
        "limit": 150000
      },
      "chunk": 1,
      "chunkSize": 3,
      "serverSideChunking": true
    };
    this.epsServerMockData = {
      "data": [
        {
          "eps.__key": "default-policy-management:sap_fw_policy:24cbc76a-235f-4f45-9275-d0b34cace705",
          "eps.server.app": "application=sap",
          "eps.server.deployment": "default-domain:sapdev:deployment=dev",
          "eps.server.local_vn": "default-domain:sapdev:dbvn",
          "eps.server.remote_app_id": "0x00010006",
          "eps.server.remote_deployment_id": "0x00030003",
          "eps.server.remote_prefix": "",
          "eps.server.remote_site_id": "0x00000000",
          "eps.server.remote_tier_id": "0x0002000d",
          "eps.server.remote_vn": "default-domain:sapdev:appvn",
          "eps.server.site": "",
          "eps.server.tier": "tier=db",
          "name": "default-domain:sapdev:f046f462-39a7-4942-ba7f-2b21d01b58bf",
          "SUM(eps.server.added)": 0,
          "SUM(eps.server.deleted)": 0,
          "SUM(eps.server.in_bytes)": 352800,
          "SUM(eps.server.in_pkts)": 3600,
          "SUM(eps.server.out_bytes)": 352800,
          "SUM(eps.server.out_pkts)": 3600,
          "MAX(eps.server.active)": 1,
          "MIN(eps.server.active)": 1
        },
        {
          "eps.__key": "default-policy-management:sap_fw_policy:aa83c659-11b3-47ed-9dd2-337d7a4f8ad4",
          "eps.server.app": "application=sap",
          "eps.server.deployment": "default-domain:sapdev:deployment=dev",
          "eps.server.local_vn": "default-domain:sapdev:appvn",
          "eps.server.remote_app_id": "0x00010006",
          "eps.server.remote_deployment_id": "0x00030003",
          "eps.server.remote_prefix": "",
          "eps.server.remote_site_id": "0x00000000",
          "eps.server.remote_tier_id": "0x0002000c",
          "eps.server.remote_vn": "default-domain:sapdev:webvn",
          "eps.server.site": "",
          "eps.server.tier": "tier=app",
          "name": "default-domain:sapdev:e3d5fbab-8061-40b8-bc88-e35028c995cc",
          "SUM(eps.server.added)": 0,
          "SUM(eps.server.deleted)": 0,
          "SUM(eps.server.in_bytes)": 0,
          "SUM(eps.server.in_pkts)": 0,
          "SUM(eps.server.out_bytes)": 352800,
          "SUM(eps.server.out_pkts)": 3600,
          "MAX(eps.server.active)": 1,
          "MIN(eps.server.active)": 1
        },
        {
          "eps.__key": "default-policy-management:sap_fw_policy:aa83c659-11b3-47ed-9dd2-337d7a4f8ad4",
          "eps.server.app": "application=sap",
          "eps.server.deployment": "default-domain:sapdev:deployment=dev",
          "eps.server.local_vn": "default-domain:sapdev:appvn",
          "eps.server.remote_app_id": "0x00010006",
          "eps.server.remote_deployment_id": "0x00030002",
          "eps.server.remote_prefix": "",
          "eps.server.remote_site_id": "0x00000000",
          "eps.server.remote_tier_id": "0x0002000c",
          "eps.server.remote_vn": "default-domain:sapprod:webvn",
          "eps.server.site": "",
          "eps.server.tier": "tier=app",
          "name": "default-domain:sapdev:e3d5fbab-8061-40b8-bc88-e35028c995cc",
          "SUM(eps.server.added)": 0,
          "SUM(eps.server.deleted)": 0,
          "SUM(eps.server.in_bytes)": 0,
          "SUM(eps.server.in_pkts)": 0,
          "SUM(eps.server.out_bytes)": 352800,
          "SUM(eps.server.out_pkts)": 3600,
          "MAX(eps.server.active)": 1,
          "MIN(eps.server.active)": 1
        }
      ],
      "total": 3,
      "queryJSON": {
        "table": "StatTable.EndpointSecurityStats.eps.server",
        "start_time": "now-60m",
        "end_time": "now-0m",
        "select_fields": [
          "eps.server.remote_app_id",
          "eps.server.remote_tier_id",
          "eps.server.remote_site_id",
          "eps.server.remote_deployment_id",
          "eps.server.remote_prefix",
          "eps.server.remote_vn",
          "eps.__key",
          "eps.server.app",
          "eps.server.tier",
          "eps.server.site",
          "eps.server.deployment",
          "eps.server.local_vn",
          "name",
          "SUM(eps.server.in_bytes)",
          "SUM(eps.server.out_bytes)",
          "SUM(eps.server.in_pkts)",
          "SUM(eps.server.out_pkts)",
          "SUM(eps.server.added)",
          "SUM(eps.server.deleted)",
          "MIN(eps.server.active)",
          "MAX(eps.server.active)"
        ],
        "filter": [
          []
        ],
        "where": [
          [
            {
              "name": "name",
              "value": "default-domain:sapdev:",
              "op": 7
            }
          ]
        ],
        "limit": 150000
      },
      "chunk": 1,
      "chunkSize": 3,
      "serverSideChunking": true
    };
    this.tgConfigData = [{
          "tags": [
            {
              "tag": {
                "tag_type_refs": [
                  {
                    "to": [
                      "deployment"
                    ],
                    "attr": null,
                    "uuid": "508d2b6f-f4f6-4097-b19f-feca6fca6288"
                  }
                ],
                "tag_type_name": "deployment",
                "fq_name": [
                  "default-domain",
                  "admin",
                  "deployment=production"
                ],
                "uuid": "3dfac951-e383-47f8-88bb-defc59ad37e8",
                "name": "deployment=production",
                "href": "http://nodeg7:8082/tag/3dfac951-e383-47f8-88bb-defc59ad37e8",
                "parent_type": "project",
                "tag_id": "0x00030000",
                "tag_value": "production",
                "perms2": {
                  "owner": "944e0f33117641e185cee2de4f4073f8",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
                },
                "id_perms": {
                  "enable": true,
                  "uuid": {
                    "uuid_mslong": 4466103334037833700,
                    "uuid_lslong": 9852713785220741000
                  },
                  "created": "2017-11-06T11:46:54.789870",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-11-06T11:46:54.789870",
                  "permissions": {
                    "owner": "admin",
                    "owner_access": 7,
                    "other_access": 7,
                    "group": "admin",
                    "group_access": 7
                  }
                },
                "display_name": "deployment=production",
                "parent_uuid": "944e0f33-1176-41e1-85ce-e2de4f4073f8"
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
                    "uuid": "5ee5512a-a1c3-46e8-8815-ebc98c2c2784"
                  }
                ],
                "tag_type_name": "tier",
                "display_name": "tier=db",
                "uuid": "d242027f-13de-4203-aaeb-453dc5aaa319",
                "name": "tier=db",
                "href": "http://nodeg7:8082/tag/d242027f-13de-4203-aaeb-453dc5aaa319",
                "parent_type": "project",
                "tag_id": "0x00020001",
                "tag_value": "db",
                "perms2": {
                  "owner": "944e0f33117641e185cee2de4f4073f8",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
                },
                "id_perms": {
                  "enable": true,
                  "uuid": {
                    "uuid_mslong": 15150674841245204000,
                    "uuid_lslong": 12316013737586369000
                  },
                  "created": "2017-11-06T10:41:16.197235",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-11-06T10:41:16.197235",
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
                  "tier=db"
                ],
                "parent_uuid": "944e0f33-1176-41e1-85ce-e2de4f4073f8"
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
                    "uuid": "508d2b6f-f4f6-4097-b19f-feca6fca6288"
                  }
                ],
                "tag_type_name": "deployment",
                "display_name": "deployment=dev",
                "uuid": "51d92cb1-5c85-41e4-870c-3de269cbb9ff",
                "name": "deployment=dev",
                "href": "http://nodeg7:8082/tag/51d92cb1-5c85-41e4-870c-3de269cbb9ff",
                "parent_type": "project",
                "tag_id": "0x00030003",
                "tag_value": "dev",
                "perms2": {
                  "owner": "db4bb9f40b144f16bc8f3018e36a06df",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
                },
                "id_perms": {
                  "enable": true,
                  "uuid": {
                    "uuid_mslong": 5897794327291445000,
                    "uuid_lslong": 9731220937487661000
                  },
                  "created": "2017-11-07T07:36:03.561512",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-11-07T07:36:03.561512",
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
                  "sapdev",
                  "deployment=dev"
                ],
                "parent_uuid": "db4bb9f4-0b14-4f16-bc8f-3018e36a06df"
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
                    "uuid": "5ee5512a-a1c3-46e8-8815-ebc98c2c2784"
                  }
                ],
                "tag_type_name": "tier",
                "display_name": "tier=app",
                "uuid": "4e99c8e6-c941-4c3e-b4a2-cbe6784ae838",
                "name": "tier=app",
                "href": "http://nodeg7:8082/tag/4e99c8e6-c941-4c3e-b4a2-cbe6784ae838",
                "parent_type": "project",
                "tag_id": "0x00020002",
                "tag_value": "app",
                "perms2": {
                  "owner": "944e0f33117641e185cee2de4f4073f8",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
                },
                "id_perms": {
                  "enable": true,
                  "uuid": {
                    "uuid_mslong": 5663778899939642000,
                    "uuid_lslong": 13016190063775246000
                  },
                  "created": "2017-11-06T10:42:33.541196",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-11-06T10:42:33.541196",
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
                  "tier=app"
                ],
                "parent_uuid": "944e0f33-1176-41e1-85ce-e2de4f4073f8"
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
                    "uuid": "5ee5512a-a1c3-46e8-8815-ebc98c2c2784"
                  }
                ],
                "tag_type_name": "tier",
                "display_name": "tier=db",
                "uuid": "1fef0c20-f7be-4983-abda-d6d97d14b350",
                "href": "http://nodeg7:8082/tag/1fef0c20-f7be-4983-abda-d6d97d14b350",
                "tag_id": "0x0002000e",
                "tag_value": "db",
                "perms2": {
                  "owner": "db4bb9f40b144f16bc8f3018e36a06df",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
                },
                "id_perms": {
                  "enable": true,
                  "uuid": {
                    "uuid_mslong": 2301071270344542700,
                    "uuid_lslong": 12383446355003355000
                  },
                  "created": "2017-11-07T08:49:52.641555",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-11-07T08:49:52.641555",
                  "permissions": {
                    "owner": "cloud-admin",
                    "owner_access": 7,
                    "other_access": 7,
                    "group": "cloud-admin-group",
                    "group_access": 7
                  }
                },
                "fq_name": [
                  "tier=db"
                ],
                "name": "tier=db"
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
                    "uuid": "5ee5512a-a1c3-46e8-8815-ebc98c2c2784"
                  }
                ],
                "tag_type_name": "tier",
                "display_name": "tier=web",
                "uuid": "97b0e863-268a-47dd-9d76-710ff0e8e612",
                "href": "http://nodeg7:8082/tag/97b0e863-268a-47dd-9d76-710ff0e8e612",
                "tag_id": "0x0002000c",
                "tag_value": "web",
                "perms2": {
                  "owner": "db4bb9f40b144f16bc8f3018e36a06df",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
                },
                "id_perms": {
                  "enable": true,
                  "uuid": {
                    "uuid_mslong": 10930491808174197000,
                    "uuid_lslong": 11346380624486787000
                  },
                  "created": "2017-11-07T08:49:39.555414",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-11-07T08:49:39.555414",
                  "permissions": {
                    "owner": "cloud-admin",
                    "owner_access": 7,
                    "other_access": 7,
                    "group": "cloud-admin-group",
                    "group_access": 7
                  }
                },
                "fq_name": [
                  "tier=web"
                ],
                "name": "tier=web"
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
                    "uuid": "5ee5512a-a1c3-46e8-8815-ebc98c2c2784"
                  }
                ],
                "tag_type_name": "tier",
                "display_name": "tier=db",
                "uuid": "f1bafd8c-9ce5-40cf-b644-e3b35f8ddb2b",
                "name": "tier=db",
                "href": "http://nodeg7:8082/tag/f1bafd8c-9ce5-40cf-b644-e3b35f8ddb2b",
                "parent_type": "project",
                "tag_id": "0x00020004",
                "tag_value": "db",
                "perms2": {
                  "owner": "55e0bbe53d224a20a052cf8e7b2d36dc",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
                },
                "id_perms": {
                  "enable": true,
                  "uuid": {
                    "uuid_mslong": 17418513289178333000,
                    "uuid_lslong": 13133872772860991000
                  },
                  "created": "2017-11-06T12:03:02.580305",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-11-06T12:03:02.580305",
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
                  "HRdev",
                  "tier=db"
                ],
                "parent_uuid": "55e0bbe5-3d22-4a20-a052-cf8e7b2d36dc"
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
                    "uuid": "4a9e550c-c48a-4d0b-aedf-1202317ee8ad"
                  }
                ],
                "tag_type_name": "label",
                "display_name": "label=label2",
                "uuid": "968ccd40-0ffe-40f0-a35a-cc0b1220c764",
                "href": "http://nodeg7:8082/tag/968ccd40-0ffe-40f0-a35a-cc0b1220c764",
                "tag_id": "0x00000001",
                "tag_value": "label2",
                "perms2": {
                  "owner": "944e0f33117641e185cee2de4f4073f8",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
                },
                "id_perms": {
                  "enable": true,
                  "uuid": {
                    "uuid_mslong": 10848271277458604000,
                    "uuid_lslong": 11770944924007057000
                  },
                  "created": "2017-11-06T18:29:34.448056",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-11-06T18:29:34.448056",
                  "permissions": {
                    "owner": "cloud-admin",
                    "owner_access": 7,
                    "other_access": 7,
                    "group": "cloud-admin-group",
                    "group_access": 7
                  }
                },
                "fq_name": [
                  "label=label2"
                ],
                "name": "label=label2"
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
                    "uuid": "5ee5512a-a1c3-46e8-8815-ebc98c2c2784"
                  }
                ],
                "tag_type_name": "tier",
                "display_name": "tier=web",
                "uuid": "0ef00381-843c-4103-a26e-2a1ee2f8ad8f",
                "name": "tier=web",
                "href": "http://nodeg7:8082/tag/0ef00381-843c-4103-a26e-2a1ee2f8ad8f",
                "parent_type": "project",
                "tag_id": "0x00020000",
                "tag_value": "web",
                "perms2": {
                  "owner": "944e0f33117641e185cee2de4f4073f8",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
                },
                "id_perms": {
                  "enable": true,
                  "uuid": {
                    "uuid_mslong": 1076364165745754400,
                    "uuid_lslong": 11704338793727832000
                  },
                  "created": "2017-11-06T10:41:04.285341",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-11-06T10:41:04.285341",
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
                  "tier=web"
                ],
                "parent_uuid": "944e0f33-1176-41e1-85ce-e2de4f4073f8"
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
                    "uuid": "5ee5512a-a1c3-46e8-8815-ebc98c2c2784"
                  }
                ],
                "tag_type_name": "tier",
                "display_name": "tier=web",
                "uuid": "5b7743a0-b136-4067-bd5c-f6f23847bee1",
                "name": "tier=web",
                "href": "http://nodeg7:8082/tag/5b7743a0-b136-4067-bd5c-f6f23847bee1",
                "parent_type": "project",
                "tag_id": "0x00020003",
                "tag_value": "web",
                "perms2": {
                  "owner": "55e0bbe53d224a20a052cf8e7b2d36dc",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
                },
                "id_perms": {
                  "enable": true,
                  "uuid": {
                    "uuid_mslong": 6590810937126961000,
                    "uuid_lslong": 13645052491212505000
                  },
                  "created": "2017-11-06T12:02:56.751429",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-11-06T12:02:56.751429",
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
                  "HRdev",
                  "tier=web"
                ],
                "parent_uuid": "55e0bbe5-3d22-4a20-a052-cf8e7b2d36dc"
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
                    "uuid": "4a9e550c-c48a-4d0b-aedf-1202317ee8ad"
                  }
                ],
                "tag_type_name": "label",
                "display_name": "label=label1",
                "uuid": "ec246c97-18c0-4254-a899-9cd0712ac8c4",
                "href": "http://nodeg7:8082/tag/ec246c97-18c0-4254-a899-9cd0712ac8c4",
                "tag_id": "0x00000000",
                "tag_value": "label1",
                "perms2": {
                  "owner": "944e0f33117641e185cee2de4f4073f8",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
                },
                "id_perms": {
                  "enable": true,
                  "uuid": {
                    "uuid_mslong": 17015844688323690000,
                    "uuid_lslong": 12148913888874383000
                  },
                  "created": "2017-11-06T18:29:23.518987",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-11-06T18:29:23.518987",
                  "permissions": {
                    "owner": "cloud-admin",
                    "owner_access": 7,
                    "other_access": 7,
                    "group": "cloud-admin-group",
                    "group_access": 7
                  }
                },
                "fq_name": [
                  "label=label1"
                ],
                "name": "label=label1"
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
                    "uuid": "5ee5512a-a1c3-46e8-8815-ebc98c2c2784"
                  }
                ],
                "tag_type_name": "tier",
                "display_name": "tier=app",
                "uuid": "8c0131a8-1c3c-47af-9698-e621c8af57bb",
                "name": "tier=app",
                "href": "http://nodeg7:8082/tag/8c0131a8-1c3c-47af-9698-e621c8af57bb",
                "parent_type": "project",
                "tag_id": "0x00020005",
                "tag_value": "app",
                "perms2": {
                  "owner": "55e0bbe53d224a20a052cf8e7b2d36dc",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
                },
                "id_perms": {
                  "enable": true,
                  "uuid": {
                    "uuid_mslong": 10088399238384601000,
                    "uuid_lslong": 10851676334924454000
                  },
                  "created": "2017-11-06T12:03:08.362174",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-11-06T12:03:08.362174",
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
                  "HRdev",
                  "tier=app"
                ],
                "parent_uuid": "55e0bbe5-3d22-4a20-a052-cf8e7b2d36dc"
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
                    "uuid": "4b9bfda2-169d-4c35-803a-f17b1b283f18"
                  }
                ],
                "tag_type_name": "application",
                "display_name": "application=hr1",
                "uuid": "b90e0145-c0ce-41d9-b182-d6dab044e8a6",
                "href": "http://nodeg7:8082/tag/b90e0145-c0ce-41d9-b182-d6dab044e8a6",
                "tag_id": "0x00010003",
                "tag_value": "hr1",
                "perms2": {
                  "owner": "944e0f33117641e185cee2de4f4073f8",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
                },
                "id_perms": {
                  "enable": true,
                  "uuid": {
                    "uuid_mslong": 13334596945789730000,
                    "uuid_lslong": 12791022126434150000
                  },
                  "created": "2017-11-06T15:15:46.923363",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-11-06T15:15:46.923363",
                  "permissions": {
                    "owner": "cloud-admin",
                    "owner_access": 7,
                    "other_access": 7,
                    "group": "cloud-admin-group",
                    "group_access": 7
                  }
                },
                "fq_name": [
                  "application=hr1"
                ],
                "name": "application=hr1"
              }
            },
            {
              "tag": {
                "tag_type_refs": [
                  {
                    "to": [
                      "site"
                    ],
                    "attr": null,
                    "uuid": "d21fe0ec-f0b0-4133-a799-2c2c2b188042"
                  }
                ],
                "tag_type_name": "site",
                "display_name": "site=Site1",
                "uuid": "3affe6c9-e932-4384-8bf1-2092238ae0de",
                "href": "http://nodeg7:8082/tag/3affe6c9-e932-4384-8bf1-2092238ae0de",
                "tag_id": "0x00040001",
                "tag_value": "Site1",
                "perms2": {
                  "owner": "944e0f33117641e185cee2de4f4073f8",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
                },
                "id_perms": {
                  "enable": true,
                  "uuid": {
                    "uuid_mslong": 4251370328136238000,
                    "uuid_lslong": 10083876852692870000
                  },
                  "created": "2017-11-06T18:42:30.593880",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-11-06T18:42:30.593880",
                  "permissions": {
                    "owner": "cloud-admin",
                    "owner_access": 7,
                    "other_access": 7,
                    "group": "cloud-admin-group",
                    "group_access": 7
                  }
                },
                "fq_name": [
                  "site=Site1"
                ],
                "name": "site=Site1"
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
                    "uuid": "4b9bfda2-169d-4c35-803a-f17b1b283f18"
                  }
                ],
                "tag_type_name": "application",
                "display_name": "application=HR",
                "uuid": "afc558f3-c9c6-4a17-b455-9ec38ba71c34",
                "name": "application=HR",
                "href": "http://nodeg7:8082/tag/afc558f3-c9c6-4a17-b455-9ec38ba71c34",
                "parent_type": "project",
                "tag_id": "0x00010002",
                "tag_value": "HR",
                "perms2": {
                  "owner": "55e0bbe53d224a20a052cf8e7b2d36dc",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
                },
                "id_perms": {
                  "enable": true,
                  "uuid": {
                    "uuid_mslong": 12665627331134900000,
                    "uuid_lslong": 12994466862546231000
                  },
                  "created": "2017-11-06T12:02:47.151650",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-11-06T12:02:47.151650",
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
                  "HRdev",
                  "application=HR"
                ],
                "parent_uuid": "55e0bbe5-3d22-4a20-a052-cf8e7b2d36dc"
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
                    "uuid": "508d2b6f-f4f6-4097-b19f-feca6fca6288"
                  }
                ],
                "tag_type_name": "deployment",
                "display_name": "deployment=prod",
                "uuid": "60df71bb-153f-4c8a-8762-fcaee2b3fb0a",
                "name": "deployment=prod",
                "href": "http://nodeg7:8082/tag/60df71bb-153f-4c8a-8762-fcaee2b3fb0a",
                "parent_type": "project",
                "tag_id": "0x00030002",
                "tag_value": "prod",
                "perms2": {
                  "owner": "76e7ede47dea4d20b99d4a0a120e43ca",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
                },
                "id_perms": {
                  "enable": true,
                  "uuid": {
                    "uuid_mslong": 6980422995776851000,
                    "uuid_lslong": 9755637570895870000
                  },
                  "created": "2017-11-07T07:35:36.866878",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-11-07T07:35:36.866878",
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
                  "sapprod",
                  "deployment=prod"
                ],
                "parent_uuid": "76e7ede4-7dea-4d20-b99d-4a0a120e43ca"
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
                    "uuid": "4b9bfda2-169d-4c35-803a-f17b1b283f18"
                  }
                ],
                "tag_type_name": "application",
                "display_name": "application=sap",
                "uuid": "5b111cb1-f431-4910-894d-36ff6a00d58e",
                "href": "http://nodeg7:8082/tag/5b111cb1-f431-4910-894d-36ff6a00d58e",
                "tag_id": "0x00010006",
                "tag_value": "sap",
                "perms2": {
                  "owner": "db4bb9f40b144f16bc8f3018e36a06df",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
                },
                "id_perms": {
                  "enable": true,
                  "uuid": {
                    "uuid_mslong": 6562057682687183000,
                    "uuid_lslong": 9893624427025848000
                  },
                  "created": "2017-11-07T08:49:28.189208",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-11-07T08:49:28.189208",
                  "permissions": {
                    "owner": "cloud-admin",
                    "owner_access": 7,
                    "other_access": 7,
                    "group": "cloud-admin-group",
                    "group_access": 7
                  }
                },
                "fq_name": [
                  "application=sap"
                ],
                "name": "application=sap"
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
                    "uuid": "4b9bfda2-169d-4c35-803a-f17b1b283f18"
                  }
                ],
                "tag_type_name": "application",
                "display_name": "application=HR",
                "uuid": "74bca197-908b-476e-9ed1-f31fe53983f9",
                "name": "application=HR",
                "href": "http://nodeg7:8082/tag/74bca197-908b-476e-9ed1-f31fe53983f9",
                "parent_type": "project",
                "tag_id": "0x00010001",
                "tag_value": "HR",
                "perms2": {
                  "owner": "944e0f33117641e185cee2de4f4073f8",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
                },
                "id_perms": {
                  "enable": true,
                  "uuid": {
                    "uuid_mslong": 8411775876358425000,
                    "uuid_lslong": 11444195446440428000
                  },
                  "created": "2017-11-06T10:36:30.714705",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-11-06T10:36:30.714705",
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
                  "application=HR"
                ],
                "parent_uuid": "944e0f33-1176-41e1-85ce-e2de4f4073f8"
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
                    "uuid": "508d2b6f-f4f6-4097-b19f-feca6fca6288"
                  }
                ],
                "tag_type_name": "deployment",
                "display_name": "deployment=development",
                "uuid": "62577b02-1c28-4cac-a429-e142096186c3",
                "name": "deployment=development",
                "href": "http://nodeg7:8082/tag/62577b02-1c28-4cac-a429-e142096186c3",
                "parent_type": "project",
                "tag_id": "0x00030001",
                "tag_value": "development",
                "perms2": {
                  "owner": "55e0bbe53d224a20a052cf8e7b2d36dc",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
                },
                "id_perms": {
                  "enable": true,
                  "uuid": {
                    "uuid_mslong": 7086267787683319000,
                    "uuid_lslong": 11829233570006796000
                  },
                  "created": "2017-11-06T12:03:21.396032",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-11-06T12:03:21.396032",
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
                  "HRdev",
                  "deployment=development"
                ],
                "parent_uuid": "55e0bbe5-3d22-4a20-a052-cf8e7b2d36dc"
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
                    "uuid": "5ee5512a-a1c3-46e8-8815-ebc98c2c2784"
                  }
                ],
                "tag_type_name": "tier",
                "fq_name": [
                  "tier=app"
                ],
                "uuid": "fbdc72a5-235a-4f88-af3f-77aee94fc775",
                "href": "http://nodeg7:8082/tag/fbdc72a5-235a-4f88-af3f-77aee94fc775",
                "tag_id": "0x0002000d",
                "tag_value": "app",
                "perms2": {
                  "owner": "db4bb9f40b144f16bc8f3018e36a06df",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
                },
                "id_perms": {
                  "enable": true,
                  "uuid": {
                    "uuid_mslong": 18148506651984548000,
                    "uuid_lslong": 12627943473292495000
                  },
                  "created": "2017-11-07T08:49:46.248532",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-11-07T08:49:46.248532",
                  "permissions": {
                    "owner": "cloud-admin",
                    "owner_access": 7,
                    "other_access": 7,
                    "group": "cloud-admin-group",
                    "group_access": 7
                  }
                },
                "display_name": "tier=app",
                "name": "tier=app"
              }
            }
          ]
    }];
    return {
        epsClientMockData : epsClientMockData,
        epsServerMockData : epsServerMockData,
        tgConfigData: tgConfigData
    };
});
