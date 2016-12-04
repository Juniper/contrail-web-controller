/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'backbone',
    '/js/views/SparklineView.js'
], function (_, ContrailView, Backbone, SparklineView) {
    var NodeDetailsInfoboxesView = ContrailView.extend({
        initialize: function(options) {
            var self = this;

            var nodeDetailInfoboxesTemplate = contrail.getTemplate4Id(
                                        cowc.TMPL_NODE_DETAIL_INFOBOXES_BOX);
            self.$el.html(nodeDetailInfoboxesTemplate({widgetTitle:options.widgetTitle}));

            //Add click listener for infoboxes to show/hide the respective container
            self.$el.find('.infobox-container').on('click','.infobox',function() {
                var tabIdx = $(this).index();
                //Hide all infobox detail containers and show the one corresponding
                //to clicked infobox.
                self.$el.find('.infobox-detail-container').
                    find('.infobox-detail-item').hide();
                $(self.$el.find('.infobox-detail-container').
                    find('.infobox-detail-item')[tabIdx]).show();
                //Highlight the selected infobox
                self.$el.find('.infobox').removeClass('infobox-blue').
                    removeClass('infobox-dark-border active').addClass('infobox-grey');
                $(self.$el.find('.infobox')[tabIdx]).removeClass('infobox-grey').
                    addClass('infobox-blue infobox-border active');
                window.dispatchEvent(new Event('resize'));
            });
        },

        add: function(cfg) {
            var self = this;
            var infoboxTemplate = contrail.getTemplate4Id(
                                    cowc.TMPL_NODE_DETAIL_SPARKLINE_BOX);
            var prefix = cfg['prefix'];
            self.$el.find('.infobox-container').append(infoboxTemplate(cfg));
            self.$el.find('.infobox-detail-container').append($('<div>',{
                    class:'infobox-detail-item',
                }));
            $(self.$el.find('.infobox')[0]).removeClass('infobox-grey').
                addClass('infobox-blue infobox-border active');
            self.renderView4Config(self.$el.find('#'+ prefix + '-sparklines').
                    find('.infobox-content .sparkline1'), cfg['model'],
                    getNodeDetailSparklineViewConfig1(cfg));
            self.renderView4Config(self.$el.find('#'+ prefix + '-sparklines').
                    find('.infobox-content .sparkline2'), cfg['model'],
                    getNodeDetailSparklineViewConfig2(cfg));

            //Initialize chart view
            var chartView = new cfg['view']({
                model: cfg['model'],
                el: self.$el.find('.infobox-detail-container .infobox-detail-item:last')
            });
            var currInfobox = self.$el.find('.infobox-container .infobox:last');
            var renderFn = ifNull(cfg['renderfn'],'render');
            chartView[renderFn]();

            //Listen for changes on model to show/hide down count
            if(cfg['model'].loadedFromCache) {
//                updateCnt();
            };
            cfg['model'].onDataUpdate.subscribe(function() {
            });
        }
    });
    function getNodeDetailSparklineViewConfig1(cfg) {
        return {
            elementId: 'sparkline1',
            view: "SparklineView",
            viewConfig: {
                colorClass : contrail.checkIfExist(cfg.sparline1ColorClass) ?
                        cfg.sparline1ColorClass : 'blue-sparkline',
                parseFn: function (response) {
                    var options = {dimensions:[cfg['sparkline1Dimension']]};
                    return ctwp.parseDataForNodeDetailsSparkline(response,options);
                },
                chartOptions: {
                    forceY1: [0, 1]
                }
            }
        }
    }
    function getNodeDetailSparklineViewConfig2(cfg) {
        return {
            elementId: 'sparkline2',
            view: "SparklineView",
            viewConfig: {
                colorClass : contrail.checkIfExist(cfg.sparline2ColorClass) ?
                        cfg.sparline2ColorClass : 'green-sparkline',
                parseFn: function (response) {
                    var options = {dimensions:[cfg['sparkline2Dimension']]};
                    return ctwp.parseDataForNodeDetailsSparkline(response,options);
                },
                chartOptions: {
                    forceY1: [0, 1]
                }
            }
        }
    }
    return NodeDetailsInfoboxesView;
});
