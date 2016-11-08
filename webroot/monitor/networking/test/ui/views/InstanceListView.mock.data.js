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
    this.instancesListMockData = {
        "opVMList": [
            "5199c65e-8b71-4e4c-90cc-58deea9752dd",
            "c73ed229-bbf2-4e1e-be26-4aee2d1780b3",
            "faa5b186-5383-4670-b640-ad230fe2100f"
        ],
        "configVMList": [
            "5199c65e-8b71-4e4c-90cc-58deea9752dd",
            "c73ed229-bbf2-4e1e-be26-4aee2d1780b3",
            "faa5b186-5383-4670-b640-ad230fe2100f"
        ]
    };
    this.instancesDetailsMockData = {
        "data": {
            "value": [
            {
                "name": "5199c65e-8b71-4e4c-90cc-58deea9752dd",
                "value": {
                    "VirtualMachineStats": {
                        "cpu_stats": [
                        {
                            "virt_memory": 4677268,
                            "cpu_one_min_avg": 1.31148,
                            "disk_used_bytes": 940285952,
                            "vm_memory_quota": 2097152,
                            "peak_virt_memory": 5171480,
                            "disk_allocated_bytes": 4294967295,
                            "rss": 297976
                        }
                        ]
                    },
                    "UveVirtualMachineAgent": {
                        "udp_sport_bitmap": [
                            "1",
                        "0",
                        "0",
                        "0",
                        "2147450879",
                        "4294967295",
                        "4294967295",
                        "32767"
                            ],
                        "vm_name": "front01",
                        "tcp_sport_bitmap": [
                            "1",
                        "0",
                        "0",
                        "0",
                        "2261540",
                        "67147784",
                        "2350023012",
                        "1048"
                            ],
                        "uuid": "5199c65e-8b71-4e4c-90cc-58deea9752dd",
                        "udp_dport_bitmap": [
                            "1",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0"
                            ],
                        "cpu_info": {
                            "virt_memory": 4677268,
                            "cpu_one_min_avg": 1.31148,
                            "disk_used_bytes": 940285952,
                            "vm_memory_quota": 2097152,
                            "peak_virt_memory": 5171480,
                            "disk_allocated_bytes": 4294967295,
                            "rss": 297976
                        },
                        "vrouter": "a7s12",
                        "tcp_dport_bitmap": [
                            "1",
                        "8",
                        "0",
                        "0",
                        "131108",
                        "8",
                        "1048576",
                        "1024"
                            ],
                        "interface_list": [
                            "default-domain:admin:08242801-ff6e-44d4-876d-4a001ba21862"
                            ]
                    }
                }
            },
            {
                "name": "c73ed229-bbf2-4e1e-be26-4aee2d1780b3",
                "value": {
                    "VirtualMachineStats": {
                        "cpu_stats": [
                        {
                            "virt_memory": 4676948,
                            "cpu_one_min_avg": 0.166667,
                            "disk_used_bytes": 892678144,
                            "vm_memory_quota": 2097152,
                            "peak_virt_memory": 5169088,
                            "disk_allocated_bytes": 4294967295,
                            "rss": 192668
                        }
                        ]
                    },
                    "UveVirtualMachineAgent": {
                        "udp_sport_bitmap": [
                            "0",
                        "0",
                        "0",
                        "0",
                        "3925729277",
                        "4090493815",
                        "3605977855",
                        "16381"
                            ],
                        "vm_name": "front03",
                        "tcp_sport_bitmap": [
                            "513",
                        "0",
                        "0",
                        "0",
                        "134218756",
                        "536870912",
                        "8388672",
                        "4112"
                            ],
                        "uuid": "c73ed229-bbf2-4e1e-be26-4aee2d1780b3",
                        "udp_dport_bitmap": [
                            "1",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0"
                            ],
                        "cpu_info": {
                            "virt_memory": 4676948,
                            "cpu_one_min_avg": 0.166667,
                            "disk_used_bytes": 892678144,
                            "vm_memory_quota": 2097152,
                            "peak_virt_memory": 5169088,
                            "disk_allocated_bytes": 4294967295,
                            "rss": 192668
                        },
                        "vrouter": "a7s12",
                        "tcp_dport_bitmap": [
                            "1",
                        "65536",
                        "0",
                        "0",
                        "134218756",
                        "536870912",
                        "8388608",
                        "4112"
                            ],
                        "interface_list": [
                            "default-domain:admin:fede15b7-548a-4dac-a7ab-c88749e4dcca"
                            ]
                    }
                }
            },
            {
                "name": "faa5b186-5383-4670-b640-ad230fe2100f",
                "value": {
                    "VirtualMachineStats": {
                        "cpu_stats": [
                        {
                            "virt_memory": 4672980,
                            "cpu_one_min_avg": 0.166667,
                            "disk_used_bytes": 679682048,
                            "vm_memory_quota": 2097152,
                            "peak_virt_memory": 5169040,
                            "disk_allocated_bytes": 4294967295,
                            "rss": 185512
                        }
                        ]
                    },
                    "UveVirtualMachineAgent": {
                        "udp_sport_bitmap": [
                            "0",
                        "0",
                        "0",
                        "0",
                        "4290740218",
                        "4294898175",
                        "3751279046",
                        "16252"
                            ],
                        "vm_name": "front02",
                        "tcp_sport_bitmap": [
                            "1",
                        "65536",
                        "0",
                        "0",
                        "10272",
                        "50331652",
                        "0",
                        "6"
                            ],
                        "uuid": "faa5b186-5383-4670-b640-ad230fe2100f",
                        "udp_dport_bitmap": [
                            "1",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0"
                            ],
                        "cpu_info": {
                            "virt_memory": 4672980,
                            "cpu_one_min_avg": 0.166667,
                            "disk_used_bytes": 679682048,
                            "vm_memory_quota": 2097152,
                            "peak_virt_memory": 5169040,
                            "disk_allocated_bytes": 4294967295,
                            "rss": 185512
                        },
                        "vrouter": "a7s12",
                        "tcp_dport_bitmap": [
                            "513",
                        "0",
                        "0",
                        "0",
                        "8224",
                        "50331652",
                        "0",
                        "6"
                            ],
                        "interface_list": [
                            "default-domain:admin:fbf56475-71dc-46dd-bf8e-0f8dc127dc82"
                            ]
                    }
                }
            }
            ]
        },
        "lastKey": null,
        "more": false,
        "vmiData": {
            "value": [
            {
                "name": "default-domain:admin:08242801-ff6e-44d4-876d-4a001ba21862",
                "value": {
                    "UVEAlarms": {
                        "alarms": [
                        {
                            "severity": 2,
                            "alarm_rules": {
                                "or_list": [
                                {
                                    "and_list": [
                                    {
                                        "condition": {
                                            "operation": "<=",
                                            "operand1": "UveVMInterfaceAgent.added_flows_ewm.sigma",
                                            "variables": [
                                                "UveVMInterfaceAgent.vm_name",
                                            "UveVMInterfaceAgent.virtual_network"
                                                ],
                                            "operand2": {
                                                "json_value": "1"
                                            }
                                        },
                                        "match": [
                                        {
                                            "json_operand1_value": "-2.90129e-44",
                                            "json_variables": {
                                                "UveVMInterfaceAgent.virtual_network": "\"default-domain:admin:frontend\"",
                                                "UveVMInterfaceAgent.vm_name": "\"front01\""
                                            }
                                        }
                                        ]
                                    }
                                    ]
                                }
                                ]
                            },
                            "timestamp": 1480025795039256,
                            "ack": false,
                            "token": "eyJ0aW1lc3RhbXAiOiAxNDgwMDI1Nzk1MDM5MjU2LCAiaHR0cF9wb3J0IjogNTk5NSwgImhvc3RfaXAiOiAiMTAuODQuMzAuMjQ5In0=",
                            "type": "VMI Flow Test Alarm",
                            "description": "VMI Flow Test Alarm"
                        }
                        ]
                    },
                    "UveVMInterfaceAgent": {
                        "ip6_active": false,
                        "if_stats": {
                            "out_bytes": 862276,
                            "in_pkts": 2633,
                            "out_pkts": 2634,
                            "in_bytes": 885690
                        },
                        "vm_uuid": "5199c65e-8b71-4e4c-90cc-58deea9752dd",
                        "port_bucket_bmap": {
                            "udp_sport_bitmap": [
                                "1",
                            "0",
                            "0",
                            "0",
                            "2147450879",
                            "4294967295",
                            "4294967295",
                            "32767"
                                ],
                            "tcp_dport_bitmap": [
                                "1",
                            "8",
                            "0",
                            "0",
                            "131108",
                            "8",
                            "1048576",
                            "1024"
                                ],
                            "tcp_sport_bitmap": [
                                "1",
                            "0",
                            "0",
                            "0",
                            "2261540",
                            "67147784",
                            "2350023012",
                            "1048"
                                ],
                            "udp_dport_bitmap": [
                                "1",
                            "0",
                            "0",
                            "0",
                            "0",
                            "0",
                            "0",
                            "0"
                                ]
                        },
                        "ip6_address": "::",
                        "gateway": "10.1.1.1",
                        "uuid": "08242801-ff6e-44d4-876d-4a001ba21862",
                        "floating_ips": [
                        {
                            "virtual_network": "default-domain:admin:frontend",
                            "ip_address": "10.1.1.4"
                        }
                        ],
                            "label": 22,
                            "ip4_active": true,
                            "mac_address": "02:08:24:28:01:ff",
                            "if_out_pkts_ewm": {
                                "config": "0.1",
                                "state": {
                                    "stddev": "36.8608",
                                    "mean": "2600.77"
                                },
                                "sigma": 0.901604,
                                "algo": "EWM",
                                "samples": 46731
                            },
                            "l2_active": true,
                            "added_flows_ewm": {
                                "config": "0.1",
                                "state": {
                                    "stddev": "4.21796e-43",
                                    "mean": "1.22375e-86"
                                },
                                "sigma": -2.90129e-44,
                                "algo": "EWM",
                                "samples": 46731
                            },
                            "vm_name": "front01",
                            "out_bw_usage": 229940,
                            "deleted_flows_ewm": {
                                "config": "0.1",
                                "state": {
                                    "stddev": "4.00568e-43",
                                    "mean": "1.34397e-86"
                                },
                                "sigma": -3.35517e-44,
                                "algo": "EWM",
                                "samples": 46731
                            },
                            "is_health_check_active": true,
                            "flow_rate": {
                                "active_flows": 100,
                                "max_flow_deletes_per_second": 0,
                                "added_flows": 0,
                                "deleted_flows": 0,
                                "min_flow_adds_per_second": 0,
                                "min_flow_deletes_per_second": 0,
                                "max_flow_adds_per_second": 0
                            },
                            "virtual_network": "default-domain:admin:frontend",
                            "active": true,
                            "ip_address": "10.1.1.3",
                            "fixed_ip4_list": [
                                "10.1.1.3"
                                ],
                            "in_bw_usage": 236184,
                            "active_flows_ewm": {
                                "config": "0.1",
                                "state": {
                                    "stddev": "8.08896e-14",
                                    "mean": "100"
                                },
                                "sigma": -1.05409,
                                "algo": "EWM",
                                "samples": 46731
                            },
                            "fip_agg_stats": [
                            {
                                "out_bytes": 0,
                                "in_bytes": 0,
                                "out_pkts": 0,
                                "virtual_network": "default-domain:admin:frontend",
                                "in_pkts": 0,
                                "ip_address": "10.1.1.4"
                            }
                        ],
                            "admin_state": true,
                            "if_in_pkts_ewm": {
                                "config": "0.1",
                                "state": {
                                    "stddev": "35.0114",
                                    "mean": "2598.78"
                                },
                                "sigma": 0.977533,
                                "algo": "EWM",
                                "samples": 46731
                            },
                            "sg_rule_stats": [
                            {
                                "count": 6,
                                "rule": "00000000-0000-0000-0000-000000000001"
                            },
                            {
                                "count": 0,
                                "rule": "00000000-0000-0000-0000-000000000003"
                            },
                            {
                                "count": 0,
                                "rule": "00000000-0000-0000-0000-000000000004"
                            },
                            {
                                "count": 0,
                                "rule": "b4f66ab7-c373-4a0c-a498-dc6102f69c59"
                            }
                        ]
                    }
                }
            },
            {
                "name": "default-domain:admin:fede15b7-548a-4dac-a7ab-c88749e4dcca",
                "value": {
                    "UVEAlarms": {
                        "alarms": [
                        {
                            "severity": 2,
                            "alarm_rules": {
                                "or_list": [
                                {
                                    "and_list": [
                                    {
                                        "condition": {
                                            "operation": "<=",
                                            "operand1": "UveVMInterfaceAgent.added_flows_ewm.sigma",
                                            "variables": [
                                                "UveVMInterfaceAgent.vm_name",
                                            "UveVMInterfaceAgent.virtual_network"
                                                ],
                                            "operand2": {
                                                "json_value": "1"
                                            }
                                        },
                                        "match": [
                                        {
                                            "json_operand1_value": "-2.0805e-44",
                                            "json_variables": {
                                                "UveVMInterfaceAgent.virtual_network": "\"default-domain:admin:frontend\"",
                                                "UveVMInterfaceAgent.vm_name": "\"front03\""
                                            }
                                        }
                                        ]
                                    }
                                    ]
                                }
                                ]
                            },
                            "timestamp": 1480025794242134,
                            "ack": false,
                            "token": "eyJ0aW1lc3RhbXAiOiAxNDgwMDI1Nzk0MjQyMTM0LCAiaHR0cF9wb3J0IjogNTk5NSwgImhvc3RfaXAiOiAiMTAuODQuMzAuMjQ5In0=",
                            "type": "VMI Flow Test Alarm",
                            "description": "VMI Flow Test Alarm"
                        }
                        ]
                    },
                    "UveVMInterfaceAgent": {
                        "ip6_active": false,
                        "if_stats": {
                            "out_bytes": 2940,
                            "in_pkts": 30,
                            "out_pkts": 30,
                            "in_bytes": 2940
                        },
                        "vm_uuid": "c73ed229-bbf2-4e1e-be26-4aee2d1780b3",
                        "port_bucket_bmap": {
                            "udp_sport_bitmap": [
                                "0",
                            "0",
                            "0",
                            "0",
                            "3925729277",
                            "4090493815",
                            "3605977855",
                            "16381"
                                ],
                            "tcp_dport_bitmap": [
                                "1",
                            "65536",
                            "0",
                            "0",
                            "134218756",
                            "536870912",
                            "8388608",
                            "4112"
                                ],
                            "tcp_sport_bitmap": [
                                "513",
                            "0",
                            "0",
                            "0",
                            "134218756",
                            "536870912",
                            "8388672",
                            "4112"
                                ],
                            "udp_dport_bitmap": [
                                "1",
                            "0",
                            "0",
                            "0",
                            "0",
                            "0",
                            "0",
                            "0"
                                ]
                        },
                        "ip6_address": "::",
                        "gateway": "10.1.1.1",
                        "uuid": "fede15b7-548a-4dac-a7ab-c88749e4dcca",
                        "label": 29,
                        "ip4_active": true,
                        "mac_address": "02:fe:de:15:b7:54",
                        "if_out_pkts_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "5.594e-08",
                                "mean": "30"
                            },
                            "sigma": 1.90528e-7,
                            "algo": "EWM",
                            "samples": 42234
                        },
                        "l2_active": true,
                        "added_flows_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "3.22354e-43",
                                "mean": "6.70659e-87"
                            },
                            "sigma": -2.0805e-44,
                            "algo": "EWM",
                            "samples": 42234
                        },
                        "vm_name": "front03",
                        "out_bw_usage": 784,
                        "deleted_flows_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "2.79151e-43",
                                "mean": "7.39609e-87"
                            },
                            "sigma": -2.6495e-44,
                            "algo": "EWM",
                            "samples": 42234
                        },
                        "is_health_check_active": true,
                        "flow_rate": {
                            "active_flows": 1,
                            "max_flow_deletes_per_second": 0,
                            "added_flows": 0,
                            "deleted_flows": 0,
                            "min_flow_adds_per_second": 0,
                            "min_flow_deletes_per_second": 0,
                            "max_flow_adds_per_second": 0
                        },
                        "virtual_network": "default-domain:admin:frontend",
                        "active": true,
                        "ip_address": "10.1.1.6",
                        "fixed_ip4_list": [
                            "10.1.1.6"
                            ],
                        "in_bw_usage": 784,
                        "active_flows_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "1.47455e-15",
                                "mean": "1"
                            },
                            "sigma": -1.05409,
                            "algo": "EWM",
                            "samples": 42234
                        },
                        "admin_state": true,
                        "if_in_pkts_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "5.594e-08",
                                "mean": "30"
                            },
                            "sigma": 1.90528e-7,
                            "algo": "EWM",
                            "samples": 42234
                        },
                        "sg_rule_stats": [
                        {
                            "count": 2,
                            "rule": "00000000-0000-0000-0000-000000000001"
                        },
                        {
                            "count": 0,
                            "rule": "00000000-0000-0000-0000-000000000003"
                        },
                        {
                            "count": 0,
                            "rule": "00000000-0000-0000-0000-000000000004"
                        },
                        {
                            "count": 0,
                            "rule": "3a92b35f-58a4-4435-acfd-e5ae79944f92"
                        },
                        {
                            "count": 0,
                            "rule": "b4f66ab7-c373-4a0c-a498-dc6102f69c59"
                        }
                        ]
                    }
                }
            },
            {
                "name": "default-domain:admin:fbf56475-71dc-46dd-bf8e-0f8dc127dc82",
                "value": {
                    "UVEAlarms": {
                        "alarms": [
                        {
                            "severity": 2,
                            "alarm_rules": {
                                "or_list": [
                                {
                                    "and_list": [
                                    {
                                        "condition": {
                                            "operation": "<=",
                                            "operand1": "UveVMInterfaceAgent.added_flows_ewm.sigma",
                                            "variables": [
                                                "UveVMInterfaceAgent.vm_name",
                                            "UveVMInterfaceAgent.virtual_network"
                                                ],
                                            "operand2": {
                                                "json_value": "1"
                                            }
                                        },
                                        "match": [
                                        {
                                            "json_operand1_value": "-3.89035e-44",
                                            "json_variables": {
                                                "UveVMInterfaceAgent.virtual_network": "\"default-domain:admin:frontend\"",
                                                "UveVMInterfaceAgent.vm_name": "\"front02\""
                                            }
                                        }
                                        ]
                                    }
                                    ]
                                }
                                ]
                            },
                            "timestamp": 1480025794180713,
                            "ack": false,
                            "token": "eyJ0aW1lc3RhbXAiOiAxNDgwMDI1Nzk0MTgwNzEzLCAiaHR0cF9wb3J0IjogNTk5NSwgImhvc3RfaXAiOiAiMTAuODQuMzAuMjQ5In0=",
                            "type": "VMI Flow Test Alarm",
                            "description": "VMI Flow Test Alarm"
                        }
                        ]
                    },
                    "UveVMInterfaceAgent": {
                        "ip6_active": false,
                        "if_stats": {
                            "out_bytes": 2982,
                            "in_pkts": 31,
                            "out_pkts": 31,
                            "in_bytes": 2982
                        },
                        "vm_uuid": "faa5b186-5383-4670-b640-ad230fe2100f",
                        "port_bucket_bmap": {
                            "udp_sport_bitmap": [
                                "0",
                            "0",
                            "0",
                            "0",
                            "4290740218",
                            "4294898175",
                            "3751279046",
                            "16252"
                                ],
                            "tcp_dport_bitmap": [
                                "513",
                            "0",
                            "0",
                            "0",
                            "8224",
                            "50331652",
                            "0",
                            "6"
                                ],
                            "tcp_sport_bitmap": [
                                "1",
                            "65536",
                            "0",
                            "0",
                            "10272",
                            "50331652",
                            "0",
                            "6"
                                ],
                            "udp_dport_bitmap": [
                                "1",
                            "0",
                            "0",
                            "0",
                            "0",
                            "0",
                            "0",
                            "0"
                                ]
                        },
                        "ip6_address": "::",
                        "gateway": "10.1.1.1",
                        "uuid": "fbf56475-71dc-46dd-bf8e-0f8dc127dc82",
                        "label": 27,
                        "ip4_active": true,
                        "mac_address": "02:fb:f5:64:75:71",
                        "if_out_pkts_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "0.342717",
                                "mean": "30.8809"
                            },
                            "sigma": 0.347497,
                            "algo": "EWM",
                            "samples": 42236
                        },
                        "l2_active": true,
                        "added_flows_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "5.53722e-43",
                                "mean": "2.15417e-86"
                            },
                            "sigma": -3.89035e-44,
                            "algo": "EWM",
                            "samples": 42236
                        },
                        "vm_name": "front02",
                        "out_bw_usage": 795,
                        "deleted_flows_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "4.98316e-43",
                                "mean": "2.35686e-86"
                            },
                            "sigma": -4.72966e-44,
                            "algo": "EWM",
                            "samples": 42236
                        },
                        "is_health_check_active": true,
                        "flow_rate": {
                            "active_flows": 1,
                            "max_flow_deletes_per_second": 0,
                            "added_flows": 0,
                            "deleted_flows": 0,
                            "min_flow_adds_per_second": 0,
                            "min_flow_deletes_per_second": 0,
                            "max_flow_adds_per_second": 0
                        },
                        "virtual_network": "default-domain:admin:frontend",
                        "active": true,
                        "ip_address": "10.1.1.5",
                        "fixed_ip4_list": [
                            "10.1.1.5"
                            ],
                        "in_bw_usage": 795,
                        "active_flows_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "1.47455e-15",
                                "mean": "1"
                            },
                            "sigma": -1.05409,
                            "algo": "EWM",
                            "samples": 42236
                        },
                        "admin_state": true,
                        "if_in_pkts_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "0.342717",
                                "mean": "30.8809"
                            },
                            "sigma": 0.347497,
                            "algo": "EWM",
                            "samples": 42236
                        },
                        "sg_rule_stats": [
                        {
                            "count": 2,
                            "rule": "00000000-0000-0000-0000-000000000001"
                        },
                        {
                            "count": 0,
                            "rule": "00000000-0000-0000-0000-000000000003"
                        },
                        {
                            "count": 0,
                            "rule": "00000000-0000-0000-0000-000000000004"
                        },
                        {
                            "count": 0,
                            "rule": "3a92b35f-58a4-4435-acfd-e5ae79944f92"
                        },
                        {
                            "count": 0,
                            "rule": "b4f66ab7-c373-4a0c-a498-dc6102f69c59"
                        }
                        ]
                    }
                }
            }
            ]
        }
    }
    return {
        domainsMockData                  : domainsMockData,
        projectsMockData                 : projectsMockData,
        adminProjectMockData             : adminProjectMockData,
        instancesListMockData            : instancesListMockData,
        virtualMachinesMockData          : virtualMachinesMockData,
        instancesDetailsMockData         : instancesDetailsMockData,
        virtualMachinesMockStatData      : virtualMachinesMockStatData,
        virtualMachinesInterfacesMockData: virtualMachinesInterfacesMockData
    };
});
