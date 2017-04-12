/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function (_) {
    this.domainsMockData = {
        "domains": [
            {
                "href"   : "http://10.84.30.249:8082/domain/f8a71b82-ec17-4869-8e34-5e967e6fce50",
                "display_name": "default-domain",
                "fq_name": [
                    "default-domain"],
                "uuid"   : "f8a71b82-ec17-4869-8e34-5e967e6fce50"
            }
        ]
    };
    this.projectMockData = {
        "projects": [
            {
                "fq_name": [
                    "default-domain",
                    "admin"
                ],
                "display_name": "admin",
                "uuid": "1c899f5a-6494-4355-b2ac-7e282566724a"
            },
            {
                "fq_name": [
                    "default-domain",
                    "default-project"
                ],
                "display_name": "default-project",
                "uuid": "390a0374-239f-40c3-ac87-d0918d2abf8b"
            }
        ]
    };
    this.networksMockData = {
        "data": {
            "value": [
                {
                    "name": "default-domain:admin:backend",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 4,
                            "in_bandwidth_usage": 20957,
                            "egress_flow_count": 12,
                            "acl": "default-domain:admin:backend:backend",
                            "virtualmachine_list": [
                                "77e6a8a7-333c-451c-a953-158fd7141763",
                                "aa833f1b-ac3e-4e44-925d-3f847e7779d4"
                            ],
                            "interface_list": [
                                "default-domain:admin:ad21a897-657a-4812-ad18-a0773b095309",
                                "default-domain:admin:default-domain__admin__si-firewall__1__right__3"
                            ],
                            "ingress_flow_count": 12,
                            "out_bandwidth_usage": 28345
                        },
                        "UveVirtualNetworkConfig": {
                            "connected_networks": [
                                "default-domain:admin:frontend"
                            ]
                        }
                    }
                },
                {
                    "name": "default-domain:admin:frontend",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 10,
                            "in_bandwidth_usage": 28345,
                            "egress_flow_count": 12,
                            "acl": "default-domain:admin:frontend:frontend",
                            "virtualmachine_list": [
                                "77aca039-2e54-494e-9230-8c17cd96ecd8",
                                "77e6a8a7-333c-451c-a953-158fd7141763"
                            ],
                            "interface_list": [
                                "default-domain:admin:3b73ec6a-2ca7-4ed9-ab84-4e166c02bc2e",
                                "default-domain:admin:default-domain__admin__si-firewall__1__left__2"
                            ],
                            "ingress_flow_count": 12,
                            "out_bandwidth_usage": 20957
                        },
                        "UveVirtualNetworkConfig": {
                            "connected_networks": [
                                "default-domain:admin:st_vn1",
                                "default-domain:admin:backend",
                                "default-domain:admin:st_vn101",
                                "default-domain:admin:st_vn102"
                            ]
                        }
                    }
                },
                {
                    "name": "default-domain:admin:st_vn1",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 6,
                            "in_bandwidth_usage": 0,
                            "egress_flow_count": 0,
                            "acl": "default-domain:admin:st_vn1:st_vn1",
                            "virtualmachine_list": [
                                "769aa74a-aa36-4e79-ab23-86476a23b585"
                            ],
                            "interface_list": [
                                "default-domain:admin:st_port1"
                            ],
                            "ingress_flow_count": 0,
                            "out_bandwidth_usage": 0
                        },
                        "UveVirtualNetworkConfig": {
                            "connected_networks": [
                                "default-domain:admin:st_vn2",
                                "default-domain:admin:frontend"
                            ]
                        }
                    }
                },
                {
                    "name": "default-domain:admin:st_vn10",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 0,
                            "in_bandwidth_usage": 0,
                            "egress_flow_count": 0,
                            "acl": null,
                            "virtualmachine_list": [
                                "ce7281ac-66b2-4cb4-8aac-78843d66281f"
                            ],
                            "interface_list": [
                                "default-domain:admin:st_port10"
                            ],
                            "ingress_flow_count": 0,
                            "out_bandwidth_usage": 0
                        },
                        "UveVirtualNetworkConfig": {}
                    }
                },
                {
                    "name": "default-domain:admin:st_vn100",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 0,
                            "in_bandwidth_usage": 0,
                            "egress_flow_count": 0,
                            "acl": null,
                            "virtualmachine_list": [
                                "8ee4d414-71be-41a2-8bf2-57df02ae9a8f"
                            ],
                            "interface_list": [
                                "default-domain:admin:st_port100"
                            ],
                            "ingress_flow_count": 0,
                            "out_bandwidth_usage": 0
                        },
                        "UveVirtualNetworkConfig": {}
                    }
                },
                {
                    "name": "default-domain:admin:st_vn101",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 4,
                            "in_bandwidth_usage": 0,
                            "egress_flow_count": 0,
                            "acl": "default-domain:admin:st_vn101:st_vn101",
                            "virtualmachine_list": [
                                "06370047-4dac-4a51-aebf-e61cdae85b9b",
                                "0a94797e-f70d-4adc-99d5-9e394d6d6b2f",
                                "0f45912e-9f81-4e3b-8051-1b1ea74f7c4b",
                                "0f905f9c-27ed-4990-a459-3658c2c95343",
                                "142abdf9-0297-43f2-97b8-03a468dd99c6",
                                "2c7cd570-398f-4b3b-a1e7-a6960b342b91",
                                "30d5bdea-8fa9-4a3c-be18-de026f23544b",
                                "3592f997-77f1-4233-a156-6d975fde83bc",
                                "36f39380-74ec-4013-85eb-26766850e21a",
                                "3d2c17f0-13b2-4552-a0bf-f5a51fcd2143",
                                "3e515990-c47e-44eb-a35b-0ff7114b1b18",
                                "54da6893-2563-4b5f-917b-0deb357b4ab2",
                                "57993dd8-8328-4f26-b70b-08674defea6b",
                                "6077fc88-4ca9-451f-9189-328d1eefc417",
                                "626d82d6-d04e-4b58-977e-901b59072ce5",
                                "63bd0a12-d44a-4354-acfe-22cd66b3d1e5",
                                "6898eef1-cb58-48d6-8f22-e9d8dc3ff65c",
                                "6f509c6c-0a45-4b65-bad8-dba1c4645df3",
                                "70131a64-61c7-493d-bd0c-257c03b162b5",
                                "71617ccc-af50-4078-b967-50daf79f7556",
                                "764cf381-c78c-450f-9c9c-7967a24bb86c",
                                "791969d9-4e35-4c2a-95e1-91e6326a28f0",
                                "7a269620-6d26-46e5-a242-f9200214c5ae",
                                "88e896ec-6872-4029-a54d-02f093501c06",
                                "97f51fce-7d2d-4615-919f-e6c8fe22eb77",
                                "9e93329e-9509-4993-85ac-52c7ee6b9e42",
                                "9f68a3b0-f926-421e-8d2a-849a23ec914d",
                                "a09b749d-4d9f-4cd3-974b-6b7fe15940fb",
                                "a2770cab-ecd9-491a-abd1-30e0113537e4",
                                "a7716a03-5c06-400d-8f5e-6d70a0944e33",
                                "b7e15046-b453-403f-804d-2cbcec63a6c9",
                                "bc92337d-f833-4970-aba7-1f613103844d",
                                "bea3e89f-7c6c-460c-9f5b-85d0310272ea",
                                "beeccccc-5471-4b95-a658-4cbad1d85639",
                                "bfc18275-c56a-40a4-bd57-4afbd06da820",
                                "c4f5f439-ee55-430c-a723-dc39765d21f2",
                                "c87c1997-4c6a-45c5-86d0-e325e5daefc1",
                                "d202524a-042d-4f37-9558-3f84fd92cd94",
                                "dc336dc5-38d3-41ed-88a3-3db6f5ab7a59",
                                "de1f1954-3454-4c4a-b348-14bc1e067df2",
                                "dfcc2242-aebd-4fa1-8c0e-f1f1eacf1ea6",
                                "e74f55fb-4d50-49a8-a0d6-a424d7c8bd62",
                                "e86180d6-e648-48b9-839f-fd2cdbd3d93e",
                                "e9eefe94-8eea-48b0-9fb9-97b383529a41",
                                "f0c5d906-ef28-4763-9b4d-4ea2278f5a22",
                                "f270e2fa-309d-46c9-8813-c198a0e59f7f",
                                "f3fdcf9a-dd6e-41e2-b451-bcf5196b0b7a",
                                "f8641b77-d360-489b-992c-67e762414d05",
                                "fe738e05-e0f3-49e6-ba00-86a883e69b2e"
                            ],
                            "interface_list": [
                                "default-domain:admin:st101_port39",
                                "default-domain:admin:st101_port9",
                                "default-domain:admin:st101_port19",
                                "default-domain:admin:st101_port23",
                                "default-domain:admin:st101_port46",
                                "default-domain:admin:st101_port8",
                                "default-domain:admin:st101_port30",
                                "default-domain:admin:st101_port32",
                                "default-domain:admin:st101_port5",
                                "default-domain:admin:st101_port12",
                                "default-domain:admin:st101_port48",
                                "default-domain:admin:st101_port17",
                                "default-domain:admin:st101_port34",
                                "default-domain:admin:st101_port6",
                                "default-domain:admin:st101_port36",
                                "default-domain:admin:st101_port29",
                                "default-domain:admin:st101_port49",
                                "default-domain:admin:st101_port21",
                                "default-domain:admin:st101_port37",
                                "default-domain:admin:st101_port44",
                                "default-domain:admin:st101_port45",
                                "default-domain:admin:st101_port42",
                                "default-domain:admin:st101_port7",
                                "default-domain:admin:st101_port2",
                                "default-domain:admin:st101_port15",
                                "default-domain:admin:st101_port3",
                                "default-domain:admin:st101_port25",
                                "default-domain:admin:st101_port10",
                                "default-domain:admin:st101_port13",
                                "default-domain:admin:st101_port35",
                                "default-domain:admin:st101_port38",
                                "default-domain:admin:st101_port16",
                                "default-domain:admin:st101_port18",
                                "default-domain:admin:st101_port22",
                                "default-domain:admin:st101_port26",
                                "default-domain:admin:st101_port40",
                                "default-domain:admin:st101_port47",
                                "default-domain:admin:st101_port43",
                                "default-domain:admin:st101_port4",
                                "default-domain:admin:st101_port11",
                                "default-domain:admin:st101_port1",
                                "default-domain:admin:st101_port14",
                                "default-domain:admin:st101_port20",
                                "default-domain:admin:st101_port31",
                                "default-domain:admin:st101_port33",
                                "default-domain:admin:st101_port24",
                                "default-domain:admin:st101_port28",
                                "default-domain:admin:st101_port27",
                                "default-domain:admin:st101_port41"
                            ],
                            "ingress_flow_count": 0,
                            "out_bandwidth_usage": 0
                        },
                        "UveVirtualNetworkConfig": {
                            "connected_networks": [
                                "default-domain:admin:frontend"
                            ]
                        }
                    }
                },
                {
                    "name": "default-domain:admin:st_vn102",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 4,
                            "in_bandwidth_usage": 0,
                            "egress_flow_count": 0,
                            "acl": "default-domain:admin:st_vn102:st_vn102",
                            "virtualmachine_list": [
                                "05fbdfd9-494d-461e-a684-bb0e5e59c3fd",
                                "06a762c2-7d3b-4900-a4ac-867377afe35c",
                                "09b547b1-864c-4fe2-b79d-bee3efabd982",
                                "14db0205-abbd-4ed2-a858-e8bf87480345",
                                "1d1d197b-8ca7-46f6-ad0d-0469ada4bc94",
                                "1e62937a-274c-4729-82b8-97273590815a",
                                "2003f06d-d787-4fb8-8005-1b41d166b76b",
                                "26f4e2ed-3b8a-4fe1-bfa5-1fc855f7f842",
                                "2768c560-fb6a-471e-8ca6-2b9f3e60aece",
                                "3706c421-6e62-44d4-a2a8-539cb426f268",
                                "42750ff3-2d23-48f6-beaf-7d32c8457f4d",
                                "470c0a84-8233-4a44-a02e-335bf9acf8ad",
                                "51313de3-25c4-40f5-b40a-7529c44d6568",
                                "51d7fa8b-234a-41c6-8566-0c0a52cb4e48",
                                "52c7a901-a364-42fa-9ef0-d1dce7c44440",
                                "63059ee7-fe70-4d1f-b801-bf21a37a2d0d",
                                "693c103c-d97f-422a-b47f-97698d1638ae",
                                "6b317079-8459-4b22-abe3-9c462418587f",
                                "6fe55b29-5e3b-4c3f-a795-7e52e534327c",
                                "73131b88-5ab3-476e-9b85-811a34719927",
                                "7601ce55-1ce6-4554-bb2f-d8d8c45693b0",
                                "78ede008-5dfc-4652-9aee-f08282fe0a1d",
                                "7ad021c8-86b2-4dbb-9e3b-59e1e4701894",
                                "7d055762-b22c-44b5-8d14-c8ad9fc9ec9f",
                                "7e503891-c335-4880-bfef-cfaf21ef28b2",
                                "958c24ac-9494-4ab3-b0b4-a4dc0d8dcfce",
                                "9635d53b-966f-4b4b-9756-11df373fc293",
                                "9b87031a-cfd5-45c2-bc01-3a7f59a46b31",
                                "a26ab867-f077-4a64-90a7-731b4bdf844d",
                                "a438fe89-36a9-45c3-b904-66d76b011f56",
                                "ac31cbd0-7d6b-4507-bfbd-165cfd6519db",
                                "acde23cf-0d9d-4b88-8970-e2585cde7b41",
                                "b7d6b83e-af3c-4d66-ab9e-81ff53432574",
                                "c2497e45-2197-452e-9ce7-6d17f41e7a69",
                                "c8f5dea1-59e5-4457-813d-3f6eb52ee21c",
                                "cb15efb5-33e6-466e-89e1-1957bd26d021",
                                "cd7aa1a6-0688-4862-b2a1-d53fc2fc2216",
                                "cef6b6c9-3fbb-49d3-93c4-dfa01849e5ff",
                                "d473d661-ff6c-4944-b13a-b1df0bd71315",
                                "d8320b00-c71c-49b9-958d-f6d0c1bd6c22",
                                "e0f72926-6487-4cb6-883e-d27d749882c0",
                                "ea861104-b8e3-4af0-8e0f-e6070496aede",
                                "ed70f6f5-324a-43d9-b8d2-14bda07f647c",
                                "ef5526ef-7e61-460a-b055-df02f876b63a",
                                "ef6ae05a-481a-4f7a-80af-16f5188009af",
                                "f174b5cf-7d2e-4700-9188-7726dda0dc12",
                                "f6b0136a-45cb-4e2a-a24d-ebd8da66731d",
                                "f763452d-ee3a-43d5-ab4a-f65b8f04e7e9",
                                "fe6a8852-2fa4-4918-8a30-9b7b5ebff7cc"
                            ],
                            "interface_list": [
                                "default-domain:admin:st102_port58",
                                "default-domain:admin:st102_port66",
                                "default-domain:admin:st102_port62",
                                "default-domain:admin:st102_port78",
                                "default-domain:admin:st102_port76",
                                "default-domain:admin:st102_port89",
                                "default-domain:admin:st102_port99",
                                "default-domain:admin:st102_port61",
                                "default-domain:admin:st102_port95",
                                "default-domain:admin:st102_port70",
                                "default-domain:admin:st102_port77",
                                "default-domain:admin:st102_port92",
                                "default-domain:admin:st102_port74",
                                "default-domain:admin:st102_port73",
                                "default-domain:admin:st102_port59",
                                "default-domain:admin:st102_port69",
                                "default-domain:admin:st102_port72",
                                "default-domain:admin:st102_port84",
                                "default-domain:admin:st102_port57",
                                "default-domain:admin:st102_port91",
                                "default-domain:admin:st102_port65",
                                "default-domain:admin:st102_port75",
                                "default-domain:admin:st102_port68",
                                "default-domain:admin:st102_port83",
                                "default-domain:admin:st102_port85",
                                "default-domain:admin:st102_port90",
                                "default-domain:admin:st102_port88",
                                "default-domain:admin:st102_port81",
                                "default-domain:admin:st102_port82",
                                "default-domain:admin:st102_port96",
                                "default-domain:admin:st102_port52",
                                "default-domain:admin:st102_port55",
                                "default-domain:admin:st102_port64",
                                "default-domain:admin:st102_port67",
                                "default-domain:admin:st102_port87",
                                "default-domain:admin:st102_port80",
                                "default-domain:admin:st102_port100",
                                "default-domain:admin:st102_port98",
                                "default-domain:admin:st102_port93",
                                "default-domain:admin:st102_port97",
                                "default-domain:admin:st102_port56",
                                "default-domain:admin:st102_port60",
                                "default-domain:admin:st102_port86",
                                "default-domain:admin:st102_port71",
                                "default-domain:admin:st102_port79",
                                "default-domain:admin:st102_port54",
                                "default-domain:admin:st102_port63",
                                "default-domain:admin:st102_port53",
                                "default-domain:admin:st102_port94"
                            ],
                            "ingress_flow_count": 0,
                            "out_bandwidth_usage": 0
                        },
                        "UveVirtualNetworkConfig": {
                            "connected_networks": [
                                "default-domain:admin:frontend"
                            ]
                        }
                    }
                },
                {
                    "name": "default-domain:admin:st_vn11",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 0,
                            "in_bandwidth_usage": 0,
                            "egress_flow_count": 0,
                            "acl": null,
                            "virtualmachine_list": [
                                "e2d1a978-da31-44e8-b83a-87fba37b1d3a"
                            ],
                            "interface_list": [
                                "default-domain:admin:st_port11"
                            ],
                            "ingress_flow_count": 0,
                            "out_bandwidth_usage": 0
                        },
                        "UveVirtualNetworkConfig": {}
                    }
                },
                {
                    "name": "default-domain:admin:st_vn12",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 0,
                            "in_bandwidth_usage": 0,
                            "egress_flow_count": 0,
                            "acl": null,
                            "virtualmachine_list": [
                                "0631004a-5544-4bb1-b94c-7340767efc5b"
                            ],
                            "interface_list": [
                                "default-domain:admin:st_port12"
                            ],
                            "ingress_flow_count": 0,
                            "out_bandwidth_usage": 0
                        },
                        "UveVirtualNetworkConfig": {}
                    }
                },
                {
                    "name": "default-domain:admin:st_vn13",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 0,
                            "in_bandwidth_usage": 0,
                            "egress_flow_count": 0,
                            "acl": null,
                            "virtualmachine_list": [
                                "eb42f001-33c5-4489-bc51-069e1d67ecc2"
                            ],
                            "interface_list": [
                                "default-domain:admin:st_port13"
                            ],
                            "ingress_flow_count": 0,
                            "out_bandwidth_usage": 0
                        },
                        "UveVirtualNetworkConfig": {}
                    }
                },
                {
                    "name": "default-domain:admin:st_vn14",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 0,
                            "in_bandwidth_usage": 0,
                            "egress_flow_count": 0,
                            "acl": null,
                            "virtualmachine_list": [
                                "cf30f73e-015b-4c25-ae1e-95d10626fc47"
                            ],
                            "interface_list": [
                                "default-domain:admin:st_port14"
                            ],
                            "ingress_flow_count": 0,
                            "out_bandwidth_usage": 0
                        },
                        "UveVirtualNetworkConfig": {}
                    }
                },
                {
                    "name": "default-domain:admin:st_vn15",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 0,
                            "in_bandwidth_usage": 0,
                            "egress_flow_count": 0,
                            "acl": null,
                            "virtualmachine_list": [
                                "377a76b6-359e-4e38-8132-deff4abef460"
                            ],
                            "interface_list": [
                                "default-domain:admin:st_port15"
                            ],
                            "ingress_flow_count": 0,
                            "out_bandwidth_usage": 0
                        },
                        "UveVirtualNetworkConfig": {}
                    }
                },
                {
                    "name": "default-domain:admin:st_vn16",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 0,
                            "in_bandwidth_usage": 0,
                            "egress_flow_count": 0,
                            "acl": null,
                            "virtualmachine_list": [
                                "26fdfe9c-bfad-4886-9ea4-aa6a382dc68f"
                            ],
                            "interface_list": [
                                "default-domain:admin:st_port16"
                            ],
                            "ingress_flow_count": 0,
                            "out_bandwidth_usage": 0
                        },
                        "UveVirtualNetworkConfig": {}
                    }
                },
                {
                    "name": "default-domain:admin:st_vn17",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 0,
                            "in_bandwidth_usage": 0,
                            "egress_flow_count": 0,
                            "acl": null,
                            "virtualmachine_list": [
                                "b6fb2da1-3286-48c2-bfe5-4df72e045a57"
                            ],
                            "interface_list": [
                                "default-domain:admin:st_port17"
                            ],
                            "ingress_flow_count": 0,
                            "out_bandwidth_usage": 0
                        },
                        "UveVirtualNetworkConfig": {}
                    }
                },
                {
                    "name": "default-domain:admin:st_vn18",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 0,
                            "in_bandwidth_usage": 0,
                            "egress_flow_count": 0,
                            "acl": null,
                            "virtualmachine_list": [
                                "5538a2b8-19e0-4151-b175-d1316206f227"
                            ],
                            "interface_list": [
                                "default-domain:admin:st_port18"
                            ],
                            "ingress_flow_count": 0,
                            "out_bandwidth_usage": 0
                        },
                        "UveVirtualNetworkConfig": {}
                    }
                },
                {
                    "name": "default-domain:admin:st_vn19",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 0,
                            "in_bandwidth_usage": 0,
                            "egress_flow_count": 0,
                            "acl": null,
                            "virtualmachine_list": [
                                "1cb93181-b7ac-4849-a0bb-cf4878c4b73a"
                            ],
                            "interface_list": [
                                "default-domain:admin:st_port19"
                            ],
                            "ingress_flow_count": 0,
                            "out_bandwidth_usage": 0
                        },
                        "UveVirtualNetworkConfig": {}
                    }
                },
                {
                    "name": "default-domain:admin:st_vn2",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 10,
                            "in_bandwidth_usage": 0,
                            "egress_flow_count": 0,
                            "acl": "default-domain:admin:st_vn2:st_vn2",
                            "virtualmachine_list": [
                                "a47d3974-74c5-46b8-95f7-928d0c7c67cd"
                            ],
                            "interface_list": [
                                "default-domain:admin:st_port2"
                            ],
                            "ingress_flow_count": 0,
                            "out_bandwidth_usage": 0
                        },
                        "UveVirtualNetworkConfig": {
                            "connected_networks": [
                                "default-domain:admin:st_vn1",
                                "default-domain:admin:st_vn3",
                                "default-domain:admin:st_vn4",
                                "default-domain:admin:st_vn5"
                            ]
                        }
                    }
                },
                {
                    "name": "default-domain:admin:st_vn20",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 0,
                            "in_bandwidth_usage": 0,
                            "egress_flow_count": 0,
                            "acl": null,
                            "virtualmachine_list": [
                                "3b913003-18d6-446c-bb1b-f99b284e6341"
                            ],
                            "interface_list": [
                                "default-domain:admin:st_port20"
                            ],
                            "ingress_flow_count": 0,
                            "out_bandwidth_usage": 0
                        },
                        "UveVirtualNetworkConfig": {}
                    }
                },
                {
                    "name": "default-domain:admin:st_vn21",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 0,
                            "in_bandwidth_usage": 0,
                            "egress_flow_count": 0,
                            "acl": null,
                            "virtualmachine_list": [
                                "c19243a3-d79c-41dd-afba-5db277beb130"
                            ],
                            "interface_list": [
                                "default-domain:admin:st_port21"
                            ],
                            "ingress_flow_count": 0,
                            "out_bandwidth_usage": 0
                        },
                        "UveVirtualNetworkConfig": {}
                    }
                },
                {
                    "name": "default-domain:admin:st_vn22",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 0,
                            "in_bandwidth_usage": 0,
                            "egress_flow_count": 0,
                            "acl": null,
                            "virtualmachine_list": [
                                "3ca3cc54-217b-4cc9-80b3-4cd0ed799d80"
                            ],
                            "interface_list": [
                                "default-domain:admin:st_port22"
                            ],
                            "ingress_flow_count": 0,
                            "out_bandwidth_usage": 0
                        },
                        "UveVirtualNetworkConfig": {}
                    }
                },
                {
                    "name": "default-domain:admin:st_vn23",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 0,
                            "in_bandwidth_usage": 0,
                            "egress_flow_count": 0,
                            "acl": null,
                            "virtualmachine_list": [
                                "f08b50d1-1713-488f-9eec-bdce632e1d45"
                            ],
                            "interface_list": [
                                "default-domain:admin:st_port23"
                            ],
                            "ingress_flow_count": 0,
                            "out_bandwidth_usage": 0
                        },
                        "UveVirtualNetworkConfig": {}
                    }
                },
                {
                    "name": "default-domain:admin:st_vn24",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 0,
                            "in_bandwidth_usage": 0,
                            "egress_flow_count": 0,
                            "acl": null,
                            "virtualmachine_list": [
                                "3220888b-a28e-4e64-9c39-c3785056c3a5"
                            ],
                            "interface_list": [
                                "default-domain:admin:st_port24"
                            ],
                            "ingress_flow_count": 0,
                            "out_bandwidth_usage": 0
                        },
                        "UveVirtualNetworkConfig": {}
                    }
                },
                {
                    "name": "default-domain:admin:st_vn25",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 0,
                            "in_bandwidth_usage": 0,
                            "egress_flow_count": 0,
                            "acl": null,
                            "virtualmachine_list": [
                                "945a485d-8751-472b-a8f4-dc12292b4c86"
                            ],
                            "interface_list": [
                                "default-domain:admin:st_port25"
                            ],
                            "ingress_flow_count": 0,
                            "out_bandwidth_usage": 0
                        },
                        "UveVirtualNetworkConfig": {}
                    }
                },
                {
                    "name": "default-domain:admin:st_vn26",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 0,
                            "in_bandwidth_usage": 0,
                            "egress_flow_count": 0,
                            "acl": null,
                            "virtualmachine_list": [
                                "08442050-bfc0-4f22-a6f9-40b489d3e991"
                            ],
                            "interface_list": [
                                "default-domain:admin:st_port26"
                            ],
                            "ingress_flow_count": 0,
                            "out_bandwidth_usage": 0
                        },
                        "UveVirtualNetworkConfig": {}
                    }
                },
                {
                    "name": "default-domain:admin:st_vn27",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 0,
                            "in_bandwidth_usage": 0,
                            "egress_flow_count": 0,
                            "acl": null,
                            "virtualmachine_list": [
                                "e44ae363-32de-4d4b-b781-9aeed4469dcc"
                            ],
                            "interface_list": [
                                "default-domain:admin:st_port27"
                            ],
                            "ingress_flow_count": 0,
                            "out_bandwidth_usage": 0
                        },
                        "UveVirtualNetworkConfig": {}
                    }
                }
            ]
        },
        "lastKey": "default-domain:admin:st_vn27",
        "more": false
    };
    this.networksMockStatData = [
        {
            "value": [
                {
                    "name": "default-domain:admin:backend",
                    "SUM(vn_stats.in_bytes)": 9623250,
                    "SUM(vn_stats.in_tpkts)": 33413,
                    "SUM(vn_stats.out_bytes)": 12849942,
                    "SUM(vn_stats.out_tpkts)": 33487
                },
                {
                    "name": "default-domain:admin:st_vn22",
                    "SUM(vn_stats.in_bytes)": 0,
                    "SUM(vn_stats.in_tpkts)": 0,
                    "SUM(vn_stats.out_bytes)": 0,
                    "SUM(vn_stats.out_tpkts)": 0
                },
                {
                    "name": "default-domain:admin:st_vn25",
                    "SUM(vn_stats.in_bytes)": 0,
                    "SUM(vn_stats.in_tpkts)": 0,
                    "SUM(vn_stats.out_bytes)": 0,
                    "SUM(vn_stats.out_tpkts)": 0
                },
                {
                    "name": "default-domain:admin:st_vn23",
                    "SUM(vn_stats.in_bytes)": 0,
                    "SUM(vn_stats.in_tpkts)": 0,
                    "SUM(vn_stats.out_bytes)": 0,
                    "SUM(vn_stats.out_tpkts)": 0
                },
                {
                    "name": "default-domain:admin:st_vn21",
                    "SUM(vn_stats.in_bytes)": 0,
                    "SUM(vn_stats.in_tpkts)": 0,
                    "SUM(vn_stats.out_bytes)": 0,
                    "SUM(vn_stats.out_tpkts)": 0
                },
                {
                    "name": "default-domain:admin:st_vn24",
                    "SUM(vn_stats.in_bytes)": 0,
                    "SUM(vn_stats.in_tpkts)": 0,
                    "SUM(vn_stats.out_bytes)": 0,
                    "SUM(vn_stats.out_tpkts)": 0
                },
                {
                    "name": "default-domain:admin:st_vn20",
                    "SUM(vn_stats.in_bytes)": 0,
                    "SUM(vn_stats.in_tpkts)": 0,
                    "SUM(vn_stats.out_bytes)": 0,
                    "SUM(vn_stats.out_tpkts)": 0
                },
                {
                    "name": "default-domain:admin:st_vn26",
                    "SUM(vn_stats.in_bytes)": 0,
                    "SUM(vn_stats.in_tpkts)": 0,
                    "SUM(vn_stats.out_bytes)": 0,
                    "SUM(vn_stats.out_tpkts)": 0
                },
                {
                    "name": "default-domain:admin:st_vn27",
                    "SUM(vn_stats.in_bytes)": 0,
                    "SUM(vn_stats.in_tpkts)": 0,
                    "SUM(vn_stats.out_bytes)": 0,
                    "SUM(vn_stats.out_tpkts)": 0
                },
                {
                    "name": "default-domain:admin:st_vn15",
                    "SUM(vn_stats.in_bytes)": 0,
                    "SUM(vn_stats.in_tpkts)": 0,
                    "SUM(vn_stats.out_bytes)": 0,
                    "SUM(vn_stats.out_tpkts)": 0
                },
                {
                    "name": "default-domain:admin:st_vn12",
                    "SUM(vn_stats.in_bytes)": 0,
                    "SUM(vn_stats.in_tpkts)": 0,
                    "SUM(vn_stats.out_bytes)": 0,
                    "SUM(vn_stats.out_tpkts)": 0
                },
                {
                    "name": "default-domain:admin:st_vn14",
                    "SUM(vn_stats.in_bytes)": 0,
                    "SUM(vn_stats.in_tpkts)": 0,
                    "SUM(vn_stats.out_bytes)": 0,
                    "SUM(vn_stats.out_tpkts)": 0
                },
                {
                    "name": "default-domain:admin:st_vn11",
                    "SUM(vn_stats.in_bytes)": 0,
                    "SUM(vn_stats.in_tpkts)": 0,
                    "SUM(vn_stats.out_bytes)": 0,
                    "SUM(vn_stats.out_tpkts)": 0
                },
                {
                    "name": "default-domain:admin:st_vn13",
                    "SUM(vn_stats.in_bytes)": 0,
                    "SUM(vn_stats.in_tpkts)": 0,
                    "SUM(vn_stats.out_bytes)": 0,
                    "SUM(vn_stats.out_tpkts)": 0
                },
                {
                    "name": "default-domain:admin:st_vn10",
                    "SUM(vn_stats.in_bytes)": 0,
                    "SUM(vn_stats.in_tpkts)": 0,
                    "SUM(vn_stats.out_bytes)": 0,
                    "SUM(vn_stats.out_tpkts)": 0
                },
                {
                    "name": "default-domain:admin:st_vn19",
                    "SUM(vn_stats.in_bytes)": 0,
                    "SUM(vn_stats.in_tpkts)": 0,
                    "SUM(vn_stats.out_bytes)": 0,
                    "SUM(vn_stats.out_tpkts)": 0
                },
                {
                    "name": "default-domain:admin:st_vn16",
                    "SUM(vn_stats.in_bytes)": 0,
                    "SUM(vn_stats.in_tpkts)": 0,
                    "SUM(vn_stats.out_bytes)": 0,
                    "SUM(vn_stats.out_tpkts)": 0
                },
                {
                    "name": "default-domain:admin:st_vn18",
                    "SUM(vn_stats.in_bytes)": 0,
                    "SUM(vn_stats.in_tpkts)": 0,
                    "SUM(vn_stats.out_bytes)": 0,
                    "SUM(vn_stats.out_tpkts)": 0
                },
                {
                    "name": "default-domain:admin:st_vn17",
                    "SUM(vn_stats.in_bytes)": 0,
                    "SUM(vn_stats.in_tpkts)": 0,
                    "SUM(vn_stats.out_bytes)": 0,
                    "SUM(vn_stats.out_tpkts)": 0
                },
                {
                    "name": "default-domain:admin:st_vn2",
                    "SUM(vn_stats.in_bytes)": 0,
                    "SUM(vn_stats.in_tpkts)": 0,
                    "SUM(vn_stats.out_bytes)": 0,
                    "SUM(vn_stats.out_tpkts)": 0
                },
                {
                    "name": "default-domain:admin:st_vn1",
                    "SUM(vn_stats.in_bytes)": 0,
                    "SUM(vn_stats.in_tpkts)": 0,
                    "SUM(vn_stats.out_bytes)": 0,
                    "SUM(vn_stats.out_tpkts)": 0
                },
                {
                    "name": "default-domain:admin:frontend",
                    "SUM(vn_stats.in_bytes)": 12849942,
                    "SUM(vn_stats.in_tpkts)": 33487,
                    "SUM(vn_stats.out_bytes)": 9623250,
                    "SUM(vn_stats.out_tpkts)": 33413
                },
                {
                    "name": "default-domain:admin:st_vn101",
                    "SUM(vn_stats.in_bytes)": 0,
                    "SUM(vn_stats.in_tpkts)": 0,
                    "SUM(vn_stats.out_bytes)": 0,
                    "SUM(vn_stats.out_tpkts)": 0
                },
                {
                    "name": "default-domain:admin:st_vn102",
                    "SUM(vn_stats.in_bytes)": 0,
                    "SUM(vn_stats.in_tpkts)": 0,
                    "SUM(vn_stats.out_bytes)": 0,
                    "SUM(vn_stats.out_tpkts)": 0
                },
                {
                    "name": "default-domain:admin:st_vn100",
                    "SUM(vn_stats.in_bytes)": 0,
                    "SUM(vn_stats.in_tpkts)": 0,
                    "SUM(vn_stats.out_bytes)": 0,
                    "SUM(vn_stats.out_tpkts)": 0
                }
            ]
        }
    ];
    return {
        domainsMockData: domainsMockData,
        projectMockData: projectMockData,
        networksMockData: networksMockData,
        networksMockStatData: networksMockStatData
    };
});
