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
    }
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
    return {
        domainsMockData: domainsMockData,
        projectMockData: projectMockData,
        networksMockData: networksMockData,
        networksMockStatData: networksMockStatData,
        portDistributionMockData: portDistributionMockData,
        projectConnectedGraph: projectConnectedGraph,
        projectConfigGraph: projectConfigGraph,
        virtualMachinesDetailsMockData: virtualMachinesDetailsMockData,
        virtualMachinesSummaryMockData: virtualMachinesSummaryMockData,
        networkingStatsMockData: networkingStatsMockData,
        virtualMachinesStatsMockData: virtualMachinesStatsMockData
    };
});