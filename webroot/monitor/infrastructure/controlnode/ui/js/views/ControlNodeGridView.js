/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view' ],
        function(
                _, ContrailView) {
            var ControlNodeGridView = ContrailView
                    .extend({
                        render : function() {
                            var self = this, 
                                viewConfig = this.attributes.viewConfig, 
                                pagerOptions = viewConfig['pagerOptions'];
                            this.renderView4Config(self.$el,
                            self.model,
                            getControlNodeSummaryGridViewConfig(pagerOptions));
                        }
                    });

            function getControlNodeSummaryGridViewConfig(
                    pagerOptions) {
                return {
                    elementId : ctwl.CONTROLNODE_SUMMARY_GRID_SECTION_ID,
                    view : "SectionView",
                    viewConfig : {
                        rows : [ {
                            columns : [ {
                                elementId : ctwl.CONTROLNODE_SUMMARY_GRID_ID,
                                title : ctwl.CONTROLNODE_SUMMARY_TITLE,
                                view : "GridView",
                                viewConfig : {
                                    elementConfig : 
                                        getControlNodeSummaryGridConfig(
                                                pagerOptions)
                                }
                            } ]
                        } ]
                    }
                };
            }

            function getControlNodeSummaryGridConfig(
                    pagerOptions) {
                var columns = [
                   {
                       field:"name",
                       name:"Host name",
                       formatter:function(r,c,v,cd,dc) {
                          return cellTemplateLinks({cellText:'name',
                              name:'name',
                              statusBubble:true,
                              rowData:dc});
                       },
                       events: {
                          onClick: function(e,dc){
                             onCtrlNodeRowSelChange(dc);
                          }
                       },
                       cssClass: 'cell-hyperlink-blue',
                       minWidth:110,
                       exportConfig: {
                           allow: true,
                           advFormatter: function(dc) {
                               return dc.name;
                           }
                       }
                   },
                   {
                       field:"ip",
                       name:"IP Address",
                       formatter:function(r,c,v,cd,dc){
                           return summaryIpDisplay(dc['ip'],dc['summaryIps']);
                       },
                       minWidth:90,
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
                       minWidth:150
                   },
                   {
                       field:"status",
                       name:"Status",
                       sortable:true,
                       formatter:function(r,c,v,cd,dc) {
                           return getNodeStatusContentForSummayPages(dc,'html');
                       },
                       searchFn:function(d) {
                           return getNodeStatusContentForSummayPages(d,'text');
                       },
                       minWidth:150
                   },
                   {
                       field:"cpu",
                       name:"CPU (%)",
                       formatter:function(r,c,v,cd,dc) {
                           return '<div class="gridSparkline display-inline">'+
                               '</div><span class="display-inline">' 
                               + dc['cpu'] + '</span>';
                       },
                       asyncPostRender: renderSparkLines,
                       searchFn:function(d){
                           return d['cpu'];
                       },
                       minWidth:150,
                       exportConfig: {
                           allow: true,
                           advFormatter: function(dc) {
                               return dc['cpu'];
                           }
                       }
                   },
                   {
                       field:"memory",
                       name:"Memory",
                       minWidth:110,
                       sortField:"y"
                   },
                   {
                       field:"establishedPeerCount",
                       name:"BGP Peers",
                       minWidth:140,
                       formatter:function(r,c,v,cd,dc){
                           return contrail.format("{0} Total {1}",
                               ifNull(dc['totalBgpPeerCnt'],0),
                               dc['downBgpPeerCntText']);
                       }
                   },
                   {
                       field:"activevRouterCount",
                       name:"vRouters",
                       formatter:function(r,c,v,cd,dc){
                           return contrail.format("{0} Total {1}",
                               dc['totalXMPPPeerCnt'],
                               dc['downXMPPPeerCntText']);
                       },
                       minWidth:140
                   }
                ];
                var gridElementConfig = {
                    header : {
                        title : {
                            text : ctwl.CONTROLNODE_SUMMARY_TITLE
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
                                    url : ctwl.CONTROLNODE_SUMMARY
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

            return ControlNodeGridView;
        });