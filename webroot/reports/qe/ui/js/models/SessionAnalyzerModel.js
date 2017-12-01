/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "contrail-list-model",
    "core-basedir/reports/qe/ui/js/common/qe.utils",
    "controller-basedir/reports/qe/ui/js/models/FlowSeriesFormModel",
    "core-basedir/reports/qe/ui/js/models/ContrailListModelGroup"
], function (_, ContrailListModel, qeUtils, FlowSeriesFormModel, ContrailListModelGroup) {
    var SessionAnalyzerModel = ContrailListModelGroup.extend({
        constructor: function(modelConfig) {
            var self = this;
            self.queryFormAttributes = modelConfig.queryFormAttributes;
            self.selectedFlowRecord = modelConfig.selectedFlowRecord;
            self.queryRequestPostDataMap = {};
            self.modelConfig = modelConfig;
            self.initComplete = new Slick.Event(); // eslint-disable-line

            ContrailListModelGroup.apply(self, arguments);

            qeUtils.fetchServerCurrentTime(function(serverCurrentTime) {
                self.updateCurrentServerTime(serverCurrentTime);
            });

            return self;
        },

        updateCurrentServerTime: function(serverCurrentTime) {
            var self = this,
                flowSeriesFormModel = new FlowSeriesFormModel(self.queryFormAttributes),
                timeRange = parseInt(flowSeriesFormModel.time_range());

            if (timeRange !== -1) {
                flowSeriesFormModel.to_time(serverCurrentTime);
                flowSeriesFormModel.from_time(serverCurrentTime - (timeRange * 1000));
            }

            var saDataKeyMap = cowc.MAP_SESSION_ANALYZER_DATA_KEY;

            _.each(saDataKeyMap, function(value, key) {
                if (contrail.checkIfExist(value.query)) {
                    self.queryRequestPostDataMap[key] = getQueryRequestPostData(serverCurrentTime, flowSeriesFormModel,
                        self.selectedFlowRecord, value.query.type, value.query.reverse);
                }
            });

            self.modelConfig.childModelConfig = createListModelConfigArray(self.queryRequestPostDataMap);

            self.initChildModels(self.modelConfig.childModelConfig);

            self.initComplete.notify();
        },

        getQueryRequestPostDataMap:  function () {
            var self =this;

            return self.queryRequestPostDataMap;
        },

    });

    function getQueryRequestPostData(serverCurrentTime, flowSeriesFormModel, selectedFlowRecord, direction, isReversed) {
        var queryRequestPostData = flowSeriesFormModel.getQueryRequestPostData(serverCurrentTime),
            newQueryRequestPostData = $.extend(true, {}, queryRequestPostData),
            queryFormAttributes = queryRequestPostData.formModelAttrs,
            newQueryFormAttributes = $.extend(true, {}, queryFormAttributes, {
                table_name: cowc.FLOW_SERIES_TABLE,
                table_type: cowc.QE_FLOW_TABLE_TYPE,
                query_prefix: cowc.FS_QUERY_PREFIX
            }),
            appendWhereClause = "", newWhereClause = "",
            oldWhereClause = queryFormAttributes.where,
            oldWhereArray;

        newQueryFormAttributes.select = "vrouter, sourcevn, sourceip, destvn, destip, protocol, sport, dport, SUM(bytes), SUM(packets), T=";
        newQueryFormAttributes.direction = (direction === "ingress") ? "1" : "0";

        for (var key in selectedFlowRecord) {
            switch (key) {
                case "sourcevn":
                    if(contrail.checkIfExist(selectedFlowRecord[key])) {
                        appendWhereClause += appendWhereClause.length > 0 ? " AND " : "";
                        appendWhereClause += (isReversed ? "destvn = " : "sourcevn = ") + selectedFlowRecord[key];

                        if(contrail.checkIfExist(selectedFlowRecord.sourceip)) {
                            appendWhereClause += (isReversed ? " AND destip = " : " AND sourceip = ") + selectedFlowRecord.sourceip;

                        }
                    }
                    break;

                case "destvn":
                    if(contrail.checkIfExist(selectedFlowRecord[key])) {
                        appendWhereClause += appendWhereClause.length > 0 ? " AND " : "";
                        appendWhereClause += (isReversed ? "sourcevn = " : "destvn = ") + selectedFlowRecord[key];

                        if(contrail.checkIfExist(selectedFlowRecord.destip)) {
                            appendWhereClause += (isReversed ? " AND sourceip = " : " AND destip = ") + selectedFlowRecord.destip;

                        }
                    }
                    break;

                case "protocol":
                    if(contrail.checkIfExist(selectedFlowRecord[key])) {
                        appendWhereClause += appendWhereClause.length > 0 ? " AND " : "";
                        appendWhereClause += "protocol = " + selectedFlowRecord[key];

                        if(contrail.checkIfExist(selectedFlowRecord.sport)) {
                            appendWhereClause += (isReversed ? " AND dport = " : " AND sport = ") + selectedFlowRecord.sport;

                        }

                        if(contrail.checkIfExist(selectedFlowRecord.dport)) {
                            appendWhereClause += (isReversed ? " AND sport = " : " AND dport = ") + selectedFlowRecord.dport;

                        }
                    }
                    break;
            }

        }

        if(contrail.checkIfExist(oldWhereClause) && oldWhereClause !== "") {
            oldWhereArray = oldWhereClause.split(" OR ");
            for(var i = 0; i < oldWhereArray.length; i++) {
                newWhereClause += newWhereClause.length > 0 ? " OR " : "";
                newWhereClause += "(" + oldWhereArray[i].substring(1, oldWhereArray[i].length - 1) + " AND " + appendWhereClause + ")";
            }

            newQueryFormAttributes.where = newWhereClause;

        } else {
            newQueryFormAttributes.where = "(" + appendWhereClause + ")";
        }

        newQueryRequestPostData.async = false; //Setting async to false to block for the response.
        newQueryRequestPostData.formModelAttrs = newQueryFormAttributes;
        newQueryRequestPostData.engQueryStr = qeUtils.getEngQueryStr(newQueryFormAttributes);

        return newQueryRequestPostData;
    }

    function getQEURLRemote(queryRequestPostData) {
        return {
            url: "/api/qe/query",
            type: "POST",
            data: JSON.stringify(queryRequestPostData)
        };
    }

    function getListModelConfig(id, queryRequestPostData, dataParser) {
        var listModelConfig = {
            id: id,
            remote: {
                ajaxConfig: getQEURLRemote(queryRequestPostData),
                dataParser: dataParser
            }
        };
        return listModelConfig;
    }

    function createListModelConfigArray(queryRequestPostDataMap) {
        var listModelConfigArray = [],
            dataParserFn = function (data) {
                return data.data;
            };

        _.each(queryRequestPostDataMap, function(queryPostData, id) {
            listModelConfigArray.push(getListModelConfig(id, queryPostData, dataParserFn));
        });
        return listModelConfigArray;
    }
    return SessionAnalyzerModel;
});
