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
    'monitor/alarms/ui/js/views/AlarmGridView'

], function (_, NetworkingGraphView, ProjectTabView, NetworkTabView, NetworkGridView, InstanceTabView, InstanceGridView,
             ProjectGridView, FlowGridView, NetworkListView, ProjectListView, InstanceListView, FlowListView, InstanceView,
             InstanceTrafficStatsView, ProjectView, NetworkView, ConnectedNetworkTabView, ConnectedNetworkTrafficStatsView,
             AlarmListView, AlarmGridView) {

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

        self.getNetworkingGraphConfig = function (url, elementNameObject, keySuffix, type) {
            return {
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
        };

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
            }
        };
    }

    return CTUtils;
});
