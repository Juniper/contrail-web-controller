/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'monitor/networking/ui/js/views/NetworkingGraphView',
    'monitor/networking/ui/js/views/ProjectTabView',
    'monitor/networking/ui/js/views/NetworkTabView',
    'monitor/networking/ui/js/views/NetworkGridView',
    'monitor/networking/ui/js/views/InstanceTabView',
    'monitor/networking/ui/js/views/InstanceGridView',
    'monitor/networking/ui/js/views/ProjectGridView',
    'monitor/networking/ui/js/views/FlowGridView',
    'monitor/networking/ui/js/views/NetworkListView',
    'monitor/networking/ui/js/views/ProjectListView',
    'monitor/networking/ui/js/views/InstanceListView',
    'monitor/networking/ui/js/views/FlowListView',
    'monitor/networking/ui/js/views/InstanceView',
    'monitor/networking/ui/js/views/InstanceTrafficStatsView',
    'monitor/networking/ui/js/views/ProjectView',
    'monitor/networking/ui/js/views/NetworkView',
    'monitor/networking/ui/js/views/ConnectedNetworkTabView',
    'monitor/networking/ui/js/views/ConnectedNetworkTrafficStatsView',
    'monitor/alarms/ui/js/views/AlarmListView',
    'monitor/alarms/ui/js/views/AlarmGridView',
    'monitor/networking/ui/js/views/InterfaceGridView',
    'monitor/networking/ui/js/views/InstancePortDistributionView'
], function (_, NetworkingGraphView, ProjectTabView, NetworkTabView,
             NetworkGridView, InstanceTabView, InstanceGridView,
             ProjectGridView, FlowGridView, NetworkListView, ProjectListView,
             InstanceListView, FlowListView, InstanceView,
             InstanceTrafficStatsView, ProjectView, NetworkView,
             ConnectedNetworkTabView, ConnectedNetworkTrafficStatsView,
             AlarmListView, AlarmGridView, InterfaceGridView,
             InstancePortDistributionView) {
    var ctRenderUtils = function () {
        var self = this;

        self.renderView = function (viewName, parentElement, model,
                                    viewAttributes, modelMap) {
            var elementView;

            switch (viewName) {
            case "NetworkingGraphView":
                elementView =
                    new NetworkingGraphView({ el: parentElement,
                                            model: model,
                                            attributes: viewAttributes });
                elementView.modelMap = modelMap;
                elementView.render();
                break;

            case "ProjectListView":
                elementView =
                    new ProjectListView({el: parentElement,
                                        model: model,
                                        attributes: viewAttributes});
                elementView.modelMap = modelMap;
                elementView.render();
                break;

            case "ProjectGridView":
                elementView =
                    new ProjectGridView({el: parentElement,
                                        model: model,
                                        attributes: viewAttributes});
                elementView.modelMap = modelMap;
                elementView.render();
                break;

            case "ProjectTabView":
                elementView =
                    new ProjectTabView({el: parentElement,
                                       model: model,
                                       attributes: viewAttributes});
                elementView.modelMap = modelMap;
                elementView.render();
                break;

            case "NetworkListView":
                elementView =
                    new NetworkListView({el: parentElement,
                                        model: model,
                                        attributes: viewAttributes});
                elementView.modelMap = modelMap;
                elementView.render();
                break;

            case "NetworkTabView":
                elementView =
                    new NetworkTabView({el: parentElement,
                                       model: model,
                                       attributes: viewAttributes});
                elementView.modelMap = modelMap;
                elementView.render();
                break;

            case "NetworkGridView":
                elementView =
                    new NetworkGridView({el: parentElement,
                                        model: model,
                                        attributes: viewAttributes});
                elementView.modelMap = modelMap;
                elementView.render();
                break;

            case "InstanceListView":
                elementView =
                    new InstanceListView({el: parentElement,
                                         model: model,
                                         attributes: viewAttributes});
                elementView.modelMap = modelMap;
                elementView.render();
                break;

            case "InstanceTabView":
                elementView =
                    new InstanceTabView({el: parentElement,
                                        model: model,
                                        attributes: viewAttributes});
                elementView.modelMap = modelMap;
                elementView.render();
                break;

            case "InstanceGridView":
                elementView =
                    new InstanceGridView({el: parentElement,
                                         model: model,
                                         attributes: viewAttributes});
                elementView.modelMap = modelMap;
                elementView.render();
                break;

            case "FlowListView":
                elementView =
                    new FlowListView({el: parentElement,
                                     model: model,
                                     attributes: viewAttributes});
                elementView.modelMap = modelMap;
                elementView.render();
                break;

            case "FlowGridView":
                elementView =
                    new FlowGridView({el: parentElement,
                                     model: model,
                                     attributes: viewAttributes});
                elementView.modelMap = modelMap;
                elementView.render();
                break;

            case "InstanceView":
                elementView =
                    new InstanceView({el: parentElement,
                                     model: model,
                                     attributes: viewAttributes});
                elementView.modelMap = modelMap;
                elementView.render();
                break;

            case "InstanceTrafficStatsView":
                elementView =
                    new InstanceTrafficStatsView({ el: parentElement,
                                                 model: model,
                                                 attributes: viewAttributes });
                elementView.modelMap = modelMap;
                elementView.render();
                break;

            case "ProjectView":
                elementView =
                    new ProjectView({el: parentElement,
                                    model: model,
                                    attributes: viewAttributes});
                elementView.modelMap = modelMap;
                elementView.render();
                break;

            case "NetworkView":
                elementView =
                    new NetworkView({el: parentElement,
                                    model: model,
                                    attributes: viewAttributes});
                elementView.modelMap = modelMap;
                elementView.render();
                break;

            case "ConnectedNetworkTabView":
                elementView =
                    new ConnectedNetworkTabView({ el: parentElement,
                                                model: model,
                                                attributes: viewAttributes });
                elementView.modelMap = modelMap;
                elementView.render();
                break;

            case "ConnectedNetworkTrafficStatsView":
                elementView =
                    new ConnectedNetworkTrafficStatsView({ el: parentElement,
                                                         model: model,
                                                         attributes: viewAttributes });
                elementView.modelMap = modelMap;
                elementView.render();
                break;

            case "AlarmListView":
                elementView =
                    new AlarmListView({el: parentElement,
                                      model: model,
                                      attributes: viewAttributes});
                elementView.modelMap = modelMap;
                elementView.render();
                break;

            case "AlarmGridView":
                elementView =
                    new AlarmGridView({el: parentElement,
                                      model: model,
                                      attributes: viewAttributes});
                elementView.modelMap = modelMap;
                elementView.render();
                break;

            case "InterfaceGridView":
                elementView =
                    new InterfaceGridView({ el: parentElement,
                                          model: model,
                                          attributes: viewAttributes });
                elementView.modelMap = modelMap;
                elementView.render();
                break;
            }
        };
    };
    return ctRenderUtils;
});

