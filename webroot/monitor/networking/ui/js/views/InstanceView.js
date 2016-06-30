/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var InstanceView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                graphTabsTemplate = contrail.getTemplate4Id(cowc.TMPL_2ROW_CONTENT_VIEW),
                viewConfig = this.attributes.viewConfig,
                networkFQN = encodeURIComponent(viewConfig['networkFQN']),
                networkUUID = viewConfig['networkUUID'],
                instanceUUID = viewConfig['instanceUUID'];

            this.$el.html(graphTabsTemplate);

            self.renderInstanceGraph(networkFQN, instanceUUID);
            self.renderInstanceTabs(networkFQN, instanceUUID);
        },

        renderInstanceGraph: function(networkFQN, instanceUUID) {

            var topContainerElement = $('#' + ctwl.TOP_CONTENT_CONTAINER),
                connectedGraph = nmwvc.getMNConnnectedGraphConfig(ctwc.get(ctwc.URL_INSTANCE_CONNECTED_GRAPH, networkFQN, instanceUUID), {fqName: networkFQN, instanceUUID: instanceUUID}, ':connected', ctwc.GRAPH_ELEMENT_INSTANCE),
                configGraph = nmwu.getMNConfigGraphConfig(ctwc.get(ctwc.URL_INSTANCE_CONFIG_GRAPH, networkFQN), {fqName: networkFQN, instanceUUID: instanceUUID}, ':config', ctwc.GRAPH_ELEMENT_INSTANCE);

            this.renderView4Config(topContainerElement, null, getInstanceGraphViewConfig(connectedGraph, configGraph, networkFQN, instanceUUID), null, null, null);
        },

        renderInstanceTabs: function(networkFQN, instanceUUID) {
            var bottomContainerElement = $('#' + ctwl.BOTTOM_CONTENT_CONTAINER),
                currentHashParams = layoutHandler.getURLHashParams(),
                tabConfig = {};

            if (contrail.checkIfExist(currentHashParams.clickedElement)) {
                tabConfig = ctwgrc.getTabsViewConfig(currentHashParams.clickedElement.type, currentHashParams.clickedElement);
            } else {
                tabConfig = ctwgrc.getTabsViewConfig(ctwc.GRAPH_ELEMENT_INSTANCE, {
                    fqName: networkFQN,
                    uuid: instanceUUID
                });
            }

            this.renderView4Config(bottomContainerElement, null, tabConfig, null, null, null);
        }
    });

    function getInstanceGraphViewConfig(connectedGraph, configGraph, networkFQN, instanceUUID) {
        return {
            elementId: ctwl.INSTANCE_GRAPH_ID,
            view: "NetworkingGraphView",
            viewPathPrefix: "monitor/networking/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {
                connectedGraph: connectedGraph,
                networkFQN: networkFQN,
                instanceUUID: instanceUUID
            }
        };
    };

    return InstanceView;

});