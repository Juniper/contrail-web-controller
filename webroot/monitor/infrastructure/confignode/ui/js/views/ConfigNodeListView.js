/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view','monitor-infra-confignode-model' ],
        function(
                _, ContrailView, ConfigNodeListModel) {
            var ConfigNodeListView = ContrailView.extend({
                render : function() {
                    var configNodeListModel = new ConfigNodeListModel();
                    
                    this.renderView4Config(this.$el, configNodeListModel,
                            getConfigNodeListViewConfig());
                }
            });
            
            
            function getConfigNodeListViewConfig() {
                var viewConfig = {
                    rows : [
                         {
                            columns : [ {
                                elementId : 
                                    ctwl.CONFIGNODE_SUMMARY_CHART_ID,
                                title : ctwl.CONFIGNODE_SUMMARY_TITLE,
                                view : "ConfigNodeScatterChartView",
                                viewPathPrefix: 
                                    "monitor/infrastructure/common/ui/js/views/",
                                app : cowc.APP_CONTRAIL_CONTROLLER,
                                    } ]
                        },{
                            columns : [ {
                                elementId : 
                                    ctwl.CONFIGNODE_SUMMARY_GRID_ID,
                                title : ctwl.CONFIGNODE_SUMMARY_TITLE,
                                view : "ConfigNodeGridView",
                                viewPathPrefix: 
                                    "monitor/infrastructure/confignode/ui/js/" +
                                    "views/",
                                app : cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig : {
                                    
                                }
                            } ]
                        } ]
                };
                return {
                    elementId : cowu.formatElementId(
                        [ctwl.CONFIGNODE_SUMMARY_LIST_SECTION_ID ]),
                    view : "SectionView",
                    viewConfig : viewConfig
                };
            }
            return ConfigNodeListView;
        });