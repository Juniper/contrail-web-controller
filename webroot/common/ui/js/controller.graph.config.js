/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CTGraphConfig = function () {
        this.getConfigGraphTooltipConfig = function () {
            var tooltipTitle = contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP_TITLE),
                tooltipContent = contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP_CONTENT);

            return {
                NetworkPolicy: {
                    title: function (element, jointObject) {
                        var viewElement = jointObject.graph.getCell(element.attr('model-id')),
                            networkPolicyName = viewElement.attributes.nodeDetails['fq_name'][2];

                        return tooltipTitle({name: networkPolicyName, type: ctwl.TITLE_GRAPH_ELEMENT_NETWORK_POLICY});

                    },
                    content: function (element, jointObject) {
                        var viewElement = jointObject.graph.getCell(element.attr('model-id')),
                            actions = [];

                        actions.push({
                            text: 'Configure',
                            iconClass: 'icon-cog'
                        });

                        return tooltipContent({
                            info: [
                                {
                                    lbl: 'Project',
                                    value: viewElement.attributes.nodeDetails['fq_name'][0] + ':' + viewElement.attributes.nodeDetails['fq_name'][1]
                                }
                            ],
                            iconClass: 'icon-contrail-network-policy',
                            actions: actions
                        });
                    },
                    actionsCallback: function (element, jointObject) {
                        var viewElement = jointObject.graph.getCell(element.attr('model-id')),
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
                    title: function (element, jointObject) {
                        var viewElement = jointObject.graph.getCell(element.attr('model-id')),
                            securityGroupName = viewElement.attributes.nodeDetails['fq_name'][2];

                        return tooltipTitle({name: securityGroupName, type: ctwl.TITLE_GRAPH_ELEMENT_SECURITY_GROUP});
                    },
                    content: function (element, jointObject) {
                        var viewElement = jointObject.graph.getCell(element.attr('model-id')),
                            actions = [];

                        actions.push({
                            text: 'Configure',
                            iconClass: 'icon-cog'
                        });

                        return tooltipContent({
                            info: [
                                {
                                    lbl: 'Project',
                                    value: viewElement.attributes.nodeDetails['fq_name'][0] + ':' + viewElement.attributes.nodeDetails['fq_name'][1]
                                }
                            ],
                            iconClass: 'icon-contrail-security-group',
                            actions: actions
                        });
                    },
                    actionsCallback: function (element, jointObject) {
                        var viewElement = jointObject.graph.getCell(element.attr('model-id')),
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
                    title: function (element, jointObject) {
                        var viewElement = jointObject.graph.getCell(element.attr('model-id')),
                            NetworkIPAMName = viewElement.attributes.nodeDetails['fq_name'][2];

                        return tooltipTitle({name: NetworkIPAMName, type: ctwl.TITLE_GRAPH_ELEMENT_NETWORK_IPAM});
                    },
                    content: function (element, jointObject) {
                        var viewElement = jointObject.graph.getCell(element.attr('model-id')),
                            actions = [];

                        actions.push({
                            text: 'Configure',
                            iconClass: 'icon-cog'
                        });

                        return tooltipContent({
                            info: [
                                {
                                    lbl: 'Project',
                                    value: viewElement.attributes.nodeDetails['fq_name'][0] + ':' + viewElement.attributes.nodeDetails['fq_name'][1]
                                }
                            ],
                            iconClass: 'icon-contrail-network-ipam',
                            actions: actions
                        });
                    },
                    actionsCallback: function (element, jointObject) {
                        var viewElement = jointObject.graph.getCell(element.attr('model-id')),
                            actions = [];

                        actions.push({
                            callback: function (key, options) {
                                loadFeature({p: 'config_net_ipam'});
                            }
                        });

                        return actions;
                    }
                }
            }
        };

        this.getConnectedGraphTooltipConfig = function () {
            var tooltipTitle = contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP_TITLE),
                tooltipContent = contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP_CONTENT);

            return {
                VirtualNetwork: {
                    title: function (element, jointObject) {
                        var viewElement = jointObject.graph.getCell(element.attr('model-id')),
                            virtualNetworkName = viewElement.attributes.nodeDetails['name'].split(':')[2];

                        return tooltipTitle({name: virtualNetworkName, type: ctwl.TITLE_GRAPH_ELEMENT_VIRTUAL_NETWORK});

                    },
                    content: function (element, jointObject) {
                        var viewElement = jointObject.graph.getCell(element.attr('model-id')),
                            virtualNetworkName = viewElement.attributes.nodeDetails['name'].split(':'),
                            actions = [];

                        actions.push({
                            text: 'Configure',
                            iconClass: 'icon-cog'
                        });

                        if (!$(element).hasClassSVG('ZoomedElement')) {
                            actions.push({
                                text: 'View',
                                iconClass: 'icon-external-link'
                            });
                        }


                        return tooltipContent({
                            info: [
                                {lbl: 'Project', value: virtualNetworkName[0] + ':' + virtualNetworkName[1]},
                                {
                                    lbl: 'Traffic In',
                                    value: formatNumberByCommas(viewElement.attributes.nodeDetails.more_attr.in_tpkts) + ' packets | ' + formatBytes(viewElement.attributes.nodeDetails.more_attr.in_bytes)
                                },
                                {
                                    lbl: 'Traffic Out',
                                    value: formatNumberByCommas(viewElement.attributes.nodeDetails.more_attr.out_tpkts) + ' packets  |  ' + formatBytes(viewElement.attributes.nodeDetails.more_attr.out_bytes)
                                },
                                {lbl: 'Instance Count', value: viewElement.attributes.nodeDetails.more_attr.vm_cnt}
                            ],
                            iconClass: 'icon-contrail-virtual-network',
                            actions: actions
                        });
                    },
                    actionsCallback: function (element, jointObject) {
                        var viewElement = jointObject.graph.getCell(element.attr('model-id')),
                            actions = [];

                        actions.push({
                            callback: function (key, options) {
                                loadFeature({p: 'config_net_vn'});
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
                    title: function (element, jointObject) {
                        var viewElement = jointObject.graph.getCell(element.attr('model-id')),
                            serviceInstanceName = viewElement.attributes.nodeDetails['name'].split(':')[2];

                        return tooltipTitle({name: serviceInstanceName, type: ctwl.TITLE_GRAPH_ELEMENT_SERVICE_INSTANCE});
                    },
                    content: function (element, jointObject) {
                        var viewElement = jointObject.graph.getCell(element.attr('model-id')),
                            actions = [];

                        actions.push({
                            text: 'Configure',
                            iconClass: 'icon-cog'
                        });

                        return tooltipContent({
                            info: [
                                {lbl: 'Status', value: viewElement.attributes.nodeDetails['status']}
                            ],
                            iconClass: 'icon-check-empty icon-rotate-45 icn-service-instance',
                            actions: actions
                        });
                    },

                    actionsCallback: function (element, jointObject) {
                        var viewElement = jointObject.graph.getCell(element.attr('model-id')),
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
                    title: function (element, jointObject) {
                        var viewElement = jointObject.graph.getCell(element.attr('model-id')),
                            virtualMachineName = viewElement.attributes.nodeDetails['fqName'];

                        return tooltipTitle({name: virtualMachineName, type: ctwl.TITLE_GRAPH_ELEMENT_VIRTUAL_MACHINE});
                    },
                    content: function (element, jointObject) {
                        var viewElement = jointObject.graph.getCell(element.attr('model-id')),
                            srcVNDetails = viewElement.attributes.nodeDetails.srcVNDetails;

                        return tooltipContent({
                            info: [
                                {lbl: 'UUID', value: viewElement.attributes.nodeDetails['fqName']},
                                {lbl: 'Network', value: srcVNDetails.name},
                                {lbl: 'Interface Count', value: srcVNDetails.more_attr.interface_list.length}
                            ],
                            iconClass: 'icon-contrail-virtual-machine font-size-30'
                        });
                    }
                },
                link: {
                    title: function (element, jointObject) {
                        var viewElement = jointObject.graph.getCell(element.attr('model-id')),
                            viewElementDetails = viewElement.attributes.linkDetails,
                            sourceNetwork = viewElementDetails.src.split(':')[2],
                            destinationNetwork = viewElementDetails.dst.split(':')[2];

                        return tooltipTitle({name: sourceNetwork + ' - ' + destinationNetwork, type: ctwl.TITLE_GRAPH_ELEMENT_CONNECTED_NETWORK});
                    },
                    content: function (element, jointObject) {
                        //TODO - This needs some cleanup
                        var viewElement = jointObject.graph.getCell(element.attr('model-id')),
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
                                        value: in_stats[i].src.split(':').pop() + " - " + in_stats[i].dst.split(':').pop()
                                    });
                                    data.push({
                                        lbl: "Traffic In",
                                        value: formatNumberByCommas(in_stats[i].pkts) + " packets | " + formatBytes(in_stats[i].bytes)
                                    });
                                    for (var j = 0; j < out_stats.length; j++) {
                                        if (src == out_stats[j].src && dst == out_stats[j].dst) {
                                            data.push({
                                                lbl: "Traffic Out",
                                                value: formatNumberByCommas(out_stats[j].pkts) + " packets | " + formatBytes(out_stats[i].bytes)
                                            });
                                        }
                                    }
                                } else if (src == in_stats[i].dst && dst == in_stats[i].src) {
                                    data.push({
                                        lbl: "Link",
                                        value: in_stats[i].src.split(':').pop() + " - " + in_stats[i].dst.split(':').pop(),
                                        dividerClass: 'margin-5-0-0'
                                    });
                                    data.push({
                                        lbl: "Traffic In",
                                        value: formatNumberByCommas(in_stats[i].pkts) + " packets | " + formatBytes(in_stats[i].bytes)
                                    });
                                    for (var j = 0; j < out_stats.length; j++) {
                                        if (src == out_stats[j].dst && dst == out_stats[j].src) {
                                            data.push({
                                                lbl: "Traffic Out",
                                                value: formatNumberByCommas(out_stats[j].pkts) + " packets | " + formatBytes(out_stats[i].bytes)
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

                            data.push({lbl: "Link", value: src + " - " + dst});
                            data.push({lbl: "Traffic In", value: "0 packets | 0 B"});
                            data.push({lbl: "Traffic Out", value: "0 packets | 0 B"});

                            if (viewElementDetails.dir == 'bi') {
                                data.push({lbl: "Link", value: dst + " - " + src, dividerClass: 'margin-5-0-0'});
                                data.push({lbl: "Traffic In", value: "0 packets | 0 B"});
                                data.push({lbl: "Traffic Out", value: "0 packets | 0 B"});
                            }
                        } else if (viewElementDetails.more_attributes != undefined && viewElementDetails.more_attributes.in_stats != undefined
                            && viewElementDetails.more_attributes.out_stats != undefined && viewElementDetails.more_attributes.in_stats.length == 0
                            && viewElementDetails.more_attributes.out_stats.length == 0) {
                            var src = viewElementDetails.src.split(':').pop();
                            var dst = viewElementDetails.dst.split(':').pop();
                            if (partial_msg != "")
                                data.push({lbl: "", value: partial_msg});

                            data.push({lbl: "Link", value: src + " - " + dst});
                            data.push({lbl: "Traffic In", value: "0 packets | 0 B"});
                            data.push({lbl: "Traffic Out", value: "0 packets | 0 B"});

                            if (viewElementDetails.dir == 'bi') {
                                data.push({lbl: "Link", value: dst + " - " + src, dividerClass: 'margin-5-0-0'});
                                data.push({lbl: "Traffic In", value: "0 packets | 0 B"});
                                data.push({lbl: "Traffic Out", value: "0 packets | 0 B"});
                            }
                        }

                        return tooltipContent({info: data, iconClass: 'icon-long-arrow-right'});
                    }
                }
            };
        };

        this.getTabsViewConfig = function(tabType, elementObj) {

            var config = {};

            switch (tabType) {

                case ctwc.GRAPH_ELEMENT_PROJECT:

                    var options = {
                        projectFQN: elementObj.fqName,
                        projectUUID: elementObj.uuid
                    };

                    config = {
                        elementId: cowu.formatElementId([ctwl.MONITOR_PROJECT_ID]),
                        view: "SectionView",
                        viewConfig: {
                            rows: [
                                {
                                    columns: [
                                        {
                                            elementId: ctwl.MONITOR_PROJECT_VIEW_ID,
                                            view: "ProjectTabView",
                                            app: cowc.APP_CONTRAIL_CONTROLLER,
                                            viewConfig: options
                                        }
                                    ]
                                }
                            ]
                        }
                    };

                    break;

                case ctwc.GRAPH_ELEMENT_NETWORK:

                    var options = {
                        networkFQN: elementObj.fqName,
                        networkUUID: elementObj.uuid
                    };

                    config = {
                        elementId: cowu.formatElementId([ctwl.MONITOR_NETWORK_ID]),
                        view: "SectionView",
                        viewConfig: {
                            rows: [
                                {
                                    columns: [
                                        {
                                            elementId: ctwl.MONITOR_NETWORK_VIEW_ID,
                                            view: "NetworkTabView",
                                            app: cowc.APP_CONTRAIL_CONTROLLER,
                                            viewConfig: options
                                        }
                                    ]
                                }
                            ]
                        }
                    };

                    break;

                case ctwc.GRAPH_ELEMENT_INSTANCE:

                    var options = {
                        networkFQN: elementObj.fqName,
                        instanceUUID: elementObj.uuid
                    };

                    config = {
                        elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCE_ID]),
                        view: "SectionView",
                        viewConfig: {
                            rows: [
                                {
                                    columns: [
                                        {
                                            elementId: ctwl.MONITOR_INSTANCE_VIEW_ID,
                                            view: "InstanceTabView",
                                            app: cowc.APP_CONTRAIL_CONTROLLER,
                                            viewConfig: options
                                        }
                                    ]
                                }
                            ]
                        }
                    };

                    break;

                case ctwc.GRAPH_ELEMENT_CONNECTED_NETWORK:

                    config = {
                        elementId: cowu.formatElementId([ctwl.MONITOR_CONNECTED_NETWORK_ID]),
                        view: "SectionView",
                        viewConfig: {
                            rows: [
                                {
                                    columns: [
                                        {
                                            elementId: ctwl.MONITOR_CONNECTED_NETWORK_VIEW_ID,
                                            view: "ConnectedNetworkTabView",
                                            app: cowc.APP_CONTRAIL_CONTROLLER,
                                            viewConfig: elementObj
                                        }
                                    ]
                                }
                            ]
                        }
                    };

                    break;

            }

            return config;
        };

        this.setProjectURLHashParams = function(hashParams, projectFQN, triggerHashChange) {
            var hashObj = {
                type: "project",
                view: "details",
                focusedElement: {
                    fqName: projectFQN,
                    type: ctwc.GRAPH_ELEMENT_PROJECT
                }
            };

            if(contrail.checkIfKeyExistInObject(true, hashParams, 'clickedElement')) {
                hashObj.clickedElement = hashParams.clickedElement;
            }

            layoutHandler.setURLHashParams(hashObj, {p: "mon_networking_projects", merge: false, triggerHashChange: triggerHashChange});

        };

        this.setNetworkURLHashParams = function(hashParams, networkFQN, triggerHashChange) {
            var hashObj = {
                type: "network",
                view: "details",
                focusedElement: {
                    fqName: networkFQN,
                    type: ctwc.GRAPH_ELEMENT_NETWORK
                }
            };

            if(contrail.checkIfKeyExistInObject(true, hashParams, 'clickedElement')) {
                hashObj.clickedElement = hashParams.clickedElement;
            }

            layoutHandler.setURLHashParams(hashObj, {p: "mon_networking_networks", merge: false, triggerHashChange: triggerHashChange});

        };

        this.setInstanceURLHashParams = function(hashParams, networkFQN, instanceUUID, triggerHashChange) {
            var hashObj = {
                type: "instance",
                view: "details",
                focusedElement: {
                    fqName: networkFQN,
                    uuid: instanceUUID,
                    type: ctwc.GRAPH_ELEMENT_NETWORK
                }
            };

            if(contrail.checkIfKeyExistInObject(true, hashParams, 'clickedElement')) {
                hashObj.clickedElement = hashParams.clickedElement;
            }

            layoutHandler.setURLHashParams(hashObj, {p: "mon_networking_instances", merge: false});
        };
    };

    return CTGraphConfig;
});