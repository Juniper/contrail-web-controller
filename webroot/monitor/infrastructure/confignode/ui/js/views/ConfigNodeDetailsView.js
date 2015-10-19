/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var ConfigDetailsView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;

            var currentHashParams = layoutHandler.getURLHashParams(),
                tabConfig = getConfigTabsViewConfig (currentHashParams);
            pushBreadcrumb([currentHashParams.focusedElement.node]);
            this.renderView4Config(this.$el, null, tabConfig, null, null, null);
        }
    });

    function getConfigTabsViewConfig(currHashParams) {
        var options = {
                hostname: currHashParams.focusedElement.node
            };
        return {
            elementId: cowu.formatElementId([ctwl.CONFIGNODE_TAB_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CONFIGNODE_TAB_VIEW_ID,
                                view: "ConfigNodeTabView",
                                viewPathPrefix:
                                    ctwl.CONFIGNODE_VIEWPATH_PREFIX,
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: options
                            }
                        ]
                    }
                ]
            }
        };
    };

    return ConfigDetailsView;

});