/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "contrail-view",
    "controller-basedir/reports/qe/ui/js/models/FlowSeriesFormModel",
    "core-basedir/reports/qe/ui/js/common/qe.utils"
], function (ContrailView, FlowSeriesFormModel, qeUtils) {

    var FormRecordDetailsTabView = ContrailView.extend({
        render: function () {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                queryPrefix = cowc.FS_QUERY_PREFIX,
                modalId = queryPrefix + cowl.QE_RECORD_DETAILS_MODAL_SUFFIX,
                className = viewConfig.className,
                queryFormAttributes = viewConfig.queryFormAttributes,
                queryFormModel = new FlowSeriesFormModel(queryFormAttributes),
                selectedFlowRecord = viewConfig.selectedFlowRecord;

            cowu.createModal({
                "modalId": modalId,
                "className": className,
                "title": cowl.TITLE_SESSION_DETAILS,
                "body": "<div id='" + modalId + "-body'></div>",
                "onClose": function () {
                    $("#" + modalId).modal("hide");
                }
            });

            qeUtils.fetchServerCurrentTime(function(serverCurrentTime) {
                var timeRange = parseInt(queryFormModel.time_range());

                if (timeRange !== -1) {
                    queryFormModel.to_time(serverCurrentTime);
                    queryFormModel.from_time(serverCurrentTime - (timeRange * 1000));
                }

                self.renderView4Config($("#" + modalId + "-body"), null, self.getFlowDetailsTabViewConfig(serverCurrentTime, queryFormModel, selectedFlowRecord));
            });
        },

        getFlowDetailsTabViewConfig: function (serverCurrentTime, queryFormModel, selectedFlowRecord) {
            var flowClassPrefix = selectedFlowRecord.flow_class_id,
                flowDetailsTabPrefix = cowl.QE_FLOW_DETAILS_TAB_ID + "-" + flowClassPrefix;

            var viewConfig = {
                elementId: flowDetailsTabPrefix,
                view: "TabsView",
                viewConfig: {
                    theme: cowc.TAB_THEME_WIDGET_CLASSIC,
                    tabs: [
                        {
                            elementId: flowDetailsTabPrefix + cowl.QE_INGRESS_SUFFIX_ID,
                            title: cowl.TITLE_INGRESS,
                            view: "QueryResultGridView",
                            tabConfig: {
                                activate: function () {
                                    if ($("#" + flowDetailsTabPrefix + cowl.QE_INGRESS_SUFFIX_ID).data("contrailGrid")) {
                                        $("#" + flowDetailsTabPrefix + cowl.QE_INGRESS_SUFFIX_ID).data("contrailGrid").refreshView();
                                    }
                                }
                            },
                            viewConfig: {
                                queryResultPostData: getQueryFormData(serverCurrentTime, queryFormModel, selectedFlowRecord, "ingress", false),
                                queryResultGridId: flowDetailsTabPrefix + cowl.QE_INGRESS_SUFFIX_ID,
                                gridOptions: {
                                    titleText: cowl.TITLE_FLOW_SERIES,
                                    queryQueueUrl: cowc.URL_QUERY_FLOW_QUEUE,
                                    queryQueueTitle: cowl.TITLE_FLOW
                                }
                            }
                        },
                        {
                            elementId: flowDetailsTabPrefix + cowl.QE_EGRESS_SUFFIX_ID,
                            title: cowl.TITLE_EGRESS,
                            view: "QueryResultGridView",
                            tabConfig: {
                                activate: function () {
                                    if ($("#" + flowDetailsTabPrefix + cowl.QE_EGRESS_SUFFIX_ID).data("contrailGrid")) {
                                        $("#" + flowDetailsTabPrefix + cowl.QE_EGRESS_SUFFIX_ID).data("contrailGrid").refreshView();
                                    }
                                }
                            },
                            viewConfig: {
                                queryResultPostData: getQueryFormData(serverCurrentTime, queryFormModel, selectedFlowRecord, "egress", false),
                                queryResultGridId: flowDetailsTabPrefix + cowl.QE_EGRESS_SUFFIX_ID,
                                gridOptions: {
                                    titleText: cowl.TITLE_FLOW_SERIES,
                                    queryQueueUrl: cowc.URL_QUERY_FLOW_QUEUE,
                                    queryQueueTitle: cowl.TITLE_FLOW
                                }
                            }
                        },
                        {
                            elementId: flowDetailsTabPrefix + cowl.QE_REVERSE_INGRESS_SUFFIX_ID,
                            title: cowl.TITLE_REVERSE_INGRESS,
                            view: "QueryResultGridView",
                            tabConfig: {
                                activate: function () {
                                    if ($("#" + flowDetailsTabPrefix + cowl.QE_REVERSE_INGRESS_SUFFIX_ID).data("contrailGrid")) {
                                        $("#" + flowDetailsTabPrefix + cowl.QE_REVERSE_INGRESS_SUFFIX_ID).data("contrailGrid").refreshView();
                                    }
                                }
                            },
                            viewConfig: {
                                queryResultPostData: getQueryFormData(serverCurrentTime, queryFormModel, selectedFlowRecord, "ingress", true),
                                queryResultGridId: flowDetailsTabPrefix + cowl.QE_REVERSE_INGRESS_SUFFIX_ID,
                                gridOptions: {
                                    titleText: cowl.TITLE_FLOW_SERIES,
                                    queryQueueUrl: cowc.URL_QUERY_FLOW_QUEUE,
                                    queryQueueTitle: cowl.TITLE_FLOW
                                }
                            }
                        },
                        {
                            elementId: flowDetailsTabPrefix + cowl.QE_REVERSE_EGRESS_SUFFIX_ID,
                            title: cowl.TITLE_REVERSE_EGRESS,
                            view: "QueryResultGridView",
                            tabConfig: {
                                activate: function () {
                                    if ($("#" + flowDetailsTabPrefix + cowl.QE_REVERSE_EGRESS_SUFFIX_ID).data("contrailGrid")) {
                                        $("#" + flowDetailsTabPrefix + cowl.QE_REVERSE_EGRESS_SUFFIX_ID).data("contrailGrid").refreshView();
                                    }
                                }
                            },
                            viewConfig: {
                                queryResultPostData: getQueryFormData(serverCurrentTime, queryFormModel, selectedFlowRecord, "egress", true),
                                queryResultGridId: flowDetailsTabPrefix + cowl.QE_REVERSE_EGRESS_SUFFIX_ID,
                                gridOptions: {
                                    titleText: cowl.TITLE_FLOW_SERIES,
                                    queryQueueUrl: cowc.URL_QUERY_FLOW_QUEUE,
                                    queryQueueTitle: cowl.TITLE_FLOW
                                }
                            }
                        }
                    ]
                }
            };

            return viewConfig;
        }
    });

    function getQueryFormData(serverCurrentTime, queryFormModel, selectedFlowRecord, direction, isReversed) {
        var queryResultPostData = queryFormModel.getQueryRequestPostData(serverCurrentTime),
            newQueryResultPostData = $.extend(true, {}, queryResultPostData),
            queryFormAttributes = queryResultPostData.formModelAttrs,
            newQueryFormAttributes = $.extend(true, {}, queryFormAttributes, {
                table_name: cowc.FLOW_SERIES_TABLE,
                table_type: cowc.QE_FLOW_TABLE_TYPE,
                query_prefix: cowc.FS_QUERY_PREFIX
            }),
            appendWhereClause = "", newWhereClause = "",
            oldWhereClause = queryFormAttributes.where,
            oldWhereArray;

        newQueryFormAttributes.select = "vrouter, sourcevn, sourceip, destvn, destip, protocol, sport, dport, bytes, T, packets";
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

        newQueryResultPostData.formModelAttrs = newQueryFormAttributes;

        return newQueryResultPostData;
    }


    return FormRecordDetailsTabView;
});
