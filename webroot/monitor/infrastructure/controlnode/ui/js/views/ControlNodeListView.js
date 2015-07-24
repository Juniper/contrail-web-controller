/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view', 'monitor-infra-controlnode-model'],
        function(
                _, ContrailView, ControlNodeListModel) {
            var ControlNodeListView = ContrailView.extend({
                render : function() {
                    var controlNodeListModel = new ControlNodeListModel();
                    this.renderView4Config(this.$el, controlNodeListModel,
                            getControlNodeListViewConfig());
                }
            });
            
            function getControlNodeListViewConfig() {
                var viewConfig = {
                    rows : [{
                        columns : [{
                            elementId :
                                ctwl.CONTROLNODE_SUMMARY_CHART_ID,
                            title : ctwl.CONTROLNODE_SUMMARY_TITLE,
                            view : "ControlNodeScatterChartView",
                            viewPathPrefix: "monitor/infrastructure/" +
                                "common/ui/js/views/",
                            app : cowc.APP_CONTRAIL_CONTROLLER,
                        }]
                    },{
                        columns : [{
                            elementId :
                                ctwl.CONTROLNODE_SUMMARY_GRID_ID,
                            title : ctwl.CONTROLNODE_SUMMARY_TITLE,
                            view : "ControlNodeGridView",
                            viewPathPrefix: "monitor/infrastructure/" +
                                "controlnode/ui/js/views/",
                            app : cowc.APP_CONTRAIL_CONTROLLER,
                            viewConfig : {
                            }
                        }]
                    }]
                };
                return {
                    elementId : cowu.formatElementId([ 
                         ctwl.CONTROLNODE_SUMMARY_LIST_SECTION_ID ]),
                    view : "SectionView",
                    viewConfig :viewConfig 
                };
            };
        return ControlNodeListView;
    });