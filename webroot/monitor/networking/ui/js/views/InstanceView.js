/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-view-model'
], function (_, Backbone, ContrailViewModel) {
    var InstanceView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig,
                networkFQN = viewConfig['networkFQN'],
                instanceUUID = viewConfig['instanceUUID'],
                modelMap = contrail.handleIfNull(this.modelMap, {}),
                modelKey = ctwc.get(ctwc.UMID_INSTANCE_UVE, instanceUUID);

            var viewModelConfig = {
                modelKey: modelKey,
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_INSTANCE_SUMMARY, instanceUUID),
                        type: 'GET'
                    },
                    dataParser: function(response) {
                        return {name: instanceUUID, value: response};
                    }
                }
            };

            var contrailViewModel = new ContrailViewModel(viewModelConfig);
            modelMap[viewModelConfig['modelKey']] = contrailViewModel;

            var connectedGraph = ctwu.getNetworkingGraphConfig(ctwc.get(ctwc.URL_NETWORK_CONNECTED_GRAPH, networkFQN), {fqName: networkFQN, instanceUUID: instanceUUID}, ':connected', 'Instance'),
                configGraph = ctwu.getNetworkingGraphConfig(ctwc.get(ctwc.URL_NETWORK_CONFIG_GRAPH, networkFQN), {fqName: networkFQN, instanceUUID: instanceUUID}, ':config', 'Instance');

            cowu.renderView4Config(self.$el, null, getInstanceViewConfig(connectedGraph, configGraph, networkFQN, instanceUUID), null, null, modelMap);
        }
    });

    function getInstanceViewConfig(connectedGraph, configGraph, networkFQN, instanceUUID) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCE_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.INSTANCE_GRAPH_ID,
                                view: "NetworkingGraphView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {connectedGraph: connectedGraph, configGraph: configGraph}
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: ctwl.MONITOR_INSTANCE_VIEW_ID,
                                view: "InstanceTabView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {networkFQN: networkFQN, instanceUUID: instanceUUID}
                            }
                        ]
                    }
                ]
            }
        }
    };

    return InstanceView;

});