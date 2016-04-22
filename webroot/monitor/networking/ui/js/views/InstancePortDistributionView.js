/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'core-basedir/js/views/ZoomScatterChartView'
], function (_, ContrailView, ZoomScatterChartView) {
    var InstancePortDistributionView = ContrailView.extend({
        render: function () {
            var instanceTrafficStatsTemplate = contrail.getTemplate4Id(ctwc.TMPL_TRAFFIC_STATS_TAB),
                viewConfig = this.attributes.viewConfig,
                self = this, deferredObj = $.Deferred(),
                selector = $(self.$el), modelMap = this.modelMap;

            $(selector).append(instanceTrafficStatsTemplate({
                dropdownId: ctwl.INSTANCE_PORT_DIST_DROPDOWN_ID,
                chartId: ctwl.INSTANCE_PORT_DIST_CHART_ID
            }));

            var instancePortDistDropdown = $('#' + ctwl.INSTANCE_PORT_DIST_DROPDOWN_ID),
                instancePortDistChart = $('#' + ctwl.INSTANCE_PORT_DIST_CHART_ID);

            if (modelMap != null && modelMap[viewConfig['modelKey']] != null) {
                var contrailViewModel = modelMap[viewConfig['modelKey']],
                    interfaceList;

                if (!contrailViewModel.isRequestInProgress()) {
                    interfaceList = contrailViewModel.attributes.value.UveVirtualMachineAgent.interface_details;
                    constructInstanceTrafficStatsDropdown(instancePortDistDropdown, instancePortDistChart, interfaceList, getInstancePortDistChangeCB(instancePortDistDropdown, instancePortDistChart));
                } else {
                    contrailViewModel.onAllRequestsComplete.subscribe(function () {
                        if (contrail.checkIfKeyExistInObject(true, contrailViewModel.attributes, 'value.UveVirtualMachineAgent.interface_details')) {
                            interfaceList = contrailViewModel.attributes.value.UveVirtualMachineAgent.interface_details;
                            constructInstanceTrafficStatsDropdown(instancePortDistDropdown, instancePortDistChart, interfaceList, getInstancePortDistChangeCB(instancePortDistDropdown, instancePortDistChart));
                        }
                    });
                }
            }
        }
    });

    var constructInstanceTrafficStatsDropdown = function(instancePortDistDropdown, instancePortDistChart, interfaceList, changeCB) {
        if(contrail.checkIfExist(interfaceList) && interfaceList.length > 0) {
            var dropdownData = $.map(interfaceList, function (n, i) {
                return {
                    name: n.ip_address + ' (' + n.virtual_network + ')',
                    value: n.ip_address,
                    interface_data: n
                }
            });

            var instanceTrafficStatsDropdown = instancePortDistDropdown.contrailDropdown({
                dataTextField: "name",
                dataValueField: "value",
                data: dropdownData,
                change: changeCB
            }).data('contrailDropdown');

            instanceTrafficStatsDropdown.text(dropdownData[0].name);
            changeCB();
        } else {
            instancePortDistChart.append(ctwm.NO_TRAFFIC_STATS_FOUND); //TODO - Style
        }
    };

    function getInstancePortDistChangeCB(instancePortDistDropdown, instancePortDistChart) {
        return function() {
            var selectedInterface = instancePortDistDropdown.data('contrailDropdown').getSelectedData()[0].interface_data,
                networkFQN = encodeURIComponent(selectedInterface.virtual_network),
                interfaceIP = selectedInterface.ip_address,
                interfaceName = selectedInterface.name,
                chartViewConfig = {
                    modelConfig: {
                        remote: {
                            ajaxConfig: {
                                url: ctwc.get(ctwc.URL_INSTANCE_PORT_DISTRIBUTION, networkFQN, interfaceIP),
                                type: 'GET'
                            },
                            dataParser: function (response) {
                                return ctwp.parseNetwork4PortDistribution(response, networkFQN, interfaceIP);
                            }
                        },
                        cacheConfig: {
                            ucid: ctwc.get(ctwc.UCID_PROJECT_VM_PORT_STATS_LIST, networkFQN, interfaceIP)
                        }
                    },
                    chartOptions: ctwvc.getPortDistChartOptions()
                };

            var zoomScatterChartView = new ZoomScatterChartView({
                el: instancePortDistChart,
                model: null,
                attributes: {viewConfig: chartViewConfig}
            });

            zoomScatterChartView.render();
        }
    };

    return InstancePortDistributionView;
});