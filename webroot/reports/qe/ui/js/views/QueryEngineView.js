/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var QueryEngineView = ContrailView.extend({
        el: $(contentContainer),

        renderFlowSeries: function (viewConfig) {
            this.renderView4Config(this.$el, null, getFlowSeriesConfig(viewConfig));
        }
    });

    function getFlowSeriesConfig(config) {
        var hashParams = config['hashParams'];

        return {
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.QE_FLOW_SERIES_ID,
                                view: "FlowSeriesFormView",
                                viewPathPrefix: "reports/qe/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    widgetConfig: {
                                        elementId: ctwl.QE_FLOW_SERIES_ID + '-widget',
                                        view: "WidgetView",
                                        viewConfig: {
                                            header: {
                                                title: ctwl.TITLE_QUERY,
                                                iconClass: "icon-search"
                                            },
                                            controls: {
                                                top: {
                                                    default: {
                                                        collapseable: true
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return QueryEngineView;
});