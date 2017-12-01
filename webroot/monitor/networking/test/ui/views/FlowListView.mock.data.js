/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function (_) {
    var flowsMockData = {
        "chunk": 1,
        "chunkSize": 5,
        "data": [
            {
                "destip": "10.3.1.3",
                "destvn": "default-domain:admin:backend",
                "direction_ing": 1,
                "dport": 9108,
                "flow_class_id": 10920745036091185000,
                "protocol": 6,
                "sourceip": "10.2.1.3",
                "sourcevn": "default-domain:admin:frontend",
                "sport": 34770,
                "sum_bytes": 186288,
                "sum_packets": 520
            },
            {
                "destip": "10.3.1.3",
                "destvn": "default-domain:admin:backend",
                "direction_ing": 1,
                "dport": 9108,
                "flow_class_id": 10920745036091185000,
                "protocol": 6,
                "sourceip": "10.2.1.3",
                "sourcevn": "default-domain:admin:frontend",
                "sport": 34771,
                "sum_bytes": 165474,
                "sum_packets": 521
            },
            {
                "destip": "10.3.1.3",
                "destvn": "default-domain:admin:backend",
                "direction_ing": 1,
                "dport": 9108,
                "flow_class_id": 10920745036091185000,
                "protocol": 6,
                "sourceip": "10.2.1.3",
                "sourcevn": "default-domain:admin:frontend",
                "sport": 34772,
                "sum_bytes": 165038,
                "sum_packets": 503
            },
            {
                "destip": "10.3.1.3",
                "destvn": "default-domain:admin:backend",
                "direction_ing": 1,
                "dport": 9108,
                "flow_class_id": 10920745036091185000,
                "protocol": 6,
                "sourceip": "10.2.1.3",
                "sourcevn": "default-domain:admin:frontend",
                "sport": 34769,
                "sum_bytes": 171712,
                "sum_packets": 512
            },
            {
                "destip": "10.3.1.3",
                "destvn": "default-domain:admin:backend",
                "direction_ing": 1,
                "dport": 9108,
                "flow_class_id": 10920745036091185000,
                "protocol": 6,
                "sourceip": "10.2.1.3",
                "sourcevn": "default-domain:admin:frontend",
                "sport": 34768,
                "sum_bytes": 175198,
                "sum_packets": 519
            }
        ],
        "total": 5,
        "queryJSON": {
            "table": "FlowSeriesTable",
            "start_time": 1443571409000000,
            "end_time": 1443572009000000,
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
                        "name": "sport",
                        "value": "34560",
                        "op": 3,
                        "value2": "34815"
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
                        "name": "sport",
                        "value": "34560",
                        "op": 3,
                        "value2": "34815"
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
                        "name": "sport",
                        "value": "34560",
                        "op": 3,
                        "value2": "34815"
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
