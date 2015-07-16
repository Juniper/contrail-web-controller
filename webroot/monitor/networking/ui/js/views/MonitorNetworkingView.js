/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'controller-basedir/monitor/networking/ui/js/views/BreadcrumbView'
], function (_, Backbone, BreadcrumbView) {
    var MonitorNetworkingView = Backbone.View.extend({
        el: $(contentContainer),

        renderProjectList: function (viewConfig) {
            cowu.renderView4Config(this.$el, null, getProjectListConfig(viewConfig));
        },

        renderProject: function (viewConfig) {
            var self = this,
                hashParams = viewConfig.hashParams,
                fqName = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.fqName') ? hashParams.focusedElement.fqName : null),
                breadcrumbView = new BreadcrumbView();

            breadcrumbView.renderDomainBreadcrumbDropdown(fqName, function (domainSelectedValueData, domainBreadcrumbChanged) {
                var domainFQN = domainSelectedValueData.name;

                breadcrumbView.renderProjectBreadcrumbDropdown(fqName, function (selectedValueData, projectBreadcrumbChanged) {
                    self.renderProjectCB(hashParams, selectedValueData, projectBreadcrumbChanged);
                }, function (selectedValueData, projectBreadcrumbChanged) {
                    var projectFQN = domainFQN + ':' + selectedValueData.name;

                    nmwgrc.setProjectURLHashParams(hashParams, projectFQN, false);
                    self.renderProjectCB(hashParams, selectedValueData, projectBreadcrumbChanged);
                });
            });
       },

        renderProjectCB: function (hashParams, projectObj, breadcrumbChanged) {
            var self = this,
                domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                projectFQN = domain + ':' + projectObj.name,
                projectUUID = projectObj.value,
                ignoreClickedElements = breadcrumbChanged;

            if (ignoreClickedElements == true) {
                delete hashParams.clickedElement;
            }

            cowu.renderView4Config(self.$el, null, getProjectConfig(projectFQN, projectUUID));
        },

        renderNetwork: function (viewConfig) {
            var self = this,
                hashParams = viewConfig.hashParams,
                fqName = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.fqName') ? hashParams.focusedElement.fqName : null),
                breadcrumbView = new BreadcrumbView();

            breadcrumbView.renderDomainBreadcrumbDropdown(fqName, function (domainSelectedValueData, domainBreadcrumbChanged) {
                var domainFQN = domainSelectedValueData.name;

                breadcrumbView.renderProjectBreadcrumbDropdown(fqName, function (projectSelectedValueData, projectBreadcrumbChanged) {
                    breadcrumbView.renderNetworkBreadcrumbDropdown(fqName, function (networkSelectedValueData, networkBreadcrumbChanged) {
                        self.renderNetworkCB(hashParams, networkSelectedValueData, networkBreadcrumbChanged);
                    });
                }, function (projectSelectedValueData, projectBreadcrumbChanged) {
                    var projectFQN = domainFQN + ':' + projectSelectedValueData.name;

                    nmwgrc.setProjectURLHashParams(hashParams, projectFQN, false);
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

            nmwgrc.setNetworkURLHashParams(hashParams, networkFQN, false);
            cowu.renderView4Config(self.$el, null, getNetworkConfig(networkFQN, networkUUID));
        },

        renderNetworkList: function (viewConfig) {
            cowu.renderView4Config(this.$el, null, getNetworkListConfig(viewConfig));
        },

        renderInstance: function (viewConfig) {
            var self = this,
                breadcrumbView = new BreadcrumbView(),
                hashParams = viewConfig.hashParams,
                fqName = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.fqName') ? hashParams.focusedElement.fqName : null),
                instanceUUID = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.uuid')) ? hashParams.focusedElement.uuid : null,
                vmName = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.vmName')) ? hashParams.focusedElement.vmName : null,
                instanceName4Breadcrumb = (contrail.checkIfExist(vmName) && vmName != "") ? vmName : instanceUUID;

            breadcrumbView.renderDomainBreadcrumbDropdown(fqName, function (domainSelectedValueData, domainBreadcrumbChanged) {
                var domainFQN = domainSelectedValueData.name;

                breadcrumbView.renderProjectBreadcrumbDropdown(fqName, function (projectSelectedValueData, projectBreadcrumbChanged) {
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
                    var projectFQN = domainFQN + ':' + projectSelectedValueData.name;

                    nmwgrc.setProjectURLHashParams(hashParams, projectFQN, false);
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

            nmwgrc.setInstanceURLHashParams(hashParams, networkFQN, instanceUUID, vmName, false);

            cowu.renderView4Config(this.$el, null, getInstanceConfig(networkFQN, networkUUID, instanceUUID));
        },

        renderInstanceList: function (viewConfig) {
            cowu.renderView4Config(this.$el, null, getInstanceListConfig(viewConfig));
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

    function getProjectListConfig(viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_PROJECT_LIST_PAGE_ID]),
            view: "ProjectListView",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: viewConfig
        }
    };

    function getNetworkListConfig(viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_NETWORK_LIST_PAGE_ID]),
            view: "NetworkListView",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: viewConfig
        }
    };

    function getInstanceListConfig(viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCE_LIST_PAGE_ID]),
            view: "InstanceListView",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: viewConfig
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
            url = ctwc.constructReqURL($.extend({}, nmwgc.getURLConfigForFlowGrid(hashParams), {protocol:['tcp','icmp','udp']}));

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

    return MonitorNetworkingView;
});