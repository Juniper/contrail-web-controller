/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    './BreadcrumbView.js'
], function (_, Backbone, BreadcrumbView) {
    var MonitorNetworkingView = Backbone.View.extend({
        el: $(contentContainer),

        renderProjectList: function () {
            cowu.renderView4Config(this.$el, null, getProjectListConfig());
        },

        renderProject: function (viewConfig) {
            var self = this,
                fqName = (contrail.checkIfExist(viewConfig.hashParams.fqName) ? viewConfig.hashParams.fqName : null),
                breadcrumbView = new BreadcrumbView();

            breadcrumbView.renderDomainBreadcrumbDropdown(fqName, function (selectedValueData) {
                contrail.setCookie(cowc.COOKIE_DOMAIN, selectedValueData.name);

                breadcrumbView.renderProjectBreadcrumbDropdown(fqName, function (selectedValueData) {
                    self.renderProjectCB(selectedValueData);
                });
            });
       },

        renderProjectCB: function (projectObj) {
            contrail.setCookie(cowc.COOKIE_PROJECT, projectObj.name);

            var self = this,
                domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                projectFQN = domain + ':' + projectObj.name,
                projectUUID = projectObj.value;

            globalObj.hashUpdated = 1;
            layoutHandler.setURLHashObj({
                p: 'mon_networking_projects',
                q: {
                    fqName: projectFQN,
                    view: 'details',
                    type: 'project'
                }
            });

            var connectedGraph = ctwu.getNetworkingGraphConfig(ctwc.get(ctwc.URL_PROJECT_CONNECTED_GRAPH, projectFQN), {fqName: projectFQN}, ':connected', 'Project'),
                configGraph = ctwu.getNetworkingGraphConfig(ctwc.get(ctwc.URL_PROJECT_CONFIG_GRAPH, projectFQN), {fqName: projectFQN}, ':config', 'Project');

            cowu.renderView4Config(this.$el, null, getProjectConfig(connectedGraph, configGraph, projectFQN, projectUUID));
        },

        renderNetwork: function (viewConfig) {
            var self = this,
                fqName = (contrail.checkIfExist(viewConfig.hashParams.fqName) ? viewConfig.hashParams.fqName : null),
                breadcrumbView = new BreadcrumbView();

            breadcrumbView.renderDomainBreadcrumbDropdown(fqName, function (domainSelectedValueData) {
                contrail.setCookie(cowc.COOKIE_DOMAIN, domainSelectedValueData.name);

                breadcrumbView.renderProjectBreadcrumbDropdown(fqName, function (projectSelectedValueData) {
                    contrail.setCookie(cowc.COOKIE_PROJECT, projectSelectedValueData.name);

                    breadcrumbView.renderNetworkBreadcrumbDropdown(fqName, function (networkSelectedValueData) {
                        self.renderNetworkCB(networkSelectedValueData);
                    });
                }, function (projectSelectedValueData) {
                    self.renderProjectCB(projectSelectedValueData);
                });
            });
        },

        renderNetworkCB: function(networkObj) {
            var self = this,
                domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                project = contrail.getCookie(cowc.COOKIE_PROJECT),
                networkFQN = domain + ':' + project + ':' + networkObj.name,
                networkUUID = networkObj.value;

            contrail.setCookie(cowc.COOKIE_VIRTUAL_NETWORK, networkObj.name);

            globalObj.hashUpdated = 1;
            layoutHandler.setURLHashObj({
                p: 'mon_networking_networks',
                q: {
                    fqName: networkFQN,
                    view:'details',
                    type: 'network'
                }
            });

            var connectedGraph = ctwu.getNetworkingGraphConfig(ctwc.get(ctwc.URL_NETWORK_CONNECTED_GRAPH, networkFQN), {fqName: networkFQN}, ':connected', 'Network'),
                configGraph = ctwu.getNetworkingGraphConfig(ctwc.get(ctwc.URL_NETWORK_CONFIG_GRAPH, networkFQN), {fqName: networkFQN}, ':config', 'Network');

            cowu.renderView4Config(this.$el, null, getNetworkConfig(connectedGraph, configGraph, networkFQN, networkUUID));
        },

        renderNetworkList: function (projectFQN) {
            cowu.renderView4Config(this.$el, null, getNetworkListConfig(projectFQN));
        },

        renderInstance: function (viewConfig) {
            var self = this,
                breadcrumbView = new BreadcrumbView(),
                fqName = (contrail.checkIfExist(viewConfig.hashParams.vn)) ? viewConfig.hashParams.vn : null,
                instanceUUID = (contrail.checkIfExist(viewConfig.hashParams.uuid)) ? viewConfig.hashParams.uuid : null;

            breadcrumbView.renderDomainBreadcrumbDropdown(fqName, function (selectedValueData) {
                contrail.setCookie(cowc.COOKIE_DOMAIN, selectedValueData.name);

                breadcrumbView.renderProjectBreadcrumbDropdown(fqName, function (projectSelectedValueData) {
                    contrail.setCookie(cowc.COOKIE_PROJECT, projectSelectedValueData.name);

                    breadcrumbView.renderNetworkBreadcrumbDropdown(fqName,
                        function (networkSelectedValueData) {
                            self.renderInstanceCB(networkSelectedValueData, instanceUUID);
                        }, function (networkSelectedValueData) {
                            self.renderNetworkCB(networkSelectedValueData);
                        }
                    );
                }, function (projectSelectedValueData) {
                    self.renderProjectCB(projectSelectedValueData);
                });
            });
        },

        renderInstanceCB: function(networkObj, instanceUUID) {
            var self = this,
                domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                project = contrail.getCookie(cowc.COOKIE_PROJECT),
                networkFQN = domain + ':' + project + ':' + networkObj.name;

            cowu.renderView4Config(this.$el, null, getInstanceConfig(networkFQN, instanceUUID));
        },

        renderInstanceList: function (projectUUID) {
            cowu.renderView4Config(this.$el, null, getInstanceListConfig(projectUUID));
        },

        renderFlowList: function (viewConfig) {
            cowu.renderView4Config(this.$el, null, getFlowListConfig(viewConfig));
        },

        renderFlow: function (viewConfig) {
            cowu.renderView4Config(this.$el, null, getFlowConfig(viewConfig));
        }
    });

    function getProjectConfig(connectedGraph, configGraph, projectFQN, projectUUID) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_PROJECT_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECT_GRAPH_ID,
                                view: "NetworkingGraphView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {connectedGraph: connectedGraph, configGraph: configGraph}
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: ctwl.MONITOR_PROJECT_VIEW_ID,
                                view: "ProjectTabView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {projectFQN: projectFQN, projectUUID: projectUUID}
                            }
                        ]
                    }
                ]
            }
        }
    };

    function getNetworkConfig(connectedGraph, configGraph, networkFQN, networkUUID) {
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
                    },
                    {
                        columns: [
                            {
                                elementId: ctwl.MONITOR_NETWORK_VIEW_ID,
                                view: "NetworkTabView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {networkFQN: networkFQN, networkUUID: networkUUID}
                            }
                        ]
                    }
                ]
            }
        }
    };

    function getInstanceConfig(networkFQN, instanceUUID) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCE_PAGE_ID]),
            view: "InstanceView",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {networkFQN: networkFQN, instanceUUID: instanceUUID}
        }
    };

    function getProjectListConfig() {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_PROJECTS_PAGE_ID]),
            view: "ProjectListView",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        }
    };

    function getNetworkListConfig() {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_NETWORKS_PAGE_ID]),
            view: "NetworkListView",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        }
    };

    function getInstanceListConfig() {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCES_PAGE_ID]),
            view: "InstanceListView",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        }
    };

    function getFlowListConfig(viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_FLOWS_PAGE_ID]),
            view: "FlowListView",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {config: viewConfig}
        };
    };

    function getFlowConfig(config) {
        var hashParams = config['hashParams'],
            url = constructReqURL($.extend({}, getURLConfigForGrid(hashParams), {protocol:['tcp','icmp','udp']}));

        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_FLOW_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.FLOWS_GRID_ID,
                                title: ctwl.TITLE_FLOWS,
                                view: "FlowGridView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {hashParams: hashParams, pagerOptions: { options: { pageSize: 25, pageSizeSelect: [25, 50, 100] } } }
                            }
                        ]
                    }
                ]
            }
        }
    };

    function getURLConfigForGrid(viewConfig) {
        var urlConfigObj = {
            'container': "#content-container",
            'context'  : "network",
            'type'     : "portRangeDetail",
            'startTime': viewConfig['startTime'],
            'endTime'  : viewConfig['endTime'],
            'fqName'   : viewConfig['fqName'],
            'port'     : viewConfig['port'],
            'portType' : viewConfig['portType']
        };
        return urlConfigObj;
    };

    return MonitorNetworkingView;
});