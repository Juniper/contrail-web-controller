/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
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

            function getDisplayNameForVRouterType(type){
                switch (type){
                    case 'tor-agent':
                        return 'TOR Agent';
                    case 'tor-service-node':
                        return 'TOR Service Node';
                    case 'embedded':
                        return 'Embedded';
                    case 'hypervisor':
                        return 'Hypervisor';
                }
            }

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
                           onClick: function(e,dc){
                              onComputeNodeChange(dc);
                           }
                        },
                        cssClass: 'cell-hyperlink-blue',
                    },
                    {
                        field:"ip",
                        name:"IP Address",
                        formatter:function(r,c,v,cd,dc){
                            return summaryIpDisplay(dc['ip'],dc['summaryIps']);
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
                            return getNodeStatusContentForSummayPages(dc,'html');
                        },
                        searchFn: function(d) {
                            return getNodeStatusContentForSummayPages(d,'text');
                        },
                        minWidth:150,
                        exportConfig: {
            				allow: true,
            				advFormatter: function(dc) {
            					return getNodeStatusContentForSummayPages(dc,'text');
            				}
            			},                    
            		},
            		{
                        field:"vRouterType",
                        name:"Type",
                        formatter: function(r,c,v,cd,dc) {
                            return getDisplayNameForVRouterType(v);
                        },
                        searchFn: function(d) {
                            return getDisplayNameForVRouterType(d.vRouterType);
                        },
                        minWidth:120
                    },
                    {
                        field:"cpu",
                        name:"CPU (%)",
                        minWidth:150,
                        formatter:function(r,c,v,cd,dc) {
                            return '<div class="gridSparkline display-inline"></div><span class="display-inline">'  + ifNotNumeric(dc['cpu'],'-') +  '</span>';
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
                            return contrail.format("{0} Total{1}",dc['intfCnt'],dc['errorIntfCntText']);
                        },
                        minWidth:150
                    },
                ];
                var gridElementConfig = {
                    header : {
                        title : {
                            text : ctwl.VROUTER_SUMMARY_TITLE
                        }
                    },
                    columnHeader : {
                        columns : columns
                    },
                    body : {
                        options : {
                          detail : false,
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
                        }
                    }
                };
                return gridElementConfig;
            }

            return VRouterNodeGridView;
        });
