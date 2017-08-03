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
            "vm_uuid": "39b35cf1-1bdf-4238-bcc2-16653f12379a",
                "SUM(if_stats.in_bytes)": 55360578,
                "SUM(if_stats.in_pkts)": 164993,
                "SUM(if_stats.out_bytes)": 55145550,
                "SUM(if_stats.out_pkts)": 164911
        },
        {
            "vm_uuid": "7c20fb79-1a0a-49e3-b31f-d53db046264e",
            "SUM(if_stats.in_bytes)": 55145550,
            "SUM(if_stats.in_pkts)": 164911,
            "SUM(if_stats.out_bytes)": 55360578,
            "SUM(if_stats.out_pkts)": 164993
        }
        ]
    }
    ];
    this.networksDetailsMockData = {
        "data": {
            "value": [
            {
                "name": "default-domain:admin:backend",
                "value": {
                    "UveVirtualNetworkAgent": {
                        "udp_sport_bitmap": [
                            "1",
                        "0",
                        "0",
                        "0",
                        "4294418391",
                        "3187539135",
                        "4294954943",
                        "32383"
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
                                        "proxies": 97,
                                        "stitches": 0
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
                            "name": "default-domain:admin:backend:backend",
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
                            "diag_packet_count": 0
                        }
                        ],
                            "total_acl_rules": 4,
                            "in_bandwidth_usage": 240024,
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
                                "in_bytes": 0,
                                "other_vn": "default-domain:admin:backend",
                                "out_bytes": 0,
                                "out_tpkts": 0,
                                "in_tpkts": 0,
                                "vrouter": "a7s12"
                            },
                            {
                                "in_bytes": 870090,
                                "other_vn": "default-domain:admin:frontend",
                                "out_bytes": 881916,
                                "out_tpkts": 2606,
                                "in_tpkts": 2593,
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
                                "bytes": 5402,
                                "other_vn": "__UNKNOWN__",
                                "tpkts": 73
                            },
                            {
                                "bytes": 34483,
                                "other_vn": "default-domain:admin:backend",
                                "tpkts": 405
                            },
                            {
                                "bytes": 40853902268,
                                "other_vn": "default-domain:admin:frontend",
                                "tpkts": 121984396
                            },
                            {
                                "bytes": 13780,
                                "other_vn": "default-domain:default-project:ip-fabric",
                                "tpkts": 153
                            }
                        ],
                            "policy_rule_stats": [
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
                                "rule": "62bea881-acd9-4f37-ab6e-330080cdef79"
                            }
                        ],
                            "egress_flow_count": 100,
                            "udp_dport_bitmap": [
                                "1",
                            "0",
                            "0",
                            "0",
                            "4294418391",
                            "3187539135",
                            "4294954943",
                            "32383"
                                ],
                            "associated_fip_count": 0,
                            "out_stats": [
                            {
                                "bytes": 0,
                                "other_vn": "__UNKNOWN__",
                                "tpkts": 0
                            },
                            {
                                "bytes": 34483,
                                "other_vn": "default-domain:admin:backend",
                                "tpkts": 405
                            },
                            {
                                "bytes": 40853500540,
                                "other_vn": "default-domain:admin:frontend",
                                "tpkts": 122007896
                            },
                            {
                                "bytes": 10959,
                                "other_vn": "default-domain:default-project:ip-fabric",
                                "tpkts": 145
                            }
                        ],
                            "virtualmachine_list": [
                                "a14fa2f3-6240-41a7-8dd1-d72018a1b1db"
                                ],
                            "tcp_sport_bitmap": [
                                "2147483649",
                            "8",
                            "0",
                            "0",
                            "10519040",
                            "100702336",
                            "3423764836",
                            "24"
                                ],
                            "interface_list": [
                                "default-domain:admin:cdbc2eb3-b2e1-4a27-b9fc-eda692f2ea06"
                                ],
                            "acl": "default-domain:admin:backend:backend",
                            "tcp_dport_bitmap": [
                                "1",
                            "8",
                            "0",
                            "0",
                            "10519040",
                            "100702336",
                            "3423764836",
                            "24"
                                ],
                            "ingress_flow_count": 100,
                            "out_bandwidth_usage": 243287
                    },
                    "RoutingInstanceStatsData": {
                        "ermvpn_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:backend:backend\"": {
                                "prefixes": 2,
                                "total_paths": 2,
                                "primary_paths": 2,
                                "infeasible_paths": 0,
                                "secondary_paths": 0
                            }
                        },
                        "evpn_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:backend:backend\"": {
                                "prefixes": 4,
                                "total_paths": 4,
                                "primary_paths": 4,
                                "infeasible_paths": 0,
                                "secondary_paths": 0
                            }
                        },
                        "ipv4_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:backend:backend\"": {
                                "prefixes": 5,
                                "total_paths": 5,
                                "primary_paths": 1,
                                "infeasible_paths": 0,
                                "secondary_paths": 4
                            }
                        }
                    },
                    "ContrailConfig": {
                        "deleted": false,
                        "elements": {
                            "display_name": "\"backend\"",
                            "virtual_network_network_id": "4",
                            "network_policy_refs": "[{\"to\": [\"default-domain\", \"admin\", \"f2b-allow-policy\"], \"attr\": {\"timer\": null, \"sequence\": {\"major\": 0, \"minor\": 0}}, \"uuid\": \"7ec7a888-84c9-4f72-8fa8-5aadf45275c8\"}]",
                            "router_external": "false",
                            "parent_uuid": "\"6f6f5981-515c-4d64-ac1b-1135b0ccdd1f\"",
                            "parent_type": "\"project\"",
                            "uuid": "\"b1a19e41-31a2-455a-93e6-95426f9f694d\"",
                            "perms2": "{\"owner\": \"a6c92d95076d49b6b57820159c5480f6\", \"owner_access\": 7, \"global_access\": 0, \"share\": []}",
                            "flood_unknown_unicast": "false",
                            "id_perms": "{\"enable\": true, \"description\": null, \"created\": \"2016-10-27T21:08:24.513392\", \"creator\": null, \"uuid\": {\"uuid_mslong\": 12799685618806441306, \"uuid_lslong\": 10657369680791955789}, \"user_visible\": true, \"last_modified\": \"2016-10-27T21:09:02.730792\", \"permissions\": {\"owner\": \"neutron\", \"owner_access\": 7, \"other_access\": 7, \"group\": \"admin\", \"group_access\": 7}}",
                            "fq_name": "[\"default-domain\", \"admin\", \"backend\"]",
                            "network_ipam_refs": "[{\"to\": [\"default-domain\", \"default-project\", \"default-network-ipam\"], \"attr\": {\"ipam_subnets\": [{\"subnet\": {\"ip_prefix\": \"10.2.1.0\", \"ip_prefix_len\": 24}, \"dns_server_address\": \"10.2.1.2\", \"enable_dhcp\": true, \"default_gateway\": \"10.2.1.1\", \"dns_nameservers\": [], \"dhcp_option_list\": null, \"subnet_uuid\": \"25bbb047-ebf8-4beb-a665-d81c06e0b238\", \"alloc_unit\": 1, \"host_routes\": null, \"addr_from_start\": true, \"subnet_name\": \"\", \"allocation_pools\": []}], \"host_routes\": null}, \"uuid\": \"c4cad97e-1a90-407f-b944-a6cd7fd10747\"}]",
                            "is_shared": "false"
                        }
                    },
                    "UveVirtualNetworkConfig": {
                        "total_acl_rules": 4,
                        "routing_instance_list": [
                            "default-domain:admin:backend:backend"
                            ],
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
                                        "proxies": 360,
                                        "stitches": 18253
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
                            "in_bandwidth_usage": 244909,
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
                                "in_bytes": 881916,
                                "other_vn": "default-domain:admin:backend",
                                "out_bytes": 870090,
                                "out_tpkts": 2593,
                                "in_tpkts": 2606,
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
                                "bytes": 14298,
                                "other_vn": "__UNKNOWN__",
                                "tpkts": 194
                            },
                            {
                                "bytes": 40853500540,
                                "other_vn": "default-domain:admin:backend",
                                "tpkts": 122007896
                            },
                            {
                                "bytes": 121339300,
                                "other_vn": "default-domain:admin:frontend",
                                "tpkts": 1236482
                            },
                            {
                                "bytes": 40152,
                                "other_vn": "default-domain:default-project:ip-fabric",
                                "tpkts": 441
                            }
                        ],
                            "policy_rule_stats": [
                            {
                                "count": 4,
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
                                "bytes": 40853902268,
                                "other_vn": "default-domain:admin:backend",
                                "tpkts": 121984396
                            },
                            {
                                "bytes": 121339300,
                                "other_vn": "default-domain:admin:frontend",
                                "tpkts": 1236482
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
                            "out_bandwidth_usage": 241646
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
            },
            {
                "name": "default-domain:admin:snat-si-left_snat_30c8d029-0df3-4646-b17f-f5f285bf141e_2824f3fa-602e-4b6f-8c12-5772fcd29702",
                "value": {
                    "RoutingInstanceStatsData": {
                        "ipv6_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:snat-si-left_snat_30c8d029-0df3-4646-b17f-f5f285bf141e_2824f3fa-602e-4b6f-8c12-5772fcd29702:snat-si-left_snat_30c8d029-0df3-4646-b17f-f5f285bf141e_2824f3fa-602e-4b6f-8c12-5772fcd29702\"": {
                                "prefixes": 0,
                                "total_paths": 0,
                                "primary_paths": 0,
                                "infeasible_paths": 0,
                                "secondary_paths": 0
                            }
                        },
                        "ermvpn_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:snat-si-left_snat_30c8d029-0df3-4646-b17f-f5f285bf141e_2824f3fa-602e-4b6f-8c12-5772fcd29702:snat-si-left_snat_30c8d029-0df3-4646-b17f-f5f285bf141e_2824f3fa-602e-4b6f-8c12-5772fcd29702\"": {
                                "prefixes": 2,
                                "total_paths": 2,
                                "primary_paths": 2,
                                "infeasible_paths": 0,
                                "secondary_paths": 0
                            }
                        },
                        "evpn_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:snat-si-left_snat_30c8d029-0df3-4646-b17f-f5f285bf141e_2824f3fa-602e-4b6f-8c12-5772fcd29702:snat-si-left_snat_30c8d029-0df3-4646-b17f-f5f285bf141e_2824f3fa-602e-4b6f-8c12-5772fcd29702\"": {
                                "prefixes": 4,
                                "total_paths": 4,
                                "primary_paths": 4,
                                "infeasible_paths": 0,
                                "secondary_paths": 0
                            }
                        },
                        "ipv4_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:snat-si-left_snat_30c8d029-0df3-4646-b17f-f5f285bf141e_2824f3fa-602e-4b6f-8c12-5772fcd29702:snat-si-left_snat_30c8d029-0df3-4646-b17f-f5f285bf141e_2824f3fa-602e-4b6f-8c12-5772fcd29702\"": {
                                "prefixes": 2,
                                "total_paths": 2,
                                "primary_paths": 2,
                                "infeasible_paths": 0,
                                "secondary_paths": 0
                            }
                        }
                    }
                }
            },
            {
                "name": "default-domain:admin:snat-si-left_snat_c7ba5140-5cdc-4484-bcdf-2ff53ef97040_0b4939a6-e690-4f2f-9c48-0152b46a70a2",
                "value": {
                    "RoutingInstanceStatsData": {
                        "ipv6_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:snat-si-left_snat_c7ba5140-5cdc-4484-bcdf-2ff53ef97040_0b4939a6-e690-4f2f-9c48-0152b46a70a2:snat-si-left_snat_c7ba5140-5cdc-4484-bcdf-2ff53ef97040_0b4939a6-e690-4f2f-9c48-0152b46a70a2\"": {
                                "prefixes": 0,
                                "total_paths": 0,
                                "primary_paths": 0,
                                "infeasible_paths": 0,
                                "secondary_paths": 0
                            }
                        },
                        "ermvpn_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:snat-si-left_snat_c7ba5140-5cdc-4484-bcdf-2ff53ef97040_0b4939a6-e690-4f2f-9c48-0152b46a70a2:snat-si-left_snat_c7ba5140-5cdc-4484-bcdf-2ff53ef97040_0b4939a6-e690-4f2f-9c48-0152b46a70a2\"": {
                                "prefixes": 2,
                                "total_paths": 2,
                                "primary_paths": 2,
                                "infeasible_paths": 0,
                                "secondary_paths": 0
                            }
                        },
                        "evpn_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:snat-si-left_snat_c7ba5140-5cdc-4484-bcdf-2ff53ef97040_0b4939a6-e690-4f2f-9c48-0152b46a70a2:snat-si-left_snat_c7ba5140-5cdc-4484-bcdf-2ff53ef97040_0b4939a6-e690-4f2f-9c48-0152b46a70a2\"": {
                                "prefixes": 4,
                                "total_paths": 4,
                                "primary_paths": 4,
                                "infeasible_paths": 0,
                                "secondary_paths": 0
                            }
                        },
                        "ipv4_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:snat-si-left_snat_c7ba5140-5cdc-4484-bcdf-2ff53ef97040_0b4939a6-e690-4f2f-9c48-0152b46a70a2:snat-si-left_snat_c7ba5140-5cdc-4484-bcdf-2ff53ef97040_0b4939a6-e690-4f2f-9c48-0152b46a70a2\"": {
                                "prefixes": 2,
                                "total_paths": 4,
                                "primary_paths": 2,
                                "infeasible_paths": 0,
                                "secondary_paths": 2
                            }
                        }
                    }
                }
            },
            {
                "name": "default-domain:admin:testvn_nitishk",
                "value": {
                    "UveVirtualNetworkAgent": {
                        "policy_rule_stats": [
                        {
                            "count": 0,
                            "rule": "00000000-0000-0000-0000-000000000001"
                        },
                        {
                            "count": 6,
                            "rule": "00000000-0000-0000-0000-000000000004"
                        }
                        ],
                            "vrf_stats_list": [
                            {
                                "offload_packet_counts": {
                                    "gro": 0
                                },
                                "unknown_unicast_floods": 0,
                                "arp_packet_counts": {
                                    "from_vm_interface": {
                                        "stats": {
                                            "floods": 472529,
                                            "proxies": 0,
                                            "stitches": 50389
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
                                "name": "default-domain:admin:testvn_nitishk:testvn_nitishk",
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
                                "diag_packet_count": 0
                            }
                        ],
                            "total_acl_rules": 0,
                            "out_bandwidth_usage": 139,
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
                                "in_bytes": 0,
                                "other_vn": "default-domain:admin:testvn_nitishk",
                                "out_bytes": 0,
                                "out_tpkts": 0,
                                "in_tpkts": 0,
                                "vrouter": "a7s12"
                            },
                            {
                                "in_bytes": 0,
                                "other_vn": "default-domain:default-project:ip-fabric",
                                "out_bytes": 504,
                                "out_tpkts": 6,
                                "in_tpkts": 0,
                                "vrouter": "a7s12"
                            }
                        ],
                            "in_stats": [
                            {
                                "bytes": 3724,
                                "other_vn": "__UNKNOWN__",
                                "tpkts": 38
                            },
                            {
                                "bytes": 167536292,
                                "other_vn": "default-domain:admin:testvn_nitishk",
                                "tpkts": 1709554
                            },
                            {
                                "bytes": 0,
                                "other_vn": "default-domain:default-project:ip-fabric",
                                "tpkts": 0
                            }
                        ],
                            "egress_flow_count": 41,
                            "acl": null,
                            "associated_fip_count": 1,
                            "virtualmachine_list": [
                                "06c75bb2-e17b-4ccd-b00c-aa59fdaecb55",
                            "e0219ad7-3212-4e30-abfc-212e4a888538"
                                ],
                            "out_stats": [
                            {
                                "bytes": 0,
                                "other_vn": "__UNKNOWN__",
                                "tpkts": 0
                            },
                            {
                                "bytes": 167536292,
                                "other_vn": "default-domain:admin:testvn_nitishk",
                                "tpkts": 1709554
                            },
                            {
                                "bytes": 7036874429222488,
                                "other_vn": "default-domain:default-project:ip-fabric",
                                "tpkts": 7696581530850
                            }
                        ],
                            "interface_list": [
                                "default-domain:admin:8ab38e5b-768b-44f6-8883-08d1670ddfec",
                            "default-domain:admin:c43d910c-bafa-4428-bba8-530cdfa94326"
                                ],
                            "mirror_acl": null,
                            "ingress_flow_count": 40,
                            "in_bandwidth_usage": 0
                    },
                    "RoutingInstanceStatsData": {
                        "ermvpn_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:testvn_nitishk:testvn_nitishk\"": {
                                "prefixes": 2,
                                "total_paths": 2,
                                "primary_paths": 2,
                                "infeasible_paths": 0,
                                "secondary_paths": 0
                            }
                        },
                        "evpn_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:testvn_nitishk:testvn_nitishk\"": {
                                "prefixes": 4,
                                "total_paths": 4,
                                "primary_paths": 4,
                                "infeasible_paths": 0,
                                "secondary_paths": 0
                            }
                        },
                        "ipv4_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:testvn_nitishk:testvn_nitishk\"": {
                                "prefixes": 1,
                                "total_paths": 1,
                                "primary_paths": 1,
                                "infeasible_paths": 0,
                                "secondary_paths": 0
                            }
                        }
                    },
                    "ContrailConfig": {
                        "deleted": false,
                        "elements": {
                            "parent_uuid": "\"6f6f5981-515c-4d64-ac1b-1135b0ccdd1f\"",
                            "parent_type": "\"project\"",
                            "route_target_list": "{\"route_target\": []}",
                            "fq_name": "[\"default-domain\", \"admin\", \"testvn_nitishk\"]",
                            "virtual_network_network_id": "5",
                            "id_perms": "{\"enable\": true, \"description\": null, \"created\": \"2016-10-27T21:21:48.565953\", \"creator\": null, \"uuid\": {\"uuid_mslong\": 3425050546377281251, \"uuid_lslong\": 11794149931587230916}, \"user_visible\": true, \"last_modified\": \"2016-11-17T21:43:11.674001\", \"permissions\": {\"owner\": \"neutron\", \"owner_access\": 7, \"other_access\": 7, \"group\": \"admin\", \"group_access\": 7}}",
                            "instance_ip_back_refs": "[{\"to\": [\"309e8778-fdbe-43b5-b3b2-65d1a05bbe51\"], \"attr\": null, \"uuid\": \"309e8778-fdbe-43b5-b3b2-65d1a05bbe51\"}, {\"to\": [\"74f6ba43-d347-449f-800d-55f7334b0c9c\"], \"attr\": null, \"uuid\": \"74f6ba43-d347-449f-800d-55f7334b0c9c\"}]",
                            "multi_policy_service_chains_enabled": "false",
                            "floating_ip_pools": "[{\"to\": [\"default-domain\", \"admin\", \"testvn_nitishk\", \"pool1\"], \"uuid\": \"dbcebdd1-2d44-4885-b39a-b85283347243\"}]",
                            "virtual_network_properties": "{\"allow_transit\": false, \"mirror_destination\": false, \"rpf\": \"enable\"}",
                            "ecmp_hashing_include_fields": "{}",
                            "virtual_machine_interface_back_refs": "[{\"to\": [\"default-domain\", \"admin\", \"c43d910c-bafa-4428-bba8-530cdfa94326\"], \"attr\": null, \"uuid\": \"c43d910c-bafa-4428-bba8-530cdfa94326\"}, {\"to\": [\"default-domain\", \"admin\", \"8ab38e5b-768b-44f6-8883-08d1670ddfec\"], \"attr\": null, \"uuid\": \"8ab38e5b-768b-44f6-8883-08d1670ddfec\"}]",
                            "provider_properties": "null",
                            "perms2": "{\"owner\": \"a6c92d95076d49b6b57820159c5480f6\", \"owner_access\": 7, \"global_access\": 0, \"share\": []}",
                            "display_name": "\"testvn_nitishk\"",
                            "routing_instances": "[{\"to\": [\"default-domain\", \"admin\", \"testvn_nitishk\", \"testvn_nitishk\"], \"uuid\": \"d5852651-0572-4a3b-8cf3-492b41314845\"}]",
                            "uuid": "\"2f883953-4293-4ee3-a3ad-3cdfebf45cc4\"",
                            "import_route_target_list": "{\"route_target\": []}",
                            "is_shared": "false",
                            "router_external": "false",
                            "export_route_target_list": "{\"route_target\": []}",
                            "flood_unknown_unicast": "false",
                            "network_ipam_refs": "[{\"to\": [\"default-domain\", \"default-project\", \"default-network-ipam\"], \"attr\": {\"ipam_subnets\": [{\"subnet\": {\"ip_prefix\": \"30.30.31.0\", \"ip_prefix_len\": 24}, \"addr_from_start\": true, \"enable_dhcp\": true, \"default_gateway\": \"30.30.31.1\", \"dns_nameservers\": [], \"subnet_uuid\": \"4208f440-b446-4ce5-a29f-0042eeeea722\", \"alloc_unit\": 1, \"subnet_name\": \"test_sub_nitishk\", \"dns_server_address\": \"30.30.31.2\"}]}, \"uuid\": \"c4cad97e-1a90-407f-b944-a6cd7fd10747\"}]"
                        }
                    },
                    "UveVirtualNetworkConfig": {
                        "total_acl_rules": 0,
                        "routing_instance_list": [
                            "default-domain:admin:testvn_nitishk:testvn_nitishk"
                            ]
                    }
                }
            },
            {
                "name": "default-domain:admin:vn1",
                "value": {
                    "RoutingInstanceStatsData": {
                        "ipv6_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:vn1:vn1\"": {
                                "prefixes": 0,
                                "total_paths": 0,
                                "primary_paths": 0,
                                "infeasible_paths": 0,
                                "secondary_paths": 0
                            }
                        },
                        "ermvpn_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:vn1:vn1\"": {
                                "prefixes": 0,
                                "total_paths": 0,
                                "primary_paths": 0,
                                "infeasible_paths": 0,
                                "secondary_paths": 0
                            }
                        },
                        "evpn_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:vn1:vn1\"": {
                                "prefixes": 0,
                                "total_paths": 0,
                                "primary_paths": 0,
                                "infeasible_paths": 0,
                                "secondary_paths": 0
                            }
                        },
                        "ipv4_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:vn1:vn1\"": {
                                "prefixes": 0,
                                "total_paths": 0,
                                "primary_paths": 0,
                                "infeasible_paths": 0,
                                "secondary_paths": 0
                            }
                        }
                    },
                    "ContrailConfig": {
                        "deleted": false,
                        "elements": {
                            "parent_uuid": "\"6f6f5981-515c-4d64-ac1b-1135b0ccdd1f\"",
                            "parent_type": "\"project\"",
                            "route_target_list": "{\"route_target\": []}",
                            "display_name": "\"vn1\"",
                            "virtual_network_network_id": "6",
                            "id_perms": "{\"enable\": true, \"description\": null, \"creator\": null, \"created\": \"2016-11-11T01:13:47.664107\", \"user_visible\": true, \"last_modified\": \"2016-11-12T02:01:12.781131\", \"permissions\": {\"owner\": \"admin\", \"owner_access\": 7, \"other_access\": 7, \"group\": \"admin\", \"group_access\": 7}, \"uuid\": {\"uuid_mslong\": 14317338333347464982, \"uuid_lslong\": 9592022520133782625}}",
                            "logical_router_back_refs": "[{\"to\": [\"default-domain\", \"admin\", \"rtr1\"], \"attr\": null, \"uuid\": \"c7ba5140-5cdc-4484-bcdf-2ff53ef97040\"}]",
                            "instance_ip_back_refs": "[{\"to\": [\"default-domain__admin__snat_c7ba5140-5cdc-4484-bcdf-2ff53ef97040_0b4939a6-e690-4f2f-9c48-0152b46a70a2-right\"], \"attr\": null, \"uuid\": \"4b083132-c795-472e-a4df-a0eea95d351e\"}]",
                            "multi_policy_service_chains_enabled": "false",
                            "floating_ip_pools": "[{\"to\": [\"default-domain\", \"admin\", \"vn1\", \"default\"], \"uuid\": \"dd265c76-439f-475f-ad4a-336af35f3157\"}]",
                            "virtual_network_properties": "{\"allow_transit\": false, \"mirror_destination\": false, \"rpf\": \"enable\"}",
                            "ecmp_hashing_include_fields": "{}",
                            "network_policy_refs": "[{\"to\": [\"default-domain\", \"admin\", \"test\"], \"attr\": {\"timer\": null, \"sequence\": {\"major\": 0, \"minor\": 0}}, \"uuid\": \"c8e8d8e2-c10f-4cd4-8055-407a91790f55\"}, {\"to\": [\"default-domain\", \"admin\", \"vn1vn3\"], \"attr\": {\"timer\": null, \"sequence\": {\"major\": 1, \"minor\": 0}}, \"uuid\": \"042cd5f2-46a4-4dd5-82d3-4c2326549def\"}]",
                            "virtual_machine_interface_back_refs": "[{\"to\": [\"default-domain\", \"admin\", \"default-domain__admin__snat_c7ba5140-5cdc-4484-bcdf-2ff53ef97040_0b4939a6-e690-4f2f-9c48-0152b46a70a2__1__right__1\"], \"attr\": null, \"uuid\": \"37ecee1e-2e0c-4b70-968f-461c68c70467\"}, {\"to\": [\"default-domain\", \"admin\", \"default-domain__admin__snat_c7ba5140-5cdc-4484-bcdf-2ff53ef97040_0b4939a6-e690-4f2f-9c48-0152b46a70a2__2__right__1\"], \"attr\": null, \"uuid\": \"d590aebc-3e4b-42a3-941f-915a82256106\"}]",
                            "provider_properties": "null",
                            "perms2": "{\"owner\": \"6f6f5981515c4d64ac1b1135b0ccdd1f\", \"owner_access\": 7, \"global_access\": 0, \"share\": []}",
                            "fq_name": "[\"default-domain\", \"admin\", \"vn1\"]",
                            "routing_instances": "[{\"to\": [\"default-domain\", \"admin\", \"vn1\", \"vn1\"], \"uuid\": \"6932042f-051f-4d4a-a84a-9d1c2a0d6b17\"}]",
                            "uuid": "\"c6b1675b-9042-4716-851d-b5a94e1f0c61\"",
                            "import_route_target_list": "{\"route_target\": []}",
                            "is_shared": "false",
                            "access_control_lists": "[{\"to\": [\"default-domain\", \"admin\", \"vn1\", \"vn1\"], \"uuid\": \"1bb07c14-4ddb-4402-aed1-049c2f13de7a\"}]",
                            "router_external": "true",
                            "export_route_target_list": "{\"route_target\": []}",
                            "flood_unknown_unicast": "false",
                            "network_ipam_refs": "[{\"to\": [\"default-domain\", \"default-project\", \"default-network-ipam\"], \"attr\": {\"ipam_subnets\": [{\"subnet\": {\"ip_prefix\": \"80.1.1.0\", \"ip_prefix_len\": 24}, \"addr_from_start\": true, \"enable_dhcp\": true, \"default_gateway\": \"80.1.1.1\", \"subnet_uuid\": \"b44430e8-30e7-448b-8f18-d2f04b0493b7\", \"subnet_name\": \"b44430e8-30e7-448b-8f18-d2f04b0493b7\", \"dns_server_address\": \"80.1.1.2\"}]}, \"uuid\": \"c4cad97e-1a90-407f-b944-a6cd7fd10747\"}]"
                        }
                    },
                    "UveVirtualNetworkConfig": {
                        "total_acl_rules": 6,
                        "routing_instance_list": [
                            "default-domain:admin:vn1:vn1"
                            ],
                        "connected_networks": [
                            "default-domain:admin:vn3",
                        "default-domain:admin:vn2"
                            ]
                    }
                }
            },
            {
                "name": "default-domain:admin:vn2",
                "value": {
                    "RoutingInstanceStatsData": {
                        "ipv6_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:vn2:vn2\"": {
                                "prefixes": 0,
                                "total_paths": 0,
                                "primary_paths": 0,
                                "infeasible_paths": 0,
                                "secondary_paths": 0
                            }
                        },
                        "ermvpn_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:vn2:vn2\"": {
                                "prefixes": 0,
                                "total_paths": 0,
                                "primary_paths": 0,
                                "infeasible_paths": 0,
                                "secondary_paths": 0
                            }
                        },
                        "evpn_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:vn2:vn2\"": {
                                "prefixes": 0,
                                "total_paths": 0,
                                "primary_paths": 0,
                                "infeasible_paths": 0,
                                "secondary_paths": 0
                            }
                        },
                        "ipv4_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:vn2:vn2\"": {
                                "prefixes": 0,
                                "total_paths": 0,
                                "primary_paths": 0,
                                "infeasible_paths": 0,
                                "secondary_paths": 0
                            }
                        }
                    },
                    "ContrailConfig": {
                        "deleted": false,
                        "elements": {
                            "parent_uuid": "\"6f6f5981-515c-4d64-ac1b-1135b0ccdd1f\"",
                            "parent_type": "\"project\"",
                            "route_target_list": "{\"route_target\": []}",
                            "display_name": "\"vn2\"",
                            "virtual_network_network_id": "7",
                            "id_perms": "{\"enable\": true, \"description\": null, \"created\": \"2016-11-11T01:13:56.938346\", \"creator\": null, \"uuid\": {\"uuid_mslong\": 8164795293299854487, \"uuid_lslong\": 13472760850406397852}, \"user_visible\": true, \"last_modified\": \"2016-11-12T01:57:43.668859\", \"permissions\": {\"owner\": \"admin\", \"owner_access\": 7, \"other_access\": 7, \"group\": \"admin\", \"group_access\": 7}}",
                            "instance_ip_back_refs": "[{\"to\": [\"9d7a338e-56a7-4a71-bda6-d433cdf65683\"], \"attr\": null, \"uuid\": \"9d7a338e-56a7-4a71-bda6-d433cdf65683\"}]",
                            "multi_policy_service_chains_enabled": "false",
                            "virtual_network_properties": "{\"allow_transit\": false, \"mirror_destination\": false, \"rpf\": \"enable\"}",
                            "ecmp_hashing_include_fields": "{}",
                            "network_policy_refs": "[{\"to\": [\"default-domain\", \"admin\", \"test\"], \"attr\": {\"timer\": null, \"sequence\": {\"major\": 0, \"minor\": 0}}, \"uuid\": \"c8e8d8e2-c10f-4cd4-8055-407a91790f55\"}]",
                            "virtual_machine_interface_back_refs": "[{\"to\": [\"default-domain\", \"admin\", \"ccffb471-4e32-4664-af8e-1a38f285a40f\"], \"attr\": null, \"uuid\": \"ccffb471-4e32-4664-af8e-1a38f285a40f\"}]",
                            "provider_properties": "null",
                            "perms2": "{\"owner\": \"6f6f5981515c4d64ac1b1135b0ccdd1f\", \"owner_access\": 7, \"global_access\": 0, \"share\": []}",
                            "fq_name": "[\"default-domain\", \"admin\", \"vn2\"]",
                            "routing_instances": "[{\"to\": [\"default-domain\", \"admin\", \"vn2\", \"vn2\"], \"uuid\": \"55a4f543-cbca-4b9e-8b5a-df2c83e3f9c9\"}]",
                            "uuid": "\"714f2e0f-70eb-4c97-baf8-dc9c9843579c\"",
                            "import_route_target_list": "{\"route_target\": []}",
                            "is_shared": "false",
                            "router_external": "false",
                            "export_route_target_list": "{\"route_target\": []}",
                            "flood_unknown_unicast": "false",
                            "network_ipam_refs": "[{\"to\": [\"default-domain\", \"default-project\", \"default-network-ipam\"], \"attr\": {\"ipam_subnets\": [{\"subnet\": {\"ip_prefix\": \"80.1.2.0\", \"ip_prefix_len\": 24}, \"addr_from_start\": true, \"enable_dhcp\": true, \"default_gateway\": \"80.1.2.1\", \"subnet_uuid\": \"804640c1-c699-42b0-8163-e29b6ebe7aaf\", \"subnet_name\": \"804640c1-c699-42b0-8163-e29b6ebe7aaf\", \"dns_server_address\": \"80.1.2.2\"}]}, \"uuid\": \"c4cad97e-1a90-407f-b944-a6cd7fd10747\"}]"
                        }
                    },
                    "UveVirtualNetworkConfig": {
                        "total_acl_rules": 4,
                        "routing_instance_list": [
                            "default-domain:admin:vn2:vn2"
                            ],
                        "connected_networks": [
                            "default-domain:admin:vn1"
                            ]
                    }
                }
            },
            {
                "name": "default-domain:admin:vn3",
                "value": {
                    "RoutingInstanceStatsData": {
                        "ipv6_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:vn3:vn3\"": {
                                "prefixes": 0,
                                "total_paths": 0,
                                "primary_paths": 0,
                                "infeasible_paths": 0,
                                "secondary_paths": 0
                            }
                        },
                        "ermvpn_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:vn3:vn3\"": {
                                "prefixes": 0,
                                "total_paths": 0,
                                "primary_paths": 0,
                                "infeasible_paths": 0,
                                "secondary_paths": 0
                            }
                        },
                        "evpn_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:vn3:vn3\"": {
                                "prefixes": 0,
                                "total_paths": 0,
                                "primary_paths": 0,
                                "infeasible_paths": 0,
                                "secondary_paths": 0
                            }
                        },
                        "ipv4_stats": {
                            "a7s12:Control:contrail-control:0:\"default-domain:admin:vn3:vn3\"": {
                                "prefixes": 0,
                                "total_paths": 0,
                                "primary_paths": 0,
                                "infeasible_paths": 0,
                                "secondary_paths": 0
                            }
                        }
                    },
                    "ContrailConfig": {
                        "deleted": false,
                        "elements": {
                            "parent_uuid": "\"6f6f5981-515c-4d64-ac1b-1135b0ccdd1f\"",
                            "parent_type": "\"project\"",
                            "route_target_list": "{\"route_target\": []}",
                            "display_name": "\"vn3\"",
                            "virtual_network_network_id": "8",
                            "id_perms": "{\"enable\": true, \"description\": null, \"creator\": null, \"created\": \"2016-11-11T01:15:56.729527\", \"user_visible\": true, \"last_modified\": \"2016-11-12T02:01:02.106901\", \"permissions\": {\"owner\": \"admin\", \"owner_access\": 7, \"other_access\": 7, \"group\": \"admin\", \"group_access\": 7}, \"uuid\": {\"uuid_mslong\": 8541015613818095468, \"uuid_lslong\": 11347687702080964871}}",
                            "instance_ip_back_refs": "[{\"to\": [\"05c413d5-f04d-4092-890b-8f2f869acf14\"], \"attr\": null, \"uuid\": \"05c413d5-f04d-4092-890b-8f2f869acf14\"}]",
                            "multi_policy_service_chains_enabled": "false",
                            "virtual_network_properties": "{\"allow_transit\": false, \"mirror_destination\": false, \"rpf\": \"enable\"}",
                            "ecmp_hashing_include_fields": "{}",
                            "network_policy_refs": "[{\"to\": [\"default-domain\", \"admin\", \"vn1vn3\"], \"attr\": {\"timer\": null, \"sequence\": {\"major\": 0, \"minor\": 0}}, \"uuid\": \"042cd5f2-46a4-4dd5-82d3-4c2326549def\"}]",
                            "virtual_machine_interface_back_refs": "[{\"to\": [\"default-domain\", \"admin\", \"68312b1c-3849-4c7b-a420-5c3c89e2a6c0\"], \"attr\": null, \"uuid\": \"68312b1c-3849-4c7b-a420-5c3c89e2a6c0\"}]",
                            "provider_properties": "null",
                            "perms2": "{\"owner\": \"6f6f5981515c4d64ac1b1135b0ccdd1f\", \"owner_access\": 7, \"global_access\": 0, \"share\": []}",
                            "fq_name": "[\"default-domain\", \"admin\", \"vn3\"]",
                            "routing_instances": "[{\"to\": [\"default-domain\", \"admin\", \"vn3\", \"vn3\"], \"uuid\": \"e46aefc6-b2ce-4299-a2ae-f144f64a01b0\"}]",
                            "uuid": "\"7687c872-d2b1-476c-9d7b-15d7a89ac907\"",
                            "import_route_target_list": "{\"route_target\": []}",
                            "is_shared": "false",
                            "router_external": "false",
                            "export_route_target_list": "{\"route_target\": []}",
                            "flood_unknown_unicast": "false",
                            "network_ipam_refs": "[{\"to\": [\"default-domain\", \"default-project\", \"default-network-ipam\"], \"attr\": {\"ipam_subnets\": [{\"subnet\": {\"ip_prefix\": \"80.1.3.0\", \"ip_prefix_len\": 24}, \"addr_from_start\": true, \"enable_dhcp\": true, \"default_gateway\": \"80.1.3.1\", \"subnet_uuid\": \"14ed1a2c-7afc-4b95-ae63-bf9e795afb61\", \"subnet_name\": \"14ed1a2c-7afc-4b95-ae63-bf9e795afb61\", \"dns_server_address\": \"80.1.3.2\"}]}, \"uuid\": \"c4cad97e-1a90-407f-b944-a6cd7fd10747\"}]"
                        }
                    },
                    "UveVirtualNetworkConfig": {
                        "total_acl_rules": 4,
                        "routing_instance_list": [
                            "default-domain:admin:vn3:vn3"
                            ],
                        "connected_networks": [
                            "default-domain:admin:vn1"
                            ]
                    }
                }
            }
            ]
        },
        "lastKey": null,
        "more": false
    };
    this.instancesDetailsMockData = {
        "data": {
            "value": [
            {
                "name": "06c75bb2-e17b-4ccd-b00c-aa59fdaecb55",
                "value": {
                    "VirtualMachineStats": {
                        "cpu_stats": [
                        {
                            "virt_memory": 1940504,
                            "cpu_one_min_avg": 4.66667,
                            "disk_used_bytes": 1581056,
                            "vm_memory_quota": 524288,
                            "peak_virt_memory": 2089044,
                            "disk_allocated_bytes": 1073741824,
                            "rss": 51280
                        }
                        ]
                    },
                    "UveVirtualMachineAgent": {
                        "vm_name": "vm100",
                        "cpu_info": {
                            "virt_memory": 1940504,
                            "cpu_one_min_avg": 4.66667,
                            "disk_used_bytes": 1581056,
                            "vm_memory_quota": 524288,
                            "peak_virt_memory": 2089044,
                            "disk_allocated_bytes": 1073741824,
                            "rss": 51280
                        },
                        "interface_list": [
                            "default-domain:admin:8ab38e5b-768b-44f6-8883-08d1670ddfec"
                            ],
                        "uuid": "06c75bb2-e17b-4ccd-b00c-aa59fdaecb55",
                        "vrouter": "a7s12"
                    }
                }
            },
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
                            "rss": 288200
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
                            "rss": 288200
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
                "name": "a14fa2f3-6240-41a7-8dd1-d72018a1b1db",
                "value": {
                    "VirtualMachineStats": {
                        "cpu_stats": [
                        {
                            "virt_memory": 4677044,
                            "cpu_one_min_avg": 1.33333,
                            "disk_used_bytes": 1308307456,
                            "vm_memory_quota": 2097152,
                            "peak_virt_memory": 5171916,
                            "disk_allocated_bytes": 4294967295,
                            "rss": 284184
                        }
                        ]
                    },
                    "UveVirtualMachineAgent": {
                        "udp_sport_bitmap": [
                            "0",
                        "0",
                        "0",
                        "0",
                        "4294418391",
                        "3187539135",
                        "4294954943",
                        "32383"
                            ],
                        "vm_name": "back01",
                        "tcp_sport_bitmap": [
                            "1",
                        "8",
                        "0",
                        "0",
                        "8388608",
                        "33558656",
                        "1073742144",
                        "0"
                            ],
                        "uuid": "a14fa2f3-6240-41a7-8dd1-d72018a1b1db",
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
                            "virt_memory": 4677044,
                            "cpu_one_min_avg": 1.33333,
                            "disk_used_bytes": 1308307456,
                            "vm_memory_quota": 2097152,
                            "peak_virt_memory": 5171916,
                            "disk_allocated_bytes": 4294967295,
                            "rss": 284184
                        },
                        "vrouter": "a7s12",
                        "tcp_dport_bitmap": [
                            "1",
                        "0",
                        "0",
                        "0",
                        "10519040",
                        "100702336",
                        "2350023012",
                        "24"
                            ],
                        "interface_list": [
                            "default-domain:admin:cdbc2eb3-b2e1-4a27-b9fc-eda692f2ea06"
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
                            "cpu_one_min_avg": 0.333333,
                            "disk_used_bytes": 892678144,
                            "vm_memory_quota": 2097152,
                            "peak_virt_memory": 5169088,
                            "disk_allocated_bytes": 4294967295,
                            "rss": 187064
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
                            "cpu_one_min_avg": 0.333333,
                            "disk_used_bytes": 892678144,
                            "vm_memory_quota": 2097152,
                            "peak_virt_memory": 5169088,
                            "disk_allocated_bytes": 4294967295,
                            "rss": 187064
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
                "name": "e0219ad7-3212-4e30-abfc-212e4a888538",
                "value": {
                    "VirtualMachineStats": {
                        "cpu_stats": [
                        {
                            "virt_memory": 1810416,
                            "cpu_one_min_avg": 4.66667,
                            "disk_used_bytes": 1646592,
                            "vm_memory_quota": 524288,
                            "peak_virt_memory": 1940552,
                            "disk_allocated_bytes": 1073741824,
                            "rss": 49380
                        }
                        ]
                    },
                    "UveVirtualMachineAgent": {
                        "vm_name": "vm101",
                        "cpu_info": {
                            "virt_memory": 1810416,
                            "cpu_one_min_avg": 4.66667,
                            "disk_used_bytes": 1646592,
                            "vm_memory_quota": 524288,
                            "peak_virt_memory": 1940552,
                            "disk_allocated_bytes": 1073741824,
                            "rss": 49380
                        },
                        "interface_list": [
                            "default-domain:admin:c43d910c-bafa-4428-bba8-530cdfa94326"
                            ],
                        "uuid": "e0219ad7-3212-4e30-abfc-212e4a888538",
                        "vrouter": "a7s12"
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
                            "rss": 179824
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
                            "rss": 179824
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
                "name": "default-domain:admin:8ab38e5b-768b-44f6-8883-08d1670ddfec",
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
                                            "json_operand1_value": "-4.97024e-162",
                                            "json_variables": {
                                                "UveVMInterfaceAgent.virtual_network": "\"default-domain:admin:testvn_nitishk\"",
                                                "UveVMInterfaceAgent.vm_name": "\"vm100\""
                                            }
                                        }
                                        ]
                                    }
                                    ]
                                }
                                ]
                            },
                            "timestamp": 1479417317844548,
                            "ack": false,
                            "token": "eyJ0aW1lc3RhbXAiOiAxNDc5NDE3MzE3ODQ0NTQ4LCAiaHR0cF9wb3J0IjogNTk5NSwgImhvc3RfaXAiOiAiMTAuODQuMzAuMjQ5In0=",
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
                        "vm_uuid": "06c75bb2-e17b-4ccd-b00c-aa59fdaecb55",
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
                        "gateway": "30.30.31.1",
                        "uuid": "8ab38e5b-768b-44f6-8883-08d1670ddfec",
                        "label": 16,
                        "ip4_active": false,
                        "mac_address": "02:8a:b3:8e:5b:76",
                        "if_out_pkts_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "0.353768",
                                "mean": "31.0356"
                            },
                            "sigma": -0.100493,
                            "algo": "EWM",
                            "samples": 28496
                        },
                        "l2_active": false,
                        "added_flows_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "4.97024e-162",
                                "mean": "2.47033e-323"
                            },
                            "sigma": -4.97024e-162,
                            "algo": "EWM",
                            "samples": 28496
                        },
                        "vm_name": "vm100",
                        "out_bw_usage": 795,
                        "deleted_flows_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "0",
                                "mean": "0"
                            },
                            "sigma": 0,
                            "algo": "EWM",
                            "samples": 28496
                        },
                        "is_health_check_active": false,
                        "flow_rate": {
                            "active_flows": 1,
                            "max_flow_deletes_per_second": 0,
                            "added_flows": 0,
                            "deleted_flows": 0,
                            "min_flow_adds_per_second": 0,
                            "min_flow_deletes_per_second": 0,
                            "max_flow_adds_per_second": 0
                        },
                        "virtual_network": "default-domain:admin:testvn_nitishk",
                        "active": false,
                        "ip_address": "30.30.31.3",
                        "fixed_ip4_list": [
                            "30.30.31.3"
                            ],
                        "in_bw_usage": 795,
                        "active_flows_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "5.26625e-16",
                                "mean": "1"
                            },
                            "sigma": 1.05409,
                            "algo": "EWM",
                            "samples": 28496
                        },
                        "fip_agg_stats": [
                        {
                            "out_bytes": 0,
                            "in_bytes": 0,
                            "out_pkts": 0,
                            "virtual_network": "default-domain:admin:testvn_nitishk",
                            "in_pkts": 0,
                            "ip_address": "30.30.31.5"
                        }
                        ],
                            "health_check_instance_list": [
                            {
                                "status": "InActive",
                                "name": "default-domain:admin:bad-chk1",
                                "is_running": true,
                                "uuid": "99bbdcc6-0ea5-4092-b222-a0587cba8637"
                            }
                        ],
                            "admin_state": true,
                            "if_in_pkts_ewm": {
                                "config": "0.1",
                                "state": {
                                    "stddev": "0.353768",
                                    "mean": "31.0356"
                                },
                                "sigma": -0.100493,
                                "algo": "EWM",
                                "samples": 28496
                            },
                            "sg_rule_stats": [
                            {
                                "count": 4,
                                "rule": "00000000-0000-0000-0000-000000000004"
                            },
                            {
                                "count": 0,
                                "rule": "3a92b35f-58a4-4435-acfd-e5ae79944f92"
                            }
                        ]
                    }
                }
            },
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
                                            "json_operand1_value": "-1.26561e-50",
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
                            "timestamp": 1480034134785146,
                            "ack": false,
                            "token": "eyJ0aW1lc3RhbXAiOiAxNDgwMDM0MTM0Nzg1MTQ2LCAiaHR0cF9wb3J0IjogNTk5NSwgImhvc3RfaXAiOiAiMTAuODQuMzAuMjQ5In0=",
                            "type": "VMI Flow Test Alarm",
                            "description": "VMI Flow Test Alarm"
                        }
                        ]
                    },
                    "UveVMInterfaceAgent": {
                        "ip6_active": false,
                        "if_stats": {
                            "out_bytes": 898812,
                            "in_pkts": 2576,
                            "out_pkts": 2582,
                            "in_bytes": 846784
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
                                    "stddev": "32.6293",
                                    "mean": "2590.18"
                                },
                                "sigma": -0.250562,
                                "algo": "EWM",
                                "samples": 47009
                            },
                            "l2_active": true,
                            "added_flows_ewm": {
                                "config": "0.1",
                                "state": {
                                    "stddev": "1.83997e-49",
                                    "mean": "2.32869e-99"
                                },
                                "sigma": -1.26561e-50,
                                "algo": "EWM",
                                "samples": 47009
                            },
                            "vm_name": "front01",
                            "out_bw_usage": 239683,
                            "deleted_flows_ewm": {
                                "config": "0.1",
                                "state": {
                                    "stddev": "1.74737e-49",
                                    "mean": "2.55746e-99"
                                },
                                "sigma": -1.4636e-50,
                                "algo": "EWM",
                                "samples": 47009
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
                            "in_bw_usage": 225809,
                            "active_flows_ewm": {
                                "config": "0.1",
                                "state": {
                                    "stddev": "8.08896e-14",
                                    "mean": "100"
                                },
                                "sigma": -1.05409,
                                "algo": "EWM",
                                "samples": 47009
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
                                    "stddev": "34.0179",
                                    "mean": "2583.65"
                                },
                                "sigma": -0.224885,
                                "algo": "EWM",
                                "samples": 47009
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
                "name": "default-domain:admin:cdbc2eb3-b2e1-4a27-b9fc-eda692f2ea06",
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
                                            "json_operand1_value": "-7.21959e-50",
                                            "json_variables": {
                                                "UveVMInterfaceAgent.virtual_network": "\"default-domain:admin:backend\"",
                                                "UveVMInterfaceAgent.vm_name": "\"back01\""
                                            }
                                        }
                                        ]
                                    }
                                    ]
                                }
                                ]
                            },
                            "timestamp": 1480034134796756,
                            "ack": false,
                            "token": "eyJ0aW1lc3RhbXAiOiAxNDgwMDM0MTM0Nzk2NzU2LCAiaHR0cF9wb3J0IjogNTk5NSwgImhvc3RfaXAiOiAiMTAuODQuMzAuMjQ5In0=",
                            "type": "VMI Flow Test Alarm",
                            "description": "VMI Flow Test Alarm"
                        }
                        ]
                    },
                    "UveVMInterfaceAgent": {
                        "ip6_active": false,
                        "if_stats": {
                            "out_bytes": 846784,
                            "in_pkts": 2582,
                            "out_pkts": 2576,
                            "in_bytes": 898812
                        },
                        "vm_uuid": "a14fa2f3-6240-41a7-8dd1-d72018a1b1db",
                        "port_bucket_bmap": {
                            "udp_sport_bitmap": [
                                "0",
                            "0",
                            "0",
                            "0",
                            "4294418391",
                            "3187539135",
                            "4294954943",
                            "32383"
                                ],
                            "tcp_dport_bitmap": [
                                "1",
                            "0",
                            "0",
                            "0",
                            "10519040",
                            "100702336",
                            "2350023012",
                            "24"
                                ],
                            "tcp_sport_bitmap": [
                                "1",
                            "8",
                            "0",
                            "0",
                            "8388608",
                            "33558656",
                            "1073742144",
                            "0"
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
                        "gateway": "10.2.1.1",
                        "uuid": "cdbc2eb3-b2e1-4a27-b9fc-eda692f2ea06",
                        "label": 25,
                        "ip4_active": true,
                        "mac_address": "02:cd:bc:2e:b3:b2",
                        "if_out_pkts_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "34.0179",
                                "mean": "2583.65"
                            },
                            "sigma": -0.224885,
                            "algo": "EWM",
                            "samples": 47009
                        },
                        "l2_active": true,
                        "added_flows_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "9.14288e-49",
                                "mean": "6.60078e-98"
                            },
                            "sigma": -7.21959e-50,
                            "algo": "EWM",
                            "samples": 47009
                        },
                        "vm_name": "back01",
                        "out_bw_usage": 225809,
                        "deleted_flows_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "8.78966e-49",
                                "mean": "7.19774e-98"
                            },
                            "sigma": -8.18887e-50,
                            "algo": "EWM",
                            "samples": 47009
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
                        "virtual_network": "default-domain:admin:backend",
                        "active": true,
                        "ip_address": "10.2.1.3",
                        "fixed_ip4_list": [
                            "10.2.1.3"
                            ],
                        "in_bw_usage": 239683,
                        "active_flows_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "8.08896e-14",
                                "mean": "100"
                            },
                            "sigma": -1.05409,
                            "algo": "EWM",
                            "samples": 47009
                        },
                        "admin_state": true,
                        "if_in_pkts_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "32.6293",
                                "mean": "2590.18"
                            },
                            "sigma": -0.250562,
                            "algo": "EWM",
                            "samples": 47009
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
                            "rule": "3a92b35f-58a4-4435-acfd-e5ae79944f92"
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
                                            "json_operand1_value": "-9.07564e-51",
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
                            "timestamp": 1480034134819466,
                            "ack": false,
                            "token": "eyJ0aW1lc3RhbXAiOiAxNDgwMDM0MTM0ODE5NDY2LCAiaHR0cF9wb3J0IjogNTk5NSwgImhvc3RfaXAiOiAiMTAuODQuMzAuMjQ5In0=",
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
                                "stddev": "2.64142e-14",
                                "mean": "30"
                            },
                            "sigma": 0.403501,
                            "algo": "EWM",
                            "samples": 42512
                        },
                        "l2_active": true,
                        "added_flows_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "1.40618e-49",
                                "mean": "1.2762e-99"
                            },
                            "sigma": -9.07564e-51,
                            "algo": "EWM",
                            "samples": 42512
                        },
                        "vm_name": "front03",
                        "out_bw_usage": 784,
                        "deleted_flows_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "1.21772e-49",
                                "mean": "1.40741e-99"
                            },
                            "sigma": -1.15577e-50,
                            "algo": "EWM",
                            "samples": 42512
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
                            "samples": 42512
                        },
                        "admin_state": true,
                        "if_in_pkts_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "2.64142e-14",
                                "mean": "30"
                            },
                            "sigma": 0.403501,
                            "algo": "EWM",
                            "samples": 42512
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
                "name": "default-domain:admin:c43d910c-bafa-4428-bba8-530cdfa94326",
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
                                            "json_operand1_value": "-4.97024e-162",
                                            "json_variables": {
                                                "UveVMInterfaceAgent.virtual_network": "\"default-domain:admin:testvn_nitishk\"",
                                                "UveVMInterfaceAgent.vm_name": "\"vm101\""
                                            }
                                        }
                                        ]
                                    }
                                    ]
                                }
                                ]
                            },
                            "timestamp": 1479630624632914,
                            "ack": false,
                            "token": "eyJ0aW1lc3RhbXAiOiAxNDc5NjMwNjI0NjMyOTE0LCAiaHR0cF9wb3J0IjogNTk5NSwgImhvc3RfaXAiOiAiMTAuODQuMzAuMjQ5In0=",
                            "type": "VMI Flow Test Alarm",
                            "description": "VMI Flow Test Alarm"
                        }
                        ]
                    },
                    "UveVMInterfaceAgent": {
                        "ip6_active": false,
                        "if_stats": {
                            "out_bytes": 0,
                            "in_pkts": 23,
                            "out_pkts": 0,
                            "in_bytes": 966
                        },
                        "vm_uuid": "e0219ad7-3212-4e30-abfc-212e4a888538",
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
                        "gateway": "30.30.31.1",
                        "uuid": "c43d910c-bafa-4428-bba8-530cdfa94326",
                        "label": 18,
                        "ip4_active": true,
                        "mac_address": "02:c4:3d:91:0c:ba",
                        "if_out_pkts_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "4.97024e-162",
                                "mean": "2.47033e-323"
                            },
                            "sigma": -4.97024e-162,
                            "algo": "EWM",
                            "samples": 48996
                        },
                        "l2_active": true,
                        "added_flows_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "4.97024e-162",
                                "mean": "2.47033e-323"
                            },
                            "sigma": -4.97024e-162,
                            "algo": "EWM",
                            "samples": 48996
                        },
                        "vm_name": "vm101",
                        "out_bw_usage": 0,
                        "deleted_flows_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "4.97024e-162",
                                "mean": "2.47033e-323"
                            },
                            "sigma": -4.97024e-162,
                            "algo": "EWM",
                            "samples": 48996
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
                        "virtual_network": "default-domain:admin:testvn_nitishk",
                        "active": true,
                        "ip_address": "30.30.31.4",
                        "fixed_ip4_list": [
                            "30.30.31.4"
                            ],
                        "in_bw_usage": 257,
                        "active_flows_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "4.97024e-162",
                                "mean": "2.47033e-323"
                            },
                            "sigma": -4.97024e-162,
                            "algo": "EWM",
                            "samples": 48996
                        },
                        "admin_state": true,
                        "if_in_pkts_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "0.495767",
                                "mean": "23.0434"
                            },
                            "sigma": -0.0874802,
                            "algo": "EWM",
                            "samples": 48996
                        },
                        "sg_rule_stats": [
                        {
                            "count": 3,
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
                                            "json_operand1_value": "-1.69706e-50",
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
                            "timestamp": 1480034134771597,
                            "ack": false,
                            "token": "eyJ0aW1lc3RhbXAiOiAxNDgwMDM0MTM0NzcxNTk3LCAiaHR0cF9wb3J0IjogNTk5NSwgImhvc3RfaXAiOiAiMTAuODQuMzAuMjQ5In0=",
                            "type": "VMI Flow Test Alarm",
                            "description": "VMI Flow Test Alarm"
                        }
                        ]
                    },
                    "UveVMInterfaceAgent": {
                        "ip6_active": false,
                        "if_stats": {
                            "out_bytes": 3024,
                            "in_pkts": 32,
                            "out_pkts": 32,
                            "in_bytes": 3024
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
                                "stddev": "0.521397",
                                "mean": "31.0592"
                            },
                            "sigma": 1.80445,
                            "algo": "EWM",
                            "samples": 42514
                        },
                        "l2_active": true,
                        "added_flows_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "2.41546e-49",
                                "mean": "4.09919e-99"
                            },
                            "sigma": -1.69706e-50,
                            "algo": "EWM",
                            "samples": 42514
                        },
                        "vm_name": "front02",
                        "out_bw_usage": 806,
                        "deleted_flows_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "2.17377e-49",
                                "mean": "4.48489e-99"
                            },
                            "sigma": -2.06319e-50,
                            "algo": "EWM",
                            "samples": 42514
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
                        "in_bw_usage": 806,
                        "active_flows_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "1.47455e-15",
                                "mean": "1"
                            },
                            "sigma": -1.05409,
                            "algo": "EWM",
                            "samples": 42514
                        },
                        "admin_state": true,
                        "if_in_pkts_ewm": {
                            "config": "0.1",
                            "state": {
                                "stddev": "0.521397",
                                "mean": "31.0592"
                            },
                            "sigma": 1.80445,
                            "algo": "EWM",
                            "samples": 42514
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
    return {
        domainsMockData               : domainsMockData,
        projectMockData               : projectMockData,
        networksMockData              : networksMockData,
        networksMockStatData          : networksMockStatData,
        portDistributionMockData      : portDistributionMockData,
        projectConnectedGraph         : projectConnectedGraph,
        projectConfigGraph            : projectConfigGraph,
        virtualMachinesDetailsMockData: virtualMachinesDetailsMockData,
        virtualMachinesSummaryMockData: virtualMachinesSummaryMockData,
        networkingStatsMockData       : networkingStatsMockData,
        virtualMachinesStatsMockData  : virtualMachinesStatsMockData,
        networksDetailsMockData       : networksDetailsMockData,
        instancesDetailsMockData      : instancesDetailsMockData,
        virtualMachineInterfaceList   : virtualMachineInterfaceList,
        virtualMachineInterfaceDetails: virtualMachineInterfaceDetails,
        virtualMachineInterfaceStats  : virtualMachineInterfaceStats
    };
});
