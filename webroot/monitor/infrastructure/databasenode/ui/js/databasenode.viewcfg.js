/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define(['lodash', 'contrail-view', 'monitor-infra-confignode-model', 'node-color-mapping'],
        function(_, ContrailView, configNodeListModelCfg, NodeColorMapping){
    var DatabaseNodeViewConfig = function () {
        var self = this;
        self.viewConfig = {
            'DATABASENODE_GRID_VIEW': {
                templates: ['webroot/monitor/infrastructure/databasenode/ui/templates/databasenode.tmpl'],
                elementId: ctwl.DATABASENODE_SUMMARY_GRID_ID,
                title: ctwl.DATABASENODE_SUMMARY_TITLE,
                view: "GridView",
                viewConfig: {
                    elementConfig: function() {
                        return getDatabaseNodeSummaryGridConfig('database-grid-view', 'databaseNode');
                    }
                }
            }
        };
        function getDatabaseNodeSummaryGridConfig(widgetId, type) {
            var columns = [
                           {
                               field: "name",
                               name: "Host name",
                               formatter: function(r,c,v,cd,dc) {
                                  return cellTemplateLinks({cellText: 'name',
                                      name: 'name',
                                      statusBubble: true,
                                      rowData: dc,
                                      tagColorMap: NodeColorMapping.getNodeColorMap(_.pluck(cowu.getGridItemsForWidgetId(widgetId), 'name'),null, type)
                                  });
                               },
                               events: {
                                  onClick: onClickHostName
                               },
                               cssClass: 'cell-hyperlink-blue',
                               searchFn: function(d) {
                                   return d['name'];
                               },
                               minWidth: 90,
                               exportConfig: {
                                   allow: true,
                                   advFormatter: function(dc) {
                                       return dc.name;
                                   }
                               }
                           },
                           {
                               field: "ip",
                               name: "IP Address",
                               minWidth: 110,
                               sorter: comparatorIP
                           },
                           {
                               field: "version",
                               id: "version",
                               name: "Version",
                               sortable: true,
                               minWidth: 110
                           },
                           {
                               field: "status",
                               id: "status",
                               name: "Status",
                               sortable: true,
                               formatter: function(r,c,v,cd,dc) {
                                   return monitorInfraUtils.getNodeStatusContentForSummayPages(dc,'html');
                               },
                               searchFn: function(d) {
                                   return monitorInfraUtils.getNodeStatusContentForSummayPages(d,'text');
                               },
                               minWidth: 110,
                               exportConfig: {
                                   allow: true,
                                   advFormatter: function(dc) {
                                       return monitorInfraUtils.getNodeStatusContentForSummayPages(dc,
                                           'text');
                                   }
                               },
                               sortable: {
                                   sortBy: function (d) {
                                       return monitorInfraUtils.getNodeStatusContentForSummayPages(d,'text');
                                   }
                               },
                               sorter: cowu.comparatorStatus
                           },
                           {
                               field: "formattedAnalyticsDbSize",
                               name: "Analytics DB Size",
                               minWidth: 110,
                               sortField: "analyticsDbSize"
                           },
                           {
                               field: "formattedAvailableSpace",
                               name: "Available Space",
                               minWidth: 110,
                               sortField: "dbSpaceAvailable"
                           },
                           {
                               field: "formattedUsedSpace",
                               name: "Used Space",
                               minWidth: 110,
                               sortField: "dbSpaceUsed"
                           }
                        ];
                        var gridElementConfig = {
                            header: {
                                title: {
                                    text: ctwl.DATABASENODE_SUMMARY_TITLE
                                },
                            },
                            columnHeader: {
                                columns: columns
                            },
                            body: {
                                options: {
                                  detail: false,
                                  checkboxSelectable: false,
                                  fixedRowHeight: 30
                                },
                                dataSource: {
                                    remote: {
                                        ajaxConfig: {
                                            url: ctwl.DATABASENODE_SUMMARY
                                        }
                                    },
                                    cacheConfig: {
                                        ucid: ctwl.CACHE_DATABASENODE
                                    }
                                },
                                statusMessages: {
                                    loading: {
                                        text: 'Loading Database Nodes..'
                                    },
                                    empty: {
                                        text: 'No Database Nodes Found.'
                                    }
                                }
                            },footer: {
                                pager: {
                                    options: {
                                        pageSize: 10
                                    }
                                }
                            }
                        };
                        return gridElementConfig;
                    }
        function onClickHostName(e, selRowDataItem) {
            var name = selRowDataItem.name, hashParams = null,
                triggerHashChange = true, hostName;

            hostName = selRowDataItem['name'];
            var hashObj = {
                    type: "databaseNode",
                    view: "details",
                    focusedElement: {
                        node: name,
                        tab: 'details'
                    }
                };
            if(contrail.checkIfKeyExistInObject(true,
                    hashParams, 'clickedElement')) {
                hashObj.clickedElement = hashParams.clickedElement;
            }

            layoutHandler.setURLHashParams(hashObj, {
                p: "mon_infra_database",
                merge: false,
                triggerHashChange: triggerHashChange});

        }
    };
    return (new DatabaseNodeViewConfig()).viewConfig;
});
