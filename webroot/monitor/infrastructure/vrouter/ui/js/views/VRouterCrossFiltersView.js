/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-view',
    // 'barchart-cf'
    "core-basedir/js/views/BarChartView"
], function (_, Backbone,ContrailView,BarChartView) {
    //Takes an array of barChart configuration and renders
    var VRouterCrossFiltersView  = ContrailView.extend({
        initialize: function() {
            var self = this;
            self.barChartViews = [];
            //Create the base container
            self.$el.append($('<div/>',{
                class:'row'
            }));
            self.$el.find('div.row').append($('<div/>',{
                class:'charts vrouter-cf'
            }));
            self.vRouterListModel = getValueByJsonPath(self,'attributes;viewConfig;vRouterListModel',null,false);
            self.cfDataSource = getValueByJsonPath(self,'attributes;viewConfig;cfDataSource',null,false);
            self.cfDataSource.addCallBack('refreshCrossFilters',function(data) {
                if(data['cfg']['source'] != 'crossFilter') {
                    if(self.barChartViews.length == 0) {
                        self.renderCrossFilters();
                    } else {
                        self.refresh();
                    }
                }
            });
        },
        renderCrossFilters : function() {
            var self = this;
            self.barChartViews = [];
            var crossFilterCfg = getValueByJsonPath(self,'attributes;viewConfig;config',[]);
            //Clean-up the charts section if it's already rendered before
            self.$el.find('.charts').empty();
            var vRoutersData = self.model.getFilteredItems();
            var dimensions = {},xScales = {};
            //To retain the same y-axis max across all crossfilter charts
            var maxY = 0;

            //Get the max bar value
            for(var i=0;i<crossFilterCfg.length;i++) {
                var currCfg = crossFilterCfg[i];
                var barRange = 1;
                var maxXValue = d3.max(vRoutersData,function(d) {
                    return d[currCfg['field']];
                });
                var bucketized = false;
                if(maxXValue > 24) {
                    bucketized = true;
                    barRange = Math.ceil(maxXValue/24);
                }
                xScales[currCfg['field']] = null;
                dimensions[currCfg['field']] = self.cfDataSource.addDimension(currCfg['field']);
                //Crossfilter DS is not yet intialized
                if(dimensions[currCfg['field']] == null)
                    return;
                var maxValue = d3.max(dimensions[currCfg['field']].group().all(),
                    function(d) {
                        return d['value'];
                    });
                maxY = d3.max([maxY,maxValue]);
            }

            for(var i=0;i<crossFilterCfg.length;i++) {
                var currCfg = crossFilterCfg[i];
                self.$el.find('.charts').append($('<div/>',{
                    class:'chart col-xs-4'
                }));
                self.$el.find('.charts .chart:last').append($('<div/>',{
                    class:'title',
                    html: currCfg['title']
                }));
                var dimension = dimensions[currCfg['field']];
                var barChartView = new BarChartView({
                    el: self.$el.find('.charts .chart:last'),
                    viewConfig: {
                        dimension : dimension,
                        field : currCfg['field'],
                        xScale : xScales[currCfg['field']],
                        onBrushEnd: function(extent,field) {
                            self.cfDataSource.fireCallBacks({source:'crossFilter'});
                            self.refresh();
                        },
                        maxY : maxY
                    }
                });
                barChartView.render();
                self.barChartViews.push(barChartView);
            }
        },
        refresh: function() {
            var self = this;
            //Update dimension on barChartView
            $.each(ifNull(self.barChartViews,[]),function(idx,obj) {
                obj.update();
            });
        },
        render: function() {
            var self = this;
            //Need to initialize crossfilter with model
            //If model is already populated
            //Trigger callbacks to render the crossfilters when returning second time
            self.cfDataSource.fireCallBacks({source:'fetch'});
        }
    });
    return VRouterCrossFiltersView;
});
