/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function (_) {
    this.domainsMockData = {
        "domains": [
            {
                "href"   : "http://10.84.11.2:8082/domain/35468934-bfe5-4c0e-84e2-ddfc9b49af74",
                "display_name": "default-domain",
                "fq_name": [
                    "default-domain"
                ],
                "uuid"   : "35468934-bfe5-4c0e-84e2-ddfc9b49af74"
            }
        ]
    };
    this.projectsMockData = {
        "projects": [
            {
                "uuid"   : "ba710bf3-922d-4cda-bbb4-a2e2e76533bf",
                "display_name": "admin",
                "fq_name": [
                    "default-domain",
                    "admin"
                ]
            },
            {
                "uuid"   : "c3fa1bb4-b04d-4f29-8bb4-7343d8fbeb21",
                "display_name": "scalevns",
                "fq_name": [
                    "default-domain",
                    "scalevns"
                ]
            },
            {
                "uuid"   : "efdfd856-b362-4b5c-ad17-09cc3acfd859",
                "display_name": "demo",
                "fq_name": [
                    "default-domain",
                    "demo"
                ]
            }
        ]
    };
    this.adminProjectMockData = {
        "virtual-networks": [
            {
                "href"   : "http://10.84.11.2:8082/virtual-network/ad8a9efc-9b7e-4425-9735-03bda0d2726e",
                "fq_name": [
                    "default-domain",
                    "admin",
                    "frontend"
                ],
                "uuid"   : "ad8a9efc-9b7e-4425-9735-03bda0d2726e"
            },
            {
                "href"   : "http://10.84.11.2:8082/virtual-network/2847747f-cb2c-4499-9b12-0f1711168e72",
                "fq_name": [
                    "default-domain",
                    "admin",
                    "backend"
                ],
                "uuid"   : "2847747f-cb2c-4499-9b12-0f1711168e72"
            }
        ]
    };
    this.virtualMachinesMockData = {
        "data"   : {
            "value": [
                {
                    "name" : "39b35cf1-1bdf-4238-bcc2-16653f12379a",
                    "value": {
                        "UveVirtualMachineAgent": {
                            "vm_name"       : "back01",
                            "cpu_info"      : {
                                "virt_memory"         : 6749812,
                                "cpu_one_min_avg"     : 1.16667,
                                "disk_used_bytes"     : 1167990784,
                                "vm_memory_quota"     : 4194304,
                                "peak_virt_memory"    : 7251764,
                                "disk_allocated_bytes": 4294967295,
                                "rss"                 : 1265084
                            },
                            "interface_list": [
                                "default-domain:admin:4b5073eb-ee2e-4790-b106-e020a4e79e45"
                            ],
                            "uuid"          : "39b35cf1-1bdf-4238-bcc2-16653f12379a",
                            "vrouter"       : "a3s29"
                        }
                    }
                },
                {
                    "name" : "7c20fb79-1a0a-49e3-b31f-d53db046264e",
                    "value": {
                        "UveVirtualMachineAgent": {
                            "vm_name"       : "front01",
                            "cpu_info"      : {
                                "virt_memory"         : 6757960,
                                "cpu_one_min_avg"     : 0.983607,
                                "disk_used_bytes"     : 1173041152,
                                "vm_memory_quota"     : 4194304,
                                "peak_virt_memory"    : 7250968,
                                "disk_allocated_bytes": 4294967295,
                                "rss"                 : 1253528
                            },
                            "interface_list": [
                                "default-domain:admin:3683aa58-28ff-4ffb-8667-fb778d92ad0e"
                            ],
                            "uuid"          : "7c20fb79-1a0a-49e3-b31f-d53db046264e",
                            "vrouter"       : "a3s29"
                        }
                    }
                }
            ]
        },
        "lastKey": null,
        "more"   : false
    };
    this.virtualMachinesMockStatData = [
        {
            "value": [
                {
                    "vm_uuid"                : "39b35cf1-1bdf-4238-bcc2-16653f12379a",
                    "SUM(if_stats.in_bytes)" : 55450416,
                    "SUM(if_stats.in_pkts)"  : 164816,
                    "SUM(if_stats.out_bytes)": 55048214,
                    "SUM(if_stats.out_pkts)" : 164659
                },
                {
                    "vm_uuid"                : "7c20fb79-1a0a-49e3-b31f-d53db046264e",
                    "SUM(if_stats.in_bytes)" : 55048214,
                    "SUM(if_stats.in_pkts)"  : 164659,
                    "SUM(if_stats.out_bytes)": 55450416,
                    "SUM(if_stats.out_pkts)" : 164816
                }
            ]
        }
    ];
    this.virtualMachinesInterfacesMockData = {
        "value": [
            {
                "name" : "default-domain:admin:4b5073eb-ee2e-4790-b106-e020a4e79e45",
                "value": {
                    "UveVMInterfaceAgent": {
                        "vm_name"        : "back01",
                        "ip6_active"     : false,
                        "if_stats"       : {
                            "out_bytes": 436110,
                            "in_bytes" : 451574,
                            "in_pkts"  : 1327,
                            "out_pkts" : 1327
                        },
                        "ip6_address"    : "::",
                        "virtual_network": "default-domain:admin:backend",
                        "ip_address"     : "10.3.1.3"
                    }
                }
            },
            {
                "name" : "default-domain:admin:3683aa58-28ff-4ffb-8667-fb778d92ad0e",
                "value": {
                    "UveVMInterfaceAgent": {
                        "vm_name"        : "front01",
                        "ip6_active"     : false,
                        "if_stats"       : {
                            "out_bytes": 451574,
                            "in_bytes" : 436110,
                            "in_pkts"  : 1327,
                            "out_pkts" : 1327
                        },
                        "ip6_address"    : "::",
                        "virtual_network": "default-domain:admin:frontend",
                        "ip_address"     : "10.2.1.3"
                    }
                }
            }
        ]
    };
    return {
        domainsMockData                  : domainsMockData,
        projectsMockData                 : projectsMockData,
        adminProjectMockData             : adminProjectMockData,
        virtualMachinesMockData          : virtualMachinesMockData,
        virtualMachinesMockStatData      : virtualMachinesMockStatData,
        virtualMachinesInterfacesMockData: virtualMachinesInterfacesMockData
    };
});
