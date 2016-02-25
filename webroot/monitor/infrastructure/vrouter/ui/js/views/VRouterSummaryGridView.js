/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view' ],
        function(
                _, ContrailView) {
            var VRouterNodeGridView = ContrailView.extend({
                render: function() {
                    var self = this,
                        viewConfig = this.attributes.viewConfig,
                        pagerOptions = viewConfig['pagerOptions'];
                    this.renderView4Config(self.$el,
                    self.model,
                    getVRouterNodeSummaryGridViewConfig(pagerOptions));
                }
            });

            function getVRouterNodeSummaryGridViewConfig(pagerOptions) {
                return {
                    elementId : ctwl.VROUTER_SUMMARY_GRID_SECTION_ID,
                    view : "SectionView",
                    viewConfig : {
                        rows : [ {
                            columns : [ {
                                elementId : ctwl.VROUTER_SUMMARY_GRID_ID,
                                title : ctwl.VROUTER_SUMMARY_TITLE,
                                view : "GridView",
                                viewConfig : {
                                    elementConfig :
                                        getVRouterNodeSummaryGridConfig(
                                                pagerOptions)
                                }
                            } ]
                        } ]
                    }
                };
            }

            function getVRouterNodeSummaryGridConfig(pagerOptions) {
                var columns = [
                    {
                        field:"name",
                        name:"Host name",
                        minWidth:110,
                        formatter:function(r,c,v,cd,dc) {
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
                        cssClass: 'cell-hyperlink-blue',
                    },
                    {
                        field:"ip",
                        name:"IP Address",
                        formatter:function(r,c,v,cd,dc){
                            return monitorInfraParsers.summaryIpDisplay(dc['ip'],
                                dc['summaryIps']);
                        },
                        minWidth:110,
                        exportConfig: {
                            allow: true,
                            advFormatter: function(dc) {
                                return dc.ip;
                            }
                        },
                        sorter : comparatorIP
                    },
                    {
                        field:"version",
                        name:"Version",
                        minWidth:110
                    },
                    {
                        field:"status",
                        name:"Status",
                        formatter: function(r,c,v,cd,dc) {
                            return monitorInfraUtils.getNodeStatusContentForSummayPages(dc,'html');
                        },
                        searchFn: function(d) {
                            return monitorInfraUtils.getNodeStatusContentForSummayPages(d,'text');
                        },
                        minWidth:150,
                        exportConfig: {
                            allow: true,
                            advFormatter: function(dc) {
                                return monitorInfraUtils.getNodeStatusContentForSummayPages(dc,'text');
                            }
                        },
                        sortable:{
                            sortBy: function (d) {
                                return monitorInfraUtils.getNodeStatusContentForSummayPages(d,'text');
                            }
                        },
                        sorter:cowu.comparatorStatus
                    },
                    {
                        field:"vRouterType",
                        name:"Type",
                        formatter: function(r,c,v,cd,dc) {
                            return monitorInfraUtils.getDisplayNameForVRouterType(dc);
                        },
                        searchFn: function(d) {
                            return monitorInfraUtils.getDisplayNameForVRouterType(d);
                        },
                        minWidth:120
                    },
                    {
                        field:"cpu",
                        name: ctwl.TITLE_CPU,
                        minWidth:150,
                        formatter:function(r,c,v,cd,dc) {
                            return '<div class="gridSparkline display-inline"></div><span class="display-inline">'
                                + ifNotNumeric(dc['cpu'],'-') +  '</span>';
                        },
                        asyncPostRender: renderSparkLines,
                        searchFn:function(d){
                            return d['cpu'];
                        },
                        exportConfig: {
                            allow: true,
                            advFormatter: function(dc) {
                                return dc.cpu;
                            }
                        },
                    },
                    {
                        field:"memory",
                        name:"Memory",
                        minWidth:110,
                        sortField:"resMemory"
                    },
                    {
                        field:"vnCnt",
                        name:"Networks",
                        minWidth:100
                    },
                    {
                        field:"instCnt",
                        name:"Instances",
                        minWidth:100
                    },
                    {
                        field:"intfCnt",
                        name:"Interfaces",
                        formatter:function(r,c,v,cd,dc){
                            return contrail.format(
                                    "{0} Total{1}",
                                    dc['intfCnt'],
                                    dc['errorIntfCntText']);
                        },
                        minWidth:150
                    },
                ];
                var gridElementConfig = {
                    header : {
                        title : {
                            text : ctwl.VROUTER_SUMMARY_TITLE
                        },
                        defaultControls: {
                           refreshable: false,
                        },
                    },
                    columnHeader : {
                        columns : columns
                    },
                    body : {
                        options : {
                          lazyLoading: false,
                          detail : false,
                          enableAsyncPostRender:true,
                          checkboxSelectable : false
                        },
                        dataSource : {
                            remote : {
                                ajaxConfig : {
                                    url : ctwl.VROUTER_SUMMARY
                                }
                            },
                            cacheConfig : {
                            // ucid: smwc.UCID_ALL_CLUSTER_LIST
                            }
                        },
                        statusMessages: {
                            loading: {
                                text: 'Loading Virtual Routers..',
                            },
                            empty: {
                                text: 'No Virtual Routers to display'
                            },
                            errorGettingData: {
                                type: 'error',
                                iconClasses: 'icon-warning',
                                text: 'Error in getting Data.'
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

            };

            return VRouterNodeGridView;
        });
