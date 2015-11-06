/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var VRouterTabView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;

            self.renderView4Config(self.$el, null,
                    getVRouterTabsViewConfig(viewConfig));
        }
    });

    var getVRouterTabsViewConfig = function (viewConfig) {
        var hostname = viewConfig['hostname'];

        return {
            elementId: ctwl.VROUTER_DETAILS_SECTION_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.VROUTER_DETAILS_TABS_ID,
                                view: "TabsView",
                                viewConfig: getVRouterTabViewConfig(
                                                viewConfig)
                            }
                        ]
                    }
                ]
            }
        }
    };

    function getVRouterTabViewConfig (viewConfig) {
        return {
            theme: 'default',
            active: 0,
            tabs: ctwvc.getVRouterDetailsPageTabs(viewConfig)

        }
    }
    return VRouterTabView;
});
