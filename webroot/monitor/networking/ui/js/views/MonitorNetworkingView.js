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

            breadcrumbView.renderDomainBreadcrumbDropdown(fqName, function (selectedValueData, domainBreadcrumbChanged) {
                contrail.setCookie(cowc.COOKIE_DOMAIN, selectedValueData.name);

                breadcrumbView.renderProjectBreadcrumbDropdown(fqName, function (selectedValueData, projectBreadcrumbChanged) {
                    self.renderProjectCB(hashParams, selectedValueData, projectBreadcrumbChanged);
                }, function (selectedValueData, projectBreadcrumbChanged) {
                    var domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                        projectFQN = domain + ':' + selectedValueData.name;

                    ctwgrc.setProjectURLHashParams(hashParams, projectFQN, false);
                    self.renderProjectCB(hashParams, selectedValueData, projectBreadcrumbChanged);
                });
            });
       },

        renderProjectCB: function (hashParams, projectObj, breadcrumbChanged) {
            contrail.setCookie(cowc.COOKIE_PROJECT, projectObj.name);

            var self = this,
                domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                projectFQN = domain + ':' + projectObj.name,
                projectUUID = projectObj.value,
                ignoreClickedElements = breadcrumbChanged;

            if (ignoreClickedElements == true) {
                delete hashParams.clickedElement;
            }

            cowu.renderView4Config(this.$el, null, getProjectConfig(projectFQN, projectUUID));
        },

        renderNetwork: function (viewConfig) {
            var self = this,
                hashParams = viewConfig.hashParams,
                fqName = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.fqName') ? hashParams.focusedElement.fqName : null),
                breadcrumbView = new BreadcrumbView();

            breadcrumbView.renderDomainBreadcrumbDropdown(fqName, function (domainSelectedValueData, domainBreadcrumbChanged) {
                contrail.setCookie(cowc.COOKIE_DOMAIN, domainSelectedValueData.name);

                breadcrumbView.renderProjectBreadcrumbDropdown(fqName, function (projectSelectedValueData, projectBreadcrumbChanged) {
                    contrail.setCookie(cowc.COOKIE_PROJECT, projectSelectedValueData.name);

                    breadcrumbView.renderNetworkBreadcrumbDropdown(fqName, function (networkSelectedValueData, networkBreadcrumbChanged) {
                        self.renderNetworkCB(hashParams, networkSelectedValueData, networkBreadcrumbChanged);
                    });
                }, function (projectSelectedValueData, projectBreadcrumbChanged) {
                    var domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                        projectFQN = domain + ':' + projectSelectedValueData.name;

                    ctwgrc.setProjectURLHashParams(hashParams, projectFQN, false);
                    self.renderProjectCB(hashParams, projectSelectedValueData, projectBreadcrumbChanged);
                });
            });
        },

        renderNetworkCB: function(hashParams, networkObj, breadcrumbChanged) {
            var self = this,
                domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                project = contrail.getCookie(cowc.COOKIE_PROJECT),
                networkFQN = domain + ':' + project + ':' + networkObj.name,
                networkUUID = networkObj.value,
                ignoreClickedElements = breadcrumbChanged;

            if (ignoreClickedElements == true) {
                delete hashParams.clickedElement;
            }

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
                instanceUUID = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.uuid')) ? hashParams.focusedElement.uuid : null,
                vmName = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.vmName')) ? hashParams.focusedElement.vmName : null,
                instanceName4Breadcrumb = (contrail.checkIfExist(vmName) && vmName != "") ? vmName : instanceUUID;

            breadcrumbView.renderDomainBreadcrumbDropdown(fqName, function (selectedValueData, domainBreadcrumbChanged) {
                contrail.setCookie(cowc.COOKIE_DOMAIN, selectedValueData.name);

                breadcrumbView.renderProjectBreadcrumbDropdown(fqName, function (projectSelectedValueData, projectBreadcrumbChanged) {
                    contrail.setCookie(cowc.COOKIE_PROJECT, projectSelectedValueData.name);

                    breadcrumbView.renderNetworkBreadcrumbDropdown(fqName,
                        function (networkSelectedValueData) {
                            breadcrumbView.renderInstanceBreadcrumbDropdown(networkSelectedValueData, instanceName4Breadcrumb, function (networkSelectedValueData) {
                                self.renderInstanceCB(hashParams, networkSelectedValueData, instanceUUID);
                            });
                        }, function (networkSelectedValueData, networkBreadcrumbChanged) {
                            removeActiveBreadcrumb();
                            self.renderNetworkCB(hashParams, networkSelectedValueData, networkBreadcrumbChanged);
                        }
                    );
                }, function (projectSelectedValueData, projectBreadcrumbChanged) {
                    removeActiveBreadcrumb();
                    var domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                        projectFQN = domain + ':' + projectSelectedValueData.name;

                    ctwgrc.setProjectURLHashParams(hashParams, projectFQN, false);
                    self.renderProjectCB(hashParams, projectSelectedValueData, projectBreadcrumbChanged);
                });
            });
        },

        renderInstanceCB: function(hashParams, networkObj, instanceUUID) {
            var self = this,
                domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                project = contrail.getCookie(cowc.COOKIE_PROJECT),
                networkFQN = domain + ':' + project + ':' + networkObj.name,
                networkUUID = networkObj.value,
                vmName = hashParams['focusedElement']['vmName'];

            ctwgrc.setInstanceURLHashParams(hashParams, networkFQN, instanceUUID, vmName, false);

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