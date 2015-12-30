/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'underlay-graph-model'
], function (_, ContrailView, UnderlayGraphModel) {
    var UnderlayView = ContrailView.extend({
        el: $(contentContainer),
        renderUnderlayPage: function (viewConfig) {
            var self = this,
                graphTabsTemplate =
                    contrail.getTemplate4Id(cowc.TMPL_2ROW_CONTENT_VIEW);
            this.$el.html(graphTabsTemplate);
            self.renderUnderlayGraph();
            self.renderUnderlayTabs();
        },
        renderUnderlayGraph: function() {
            var topContainerElement = $('#' + ctwl.TOP_CONTENT_CONTAINER);
            this.renderView4Config(topContainerElement,
                 null, getUnderlayGraphViewConfig(),
                 null, null, null);
        },
        renderUnderlayTabs: function() {
            var bottomContainerElement = $('#' + ctwl.BOTTOM_CONTENT_CONTAINER),
                tabConfig = getUnderlayTabViewConfig();
            this.renderView4Config(bottomContainerElement, null,
                tabConfig, null, null, null);
        }
    });

    function getUnderlayGraphViewConfig() {
        return {
            elementId: ctwl.UNDERLAY_TOPOLOGY_ID,
            view: "UnderlayGraphView",
            viewPathPrefix: ctwl.UNDERLAY_VIEWPATH_PREFIX,
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {

            }
        };
    };

    function getUnderlayTabViewConfig () {
        return {
            elementId: ctwc.UNDERLAY_TABS_VIEW_ID,
            view: 'UnderlayTabView',
            viewPathPrefix: ctwl.UNDERLAY_VIEWPATH_PREFIX,
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig : {

            }
        };
    }

    return UnderlayView;
});