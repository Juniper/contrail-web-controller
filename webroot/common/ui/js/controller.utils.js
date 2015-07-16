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
], function (_, NetworkingGraphView, ProjectTabView, NetworkTabView, NetworkGridView, InstanceTabView, InstanceGridView,
             ProjectGridView, FlowGridView, NetworkListView, ProjectListView, InstanceListView, FlowListView, InstanceView,
             InstanceTrafficStatsView, ProjectView, NetworkView, ConnectedNetworkTabView, ConnectedNetworkTrafficStatsView,
             AlarmListView, AlarmGridView, InterfaceGridView, InstancePortDistributionView) {

    var CTUtils = function () {
        var self = this;

        self.getInstanceDetailsTemplateConfig = function () {
            return {

                templateGenerator: 'RowSectionTemplateGenerator',
                templateGeneratorConfig: {
                    rows: [
                        {
                            templateGenerator: 'ColumnSectionTemplateGenerator',
                            templateGeneratorConfig: {
                                columns: [
                                    {
                                        class: 'span6',
                                        rows: [
                                            {
                                                title: ctwl.TITLE_INSTANCE_DETAILS,
                                                templateGenerator: 'BlockListTemplateGenerator',
                                                templateGeneratorConfig: [
                                                    {
                                                        key: 'vm_name',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'value.UveVirtualMachineAgent.uuid',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'value.UveVirtualMachineAgent.vrouter',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'value.UveVirtualMachineAgent.interface_list',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'length'
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        class: 'span6',
                                        rows: [
                                            {
                                                title: ctwl.TITLE_CPU_MEMORY_INFO,
                                                templateGenerator: 'BlockListTemplateGenerator',
                                                templateGeneratorConfig: [
                                                    {
                                                        key: 'value.UveVirtualMachineAgent.cpu_info.cpu_one_min_avg',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'value.UveVirtualMachineAgent.cpu_info.rss',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'kilo-byte'
                                                        }
                                                    },
                                                    {
                                                        key: 'value.UveVirtualMachineAgent.cpu_info.vm_memory_quota',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'kilo-byte'
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    ]
                }
            
            }
        }

        //If there is discrepancy in data sent from multiple sources
        self.getDataBasedOnSource = function (data) {
            if ((data != null) && (data[0] instanceof Array)) {
                var idx = 0;
                //Loop through and pick the index for vrouteragent
                for (var i = 0; i < data.length; i++) {
                    if (data[i][1] != null) {
                        if (data[i][1].match('Compute:contrail-vrouter-agent')) {
                            idx = i;
                            break;
                        }
                    }
                }
                data = data[idx][0];
            }
            return data;
        };

        // This function formats the VN name by discarding the domain name and appending the project name in the braces
        // input: either array of networks or single network like [default-domain:demo:ipv6test2], default-domain:demo:ipv6test2
        // output:[ipv6test2 (demo)],ipv6test2 (demo).

        self.formatVNName = function (vnName) {
            var formattedValue;
            if (!$.isArray(vnName))
                vnName = [vnName];
            formattedValue = $.map(vnName, function (value, idx) {
                var fqNameArr = value.split(':');
                if (fqNameArr.length == 3)
                    return fqNameArr[2] + ' (' + fqNameArr[1] + ')';
                else
                    return value;
            });
            return formattedValue;
        };

        this.isServiceVN = function (vnFQN) {
            var fqnArray = vnFQN.split(":");

            if(ctwc.SERVICE_VN_EXCLUDE_LIST.indexOf(fqnArray[2]) != -1) {
                return true;
            }

            return false;
        };

        self.renderView = function (viewName, parentElement, model, viewAttributes, modelMap) {
            var elementView;

            switch (viewName) {
                case "NetworkingGraphView":
                    elementView = new NetworkingGraphView({ el: parentElement, model: model, attributes: viewAttributes });
                    elementView.modelMap = modelMap;
                    elementView.render();
                    break;

                case "ProjectListView":
                    elementView = new ProjectListView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.modelMap = modelMap;
                    elementView.render();
                    break;

                case "ProjectGridView":
                    elementView = new ProjectGridView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.modelMap = modelMap;
                    elementView.render();
                    break;

                case "ProjectTabView":
                    elementView = new ProjectTabView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.modelMap = modelMap;
                    elementView.render();
                    break;

                case "NetworkListView":
                    elementView = new NetworkListView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.modelMap = modelMap;
                    elementView.render();
                    break;

                case "NetworkTabView":
                    elementView = new NetworkTabView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.modelMap = modelMap;
                    elementView.render();
                    break;

                case "NetworkGridView":
                    elementView = new NetworkGridView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.modelMap = modelMap;
                    elementView.render();
                    break;

                case "InstanceListView":
                    elementView = new InstanceListView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.modelMap = modelMap;
                    elementView.render();
                    break;

                case "InstanceTabView":
                    elementView = new InstanceTabView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.modelMap = modelMap;
                    elementView.render();
                    break;

                case "InstanceGridView":
                    elementView = new InstanceGridView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.modelMap = modelMap;
                    elementView.render();
                    break;

                case "FlowListView":
                    elementView = new FlowListView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.modelMap = modelMap;
                    elementView.render();
                    break;

                case "FlowGridView":
                    elementView = new FlowGridView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.modelMap = modelMap;
                    elementView.render();
                    break;

                case "InstanceView":
                    elementView = new InstanceView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.modelMap = modelMap;
                    elementView.render();
                    break;

                case "InstanceTrafficStatsView":
                    elementView = new InstanceTrafficStatsView({ el: parentElement, model: model, attributes: viewAttributes });
                    elementView.modelMap = modelMap;
                    elementView.render();
                    break;

                case "ProjectView":
                    elementView = new ProjectView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.modelMap = modelMap;
                    elementView.render();
                    break;

                case "NetworkView":
                    elementView = new NetworkView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.modelMap = modelMap;
                    elementView.render();
                    break;

                case "ConnectedNetworkTabView":
                    elementView = new ConnectedNetworkTabView({ el: parentElement, model: model, attributes: viewAttributes });
                    elementView.modelMap = modelMap;
                    elementView.render();
                    break;

                case "ConnectedNetworkTrafficStatsView":
                    elementView = new ConnectedNetworkTrafficStatsView({ el: parentElement, model: model, attributes: viewAttributes });
                    elementView.modelMap = modelMap;
                    elementView.render();
                    break;

                case "AlarmListView":
                    elementView = new AlarmListView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.modelMap = modelMap;
                    elementView.render();
                    break;

                case "AlarmGridView":
                    elementView = new AlarmGridView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.modelMap = modelMap;
                    elementView.render();
                    break;

                case "InterfaceGridView":
                    elementView = new InterfaceGridView({ el: parentElement, model: model, attributes: viewAttributes });
                    elementView.modelMap = modelMap;
                    elementView.render();
                    break;

                case "InstancePortDistributionView":
                    elementView = new InstancePortDistributionView({ el: parentElement, model: model, attributes: viewAttributes });
                    elementView.modelMap = modelMap;
                    elementView.render();
                    break;
            }
        };
    };

    return CTUtils;
});
