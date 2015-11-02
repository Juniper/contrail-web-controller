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

            switch (recordType) {
                case ("A"):
                    {
                        recordType = recordType +
                            " (IP Address Record)";
                    }
                    break;
                case ("CNAME"):
                    {
                        recordType = recordType +
                            " (Alias Record)";
                    }
                    break;
                case ("PTR"):
                    {
                        recordType = recordType +
                            " (Reverse DNS Record)";
                    }
                    break;
                case ("NS"):
                    {
                        recordType = recordType +
                            " (Delegation Record)";
                    }
                    break;
            }

            return recordType;

        };
        /*
         * @TTLFormatter
         */

        self.TTLFormatter = function(row, col, val, d, rowData) {
            var TTL = getValueByJsonPath(rowData,
                'virtual_DNS_record_data;record_ttl_seconds',
                "-");
            TTL = TTL + " (seconds)"
            return TTL;

        };


    };
    return dnsRecordFormatters;
});