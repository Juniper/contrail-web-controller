/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CTGraphConfig = function () {
        this.getTooltipConfig = function () {
            return {
                PhysicalRouter: {
                    title: function (element, jointObject) {
                        return 'Physical Router';
                    },
                    content: function (element, jointObject) {
                        var viewElement = jointObject.connectedGraph.getCell(element.attr('model-id')),
                            tooltipContent = contrail.getTemplate4Id('prouter-tooltip-content-template');

                        return tooltipContent([{lbl: 'Name', value: viewElement.attributes.prouterDetails['name']},
                            {lbl: 'Links', value: viewElement.attributes.prouterDetails.connected_prouters}]);

                    }
                },
                VirtualRouter: {
                    title: function (element, jointObject) {
                        return 'Virtual Router';
                    },
                    content: function (element, jointObject) {
                        var viewElement = jointObject.connectedGraph.getCell(element.attr('model-id')),
                            tooltipContent = contrail.getTemplate4Id('vrouter-tooltip-content-template');

                        return tooltipContent([{lbl: 'Name', value: viewElement.attributes.vrouterDetails['name']},
                            {lbl: 'Links', value: viewElement.attributes.vrouterDetails.connected_vrouters}]);

                    }
                },
                VirtualNetwork: {
                    title: function (element, jointObject) {
                        return 'Virtual Network';
                        return;
                    },
                    content: function (element, jointObject) {
                        var viewElement = jointObject.connectedGraph.getCell(element.attr('model-id')),
                            tooltipContent = contrail.getTemplate4Id('tooltip-content-template'),
                            virtualNetworkName = viewElement.attributes.nodeDetails['name'].split(':');

                        return tooltipContent([{lbl: 'Name', value: virtualNetworkName[2]},
                            {lbl: 'Project', value: virtualNetworkName[0] + ':' + virtualNetworkName[1]},
                            {
                                lbl: 'In',
                                value: formatNumberByCommas(viewElement.attributes.nodeDetails.more_attr.in_tpkts) + ' packets / ' + formatBytes(viewElement.attributes.nodeDetails.more_attr.in_bytes)
                            },
                            {
                                lbl: 'Out',
                                value: formatNumberByCommas(viewElement.attributes.nodeDetails.more_attr.out_tpkts) + ' packets / ' + formatBytes(viewElement.attributes.nodeDetails.more_attr.out_bytes)
                            },
                            {lbl: 'Instance Count', value: viewElement.attributes.nodeDetails.more_attr.vm_cnt}]);

                    }
                },
                NetworkPolicy: {
                    title: function (element, jointObject) {
                        return 'Network Policy';
                    },
                    content: function (element, jointObject) {
                        var viewElement = jointObject.configGraph.getCell(element.attr('model-id')),
                            tooltipContent = contrail.getTemplate4Id('tooltip-content-template');

                        return tooltipContent([
                            {lbl: 'Name', value: viewElement.attributes.nodeDetails['fq_name'][2]},
                            {
                                lbl: 'Project',
                                value: viewElement.attributes.nodeDetails['fq_name'][0] + ':' + viewElement.attributes.nodeDetails['fq_name'][1]
                            }
                        ]);
                    }
                },
                SecurityGroup: {
                    title: function (element, jointObject) {
                        return 'Security Group';
                    },
                    content: function (element, jointObject) {
                        var viewElement = jointObject.configGraph.getCell(element.attr('model-id')),
                            tooltipContent = contrail.getTemplate4Id('tooltip-content-template');

                        return tooltipContent([
                            {lbl: 'Name', value: viewElement.attributes.nodeDetails['fq_name'][2]},
                            {
                                lbl: 'Project',
                                value: viewElement.attributes.nodeDetails['fq_name'][0] + ':' + viewElement.attributes.nodeDetails['fq_name'][1]
                            }
                        ]);
                    }
                },
                NetworkIPAM: {
                    title: function (element, jointObject) {
                        return 'Network IPAM';
                    },
                    content: function (element, jointObject) {
                        var viewElement = jointObject.configGraph.getCell(element.attr('model-id')),
                            tooltipContent = contrail.getTemplate4Id('tooltip-content-template');

                        return tooltipContent([
                            {lbl: 'Name', value: viewElement.attributes.nodeDetails['fq_name'][2]},
                            {
                                lbl: 'Project',
                                value: viewElement.attributes.nodeDetails['fq_name'][0] + ':' + viewElement.attributes.nodeDetails['fq_name'][1]
                            }
                        ]);
                    }
                },
                ServiceInstance: {
                    title: function (element, jointObject) {
                        return 'Service Instance';
                    },
                    content: function (element, jointObject) {
                        var viewElement = jointObject.connectedGraph.getCell(element.attr('model-id')),
                            tooltipContent = contrail.getTemplate4Id('tooltip-content-template');

                        return tooltipContent([
                            {lbl: 'Name', value: viewElement.attributes.nodeDetails['name']},
                            {lbl: 'Status', value: viewElement.attributes.nodeDetails['status']}
                        ]);
                    }
                },
                VirtualMachine: {
                    title: function (element, jointObject) {
                        return 'Virtual Machine';
                    },
                    content: function (element, jointObject) {
                        var viewElement = jointObject.connectedGraph.getCell(element.attr('model-id')),
                            tooltipContent = contrail.getTemplate4Id('tooltip-content-template');

                        return tooltipContent([
                            {lbl: 'UUID', value: viewElement.attributes.nodeDetails['fqName']},
                        ]);
                    }
                },
                link: {
                    title: function (element, jointObject) {
                        return 'Traffic Details';
                    },
                    content: function (element, jointObject) {
                        var viewElement = jointObject.connectedGraph.getCell(element.attr('model-id')),
                            tooltipContent = contrail.getTemplate4Id('tooltip-content-template'),
                            viewElementDetails = viewElement.attributes.linkDetails;

                        var data = [],
                            partial_msg = "";
                        if (viewElementDetails.error == 'Other link marked as unidirectional, attach policy' || viewElementDetails.error == "Other link marked as bidirectional, attach policy")
                            partial_msg = "Link partially connected";
                        if (viewElementDetails.more_attributes != undefined && viewElementDetails.more_attributes.in_stats != undefined
                            && viewElementDetails.more_attributes.out_stats != undefined && viewElementDetails.more_attributes.out_stats.length > 0
                            && viewElementDetails.more_attributes.in_stats.length > 0) {
                            var in_stats = viewElementDetails.more_attributes.in_stats;
                            var out_stats = viewElementDetails.more_attributes.out_stats;
                            var src = viewElementDetails.src;
                            var dst = viewElementDetails.dst;
                            var loss = viewElementDetails.loss;
                            /*if(loss.diff && loss.loss_percent>0) commented the percentage loss code for while
                             data.push({lbl:"Link",value:"Packet Loss % "+loss.loss_percent});
                             else*/
                            if (partial_msg != "")
                                data.push({lbl: "", value: partial_msg});
                            for (var i = 0; i < in_stats.length; i++) {
                                if (src == in_stats[i].src && dst == in_stats[i].dst) {
                                    data.push({
                                        lbl: "Link",
                                        value: in_stats[i].src.split(':').pop() + " --- " + in_stats[i].dst.split(':').pop()
                                    });
                                    data.push({
                                        lbl: "In",
                                        value: formatNumberByCommas(in_stats[i].pkts) + " packets / " + formatBytes(in_stats[i].bytes)
                                    });
                                    for (var j = 0; j < out_stats.length; j++) {
                                        if (src == out_stats[j].src && dst == out_stats[j].dst) {
                                            data.push({
                                                lbl: "Out",
                                                value: formatNumberByCommas(out_stats[j].pkts) + " packets / " + formatBytes(out_stats[i].bytes)
                                            });
                                        }
                                    }
                                } else if (src == in_stats[i].dst && dst == in_stats[i].src) {
                                    data.push({
                                        lbl: "Link",
                                        value: in_stats[i].src.split(':').pop() + " --- " + in_stats[i].dst.split(':').pop(),
                                        dividerClass: 'margin-5-0-0'
                                    });
                                    data.push({
                                        lbl: "In",
                                        value: formatNumberByCommas(in_stats[i].pkts) + " packets / " + formatBytes(in_stats[i].bytes)
                                    });
                                    for (var j = 0; j < out_stats.length; j++) {
                                        if (src == out_stats[j].dst && dst == out_stats[j].src) {
                                            data.push({
                                                lbl: "Out",
                                                value: formatNumberByCommas(out_stats[j].pkts) + " packets / " + formatBytes(out_stats[i].bytes)
                                            });
                                        }
                                    }
                                }
                            }
                        } else if (viewElementDetails.more_attributes == undefined || viewElementDetails.more_attributes.in_stats == undefined
                            || viewElementDetails.more_attributes.out_stats == undefined) {
                            var src = viewElementDetails.src.split(':').pop();
                            var dst = viewElementDetails.dst.split(':').pop();
                            if (partial_msg != "")
                                data.push({lbl: "", value: partial_msg});

                            data.push({lbl: "Link", value: src + " --- " + dst});
                            data.push({lbl: "In", value: "0 packets / 0 B"});
                            data.push({lbl: "Out", value: "0 packets / 0 B"});

                            if (viewElementDetails.dir == 'bi') {
                                data.push({lbl: "Link", value: dst + " --- " + src, dividerClass: 'margin-5-0-0'});
                                data.push({lbl: "In", value: "0 packets / 0 B"});
                                data.push({lbl: "Out", value: "0 packets / 0 B"});
                            }
                        } else if (viewElementDetails.more_attributes != undefined && viewElementDetails.more_attributes.in_stats != undefined
                            && viewElementDetails.more_attributes.out_stats != undefined && viewElementDetails.more_attributes.in_stats.length == 0
                            && viewElementDetails.more_attributes.out_stats.length == 0) {
                            var src = viewElementDetails.src.split(':').pop();
                            var dst = viewElementDetails.dst.split(':').pop();
                            if (partial_msg != "")
                                data.push({lbl: "", value: partial_msg});

                            data.push({lbl: "Link", value: src + " --- " + dst});
                            data.push({lbl: "In", value: "0 packets / 0 B"});
                            data.push({lbl: "Out", value: "0 packets / 0 B"});

                            if (viewElementDetails.dir == 'bi') {
                                data.push({lbl: "Link", value: dst + " --- " + src, dividerClass: 'margin-5-0-0'});
                                data.push({lbl: "In", value: "0 packets / 0 B"});
                                data.push({lbl: "Out", value: "0 packets / 0 B"});
                            }
                        }

                        return tooltipContent(data);
                    }
                }
            };
        };

        this.getContextMenuConfig = function() {
            return {
                VirtualNetwork: function (element, jointObject) {
                    var viewElement = jointObject.connectedGraph.getCell(element.attr('model-id')),
                        jointElementFullName = viewElement.attributes.nodeDetails['name'].split(':'),
                        items = {
                            configure: {
                                name: '<i class="icon-cog"></i><span class="margin-0-5">Configure Virtual Network</span>',
                                callback: function (key, options) {
                                    loadFeature({p: 'config_net_vn'});
                                }
                            }
                        };

                    if (!$(element).hasClassSVG('ZoomedElement')) {
                        items.view = {
                            name: '<i class="icon-external-link"></i><span class="margin-0-5">View Virtual Network</span>',
                            callback: function (key, options) {
                                loadFeature({p: 'mon_networking_networks',
                                    q: {
                                        fqName: viewElement['attributes']['nodeDetails']['name'],
                                        view: 'details',
                                        type: 'network'
                                    }
                                });
                            }
                        };
                    }

                    return {items: items};
                },
                NetworkPolicy: function (element, jointObject) {
                    var viewElement = jointObject.configGraph.getCell(element.attr('model-id')),
                        jointElementFullName = viewElement.attributes.nodeDetails['fq_name'];
                    return {
                        items: {
                            configure: {
                                name: '<i class="icon-cog"></i><span class="margin-0-5">Configure Network Policy</span>',
                                callback: function (key, options) {
                                    loadFeature({p: 'config_net_policies'});
                                }
                            }
                        }
                    };
                },
                SecurityGroup: function (element, jointObject) {
                    var viewElement = jointObject.configGraph.getCell(element.attr('model-id')),
                        jointElementFullName = viewElement.attributes.nodeDetails['fq_name'];
                    return {
                        items: {
                            configure: {
                                name: '<i class="icon-cog"></i><span class="margin-0-5">Configure Security Group</span>',
                                callback: function (key, options) {
                                    loadFeature({p: 'config_net_sg'});
                                }
                            }
                        }
                    };
                },
                NetworkIPAM: function (element, jointObject) {
                    var viewElement = jointObject.configGraph.getCell(element.attr('model-id')),
                        jointElementFullName = viewElement.attributes.nodeDetails['fq_name'];
                    return {
                        items: {
                            configure: {
                                name: '<i class="icon-cog"></i><span class="margin-0-5">Configure Network IPAM</span>',
                                callback: function (key, options) {
                                    loadFeature({p: 'config_net_ipam'});
                                }
                            }
                        }
                    };
                },
                ServiceInstance: function (element, jointObject) {
                    var viewElement = jointObject.connectedGraph.getCell(element.attr('model-id')),
                        jointElementFullName = viewElement.attributes.nodeDetails['name'].split(':');
                    return {
                        items: {
                            configure: {
                                name: '<i class="icon-cog"></i><span class="margin-0-5">Configure Service Instances</span>',
                                callback: function (key, options) {
                                    loadFeature({p: 'config_sc_svcInstances'});
                                }
                            }
                        }
                    };
                }
                /*link: function (element, jointObject) {
                    var viewElement = jointObject.connectedGraph.getCell(element.attr('model-id')),
                        viewElementDetails = viewElement.attributes.linkDetails,
                        sourceName = viewElementDetails['src'].split(':')[2],
                        targetName = viewElementDetails['dst'].split(':')[2];

                    var viewListMenu = {
                        items: {
                            trafficFromSource2Target: {
                                name: '<i class="icon-long-arrow-right"></i><span class="margin-0-5">View Traffic from ' + sourceName + ' to ' + targetName + '</span>',
                                callback: function (key, options) {
                                    loadFeature({
                                        p: 'mon_networking_networks',
                                        q: {fqName: viewElementDetails['dst'], srcVN: viewElementDetails['src']}
                                    });
                                }
                            }
                        }
                    };

                    if (viewElementDetails.dir == 'bi') {
                        viewListMenu.items.trafficFromTarget2Source = {
                            name: '<i class="icon-long-arrow-left"></i><span class="margin-0-5">View Traffic from ' + targetName + ' to ' + sourceName + '</span>',
                            callback: function (key, options) {
                                loadFeature({
                                    p: 'mon_networking_networks',
                                    q: {fqName: viewElementDetails['src'], srcVN: viewElementDetails['dst']}
                                });
                            }
                        };
                    }

                    return viewListMenu;
                }*/
            };
        };
    }

    return CTGraphConfig;
});