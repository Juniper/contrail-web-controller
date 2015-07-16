/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var NMViewConfig = function () {
        var self = this;

        self.getMNConnnectedGraphConfig = function (url, elementNameObject, keySuffix, type) {
            var instanceSuffix = (contrail.checkIfExist(elementNameObject['instanceUUID']) ? (':' + elementNameObject['instanceUUID']) : ''),
                ucid = ctwc.UCID_PREFIX_MN_GRAPHS + elementNameObject.fqName + instanceSuffix +  keySuffix,
                graphConfig = {
                    remote: {
                        ajaxConfig: {
                            url: url,
                            type: 'GET'
                        }
                    },
                    cacheConfig: {
                        ucid: ucid
                    },
                    focusedElement: {
                        type: type,
                        name: elementNameObject
                    }
                };

            if(type ==  ctwc.GRAPH_ELEMENT_NETWORK) {
                graphConfig['vlRemoteConfig'] = {
                    vlRemoteList: nmwgc.getNetworkVMDetailsLazyRemoteConfig()
                };
            }

            return graphConfig;
        };

        self.getPortDistChartOptions = function() {
            return {
                xLabel: ctwl.X_AXIS_TITLE_PORT,
                yLabel: ctwl.Y_AXIS_TITLE_BW,
                forceX: [0, 1000],
                forceY: [0, 1000],
                tooltipConfigCB: nmwgrc.getPortDistributionTooltipConfig(onScatterChartClick),
                controlPanelConfig: {
                    filter: {
                        enable: true,
                        viewConfig: getControlPanelFilterConfig()
                    },
                    legend: {
                        enable: true,
                        viewConfig: getControlPanelLegendConfig()
                    }
                },
                clickCB: onScatterChartClick,
                sizeFieldName: 'flowCnt',
                xLabelFormat: d3.format(','),
                yLabelFormat: function (yValue) {
                    var formattedValue = formatBytes(yValue, false, null, 1);
                    return formattedValue;
                },
                margin: {left: 70},
                noDataMessage: cowc.CHART_NO_DATA_MESSAGE
            }
        };
    };

    function getControlPanelFilterConfig() {
        return {
            groups: [
                {
                    id: 'by-node-color',
                    title: false,
                    type: 'checkbox-circle',
                    items: [
                        {
                            text: 'Source Port',
                            labelCssClass: 'default',
                            filterFn: function(d) { return d.type === 'sport'; }
                        },
                        {
                            text: 'Destination Port',
                            labelCssClass: 'medium',
                            filterFn: function(d) { return d.type === 'dport'; }
                        }
                    ]
                }
            ]
        };
    };

    function getControlPanelLegendConfig() {
        return {
            groups: [
                {
                    id: 'by-node-color',
                    title: 'Port Type',
                    items: [
                        {
                            text: 'Source Port',
                            labelCssClass: 'icon-circle default',
                            events: {
                                click: function (event) {}
                            }
                        },
                        {
                            text: 'Destination Port',
                            labelCssClass: 'icon-circle medium',
                            events: {
                                click: function (event) {}
                            }
                        }
                    ]
                },
                {
                    id: 'by-node-size',
                    title: 'Port Size',
                    items: [
                        {
                            text: 'Flow Count',
                            labelCssClass: 'icon-circle',
                            events: {
                                click: function (event) {}
                            }
                        }
                    ]
                }
            ]
        };
    };

    function onScatterChartClick(chartConfig) {
        var hashParams= {
            fqName:chartConfig['fqName'],
            port:chartConfig['range'],
            type: 'flow',
            view: 'list'
        };

        if(chartConfig['startTime'] != null && chartConfig['endTime'] != null) {
            hashParams['startTime'] = chartConfig['startTime'];
            hashParams['endTime'] = chartConfig['endTime'];
        }

        if(chartConfig['type'] == 'sport') {
            hashParams['portType'] = 'src';
        } else if(chartConfig['type'] == 'dport') {
            hashParams['portType'] = 'dst';
        }

        if(contrail.checkIfExist(chartConfig['ipAddress'])) {
            hashParams['ip'] = chartConfig['ipAddress'];
        }

        layoutHandler.setURLHashParams(hashParams, {p:"mon_networking_networks", merge:false});
    };

    return NMViewConfig;
});