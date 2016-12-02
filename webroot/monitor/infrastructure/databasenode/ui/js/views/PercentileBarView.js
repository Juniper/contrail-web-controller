/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view', 'contrail-list-model'],
       function(_, ContrailView,ContrailListModel){
        var PercentileBarView = ContrailView.extend({
        render : function (){
            var percentileBarViewTemplate = contrail.getTemplate4Id(
                    ctwc.PERCENTILE_BAR_VIEW_TEMPLATE);
            var viewConfig = this.attributes.viewConfig;
            var self = this;
            if (self.model === null && viewConfig['modelConfig'] != null) {
                self.model = new ContrailListModel(viewConfig['modelConfig']);
            }
            if (self.model !== null) {
                self.renderTemplate($(self.$el), viewConfig, self.model,percentileBarViewTemplate);
                self.model.onDataUpdate.subscribe(function () {
                    self.renderTemplate($(self.$el), viewConfig, self.model,percentileBarViewTemplate);
                });
                self.model.onAllRequestsComplete.subscribe(function () {
                    self.renderTemplate($(self.$el), viewConfig, self.model,percentileBarViewTemplate);
                });
             }
           },
        renderTemplate: function (selector, viewConfig, chartViewModel,percentileBarViewTemplate) {
            var chartModelItems = chartViewModel.getItems(), self = this,chartModelFilteredArray=[];
            var formattedUsedPercentage,usedValue,formattedUsedValue;
            for(var i=0;i<chartModelItems.length;i++){
                usedValue = getValueByJsonPath(chartModelItems, ''+i+''+';formattedUsedPercentage', '-');
                formattedUsedValue = Math.round(usedValue.replace('%',''));
                if(_.isNaN(formattedUsedValue)){
                    formattedUsedValue = '0';
                }
                formattedUsedPercentage = formattedUsedValue+"%";
                chartModelFilteredArray.push({
                    name: getValueByJsonPath(chartModelItems, ''+i+''+';name', '-'),
                    formattedUsedPercentage: formattedUsedPercentage,
                    formattedUsedValue: formattedUsedValue,
                    highThresholdLimit:"70"
                });
            }
            self.$el.html(percentileBarViewTemplate(chartModelFilteredArray));
           }
    });

   return PercentileBarView;
});
