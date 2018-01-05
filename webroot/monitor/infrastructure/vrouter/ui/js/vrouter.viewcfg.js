/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define(['lodash', 'contrail-view', 'monitor-infra-confignode-model'],
        function(_, ContrailView, configNodeListModelCfg){
    var VRouterViewConfig = function () {
        var self = this;
        self.viewConfig = {
            'VROUTER_GRID_VIEW': {
                elementId: ctwl.VROUTER_SUMMARY_GRID_ID,
                title: ctwl.VROUTER_SUMMARY_TITLE,
                view: "GridView",
                viewConfig: {
                    elementConfig:
                        getVRouterNodeSummaryGridConfig()
                }
            }
        };
        function getVRouterNodeSummaryGridConfig() {
                var columns = [
                    {
                        field: "name",
                        name: "Host name",
                        minWidth: 110,
                        formatter: function(r,c,v,cd,dc) {
                           return cellTemplateLinks({
                               cellText: 'name',
                               name: 'name',
                               statusBubble: true,
                               rowData: dc
                           });
                        },
                        exportConfig: {
                            allow: true,
                            advFormatter: function(dc) {
                                return dc.name;
                            }
                        },
                        events: {
                           onClick: onClickHostName
                        },
                        cssClass: 'cell-hyperlink-blue'
                    },
                    {
                        field: "ip",
                        name: "IP Address",
                        formatter: function(r,c,v,cd,dc){
                            return monitorInfraParsers.summaryIpDisplay(dc['ip'],
                                dc['summaryIps']);
                        },
                        minWidth: 110,
                        exportConfig: {
                            allow: true,
                            advFormatter: function(dc) {
                                return dc.ip;
                            }
                        },
                        sorter: comparatorIP
                    },
                    {
                        field: "version",
                        name: "Version",
                        minWidth: 110
                    },
                    {
                        field: "status",
                        name: "Status",
                        formatter: function(r,c,v,cd,dc) {
                            return monitorInfraUtils.getNodeStatusContentForSummayPages(dc,'html');
                        },
                        searchFn: function(d) {
                            return monitorInfraUtils.getNodeStatusContentForSummayPages(d,'text');
                        },
                        minWidth: 150,
                        exportConfig: {
                            allow: true,
                            advFormatter: function(dc) {
                                return monitorInfraUtils.getNodeStatusContentForSummayPages(dc,'text');
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
                        field: "vRouterType",
                        name: "Type",
                        hide: true,
                        formatter: function(r,c,v,cd,dc) {
                            return monitorInfraUtils.getDisplayNameForVRouterType(dc);
                        },
                        searchFn: function(d) {
                            return monitorInfraUtils.getDisplayNameForVRouterType(d);
                        },
                        minWidth: 120
                    },
                    {
                        field: "cpu",
                        name: ctwl.TITLE_CPU,
                        minWidth: 150,
                        formatter: function(r,c,v,cd,dc) {
                            return '<div class="gridSparkline display-inline"></div><span class="display-inline">'
                                + ifNotNumeric(dc['cpu'],'-') +  '</span>';
                        },
                        asyncPostRender: renderSparkLines,
                        searchFn: function(d){
                            return d['cpu'];
                        },
                        exportConfig: {
                            allow: true,
                            advFormatter: function(dc) {
                                return dc.cpu;
                            }
                        }
                    },
                    {
                        field: "memory",
                        name: "Memory",
                        minWidth: 110,
                        sortField: "resMemory"
                    },
                    {
                        field: "vnCnt",
                        name: "Networks",
                        minWidth: 100
                    },
                    {
                        field: "instCnt",
                        name: "Instances",
                        minWidth: 100
                    },
                    {
                        field: "intfCnt",
                        name: "Interfaces",
                        formatter: function(r,c,v,cd,dc){
                            return contrail.format(
                                    "{0} Total{1}",
                                    dc['intfCnt'],
                                    dc['errorIntfCntText']);
                        },
                        minWidth: 150
                    }
                ];
                var gridElementConfig = {
                    header: {
                        title: {
                            text: ctwl.VROUTER_SUMMARY_TITLE
                        },
                        defaultControls: {
                           refreshable: false,
                           columnPickable: true
                        }
                    },
                    columnHeader: {
                        columns: columns
                    },
                    body: {
                        options: {
                          lazyLoading: false,
                          detail: false,
                          enableAsyncPostRender: true,
                          checkboxSelectable: false,
                          fixedRowHeight: 30
                        },
                        dataSource: {
                            remote: {
                                ajaxConfig: {
                                    url: ctwl.VROUTER_SUMMARY
                                }
                            },
                            cacheConfig: {
                            // ucid: smwc.UCID_ALL_CLUSTER_LIST
                            }
                        },
                        statusMessages: {
                            loading: {
                                text: 'Loading Virtual Routers..'
                            },
                            empty: {
                                text: 'No Virtual Routers Found.'
                            }
                        }
                    },footer: {
                        pager: {
                            options: {
                                pageSize: 50
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
                        type: "vrouter",
                        view: "details",
                        focusedElement: {
                            node: name,
                            tab: 'details'
                        }
                    };

                if(contrail.checkIfKeyExistInObject(true,
                                hashParams,
                                'clickedElement')) {
                    hashObj.clickedElement = hashParams.clickedElement;
                }

                layoutHandler.setURLHashParams(hashObj, {
                    p: "mon_infra_vrouter",
                    merge: false,
                    triggerHashChange: triggerHashChange});

            }

        self.getViewConfig = function(id) {
            return self.viewConfig[id];
        };
    };
    return (new VRouterViewConfig()).viewConfig;
});
