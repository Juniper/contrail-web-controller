/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var NetworkView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                graphTabsTemplate = contrail.getTemplate4Id(cowc.TMPL_2ROW_CONTENT_VIEW),
                viewConfig = this.attributes.viewConfig,
                networkFQN = viewConfig['networkFQN'],
                networkUUID = viewConfig['networkUUID']

            this.$el.html(graphTabsTemplate);

            self.renderNetworkGraph(networkFQN, networkUUID);
            self.renderNetworkTabs(networkFQN, networkUUID);
        },

        renderNetworkGraph: function(networkFQN, networkUUID) {
            var topContainerElement = $('#' + ctwl.TOP_CONTENT_CONTAINER),
                connectedGraph = ctwvc.getMNConnnectedGraphConfig(ctwc.get(ctwc.URL_NETWORK_CONNECTED_GRAPH, networkFQN), {fqName: networkFQN}, ':connected', ctwc.GRAPH_ELEMENT_NETWORK),
                configGraph = ctwu.getMNConfigGraphConfig(ctwc.get(ctwc.URL_NETWORK_CONFIG_GRAPH, networkFQN), {fqName: networkFQN}, ':config', ctwc.GRAPH_ELEMENT_NETWORK);

            cowu.renderView4Config(topContainerElement, null, getNetworkGraphViewConfig(connectedGraph, configGraph, networkFQN, networkUUID), null, null);
        },

        renderNetworkTabs: function(networkFQN, networkUUID) {
            var bottomContainerElement = $('#' + ctwl.BOTTOM_CONTENT_CONTAINER),
                currentHashParams = layoutHandler.getURLHashParams(),
                tabConfig = {};

            if (contrail.checkIfExist(currentHashParams.clickedElement)) {
                tabConfig = ctwgrc.getTabsViewConfig(currentHashParams.clickedElement.type, currentHashParams.clickedElement);
            } else {
                tabConfig = ctwgrc.getTabsViewConfig(ctwc.GRAPH_ELEMENT_NETWORK, {
                    fqName: networkFQN,
                    uuid: networkUUID
                });
            }

            cowu.renderView4Config(bottomContainerElement, null, tabConfig, null, null, null);
        }
    });

    function getNetworkGraphViewConfig(connectedGraph, configGraph, networkFQN, networkUUID) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_NETWORK_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.NETWORK_GRAPH_ID,
                                view: "NetworkingGraphView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {connectedGraph: connectedGraph, configGraph: configGraph}
                            }
                        ]
                    }
                ]
            }
        }
    };

    return NetworkView;

});