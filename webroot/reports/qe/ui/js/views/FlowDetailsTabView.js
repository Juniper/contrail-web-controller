/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {

    var FormRecordDetailsTabView = ContrailView.extend({
        render: function (renderConfig) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                queryPrefix = cowc.FS_QUERY_PREFIX,
                modalId = queryPrefix + cowl.QE_RECORD_DETAILS_MODAL_SUFFIX,
                className = viewConfig['className'],
                queryFormAttributes = viewConfig['queryFormAttributes'],
                selectedFlowRecord = viewConfig['selectedFlowRecord'];

            cowu.createModal({
                'modalId': modalId,
                'className': className,
                'title': cowl.TITLE_SESSION_DETAILS,
                'body': "<div id='" + modalId + "-body" + "'></div>",
                'onSave': function () {
                    $("#" + modalId).modal('hide');
                },
                'onCancel': function () {
                    $("#" + modalId).modal('hide');
                }
            });

            self.renderView4Config($("#" + modalId + "-body"), null, self.getFlowDetailsTabViewConfig(queryFormAttributes, selectedFlowRecord));
        },

        getFlowDetailsTabViewConfig: function (queryFormAttributes, selectedFlowRecord) {
            var flowClassPrefix = selectedFlowRecord['flow_class_id'],
                flowDetailsTabPrefix = cowl.QE_FLOW_DETAILS_TAB_ID + "-" + flowClassPrefix,
                flowDetailsGridPrefix = cowl.QE_FLOW_DETAILS_GRID_ID + "-" + flowClassPrefix;

            var viewConfig = {
                    elementId: flowDetailsTabPrefix,
                    view: "TabsView",
                    viewConfig: {
                        theme: cowc.TAB_THEME_WIDGET_CLASSIC,
                        tabs: [
                            {
                                elementId: flowDetailsTabPrefix + cowl.QE_INGRESS_SUFFIX_ID,
                                title: cowl.TITLE_INGRESS,
                                view: "FlowDetailsView",
                                viewPathPrefix: "reports/qe/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                tabConfig: {
                                    activate: function (event, ui) {
                                        if ($("#" + flowDetailsTabPrefix + cowl.QE_INGRESS_SUFFIX_ID).data('contrailGrid')) {
                                            $("#" + flowDetailsTabPrefix + cowl.QE_INGRESS_SUFFIX_ID).data('contrailGrid').refreshView();
                                        }
                                    }
                                },
                                viewConfig: {
                                    formData: getQueryFormData(queryFormAttributes, selectedFlowRecord, "ingress", false),
                                    flowDetailsGridId: flowDetailsGridPrefix + cowl.QE_INGRESS_SUFFIX_ID,
                                    flowDetailsTabId: flowDetailsTabPrefix + cowl.QE_INGRESS_SUFFIX_ID
                                }
                            },
                            {
                                elementId: flowDetailsTabPrefix + cowl.QE_EGRESS_SUFFIX_ID,
                                title: cowl.TITLE_EGRESS,
                                view: "FlowDetailsView",
                                viewPathPrefix: "reports/qe/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                tabConfig: {
                                    activate: function (event, ui) {
                                        if ($("#" + flowDetailsTabPrefix + cowl.QE_EGRESS_SUFFIX_ID).data('contrailGrid')) {
                                            $("#" + flowDetailsTabPrefix + cowl.QE_EGRESS_SUFFIX_ID).data('contrailGrid').refreshView();
                                        }
                                    }
                                },
                                viewConfig: {
                                    formData: getQueryFormData(queryFormAttributes, selectedFlowRecord, "egress", false),
                                    flowDetailsGridId: flowDetailsGridPrefix + cowl.QE_EGRESS_SUFFIX_ID,
                                    flowDetailsTabId: flowDetailsTabPrefix + cowl.QE_EGRESS_SUFFIX_ID
                                }
                            },
                            {
                                elementId: flowDetailsTabPrefix + cowl.QE_REVERSE_INGRESS_SUFFIX_ID,
                                title: cowl.TITLE_REVERSE_INGRESS,
                                view: "FlowDetailsView",
                                viewPathPrefix: "reports/qe/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                tabConfig: {
                                    activate: function (event, ui) {
                                        if ($("#" + flowDetailsTabPrefix + cowl.QE_REVERSE_INGRESS_SUFFIX_ID).data('contrailGrid')) {
                                            $("#" + flowDetailsTabPrefix + cowl.QE_REVERSE_INGRESS_SUFFIX_ID).data('contrailGrid').refreshView();
                                        }
                                    }
                                },
                                viewConfig: {
                                    formData: getQueryFormData(queryFormAttributes, selectedFlowRecord, "ingress", true),
                                    flowDetailsGridId: flowDetailsGridPrefix + cowl.QE_REVERSE_INGRESS_SUFFIX_ID,
                                    flowDetailsTabId: flowDetailsTabPrefix + cowl.QE_REVERSE_INGRESS_SUFFIX_ID
                                }
                            },
                            {
                                elementId: flowDetailsTabPrefix + cowl.QE_REVERSE_EGRESS_SUFFIX_ID,
                                title: cowl.TITLE_REVERSE_EGRESS,
                                view: "FlowDetailsView",
                                viewPathPrefix: "reports/qe/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                tabConfig: {
                                    activate: function (event, ui) {
                                        if ($("#" + flowDetailsTabPrefix + cowl.QE_REVERSE_EGRESS_SUFFIX_ID).data('contrailGrid')) {
                                            $("#" + flowDetailsTabPrefix + cowl.QE_REVERSE_EGRESS_SUFFIX_ID).data('contrailGrid').refreshView();
                                        }
                                    }
                                },
                                viewConfig: {
                                    formData: getQueryFormData(queryFormAttributes, selectedFlowRecord, "egress", true),
                                    flowDetailsGridId: flowDetailsGridPrefix + cowl.QE_REVERSE_EGRESS_SUFFIX_ID,
                                    flowDetailsTabId: flowDetailsTabPrefix + cowl.QE_REVERSE_EGRESS_SUFFIX_ID
                                }
                            }
                        ]
                    }
                };

            return viewConfig;
        }
    });

    function getQueryFormData(queryFormAttributes, selectedFlowRecord, direction, isReversed) {
        var newQueryFormAttributes = $.extend(true, {}, queryFormAttributes, {table_name: cowc.FLOW_SERIES_TABLE, table_type: cowc.QE_FLOW_TABLE_TYPE, query_prefix: cowc.FS_QUERY_PREFIX}),
            appendWhereClause = "", newWhereClause = "",
            oldWhereClause = queryFormAttributes["where"],
            oldWhereArray;

        newQueryFormAttributes['select'] = "vrouter, sourcevn, sourceip, destvn, destip, protocol, sport, dport, flow_count, bytes, T, packets";
        newQueryFormAttributes['direction'] = (direction == "ingress") ? "1" : "0";

        for (var key in selectedFlowRecord) {
            switch (key) {
                case "sourcevn":
                    if(contrail.checkIfExist(selectedFlowRecord[key])) {
                        appendWhereClause += appendWhereClause.length > 0 ? " AND " : '';
                        appendWhereClause += (isReversed ? "destvn = " : "sourcevn = ") + selectedFlowRecord[key];

                        if(contrail.checkIfExist(selectedFlowRecord['sourceip'])) {
                            appendWhereClause += (isReversed ? " AND destip = " : " AND sourceip = ") + selectedFlowRecord["sourceip"];

                        }
                    }
                    break;

                case "destvn":
                    if(contrail.checkIfExist(selectedFlowRecord[key])) {
                        appendWhereClause += appendWhereClause.length > 0 ? " AND " : '';
                        appendWhereClause += (isReversed ? "sourcevn = " : "destvn = ") + selectedFlowRecord[key];

                        if(contrail.checkIfExist(selectedFlowRecord['destip'])) {
                            appendWhereClause += (isReversed ? " AND sourceip = " : " AND destip = ") + selectedFlowRecord["destip"];

                        }
                    }
                    break;

                case "protocol":
                    if(contrail.checkIfExist(selectedFlowRecord[key])) {
                        appendWhereClause += appendWhereClause.length > 0 ? " AND " : '';
                        appendWhereClause += "protocol = " + selectedFlowRecord[key];

                        if(contrail.checkIfExist(selectedFlowRecord['sport'])) {
                            appendWhereClause += (isReversed ? " AND dport = " : " AND sport = ") + selectedFlowRecord["sport"];

                        }

                        if(contrail.checkIfExist(selectedFlowRecord['dport'])) {
                            appendWhereClause += (isReversed ? " AND sport = " : " AND dport = ") + selectedFlowRecord["dport"];

                        }
                    }
                    break;
            }

        }

        if(contrail.checkIfExist(oldWhereClause) && oldWhereClause != '') {
            oldWhereArray = oldWhereClause.split(" OR ");
            for(var i = 0; i < oldWhereArray.length; i++) {
                newWhereClause += newWhereClause.length > 0 ? " OR " : '';
                newWhereClause += "(" + oldWhereArray[i].substring(1, oldWhereArray[i].length - 1) + " AND " + appendWhereClause + ")"
            }

            newQueryFormAttributes["where"] = newWhereClause;

        } else {
            newQueryFormAttributes["where"] = "(" + appendWhereClause + ")";
        }

        return newQueryFormAttributes;
    }


    return FormRecordDetailsTabView;
});