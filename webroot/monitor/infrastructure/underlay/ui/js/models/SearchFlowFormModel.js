/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockout',
    "protocol",
    'query-form-model',
    'core-basedir/reports/qe/ui/js/common/qe.model.config'
], function (_, Knockout, protocolUtils, QueryFormModel, qeModelConfig) {
    var SearchFlowFormModel = QueryFormModel.extend({
        defaultSelectFields: ['flow_class_id', 'direction_ing'],

        constructor: function (modelData) {
            var defaultConfig = qeModelConfig.getQueryModelConfig({
                                    table_name: cowc.FLOW_RECORD_TABLE,
                                    limit: 5000,
                                    time_range: 600,
                                    table_type: cowc.QE_FLOW_TABLE_TYPE,
                                    filters: '',
                                    filter_json: '',
                                    select: "other_vrouter_ip, vrouter, vrouter_ip," +
                                            "sourcevn, sourceip, sport, destvn," +
                                            "destip, dport, protocol, agg-bytes," +
                                            "agg-packets, direction_ing",
                                    query_prefix: cowc.FR_QUERY_PREFIX});
            modelData = $.extend(true, {}, defaultConfig, modelData);
            QueryFormModel.prototype.constructor.call(this, modelData);
            this.setTableFieldValues();
            return this;
        },
        setTableFieldValues: function () {
            var searchFlowModel = this.model();
            var valueOptionList = {
                    vrouter: [],
                    sourcevn: [],
                    destvn: [],
                    protocol: []
                };
            searchFlowModel.attributes.where_data_object['value_option_list'] =
                valueOptionList;
            var protocolData = [];
            $.each(protocolUtils.protocolList, function(idx, obj) {
                protocolData.push(obj['name']);
            });
            valueOptionList['protocol'] = protocolData;
            $.ajax({
                url: '/api/admin/networks',
                dataType: 'json'
            }).done(function (response){
                    var vnList =
                        getValueByJsonPath(response, 'virtual-networks', []),
                        results = [];
                    for (var i = 0; i < vnList.length; i++) {
                        var vnObj = vnList[i];
                        if (vnObj['fq_name'] != null) {
                            var fqn = vnObj['fq_name'].join(':');
                            results.push(fqn);
                        }
                    }
                    valueOptionList['sourcevn'] = results;
                    valueOptionList['destvn'] = results;
            });

            $.ajax({
                url: '/api/admin/monitor/infrastructure/vrouters/cached-summary',
                dataType: 'json'
            }).done(function (response) {
                var vRouterList = getValueByJsonPath(response,'data',[]),
                    results = [];
                for (var i = 0; i < vRouterList.length; i++) {
                    var vRouterName = vRouterList[i]['name'];
                    results.push(vRouterName);
                }
                valueOptionList['vrouter'] = results;
            });
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
