/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var ProjectView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                graphTabsTemplate = contrail.getTemplate4Id(cowc.TMPL_2ROW_CONTENT_VIEW),
                viewConfig = this.attributes.viewConfig,
                projectFQN = viewConfig['projectFQN'],
                projectUUID = viewConfig['projectUUID'];

            this.$el.html(graphTabsTemplate);

            self.renderProjectGraph(projectFQN, projectUUID);
            self.renderProjectTabs(projectFQN, projectUUID);
        },

        renderProjectGraph: function(projectFQN, projectUUID) {
            var topContainerElement = $('#' + ctwl.TOP_CONTENT_CONTAINER),
                connectedGraph = nmwvc.getMNConnnectedGraphConfig(ctwc.get(ctwc.URL_PROJECT_CONNECTED_GRAPH, projectFQN), {fqName: projectFQN}, ':connected', ctwc.GRAPH_ELEMENT_PROJECT),
                configGraph = nmwu.getMNConfigGraphConfig(ctwc.get(ctwc.URL_PROJECT_CONFIG_GRAPH, projectFQN), {fqName: projectFQN}, ':config', ctwc.GRAPH_ELEMENT_PROJECT);

            this.renderView4Config(topContainerElement, null, getProjectGraphViewConfig(connectedGraph, configGraph, projectFQN, projectUUID), null, null, null);
        },

        renderProjectTabs: function(projectFQN, projectUUID) {
            var bottomContainerElement = $('#' + ctwl.BOTTOM_CONTENT_CONTAINER),
                currentHashParams = layoutHandler.getURLHashParams(),
                tabConfig = {};

            if (contrail.checkIfExist(currentHashParams.clickedElement) && currentHashParams.clickedElement.type != ctwc.GRAPH_ELEMENT_NETWORK_POLICY) {
                tabConfig = ctwgrc.getTabsViewConfig(currentHashParams.clickedElement.type, currentHashParams.clickedElement);
            } else {
                tabConfig = ctwgrc.getTabsViewConfig(ctwc.GRAPH_ELEMENT_PROJECT, {
                    fqName: projectFQN,
                    uuid: projectUUID
                });
            }

            this.renderView4Config(bottomContainerElement, null, tabConfig, null, null, null);
        }
    });

    function getProjectGraphViewConfig(connectedGraph, configGraph, projectFQN, projectUUID) {
        return {
            elementId: ctwl.PROJECT_GRAPH_ID,
            view: "NetworkingGraphView",
            viewPathPrefix: "monitor/networking/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {connectedGraph: connectedGraph, configGraph: configGraph}
        };
    };

    return ProjectView;
});
