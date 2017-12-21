/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore'], function(_){
     this.bgpMockData = [
         {
           "bgp-router": {
             "fq_name": [
               "default-domain",
               "default-project",
               "ip-fabric",
               "__default__",
               "nodea2"
             ],
             "name": "nodea2",
             "parent_uuid": "a20aa20f-8088-40b1-9d81-b6f22f6ebf86",
             "parent_href": "http://10.204.216.40:9100/routing-instance/a20aa20f-8088-40b1-9d81-b6f22f6ebf86",
             "parent_type": "routing-instance",
             "bgp_router_parameters": {
               "vendor": "contrail",
               "admin_down": false,
               "port": 179,
               "local_autonomous_system": null,
               "auth_data": null,
               "address": "10.204.216.40",
               "router_type": null,
               "identifier": "10.204.216.40",
               "hold_time": 90,
               "autonomous_system": 64512,
               "address_families": {
                 "family": [
                   "route-target",
                   "inet-vpn",
                   "e-vpn",
                   "erm-vpn",
                   "inet6-vpn"
                 ]
               }
             },
             "perms2": {
               "owner": "e9a7b1af07c147889169045c5f2caafb",
               "owner_access": 7,
               "global_access": 0,
               "share": []
             },
             "href": "http://10.204.216.40:9100/bgp-router/a6e0447a-ceb9-42fa-bf03-179ca3ead9e0",
             "id_perms": {
               "enable": true,
               "description": null,
               "created": "2015-11-20T10:12:23.725617",
               "creator": null,
               "uuid": {
                 "uuid_mslong": 12024686299324170000,
                 "uuid_lslong": 13763870847706782000
               },
               "user_visible": true,
               "last_modified": "2015-11-20T10:15:29.330528",
               "permissions": {
                 "owner": "admin",
                 "owner_access": 7,
                 "other_access": 7,
                 "group": "KeystoneServiceAdmin",
                 "group_access": 7
               }
             },
             "display_name": "nodea2",
             "uuid": "a6e0447a-ceb9-42fa-bf03-179ca3ead9e0"
           }
         }
       ];

     this.globalASNMockData = {
             "global-system-config": {
                 "_type": "global-system-config",
                 "uuid": "74c9a85b-bf52-4796-86a1-e9f1b281b523",
                 "autonomous_system": 64510
               }
             };

     this.prMockData = {
             "physical-routers":
                 [{
                     "href": "http://nodeg4:8082/physical-router/3405d201-2c8a-4042-820b-d5491228032c",
                     "fq_name": [
                       "default-global-system-config",
                       "pr1"
                     ],
                     "uuid": "3405d201-2c8a-4042-820b-d5491228032c"
                 }]};

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
                                        "uuid": "cd36c33f-93d0-4bc0-a585-e737c3814790"
                                      }
                                    ],
                                    "tag_type_name": "tier",
                                    "fq_name": [
                                      "default-domain",
                                      "admin",
                                      "tier=tier1"
                                    ],
                                    "uuid": "aa73b303-49a6-4037-9a8c-1fb0c20039fd",
                                    "name": "tier=tier1",
                                    "href": "http://nodeg4:8082/tag/aa73b303-49a6-4037-9a8c-1fb0c20039fd",
                                    "parent_type": "project",
                                    "tag_id": "0x00020000",
                                    "tag_value": "tier1",
                                    "perms2": {
                                      "owner": "6cf81900c5af4e07afd66e11e768e00b",
                                      "owner_access": 7,
                                      "global_access": 0,
                                      "share": []
                                    },
                                    "id_perms": {
                                      "enable": true,
                                      "uuid": {
                                        "uuid_mslong": 12282357435471380000,
                                        "uuid_lslong": 11136310822609893000
                                      },
                                      "created": "2017-11-07T06:22:03.685695",
                                      "description": null,
                                      "creator": null,
                                      "user_visible": true,
                                      "last_modified": "2017-11-07T06:22:03.685695",
                                      "permissions": {
                                        "owner": "admin",
                                        "owner_access": 7,
                                        "other_access": 7,
                                        "group": "admin",
                                        "group_access": 7
                                      }
                                    },
                                    "display_name": "tier=tier1",
                                    "parent_uuid": "6cf81900-c5af-4e07-afd6-6e11e768e00b"
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
                                        "uuid": "3568fbfe-5a3c-4e88-ba7b-d93e8dd7f320"
                                      }
                                    ],
                                    "tag_type_name": "application",
                                    "display_name": "application=hr",
                                    "uuid": "e796c554-bfa2-4149-939c-14a59df79b0b",
                                    "name": "application=hr",
                                    "href": "http://nodeg4:8082/tag/e796c554-bfa2-4149-939c-14a59df79b0b",
                                    "parent_type": "project",
                                    "tag_id": "0x00010001",
                                    "tag_value": "hr",
                                    "perms2": {
                                      "owner": "667c13b6206b4645a5653f2656d55a23",
                                      "owner_access": 7,
                                      "global_access": 0,
                                      "share": []
                                    },
                                    "id_perms": {
                                      "enable": true,
                                      "uuid": {
                                        "uuid_mslong": 16687742437050958000,
                                        "uuid_lslong": 10636399121494678000
                                      },
                                      "created": "2017-11-07T06:27:46.851937",
                                      "description": null,
                                      "creator": null,
                                      "user_visible": true,
                                      "last_modified": "2017-11-07T06:27:46.851937",
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
                                      "test1",
                                      "application=hr"
                                    ],
                                    "parent_uuid": "667c13b6-206b-4645-a565-3f2656d55a23"
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
                                        "uuid": "3568fbfe-5a3c-4e88-ba7b-d93e8dd7f320"
                                      }
                                    ],
                                    "tag_type_name": "application",
                                    "fq_name": [
                                      "default-domain",
                                      "admin",
                                      "application=sales"
                                    ],
                                    "uuid": "4a5db6ae-e4c5-4e7a-a89c-461b4e68426f",
                                    "name": "application=sales",
                                    "href": "http://nodeg4:8082/tag/4a5db6ae-e4c5-4e7a-a89c-461b4e68426f",
                                    "parent_type": "project",
                                    "tag_id": "0x00010003",
                                    "tag_value": "sales",
                                    "perms2": {
                                      "owner": "6cf81900c5af4e07afd66e11e768e00b",
                                      "owner_access": 7,
                                      "global_access": 0,
                                      "share": []
                                    },
                                    "id_perms": {
                                      "enable": true,
                                      "uuid": {
                                        "uuid_mslong": 5358639993919459000,
                                        "uuid_lslong": 12149662977832272000
                                      },
                                      "created": "2017-11-07T12:50:29.524832",
                                      "description": null,
                                      "creator": null,
                                      "user_visible": true,
                                      "last_modified": "2017-11-07T12:50:29.524832",
                                      "permissions": {
                                        "owner": "admin",
                                        "owner_access": 7,
                                        "other_access": 7,
                                        "group": "admin",
                                        "group_access": 7
                                      }
                                    },
                                    "display_name": "application=sales",
                                    "parent_uuid": "6cf81900-c5af-4e07-afd6-6e11e768e00b"
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
                                        "uuid": "3568fbfe-5a3c-4e88-ba7b-d93e8dd7f320"
                                      }
                                    ],
                                    "tag_type_name": "application",
                                    "fq_name": [
                                      "default-domain",
                                      "admin",
                                      "application=hr"
                                    ],
                                    "uuid": "b8fc34e2-be8c-401c-b82f-47ae8a7212df",
                                    "name": "application=hr",
                                    "href": "http://nodeg4:8082/tag/b8fc34e2-be8c-401c-b82f-47ae8a7212df",
                                    "parent_type": "project",
                                    "tag_id": "0x00010000",
                                    "tag_value": "hr",
                                    "perms2": {
                                      "owner": "6cf81900c5af4e07afd66e11e768e00b",
                                      "owner_access": 7,
                                      "global_access": 0,
                                      "share": []
                                    },
                                    "id_perms": {
                                      "enable": true,
                                      "uuid": {
                                        "uuid_mslong": 13329587145573941000,
                                        "uuid_lslong": 13271905441856754000
                                      },
                                      "created": "2017-11-07T12:34:19.472355",
                                      "description": null,
                                      "creator": null,
                                      "user_visible": true,
                                      "last_modified": "2017-11-07T12:34:19.472355",
                                      "permissions": {
                                        "owner": "admin",
                                        "owner_access": 7,
                                        "other_access": 7,
                                        "group": "admin",
                                        "group_access": 7
                                      }
                                    },
                                    "display_name": "application=hr",
                                    "parent_uuid": "6cf81900-c5af-4e07-afd6-6e11e768e00b"
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
                                        "uuid": "3568fbfe-5a3c-4e88-ba7b-d93e8dd7f320"
                                      }
                                    ],
                                    "tag_type_name": "application",
                                    "display_name": "application=sales",
                                    "uuid": "5a8fc768-c3d5-4510-aed6-14fbfa992f6d",
                                    "href": "http://nodeg4:8082/tag/5a8fc768-c3d5-4510-aed6-14fbfa992f6d",
                                    "tag_id": "0x00010004",
                                    "tag_value": "sales",
                                    "perms2": {
                                      "owner": "6cf81900c5af4e07afd66e11e768e00b",
                                      "owner_access": 7,
                                      "global_access": 0,
                                      "share": []
                                    },
                                    "id_perms": {
                                      "enable": true,
                                      "uuid": {
                                        "uuid_mslong": 6525653637859198000,
                                        "uuid_lslong": 12598280080089231000
                                      },
                                      "created": "2017-11-07T12:51:17.344676",
                                      "description": null,
                                      "creator": null,
                                      "user_visible": true,
                                      "last_modified": "2017-11-07T12:51:17.344676",
                                      "permissions": {
                                        "owner": "cloud-admin",
                                        "owner_access": 7,
                                        "other_access": 7,
                                        "group": "cloud-admin-group",
                                        "group_access": 7
                                      }
                                    },
                                    "fq_name": [
                                      "application=sales"
                                    ],
                                    "name": "application=sales"
                                  }
                                }
                              ]
                            }
                          ];
       this.bgpModalMockCNInput = {
              "name": "cn1",
              "bgp_router_params_address": "1.1.1.1",
              "bgp_router_params_router_type": "control-node",
              "bgp_router_params_vendor": "contrail"
       };
       this.bgpModalMockOutput = {
               "content": {
                   "prouter-params": {
                       "newProuter": "none"
                   },
                   "bgp-router": {
                       "name": "cn1",
                       "display_name": "cn1",
                       "fq_name": ["default-domain", "default-project", "ip-fabric", "__default__", "cn1"],
                       "parent_type": "routing-instance",
                       "bgp_router_parameters": {
                           "router_type": "control-node",
                           "vendor": "contrail",
                           "port": 179,
                           "address": "1.1.1.1",
                           "identifier": "1.1.1.1",
                           "hold_time": 90,
                           "admin_down": false,
                           "autonomous_system": 64510,
                           "local_autonomous_system": null,
                           "address_families": {
                               "family": ["route-target", "inet-vpn", "inet6-vpn", "e-vpn", "erm-vpn"]
                           },
                           "auth_data": null
                       },
                       "perms2": {
                           "owner_access": 7,
                           "global_access": 0,
                           "share": []
                       },
                       "tag_refs": [],
                       "bgp_router_refs": []
                   }
               }
           };
       return { bgpMockData : bgpMockData,
                globalASNMockData: globalASNMockData,
                prMockData: prMockData,
                tagsMockData: tagsMockData,
                bgpModalMockCNInput: bgpModalMockCNInput,
                bgpModalMockOutput: bgpModalMockOutput};
 });