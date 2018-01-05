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
    this.tgSettings = {
       "groupByTagType":"app,deployment",
       "subGroupByTagType":"tier",
       "filterByEndpoints":[],
       "time_range":"3600",
       "from_time":"null",
       "to_time":"null"
    };
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
    return {
        tgSettingsMockData : tgSettingsMockData,
        epsClientMockData : epsClientMockData,
        epsServerMockData : epsServerMockData,
        tgConfigData : tgConfigData,
        parseHierarchyConfigData : parseHierarchyConfigData,
        tgSettings : tgSettings,
        getLinkDirectionData : getLinkDirectionData
    };
});
