/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
function InfraMxMockData() {
    var mockData = {
        getPRouterChassisInfo: {
            input: [{
                "PRouterChassisData": {
                    "link_details" : [
                        {
                            "src_slot" : 0,
                            "dest_slot": 0,
                            "src_pfe" : 0,
                            "dest_pfe" : 1,
                            "traffic" : 123
                        }
                    ],
                    "power_modules" : [
                        {
                            "model_type": "PS 1.2-1.7kW; 100-240V AC in",
                            "serial_number": "QCS07519029"
                        },
                        {
                            "model_type": "PS 1.2-1.7kW; 100-240V AC in",
                            "serial_number": "QCS07519041"
                        },
                        {
                            "model_type": "PS 1.2-1.7kW; 100-240V AC in",
                            "serial_number": "QCS07519097"
                        }
                    ],
                    "fan_modules" : [
                        {
                            "name": "Fan Tray",
                            "description": "Left Fan Tray"
                        },
                        {
                            "name": "Fan Tray",
                            "description": "Right Fan Tray"
                        }
                    ],
                    "line_cards": [
                        {
                            "model_type": "MPC4E 3D 2CGE+8XGE",
                            "slot_identifier": 0,
                            "cpu_count": 7,
                            "pfe_count": 4
                        },
                        {
                            "model_type": "MPCE Type 2 3D",
                            "slot_identifier": 1,
                            "cpu_count": 8,
                            "pfe_count": 2
                        },
                        {
                            "model_type": "MPC 3D 16x 10GE",
                            "slot_identifier": 2,
                            "cpu_count": 14,
                            "pfe_count": 4
                        }
                    ],
                    "switch_cards": [
                        {
                            "model_type": "RE-MX2000-1800X4-S",
                            "slot_identifier": 0
                        },
                        {
                            "model_type": "RE-MX2000-1800X4-S",
                            "slot_identifier": 1
                        }
                    ],
                    "max_line_cards": 10,
                    "max_routing_engines": 2,
                    "max_power_modules": 3,
                    "max_fan_modules": 2,
                    "routing_engines": [
                        {
                            "model_type": "RE-S-1800x4",
                            "slot_identifier": 0
                        },
                        {
                            "model_type": "RE-S-1800x4",
                            "slot_identifier": 1
                        }
                    ],
                    "model_type": "MX2010",
                    "max_switch_cards": 2,
                    "identifier": "JN122A602AFK",
                    "protocols": [
                        {
                            "name": "IPv4"
                        },
                        {
                            "name": "MPLS"
                        },
                        {
                            "name": "IPv6"
                        },
                        {
                            "name": "ARP"
                        },
                        {
                            "name": "CLNP"
                        },
                        {
                            "name": "CCC"
                        },
                        {
                            "name": "MLPPP"
                        },
                        {
                            "name": "TCC"
                        },
                        {
                            "name": "BRIDGE"
                        },
                        {
                            "name": "Multiservice"
                        },
                        {
                            "name": "DHCP"
                        }
                    ]
                }
            }],
            output: {
                "PRouterChassisUVEs": [{
                    "PRouterChassisData": {
                        "link_details" : [
                            {
                                "src_slot" : 0,
                                "dest_slot": 0,
                                "src_pfe" : 0,
                                "dest_pfe" : 1,
                                "traffic" : 123
                            }
                        ],
                        "power_modules" : [
                            {
                                "model_type": "PS 1.2-1.7kW; 100-240V AC in",
                                "serial_number": "QCS07519029"
                            },
                            {
                                "model_type": "PS 1.2-1.7kW; 100-240V AC in",
                                "serial_number": "QCS07519041"
                            },
                            {
                                "model_type": "PS 1.2-1.7kW; 100-240V AC in",
                                "serial_number": "QCS07519097"
                            }
                        ],
                        "fan_modules" : [
                            {
                                "name": "Fan Tray",
                                "description": "Left Fan Tray"
                            },
                            {
                                "name": "Fan Tray",
                                "description": "Right Fan Tray"
                            }
                        ],
                        "line_cards": [
                            {
                                "model_type": "MPC4E 3D 2CGE+8XGE",
                                "slot_identifier": 0,
                                "cpu_count": 7,
                                "pfe_count": 4
                            },
                            {
                                "model_type": "MPCE Type 2 3D",
                                "slot_identifier": 1,
                                "cpu_count": 8,
                                "pfe_count": 2
                            },
                            {
                                "model_type": "MPC 3D 16x 10GE",
                                "slot_identifier": 2,
                                "cpu_count": 14,
                                "pfe_count": 4
                            }
                        ],
                        "switch_cards": [
                            {
                                "model_type": "RE-MX2000-1800X4-S",
                                "slot_identifier": 0
                            },
                            {
                                "model_type": "RE-MX2000-1800X4-S",
                                "slot_identifier": 1
                            }
                        ],
                        "max_line_cards": 10,
                        "max_routing_engines": 2,
                        "max_power_modules": 3,
                        "max_fan_modules": 2,
                        "routing_engines": [
                            {
                                "model_type": "RE-S-1800x4",
                                "slot_identifier": 0
                            },
                            {
                                "model_type": "RE-S-1800x4",
                                "slot_identifier": 1
                            }
                        ],
                        "model_type": "MX2010",
                        "max_switch_cards": 2,
                        "identifier": "JN122A602AFK",
                        "protocols": [
                            {
                                "name": "IPv4"
                            },
                            {
                                "name": "MPLS"
                            },
                            {
                                "name": "IPv6"
                            },
                            {
                                "name": "ARP"
                            },
                            {
                                "name": "CLNP"
                            },
                            {
                                "name": "CCC"
                            },
                            {
                                "name": "MLPPP"
                            },
                            {
                                "name": "TCC"
                            },
                            {
                                "name": "BRIDGE"
                            },
                            {
                                "name": "Multiservice"
                            },
                            {
                                "name": "DHCP"
                            }
                        ]
                    }
                }]
            }
        }
    }
    this.getInput = function(obj) {
        if(obj['fnName'] != null &&  mockData[obj['fnName']] != null && mockData[obj['fnName']]['input'][obj['type']] != null)
            return mockData[obj['fnName']]['input'][obj['type']];
        else
            return null;
    },
    this.getOutput = function(obj) {
        if(obj['fnName'] != null &&  mockData[obj['fnName']] != null && mockData[obj['fnName']]['output'][obj['type']] != null)
            return mockData[obj['fnName']]['output'][obj['type']];
        else
            return null;
    }
}
var infraMxMockData = new InfraMxMockData();

