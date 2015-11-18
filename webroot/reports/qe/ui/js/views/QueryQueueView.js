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
            var self = this,
                viewConfig = self.attributes.viewConfig,
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
                queryQueueType = viewConfig.queueType,
                pagerOptions = viewConfig['pagerOptions'],
                queueColorMap = [null, null, null, null, null];

            var resultsViewConfig = {
                elementId: cowl.QE_FLOW_QUEUE_GRID_ID,
                title: cowl.TITLE_FLOW_QUERY_QUEUE,
                view: "GridView",
                viewConfig: {
                    elementConfig: getQueryQueueGridConfig(queryQueueType, queueRemoteConfig, pagerOptions, self, queueColorMap)
                }
            };

            return resultsViewConfig;
        },

        renderQueryQueueResult: function(queryQueueItem, queryResultType, queueColorMap, renderCompleteCB) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                childViewMap = self.childViewMap,
                queryQueueResultTabView = contrail.checkIfExist(childViewMap[cowl.QE_FLOW_QUEUE_TAB_ID]) ? childViewMap[cowl.QE_FLOW_QUEUE_TAB_ID] : null,
                queryQueueType = viewConfig.queueType,
                queryQueueGridId = cowc.QE_HASH_ELEMENT_PREFIX + queryQueueType + cowc.QE_QUEUE_GRID_SUFFIX,
                queryQueueResultId = cowc.QE_HASH_ELEMENT_PREFIX + queryQueueType + cowc.QE_QUEUE_RESULT_SUFFIX;

            $(queryQueueGridId).data('contrailGrid').collapse();

            if (queryQueueResultTabView === null) {
                self.renderView4Config($(queryQueueResultId), null, getQueryQueueTabViewConfig(queryQueueItem, queryResultType, queueColorMap), null, null, null, renderCompleteCB);
            } else {
                queryQueueResultTabView.renderNewTab(cowl.QE_FLOW_QUEUE_TAB_ID, getFlowSeriesTabConfig(queryQueueItem, queryResultType, queueColorMap), true);
                renderCompleteCB();
            }
        }

    });

    function getQueryQueueGridConfig(queryQueueType, queueRemoteConfig, pagerOptions, queryQueueView, queueColorMap) {
        return {
            header: {
                title: {
                    text: cowl.TITLE_FLOW_QUERY_QUEUE,
                    icon : 'icon-table'
                },
                defaultControls: {
                    collapseable: true,
                    exportable: true,
                    refreshable: true,
                    searchable: true
                },
                advanceControls: [
                    {
                        type: 'link',
                        linkElementId: cowl.QE_DELETE_MULTIPLE_QUERY_QUEUE_CONTROL_ID,
                        disabledLink: true,
                        title: cowl.TITLE_DELETE_ALL_QUERY_QUEUE,
                        iconClass: 'icon-trash',
                        onClick: function (event, gridContainer, key) {
                            if (!$('#' + cowl.QE_DELETE_MULTIPLE_QUERY_QUEUE_CONTROL_ID).hasClass('disabled-link')) {
                                var gridCheckedRows = $(gridContainer).data('contrailGrid').getCheckedRows(),
                                    queryIds = $.map(gridCheckedRows, function(rowValue, rowKey) {
                                        return rowValue.queryReqObj.queryId;
                                    });

                                showDeleteQueueModal(queryQueueType, queryIds, queueColorMap);
                            }
                        }
                    }
                ]
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#' + cowl.QE_DELETE_MULTIPLE_QUERY_QUEUE_CONTROL_ID).addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#' + cowl.QE_DELETE_MULTIPLE_QUERY_QUEUE_CONTROL_ID).removeClass('disabled-link');
                        }
                    },
                    actionCell: function(dc){
                        return getQueueActionColumn(queryQueueType, dc, queryQueueView, queueColorMap);
                    }
                },
                dataSource: {
                    remote: queueRemoteConfig
                }
            },
            columnHeader: {
                columns: qewgc.getQueueColumnDisplay()
            },
            footer: {
                pager: contrail.handleIfNull(pagerOptions, { options: { pageSize: 5, pageSizeSelect: [5, 10, 25, 50] } })
            }
        };
    };

    function getQueueActionColumn(queryQueueType, queryQueueItem, queryQueueView, queueColorMap) {
        var queryQueueListModel = queryQueueView.model,
            queryFormModelData = queryQueueItem.queryReqObj.formModelAttrs,
            status = queryQueueItem.status,
            queryId = queryQueueItem.queryReqObj.queryId,
            errorMessage = queryQueueItem.errorMessage,
            reRunTimeRange = queryFormModelData.rerun_time_range,
            actionCell = [];

        if(status == 'queued'){
            return actionCell;
        }

        if(status != "error") {
            actionCell.push({
                title: 'View Results',
                iconClass: 'icon-list-alt',
                onClick: function(rowIndex){
                    var queryQueueItem = queryQueueListModel.getItem(rowIndex);
                    viewOrRerunQueryAction (queryQueueItem, queryQueueView, queueColorMap, 'queue');
                }
            });
        } else if(errorMessage != null) {
            if(errorMessage.message != null && errorMessage.message != '') {
                errorMessage = errorMessage.message;
            }
            //TODO - test this
            actionCell.push({
                title: 'View Error',
                iconClass: 'icon-exclamation-sign',
                onClick: function(rowIndex){
                    //TODO - create info modal
                    showInfoWindow(errorMessage,'Error');
                }
            });
        }

        if(reRunTimeRange !== null && reRunTimeRange != -1) {
            actionCell.push({
                title: 'Rerun Query',
                iconClass: 'icon-repeat',
                onClick: function(rowIndex){
                    var queryQueueItem = queryQueueListModel.getItem(rowIndex);
                    viewOrRerunQueryAction (queryQueueItem, queryQueueView, queueColorMap, 'rerun');
                }
            });
        }

        actionCell.push({
            title: 'Delete Query',
            iconClass: 'icon-trash',
            onClick: function(rowIndex){
                showDeleteQueueModal(queryQueueType, [queryId], queueColorMap)
            }
        });

        return actionCell;
    };

    function viewOrRerunQueryAction (queryQueueItem, queryQueueView, queueColorMap, queryType) {
        if (_.compact(queueColorMap).length < 5) {
            var queryId = queryQueueItem.queryReqObj.queryId,
                badgeColorKey = getBadgeColorkey4Value(queueColorMap, null),
                tabLinkId = cowl.QE_FLOW_QUEUE_TAB_ID + '-' + queryId + '-tab-link';

            if ($('#' + tabLinkId).length === 0) {
                queryQueueView.renderQueryQueueResult(queryQueueItem, queryType, queueColorMap, function() {
                    $('#label-icon-badge-' + queryId).addClass('icon-badge-color-' + badgeColorKey);
                    $('#' + tabLinkId).find('.contrail-tab-link-icon').addClass('icon-badge-color-' + badgeColorKey);
                    $('#' + tabLinkId).data('badge_color_key', badgeColorKey)
                    queueColorMap[badgeColorKey] = queryId;
                });
            } else {
                //TODO - create info modal
                showInfoWindow('Query Result has already been loaded.', 'Error');
            }
        } else {
            //TODO - create info modal
            showInfoWindow('Maximum 5 Query Results can be viewed. Please close the existing query results to view new queries from queue.', 'Error');
        }
    }

    function showDeleteQueueModal(queryQueueType, queryIds, queueColorMap) {
        var modalId = queryQueueType + cowl.QE_WHERE_MODAL_SUFFIX;
        cowu.createModal({
            modalId: modalId,
            className: 'modal-700',
            title: 'Delete Query', btnName: 'Confirm',
            body: 'Are you sure you want to remove this query?',
            onSave: function () {
                var postDataJSON = {queryQueue: queryQueueType, queryIds: queryIds},
                    ajaxConfig = {
                        url: '/api/qe/query',
                        type: 'DELETE',
                        data: JSON.stringify(postDataJSON)
                    };
                contrail.ajaxHandler(ajaxConfig, null, function() {
                    var queryQueueGridId = cowc.QE_HASH_ELEMENT_PREFIX + queryQueueType + cowc.QE_QUEUE_GRID_SUFFIX;
                    $(queryQueueGridId).data('contrailGrid').refreshData();

                    $.each(queryIds, function(queryIdKey, queryIdValue) {
                        removeBadgeColorFromQueryQueue(queueColorMap, queryIdValue.queryId);
                    });
                });
                $("#" + modalId).modal('hide');
            }, onCancel: function () {
                $("#" + modalId).modal('hide');
            }
        });
    }

    function getQueryQueueTabViewConfig(queryQueueItem, queryResultType, queueColorMap) {
        return {
            elementId: cowl.QE_FLOW_QUEUE_TAB_ID,
            view: "TabsView",
            viewConfig: {
                theme: cowc.TAB_THEME_WIDGET_CLASSIC,
                tabs: getFlowSeriesTabConfig(queryQueueItem, queryResultType, queueColorMap)
            }
        };
    };

    function getFlowSeriesTabConfig(queryQueueItem, queryResultType, queueColorMap) {
        var queryFormAttributes = queryQueueItem.queryReqObj,
            queryPrefix = queryFormAttributes.formModelAttrs.query_prefix,
            queryId = queryFormAttributes.queryId,
            queryIdSuffix = '-' + queryId,
            tabViewName = '', tabTitle = '', tabElementId;

        if (queryPrefix === cowc.FS_QUERY_PREFIX) {
            tabElementId = cowl.QE_FLOW_SERIES_ID + queryIdSuffix;
            tabViewName = 'FlowSeriesFormView';
            tabTitle = cowl.TITLE_FLOW_SERIES;
        } else if (queryPrefix === cowc.FR_QUERY_PREFIX) {
            tabElementId = cowl.QE_FLOW_RECORD_ID + queryIdSuffix;
            tabViewName = 'FlowRecordFormView';
            tabTitle = cowl.TITLE_FLOW_RECORD;
        }

        return [{
            elementId: cowl.QE_FLOW_QUEUE_TAB_ID + queryIdSuffix,
            title: tabTitle,
            iconClass: 'icon-table',
            view: "SectionView",
            tabConfig: {
                activate: function(event, ui) {
                    var flowResultGridId = '';

                    if (queryPrefix === cowc.FS_QUERY_PREFIX) {
                        flowResultGridId = cowl.QE_FLOW_SERIES_GRID_ID + queryIdSuffix;
                    } else if (queryPrefix === cowc.FR_QUERY_PREFIX) {
                        flowResultGridId = cowl.QE_FLOW_RECORD_GRID_ID + queryIdSuffix;
                    }

                    if ($('#' + flowResultGridId).data('contrailGrid')) {
                        $('#' + flowResultGridId).data('contrailGrid').refreshView();
                    }
                },
                removable: true,
                onRemoveTab: function () {
                    removeBadgeColorFromQueryQueue(queueColorMap, queryId);
                }
            },
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: tabElementId,
                                view: tabViewName,
                                viewPathPrefix: "reports/qe/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    queryFormAttributes: queryFormAttributes,
                                    queryResultType: queryResultType,
                                    widgetConfig: {
                                        elementId: cowl.QE_FLOW_SERIES_ID + queryIdSuffix + '-widget',
                                        view: "WidgetView",
                                        viewConfig: {
                                            header: {
                                                title: cowl.TITLE_QUERY,
                                                iconClass: "icon-search"
                                            },
                                            controls: {
                                                top: {
                                                    default: {
                                                        collapseable: true
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        }];
    }

    function removeBadgeColorFromQueryQueue(queueColorMap, queryId) {
        var badgeColorKey = getBadgeColorkey4Value(queueColorMap, queryId);

        if (badgeColorKey !== null) {
            $('#label-icon-badge-' + queryId).removeClass('icon-badge-color-' + badgeColorKey);
            queueColorMap[badgeColorKey] = null;

        }
    }

    function getBadgeColorkey4Value(queueColorMap, value) {
        var badgeColorKey = null;

        $.each(queueColorMap, function(colorKey, colorValue) {
            if (colorValue === value) {
                badgeColorKey = colorKey;
                return false;
            }
        });

        return badgeColorKey
    }

    return QueryQueueView;
});