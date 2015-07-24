/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view' ],
        function(
                _, ContrailView) {
            var DatabaseNodeGridView = ContrailView
                    .extend({
                        render : function() {
                            var self = this,
                                viewConfig = this.attributes.viewConfig,
                                pagerOptions = viewConfig['pagerOptions'];
                            this.renderView4Config(self.$el,
                                 self.model,
                                 getDatabaseNodeSummaryGridViewConfig(
                                     pagerOptions));
                        }
                    });

            function getDatabaseNodeSummaryGridViewConfig(
                    pagerOptions) {
                return {
                    elementId : ctwl.DATABASENODE_SUMMARY_GRID_SECTION_ID,
                    view : "SectionView",
                    viewConfig : {
                        rows : [ {
                            columns : [ {
                                elementId : ctwl.DATABASENODE_SUMMARY_GRID_ID,
                                title : ctwl.DATABASENODE_SUMMARY_TITLE,
                                view : "GridView",
                                viewConfig : {
                                    elementConfig :
                                        getDatabaseNodeSummaryGridConfig(
                                            pagerOptions)
                                }
                            } ]
                        } ]
                    }
                };
            }

            function getDatabaseNodeSummaryGridConfig(
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
                             onDbNodeRowSelChange(dc);
                          }
                       },
                       cssClass: 'cell-hyperlink-blue',
                       searchFn:function(d) {
                           return d['name'];
                       },
                       minWidth:90,
                       exportConfig: {
                           allow: true,
                           advFormatter: function(dc) {
                               return dc.name;
                           }
                       },
                   },
                   {
                       field:"ip",
                       name:"IP Address",
                       minWidth:110,
                       sorter : comparatorIP
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
                       field:"formattedAvailableSpace",
                       name:"Available Space",
                       minWidth:110,
                       sortField:"dbSpaceAvailable"
                   },
                   {
                       field:"formattedUsedSpace",
                       name:"Used Space",
                       minWidth:110,
                       sortField:"dbSpaceUsed"
                   },
                   {
                       field:"formattedAnalyticsDbSize",
                       name:"Analytics DB Size",
                       minWidth:110,
                       sortField:"analyticsDbSize"
                   }
                ];
                var gridElementConfig = {
                    header : {
                        title : {
                            text : ctwl.DATABASENODE_SUMMARY_TITLE
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
                                    url : ctwl.DATABASENODE_SUMMARY
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

            return DatabaseNodeGridView;
        });