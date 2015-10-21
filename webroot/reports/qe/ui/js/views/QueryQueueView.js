/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'query-result-view',
    'contrail-list-model'
], function (_, QueryResultView, ContrailListModel) {
    var QueryQueueView = QueryResultView.extend({
        render: function () {
            var self = this, viewConfig = self.attributes.viewConfig,
                queueType = viewConfig.queueType,
                contrailListModel;

            var queueRemoteConfig = {
                ajaxConfig: {
                    url: "/api/qe/query/queue?queryQueue=" + queueType,
                    type: 'GET'
                },
                dataParser: function (response) {
                    return response;
                }
            };

            var listModelConfig = {
                remote: queueRemoteConfig
            };

            contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(self.$el, contrailListModel, self.getViewConfig(queueRemoteConfig));
        },

        getViewConfig: function (queueRemoteConfig) {
            var self = this, viewConfig = self.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];

            var resultsViewConfig = {
                elementId: cowl.QE_FLOW_QUEUE_GRID_ID,
                title: cowl.TITLE_FLOW_QUERY_QUEUE,
                view: "GridView",
                viewConfig: {
                    elementConfig: getQueryQueueGridConfig(queueRemoteConfig, pagerOptions)
                }
            };

            return resultsViewConfig;
        }
    });

    function getQueryQueueGridConfig(queueRemoteConfig, pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: cowl.TITLE_FLOW_QUERY_QUEUE,
                    icon : 'icon-table'
                },
                defaultControls: {
                    collapseable: true,
                    exportable: true,
                    refreshable: false,
                    searchable: true
                }
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    fixedRowHeight: 30
                },
                dataSource: {
                    remote: queueRemoteConfig
                }
            },
            columnHeader: {
                columns: qewgc.getQueueColumnDisplay()
            },
            footer: {
                pager: contrail.handleIfNull(pagerOptions, { options: { pageSize: 100, pageSizeSelect: [100, 200, 300, 500] } })
            }
        };
        return gridElementConfig;
    };

    return QueryQueueView;
});