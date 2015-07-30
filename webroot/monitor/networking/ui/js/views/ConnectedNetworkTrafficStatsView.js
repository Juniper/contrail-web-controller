/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'core-basedir/js/views/LineWithFocusChartView',
    'contrail-list-model',
], function (_, ContrailView, LineWithFocusChartView, ContrailListModel) {
    var ConnectedNetworkTrafficStatsView = ContrailView.extend({
        render: function () {
            var connectedNetworkTrafficStatsTemplate = contrail.getTemplate4Id(ctwc.TMPL_TRAFFIC_STATS_TAB),
                viewConfig = this.attributes.viewConfig,
                linkDetails = viewConfig.linkDetails,
                self = this, deferredObj = $.Deferred(),
                selector = $(self.$el);

            $(selector).append(connectedNetworkTrafficStatsTemplate({
                dropdownId: ctwl.CONNECTED_NETWORK_TRAFFIC_STATS_DROPDOWN_ID,
                chartId: ctwl.CONNECTED_NETWORK_TRAFFIC_STATS_CHART_ID
            }));

            var connectedNetworkTrafficStatsDropdown = $('#' + ctwl.CONNECTED_NETWORK_TRAFFIC_STATS_DROPDOWN_ID),
                connectedNetworkTrafficStatsChart = $('#' + ctwl.CONNECTED_NETWORK_TRAFFIC_STATS_CHART_ID);

            constructConnectedNetworkTrafficStatsDropdown(connectedNetworkTrafficStatsDropdown, connectedNetworkTrafficStatsChart, linkDetails,
                getConnectedNetworkTrafficStatsChangeCB(connectedNetworkTrafficStatsDropdown, connectedNetworkTrafficStatsChart, viewConfig));
        }
    });

    var constructConnectedNetworkTrafficStatsDropdown = function(connectedNetworkTrafficStatsDropdown, connectedNetworkTrafficStatsChart, linkDetails, changeCB) {
        var sourceVirtualNetwork = linkDetails.src,
            destinationVirtualNetwork = linkDetails.dst,
            dropdownData = [
                {
                    sourceVirtualNetwork: sourceVirtualNetwork,
                    destinationVirtualNetwork: destinationVirtualNetwork,
                    name: 'Traffic from ' + sourceVirtualNetwork.split(':')[2] + ' to ' + destinationVirtualNetwork.split(':')[2],
                    value: sourceVirtualNetwork + '<->' + destinationVirtualNetwork
                }
            ];

        if(linkDetails.dir == 'bi'){
            dropdownData.push({
                sourceVirtualNetwork: destinationVirtualNetwork,
                destinationVirtualNetwork: sourceVirtualNetwork,
                name: 'Traffic from ' + destinationVirtualNetwork.split(':')[2] + ' to ' + sourceVirtualNetwork.split(':')[2],
                value: destinationVirtualNetwork + '<->' + sourceVirtualNetwork
            });
        }

        var connectedNetworkTrafficStatsDropdown = connectedNetworkTrafficStatsDropdown.contrailDropdown({
            dataTextField: "name",
            dataValueField: "value",
            data: dropdownData,
            change: changeCB
        }).data('contrailDropdown');

        connectedNetworkTrafficStatsDropdown.text(dropdownData[0].name);
        changeCB();
    };

    var getConnectedNetworkTrafficStatsChangeCB = function(connectedNetworkTrafficStatsDropdown, connectedNetworkTrafficStatsChart, viewConfig) {
        var parseFn = viewConfig.parseFn;

        return function(e) {
            var selectedSourceVirtualNetwork = connectedNetworkTrafficStatsDropdown.data('contrailDropdown').getSelectedData()[0].sourceVirtualNetwork,
                selectedDestinationVirtualNetwork = connectedNetworkTrafficStatsDropdown.data('contrailDropdown').getSelectedData()[0].destinationVirtualNetwork,
                viewConfig = {
                    modelConfig: {
                        remote: {
                            ajaxConfig: {
                                url: ctwc.get(ctwc.URL_CONNECTED_NETWORK_TRAFFIC_STATS, 120, selectedSourceVirtualNetwork, selectedDestinationVirtualNetwork, 120),
                                type: 'GET'
                            },
                            dataParser: nmwp.vmTrafficStatsParser
                        },
                        cacheConfig: {
                            ucid: ctwc.get(ctwc.UCID_CONNECTED_NETWORK_TRAFFIC_STATS_LIST, selectedSourceVirtualNetwork, selectedDestinationVirtualNetwork)
                        }
                    },
                    parseFn: parseFn
                };

            var lineFocusChartView = new LineWithFocusChartView({
                el: connectedNetworkTrafficStatsChart,
                model: null,
                attributes: {viewConfig: viewConfig}
            });

            lineFocusChartView.render();
        }
    };

    return ConnectedNetworkTrafficStatsView;
});