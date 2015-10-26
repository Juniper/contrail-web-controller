/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'core-basedir/js/views/LineWithFocusChartView',
    'contrail-list-model',
], function (_, ContrailView, LineWithFocusChartView, ContrailListModel) {
    var InstanceTrafficStatsView = ContrailView.extend({
        render: function () {
            var instanceTrafficStatsTemplate = contrail.getTemplate4Id(ctwc.TMPL_TRAFFIC_STATS_TAB),
                viewConfig = this.attributes.viewConfig,
                self = this, deferredObj = $.Deferred(),
                selector = $(self.$el), modelMap = this.modelMap;

            $(selector).append(instanceTrafficStatsTemplate({
                dropdownId: ctwl.INSTANCE_TRAFFIC_STATS_DROPDOWN_ID,
                chartId: ctwl.INSTANCE_TRAFFIC_STATS_CHART_ID
            }));

            var instanceTrafficStatsDropdown = $('#' + ctwl.INSTANCE_TRAFFIC_STATS_DROPDOWN_ID),
                instanceTrafficStatsChart = $('#' + ctwl.INSTANCE_TRAFFIC_STATS_CHART_ID);

            if (modelMap != null && modelMap[viewConfig['modelKey']] != null) {
                var contrailViewModel = modelMap[viewConfig['modelKey']],
                    interfaceList;

                if (!contrailViewModel.isRequestInProgress()) {
                    interfaceList = contrailViewModel.attributes.value.UveVirtualMachineAgent.interface_details;
                    constructInstanceTrafficStatsDropdown(instanceTrafficStatsDropdown, instanceTrafficStatsChart,
                        interfaceList, getInstanceTrafficStatsChangeCB(instanceTrafficStatsDropdown, instanceTrafficStatsChart, viewConfig));
                } else {
                    contrailViewModel.onAllRequestsComplete.subscribe(function () {
                        if (contrail.checkIfKeyExistInObject(true, contrailViewModel.attributes, 'value.UveVirtualMachineAgent.interface_details')) {
                            interfaceList = contrailViewModel.attributes.value.UveVirtualMachineAgent.interface_details;
                            constructInstanceTrafficStatsDropdown(instanceTrafficStatsDropdown, instanceTrafficStatsChart,
                                interfaceList, getInstanceTrafficStatsChangeCB(instanceTrafficStatsDropdown, instanceTrafficStatsChart, viewConfig));
                        }
                    });
                }
            }
        }
    });

    var constructInstanceTrafficStatsDropdown = function(instanceTrafficStatsDropdown, instanceTrafficStatsChart, interfaceList, changeCB) {
        if(contrail.checkIfExist(interfaceList) && interfaceList.length > 0) {
            var dropdownData = $.map(interfaceList, function (n, i) {
                return {
                    name: n.ip_address + ' (' + n.virtual_network + ')',
                    value: n.ip_address,
                    interface_data: n
                }
            });

            var instanceTrafficStatsDropdown = instanceTrafficStatsDropdown.contrailDropdown({
                dataTextField: "name",
                dataValueField: "value",
                data: dropdownData,
                change: changeCB
            }).data('contrailDropdown');

            instanceTrafficStatsDropdown.text(dropdownData[0].name);
            changeCB();
        } else {
            instanceTrafficStatsChart.append(ctwm.NO_TRAFFIC_STATS_FOUND); //TODO - Style
        }
    };

    var getInstanceTrafficStatsChangeCB = function(instanceTrafficStatsDropdown, instanceTrafficStatsChart, viewConfig) {
        var instanceUUID = viewConfig.instanceUUID,
            parseFn = viewConfig.parseFn;

        return function(e) {
            var selectedInterface = instanceTrafficStatsDropdown.data('contrailDropdown').getSelectedData()[0].interface_data,
                networkFQN = selectedInterface.virtual_network,
                interfaceIpAddress = selectedInterface.ip_address,
                interfaceName = selectedInterface.name,
                lineChartConfig = {
                    modelConfig: {
                        remote: {
                            ajaxConfig: {
                                url: ctwc.get(ctwc.URL_INSTANCE_TRAFFIC_STATS, 120, networkFQN, 120, interfaceIpAddress, instanceUUID, interfaceName),
                                type: 'GET'
                            },
                            dataParser: ctwp.vmTrafficStatsParser
                        },
                        cacheConfig: {
                            ucid: ctwc.get(ctwc.UCID_INSTANCE_TRAFFIC_STATS_LIST, networkFQN, instanceUUID, interfaceName)
                        }
                    },
                    parseFn: parseFn
                };

            var lineFocusChartView = new LineWithFocusChartView({
                el: instanceTrafficStatsChart,
                model: null,
                attributes: {viewConfig: lineChartConfig}
            });

            lineFocusChartView.render();
        }
    };

    return InstanceTrafficStatsView;
});