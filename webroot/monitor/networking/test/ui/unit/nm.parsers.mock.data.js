/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function (_) {

    function NMParserMockData() {
        var mockData = {
            "networkDataParser" : {
                "input" :{
                    "test1" : {
                        "data": {
                            "value": [
                                {
                                    "name": "default-domain:admin:backend",
                                    "value": {
                                        "UveVirtualNetworkAgent": {
                                            "total_acl_rules": 4,
                                            "in_bandwidth_usage": 228772,
                                            "egress_flow_count": 100,
                                            "acl": "default-domain:admin:backend:backend",
                                            "virtualmachine_list": [
                                                "83c58a58-2474-45ce-b25b-0b19dc12dda0"
                                            ],
                                            "interface_list": [
                                                "default-domain:admin:b261f2a7-daee-49d3-bbec-89c45b63bd9e"
                                            ],
                                            "ingress_flow_count": 100,
                                            "out_bandwidth_usage": 238423
                                        }
                                    }
                                },
                                {
                                    "name": "default-domain:admin:frontend",
                                    "value": {
                                        "UveVirtualNetworkAgent": {
                                            "total_acl_rules": 4,
                                            "in_bandwidth_usage": 238423,
                                            "egress_flow_count": 100,
                                            "acl": "default-domain:admin:frontend:frontend",
                                            "virtualmachine_list": [
                                                "e1cd28da-232d-4320-8598-7debfe2c9f6e"
                                            ],
                                            "interface_list": [
                                                "default-domain:admin:0ae48400-dc06-4301-a5da-6b1e614b284d"
                                            ],
                                            "ingress_flow_count": 100,
                                            "out_bandwidth_usage": 228772
                                        }
                                    }
                                },
                                {
                                    "name": "default-domain:default-project:__link_local__",
                                    "value": {}
                                },
                                {
                                    "name": "default-domain:default-project:default-virtual-network",
                                    "value": {}
                                },
                                {
                                    "name": "default-domain:default-project:ip-fabric",
                                    "value": {}
                                }
                            ]
                        },
                        "lastKey": null,
                        "more": false
                    },
                    "test2" : {
                        "data": {
                            "value": [
                                {
                                    "name": "default-domain:admin:backend",
                                    "value": {
                                        "UveVirtualNetworkAgent": {
                                            "total_acl_rules": 4,
                                            "in_bandwidth_usage": 228814,
                                            "egress_flow_count": 100,
                                            "acl": "default-domain:admin:backend:backend",
                                            "virtualmachine_list": [
                                                "83c58a58-2474-45ce-b25b-0b19dc12dda0"
                                            ],
                                            "interface_list": [
                                                "default-domain:admin:b261f2a7-daee-49d3-bbec-89c45b63bd9e"
                                            ],
                                            "ingress_flow_count": 100,
                                            "out_bandwidth_usage": 224429
                                        }
                                    }
                                },
                                {
                                    "name": "default-domain:admin:frontend",
                                    "value": {
                                        "UveVirtualNetworkAgent": {
                                            "total_acl_rules": 4,
                                            "in_bandwidth_usage": 224429,
                                            "egress_flow_count": 100,
                                            "acl": "default-domain:admin:frontend:frontend",
                                            "virtualmachine_list": [
                                                "e1cd28da-232d-4320-8598-7debfe2c9f6e"
                                            ],
                                            "interface_list": [
                                                "default-domain:admin:0ae48400-dc06-4301-a5da-6b1e614b284d"
                                            ],
                                            "ingress_flow_count": 100,
                                            "out_bandwidth_usage": 228814
                                        }
                                    }
                                },
                                {
                                    "name": "default-domain:default-project:__link_local__",
                                    "value": {}
                                },
                                {
                                    "name": "default-domain:default-project:default-virtual-network",
                                    "value": {}
                                },
                                {
                                    "name": "default-domain:default-project:ip-fabric",
                                    "value": {}
                                }
                            ]
                        },
                        "lastKey": null,
                        "more": false
                    }
                },
                "output" : {
                    "test1" : [
                        {
                            "name": "default-domain:admin:backend",
                            "value": {
                                "UveVirtualNetworkAgent": {
                                    "total_acl_rules": 4,
                                    "in_bandwidth_usage": 228772,
                                    "egress_flow_count": 100,
                                    "acl": "default-domain:admin:backend:backend",
                                    "virtualmachine_list": [
                                        "83c58a58-2474-45ce-b25b-0b19dc12dda0"
                                    ],
                                    "interface_list": [
                                        "default-domain:admin:b261f2a7-daee-49d3-bbec-89c45b63bd9e"
                                    ],
                                    "ingress_flow_count": 100,
                                    "out_bandwidth_usage": 238423
                                }
                            },
                            "rawData": {
                                "name": "default-domain:admin:backend",
                                "value": {
                                    "UveVirtualNetworkAgent": {
                                        "total_acl_rules": 4,
                                        "in_bandwidth_usage": 228772,
                                        "egress_flow_count": 100,
                                        "acl": "default-domain:admin:backend:backend",
                                        "virtualmachine_list": [
                                            "83c58a58-2474-45ce-b25b-0b19dc12dda0"
                                        ],
                                        "interface_list": [
                                            "default-domain:admin:b261f2a7-daee-49d3-bbec-89c45b63bd9e"
                                        ],
                                        "ingress_flow_count": 100,
                                        "out_bandwidth_usage": 238423
                                    }
                                }
                            },
                            "url": "/api/tenant/networking/virtual-network/summary?fqNameRegExp=default-domain:admin:backend",
                            "egress_flow_count": 100,
                            "ingress_flow_count": 100,
                            "outBytes60": "-",
                            "inBytes60": "-",
                            "instCnt": 1,
                            "inThroughput": 228772,
                            "outThroughput": 238423,
                            "intfCnt": 1,
                            "vnCnt": 0,
                            "throughput": 467195,
                            "x": 1,
                            "y": 0,
                            "size": 467195,
                            "type": "network",
                            "project": "default-domain:admin"
                        },
                        {
                            "name": "default-domain:admin:frontend",
                            "value": {
                                "UveVirtualNetworkAgent": {
                                    "total_acl_rules": 4,
                                    "in_bandwidth_usage": 238423,
                                    "egress_flow_count": 100,
                                    "acl": "default-domain:admin:frontend:frontend",
                                    "virtualmachine_list": [
                                        "e1cd28da-232d-4320-8598-7debfe2c9f6e"
                                    ],
                                    "interface_list": [
                                        "default-domain:admin:0ae48400-dc06-4301-a5da-6b1e614b284d"
                                    ],
                                    "ingress_flow_count": 100,
                                    "out_bandwidth_usage": 228772
                                }
                            },
                            "rawData": {
                                "name": "default-domain:admin:frontend",
                                "value": {
                                    "UveVirtualNetworkAgent": {
                                        "total_acl_rules": 4,
                                        "in_bandwidth_usage": 238423,
                                        "egress_flow_count": 100,
                                        "acl": "default-domain:admin:frontend:frontend",
                                        "virtualmachine_list": [
                                            "e1cd28da-232d-4320-8598-7debfe2c9f6e"
                                        ],
                                        "interface_list": [
                                            "default-domain:admin:0ae48400-dc06-4301-a5da-6b1e614b284d"
                                        ],
                                        "ingress_flow_count": 100,
                                        "out_bandwidth_usage": 228772
                                    }
                                }
                            },
                            "url": "/api/tenant/networking/virtual-network/summary?fqNameRegExp=default-domain:admin:frontend",
                            "egress_flow_count": 100,
                            "ingress_flow_count": 100,
                            "outBytes60": "-",
                            "inBytes60": "-",
                            "instCnt": 1,
                            "inThroughput": 238423,
                            "outThroughput": 228772,
                            "intfCnt": 1,
                            "vnCnt": 0,
                            "throughput": 467195,
                            "x": 1,
                            "y": 0,
                            "size": 467195,
                            "type": "network",
                            "project": "default-domain:admin"
                        },
                        {
                            "name": "default-domain:default-project:__link_local__",
                            "value": {},
                            "rawData": {
                                "name": "default-domain:default-project:__link_local__",
                                "value": {}
                            },
                            "url": "/api/tenant/networking/virtual-network/summary?fqNameRegExp=default-domain:default-project:__link_local__",
                            "egress_flow_count": 0,
                            "ingress_flow_count": 0,
                            "outBytes60": "-",
                            "inBytes60": "-",
                            "instCnt": 0,
                            "inThroughput": 0,
                            "outThroughput": 0,
                            "intfCnt": 0,
                            "vnCnt": 0,
                            "throughput": 0,
                            "x": 0,
                            "y": 0,
                            "size": 0,
                            "type": "network",
                            "project": "default-domain:default-project"
                        },
                        {
                            "name": "default-domain:default-project:default-virtual-network",
                            "value": {},
                            "rawData": {
                                "name": "default-domain:default-project:default-virtual-network",
                                "value": {}
                            },
                            "url": "/api/tenant/networking/virtual-network/summary?fqNameRegExp=default-domain:default-project:default-virtual-network",
                            "egress_flow_count": 0,
                            "ingress_flow_count": 0,
                            "outBytes60": "-",
                            "inBytes60": "-",
                            "instCnt": 0,
                            "inThroughput": 0,
                            "outThroughput": 0,
                            "intfCnt": 0,
                            "vnCnt": 0,
                            "throughput": 0,
                            "x": 0,
                            "y": 0,
                            "size": 0,
                            "type": "network",
                            "project": "default-domain:default-project"
                        },
                        {
                            "name": "default-domain:default-project:ip-fabric",
                            "value": {},
                            "rawData": {
                                "name": "default-domain:default-project:ip-fabric",
                                "value": {}
                            },
                            "url": "/api/tenant/networking/virtual-network/summary?fqNameRegExp=default-domain:default-project:ip-fabric",
                            "egress_flow_count": 0,
                            "ingress_flow_count": 0,
                            "outBytes60": "-",
                            "inBytes60": "-",
                            "instCnt": 0,
                            "inThroughput": 0,
                            "outThroughput": 0,
                            "intfCnt": 0,
                            "vnCnt": 0,
                            "throughput": 0,
                            "x": 0,
                            "y": 0,
                            "size": 0,
                            "type": "network",
                            "project": "default-domain:default-project"
                        }
                    ],
                    "test2" : [
                        {
                            "name": "default-domain:admin:backend",
                            "value": {
                                "UveVirtualNetworkAgent": {
                                    "total_acl_rules": 4,
                                    "in_bandwidth_usage": 228814,
                                    "egress_flow_count": 100,
                                    "acl": "default-domain:admin:backend:backend",
                                    "virtualmachine_list": [
                                        "83c58a58-2474-45ce-b25b-0b19dc12dda0"
                                    ],
                                    "interface_list": [
                                        "default-domain:admin:b261f2a7-daee-49d3-bbec-89c45b63bd9e"
                                    ],
                                    "ingress_flow_count": 100,
                                    "out_bandwidth_usage": 224429
                                }
                            },
                            "rawData": {
                                "name": "default-domain:admin:backend",
                                "value": {
                                    "UveVirtualNetworkAgent": {
                                        "total_acl_rules": 4,
                                        "in_bandwidth_usage": 228814,
                                        "egress_flow_count": 100,
                                        "acl": "default-domain:admin:backend:backend",
                                        "virtualmachine_list": [
                                            "83c58a58-2474-45ce-b25b-0b19dc12dda0"
                                        ],
                                        "interface_list": [
                                            "default-domain:admin:b261f2a7-daee-49d3-bbec-89c45b63bd9e"
                                        ],
                                        "ingress_flow_count": 100,
                                        "out_bandwidth_usage": 224429
                                    }
                                }
                            },
                            "url": "/api/tenant/networking/virtual-network/summary?fqNameRegExp=default-domain:admin:backend",
                            "egress_flow_count": 100,
                            "ingress_flow_count": 100,
                            "outBytes60": "-",
                            "inBytes60": "-",
                            "instCnt": 1,
                            "inThroughput": 228814,
                            "outThroughput": 224429,
                            "intfCnt": 1,
                            "vnCnt": 0,
                            "throughput": 453243,
                            "x": 1,
                            "y": 0,
                            "size": 453243,
                            "type": "network",
                            "project": "default-domain:admin"
                        },
                        {
                            "name": "default-domain:admin:frontend",
                            "value": {
                                "UveVirtualNetworkAgent": {
                                    "total_acl_rules": 4,
                                    "in_bandwidth_usage": 224429,
                                    "egress_flow_count": 100,
                                    "acl": "default-domain:admin:frontend:frontend",
                                    "virtualmachine_list": [
                                        "e1cd28da-232d-4320-8598-7debfe2c9f6e"
                                    ],
                                    "interface_list": [
                                        "default-domain:admin:0ae48400-dc06-4301-a5da-6b1e614b284d"
                                    ],
                                    "ingress_flow_count": 100,
                                    "out_bandwidth_usage": 228814
                                }
                            },
                            "rawData": {
                                "name": "default-domain:admin:frontend",
                                "value": {
                                    "UveVirtualNetworkAgent": {
                                        "total_acl_rules": 4,
                                        "in_bandwidth_usage": 224429,
                                        "egress_flow_count": 100,
                                        "acl": "default-domain:admin:frontend:frontend",
                                        "virtualmachine_list": [
                                            "e1cd28da-232d-4320-8598-7debfe2c9f6e"
                                        ],
                                        "interface_list": [
                                            "default-domain:admin:0ae48400-dc06-4301-a5da-6b1e614b284d"
                                        ],
                                        "ingress_flow_count": 100,
                                        "out_bandwidth_usage": 228814
                                    }
                                }
                            },
                            "url": "/api/tenant/networking/virtual-network/summary?fqNameRegExp=default-domain:admin:frontend",
                            "egress_flow_count": 100,
                            "ingress_flow_count": 100,
                            "outBytes60": "-",
                            "inBytes60": "-",
                            "instCnt": 1,
                            "inThroughput": 224429,
                            "outThroughput": 228814,
                            "intfCnt": 1,
                            "vnCnt": 0,
                            "throughput": 453243,
                            "x": 1,
                            "y": 0,
                            "size": 453243,
                            "type": "network",
                            "project": "default-domain:admin"
                        },
                        {
                            "name": "default-domain:default-project:__link_local__",
                            "value": {},
                            "rawData": {
                                "name": "default-domain:default-project:__link_local__",
                                "value": {}
                            },
                            "url": "/api/tenant/networking/virtual-network/summary?fqNameRegExp=default-domain:default-project:__link_local__",
                            "egress_flow_count": 0,
                            "ingress_flow_count": 0,
                            "outBytes60": "-",
                            "inBytes60": "-",
                            "instCnt": 0,
                            "inThroughput": 0,
                            "outThroughput": 0,
                            "intfCnt": 0,
                            "vnCnt": 0,
                            "throughput": 0,
                            "x": 0,
                            "y": 0,
                            "size": 0,
                            "type": "network",
                            "project": "default-domain:default-project"
                        },
                        {
                            "name": "default-domain:default-project:default-virtual-network",
                            "value": {},
                            "rawData": {
                                "name": "default-domain:default-project:default-virtual-network",
                                "value": {}
                            },
                            "url": "/api/tenant/networking/virtual-network/summary?fqNameRegExp=default-domain:default-project:default-virtual-network",
                            "egress_flow_count": 0,
                            "ingress_flow_count": 0,
                            "outBytes60": "-",
                            "inBytes60": "-",
                            "instCnt": 0,
                            "inThroughput": 0,
                            "outThroughput": 0,
                            "intfCnt": 0,
                            "vnCnt": 0,
                            "throughput": 0,
                            "x": 0,
                            "y": 0,
                            "size": 0,
                            "type": "network",
                            "project": "default-domain:default-project"
                        },
                        {
                            "name": "default-domain:default-project:ip-fabric",
                            "value": {},
                            "rawData": {
                                "name": "default-domain:default-project:ip-fabric",
                                "value": {}
                            },
                            "url": "/api/tenant/networking/virtual-network/summary?fqNameRegExp=default-domain:default-project:ip-fabric",
                            "egress_flow_count": 0,
                            "ingress_flow_count": 0,
                            "outBytes60": "-",
                            "inBytes60": "-",
                            "instCnt": 0,
                            "inThroughput": 0,
                            "outThroughput": 0,
                            "intfCnt": 0,
                            "vnCnt": 0,
                            "throughput": 0,
                            "x": 0,
                            "y": 0,
                            "size": 0,
                            "type": "network",
                            "project": "default-domain:default-project"
                        }
                    ]
                }
            },
            "instanceDataParser" : {
                "input" : {
                    "test1": {
                        "data": {
                            "value": [
                                {
                                    "name": "83c58a58-2474-45ce-b25b-0b19dc12dda0",
                                    "value": {
                                        "UveVirtualMachineAgent": {
                                            "vm_name": "back01",
                                            "cpu_info": {
                                                "virt_memory": 9151140,
                                                "cpu_one_min_avg": 1.66667,
                                                "disk_used_bytes": 1231302656,
                                                "vm_memory_quota": 4194304,
                                                "peak_virt_memory": 9710484,
                                                "disk_allocated_bytes": 4294967295,
                                                "rss": 1453136
                                            },
                                            "interface_list": [
                                                "default-domain:admin:b261f2a7-daee-49d3-bbec-89c45b63bd9e"
                                            ],
                                            "uuid": "83c58a58-2474-45ce-b25b-0b19dc12dda0",
                                            "vrouter": "b2s40"
                                        }
                                    }
                                },
                                {
                                    "name": "e1cd28da-232d-4320-8598-7debfe2c9f6e",
                                    "value": {
                                        "UveVirtualMachineAgent": {
                                            "vm_name": "front01",
                                            "cpu_info": {
                                                "virt_memory": 9154556,
                                                "cpu_one_min_avg": 1.63934,
                                                "disk_used_bytes": 1242505216,
                                                "vm_memory_quota": 4194304,
                                                "peak_virt_memory": 9698540,
                                                "disk_allocated_bytes": 4294967295,
                                                "rss": 1420764
                                            },
                                            "interface_list": [
                                                "default-domain:admin:0ae48400-dc06-4301-a5da-6b1e614b284d"
                                            ],
                                            "uuid": "e1cd28da-232d-4320-8598-7debfe2c9f6e",
                                            "vrouter": "b2s40"
                                        }
                                    }
                                }
                            ]
                        },
                        "lastKey": null,
                        "more": false
                    }
                },
                "output" : {
                    "test1": [
                        {
                            "name": "83c58a58-2474-45ce-b25b-0b19dc12dda0",
                            "value": {
                                "UveVirtualMachineAgent": {
                                    "vm_name": "back01",
                                    "cpu_info": {
                                        "virt_memory": 9151140,
                                        "cpu_one_min_avg": 1.66667,
                                        "disk_used_bytes": 1231302656,
                                        "vm_memory_quota": 4194304,
                                        "peak_virt_memory": 9710484,
                                        "disk_allocated_bytes": 4294967295,
                                        "rss": 1453136
                                    },
                                    "interface_list": [
                                        "default-domain:admin:b261f2a7-daee-49d3-bbec-89c45b63bd9e"
                                    ],
                                    "uuid": "83c58a58-2474-45ce-b25b-0b19dc12dda0",
                                    "vrouter": "b2s40"
                                }
                            },
                            "inBytes60": "-",
                            "outBytes60": "-",
                            "url": "/api/tenant/networking/virtual-machine/summary?fqNameRegExp=83c58a58-2474-45ce-b25b-0b19dc12dda0?flat",
                            "vmName": "back01",
                            "uuid": "83c58a58-2474-45ce-b25b-0b19dc12dda0",
                            "vRouter": "b2s40",
                            "intfCnt": 1,
                            "vn": false,
                            "ip": [],
                            "x": 1.66667,
                            "y": 1453136,
                            "size": 0
                        },
                        {
                            "name": "e1cd28da-232d-4320-8598-7debfe2c9f6e",
                            "value": {
                                "UveVirtualMachineAgent": {
                                    "vm_name": "front01",
                                    "cpu_info": {
                                        "virt_memory": 9154556,
                                        "cpu_one_min_avg": 1.63934,
                                        "disk_used_bytes": 1242505216,
                                        "vm_memory_quota": 4194304,
                                        "peak_virt_memory": 9698540,
                                        "disk_allocated_bytes": 4294967295,
                                        "rss": 1420764
                                    },
                                    "interface_list": [
                                        "default-domain:admin:0ae48400-dc06-4301-a5da-6b1e614b284d"
                                    ],
                                    "uuid": "e1cd28da-232d-4320-8598-7debfe2c9f6e",
                                    "vrouter": "b2s40"
                                }
                            },
                            "inBytes60": "-",
                            "outBytes60": "-",
                            "url": "/api/tenant/networking/virtual-machine/summary?fqNameRegExp=e1cd28da-232d-4320-8598-7debfe2c9f6e?flat",
                            "vmName": "front01",
                            "uuid": "e1cd28da-232d-4320-8598-7debfe2c9f6e",
                            "vRouter": "b2s40",
                            "intfCnt": 1,
                            "vn": false,
                            "ip": [],
                            "x": 1.63934,
                            "y": 1420764,
                            "size": 0
                        }
                    ]

                }
            },
            "interfaceDataParser": {
                "input": {
                    "test1": {
                          "data": {
                            "value": [
                              {
                                "name": "default-domain:admin:c4045ee4-a2cf-4ca7-854b-f695e0b5be53",
                                "value": {
                                  "ContrailConfig": {
                                    "deleted": false,
                                    "elements": {
                                      "routing_instance_refs": "[{\"to\": [\"default-domain\", \"admin\", \"test1\", \"test1\"], \"attr\": {\"direction\": \"both\", \"protocol\": null, \"ipv6_service_chain_address\": null, \"dst_mac\": null, \"mpls_label\": null, \"vlan_tag\": null, \"src_mac\": null, \"service_chain_address\": null}, \"uuid\": \"825072f9-b522-43d4-be72-8683e2befe94\"}]",
                                      "parent_uuid": "\"f8c4849f-d86f-44a2-bdec-1756e3034d79\"",
                                      "virtual_machine_interface_bindings": "{\"key_value_pair\": [{\"key\": \"host_id\", \"value\": \"nodeg3\"}, {\"key\": \"vif_type\", \"value\": \"vrouter\"}, {\"key\": \"vnic_type\", \"value\": \"normal\"}]}",
                                      "security_group_refs": "[{\"to\": [\"default-domain\", \"admin\", \"default\"], \"attr\": null, \"uuid\": \"f262afaf-45db-42b7-b6ee-32f66589c672\"}]",
                                      "virtual_machine_interface_disable_policy": "false",
                                      "parent_type": "\"project\"",
                                      "uuid": "\"c4045ee4-a2cf-4ca7-854b-f695e0b5be53\"",
                                      "virtual_network_refs": "[{\"to\": [\"default-domain\", \"admin\", \"test1\"], \"attr\": null, \"uuid\": \"4a5429be-8bc3-484a-9315-fb87bdf3851d\"}]",
                                      "display_name": "\"c4045ee4-a2cf-4ca7-854b-f695e0b5be53\"",
                                      "perms2": "{\"owner\": \"f8c4849fd86f44a2bdec1756e3034d79\", \"owner_access\": 7, \"global_access\": 0, \"share\": []}",
                                      "virtual_machine_refs": "[{\"to\": [\"76ebc798-5f58-4fb9-a3ef-2271e83ca32e\"], \"attr\": null, \"uuid\": \"76ebc798-5f58-4fb9-a3ef-2271e83ca32e\"}]",
                                      "id_perms": "{\"enable\": true, \"description\": \"\", \"created\": \"2017-07-21T11:50:59.902602\", \"creator\": null, \"uuid\": {\"uuid_mslong\": 14124518667417767079, \"uuid_lslong\": 9605041753878281811}, \"user_visible\": true, \"last_modified\": \"2017-07-21T11:50:59.931897\", \"permissions\": {\"owner\": \"neutron\", \"owner_access\": 7, \"other_access\": 7, \"group\": \"admin\", \"group_access\": 7}}",
                                      "virtual_machine_interface_device_owner": "\"compute:nova\"",
                                      "port_security_enabled": "true",
                                      "fq_name": "[\"default-domain\", \"admin\", \"c4045ee4-a2cf-4ca7-854b-f695e0b5be53\"]",
                                      "vlan_tag_based_bridge_domain": "false",
                                      "virtual_machine_interface_mac_addresses": "{\"mac_address\": [\"02:c4:04:5e:e4:a2\"]}"
                                    }
                                  },
                                  "UveVMInterfaceAgent": {
                                    "ip6_active": false,
                                    "if_stats": {
                                      "out_bytes": 126,
                                      "in_pkts": 0,
                                      "out_pkts": 3,
                                      "in_bytes": 0
                                    },
                                    "vm_uuid": "76ebc798-5f58-4fb9-a3ef-2271e83ca32e",
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
                                        "0",
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
                                        "0",
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
                                    "ip6_address": "::",
                                    "label": 20,
                                    "gateway": "10.10.10.1",
                                    "rx_vlan": 65535,
                                    "tx_vlan": 65535,
                                    "ip4_active": true,
                                    "mac_address": "02:c4:04:5e:e4:a2",
                                    "if_out_pkts_ewm": {
                                      "config": "0.1",
                                      "metric": 3,
                                      "state": {
                                        "stddev": "6.3171",
                                        "mean": "6.74603"
                                      },
                                      "algo": "EWM",
                                      "samples": 16,
                                      "sigma": -0.592998
                                    },
                                    "l2_active": true,
                                    "added_flows_ewm": {
                                      "config": "0.1",
                                      "metric": 0,
                                      "state": {
                                        "stddev": "0",
                                        "mean": "0"
                                      },
                                      "algo": "EWM",
                                      "samples": 10,
                                      "sigma": 0
                                    },
                                    "vm_name": "test1-inst",
                                    "out_bw_usage": 33,
                                    "deleted_flows_ewm": {
                                      "config": "0.1",
                                      "metric": 0,
                                      "state": {
                                        "stddev": "0",
                                        "mean": "0"
                                      },
                                      "algo": "EWM",
                                      "samples": 10,
                                      "sigma": 0
                                    },
                                    "is_health_check_active": true,
                                    "flow_rate": {
                                      "active_flows": 0,
                                      "max_flow_deletes_per_second": 0,
                                      "added_flows": 0,
                                      "deleted_flows": 0,
                                      "min_flow_adds_per_second": 0,
                                      "min_flow_deletes_per_second": 0,
                                      "max_flow_adds_per_second": 0
                                    },
                                    "virtual_network": "default-domain:admin:test1",
                                    "active": true,
                                    "ip_address": "10.10.10.3",
                                    "fixed_ip4_list": [
                                      "10.10.10.3"
                                    ],
                                    "in_bw_usage": 0,
                                    "vn_uuid": "4a5429be-8bc3-484a-9315-fb87bdf3851d",
                                    "active_flows_ewm": {
                                      "config": "0.1",
                                      "metric": 0,
                                      "state": {
                                        "stddev": "0",
                                        "mean": "0"
                                      },
                                      "algo": "EWM",
                                      "samples": 10,
                                      "sigma": 0
                                    },
                                    "uuid": "c4045ee4-a2cf-4ca7-854b-f695e0b5be53",
                                    "admin_state": true,
                                    "if_in_pkts_ewm": {
                                      "config": "0.1",
                                      "metric": 0,
                                      "state": {
                                        "stddev": "0",
                                        "mean": "0"
                                      },
                                      "algo": "EWM",
                                      "samples": 10,
                                      "sigma": 0
                                    }
                                  }
                                }
                              },
                              {
                                "name": "default-domain:admin:e718d077-f828-4c67-955e-e11e9c664e27",
                                "value": {
                                  "ContrailConfig": {
                                    "deleted": false,
                                    "elements": {
                                      "routing_instance_refs": "[{\"to\": [\"default-domain\", \"admin\", \"test1\", \"test1\"], \"attr\": {\"direction\": \"both\", \"protocol\": null, \"ipv6_service_chain_address\": null, \"dst_mac\": null, \"mpls_label\": null, \"vlan_tag\": null, \"src_mac\": null, \"service_chain_address\": null}, \"uuid\": \"825072f9-b522-43d4-be72-8683e2befe94\"}]",
                                      "parent_uuid": "\"f8c4849f-d86f-44a2-bdec-1756e3034d79\"",
                                      "virtual_machine_interface_bindings": "{\"key_value_pair\": [{\"key\": \"host_id\", \"value\": \"nodeg3\"}, {\"key\": \"vif_type\", \"value\": \"vrouter\"}, {\"key\": \"vnic_type\", \"value\": \"normal\"}]}",
                                      "security_group_refs": "[{\"to\": [\"default-domain\", \"admin\", \"default\"], \"attr\": null, \"uuid\": \"f262afaf-45db-42b7-b6ee-32f66589c672\"}]",
                                      "virtual_machine_interface_disable_policy": "false",
                                      "parent_type": "\"project\"",
                                      "uuid": "\"e718d077-f828-4c67-955e-e11e9c664e27\"",
                                      "virtual_network_refs": "[{\"to\": [\"default-domain\", \"admin\", \"test1\"], \"attr\": null, \"uuid\": \"4a5429be-8bc3-484a-9315-fb87bdf3851d\"}]",
                                      "display_name": "\"e718d077-f828-4c67-955e-e11e9c664e27\"",
                                      "perms2": "{\"owner\": \"f8c4849fd86f44a2bdec1756e3034d79\", \"owner_access\": 7, \"global_access\": 0, \"share\": []}",
                                      "virtual_machine_refs": "[{\"to\": [\"8222e32c-0601-4d9f-bb3b-2f92ec9d65e0\"], \"attr\": null, \"uuid\": \"8222e32c-0601-4d9f-bb3b-2f92ec9d65e0\"}]",
                                      "id_perms": "{\"enable\": true, \"description\": \"\", \"created\": \"2017-07-21T11:51:25.873178\", \"creator\": null, \"uuid\": {\"uuid_mslong\": 16652288835885485159, \"uuid_lslong\": 10763287681051282983}, \"user_visible\": true, \"last_modified\": \"2017-07-21T11:51:26.153485\", \"permissions\": {\"owner\": \"neutron\", \"owner_access\": 7, \"other_access\": 7, \"group\": \"admin\", \"group_access\": 7}}",
                                      "virtual_machine_interface_device_owner": "\"compute:nova\"",
                                      "port_security_enabled": "true",
                                      "fq_name": "[\"default-domain\", \"admin\", \"e718d077-f828-4c67-955e-e11e9c664e27\"]",
                                      "vlan_tag_based_bridge_domain": "false",
                                      "virtual_machine_interface_mac_addresses": "{\"mac_address\": [\"02:e7:18:d0:77:f8\"]}"
                                    }
                                  },
                                  "UveVMInterfaceAgent": {
                                    "ip6_active": false,
                                    "if_stats": {
                                      "out_bytes": 126,
                                      "in_pkts": 0,
                                      "out_pkts": 3,
                                      "in_bytes": 0
                                    },
                                    "vm_uuid": "8222e32c-0601-4d9f-bb3b-2f92ec9d65e0",
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
                                        "0",
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
                                        "0",
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
                                    "ip6_address": "::",
                                    "label": 24,
                                    "gateway": "10.10.10.1",
                                    "rx_vlan": 65535,
                                    "tx_vlan": 65535,
                                    "ip4_active": true,
                                    "mac_address": "02:e7:18:d0:77:f8",
                                    "if_out_pkts_ewm": {
                                      "config": "0.1",
                                      "metric": 3,
                                      "state": {
                                        "stddev": "6.5234",
                                        "mean": "7.06614"
                                      },
                                      "algo": "EWM",
                                      "samples": 15,
                                      "sigma": -0.623317
                                    },
                                    "l2_active": true,
                                    "added_flows_ewm": {
                                      "config": "0.1",
                                      "metric": 0,
                                      "state": {
                                        "stddev": "0",
                                        "mean": "0"
                                      },
                                      "algo": "EWM",
                                      "samples": 10,
                                      "sigma": 0
                                    },
                                    "vm_name": "test1-inst1",
                                    "out_bw_usage": 33,
                                    "deleted_flows_ewm": {
                                      "config": "0.1",
                                      "metric": 0,
                                      "state": {
                                        "stddev": "0",
                                        "mean": "0"
                                      },
                                      "algo": "EWM",
                                      "samples": 10,
                                      "sigma": 0
                                    },
                                    "is_health_check_active": true,
                                    "flow_rate": {
                                      "active_flows": 0,
                                      "max_flow_deletes_per_second": 0,
                                      "added_flows": 0,
                                      "deleted_flows": 0,
                                      "min_flow_adds_per_second": 0,
                                      "min_flow_deletes_per_second": 0,
                                      "max_flow_adds_per_second": 0
                                    },
                                    "virtual_network": "default-domain:admin:test1",
                                    "active": true,
                                    "ip_address": "10.10.10.4",
                                    "fixed_ip4_list": [
                                      "10.10.10.4"
                                    ],
                                    "in_bw_usage": 0,
                                    "vn_uuid": "4a5429be-8bc3-484a-9315-fb87bdf3851d",
                                    "active_flows_ewm": {
                                      "config": "0.1",
                                      "metric": 0,
                                      "state": {
                                        "stddev": "0",
                                        "mean": "0"
                                      },
                                      "algo": "EWM",
                                      "samples": 10,
                                      "sigma": 0
                                    },
                                    "uuid": "e718d077-f828-4c67-955e-e11e9c664e27",
                                    "admin_state": true,
                                    "if_in_pkts_ewm": {
                                      "config": "0.1",
                                      "metric": 0,
                                      "state": {
                                        "stddev": "0",
                                        "mean": "0"
                                      },
                                      "algo": "EWM",
                                      "samples": 10,
                                      "sigma": 0
                                    }
                                  }
                                }
                              }
                            ]
                          },
                          "lastKey": null,
                          "more": false
                    }
                },
                "output": {
                    "test1": [
                          {
                            "floating_ips": [],
                            "ip6_active": false,
                            "if_stats": {
                              "out_bytes": 126,
                              "in_pkts": 0,
                              "out_pkts": 3,
                              "in_bytes": 0
                            },
                            "vm_uuid": "76ebc798-5f58-4fb9-a3ef-2271e83ca32e",
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
                                "0",
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
                                "0",
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
                            "ip6_address": "::",
                            "label": 20,
                            "gateway": "10.10.10.1",
                            "rx_vlan": 65535,
                            "tx_vlan": 65535,
                            "ip4_active": true,
                            "mac_address": "02:c4:04:5e:e4:a2",
                            "if_out_pkts_ewm": {
                              "config": "0.1",
                              "metric": 3,
                              "state": {
                                "stddev": "6.3171",
                                "mean": "6.74603"
                              },
                              "algo": "EWM",
                              "samples": 16,
                              "sigma": -0.592998
                            },
                            "l2_active": true,
                            "added_flows_ewm": {
                              "config": "0.1",
                              "metric": 0,
                              "state": {
                                "stddev": "0",
                                "mean": "0"
                              },
                              "algo": "EWM",
                              "samples": 10,
                              "sigma": 0
                            },
                            "vm_name": "test1-inst",
                            "out_bw_usage": 33,
                            "deleted_flows_ewm": {
                              "config": "0.1",
                              "metric": 0,
                              "state": {
                                "stddev": "0",
                                "mean": "0"
                              },
                              "algo": "EWM",
                              "samples": 10,
                              "sigma": 0
                            },
                            "is_health_check_active": true,
                            "flow_rate": {
                              "active_flows": 0,
                              "max_flow_deletes_per_second": 0,
                              "added_flows": 0,
                              "deleted_flows": 0,
                              "min_flow_adds_per_second": 0,
                              "min_flow_deletes_per_second": 0,
                              "max_flow_adds_per_second": 0
                            },
                            "virtual_network": "default-domain:admin:test1",
                            "active": true,
                            "ip_address": "10.10.10.3",
                            "fixed_ip4_list": [
                              "10.10.10.3"
                            ],
                            "in_bw_usage": 0,
                            "vn_uuid": "4a5429be-8bc3-484a-9315-fb87bdf3851d",
                            "active_flows_ewm": {
                              "config": "0.1",
                              "metric": 0,
                              "state": {
                                "stddev": "0",
                                "mean": "0"
                              },
                              "algo": "EWM",
                              "samples": 10,
                              "sigma": 0
                            },
                            "uuid": "c4045ee4-a2cf-4ca7-854b-f695e0b5be53",
                            "admin_state": true,
                            "if_in_pkts_ewm": {
                              "config": "0.1",
                              "metric": 0,
                              "state": {
                                "stddev": "0",
                                "mean": "0"
                              },
                              "algo": "EWM",
                              "samples": 10,
                              "sigma": 0
                            },
                            "name": "default-domain:admin:c4045ee4-a2cf-4ca7-854b-f695e0b5be53",
                            "ip": "10.10.10.3",
                            "count_floating_ips": 0,
                            "floatingIP": [],
                            "x": 33,
                            "y": 0,
                            "throughput": 33
                          },
                          {
                            "floating_ips": [],
                            "ip6_active": false,
                            "if_stats": {
                              "out_bytes": 126,
                              "in_pkts": 0,
                              "out_pkts": 3,
                              "in_bytes": 0
                            },
                            "vm_uuid": "8222e32c-0601-4d9f-bb3b-2f92ec9d65e0",
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
                                "0",
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
                                "0",
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
                            "ip6_address": "::",
                            "label": 24,
                            "gateway": "10.10.10.1",
                            "rx_vlan": 65535,
                            "tx_vlan": 65535,
                            "ip4_active": true,
                            "mac_address": "02:e7:18:d0:77:f8",
                            "if_out_pkts_ewm": {
                              "config": "0.1",
                              "metric": 3,
                              "state": {
                                "stddev": "6.5234",
                                "mean": "7.06614"
                              },
                              "algo": "EWM",
                              "samples": 15,
                              "sigma": -0.623317
                            },
                            "l2_active": true,
                            "added_flows_ewm": {
                              "config": "0.1",
                              "metric": 0,
                              "state": {
                                "stddev": "0",
                                "mean": "0"
                              },
                              "algo": "EWM",
                              "samples": 10,
                              "sigma": 0
                            },
                            "vm_name": "test1-inst1",
                            "out_bw_usage": 33,
                            "deleted_flows_ewm": {
                              "config": "0.1",
                              "metric": 0,
                              "state": {
                                "stddev": "0",
                                "mean": "0"
                              },
                              "algo": "EWM",
                              "samples": 10,
                              "sigma": 0
                            },
                            "is_health_check_active": true,
                            "flow_rate": {
                              "active_flows": 0,
                              "max_flow_deletes_per_second": 0,
                              "added_flows": 0,
                              "deleted_flows": 0,
                              "min_flow_adds_per_second": 0,
                              "min_flow_deletes_per_second": 0,
                              "max_flow_adds_per_second": 0
                            },
                            "virtual_network": "default-domain:admin:test1",
                            "active": true,
                            "ip_address": "10.10.10.4",
                            "fixed_ip4_list": [
                              "10.10.10.4"
                            ],
                            "in_bw_usage": 0,
                            "vn_uuid": "4a5429be-8bc3-484a-9315-fb87bdf3851d",
                            "active_flows_ewm": {
                              "config": "0.1",
                              "metric": 0,
                              "state": {
                                "stddev": "0",
                                "mean": "0"
                              },
                              "algo": "EWM",
                              "samples": 10,
                              "sigma": 0
                            },
                            "uuid": "e718d077-f828-4c67-955e-e11e9c664e27",
                            "admin_state": true,
                            "if_in_pkts_ewm": {
                              "config": "0.1",
                              "metric": 0,
                              "state": {
                                "stddev": "0",
                                "mean": "0"
                              },
                              "algo": "EWM",
                              "samples": 10,
                              "sigma": 0
                            },
                            "name": "default-domain:admin:e718d077-f828-4c67-955e-e11e9c664e27",
                            "ip": "10.10.10.4",
                            "count_floating_ips": 0,
                            "floatingIP": [],
                            "x": 33,
                            "y": 0,
                            "throughput": 33
                          }
                        ]
                }
            }
        };

        this.getInput = function(obj) {
            if(obj['fnName'] != null &&  mockData[obj['fnName']] != null && mockData[obj['fnName']]['input'][obj['type']] != null)
                return mockData[obj['fnName']]['input'][obj['type']];
            else
                return null;
        };

        this.getOutput = function(obj) {
            if(obj['fnName'] != null &&  mockData[obj['fnName']] != null && mockData[obj['fnName']]['output'][obj['type']] != null)
                return mockData[obj['fnName']]['output'][obj['type']];
            else
                return null;
        }

    }
    return new NMParserMockData();
});


