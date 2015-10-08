/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var DatabaseDetailsView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;

            var currentHashParams = layoutHandler.getURLHashParams(),
                tabConfig = getDatabaseTabsViewConfig (currentHashParams);
            pushBreadcrumb([currentHashParams.focusedElement.node]);
            this.renderView4Config(this.$el, null, tabConfig, null, null, null);
        }
    });

    function getDatabaseTabsViewConfig(currHashParams) {
        var options = {
                hostname: currHashParams.focusedElement.node
            };
        return {
            elementId: cowu.formatElementId([ctwl.DATABASENODE_TAB_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.DATABASENODE_TAB_VIEW_ID,
                                view: "DatabaseNodeTabView",
                                viewPathPrefix: ctwl.DATABASENODE_VIEWPATH_PREFIX,
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: options
                            }
                        ]
                    }
                ]
            }
        };
    };

    return DatabaseDetailsView;

});