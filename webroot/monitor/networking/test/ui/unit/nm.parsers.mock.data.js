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


