/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-view',
    'barchart-cf'
], function (_, Backbone,ContrailView,BarChartView) {
    //Takes an array of barChart configuration and renders
    var VRouterCrossFiltersView  = ContrailView.extend({
        initialize: function() {
            var self = this;
            self.barChartViews = [];
            //Create the base container
            self.$el.append($('<div/>',{
                class:'row-fluid'
            }));
            self.$el.find('div.row-fluid').append($('<div/>',{
                class:'charts vrouter-cf'
            }));
        },
        renderCrossFilters : function() {
            var self = this;
            var crossFilterCfg = getValueByJsonPath(self,'attributes;viewConfig;config',[]);
            //Clean-up the charts section if it's already rendered before
            self.$el.find('.charts').empty();
            var vRoutersData = self.model.getFilteredItems();
            var vRouterCF = crossfilter(vRoutersData);
            var dimensions = {};
            var filterDimension = vRouterCF.dimension(function(d) {
                return d[crossFilterCfg[0]['field']];
            });
            //To retain the same y-axis max across all crossfilter charts
            var maxY = 0;

            //Get the max bar value
            for(var i=0;i<crossFilterCfg.length;i++) {
                var currCfg = crossFilterCfg[i];
                dimensions[currCfg['field']] = vRouterCF.dimension(function(d) {
                        return d[currCfg['field']];
                    });
                var maxValue = d3.max(dimensions[currCfg['field']].group().all(),
                    function(d) {   return d['value']; });
                maxY = d3.max([maxY,maxValue]);
            }

            for(var i=0;i<crossFilterCfg.length;i++) {
                var currCfg = crossFilterCfg[i];
                self.$el.find('.charts').append($('<div/>',{
                    class:'chart span4'
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
                        onBrushEnd: function() {
                            //Create a new dimension and get the filtered records
                            //And add a filter on self.model with selected hostnames
                            var selRecords = filterDimension.top(Infinity);
                            var selIds = $.map(selRecords,function(obj,idx) {
                                return obj.name;
                            });
                            self.model.setFilterArgs({
                                selIds:selIds
                            });
                            self.model.setFilter(function(item,args) {
                                if($.inArray(item['name'],args['selIds']) > -1)
                                    return true;
                                return false;
                            });
                            $.each(self.barChartViews,function(idx,obj) {
                                obj.update();
                            });
                        },
                        maxY : maxY
                    }
                });
                barChartView.render();
                self.barChartViews.push(barChartView);
            }
        },
        render: function() {
            var self = this;
            //Need to initialize crossfilter with model
            //If model is already populated
            if(self.model.loadedFromCache) {
                self.renderCrossFilters();
            }
            self.model.onDataUpdate.subscribe(function() {
                self.renderCrossFilters();
            });
        }
    });
    return VRouterCrossFiltersView;
});
