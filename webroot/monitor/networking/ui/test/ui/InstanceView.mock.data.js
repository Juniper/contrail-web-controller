/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function (_) {
    this.domainsMockData = {
        "domains": [
            {
                "href": "http://10.84.11.2:9100/domain/35468934-bfe5-4c0e-84e2-ddfc9b49af74",
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
                "fq_name": [
                    "default-domain",
                    "admin"
                ]
            },
            {
                "uuid": "c3fa1bb4-b04d-4f29-8bb4-7343d8fbeb21",
                "fq_name": [
                    "default-domain",
                    "scalevns"
                ]
            },
            {
                "uuid": "efdfd856-b362-4b5c-ad17-09cc3acfd859",
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
            "start_time": 1441873928000000,
            "end_time": 1441881128000000,
            "timeGran_microsecs": 60000000
        },
        "flow-series": [
            {
                "time": 1441873928000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441873988000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441874048000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441874108000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441874168000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441874228000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441874288000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441874348000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441874408000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441874468000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441874528000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441874588000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441874648000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441874708000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441874768000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441874828000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441874888000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441874948000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441875008000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441875068000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441875128000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441875188000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441875248000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441875308000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441875368000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441875428000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441875488000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441875548000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441875608000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441875668000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441875728000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441875788000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441875848000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441875908000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441875968000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441876028000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441876088000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441876148000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441876208000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441876268000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441876328000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441876388000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441876448000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441876508000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441876568000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441876628000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441876688000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441876748000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441876808000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441876868000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441876928000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441876988000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441877048000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441877108000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441877168000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441877228000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441877288000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441877348000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441877408000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441877468000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441877528000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441877588000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441877648000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441877708000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441877768000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441877828000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441877888000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441877948000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441878008000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441878068000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441878128000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441878188000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441878248000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441878308000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441878368000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441878428000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441878488000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441878548000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441878608000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441878668000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441878728000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441878788000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441878848000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441878908000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441878968000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441879028000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441879088000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441879148000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441879208000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441879268000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441879328000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441879388000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441879448000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441879508000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441879568000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441879628000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441879688000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441879748000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441879808000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441879868000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441879928000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441879988000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441880048000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441880108000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441880168000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441880228000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441880288000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441880348000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441880408000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441880468000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441880528000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441880588000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441880648000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441880708000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441880768000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441880828000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441880888000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441880948000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441881008000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            },
            {
                "time": 1441881068000000,
                "outPkts": 0,
                "outBytes": 0,
                "inPkts": 0,
                "inBytes": 0,
                "totalPkts": 0,
                "totalBytes": 0
            }
        ]
    }
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
