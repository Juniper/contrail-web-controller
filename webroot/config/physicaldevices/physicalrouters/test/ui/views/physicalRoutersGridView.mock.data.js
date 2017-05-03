/*
 * Copyright (c) 2015 Junper Networks, Inc. All rights reserved.
 */

 define(['underscore'], function(_){
     this.physcalRoutersMockData = [
  {
    "physical-router": {
      "physical_router_vendor_name": "myvendor",
      "parent_uuid": "d69192ae-01ae-4f59-92d6-5fc690cc7a33",
      "parent_href": "http://10.204.216.40:9100/global-system-config/d69192ae-01ae-4f59-92d6-5fc690cc7a33",
      "parent_type": "global-system-config",
      "href": "http://10.204.216.40:9100/physical-router/a76f35a4-3edf-4cde-8dc8-f3cc28b48ded",
      "id_perms": {
        "enable": true,
        "uuid": {
          "uuid_mslong": 12064920906294580000,
          "uuid_lslong": 10216683812871770000
        },
        "created": "2015-11-19T06:58:52.322756",
        "description": null,
        "creator": null,
        "user_visible": true,
        "last_modified": "2015-11-19T06:58:52.322756",
        "permissions": {
          "owner": "admin",
          "owner_access": 7,
          "other_access": 7,
          "group": "KeystoneAdmin",
          "group_access": 7
        }
      },
      "display_name": "pr1",
      "physical_router_dataplane_ip": "13.13.13.13",
      "physical_router_loopback_ip": "11.11.11.11",
      "uuid": "a76f35a4-3edf-4cde-8dc8-f3cc28b48ded",
      "physical_router_management_ip": "12.12.12.12",
      "fq_name": [
        "default-global-system-config",
        "pr1"
      ],
      "name": "pr1",
      "physical_router_snmp_credentials": {
        "v3_privacy_protocol": "xyz",
        "retries": 34,
        "v3_authentication_password": "abc",
        "v3_engine_time": 9,
        "v3_engine_id": "aqwd",
        "local_port": 12,
        "v3_security_name": "mysecurityname",
        "v3_context": "ghi",
        "v3_security_level": "authpriv",
        "v3_authentication_protocol": "abc",
        "v3_security_engine_id": "def",
        "v3_context_engine_id": "jkl",
        "version": 3,
        "timeout": 56,
        "v3_privacy_password": "xyz",
        "v3_engine_boots": 78
      },
      "physical_router_product_name": "mymodel",
      "virtual_router_refs": [
        {
          "fq_name": [
            "default-global-system-config",
            "pr1_tsn1"
          ],
          "name": "pr1_tsn1",
          "parent_uuid": "d69192ae-01ae-4f59-92d6-5fc690cc7a33",
          "virtual_router_type": "tor-service-node",
          "parent_href": "http://10.204.216.40:9100/global-system-config/d69192ae-01ae-4f59-92d6-5fc690cc7a33",
          "parent_type": "global-system-config",
          "perms2": {
            "owner": "55cb150cba884e939468515edb63e50b",
            "owner_access": 7,
            "global_access": 0,
            "share": []
          },
          "href": "http://10.204.216.40:9100/virtual-router/3c6f6bce-e61d-4dad-aa8e-d080b0235d91",
          "id_perms": {
            "enable": true,
            "uuid": {
              "uuid_mslong": 4354817901058674000,
              "uuid_lslong": 12289989684270162000
            },
            "created": "2015-11-19T06:58:52.285103",
            "description": null,
            "creator": null,
            "user_visible": true,
            "last_modified": "2015-11-19T06:58:52.285103",
            "permissions": {
              "owner": "admin",
              "owner_access": 7,
              "other_access": 7,
              "group": "KeystoneAdmin",
              "group_access": 7
            }
          },
          "display_name": "pr1_tsn1",
          "uuid": "3c6f6bce-e61d-4dad-aa8e-d080b0235d91"
        },
        {
          "fq_name": [
            "default-global-system-config",
            "pr1_agent1"
          ],
          "name": "pr1_agent1",
          "parent_uuid": "d69192ae-01ae-4f59-92d6-5fc690cc7a33",
          "virtual_router_type": "tor-agent",
          "parent_href": "http://10.204.216.40:9100/global-system-config/d69192ae-01ae-4f59-92d6-5fc690cc7a33",
          "parent_type": "global-system-config",
          "perms2": {
            "owner": "55cb150cba884e939468515edb63e50b",
            "owner_access": 7,
            "global_access": 0,
            "share": []
          },
          "href": "http://10.204.216.40:9100/virtual-router/bd1d1769-8390-4290-95df-c7de05f27b06",
          "id_perms": {
            "enable": true,
            "uuid": {
              "uuid_mslong": 13627073789439263000,
              "uuid_lslong": 10799570187854182000
            },
            "created": "2015-11-19T06:58:52.282914",
            "description": null,
            "creator": null,
            "user_visible": true,
            "last_modified": "2015-11-19T06:58:52.282914",
            "permissions": {
              "owner": "admin",
              "owner_access": 7,
              "other_access": 7,
              "group": "KeystoneAdmin",
              "group_access": 7
            }
          },
          "display_name": "pr1_agent1",
          "uuid": "bd1d1769-8390-4290-95df-c7de05f27b06"
        }
      ],
      "perms2": {
        "owner": "55cb150cba884e939468515edb63e50b",
        "owner_access": 7,
        "global_access": 0,
        "share": []
      },
      "totalIntfCount": 2
    }
  }
];
return {physcalRoutersMockData : physcalRoutersMockData};
 });
