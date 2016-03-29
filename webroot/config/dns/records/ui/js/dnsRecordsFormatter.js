/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define(['underscore'], function(_) {
    var dnsRecordFormatters = function() {
        var self = this;

        /*
         * @recordTypeFormatter
         */

        self.recordTypeFormatter = function(row, col, val, d,
            rowData) {
            var recordType = getValueByJsonPath(rowData,
                'virtual_DNS_record_data;record_type', "-");
            var formattedRecType;
            switch (recordType) {
                case ("A"):
                    formattedRecType = recordType + " (IPv4 Address Record)";
                    break;
                case ("AAAA"):
                    formattedRecType = recordType + " (IPv6 Address Record)";
                    break;
                case ("CNAME"):
                    formattedRecType = recordType + " (Alias Record)";
                    break;
                case ("PTR"):
                    formattedRecType = recordType + " (Reverse DNS Record)";
                    break;
                case ("NS"):
                    formattedRecType = recordType + " (Delegation Record)";
                    break;
                case ("MX"):
                    formattedRecType = recordType + " (Mail Exchanger Record)";
                    break;
                default:
                    formattedRecType = "-";
            }

            return formattedRecType;

        };
        /*
         * @ttlFormatter
         */

        self.ttlFormatter = function(row, col, val, d, rowData) {
            var TTL = getValueByJsonPath(rowData,
                'virtual_DNS_record_data;record_ttl_seconds',
                "-");
            TTL = TTL + " (seconds)"
            return TTL;

        };


    };
    return dnsRecordFormatters;
});