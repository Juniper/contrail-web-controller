/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function (_) {
    this.domainsMockData = {
        "domains": [
            {
                "href": "http://10.84.11.2:9100/domain/35468934-bfe5-4c0e-84e2-ddfc9b49af74",
                "display_name": "default-domain",
                "fq_name": [
                    "default-domain"
                ],
                "uuid": "35468934-bfe5-4c0e-84e2-ddfc9b49af74"
            }
        ]
    };
    this.projectsMockData = {
        "projects": [
            {
                "uuid": "ba710bf3-922d-4cda-bbb4-a2e2e76533bf",
                "display_name": "admin",
                "fq_name": [
                    "default-domain",
                    "admin"
                ]
            },
            {
                "uuid": "c3fa1bb4-b04d-4f29-8bb4-7343d8fbeb21",
                "display_name": "scalevns",
                "fq_name": [
                    "default-domain",
                    "scalevns"
                ]
            },
            {
                "uuid": "efdfd856-b362-4b5c-ad17-09cc3acfd859",
                "display_name": "demo",
                "fq_name": [
                    "default-domain",
                    "demo"
                ]
            }
        ]
    };
    this.demoProjectMockData = {
        "virtual-networks": [
            {
                "href": "http://10.84.11.2:9100/virtual-network/5afff8c0-75bd-4063-b146-667885069bef",
                "fq_name": [
                    "default-domain",
                    "demo",
                    "st_vn101"
                ],
                "uuid": "5afff8c0-75bd-4063-b146-667885069bef"
            },
            {
                "href": "http://10.84.11.2:9100/virtual-network/e1a07ef5-ee3b-4422-b085-fa3641090626",
                "fq_name": [
                    "default-domain",
                    "demo",
                    "st_vn102"
                ],
                "uuid": "e1a07ef5-ee3b-4422-b085-fa3641090626"
            }
        ]
    };

    this.virtualMachineMockData = {
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
    this.virtualMachineStatsMockData = {
        "VirtualMachineStats": {
            "cpu_stats": [
                {
                    "virt_memory": 2609016,
                    "cpu_one_min_avg": 3,
                    "disk_used_bytes": 1646592,
                    "vm_memory_quota": 65536,
                    "peak_virt_memory": 3100776,
                    "disk_allocated_bytes": 1073741824,
                    "rss": 212936
                }
            ]
        },
        "UveVirtualMachineAgent": {
            "vm_name": "st_vn101_vm21",
            "tcp_sport_bitmap": [
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "8192",
                "0"
            ],
            "uuid": "0275be58-4e5f-440e-81fa-07aac3fb1623",
            "cpu_info": {
                "virt_memory": 2609016,
                "cpu_one_min_avg": 3,
                "disk_used_bytes": 1646592,
                "vm_memory_quota": 65536,
                "peak_virt_memory": 3100776,
                "disk_allocated_bytes": 1073741824,
                "rss": 212936
            },
            "vrouter": "a3s29",
            "tcp_dport_bitmap": [
                "1",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0"
            ],
            "interface_list": [
                "default-domain:demo:st101_port21"
            ]
        }
    };
    this.virtualMachineInterfacesMockData = {
        "value": [
            {
                "name": "default-domain:demo:st101_port21",
                "value": {
                    "UveVMInterfaceAgent": {
                        "vm_name": "st_vn101_vm21",
                        "in_bw_usage": 0,
                        "virtual_network": "default-domain:demo:st_vn101",
                        "uuid": "485317a8-d1e9-4397-9e4f-9aba97170947",
                        "out_bw_usage": 0,
                        "ip6_active": false,
                        "label": 104,
                        "if_stats": {
                            "out_bytes": 270,
                            "in_bytes": 0,
                            "in_pkts": 0,
                            "out_pkts": 3
                        },
                        "vm_uuid": "0275be58-4e5f-440e-81fa-07aac3fb1623",
                        "port_bucket_bmap": {
                            "udp_sport_bitmap": [
                                "0",
                                "0",
                                "0",
                                "0",
                                "0",
                                "0",
                                "0",
                                "0"
                            ],
                            "tcp_dport_bitmap": [
                                "1",
                                "0",
                                "0",
                                "0",
                                "0",
                                "0",
                                "0",
                                "0"
                            ],
                            "tcp_sport_bitmap": [
                                "0",
                                "0",
                                "0",
                                "0",
                                "0",
                                "0",
                                "8192",
                                "0"
                            ],
                            "udp_dport_bitmap": [
                                "0",
                                "0",
                                "0",
                                "0",
                                "0",
                                "0",
                                "0",
                                "0"
                            ]
                        },
                        "mac_address": "02:48:53:17:a8:d1",
                        "active": true,
                        "ip6_address": "::",
                        "l2_active": true,
                        "ip_address": "1.101.1.23",
                        "gateway": "1.101.1.1"
                    }
                }
            }
        ]
    };
    this.virtualMachineConnectedGraphMockData = {
        "nodes": [
            {
                "name": "st_vn101_vm21",
                "fqName": "0275be58-4e5f-440e-81fa-07aac3fb1623",
                "uve": {
                    "UveVirtualMachineAgent": {
                        "vm_name": "st_vn101_vm21",
                        "cpu_info": {
                            "virt_memory": 2609016,
                            "cpu_one_min_avg": 2.62295,
                            "disk_used_bytes": 1646592,
                            "vm_memory_quota": 65536,
                            "peak_virt_memory": 3100776,
                            "disk_allocated_bytes": 1073741824,
                            "rss": 212936
                        },
                        "interface_list": [
                            "default-domain:demo:st101_port21"
                        ],
                        "uuid": "0275be58-4e5f-440e-81fa-07aac3fb1623",
                        "vrouter": "a3s29",
                        "interface_map": {
                            "default-domain:demo:st_vn101": {
                                "name": "default-domain:demo:st101_port21",
                                "value": {
                                    "UveVMInterfaceAgent": {
                                        "vm_name": "st_vn101_vm21",
                                        "uuid": "485317a8-d1e9-4397-9e4f-9aba97170947",
                                        "if_stats": {
                                            "out_bytes": 270,
                                            "in_bytes": 0,
                                            "in_pkts": 0,
                                            "out_pkts": 3
                                        },
                                        "vm_uuid": "0275be58-4e5f-440e-81fa-07aac3fb1623",
                                        "mac_address": "02:48:53:17:a8:d1",
                                        "virtual_network": "default-domain:demo:st_vn101",
                                        "ip_address": "1.101.1.23",
                                        "gateway": "1.101.1.1"
                                    }
                                }
                            }
                        }
                    }
                },
                "node_type": "virtual-machine",
                "status": "Active",
                "srcVNDetails": {
                    "name": "default-domain:demo:st_vn101"
                }
            },
            {
                "name": "default-domain:demo:st_vn101",
                "more_attributes": {
                    "vm_count": 49,
                    "vmi_count": 49,
                    "in_throughput": 0,
                    "out_throughput": 0,
                    "virtualmachine_list": [
                        "0275be58-4e5f-440e-81fa-07aac3fb1623",
                        "03200eed-b1e0-4c1d-b83f-ab1153312c7b",
                        "0a6761ce-f2d4-4f5f-9c67-262b07764247",
                        "0a903506-da01-4db6-a025-b6a25054c2cf",
                        "100fcd3e-7c3a-4873-a4f2-fb510d5ec22c",
                        "11518e4d-191e-4c56-992a-12fe93697806",
                        "12ab3e44-b672-4074-9506-136120535b1e",
                        "1832a53e-7936-4a7a-9158-c52fea9abd68",
                        "1bdf2677-92da-4b12-90f8-67f2fa2274e3",
                        "1e3f6875-b3ec-49f4-bf03-5b3a52bf31a0",
                        "241e74ec-eb85-4585-8c81-7c5e1c198512",
                        "3a5c251d-c542-46c8-8105-abeb0b339edb",
                        "3af2bc29-c930-44ac-8134-559f5e40311d",
                        "3c8ab30b-a725-4152-bc4f-95cc704dd971",
                        "411a38dc-b540-431e-aa2a-53bc183988b3",
                        "4e672d59-a12f-4f3c-80ed-d0a9acf4e4bf",
                        "53bfbeca-346b-484d-b468-fb7f749a3bfe",
                        "58439d77-99e3-41e6-9599-68db733648ca",
                        "63f6ed4b-41fe-4f88-8fbc-1cce48670a3d",
                        "6f1f8220-4ff5-41cd-900b-b9454e478bb3",
                        "7bdb6b57-ac0d-4a54-9d47-2e6afce53dcf",
                        "84433c22-20a8-40a9-8f85-855ddae78aef",
                        "85a6b690-8826-40ec-a17e-8c99bfbd87d6",
                        "8664cc1a-364e-466c-9033-ab036bd66dd2",
                        "875bde37-79b1-44fa-97bd-f3c2408d994d",
                        "8bc3b1cb-490f-4de4-87f7-a7a399a12e0d",
                        "8bfb1028-1219-4960-b3c7-20906f76b241",
                        "9365b520-392d-4b60-a20d-80aab65f752d",
                        "94a304f0-ca19-4153-8747-9b1b2945468f",
                        "98259037-4dc5-4c49-b88e-4a1550d12c5f",
                        "990475f8-15d9-4ee2-9932-09ef85c80a83",
                        "9d6f385f-70b6-4c48-857d-25f8be8fa362",
                        "a5112d4f-07b8-4c28-8807-26b3ba0019a2",
                        "ac8051c9-4b98-4726-895e-32fd9f5bdc1a",
                        "ae4b1ea4-fa68-4b94-9a4d-afc98de4ffe4",
                        "afd18dcb-2e1e-41c3-a633-09768bbd385d",
                        "b547ce0f-802f-40e4-bcd5-fa515fe320f5",
                        "bb0bf948-6fa5-42ed-a26f-8ef87ca08aeb",
                        "bbd6b9e4-e9ae-4e72-b32a-22d4c282a1c3",
                        "c10bec7d-b5bc-4407-bbdd-be61eeb8538b",
                        "c9d545da-b3ab-447d-98bf-3aac9d8527fc",
                        "d135955a-e785-4752-a2ba-89d24b265ffa",
                        "d5bc9390-edbc-4831-9e36-b720ddbe56d3",
                        "dfff24c0-7631-4acc-8c3f-b40359abc447",
                        "e42d1802-57c8-4e19-936f-7197f154d36c",
                        "f005ba67-dece-4d95-a224-e7618632b21f",
                        "f87deb4b-4652-484c-b041-b8066bf05011",
                        "f90ebf31-3431-4acb-b432-8d7895a4314c",
                        "fd64b092-95ea-43bf-a7ae-e9c645ba1625"
                    ]
                },
                "node_type": "virtual-network",
                "status": "Active"
            }
        ],
        "links": [
            {
                "src": "default-domain:demo:st_vn101",
                "dst": "st_vn101_vm21",
                "dir": "bi",
                "more_attributes": {
                    "in_stats": [
                        {
                            "src": "default-domain:demo:st_vn101",
                            "dst": "st_vn101_vm21",
                            "pkts": 0,
                            "bytes": 0
                        }
                    ],
                    "out_stats": [
                        {
                            "src": "default-domain:demo:st_vn101",
                            "dst": "st_vn101_vm21",
                            "pkts": 3,
                            "bytes": 270
                        }
                    ]
                }
            }
        ]
    };
    this.reportsQueryMockData = {
        "data": [
            {
                "Source": "a3s29",
                "T": 1441877767949714,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441877828113943,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441877888287781,
                "cpu_stats.cpu_one_min_avg": 2.62295,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441877948456374,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441878008638264,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441878068823631,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441878128989901,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441878189137743,
                "cpu_stats.cpu_one_min_avg": 2.62295,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441878249298411,
                "cpu_stats.cpu_one_min_avg": 3,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441878309463975,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441878369610657,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441878429767498,
                "cpu_stats.cpu_one_min_avg": 3,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441878489901235,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441878550029440,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441878610172772,
                "cpu_stats.cpu_one_min_avg": 2.62295,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441878670354952,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441878730510275,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441878790658229,
                "cpu_stats.cpu_one_min_avg": 3.16667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441878850824555,
                "cpu_stats.cpu_one_min_avg": 2.5,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441878910971609,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441878971114199,
                "cpu_stats.cpu_one_min_avg": 2.78689,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441879031283377,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441879091469678,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441879151626196,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441879211820093,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441879272027183,
                "cpu_stats.cpu_one_min_avg": 3,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441879332203507,
                "cpu_stats.cpu_one_min_avg": 2.62295,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441879392354208,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441879452504878,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441879512665800,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441879572833003,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441879632982786,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441879693157917,
                "cpu_stats.cpu_one_min_avg": 2.78689,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441879753334863,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441879813504554,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441879873683344,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441879933858644,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441879994038209,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441880054217963,
                "cpu_stats.cpu_one_min_avg": 2.78689,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441880114392845,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441880174554262,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441880234752178,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441880294976003,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441880355156145,
                "cpu_stats.cpu_one_min_avg": 2.78689,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441880415341439,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441880475542286,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441880535735489,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441880595911304,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441880656124714,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441880716322721,
                "cpu_stats.cpu_one_min_avg": 2.78689,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441880776538189,
                "cpu_stats.cpu_one_min_avg": 2.5,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441880836709978,
                "cpu_stats.cpu_one_min_avg": 3,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441880896890130,
                "cpu_stats.cpu_one_min_avg": 2.5,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441880957077075,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441881017243808,
                "cpu_stats.cpu_one_min_avg": 2.78689,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441881077436075,
                "cpu_stats.cpu_one_min_avg": 3,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441881137603208,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441881197782119,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441881257946125,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441881318131620,
                "cpu_stats.cpu_one_min_avg": 2.95082,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441881378297590,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441881438501497,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441881498710558,
                "cpu_stats.cpu_one_min_avg": 2.5,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441881558876710,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441881619085702,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441881679242246,
                "cpu_stats.cpu_one_min_avg": 2.95082,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441881739400886,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441881799574723,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441881859759257,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441881919930591,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441881980102383,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441882040273212,
                "cpu_stats.cpu_one_min_avg": 2.78689,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441882100434352,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441882160600709,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441882220760698,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441882280928517,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441882341107375,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441882401260595,
                "cpu_stats.cpu_one_min_avg": 2.78689,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441882461401319,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441882521562605,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441882581708174,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441882641864105,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441882702022845,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441882762193039,
                "cpu_stats.cpu_one_min_avg": 2.62295,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441882822377829,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441882882578278,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441882942771108,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441883002946195,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441883063126929,
                "cpu_stats.cpu_one_min_avg": 2.62295,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441883123388229,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441883183563348,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441883243745381,
                "cpu_stats.cpu_one_min_avg": 2.5,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441883303976462,
                "cpu_stats.cpu_one_min_avg": 3,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441883364154192,
                "cpu_stats.cpu_one_min_avg": 2.62295,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441883424330025,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441883484472630,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441883544623293,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441883604787290,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441883664960614,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441883725109961,
                "cpu_stats.cpu_one_min_avg": 2.62295,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441883785260582,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441883845402656,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441883905562999,
                "cpu_stats.cpu_one_min_avg": 3,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441883965700130,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441884025817281,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441884085966032,
                "cpu_stats.cpu_one_min_avg": 3,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441884146114768,
                "cpu_stats.cpu_one_min_avg": 2.62295,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441884206286251,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441884266443397,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441884326608401,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441884386745066,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441884446909995,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441884507041469,
                "cpu_stats.cpu_one_min_avg": 3,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441884567199152,
                "cpu_stats.cpu_one_min_avg": 2.78689,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441884627382849,
                "cpu_stats.cpu_one_min_avg": 2.5,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441884687575313,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441884747719498,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441884807910523,
                "cpu_stats.cpu_one_min_avg": 2.66667,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441884868067793,
                "cpu_stats.cpu_one_min_avg": 2.83333,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            },
            {
                "Source": "a3s29",
                "T": 1441884928280518,
                "cpu_stats.cpu_one_min_avg": 2.62295,
                "cpu_stats.rss": 212936,
                "name": "0275be58-4e5f-440e-81fa-07aac3fb1623"
            }
        ],
        "total": 120,
        "queryJSON": {
            "table": "StatTable.VirtualMachineStats.cpu_stats",
            "start_time": "now-120m",
            "end_time": "now",
            "select_fields": [
                "Source",
                "T",
                "cpu_stats.cpu_one_min_avg",
                "cpu_stats.rss",
                "name"
            ],
            "filter": [],
            "limit": 150000,
            "where": [
                [
                    {
                        "name": "name",
                        "value": "0275be58-4e5f-440e-81fa-07aac3fb1623",
                        "op": 1
                    }
                ]
            ]
        }
    };
    this.virtualMachineFlowSeriesMockData = {
        "summary": {
            "start_time": 1445615662000000,
            "end_time": 1445622862000000,
            "timeGran_microsecs": 60000000
        },
        "flow-series": [
            {
                "time": 1445615640000000,
                "inBytes": 1750834,
                "outBytes": 1720964,
                "inPkts": 4785,
                "outPkts": 4702,
                "totalPkts": 9487,
                "totalBytes": 3471798
            },
            {
                "time": 1445615700000000,
                "inBytes": 1752670,
                "outBytes": 1743698,
                "inPkts": 4883,
                "outPkts": 4717,
                "totalPkts": 9600,
                "totalBytes": 3496368
            },
            {
                "time": 1445615760000000,
                "inBytes": 1709754,
                "outBytes": 1691934,
                "inPkts": 4777,
                "outPkts": 4683,
                "totalPkts": 9460,
                "totalBytes": 3401688
            },
            {
                "time": 1445615820000000,
                "inBytes": 1723670,
                "outBytes": 1765752,
                "inPkts": 4947,
                "outPkts": 4684,
                "totalPkts": 9631,
                "totalBytes": 3489422
            },
            {
                "time": 1445615880000000,
                "inBytes": 1737780,
                "outBytes": 1695436,
                "inPkts": 4854,
                "outPkts": 4714,
                "totalPkts": 9568,
                "totalBytes": 3433216
            },
            {
                "time": 1445615940000000,
                "inBytes": 1746142,
                "outBytes": 1728880,
                "inPkts": 4971,
                "outPkts": 4556,
                "totalPkts": 9527,
                "totalBytes": 3475022
            },
            {
                "time": 1445616000000000,
                "inBytes": 1689482,
                "outBytes": 1715314,
                "inPkts": 4857,
                "outPkts": 4601,
                "totalPkts": 9458,
                "totalBytes": 3404796
            },
            {
                "time": 1445616060000000,
                "inBytes": 1724940,
                "outBytes": 1740194,
                "inPkts": 4850,
                "outPkts": 4693,
                "totalPkts": 9543,
                "totalBytes": 3465134
            },
            {
                "time": 1445616120000000,
                "inBytes": 1690502,
                "outBytes": 1674296,
                "inPkts": 4755,
                "outPkts": 4668,
                "totalPkts": 9423,
                "totalBytes": 3364798
            },
            {
                "time": 1445616180000000,
                "inBytes": 1690486,
                "outBytes": 1691668,
                "inPkts": 4779,
                "outPkts": 4550,
                "totalPkts": 9329,
                "totalBytes": 3382154
            },
            {
                "time": 1445616240000000,
                "inBytes": 1747500,
                "outBytes": 1745716,
                "inPkts": 4774,
                "outPkts": 4750,
                "totalPkts": 9524,
                "totalBytes": 3493216
            },
            {
                "time": 1445616300000000,
                "inBytes": 1729184,
                "outBytes": 1690278,
                "inPkts": 4812,
                "outPkts": 4639,
                "totalPkts": 9451,
                "totalBytes": 3419462
            },
            {
                "time": 1445616360000000,
                "inBytes": 1760202,
                "outBytes": 1691958,
                "inPkts": 4737,
                "outPkts": 4727,
                "totalPkts": 9464,
                "totalBytes": 3452160
            },
            {
                "time": 1445616420000000,
                "inBytes": 1735264,
                "outBytes": 1672508,
                "inPkts": 4728,
                "outPkts": 4658,
                "totalPkts": 9386,
                "totalBytes": 3407772
            },
            {
                "time": 1445616480000000,
                "inBytes": 1726920,
                "outBytes": 1733208,
                "inPkts": 4800,
                "outPkts": 4808,
                "totalPkts": 9608,
                "totalBytes": 3460128
            },
            {
                "time": 1445616540000000,
                "inBytes": 1666930,
                "outBytes": 1705604,
                "inPkts": 4585,
                "outPkts": 4806,
                "totalPkts": 9391,
                "totalBytes": 3372534
            },
            {
                "time": 1445616600000000,
                "inBytes": 1696922,
                "outBytes": 1702426,
                "inPkts": 4749,
                "outPkts": 4773,
                "totalPkts": 9522,
                "totalBytes": 3399348
            },
            {
                "time": 1445616660000000,
                "inBytes": 1696930,
                "outBytes": 1721586,
                "inPkts": 4713,
                "outPkts": 4773,
                "totalPkts": 9486,
                "totalBytes": 3418516
            },
            {
                "time": 1445616720000000,
                "inBytes": 1695002,
                "outBytes": 1715016,
                "inPkts": 4665,
                "outPkts": 4732,
                "totalPkts": 9397,
                "totalBytes": 3410018
            },
            {
                "time": 1445616780000000,
                "inBytes": 1665918,
                "outBytes": 1636062,
                "inPkts": 4539,
                "outPkts": 4699,
                "totalPkts": 9238,
                "totalBytes": 3301980
            },
            {
                "time": 1445616840000000,
                "inBytes": 1674050,
                "outBytes": 1718896,
                "inPkts": 4749,
                "outPkts": 4732,
                "totalPkts": 9481,
                "totalBytes": 3392946
            },
            {
                "time": 1445616900000000,
                "inBytes": 1700306,
                "outBytes": 1690608,
                "inPkts": 4697,
                "outPkts": 4728,
                "totalPkts": 9425,
                "totalBytes": 3390914
            },
            {
                "time": 1445616960000000,
                "inBytes": 1737010,
                "outBytes": 1699848,
                "inPkts": 4765,
                "outPkts": 4708,
                "totalPkts": 9473,
                "totalBytes": 3436858
            },
            {
                "time": 1445617020000000,
                "inBytes": 1717940,
                "outBytes": 1690158,
                "inPkts": 4618,
                "outPkts": 4847,
                "totalPkts": 9465,
                "totalBytes": 3408098
            },
            {
                "time": 1445617080000000,
                "inBytes": 1702950,
                "outBytes": 1736564,
                "inPkts": 4723,
                "outPkts": 4778,
                "totalPkts": 9501,
                "totalBytes": 3439514
            },
            {
                "time": 1445617140000000,
                "inBytes": 1676628,
                "outBytes": 1760218,
                "inPkts": 4714,
                "outPkts": 4733,
                "totalPkts": 9447,
                "totalBytes": 3436846
            },
            {
                "time": 1445617200000000,
                "inBytes": 1676014,
                "outBytes": 1655088,
                "inPkts": 4571,
                "outPkts": 4668,
                "totalPkts": 9239,
                "totalBytes": 3331102
            },
            {
                "time": 1445617260000000,
                "inBytes": 1683206,
                "outBytes": 1706594,
                "inPkts": 4563,
                "outPkts": 4749,
                "totalPkts": 9312,
                "totalBytes": 3389800
            },
            {
                "time": 1445617320000000,
                "inBytes": 1703082,
                "outBytes": 1696806,
                "inPkts": 4621,
                "outPkts": 4771,
                "totalPkts": 9392,
                "totalBytes": 3399888
            },
            {
                "time": 1445617380000000,
                "inBytes": 1700562,
                "outBytes": 1725974,
                "inPkts": 4817,
                "outPkts": 4703,
                "totalPkts": 9520,
                "totalBytes": 3426536
            },
            {
                "time": 1445617440000000,
                "inBytes": 1716188,
                "outBytes": 1659126,
                "inPkts": 4750,
                "outPkts": 4591,
                "totalPkts": 9341,
                "totalBytes": 3375314
            },
            {
                "time": 1445617500000000,
                "inBytes": 1715380,
                "outBytes": 1676614,
                "inPkts": 4678,
                "outPkts": 4691,
                "totalPkts": 9369,
                "totalBytes": 3391994
            },
            {
                "time": 1445617560000000,
                "inBytes": 1719702,
                "outBytes": 1694938,
                "inPkts": 4731,
                "outPkts": 4693,
                "totalPkts": 9424,
                "totalBytes": 3414640
            },
            {
                "time": 1445617620000000,
                "inBytes": 1704166,
                "outBytes": 1681362,
                "inPkts": 4651,
                "outPkts": 4777,
                "totalPkts": 9428,
                "totalBytes": 3385528
            },
            {
                "time": 1445617680000000,
                "inBytes": 1722946,
                "outBytes": 1773232,
                "inPkts": 4697,
                "outPkts": 4832,
                "totalPkts": 9529,
                "totalBytes": 3496178
            },
            {
                "time": 1445617740000000,
                "inBytes": 1753736,
                "outBytes": 1762462,
                "inPkts": 4820,
                "outPkts": 4795,
                "totalPkts": 9615,
                "totalBytes": 3516198
            },
            {
                "time": 1445617800000000,
                "inBytes": 1680860,
                "outBytes": 1739228,
                "inPkts": 4806,
                "outPkts": 4746,
                "totalPkts": 9552,
                "totalBytes": 3420088
            },
            {
                "time": 1445617860000000,
                "inBytes": 1693264,
                "outBytes": 1668802,
                "inPkts": 4708,
                "outPkts": 4665,
                "totalPkts": 9373,
                "totalBytes": 3362066
            },
            {
                "time": 1445617920000000,
                "inBytes": 1699464,
                "outBytes": 1727614,
                "inPkts": 4784,
                "outPkts": 4715,
                "totalPkts": 9499,
                "totalBytes": 3427078
            },
            {
                "time": 1445617980000000,
                "inBytes": 1651850,
                "outBytes": 1688594,
                "inPkts": 4725,
                "outPkts": 4581,
                "totalPkts": 9306,
                "totalBytes": 3340444
            },
            {
                "time": 1445618040000000,
                "inBytes": 1777920,
                "outBytes": 1681148,
                "inPkts": 4836,
                "outPkts": 4634,
                "totalPkts": 9470,
                "totalBytes": 3459068
            },
            {
                "time": 1445618100000000,
                "inBytes": 1718048,
                "outBytes": 1712724,
                "inPkts": 4696,
                "outPkts": 4766,
                "totalPkts": 9462,
                "totalBytes": 3430772
            },
            {
                "time": 1445618160000000,
                "inBytes": 1705396,
                "outBytes": 1726932,
                "inPkts": 4770,
                "outPkts": 4698,
                "totalPkts": 9468,
                "totalBytes": 3432328
            },
            {
                "time": 1445618220000000,
                "inBytes": 1753034,
                "outBytes": 1757296,
                "inPkts": 4733,
                "outPkts": 4776,
                "totalPkts": 9509,
                "totalBytes": 3510330
            },
            {
                "time": 1445618280000000,
                "inBytes": 1746106,
                "outBytes": 1708344,
                "inPkts": 4753,
                "outPkts": 4664,
                "totalPkts": 9417,
                "totalBytes": 3454450
            },
            {
                "time": 1445618340000000,
                "inBytes": 1729772,
                "outBytes": 1690276,
                "inPkts": 4814,
                "outPkts": 4638,
                "totalPkts": 9452,
                "totalBytes": 3420048
            },
            {
                "time": 1445618400000000,
                "inBytes": 1682314,
                "outBytes": 1680432,
                "inPkts": 4781,
                "outPkts": 4504,
                "totalPkts": 9285,
                "totalBytes": 3362746
            },
            {
                "time": 1445618460000000,
                "inBytes": 1684458,
                "outBytes": 1732460,
                "inPkts": 4809,
                "outPkts": 4710,
                "totalPkts": 9519,
                "totalBytes": 3416918
            },
            {
                "time": 1445618520000000,
                "inBytes": 1731994,
                "outBytes": 1658782,
                "inPkts": 4805,
                "outPkts": 4623,
                "totalPkts": 9428,
                "totalBytes": 3390776
            },
            {
                "time": 1445618580000000,
                "inBytes": 1709928,
                "outBytes": 1660048,
                "inPkts": 4716,
                "outPkts": 4660,
                "totalPkts": 9376,
                "totalBytes": 3369976
            },
            {
                "time": 1445618640000000,
                "inBytes": 1677052,
                "outBytes": 1672282,
                "inPkts": 4838,
                "outPkts": 4577,
                "totalPkts": 9415,
                "totalBytes": 3349334
            },
            {
                "time": 1445618700000000,
                "inBytes": 1752438,
                "outBytes": 1762594,
                "inPkts": 4875,
                "outPkts": 4657,
                "totalPkts": 9532,
                "totalBytes": 3515032
            },
            {
                "time": 1445618760000000,
                "inBytes": 1698182,
                "outBytes": 1695356,
                "inPkts": 4747,
                "outPkts": 4678,
                "totalPkts": 9425,
                "totalBytes": 3393538
            },
            {
                "time": 1445618820000000,
                "inBytes": 1746842,
                "outBytes": 1644612,
                "inPkts": 4769,
                "outPkts": 4706,
                "totalPkts": 9475,
                "totalBytes": 3391454
            },
            {
                "time": 1445618880000000,
                "inBytes": 1642260,
                "outBytes": 1645154,
                "inPkts": 4542,
                "outPkts": 4573,
                "totalPkts": 9115,
                "totalBytes": 3287414
            },
            {
                "time": 1445618940000000,
                "inBytes": 1698820,
                "outBytes": 1732744,
                "inPkts": 4774,
                "outPkts": 4704,
                "totalPkts": 9478,
                "totalBytes": 3431564
            },
            {
                "time": 1445619000000000,
                "inBytes": 1743996,
                "outBytes": 1716108,
                "inPkts": 4914,
                "outPkts": 4678,
                "totalPkts": 9592,
                "totalBytes": 3460104
            },
            {
                "time": 1445619060000000,
                "inBytes": 1668804,
                "outBytes": 1646114,
                "inPkts": 4794,
                "outPkts": 4565,
                "totalPkts": 9359,
                "totalBytes": 3314918
            },
            {
                "time": 1445619120000000,
                "inBytes": 1736984,
                "outBytes": 1648704,
                "inPkts": 4824,
                "outPkts": 4492,
                "totalPkts": 9316,
                "totalBytes": 3385688
            },
            {
                "time": 1445619180000000,
                "inBytes": 1744632,
                "outBytes": 1677864,
                "inPkts": 4884,
                "outPkts": 4472,
                "totalPkts": 9356,
                "totalBytes": 3422496
            },
            {
                "time": 1445619240000000,
                "inBytes": 1696766,
                "outBytes": 1707692,
                "inPkts": 4743,
                "outPkts": 4718,
                "totalPkts": 9461,
                "totalBytes": 3404458
            },
            {
                "time": 1445619300000000,
                "inBytes": 1708028,
                "outBytes": 1698344,
                "inPkts": 4714,
                "outPkts": 4676,
                "totalPkts": 9390,
                "totalBytes": 3406372
            },
            {
                "time": 1445619360000000,
                "inBytes": 1717398,
                "outBytes": 1739918,
                "inPkts": 4863,
                "outPkts": 4655,
                "totalPkts": 9518,
                "totalBytes": 3457316
            },
            {
                "time": 1445619420000000,
                "inBytes": 1742490,
                "outBytes": 1764382,
                "inPkts": 4925,
                "outPkts": 4679,
                "totalPkts": 9604,
                "totalBytes": 3506872
            },
            {
                "time": 1445619480000000,
                "inBytes": 1723918,
                "outBytes": 1716278,
                "inPkts": 4839,
                "outPkts": 4671,
                "totalPkts": 9510,
                "totalBytes": 3440196
            },
            {
                "time": 1445619540000000,
                "inBytes": 1707138,
                "outBytes": 1713274,
                "inPkts": 4589,
                "outPkts": 4781,
                "totalPkts": 9370,
                "totalBytes": 3420412
            },
            {
                "time": 1445619600000000,
                "inBytes": 1670190,
                "outBytes": 1717620,
                "inPkts": 4699,
                "outPkts": 4738,
                "totalPkts": 9437,
                "totalBytes": 3387810
            },
            {
                "time": 1445619660000000,
                "inBytes": 1718296,
                "outBytes": 1671030,
                "inPkts": 4572,
                "outPkts": 4767,
                "totalPkts": 9339,
                "totalBytes": 3389326
            },
            {
                "time": 1445619720000000,
                "inBytes": 1708404,
                "outBytes": 1711318,
                "inPkts": 4658,
                "outPkts": 4875,
                "totalPkts": 9533,
                "totalBytes": 3419722
            },
            {
                "time": 1445619780000000,
                "inBytes": 1679130,
                "outBytes": 1752788,
                "inPkts": 4673,
                "outPkts": 4818,
                "totalPkts": 9491,
                "totalBytes": 3431918
            },
            {
                "time": 1445619840000000,
                "inBytes": 1682202,
                "outBytes": 1715268,
                "inPkts": 4681,
                "outPkts": 4722,
                "totalPkts": 9403,
                "totalBytes": 3397470
            },
            {
                "time": 1445619900000000,
                "inBytes": 1743458,
                "outBytes": 1653096,
                "inPkts": 4789,
                "outPkts": 4668,
                "totalPkts": 9457,
                "totalBytes": 3396554
            },
            {
                "time": 1445619960000000,
                "inBytes": 1657342,
                "outBytes": 1697510,
                "inPkts": 4743,
                "outPkts": 4643,
                "totalPkts": 9386,
                "totalBytes": 3354852
            },
            {
                "time": 1445620020000000,
                "inBytes": 1730132,
                "outBytes": 1694464,
                "inPkts": 4858,
                "outPkts": 4660,
                "totalPkts": 9518,
                "totalBytes": 3424596
            },
            {
                "time": 1445620080000000,
                "inBytes": 1690078,
                "outBytes": 1678724,
                "inPkts": 4571,
                "outPkts": 4826,
                "totalPkts": 9397,
                "totalBytes": 3368802
            },
            {
                "time": 1445620140000000,
                "inBytes": 1676986,
                "outBytes": 1766656,
                "inPkts": 4717,
                "outPkts": 4792,
                "totalPkts": 9509,
                "totalBytes": 3443642
            },
            {
                "time": 1445620200000000,
                "inBytes": 1738858,
                "outBytes": 1727938,
                "inPkts": 4685,
                "outPkts": 4821,
                "totalPkts": 9506,
                "totalBytes": 3466796
            },
            {
                "time": 1445620260000000,
                "inBytes": 1733182,
                "outBytes": 1652280,
                "inPkts": 4715,
                "outPkts": 4776,
                "totalPkts": 9491,
                "totalBytes": 3385462
            },
            {
                "time": 1445620320000000,
                "inBytes": 1680534,
                "outBytes": 1723528,
                "inPkts": 4675,
                "outPkts": 4768,
                "totalPkts": 9443,
                "totalBytes": 3404062
            },
            {
                "time": 1445620380000000,
                "inBytes": 1756060,
                "outBytes": 1706220,
                "inPkts": 4734,
                "outPkts": 4758,
                "totalPkts": 9492,
                "totalBytes": 3462280
            },
            {
                "time": 1445620440000000,
                "inBytes": 1721686,
                "outBytes": 1695600,
                "inPkts": 4715,
                "outPkts": 4880,
                "totalPkts": 9595,
                "totalBytes": 3417286
            },
            {
                "time": 1445620500000000,
                "inBytes": 1666208,
                "outBytes": 1745066,
                "inPkts": 4660,
                "outPkts": 4737,
                "totalPkts": 9397,
                "totalBytes": 3411274
            },
            {
                "time": 1445620560000000,
                "inBytes": 1739562,
                "outBytes": 1722180,
                "inPkts": 4665,
                "outPkts": 4882,
                "totalPkts": 9547,
                "totalBytes": 3461742
            },
            {
                "time": 1445620620000000,
                "inBytes": 1662564,
                "outBytes": 1671628,
                "inPkts": 4582,
                "outPkts": 4582,
                "totalPkts": 9164,
                "totalBytes": 3334192
            },
            {
                "time": 1445620680000000,
                "inBytes": 1700000,
                "outBytes": 1695004,
                "inPkts": 4720,
                "outPkts": 4670,
                "totalPkts": 9390,
                "totalBytes": 3395004
            },
            {
                "time": 1445620740000000,
                "inBytes": 1740706,
                "outBytes": 1695362,
                "inPkts": 4833,
                "outPkts": 4657,
                "totalPkts": 9490,
                "totalBytes": 3436068
            },
            {
                "time": 1445620800000000,
                "inBytes": 1735758,
                "outBytes": 1732034,
                "inPkts": 4855,
                "outPkts": 4701,
                "totalPkts": 9556,
                "totalBytes": 3467792
            },
            {
                "time": 1445620860000000,
                "inBytes": 1651172,
                "outBytes": 1719506,
                "inPkts": 4698,
                "outPkts": 4689,
                "totalPkts": 9387,
                "totalBytes": 3370678
            },
            {
                "time": 1445620920000000,
                "inBytes": 1722626,
                "outBytes": 1691592,
                "inPkts": 4733,
                "outPkts": 4684,
                "totalPkts": 9417,
                "totalBytes": 3414218
            },
            {
                "time": 1445620980000000,
                "inBytes": 1691736,
                "outBytes": 1683630,
                "inPkts": 4692,
                "outPkts": 4763,
                "totalPkts": 9455,
                "totalBytes": 3375366
            },
            {
                "time": 1445621040000000,
                "inBytes": 1716912,
                "outBytes": 1717732,
                "inPkts": 4688,
                "outPkts": 4842,
                "totalPkts": 9530,
                "totalBytes": 3434644
            },
            {
                "time": 1445621100000000,
                "inBytes": 1732092,
                "outBytes": 1727460,
                "inPkts": 4770,
                "outPkts": 4694,
                "totalPkts": 9464,
                "totalBytes": 3459552
            },
            {
                "time": 1445621160000000,
                "inBytes": 1728252,
                "outBytes": 1749380,
                "inPkts": 4722,
                "outPkts": 4894,
                "totalPkts": 9616,
                "totalBytes": 3477632
            },
            {
                "time": 1445621220000000,
                "inBytes": 1719536,
                "outBytes": 1700134,
                "inPkts": 4740,
                "outPkts": 4783,
                "totalPkts": 9523,
                "totalBytes": 3419670
            },
            {
                "time": 1445621280000000,
                "inBytes": 1663152,
                "outBytes": 1676686,
                "inPkts": 4612,
                "outPkts": 4735,
                "totalPkts": 9347,
                "totalBytes": 3339838
            },
            {
                "time": 1445621340000000,
                "inBytes": 1705632,
                "outBytes": 1717064,
                "inPkts": 4696,
                "outPkts": 4748,
                "totalPkts": 9444,
                "totalBytes": 3422696
            },
            {
                "time": 1445621400000000,
                "inBytes": 1689070,
                "outBytes": 1733068,
                "inPkts": 4759,
                "outPkts": 4746,
                "totalPkts": 9505,
                "totalBytes": 3422138
            },
            {
                "time": 1445621460000000,
                "inBytes": 1671296,
                "outBytes": 1740784,
                "inPkts": 4724,
                "outPkts": 4728,
                "totalPkts": 9452,
                "totalBytes": 3412080
            },
            {
                "time": 1445621520000000,
                "inBytes": 1717980,
                "outBytes": 1677352,
                "inPkts": 4730,
                "outPkts": 4816,
                "totalPkts": 9546,
                "totalBytes": 3395332
            },
            {
                "time": 1445621580000000,
                "inBytes": 1693798,
                "outBytes": 1675120,
                "inPkts": 4615,
                "outPkts": 4800,
                "totalPkts": 9415,
                "totalBytes": 3368918
            },
            {
                "time": 1445621640000000,
                "inBytes": 1751638,
                "outBytes": 1743836,
                "inPkts": 4723,
                "outPkts": 4758,
                "totalPkts": 9481,
                "totalBytes": 3495474
            },
            {
                "time": 1445621700000000,
                "inBytes": 1688012,
                "outBytes": 1654838,
                "inPkts": 4674,
                "outPkts": 4699,
                "totalPkts": 9373,
                "totalBytes": 3342850
            },
            {
                "time": 1445621760000000,
                "inBytes": 1804924,
                "outBytes": 1733974,
                "inPkts": 4782,
                "outPkts": 4855,
                "totalPkts": 9637,
                "totalBytes": 3538898
            },
            {
                "time": 1445621820000000,
                "inBytes": 1766670,
                "outBytes": 1733686,
                "inPkts": 4803,
                "outPkts": 4875,
                "totalPkts": 9678,
                "totalBytes": 3500356
            },
            {
                "time": 1445621880000000,
                "inBytes": 1736952,
                "outBytes": 1752538,
                "inPkts": 4764,
                "outPkts": 4853,
                "totalPkts": 9617,
                "totalBytes": 3489490
            },
            {
                "time": 1445621940000000,
                "inBytes": 1710916,
                "outBytes": 1736236,
                "inPkts": 4638,
                "outPkts": 4822,
                "totalPkts": 9460,
                "totalBytes": 3447152
            },
            {
                "time": 1445622000000000,
                "inBytes": 1744294,
                "outBytes": 1699356,
                "inPkts": 4703,
                "outPkts": 4778,
                "totalPkts": 9481,
                "totalBytes": 3443650
            },
            {
                "time": 1445622060000000,
                "inBytes": 1663422,
                "outBytes": 1706218,
                "inPkts": 4655,
                "outPkts": 4725,
                "totalPkts": 9380,
                "totalBytes": 3369640
            },
            {
                "time": 1445622120000000,
                "inBytes": 1785482,
                "outBytes": 1691442,
                "inPkts": 4773,
                "outPkts": 4765,
                "totalPkts": 9538,
                "totalBytes": 3476924
            },
            {
                "time": 1445622180000000,
                "inBytes": 1695204,
                "outBytes": 1725416,
                "inPkts": 4722,
                "outPkts": 4760,
                "totalPkts": 9482,
                "totalBytes": 3420620
            },
            {
                "time": 1445622240000000,
                "inBytes": 1669824,
                "outBytes": 1756646,
                "inPkts": 4644,
                "outPkts": 4827,
                "totalPkts": 9471,
                "totalBytes": 3426470
            },
            {
                "time": 1445622300000000,
                "inBytes": 1719144,
                "outBytes": 1729036,
                "inPkts": 4648,
                "outPkts": 4862,
                "totalPkts": 9510,
                "totalBytes": 3448180
            },
            {
                "time": 1445622360000000,
                "inBytes": 1719226,
                "outBytes": 1680672,
                "inPkts": 4517,
                "outPkts": 4700,
                "totalPkts": 9217,
                "totalBytes": 3399898
            },
            {
                "time": 1445622420000000,
                "inBytes": 1736488,
                "outBytes": 1763060,
                "inPkts": 4788,
                "outPkts": 4854,
                "totalPkts": 9642,
                "totalBytes": 3499548
            },
            {
                "time": 1445622480000000,
                "inBytes": 1733046,
                "outBytes": 1699086,
                "inPkts": 4707,
                "outPkts": 4767,
                "totalPkts": 9474,
                "totalBytes": 3432132
            },
            {
                "time": 1445622540000000,
                "inBytes": 1725270,
                "outBytes": 1666882,
                "inPkts": 4743,
                "outPkts": 4709,
                "totalPkts": 9452,
                "totalBytes": 3392152
            },
            {
                "time": 1445622600000000,
                "inBytes": 1655170,
                "outBytes": 1695764,
                "inPkts": 4681,
                "outPkts": 4682,
                "totalPkts": 9363,
                "totalBytes": 3350934
            },
            {
                "time": 1445622660000000,
                "inBytes": 1678720,
                "outBytes": 1679924,
                "inPkts": 4628,
                "outPkts": 4790,
                "totalPkts": 9418,
                "totalBytes": 3358644
            },
            {
                "time": 1445622720000000,
                "inBytes": 1655556,
                "outBytes": 1684900,
                "inPkts": 4590,
                "outPkts": 4754,
                "totalPkts": 9344,
                "totalBytes": 3340456
            },
            {
                "time": 1445622780000000,
                "inBytes": 1729914,
                "outBytes": 1716514,
                "inPkts": 4749,
                "outPkts": 4761,
                "totalPkts": 9510,
                "totalBytes": 3446428
            }
        ]
    };
    this.networkingStatsTopMockData = {
        "sport": [],
        "dport": [],
        "startTime": 1441880529000,
        "endTime": 1441881129000
    };
    this.networkingStatsMockData = [
        {
            "value": []
        }
    ];

    return {
        domainsMockData                  : domainsMockData,
        projectsMockData                 : projectsMockData,
        demoProjectMockData              : demoProjectMockData,
        virtualMachineMockData           : virtualMachineMockData,
        virtualMachineStatsMockData      : virtualMachineStatsMockData,
        virtualMachineInterfacesMockData : virtualMachineInterfacesMockData,
        virtualMachineConnectedGraphMockData : virtualMachineConnectedGraphMockData,
        reportsQueryMockData             : reportsQueryMockData,
        virtualMachineFlowSeriesMockData : virtualMachineFlowSeriesMockData,
        networkingStatsTopMockData       : networkingStatsTopMockData,
        networkingStatsMockData          : networkingStatsMockData
    };
});
