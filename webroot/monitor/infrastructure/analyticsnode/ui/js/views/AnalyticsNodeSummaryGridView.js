/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([ 'underscore', 'contrail-view' ],function(_, ContrailView) {
            var AnalyticsNodeGridView = ContrailView
                    .extend({
                        render : function() {
                            var self = this,
                                viewConfig = this.attributes.viewConfig,
                                pagerOptions = viewConfig['pagerOptions'];
                            this.renderView4Config(
                                self.$el,
                                self.model,
                                getAnalyticsNodeSummaryGridViewConfig(
                                    pagerOptions));
                        }
                    });

            function getAnalyticsNodeSummaryGridViewConfig(
                    pagerOptions) {
                return {
                    elementId : ctwl.ANALYTICSNODE_SUMMARY_GRID_SECTION_ID,
                    view : "SectionView",
                    viewConfig : {
                        rows : [ {
                            columns : [ {
                                elementId : ctwl.ANALYTICSNODE_SUMMARY_GRID_ID,
                                title : ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                                view : "GridView",
                                viewConfig : {
                                    elementConfig :
                                        getAnalyticsNodeSummaryGridConfig(
                                            pagerOptions)
                                }
                            } ]
                        } ]
                    }
                };
            }

            function getAnalyticsNodeSummaryGridConfig(
                    pagerOptions) {
                var columns = [
                   {
                       field:"name",
                       id:"name",
                       name:"Host name",
                       formatter:function(r,c,v,cd,dc) {
                          return cellTemplateLinks({
                              cellText:'name',
                              name:'name',
                              statusBubble:true,
                              rowData:dc});
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
                       minWidth:110,
                       sortable:true
                   },
                   {
                       field:"ip",
                       id:"ip",
                       name:"IP Address",
                       minWidth:110,
                       sortable:true,
                       formatter:function(r,c,v,cd,dc){
                           return summaryIpDisplay(dc['ip'],
                                   dc['summaryIps']);
                       },
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
                       id:"version",
                       name:"Version",
                       sortable:true,
                       minWidth:110
                   },
                   {
                       field:"status",
                       id:"status",
                       name:"Status",
                       sortable:true,
                       formatter:function(r,c,v,cd,dc) {
                           return getNodeStatusContentForSummayPages(dc,'html');
                       },
                       searchFn:function(d) {
                           return getNodeStatusContentForSummayPages(d,'text');
                       },
                       minWidth:110,
                       exportConfig: {
                           allow: true,
                           advFormatter: function(dc) {
                               return getNodeStatusContentForSummayPages(dc,
                                   'text');
                           }
                       }
                   },
                   {
                       field:"cpu",
                       id:"analyticsCpu",
                       name:"CPU (%)",
                       formatter:function(r,c,v,cd,dc) {
                           return '<div class="gridSparkline display-inline">' +
                                  '</div><span class="display-inline">' +
                                    dc['cpu'] + '</span>';
                       },
                       asyncPostRender: renderSparkLines,
                       searchFn:function(d){
                           return d['cpu'];
                       },
                       minWidth:120,
                       exportConfig: {
                           allow: true,
                           advFormatter: function(dc) {
                               return dc.cpu
                           }
                       }
                   },
                   {
                       field:"memory",
                       id:"analyticsMem",
                       sortable:true,
                       name:"Memory",
                       minWidth:150,
                       sortField:"y"
                   },
                   {
                       field:"genCount",
                       id:"genCount",
                       sortable:true,
                       name:"Generators",
                       minWidth:85
                   }
                ];
                var gridElementConfig = {
                    header : {
                        title : {
                            text : ctwl.ANALYTICSNODE_SUMMARY_TITLE
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
                                    url : ctwl.ANALYTICSNODE_SUMMARY
                                }
                            },
                            cacheConfig : {
                                ucid: ctwl.CACHE_ANALYTICSNODE
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
                        type: "analyticsNode",
                        view: "details",
                        focusedElement: {
                            node: name,
                            tab: 'details'
                        }
                    };

                if(contrail.checkIfKeyExistInObject(true, hashParams,
                        'clickedElement')) {
                    hashObj.clickedElement = hashParams.clickedElement;
                }

                layoutHandler.setURLHashParams(hashObj, {
                    p: "mon_infra_analyticsmvc",
                    merge: false,
                    triggerHashChange: triggerHashChange});

            };

            return AnalyticsNodeGridView;
        });