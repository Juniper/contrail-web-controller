/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-list-model',
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
    'monitor/networking/ui/js/views/InstancePortDistributionView',
    'config/linklocalservices/ui/js/views/LinkLocalServicesListView',
    'config/linklocalservices/ui/js/views/LinkLocalServicesGridView',
    'config/linklocalservices/ui/js/views/LinkLocalServicesEditView',
    'config/physicaldevices/ui/js/views/PhysicalRouterView',
    'config/physicaldevices/ui/js/views/PhysicalRouterListView',
    'config/physicaldevices/ui/js/views/PhysicalRouterGridView'
], function (_, ContrailListModel, NetworkingGraphView, ProjectTabView, NetworkTabView,
             NetworkGridView, InstanceTabView, InstanceGridView,
             ProjectGridView, FlowGridView, NetworkListView, ProjectListView,
             InstanceListView, FlowListView, InstanceView,
             InstanceTrafficStatsView, ProjectView, NetworkView,
             ConnectedNetworkTabView, ConnectedNetworkTrafficStatsView,
             AlarmListView, AlarmGridView, InterfaceGridView,
             InstancePortDistributionView, LinkLocalServicesListView,
             LinkLocalServicesGridView, LinkLocalServicesEditView,
             PhysicalRouterView, PhysicalRouterListView, PhysicalRouterGridView
             ) {
    var ctRenderUtils = function () {
        var self = this;

        self.renderView = function (viewName, parentElement, model,
                                    viewAttributes, modelMap, rootView) {
            var elementView;

            switch (viewName) {
            case "NetworkingGraphView":
                elementView =
                    new NetworkingGraphView({ el: parentElement, model: model,
                                            attributes: viewAttributes,
                                            rootView: rootView });
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "ProjectListView":
                elementView =
                    new ProjectListView({ el: parentElement, model: model,
                                        attributes: viewAttributes,
                                        rootView: rootView });
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "ProjectGridView":
                elementView =
                    new ProjectGridView({ el: parentElement, model: model,
                                        attributes: viewAttributes,
                                        rootView: rootView });
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "ProjectTabView":
                elementView =
                    new ProjectTabView({ el: parentElement, model: model,
                                       attributes: viewAttributes,
                                       rootView: rootView });
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;;

            case "NetworkListView":
                elementView =
                    new NetworkListView({ el: parentElement, model: model,
                                        attributes: viewAttributes,
                                        rootView: rootView });
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "NetworkTabView":
                elementView =
                    new NetworkTabView({ el: parentElement, model: model,
                                       attributes: viewAttributes,
                                       rootView: rootView });
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "NetworkGridView":
                elementView =
                    new NetworkGridView({ el: parentElement, model: model,
                                        attributes: viewAttributes,
                                        rootView: rootView });
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "InstanceListView":
                elementView =
                    new InstanceListView({ el: parentElement, model: model,
                                         attributes: viewAttributes,
                                         rootView: rootView });
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "InstanceTabView":
                elementView =
                    new InstanceTabView({ el: parentElement, model: model,
                                        attributes: viewAttributes,
                                        rootView: rootView });
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "InstanceGridView":
                elementView =
                    new InstanceGridView({ el: parentElement, model: model,
                                         attributes: viewAttributes,
                                         rootView: rootView });
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "FlowListView":
                elementView =
                    new FlowListView({ el: parentElement, model: model,
                                     attributes: viewAttributes,
                                     rootView: rootView });
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "FlowGridView":
                elementView =
                    new FlowGridView({ el: parentElement, model: model,
                                     attributes: viewAttributes,
                                     rootView: rootView });
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "InstanceView":
                elementView =
                    new InstanceView({ el: parentElement, model: model,
                                     attributes: viewAttributes,
                                     rootView: rootView });
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "InstanceTrafficStatsView":
                elementView =
                    new InstanceTrafficStatsView({ el: parentElement,
                                                 model: model,
                                                 attributes: viewAttributes,
                                                 rootView: rootView });
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "ProjectView":
                elementView =
                    new ProjectView({ el: parentElement, model: model,
                                    attributes: viewAttributes,
                                    rootView: rootView });
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "NetworkView":
                elementView =
                    new NetworkView({ el: parentElement, model: model,
                                    attributes: viewAttributes,
                                    rootView: rootView });
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "ConnectedNetworkTabView":
                elementView =
                    new ConnectedNetworkTabView({ el: parentElement,
                                                model: model,
                                                attributes: viewAttributes,
                                                rootView: rootView });
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "ConnectedNetworkTrafficStatsView":
                elementView =
                    new ConnectedNetworkTrafficStatsView({ el: parentElement,
                                                         model: model,
                                                         attributes: viewAttributes,
                                                         rootView: rootView });
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "AlarmListView":
                elementView =
                    new AlarmListView({ el: parentElement, model: model,
                                      attributes: viewAttributes,
                                      rootView: rootView });
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "AlarmGridView":
                elementView =
                    new AlarmGridView({ el: parentElement, model: model,
                                      attributes: viewAttributes,
                                      rootView: rootView });
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "InterfaceGridView":
                elementView =
                    new InterfaceGridView({ el: parentElement, model: model,
                                          attributes: viewAttributes,
                                          rootView: rootView });
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "InstancePortDistributionView":
                elementView =
                    new InstancePortDistributionView({ el: parentElement,
                                                     model: model,
                                                     attributes: viewAttributes,
                                                     rootView: rootView });
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "LinkLocalServicesListView":
                elementView =
                    new LinkLocalServicesListView({ el: parentElement,
                                                  model: model,
                                                  attributes: viewAttributes,
                                                  rootView: rootView });
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "LinkLocalServicesGridView":
                elementView =
                    new LinkLocalServicesGridView({ el: parentElement,
                                                  model: model,
                                                  attributes: viewAttributes,
                                                  rootView: rootView });
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "LinkLocalServicesEditView":
                elementView =
                    new LinkLocalServicesEditView({ el: parentElement,
                                                  model: model,
                                                  attributes: viewAttributes,
                                                  rootView: rootView});
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "PhysicalRouterView":
                elementView =
                    new PhysicalRouterView({ el: parentElement,
                                                  model: model,
                                                  attributes: viewAttributes,
                                                  rootView: rootView});
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "PhysicalRouterListView":
                elementView =
                    new PhysicalRouterListView({ el: parentElement,
                                                  model: model,
                                                  attributes: viewAttributes,
                                                  rootView: rootView});
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;

            case "PhysicalRouterGridView":
                elementView =
                    new PhysicalRouterGridView({ el: parentElement,
                                                  model: model,
                                                  attributes: viewAttributes,
                                                  rootView: rootView});
                elementView.modelMap = modelMap;
                elementView.render();
                return elementView;
            };
        };
    };
    return ctRenderUtils;
});

