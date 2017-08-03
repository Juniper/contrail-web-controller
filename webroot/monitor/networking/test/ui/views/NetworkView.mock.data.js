/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function (_) {
    this.domainsMockData = {
        "domains": [
            {
                "href": "http://10.84.11.2:8082/domain/35468934-bfe5-4c0e-84e2-ddfc9b49af74",
                "display_name": "default-domain",
                "fq_name": [
                    "default-domain"
                ],
                "uuid": "35468934-bfe5-4c0e-84e2-ddfc9b49af74"
            }
        ]
    };
    this.projectMockData = {
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
    this.networksForAdminProjectMockData = {
        "virtual-networks": [
            {
                "href": "http://10.84.11.2:8082/virtual-network/ad8a9efc-9b7e-4425-9735-03bda0d2726e",
                "fq_name": [
                    "default-domain",
                    "admin",
                    "frontend"
                ],
                "uuid": "ad8a9efc-9b7e-4425-9735-03bda0d2726e"
            },
            {
                "href": "http://10.84.11.2:8082/virtual-network/2847747f-cb2c-4499-9b12-0f1711168e72",
                "fq_name": [
                    "default-domain",
                    "admin",
                    "backend"
                ],
                "uuid": "2847747f-cb2c-4499-9b12-0f1711168e72"
            }
        ]
    };
    this.networkSummaryForFrontEndNetworkMockData =
    {
        "value": [
        {
            "name": "default-domain:admin:frontend",
            "value": {
                "UveVirtualNetworkAgent": {
                    "udp_sport_bitmap": [
                        "1",
                    "0",
                    "0",
                    "0",
                    "4294967295",
                    "4294967295",
                    "4294967295",
                    "32767"
                        ],
                    "mirror_acl": null,
                    "vrf_stats_list": [
                    {
                        "offload_packet_counts": {
                            "gro": 0
                        },
                        "unknown_unicast_floods": 0,
                        "arp_packet_counts": {
                            "from_vm_interface": {
                                "stats": {
                                    "floods": 0,
                                    "proxies": 382,
                                    "stitches": 25906
                                }
                            },
                            "from_physical_interface": {
                                "stats": {
                                    "floods": 0,
                                    "proxies": 0,
                                    "stitches": 0
                                }
                            }
                        },
                        "name": "default-domain:admin:frontend:frontend",
                        "nh_packet_counts": {
                            "discards": 0,
                            "local_vm_l3_forwards": 0,
                            "resolves": 0,
                            "local_vm_l2_forwards": 0,
                            "l3_receives": 0,
                            "l2_receives": 0,
                            "comp_nh_stats": {
                                "edge_replication_forwards": 0,
                                "source_replication_forwards": 0,
                                "local_vm_l3_forwards": 0,
                                "total_multicast_forwards": 0
                            },
                            "ecmp_forwards": 0,
                            "vrf_translates": 0,
                            "tunnel_nh_stats": {
                                "vxlan_encaps": 0,
                                "mpls_over_udp_encaps": 0,
                                "udp_encaps": 0,
                                "mpls_over_gre_encaps": 0
                            }
                        },
                        "diag_packet_count": 60
                    }
                    ],
                        "total_acl_rules": 4,
                        "in_bandwidth_usage": 244453,
                        "vn_stats": [
                        {
                            "in_bytes": 0,
                            "other_vn": "__UNKNOWN__",
                            "out_bytes": 0,
                            "out_tpkts": 0,
                            "in_tpkts": 0,
                            "vrouter": "a7s12"
                        },
                        {
                            "in_bytes": 910822,
                            "other_vn": "default-domain:admin:backend",
                            "out_bytes": 884424,
                            "out_tpkts": 2648,
                            "in_tpkts": 2655,
                            "vrouter": "a7s12"
                        },
                        {
                            "in_bytes": 5880,
                            "other_vn": "default-domain:admin:frontend",
                            "out_bytes": 5880,
                            "out_tpkts": 60,
                            "in_tpkts": 60,
                            "vrouter": "a7s12"
                        },
                        {
                            "in_bytes": 0,
                            "other_vn": "default-domain:default-project:ip-fabric",
                            "out_bytes": 0,
                            "out_tpkts": 0,
                            "in_tpkts": 0,
                            "vrouter": "a7s12"
                        }
                    ],
                        "in_stats": [
                        {
                            "bytes": 17924,
                            "other_vn": "__UNKNOWN__",
                            "tpkts": 244
                        },
                        {
                            "bytes": 48316200918,
                            "other_vn": "default-domain:admin:backend",
                            "tpkts": 144271677
                        },
                        {
                            "bytes": 171774806,
                            "other_vn": "default-domain:admin:frontend",
                            "tpkts": 1751135
                        },
                        {
                            "bytes": 40152,
                            "other_vn": "default-domain:default-project:ip-fabric",
                            "tpkts": 441
                        }
                    ],
                        "policy_rule_stats": [
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
                            "rule": "62bea881-acd9-4f37-ab6e-330080cdef79"
                        }
                    ],
                        "egress_flow_count": 102,
                        "udp_dport_bitmap": [
                            "1",
                        "0",
                        "0",
                        "0",
                        "4294967295",
                        "4294967295",
                        "4294967295",
                        "32767"
                            ],
                        "associated_fip_count": 1,
                        "out_stats": [
                        {
                            "bytes": 0,
                            "other_vn": "__UNKNOWN__",
                            "tpkts": 0
                        },
                        {
                            "bytes": 48313213794,
                            "other_vn": "default-domain:admin:backend",
                            "tpkts": 144254557
                        },
                        {
                            "bytes": 171774806,
                            "other_vn": "default-domain:admin:frontend",
                            "tpkts": 1751135
                        },
                        {
                            "bytes": 31952,
                            "other_vn": "default-domain:default-project:ip-fabric",
                            "tpkts": 420
                        }
                    ],
                        "virtualmachine_list": [
                            "5199c65e-8b71-4e4c-90cc-58deea9752dd",
                        "c73ed229-bbf2-4e1e-be26-4aee2d1780b3",
                        "faa5b186-5383-4670-b640-ad230fe2100f"
                            ],
                        "tcp_sport_bitmap": [
                            "2147484161",
                        "65544",
                        "0",
                        "0",
                        "136490532",
                        "654350348",
                        "2358411620",
                        "5150"
                            ],
                        "interface_list": [
                            "default-domain:admin:fede15b7-548a-4dac-a7ab-c88749e4dcca",
                        "default-domain:admin:fbf56475-71dc-46dd-bf8e-0f8dc127dc82",
                        "default-domain:admin:08242801-ff6e-44d4-876d-4a001ba21862"
                            ],
                        "acl": "default-domain:admin:frontend:frontend",
                        "tcp_dport_bitmap": [
                            "513",
                        "65544",
                        "0",
                        "0",
                        "136490532",
                        "654350348",
                        "2358411620",
                        "5150"
                            ],
                        "ingress_flow_count": 102,
                        "out_bandwidth_usage": 237414
                },
                "RoutingInstanceStatsData": {
                    "ermvpn_stats": {
                        "a7s12:Control:contrail-control:0:\"default-domain:admin:frontend:frontend\"": {
                            "prefixes": 2,
                            "total_paths": 2,
                            "primary_paths": 2,
                            "infeasible_paths": 0,
                            "secondary_paths": 0
                        }
                    },
                    "evpn_stats": {
                        "a7s12:Control:contrail-control:0:\"default-domain:admin:frontend:frontend\"": {
                            "prefixes": 9,
                            "total_paths": 9,
                            "primary_paths": 9,
                            "infeasible_paths": 0,
                            "secondary_paths": 0
                        }
                    },
                    "ipv4_stats": {
                        "a7s12:Control:contrail-control:0:\"default-domain:admin:frontend:frontend\"": {
                            "prefixes": 5,
                            "total_paths": 5,
                            "primary_paths": 4,
                            "infeasible_paths": 0,
                            "secondary_paths": 1
                        }
                    }
                },
                "ContrailConfig": {
                    "deleted": false,
                    "elements": {
                        "parent_uuid": "\"6f6f5981-515c-4d64-ac1b-1135b0ccdd1f\"",
                        "parent_type": "\"project\"",
                        "route_target_list": "{\"route_target\": []}",
                        "display_name": "\"frontend\"",
                        "virtual_network_network_id": "3",
                        "id_perms": "{\"enable\": true, \"uuid\": {\"uuid_mslong\": 9532422352401548634, \"uuid_lslong\": 11514566773222571326}, \"creator\": null, \"created\": \"2016-10-27T21:08:09.446001\", \"user_visible\": true, \"last_modified\": \"2016-11-10T00:28:01.225938\", \"permissions\": {\"owner\": \"neutron\", \"owner_access\": 7, \"other_access\": 7, \"group\": \"admin\", \"group_access\": 7}, \"description\": null}",
                        "instance_ip_back_refs": "[{\"to\": [\"dd7121b8-ee54-410d-b0e6-09411dfb2b5a\"], \"attr\": null, \"uuid\": \"dd7121b8-ee54-410d-b0e6-09411dfb2b5a\"}]",
                        "multi_policy_service_chains_enabled": "false",
                        "floating_ip_pools": "[{\"to\": [\"default-domain\", \"admin\", \"frontend\", \"pool1\"], \"uuid\": \"1aafd65f-bdfa-4442-abeb-50de473d20b0\"}]",
                        "virtual_network_properties": "{\"allow_transit\": false, \"mirror_destination\": false, \"rpf\": \"enable\"}",
                        "ecmp_hashing_include_fields": "{}",
                        "network_policy_refs": "[{\"to\": [\"default-domain\", \"admin\", \"f2b-allow-policy\"], \"attr\": {\"timer\": null, \"sequence\": {\"major\": 0, \"minor\": 0}}, \"uuid\": \"7ec7a888-84c9-4f72-8fa8-5aadf45275c8\"}]",
                        "virtual_machine_interface_back_refs": "[{\"to\": [\"default-domain\", \"admin\", \"08242801-ff6e-44d4-876d-4a001ba21862\"], \"attr\": null, \"uuid\": \"08242801-ff6e-44d4-876d-4a001ba21862\"}]",
                        "provider_properties": "null",
                        "perms2": "{\"owner\": \"a6c92d95076d49b6b57820159c5480f6\", \"owner_access\": 7, \"global_access\": 0, \"share\": []}",
                        "fq_name": "[\"default-domain\", \"admin\", \"frontend\"]",
                        "routing_instances": "[{\"to\": [\"default-domain\", \"admin\", \"frontend\", \"frontend\"], \"uuid\": \"ba640d9e-53fd-4c0c-8114-cf7e9ae675ad\"}]",
                        "uuid": "\"8449f79f-e3e3-455a-9fcb-f57934727d3e\"",
                        "import_route_target_list": "{\"route_target\": []}",
                        "is_shared": "false",
                        "access_control_lists": "[{\"to\": [\"default-domain\", \"admin\", \"frontend\", \"frontend\"], \"uuid\": \"a54c6249-caf8-462a-ac85-5739f8ba394b\"}]",
                        "router_external": "false",
                        "export_route_target_list": "{\"route_target\": []}",
                        "flood_unknown_unicast": "false",
                        "network_ipam_refs": "[{\"to\": [\"default-domain\", \"default-project\", \"default-network-ipam\"], \"attr\": {\"ipam_subnets\": [{\"subnet\": {\"ip_prefix\": \"10.1.1.0\", \"ip_prefix_len\": 24}, \"addr_from_start\": true, \"enable_dhcp\": true, \"default_gateway\": \"10.1.1.1\", \"dns_nameservers\": [], \"subnet_uuid\": \"fe6f2b83-2afa-4d29-a587-d18a038d29d6\", \"alloc_unit\": 1, \"subnet_name\": \"\", \"dns_server_address\": \"10.1.1.2\"}]}, \"uuid\": \"c4cad97e-1a90-407f-b944-a6cd7fd10747\"}]"
                    }
                },
                "UveVirtualNetworkConfig": {
                    "total_acl_rules": 4,
                    "routing_instance_list": [
                        "default-domain:admin:frontend:frontend"
                        ],
                    "connected_networks": [
                        "default-domain:admin:backend"
                        ]
                }
            }
        }
        ]
    };
    /*
    {
        "value": [
            {
                "name": "default-domain:admin:frontend",
                "value": {
                    "UveVirtualNetworkAgent": {
                        "udp_sport_bitmap": [
                            "1",
                            "0",
                            "0",
                            "0",
                            "4294967295",
                            "4294967295",
                            "4294967295",
                            "32767"
                        ],
                        "mirror_acl": null,
                        "vrf_stats_list": [
                            {
                                "discards": 0,
                                "l3_mcast_composites": 0,
                                "fabric_composites": 0,
                                "name": "default-domain:admin:frontend:frontend",
                                "l2_encaps": 1235,
                                "encaps": 272977996,
                                "receives": 0,
                                "l2_mcast_composites": 371079,
                                "udp_tunnels": 0,
                                "resolves": 0,
                                "udp_mpls_tunnels": 0,
                                "gre_mpls_tunnels": 0,
                                "ecmp_composites": 0,
                                "multi_proto_composites": 0
                            }
                        ],
                        "total_acl_rules": 4,
                        "in_bandwidth_usage": 130692,
                        "vn_stats": [
                            {
                                "in_bytes": 473760,
                                "other_vn": "default-domain:admin:backend",
                                "out_bytes": 452966,
                                "out_tpkts": 1387,
                                "in_tpkts": 1392,
                                "vrouter": "a3s29"
                            },
                            {
                                "in_bytes": 0,
                                "other_vn": "default-domain:admin:frontend",
                                "out_bytes": 0,
                                "out_tpkts": 0,
                                "in_tpkts": 0,
                                "vrouter": "a3s29"
                            },
                            {
                                "in_bytes": 0,
                                "other_vn": "default-domain:default-project:ip-fabric",
                                "out_bytes": 0,
                                "out_tpkts": 0,
                                "in_tpkts": 0,
                                "vrouter": "a3s29"
                            }
                        ],
                        "in_stats": [
                            {
                                "bytes": 91396500150,
                                "other_vn": "default-domain:admin:backend",
                                "tpkts": 272974489
                            },
                            {
                                "bytes": 289031,
                                "other_vn": "default-domain:admin:frontend",
                                "tpkts": 3317
                            },
                            {
                                "bytes": 13186,
                                "other_vn": "default-domain:default-project:ip-fabric",
                                "tpkts": 144
                            }
                        ],
                        "out_bandwidth_usage": 124956,
                        "egress_flow_count": 53,
                        "udp_dport_bitmap": [
                            "1",
                            "0",
                            "0",
                            "0",
                            "4294967295",
                            "4294967295",
                            "4294967295",
                            "32767"
                        ],
                        "ingress_flow_count": 53,
                        "tcp_dport_bitmap": [
                            "1",
                            "8",
                            "0",
                            "0",
                            "1212940416",
                            "32776",
                            "528386",
                            "0"
                        ],
                        "virtualmachine_list": [
                            "7c20fb79-1a0a-49e3-b31f-d53db046264e"
                        ],
                        "tcp_sport_bitmap": [
                            "0",
                            "8",
                            "0",
                            "0",
                            "1212940416",
                            "32776",
                            "528386",
                            "0"
                        ],
                        "interface_list": [
                            "default-domain:admin:3683aa58-28ff-4ffb-8667-fb778d92ad0e"
                        ],
                        "out_stats": [
                            {
                                "bytes": 91475322510,
                                "other_vn": "default-domain:admin:backend",
                                "tpkts": 272988959
                            },
                            {
                                "bytes": 289031,
                                "other_vn": "default-domain:admin:frontend",
                                "tpkts": 3317
                            },
                            {
                                "bytes": 10907,
                                "other_vn": "default-domain:default-project:ip-fabric",
                                "tpkts": 144
                            }
                        ],
                        "associated_fip_count": 0,
                        "acl": "default-domain:admin:frontend:frontend"
                    },
                    "ContrailConfig": {
                        "properties": [
                            {
                                "attribute": "value",
                                "value": "{\"is_shared\": false, \"virtual_network_network_id\": 4, \"fq_name\": [\"default-domain\", \"admin\", \"frontend\"], \"uuid\": \"ad8a9efc-9b7e-4425-9735-03bda0d2726e\", \"network_policy_refs\": [{\"to\": [\"default-domain\", \"admin\", \"f2b-allow-policy\"], \"href\": \"http://127.0.0.1/network-policy/213e6d21-2094-41c2-8c25-455433fa4b43\", \"attr\": {\"timer\": null, \"sequence\": {\"major\": 0, \"minor\": 0}}, \"uuid\": \"213e6d21-2094-41c2-8c25-455433fa4b43\"}], \"router_external\": false, \"parent_href\": \"http://127.0.0.1/project/ba710bf3-922d-4cda-bbb4-a2e2e76533bf\", \"parent_type\": \"project\", \"id_perms\": {\"enable\": true, \"uuid\": {\"uuid_mslong\": 12504982123125294117, \"uuid_lslong\": 10895618986474631790}, \"created\": \"2015-07-22T20:58:40.895113\", \"description\": null, \"creator\": null, \"user_visible\": true, \"last_modified\": \"2015-07-22T20:59:44.458642\", \"permissions\": {\"owner\": \"neutron\", \"owner_access\": 7, \"other_access\": 7, \"group\": \"admin\", \"group_access\": 7}}, \"display_name\": \"frontend\", \"network_ipam_refs\": [{\"to\": [\"default-domain\", \"default-project\", \"default-network-ipam\"], \"href\": \"http://127.0.0.1/network-ipam/34a2aa88-75ad-412e-b49f-71941d5fe8fb\", \"attr\": {\"ipam_subnets\": [{\"subnet\": {\"ip_prefix\": \"10.2.1.0\", \"ip_prefix_len\": 24}, \"dns_server_address\": \"10.2.1.2\", \"enable_dhcp\": true, \"default_gateway\": \"10.2.1.1\", \"dns_nameservers\": [], \"allocation_pools\": [], \"subnet_uuid\": \"326d3c3d-879d-47e4-9c66-4c16d18440b5\", \"dhcp_option_list\": null, \"host_routes\": null, \"addr_from_start\": true, \"subnet_name\": \"\"}], \"host_routes\": null}, \"uuid\": \"34a2aa88-75ad-412e-b49f-71941d5fe8fb\"}], \"parent_uuid\": \"ba710bf3-922d-4cda-bbb4-a2e2e76533bf\"}"
                            }
                        ]
                    }
                }
            }
        ]
    };
    */
    this.flowSeriesForFrontendVNMockData = {
        "summary": {
            "start_time": 1443553594000000,
            "end_time": 1443560794000000,
            "timeGran_microsecs": 60000000
        },
        "flow-series": [
            {
                "time": 1443553560000000,
                "inBytes": 474256,
                "outBytes": 448928,
                "inPkts": 1360,
                "outPkts": 1356,
                "totalPkts": 2716,
                "totalBytes": 923184
            },
            {
                "time": 1443553620000000,
                "inBytes": 896388,
                "outBytes": 932110,
                "inPkts": 2782,
                "outPkts": 2767,
                "totalPkts": 5549,
                "totalBytes": 1828498
            },
            {
                "time": 1443553680000000,
                "inBytes": 946440,
                "outBytes": 898304,
                "inPkts": 2740,
                "outPkts": 2740,
                "totalPkts": 5480,
                "totalBytes": 1844744
            },
            {
                "time": 1443553740000000,
                "inBytes": 925912,
                "outBytes": 899830,
                "inPkts": 2696,
                "outPkts": 2687,
                "totalPkts": 5383,
                "totalBytes": 1825742
            },
            {
                "time": 1443553800000000,
                "inBytes": 956106,
                "outBytes": 943686,
                "inPkts": 2793,
                "outPkts": 2791,
                "totalPkts": 5584,
                "totalBytes": 1899792
            },
            {
                "time": 1443553860000000,
                "inBytes": 963042,
                "outBytes": 941040,
                "inPkts": 2813,
                "outPkts": 2812,
                "totalPkts": 5625,
                "totalBytes": 1904082
            },
            {
                "time": 1443553920000000,
                "inBytes": 939974,
                "outBytes": 936998,
                "inPkts": 2731,
                "outPkts": 2719,
                "totalPkts": 5450,
                "totalBytes": 1876972
            },
            {
                "time": 1443553980000000,
                "inBytes": 905500,
                "outBytes": 870966,
                "inPkts": 2694,
                "outPkts": 2691,
                "totalPkts": 5385,
                "totalBytes": 1776466
            },
            {
                "time": 1443554040000000,
                "inBytes": 919314,
                "outBytes": 964442,
                "inPkts": 2761,
                "outPkts": 2757,
                "totalPkts": 5518,
                "totalBytes": 1883756
            },
            {
                "time": 1443554100000000,
                "inBytes": 941150,
                "outBytes": 916444,
                "inPkts": 2773,
                "outPkts": 2760,
                "totalPkts": 5533,
                "totalBytes": 1857594
            },
            {
                "time": 1443554160000000,
                "inBytes": 911752,
                "outBytes": 914014,
                "inPkts": 2680,
                "outPkts": 2683,
                "totalPkts": 5363,
                "totalBytes": 1825766
            },
            {
                "time": 1443554220000000,
                "inBytes": 938498,
                "outBytes": 957184,
                "inPkts": 2833,
                "outPkts": 2828,
                "totalPkts": 5661,
                "totalBytes": 1895682
            },
            {
                "time": 1443554280000000,
                "inBytes": 963444,
                "outBytes": 924362,
                "inPkts": 2754,
                "outPkts": 2753,
                "totalPkts": 5507,
                "totalBytes": 1887806
            },
            {
                "time": 1443554340000000,
                "inBytes": 879638,
                "outBytes": 892302,
                "inPkts": 2715,
                "outPkts": 2711,
                "totalPkts": 5426,
                "totalBytes": 1771940
            },
            {
                "time": 1443554400000000,
                "inBytes": 916266,
                "outBytes": 914370,
                "inPkts": 2761,
                "outPkts": 2757,
                "totalPkts": 5518,
                "totalBytes": 1830636
            },
            {
                "time": 1443554460000000,
                "inBytes": 890026,
                "outBytes": 911342,
                "inPkts": 2701,
                "outPkts": 2703,
                "totalPkts": 5404,
                "totalBytes": 1801368
            },
            {
                "time": 1443554520000000,
                "inBytes": 857438,
                "outBytes": 862884,
                "inPkts": 2587,
                "outPkts": 2586,
                "totalPkts": 5173,
                "totalBytes": 1720322
            },
            {
                "time": 1443554580000000,
                "inBytes": 924164,
                "outBytes": 929748,
                "inPkts": 2778,
                "outPkts": 2782,
                "totalPkts": 5560,
                "totalBytes": 1853912
            },
            {
                "time": 1443554640000000,
                "inBytes": 884078,
                "outBytes": 879086,
                "inPkts": 2687,
                "outPkts": 2691,
                "totalPkts": 5378,
                "totalBytes": 1763164
            },
            {
                "time": 1443554700000000,
                "inBytes": 889632,
                "outBytes": 920926,
                "inPkts": 2656,
                "outPkts": 2663,
                "totalPkts": 5319,
                "totalBytes": 1810558
            },
            {
                "time": 1443554760000000,
                "inBytes": 920814,
                "outBytes": 951742,
                "inPkts": 2791,
                "outPkts": 2791,
                "totalPkts": 5582,
                "totalBytes": 1872556
            },
            {
                "time": 1443554820000000,
                "inBytes": 919864,
                "outBytes": 941812,
                "inPkts": 2748,
                "outPkts": 2746,
                "totalPkts": 5494,
                "totalBytes": 1861676
            },
            {
                "time": 1443554880000000,
                "inBytes": 893440,
                "outBytes": 927396,
                "inPkts": 2764,
                "outPkts": 2770,
                "totalPkts": 5534,
                "totalBytes": 1820836
            },
            {
                "time": 1443554940000000,
                "inBytes": 946548,
                "outBytes": 947904,
                "inPkts": 2830,
                "outPkts": 2828,
                "totalPkts": 5658,
                "totalBytes": 1894452
            },
            {
                "time": 1443555000000000,
                "inBytes": 929164,
                "outBytes": 939526,
                "inPkts": 2782,
                "outPkts": 2779,
                "totalPkts": 5561,
                "totalBytes": 1868690
            },
            {
                "time": 1443555060000000,
                "inBytes": 913656,
                "outBytes": 870616,
                "inPkts": 2656,
                "outPkts": 2656,
                "totalPkts": 5312,
                "totalBytes": 1784272
            },
            {
                "time": 1443555120000000,
                "inBytes": 930108,
                "outBytes": 923060,
                "inPkts": 2786,
                "outPkts": 2778,
                "totalPkts": 5564,
                "totalBytes": 1853168
            },
            {
                "time": 1443555180000000,
                "inBytes": 943972,
                "outBytes": 880274,
                "inPkts": 2718,
                "outPkts": 2717,
                "totalPkts": 5435,
                "totalBytes": 1824246
            },
            {
                "time": 1443555240000000,
                "inBytes": 901078,
                "outBytes": 918462,
                "inPkts": 2707,
                "outPkts": 2723,
                "totalPkts": 5430,
                "totalBytes": 1819540
            },
            {
                "time": 1443555300000000,
                "inBytes": 934420,
                "outBytes": 896902,
                "inPkts": 2770,
                "outPkts": 2783,
                "totalPkts": 5553,
                "totalBytes": 1831322
            },
            {
                "time": 1443555360000000,
                "inBytes": 919382,
                "outBytes": 927704,
                "inPkts": 2759,
                "outPkts": 2772,
                "totalPkts": 5531,
                "totalBytes": 1847086
            },
            {
                "time": 1443555420000000,
                "inBytes": 929522,
                "outBytes": 950828,
                "inPkts": 2773,
                "outPkts": 2798,
                "totalPkts": 5571,
                "totalBytes": 1880350
            },
            {
                "time": 1443555480000000,
                "inBytes": 941744,
                "outBytes": 929704,
                "inPkts": 2752,
                "outPkts": 2768,
                "totalPkts": 5520,
                "totalBytes": 1871448
            },
            {
                "time": 1443555540000000,
                "inBytes": 881080,
                "outBytes": 958916,
                "inPkts": 2764,
                "outPkts": 2770,
                "totalPkts": 5534,
                "totalBytes": 1839996
            },
            {
                "time": 1443555600000000,
                "inBytes": 922830,
                "outBytes": 925468,
                "inPkts": 2775,
                "outPkts": 2778,
                "totalPkts": 5553,
                "totalBytes": 1848298
            },
            {
                "time": 1443555660000000,
                "inBytes": 961698,
                "outBytes": 942146,
                "inPkts": 2749,
                "outPkts": 2753,
                "totalPkts": 5502,
                "totalBytes": 1903844
            },
            {
                "time": 1443555720000000,
                "inBytes": 908194,
                "outBytes": 946430,
                "inPkts": 2777,
                "outPkts": 2763,
                "totalPkts": 5540,
                "totalBytes": 1854624
            },
            {
                "time": 1443555780000000,
                "inBytes": 935042,
                "outBytes": 921744,
                "inPkts": 2769,
                "outPkts": 2776,
                "totalPkts": 5545,
                "totalBytes": 1856786
            },
            {
                "time": 1443555840000000,
                "inBytes": 943730,
                "outBytes": 927932,
                "inPkts": 2741,
                "outPkts": 2742,
                "totalPkts": 5483,
                "totalBytes": 1871662
            },
            {
                "time": 1443555900000000,
                "inBytes": 887676,
                "outBytes": 902382,
                "inPkts": 2730,
                "outPkts": 2731,
                "totalPkts": 5461,
                "totalBytes": 1790058
            },
            {
                "time": 1443555960000000,
                "inBytes": 877420,
                "outBytes": 882836,
                "inPkts": 2686,
                "outPkts": 2694,
                "totalPkts": 5380,
                "totalBytes": 1760256
            },
            {
                "time": 1443556020000000,
                "inBytes": 896062,
                "outBytes": 915338,
                "inPkts": 2691,
                "outPkts": 2693,
                "totalPkts": 5384,
                "totalBytes": 1811400
            },
            {
                "time": 1443556080000000,
                "inBytes": 938436,
                "outBytes": 902272,
                "inPkts": 2742,
                "outPkts": 2732,
                "totalPkts": 5474,
                "totalBytes": 1840708
            },
            {
                "time": 1443556140000000,
                "inBytes": 941028,
                "outBytes": 898528,
                "inPkts": 2770,
                "outPkts": 2768,
                "totalPkts": 5538,
                "totalBytes": 1839556
            },
            {
                "time": 1443556200000000,
                "inBytes": 898404,
                "outBytes": 937294,
                "inPkts": 2694,
                "outPkts": 2699,
                "totalPkts": 5393,
                "totalBytes": 1835698
            },
            {
                "time": 1443556260000000,
                "inBytes": 942066,
                "outBytes": 950744,
                "inPkts": 2765,
                "outPkts": 2764,
                "totalPkts": 5529,
                "totalBytes": 1892810
            },
            {
                "time": 1443556320000000,
                "inBytes": 958174,
                "outBytes": 916780,
                "inPkts": 2787,
                "outPkts": 2794,
                "totalPkts": 5581,
                "totalBytes": 1874954
            },
            {
                "time": 1443556380000000,
                "inBytes": 933518,
                "outBytes": 899060,
                "inPkts": 2755,
                "outPkts": 2754,
                "totalPkts": 5509,
                "totalBytes": 1832578
            },
            {
                "time": 1443556440000000,
                "inBytes": 962658,
                "outBytes": 925306,
                "inPkts": 2789,
                "outPkts": 2777,
                "totalPkts": 5566,
                "totalBytes": 1887964
            },
            {
                "time": 1443556500000000,
                "inBytes": 926264,
                "outBytes": 888096,
                "inPkts": 2696,
                "outPkts": 2680,
                "totalPkts": 5376,
                "totalBytes": 1814360
            },
            {
                "time": 1443556560000000,
                "inBytes": 934292,
                "outBytes": 871006,
                "inPkts": 2698,
                "outPkts": 2695,
                "totalPkts": 5393,
                "totalBytes": 1805298
            },
            {
                "time": 1443556620000000,
                "inBytes": 911864,
                "outBytes": 958442,
                "inPkts": 2752,
                "outPkts": 2753,
                "totalPkts": 5505,
                "totalBytes": 1870306
            },
            {
                "time": 1443556680000000,
                "inBytes": 903670,
                "outBytes": 931212,
                "inPkts": 2703,
                "outPkts": 2714,
                "totalPkts": 5417,
                "totalBytes": 1834882
            },
            {
                "time": 1443556740000000,
                "inBytes": 876332,
                "outBytes": 945844,
                "inPkts": 2738,
                "outPkts": 2746,
                "totalPkts": 5484,
                "totalBytes": 1822176
            },
            {
                "time": 1443556800000000,
                "inBytes": 930778,
                "outBytes": 906306,
                "inPkts": 2753,
                "outPkts": 2757,
                "totalPkts": 5510,
                "totalBytes": 1837084
            },
            {
                "time": 1443556860000000,
                "inBytes": 944476,
                "outBytes": 904164,
                "inPkts": 2790,
                "outPkts": 2794,
                "totalPkts": 5584,
                "totalBytes": 1848640
            },
            {
                "time": 1443556920000000,
                "inBytes": 916466,
                "outBytes": 925960,
                "inPkts": 2753,
                "outPkts": 2744,
                "totalPkts": 5497,
                "totalBytes": 1842426
            },
            {
                "time": 1443556980000000,
                "inBytes": 909590,
                "outBytes": 818408,
                "inPkts": 2575,
                "outPkts": 2604,
                "totalPkts": 5179,
                "totalBytes": 1727998
            },
            {
                "time": 1443557040000000,
                "inBytes": 460548,
                "outBytes": 456354,
                "inPkts": 1366,
                "outPkts": 1369,
                "totalPkts": 2735,
                "totalBytes": 916902
            },
            {
                "time": 1443557460000000,
                "inBytes": 489534,
                "outBytes": 464878,
                "inPkts": 1435,
                "outPkts": 1439,
                "totalPkts": 2874,
                "totalBytes": 954412
            },
            {
                "time": 1443557520000000,
                "inBytes": 933314,
                "outBytes": 932162,
                "inPkts": 2757,
                "outPkts": 2749,
                "totalPkts": 5506,
                "totalBytes": 1865476
            },
            {
                "time": 1443557580000000,
                "inBytes": 902176,
                "outBytes": 928684,
                "inPkts": 2736,
                "outPkts": 2738,
                "totalPkts": 5474,
                "totalBytes": 1830860
            },
            {
                "time": 1443557640000000,
                "inBytes": 957792,
                "outBytes": 920760,
                "inPkts": 2812,
                "outPkts": 2816,
                "totalPkts": 5628,
                "totalBytes": 1878552
            },
            {
                "time": 1443557700000000,
                "inBytes": 887698,
                "outBytes": 938152,
                "inPkts": 2761,
                "outPkts": 2756,
                "totalPkts": 5517,
                "totalBytes": 1825850
            },
            {
                "time": 1443557760000000,
                "inBytes": 890254,
                "outBytes": 914024,
                "inPkts": 2671,
                "outPkts": 2672,
                "totalPkts": 5343,
                "totalBytes": 1804278
            },
            {
                "time": 1443557820000000,
                "inBytes": 924676,
                "outBytes": 921602,
                "inPkts": 2730,
                "outPkts": 2737,
                "totalPkts": 5467,
                "totalBytes": 1846278
            },
            {
                "time": 1443557880000000,
                "inBytes": 938370,
                "outBytes": 953044,
                "inPkts": 2805,
                "outPkts": 2818,
                "totalPkts": 5623,
                "totalBytes": 1891414
            },
            {
                "time": 1443557940000000,
                "inBytes": 954816,
                "outBytes": 960014,
                "inPkts": 2848,
                "outPkts": 2843,
                "totalPkts": 5691,
                "totalBytes": 1914830
            },
            {
                "time": 1443558000000000,
                "inBytes": 944358,
                "outBytes": 923642,
                "inPkts": 2751,
                "outPkts": 2749,
                "totalPkts": 5500,
                "totalBytes": 1868000
            },
            {
                "time": 1443558060000000,
                "inBytes": 927578,
                "outBytes": 938860,
                "inPkts": 2785,
                "outPkts": 2786,
                "totalPkts": 5571,
                "totalBytes": 1866438
            },
            {
                "time": 1443558120000000,
                "inBytes": 941594,
                "outBytes": 904630,
                "inPkts": 2733,
                "outPkts": 2731,
                "totalPkts": 5464,
                "totalBytes": 1846224
            },
            {
                "time": 1443558180000000,
                "inBytes": 879120,
                "outBytes": 933642,
                "inPkts": 2720,
                "outPkts": 2721,
                "totalPkts": 5441,
                "totalBytes": 1812762
            },
            {
                "time": 1443558240000000,
                "inBytes": 911998,
                "outBytes": 890060,
                "inPkts": 2699,
                "outPkts": 2706,
                "totalPkts": 5405,
                "totalBytes": 1802058
            },
            {
                "time": 1443558300000000,
                "inBytes": 919014,
                "outBytes": 910584,
                "inPkts": 2727,
                "outPkts": 2728,
                "totalPkts": 5455,
                "totalBytes": 1829598
            },
            {
                "time": 1443558360000000,
                "inBytes": 894144,
                "outBytes": 953518,
                "inPkts": 2716,
                "outPkts": 2715,
                "totalPkts": 5431,
                "totalBytes": 1847662
            },
            {
                "time": 1443558420000000,
                "inBytes": 950942,
                "outBytes": 965020,
                "inPkts": 2803,
                "outPkts": 2786,
                "totalPkts": 5589,
                "totalBytes": 1915962
            },
            {
                "time": 1443558480000000,
                "inBytes": 919868,
                "outBytes": 928758,
                "inPkts": 2786,
                "outPkts": 2779,
                "totalPkts": 5565,
                "totalBytes": 1848626
            },
            {
                "time": 1443558540000000,
                "inBytes": 864246,
                "outBytes": 856376,
                "inPkts": 2607,
                "outPkts": 2604,
                "totalPkts": 5211,
                "totalBytes": 1720622
            },
            {
                "time": 1443558600000000,
                "inBytes": 940022,
                "outBytes": 900460,
                "inPkts": 2779,
                "outPkts": 2778,
                "totalPkts": 5557,
                "totalBytes": 1840482
            },
            {
                "time": 1443558660000000,
                "inBytes": 834960,
                "outBytes": 905792,
                "inPkts": 2680,
                "outPkts": 2672,
                "totalPkts": 5352,
                "totalBytes": 1740752
            },
            {
                "time": 1443558720000000,
                "inBytes": 963386,
                "outBytes": 953884,
                "inPkts": 2813,
                "outPkts": 2822,
                "totalPkts": 5635,
                "totalBytes": 1917270
            },
            {
                "time": 1443558780000000,
                "inBytes": 961528,
                "outBytes": 955078,
                "inPkts": 2828,
                "outPkts": 2831,
                "totalPkts": 5659,
                "totalBytes": 1916606
            },
            {
                "time": 1443558840000000,
                "inBytes": 901530,
                "outBytes": 912968,
                "inPkts": 2713,
                "outPkts": 2716,
                "totalPkts": 5429,
                "totalBytes": 1814498
            },
            {
                "time": 1443558900000000,
                "inBytes": 895556,
                "outBytes": 936808,
                "inPkts": 2770,
                "outPkts": 2752,
                "totalPkts": 5522,
                "totalBytes": 1832364
            },
            {
                "time": 1443558960000000,
                "inBytes": 936100,
                "outBytes": 921128,
                "inPkts": 2802,
                "outPkts": 2792,
                "totalPkts": 5594,
                "totalBytes": 1857228
            },
            {
                "time": 1443559020000000,
                "inBytes": 956692,
                "outBytes": 911970,
                "inPkts": 2766,
                "outPkts": 2753,
                "totalPkts": 5519,
                "totalBytes": 1868662
            },
            {
                "time": 1443559080000000,
                "inBytes": 964324,
                "outBytes": 914824,
                "inPkts": 2802,
                "outPkts": 2792,
                "totalPkts": 5594,
                "totalBytes": 1879148
            },
            {
                "time": 1443559140000000,
                "inBytes": 964964,
                "outBytes": 952520,
                "inPkts": 2786,
                "outPkts": 2780,
                "totalPkts": 5566,
                "totalBytes": 1917484
            },
            {
                "time": 1443559200000000,
                "inBytes": 960944,
                "outBytes": 921574,
                "inPkts": 2776,
                "outPkts": 2783,
                "totalPkts": 5559,
                "totalBytes": 1882518
            },
            {
                "time": 1443559260000000,
                "inBytes": 900356,
                "outBytes": 968130,
                "inPkts": 2770,
                "outPkts": 2753,
                "totalPkts": 5523,
                "totalBytes": 1868486
            },
            {
                "time": 1443559320000000,
                "inBytes": 902490,
                "outBytes": 901966,
                "inPkts": 2701,
                "outPkts": 2691,
                "totalPkts": 5392,
                "totalBytes": 1804456
            },
            {
                "time": 1443559380000000,
                "inBytes": 964896,
                "outBytes": 901548,
                "inPkts": 2752,
                "outPkts": 2738,
                "totalPkts": 5490,
                "totalBytes": 1866444
            },
            {
                "time": 1443559440000000,
                "inBytes": 891072,
                "outBytes": 915002,
                "inPkts": 2708,
                "outPkts": 2709,
                "totalPkts": 5417,
                "totalBytes": 1806074
            },
            {
                "time": 1443559500000000,
                "inBytes": 932384,
                "outBytes": 963618,
                "inPkts": 2800,
                "outPkts": 2793,
                "totalPkts": 5593,
                "totalBytes": 1896002
            },
            {
                "time": 1443559560000000,
                "inBytes": 910560,
                "outBytes": 880910,
                "inPkts": 2732,
                "outPkts": 2731,
                "totalPkts": 5463,
                "totalBytes": 1791470
            },
            {
                "time": 1443559620000000,
                "inBytes": 925874,
                "outBytes": 936080,
                "inPkts": 2761,
                "outPkts": 2764,
                "totalPkts": 5525,
                "totalBytes": 1861954
            },
            {
                "time": 1443559680000000,
                "inBytes": 927546,
                "outBytes": 868190,
                "inPkts": 2705,
                "outPkts": 2711,
                "totalPkts": 5416,
                "totalBytes": 1795736
            },
            {
                "time": 1443559740000000,
                "inBytes": 949756,
                "outBytes": 949302,
                "inPkts": 2818,
                "outPkts": 2823,
                "totalPkts": 5641,
                "totalBytes": 1899058
            },
            {
                "time": 1443559800000000,
                "inBytes": 936476,
                "outBytes": 911362,
                "inPkts": 2750,
                "outPkts": 2753,
                "totalPkts": 5503,
                "totalBytes": 1847838
            },
            {
                "time": 1443559860000000,
                "inBytes": 888614,
                "outBytes": 877024,
                "inPkts": 2687,
                "outPkts": 2688,
                "totalPkts": 5375,
                "totalBytes": 1765638
            },
            {
                "time": 1443559920000000,
                "inBytes": 890108,
                "outBytes": 900450,
                "inPkts": 2642,
                "outPkts": 2649,
                "totalPkts": 5291,
                "totalBytes": 1790558
            },
            {
                "time": 1443559980000000,
                "inBytes": 954828,
                "outBytes": 906504,
                "inPkts": 2794,
                "outPkts": 2792,
                "totalPkts": 5586,
                "totalBytes": 1861332
            },
            {
                "time": 1443560040000000,
                "inBytes": 923448,
                "outBytes": 906554,
                "inPkts": 2716,
                "outPkts": 2721,
                "totalPkts": 5437,
                "totalBytes": 1830002
            },
            {
                "time": 1443560100000000,
                "inBytes": 916494,
                "outBytes": 945286,
                "inPkts": 2799,
                "outPkts": 2807,
                "totalPkts": 5606,
                "totalBytes": 1861780
            },
            {
                "time": 1443560160000000,
                "inBytes": 894800,
                "outBytes": 932952,
                "inPkts": 2752,
                "outPkts": 2756,
                "totalPkts": 5508,
                "totalBytes": 1827752
            },
            {
                "time": 1443560220000000,
                "inBytes": 892110,
                "outBytes": 950620,
                "inPkts": 2755,
                "outPkts": 2758,
                "totalPkts": 5513,
                "totalBytes": 1842730
            },
            {
                "time": 1443560280000000,
                "inBytes": 938906,
                "outBytes": 930170,
                "inPkts": 2757,
                "outPkts": 2765,
                "totalPkts": 5522,
                "totalBytes": 1869076
            },
            {
                "time": 1443560340000000,
                "inBytes": 941486,
                "outBytes": 913268,
                "inPkts": 2767,
                "outPkts": 2766,
                "totalPkts": 5533,
                "totalBytes": 1854754
            },
            {
                "time": 1443560400000000,
                "inBytes": 898862,
                "outBytes": 906954,
                "inPkts": 2679,
                "outPkts": 2677,
                "totalPkts": 5356,
                "totalBytes": 1805816
            },
            {
                "time": 1443560460000000,
                "inBytes": 909742,
                "outBytes": 911862,
                "inPkts": 2715,
                "outPkts": 2711,
                "totalPkts": 5426,
                "totalBytes": 1821604
            },
            {
                "time": 1443560520000000,
                "inBytes": 917158,
                "outBytes": 904114,
                "inPkts": 2711,
                "outPkts": 2721,
                "totalPkts": 5432,
                "totalBytes": 1821272
            },
            {
                "time": 1443560580000000,
                "inBytes": 958424,
                "outBytes": 927406,
                "inPkts": 2800,
                "outPkts": 2803,
                "totalPkts": 5603,
                "totalBytes": 1885830
            },
            {
                "time": 1443560640000000,
                "inBytes": 918644,
                "outBytes": 907812,
                "inPkts": 2746,
                "outPkts": 2742,
                "totalPkts": 5488,
                "totalBytes": 1826456
            },
            {
                "time": 1443560700000000,
                "inBytes": 877418,
                "outBytes": 929354,
                "inPkts": 2689,
                "outPkts": 2685,
                "totalPkts": 5374,
                "totalBytes": 1806772
            },
            {
                "time": 1443560760000000,
                "inBytes": 473760,
                "outBytes": 452966,
                "inPkts": 1392,
                "outPkts": 1387,
                "totalPkts": 2779,
                "totalBytes": 926726
            }
        ]
    };
    this.networkStatsForFrontendVNMockData = {
        "sport": [
            {
                "outBytes": 195250,
                "outPkts": 529,
                "outFlowCount": 1,
                "sport": 44957,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 192500,
                "outPkts": 522,
                "outFlowCount": 1,
                "sport": 52328,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 190862,
                "outPkts": 543,
                "outFlowCount": 1,
                "sport": 54151,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 188002,
                "outPkts": 537,
                "outFlowCount": 1,
                "sport": 40595,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 187172,
                "outPkts": 522,
                "outFlowCount": 1,
                "sport": 44959,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 186788,
                "outPkts": 526,
                "outFlowCount": 1,
                "sport": 52331,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 182120,
                "outPkts": 520,
                "outFlowCount": 1,
                "sport": 41790,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 181514,
                "outPkts": 517,
                "outFlowCount": 1,
                "sport": 49650,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 180962,
                "outPkts": 517,
                "outFlowCount": 1,
                "sport": 41789,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 180130,
                "outPkts": 521,
                "outFlowCount": 1,
                "sport": 37822,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 179694,
                "outPkts": 495,
                "outFlowCount": 1,
                "sport": 37823,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 178758,
                "outPkts": 515,
                "outFlowCount": 1,
                "sport": 49649,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 178530,
                "outPkts": 549,
                "outFlowCount": 1,
                "sport": 54150,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 178394,
                "outPkts": 513,
                "outFlowCount": 1,
                "sport": 39800,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 177116,
                "outPkts": 518,
                "outFlowCount": 1,
                "sport": 40594,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 176450,
                "outPkts": 529,
                "outFlowCount": 1,
                "sport": 38546,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 176426,
                "outPkts": 525,
                "outFlowCount": 1,
                "sport": 34769,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 176374,
                "outPkts": 523,
                "outFlowCount": 1,
                "sport": 52329,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 175190,
                "outPkts": 499,
                "outFlowCount": 1,
                "sport": 41788,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 175006,
                "outPkts": 531,
                "outFlowCount": 1,
                "sport": 41791,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 174512,
                "outPkts": 524,
                "outFlowCount": 1,
                "sport": 52330,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 174298,
                "outPkts": 509,
                "outFlowCount": 1,
                "sport": 54152,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 174084,
                "outPkts": 526,
                "outFlowCount": 1,
                "sport": 54154,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 172504,
                "outPkts": 520,
                "outFlowCount": 1,
                "sport": 44961,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 170832,
                "outPkts": 492,
                "outFlowCount": 1,
                "sport": 39883,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 170486,
                "outPkts": 547,
                "outFlowCount": 1,
                "sport": 41792,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 170344,
                "outPkts": 528,
                "outFlowCount": 1,
                "sport": 40597,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 170196,
                "outPkts": 514,
                "outFlowCount": 1,
                "sport": 37824,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 170008,
                "outPkts": 480,
                "outFlowCount": 1,
                "sport": 40596,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 169974,
                "outPkts": 535,
                "outFlowCount": 1,
                "sport": 49651,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 169472,
                "outPkts": 508,
                "outFlowCount": 1,
                "sport": 34770,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 169394,
                "outPkts": 521,
                "outFlowCount": 1,
                "sport": 38548,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 169050,
                "outPkts": 513,
                "outFlowCount": 1,
                "sport": 39881,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 168686,
                "outPkts": 527,
                "outFlowCount": 1,
                "sport": 54153,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 166868,
                "outPkts": 502,
                "outFlowCount": 1,
                "sport": 44960,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 166868,
                "outPkts": 486,
                "outFlowCount": 1,
                "sport": 39882,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 166208,
                "outPkts": 492,
                "outFlowCount": 1,
                "sport": 39803,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 165978,
                "outPkts": 509,
                "outFlowCount": 1,
                "sport": 40598,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 165868,
                "outPkts": 502,
                "outFlowCount": 1,
                "sport": 52327,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 165854,
                "outPkts": 447,
                "outFlowCount": 1,
                "sport": 39885,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 165854,
                "outPkts": 507,
                "outFlowCount": 1,
                "sport": 39884,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 165574,
                "outPkts": 515,
                "outFlowCount": 1,
                "sport": 39802,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 165412,
                "outPkts": 510,
                "outFlowCount": 1,
                "sport": 49653,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 165254,
                "outPkts": 503,
                "outFlowCount": 1,
                "sport": 38549,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 163734,
                "outPkts": 519,
                "outFlowCount": 1,
                "sport": 38545,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 162928,
                "outPkts": 496,
                "outFlowCount": 1,
                "sport": 34768,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 162382,
                "outPkts": 495,
                "outFlowCount": 1,
                "sport": 37826,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 160582,
                "outPkts": 507,
                "outFlowCount": 1,
                "sport": 39801,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 160536,
                "outPkts": 508,
                "outFlowCount": 1,
                "sport": 44958,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 160458,
                "outPkts": 513,
                "outFlowCount": 1,
                "sport": 49652,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 158712,
                "outPkts": 532,
                "outFlowCount": 1,
                "sport": 34771,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 157030,
                "outPkts": 511,
                "outFlowCount": 1,
                "sport": 39804,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 155726,
                "outPkts": 511,
                "outFlowCount": 1,
                "sport": 34772,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            }
        ],
        "dport": [
            {
                "inBytes": 896042,
                "inPkts": 2597,
                "inFlowCount": 5,
                "dport": 9106,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 886460,
                "inPkts": 2654,
                "inFlowCount": 5,
                "dport": 9105,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 883764,
                "inPkts": 2614,
                "inFlowCount": 5,
                "dport": 9104,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 882330,
                "inPkts": 2581,
                "inFlowCount": 5,
                "dport": 9103,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 871448,
                "inPkts": 2572,
                "inFlowCount": 5,
                "dport": 9101,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 856116,
                "inPkts": 2590,
                "inFlowCount": 5,
                "dport": 9100,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 838458,
                "inPkts": 2445,
                "inFlowCount": 5,
                "dport": 9102,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 827788,
                "inPkts": 2538,
                "inFlowCount": 5,
                "dport": 9107,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 823264,
                "inPkts": 2572,
                "inFlowCount": 5,
                "dport": 9108,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 692402,
                "inPkts": 2025,
                "inFlowCount": 4,
                "dport": 9109,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 674832,
                "inPkts": 2072,
                "inFlowCount": 4,
                "dport": 9110,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            }
        ],
        "startTime": 1443560194000,
        "endTime": 1443560794000
    };
    this.networksMockData = {
        "data": {
            "value": [
                {
                    "name": "default-domain:admin:backend",
                    "value": {
                        "UveVirtualNetworkAgent": {
                            "total_acl_rules": 4,
                            "in_bandwidth_usage": 129168,
                            "egress_flow_count": 53,
                            "acl": "default-domain:admin:backend:backend",
                            "virtualmachine_list": [
                                "39b35cf1-1bdf-4238-bcc2-16653f12379a"
                            ],
                            "interface_list": [
                                "default-domain:admin:4b5073eb-ee2e-4790-b106-e020a4e79e45"
                            ],
                            "ingress_flow_count": 53,
                            "out_bandwidth_usage": 111090
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
                            "total_acl_rules": 4,
                            "in_bandwidth_usage": 111090,
                            "egress_flow_count": 53,
                            "acl": "default-domain:admin:frontend:frontend",
                            "virtualmachine_list": [
                                "7c20fb79-1a0a-49e3-b31f-d53db046264e"
                            ],
                            "interface_list": [
                                "default-domain:admin:3683aa58-28ff-4ffb-8667-fb778d92ad0e"
                            ],
                            "ingress_flow_count": 53,
                            "out_bandwidth_usage": 129168
                        },
                        "UveVirtualNetworkConfig": {
                            "connected_networks": [
                                "default-domain:admin:backend"
                            ]
                        }
                    }
                }
            ]
        },
        "lastKey": null,
        "more": false
    };
    this.networkConnectedGraphForFrontEndNetworkMockData = 
    {
        "nodes": [
        {
            "name": "default-domain:admin:frontend",
            "more_attributes": {
                "vm_count": 3,
                "vmi_count": 3,
                "in_throughput": 244453,
                "out_throughput": 237414,
                "virtualmachine_list": [
                    "5199c65e-8b71-4e4c-90cc-58deea9752dd",
                "c73ed229-bbf2-4e1e-be26-4aee2d1780b3",
                "faa5b186-5383-4670-b640-ad230fe2100f"
                    ],
                "connected_networks": [
                    [
                    "default-domain:admin:backend"
                    ]
                    ]
            },
            "node_type": "virtual-network",
            "status": "Active"
        },
        {
            "name": "default-domain:admin:backend",
            "more_attributes": {
                "vm_count": 1,
                "vmi_count": 1,
                "in_throughput": 235846,
                "out_throughput": 242885,
                "virtualmachine_list": [
                    "a14fa2f3-6240-41a7-8dd1-d72018a1b1db"
                    ],
                "connected_networks": [
                    [
                    "default-domain:admin:frontend"
                    ]
                    ]
            },
            "node_type": "virtual-network",
            "status": "Active"
        }
        ],
            "links": [
            {
                "src": "default-domain:admin:frontend",
                "dst": "default-domain:admin:backend",
                "dir": "bi",
                "more_attributes": {
                    "in_stats": [
                    {
                        "src": "default-domain:admin:frontend",
                        "dst": "default-domain:admin:backend",
                        "pkts": 144271677,
                        "bytes": 48316200918
                    }
                    ],
                        "out_stats": [
                        {
                            "src": "default-domain:admin:frontend",
                            "dst": "default-domain:admin:backend",
                            "pkts": 144254557,
                            "bytes": 48313213794
                        }
                    ]
                }
            }
        ],
            "config-data": {
                "virtual-networks": [
                {
                    "href": "http://10.84.30.249:9100/virtual-network/7b4c376f-66a0-4944-8842-cccd21420d4e",
                    "fq_name": [
                        "default-domain",
                    "default-project",
                    "default-virtual-network"
                        ],
                    "uuid": "7b4c376f-66a0-4944-8842-cccd21420d4e"
                },
                {
                    "href": "http://10.84.30.249:9100/virtual-network/8449f79f-e3e3-455a-9fcb-f57934727d3e",
                    "fq_name": [
                        "default-domain",
                    "admin",
                    "frontend"
                        ],
                    "uuid": "8449f79f-e3e3-455a-9fcb-f57934727d3e"
                },
                {
                    "href": "http://10.84.30.249:9100/virtual-network/2f883953-4293-4ee3-a3ad-3cdfebf45cc4",
                    "fq_name": [
                        "default-domain",
                    "admin",
                    "testvn_nitishk"
                        ],
                    "uuid": "2f883953-4293-4ee3-a3ad-3cdfebf45cc4"
                },
                {
                    "href": "http://10.84.30.249:9100/virtual-network/98261d9a-4138-4106-be25-7854c1f2dc2f",
                    "fq_name": [
                        "default-domain",
                    "default-project",
                    "__link_local__"
                        ],
                    "uuid": "98261d9a-4138-4106-be25-7854c1f2dc2f"
                },
                {
                    "href": "http://10.84.30.249:9100/virtual-network/b1a19e41-31a2-455a-93e6-95426f9f694d",
                    "fq_name": [
                        "default-domain",
                    "admin",
                    "backend"
                        ],
                    "uuid": "b1a19e41-31a2-455a-93e6-95426f9f694d"
                },
                {
                    "href": "http://10.84.30.249:9100/virtual-network/c6b1675b-9042-4716-851d-b5a94e1f0c61",
                    "fq_name": [
                        "default-domain",
                    "admin",
                    "vn1"
                        ],
                    "uuid": "c6b1675b-9042-4716-851d-b5a94e1f0c61"
                },
                {
                    "href": "http://10.84.30.249:9100/virtual-network/714f2e0f-70eb-4c97-baf8-dc9c9843579c",
                    "fq_name": [
                        "default-domain",
                    "admin",
                    "vn2"
                        ],
                    "uuid": "714f2e0f-70eb-4c97-baf8-dc9c9843579c"
                },
                {
                    "href": "http://10.84.30.249:9100/virtual-network/e91d9514-f983-42b1-afb0-e310548f6dcd",
                    "fq_name": [
                        "default-domain",
                    "default-project",
                    "ip-fabric"
                        ],
                    "uuid": "e91d9514-f983-42b1-afb0-e310548f6dcd"
                },
                {
                    "href": "http://10.84.30.249:9100/virtual-network/7687c872-d2b1-476c-9d7b-15d7a89ac907",
                    "fq_name": [
                        "default-domain",
                    "admin",
                    "vn3"
                        ],
                    "uuid": "7687c872-d2b1-476c-9d7b-15d7a89ac907"
                }
                ],
                    "service-instances": []
            }
    };
    /*
    {
        "nodes": [
            {
                "name": "default-domain:admin:frontend",
                "more_attributes": {
                    "vm_count": 1,
                    "vmi_count": 1,
                    "in_throughput": 130692,
                    "out_throughput": 124956,
                    "virtualmachine_list": [
                        "7c20fb79-1a0a-49e3-b31f-d53db046264e"
                    ]
                },
                "node_type": "virtual-network",
                "status": "Active"
            }
        ],
        "links": [],
        "config-data": {
            "virtual-networks": [
                {
                    "href": "http://10.84.11.2:8082/virtual-network/942f569c-2bf4-4665-b76e-99fcc06333fc",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn247"
                    ],
                    "uuid": "942f569c-2bf4-4665-b76e-99fcc06333fc"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/f8756833-c1b0-43a6-84a6-895f5ca45844",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn218"
                    ],
                    "uuid": "f8756833-c1b0-43a6-84a6-895f5ca45844"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/c2de6708-0e34-457f-b462-7b4430b7ccb0",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn231"
                    ],
                    "uuid": "c2de6708-0e34-457f-b462-7b4430b7ccb0"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/572d0898-ac0d-429c-af11-7230830f3272",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn233"
                    ],
                    "uuid": "572d0898-ac0d-429c-af11-7230830f3272"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/4a55bb32-18dd-4969-85a2-1d8741aea3b1",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn279"
                    ],
                    "uuid": "4a55bb32-18dd-4969-85a2-1d8741aea3b1"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/78f955bd-4fae-4fbb-be53-0ee8d9d9be6b",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn210"
                    ],
                    "uuid": "78f955bd-4fae-4fbb-be53-0ee8d9d9be6b"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/2e153e91-1609-4a58-b686-87ff0411c960",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn258"
                    ],
                    "uuid": "2e153e91-1609-4a58-b686-87ff0411c960"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/78fac2b5-8e24-48e9-a583-2f6adcd33f90",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn241"
                    ],
                    "uuid": "78fac2b5-8e24-48e9-a583-2f6adcd33f90"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/b6b9986f-223d-453a-8d4e-71f27fd32f8e",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn253"
                    ],
                    "uuid": "b6b9986f-223d-453a-8d4e-71f27fd32f8e"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/98ed0ba7-c4ee-4439-b13e-4f93bd9349f7",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn286"
                    ],
                    "uuid": "98ed0ba7-c4ee-4439-b13e-4f93bd9349f7"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/02313514-a606-44ae-aca8-43a39322d8bd",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn284"
                    ],
                    "uuid": "02313514-a606-44ae-aca8-43a39322d8bd"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/5cd8366e-07b4-4af6-b8b9-f5a483e0aa64",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn297"
                    ],
                    "uuid": "5cd8366e-07b4-4af6-b8b9-f5a483e0aa64"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/96839337-6369-4605-a672-04e8648a69ce",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn277"
                    ],
                    "uuid": "96839337-6369-4605-a672-04e8648a69ce"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/3e266766-48e1-480d-9948-0aeff3a1b2b2",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn223"
                    ],
                    "uuid": "3e266766-48e1-480d-9948-0aeff3a1b2b2"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/3bda80c6-0704-484d-aed8-01139a317c06",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn240"
                    ],
                    "uuid": "3bda80c6-0704-484d-aed8-01139a317c06"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/1394f407-ec73-4c40-ba52-f6c8c08cbad5",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn259"
                    ],
                    "uuid": "1394f407-ec73-4c40-ba52-f6c8c08cbad5"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/2b296fb6-0051-4204-9eeb-41e615434234",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn235"
                    ],
                    "uuid": "2b296fb6-0051-4204-9eeb-41e615434234"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/86bb52eb-bbff-4228-8966-65223abfeec8",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn229"
                    ],
                    "uuid": "86bb52eb-bbff-4228-8966-65223abfeec8"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/84bb320e-3ae5-4cab-bb3a-92bd121d8fb9",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn207"
                    ],
                    "uuid": "84bb320e-3ae5-4cab-bb3a-92bd121d8fb9"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/a288fabb-60da-4656-adb8-213f1ed52b7d",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn250"
                    ],
                    "uuid": "a288fabb-60da-4656-adb8-213f1ed52b7d"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/507f31c1-1d70-41de-90e0-e5b71c4287cc",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn224"
                    ],
                    "uuid": "507f31c1-1d70-41de-90e0-e5b71c4287cc"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/c6310238-0126-4f03-9079-ca0bad3c5960",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn283"
                    ],
                    "uuid": "c6310238-0126-4f03-9079-ca0bad3c5960"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/606bbf21-b1f8-4194-83cc-376e470cba00",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn269"
                    ],
                    "uuid": "606bbf21-b1f8-4194-83cc-376e470cba00"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/80dcf2dc-fc7f-41a3-9925-751c0314b6d9",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn296"
                    ],
                    "uuid": "80dcf2dc-fc7f-41a3-9925-751c0314b6d9"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/608e1675-d857-4755-b6ce-b7556e8e61f1",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn265"
                    ],
                    "uuid": "608e1675-d857-4755-b6ce-b7556e8e61f1"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/47bb928c-ff6a-4543-865a-172c5be57636",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn281"
                    ],
                    "uuid": "47bb928c-ff6a-4543-865a-172c5be57636"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/21f34a07-e49e-4204-8e1a-fa65ca899bc4",
                    "fq_name": [
                        "default-domain",
                        "default-project",
                        "default-virtual-network"
                    ],
                    "uuid": "21f34a07-e49e-4204-8e1a-fa65ca899bc4"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/3b7b6d7f-de48-4bce-9371-1ecbacf76db6",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn238"
                    ],
                    "uuid": "3b7b6d7f-de48-4bce-9371-1ecbacf76db6"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/55cf023e-060d-47e0-82bb-c4b4c10aeb67",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn290"
                    ],
                    "uuid": "55cf023e-060d-47e0-82bb-c4b4c10aeb67"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/f8f74bf3-6bf1-4d06-a41b-ab9ab4c5e6d6",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn271"
                    ],
                    "uuid": "f8f74bf3-6bf1-4d06-a41b-ab9ab4c5e6d6"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/aad18ba9-0964-4604-8af6-5117adc6d8ac",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn222"
                    ],
                    "uuid": "aad18ba9-0964-4604-8af6-5117adc6d8ac"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/55325aa4-b251-40cc-bd16-738aed49edce",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn234"
                    ],
                    "uuid": "55325aa4-b251-40cc-bd16-738aed49edce"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/ad8a9efc-9b7e-4425-9735-03bda0d2726e",
                    "fq_name": [
                        "default-domain",
                        "admin",
                        "frontend"
                    ],
                    "uuid": "ad8a9efc-9b7e-4425-9735-03bda0d2726e"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/00b74584-8cba-40a6-9aff-5b2baa645a00",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn295"
                    ],
                    "uuid": "00b74584-8cba-40a6-9aff-5b2baa645a00"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/642c9ee3-4fe5-4c05-b5bb-16bf9dc94e67",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn257"
                    ],
                    "uuid": "642c9ee3-4fe5-4c05-b5bb-16bf9dc94e67"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/97ce2640-419d-424c-b7fa-7f11f1a98fed",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn208"
                    ],
                    "uuid": "97ce2640-419d-424c-b7fa-7f11f1a98fed"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/6a841ceb-b990-4a19-978c-21c8b529db7c",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn248"
                    ],
                    "uuid": "6a841ceb-b990-4a19-978c-21c8b529db7c"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/ceb8b037-d210-459c-8b44-d7ac328c3dee",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn239"
                    ],
                    "uuid": "ceb8b037-d210-459c-8b44-d7ac328c3dee"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/2dad25c6-bcca-4522-86a7-383a230b5f64",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn293"
                    ],
                    "uuid": "2dad25c6-bcca-4522-86a7-383a230b5f64"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/e50880f8-5b3a-45f7-8376-44da2fed67c1",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn236"
                    ],
                    "uuid": "e50880f8-5b3a-45f7-8376-44da2fed67c1"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/142129fb-563a-4929-b8d6-6e042f42b94c",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn272"
                    ],
                    "uuid": "142129fb-563a-4929-b8d6-6e042f42b94c"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/e219df6e-49e3-4508-aaaf-0d4a8b20e951",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn299"
                    ],
                    "uuid": "e219df6e-49e3-4508-aaaf-0d4a8b20e951"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/b3a68080-612f-4619-8b07-2b1dbfe9671b",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn243"
                    ],
                    "uuid": "b3a68080-612f-4619-8b07-2b1dbfe9671b"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/26b0af33-4c12-4803-9c6f-432c69c65e8a",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn256"
                    ],
                    "uuid": "26b0af33-4c12-4803-9c6f-432c69c65e8a"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/8adf0a62-ca90-4d0c-95d7-2d8cfe2b75f3",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn206"
                    ],
                    "uuid": "8adf0a62-ca90-4d0c-95d7-2d8cfe2b75f3"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/2847747f-cb2c-4499-9b12-0f1711168e72",
                    "fq_name": [
                        "default-domain",
                        "admin",
                        "backend"
                    ],
                    "uuid": "2847747f-cb2c-4499-9b12-0f1711168e72"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/d0ad87c5-9189-494c-9557-c98246d2b2da",
                    "fq_name": [
                        "default-domain",
                        "default-project",
                        "__link_local__"
                    ],
                    "uuid": "d0ad87c5-9189-494c-9557-c98246d2b2da"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/e0c10dfe-ccec-4190-bd69-fcec38fad5fd",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn263"
                    ],
                    "uuid": "e0c10dfe-ccec-4190-bd69-fcec38fad5fd"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/3080e8d6-3d13-4e48-acb6-b0aaa834af89",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn204"
                    ],
                    "uuid": "3080e8d6-3d13-4e48-acb6-b0aaa834af89"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/03e1fbfd-3528-4b9f-ad2e-481270d95d0e",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn291"
                    ],
                    "uuid": "03e1fbfd-3528-4b9f-ad2e-481270d95d0e"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/dad950cf-338f-4d00-b2cc-de0aed061298",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn230"
                    ],
                    "uuid": "dad950cf-338f-4d00-b2cc-de0aed061298"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/7158a67b-847c-499a-bd22-d1814de3a117",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn273"
                    ],
                    "uuid": "7158a67b-847c-499a-bd22-d1814de3a117"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/a45d7ab4-319c-4105-8421-8b9f38c837a0",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn202"
                    ],
                    "uuid": "a45d7ab4-319c-4105-8421-8b9f38c837a0"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/48ae9caf-5e6a-4ccc-a891-faef07086659",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn270"
                    ],
                    "uuid": "48ae9caf-5e6a-4ccc-a891-faef07086659"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/a26e6fb0-d077-4d5a-888b-1006e03e76be",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn292"
                    ],
                    "uuid": "a26e6fb0-d077-4d5a-888b-1006e03e76be"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/f809d4b6-d70e-44b5-bae2-10102723f210",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn221"
                    ],
                    "uuid": "f809d4b6-d70e-44b5-bae2-10102723f210"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/a24b2c1d-89d3-4b63-bc7f-f8712aa8efaf",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn294"
                    ],
                    "uuid": "a24b2c1d-89d3-4b63-bc7f-f8712aa8efaf"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/39e2492e-6ee3-479d-9d26-4fbf6050fc5d",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn298"
                    ],
                    "uuid": "39e2492e-6ee3-479d-9d26-4fbf6050fc5d"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/92163f4f-ab3c-4249-8137-b942f30c437e",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn228"
                    ],
                    "uuid": "92163f4f-ab3c-4249-8137-b942f30c437e"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/e6ab075c-2f1a-47d5-93b6-85c66c2af6d0",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn226"
                    ],
                    "uuid": "e6ab075c-2f1a-47d5-93b6-85c66c2af6d0"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/82c52ec3-adb4-4ec0-af50-b7e993bf2df9",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn266"
                    ],
                    "uuid": "82c52ec3-adb4-4ec0-af50-b7e993bf2df9"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/a8bda77b-9959-472e-9f7b-3eda407d48cd",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn242"
                    ],
                    "uuid": "a8bda77b-9959-472e-9f7b-3eda407d48cd"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/c8d2e1c1-5447-4fe0-a27e-732a92e5101c",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn249"
                    ],
                    "uuid": "c8d2e1c1-5447-4fe0-a27e-732a92e5101c"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/edb6b525-453d-4564-b18f-6f33ec238d36",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn289"
                    ],
                    "uuid": "edb6b525-453d-4564-b18f-6f33ec238d36"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/ee61c53a-60a5-4c1b-8c52-e85f47d095f3",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn211"
                    ],
                    "uuid": "ee61c53a-60a5-4c1b-8c52-e85f47d095f3"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/b6848504-58a1-4708-8a8f-06cf739cdbe1",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn213"
                    ],
                    "uuid": "b6848504-58a1-4708-8a8f-06cf739cdbe1"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/5afff8c0-75bd-4063-b146-667885069bef",
                    "fq_name": [
                        "default-domain",
                        "demo",
                        "st_vn101"
                    ],
                    "uuid": "5afff8c0-75bd-4063-b146-667885069bef"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/ff23b65a-82db-4027-8355-85dd55229a08",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn217"
                    ],
                    "uuid": "ff23b65a-82db-4027-8355-85dd55229a08"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/e16ed02a-9785-4729-8c9d-7007309d9fa8",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn254"
                    ],
                    "uuid": "e16ed02a-9785-4729-8c9d-7007309d9fa8"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/4a6e9325-a634-41d9-ba4b-1ce42cbe18f8",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn261"
                    ],
                    "uuid": "4a6e9325-a634-41d9-ba4b-1ce42cbe18f8"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/55d83afb-f2ab-48fd-a350-81ada84b5a25",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn285"
                    ],
                    "uuid": "55d83afb-f2ab-48fd-a350-81ada84b5a25"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/2590b9cb-0087-4eae-9a32-d158cd675d7f",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn216"
                    ],
                    "uuid": "2590b9cb-0087-4eae-9a32-d158cd675d7f"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/22785aef-937b-42b9-a3b2-7b7c0e22fafb",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn252"
                    ],
                    "uuid": "22785aef-937b-42b9-a3b2-7b7c0e22fafb"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/bb068828-0366-4cf6-b790-af6618653351",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn209"
                    ],
                    "uuid": "bb068828-0366-4cf6-b790-af6618653351"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/a9f3a346-a2b5-4699-96e6-ad9730594f11",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn276"
                    ],
                    "uuid": "a9f3a346-a2b5-4699-96e6-ad9730594f11"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/5df80350-8754-4a85-abf2-dad14f43a8f6",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn227"
                    ],
                    "uuid": "5df80350-8754-4a85-abf2-dad14f43a8f6"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/91bbc128-8202-44a6-afad-9b2bffee6d26",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn244"
                    ],
                    "uuid": "91bbc128-8202-44a6-afad-9b2bffee6d26"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/40f39d38-7d13-44e1-a662-4c1625065af4",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn288"
                    ],
                    "uuid": "40f39d38-7d13-44e1-a662-4c1625065af4"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/c2f91e51-9c9a-4191-b3e3-20dbfe6db0b4",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn246"
                    ],
                    "uuid": "c2f91e51-9c9a-4191-b3e3-20dbfe6db0b4"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/00c312fb-4eb3-41f2-9c27-ae33d4d46472",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn274"
                    ],
                    "uuid": "00c312fb-4eb3-41f2-9c27-ae33d4d46472"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/39c21bba-088e-4732-9cdc-82aa5271238d",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn280"
                    ],
                    "uuid": "39c21bba-088e-4732-9cdc-82aa5271238d"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/e1a07ef5-ee3b-4422-b085-fa3641090626",
                    "fq_name": [
                        "default-domain",
                        "demo",
                        "st_vn102"
                    ],
                    "uuid": "e1a07ef5-ee3b-4422-b085-fa3641090626"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/cca12cf0-1e59-46c4-968a-4c4027e785d6",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn237"
                    ],
                    "uuid": "cca12cf0-1e59-46c4-968a-4c4027e785d6"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/bf0a4bb3-f993-4c21-a856-2c0f93229ef3",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn245"
                    ],
                    "uuid": "bf0a4bb3-f993-4c21-a856-2c0f93229ef3"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/9a707645-70d9-4004-b022-055c34f2a9a7",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn255"
                    ],
                    "uuid": "9a707645-70d9-4004-b022-055c34f2a9a7"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/01c741c0-6fbc-4e2f-98f9-20ebf0fa5d7f",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn278"
                    ],
                    "uuid": "01c741c0-6fbc-4e2f-98f9-20ebf0fa5d7f"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/43068aa1-160c-4a7d-b194-03ff0c45fd0f",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn260"
                    ],
                    "uuid": "43068aa1-160c-4a7d-b194-03ff0c45fd0f"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/70c06b3c-4cf7-4f56-9736-ac08a1e39c78",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn201"
                    ],
                    "uuid": "70c06b3c-4cf7-4f56-9736-ac08a1e39c78"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/87b63e0d-4794-4479-ae80-81095bd8c3a9",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn251"
                    ],
                    "uuid": "87b63e0d-4794-4479-ae80-81095bd8c3a9"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/b8f13afa-a34d-4518-836c-1a915945f756",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn232"
                    ],
                    "uuid": "b8f13afa-a34d-4518-836c-1a915945f756"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/6871fd03-8e62-48fa-85be-408be0d5d2f3",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn212"
                    ],
                    "uuid": "6871fd03-8e62-48fa-85be-408be0d5d2f3"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/09a5a33c-86ae-4b77-b661-9c14b4f2f16a",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn300"
                    ],
                    "uuid": "09a5a33c-86ae-4b77-b661-9c14b4f2f16a"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/42469cc3-5bcc-4fa1-b917-3ad2d5fbd934",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn203"
                    ],
                    "uuid": "42469cc3-5bcc-4fa1-b917-3ad2d5fbd934"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/8a413462-09d1-4093-af88-df7de90e9e79",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn225"
                    ],
                    "uuid": "8a413462-09d1-4093-af88-df7de90e9e79"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/8a74957e-bc3a-41a2-8d90-d3df3211e008",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn220"
                    ],
                    "uuid": "8a74957e-bc3a-41a2-8d90-d3df3211e008"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/23898c8a-92b3-4d4c-9e2b-bafcdb2f72e2",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn287"
                    ],
                    "uuid": "23898c8a-92b3-4d4c-9e2b-bafcdb2f72e2"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/8a5e25d6-0bab-4552-8209-56a2deafa106",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn214"
                    ],
                    "uuid": "8a5e25d6-0bab-4552-8209-56a2deafa106"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/147826be-5af2-4ec1-894b-9597b5411b9d",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn282"
                    ],
                    "uuid": "147826be-5af2-4ec1-894b-9597b5411b9d"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/89cf1bf4-bd43-4b97-8e5a-f243af0e1371",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn275"
                    ],
                    "uuid": "89cf1bf4-bd43-4b97-8e5a-f243af0e1371"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/3d91ff06-caa7-402e-8a1f-c47587a765c5",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn262"
                    ],
                    "uuid": "3d91ff06-caa7-402e-8a1f-c47587a765c5"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/a5f70f50-232c-4c10-bb3c-18145dfdc3b9",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn215"
                    ],
                    "uuid": "a5f70f50-232c-4c10-bb3c-18145dfdc3b9"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/9931a792-43ba-47c5-adbc-cda0504b95c6",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn267"
                    ],
                    "uuid": "9931a792-43ba-47c5-adbc-cda0504b95c6"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/dcdec784-585b-49bb-89a9-5f80c63d47a7",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn219"
                    ],
                    "uuid": "dcdec784-585b-49bb-89a9-5f80c63d47a7"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/106d8aaa-d75b-430b-adaa-0bc6e4aaef4c",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn205"
                    ],
                    "uuid": "106d8aaa-d75b-430b-adaa-0bc6e4aaef4c"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/2a7d9060-ca01-4634-98ce-723b218ec52a",
                    "fq_name": [
                        "default-domain",
                        "default-project",
                        "ip-fabric"
                    ],
                    "uuid": "2a7d9060-ca01-4634-98ce-723b218ec52a"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/54033332-4f40-4402-970c-b522f7cfaa72",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn268"
                    ],
                    "uuid": "54033332-4f40-4402-970c-b522f7cfaa72"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/a5138b95-82df-4a95-af59-ef0e08d7d796",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn264"
                    ],
                    "uuid": "a5138b95-82df-4a95-af59-ef0e08d7d796"
                }
            ],
            "service-instances": []
        }
    };
    */
    this.networkConfigGraphForFrontEndNetworkMockData =
    {
        "configData": {
            "network-policys": [
            {
                "href": "http://10.84.30.249:9100/network-policy/7ec7a888-84c9-4f72-8fa8-5aadf45275c8",
                "fq_name": [
                    "default-domain",
                "admin",
                "f2b-allow-policy"
                    ],
                "uuid": "7ec7a888-84c9-4f72-8fa8-5aadf45275c8",
                "network_policy_entries": {
                    "policy_rule": [
                    {
                        "direction": "<>",
                        "protocol": "any",
                        "dst_addresses": [
                        {
                            "security_group": null,
                            "subnet": null,
                            "virtual_network": "default-domain:admin:backend",
                            "subnet_list": [],
                            "network_policy": null
                        }
                        ],
                            "action_list": {
                                "gateway_name": null,
                                "log": false,
                                "alert": false,
                                "qos_action": null,
                                "assign_routing_instance": null,
                                "mirror_to": null,
                                "simple_action": "pass",
                                "apply_service": []
                            },
                            "rule_uuid": "62bea881-acd9-4f37-ab6e-330080cdef79",
                            "dst_ports": [
                            {
                                "end_port": -1,
                                "start_port": -1
                            }
                        ],
                            "application": [],
                            "ethertype": null,
                            "src_addresses": [
                            {
                                "security_group": null,
                                "subnet": null,
                                "virtual_network": "default-domain:admin:frontend",
                                "subnet_list": [],
                                "network_policy": null
                            }
                        ],
                            "rule_sequence": {
                                "major": -1,
                                "minor": -1
                            },
                            "src_ports": [
                            {
                                "end_port": -1,
                                "start_port": -1
                            }
                        ]
                    }
                    ]
                }
            },
            {
                "href": "http://10.84.30.249:9100/network-policy/c8e8d8e2-c10f-4cd4-8055-407a91790f55",
                "fq_name": [
                    "default-domain",
                "admin",
                "test"
                    ],
                "uuid": "c8e8d8e2-c10f-4cd4-8055-407a91790f55",
                "network_policy_entries": {
                    "policy_rule": [
                    {
                        "direction": "<>",
                        "protocol": "any",
                        "dst_addresses": [
                        {
                            "security_group": null,
                            "virtual_network": "default-domain:admin:vn2",
                            "subnet": null,
                            "network_policy": null
                        }
                        ],
                            "action_list": {
                                "mirror_to": null,
                                "gateway_name": null,
                                "log": false,
                                "qos_action": null,
                                "simple_action": "pass",
                                "apply_service": null
                            },
                            "rule_uuid": "1053838d-58f8-4d36-ba08-45c307a29027",
                            "dst_ports": [
                            {
                                "end_port": -1,
                                "start_port": -1
                            }
                        ],
                            "application": [],
                            "src_addresses": [
                            {
                                "security_group": null,
                                "virtual_network": "default-domain:admin:vn1",
                                "subnet": null,
                                "network_policy": null
                            }
                        ],
                            "rule_sequence": {
                                "major": -1,
                                "minor": -1
                            },
                            "src_ports": [
                            {
                                "end_port": -1,
                                "start_port": -1
                            }
                        ]
                    }
                    ]
                }
            },
            {
                "href": "http://10.84.30.249:9100/network-policy/042cd5f2-46a4-4dd5-82d3-4c2326549def",
                "fq_name": [
                    "default-domain",
                "admin",
                "vn1vn3"
                    ],
                "uuid": "042cd5f2-46a4-4dd5-82d3-4c2326549def",
                "network_policy_entries": {
                    "policy_rule": [
                    {
                        "direction": "<>",
                        "protocol": "any",
                        "dst_addresses": [
                        {
                            "security_group": null,
                            "virtual_network": "default-domain:admin:vn3",
                            "subnet": null,
                            "network_policy": null
                        }
                        ],
                            "action_list": {
                                "mirror_to": null,
                                "gateway_name": null,
                                "log": false,
                                "qos_action": null,
                                "simple_action": "pass",
                                "apply_service": null
                            },
                            "rule_uuid": "ddcca6ee-62ef-4566-a4ad-00e593c89109",
                            "dst_ports": [
                            {
                                "end_port": -1,
                                "start_port": -1
                            }
                        ],
                            "application": [],
                            "src_addresses": [
                            {
                                "security_group": null,
                                "virtual_network": "default-domain:admin:vn1",
                                "subnet": null,
                                "network_policy": null
                            }
                        ],
                            "rule_sequence": {
                                "major": -1,
                                "minor": -1
                            },
                            "src_ports": [
                            {
                                "end_port": -1,
                                "start_port": -1
                            }
                        ]
                    }
                    ]
                }
            },
            {
                "href": "http://10.84.30.249:9100/network-policy/6b2e615b-1fcb-4041-b220-a1ec2907eac2",
                "fq_name": [
                    "default-domain",
                "admin",
                "partial-router"
                    ],
                "uuid": "6b2e615b-1fcb-4041-b220-a1ec2907eac2",
                "network_policy_entries": {
                    "policy_rule": [
                    {
                        "direction": "<>",
                        "protocol": "any",
                        "dst_addresses": [
                        {
                            "security_group": null,
                            "virtual_network": "default-domain:admin:vn2",
                            "subnet": null,
                            "network_policy": null
                        }
                        ],
                            "action_list": {
                                "mirror_to": null,
                                "gateway_name": null,
                                "log": false,
                                "qos_action": null,
                                "simple_action": "pass",
                                "apply_service": null
                            },
                            "rule_uuid": "c45f0e3a-d5b3-42e0-bde6-bcc9151454d1",
                            "dst_ports": [
                            {
                                "end_port": -1,
                                "start_port": -1
                            }
                        ],
                            "application": [],
                            "src_addresses": [
                            {
                                "security_group": null,
                                "virtual_network": "default-domain:admin:vn1",
                                "subnet": null,
                                "network_policy": null
                            }
                        ],
                            "rule_sequence": {
                                "major": -1,
                                "minor": -1
                            },
                            "src_ports": [
                            {
                                "end_port": -1,
                                "start_port": -1
                            }
                        ]
                    },
                    {
                        "direction": "<>",
                        "protocol": "any",
                        "dst_addresses": [
                        {
                            "security_group": null,
                            "virtual_network": "default-domain:admin:vn3",
                            "subnet": null,
                            "network_policy": null
                        }
                        ],
                            "action_list": {
                                "mirror_to": null,
                                "gateway_name": null,
                                "log": false,
                                "qos_action": null,
                                "simple_action": "pass",
                                "apply_service": null
                            },
                            "rule_uuid": "6dfbc7da-00f2-4dab-9291-3ca62be11615",
                            "dst_ports": [
                            {
                                "end_port": -1,
                                "start_port": -1
                            }
                        ],
                            "application": [],
                            "src_addresses": [
                            {
                                "security_group": null,
                                "virtual_network": "default-domain:admin:vn1",
                                "subnet": null,
                                "network_policy": null
                            }
                        ],
                            "rule_sequence": {
                                "major": -1,
                                "minor": -1
                            },
                            "src_ports": [
                            {
                                "end_port": -1,
                                "start_port": -1
                            }
                        ]
                    },
                    {
                        "direction": "<>",
                        "protocol": "any",
                        "dst_addresses": [
                        {
                            "security_group": null,
                            "virtual_network": "any",
                            "subnet": null,
                            "network_policy": null
                        }
                        ],
                            "action_list": {
                                "mirror_to": null,
                                "gateway_name": null,
                                "log": false,
                                "qos_action": null,
                                "simple_action": "pass",
                                "apply_service": null
                            },
                            "rule_uuid": "098edd4e-bc47-44cb-a5d7-61b53304dbc4",
                            "dst_ports": [
                            {
                                "end_port": -1,
                                "start_port": -1
                            }
                        ],
                            "application": [],
                            "src_addresses": [
                            {
                                "security_group": null,
                                "virtual_network": "any",
                                "subnet": null,
                                "network_policy": null
                            }
                        ],
                            "rule_sequence": {
                                "major": -1,
                                "minor": -1
                            },
                            "src_ports": [
                            {
                                "end_port": -1,
                                "start_port": -1
                            }
                        ]
                    }
                    ]
                }
            }
            ]
        }
    };
    /*
    {
        "configData": {
            "network-policys": [
                {
                    "href": "http://10.84.11.2:8082/network-policy/213e6d21-2094-41c2-8c25-455433fa4b43",
                    "fq_name": [
                        "default-domain",
                        "admin",
                        "f2b-allow-policy"
                    ],
                    "uuid": "213e6d21-2094-41c2-8c25-455433fa4b43",
                    "network_policy_entries": {
                        "policy_rule": [
                            {
                                "direction": "<>",
                                "protocol": "any",
                                "dst_addresses": [
                                    {
                                        "security_group": null,
                                        "subnet": null,
                                        "virtual_network": "default-domain:admin:backend",
                                        "network_policy": null
                                    }
                                ],
                                "action_list": {
                                    "simple_action": "pass",
                                    "gateway_name": null,
                                    "apply_service": [],
                                    "mirror_to": null,
                                    "assign_routing_instance": null
                                },
                                "rule_uuid": "86dc0155-8b64-46f9-8a26-df1f667813c9",
                                "dst_ports": [
                                    {
                                        "end_port": -1,
                                        "start_port": -1
                                    }
                                ],
                                "application": [],
                                "ethertype": null,
                                "src_addresses": [
                                    {
                                        "security_group": null,
                                        "subnet": null,
                                        "virtual_network": "default-domain:admin:frontend",
                                        "network_policy": null
                                    }
                                ],
                                "rule_sequence": {
                                    "major": -1,
                                    "minor": -1
                                },
                                "src_ports": [
                                    {
                                        "end_port": -1,
                                        "start_port": -1
                                    }
                                ]
                            }
                        ]
                    }
                }
            ]
        }
    };
    */
    this.virtualMachineDetailsByUUIDMockData = {
        "data": {
            "value": [
                {
                    "name": "7c20fb79-1a0a-49e3-b31f-d53db046264e",
                    "value": {
                        "UveVirtualMachineAgent": {
                            "vm_name": "front01",
                            "cpu_info": {
                                "virt_memory": 6757956,
                                "cpu_one_min_avg": 1.16667,
                                "disk_used_bytes": 1173041152,
                                "vm_memory_quota": 4194304,
                                "peak_virt_memory": 7250968,
                                "disk_allocated_bytes": 4294967295,
                                "rss": 1253784
                            },
                            "interface_list": [
                                "default-domain:admin:3683aa58-28ff-4ffb-8667-fb778d92ad0e"
                            ],
                            "uuid": "7c20fb79-1a0a-49e3-b31f-d53db046264e",
                            "vrouter": "a3s29"
                        }
                    }
                }
            ]
        },
        "lastKey": null,
        "more": false
    };
    this.virtualMachineSummaryByUUIDMockData = {
        "value": [
            {
                "name": "7c20fb79-1a0a-49e3-b31f-d53db046264e",
                "value": {
                    "UveVirtualMachineAgent": {
                        "vm_name": "front01",
                        "cpu_info": {
                            "virt_memory": 6757956,
                            "cpu_one_min_avg": 1.16667,
                            "disk_used_bytes": 1173041152,
                            "vm_memory_quota": 4194304,
                            "peak_virt_memory": 7250968,
                            "disk_allocated_bytes": 4294967295,
                            "rss": 1253784
                        },
                        "interface_list": [
                            "default-domain:admin:3683aa58-28ff-4ffb-8667-fb778d92ad0e"
                        ],
                        "uuid": "7c20fb79-1a0a-49e3-b31f-d53db046264e",
                        "vrouter": "a3s29"
                    }
                }
            }
        ]
    };
    this.networksMockStatData = [
        {
            "value": [
                {
                    "name": "default-domain:admin:backend",
                    "SUM(vn_stats.in_bytes)": 55272428,
                    "SUM(vn_stats.in_tpkts)": 165192,
                    "SUM(vn_stats.out_bytes)": 55380520,
                    "SUM(vn_stats.out_tpkts)": 165184
                },
                {
                    "name": "default-domain:admin:frontend",
                    "SUM(vn_stats.in_bytes)": 55380520,
                    "SUM(vn_stats.in_tpkts)": 165184,
                    "SUM(vn_stats.out_bytes)": 55272428,
                    "SUM(vn_stats.out_tpkts)": 165192
                }
            ]
        }
    ];
    this.portDistributionMockData = {
        "sport": [
            {
                "outBytes": 912072,
                "outPkts": 2628,
                "outFlowCount": 5,
                "sport": 9105,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 908356,
                "outPkts": 2598,
                "outFlowCount": 5,
                "sport": 9101,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 882638,
                "outPkts": 2595,
                "outFlowCount": 5,
                "sport": 9108,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 875180,
                "outPkts": 2602,
                "outFlowCount": 5,
                "sport": 9104,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 874880,
                "outPkts": 2580,
                "outFlowCount": 5,
                "sport": 9100,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 873978,
                "outPkts": 2593,
                "outFlowCount": 5,
                "sport": 9107,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 871810,
                "outPkts": 2609,
                "outFlowCount": 5,
                "sport": 9102,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 854872,
                "outPkts": 2576,
                "outFlowCount": 5,
                "sport": 9106,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 854506,
                "outPkts": 2557,
                "outFlowCount": 5,
                "sport": 9103,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 720608,
                "outPkts": 2092,
                "outFlowCount": 4,
                "sport": 9109,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 678300,
                "outPkts": 2062,
                "outFlowCount": 4,
                "sport": 9110,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 191442,
                "outPkts": 533,
                "outFlowCount": 1,
                "sport": 52330,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 188230,
                "outPkts": 527,
                "outFlowCount": 1,
                "sport": 52331,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 187990,
                "outPkts": 555,
                "outFlowCount": 1,
                "sport": 40595,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 185046,
                "outPkts": 543,
                "outFlowCount": 1,
                "sport": 49653,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 184278,
                "outPkts": 543,
                "outFlowCount": 1,
                "sport": 38549,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 182822,
                "outPkts": 527,
                "outFlowCount": 1,
                "sport": 41790,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 180366,
                "outPkts": 535,
                "outFlowCount": 1,
                "sport": 49651,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 180308,
                "outPkts": 526,
                "outFlowCount": 1,
                "sport": 37826,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 178742,
                "outPkts": 503,
                "outFlowCount": 1,
                "sport": 44961,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 178344,
                "outPkts": 524,
                "outFlowCount": 1,
                "sport": 39885,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 178168,
                "outPkts": 536,
                "outFlowCount": 1,
                "sport": 37822,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 177614,
                "outPkts": 539,
                "outFlowCount": 1,
                "sport": 39882,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 176876,
                "outPkts": 510,
                "outFlowCount": 1,
                "sport": 54152,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 176296,
                "outPkts": 500,
                "outFlowCount": 1,
                "sport": 37824,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 175274,
                "outPkts": 525,
                "outFlowCount": 1,
                "sport": 41791,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 175262,
                "outPkts": 523,
                "outFlowCount": 1,
                "sport": 40597,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 175200,
                "outPkts": 528,
                "outFlowCount": 1,
                "sport": 44959,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 174730,
                "outPkts": 477,
                "outFlowCount": 1,
                "sport": 44960,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 174526,
                "outPkts": 539,
                "outFlowCount": 1,
                "sport": 39883,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 174318,
                "outPkts": 551,
                "outFlowCount": 1,
                "sport": 34772,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 174202,
                "outPkts": 525,
                "outFlowCount": 1,
                "sport": 41789,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 172894,
                "outPkts": 527,
                "outFlowCount": 1,
                "sport": 44957,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 172096,
                "outPkts": 516,
                "outFlowCount": 1,
                "sport": 34768,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 171392,
                "outPkts": 536,
                "outFlowCount": 1,
                "sport": 34770,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 171014,
                "outPkts": 515,
                "outFlowCount": 1,
                "sport": 40598,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 170814,
                "outPkts": 539,
                "outFlowCount": 1,
                "sport": 54151,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 169710,
                "outPkts": 503,
                "outFlowCount": 1,
                "sport": 52327,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 169588,
                "outPkts": 518,
                "outFlowCount": 1,
                "sport": 38545,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 169584,
                "outPkts": 508,
                "outFlowCount": 1,
                "sport": 39803,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 169572,
                "outPkts": 490,
                "outFlowCount": 1,
                "sport": 49652,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 169220,
                "outPkts": 502,
                "outFlowCount": 1,
                "sport": 49650,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 168950,
                "outPkts": 511,
                "outFlowCount": 1,
                "sport": 52328,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 168908,
                "outPkts": 542,
                "outFlowCount": 1,
                "sport": 54154,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 168852,
                "outPkts": 530,
                "outFlowCount": 1,
                "sport": 39800,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 168742,
                "outPkts": 535,
                "outFlowCount": 1,
                "sport": 39804,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 168596,
                "outPkts": 530,
                "outFlowCount": 1,
                "sport": 41792,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 167800,
                "outPkts": 492,
                "outFlowCount": 1,
                "sport": 44958,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 167636,
                "outPkts": 502,
                "outFlowCount": 1,
                "sport": 52329,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 167132,
                "outPkts": 526,
                "outFlowCount": 1,
                "sport": 39802,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 165638,
                "outPkts": 515,
                "outFlowCount": 1,
                "sport": 38548,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 165386,
                "outPkts": 521,
                "outFlowCount": 1,
                "sport": 54150,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 164784,
                "outPkts": 492,
                "outFlowCount": 1,
                "sport": 39881,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 164456,
                "outPkts": 504,
                "outFlowCount": 1,
                "sport": 41788,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 163664,
                "outPkts": 516,
                "outFlowCount": 1,
                "sport": 54153,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 161332,
                "outPkts": 494,
                "outFlowCount": 1,
                "sport": 39801,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 161116,
                "outPkts": 510,
                "outFlowCount": 1,
                "sport": 49649,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 159850,
                "outPkts": 537,
                "outFlowCount": 1,
                "sport": 37823,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 159466,
                "outPkts": 477,
                "outFlowCount": 1,
                "sport": 34771,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 157352,
                "outPkts": 516,
                "outFlowCount": 1,
                "sport": 40594,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 154166,
                "outPkts": 515,
                "outFlowCount": 1,
                "sport": 39884,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 150264,
                "outPkts": 492,
                "outFlowCount": 1,
                "sport": 38546,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 149918,
                "outPkts": 491,
                "outFlowCount": 1,
                "sport": 34769,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "outBytes": 139642,
                "outPkts": 489,
                "outFlowCount": 1,
                "sport": 40596,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            }
        ],
        "dport": [
            {
                "inBytes": 885968,
                "inPkts": 2576,
                "inFlowCount": 5,
                "dport": 9106,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 869366,
                "inPkts": 2527,
                "inFlowCount": 5,
                "dport": 9103,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 865350,
                "inPkts": 2611,
                "inFlowCount": 5,
                "dport": 9104,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 865320,
                "inPkts": 2580,
                "inFlowCount": 5,
                "dport": 9100,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 849434,
                "inPkts": 2609,
                "inFlowCount": 5,
                "dport": 9102,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 845648,
                "inPkts": 2628,
                "inFlowCount": 5,
                "dport": 9105,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 835642,
                "inPkts": 2593,
                "inFlowCount": 5,
                "dport": 9107,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 831260,
                "inPkts": 2598,
                "inFlowCount": 5,
                "dport": 9101,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 827190,
                "inPkts": 2571,
                "inFlowCount": 5,
                "dport": 9108,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 694622,
                "inPkts": 2099,
                "inFlowCount": 4,
                "dport": 9109,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 669768,
                "inPkts": 2068,
                "inFlowCount": 4,
                "dport": 9110,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 193392,
                "inPkts": 536,
                "inFlowCount": 1,
                "dport": 34770,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 192858,
                "inPkts": 537,
                "inFlowCount": 1,
                "dport": 37823,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 190190,
                "inPkts": 555,
                "inFlowCount": 1,
                "dport": 40595,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 188268,
                "inPkts": 526,
                "inFlowCount": 1,
                "dport": 39802,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 188130,
                "inPkts": 521,
                "inFlowCount": 1,
                "dport": 54150,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 187328,
                "inPkts": 536,
                "inFlowCount": 1,
                "dport": 37822,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 187218,
                "inPkts": 525,
                "inFlowCount": 1,
                "dport": 41791,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 186806,
                "inPkts": 539,
                "inFlowCount": 1,
                "dport": 39883,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 186692,
                "inPkts": 542,
                "inFlowCount": 1,
                "dport": 54154,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 186436,
                "inPkts": 538,
                "inFlowCount": 1,
                "dport": 44959,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 186158,
                "inPkts": 535,
                "inFlowCount": 1,
                "dport": 39804,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 185646,
                "inPkts": 539,
                "inFlowCount": 1,
                "dport": 54151,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 185064,
                "inPkts": 516,
                "inFlowCount": 1,
                "dport": 54153,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 184638,
                "inPkts": 539,
                "inFlowCount": 1,
                "dport": 39882,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 184286,
                "inPkts": 527,
                "inFlowCount": 1,
                "dport": 52331,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 184032,
                "inPkts": 516,
                "inFlowCount": 1,
                "dport": 40594,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 183658,
                "inPkts": 489,
                "inFlowCount": 1,
                "dport": 40596,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 182878,
                "inPkts": 543,
                "inFlowCount": 1,
                "dport": 49653,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 182660,
                "inPkts": 530,
                "inFlowCount": 1,
                "dport": 39800,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 178892,
                "inPkts": 514,
                "inFlowCount": 1,
                "dport": 38548,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 178756,
                "inPkts": 502,
                "inFlowCount": 1,
                "dport": 49650,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 177662,
                "inPkts": 515,
                "inFlowCount": 1,
                "dport": 40598,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 177508,
                "inPkts": 510,
                "inFlowCount": 1,
                "dport": 49649,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 177086,
                "inPkts": 515,
                "inFlowCount": 1,
                "dport": 39884,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 175904,
                "inPkts": 504,
                "inFlowCount": 1,
                "dport": 41788,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 175406,
                "inPkts": 535,
                "inFlowCount": 1,
                "dport": 49651,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 174814,
                "inPkts": 511,
                "inFlowCount": 1,
                "dport": 52328,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 174094,
                "inPkts": 527,
                "inFlowCount": 1,
                "dport": 41790,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 173550,
                "inPkts": 551,
                "inFlowCount": 1,
                "dport": 34772,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 173518,
                "inPkts": 491,
                "inFlowCount": 1,
                "dport": 34769,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 172814,
                "inPkts": 523,
                "inFlowCount": 1,
                "dport": 40597,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 172810,
                "inPkts": 521,
                "inFlowCount": 1,
                "dport": 41792,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 172174,
                "inPkts": 527,
                "inFlowCount": 1,
                "dport": 44957,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 171744,
                "inPkts": 496,
                "inFlowCount": 1,
                "dport": 37824,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 171650,
                "inPkts": 501,
                "inFlowCount": 1,
                "dport": 34771,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 171566,
                "inPkts": 543,
                "inFlowCount": 1,
                "dport": 38549,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 170528,
                "inPkts": 516,
                "inFlowCount": 1,
                "dport": 34768,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 170408,
                "inPkts": 524,
                "inFlowCount": 1,
                "dport": 39885,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 168678,
                "inPkts": 523,
                "inFlowCount": 1,
                "dport": 37826,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 167836,
                "inPkts": 498,
                "inFlowCount": 1,
                "dport": 44958,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 167786,
                "inPkts": 533,
                "inFlowCount": 1,
                "dport": 52330,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 166540,
                "inPkts": 510,
                "inFlowCount": 1,
                "dport": 54152,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 166526,
                "inPkts": 515,
                "inFlowCount": 1,
                "dport": 38545,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 165974,
                "inPkts": 491,
                "inFlowCount": 1,
                "dport": 44960,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 165154,
                "inPkts": 525,
                "inFlowCount": 1,
                "dport": 41789,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 164572,
                "inPkts": 502,
                "inFlowCount": 1,
                "dport": 52329,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 163414,
                "inPkts": 503,
                "inFlowCount": 1,
                "dport": 52327,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 162086,
                "inPkts": 503,
                "inFlowCount": 1,
                "dport": 44961,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 161316,
                "inPkts": 490,
                "inFlowCount": 1,
                "dport": 38546,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 161096,
                "inPkts": 508,
                "inFlowCount": 1,
                "dport": 39803,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 160332,
                "inPkts": 490,
                "inFlowCount": 1,
                "dport": 49652,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 155796,
                "inPkts": 494,
                "inFlowCount": 1,
                "dport": 39801,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            },
            {
                "inBytes": 152872,
                "inPkts": 492,
                "inFlowCount": 1,
                "dport": 39881,
                "protocol": 6,
                "totalPkts": null,
                "totalBytes": null
            }
        ],
        "startTime": 1442869071000,
        "endTime": 1442869671000
    };
    this.projectConnectedGraph = {
        "nodes": [
            {
                "name": "default-domain:admin:backend",
                "more_attributes": {
                    "vm_count": 1,
                    "vmi_count": 1,
                    "in_throughput": 129168,
                    "out_throughput": 111090,
                    "virtualmachine_list": [
                        "39b35cf1-1bdf-4238-bcc2-16653f12379a"
                    ],
                    "connected_networks": [
                        [
                            "default-domain:admin:frontend"
                        ]
                    ]
                },
                "node_type": "virtual-network",
                "status": "Active"
            },
            {
                "name": "default-domain:admin:frontend",
                "more_attributes": {
                    "vm_count": 1,
                    "vmi_count": 1,
                    "in_throughput": 111090,
                    "out_throughput": 129168,
                    "virtualmachine_list": [
                        "7c20fb79-1a0a-49e3-b31f-d53db046264e"
                    ],
                    "connected_networks": [
                        [
                            "default-domain:admin:backend"
                        ]
                    ]
                },
                "node_type": "virtual-network",
                "status": "Active"
            }
        ],
        "links": [
            {
                "src": "default-domain:admin:backend",
                "dst": "default-domain:admin:frontend",
                "dir": "bi",
                "more_attributes": {
                    "in_stats": [
                        {
                            "src": "default-domain:admin:backend",
                            "dst": "default-domain:admin:frontend",
                            "pkts": 241303942,
                            "bytes": 80859393372
                        },
                        {
                            "src": "default-domain:admin:frontend",
                            "dst": "default-domain:admin:backend",
                            "pkts": 241291886,
                            "bytes": 80775098252
                        }
                    ],
                    "out_stats": [
                        {
                            "src": "default-domain:admin:backend",
                            "dst": "default-domain:admin:frontend",
                            "pkts": 241291886,
                            "bytes": 80775098252
                        },
                        {
                            "src": "default-domain:admin:frontend",
                            "dst": "default-domain:admin:backend",
                            "pkts": 241303942,
                            "bytes": 80859393372
                        }
                    ]
                }
            }
        ],
        "config-data": {
            "virtual-networks": [
                {
                    "href": "http://10.84.11.2:8082/virtual-network/942f569c-2bf4-4665-b76e-99fcc06333fc",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn247"
                    ],
                    "uuid": "942f569c-2bf4-4665-b76e-99fcc06333fc"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/f8756833-c1b0-43a6-84a6-895f5ca45844",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn218"
                    ],
                    "uuid": "f8756833-c1b0-43a6-84a6-895f5ca45844"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/c2de6708-0e34-457f-b462-7b4430b7ccb0",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn231"
                    ],
                    "uuid": "c2de6708-0e34-457f-b462-7b4430b7ccb0"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/572d0898-ac0d-429c-af11-7230830f3272",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn233"
                    ],
                    "uuid": "572d0898-ac0d-429c-af11-7230830f3272"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/4a55bb32-18dd-4969-85a2-1d8741aea3b1",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn279"
                    ],
                    "uuid": "4a55bb32-18dd-4969-85a2-1d8741aea3b1"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/78f955bd-4fae-4fbb-be53-0ee8d9d9be6b",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn210"
                    ],
                    "uuid": "78f955bd-4fae-4fbb-be53-0ee8d9d9be6b"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/2e153e91-1609-4a58-b686-87ff0411c960",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn258"
                    ],
                    "uuid": "2e153e91-1609-4a58-b686-87ff0411c960"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/78fac2b5-8e24-48e9-a583-2f6adcd33f90",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn241"
                    ],
                    "uuid": "78fac2b5-8e24-48e9-a583-2f6adcd33f90"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/b6b9986f-223d-453a-8d4e-71f27fd32f8e",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn253"
                    ],
                    "uuid": "b6b9986f-223d-453a-8d4e-71f27fd32f8e"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/98ed0ba7-c4ee-4439-b13e-4f93bd9349f7",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn286"
                    ],
                    "uuid": "98ed0ba7-c4ee-4439-b13e-4f93bd9349f7"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/02313514-a606-44ae-aca8-43a39322d8bd",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn284"
                    ],
                    "uuid": "02313514-a606-44ae-aca8-43a39322d8bd"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/5cd8366e-07b4-4af6-b8b9-f5a483e0aa64",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn297"
                    ],
                    "uuid": "5cd8366e-07b4-4af6-b8b9-f5a483e0aa64"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/96839337-6369-4605-a672-04e8648a69ce",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn277"
                    ],
                    "uuid": "96839337-6369-4605-a672-04e8648a69ce"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/3e266766-48e1-480d-9948-0aeff3a1b2b2",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn223"
                    ],
                    "uuid": "3e266766-48e1-480d-9948-0aeff3a1b2b2"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/3bda80c6-0704-484d-aed8-01139a317c06",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn240"
                    ],
                    "uuid": "3bda80c6-0704-484d-aed8-01139a317c06"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/1394f407-ec73-4c40-ba52-f6c8c08cbad5",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn259"
                    ],
                    "uuid": "1394f407-ec73-4c40-ba52-f6c8c08cbad5"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/2b296fb6-0051-4204-9eeb-41e615434234",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn235"
                    ],
                    "uuid": "2b296fb6-0051-4204-9eeb-41e615434234"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/86bb52eb-bbff-4228-8966-65223abfeec8",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn229"
                    ],
                    "uuid": "86bb52eb-bbff-4228-8966-65223abfeec8"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/84bb320e-3ae5-4cab-bb3a-92bd121d8fb9",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn207"
                    ],
                    "uuid": "84bb320e-3ae5-4cab-bb3a-92bd121d8fb9"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/a288fabb-60da-4656-adb8-213f1ed52b7d",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn250"
                    ],
                    "uuid": "a288fabb-60da-4656-adb8-213f1ed52b7d"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/507f31c1-1d70-41de-90e0-e5b71c4287cc",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn224"
                    ],
                    "uuid": "507f31c1-1d70-41de-90e0-e5b71c4287cc"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/c6310238-0126-4f03-9079-ca0bad3c5960",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn283"
                    ],
                    "uuid": "c6310238-0126-4f03-9079-ca0bad3c5960"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/606bbf21-b1f8-4194-83cc-376e470cba00",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn269"
                    ],
                    "uuid": "606bbf21-b1f8-4194-83cc-376e470cba00"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/80dcf2dc-fc7f-41a3-9925-751c0314b6d9",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn296"
                    ],
                    "uuid": "80dcf2dc-fc7f-41a3-9925-751c0314b6d9"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/608e1675-d857-4755-b6ce-b7556e8e61f1",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn265"
                    ],
                    "uuid": "608e1675-d857-4755-b6ce-b7556e8e61f1"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/47bb928c-ff6a-4543-865a-172c5be57636",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn281"
                    ],
                    "uuid": "47bb928c-ff6a-4543-865a-172c5be57636"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/21f34a07-e49e-4204-8e1a-fa65ca899bc4",
                    "fq_name": [
                        "default-domain",
                        "default-project",
                        "default-virtual-network"
                    ],
                    "uuid": "21f34a07-e49e-4204-8e1a-fa65ca899bc4"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/3b7b6d7f-de48-4bce-9371-1ecbacf76db6",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn238"
                    ],
                    "uuid": "3b7b6d7f-de48-4bce-9371-1ecbacf76db6"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/55cf023e-060d-47e0-82bb-c4b4c10aeb67",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn290"
                    ],
                    "uuid": "55cf023e-060d-47e0-82bb-c4b4c10aeb67"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/f8f74bf3-6bf1-4d06-a41b-ab9ab4c5e6d6",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn271"
                    ],
                    "uuid": "f8f74bf3-6bf1-4d06-a41b-ab9ab4c5e6d6"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/aad18ba9-0964-4604-8af6-5117adc6d8ac",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn222"
                    ],
                    "uuid": "aad18ba9-0964-4604-8af6-5117adc6d8ac"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/55325aa4-b251-40cc-bd16-738aed49edce",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn234"
                    ],
                    "uuid": "55325aa4-b251-40cc-bd16-738aed49edce"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/ad8a9efc-9b7e-4425-9735-03bda0d2726e",
                    "fq_name": [
                        "default-domain",
                        "admin",
                        "frontend"
                    ],
                    "uuid": "ad8a9efc-9b7e-4425-9735-03bda0d2726e"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/00b74584-8cba-40a6-9aff-5b2baa645a00",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn295"
                    ],
                    "uuid": "00b74584-8cba-40a6-9aff-5b2baa645a00"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/642c9ee3-4fe5-4c05-b5bb-16bf9dc94e67",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn257"
                    ],
                    "uuid": "642c9ee3-4fe5-4c05-b5bb-16bf9dc94e67"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/97ce2640-419d-424c-b7fa-7f11f1a98fed",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn208"
                    ],
                    "uuid": "97ce2640-419d-424c-b7fa-7f11f1a98fed"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/6a841ceb-b990-4a19-978c-21c8b529db7c",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn248"
                    ],
                    "uuid": "6a841ceb-b990-4a19-978c-21c8b529db7c"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/ceb8b037-d210-459c-8b44-d7ac328c3dee",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn239"
                    ],
                    "uuid": "ceb8b037-d210-459c-8b44-d7ac328c3dee"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/2dad25c6-bcca-4522-86a7-383a230b5f64",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn293"
                    ],
                    "uuid": "2dad25c6-bcca-4522-86a7-383a230b5f64"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/e50880f8-5b3a-45f7-8376-44da2fed67c1",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn236"
                    ],
                    "uuid": "e50880f8-5b3a-45f7-8376-44da2fed67c1"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/142129fb-563a-4929-b8d6-6e042f42b94c",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn272"
                    ],
                    "uuid": "142129fb-563a-4929-b8d6-6e042f42b94c"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/e219df6e-49e3-4508-aaaf-0d4a8b20e951",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn299"
                    ],
                    "uuid": "e219df6e-49e3-4508-aaaf-0d4a8b20e951"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/b3a68080-612f-4619-8b07-2b1dbfe9671b",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn243"
                    ],
                    "uuid": "b3a68080-612f-4619-8b07-2b1dbfe9671b"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/26b0af33-4c12-4803-9c6f-432c69c65e8a",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn256"
                    ],
                    "uuid": "26b0af33-4c12-4803-9c6f-432c69c65e8a"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/8adf0a62-ca90-4d0c-95d7-2d8cfe2b75f3",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn206"
                    ],
                    "uuid": "8adf0a62-ca90-4d0c-95d7-2d8cfe2b75f3"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/2847747f-cb2c-4499-9b12-0f1711168e72",
                    "fq_name": [
                        "default-domain",
                        "admin",
                        "backend"
                    ],
                    "uuid": "2847747f-cb2c-4499-9b12-0f1711168e72"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/d0ad87c5-9189-494c-9557-c98246d2b2da",
                    "fq_name": [
                        "default-domain",
                        "default-project",
                        "__link_local__"
                    ],
                    "uuid": "d0ad87c5-9189-494c-9557-c98246d2b2da"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/e0c10dfe-ccec-4190-bd69-fcec38fad5fd",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn263"
                    ],
                    "uuid": "e0c10dfe-ccec-4190-bd69-fcec38fad5fd"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/3080e8d6-3d13-4e48-acb6-b0aaa834af89",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn204"
                    ],
                    "uuid": "3080e8d6-3d13-4e48-acb6-b0aaa834af89"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/03e1fbfd-3528-4b9f-ad2e-481270d95d0e",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn291"
                    ],
                    "uuid": "03e1fbfd-3528-4b9f-ad2e-481270d95d0e"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/dad950cf-338f-4d00-b2cc-de0aed061298",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn230"
                    ],
                    "uuid": "dad950cf-338f-4d00-b2cc-de0aed061298"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/7158a67b-847c-499a-bd22-d1814de3a117",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn273"
                    ],
                    "uuid": "7158a67b-847c-499a-bd22-d1814de3a117"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/a45d7ab4-319c-4105-8421-8b9f38c837a0",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn202"
                    ],
                    "uuid": "a45d7ab4-319c-4105-8421-8b9f38c837a0"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/48ae9caf-5e6a-4ccc-a891-faef07086659",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn270"
                    ],
                    "uuid": "48ae9caf-5e6a-4ccc-a891-faef07086659"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/a26e6fb0-d077-4d5a-888b-1006e03e76be",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn292"
                    ],
                    "uuid": "a26e6fb0-d077-4d5a-888b-1006e03e76be"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/f809d4b6-d70e-44b5-bae2-10102723f210",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn221"
                    ],
                    "uuid": "f809d4b6-d70e-44b5-bae2-10102723f210"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/a24b2c1d-89d3-4b63-bc7f-f8712aa8efaf",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn294"
                    ],
                    "uuid": "a24b2c1d-89d3-4b63-bc7f-f8712aa8efaf"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/39e2492e-6ee3-479d-9d26-4fbf6050fc5d",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn298"
                    ],
                    "uuid": "39e2492e-6ee3-479d-9d26-4fbf6050fc5d"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/92163f4f-ab3c-4249-8137-b942f30c437e",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn228"
                    ],
                    "uuid": "92163f4f-ab3c-4249-8137-b942f30c437e"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/e6ab075c-2f1a-47d5-93b6-85c66c2af6d0",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn226"
                    ],
                    "uuid": "e6ab075c-2f1a-47d5-93b6-85c66c2af6d0"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/82c52ec3-adb4-4ec0-af50-b7e993bf2df9",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn266"
                    ],
                    "uuid": "82c52ec3-adb4-4ec0-af50-b7e993bf2df9"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/a8bda77b-9959-472e-9f7b-3eda407d48cd",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn242"
                    ],
                    "uuid": "a8bda77b-9959-472e-9f7b-3eda407d48cd"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/c8d2e1c1-5447-4fe0-a27e-732a92e5101c",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn249"
                    ],
                    "uuid": "c8d2e1c1-5447-4fe0-a27e-732a92e5101c"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/edb6b525-453d-4564-b18f-6f33ec238d36",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn289"
                    ],
                    "uuid": "edb6b525-453d-4564-b18f-6f33ec238d36"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/ee61c53a-60a5-4c1b-8c52-e85f47d095f3",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn211"
                    ],
                    "uuid": "ee61c53a-60a5-4c1b-8c52-e85f47d095f3"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/b6848504-58a1-4708-8a8f-06cf739cdbe1",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn213"
                    ],
                    "uuid": "b6848504-58a1-4708-8a8f-06cf739cdbe1"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/5afff8c0-75bd-4063-b146-667885069bef",
                    "fq_name": [
                        "default-domain",
                        "demo",
                        "st_vn101"
                    ],
                    "uuid": "5afff8c0-75bd-4063-b146-667885069bef"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/ff23b65a-82db-4027-8355-85dd55229a08",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn217"
                    ],
                    "uuid": "ff23b65a-82db-4027-8355-85dd55229a08"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/e16ed02a-9785-4729-8c9d-7007309d9fa8",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn254"
                    ],
                    "uuid": "e16ed02a-9785-4729-8c9d-7007309d9fa8"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/4a6e9325-a634-41d9-ba4b-1ce42cbe18f8",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn261"
                    ],
                    "uuid": "4a6e9325-a634-41d9-ba4b-1ce42cbe18f8"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/55d83afb-f2ab-48fd-a350-81ada84b5a25",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn285"
                    ],
                    "uuid": "55d83afb-f2ab-48fd-a350-81ada84b5a25"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/2590b9cb-0087-4eae-9a32-d158cd675d7f",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn216"
                    ],
                    "uuid": "2590b9cb-0087-4eae-9a32-d158cd675d7f"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/22785aef-937b-42b9-a3b2-7b7c0e22fafb",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn252"
                    ],
                    "uuid": "22785aef-937b-42b9-a3b2-7b7c0e22fafb"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/bb068828-0366-4cf6-b790-af6618653351",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn209"
                    ],
                    "uuid": "bb068828-0366-4cf6-b790-af6618653351"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/a9f3a346-a2b5-4699-96e6-ad9730594f11",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn276"
                    ],
                    "uuid": "a9f3a346-a2b5-4699-96e6-ad9730594f11"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/5df80350-8754-4a85-abf2-dad14f43a8f6",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn227"
                    ],
                    "uuid": "5df80350-8754-4a85-abf2-dad14f43a8f6"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/91bbc128-8202-44a6-afad-9b2bffee6d26",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn244"
                    ],
                    "uuid": "91bbc128-8202-44a6-afad-9b2bffee6d26"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/40f39d38-7d13-44e1-a662-4c1625065af4",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn288"
                    ],
                    "uuid": "40f39d38-7d13-44e1-a662-4c1625065af4"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/c2f91e51-9c9a-4191-b3e3-20dbfe6db0b4",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn246"
                    ],
                    "uuid": "c2f91e51-9c9a-4191-b3e3-20dbfe6db0b4"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/00c312fb-4eb3-41f2-9c27-ae33d4d46472",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn274"
                    ],
                    "uuid": "00c312fb-4eb3-41f2-9c27-ae33d4d46472"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/39c21bba-088e-4732-9cdc-82aa5271238d",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn280"
                    ],
                    "uuid": "39c21bba-088e-4732-9cdc-82aa5271238d"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/e1a07ef5-ee3b-4422-b085-fa3641090626",
                    "fq_name": [
                        "default-domain",
                        "demo",
                        "st_vn102"
                    ],
                    "uuid": "e1a07ef5-ee3b-4422-b085-fa3641090626"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/cca12cf0-1e59-46c4-968a-4c4027e785d6",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn237"
                    ],
                    "uuid": "cca12cf0-1e59-46c4-968a-4c4027e785d6"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/bf0a4bb3-f993-4c21-a856-2c0f93229ef3",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn245"
                    ],
                    "uuid": "bf0a4bb3-f993-4c21-a856-2c0f93229ef3"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/9a707645-70d9-4004-b022-055c34f2a9a7",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn255"
                    ],
                    "uuid": "9a707645-70d9-4004-b022-055c34f2a9a7"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/01c741c0-6fbc-4e2f-98f9-20ebf0fa5d7f",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn278"
                    ],
                    "uuid": "01c741c0-6fbc-4e2f-98f9-20ebf0fa5d7f"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/43068aa1-160c-4a7d-b194-03ff0c45fd0f",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn260"
                    ],
                    "uuid": "43068aa1-160c-4a7d-b194-03ff0c45fd0f"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/70c06b3c-4cf7-4f56-9736-ac08a1e39c78",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn201"
                    ],
                    "uuid": "70c06b3c-4cf7-4f56-9736-ac08a1e39c78"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/87b63e0d-4794-4479-ae80-81095bd8c3a9",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn251"
                    ],
                    "uuid": "87b63e0d-4794-4479-ae80-81095bd8c3a9"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/b8f13afa-a34d-4518-836c-1a915945f756",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn232"
                    ],
                    "uuid": "b8f13afa-a34d-4518-836c-1a915945f756"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/6871fd03-8e62-48fa-85be-408be0d5d2f3",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn212"
                    ],
                    "uuid": "6871fd03-8e62-48fa-85be-408be0d5d2f3"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/09a5a33c-86ae-4b77-b661-9c14b4f2f16a",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn300"
                    ],
                    "uuid": "09a5a33c-86ae-4b77-b661-9c14b4f2f16a"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/42469cc3-5bcc-4fa1-b917-3ad2d5fbd934",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn203"
                    ],
                    "uuid": "42469cc3-5bcc-4fa1-b917-3ad2d5fbd934"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/8a413462-09d1-4093-af88-df7de90e9e79",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn225"
                    ],
                    "uuid": "8a413462-09d1-4093-af88-df7de90e9e79"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/8a74957e-bc3a-41a2-8d90-d3df3211e008",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn220"
                    ],
                    "uuid": "8a74957e-bc3a-41a2-8d90-d3df3211e008"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/23898c8a-92b3-4d4c-9e2b-bafcdb2f72e2",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn287"
                    ],
                    "uuid": "23898c8a-92b3-4d4c-9e2b-bafcdb2f72e2"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/8a5e25d6-0bab-4552-8209-56a2deafa106",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn214"
                    ],
                    "uuid": "8a5e25d6-0bab-4552-8209-56a2deafa106"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/147826be-5af2-4ec1-894b-9597b5411b9d",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn282"
                    ],
                    "uuid": "147826be-5af2-4ec1-894b-9597b5411b9d"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/89cf1bf4-bd43-4b97-8e5a-f243af0e1371",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn275"
                    ],
                    "uuid": "89cf1bf4-bd43-4b97-8e5a-f243af0e1371"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/3d91ff06-caa7-402e-8a1f-c47587a765c5",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn262"
                    ],
                    "uuid": "3d91ff06-caa7-402e-8a1f-c47587a765c5"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/a5f70f50-232c-4c10-bb3c-18145dfdc3b9",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn215"
                    ],
                    "uuid": "a5f70f50-232c-4c10-bb3c-18145dfdc3b9"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/9931a792-43ba-47c5-adbc-cda0504b95c6",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn267"
                    ],
                    "uuid": "9931a792-43ba-47c5-adbc-cda0504b95c6"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/dcdec784-585b-49bb-89a9-5f80c63d47a7",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn219"
                    ],
                    "uuid": "dcdec784-585b-49bb-89a9-5f80c63d47a7"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/106d8aaa-d75b-430b-adaa-0bc6e4aaef4c",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn205"
                    ],
                    "uuid": "106d8aaa-d75b-430b-adaa-0bc6e4aaef4c"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/2a7d9060-ca01-4634-98ce-723b218ec52a",
                    "fq_name": [
                        "default-domain",
                        "default-project",
                        "ip-fabric"
                    ],
                    "uuid": "2a7d9060-ca01-4634-98ce-723b218ec52a"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/54033332-4f40-4402-970c-b522f7cfaa72",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn268"
                    ],
                    "uuid": "54033332-4f40-4402-970c-b522f7cfaa72"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/a5138b95-82df-4a95-af59-ef0e08d7d796",
                    "fq_name": [
                        "default-domain",
                        "scalevns",
                        "st2_vn264"
                    ],
                    "uuid": "a5138b95-82df-4a95-af59-ef0e08d7d796"
                }
            ],
            "service-instances": []
        }
    };
    this.projectConfigGraph = {
        "configData": {
            "network-policys": [
                {
                    "href": "http://10.84.11.2:8082/network-policy/213e6d21-2094-41c2-8c25-455433fa4b43",
                    "fq_name": [
                        "default-domain",
                        "admin",
                        "f2b-allow-policy"
                    ],
                    "uuid": "213e6d21-2094-41c2-8c25-455433fa4b43",
                    "network_policy_entries": {
                        "policy_rule": [
                            {
                                "direction": "<>",
                                "protocol": "any",
                                "dst_addresses": [
                                    {
                                        "security_group": null,
                                        "subnet": null,
                                        "virtual_network": "default-domain:admin:backend",
                                        "network_policy": null
                                    }
                                ],
                                "action_list": {
                                    "simple_action": "pass",
                                    "gateway_name": null,
                                    "apply_service": [],
                                    "mirror_to": null,
                                    "assign_routing_instance": null
                                },
                                "rule_uuid": "86dc0155-8b64-46f9-8a26-df1f667813c9",
                                "dst_ports": [
                                    {
                                        "end_port": -1,
                                        "start_port": -1
                                    }
                                ],
                                "application": [],
                                "ethertype": null,
                                "src_addresses": [
                                    {
                                        "security_group": null,
                                        "subnet": null,
                                        "virtual_network": "default-domain:admin:frontend",
                                        "network_policy": null
                                    }
                                ],
                                "rule_sequence": {
                                    "major": -1,
                                    "minor": -1
                                },
                                "src_ports": [
                                    {
                                        "end_port": -1,
                                        "start_port": -1
                                    }
                                ]
                            }
                        ]
                    }
                }
            ],
            "security-groups": [
                {
                    "href": "http://10.84.11.2:8082/security-group/6a8831d2-c32b-4bae-a85f-3f704f5fd032",
                    "fq_name": [
                        "default-domain",
                        "admin",
                        "default"
                    ],
                    "uuid": "6a8831d2-c32b-4bae-a85f-3f704f5fd032"
                },
                {
                    "href": "http://10.84.11.2:8082/security-group/72c50066-f2e7-4851-be76-70ef5544b3e0",
                    "fq_name": [
                        "default-domain",
                        "admin",
                        "test1"
                    ],
                    "uuid": "72c50066-f2e7-4851-be76-70ef5544b3e0"
                },
                {
                    "href": "http://10.84.11.2:8082/security-group/5c630943-b6a4-4462-80be-cf20eda98359",
                    "fq_name": [
                        "default-domain",
                        "admin",
                        "test2"
                    ],
                    "uuid": "5c630943-b6a4-4462-80be-cf20eda98359"
                }
            ],
            "network-ipams": []
        }
    };
    this.virtualMachinesDetailsMockData = {
        "data": {
            "value": [
                {
                    "name": "39b35cf1-1bdf-4238-bcc2-16653f12379a",
                    "value": {
                        "UveVirtualMachineAgent": {
                            "vm_name": "back01",
                            "cpu_info": {
                                "virt_memory": 6757088,
                                "cpu_one_min_avg": 1,
                                "disk_used_bytes": 1168121856,
                                "vm_memory_quota": 4194304,
                                "peak_virt_memory": 7251764,
                                "disk_allocated_bytes": 4294967295,
                                "rss": 1273216
                            },
                            "interface_list": [
                                "default-domain:admin:4b5073eb-ee2e-4790-b106-e020a4e79e45"
                            ],
                            "uuid": "39b35cf1-1bdf-4238-bcc2-16653f12379a",
                            "vrouter": "a3s29"
                        }
                    }
                },
                {
                    "name": "7c20fb79-1a0a-49e3-b31f-d53db046264e",
                    "value": {
                        "UveVirtualMachineAgent": {
                            "vm_name": "front01",
                            "cpu_info": {
                                "virt_memory": 6757952,
                                "cpu_one_min_avg": 0.983607,
                                "disk_used_bytes": 1173041152,
                                "vm_memory_quota": 4194304,
                                "peak_virt_memory": 7250968,
                                "disk_allocated_bytes": 4294967295,
                                "rss": 1253564
                            },
                            "interface_list": [
                                "default-domain:admin:3683aa58-28ff-4ffb-8667-fb778d92ad0e"
                            ],
                            "uuid": "7c20fb79-1a0a-49e3-b31f-d53db046264e",
                            "vrouter": "a3s29"
                        }
                    }
                }
            ]
        },
        "lastKey": null,
        "more": false
    };
    this.virtualMachinesSummaryMockData = {
        "value": [
            {
                "name": "default-domain:admin:4b5073eb-ee2e-4790-b106-e020a4e79e45",
                "value": {
                    "UveVMInterfaceAgent": {
                        "vm_name": "back01",
                        "ip6_active": false,
                        "if_stats": {
                            "out_bytes": 406048,
                            "in_bytes": 462506,
                            "in_pkts": 1341,
                            "out_pkts": 1340
                        },
                        "ip6_address": "::",
                        "virtual_network": "default-domain:admin:backend",
                        "ip_address": "10.3.1.3"
                    }
                }
            },
            {
                "name": "default-domain:admin:3683aa58-28ff-4ffb-8667-fb778d92ad0e",
                "value": {
                    "UveVMInterfaceAgent": {
                        "vm_name": "front01",
                        "ip6_active": false,
                        "if_stats": {
                            "out_bytes": 462506,
                            "in_bytes": 406048,
                            "in_pkts": 1340,
                            "out_pkts": 1341
                        },
                        "ip6_address": "::",
                        "virtual_network": "default-domain:admin:frontend",
                        "ip_address": "10.2.1.3"
                    }
                }
            }
        ]
    };
    this.virtualMachinesInterfacesMockData = {
        "value": [
            {
                "name": "default-domain:admin:3683aa58-28ff-4ffb-8667-fb778d92ad0e",
                "value": {
                    "UveVMInterfaceAgent": {
                        "vm_name": "front01",
                        "ip6_active": false,
                        "if_stats": {
                            "out_bytes": 440800,
                            "in_bytes": 465900,
                            "in_pkts": 1374,
                            "out_pkts": 1368
                        },
                        "ip6_address": "::",
                        "virtual_network": "default-domain:admin:frontend",
                        "ip_address": "10.2.1.3"
                    }
                }
            }
        ]
    };
    this.virtualMachineInterfaceList = {
        "opVMIList": [
            "default-domain:admin:c4045ee4-a2cf-4ca7-854b-f695e0b5be53",
            "default-domain:admin:e718d077-f828-4c67-955e-e11e9c664e27"
        ],
        "configVMIList": [
            {
                "fqn": "default-domain:admin:c4045ee4-a2cf-4ca7-854b-f695e0b5be53",
                "uuid": "c4045ee4-a2cf-4ca7-854b-f695e0b5be53"
            },{
                "fqn": "default-domain:admin:e718d077-f828-4c67-955e-e11e9c664e27",
                "uuid": "e718d077-f828-4c67-955e-e11e9c664e27"
            }
        ]
    };

    this.virtualMachineInterfaceDetails = {
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
                  "out_bytes": 756,
                  "in_pkts": 0,
                  "out_pkts": 18,
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
                "uuid": "c4045ee4-a2cf-4ca7-854b-f695e0b5be53",
                "tx_vlan": 65535,
                "ip4_active": true,
                "mac_address": "02:c4:04:5e:e4:a2",
                "l2_active": true,
                "fixed_ip4_list": [
                  "10.10.10.3"
                ],
                "vm_name": "test1-inst",
                "out_bw_usage": 208,
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
                "rx_vlan": 65535,
                "in_bw_usage": 0,
                "vn_uuid": "4a5429be-8bc3-484a-9315-fb87bdf3851d",
                "admin_state": true
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
                  "out_bytes": 756,
                  "in_pkts": 0,
                  "out_pkts": 18,
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
                "uuid": "e718d077-f828-4c67-955e-e11e9c664e27",
                "tx_vlan": 65535,
                "ip4_active": true,
                "mac_address": "02:e7:18:d0:77:f8",
                "l2_active": true,
                "fixed_ip4_list": [
                  "10.10.10.4"
                ],
                "vm_name": "test1-inst1",
                "out_bw_usage": 0,
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
                "rx_vlan": 65535,
                "in_bw_usage": 0,
                "vn_uuid": "4a5429be-8bc3-484a-9315-fb87bdf3851d",
                "admin_state": true
              }
            }
          }
        ]
      },
      "lastKey": null,
      "more": false
    };

    this.virtualMachineInterfaceStats = {
      "data": [
        {
          "vm_uuid": "8222e32c-0601-4d9f-bb3b-2f92ec9d65e0",
          "SUM(if_stats.in_bytes)": 0,
          "SUM(if_stats.in_pkts)": 0,
          "SUM(if_stats.out_bytes)": 17136,
          "SUM(if_stats.out_pkts)": 408
        },
        {
          "vm_uuid": "76ebc798-5f58-4fb9-a3ef-2271e83ca32e",
          "SUM(if_stats.in_bytes)": 0,
          "SUM(if_stats.in_pkts)": 0,
          "SUM(if_stats.out_bytes)": 16674,
          "SUM(if_stats.out_pkts)": 397
        }
      ],
      "total": 2,
      "queryJSON": {
        "table": "StatTable.UveVMInterfaceAgent.if_stats",
        "start_time": "now-60m",
        "end_time": "now",
        "select_fields": [
          "SUM(if_stats.in_bytes)",
          "SUM(if_stats.out_bytes)",
          "SUM(if_stats.in_pkts)",
          "SUM(if_stats.out_pkts)",
          "vm_uuid"
        ],
        "filter": [
          []
        ],
        "where": [
          [
            {
              "name": "name",
              "value": "default-domain:admin:c4045ee4-a2cf-4ca7-854b-f695e0b5be53",
              "op": 1
            }
          ],
          [
            {
              "name": "name",
              "value": "default-domain:admin:e718d077-f828-4c67-955e-e11e9c664e27",
              "op": 1
            }
          ]
        ],
        "limit": 150000
      },
      "chunk": 1,
      "chunkSize": 2,
      "serverSideChunking": true
    };
    this.networkingStatsMockData = [
        {
            "value": [
                {
                    "name": "default-domain:admin:backend",
                    "SUM(vn_stats.in_bytes)": 55374864,
                    "SUM(vn_stats.in_tpkts)": 165032,
                    "SUM(vn_stats.out_bytes)": 55166624,
                    "SUM(vn_stats.out_tpkts)": 164956
                },
                {
                    "name": "default-domain:admin:frontend",
                    "SUM(vn_stats.in_bytes)": 55166624,
                    "SUM(vn_stats.in_tpkts)": 164956,
                    "SUM(vn_stats.out_bytes)": 55374864,
                    "SUM(vn_stats.out_tpkts)": 165032
                }
            ]
        }
    ];
    this.virtualMachinesStatsMockData = [
        {
            "value": [
                {
                    "vm_uuid": "7c20fb79-1a0a-49e3-b31f-d53db046264e",
                    "SUM(if_stats.in_bytes)": 50720614,
                    "SUM(if_stats.in_pkts)": 151239,
                    "SUM(if_stats.out_bytes)": 50713620,
                    "SUM(if_stats.out_pkts)": 151182
                }
            ]
        }
    ];
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
                            "cpu_one_min_avg": 1.33333,
                            "disk_used_bytes": 940285952,
                            "vm_memory_quota": 2097152,
                            "peak_virt_memory": 5171480,
                            "disk_allocated_bytes": 4294967295,
                            "rss": 286148
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
                            "cpu_one_min_avg": 1.33333,
                            "disk_used_bytes": 940285952,
                            "vm_memory_quota": 2097152,
                            "peak_virt_memory": 5171480,
                            "disk_allocated_bytes": 4294967295,
                            "rss": 286148
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
                            "rss": 185224
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
                            "rss": 185224
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
                            "rss": 177936
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
                            "rss": 177936
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
                                            "json_operand1_value": "-1.22736e-52",
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
                            "timestamp": 1480036774759642,
                            "ack": false,
                            "token": "eyJ0aW1lc3RhbXAiOiAxNDgwMDM2Nzc0NzU5NjQyLCAiaHR0cF9wb3J0IjogNTk5NSwgImhvc3RfaXAiOiAiMTAuODQuMzAuMjQ5In0=",
                            "type": "VMI Flow Test Alarm",
                            "description": "VMI Flow Test Alarm"
                        }
                        ]
                    },
                    "UveVMInterfaceAgent": {
                        "ip6_active": false,
                        "if_stats": {
                            "out_bytes": 895462,
                            "in_pkts": 2627,
                            "out_pkts": 2643,
                            "in_bytes": 886798
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
                                    "stddev": "40.651",
                                    "mean": "2599.83"
                                },
                                "sigma": 1.06201,
                                "algo": "EWM",
                                "samples": 47097
                            },
                            "l2_active": true,
                            "added_flows_ewm": {
                                "config": "0.1",
                                "state": {
                                    "stddev": "1.78436e-51",
                                    "mean": "2.19004e-103"
                                },
                                "sigma": -1.22736e-52,
                                "algo": "EWM",
                                "samples": 47097
                            },
                            "vm_name": "front01",
                            "out_bw_usage": 238789,
                            "deleted_flows_ewm": {
                                "config": "0.1",
                                "state": {
                                    "stddev": "1.69455e-51",
                                    "mean": "2.40519e-103"
                                },
                                "sigma": -1.41937e-52,
                                "algo": "EWM",
                                "samples": 47097
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
                            "in_bw_usage": 236479,
                            "active_flows_ewm": {
                                "config": "0.1",
                                "state": {
                                    "stddev": "8.08896e-14",
                                    "mean": "100"
                                },
                                "sigma": -1.05409,
                                "algo": "EWM",
                                "samples": 47097
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
                                    "stddev": "40.1705",
                                    "mean": "2589.95"
                                },
                                "sigma": 0.922385,
                                "algo": "EWM",
                                "samples": 47097
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
                                            "json_operand1_value": "-8.80132e-53",
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
                            "timestamp": 1480036774782390,
                            "ack": false,
                            "token": "eyJ0aW1lc3RhbXAiOiAxNDgwMDM2Nzc0NzgyMzkwLCAiaHR0cF9wb3J0IjogNTk5NSwgImhvc3RfaXAiOiAiMTAuODQuMzAuMjQ5In0=",
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
                                "stddev": "1.0114e-14",
                                "mean": "30"
                            },
                            "sigma": 1.0538,
                            "algo": "EWM",
                            "samples": 42600
                        },
                        "l2_active": true,
                        "added_flows_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "1.36368e-51",
                                "mean": "1.20022e-103"
                            },
                            "sigma": -8.80132e-53,
                            "algo": "EWM",
                            "samples": 42600
                        },
                        "vm_name": "front03",
                        "out_bw_usage": 784,
                        "deleted_flows_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "1.18091e-51",
                                "mean": "1.32361e-103"
                            },
                            "sigma": -1.12084e-52,
                            "algo": "EWM",
                            "samples": 42600
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
                            "samples": 42600
                        },
                        "admin_state": true,
                        "if_in_pkts_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "1.0114e-14",
                                "mean": "30"
                            },
                            "sigma": 1.0538,
                            "algo": "EWM",
                            "samples": 42600
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
                                            "json_operand1_value": "-1.64577e-52",
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
                            "timestamp": 1480036774748609,
                            "ack": false,
                            "token": "eyJ0aW1lc3RhbXAiOiAxNDgwMDM2Nzc0NzQ4NjA5LCAiaHR0cF9wb3J0IjogNTk5NSwgImhvc3RfaXAiOiAiMTAuODQuMzAuMjQ5In0=",
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
                                "stddev": "0.306634",
                                "mean": "30.8957"
                            },
                            "sigma": 0.340176,
                            "algo": "EWM",
                            "samples": 42602
                        },
                        "l2_active": true,
                        "added_flows_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "2.34245e-51",
                                "mean": "3.85513e-103"
                            },
                            "sigma": -1.64577e-52,
                            "algo": "EWM",
                            "samples": 42602
                        },
                        "vm_name": "front02",
                        "out_bw_usage": 795,
                        "deleted_flows_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "2.10807e-51",
                                "mean": "4.21787e-103"
                            },
                            "sigma": -2.00082e-52,
                            "algo": "EWM",
                            "samples": 42602
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
                            "samples": 42602
                        },
                        "admin_state": true,
                        "if_in_pkts_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "0.306634",
                                "mean": "30.8957"
                            },
                            "sigma": 0.340176,
                            "algo": "EWM",
                            "samples": 42602
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
    this.instancesStatMockData = {
        "data": [
        {
            "vm_uuid": "c73ed229-bbf2-4e1e-be26-4aee2d1780b3",
            "SUM(if_stats.in_bytes)": 352800,
            "SUM(if_stats.in_pkts)": 3600,
            "SUM(if_stats.out_bytes)": 352800,
            "SUM(if_stats.out_pkts)": 3600
        },
        {
            "vm_uuid": "faa5b186-5383-4670-b640-ad230fe2100f",
            "SUM(if_stats.in_bytes)": 356706,
            "SUM(if_stats.in_pkts)": 3693,
            "SUM(if_stats.out_bytes)": 356706,
            "SUM(if_stats.out_pkts)": 3693
        },
        {
            "vm_uuid": "5199c65e-8b71-4e4c-90cc-58deea9752dd",
            "SUM(if_stats.in_bytes)": 104393608,
            "SUM(if_stats.in_pkts)": 314044,
            "SUM(if_stats.out_bytes)": 104816226,
            "SUM(if_stats.out_pkts)": 314005
        }
        ],
            "total": 3,
            "queryJSON": {
                "table": "StatTable.UveVMInterfaceAgent.if_stats",
                "start_time": "now-60m",
                "end_time": "now",
                "select_fields": [
                    "SUM(if_stats.in_bytes)",
                "SUM(if_stats.out_bytes)",
                "SUM(if_stats.in_pkts)",
                "SUM(if_stats.out_pkts)",
                "vm_uuid"
                    ],
                "filter": [
                    []
                    ],
                "where": [
                    [
                    {
                        "name": "name",
                        "value": "default-domain:admin:fede15b7-548a-4dac-a7ab-c88749e4dcca",
                        "op": 1
                    }
                ],
                    [
                    {
                        "name": "name",
                        "value": "default-domain:admin:fbf56475-71dc-46dd-bf8e-0f8dc127dc82",
                        "op": 1
                    }
                ],
                    [
                    {
                        "name": "name",
                        "value": "default-domain:admin:08242801-ff6e-44d4-876d-4a001ba21862",
                        "op": 1
                    }
                ]
                    ],
                    "limit": 150000
            },
            "chunk": 1,
            "chunkSize": 3,
            "serverSideChunking": true
    };
    return {
        domainsMockData                                : domainsMockData,
        projectMockData                                : projectMockData,
        networksForAdminProjectMockData                : networksForAdminProjectMockData,
        networksMockData                               : networksMockData,
        networkSummaryForFrontEndNetworkMockData       : networkSummaryForFrontEndNetworkMockData,
        networkConnectedGraphForFrontEndNetworkMockData: networkConnectedGraphForFrontEndNetworkMockData,
        networkConfigGraphForFrontEndNetworkMockData   : networkConfigGraphForFrontEndNetworkMockData,
        flowSeriesForFrontendVNMockData                : flowSeriesForFrontendVNMockData,
        networkStatsForFrontendVNMockData              : networkStatsForFrontendVNMockData,
        virtualMachineDetailsByUUIDMockData            : virtualMachineDetailsByUUIDMockData,
        virtualMachineSummaryByUUIDMockData            : virtualMachineSummaryByUUIDMockData,
        networksMockStatData                           : networksMockStatData,
        instancesStatMockData                          : instancesStatMockData,
        portDistributionMockData                       : portDistributionMockData,
        projectConnectedGraph                          : projectConnectedGraph,
        projectConfigGraph                             : projectConfigGraph,
        virtualMachinesDetailsMockData                 : virtualMachinesDetailsMockData,
        virtualMachinesSummaryMockData                 : virtualMachinesSummaryMockData,
        virtualMachinesInterfacesMockData              : virtualMachinesInterfacesMockData,
        networkingStatsMockData                        : networkingStatsMockData,
        virtualMachinesStatsMockData                   : virtualMachinesStatsMockData,
        instancesDetailsMockData                       : instancesDetailsMockData,
        virtualMachineInterfaceList                    : virtualMachineInterfaceList,
        virtualMachineInterfaceDetails                 : virtualMachineInterfaceDetails,
        virtualMachineInterfaceStats                   : virtualMachineInterfaceStats
    };
});
