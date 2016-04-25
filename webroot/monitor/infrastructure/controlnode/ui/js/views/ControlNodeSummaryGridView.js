/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view' ],
        function(
                _, ContrailView) {
            var ControlNodeSummartGridView = ContrailView
                    .extend({
                        render : function() {
                            var self = this,
                                viewConfig = this.attributes.viewConfig,
                                pagerOptions = viewConfig['pagerOptions'];
                            this.renderView4Config(self.$el,
                            self.model,
                            getControlNodeSummaryGridViewConfig(pagerOptions),
                            null,
                            null,
                            null,
                            function() {
                                self.model.onDataUpdate.subscribe(function () {
                                    if($('#'+ctwl.CONTROLNODE_SUMMARY_GRID_ID).data('contrailGrid')) {
                                        $('#'+ctwl.CONTROLNODE_SUMMARY_GRID_ID).data('contrailGrid')._grid.invalidate();
                                    }
                                });
                            });
                        }
                    });

            function getControlNodeSummaryGridViewConfig(
                    pagerOptions) {
                return {
                    elementId : ctwl.CONTROLNODE_SUMMARY_GRID_ID,
                    title : ctwl.CONTROLNODE_SUMMARY_TITLE,
                    view : "GridView",
                    viewConfig : {
                        elementConfig :
                            getControlNodeSummaryGridConfig(
                                    pagerOptions)
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
                          onClick: onClickHostName
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
                           return monitorInfraParsers.summaryIpDisplay(dc['ip'],dc['summaryIps']);
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
                           return monitorInfraUtils.getNodeStatusContentForSummayPages(dc,'html');
                       },
                       searchFn:function(d) {
                           return monitorInfraUtils.getNodeStatusContentForSummayPages(d,'text');
                       },
                       sortable:{
                           sortBy: function (d) {
                               return monitorInfraUtils.getNodeStatusContentForSummayPages(d,'text');
                           }
                       },
                       sorter:cowu.comparatorStatus,
                       minWidth:150
                   },
                   {
                       field:"cpu",
                       name: ctwl.TITLE_CPU,
                       formatter:function(r,c,v,cd,dc) {
                           return '<div class="gridSparkline display-inline">'+
                               '</div><span class="display-inline">'
                               + ifNotNumeric(dc['cpu'],'-') + '</span>';
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
                          checkboxSelectable : false,
                          enableAsyncPostRender:true,
                          fixedRowHeight: 30
                        },
                        dataSource : {
                            remote : {
                                ajaxConfig : {
                                    url : ctwl.CONTROLNODE_SUMMARY
                                }
                            },
                            cacheConfig : {
                                ucid: ctwl.CACHE_CONTROLNODE
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
                        type: "controlNode",
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
                    p: "mon_infra_control",
                    merge: false,
                    triggerHashChange: triggerHashChange});

            };

            return ControlNodeSummartGridView;
        });
