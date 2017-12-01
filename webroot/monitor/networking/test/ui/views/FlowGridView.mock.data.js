/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function (_) {
    var flowsMockData = {
        "chunk": 1,
        "chunkSize": 4,
        "data": [
            {
                "destip": "10.3.1.3",
                "destvn": "default-domain:admin:backend",
                "direction_ing": 1,
                "dport": 9110,
                "flow_class_id": 10920744767791430000,
                "protocol": 6,
                "sourceip": "10.2.1.3",
                "sourcevn": "default-domain:admin:frontend",
                "sport": 38546,
                "sum_bytes": 158008,
                "sum_packets": 448
            },
            {
                "destip": "10.3.1.3",
                "destvn": "default-domain:admin:backend",
                "direction_ing": 1,
                "dport": 9110,
                "flow_class_id": 10920744767791430000,
                "protocol": 6,
                "sourceip": "10.2.1.3",
                "sourcevn": "default-domain:admin:frontend",
                "sport": 38548,
                "sum_bytes": 165056,
                "sum_packets": 452
            },
            {
                "destip": "10.3.1.3",
                "destvn": "default-domain:admin:backend",
                "direction_ing": 1,
                "dport": 9110,
                "flow_class_id": 10920744767791430000,
                "protocol": 6,
                "sourceip": "10.2.1.3",
                "sourcevn": "default-domain:admin:frontend",
                "sport": 38549,
                "sum_bytes": 150972,
                "sum_packets": 426
            },
            {
                "destip": "10.3.1.3",
                "destvn": "default-domain:admin:backend",
                "direction_ing": 1,
                "dport": 9110,
                "flow_class_id": 10920744767791430000,
                "protocol": 6,
                "sourceip": "10.2.1.3",
                "sourcevn": "default-domain:admin:frontend",
                "sport": 38545,
                "sum_bytes": 145038,
                "sum_packets": 443
            }
        ],
        "total": 4,
        "queryJSON": {
            "table": "FlowSeriesTable",
            "start_time": 1443653652505000,
            "end_time": 1443654252505000,
            "select_fields": [
                "flow_class_id",
                "direction_ing",
                "sourcevn",
                "destvn",
                "sourceip",
                "destip",
                "protocol",
                "sport",
                "dport",
                "SUM(bytes)",
                "SUM(packets)"
            ],
            "where": [
                [
                    {
                        "name": "dport",
                        "value": "9110",
                        "op": 1
                    },
                    {
                        "name": "sourcevn",
                        "value": "default-domain:admin:frontend",
                        "op": 1
                    },
                    {
                        "name": "protocol",
                        "value": "6",
                        "op": 1
                    }
                ],
                [
                    {
                        "name": "dport",
                        "value": "9110",
                        "op": 1
                    },
                    {
                        "name": "sourcevn",
                        "value": "default-domain:admin:frontend",
                        "op": 1
                    },
                    {
                        "name": "protocol",
                        "value": "1",
                        "op": 1
                    }
                ],
                [
                    {
                        "name": "dport",
                        "value": "9110",
                        "op": 1
                    },
                    {
                        "name": "sourcevn",
                        "value": "default-domain:admin:frontend",
                        "op": 1
                    },
                    {
                        "name": "protocol",
                        "value": "17",
                        "op": 1
                    }
                ]
            ]
        },
        "serverSideChunking": true
    };
    return {
        flowsMockData:flowsMockData
    };
});
