/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function (_) {

    function CTParserMockData() {

        var mockData = {
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
                    },
                    "test2": {
                        "data": {
                            "value": [
                                {
                                    "name": "d4b8339b-3c9e-43e3-89a8-f22094cb97ab",
                                    "value": {
                                        "UveVirtualMachineAgent": {
                                            "vm_name": "vm-backend",
                                            "cpu_info": {
                                                "virt_memory": 4682172,
                                                "cpu_one_min_avg": 0,
                                                "disk_used_bytes": 87302144,
                                                "vm_memory_quota": 2097152,
                                                "peak_virt_memory": 5173932,
                                                "disk_allocated_bytes": 4294967295,
                                                "rss": 704416
                                            },
                                            "interface_list": [
                                                "default-domain:admin:e2911fbe-55a0-4178-988f-83e2beffb9d1"
                                            ],
                                            "uuid": "d4b8339b-3c9e-43e3-89a8-f22094cb97ab",
                                            "vrouter": "a3s28"
                                        }
                                    }
                                },
                                {
                                    "name": "d53cea4c-44df-4ada-81d7-24c5930684f1",
                                    "value": {
                                        "UveVirtualMachineAgent": {
                                            "vm_name": "vm-backend-d53cea4c-44df-4ada-81d7-24c5930684f1",
                                            "cpu_info": {
                                                "virt_memory": 4686376,
                                                "cpu_one_min_avg": 0,
                                                "disk_used_bytes": 87302144,
                                                "vm_memory_quota": 2097152,
                                                "peak_virt_memory": 5178136,
                                                "disk_allocated_bytes": 4294967295,
                                                "rss": 575568
                                            },
                                            "interface_list": [
                                                "default-domain:admin:4590026b-6e3c-4a13-b4c2-2665957c0dd2"
                                            ],
                                            "uuid": "d53cea4c-44df-4ada-81d7-24c5930684f1",
                                            "vrouter": "a3s31"
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
                            "fipCnt": 0,
                            "inBytes60": "-",
                            "throughput": 0,
                            "outBytes60": "-",
                            "url": "/api/tenant/networking/virtual-machine/summary?fqNameRegExp=83c58a58-2474-45ce-b25b-0b19dc12dda0?flat",
                            "vmName": "back01",
                            "uuid": "83c58a58-2474-45ce-b25b-0b19dc12dda0",
                            "vRouter": "b2s40",
                            "intfCnt": 1,
                            "vn": null,
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
                            "fipCnt": 0,
                            "inBytes60": "-",
                            "throughput": 0,
                            "outBytes60": "-",
                            "url": "/api/tenant/networking/virtual-machine/summary?fqNameRegExp=e1cd28da-232d-4320-8598-7debfe2c9f6e?flat",
                            "vmName": "front01",
                            "uuid": "e1cd28da-232d-4320-8598-7debfe2c9f6e",
                            "vRouter": "b2s40",
                            "intfCnt": 1,
                            "vn": null,
                            "ip": [],
                            "x": 1.63934,
                            "y": 1420764,
                            "size": 0
                        }
                    ],
                    "test2": [
                        {
                            "name": "d4b8339b-3c9e-43e3-89a8-f22094cb97ab",
                            "value": {
                                "UveVirtualMachineAgent": {
                                    "vm_name": "vm-backend",
                                    "cpu_info": {
                                        "virt_memory": 4682172,
                                        "cpu_one_min_avg": 0,
                                        "disk_used_bytes": 87302144,
                                        "vm_memory_quota": 2097152,
                                        "peak_virt_memory": 5173932,
                                        "disk_allocated_bytes": 4294967295,
                                        "rss": 704416
                                    },
                                    "interface_list": [
                                        "default-domain:admin:e2911fbe-55a0-4178-988f-83e2beffb9d1"
                                        ],
                                    "uuid": "d4b8339b-3c9e-43e3-89a8-f22094cb97ab",
                                    "vrouter": "a3s28",
                                    "interface_details": [

                                        ]
                                }
                            },
                            "raw_json": {
                                "name": "d4b8339b-3c9e-43e3-89a8-f22094cb97ab",
                                "value": {
                                    "UveVirtualMachineAgent": {
                                        "vm_name": "vm-backend",
                                        "cpu_info": {
                                            "virt_memory": 4682172,
                                            "cpu_one_min_avg": 0,
                                            "disk_used_bytes": 87302144,
                                            "vm_memory_quota": 2097152,
                                            "peak_virt_memory": 5173932,
                                            "disk_allocated_bytes": 4294967295,
                                            "rss": 704416
                                        },
                                        "interface_list": [
                                            "default-domain:admin:e2911fbe-55a0-4178-988f-83e2beffb9d1"
                                            ],
                                        "uuid": "d4b8339b-3c9e-43e3-89a8-f22094cb97ab",
                                        "vrouter": "a3s28"
                                    }
                                }
                            },
                            "inBytes60": "-",
                            "outBytes60": "-",
                            "url": "/api/tenant/networking/virtual-machine/summary?fqNameRegExp=d4b8339b-3c9e-43e3-89a8-f22094cb97ab?flat",
                            "vmName": "vm-backend",
                            "uuid": "d4b8339b-3c9e-43e3-89a8-f22094cb97ab",
                            "vRouter": "a3s28",
                            "intfCnt": 1,
                            "vn": null,
                            "ip": [

                                ],
                            "x": 0,
                            "y": 704416,
                            "size": 0,
                            "ui_added_parameters": {
                                "instance_health_check_status": null
                            },
                            "throughput": 0,
                            "fipCnt": 0
                        },
                        {
                            "name": "d53cea4c-44df-4ada-81d7-24c5930684f1",
                            "value": {
                                "UveVirtualMachineAgent": {
                                    "vm_name": "vm-backend-d53cea4c-44df-4ada-81d7-24c5930684f1",
                                    "cpu_info": {
                                        "virt_memory": 4686376,
                                        "cpu_one_min_avg": 0,
                                        "disk_used_bytes": 87302144,
                                        "vm_memory_quota": 2097152,
                                        "peak_virt_memory": 5178136,
                                        "disk_allocated_bytes": 4294967295,
                                        "rss": 575568
                                    },
                                    "interface_list": [
                                        "default-domain:admin:4590026b-6e3c-4a13-b4c2-2665957c0dd2"
                                        ],
                                    "uuid": "d53cea4c-44df-4ada-81d7-24c5930684f1",
                                    "vrouter": "a3s31",
                                    "interface_details": [

                                        ]
                                }
                            },
                            "raw_json": {
                                "name": "d53cea4c-44df-4ada-81d7-24c5930684f1",
                                "value": {
                                    "UveVirtualMachineAgent": {
                                        "vm_name": "vm-backend-d53cea4c-44df-4ada-81d7-24c5930684f1",
                                        "cpu_info": {
                                            "virt_memory": 4686376,
                                            "cpu_one_min_avg": 0,
                                            "disk_used_bytes": 87302144,
                                            "vm_memory_quota": 2097152,
                                            "peak_virt_memory": 5178136,
                                            "disk_allocated_bytes": 4294967295,
                                            "rss": 575568
                                        },
                                        "interface_list": [
                                            "default-domain:admin:4590026b-6e3c-4a13-b4c2-2665957c0dd2"
                                            ],
                                        "uuid": "d53cea4c-44df-4ada-81d7-24c5930684f1",
                                        "vrouter": "a3s31"
                                    }
                                }
                            },
                            "inBytes60": "-",
                            "outBytes60": "-",
                            "url": "/api/tenant/networking/virtual-machine/summary?fqNameRegExp=d53cea4c-44df-4ada-81d7-24c5930684f1?flat",
                            "vmName": "vm-backend-d53cea4c-44df-4ada-81d7-24c5930684f1",
                            "uuid": "d53cea4c-44df-4ada-81d7-24c5930684f1",
                            "vRouter": "a3s31",
                            "intfCnt": 1,
                            "vn": null,
                            "ip": [

                                ],
                            "x": 0,
                            "y": 575568,
                            "size": 0,
                            "ui_added_parameters": {
                                "instance_health_check_status": null
                            },
                            "throughput": 0,
                            "fipCnt": 0
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
        };

        this.esiInput = {
                    'ALL_00' : '00:00:00:00:00:00:00:00:00:00',
                    'ALL_FF' : 'FF:FF:FF:FF:FF:FF:FF:FF:FF:FF',
                    'INVALID_ESI' : '00:00:FF:AA:bb:cc:DD:22:GG:JJ',
                    'VALID_ESI' : '00:ff:aa:FF:11:BB:33:CC:44:AA'
                };

    }
    return new CTParserMockData();
});


