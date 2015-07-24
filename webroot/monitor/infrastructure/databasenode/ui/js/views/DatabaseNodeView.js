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
        }
    });

    function getDatabaseNodeConfig() {
        return {
            elementId: 
                cowu.formatElementId([ctwl.DATATBASENODE_SUMMARY_PAGE_ID]),
            view: "DatabaseNodeListView",
            viewPathPrefix: "monitor/infrastructure/databasenode/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        };
    };
    return DatabaseNodeView;
});