/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CTGraphConfig = function () {
        this.getTabsViewConfig = function(tabType, elementObj) {

            var config = {};

            switch (tabType) {

                case ctwc.GRAPH_ELEMENT_PROJECT:

                    var options = {
                        projectFQN: elementObj.fqName,
                        projectUUID: elementObj.uuid
                    };

                    config = {
                        elementId: ctwl.MONITOR_PROJECT_VIEW_ID,
                        view: "ProjectTabView",
                        viewPathPrefix: "monitor/networking/ui/js/views/",
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        viewConfig: options
                    };

                    break;

                case ctwc.GRAPH_ELEMENT_NETWORK:

                    var options = {
                        networkFQN: elementObj.fqName,
                        networkUUID: elementObj.uuid
                    };

                    config = {
                        elementId: ctwl.MONITOR_NETWORK_VIEW_ID,
                        view: "NetworkTabView",
                        viewPathPrefix: "monitor/networking/ui/js/views/",
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        viewConfig: options
                    };

                    break;

                case ctwc.GRAPH_ELEMENT_INSTANCE:

                    var options = {
                        networkFQN: elementObj.fqName,
                        instanceUUID: elementObj.uuid
                    };

                    config = {
                        elementId: ctwl.MONITOR_INSTANCE_VIEW_ID,
                        view: "InstanceTabView",
                        viewPathPrefix: "monitor/networking/ui/js/views/",
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        viewConfig: options
                    };

                    break;

                case ctwc.GRAPH_ELEMENT_CONNECTED_NETWORK:

                    config = {
                        elementId: ctwl.MONITOR_CONNECTED_NETWORK_VIEW_ID,
                        view: "ConnectedNetworkTabView",
                        viewPathPrefix: "monitor/networking/ui/js/views/",
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        viewConfig: elementObj
                    };

                    break;

            }

            return config;
        };

        this.getPortDistributionTooltipConfig = function(onScatterChartClick) {
            return function(data) {
                var type = ctwl.get(data['type']),
                    name = data['name'];

                if(data['name'].toString().indexOf('-') > -1) {
                    type += ' Range';
                }

                return {
                    title: {
                        name: name,
                        type: type
                    },
                    content: {
                        iconClass: false,
                        info: [
                            {label: 'Bandwidth', value: cowu.addUnits2Bytes(ifNull(data['origY'], data['y']))}
                        ],
                        actions: [
                            {
                                type: 'link',
                                text: 'View',
                                iconClass: 'fa fa-external-link',
                                callback: onScatterChartClick
                            }
                        ],
                        overlappedElementConfig: {
                            dropdownTypeField: 'type'
                        }
                    }
                };
            }
        };

    };

    return CTGraphConfig;
});