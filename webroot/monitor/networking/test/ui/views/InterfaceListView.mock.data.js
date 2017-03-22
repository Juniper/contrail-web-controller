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
    this.interfacesMockStatData = [
        {
            "value": [
                {
                    "name"                   : "default-domain:admin:4b5073eb-ee2e-4790-b106-e020a4e79e45",
                    "SUM(if_stats.in_bytes)" : 55450416,
                    "SUM(if_stats.in_pkts)"  : 164816,
                    "SUM(if_stats.out_bytes)": 55048214,
                    "SUM(if_stats.out_pkts)" : 164659
                },
                {
                    "name"                   : "default-domain:admin:3683aa58-28ff-4ffb-8667-fb778d92ad0e",
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
                        "in_bw_usage": 245678,
                        "out_bw_usage": 235608,
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
                        "in_bw_usage": 425678,
                        "out_bw_usage": 315608,
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
        interfacesMockStatData    : interfacesMockStatData,
        virtualMachinesInterfacesMockData: virtualMachinesInterfacesMockData
    };
});
