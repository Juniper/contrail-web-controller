/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore'], function(_){
     this.svcInstDomainsData = {
         "domains": [
           {
             "fq_name": [
               "default-domain"
             ],
             "uuid": "f1f5fd91-8016-4f0f-a0f3-b67e779f1d08"
           }
         ]
     };
     this.svcInstPojectsData = {
             "projects": [
               {
                 "uuid": "36bb47ab-3969-4669-b8e1-b1f5b70f86f1",
                 "fq_name": [
                   "default-domain",
                   "admin"
                 ]
               },
               {
                 "uuid": "4bd4121b-5d0a-4994-b424-7d7e3656a75b",
                 "fq_name": [
                   "default-domain",
                   "services"
                 ]
               },
               {
                   "uuid": "9beafc3c-0ff2-490a-86b7-5a81ca6c7a68",
                   "fq_name": [
                     "default-domain",
                     "project1"
                   ]
               }
             ]
     };
     this.svcProjectRole = null;
     this.svcInstanceMockData = {
             "aggSIData": [
                 {
                   "service-instance": {
                     "port_tuples": [
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "new Instance",
                           "new Instance-port-tuple0-b3d907c9-6f5f-43ce-a091-7fe11ba351af"
                         ],
                         "uuid": "bc5447b2-f5e4-4250-a788-f0452d5d9a32",
                         "vmis": [
                           {
                             "virtual-machine-interface": {
                               "fq_name": [
                                 "default-domain",
                                 "admin",
                                 "port2"
                               ],
                               "uuid": "353fccd6-e14c-465c-86d9-16c0ab27c472"
                             },
                             "virtual_machine_refs": []
                           },
                           {
                             "virtual-machine-interface": {
                               "fq_name": [
                                 "default-domain",
                                 "admin",
                                 "port3"
                               ],
                               "uuid": "fedb6214-72ba-4fec-88fb-3d9e5de01e10"
                             },
                             "virtual_machine_refs": []
                           },
                           {
                             "virtual-machine-interface": {
                               "fq_name": [
                                 "default-domain",
                                 "admin",
                                 "port1"
                               ],
                               "uuid": "6e736ff3-542c-427f-9ab1-092df885ac4a"
                             },
                             "virtual_machine_refs": []
                           }
                         ]
                       }
                     ],
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "new Instance"
                     ],
                     "uuid": "43f2c444-8ad6-4e61-bdd8-e4f9b243fc9d",
                     "href": "http://nodeg4:8082/service-instance/43f2c444-8ad6-4e61-bdd8-e4f9b243fc9d",
                     "service_instance_properties": {
                       "management_virtual_network": "default-domain:admin:vn2",
                       "right_virtual_network": "default-domain:admin:vn2",
                       "interface_list": [
                         {
                           "virtual_network": "default-domain:admin:vn2"
                         },
                         {
                           "virtual_network": "default-domain:admin:vn2"
                         },
                         {
                           "virtual_network": "default-domain:admin:vn2"
                         }
                       ],
                       "left_virtual_network": "default-domain:admin:vn2"
                     },
                     "parent_type": "project",
                     "name": "new Instance",
                     "perms2": {
                       "owner": "6cf81900c5af4e07afd66e11e768e00b",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "instance_ip_refs": [
                       {
                         "to": [
                           "43f2c444-8ad6-4e61-bdd8-e4f9b243fc9d-right-v6"
                         ],
                         "attr": {
                           "interface_type": "right"
                         },
                         "uuid": "ae7cde7f-f5e0-4793-8848-8fae2c425c86"
                       },
                       {
                         "to": [
                           "43f2c444-8ad6-4e61-bdd8-e4f9b243fc9d-left-v6"
                         ],
                         "attr": {
                           "interface_type": "left"
                         },
                         "uuid": "deb58dec-19cc-49ff-b2b0-fcdec7582cc6"
                       },
                       {
                         "to": [
                           "43f2c444-8ad6-4e61-bdd8-e4f9b243fc9d-left-v4"
                         ],
                         "attr": {
                           "interface_type": "left"
                         },
                         "uuid": "0388e9b2-ec38-4ce4-8035-12aaa242db8b"
                       },
                       {
                         "to": [
                           "43f2c444-8ad6-4e61-bdd8-e4f9b243fc9d-right-v4"
                         ],
                         "attr": {
                           "interface_type": "right"
                         },
                         "uuid": "743ddb31-77dc-4af5-b2fc-41a6dbf152f1"
                       },
                       {
                         "to": [
                           "43f2c444-8ad6-4e61-bdd8-e4f9b243fc9d-management-v6"
                         ],
                         "attr": {
                           "interface_type": "management"
                         },
                         "uuid": "0227f992-3e92-41a6-a7d2-458a5fc352a4"
                       },
                       {
                         "to": [
                           "43f2c444-8ad6-4e61-bdd8-e4f9b243fc9d-management-v4"
                         ],
                         "attr": {
                           "interface_type": "management"
                         },
                         "uuid": "94117fad-fb2e-462e-8913-719895508a6b"
                       }
                     ],
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 4896191543571272000,
                         "uuid_lslong": 13679935629226672000
                       },
                       "creator": null,
                       "created": "2017-11-15T13:33:30.099528",
                       "user_visible": true,
                       "last_modified": "2017-11-15T13:33:31.234309",
                       "permissions": {
                         "owner": "admin",
                         "owner_access": 7,
                         "other_access": 7,
                         "group": "admin",
                         "group_access": 7
                       },
                       "description": null
                     },
                     "display_name": "new Instance",
                     "service_template_refs": [
                       {
                         "to": [
                           "default-domain",
                           "new Tem"
                         ],
                         "attr": null,
                         "uuid": "253818d9-bddb-46bb-8e82-e8f8a4088606"
                       }
                     ],
                     "service_health_check_back_refs": [
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "bfd_shc1"
                         ],
                         "attr": {
                           "interface_type": "management"
                         },
                         "uuid": "23e89df5-f54e-4d23-ad9b-c0272324646f"
                       }
                     ],
                     "parent_uuid": "6cf81900-c5af-4e07-afd6-6e11e768e00b",
                     "tempVMStatus": "Inactive"
                   }
                 }
               ],
               "siMaps": {
                 "vmiData": {
                   "value": []
                 },
                 "instTupleVMIMaps": {}
               }
             };
     this.svcInstanceNovaStatus = [];
     this.svcTemImage = {
             "images": [],
             "schema": "/v2/schemas/images",
             "first": "/v2/images"
           };
     this.availabilityZone = {
             "availabilityZoneInfo": [
                 {
                   "zoneState": {
                     "available": true
                   },
                   "hosts": null,
                   "zoneName": "nova"
                 }
               ]
             };
     this.svcTempMockData = {
             "service_templates": [
                 {
                   "service-template": {
                     "display_name": "new Tem",
                     "uuid": "253818d9-bddb-46bb-8e82-e8f8a4088606",
                     "service_appliance_set_refs": [
                       {
                         "to": [
                           "default-global-system-config",
                           "opencontrail"
                         ],
                         "attr": null,
                         "uuid": "ab51baa6-75c3-4e5f-b415-ec4f6bb5761f"
                       }
                     ],
                     "href": "http://nodeg4:8082/service-template/253818d9-bddb-46bb-8e82-e8f8a4088606",
                     "parent_type": "domain",
                     "name": "new Tem",
                     "perms2": {
                       "owner": "6cf81900c5af4e07afd66e11e768e00b",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": [
                         {
                           "tenant_access": 5,
                           "tenant": "domain:e05df223-ed3a-4468-ac79-b424007e168f"
                         }
                       ]
                     },
                     "service_template_properties": {
                       "instance_data": null,
                       "service_mode": "transparent",
                       "ordered_interfaces": true,
                       "service_virtualization_type": "physical-device",
                       "interface_type": [
                         {
                           "service_interface_type": "management"
                         },
                         {
                           "service_interface_type": "left"
                         },
                         {
                           "service_interface_type": "right"
                         }
                       ],
                       "image_name": null,
                       "availability_zone_enable": null,
                       "version": 2,
                       "service_type": "firewall",
                       "flavor": null,
                       "service_scaling": null,
                       "vrouter_instance_type": null
                     },
                     "service_instance_back_refs": [
                       {
                         "to": [
                           "default-domain",
                           "admin",
                           "new Instance"
                         ],
                         "attr": null,
                         "uuid": "43f2c444-8ad6-4e61-bdd8-e4f9b243fc9d"
                       }
                     ],
                     "fq_name": [
                       "default-domain",
                       "new Tem"
                     ],
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 2681920901571364400,
                         "uuid_lslong": 10269026254959708000
                       },
                       "created": "2017-11-15T13:30:40.650662",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-11-15T13:30:40.650662",
                       "permissions": {
                         "owner": "admin",
                         "owner_access": 7,
                         "other_access": 7,
                         "group": "admin",
                         "group_access": 7
                       }
                     },
                     "parent_uuid": "e05df223-ed3a-4468-ac79-b424007e168f"
                   }
                 },
                 {
                   "service-template": {
                     "display_name": "nat-template",
                     "uuid": "a537fd2e-df9b-454d-98f3-e025a5797d76",
                     "href": "http://nodeg4:8082/service-template/a537fd2e-df9b-454d-98f3-e025a5797d76",
                     "parent_uuid": "e05df223-ed3a-4468-ac79-b424007e168f",
                     "parent_type": "domain",
                     "name": "nat-template",
                     "perms2": {
                       "owner": "6cf81900c5af4e07afd66e11e768e00b",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": [
                         {
                           "tenant_access": 5,
                           "tenant": "domain:e05df223-ed3a-4468-ac79-b424007e168f"
                         }
                       ]
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 11905262517739014000,
                         "uuid_lslong": 11021399165400350000
                       },
                       "created": "2017-11-06T10:20:08.457868",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-11-06T10:20:08.457868",
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
                       "nat-template"
                     ],
                     "service_template_properties": {
                       "instance_data": null,
                       "availability_zone_enable": false,
                       "service_virtualization_type": "virtual-machine",
                       "interface_type": [
                         {
                           "static_route_enable": false,
                           "shared_ip": false,
                           "service_interface_type": "management"
                         },
                         {
                           "static_route_enable": false,
                           "shared_ip": false,
                           "service_interface_type": "left"
                         },
                         {
                           "static_route_enable": false,
                           "shared_ip": false,
                           "service_interface_type": "right"
                         }
                       ],
                       "image_name": "analyzer",
                       "service_mode": "in-network-nat",
                       "version": 1,
                       "service_type": "firewall",
                       "flavor": "m1.medium",
                       "service_scaling": false,
                       "vrouter_instance_type": null,
                       "ordered_interfaces": true
                     }
                   }
                 },
                 {
                   "service-template": {
                     "display_name": "haproxy-loadbalancer-template",
                     "uuid": "2f0cbdfb-d149-475f-880f-a97dfba1d300",
                     "href": "http://nodeg4:8082/service-template/2f0cbdfb-d149-475f-880f-a97dfba1d300",
                     "parent_uuid": "e05df223-ed3a-4468-ac79-b424007e168f",
                     "parent_type": "domain",
                     "name": "haproxy-loadbalancer-template",
                     "perms2": {
                       "owner": "6cf81900c5af4e07afd66e11e768e00b",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": [
                         {
                           "tenant_access": 5,
                           "tenant": "domain:e05df223-ed3a-4468-ac79-b424007e168f"
                         }
                       ]
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 3390293508748822500,
                         "uuid_lslong": 9804241272366551000
                       },
                       "created": "2017-11-06T10:20:08.735766",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-11-06T10:20:08.735766",
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
                       "haproxy-loadbalancer-template"
                     ],
                     "service_template_properties": {
                       "instance_data": null,
                       "availability_zone_enable": false,
                       "service_virtualization_type": "network-namespace",
                       "interface_type": [
                         {
                           "static_route_enable": false,
                           "shared_ip": true,
                           "service_interface_type": "right"
                         },
                         {
                           "static_route_enable": false,
                           "shared_ip": true,
                           "service_interface_type": "left"
                         }
                       ],
                       "image_name": null,
                       "service_mode": "in-network-nat",
                       "version": 1,
                       "service_type": "loadbalancer",
                       "flavor": null,
                       "service_scaling": true,
                       "vrouter_instance_type": null,
                       "ordered_interfaces": true
                     }
                   }
                 },
                 {
                   "service-template": {
                     "display_name": "netns-snat-template",
                     "uuid": "b84b652a-77b5-4ebe-b72c-bb1fe8942446",
                     "href": "http://nodeg4:8082/service-template/b84b652a-77b5-4ebe-b72c-bb1fe8942446",
                     "parent_uuid": "e05df223-ed3a-4468-ac79-b424007e168f",
                     "parent_type": "domain",
                     "name": "netns-snat-template",
                     "perms2": {
                       "owner": "6cf81900c5af4e07afd66e11e768e00b",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": [
                         {
                           "tenant_access": 5,
                           "tenant": "domain:e05df223-ed3a-4468-ac79-b424007e168f"
                         }
                       ]
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 13279819159303442000,
                         "uuid_lslong": 13199130353636485000
                       },
                       "created": "2017-11-06T10:20:08.551395",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-11-06T10:20:08.551395",
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
                       "netns-snat-template"
                     ],
                     "service_template_properties": {
                       "instance_data": null,
                       "availability_zone_enable": false,
                       "service_virtualization_type": "network-namespace",
                       "interface_type": [
                         {
                           "static_route_enable": false,
                           "shared_ip": true,
                           "service_interface_type": "right"
                         },
                         {
                           "static_route_enable": false,
                           "shared_ip": true,
                           "service_interface_type": "left"
                         }
                       ],
                       "image_name": null,
                       "service_mode": "in-network-nat",
                       "version": 1,
                       "service_type": "source-nat",
                       "flavor": null,
                       "service_scaling": true,
                       "vrouter_instance_type": null,
                       "ordered_interfaces": true
                     }
                   }
                 },
                 {
                   "service-template": {
                     "display_name": "docker-template",
                     "uuid": "a96e8637-0b76-45dd-acd8-27f1c7f1639d",
                     "href": "http://nodeg4:8082/service-template/a96e8637-0b76-45dd-acd8-27f1c7f1639d",
                     "parent_uuid": "e05df223-ed3a-4468-ac79-b424007e168f",
                     "parent_type": "domain",
                     "name": "docker-template",
                     "perms2": {
                       "owner": "6cf81900c5af4e07afd66e11e768e00b",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": [
                         {
                           "tenant_access": 5,
                           "tenant": "domain:e05df223-ed3a-4468-ac79-b424007e168f"
                         }
                       ]
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 12208843210821618000,
                         "uuid_lslong": 12454748688888193000
                       },
                       "created": "2017-11-06T10:20:08.922171",
                       "description": null,
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-11-06T10:20:08.922171",
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
                       "docker-template"
                     ],
                     "service_template_properties": {
                       "instance_data": "{\"command\":\"/bin/bash\"}",
                       "availability_zone_enable": false,
                       "service_virtualization_type": "vrouter-instance",
                       "interface_type": [
                         {
                           "static_route_enable": false,
                           "shared_ip": false,
                           "service_interface_type": "management"
                         },
                         {
                           "static_route_enable": false,
                           "shared_ip": false,
                           "service_interface_type": "left"
                         },
                         {
                           "static_route_enable": false,
                           "shared_ip": false,
                           "service_interface_type": "right"
                         }
                       ],
                       "image_name": "ubuntu",
                       "service_mode": "transparent",
                       "version": 1,
                       "service_type": "firewall",
                       "flavor": null,
                       "service_scaling": false,
                       "vrouter_instance_type": "docker",
                       "ordered_interfaces": true
                     }
                   }
                 }
               ]
             };
     this.webServerInfoMockData = {
             "orchestrationModel": [
                 "openstack"
               ],
               "serverUTCTime": 1510754780000,
               "hostName": "rajivks-mbp",
               "role": [
                 "cloudAdmin"
               ],
               "featurePkg": {
                 "webController": true
               },
               "uiConfig": {
                 "nodemanager": {
                   "installed": true
                 },
                 "dropdown_value_separator": ";"
               },
               "isAuthenticated": true,
               "discoveryEnabled": true,
               "configServer": {
                 "port": "8082",
                 "ip": [
                   "nodeg4"
                 ]
               },
               "optFeatureList": {
                 "mon_infra_underlay": false,
                 "mon_infra_mx": false,
                 "query_udd_webController": false
               },
               "featurePkgsInfo": {
                 "webController": {
                   "path": "/Users/rajivks/git/contrail-web-controller",
                   "enable": true
                 }
               },
               "sessionTimeout": 3600000,
               "_csrf": "NR3GhssV9kuI1YIKOM07vbKs",
               "serviceEndPointFromConfig": true,
               "regionList": [],
               "isRegionListFromConfig": false,
               "cgcEnabled": false,
               "configRegionList": {
                 "RegionOne": "http://127.0.0.1:5000/v2.0"
               },
               "currentRegionName": null,
               "loggedInOrchestrationMode": "openstack",
               "insecureAccess": false,
               "proxyPortList": {
                 "enabled": true,
                 "vrouter_node_ports": {
                   "introspect": {
                     "agent": "8085",
                     "node-manager": "8102"
                   }
                 },
                 "control_node_ports": {
                   "introspect": {
                     "control-node": "8083",
                     "dns": "8092",
                     "node-manager": "8101"
                   }
                 },
                 "analytics_node_ports": {
                   "analytics": "8081",
                   "introspect": {
                     "collector": "8089",
                     "analytics-api": "8090",
                     "query-engine": "8091",
                     "node-manager": "8104",
                     "alarm-generator": "5995",
                     "SNMP-collector": "5920",
                     "topology": "5921"
                   }
                 },
                 "config_node_ports": {
                   "api-server": "8082",
                   "introspect": {
                     "api": "8084",
                     "schema": "8087",
                     "service-monitor": "8088",
                     "device-manager": "8096",
                     "node-manager": "8100"
                   }
                 },
                 "allowed_introspect_list_access_by_token": []
               }
             };
     this.getHostList = {
             "host": [
                 {
                   "zone": "nova",
                   "host_name": "nodeg40",
                   "service": "compute"
                 }
               ]
             };
       return {
           svcInstDomainsData: svcInstDomainsData,
           svcInstPojectsData: svcInstPojectsData,
           svcProjectRole: svcProjectRole,
           svcInstanceMockData: svcInstanceMockData,
           svcInstanceNovaStatus: svcInstanceNovaStatus,
           svcTemImage: svcTemImage,
           availabilityZone: availabilityZone,
           svcTempMockData: svcTempMockData,
           webServerInfoMockData: webServerInfoMockData,
           getHostList: getHostList
           
       };
 });
