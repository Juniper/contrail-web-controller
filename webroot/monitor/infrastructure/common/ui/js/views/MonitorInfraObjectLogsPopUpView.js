/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'query-form-view',
    'reports/qe/ui/js/models/ObjectLogsFormModel',
    'core-basedir/reports/qe/ui/js/common/qe.utils'
],    function (_, ContrailView, Knockback, QueryFormView, ObjectLogsFormModel, qeUtils) {
    var MonitorInfrObjectLogsPopUpView = QueryFormView.extend({
        render : function (options) {
            var self = this;
            //Create the empty modal
            var prefixId = 'mon-infra-obj-logs'
            var modalTemplate =
                contrail.getTemplate4Id('core-modal-template');
            var modalId = 'mon-infra-object-logs-modal';
            var formId = prefixId + '_modal';
            var modalLayout = modalTemplate({prefixId: prefixId, modalId: modalId});
            var modalConfig = {
                    'modalId': modalId,
                    'className': 'modal-840',
                    'body': modalLayout,
                    'title' : 'Object Logs (last 30mins)',
                    'onCancel': function() {
                        $("#" + modalId).modal('hide');
                    }
                }
            var modelMap = contrail.handleIfNull(self.modelMap, {});
            var queryResultTabId = cowl.QE_OBJECT_LOGS_TAB_ID;
            var tableNameMap = {
                    "vRouter"   : "ObjectBgpRouter",
                    "XMPP_peer" : "ObjectXmppPeerInfo",
                    "BGP_peer"  : "ObjectBgpPeer",
                    "vn"        : "ObjectVNTable"
            };
            cowu.createModal(modalConfig);

            var whereClause = "(ObjectId =" + options.objId +")";
            queryFormModel = new ObjectLogsFormModel ({
                                time_Range:1800,
                                select:"MessageTS, ObjectId, Source, ObjectLog",
                                table_name: tableNameMap[options.type],
                                where: whereClause
                            });
            queryFormModel.is_request_in_progress(true);
            qeUtils.fetchServerCurrentTime(function(serverCurrentTime) {
                var timeRange = parseInt(queryFormModel.time_range()),
                    queryRequestPostData;

                if (timeRange !== -1) {
                    queryFormModel.to_time(serverCurrentTime);
                    queryFormModel.from_time(serverCurrentTime - (timeRange * 1000));
                }

                queryRequestPostData = queryFormModel.getQueryRequestPostData(serverCurrentTime);

                self.renderView4Config($("#" + modalId).find('#' + formId), queryFormModel,
                        getQueryResultTabViewConfig (queryRequestPostData, queryResultTabId), null, null, modelMap,
                    function() {
                        var queryResultListModel = modelMap[cowc.UMID_QUERY_RESULT_LIST_MODEL];

                        queryResultListModel.onAllRequestsComplete.subscribe(function () {
                            queryFormModel.is_request_in_progress(false);
                        });
                    }
                );
            });
        }
    });

    function getQueryResultTabViewConfig(queryRequestPostData, queryResultTabId) {
        return {
            elementId: queryResultTabId,
            view: "TabsView",
            viewConfig: {
                theme: cowc.TAB_THEME_WIDGET_CLASSIC,
                tabs: [getQueryResultGridViewConfig(queryRequestPostData)]
            }
        };
    }

    function getQueryResultGridViewConfig(queryRequestPostData) {
        var queryResultGridId = cowl.QE_QUERY_RESULT_GRID_ID;

        return {
            elementId: queryResultGridId,
            title: cowl.TITLE_RESULTS,
            iconClass: 'fa fa-table',
            view: 'QueryResultGridView',
            tabConfig: {
                activate: function (event, ui) {
                    if ($('#' + queryResultGridId).data('contrailGrid')) {
                        $('#' + queryResultGridId).data('contrailGrid').refreshView();
                    }
                }
            },
            viewConfig: {
                queryRequestPostData: queryRequestPostData,
                gridOptions: {
                    queryQueueUrl: cowc.URL_QUERY_LOG_QUEUE,
                    queryQueueTitle: cowl.TITLE_LOG,
                    fixedRowHeight: false
                }
            }
        }
    }

    return MonitorInfrObjectLogsPopUpView;
});
