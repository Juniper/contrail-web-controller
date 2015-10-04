/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var QEConstants = function () {
        this.TIMERANGE_DROPDOWN_VALUES = [
            {'id': 600, 'text': 'Last 10 Mins'},
            {'id': 1800, 'text': 'Last 30 Mins'},
            {'id': 3600, 'text': 'Last 1 Hr'},
            {'id': 21600, 'text': 'Last 6 Hrs'},
            {'id': 43200, 'text': 'Last 12 Hrs'},
            {'id': -1, 'text': 'Custom'}
        ];

        this.DIRECTION_DROPDOWN_VALUES = [
            {'id': '1', 'text': 'INGRESS'},
            {'id': '0', 'text': 'EGRESS'}
        ];

        this.URL_TABLES = "/api/qe/tables";
        this.URL_PREFIX_TABLE_SCHEMA = "/api/qe/table/schema/";

        this.FS_QUERY_PREFIX = "fs";
        this.FC_QUERY_PREFIX = "fc";
        this.FR_QUERY_PREFIX = "fr";
        this.STAT_QUERY_PREFIX = "stat";

        this.DEFAULT_QUERY_PREFIX = 'query';
        this.FLOW_SERIES_TABLE = "FlowSeriesTable";
        this.FLOW_CLASS = "FlowClass";

        this.UMID_FLOW_SERIES_FORM_MODEL = "qe:fs-form-model";
        this.UMID_FLOW_SERIES_CHART_MODEL = "qe:fs-chart-model";
        this.UMID_FLOW_SERIES_LINE_CHART_MODEL = "qe:fs-line-chart-model";
    };
    return QEConstants;
});
