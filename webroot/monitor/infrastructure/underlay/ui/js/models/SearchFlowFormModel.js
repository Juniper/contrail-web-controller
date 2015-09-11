/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockout',
    'query-form-model'
], function (_, Knockout, QueryFormModel) {
    var SearchFlowFormModel = QueryFormModel.extend({
        defaultSelectFields: ['flow_class_id', 'direction_ing'],

        constructor: function (modelData) {
            var defaultConfig = qewmc.getQueryModelConfig({
                                    table_name: ctwc.FLOW_RECORD_TABLE,
                                    limit: 5000,
                                    time_range: 600,
                                    table_type: cowc.QE_FLOW_TABLE_TYPE,
                                    select: "other_vrouter_ip, vrouter, vrouter_ip," +
                                            "sourcevn, sourceip, sport, destvn," +
                                            "destip, dport, protocol, agg-bytes," +
                                            "agg-packets, direction_ing",
                                    query_prefix: ctwc.FR_QUERY_PREFIX});
            modelData = $.extend(true, {}, defaultConfig, modelData);
            QueryFormModel.prototype.constructor.call(this, modelData);

            return this;
        },

        getTimeGranularityUnits: function() {
            var self = this;

            return Knockout.computed(function () {

                var timeRange = self.time_range(),
                    fromTime = new Date(self.from_time()).getTime(),
                    toTime = new Date(self.to_time()).getTime(),
                    timeGranularityUnits = [];

                timeGranularityUnits.push({id: "secs", text: "secs"});

                if (timeRange == -1) {
                    timeRange = (toTime - fromTime) / 1000;
                }

                if (timeRange > 60) {
                    timeGranularityUnits.push({id: "mins", text: "mins"});
                }
                if (timeRange > 3600) {
                    timeGranularityUnits.push({id: "hrs", text: "hrs"});
                }
                if (timeRange > 86400) {
                    timeGranularityUnits.push({id: "days", text: "days"});
                }

                return timeGranularityUnits;


            }, this);
        },

        validations: {}
    });

    return SearchFlowFormModel;
});
