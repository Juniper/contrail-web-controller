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
                          onClick: onClickHostName
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
                           return monitorInfraParsers.summaryIpDisplay(dc['ip'],
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
                           return monitorInfraUtils.getNodeStatusContentForSummayPages(dc,'html');
                       },
                       searchFn:function(dc) {
                           return monitorInfraUtils.getNodeStatusContentForSummayPages(dc,'text');
                       },
                       minWidth:110,
                       exportConfig: {
                           allow: true,
                           advFormatter: function(dc) {
                               return
                                   monitorInfraUtils.getNodeStatusContentForSummayPages(dc,'text');
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
                       field:"cpu",
                       name: ctwl.TITLE_CPU,
                       formatter:function(r,c,v,cd,dc) {
                           return '<div class="gridSparkline display-inline">' +
                                   '</div>' +
                                  '<span class="display-inline">' +
                                  ifNotNumeric(dc['cpu'],'-') + '</span>';
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
                          enableAsyncPostRender:true,
                          checkboxSelectable : false
                        },
                        dataSource : {
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
                        type: "configNode",
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
                    p: "mon_infra_config",
                    merge: false,
                    triggerHashChange: triggerHashChange});

            };

            return ConfigNodeGridView;
        });
