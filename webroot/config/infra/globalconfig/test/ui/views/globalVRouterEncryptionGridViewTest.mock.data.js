/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define(
		[ 'underscore' ],
		function(_) {
			this.vrouterConfigDetails = [
				  {
					    "global-vrouter-configs": [
					      {
					        "global-vrouter-config": {
					          "flow_aging_timeout_list": {
					            "flow_aging_timeout": [
					              {
					                "timeout_in_seconds": 180,
					                "protocol": "tcp",
					                "port": 0
					              }
					            ]
					          },
					          "fq_name": [
					            "default-global-system-config",
					            "default-global-vrouter-config"
					          ],
					          "uuid": "8370606a-f4be-48d1-b91e-fd872766e657",
					          "href": "http://10.84.25.17:8082/global-vrouter-config/8370606a-f4be-48d1-b91e-fd872766e657",
					          "parent_type": "global-system-config",
					          "encryption_mode": "all",
					          "linklocal_services": {
					            "linklocal_service_entry": [
					              {
					                "linklocal_service_name": "metadata",
					                "ip_fabric_service_ip": [
					                  "20.20.20.17"
					                ],
					                "linklocal_service_ip": "169.254.169.254",
					                "ip_fabric_service_port": 8775,
					                "ip_fabric_DNS_service_name": "",
					                "linklocal_service_port": 80
					              }
					            ]
					          },
					          "name": "default-global-vrouter-config",
					          "encapsulation_priorities": {
					            "encapsulation": [
					              "MPLSoUDP",
					              "MPLSoGRE",
					              "VXLAN"
					            ]
					          },
					          "perms2": {
					            "owner": "cloud-admin",
					            "owner_access": 7,
					            "global_access": 0,
					            "share": []
					          },
					          "id_perms": {
					            "enable": true,
					            "uuid": {
					              "uuid_mslong": 9471176028849064000,
					              "uuid_lslong": 13339377903241456000
					            },
					            "created": "2017-12-19T08:41:57.650712",
					            "description": null,
					            "creator": null,
					            "user_visible": true,
					            "last_modified": "2018-02-22T07:16:09.981627",
					            "permissions": {
					              "owner": "cloud-admin",
					              "owner_access": 7,
					              "other_access": 7,
					              "group": "cloud-admin-group",
					              "group_access": 7
					            }
					          },
					          "encryption_tunnel_endpoints": {
					            "endpoint": [
					              {
					                "tunnel_remote_ip_address": "20.20.20.19"
					              },
					              {
					                "tunnel_remote_ip_address": "10.10.10.11"
					              },
					              {
					                "tunnel_remote_ip_address": "20.20.20.18"
					              }
					            ]
					          },
					          "vxlan_network_identifier_mode": "automatic",
					          "enable_security_logging": true,
					          "parent_uuid": "55815a3f-2127-45b1-a7ff-4ff5577786b0"
					        }
					      }
					    ]
					  }
					];

			this.vroutersDetailMockData = {
					  "virtual-routers": [
						    {
						      "virtual-router": {
						        "display_name": "b5s18",
						        "uuid": "9917ccdc-ace8-4536-8cc0-808aae6775a7",
						        "name": "b5s18",
						        "virtual_router_dpdk_enabled": false,
						        "parent_type": "global-system-config",
						        "href": "http://10.84.25.17:8082/virtual-router/9917ccdc-ace8-4536-8cc0-808aae6775a7",
						        "perms2": {
						          "owner": "cloud-admin",
						          "owner_access": 7,
						          "global_access": 0,
						          "share": []
						        },
						        "virtual_machine_refs": [
						          {
						            "to": [
						              "default-domain__admin__f2a9d810-466d-482e-9ec7-8a32d04a1c0f__1"
						            ],
						            "attr": null,
						            "uuid": "f6202f8c-f419-471c-bf4d-1c58adda6ad4"
						          }
						        ],
						        "id_perms": {
						          "enable": true,
						          "uuid": {
						            "uuid_mslong": 11031511060433095000,
						            "uuid_lslong": 10142247693958216000
						          },
						          "creator": null,
						          "created": "2017-12-19T08:50:17.980871",
						          "user_visible": true,
						          "last_modified": "2018-02-22T06:35:50.621293",
						          "permissions": {
						            "owner": "cloud-admin",
						            "owner_access": 7,
						            "other_access": 7,
						            "group": "admin",
						            "group_access": 7
						          },
						          "description": null
						        },
						        "fq_name": [
						          "default-global-system-config",
						          "b5s18"
						        ],
						        "virtual_router_ip_address": "20.20.20.18",
						        "parent_uuid": "55815a3f-2127-45b1-a7ff-4ff5577786b0"
						      }
						    },
						    {
						      "virtual-router": {
						        "fq_name": [
						          "default-global-system-config",
						          "b5s20"
						        ],
						        "uuid": "edf7e6f4-a814-4c19-9e28-715695716c57",
						        "name": "b5s20",
						        "virtual_router_dpdk_enabled": false,
						        "parent_type": "global-system-config",
						        "href": "http://10.84.25.17:8082/virtual-router/edf7e6f4-a814-4c19-9e28-715695716c57",
						        "perms2": {
						          "owner": "cloud-admin",
						          "owner_access": 7,
						          "global_access": 0,
						          "share": []
						        },
						        "id_perms": {
						          "enable": true,
						          "uuid": {
						            "uuid_mslong": 17147428044702765000,
						            "uuid_lslong": 11396483473749406000
						          },
						          "created": "2017-12-19T08:50:17.289506",
						          "description": null,
						          "creator": null,
						          "user_visible": true,
						          "last_modified": "2018-02-22T06:22:42.265169",
						          "permissions": {
						            "owner": "cloud-admin",
						            "owner_access": 7,
						            "other_access": 7,
						            "group": "admin",
						            "group_access": 7
						          }
						        },
						        "display_name": "b5s20",
						        "virtual_router_ip_address": "20.20.20.20",
						        "parent_uuid": "55815a3f-2127-45b1-a7ff-4ff5577786b0"
						      }
						    },
						    {
						      "virtual-router": {
						        "fq_name": [
						          "default-global-system-config",
						          "b5s19"
						        ],
						        "uuid": "d151742f-0833-4fc9-84a7-374074563749",
						        "name": "b5s19",
						        "virtual_router_dpdk_enabled": false,
						        "parent_type": "global-system-config",
						        "href": "http://10.84.25.17:8082/virtual-router/d151742f-0833-4fc9-84a7-374074563749",
						        "perms2": {
						          "owner": "cloud-admin",
						          "owner_access": 7,
						          "global_access": 0,
						          "share": []
						        },
						        "virtual_machine_refs": [
						          {
						            "to": [
						              "default-domain__admin__f2a9d810-466d-482e-9ec7-8a32d04a1c0f__2"
						            ],
						            "attr": null,
						            "uuid": "fed04f20-9417-4dd5-83af-0b3e1e860251"
						          }
						        ],
						        "id_perms": {
						          "enable": true,
						          "description": null,
						          "creator": null,
						          "created": "2017-12-19T08:50:18.664219",
						          "user_visible": true,
						          "last_modified": "2018-02-22T06:35:50.667754",
						          "permissions": {
						            "owner": "cloud-admin",
						            "owner_access": 7,
						            "other_access": 7,
						            "group": "admin",
						            "group_access": 7
						          },
						          "uuid": {
						            "uuid_mslong": 15082964372390367000,
						            "uuid_lslong": 9558669484086410000
						          }
						        },
						        "display_name": "b5s19",
						        "virtual_router_ip_address": "20.20.20.19",
						        "parent_uuid": "55815a3f-2127-45b1-a7ff-4ff5577786b0"
						      }
						    },
						    {
						      "virtual-router": {
						        "fq_name": [
						          "default-global-system-config",
						          "b5s26"
						        ],
						        "uuid": "d497e56f-ecfb-4e71-ad01-58472dc30ae4",
						        "name": "b5s26",
						        "virtual_router_dpdk_enabled": false,
						        "parent_type": "global-system-config",
						        "href": "http://10.84.25.17:8082/virtual-router/d497e56f-ecfb-4e71-ad01-58472dc30ae4",
						        "perms2": {
						          "owner": "cloud-admin",
						          "owner_access": 7,
						          "global_access": 0,
						          "share": []
						        },
						        "id_perms": {
						          "enable": true,
						          "uuid": {
						            "uuid_mslong": 15318964926404055000,
						            "uuid_lslong": 12466342306271922000
						          },
						          "created": "2017-12-19T08:50:19.364158",
						          "description": null,
						          "creator": null,
						          "user_visible": true,
						          "last_modified": "2017-12-19T08:50:19.364158",
						          "permissions": {
						            "owner": "cloud-admin",
						            "owner_access": 7,
						            "other_access": 7,
						            "group": "admin",
						            "group_access": 7
						          }
						        },
						        "display_name": "b5s26",
						        "virtual_router_ip_address": "20.20.20.26",
						        "parent_uuid": "55815a3f-2127-45b1-a7ff-4ff5577786b0"
						      }
						    }
						  ]
						};
			return {
				vrouterConfigDetails : vrouterConfigDetails,
				vroutersDetailMockData : vroutersDetailMockData
			};
		});