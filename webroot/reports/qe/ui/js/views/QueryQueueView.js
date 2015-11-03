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
                queryQueuePageTmpl = contrail.getTemplate4Id(ctwc.TMPL_QUERY_QUEUE_PAGE),
                queryQueueType = viewConfig.queueType,
                queryQueueGridId = cowc.QE_HASH_ELEMENT_PREFIX + queryQueueType + cowc.QE_QUEUE_GRID_SUFFIX;

            self.$el.append(queryQueuePageTmpl({queryQueueType: queryQueueType }));

            var queueRemoteConfig = {
                ajaxConfig: {
                    url: "/api/qe/query/queue?queryQueue=" + queryQueueType,
                    type: 'GET'
                },
                dataParser: function (response) {
                    return response;
                }
            };

            var listModelConfig = {
                remote: queueRemoteConfig
            };

            self.model = new ContrailListModel(listModelConfig);
            self.renderView4Config($(queryQueueGridId), self.model, self.getQueryQueueViewConfig(queueRemoteConfig));
        },

        getQueryQueueViewConfig: function (queueRemoteConfig) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];

            var resultsViewConfig = {
                elementId: cowl.QE_FLOW_QUEUE_GRID_ID,
                title: cowl.TITLE_FLOW_QUERY_QUEUE,
                view: "GridView",
                viewConfig: {
                    elementConfig: getQueryQueueGridConfig(queueRemoteConfig, pagerOptions, self)
                }
            };

            return resultsViewConfig;
        },

        renderQueryQueueResult: function(queryQueueItem) {
            var self = this, viewConfig = self.attributes.viewConfig,
                queryQueueType = viewConfig.queueType,
                queryQueueGridId = cowc.QE_HASH_ELEMENT_PREFIX + queryQueueType + cowc.QE_QUEUE_GRID_SUFFIX,
                queryQueueResultId = cowc.QE_HASH_ELEMENT_PREFIX + queryQueueType + cowc.QE_QUEUE_RESULT_SUFFIX;

            $(queryQueueGridId).data('contrailGrid').collapse();

            self.renderView4Config($(queryQueueResultId), null, getFlowSeriesViewConfig(queryQueueItem));
        }

    });

    function getQueryQueueGridConfig(queueRemoteConfig, pagerOptions, queryQueueView) {
        var queryQueueListModel = queryQueueView.model,
            gridElementConfig = {
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
                    checkboxSelectable: true,
                    fixedRowHeight: 30,
                    actionCell: [
                        {
                            title: 'View Results',
                            iconClass: 'icon-list-alt',
                            onClick: function(rowIndex){
                                queryQueueView.renderQueryQueueResult(queryQueueListModel.getItem(rowIndex));

                            }
                        },
                        {
                            title: 'Delete',
                            iconClass: 'icon-trash',
                            onClick: function(rowIndex){
                                console.log(rowIndex)
                            }
                        }
                    ]
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

    function getFlowSeriesViewConfig(queryQueueItem) {
        return {
            elementId: cowl.QE_FLOW_SERIES_TAB_ID,
            view: "TabsView",
            viewConfig: {
                theme: cowc.TAB_THEME_OVERCAST,
                tabs: [
                    {
                        elementId: cowl.QE_FLOW_SERIES_ID,
                        title: cowl.TITLE_QUERY,
                        view: "FlowSeriesFormView",
                        viewPathPrefix: "reports/qe/ui/js/views/",
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        viewConfig: {
                            formData: formatFormData(queryQueueItem)
                        }
                    },
                    {
                        view: "FlowSeriesResultView",
                        viewPathPrefix: "reports/qe/ui/js/views/",
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        viewConfig: {
                            formData: formatFormData(queryQueueItem),
                            queryType: 'queue'
                        }
                    }
                ]
            }
        };
    };

    function formatFormData(formData) {
        var formModelData = formData.reRunQueryString.formModelAttrs;

        formModelData.queryId = formData.queryId;

        return formModelData;
    }

    return QueryQueueView;
});