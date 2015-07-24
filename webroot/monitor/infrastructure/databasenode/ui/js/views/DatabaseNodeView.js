/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var DatabaseNodeView = ContrailView.extend({
        el: $(contentContainer),
        renderDatabaseNode: function (viewConfig) {
            this.renderView4Config(this.$el, null, getDatabaseNodeConfig());
        },
        renderDatabaseNodeDetails : function (viewConfig) {
            this.renderView4Config(this.$el, null, getDatabaseNodeDetails());
        }
    });

    function getDatabaseNodeConfig() {
        return {
            elementId:
                cowu.formatElementId([ctwl.DATATBASENODE_SUMMARY_PAGE_ID]),
            view: "DatabaseNodeListView",
            viewPathPrefix: ctwl.DATABASENODE_VIEWPATH_PREFIX,
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        };
    };

    function getDatabaseNodeDetails() {
        return {
            elementId: cowu.formatElementId([ctwl.DATABASENODE_DETAILS_PAGE_ID]),
            view: "DatabaseNodeDetailsView",
            viewPathPrefix: ctwl.DATABASENODE_VIEWPATH_PREFIX,
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        };
    };

    return DatabaseNodeView;
});