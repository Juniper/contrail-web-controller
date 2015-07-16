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
                        elementId: cowu.formatElementId([ctwl.MONITOR_PROJECT_ID]),
                        view: "SectionView",
                        viewConfig: {
                            rows: [
                                {
                                    columns: [
                                        {
                                            elementId: ctwl.MONITOR_PROJECT_VIEW_ID,
                                            view: "ProjectTabView",
                                            app: cowc.APP_CONTRAIL_CONTROLLER,
                                            viewConfig: options
                                        }
                                    ]
                                }
                            ]
                        }
                    };

                    break;

                case ctwc.GRAPH_ELEMENT_NETWORK:

                    var options = {
                        networkFQN: elementObj.fqName,
                        networkUUID: elementObj.uuid
                    };

                    config = {
                        elementId: cowu.formatElementId([ctwl.MONITOR_NETWORK_ID]),
                        view: "SectionView",
                        viewConfig: {
                            rows: [
                                {
                                    columns: [
                                        {
                                            elementId: ctwl.MONITOR_NETWORK_VIEW_ID,
                                            view: "NetworkTabView",
                                            app: cowc.APP_CONTRAIL_CONTROLLER,
                                            viewConfig: options
                                        }
                                    ]
                                }
                            ]
                        }
                    };

                    break;

                case ctwc.GRAPH_ELEMENT_INSTANCE:

                    var options = {
                        networkFQN: elementObj.fqName,
                        instanceUUID: elementObj.uuid
                    };

                    config = {
                        elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCE_ID]),
                        view: "SectionView",
                        viewConfig: {
                            rows: [
                                {
                                    columns: [
                                        {
                                            elementId: ctwl.MONITOR_INSTANCE_VIEW_ID,
                                            view: "InstanceTabView",
                                            app: cowc.APP_CONTRAIL_CONTROLLER,
                                            viewConfig: options
                                        }
                                    ]
                                }
                            ]
                        }
                    };

                    break;

                case ctwc.GRAPH_ELEMENT_CONNECTED_NETWORK:

                    config = {
                        elementId: cowu.formatElementId([ctwl.MONITOR_CONNECTED_NETWORK_ID]),
                        view: "SectionView",
                        viewConfig: {
                            rows: [
                                {
                                    columns: [
                                        {
                                            elementId: ctwl.MONITOR_CONNECTED_NETWORK_VIEW_ID,
                                            view: "ConnectedNetworkTabView",
                                            app: cowc.APP_CONTRAIL_CONTROLLER,
                                            viewConfig: elementObj
                                        }
                                    ]
                                }
                            ]
                        }
                    };

                    break;

            }

            return config;
        };
    };

    return CTGraphConfig;
});