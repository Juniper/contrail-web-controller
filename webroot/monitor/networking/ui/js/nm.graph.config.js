/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var NMGraphConfig = function () {
        this.getConfigGraphTooltipConfig = function () {
            var tooltipTitle = contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP_TITLE),
                tooltipContent = contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP_CONTENT);

            return {
                NetworkPolicy: {
                    title: function (element, graphView) {
                        var viewElement = graphView.model.getCell(element.attr('model-id')),
                            networkPolicyName = viewElement.attributes.nodeDetails['fq_name'][2];

                        return tooltipTitle({name: networkPolicyName, type: ctwl.TITLE_GRAPH_ELEMENT_NETWORK_POLICY});

                    },
                    content: function (element, graphView) {
                        var viewElement = graphView.model.getCell(element.attr('model-id')),
                            actions = [], nodeDetails = viewElement.attributes.nodeDetails;

                        actions.push({
                            text: 'Configure',
                            iconClass: 'fa fa-cog'
                        });

                        return tooltipContent({
                            info: [
                                {
                                    label: 'Project',
                                    value: viewElement.attributes.nodeDetails['fq_name'][0] + ':' + viewElement.attributes.nodeDetails['fq_name'][1]
                                },
                                {
                                    label: 'UUID',
                                    value: nodeDetails['uuid']
                                },
                                {
                                    label: 'Rule Count',
                                    value: cowu.getValueByJsonPath(nodeDetails, 'network_policy_entries;policy_rule', []).length
                                }

                            ],
                            iconClass: 'icon-contrail-network-policy',
                            actions: actions
                        });
                    },
                    dimension: {
                        width: 360
                    },
                    actionsCallback: function (element, graphView) {
                        var viewElement = graphView.model.getCell(element.attr('model-id')),
                            actions = [];

                        actions.push({
                            callback: function (key, options) {
                                loadFeature({p: 'config_net_policies'});
                            }
                        });

                        return actions;
                    }
                },
                SecurityGroup: {
                    title: function (element, graphView) {
                        var viewElement = graphView.model.getCell(element.attr('model-id')),
                            securityGroupName = viewElement.attributes.nodeDetails['fq_name'][2];

                        return tooltipTitle({name: securityGroupName, type: ctwl.TITLE_GRAPH_ELEMENT_SECURITY_GROUP});
                    },
                    content: function (element, graphView) {
                        var viewElement = graphView.model.getCell(element.attr('model-id')),
                            actions = [], nodeDetails = viewElement.attributes.nodeDetails;

                        actions.push({
                            text: 'Configure',
                            iconClass: 'fa fa-cog'
                        });

                        return tooltipContent({
                            info: [
                                {
                                    label: 'Project',
                                    value: viewElement.attributes.nodeDetails['fq_name'][0] + ':' + viewElement.attributes.nodeDetails['fq_name'][1]
                                },
                                {
                                    label: 'UUID',
                                    value: nodeDetails['uuid']
                                }
                            ],
                            iconClass: 'icon-contrail-security-group',
                            actions: actions
                        });
                    },
                    dimension: {
                        width: 355
                    },
                    actionsCallback: function (element, graphView) {
                        var viewElement = graphView.model.getCell(element.attr('model-id')),
                            actions = [];

                        actions.push({
                            callback: function (key, options) {
                                loadFeature({p: 'config_net_sg'});
                            }
                        });

                        return actions;
                    }
                },
                NetworkIPAM: {
                    title: function (element, graphView) {
                        var viewElement = graphView.model.getCell(element.attr('model-id')),
                            NetworkIPAMName = viewElement.attributes.nodeDetails['fq_name'][2];

                        return tooltipTitle({name: NetworkIPAMName, type: ctwl.TITLE_GRAPH_ELEMENT_NETWORK_IPAM});
                    },
                    content: function (element, graphView) {
                        var viewElement = graphView.model.getCell(element.attr('model-id')),
                            actions = [], nodeDetails = viewElement.attributes.nodeDetails;

                        actions.push({
                            text: 'Configure',
                            iconClass: 'fa fa-cog'
                        });

                        return tooltipContent({
                            info: [
                                {
                                    label: 'Project',
                                    value: viewElement.attributes.nodeDetails['fq_name'][0] + ':' + viewElement.attributes.nodeDetails['fq_name'][1]
                                },
                                {
                                    label: 'UUID',
                                    value: nodeDetails['uuid']
                                }
                            ],
                            iconClass: 'icon-contrail-network-ipam',
                            actions: actions
                        });
                    },
                    dimension: {
                        width: 355
                    },
                    actionsCallback: function (element, graphView) {
                        var viewElement = graphView.model.getCell(element.attr('model-id')),
                            actions = [];

                        actions.push({
                            callback: function (key, options) {
                                loadFeature({p: 'config_networking_ipam'});
                            }
                        });

                        return actions;
                    }
                }
            }
        };

        this.getConnectedGraphTooltipConfig = function () {
            var tooltipTitleTmpl = contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP_TITLE),
                tooltipContentTmpl = contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP_CONTENT);

            return {
                VirtualNetwork: {
                    title: function (element, graphView) {
                        var viewElement = graphView.model.getCell(element.attr('model-id')),
                            virtualNetworkName = viewElement.attributes.nodeDetails['name'].split(':')[2];

                        return tooltipTitleTmpl({name: virtualNetworkName, type: ctwl.TITLE_GRAPH_ELEMENT_VIRTUAL_NETWORK});

                    },
                    content: function (element, graphView) {
                        var viewElement = graphView.model.getCell(element.attr('model-id')),
                            networkFQN = viewElement.attributes.nodeDetails['name'],
                            virtualNetworkName = networkFQN.split(':'),
                            actions = [];

                        actions.push({
                            text: 'Configure',
                            iconClass: 'fa fa-cog'
                        });

                        if (!$(element).hasClassSVG('ZoomedElement') && !ctwu.isServiceVN(networkFQN)) {
                            actions.push({
                                text: 'View',
                                iconClass: 'fa fa-external-link'
                            });
                        }

                        return tooltipContentTmpl({
                            info: [
                                {label: 'Project', value: virtualNetworkName[0] + ':' + virtualNetworkName[1]},
                                {label: 'Instance Count', value: contrail.checkIfExist(viewElement.attributes.nodeDetails.more_attributes.vm_count) ? viewElement.attributes.nodeDetails.more_attributes.vm_count : '-'},
                                {label: 'Interface Count', value: contrail.checkIfExist(viewElement.attributes.nodeDetails.more_attributes.vmi_count) ? viewElement.attributes.nodeDetails.more_attributes.vmi_count : '-'},
                                {label: 'Throughput In/Out', value: formatThroughput(viewElement.attributes.nodeDetails.more_attributes.in_throughput) + " / " + formatThroughput(viewElement.attributes.nodeDetails.more_attributes.out_throughput)},
                            ],
                            iconClass: 'icon-contrail-virtual-network',
                            actions: actions
                        });
                    },
                    dimension: {
                        width: 340
                    },
                    actionsCallback: function (element, graphView) {
                        var viewElement = graphView.model.getCell(element.attr('model-id')),
                            actions = [];

                        actions.push({
                            callback: function (key, options) {
                                loadFeature({p: 'config_networking_networks'});
                            }
                        });

                        if (!$(element).hasClassSVG('ZoomedElement')) {
                            actions.push({
                                callback: function (key, options) {
                                    loadFeature({
                                        p: 'mon_networking_networks',
                                        q: {
                                            view: 'details',
                                            type: 'network',
                                            focusedElement: {
                                                fqName: viewElement['attributes']['nodeDetails']['name'],
                                                type: ctwc.GRAPH_ELEMENT_NETWORK
                                            }
                                        }
                                    });
                                }
                            });
                        }

                        return actions;
                    }
                },
                ServiceInstance: {
                    title: function (element, graphView) {
                        var viewElement = graphView.model.getCell(element.attr('model-id')),
                            serviceInstanceName = viewElement.attributes.nodeDetails['name'].split(':')[2];

                        return tooltipTitleTmpl({name: serviceInstanceName, type: ctwl.TITLE_GRAPH_ELEMENT_SERVICE_INSTANCE});
                    },
                    content: function (element, graphView) {
                        var viewElement = graphView.model.getCell(element.attr('model-id')),
                            actions = [];

                        actions.push({
                            text: 'Configure',
                            iconClass: 'fa fa-cog'
                        });

                        return tooltipContentTmpl({
                            info: [
                                {label: 'Status', value: viewElement.attributes.nodeDetails['status']}
                            ],
                            iconClass: 'fa fa-square-o icon-rotate-45 icn-service-instance',
                            actions: actions
                        });
                    },
                    dimension: {
                        width: 355
                    },
                    actionsCallback: function (element, graphView) {
                        var viewElement = graphView.model.getCell(element.attr('model-id')),
                            actions = [];

                        actions.push({
                            callback: function (key, options) {
                                loadFeature({p: 'config_sc_svcInstances'});
                            }
                        });

                        return actions;
                    }
                },
                VirtualMachine: {
                    title: function (element, graphView) {
                        var viewElement = graphView.model.getCell(element.attr('model-id')),
                            vmUVE = viewElement.attributes.nodeDetails.uve,
                            virtualMachineName = viewElement.attributes.nodeDetails['fqName'];

                        if(contrail.checkIfExist(vmUVE)) {
                            virtualMachineName = vmUVE['UveVirtualMachineAgent']['vm_name'];
                        }

                        return tooltipTitleTmpl({name: virtualMachineName, type: ctwl.TITLE_GRAPH_ELEMENT_VIRTUAL_MACHINE});
                    },
                    content: function (element, graphView) {
                        var viewElement = graphView.model.getCell(element.attr('model-id')),
                            actions = [],
                            srcVNDetails = viewElement.attributes.nodeDetails.srcVNDetails,
                            vmUVE = viewElement.attributes.nodeDetails.uve,
                            tooltipContent, uveVirtualMachineAgent, cpuInfo;

                        actions.push({
                            text: 'View',
                            iconClass: 'fa fa-external-link'
                        });

                        tooltipContent = {
                            iconClass: 'icon-contrail-virtual-machine font-size-30',
                            actions: actions
                        };

                        if(contrail.checkIfExist(vmUVE)) {
                            uveVirtualMachineAgent = vmUVE['UveVirtualMachineAgent'];
                            cpuInfo = uveVirtualMachineAgent.cpu_info;
                            tooltipContent['info'] = [
                                {label: 'UUID', value: viewElement.attributes.nodeDetails['fqName']},
                                {label: 'CPU Utilization', value: contrail.checkIfExist(cpuInfo) ? ((Math.round(cpuInfo.cpu_one_min_avg * 100) / 100) + " %") : '-'},
                                {label: 'Memory Usage', value: contrail.checkIfExist(cpuInfo) ? cowu.addUnits2Bytes(cpuInfo.rss, false) : '-'},
                                {label: 'Interfaces', value: uveVirtualMachineAgent.interface_list.length}
                            ];
                        } else {
                            tooltipContent['info'] = [
                                {label: 'UUID', value: viewElement.attributes.nodeDetails['fqName']}
                            ];
                        }

                        return tooltipContentTmpl(tooltipContent);
                    },
                    dimension: {
                        width: 355
                    },
                    actionsCallback: function (element, graphView) {
                        var viewElement = graphView.model.getCell(element.attr('model-id')),
                            actions = [];

                        actions.push({
                            callback: function (key, options) {
                                var srcVN = viewElement.attributes.nodeDetails.srcVNDetails.name,
                                    vmUVE = viewElement.attributes.nodeDetails.uve,
                                    vmName = contrail.checkIfExist(vmUVE) ? vmUVE['UveVirtualMachineAgent']['vm_name'] : null;

                                loadFeature({
                                    p: 'mon_networking_instances',
                                    q: {
                                        type: 'instance',
                                        view: 'details',
                                        focusedElement: {
                                            fqName: srcVN,
                                            uuid: viewElement.attributes.nodeDetails['fqName'],
                                            vmName: vmName,
                                            type: ctwc.GRAPH_ELEMENT_NETWORK
                                        }
                                    }
                                });
                            }
                        });

                        return actions;
                    }
                },
                link: {
                    title: function (element, graphView) {
                        var viewElement = graphView.model.getCell(element.attr('model-id')),
                            viewElementDetails = viewElement.attributes.linkDetails,
                            srcArray = viewElementDetails.src.split(':'),
                            dstArray = viewElementDetails.dst.split(':'),
                            sourceNetwork = (srcArray.length > 2) ? srcArray[2] : viewElementDetails.src,
                            destinationNetwork = (dstArray.length > 2) ? dstArray[2] : viewElementDetails.dst;

                        return tooltipTitleTmpl({name: sourceNetwork + ctwc.LINK_CONNECTOR_STRING + destinationNetwork, type: ctwl.TITLE_GRAPH_ELEMENT_CONNECTED_NETWORK});
                    },
                    content: function (element, graphView) {
                        var viewElement = graphView.model.getCell(element.attr('model-id')),
                            viewElementDetails = viewElement.attributes.linkDetails,
                            data = [], partialMessage = "";

                        if (viewElementDetails.error == 'Other link marked as unidirectional, attach policy'
                            || viewElementDetails.error == "Other link marked as bidirectional, attach policy") {
                                partialMessage = "Link partially connected";
                        }

                        var inStats = viewElementDetails.more_attributes.in_stats,
                            outStats = viewElementDetails.more_attributes.out_stats;

                        if (contrail.checkIfExist(inStats) && contrail.checkIfExist(outStats) && outStats.length > 0 && inStats.length > 0) {
                            var src = viewElementDetails.src,
                                dst = viewElementDetails.dst;

                            if (partialMessage != "") {
                                data.push({label: "", value: partialMessage});
                            }

                            for (var i = 0; i < inStats.length; i++) {
                                if (src == inStats[i].src && dst == inStats[i].dst) {
                                    data.push({ label: "Link", value: inStats[i].src.split(':').pop() + ctwc.LINK_CONNECTOR_STRING + inStats[i].dst.split(':').pop()});
                                    data.push({ label: "Traffic In",  value: cowu.addUnits2Packets(inStats[i].pkts, false, null, 1) + " | " + cowu.addUnits2Bytes(inStats[i].bytes) });

                                    for (var j = 0; j < outStats.length; j++) {
                                        if (src == outStats[j].src && dst == outStats[j].dst) {
                                            data.push({ label: "Traffic Out", value: cowu.addUnits2Packets(outStats[j].pkts, false, null, 1) + " | " + cowu.addUnits2Bytes(outStats[i].bytes) });
                                        }
                                    }
                                } else if (src == inStats[i].dst && dst == inStats[i].src) {
                                    data.push({ label: "Link", value: inStats[i].src.split(':').pop() + ctwc.LINK_CONNECTOR_STRING + inStats[i].dst.split(':').pop(), dividerClass: 'margin-5-0-0' });
                                    data.push({ label: "Traffic In", value: cowu.addUnits2Packets(inStats[i].pkts, false, null, 1) + " | " + cowu.addUnits2Bytes(inStats[i].bytes) });
                                    for (var j = 0; j < outStats.length; j++) {
                                        if (src == outStats[j].dst && dst == outStats[j].src) {
                                            data.push({ label: "Traffic Out", value: cowu.addUnits2Packets(outStats[j].pkts, false, null, 1) + " | " + cowu.addUnits2Bytes(outStats[i].bytes) });
                                        }
                                    }
                                }
                            }
                        } else {
                            var src = viewElementDetails.src.split(':').pop(),
                                dst = viewElementDetails.dst.split(':').pop();

                            if (partialMessage != "")
                                data.push({label: "", value: partialMessage});

                            data.push({label: "Link", value: src + ctwc.LINK_CONNECTOR_STRING + dst});
                            data.push({label: "Traffic In", value: "0 packets | 0 B"});
                            data.push({label: "Traffic Out", value: "0 packets | 0 B"});

                            if (viewElementDetails.dir == 'bi') {
                                data.push({label: "Link", value: dst + ctwc.LINK_CONNECTOR_STRING + src, dividerClass: 'margin-5-0-0'});
                                data.push({label: "Traffic In", value: "0 packets | 0 B"});
                                data.push({label: "Traffic Out", value: "0 packets | 0 B"});
                            }
                        }

                        return tooltipContentTmpl({info: data, iconClass: 'fa fa-arrows-h'});
                    },
                    dimension: { width: 400 }
                }
            };
        };

    };

    return NMGraphConfig;
});
