/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function (_) {
    this.tgSettingsMockData = {
       "group_by_tag_type": "app,deployment",
       "sub_group_by_tag_type": "tier",
       "filter_by_endpoints": {
          "endpoint": []
       },
       "tag_type_list": [],
       "time_range": "3600",
       "from_time": "null",
       "to_time": "null",
       "filterByEndpoints": [],
       "errors": {},
       "locks": {},
       "endpoints": [],
       "elementConfigMap": {}
    };
    this.epsClientMockData = {
      "data": [
        {
          "eps.__key": "00000000-0000-0000-0000-000000000000",
          "eps.client.app": "application=HR",
          "eps.client.deployment": "default-domain:hrdev:deployment=Development",
          "eps.client.local_vn": "default-domain:hrdev:appvn",
          "eps.client.remote_app_id": "0x00000000",
          "eps.client.remote_deployment_id": "0x00000000",
          "eps.client.remote_prefix": "",
          "eps.client.remote_site_id": "0x00000000",
          "eps.client.remote_tier_id": "0x00000000",
          "eps.client.remote_vn": "__UNKNOWN__",
          "eps.client.site": "default-domain:hrdev:site=Bangalore",
          "eps.client.tier": "tier=App",
          "name": "default-domain:hrdev:bd0e61d5-f456-4cbe-a9e8-74f862794f67",
          "SUM(eps.client.added)": 59,
          "SUM(eps.client.deleted)": 59,
          "SUM(eps.client.in_bytes)": 540,
          "SUM(eps.client.in_pkts)": 6,
          "SUM(eps.client.out_bytes)": 0,
          "SUM(eps.client.out_pkts)": 0,
          "MAX(eps.client.active)": 0,
          "MIN(eps.client.active)": 0
        },
        {
          "eps.__key": "00000000-0000-0000-0000-000000000004",
          "eps.client.app": "application=HR",
          "eps.client.deployment": "default-domain:hrdev:deployment=Development",
          "eps.client.local_vn": "default-domain:hrdev:appvn",
          "eps.client.remote_app_id": "0x00000000",
          "eps.client.remote_deployment_id": "0x00000000",
          "eps.client.remote_prefix": "",
          "eps.client.remote_site_id": "0x00000000",
          "eps.client.remote_tier_id": "0x00000000",
          "eps.client.remote_vn": "default-domain:default-project:ip-fabric",
          "eps.client.site": "default-domain:hrdev:site=Bangalore",
          "eps.client.tier": "tier=App",
          "name": "default-domain:hrdev:bd0e61d5-f456-4cbe-a9e8-74f862794f67",
          "SUM(eps.client.added)": 26,
          "SUM(eps.client.deleted)": 26,
          "SUM(eps.client.in_bytes)": 19091,
          "SUM(eps.client.in_pkts)": 224,
          "SUM(eps.client.out_bytes)": 3054,
          "SUM(eps.client.out_pkts)": 39,
          "MAX(eps.client.active)": 0,
          "MIN(eps.client.active)": 0
        },
        {
          "eps.__key": "00000000-0000-0000-0000-000000000004",
          "eps.client.app": "application=HR",
          "eps.client.deployment": "default-domain:hrdev:deployment=Development",
          "eps.client.local_vn": "default-domain:hrdev:webvn",
          "eps.client.remote_app_id": "0x00000000",
          "eps.client.remote_deployment_id": "0x00000000",
          "eps.client.remote_prefix": "",
          "eps.client.remote_site_id": "0x00000000",
          "eps.client.remote_tier_id": "0x00000000",
          "eps.client.remote_vn": "default-domain:default-project:ip-fabric",
          "eps.client.site": "default-domain:hrdev:site=Bangalore",
          "eps.client.tier": "tier=Web",
          "name": "default-domain:hrdev:e93c5ea1-b23d-4fa6-b0b9-1fc302e68135",
          "SUM(eps.client.added)": 26,
          "SUM(eps.client.deleted)": 26,
          "SUM(eps.client.in_bytes)": 17969,
          "SUM(eps.client.in_pkts)": 207,
          "SUM(eps.client.out_bytes)": 2209,
          "SUM(eps.client.out_pkts)": 28,
          "MAX(eps.client.active)": 0,
          "MIN(eps.client.active)": 0
        },
        {
          "eps.__key": "00000000-0000-0000-0000-000000000000",
          "eps.client.app": "application=HR",
          "eps.client.deployment": "default-domain:hrdev:deployment=Development",
          "eps.client.local_vn": "default-domain:hrdev:dbvn",
          "eps.client.remote_app_id": "0x00000000",
          "eps.client.remote_deployment_id": "0x00000000",
          "eps.client.remote_prefix": "",
          "eps.client.remote_site_id": "0x00000000",
          "eps.client.remote_tier_id": "0x00000000",
          "eps.client.remote_vn": "__UNKNOWN__",
          "eps.client.site": "default-domain:hrdev:site=Bangalore",
          "eps.client.tier": "tier=DB",
          "name": "default-domain:hrdev:0050ac10-31d4-4d03-a303-b1ee16c46a58",
          "SUM(eps.client.added)": 59,
          "SUM(eps.client.deleted)": 59,
          "SUM(eps.client.in_bytes)": 418,
          "SUM(eps.client.in_pkts)": 5,
          "SUM(eps.client.out_bytes)": 0,
          "SUM(eps.client.out_pkts)": 0,
          "MAX(eps.client.active)": 0,
          "MIN(eps.client.active)": 0
        },
        {
          "eps.__key": "00000000-0000-0000-0000-000000000003",
          "eps.client.app": "application=HR",
          "eps.client.deployment": "default-domain:hrdev:deployment=Development",
          "eps.client.local_vn": "default-domain:hrdev:dbvn",
          "eps.client.remote_app_id": "0x00000000",
          "eps.client.remote_deployment_id": "0x00000000",
          "eps.client.remote_prefix": "",
          "eps.client.remote_site_id": "0x00000000",
          "eps.client.remote_tier_id": "0x00000000",
          "eps.client.remote_vn": "default-domain:hrdev:dbvn",
          "eps.client.site": "default-domain:hrdev:site=Bangalore",
          "eps.client.tier": "tier=DB",
          "name": "default-domain:hrdev:0050ac10-31d4-4d03-a303-b1ee16c46a58",
          "SUM(eps.client.added)": 12,
          "SUM(eps.client.deleted)": 12,
          "SUM(eps.client.in_bytes)": 1716,
          "SUM(eps.client.in_pkts)": 22,
          "SUM(eps.client.out_bytes)": 0,
          "SUM(eps.client.out_pkts)": 0,
          "MAX(eps.client.active)": 12,
          "MIN(eps.client.active)": 0
        },
        {
          "eps.__key": "default-policy-management:HR_Policy:50be6b3d-bc58-4dd9-b9a9-5c67b6aeb98b",
          "eps.client.app": "application=HR",
          "eps.client.deployment": "default-domain:hrdev:deployment=Development",
          "eps.client.local_vn": "default-domain:hrdev:webvn",
          "eps.client.remote_app_id": "0x00010000",
          "eps.client.remote_deployment_id": "0x00030000",
          "eps.client.remote_prefix": "",
          "eps.client.remote_site_id": "0x00040000",
          "eps.client.remote_tier_id": "0x00020001",
          "eps.client.remote_vn": "default-domain:hrdev:appvn",
          "eps.client.site": "default-domain:hrdev:site=Bangalore",
          "eps.client.tier": "tier=Web",
          "name": "default-domain:hrdev:e93c5ea1-b23d-4fa6-b0b9-1fc302e68135",
          "SUM(eps.client.added)": 1,
          "SUM(eps.client.deleted)": 0,
          "SUM(eps.client.in_bytes)": 117208,
          "SUM(eps.client.in_pkts)": 1196,
          "SUM(eps.client.out_bytes)": 117208,
          "SUM(eps.client.out_pkts)": 1196,
          "MAX(eps.client.active)": 1,
          "MIN(eps.client.active)": 1
        },
        {
          "eps.__key": "00000000-0000-0000-0000-000000000003",
          "eps.client.app": "application=HR",
          "eps.client.deployment": "default-domain:hrdev:deployment=Development",
          "eps.client.local_vn": "default-domain:hrdev:webvn",
          "eps.client.remote_app_id": "0x00000000",
          "eps.client.remote_deployment_id": "0x00000000",
          "eps.client.remote_prefix": "",
          "eps.client.remote_site_id": "0x00000000",
          "eps.client.remote_tier_id": "0x00000000",
          "eps.client.remote_vn": "default-domain:hrdev:webvn",
          "eps.client.site": "default-domain:hrdev:site=Bangalore",
          "eps.client.tier": "tier=Web",
          "name": "default-domain:hrdev:e93c5ea1-b23d-4fa6-b0b9-1fc302e68135",
          "SUM(eps.client.added)": 12,
          "SUM(eps.client.deleted)": 12,
          "SUM(eps.client.in_bytes)": 1718,
          "SUM(eps.client.in_pkts)": 22,
          "SUM(eps.client.out_bytes)": 0,
          "SUM(eps.client.out_pkts)": 0,
          "MAX(eps.client.active)": 12,
          "MIN(eps.client.active)": 0
        },
        {
          "eps.__key": "default-policy-management:HR_Policy:ece97aac-b1fa-408d-8b30-ebc194dd06cb",
          "eps.client.app": "application=HR",
          "eps.client.deployment": "default-domain:hrdev:deployment=Development",
          "eps.client.local_vn": "default-domain:hrdev:appvn",
          "eps.client.remote_app_id": "0x00010000",
          "eps.client.remote_deployment_id": "0x00030000",
          "eps.client.remote_prefix": "",
          "eps.client.remote_site_id": "0x00040000",
          "eps.client.remote_tier_id": "0x00020002",
          "eps.client.remote_vn": "default-domain:hrdev:dbvn",
          "eps.client.site": "default-domain:hrdev:site=Bangalore",
          "eps.client.tier": "tier=App",
          "name": "default-domain:hrdev:bd0e61d5-f456-4cbe-a9e8-74f862794f67",
          "SUM(eps.client.added)": 1,
          "SUM(eps.client.deleted)": 0,
          "SUM(eps.client.in_bytes)": 108486,
          "SUM(eps.client.in_pkts)": 1107,
          "SUM(eps.client.out_bytes)": 108486,
          "SUM(eps.client.out_pkts)": 1107,
          "MAX(eps.client.active)": 1,
          "MIN(eps.client.active)": 1
        },
        {
          "eps.__key": "00000000-0000-0000-0000-000000000002",
          "eps.client.app": "application=HR",
          "eps.client.deployment": "default-domain:hrdev:deployment=Development",
          "eps.client.local_vn": "default-domain:hrdev:dbvn",
          "eps.client.remote_app_id": "0x00010000",
          "eps.client.remote_deployment_id": "0x00030001",
          "eps.client.remote_prefix": "",
          "eps.client.remote_site_id": "0x00040001",
          "eps.client.remote_tier_id": "0x00020002",
          "eps.client.remote_vn": "default-domain:hrprod:dbvn",
          "eps.client.site": "default-domain:hrdev:site=Bangalore",
          "eps.client.tier": "tier=DB",
          "name": "default-domain:hrdev:0050ac10-31d4-4d03-a303-b1ee16c46a58",
          "SUM(eps.client.added)": 2,
          "SUM(eps.client.deleted)": 2,
          "SUM(eps.client.in_bytes)": 3528,
          "SUM(eps.client.in_pkts)": 36,
          "SUM(eps.client.out_bytes)": 0,
          "SUM(eps.client.out_pkts)": 0,
          "MAX(eps.client.active)": 2,
          "MIN(eps.client.active)": 0
        },
        {
          "eps.__key": "00000000-0000-0000-0000-000000000003",
          "eps.client.app": "application=HR",
          "eps.client.deployment": "default-domain:hrdev:deployment=Development",
          "eps.client.local_vn": "default-domain:hrdev:appvn",
          "eps.client.remote_app_id": "0x00000000",
          "eps.client.remote_deployment_id": "0x00000000",
          "eps.client.remote_prefix": "",
          "eps.client.remote_site_id": "0x00000000",
          "eps.client.remote_tier_id": "0x00000000",
          "eps.client.remote_vn": "default-domain:hrdev:appvn",
          "eps.client.site": "default-domain:hrdev:site=Bangalore",
          "eps.client.tier": "tier=App",
          "name": "default-domain:hrdev:bd0e61d5-f456-4cbe-a9e8-74f862794f67",
          "SUM(eps.client.added)": 12,
          "SUM(eps.client.deleted)": 12,
          "SUM(eps.client.in_bytes)": 1718,
          "SUM(eps.client.in_pkts)": 22,
          "SUM(eps.client.out_bytes)": 0,
          "SUM(eps.client.out_pkts)": 0,
          "MAX(eps.client.active)": 12,
          "MIN(eps.client.active)": 0
        },
        {
          "eps.__key": "00000000-0000-0000-0000-000000000000",
          "eps.client.app": "application=HR",
          "eps.client.deployment": "default-domain:hrdev:deployment=Development",
          "eps.client.local_vn": "default-domain:hrdev:webvn",
          "eps.client.remote_app_id": "0x00000000",
          "eps.client.remote_deployment_id": "0x00000000",
          "eps.client.remote_prefix": "",
          "eps.client.remote_site_id": "0x00000000",
          "eps.client.remote_tier_id": "0x00000000",
          "eps.client.remote_vn": "__UNKNOWN__",
          "eps.client.site": "default-domain:hrdev:site=Bangalore",
          "eps.client.tier": "tier=Web",
          "name": "default-domain:hrdev:e93c5ea1-b23d-4fa6-b0b9-1fc302e68135",
          "SUM(eps.client.added)": 58,
          "SUM(eps.client.deleted)": 58,
          "SUM(eps.client.in_bytes)": 794,
          "SUM(eps.client.in_pkts)": 9,
          "SUM(eps.client.out_bytes)": 0,
          "SUM(eps.client.out_pkts)": 0,
          "MAX(eps.client.active)": 0,
          "MIN(eps.client.active)": 0
        },
        {
          "eps.__key": "00000000-0000-0000-0000-000000000004",
          "eps.client.app": "application=HR",
          "eps.client.deployment": "default-domain:hrdev:deployment=Development",
          "eps.client.local_vn": "default-domain:hrdev:dbvn",
          "eps.client.remote_app_id": "0x00000000",
          "eps.client.remote_deployment_id": "0x00000000",
          "eps.client.remote_prefix": "",
          "eps.client.remote_site_id": "0x00000000",
          "eps.client.remote_tier_id": "0x00000000",
          "eps.client.remote_vn": "default-domain:default-project:ip-fabric",
          "eps.client.site": "default-domain:hrdev:site=Bangalore",
          "eps.client.tier": "tier=DB",
          "name": "default-domain:hrdev:0050ac10-31d4-4d03-a303-b1ee16c46a58",
          "SUM(eps.client.added)": 26,
          "SUM(eps.client.deleted)": 26,
          "SUM(eps.client.in_bytes)": 18431,
          "SUM(eps.client.in_pkts)": 214,
          "SUM(eps.client.out_bytes)": 4333,
          "SUM(eps.client.out_pkts)": 56,
          "MAX(eps.client.active)": 0,
          "MIN(eps.client.active)": 0
        }
      ],
      "total": 12,
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
              "value": "default-domain:hrdev:",
              "op": 7
            }
          ]
        ],
        "limit": 150000
      },
      "chunk": 1,
      "chunkSize": 12,
      "serverSideChunking": true
    };
    this.epsServerMockData = {
      "data": [
        {
          "eps.__key": "default-policy-management:HR_Policy:50be6b3d-bc58-4dd9-b9a9-5c67b6aeb98b",
          "eps.server.app": "application=HR",
          "eps.server.deployment": "default-domain:hrdev:deployment=Development",
          "eps.server.local_vn": "default-domain:hrdev:appvn",
          "eps.server.remote_app_id": "0x00010000",
          "eps.server.remote_deployment_id": "0x00030000",
          "eps.server.remote_prefix": "",
          "eps.server.remote_site_id": "0x00040000",
          "eps.server.remote_tier_id": "0x00020000",
          "eps.server.remote_vn": "default-domain:hrdev:webvn",
          "eps.server.site": "default-domain:hrdev:site=Bangalore",
          "eps.server.tier": "tier=App",
          "name": "default-domain:hrdev:bd0e61d5-f456-4cbe-a9e8-74f862794f67",
          "SUM(eps.server.added)": 1,
          "SUM(eps.server.deleted)": 0,
          "SUM(eps.server.in_bytes)": 117208,
          "SUM(eps.server.in_pkts)": 1196,
          "SUM(eps.server.out_bytes)": 117208,
          "SUM(eps.server.out_pkts)": 1196,
          "MAX(eps.server.active)": 1,
          "MIN(eps.server.active)": 1
        },
        {
          "eps.__key": "default-policy-management:HR_Policy:50be6b3d-bc58-4dd9-b9a9-5c67b6aeb98b",
          "eps.server.app": "application=HR",
          "eps.server.deployment": "default-domain:hrdev:deployment=Development",
          "eps.server.local_vn": "default-domain:hrdev:appvn",
          "eps.server.remote_app_id": "0x00010000",
          "eps.server.remote_deployment_id": "0x00030001",
          "eps.server.remote_prefix": "",
          "eps.server.remote_site_id": "0x00040001",
          "eps.server.remote_tier_id": "0x00020000",
          "eps.server.remote_vn": "default-domain:hrprod:webvn",
          "eps.server.site": "default-domain:hrdev:site=Bangalore",
          "eps.server.tier": "tier=App",
          "name": "default-domain:hrdev:bd0e61d5-f456-4cbe-a9e8-74f862794f67",
          "SUM(eps.server.added)": 1,
          "SUM(eps.server.deleted)": 0,
          "SUM(eps.server.in_bytes)": 80458,
          "SUM(eps.server.in_pkts)": 821,
          "SUM(eps.server.out_bytes)": 80458,
          "SUM(eps.server.out_pkts)": 821,
          "MAX(eps.server.active)": 1,
          "MIN(eps.server.active)": 1
        },
        {
          "eps.__key": "default-policy-management:HR_Policy:ece97aac-b1fa-408d-8b30-ebc194dd06cb",
          "eps.server.app": "application=HR",
          "eps.server.deployment": "default-domain:hrdev:deployment=Development",
          "eps.server.local_vn": "default-domain:hrdev:dbvn",
          "eps.server.remote_app_id": "0x00010000",
          "eps.server.remote_deployment_id": "0x00030000",
          "eps.server.remote_prefix": "",
          "eps.server.remote_site_id": "0x00040000",
          "eps.server.remote_tier_id": "0x00020001",
          "eps.server.remote_vn": "default-domain:hrdev:appvn",
          "eps.server.site": "default-domain:hrdev:site=Bangalore",
          "eps.server.tier": "tier=DB",
          "name": "default-domain:hrdev:0050ac10-31d4-4d03-a303-b1ee16c46a58",
          "SUM(eps.server.added)": 1,
          "SUM(eps.server.deleted)": 0,
          "SUM(eps.server.in_bytes)": 108486,
          "SUM(eps.server.in_pkts)": 1107,
          "SUM(eps.server.out_bytes)": 108486,
          "SUM(eps.server.out_pkts)": 1107,
          "MAX(eps.server.active)": 1,
          "MIN(eps.server.active)": 1
        },
        {
          "eps.__key": "default-policy-management:HR_Policy:ece97aac-b1fa-408d-8b30-ebc194dd06cb",
          "eps.server.app": "application=HR",
          "eps.server.deployment": "default-domain:hrdev:deployment=Development",
          "eps.server.local_vn": "default-domain:hrdev:dbvn",
          "eps.server.remote_app_id": "0x00010000",
          "eps.server.remote_deployment_id": "0x00030001",
          "eps.server.remote_prefix": "",
          "eps.server.remote_site_id": "0x00040001",
          "eps.server.remote_tier_id": "0x00020001",
          "eps.server.remote_vn": "default-domain:hrprod:appvn",
          "eps.server.site": "default-domain:hrdev:site=Bangalore",
          "eps.server.tier": "tier=DB",
          "name": "default-domain:hrdev:0050ac10-31d4-4d03-a303-b1ee16c46a58",
          "SUM(eps.server.added)": 1,
          "SUM(eps.server.deleted)": 0,
          "SUM(eps.server.in_bytes)": 74578,
          "SUM(eps.server.in_pkts)": 761,
          "SUM(eps.server.out_bytes)": 74578,
          "SUM(eps.server.out_pkts)": 761,
          "MAX(eps.server.active)": 1,
          "MIN(eps.server.active)": 1
        }
      ],
      "total": 4,
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
              "value": "default-domain:hrdev:",
              "op": 7
            }
          ]
        ],
        "limit": 150000
      },
      "chunk": 1,
      "chunkSize": 4,
      "serverSideChunking": true
    };
    this.tgConfigData = [
      {
        "tags": [
          {
            "tag": {
              "tag_type_refs": [
                {
                  "to": [
                    "deployment"
                  ],
                  "attr": null,
                  "uuid": "870ef8e7-14cc-492d-b239-af645e354b74"
                }
              ],
              "tag_type_name": "deployment",
              "fq_name": [
                "default-domain",
                "hrprod",
                "deployment=Production"
              ],
              "uuid": "8737a326-5f3c-4a58-a1b9-a7cb51d91545",
              "name": "deployment=Production",
              "href": "http://nodeg7:8082/tag/8737a326-5f3c-4a58-a1b9-a7cb51d91545",
              "parent_type": "project",
              "tag_id": "0x00030001",
              "tag_value": "Production",
              "perms2": {
                "owner": "ae7081fd51c349208c1ff8016a00f164",
                "owner_access": 7,
                "global_access": 0,
                "share": []
              },
              "id_perms": {
                "enable": true,
                "uuid": {
                  "uuid_mslong": 9743435704041228000,
                  "uuid_lslong": 11653530002491250000
                },
                "created": "2017-11-22T06:14:46.493339",
                "description": null,
                "creator": null,
                "user_visible": true,
                "last_modified": "2017-11-22T06:14:46.493339",
                "permissions": {
                  "owner": "admin",
                  "owner_access": 7,
                  "other_access": 7,
                  "group": "_member_",
                  "group_access": 7
                }
              },
              "display_name": "deployment=Production",
              "parent_uuid": "ae7081fd-51c3-4920-8c1f-f8016a00f164"
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
                  "uuid": "7b02ca5b-8730-4576-9066-a0758e4ac9c2"
                }
              ],
              "tag_type_name": "site",
              "display_name": "site=Sunnyvale",
              "uuid": "819f46ca-5d67-4619-9c5e-c9de80d1af12",
              "name": "site=Sunnyvale",
              "href": "http://nodeg7:8082/tag/819f46ca-5d67-4619-9c5e-c9de80d1af12",
              "parent_type": "project",
              "tag_id": "0x00040001",
              "tag_value": "Sunnyvale",
              "perms2": {
                "owner": "ae7081fd51c349208c1ff8016a00f164",
                "owner_access": 7,
                "global_access": 0,
                "share": []
              },
              "id_perms": {
                "enable": true,
                "uuid": {
                  "uuid_mslong": 9340261987154086000,
                  "uuid_lslong": 11267665275208708000
                },
                "created": "2017-11-22T06:14:58.025511",
                "description": null,
                "creator": null,
                "user_visible": true,
                "last_modified": "2017-11-22T06:14:58.025511",
                "permissions": {
                  "owner": "admin",
                  "owner_access": 7,
                  "other_access": 7,
                  "group": "_member_",
                  "group_access": 7
                }
              },
              "fq_name": [
                "default-domain",
                "hrprod",
                "site=Sunnyvale"
              ],
              "parent_uuid": "ae7081fd-51c3-4920-8c1f-f8016a00f164"
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
                  "uuid": "ef42e4ef-44b4-4ae2-8793-280b0afe17a1"
                }
              ],
              "tag_type_name": "tier",
              "display_name": "tier=App",
              "uuid": "1f6b082b-13a0-4b1c-b1df-5767c6769dec",
              "href": "http://nodeg7:8082/tag/1f6b082b-13a0-4b1c-b1df-5767c6769dec",
              "tag_id": "0x00020001",
              "tag_value": "App",
              "perms2": {
                "owner": "b9ed53bc34984219aed3782ace2f2c8b",
                "owner_access": 7,
                "global_access": 0,
                "share": []
              },
              "id_perms": {
                "enable": true,
                "uuid": {
                  "uuid_mslong": 2263912218789694200,
                  "uuid_lslong": 12817059167742632000
                },
                "created": "2017-11-22T06:13:38.619099",
                "description": null,
                "creator": null,
                "user_visible": true,
                "last_modified": "2017-11-22T06:13:38.619099",
                "permissions": {
                  "owner": "cloud-admin",
                  "owner_access": 7,
                  "other_access": 7,
                  "group": "cloud-admin-group",
                  "group_access": 7
                }
              },
              "fq_name": [
                "tier=App"
              ],
              "name": "tier=App"
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
                  "uuid": "870ef8e7-14cc-492d-b239-af645e354b74"
                }
              ],
              "tag_type_name": "deployment",
              "fq_name": [
                "default-domain",
                "hrdev",
                "deployment=Development"
              ],
              "uuid": "862bc4c6-ff14-4c83-85ba-4c269c91f033",
              "name": "deployment=Development",
              "href": "http://nodeg7:8082/tag/862bc4c6-ff14-4c83-85ba-4c269c91f033",
              "parent_type": "project",
              "tag_id": "0x00030000",
              "tag_value": "Development",
              "perms2": {
                "owner": "b9ed53bc34984219aed3782ace2f2c8b",
                "owner_access": 7,
                "global_access": 0,
                "share": []
              },
              "id_perms": {
                "enable": true,
                "uuid": {
                  "uuid_mslong": 9668037384042992000,
                  "uuid_lslong": 9636098081431876000
                },
                "created": "2017-11-22T06:14:13.259342",
                "description": null,
                "creator": null,
                "user_visible": true,
                "last_modified": "2017-11-22T06:14:13.259342",
                "permissions": {
                  "owner": "admin",
                  "owner_access": 7,
                  "other_access": 7,
                  "group": "admin",
                  "group_access": 7
                }
              },
              "display_name": "deployment=Development",
              "parent_uuid": "b9ed53bc-3498-4219-aed3-782ace2f2c8b"
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
                  "uuid": "7b02ca5b-8730-4576-9066-a0758e4ac9c2"
                }
              ],
              "tag_type_name": "site",
              "display_name": "site=Bangalore",
              "uuid": "5c114bb0-f6aa-4f16-9f18-ed60324a45e6",
              "name": "site=Bangalore",
              "href": "http://nodeg7:8082/tag/5c114bb0-f6aa-4f16-9f18-ed60324a45e6",
              "parent_type": "project",
              "tag_id": "0x00040000",
              "tag_value": "Bangalore",
              "perms2": {
                "owner": "b9ed53bc34984219aed3782ace2f2c8b",
                "owner_access": 7,
                "global_access": 0,
                "share": []
              },
              "id_perms": {
                "enable": true,
                "uuid": {
                  "uuid_mslong": 6634166949518135000,
                  "uuid_lslong": 11464173848887970000
                },
                "created": "2017-11-22T06:14:26.377999",
                "description": null,
                "creator": null,
                "user_visible": true,
                "last_modified": "2017-11-22T06:14:26.377999",
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
                "hrdev",
                "site=Bangalore"
              ],
              "parent_uuid": "b9ed53bc-3498-4219-aed3-782ace2f2c8b"
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
                  "uuid": "ef42e4ef-44b4-4ae2-8793-280b0afe17a1"
                }
              ],
              "tag_type_name": "tier",
              "display_name": "tier=Web",
              "uuid": "4969e42c-00a0-4293-90dc-38124c124ad9",
              "href": "http://nodeg7:8082/tag/4969e42c-00a0-4293-90dc-38124c124ad9",
              "tag_id": "0x00020000",
              "tag_value": "Web",
              "perms2": {
                "owner": "b9ed53bc34984219aed3782ace2f2c8b",
                "owner_access": 7,
                "global_access": 0,
                "share": []
              },
              "id_perms": {
                "enable": true,
                "uuid": {
                  "uuid_mslong": 5290010114963555000,
                  "uuid_lslong": 10438279687574800000
                },
                "created": "2017-11-22T06:12:36.223877",
                "description": null,
                "creator": null,
                "user_visible": true,
                "last_modified": "2017-11-22T06:12:36.223877",
                "permissions": {
                  "owner": "cloud-admin",
                  "owner_access": 7,
                  "other_access": 7,
                  "group": "cloud-admin-group",
                  "group_access": 7
                }
              },
              "fq_name": [
                "tier=Web"
              ],
              "name": "tier=Web"
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
                  "uuid": "ef42e4ef-44b4-4ae2-8793-280b0afe17a1"
                }
              ],
              "tag_type_name": "tier",
              "display_name": "tier=DB",
              "uuid": "5ed3b29e-8fa0-4b1a-92e4-ac494b06b0b3",
              "href": "http://nodeg7:8082/tag/5ed3b29e-8fa0-4b1a-92e4-ac494b06b0b3",
              "tag_id": "0x00020002",
              "tag_value": "DB",
              "perms2": {
                "owner": "b9ed53bc34984219aed3782ace2f2c8b",
                "owner_access": 7,
                "global_access": 0,
                "share": []
              },
              "id_perms": {
                "enable": true,
                "uuid": {
                  "uuid_mslong": 6833001453735398000,
                  "uuid_lslong": 10584774455018828000
                },
                "created": "2017-11-22T06:13:45.075207",
                "description": null,
                "creator": null,
                "user_visible": true,
                "last_modified": "2017-11-22T06:13:45.075207",
                "permissions": {
                  "owner": "cloud-admin",
                  "owner_access": 7,
                  "other_access": 7,
                  "group": "cloud-admin-group",
                  "group_access": 7
                }
              },
              "fq_name": [
                "tier=DB"
              ],
              "name": "tier=DB"
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
                  "uuid": "1468c3b6-aafc-425f-91c5-3fe7ff3e9c62"
                }
              ],
              "tag_type_name": "application",
              "display_name": "application=HR",
              "uuid": "dfd6c92d-53b7-4de2-915b-635dccee9c77",
              "href": "http://nodeg7:8082/tag/dfd6c92d-53b7-4de2-915b-635dccee9c77",
              "tag_id": "0x00010000",
              "tag_value": "HR",
              "perms2": {
                "owner": "b9ed53bc34984219aed3782ace2f2c8b",
                "owner_access": 7,
                "global_access": 0,
                "share": []
              },
              "id_perms": {
                "enable": true,
                "uuid": {
                  "uuid_mslong": 16129300311989244000,
                  "uuid_lslong": 10474074612901520000
                },
                "created": "2017-11-22T06:11:59.427121",
                "description": null,
                "creator": null,
                "user_visible": true,
                "last_modified": "2017-11-22T06:11:59.427121",
                "permissions": {
                  "owner": "cloud-admin",
                  "owner_access": 7,
                  "other_access": 7,
                  "group": "cloud-admin-group",
                  "group_access": 7
                }
              },
              "fq_name": [
                "application=HR"
              ],
              "name": "application=HR"
            }
          }
        ]
      }
    ];
    this.parseHierarchyConfigData = {
      'same-project-case': {
        'data': {
          "eps.__key": "default-policy-management:HR_Policy:50be6b3d-bc58-4dd9-b9a9-5c67b6aeb98b",
          "eps.client.remote_prefix": "",
          "name": "e93c5ea1-b23d-4fa6-b0b9-1fc302e68135",
          "SUM(eps.client.added)": 1,
          "SUM(eps.client.deleted)": 0,
          "MAX(eps.client.active)": 1,
          "MIN(eps.client.active)": 1,
          "isClient": true,
          "eps.traffic.remote_app_id": "application=HR",
          "eps.traffic.remote_deployment_id": "deployment=Development",
          "eps.traffic.remote_site_id": "site=Bangalore",
          "eps.traffic.remote_tier_id": "tier=App",
          "eps.traffic.remote_vn": "default-domain:hrdev:appvn",
          "SUM(eps.traffic.in_bytes)": 117208,
          "SUM(eps.traffic.out_bytes)": 117208,
          "SUM(eps.traffic.in_pkts)": 1196,
          "SUM(eps.traffic.out_pkts)": 1196,
          "eps.traffic.remote_prefix": "",
          "app": "application=HR",
          "tier": "tier=Web",
          "site": "site=Bangalore",
          "deployment": "deployment=Development",
          "vn": "default-domain:hrdev:webvn",
          "cgrid": "id_5",
          "eps.traffic.remote_app_id_fqn": "application=HR",
          "eps.traffic.remote_deployment_id_fqn": "default-domain:hrdev:deployment=Development",
          "eps.traffic.remote_prefix_fqn": "",
          "eps.traffic.remote_site_id_fqn": "default-domain:hrdev:site=Bangalore",
          "eps.traffic.remote_tier_id_fqn": "tier=App",
          "app_fqn": "application=HR",
          "site_fqn": "default-domain:hrdev:site=Bangalore",
          "tier_fqn": "tier=Web",
          "deployment_fqn": "default-domain:hrdev:deployment=Development",
          "name_fqn": "default-domain:hrdev:e93c5ea1-b23d-4fa6-b0b9-1fc302e68135"
        },
        'expected': [
          {
            "names": [
              "application=HR-deployment=Development",
              "tier=Web"
            ],
            "displayLabels": [
              [
                "application=HR",
                "deployment=Development"
              ],
              [
                "tier=Web"
              ]
            ],
            "id": "application=HR-deployment=Development-tier=Web",
            "value": 234416,
            "inBytes": 117208,
            "outBytes": 117208
          },
          {
            "names": [
              "application=HR-deployment=Development",
              "tier=App"
            ],
            "displayLabels": [
              [
                "application=HR",
                "deployment=Development"
              ],
              [
                "tier=App"
              ]
            ],
            "id": "application=HR-deployment=Development-tier=App",
            "type": "",
            "value": 234416,
            "inBytes": 117208,
            "outBytes": 117208
          }
        ]
      },
      'external-project-case': {
        'data': {
          "eps.__key": "default-policy-management:HR_Policy:50be6b3d-bc58-4dd9-b9a9-5c67b6aeb98b",
          "eps.server.remote_prefix": "",
          "name": "bd0e61d5-f456-4cbe-a9e8-74f862794f67",
          "SUM(eps.server.added)": 1,
          "SUM(eps.server.deleted)": 0,
          "MAX(eps.server.active)": 1,
          "MIN(eps.server.active)": 1,
          "isServer": true,
          "eps.traffic.remote_app_id": "application=HR",
          "eps.traffic.remote_deployment_id": "deployment=Production",
          "eps.traffic.remote_site_id": "site=Sunnyvale",
          "eps.traffic.remote_tier_id": "tier=Web",
          "eps.traffic.remote_vn": "default-domain:hrprod:webvn",
          "SUM(eps.traffic.in_bytes)": 80458,
          "SUM(eps.traffic.out_bytes)": 80458,
          "SUM(eps.traffic.in_pkts)": 821,
          "SUM(eps.traffic.out_pkts)": 821,
          "eps.traffic.remote_prefix": "",
          "app": "application=HR",
          "tier": "tier=App",
          "site": "site=Bangalore",
          "deployment": "deployment=Development",
          "vn": "default-domain:hrdev:appvn",
          "eps.traffic.remote_app_id_fqn": "application=HR",
          "eps.traffic.remote_deployment_id_fqn": "default-domain:hrprod:deployment=Production",
          "eps.traffic.remote_prefix_fqn": "",
          "eps.traffic.remote_site_id_fqn": "default-domain:hrprod:site=Sunnyvale",
          "eps.traffic.remote_tier_id_fqn": "tier=Web",
          "app_fqn": "application=HR",
          "site_fqn": "default-domain:hrdev:site=Bangalore",
          "tier_fqn": "tier=App",
          "deployment_fqn": "default-domain:hrdev:deployment=Development",
          "name_fqn": "default-domain:hrdev:bd0e61d5-f456-4cbe-a9e8-74f862794f67",
          "cgrid": "id_25"
        },
        'expected': [
          {
            "names": [
              "application=HR-deployment=Development",
              "tier=App"
            ],
            "displayLabels": [
              [
                "application=HR",
                "deployment=Development"
              ],
              [
                "tier=App"
              ]
            ],
            "id": "application=HR-deployment=Development-tier=App",
            "value": 160916,
            "inBytes": 80458,
            "outBytes": 80458
          },
          {
            "names": [
              "application=HR-deployment=Production_externalProject",
              "tier=Web_externalProject"
            ],
            "displayLabels": [
              [
                "application=HR",
                "deployment=Production"
              ],
              [
                "tier=Web"
              ]
            ],
            "id": "application=HR-deployment=Production_externalProject-tier=Web_externalProject",
            "type": "externalProject",
            "value": 160916,
            "inBytes": 80458,
            "outBytes": 80458
          }
        ]
      },
      'external-case': {
        'data': {
          "eps.__key": "00000000-0000-0000-0000-000000000000",
          "eps.client.remote_prefix": "",
          "name": "bd0e61d5-f456-4cbe-a9e8-74f862794f67",
          "SUM(eps.client.added)": 59,
          "SUM(eps.client.deleted)": 59,
          "MAX(eps.client.active)": 0,
          "MIN(eps.client.active)": 0,
          "isClient": true,
          "eps.traffic.remote_app_id": "",
          "eps.traffic.remote_deployment_id": "",
          "eps.traffic.remote_site_id": "",
          "eps.traffic.remote_tier_id": "",
          "eps.traffic.remote_vn": "__UNKNOWN__",
          "SUM(eps.traffic.in_bytes)": 540,
          "SUM(eps.traffic.out_bytes)": 0,
          "SUM(eps.traffic.in_pkts)": 6,
          "SUM(eps.traffic.out_pkts)": 0,
          "eps.traffic.remote_prefix": "",
          "app": "application=HR",
          "tier": "tier=App",
          "site": "site=Bangalore",
          "deployment": "deployment=Development",
          "vn": "default-domain:hrdev:appvn",
          "cgrid": "id_0",
          "eps.traffic.remote_app_id_fqn": "",
          "eps.traffic.remote_deployment_id_fqn": "",
          "eps.traffic.remote_prefix_fqn": "",
          "eps.traffic.remote_site_id_fqn": "",
          "eps.traffic.remote_tier_id_fqn": "",
          "app_fqn": "application=HR",
          "site_fqn": "default-domain:hrdev:site=Bangalore",
          "tier_fqn": "tier=App",
          "deployment_fqn": "default-domain:hrdev:deployment=Development",
          "name_fqn": "default-domain:hrdev:bd0e61d5-f456-4cbe-a9e8-74f862794f67"
        },
        'expected': [
          {
            "names": [
              "application=HR-deployment=Development",
              "tier=App"
            ],
            "displayLabels": [
              [
                "application=HR",
                "deployment=Development"
              ],
              [
                "tier=App"
              ]
            ],
            "id": "application=HR-deployment=Development-tier=App",
            "value": 540,
            "inBytes": 540,
            "outBytes": 0
          },
          {
            "names": [
              "External_external",
              "External_external"
            ],
            "displayLabels": [
              [
                "",
                "External"
              ],
              [
                "External"
              ]
            ],
            "id": "External_external-External_external",
            "type": "external",
            "value": 540,
            "inBytes": 540,
            "outBytes": 0
          }
        ]
      }
    };
    this.getLinkDirectionData = {
      'bidrectional-case' : {
        'data': {
          'src': {
            "data": {
              "id": "application=HR-deployment=Development",
              "otherNode": {
                "names": [
                  "application=HR-deployment=Development"
                ],
                "displayLabels": [
                  [
                    "application=HR",
                    "deployment=Development"
                  ]
                ],
                "id": "application=HR-deployment=Development",
                "type": "",
                "value": 2798880,
                "inBytes": 349860,
                "outBytes": 349860
              },
              "currentNode": {
                "names": [
                  "application=HR-deployment=Development"
                ],
                "displayLabels": [
                  [
                    "application=HR",
                    "deployment=Development"
                  ]
                ],
                "id": "application=HR-deployment=Development",
                "value": 2798880,
                "inBytes": 349860,
                "outBytes": 349860
              },
              "value": 2798880,
              "type": "src",
              "linkId": "application=HR-deployment=Development-application=HR-deployment=Development",
              "dataChildren": [
                {
                  "eps.__key": "default-policy-management:HR_Policy:50be6b3d-bc58-4dd9-b9a9-5c67b6aeb98b",
                  "eps.client.remote_prefix": "",
                  "name": "e93c5ea1-b23d-4fa6-b0b9-1fc302e68135",
                  "SUM(eps.client.added)": 0,
                  "SUM(eps.client.deleted)": 0,
                  "MAX(eps.client.active)": 1,
                  "MIN(eps.client.active)": 1,
                  "isClient": true,
                  "eps.traffic.remote_app_id": "application=HR",
                  "eps.traffic.remote_deployment_id": "deployment=Development",
                  "eps.traffic.remote_site_id": "site=Bangalore",
                  "eps.traffic.remote_tier_id": "tier=App",
                  "eps.traffic.remote_vn": "default-domain:hrdev:appvn",
                  "SUM(eps.traffic.in_bytes)": 349860,
                  "SUM(eps.traffic.out_bytes)": 349860,
                  "SUM(eps.traffic.in_pkts)": 3570,
                  "SUM(eps.traffic.out_pkts)": 3570,
                  "eps.traffic.remote_prefix": "",
                  "app": "application=HR",
                  "tier": "tier=Web",
                  "site": "site=Bangalore",
                  "deployment": "deployment=Development",
                  "vn": "default-domain:hrdev:webvn",
                  "cgrid": "id_0",
                  "eps.traffic.remote_app_id_fqn": "application=HR",
                  "eps.traffic.remote_deployment_id_fqn": "default-domain:hrdev:deployment=Development",
                  "eps.traffic.remote_prefix_fqn": "",
                  "eps.traffic.remote_site_id_fqn": "default-domain:hrdev:site=Bangalore",
                  "eps.traffic.remote_tier_id_fqn": "tier=App",
                  "app_fqn": "application=HR",
                  "site_fqn": "default-domain:hrdev:site=Bangalore",
                  "tier_fqn": "tier=Web",
                  "deployment_fqn": "default-domain:hrdev:deployment=Development",
                  "name_fqn": "default-domain:hrdev:e93c5ea1-b23d-4fa6-b0b9-1fc302e68135"
                },
                {
                  "eps.__key": "default-policy-management:HR_Policy:ece97aac-b1fa-408d-8b30-ebc194dd06cb",
                  "eps.client.remote_prefix": "",
                  "name": "bd0e61d5-f456-4cbe-a9e8-74f862794f67",
                  "SUM(eps.client.added)": 0,
                  "SUM(eps.client.deleted)": 0,
                  "MAX(eps.client.active)": 1,
                  "MIN(eps.client.active)": 1,
                  "isClient": true,
                  "eps.traffic.remote_app_id": "application=HR",
                  "eps.traffic.remote_deployment_id": "deployment=Development",
                  "eps.traffic.remote_site_id": "site=Bangalore",
                  "eps.traffic.remote_tier_id": "tier=DB",
                  "eps.traffic.remote_vn": "default-domain:hrdev:dbvn",
                  "SUM(eps.traffic.in_bytes)": 349860,
                  "SUM(eps.traffic.out_bytes)": 349860,
                  "SUM(eps.traffic.in_pkts)": 3570,
                  "SUM(eps.traffic.out_pkts)": 3570,
                  "eps.traffic.remote_prefix": "",
                  "app": "application=HR",
                  "tier": "tier=App",
                  "site": "site=Bangalore",
                  "deployment": "deployment=Development",
                  "vn": "default-domain:hrdev:appvn",
                  "cgrid": "id_1",
                  "eps.traffic.remote_app_id_fqn": "application=HR",
                  "eps.traffic.remote_deployment_id_fqn": "default-domain:hrdev:deployment=Development",
                  "eps.traffic.remote_prefix_fqn": "",
                  "eps.traffic.remote_site_id_fqn": "default-domain:hrdev:site=Bangalore",
                  "eps.traffic.remote_tier_id_fqn": "tier=DB",
                  "app_fqn": "application=HR",
                  "site_fqn": "default-domain:hrdev:site=Bangalore",
                  "tier_fqn": "tier=App",
                  "deployment_fqn": "default-domain:hrdev:deployment=Development",
                  "name_fqn": "default-domain:hrdev:bd0e61d5-f456-4cbe-a9e8-74f862794f67"
                },
                {
                  "eps.__key": "default-policy-management:HR_Policy:50be6b3d-bc58-4dd9-b9a9-5c67b6aeb98b",
                  "eps.server.remote_prefix": "",
                  "name": "bd0e61d5-f456-4cbe-a9e8-74f862794f67",
                  "SUM(eps.server.added)": 0,
                  "SUM(eps.server.deleted)": 0,
                  "MAX(eps.server.active)": 1,
                  "MIN(eps.server.active)": 1,
                  "isServer": true,
                  "eps.traffic.remote_app_id": "application=HR",
                  "eps.traffic.remote_deployment_id": "deployment=Development",
                  "eps.traffic.remote_site_id": "site=Bangalore",
                  "eps.traffic.remote_tier_id": "tier=Web",
                  "eps.traffic.remote_vn": "default-domain:hrdev:webvn",
                  "SUM(eps.traffic.in_bytes)": 349860,
                  "SUM(eps.traffic.out_bytes)": 349860,
                  "SUM(eps.traffic.in_pkts)": 3570,
                  "SUM(eps.traffic.out_pkts)": 3570,
                  "eps.traffic.remote_prefix": "",
                  "app": "application=HR",
                  "tier": "tier=App",
                  "site": "site=Bangalore",
                  "deployment": "deployment=Development",
                  "vn": "default-domain:hrdev:appvn",
                  "eps.traffic.remote_app_id_fqn": "application=HR",
                  "eps.traffic.remote_deployment_id_fqn": "default-domain:hrdev:deployment=Development",
                  "eps.traffic.remote_prefix_fqn": "",
                  "eps.traffic.remote_site_id_fqn": "default-domain:hrdev:site=Bangalore",
                  "eps.traffic.remote_tier_id_fqn": "tier=Web",
                  "app_fqn": "application=HR",
                  "site_fqn": "default-domain:hrdev:site=Bangalore",
                  "tier_fqn": "tier=App",
                  "deployment_fqn": "default-domain:hrdev:deployment=Development",
                  "name_fqn": "default-domain:hrdev:bd0e61d5-f456-4cbe-a9e8-74f862794f67",
                  "cgrid": "id_4"
                },
                {
                  "eps.__key": "default-policy-management:HR_Policy:ece97aac-b1fa-408d-8b30-ebc194dd06cb",
                  "eps.server.remote_prefix": "",
                  "name": "0050ac10-31d4-4d03-a303-b1ee16c46a58",
                  "SUM(eps.server.added)": 0,
                  "SUM(eps.server.deleted)": 0,
                  "MAX(eps.server.active)": 1,
                  "MIN(eps.server.active)": 1,
                  "isServer": true,
                  "eps.traffic.remote_app_id": "application=HR",
                  "eps.traffic.remote_deployment_id": "deployment=Development",
                  "eps.traffic.remote_site_id": "site=Bangalore",
                  "eps.traffic.remote_tier_id": "tier=App",
                  "eps.traffic.remote_vn": "default-domain:hrdev:appvn",
                  "SUM(eps.traffic.in_bytes)": 349860,
                  "SUM(eps.traffic.out_bytes)": 349860,
                  "SUM(eps.traffic.in_pkts)": 3570,
                  "SUM(eps.traffic.out_pkts)": 3570,
                  "eps.traffic.remote_prefix": "",
                  "app": "application=HR",
                  "tier": "tier=DB",
                  "site": "site=Bangalore",
                  "deployment": "deployment=Development",
                  "vn": "default-domain:hrdev:dbvn",
                  "eps.traffic.remote_app_id_fqn": "application=HR",
                  "eps.traffic.remote_deployment_id_fqn": "default-domain:hrdev:deployment=Development",
                  "eps.traffic.remote_prefix_fqn": "",
                  "eps.traffic.remote_site_id_fqn": "default-domain:hrdev:site=Bangalore",
                  "eps.traffic.remote_tier_id_fqn": "tier=App",
                  "app_fqn": "application=HR",
                  "site_fqn": "default-domain:hrdev:site=Bangalore",
                  "tier_fqn": "tier=DB",
                  "deployment_fqn": "default-domain:hrdev:deployment=Development",
                  "name_fqn": "default-domain:hrdev:0050ac10-31d4-4d03-a303-b1ee16c46a58",
                  "cgrid": "id_6"
                }
              ]
            }
          },
          'dst': {
            "data": {
              "arcType": ""
            }
          }
        },
        'expected': 'bidirectional'
      },
      'forward-direction-case' : {
        'data': {
          'src': {
            "data": {
              "id": "application=HR-deployment=Development-tier=App",
              "otherNode": {
                "names": [
                  "application=HR-deployment=Development",
                  "tier=DB"
                ],
                "displayLabels": [
                  [
                    "application=HR",
                    "deployment=Development"
                  ],
                  [
                    "tier=DB"
                  ]
                ],
                "id": "application=HR-deployment=Development-tier=DB",
                "type": "",
                "value": 1399440,
                "inBytes": 349860,
                "outBytes": 349860
              },
              "currentNode": {
                "names": [
                  "application=HR-deployment=Development",
                  "tier=App"
                ],
                "displayLabels": [
                  [
                    "application=HR",
                    "deployment=Development"
                  ],
                  [
                    "tier=App"
                  ]
                ],
                "id": "application=HR-deployment=Development-tier=App",
                "value": 1399440,
                "inBytes": 349860,
                "outBytes": 349860
              },
              "value": 1399440,
              "type": "src",
              "linkId": "application=HR-deployment=Development-tier=App-application=HR-deployment=Development-tier=DB",
              "dataChildren": [
                {
                  "eps.__key": "default-policy-management:HR_Policy:ece97aac-b1fa-408d-8b30-ebc194dd06cb",
                  "eps.client.remote_prefix": "",
                  "name": "bd0e61d5-f456-4cbe-a9e8-74f862794f67",
                  "SUM(eps.client.added)": 0,
                  "SUM(eps.client.deleted)": 0,
                  "MAX(eps.client.active)": 1,
                  "MIN(eps.client.active)": 1,
                  "isClient": true,
                  "eps.traffic.remote_app_id": "application=HR",
                  "eps.traffic.remote_deployment_id": "deployment=Development",
                  "eps.traffic.remote_site_id": "site=Bangalore",
                  "eps.traffic.remote_tier_id": "tier=DB",
                  "eps.traffic.remote_vn": "default-domain:hrdev:dbvn",
                  "SUM(eps.traffic.in_bytes)": 349860,
                  "SUM(eps.traffic.out_bytes)": 349860,
                  "SUM(eps.traffic.in_pkts)": 3570,
                  "SUM(eps.traffic.out_pkts)": 3570,
                  "eps.traffic.remote_prefix": "",
                  "app": "application=HR",
                  "tier": "tier=App",
                  "site": "site=Bangalore",
                  "deployment": "deployment=Development",
                  "vn": "default-domain:hrdev:appvn",
                  "cgrid": "id_1",
                  "eps.traffic.remote_app_id_fqn": "application=HR",
                  "eps.traffic.remote_deployment_id_fqn": "default-domain:hrdev:deployment=Development",
                  "eps.traffic.remote_prefix_fqn": "",
                  "eps.traffic.remote_site_id_fqn": "default-domain:hrdev:site=Bangalore",
                  "eps.traffic.remote_tier_id_fqn": "tier=DB",
                  "app_fqn": "application=HR",
                  "site_fqn": "default-domain:hrdev:site=Bangalore",
                  "tier_fqn": "tier=App",
                  "deployment_fqn": "default-domain:hrdev:deployment=Development",
                  "name_fqn": "default-domain:hrdev:bd0e61d5-f456-4cbe-a9e8-74f862794f67"
                },
                {
                  "eps.__key": "default-policy-management:HR_Policy:ece97aac-b1fa-408d-8b30-ebc194dd06cb",
                  "eps.server.remote_prefix": "",
                  "name": "0050ac10-31d4-4d03-a303-b1ee16c46a58",
                  "SUM(eps.server.added)": 0,
                  "SUM(eps.server.deleted)": 0,
                  "MAX(eps.server.active)": 1,
                  "MIN(eps.server.active)": 1,
                  "isServer": true,
                  "eps.traffic.remote_app_id": "application=HR",
                  "eps.traffic.remote_deployment_id": "deployment=Development",
                  "eps.traffic.remote_site_id": "site=Bangalore",
                  "eps.traffic.remote_tier_id": "tier=App",
                  "eps.traffic.remote_vn": "default-domain:hrdev:appvn",
                  "SUM(eps.traffic.in_bytes)": 349860,
                  "SUM(eps.traffic.out_bytes)": 349860,
                  "SUM(eps.traffic.in_pkts)": 3570,
                  "SUM(eps.traffic.out_pkts)": 3570,
                  "eps.traffic.remote_prefix": "",
                  "app": "application=HR",
                  "tier": "tier=DB",
                  "site": "site=Bangalore",
                  "deployment": "deployment=Development",
                  "vn": "default-domain:hrdev:dbvn",
                  "eps.traffic.remote_app_id_fqn": "application=HR",
                  "eps.traffic.remote_deployment_id_fqn": "default-domain:hrdev:deployment=Development",
                  "eps.traffic.remote_prefix_fqn": "",
                  "eps.traffic.remote_site_id_fqn": "default-domain:hrdev:site=Bangalore",
                  "eps.traffic.remote_tier_id_fqn": "tier=App",
                  "app_fqn": "application=HR",
                  "site_fqn": "default-domain:hrdev:site=Bangalore",
                  "tier_fqn": "tier=DB",
                  "deployment_fqn": "default-domain:hrdev:deployment=Development",
                  "name_fqn": "default-domain:hrdev:0050ac10-31d4-4d03-a303-b1ee16c46a58",
                  "cgrid": "id_6"
                }
              ]
            }
          },
          'dst': {
            "data": {
              "arcType": ""
            }
          }
        },
        'expected': 'forward'
      },
      'reverse-direction-case' : {
        'data': {
          'src': {
            "data": {
              "id": "application=HR-deployment=Development-tier=App",
              "otherNode": {
                "names": [
                  "application=HR-deployment=Development",
                  "tier=Web"
                ],
                "displayLabels": [
                  [
                    "application=HR",
                    "deployment=Development"
                  ],
                  [
                    "tier=Web"
                  ]
                ],
                "id": "application=HR-deployment=Development-tier=Web",
                "value": 1399440,
                "inBytes": 349860,
                "outBytes": 349860
              },
              "currentNode": {
                "names": [
                  "application=HR-deployment=Development",
                  "tier=App"
                ],
                "displayLabels": [
                  [
                    "application=HR",
                    "deployment=Development"
                  ],
                  [
                    "tier=App"
                  ]
                ],
                "id": "application=HR-deployment=Development-tier=App",
                "type": "",
                "value": 1399440,
                "inBytes": 349860,
                "outBytes": 349860
              },
              "arcType": "",
              "value": 1399440,
              "type": "dst",
              "linkId": "application=HR-deployment=Development-tier=Web-application=HR-deployment=Development-tier=App",
              "dataChildren": [
                {
                  "eps.__key": "default-policy-management:HR_Policy:50be6b3d-bc58-4dd9-b9a9-5c67b6aeb98b",
                  "eps.client.remote_prefix": "",
                  "name": "e93c5ea1-b23d-4fa6-b0b9-1fc302e68135",
                  "SUM(eps.client.added)": 0,
                  "SUM(eps.client.deleted)": 0,
                  "MAX(eps.client.active)": 1,
                  "MIN(eps.client.active)": 1,
                  "isClient": true,
                  "eps.traffic.remote_app_id": "application=HR",
                  "eps.traffic.remote_deployment_id": "deployment=Development",
                  "eps.traffic.remote_site_id": "site=Bangalore",
                  "eps.traffic.remote_tier_id": "tier=App",
                  "eps.traffic.remote_vn": "default-domain:hrdev:appvn",
                  "SUM(eps.traffic.in_bytes)": 349860,
                  "SUM(eps.traffic.out_bytes)": 349860,
                  "SUM(eps.traffic.in_pkts)": 3570,
                  "SUM(eps.traffic.out_pkts)": 3570,
                  "eps.traffic.remote_prefix": "",
                  "app": "application=HR",
                  "tier": "tier=Web",
                  "site": "site=Bangalore",
                  "deployment": "deployment=Development",
                  "vn": "default-domain:hrdev:webvn",
                  "cgrid": "id_0",
                  "eps.traffic.remote_app_id_fqn": "application=HR",
                  "eps.traffic.remote_deployment_id_fqn": "default-domain:hrdev:deployment=Development",
                  "eps.traffic.remote_prefix_fqn": "",
                  "eps.traffic.remote_site_id_fqn": "default-domain:hrdev:site=Bangalore",
                  "eps.traffic.remote_tier_id_fqn": "tier=App",
                  "app_fqn": "application=HR",
                  "site_fqn": "default-domain:hrdev:site=Bangalore",
                  "tier_fqn": "tier=Web",
                  "deployment_fqn": "default-domain:hrdev:deployment=Development",
                  "name_fqn": "default-domain:hrdev:e93c5ea1-b23d-4fa6-b0b9-1fc302e68135"
                },
                {
                  "eps.__key": "default-policy-management:HR_Policy:50be6b3d-bc58-4dd9-b9a9-5c67b6aeb98b",
                  "eps.server.remote_prefix": "",
                  "name": "bd0e61d5-f456-4cbe-a9e8-74f862794f67",
                  "SUM(eps.server.added)": 0,
                  "SUM(eps.server.deleted)": 0,
                  "MAX(eps.server.active)": 1,
                  "MIN(eps.server.active)": 1,
                  "isServer": true,
                  "eps.traffic.remote_app_id": "application=HR",
                  "eps.traffic.remote_deployment_id": "deployment=Development",
                  "eps.traffic.remote_site_id": "site=Bangalore",
                  "eps.traffic.remote_tier_id": "tier=Web",
                  "eps.traffic.remote_vn": "default-domain:hrdev:webvn",
                  "SUM(eps.traffic.in_bytes)": 349860,
                  "SUM(eps.traffic.out_bytes)": 349860,
                  "SUM(eps.traffic.in_pkts)": 3570,
                  "SUM(eps.traffic.out_pkts)": 3570,
                  "eps.traffic.remote_prefix": "",
                  "app": "application=HR",
                  "tier": "tier=App",
                  "site": "site=Bangalore",
                  "deployment": "deployment=Development",
                  "vn": "default-domain:hrdev:appvn",
                  "eps.traffic.remote_app_id_fqn": "application=HR",
                  "eps.traffic.remote_deployment_id_fqn": "default-domain:hrdev:deployment=Development",
                  "eps.traffic.remote_prefix_fqn": "",
                  "eps.traffic.remote_site_id_fqn": "default-domain:hrdev:site=Bangalore",
                  "eps.traffic.remote_tier_id_fqn": "tier=Web",
                  "app_fqn": "application=HR",
                  "site_fqn": "default-domain:hrdev:site=Bangalore",
                  "tier_fqn": "tier=App",
                  "deployment_fqn": "default-domain:hrdev:deployment=Development",
                  "name_fqn": "default-domain:hrdev:bd0e61d5-f456-4cbe-a9e8-74f862794f67",
                  "cgrid": "id_4"
                }
              ]
            }
          },
          'dst': {
            "data": {
              "arcType": ""
            }
          }
        },
        'expected': 'reverse'
      },
      'external-reverse-direction-case' : {
        'data': {
          'src':{
            "data": {
              "id": "application=HR-deployment=Development",
              "otherNode": {
                "names": [
                  "application=HR-deployment=Production_externalProject"
                ],
                "displayLabels": [
                  [
                    "application=HR",
                    "deployment=Production"
                  ]
                ],
                "id": "application=HR-deployment=Production_externalProject",
                "type": "externalProject",
                "value": 1399636,
                "inBytes": 349860,
                "outBytes": 349860
              },
              "currentNode": {
                "names": [
                  "application=HR-deployment=Development"
                ],
                "displayLabels": [
                  [
                    "application=HR",
                    "deployment=Development"
                  ]
                ],
                "id": "application=HR-deployment=Development",
                "value": 1399636,
                "inBytes": 349860,
                "outBytes": 349860
              },
              "value": 1399636,
              "type": "src",
              "linkId": "application=HR-deployment=Development-application=HR-deployment=Production_externalProject",
              "dataChildren": [
                {
                  "eps.__key": "default-policy-management:HR_Policy:50be6b3d-bc58-4dd9-b9a9-5c67b6aeb98b",
                  "eps.server.remote_prefix": "",
                  "name": "bd0e61d5-f456-4cbe-a9e8-74f862794f67",
                  "SUM(eps.server.added)": 0,
                  "SUM(eps.server.deleted)": 0,
                  "MAX(eps.server.active)": 1,
                  "MIN(eps.server.active)": 1,
                  "isServer": true,
                  "eps.traffic.remote_app_id": "application=HR",
                  "eps.traffic.remote_deployment_id": "deployment=Production",
                  "eps.traffic.remote_site_id": "site=Sunnyvale",
                  "eps.traffic.remote_tier_id": "tier=Web",
                  "eps.traffic.remote_vn": "default-domain:hrprod:webvn",
                  "SUM(eps.traffic.in_bytes)": 349860,
                  "SUM(eps.traffic.out_bytes)": 349860,
                  "SUM(eps.traffic.in_pkts)": 3570,
                  "SUM(eps.traffic.out_pkts)": 3570,
                  "eps.traffic.remote_prefix": "",
                  "app": "application=HR",
                  "tier": "tier=App",
                  "site": "site=Bangalore",
                  "deployment": "deployment=Development",
                  "vn": "default-domain:hrdev:appvn",
                  "eps.traffic.remote_app_id_fqn": "application=HR",
                  "eps.traffic.remote_deployment_id_fqn": "default-domain:hrprod:deployment=Production",
                  "eps.traffic.remote_prefix_fqn": "",
                  "eps.traffic.remote_site_id_fqn": "default-domain:hrprod:site=Sunnyvale",
                  "eps.traffic.remote_tier_id_fqn": "tier=Web",
                  "app_fqn": "application=HR",
                  "site_fqn": "default-domain:hrdev:site=Bangalore",
                  "tier_fqn": "tier=App",
                  "deployment_fqn": "default-domain:hrdev:deployment=Development",
                  "name_fqn": "default-domain:hrdev:bd0e61d5-f456-4cbe-a9e8-74f862794f67",
                  "cgrid": "id_5"
                },
                {
                  "eps.__key": "default-policy-management:HR_Policy:ece97aac-b1fa-408d-8b30-ebc194dd06cb",
                  "eps.server.remote_prefix": "",
                  "name": "0050ac10-31d4-4d03-a303-b1ee16c46a58",
                  "SUM(eps.server.added)": 0,
                  "SUM(eps.server.deleted)": 0,
                  "MAX(eps.server.active)": 1,
                  "MIN(eps.server.active)": 1,
                  "isServer": true,
                  "eps.traffic.remote_app_id": "application=HR",
                  "eps.traffic.remote_deployment_id": "deployment=Production",
                  "eps.traffic.remote_site_id": "site=Sunnyvale",
                  "eps.traffic.remote_tier_id": "tier=App",
                  "eps.traffic.remote_vn": "default-domain:hrprod:appvn",
                  "SUM(eps.traffic.in_bytes)": 349958,
                  "SUM(eps.traffic.out_bytes)": 349958,
                  "SUM(eps.traffic.in_pkts)": 3571,
                  "SUM(eps.traffic.out_pkts)": 3571,
                  "eps.traffic.remote_prefix": "",
                  "app": "application=HR",
                  "tier": "tier=DB",
                  "site": "site=Bangalore",
                  "deployment": "deployment=Development",
                  "vn": "default-domain:hrdev:dbvn",
                  "eps.traffic.remote_app_id_fqn": "application=HR",
                  "eps.traffic.remote_deployment_id_fqn": "default-domain:hrprod:deployment=Production",
                  "eps.traffic.remote_prefix_fqn": "",
                  "eps.traffic.remote_site_id_fqn": "default-domain:hrprod:site=Sunnyvale",
                  "eps.traffic.remote_tier_id_fqn": "tier=App",
                  "app_fqn": "application=HR",
                  "site_fqn": "default-domain:hrdev:site=Bangalore",
                  "tier_fqn": "tier=DB",
                  "deployment_fqn": "default-domain:hrdev:deployment=Development",
                  "name_fqn": "default-domain:hrdev:0050ac10-31d4-4d03-a303-b1ee16c46a58",
                  "cgrid": "id_7"
                }
              ]
            }
          },
          'dst': {
            "data": {
              "arcType": "externalProject"
            }
          }
        },
        'expected': 'reverse'
      }
    };
    this.getAppAPSData = {
      'data' : [
         {
            "application-policy-set": {
               "display_name": "default-application-policy-set",
               "uuid": "aced31d2-4574-4a7e-97a5-0ec896a5751b",
               "href": "http://nodeg4:8082/application-policy-set/aced31d2-4574-4a7e-97a5-0ec896a5751b",
               "parent_type": "project",
               "name": "default-application-policy-set",
               "perms2": {
                  "owner": "64e1d64bc23d43fba1f99e98e6420b89",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
               },
               "id_perms": {
                  "enable": true,
                  "uuid": {
                     "uuid_mslong": 12460670523182172000,
                     "uuid_lslong": 10927156325568051000
                  },
                  "created": "2017-12-28T21:02:22.581928",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-12-28T21:02:22.581928",
                  "permissions": {
                     "owner": "contrail-api",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "admin",
                     "group_access": 7
                  }
               },
               "all_applications": true,
               "fq_name": [
                  "default-domain",
                  "test1",
                  "default-application-policy-set"
               ],
               "parent_uuid": "64e1d64b-c23d-43fb-a1f9-9e98e6420b89"
            }
         },
         {
            "application-policy-set": {
               "fq_name": [
                  "default-policy-management",
                  "sdcc"
               ],
               "uuid": "e964144c-b733-447d-bfbe-1a09abebc6c8",
               "href": "http://nodeg4:8082/application-policy-set/e964144c-b733-447d-bfbe-1a09abebc6c8",
               "parent_type": "policy-management",
               "name": "sdcc",
               "perms2": {
                  "owner": "cloud-admin",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
               },
               "id_perms": {
                  "enable": true,
                  "uuid": {
                     "uuid_mslong": 16817589228231936000,
                     "uuid_lslong": 13816509335660644000
                  },
                  "created": "2018-01-02T14:00:04.406622",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2018-01-02T14:00:04.406622",
                  "permissions": {
                     "owner": "admin",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "admin",
                     "group_access": 7
                  }
               },
               "display_name": "sdcc",
               "parent_uuid": "85bd1f95-4b6c-4798-bfa3-e599bd267b1d"
            }
         },
         {
            "application-policy-set": {
               "display_name": "default-application-policy-set",
               "uuid": "8dca2690-3f2b-48e2-8fa1-46500cc8ab7c",
               "href": "http://nodeg4:8082/application-policy-set/8dca2690-3f2b-48e2-8fa1-46500cc8ab7c",
               "parent_type": "project",
               "name": "default-application-policy-set",
               "firewall_policy_refs": [
                  {
                     "to": [
                        "default-domain",
                        "hrdev",
                        "Dev-default-policy"
                     ],
                     "attr": {
                        "sequence": "0"
                     },
                     "uuid": "7c8e64fe-4c1b-47bf-af61-cd5bc2b1aeb5"
                  },
                  {
                     "to": [
                        "default-domain",
                        "hrdev",
                        "HRDevPolicy"
                     ],
                     "attr": {
                        "sequence": "1"
                     },
                     "uuid": "8d06e841-8520-4991-b2eb-33394479cab6"
                  }
               ],
               "perms2": {
                  "owner": "2f7ec7abedbb44fa846410fb7da15364",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
               },
               "id_perms": {
                  "enable": true,
                  "description": "",
                  "creator": null,
                  "created": "2017-12-29T08:39:57.042837",
                  "user_visible": true,
                  "last_modified": "2017-12-29T10:34:56.328114",
                  "permissions": {
                     "owner": "contrail-api",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "admin",
                     "group_access": 7
                  },
                  "uuid": {
                     "uuid_mslong": 10217021105620339000,
                     "uuid_lslong": 10349630728299915000
                  }
               },
               "all_applications": true,
               "fq_name": [
                  "default-domain",
                  "hrdev",
                  "default-application-policy-set"
               ],
               "parent_uuid": "2f7ec7ab-edbb-44fa-8464-10fb7da15364"
            }
         },
         {
            "application-policy-set": {
               "fq_name": [
                  "default-domain",
                  "default-project",
                  "default-application-policy-set"
               ],
               "uuid": "91a97e1d-9c2d-4bd0-a18d-02948ba64a6d",
               "href": "http://nodeg4:8082/application-policy-set/91a97e1d-9c2d-4bd0-a18d-02948ba64a6d",
               "parent_type": "project",
               "name": "default-application-policy-set",
               "perms2": {
                  "owner": "cloud-admin",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
               },
               "id_perms": {
                  "enable": true,
                  "uuid": {
                     "uuid_mslong": 10496059072203016000,
                     "uuid_lslong": 11640963448843946000
                  },
                  "created": "2017-12-28T06:35:33.115194",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-12-28T06:35:33.115194",
                  "permissions": {
                     "owner": "cloud-admin",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "cloud-admin-group",
                     "group_access": 7
                  }
               },
               "all_applications": true,
               "parent_uuid": "45efbe61-d8aa-4039-b521-b311d0ad6160"
            }
         },
         {
            "application-policy-set": {
               "display_name": "HRProdPolicySet",
               "uuid": "f8abd860-e758-4bf6-b048-4dc87be7d096",
               "href": "http://nodeg4:8082/application-policy-set/f8abd860-e758-4bf6-b048-4dc87be7d096",
               "parent_type": "project",
               "name": "HRProdPolicySet",
               "tag_refs": [
                  {
                     "to": [
                        "default-domain",
                        "hrprod",
                        "application=HRProd"
                     ],
                     "attr": null,
                     "uuid": "90689d34-9cd9-4b72-acdd-f4c50e7e4da4"
                  }
               ],
               "firewall_policy_refs": [
                  {
                     "to": [
                        "default-domain",
                        "hrprod",
                        "HRProdPolicy"
                     ],
                     "attr": {
                        "sequence": "0"
                     },
                     "uuid": "67ceda38-0a8c-40a9-8bae-684b77ca7434"
                  }
               ],
               "perms2": {
                  "owner": "5c929708d32442adb2423035b4f7e247",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
               },
               "id_perms": {
                  "enable": true,
                  "description": "",
                  "creator": null,
                  "created": "2017-12-29T08:51:47.011253",
                  "user_visible": true,
                  "last_modified": "2017-12-29T08:51:47.033998",
                  "permissions": {
                     "owner": "admin",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "_member_",
                     "group_access": 7
                  },
                  "uuid": {
                     "uuid_mslong": 17918653453133433000,
                     "uuid_lslong": 12702488272466072000
                  }
               },
               "fq_name": [
                  "default-domain",
                  "hrprod",
                  "HRProdPolicySet"
               ],
               "parent_uuid": "5c929708-d324-42ad-b242-3035b4f7e247"
            }
         },
         {
            "application-policy-set": {
               "display_name": "default-application-policy-set",
               "uuid": "335c9041-8659-4821-8e33-025289dcdb7d",
               "href": "http://nodeg4:8082/application-policy-set/335c9041-8659-4821-8e33-025289dcdb7d",
               "parent_type": "project",
               "name": "default-application-policy-set",
               "firewall_policy_refs": [
                  {
                     "to": [
                        "default-domain",
                        "hrprod",
                        "Prod-default-policy"
                     ],
                     "attr": {
                        "sequence": "0"
                     },
                     "uuid": "a56e000f-d8f2-45dd-8874-e7f8bf07518d"
                  }
               ],
               "perms2": {
                  "owner": "5c929708d32442adb2423035b4f7e247",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
               },
               "id_perms": {
                  "enable": true,
                  "uuid": {
                     "uuid_mslong": 3700991604892977000,
                     "uuid_lslong": 10246536130721536000
                  },
                  "created": "2017-12-29T08:40:18.305828",
                  "description": "",
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-12-29T10:20:57.920476",
                  "permissions": {
                     "owner": "contrail-api",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "admin",
                     "group_access": 7
                  }
               },
               "all_applications": true,
               "fq_name": [
                  "default-domain",
                  "hrprod",
                  "default-application-policy-set"
               ],
               "parent_uuid": "5c929708-d324-42ad-b242-3035b4f7e247"
            }
         },
         {
            "application-policy-set": {
               "fq_name": [
                  "default-domain",
                  "hrdev",
                  "HRDevPolicySet"
               ],
               "uuid": "df512483-c4ed-4947-a0c3-efec8527858b",
               "href": "http://nodeg4:8082/application-policy-set/df512483-c4ed-4947-a0c3-efec8527858b",
               "parent_type": "project",
               "name": "HRDevPolicySet",
               "tag_refs": [
                  {
                     "to": [
                        "default-domain",
                        "hrdev",
                        "application=HRDev"
                     ],
                     "attr": null,
                     "uuid": "fa0c8dc9-edca-45b2-b1f3-3111c3a3bbc6"
                  }
               ],
               "firewall_policy_refs": [
                  {
                     "to": [
                        "default-domain",
                        "hrdev",
                        "HRDevPolicy"
                     ],
                     "attr": {
                        "sequence": "0"
                     },
                     "uuid": "8d06e841-8520-4991-b2eb-33394479cab6"
                  }
               ],
               "perms2": {
                  "owner": "2f7ec7abedbb44fa846410fb7da15364",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
               },
               "id_perms": {
                  "enable": true,
                  "description": "",
                  "creator": null,
                  "created": "2017-12-29T08:52:34.984433",
                  "user_visible": true,
                  "last_modified": "2017-12-29T08:52:35.029756",
                  "permissions": {
                     "owner": "admin",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "_member_",
                     "group_access": 7
                  },
                  "uuid": {
                     "uuid_mslong": 16091683091934693000,
                     "uuid_lslong": 11584366465652328000
                  }
               },
               "display_name": "HRDevPolicySet",
               "parent_uuid": "2f7ec7ab-edbb-44fa-8464-10fb7da15364"
            }
         },
         {
            "application-policy-set": {
               "display_name": "sda",
               "uuid": "4b7ac412-26f4-4856-964f-7c2611cc60c4",
               "href": "http://nodeg4:8082/application-policy-set/4b7ac412-26f4-4856-964f-7c2611cc60c4",
               "parent_type": "policy-management",
               "name": "sda",
               "firewall_policy_refs": [
                  {
                     "to": [
                        "default-policy-management",
                        "ku"
                     ],
                     "attr": {
                        "sequence": "0"
                     },
                     "uuid": "30b518c6-e74c-4c85-b7b0-a4cd5ad3c479"
                  }
               ],
               "perms2": {
                  "owner": "cloud-admin",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
               },
               "id_perms": {
                  "enable": true,
                  "uuid": {
                     "uuid_mslong": 5438875082245294000,
                     "uuid_lslong": 10831012131798540000
                  },
                  "created": "2018-01-02T12:51:49.328422",
                  "description": "",
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2018-01-02T12:51:49.328422",
                  "permissions": {
                     "owner": "admin",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "admin",
                     "group_access": 7
                  }
               },
               "fq_name": [
                  "default-policy-management",
                  "sda"
               ],
               "parent_uuid": "85bd1f95-4b6c-4798-bfa3-e599bd267b1d"
            }
         },
         {
            "application-policy-set": {
               "display_name": "default-application-policy-set",
               "uuid": "0602e27c-bbfc-4e89-8496-ed9dd49b880b",
               "href": "http://nodeg4:8082/application-policy-set/0602e27c-bbfc-4e89-8496-ed9dd49b880b",
               "parent_type": "project",
               "name": "default-application-policy-set",
               "perms2": {
                  "owner": "5876ab9a243c4de7b6932d962fd1221f",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
               },
               "id_perms": {
                  "enable": true,
                  "uuid": {
                     "uuid_mslong": 433157539538685600,
                     "uuid_lslong": 9554084921645697000
                  },
                  "created": "2017-12-29T09:19:05.847062",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-12-29T09:19:05.847062",
                  "permissions": {
                     "owner": "contrail-api",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "admin",
                     "group_access": 7
                  }
               },
               "all_applications": true,
               "fq_name": [
                  "default-domain",
                  "services",
                  "default-application-policy-set"
               ],
               "parent_uuid": "5876ab9a-243c-4de7-b693-2d962fd1221f"
            }
         },
         {
            "application-policy-set": {
               "display_name": "default-application-policy-set",
               "uuid": "b57ef9c4-b40e-44a7-a1a4-b1acca0732c4",
               "href": "http://nodeg4:8082/application-policy-set/b57ef9c4-b40e-44a7-a1a4-b1acca0732c4",
               "parent_type": "project",
               "name": "default-application-policy-set",
               "perms2": {
                  "owner": "4eb6ee571f0c40ca9f77e889dfc3244c",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
               },
               "id_perms": {
                  "enable": true,
                  "uuid": {
                     "uuid_mslong": 13078164991160240000,
                     "uuid_lslong": 11647629891968905000
                  },
                  "created": "2017-12-28T21:02:07.129285",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-12-28T21:02:07.129285",
                  "permissions": {
                     "owner": "contrail-api",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "admin",
                     "group_access": 7
                  }
               },
               "all_applications": true,
               "fq_name": [
                  "default-domain",
                  "demo",
                  "default-application-policy-set"
               ],
               "parent_uuid": "4eb6ee57-1f0c-40ca-9f77-e889dfc3244c"
            }
         },
         {
            "application-policy-set": {
               "display_name": "adsfsdf",
               "uuid": "d3f2bf05-bbcd-47f4-96e3-4bcb3f60a086",
               "href": "http://nodeg4:8082/application-policy-set/d3f2bf05-bbcd-47f4-96e3-4bcb3f60a086",
               "parent_type": "policy-management",
               "name": "adsfsdf",
               "firewall_policy_refs": [
                  {
                     "to": [
                        "default-policy-management",
                        "fw3"
                     ],
                     "attr": {
                        "sequence": "0"
                     },
                     "uuid": "5d758573-1004-48e0-9836-032b8a9a27c2"
                  },
                  {
                     "to": [
                        "default-policy-management",
                        "sdfsdf"
                     ],
                     "attr": {
                        "sequence": "1"
                     },
                     "uuid": "50c538bb-a8a4-427a-92b6-e680716c36ba"
                  }
               ],
               "perms2": {
                  "owner": "cloud-admin",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
               },
               "id_perms": {
                  "enable": true,
                  "uuid": {
                     "uuid_mslong": 15272479317713308000,
                     "uuid_lslong": 10872617261716250000
                  },
                  "created": "2018-01-02T11:48:05.998646",
                  "description": "",
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2018-01-02T11:48:05.998646",
                  "permissions": {
                     "owner": "admin",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "admin",
                     "group_access": 7
                  }
               },
               "fq_name": [
                  "default-policy-management",
                  "adsfsdf"
               ],
               "parent_uuid": "85bd1f95-4b6c-4798-bfa3-e599bd267b1d"
            }
         },
         {
            "application-policy-set": {
               "display_name": "default-application-policy-set",
               "uuid": "b3137cc0-8d0a-40e8-9e06-305a7ab6b0e4",
               "href": "http://nodeg4:8082/application-policy-set/b3137cc0-8d0a-40e8-9e06-305a7ab6b0e4",
               "parent_type": "project",
               "name": "default-application-policy-set",
               "perms2": {
                  "owner": "a7c7239056a14e8a95ddf8bead92bc99",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
               },
               "id_perms": {
                  "enable": true,
                  "uuid": {
                     "uuid_mslong": 12903794523788427000,
                     "uuid_lslong": 11386841873016860000
                  },
                  "created": "2017-12-28T06:50:00.441784",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-12-28T06:50:00.441784",
                  "permissions": {
                     "owner": "contrail-api",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "admin",
                     "group_access": 7
                  }
               },
               "fq_name": [
                  "default-domain",
                  "admin",
                  "default-application-policy-set"
               ],
               "all_applications": true,
               "parent_uuid": "a7c72390-56a1-4e8a-95dd-f8bead92bc99"
            }
         },
         {
            "application-policy-set": {
               "display_name": "HrPolicySet",
               "uuid": "e4482b3b-c398-48f4-9f01-22ac12aec80a",
               "href": "http://nodeg4:8082/application-policy-set/e4482b3b-c398-48f4-9f01-22ac12aec80a",
               "parent_type": "policy-management",
               "name": "HrPolicySet",
               "tag_refs": [
                  {
                     "to": [
                        "application=HR"
                     ],
                     "attr": null,
                     "uuid": "bffcedd7-ade0-46bd-88d4-5337bdba6f06"
                  }
               ],
               "firewall_policy_refs": [
                  {
                     "to": [
                        "default-policy-management",
                        "HRPolicy"
                     ],
                     "attr": {
                        "sequence": "0"
                     },
                     "uuid": "c9529552-f28c-41e6-a22a-bbfececceec4"
                  }
               ],
               "perms2": {
                  "owner": "cloud-admin",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
               },
               "id_perms": {
                  "enable": true,
                  "description": "",
                  "creator": null,
                  "created": "2017-12-29T08:45:09.394270",
                  "user_visible": true,
                  "last_modified": "2017-12-29T08:45:09.420396",
                  "permissions": {
                     "owner": "admin",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "admin",
                     "group_access": 7
                  },
                  "uuid": {
                     "uuid_mslong": 16449445174655338000,
                     "uuid_lslong": 11457477049450416000
                  }
               },
               "fq_name": [
                  "default-policy-management",
                  "HrPolicySet"
               ],
               "parent_uuid": "85bd1f95-4b6c-4798-bfa3-e599bd267b1d"
            }
         },
         {
            "application-policy-set": {
               "fq_name": [
                  "default-policy-management",
                  "default-application-policy-set"
               ],
               "uuid": "d5211e18-41f9-4670-94c7-6e323cce0d7b",
               "href": "http://nodeg4:8082/application-policy-set/d5211e18-41f9-4670-94c7-6e323cce0d7b",
               "parent_type": "policy-management",
               "name": "default-application-policy-set",
               "firewall_policy_refs": [
                  {
                     "to": [
                        "default-policy-management",
                        "Default-policy"
                     ],
                     "attr": {
                        "sequence": "0"
                     },
                     "uuid": "af4bb424-2aa9-4162-a8f6-a71b088565f0"
                  }
               ],
               "perms2": {
                  "owner": "cloud-admin",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
               },
               "id_perms": {
                  "enable": true,
                  "description": "",
                  "created": "2017-12-28T06:35:31.764285",
                  "creator": null,
                  "uuid": {
                     "uuid_mslong": 15357589293845006000,
                     "uuid_lslong": 10720658600026313000
                  },
                  "user_visible": true,
                  "last_modified": "2017-12-29T10:23:55.801545",
                  "permissions": {
                     "owner": "cloud-admin",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "cloud-admin-group",
                     "group_access": 7
                  }
               },
               "all_applications": true,
               "global_vrouter_config_refs": [
                  {
                     "to": [
                        "default-global-system-config",
                        "default-global-vrouter-config"
                     ],
                     "attr": null,
                     "uuid": "fc4592d6-c1c1-4936-8b36-93c844363152"
                  }
               ],
               "parent_uuid": "85bd1f95-4b6c-4798-bfa3-e599bd267b1d"
            }
         },
         {
            "application-policy-set": {
               "display_name": "default-application-policy-set",
               "uuid": "a71f7db9-988c-436f-b736-9daa496c0ba2",
               "href": "http://nodeg4:8082/application-policy-set/a71f7db9-988c-436f-b736-9daa496c0ba2",
               "parent_type": "project",
               "name": "default-application-policy-set",
               "perms2": {
                  "owner": "4f2e618deb7b497ba59d1e499ce15f47",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
               },
               "id_perms": {
                  "enable": true,
                  "uuid": {
                     "uuid_mslong": 12042482164693746000,
                     "uuid_lslong": 13201912712385006000
                  },
                  "created": "2017-12-28T21:02:40.540464",
                  "description": null,
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2017-12-28T21:02:40.540464",
                  "permissions": {
                     "owner": "contrail-api",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "admin",
                     "group_access": 7
                  }
               },
               "all_applications": true,
               "fq_name": [
                  "default-domain",
                  "test2",
                  "default-application-policy-set"
               ],
               "parent_uuid": "4f2e618d-eb7b-497b-a59d-1e499ce15f47"
            }
         },
         {
            "application-policy-set": {
               "fq_name": [
                  "default-policy-management",
                  "test105"
               ],
               "uuid": "1303ea4e-7a71-4c9c-8be2-3848c4706538",
               "href": "http://nodeg4:8082/application-policy-set/1303ea4e-7a71-4c9c-8be2-3848c4706538",
               "parent_type": "policy-management",
               "name": "test105",
               "perms2": {
                  "owner": "cloud-admin",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
               },
               "id_perms": {
                  "enable": true,
                  "uuid": {
                     "uuid_mslong": 1370196334433357000,
                     "uuid_lslong": 10079680801193093000
                  },
                  "created": "2018-01-02T10:52:38.862652",
                  "description": "des1",
                  "creator": null,
                  "user_visible": true,
                  "last_modified": "2018-01-02T10:52:38.862652",
                  "permissions": {
                     "owner": "admin",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "admin",
                     "group_access": 7
                  }
               },
               "display_name": "test105",
               "parent_uuid": "85bd1f95-4b6c-4798-bfa3-e599bd267b1d"
            }
         }
      ],
      'expected' : ["af4bb424-2aa9-4162-a8f6-a71b088565f0","c9529552-f28c-41e6-a22a-bbfececceec4","7c8e64fe-4c1b-47bf-af61-cd5bc2b1aeb5","8d06e841-8520-4991-b2eb-33394479cab6"]
    };
    this.getPolicyRuleList = {
      'data' : [
         {
            "firewall-policy": {
               "display_name": "Default-policy",
               "uuid": "af4bb424-2aa9-4162-a8f6-a71b088565f0",
               "href": "http://nodeg4:8082/firewall-policy/af4bb424-2aa9-4162-a8f6-a71b088565f0",
               "parent_type": "policy-management",
               "name": "Default-policy",
               "firewall_rule_refs": [
                  {
                     "to": [
                        "default-policy-management",
                        "6fa2b152-e86d-4ad6-b6b0-2cdbfcb648a1"
                     ],
                     "attr": {
                        "sequence": "0"
                     },
                     "uuid": "6fa2b152-e86d-4ad6-b6b0-2cdbfcb648a1"
                  }
               ],
               "perms2": {
                  "owner": "cloud-admin",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
               },
               "id_perms": {
                  "enable": true,
                  "description": "",
                  "creator": null,
                  "created": "2017-12-29T10:18:34.179405",
                  "user_visible": true,
                  "last_modified": "2017-12-29T10:18:34.285595",
                  "permissions": {
                     "owner": "admin",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "_member_",
                     "group_access": 7
                  },
                  "uuid": {
                     "uuid_mslong": 12631387647318245000,
                     "uuid_lslong": 12175102377191630000
                  }
               },
               "fq_name": [
                  "default-policy-management",
                  "Default-policy"
               ],
               "parent_uuid": "85bd1f95-4b6c-4798-bfa3-e599bd267b1d"
            }
         },
         {
            "firewall-policy": {
               "display_name": "HRDevPolicy",
               "uuid": "8d06e841-8520-4991-b2eb-33394479cab6",
               "href": "http://nodeg4:8082/firewall-policy/8d06e841-8520-4991-b2eb-33394479cab6",
               "parent_type": "project",
               "name": "HRDevPolicy",
               "firewall_rule_refs": [
                  {
                     "to": [
                        "default-domain",
                        "hrdev",
                        "12d2a1f3-7260-4eec-8098-bf13640b2c68"
                     ],
                     "attr": {
                        "sequence": "0"
                     },
                     "uuid": "12d2a1f3-7260-4eec-8098-bf13640b2c68"
                  }
               ],
               "perms2": {
                  "owner": "2f7ec7abedbb44fa846410fb7da15364",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
               },
               "id_perms": {
                  "enable": true,
                  "description": "",
                  "creator": null,
                  "created": "2017-12-29T08:52:34.824576",
                  "user_visible": true,
                  "last_modified": "2017-12-29T08:52:34.917588",
                  "permissions": {
                     "owner": "admin",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "_member_",
                     "group_access": 7
                  },
                  "uuid": {
                     "uuid_mslong": 10162064977312106000,
                     "uuid_lslong": 12892454679333160000
                  }
               },
               "fq_name": [
                  "default-domain",
                  "hrdev",
                  "HRDevPolicy"
               ],
               "parent_uuid": "2f7ec7ab-edbb-44fa-8464-10fb7da15364"
            }
         },
         {
            "firewall-policy": {
               "display_name": "Dev-default-policy",
               "uuid": "7c8e64fe-4c1b-47bf-af61-cd5bc2b1aeb5",
               "href": "http://nodeg4:8082/firewall-policy/7c8e64fe-4c1b-47bf-af61-cd5bc2b1aeb5",
               "parent_type": "project",
               "name": "Dev-default-policy",
               "firewall_rule_refs": [
                  {
                     "to": [
                        "default-domain",
                        "hrdev",
                        "451be384-ae38-4412-97db-e797638398f7"
                     ],
                     "attr": {
                        "sequence": "0"
                     },
                     "uuid": "451be384-ae38-4412-97db-e797638398f7"
                  }
               ],
               "perms2": {
                  "owner": "2f7ec7abedbb44fa846410fb7da15364",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
               },
               "id_perms": {
                  "enable": true,
                  "description": "",
                  "creator": null,
                  "created": "2017-12-29T10:20:10.181676",
                  "user_visible": true,
                  "last_modified": "2017-12-29T10:20:10.290424",
                  "permissions": {
                     "owner": "admin",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "_member_",
                     "group_access": 7
                  },
                  "uuid": {
                     "uuid_mslong": 8975222150757304000,
                     "uuid_lslong": 12637607823370465000
                  }
               },
               "fq_name": [
                  "default-domain",
                  "hrdev",
                  "Dev-default-policy"
               ],
               "parent_uuid": "2f7ec7ab-edbb-44fa-8464-10fb7da15364"
            }
         },
         {
            "firewall-policy": {
               "display_name": "HRPolicy",
               "uuid": "c9529552-f28c-41e6-a22a-bbfececceec4",
               "href": "http://nodeg4:8082/firewall-policy/c9529552-f28c-41e6-a22a-bbfececceec4",
               "parent_type": "policy-management",
               "name": "HRPolicy",
               "firewall_rule_refs": [
                  {
                     "to": [
                        "default-policy-management",
                        "7ce6a34e-1af4-4dd8-9aaf-9f9c0350a2de"
                     ],
                     "attr": {
                        "sequence": "0"
                     },
                     "uuid": "7ce6a34e-1af4-4dd8-9aaf-9f9c0350a2de"
                  },
                  {
                     "to": [
                        "default-policy-management",
                        "ca2c348e-be34-431c-83e4-a8b4db58a0cb"
                     ],
                     "attr": {
                        "sequence": "1"
                     },
                     "uuid": "ca2c348e-be34-431c-83e4-a8b4db58a0cb"
                  }
               ],
               "perms2": {
                  "owner": "cloud-admin",
                  "owner_access": 7,
                  "global_access": 0,
                  "share": []
               },
               "id_perms": {
                  "enable": true,
                  "description": "",
                  "creator": null,
                  "created": "2017-12-29T08:45:09.175156",
                  "user_visible": true,
                  "last_modified": "2017-12-29T08:45:09.320551",
                  "permissions": {
                     "owner": "admin",
                     "owner_access": 7,
                     "other_access": 7,
                     "group": "admin",
                     "group_access": 7
                  },
                  "uuid": {
                     "uuid_mslong": 14506821533202924000,
                     "uuid_lslong": 11685358886231798000
                  }
               },
               "fq_name": [
                  "default-policy-management",
                  "HRPolicy"
               ],
               "parent_uuid": "85bd1f95-4b6c-4798-bfa3-e599bd267b1d"
            }
         }
      ],
      'expected' : [
        "6fa2b152-e86d-4ad6-b6b0-2cdbfcb648a1",
        "7ce6a34e-1af4-4dd8-9aaf-9f9c0350a2de",
        "ca2c348e-be34-431c-83e4-a8b4db58a0cb",
        "451be384-ae38-4412-97db-e797638398f7",
        "12d2a1f3-7260-4eec-8098-bf13640b2c68"
      ]
    };
    return {
        tgSettingsMockData : tgSettingsMockData,
        epsClientMockData : epsClientMockData,
        epsServerMockData : epsServerMockData,
        tgConfigData : tgConfigData,
        parseHierarchyConfigData : parseHierarchyConfigData,
        getLinkDirectionData : getLinkDirectionData,
        getAppAPSData : getAppAPSData,
        getPolicyRuleList : getPolicyRuleList
    };
});
