/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
    ['underscore', 'contrail-view', 'monitor-infra-vrouter-model',
    'contrail-list-model','cf-datasource'],
    function(_, ContrailView, VRouterListModel,ContrailListModel,
        CFDataSource) {
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
                            var cfDataSource = new CFDataSource();
                            var vRouterUIListModel = new ContrailListModel({data:[]});
                            self.cfDataSource = cfDataSource;
                            function onUpdatevRouterListModel() {
                                cfDataSource.updateData(self.model.getItems());

                                if(cfDataSource.getDimension('colorFilter') == null) {
                                    cfDataSource.addDimension('colorFilter',function(d) {
                                        return d['color'];
                                    });
                                }
                                cfDataSource.fireCallBacks({source:'fetch'});
                            }
                            cfDataSource.addCallBack('updateCFListModel',function(data) {
                                //Update listUIModel with crossfilter data
                                vRouterUIListModel.setData(cfDataSource.getFilteredData().sort(dashboardUtils.sortNodesByColor));
                            });
                            this.renderView4Config(self.$el,
                                vRouterUIListModel,
                                getVRouterListViewConfig({totalCntModel:totalCntModel,cfDataSource:cfDataSource}),null,null,null,
                                function() {
                                    self.model.onDataUpdate.subscribe(onUpdatevRouterListModel);
                                    if(self.model.loadedFromCache) {
                                        onUpdatevRouterListModel();
                                    }
                                    updateVnCnt(totalCntModel);
                                });
                        }
                    }
            })()
        );

        function updateVnCnt(totalCntModel) {
            var self = this;
            var vnCnt = 0;
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
                                // class:'col-xs-3',
                                width: '135px',
                                config:[{
                                    field:'instCnt',
                                    title:'Instances',
                                    yLbl: 'vRouters',
                                    excludeList: [{
                                        key:'vRouterType',
                                        value:'tor-agent'
                                    }]
                                },{
                                    field:'intfCnt',
                                    title:'Interfaces',
                                    yLbl: 'vRouters',
                                    excludeList: [{
                                        key:'vRouterType',
                                        value:'tor-agent'
                                    }]
                                },{
                                    field:'vnCnt',
                                    title:'VNs',
                                    yLbl: 'vRouters'
                                }],
                                totalCntModel: cfgObj['totalCntModel']
                            }
                        },{
                            elementId: ctwl.VROUTER_DASHBOARD_CHART_ID,
                            title: ctwl.VROUTER_SUMMARY_TITLE,
                            view: "VRouterScatterChartView",
                            viewConfig : {
                                // class: 'col-xs-9'
                                'margin-left': '160px',
                                cfDataSource : cfgObj['cfDataSource']
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
