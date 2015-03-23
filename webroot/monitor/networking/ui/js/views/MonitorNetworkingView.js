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
                hashParams = viewConfig.hashParams,
                fqName = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.fqName') ? hashParams.focusedElement.fqName : null),
                breadcrumbView = new BreadcrumbView();

            breadcrumbView.renderDomainBreadcrumbDropdown(fqName, function (selectedValueData) {
                contrail.setCookie(cowc.COOKIE_DOMAIN, selectedValueData.name);

                breadcrumbView.renderProjectBreadcrumbDropdown(fqName, function (selectedValueData) {
                    self.renderProjectCB(hashParams, selectedValueData);
                });
            });
       },

        renderProjectCB: function (hashParams, projectObj) {
            contrail.setCookie(cowc.COOKIE_PROJECT, projectObj.name);

            var self = this,
                domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                projectFQN = domain + ':' + projectObj.name,
                projectUUID = projectObj.value;

            ctwgrc.setProjectURLHashParams(hashParams, projectFQN, false);

            cowu.renderView4Config(this.$el, null, getProjectConfig(projectFQN, projectUUID));
        },

        renderNetwork: function (viewConfig) {
            var self = this,
                hashParams = viewConfig.hashParams,
                fqName = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.fqName') ? hashParams.focusedElement.fqName : null),
                breadcrumbView = new BreadcrumbView();

            breadcrumbView.renderDomainBreadcrumbDropdown(fqName, function (domainSelectedValueData) {
                contrail.setCookie(cowc.COOKIE_DOMAIN, domainSelectedValueData.name);

                breadcrumbView.renderProjectBreadcrumbDropdown(fqName, function (projectSelectedValueData) {
                    contrail.setCookie(cowc.COOKIE_PROJECT, projectSelectedValueData.name);

                    breadcrumbView.renderNetworkBreadcrumbDropdown(fqName, function (networkSelectedValueData) {
                        self.renderNetworkCB(hashParams, networkSelectedValueData);
                    });
                }, function (projectSelectedValueData) {
                    self.renderProjectCB(hashParams, projectSelectedValueData);
                });
            });
        },

        renderNetworkCB: function(hashParams, networkObj) {
            var self = this,
                domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                project = contrail.getCookie(cowc.COOKIE_PROJECT),
                networkFQN = domain + ':' + project + ':' + networkObj.name,
                networkUUID = networkObj.value;

            contrail.setCookie(cowc.COOKIE_VIRTUAL_NETWORK, networkObj.name);

            ctwgrc.setNetworkURLHashParams(hashParams, networkFQN, false);

            cowu.renderView4Config(this.$el, null, getNetworkConfig(networkFQN, networkUUID));
        },

        renderNetworkList: function (projectFQN) {
            cowu.renderView4Config(this.$el, null, getNetworkListConfig(projectFQN));
        },

        renderInstance: function (viewConfig) {
            var self = this,
                breadcrumbView = new BreadcrumbView(),
                hashParams = viewConfig.hashParams,
                fqName = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.fqName') ? hashParams.focusedElement.fqName : null),
                instanceUUID = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.uuid')) ? hashParams.focusedElement.uuid : null;

            breadcrumbView.renderDomainBreadcrumbDropdown(fqName, function (selectedValueData) {
                contrail.setCookie(cowc.COOKIE_DOMAIN, selectedValueData.name);

                breadcrumbView.renderProjectBreadcrumbDropdown(fqName, function (projectSelectedValueData) {
                    contrail.setCookie(cowc.COOKIE_PROJECT, projectSelectedValueData.name);

                    breadcrumbView.renderNetworkBreadcrumbDropdown(fqName,
                        function (networkSelectedValueData) {
                            self.renderInstanceCB(hashParams, networkSelectedValueData, instanceUUID);
                        }, function (networkSelectedValueData) {
                            self.renderNetworkCB(hashParams, networkSelectedValueData);
                        }
                    );
                }, function (projectSelectedValueData) {
                    self.renderProjectCB(hashParams, projectSelectedValueData);
                });
            });
        },

        renderInstanceCB: function(hashParams, networkObj, instanceUUID) {
            var self = this,
                domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                project = contrail.getCookie(cowc.COOKIE_PROJECT),
                networkFQN = domain + ':' + project + ':' + networkObj.name,
                networkUUID = networkObj.value;

            ctwgrc.setInstanceURLHashParams(hashParams, networkFQN, instanceUUID, false);

            cowu.renderView4Config(this.$el, null, getInstanceConfig(networkFQN, networkUUID, instanceUUID));
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

    function getProjectConfig(projectFQN, projectUUID) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_PROJECT_PAGE_ID]),
            view: "ProjectView",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {projectFQN: projectFQN, projectUUID: projectUUID}
        }
    };

    function getNetworkConfig(networkFQN, networkUUID) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_NETWORK_PAGE_ID]),
            view: "NetworkView",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {networkFQN: networkFQN, networkUUID: networkUUID}
        }
    };

    function getInstanceConfig(networkFQN, networkUUID, instanceUUID) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCE_PAGE_ID]),
            view: "InstanceView",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {networkFQN: networkFQN, networkUUID: networkUUID, instanceUUID: instanceUUID}
        }
    };

    function getProjectListConfig() {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_PROJECT_LIST_PAGE_ID]),
            view: "ProjectListView",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        }
    };

    function getNetworkListConfig() {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_NETWORK_LIST_PAGE_ID]),
            view: "NetworkListView",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        }
    };

    function getInstanceListConfig() {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCE_LIST_PAGE_ID]),
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