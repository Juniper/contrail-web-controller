/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var AnalyticsDetailsView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;

            var currentHashParams = layoutHandler.getURLHashParams(),
                tabConfig = getAnalyticsTabsViewConfig (currentHashParams);

            this.renderView4Config(this.$el, null, tabConfig, null, null, null);
        }
    });

    function getAnalyticsTabsViewConfig(currHashParams) {
        var options = {
                hostname: currHashParams.focusedElement.node
            };
        return {
            elementId: cowu.formatElementId([ctwl.ANALYTICSNODE_TAB_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.ANALYTICSNODE_TAB_VIEW_ID,
                                view: "AnalyticsNodeTabView",
                                viewPathPrefix:
                                    ctwl.ANALYTICSNODE_VIEWPATH_PREFIX,
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: options
                            }
                        ]
                    }
                ]
            }
        };
    };

    return AnalyticsDetailsView;

});