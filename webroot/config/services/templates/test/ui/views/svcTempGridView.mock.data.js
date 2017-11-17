/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore'], function(_){
     this.svcTempDomainsData = {
         "domains": [
           {
             "fq_name": [
               "default-domain"
             ],
             "uuid": "f1f5fd91-8016-4f0f-a0f3-b67e779f1d08"
           }
         ]
     };
     this.svcTempMockData = {
             "service_templates": [
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
       return {
           svcTempDomainsData: svcTempDomainsData,
           svcTempMockData: svcTempMockData
       };
 });
