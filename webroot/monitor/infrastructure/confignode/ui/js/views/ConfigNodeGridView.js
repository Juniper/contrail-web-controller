/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view' ],
        function(
                _, ContrailView) {
            var ConfigNodeGridView = ContrailView
                    .extend({
                        render : function() {
                            var self = this, 
                                viewConfig = this.attributes.viewConfig, 
                                pagerOptions = viewConfig['pagerOptions'];
                            this.renderView4Config(self.$el,
                            self.model,
                            getConfigNodeSummaryGridViewConfig(pagerOptions));
                        }
                    });

            function getConfigNodeSummaryGridViewConfig(
                    pagerOptions) {
                return {
                    elementId : ctwl.CONFIGNODE_SUMMARY_GRID_SECTION_ID,
                    view : "SectionView",
                    viewConfig : {
                        rows : [ {
                            columns : [ {
                                elementId : ctwl.CONFIGNODE_SUMMARY_GRID_ID,
                                title : ctwl.CONFIGNODE_SUMMARY_TITLE,
                                view : "GridView",
                                viewConfig : {
                                    elementConfig : 
                                        getConfigNodeSummaryGridConfig(
                                                pagerOptions)
                                }
                            } ]
                        } ]
                    }
                };
            }

            function getConfigNodeSummaryGridConfig(
                    pagerOptions) {
                var columns = [
                   {
                       field:"name",
                       name:"Host name",
                       formatter:function(r,c,v,cd,dc) {
                          return cellTemplateLinks({
                                          cellText:'name',
                                          name:'name',
                                          statusBubble:true,
                                          rowData:dc
                                   });
                       },
                       events: {
                          onClick: function(e,dc){
                             onConfigNodeRowSelChange(dc);
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
                       minWidth:90,
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
                       name:"Version",
                       minWidth:90
                   },
                   {
                       field:"status",
                       name:"Status",
                       formatter:function(r,c,v,cd,dc) {
                           return getNodeStatusContentForSummayPages(dc,'html');
                       },
                       searchFn:function(dc) {
                           return getNodeStatusContentForSummayPages(dc,'text');
                       },
                       minWidth:110,
                       exportConfig: {
                           allow: true,
                           advFormatter: function(dc) {
                               return 
                                   getNodeStatusContentForSummayPages(dc,'text');
                           }
                       }
                   },
                   {
                       field:"cpu",
                       name:"CPU (%)",
                       formatter:function(r,c,v,cd,dc) {
                           return '<div class="gridSparkline display-inline">' +
                                   '</div>' +
                                  '<span class="display-inline">' +
                                    dc['cpu'] + '</span>';
                       },
                       asyncPostRender: renderSparkLines,
                       searchFn:function(d){
                           return d['cpu'];
                       },
                       minWidth:110,
                       exportConfig: {
                           allow: true,
                           advFormatter: function(dc) {
                               return dc.cpu;
                           }
                       }
                   },
                   {
                       field:"memory",
                       name:"Memory",
                       minWidth:150,
                       sortField:"y"
                   }
                ];
                var gridElementConfig = {
                    header : {
                        title : {
                            text : ctwl.CONFIGNODE_SUMMARY_TITLE
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
                                    url : ctwl.CONFIGNODE_SUMMARY
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

            return ConfigNodeGridView;
        });