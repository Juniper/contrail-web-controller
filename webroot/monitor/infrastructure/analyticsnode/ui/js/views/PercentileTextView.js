/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view', 'contrail-list-model'],
       function(_, ContrailView,ContrailListModel){
        var PercentileTextView = ContrailView.extend({
        render : function (){
            var percentileTextViewTemplate = contrail.getTemplate4Id(
                    ctwc.PERCENTILE_TEXT_VIEW_TEMPLATE);
            var viewConfig = this.attributes.viewConfig;
            var self = this;
            if (self.model === null && viewConfig['modelConfig'] != null) {
                self.model = new ContrailListModel(viewConfig['modelConfig']);
            }
            if (self.model !== null) {
                self.model.onDataUpdate.subscribe(function () {
                    self.renderTemplate($(self.$el), viewConfig, self.model,percentileTextViewTemplate);
                });
                self.model.onAllRequestsComplete.subscribe(function () {
                    self.renderTemplate($(self.$el), viewConfig, self.model,percentileTextViewTemplate);
                });
             }
           },
        renderTemplate: function (selector, viewConfig, chartViewModel,percentileTextViewTemplate) {
            var chartModelItems = chartViewModel.getItems(), self = this;
            var percentileMessagesobjVal = getValueByJsonPath(chartModelItems, '0;percentileMessagesobjVal', '-');
            var percentileSizeobjVal = getValueByJsonPath(chartModelItems, '0;percentileSizeobjVal', '-');
            self.$el.html(percentileTextViewTemplate({percentileMessagesobjVal: percentileMessagesobjVal ,percentileSizeobjVal: percentileSizeobjVal}));
           }
    });

   return PercentileTextView;
});
