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
    'monitor/networking/ui/js/views/InterfaceGridView'
], function (_, NetworkingGraphView, ProjectTabView, NetworkTabView, NetworkGridView, InstanceTabView, InstanceGridView,
             ProjectGridView, FlowGridView, NetworkListView, ProjectListView, InstanceListView, FlowListView, InstanceView,
             InstanceTrafficStatsView, ProjectView, NetworkView, ConnectedNetworkTabView, ConnectedNetworkTrafficStatsView,
             AlarmListView, AlarmGridView, InterfaceGridView) {

    var CTUtils = function () {
        var self = this;

        self.initPortDistributionCharts = function (data) {
            var chartsTemplate = contrail.getTemplate4Id('port-distribution-charts-template');
            var networkChart, chartSelector;
            if ((data['chartType'] == null) && ($.inArray(ifNull(data['context'], ''), ['domain', 'network', 'connected-nw', 'project', 'instance']) > -1)) {
                networkChart = true;
                chartSelector = '.port-distribution-chart';
            } else {
                networkChart = false;
                chartSelector = '.port-distribution-chart';
            }
            $(this).html(chartsTemplate(data));
            if (networkChart == true) {
                //Add durationStr
                $.each(data['d'], function (idx, obj) {
                    if (ifNull(obj['duration'], true)) {
                        if (obj['title'].indexOf('(') < 0)
                            obj['title'] += durationStr;
                    }
                });
                //Set the chart height to parent height - title height
            }
            //$(this).find('.stack-chart').setAvblSize();
            var charts = $(this).find(chartSelector);
            $.each(charts, function (idx, chart) {
                //Bind the function to pass on the context of url & objectType to schema parse function
                var chartData = data['d'][idx];
                var chartType = ifNull(chartData['chartType'], '');
                var fields;
                var objectType = chartData['objectType'];
                //Load asynchronously
                initDeferred($.extend({}, chartData, {selector: $(this), renderFn: 'initScatterChart'}));
                //If title is clickable
            });
        };

        self.getMNConfigGraphConfig = function (url, elementNameObject, keySuffix, type) {
            var graphConfig = {
                remote: {
                    ajaxConfig: {
                        url: url,
                        type: 'GET'
                    }
                },
                cacheConfig: {
                    ucid: ctwc.UCID_PREFIX_MN_GRAPHS + elementNameObject.fqName + keySuffix
                },
                focusedElement: {
                    type: type,
                    name: elementNameObject
                }
            };

            return graphConfig;
        };

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
        
        self.getUUIDByName = function (fqName) {
            var fqArray = fqName.split(":"),
                ucid, modeltems, cachedData;

            if (fqArray.length == 1) {
                ucid = ctwc.UCID_BC_ALL_DOMAINS;
                cachedData = cowch.get(ucid);
                if (cachedData == null) {
                    cowch.getAllDomains();
                    return null;
                }
            } else if (fqArray.length == 2) {
                ucid = ctwc.get(ctwc.UCID_BC_DOMAIN_ALL_PROJECTS, fqArray[0]);
                cachedData = cowch.get(ucid);
                if (cachedData == null) {
                    cowch.getProjects4Domain(fqArray[0]);
                    return getUUIDByName(fqName);
                }
            } else if (fqArray.length == 3) {
                ucid = ctwc.get(ctwc.UCID_BC_PROJECT_ALL_NETWORKS, fqArray[0] + ":" + fqArray[1]);
                cachedData = cowch.get(ucid);
                if (cachedData == null) {
                    cowch.getNetworks4Project(fqArray[0] + ":" + fqArray[1]);
                    return getUUIDByName(fqName);
                }
            }

            if (cachedData != null) {
                modeltems = cachedData['dataObject']['listModel'].getItems();
                var cachedObject = _.find(modeltems, function (domainObj) {
                    return domainObj['fq_name'] == fqName;
                });
                if (contrail.checkIfExist(cachedObject)) {
                    return cachedObject['value'];
                } else {
                    return getUUIDByName(fqName);
                }
            }
        };

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
            }
        };
    }

    return CTUtils;
});
