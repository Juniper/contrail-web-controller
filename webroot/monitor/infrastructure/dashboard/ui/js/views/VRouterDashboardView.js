/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
    ['underscore', 'contrail-view', 'monitor-infra-vrouter-model'],
    function(_, ContrailView, VRouterListModel,BarChartInfoView) {
        var VRouterDashobardView = ContrailView.extend(
           (function() {
                var self = this;
                //Returning inside IIFE to make private static variable
                var totalCntModel = new Backbone.Model({
                    vnCnt:''
                });
                return {
                        render: function() {
                            var self = this;
                            var vRouterListModel = new VRouterListModel();

                            this.renderView4Config(self.$el,
                                vRouterListModel,
                                getVRouterListViewConfig({totalCntModel:totalCntModel}),null,null,null,
                                function() {
                                    updateVnCnt(totalCntModel);
                                });
                        }
                    }
            })()
        );

        function updateVnCnt(totalCntModel) {
            var self = this;
            var vnCnt;
            //Issue a call to get Network count
            $.ajax({
                url:'/api/tenant/networking/virtual-networks/list',
                type:'POST',
                data:{}
            }).done(function(response) {
                if(response != null) {
                    $.each(response,function(idx,obj) {
                        if((obj['name'].indexOf(':default-project:') == -1) && obj['name'] != '__UNKNOWN__') {
                            if($.isNumeric(vnCnt)) {
                                vnCnt++;
                            } else {
                                vnCnt = 1;
                            }
                        }
                    });
                    totalCntModel.set({vnCnt:vnCnt});
                }
            });
        }

        function getVRouterListViewConfig(cfgObj) {
            return {
                elementId: cowu.formatElementId([
                    ctwl.VROUTER_DASHBOARD_SECTION_ID
                ]),
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: ctwl.VROUTER_DASHBOARD_SPARKLINE_ID,
                            title: ctwl.VROUTER_SUMMARY_TITLE,
                            view: "BarChartInfoView",
                            viewConfig: {
                                // class:'span3',
                                width: '135px',
                                config:[{
                                    field:'instCnt',
                                    title:'Instances'
                                },{
                                    field:'intfCnt',
                                    title:'Interfaces'
                                },{
                                    field:'vnCnt',
                                    title:'VNs'
                                }],
                                totalCntModel: cfgObj['totalCntModel']
                            }
                        },{
                            elementId: ctwl.VROUTER_DASHBOARD_CHART_ID,
                            title: ctwl.VROUTER_SUMMARY_TITLE,
                            view: "VRouterScatterChartView",
                            viewConfig : {
                                // class: 'span9'
                                'margin-left': '160px'
                            },
                            viewPathPrefix: "monitor/infrastructure/" +
                                "common/ui/js/views/",
                            app: cowc.APP_CONTRAIL_CONTROLLER,
                        }]
                    }]
                }
            };
        };
        return VRouterDashobardView;
    });
