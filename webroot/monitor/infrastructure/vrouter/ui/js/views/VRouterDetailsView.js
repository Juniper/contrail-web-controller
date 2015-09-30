/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var VRouterDetailsView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;

            var currentHashParams = layoutHandler.getURLHashParams(),
                tabConfig = {};

            tabConfig = getVRouterTabsViewConfig (currentHashParams);

            this.renderView4Config(this.$el, null, tabConfig, null, null, null);
        }
    });

    function getVRouterTabsViewConfig(currHashParams) {
        var options = {
                hostname: currHashParams.focusedElement.node,
                introspectPort: 8085
            };
        return {
            elementId: cowu.formatElementId([ctwl.VROUTER_TAB_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.VROUTER_TAB_VIEW_ID,
                                view: "VRouterTabView",
                                viewPathPrefix: ctwl.VROUTER_VIEWPATH_PREFIX,
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: options
                            }
                        ]
                    }
                ]
            }
        };
    };

    return VRouterDetailsView;

});
