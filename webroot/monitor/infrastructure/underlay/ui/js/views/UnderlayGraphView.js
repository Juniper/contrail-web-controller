/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view',
    'monitor/infrastructure/underlay/ui/js/underlay.utils'
], function(_, ContrailView, underlayUtils) {
    var UnderlayGraphView = ContrailView.extend({
        network: null,
        model : null,
        underlayPathIds: {
            nodes: [],
            links: []
        },
        duplicatePathsDrawn: false,
        //stabilized: false,
        tooltipConfigWidth: 0,
        tooltipConfigHeight: 0,
        cursorPosition: {},
        DIMLIGHT: "dimlight",
        HIGHLIGHT: "highlight",
        ERROR: "error",
        DEFAULT: "default",
        style: {
            default: {
                color: "rgba(85,85,85,.9)"
            },
            defaultDimlight: {
                color: "rgba(85,85,85,0.5)"
            },
            defaultSelected: {
                color: "rgba(73,138,185,1)"
            },
            selectedDimlight: {
                color: "rgba(73,138,185,0.5)"
            },
            errorNode: {
                color: "rgba(185,74,72,1)"
            },
            linkDefault: {
                color: "rgba(57,57,57,.6)"
            },
            flowPathDefault: {
                color: "rgba(0,150,136,.8)" //teal

            },
            flowPathDimlight: {
                color: "rgba(0,150,136,.5)" //teal
            }
        },
        visOptions: {
            autoResize: true,
            clickToUse: false,
            interaction: {
                navigationButtons: true,
                hover: true,
                keyboard: false,
                selectConnectedEdges: false,
                hoverConnectedEdges: false,
                zoomView: false
            },
            physics: {
                stabilization: {
                    iterations: 1000
                }
            },
            layout: {
                hierarchical: {
                    direction: 'UD',
                    sortMethod: 'directed',
                    levelSeparation: 100,
                },
                improvedLayout: true
            },
            nodes: {
                shape: 'image',
                size: 20,
                color: {
                    background: 'white'
                },
                font: {
                    face : 'Arial, helvetica, sans-serif',
                    size: 10,
                    color: '#333',
                    strokeColor: '#333',
                    strokeWidth: 0.4
                },
                labelHighlightBold: true
            },
            edges: {
                width: 2,
                color: "rgba(57,57,57,.6)",
                smooth: {
                    enabled: true,
                    type: "cubicBezier",
                    forceDirection: "horizontal",
                    roundness: .7 //not to be used with dynamic
                }
            }
        },
        enableFreeflow: function(contrailVisView) {
            contrailVisView.setOptions({physics:{enabled: false}, layout: {hierarchical: {enabled:false}}});
        },
        resetTooltip: function() {
            $(".vis-network-tooltip").popover('destroy');
            this.tooltipConfigWidth = 0;
            this.tooltipConfigHeight = 0;
        },
        removeUnderlayEffects: function() {
            underlayUtils.removeUndelrayFlowInfoFromBreadCrumb();
            //Removing the selected row styling in trace flow and map flow results.
            $("#" + ctwc.TRACEFLOW_RESULTS_GRID_ID+
                " div.slick-row.selected-slick-row").removeClass('selected-slick-row');
            $("#searchFlow-results div.slick-row.selected-slick-row").removeClass('selected-slick-row');
            this.clearFlowPath();
        },
        render: function() {
            var self = this,
                graphTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_UNDERLAY_GRAPH_VIEW),
                selectorId = '#' + ctwl.UNDERLAY_GRAPH_ID;
                graphModel = self.attributes.viewConfig.model;
            self.$el.html(graphTemplate());
            $("#" + ctwl.TOP_CONTENT_CONTAINER).addClass("underlay-container");
            $("#" + ctwl.TOP_CONTENT_CONTAINER).css('border-bottom', '8px solid #fafafa');
            $('#' + ctwl.TOP_CONTENT_CONTAINER).resizable({
                handles: 's',
                minHeight: 260,
                resize: function(e, ui) {
                    var parent = ui.element.parent();
                    var _network = self.network.network;
                    var remainingSpace =
                        parent.height() - ui.element.outerHeight(),
                        divTwo = $('#' + ctwl.BOTTOM_CONTENT_CONTAINER),
                        divTwoHeight = (remainingSpace -
                            (divTwo.outerHeight() - divTwo.height()))/parent.height()*100+"%";
                    divTwo.height(divTwoHeight);
                    _network.setSize(
                        ui.element.outerWidth() + "px",
                        ui.element.outerHeight() + "px");

                    _network.redraw(); _network.fit();
                },
            });
            $("#"+ctwl.UNDERLAY_GRAPH_ID).data('graphModel', graphModel);
            self.model = graphModel;
            /*self.model.__kb.view_model.model().on("change:topologyChanged", function (updatedGraphModel) {
                self.populateModelAndAddToGraph(updatedGraphModel.attributes);
            });*/
            _.each(self.model.nodesCollection.models, function(model){
                _.each(self.getNodeChangeEventsConfig(), function(eventName) {
                    model.attributes.model().on(eventName, function() {
                        var params = arguments;
                        var nodeModel = self.model.getNode(params[0].attributes.id);
                        if(nodeModel && nodeModel.length == 1) {
                            nodeModel = nodeModel[0];
                        }
                        self.network.updateNode(nodeModel);
                    });
                });
            });
            _.each(self.model.edgesCollection.models, function(model){
                _.each(self.getEdgeChangeEventsConfig(), function(eventName) {
                    model.attributes.model().on(eventName, function() {
                        var params = arguments;
                        var edgeModel = self.model.getEdge(params[0].attributes.id);
                        if(edgeModel && edgeModel.length == 1) {
                            edgeModel = edgeModel[0];
                        }
                        self.network.updateEdge(edgeModel);
                    });
                });
            })
            $('body').on("click", '#flow-info span.reset', function () {
                self.removeUnderlayPathIds();
                self.removeUnderlayEffects();
                self.resetTopology({
                    resetBelowTabs: true
                });
            });
            var graphWidth = $(selectorId).width();
            var graphHeight = $(selectorId).height();
            self.renderView4Config($(ctwl.UNDERLAY_GRAPH_ID),
                 null, self.getContrailVisViewConfig(ctwl.UNDERLAY_GRAPH_ID),
                 null, null, null, function (underlayGraphView) {
                    underlayGraphView.network = underlayGraphView.childViewMap[ctwl.UNDERLAY_GRAPH_ID];
                    underlayGraphView.populateModelAndAddToGraph();
                    window.view = underlayGraphView;
                 });

            /*var resetTopo = $('<div style="display:inline-block; width:15px; height:15px; background-image:none; top:170px; right:10px; position:absolute; background-color:#f9f9f9; border:1px solid #efefef; color:#777; font-family:FontAwesome; font-size:15px; z-index:1; padding: 7px 7px; line-height:normal; background-position:2px 2px; cursor:pointer; background-repeat:no-repeat" title="Reset Topology"><i class="icon-play-circle" /></div>');
            $(resetTopo).on("click", function(){
                self.resetTopology({
                    resetBelowTabs: true,
                    restorePosition: false
                });
                self.removeUnderlayEffects();
            });
            $('.vis-navigation').append(resetTopo);*/

            // Drawing the underlay path and trace flow for a given flow
            graphModel.flowPath().model().on('change:nodes', function(){
                var nodes = graphModel.flowPath().model().attributes["nodes"];
                var links = graphModel.flowPath().model().attributes["links"];
                if(nodes.length <=0 || links.length <= 0){
                    graphModel.flowPath().model().set('nodes',graphModel.flowPath().model()._previousAttributes.nodes, {silent: true});
                    graphModel.flowPath().model().set('links',graphModel.flowPath().model()._previousAttributes.links, {silent: true});
                    showInfoWindow("Cannot find the underlay path for selected flow", "Info");
                    return false;
                }
                if(_.isEqual(graphModel.flowPath().model()._previousAttributes.nodes,
                    graphModel.flowPath().model().attributes.nodes) &&
                    _.isEqual(graphModel.flowPath().model()._previousAttributes.links,
                    graphModel.flowPath().model().attributes.links))
                    return false;
                self.removeUnderlayPathIds();
                var elementMap = graphModel.elementMap();
                var adjList = graphModel.prepareData(null, graphModel.tree());

                var nodeNames = [];
                var vRouters = {};
                var pRouters = {};
                var vms = {};
                var flowPathLinks = {};
                for(var i=0; i<nodes.length; i++) {
                    nodeNames.push(nodes[i].name);
                    if(nodes[i].node_type == ctwc.VROUTER) {
                        vRouters[nodes[i].name] = {};
                    } else if(nodes[i].node_type == ctwc.PROUTER) {
                        pRouters[nodes[i].name] = {};
                    } else if(nodes[i].node_type == ctwc.VIRTUALMACHINE) {
                        vms[nodes[i].name] = {};
                    }
                }

                if(JSON.stringify(pRouters) == "{}") {
                    //no prouters, look for vrouters
                    if(JSON.stringify(vRouters) == "{}") {
                        //no vrouters, look for vms
                        if(JSON.stringify(vms) == "{}") {
                            //no vms, nothing to plot. return
                            return;
                        } else {
                            //no prouters/vrouters, only vms.
                            //deduce parents(vrouters) of vms,
                            //then parents(tors) of vrouters
                            var tors = graphModel.getToRs();
                            for(var i=0; i<tors.length; i++) {
                                var tor = tors[i];
                                var torName = tor.attributes.name();
                                var vRouters = tor.attributes.children;
                                for(var virtualRouterName in vRouters) {
                                    var virtualMachines = vRouters[virtualRouterName].children;
                                    for(var virtualMachineName in virtualMachines) {
                                        if(vms.hasOwnProperty(virtualMachineName)) {
                                            if(!vms[virtualMachineName].hasOwnProperty('parent')) {
                                                vms[virtualMachineName].parent = virtualRouterName;
                                                var link = virtualMachineName + "<->" +
                                                    virtualRouterName;
                                                var altLink = virtualRouterName + "<->" +
                                                    virtualMachineName;
                                                if(!flowPathLinks.hasOwnProperty(link))
                                                    flowPathLinks[link] = {};
                                                if(!flowPathLinks.hasOwnProperty(altLink))
                                                    flowPathLinks[altLink] = {};
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        //no prouters, but vrouters exists
                        //look for parents(tors) for vrouters
                        var tors = graphModel.getToRs();
                        for(var i=0; i<tors.length; i++) {
                            var tor = tors[i];
                            var torName = tor.attributes.name();
                            var virtualRouters = tor.attributes.children;
                            for(var virtualRouterName in virtualRouters) {
                                if(vRouters.hasOwnProperty(virtualRouterName)) {
                                    if(!vRouters[virtualRouterName].hasOwnProperty('parent')) {
                                        vRouters[virtualRouterName].parent = torName;
                                        var link = torName + "<->" + virtualRouterName;
                                        var altLink = virtualRouterName + "<->" + torName;
                                        if(!flowPathLinks.hasOwnProperty(link))
                                            flowPathLinks[link] = {};
                                        if(!flowPathLinks.hasOwnProperty(altLink))
                                            flowPathLinks[altLink] = {};
                                        if(JSON.stringify(vms) !== "{}") {
                                            var vrModels = self.model.getVirtualRouters();
                                            for(var j=0; j<vrModels.length; j++) {
                                                if(vrModels[j].attributes.name() ==
                                                    virtualRouterName) {
                                                    var virtualMachines = vrModels[j].attributes.children;
                                                    for(var virtualMachineName in virtualMachines) {
                                                        if(vms.hasOwnProperty(virtualMachineName)) {
                                                            if(!vms[virtualMachineName].hasOwnProperty('parent')) {
                                                                vms[virtualMachineName].parent = virtualRouterName;
                                                                var link = virtualMachineName + "<->" +
                                                                    virtualRouterName;
                                                                var altLink = virtualRouterName + "<->" +
                                                                    virtualMachineName;
                                                                if(!flowPathLinks.hasOwnProperty(link))
                                                                    flowPathLinks[link] = {};
                                                                if(!flowPathLinks.hasOwnProperty(altLink))
                                                                    flowPathLinks[altLink] = {};
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    //prouters exists, plot
                    //firstLevelNodes could be spines or cores
                    var firstLevelNodes = graphModel.firstLevelNodes();
                    var firstLevelNode = graphModel.firstLevelNode();

                    for(var k=0; k<firstLevelNodes.length; k++) {
                        var tors = {};
                        if(firstLevelNode == "coreswitch") {
                            var spines = firstLevelNodes[k].attributes.children;
                            for(var spine in spines) {
                                var children = spines[spine].children;
                                for(var child in children) {
                                    tors[child] = children[child];
                                }
                            }
                        } else if(firstLevelNode == "spine") {
                            tors = firstLevelNodes[k].attributes.children;
                        } else if(firstLevelNode == "tor") {
                            tors = firstLevelNodes;
                        }
                        //var tors = firstLevelNodes[k].attributes.children;
                        for(var torName in tors) {
                            var virtualRouters = tors[torName].children;
                            for(var virtualRouterName in virtualRouters) {
                                if(JSON.stringify(vRouters) !== "{}") {
                                    if(vRouters.hasOwnProperty(virtualRouterName)) {
                                        if(!vRouters[virtualRouterName].hasOwnProperty('parent') &&
                                            pRouters.hasOwnProperty(torName)) {
                                            vRouters[virtualRouterName].parent = torName;
                                            var link = torName + "<->" + virtualRouterName;
                                            var altLink = virtualRouterName + "<->" + torName;
                                            if(!flowPathLinks.hasOwnProperty(link))
                                                flowPathLinks[link] = {};
                                            if(!flowPathLinks.hasOwnProperty(altLink))
                                                flowPathLinks[altLink] = {};
                                            if(JSON.stringify(vms) !== "{}") {
                                                var vrModels = self.model.getVirtualRouters();
                                                for(var j=0; j<vrModels.length; j++) {
                                                    if(vrModels[j].attributes.name() ==
                                                        virtualRouterName) {
                                                        var virtualMachines = vrModels[j].attributes.children;
                                                        for(var virtualMachineName in virtualMachines) {
                                                            if(vms.hasOwnProperty(virtualMachineName)) {
                                                                if(!vms[virtualMachineName].hasOwnProperty('parent')) {
                                                                    vms[virtualMachineName].parent = virtualRouterName;
                                                                    var link = virtualMachineName + "<->" +
                                                                        virtualRouterName;
                                                                    var altLink = virtualRouterName + "<->" +
                                                                        virtualMachineName;
                                                                    if(!flowPathLinks.hasOwnProperty(link))
                                                                        flowPathLinks[link] = {};
                                                                    if(!flowPathLinks.hasOwnProperty(altLink))
                                                                        flowPathLinks[altLink] = {};
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                for (var i = 0; i < links.length; i++) {
                    var endpoints = links[i].endpoints;
                    var endpoint0 = endpoints[0];
                    var endpoint1 = endpoints[1];
                    var link = endpoint0 + "<->" + endpoint1;
                    var altLink = endpoint1 + "<->" + endpoint0;
                    if(!flowPathLinks.hasOwnProperty(link))
                        flowPathLinks[link] = {};
                    if(!flowPathLinks.hasOwnProperty(altLink))
                        flowPathLinks[altLink] = {};
                }

                graphModel.adjacencyList(adjList);
                var childElementsArray = self.createElementsFromAdjacencyList();
                childElementsArray = _.uniq(childElementsArray,
                    function(x) {
                        return x.attributes.model().attributes.element_id
                    });

                for(var i=0; i<childElementsArray.length; i++) {
                    var childEl = childElementsArray[i];
                    if(childEl.attributes.hasOwnProperty('name')) {
                        //node element
                        var childName = childEl.attributes.name();
                        var node_type = childEl.attributes.node_type();
                        if(node_type == ctwc.PROUTER)
                            //all physical routers are part of topology
                            continue;

                        switch(node_type) {
                            case ctwc.VROUTER:
                                if(!vRouters.hasOwnProperty(childName)) {
                                    for(var virtualMachineName in vms) {
                                        if(vms[virtualMachineName].parent != childName) {
                                            //childElementsArray[i] = null;
                                            childElementsArray.splice(i,1);
                                            i--;
                                            break;
                                        }
                                    }
                                }
                            break;
                            case ctwc.VIRTUALMACHINE:
                                if(!vms.hasOwnProperty(childName)) {
                                    //childElementsArray[i] = null;
                                    childElementsArray.splice(i,1);
                                    i--;
                                }
                            break;
                        }
                    } else if(childEl.attributes.hasOwnProperty("arrows")){
                        var link_type = childEl.attributes.link_type();
                        if(link_type == "pr-pr")
                            continue;
                        var endpoints = childEl.attributes.endpoints();
                        var endpoint0 = endpoints[0];
                        var endpoint1 = endpoints[1];
                        var link = endpoint0 + "<->" + endpoint1;
                        var altLink = endpoint1 + "<->" + endpoint0;
                        if(!(flowPathLinks.hasOwnProperty(link) &&
                            flowPathLinks.hasOwnProperty(altLink))) {
                            if(link_type == "pr-vr" || link_type == "vr-pr") {
                                if(vRouters.hasOwnProperty(endpoint0) ||
                                    vRouters.hasOwnProperty(endpoint1))
                                    continue;
                            }
                            //childElementsArray[i] = null;
                            childElementsArray.splice(i,1);
                            i--;
                        }
                    }
                }

                //childElementsArray = childElementsArray.filter(function(n){ return n != undefined });
                self.addElementsToGraph(childElementsArray, false);
                self.markErrorNodes();
                $(".popover").popover().hide();
                if(links.length > 0)
                    self.addDimlightToConnectedElements();
                for (var i = 0; i < links.length; i++) {
                    var endpoints = links[i].endpoints;
                    var endpoint0 = endpoints[0];
                    var endpoint1 = endpoints[1];
                    var linkName = endpoint0 + "<->" + endpoint1;
                    var altLinkName = endpoint1 + "<->" + endpoint0;
                    var link = elementMap.link[linkName];
                    var existingLink = null;
                    var parentNodeExists = elementMap.node[endpoint0];
                    var childNodeExists = elementMap.node[endpoint1];
                    var parentNode = null;
                    var childNode = null;
                    if(null !== parentNodeExists && typeof parentNodeExists !== "undefined")
                        parentNode = self.network.getNode(elementMap.node[endpoint0]);
                    else {
                        parentNode = jsonPath(graphModel.nodes, '$[?(@.name=="' +
                            endpoint0 + '")]');
                        if (false !== parentNode && parentNode.length === 1) {
                            parentNode = parentNode[0];
                            var parentName = parentNode.name;
                            var parentNodeType = parentNode.node_type;
                            var currentEl = self.createNode(parentNode);
                            graphModel.connectedElements.push(currentEl);
                            var currentElId = currentEl.id;
                            elementMap.node[parentName] = currentElId;
                        }
                    }
                    if(null !== childNodeExists && typeof childNodeExists !== "undefined")
                        childNode = self.network.getNode(elementMap.node[endpoint1]);
                    else {
                        childNode = jsonPath(graphModel.nodes, '$[?(@.name=="' +
                            endpoint0 + '")]');
                        if (false !== childNode && childNode.length === 1) {
                            childNode = childNode[0];
                            var childName = childNode.name;
                            var childNodeType = childNode.node_type;
                            var currentEl = self.createNode(childNode);
                            graphModel.connectedElements.push(currentEl);
                            var currentElId = currentEl.id;
                            elementMap.node[childName] = currentElId;
                        }
                    }
                }
                // When the underlay path is same for earlier flow and
                // current flow change events are not triggering so we need to
                // reset the nodes and links to empty array once the path is plotted.
                graphModel.elementMap(elementMap);
                graphModel.adjacencyList(graphModel.underlayAdjacencyList());
            });
        },
        duplicatePaths: function(eventName, contrailVisView) {
            var self = this;
            var nodes = self.model.flowPath().model().attributes.nodes;
            var links = self.model.flowPath().model().attributes.links;
            var network = contrailVisView;
            if(nodes.length > 0 && links.length > 0 &&
                self.duplicatePathsDrawn == false) {
                self.duplicatePathsDrawn = true;
                if(self.underlayPathIds.nodes.length > 0) {
                    _.each(self.underlayPathIds.nodes, function(id, idx) {
                        network.removeNode(id);
                    });
                }
                if(self.underlayPathIds.links.length > 0) {
                    _.each(self.underlayPathIds.links, function(id, idx) {
                        network.removeEdge(id);
                    });
                }
                self.underlayPathIds = {
                    nodes:[],
                    links:[]
                }
                var dupNodes = {}, dupLinks = {};
                var underlayPathIds = {
                    nodes: [],
                    links: []
                };

                var elementMap = self.model.elementMap();
                for (var i = 0; i < links.length; i++) {
                    var endpoints = links[i].endpoints;
                    var endpoint0 = endpoints[0];
                    var endpoint1 = endpoints[1];
                    var linkName = endpoint0 + "<->" + endpoint1;
                    var altLinkName = endpoint1 + "<->" + endpoint0;
                    var link = elementMap.link[linkName];
                    var existingLink = network.getEdge(link);

                    var parentNode = null, childNode = null;
                    if(existingLink == null || typeof existingLink == "undefined")
                        continue;
                    if(existingLink.from == elementMap.node[endpoint0]) {
                        parentNode = network.getNode(elementMap.node[endpoint0]);
                        childNode = network.getNode(elementMap.node[endpoint1]);
                    } else {
                        parentNode = network.getNode(elementMap.node[endpoint1]);
                        childNode = network.getNode(elementMap.node[endpoint0]);
                    }
                    if(parentNode == null || childNode == null)
                        continue;
                    var parentId = parentNode.id;
                    var childId = childNode.id;
                    var parentNodeType = parentNode.node_type;
                    var childNodeType = childNode.node_type;
                    var link_type = parentNodeType.split("-")[0][0] +
                        parentNodeType.split("-")[1][0] + '-' +
                        childNodeType.split("-")[0][0] +
                        childNodeType.split("-")[1][0];

                    var arrowPosition = "";
                    //todo: move elementMap to underlaygraphview.
                    if(graphModel.elementMap().node[endpoint0] == parentId) {
                        arrowPosition = "to";
                    } else {
                        arrowPosition = "from";
                    }

                    var parentNodeElement = network.findNode(parentId);
                    parentNodeElement = parentNodeElement[0];
                    var childNodeElement = network.findNode(childId);
                    childNodeElement = childNodeElement[0];
                    var newParentNode = null, newChildNode = null;

                    if(dupNodes.hasOwnProperty(parentNode.name)) {
                        newParentNode = dupNodes[parentNode.name].data;
                    } else {
                        var newParentNodeModel = self.model.addNode({
                            chassis_type: parentNode.chassis_type,
                            errorMsg: parentNode.errorMsg,
                            mgmt_ip: parentNode.mgmt_ip,
                            more_attributes: parentNode.more_attributes,
                            name: parentNode.name,
                            node_type: parentNode.node_type,
                            parent: parentNode.parent
                        });
                        newParentNode = self.createNode(self.model.nodesCollection.last());
                        newParentNode.attributes.model().set({"x":parentNodeElement.x-7}, {"silent":true});
                        newParentNode.attributes.model().set({"y":parentNodeElement.y-7}, {"silent":true});
                        newParentNode.attributes.model().set("hidden",true);
                        network.addNode(newParentNode);
                        dupNodes[parentNode.name] = {};
                        if($.inArray(newParentNode.attributes.element_id(),
                            underlayPathIds.nodes) == -1)
                            underlayPathIds.nodes.push(newParentNode.attributes.element_id());
                        dupNodes[parentNode.name]["id"]= newParentNode.attributes.element_id();
                        dupNodes[parentNode.name]["data"]= newParentNode;
                    }

                    if(dupNodes.hasOwnProperty(childNode.name)) {
                        newChildNode = dupNodes[childNode.name].data;
                    } else {
                        var newChildNodeModel = self.model.addNode({
                            chassis_type: childNode.chassis_type,
                            errorMsg: childNode.errorMsg,
                            mgmt_ip: childNode.mgmt_ip,
                            more_attributes: childNode.more_attributes,
                            name: childNode.name,
                            node_type: childNode.node_type,
                            parent: childNode.parent
                        });
                        newChildNode = self.createNode(self.model.nodesCollection.last());
                        newChildNode.attributes.model().set({"x":childNodeElement.x-7}, {"silent":true});
                        newChildNode.attributes.model().set({"y":childNodeElement.y-7}, {"silent":true});
                        newChildNode.attributes.model().set("hidden",true);
                        dupNodes[childNode.name] = {};
                        network.addNode(newChildNode);
                        dupNodes[childNode.name]["id"]= newChildNode.attributes.element_id();
                        dupNodes[childNode.name]["data"]= newChildNode;
                        if($.inArray(newChildNode.attributes.element_id(),
                            underlayPathIds.nodes) == -1)
                            underlayPathIds.nodes.push(newChildNode.attributes.element_id());
                    }
                    var linkModel = _.filter(network.caller.model.edgesCollection.models, function(edge) {
                        var fromId =
                            edge.attributes.from();
                        var toId =
                            edge.attributes.to();
                        return (fromId == parentId &&
                            toId == childId);

                    });
                    if(linkModel && linkModel.length > 0) {
                        linkModel = linkModel[0];
                    } else {
                        continue;
                    }
                    var newLinkModel = self.model.addEdge({
                        link_type: linkModel.attributes.link_type(),
                        endpoints: linkModel.attributes.endpoints(),
                        more_attributes: linkModel.attributes.more_attributes()
                    });
                    newLinkModel.from(newParentNode.attributes.element_id());
                    newLinkModel.to(newChildNode.attributes.element_id());
                    var newLink = self.createLink(self.model.edgesCollection.last(),
                        link_type,
                        newParentNode.attributes.element_id(),
                        newChildNode.attributes.element_id(),
                        arrowPosition, eventName);
                    var currentLinkId = newLink.attributes.element_id();
                    network.addEdge(newLink);
                    if($.inArray(currentLinkId, underlayPathIds.links) == -1)
                        underlayPathIds.links.push(currentLinkId);
                    dupLinks[parentNode.name + "<->" + 
                        childNode.name] = currentLinkId;
                    dupLinks[childNode.name + "<->" + 
                        parentNode.name] = currentLinkId;
                }
                self.underlayPathIds = underlayPathIds;
            }
        },
        clearFlowPath: function() {
            graphModel.flowPath().model().set('nodes',[], {silent: true});
            graphModel.flowPath().model().set('links',[], {silent: true});
        },
        expandNodes: function (params, contrailVisView) {
            var self = contrailVisView.caller;
            var _network = contrailVisView.network;
            var graphModel = self.model;
            var dblClickedElement = (_network.findNode(params.nodes[0]))[0];
            var nodeDetails = dblClickedElement.options;
            var elementType = dblClickedElement.options.node_type;
            switch (elementType) {
                case ctwc.PROUTER:
                    var chassis_type = nodeDetails['chassis_type'];
                    if (chassis_type === "tor") {
                        graphModel.selectedElement().model().set({
                        'nodeType': ctwc.PROUTER,
                        'nodeDetail': nodeDetails});
                        var children = dblClickedElement.options.model.attributes.children;
                        var adjList = _.clone(
                            graphModel.underlayAdjacencyList());
                        var childrenName = [];
                        _.each(children, function(child) {
                            childrenName.push(child.name());
                            adjList[child.name()] = [];
                        });
                        if (childrenName.length > 0) {
                            adjList[nodeDetails['name']] = childrenName;
                            graphModel.adjacencyList(adjList);
                            self.removeUnderlayEffects();
                            self.removeUnderlayPathIds();
                            var childElementsArray = 
                            self.createElementsFromAdjacencyList(graphModel);
                            self.addElementsToGraph(childElementsArray, null, dblClickedElement);
                            self.markErrorNodes();
                            self.addDimlightToConnectedElements();
                            var thisNode = [nodeDetails];
                            self.addHighlightToNodesAndLinks(thisNode, childElementsArray, graphModel);
                            var graphData = contrailVisView.getData();
                        }
                    } else {
                        if(self.underlayPathIds.nodes.length > 0 ||
                                self.underlayPathIds.links.length > 0) {
                                self.removeUnderlayPathIds();
                                self.removeUnderlayEffects();
                                self.resetTopology({
                                    resetBelowTabs: true
                                });
                            }
                        }
                    break;
                case ctwc.VROUTER:
                    graphModel.selectedElement().model().set({
                    'nodeType': ctwc.VROUTER,
                    'nodeDetail': nodeDetails});
                    var parentNode = null;
                    $.each(_network.getConnectedEdges(params.nodes[0]), function(idx, edge_id) {
                        var connectedNodes = _network.getConnectedNodes(edge_id);
                        var connectedNode0 = contrailVisView.getNode(connectedNodes[0]);
                        var connectedNode1 = contrailVisView.getNode(connectedNodes[1]);
                        if(connectedNode0 && connectedNode0.node_type == ctwc.PROUTER) {
                            parentNode = connectedNode0;
                        } else if (connectedNode1 && 
                            connectedNode1.node_type == ctwc.PROUTER) {
                            parentNode = connectedNode1;
                        }
                    });

                    var siblings = []; //vrouter siblings
                    if(parentNode != null) {
                        siblings = graphModel.getChildren(parentNode.name,
                        ctwc.VROUTER, graphModel.nodesCollection,
                        graphModel.edgesCollection);
                    } else {
                        var parentName = dblClickedElement.options.parent[0];
                        if(parentName) {
                            siblings = graphModel.getChildren(parentName, ctwc.VROUTER,
                            graphModel.nodesCollection, graphModel.edgesCollection);
                            parentNode =
                            self.network.getNode(self.model.elementMap().node[parentName]);
                        }

                    }
                    /*var children = graphModel.getChildren(nodeDetails.name,
                        ctwc.VIRTUALMACHINE, graphModel.nodesCollection,
                        graphModel.edgesCollection);*/
                    var children = dblClickedElement.options.model.attributes.children;
                    var newAdjList = {};
                    var oldAdjList = {};
                    if(self.underlayPathIds.nodes.length > 0 ||
                        self.underlayPathIds.links.length > 0) {
                        newAdjList = _.clone(graphModel.underlayAdjacencyList());
                        oldAdjList = _.clone(graphModel.underlayAdjacencyList());
                    }
                    else {
                        newAdjList = _.clone(graphModel.adjacencyList());
                        oldAdjList = _.clone(graphModel.adjacencyList());
                    }
                    if (siblings.length > 0) {
                        var siblingName = [];
                        for (var i = 0; i < siblings.length; i++) {
                            siblingName.push(siblings[i].attributes.name());
                            newAdjList[siblings[i].attributes.name()] = [];
                        }
                        newAdjList[parentNode['name']] = siblingName;
                        oldAdjList = _.clone(newAdjList);
                        oldAdjList[parentNode['name']] = [];
                    }
                    var childrenName = [];
                    _.each(children, function(child) {
                        childrenName.push(child.name());
                        newAdjList[child.name()] = [];
                    });
                    if(childrenName.length > 0)
                        newAdjList[nodeDetails['name']] = childrenName;
                    graphModel.adjacencyList(newAdjList);
                    self.removeUnderlayEffects();
                    self.removeUnderlayPathIds();
                    var childElementsArray = self.createElementsFromAdjacencyList();
                    self.addElementsToGraph(childElementsArray, null, dblClickedElement);
                    self.addDimlightToConnectedElements();
                    var thisNode = [nodeDetails];
                    self.addHighlightToNodesAndLinks(thisNode, childElementsArray, graphModel);
                    self.markErrorNodes();
                    graphModel.adjacencyList(oldAdjList);
                    break;
            }
        },

        createLink: function(link, link_type, srcId, tgtId, arrowPosition, eventName) {
            var self = this;
            link.attributes.link_type(link_type);
            if(arrowPosition == "from" ||
                arrowPosition == "to") {
                if(self.network.network.getSelectedNodes().length > 0 ||
                    self.network.network.getSelectedEdges().length > 0) {
                    if(eventName == "dragEnd")
                        link.attributes.color(self.style.flowPathDefault.color);
                    else
                        link.attributes.color(self.style.flowPathDimlight.color);
                } else {
                    link.attributes.color(self.style.flowPathDefault.color);
                }
                if(arrowPosition == "to") {
                    link.attributes.arrows({
                        to : {
                            enabled : true,
                            scaleFactor: .6
                        }
                    });
                } else if(arrowPosition == "from") {
                    link.attributes.arrows({
                        from : {
                            enabled : true,
                            scaleFactor: .6
                        }
                    });
                }
            }
            var tooltipConfig = self.getUnderlayTooltipConfig()['link'];
            var title = tooltipConfig.title(link);
            var content = tooltipConfig.content(link);
            var tooltipTmpl = contrail.getTemplate4Id(cowc.TMPL_UNDERLAY_ELEMENT_TOOLTIP)
            var tooltip = tooltipTmpl({
                title: title,
                content: content
            });
            var dummydiv = $( '<div id=' + link.attributes.element_id() +' style="display:block;visibility:hidden"/>');
            $('body').append(dummydiv)
            dummydiv.append($(_.unescape(tooltip)));
            link.attributes.tooltip(tooltip);
            link.attributes.tooltipConfig({
                title       : title,
                content     : content,
                dimension   : {
                    width   : $(dummydiv).find('.popover').width(),
                    height  : $(dummydiv).find('.popover').height()
                }
            });
            $(dummydiv).empty();
            $(dummydiv).remove();
            dummydiv = $();
            delete dummydiv;
            return link;
        },

        createNode: function(node) {
            var level = 1;
            var nodeName = node.attributes.name();
            var node_type = node.attributes.node_type();
            var chassis_type = node.attributes.chassis_type();
            var labelNodeName = contrail.truncateText(nodeName, 20);
            var tooltipConfig = this.getUnderlayTooltipConfig()[node_type];
            var title = tooltipConfig.title(node);
            var content = tooltipConfig.content(node);
            var tooltipTmpl = contrail.getTemplate4Id(cowc.TMPL_UNDERLAY_ELEMENT_TOOLTIP)
            var tooltip = tooltipTmpl({
                title: title,
                content: content
            });
            var dummydiv = $( '<div id=' + node.attributes.element_id() +' style="display:block;visibility:hidden"/>');
            $('body').append(dummydiv)
            dummydiv.append($(_.unescape(tooltip)));
            node.attributes.tooltip(tooltip);
            node.attributes.tooltipConfig({
                title           : title,
                content         : content,
                actionsCallback : tooltipConfig.actionsCallback,
                dimension: {
                    width: $(dummydiv).find('.popover').width(),
                    height: $(dummydiv).find('.popover').height(),
                }
            });

            $(dummydiv).empty();
            $(dummydiv).remove();
            dummydiv = $();
            delete dummydiv;
            return node;
        },
        createElementsFromAdjacencyList: function() {
            var elements = [];
            var linkElements = [];
            var self = this;
            var network = self.network;
            var underlayGraphModel = self.model;
            //var adjacencyList = underlayGraphModel.adjacencyList();
            var adjacencyList = underlayGraphModel.model().attributes.adjacencyList
            var conElements = underlayGraphModel.connectedElements();
            var nodesCollection = underlayGraphModel.nodesCollection;
            var elMap = underlayGraphModel.elementMap();
            _.each(adjacencyList, function(edges, parentElementLabel) {
                if (null !== elMap["node"][parentElementLabel] &&
                    typeof elMap["node"][parentElementLabel] !== "undefined") {
                    var el = network.getNode(elMap["node"][parentElementLabel]);
                    if (null !== el && typeof el !== "undefined") {
                        var el = underlayGraphModel.getNode(el.id);
                        if(el && el.length == 1) {
                            elements.push(el[0]);
                            return;
                        }
                    } else {
                        el = _.filter(nodesCollection.models, function(node) {
                            return (node.attributes.element_id() ==
                                elMap["node"][parentElementLabel]);
                        });
                        if (el && el.length === 1) {
                            elements.push(el[0]);
                            return;
                        }
                    }
                }
                var parentNode = _.filter(nodesCollection.models, function(node) { 
                    return (node.attributes.name() == parentElementLabel &&
                        !(node.attributes.model().attributes.hasOwnProperty("hidden")));
                    });
                if (false !== parentNode && parentNode.length === 1) {
                    parentNode = parentNode[0];
                    var parentName = parentNode.attributes.name();
                    var parentNodeType = parentNode.attributes.node_type();
                    elements.push(self.createNode(parentNode));
                    var currentEl = elements[elements.length - 1];
                    conElements.push(currentEl);
                    var currentElId = currentEl.attributes.element_id();
                    elMap.node[parentName] = currentElId;
                }
            });

            _.each(adjacencyList, function(edges, parentElementLabel) {
                var parentNode = _.filter(nodesCollection.models, function(node) { 
                    return (node.attributes.name() == parentElementLabel &&
                        !(node.attributes.model().attributes.hasOwnProperty("hidden")));
                    });
                if (false !== parentNode && parentNode.length === 1) {
                    parentNode = parentNode[0];
                    var parentNodeType = parentNode.attributes.node_type();
                    var parentId = elMap.node[parentNode.attributes.name()];
                    var edgesCollection = self.model.edgesCollection;
                    _.each(edges, function(childElementLabel) {
                        if (null !== elMap["link"][parentElementLabel + "<->" + childElementLabel] &&
                            typeof elMap["link"][parentElementLabel + "<->" + childElementLabel] !== "undefined") {
                            var linkEl = network.getEdge(elMap["link"][parentElementLabel + "<->" + childElementLabel]);
                            if (null !== linkEl && typeof linkEl !== "undefined") {
                                linkElements.push(linkEl.model);
                                return;
                            } else {
                                var cLabel = childElementLabel;
                                linkEl = _.filter(conElements, function(el) { 
                                    if(el.attributes.hasOwnProperty("arrows")) {
                                        //looking for link
                                        var lName = [parentElementLabel,
                                            cLabel].join("<-->");
                                        var altName = [cLabel,
                                            parentElementLabel].join("<-->");
                                        var ep = el.attributes.endpoints().join("<-->");
                                        return ( lName == ep || altName == ep);
                                    }
                                });
                                if (typeof linkEl === "object" &&
                                    linkEl.length === 1) {
                                    linkElements.push(linkEl[0]);
                                    return;
                                }
                            }
                        }
                        var childNode = _.filter(nodesCollection.models, function(node) { 
                            return (node.attributes.name() == childElementLabel &&
                                !(node.attributes.model().attributes.hasOwnProperty("hidden")));
                        });
                        if (false !== childNode && childNode.length === 1) {
                            childNode = childNode[0];
                            var childNodeType = childNode.attributes.node_type();
                            var childId = elMap.node[childNode.attributes.name()];
                            var link_type = parentNodeType.split("-")[0][0] +
                                parentNodeType.split("-")[1][0] + '-' +
                                childNodeType.split("-")[0][0] +
                                childNodeType.split("-")[1][0];
                            var linkModels = _.filter(edgesCollection.models, function(edge) { 
                                var fromId = 
                                    edge.attributes.from();
                                var toId = 
                                    edge.attributes.to();
                                return ((fromId == parentId &&
                                    toId == childId) ||
                                    (fromId == childId &&
                                    toId == parentId));

                            });

                            for (var i = 0; i < linkModels.length; i++) {
                                var linkModel = linkModels[i].attributes;
                                var endpoints = linkModel.endpoints();
                                var linkName = parentElementLabel +
                                    "<->" + childElementLabel;
                                var altLinkName = childElementLabel +
                                    "<->" + parentElementLabel;
                                if ((null == elMap["link"][linkName] &&
                                        typeof elMap["link"][linkName] == "undefined") &&
                                    null == elMap["link"][altLinkName] &&
                                    typeof elMap["link"][altLinkName] == "undefined") {
                                    linkElements.push(self.createLink(
                                        linkModels[i], link_type, parentId, childId));
                                    var currentLink =
                                        linkElements[linkElements.length - 1];
                                    var currentLinkId = currentLink.attributes.element_id();
                                    conElements.push(currentLink);
                                    elMap.link[linkName] = currentLinkId;
                                    elMap.link[altLinkName] = currentLinkId;
                                }
                            }
                        }
                    });
                }
            });

            var edgesCollection = underlayGraphModel.edgesCollection;
            for(var i=0; i<edgesCollection.models.length; i++) {
                var edgeModel = edgesCollection.models[i]
                var link = edgeModel.attributes;
                var endpoints = link.endpoints();
                var endpoint0 = endpoints[0];
                var endpoint1 = endpoints[1];
                var linkName = endpoint0 + "<->" + endpoint1;
                var altLinkName = endpoint1 + "<->" + endpoint0;
                var endpoint0Node = underlayGraphModel.getNode(link.from());
                if(endpoint0Node && endpoint0Node.length == 1) {
                    endpoint0Node = endpoint0Node[0];
                } else
                    continue;
                var endpoint1Node = underlayGraphModel.getNode(link.to());
                if(endpoint1Node && endpoint1Node.length == 1) {
                    endpoint1Node = endpoint1Node[0];
                } else
                    continue;
                var endpoint0NodeId = endpoint0Node.attributes.element_id();
                var endpoint1NodeId = endpoint1Node.attributes.element_id();
                var endpoint0NodeType = endpoint0Node.attributes.node_type();
                var endpoint1NodeType = endpoint1Node.attributes.node_type();
                var link_type = endpoint0NodeType.split("-")[0][0] +
                    endpoint0NodeType.split("-")[1][0] + '-' +
                    endpoint1NodeType.split("-")[0][0] +
                    endpoint1NodeType.split("-")[1][0];
                if(link_type !== "pr-pr")
                    continue;
                if(null != elMap["node"] && typeof elMap["node"] !== "undefined") {
                    if(null != elMap["node"][endpoint0] && typeof elMap["node"][endpoint0] !== "undefined" &&
                        null != elMap["node"][endpoint1] && typeof elMap["node"][endpoint1] !== "undefined" &&
                        null != adjacencyList[endpoint0] && typeof adjacencyList[endpoint0] !== "undefined" &&
                        null != adjacencyList[endpoint1] && typeof adjacencyList[endpoint1] !== "undefined") {
                        if(null == elMap["link"][linkName] && typeof elMap["link"][linkName] === "undefined" &&
                            null == elMap["link"][altLinkName] && typeof elMap["link"][altLinkName] === "undefined") {
                            var linkModel =
                                _.filter(network.caller.model.edgesCollection.models,
                                function(edge) {
                                    var fromId = edge.attributes.from();
                                    var toId = edge.attributes.to();
                                    return ((fromId == endpoint0NodeId &&
                                        toId == endpoint1NodeId));
                                });
                            if(linkModel && linkModel.length == 1) {
                                linkModel = linkModel[0];
                            } else {
                                continue;
                            }
                            var newLink = self.createLink(linkModel,
                                link_type, endpoint0NodeId, endpoint1NodeId);
                            var currentLinkId = newLink.attributes.element_id();
                            linkElements.push(newLink);
                            var currentLink =
                                linkElements[linkElements.length - 1];
                            conElements.push(currentLink);
                            elMap.link[linkName] = currentLinkId;
                            elMap.link[altLinkName] = currentLinkId;
                        } else {
                            var el = _.filter(linkElements, function(linkEl) {
                                return (linkEl.attributes.element_id() == elMap.link[linkName]);
                            });
                            var linkEl = self.network.getEdge(elMap.link[linkName]);
                            if(el.length == 0 && null != linkEl) {
                                var linkModel = self.model.getEdge(elMap.link[linkName]);
                                if(linkModel && linkModel.length == 1) {
                                    linkModel = linkModel[0];
                                    linkElements.push(linkModel);
                                }
                            } else
                                continue;
                        }
                    } else {
                        continue;
                    }
                } else {
                    continue;
                }
            }

            underlayGraphModel.elementMap(elMap);
            underlayGraphModel.connectedElements(conElements);
            // Links must be added after all the elements. This is because when the links
            // are added to the graph, link source/target
            // elements must be in the graph already.
            return elements.concat(linkElements);
        },
        populateModelAndAddToGraph: function() {
            var self = this;
            $('#' + ctwl.GRAPH_LOADING_ID).hide();
            var elements = this.createElementsFromAdjacencyList();
            if (elements.length > 0) {
                this.addElementsToGraph(elements);
                this.markErrorNodes();
            } else {
                var notFoundTemplate =
                    contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                    notFoundConfig =
                    $.extend(true, {}, cowc.DEFAULT_CONFIG_NOT_FOUND_PAGE, {
                        iconClass: false,
                        defaultErrorMessage: false,
                        defaultNavLinks: false,
                        title: ctwm.NO_PHYSICALDEVICES
                    });
                $("#"+ctwl.UNDERLAY_GRAPH_ID).html(notFoundTemplate(notFoundConfig));
            }
        },

        addElementsToGraph: function(elements, restorePosition, dblClickedElement) {
            var self = this;
            var network = this.network;
            var nodeIds = network.getNodeIds(); //all existing nodes
            var edgeIds = network.getEdgeIds(); //all existing edges
            var mapPositions = {};
            //all elements to be added/removed to/from graph.
            var newElementIds = [];
            _.each(elements, function(el){
                newElementIds.push(el.attributes.element_id());
            });
            var dblClickedElementName = "";
            if(dblClickedElement)
                dblClickedElementName =
                dblClickedElement.options.name;
            //Set hierarchical layout.
            _.each(nodeIds, function(id, idx) {
                if(newElementIds.indexOf(id) == -1) {
                    //node already existing in graph but has to be removed.
                    network.removeNode(id);
                } else {
                    if(false !== restorePosition) {
                        //by default all the nodes' (already existing in graph)
                        //positions are restored, unless otherwise set to 'false'
                        //explicitly.
                        var node = network.findNode(id);
                        if(node && node.length == 1) {
                            node = node[0];
                            //dont remember old position in following cases.
                            //when flowpath is drawn
                            //when drawing children of multiple parents
                            var parentName = ifNull(node.options.parent, "");
                            if(dblClickedElementName == "" ||
                                parentName.indexOf(dblClickedElementName) == -1) {
                                mapPositions[id] = {};
                                mapPositions[id] = {
                                    x: node.x,
                                    y: node.y
                                }
                            } else {
                                //remove node who have multiple parents.
                                network.removeNode(id);
                            }
                        }
                    }
                }
            });
            _.each(edgeIds, function(id, idx) {
                if(newElementIds.indexOf(id) == -1) {
                    //edge already existing in graph but has to be removed.
                    network.removeEdge(id);
                }
            });
            for (var i = 0; i < elements.length; i++) {
                if (elements[i].attributes.hasOwnProperty('from') &&
                    elements[i].attributes.hasOwnProperty('to')) {
                    //its an edge
                    //check if already exists
                    if (network.getEdgeIds().indexOf(elements[i].attributes.element_id()) == -1) {
                        try {
                            //add edge if not present in the graph already.
                            network.addEdge(elements[i]);
                        } catch (e) {

                        }
                    }
                } else {
                    //its a node
                    //check if already exists.
                    if (network.getNodeIds().indexOf(elements[i].attributes.element_id()) == -1) {
                        //Couldnt find the node in dataset.
                        //trying to add it direcly under parent.
                        try {
                            var parent = elements[i].attributes.model().attributes.parent;
                            if(parent) {
                                if(parent.length > 1 && null !== dblClickedElement &&
                                    typeof dblClickedElement !== "undefined") {
                                    //element has more than one parent.
                                    //find which parent to add this under.
                                    if(parent.indexOf(dblClickedElement.options.name) !== -1) {
                                        parent =
                                        parent[parent.indexOf(dblClickedElement.options.name)];
                                    }
                                } else if(parent.length == 1) {
                                    //element has one parent.
                                    parent = parent[0];
                                } else {
                                    parent = parent[0];
                                }
                                //find parent element id from model data.
                                var parentElId =
                                    this.model.elementMap().node[parent];
                                if(null !== parentElId &&
                                    typeof parentElId !== "undefined") {
                                    //if parent element id from model data exists,
                                    //find in nodeDataSet.
                                    var parentEl =
                                    network.getNode(parentElId);
                                    if(parentEl && !isNaN(parentEl.x) &&
                                        !isNaN(parentEl.y)) {
                                        //if the parent element has valid x,y positions
                                        //add this element diretly under the parent.
                                        elements[i].set({"x": parentEl.x}, {"silent":true});
                                        elements[i].set({"y": parentEl.y +
                                        (this.visOptions.layout.hierarchical
                                            .levelSeparation-20)});
                                    } else {
                                        //if nodeDataSet doesnt have parent element
                                        //still it is possible to find it in graph.
                                        //find it in graph.
                                        parentEl = this.network.findNode(parentElId);
                                        if(parentEl && parentEl.length == 1 &&
                                            JSON.stringify(mapPositions) !== "{}") {
                                            //found in graph.
                                            parentEl = parentEl[0];
                                            //check x, y positions are valid.
                                            if(parentEl && !isNaN(parentEl.x) &&
                                                !isNaN(parentEl.y)) {
                                                //if valid x, y, then add direclty
                                                //under this parent.
                                                elements[i].set({"x": parentEl.x}, {"silent":true});
                                                elements[i].set({"y": parentEl.y +
                                                (this.visOptions.layout.hierarchical
                                                    .levelSeparation-20)});
                                            }
                                            //if no, layout takes care the position
                                            //which is usually 0,0
                                        }
                                    }
                                }
                            }
                            //add to nodedataset.
                            //by this time, the new element is positioned mostly
                            //directly under parent or it is set to 0,0 by layout
                            network.addNode(elements[i]);
                        } catch (e) {

                        }
                    }
                }
            }
            var updatedNodes = [];
            if(false !== restorePosition) {
                //restore old positions, if found earlier.
                _.each(mapPositions, function(position, id) {
                    for (var i = 0; i < elements.length; i++) {
                        var elModel = elements[i].attributes;
                        if (elModel.element_id() == id) {
                            elModel.model().set({"x":position.x}, {"silent":true});
                            elModel.model().set({"y":position.y});
                            updatedNodes.push(id);
                            continue;
                        }
                    }
                });
            }
            var newElements = [];
            var newParentElement = null;
            if(updatedNodes.length > 0) {
                for(var i=0; i<newElementIds.length; i++) {
                    if($.inArray(newElementIds[i], updatedNodes) == -1) {
                        if(network.getEdge(newElementIds[i]) == null) {
                            var newlyAddedElement = elements[i];
                            if(elements[i].attributes.model().attributes.parent != null &&
                                elements[i].attributes.model().attributes.parent.length > 0) {
                                var parent = elements[i].attributes.model().attributes.parent;
                                if(parent.length == 1) {
                                    parent = parent[0];
                                } else {
                                    parent = parent[parent.indexOf(dblClickedElementName)];
                                }
                                if(parent) {
                                    var parentEl =
                                        network.getNode(this.model.elementMap().node[parent]);
                                    if(parentEl) {
                                        newParentElement = parentEl;
                                        newElements.push(elements[i]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if(newParentElement !== null) {
                var len = newElements.length * this.visOptions.layout.hierarchical.levelSeparation;
                var startPos = newParentElement.x - (len/2);
                if(!isNaN(startPos)) {
                    for(var i=0; i<newElements.length; i++) {
                        newElements[i].attributes.model().set({
                            "x": startPos + ((i+1)*50) + (i*30)}, {"silent":true});
                        newElements[i].attributes.model().set({
                            "y": newParentElement.y + this.visOptions.layout.hierarchical.levelSeparation});
                        if(network.getNode(newElements[i].attributes.element_id()) == null)
                            network.addNode(newElements[i]);
                        else
                            network.updateNode(newElements[i]);
                    }
                }

            }
            network.setData(null, this.visOptions);
        },

        markErrorNodes: function() {
            var graphModel = this.model;
            var errorNodes = graphModel.getErrorNodes();
            var elementMap = graphModel.elementMap();
            var elementMapNodes = ifNull(elementMap['node'], {});
            if (!$.isArray(errorNodes)) {
                errorNodes = [errorNodes];
            }
            var errorNodesLen = errorNodes.length;
            for (var i = 0; i < errorNodesLen; i++) {
                if (elementMapNodes[errorNodes[i].attributes.name()] != null) {
                    //var node = this.model.getNode(elementMapNodes[errorNodes[i].attributes.name()]);
                    var node = errorNodes[i];
                    node.attributes.image(this.getImage("unknown", this.ERROR));
                }
            }
        },

        removeUnderlayPathIds: function() {
            var network = this.network;
            var graphModel = this.model;
            var elementMap = graphModel.elementMap();
            var pathIds = this.underlayPathIds;
            var edgeIds = network.getEdgeIds();
            var edges = [];
            if(pathIds && pathIds.hasOwnProperty('links')) {
                for (var i = 0; i < pathIds.links.length; i++) {
                    graphModel.edgesCollection.remove(
                        graphModel.getEdge(pathIds.links[i])[0]);
                    network.removeEdge(pathIds.links[i]);
                }
            }
            if(pathIds && pathIds.hasOwnProperty('nodes')) {
                for (var i = 0; i < pathIds.nodes.length; i++) {
                    graphModel.nodesCollection.remove(
                        graphModel.getNode(pathIds.nodes[i])[0]);
                    network.removeNode(pathIds.nodes[i]);
                }
            }
            this.underlayPathIds = {
                nodes: [],
                links: []
            };
            this.duplicatePathsDrawn = false;
        },
        addDimlightToConnectedElements: function() {
            var network = this.network;
            var _this = this;
            var nodeIds = network.getNodeIds();
            var edgeIds = network.getEdgeIds();
            var nodes = [];
            var mapPositions = {};
            var flowPathEdges = this.underlayPathIds.links;
            for (var i = 0; i < nodeIds.length; i++) {
                var node = _.filter(_this.model.nodesCollection.models,function(node){
                    return (node.attributes.element_id() == nodeIds[i]);
                });
                if(node && node.length == 1)
                    node = node[0];
                else
                    continue;
                var nodeEl = network.findNode(nodeIds[i]);
                if(nodeEl && nodeEl.length == 1) {
                    nodeEl = nodeEl[0];
                    node.attributes.model().set({"x": nodeEl.x}, {"silent": true})
                    node.attributes.model().set({"y": nodeEl.y})
                    mapPositions[nodeIds[i]] = {};
                    mapPositions[nodeIds[i]] = {
                        x: nodeEl.x,
                        y: nodeEl.y
                    }
                }
                node.attributes.image(_this.getImage(node.attributes.chassis_type(), _this.DIMLIGHT));
                nodes.push(node);
            }

            _.each(mapPositions, function(position, id) {
                for (var i = 0; i < nodes.length; i++) {
                    if (nodes[i].attributes.element_id() == id) {
                        //nodes[i].attributes.model().set({"x": position.x},{"silent": true});
                        //nodes[i].attributes.model().set({"y": position.y});
                        continue;
                    }
                }
            });

            for (var i = 0; i < edgeIds.length; i++) {
                var edge = _.filter(_this.model.edgesCollection.models,function(edge){
                    return (edge.attributes.element_id() == edgeIds[i]);
                });
                if(edge && edge.length == 1) {
                    edge = edge[0];

                    if($.inArray(edgeIds[i], flowPathEdges) == -1) {
                        edge.attributes.model().set("color", _this.style.defaultDimlight.color);
                    } else {
                        edge.attributes.model().set("color", _this.style.flowPathDimlight.color);
                    }
                }
            }
        },

        resetConnectedElements: function(restorePosition) {
            var self = this;
            var network = self.network;
            var nodeIds = network.getNodeIds();
            var edgeIds = network.getEdgeIds();
            var nodes = [];
            var flowPathEdges = self.underlayPathIds.links;
            var mapPositions = {};

            for (var i = 0; i < nodeIds.length; i++) {
                var nodeModel = self.model.getNode(nodeIds[i]);
                var nodeEl = network.findNode(nodeIds[i]);
                if(nodeEl && nodeEl.length == 1 &&
                    nodeModel && nodeModel.length == 1) {
                    nodeEl = nodeEl[0];
                    nodeModel = nodeModel[0];
                }
                else
                    continue;
                mapPositions[nodeIds[i]] = {};
                mapPositions[nodeIds[i]] = {
                    x: nodeEl.x,
                    y: nodeEl.y
                };
                if(flowPathEdges.length > 0) {
                    nodeModel.attributes.image(
                        this.getImage(nodeModel.attributes.chassis_type(),
                            this.DIMLIGHT));
                }
                else {
                    nodeModel.attributes.image(
                        this.getImage(nodeModel.attributes.chassis_type(),
                            this.DEFAULT));
                }
                nodes.push(nodeModel);
            }
            self.markErrorNodes();
            if(restorePosition == false) {
                return;
            }
            _.each(mapPositions, function(position, id) {
                for (var i = 0; i < nodes.length; i++) {
                    if (nodes[i].id == id) {
                        node.attributes.model().set({"x":position.x}, {"silent": true});
                        node.attributes.model().set({"y":position.y});
                        continue;
                    }
                }
            });
            var edges = [];
            for (var i = 0; i < edgeIds.length; i++) {
                var edge = self.model.getEdge(edgeIds[i]);
                if(edge && edge.length == 1)
                    edge = edge[0];
                else
                    continue;
                if($.inArray(edgeIds[i], flowPathEdges) == -1) {
                    edge.attributes.color(self.style.defaultDimlight.color);
                } else {
                    if(network.network.getSelectedNodes().length > 0 ||
                        network.network.getSelectedEdges().length > 0) {
                        edge.attributes.color(self.style.flowPathDimlight.color);
                    } else {
                        edge.attributes.color(self.style.flowPathDefault.color);
                    }
                }
                edges.push(edge);
            }
        },        
        addHighlightToNodesAndLinks: function(nodes, els, graphModel) {
            var elMap = graphModel.elementMap();
            var errorNodes = graphModel.getErrorNodes();
            var _this = this;
            if (typeof nodes == "object" && nodes.length > 0) {
                var nodeNames = [];
                for (var i = 0; i < nodes.length; i++) {
                    var node = nodes[i],
                        name = node.name;
                    nodeNames.push(name);
                    var node_model_id = jsonPath(elMap, '$.node[' + node.name + ']');
                    if (false !== node_model_id && typeof node_model_id === "object" &&
                        node_model_id.length === 1 && errorNodes.indexOf(name) == -1) {
                        node_model_id = node_model_id[0];
                        _this.addHighlightToNode(node_model_id);
                    }
                }

                $.each(elMap.link, function(link, link_id) {
                    var endpoints = link.split("<->");
                    var endpoint0 = endpoints[0];
                    var endpoint1 = endpoints[1];
                    if (nodeNames.indexOf(endpoint0) !== -1 &&
                        nodeNames.indexOf(endpoint1) !== -1) {
                        _this.addHighlightToLink(link_id);
                    }
                });
            }
        },

        addHighlightToNode: function(node_model_id) {
            var clickedElement = this.model.getNode(node_model_id);
            if(clickedElement && clickedElement.length == 1)
                clickedElement = clickedElement[0];
            else
                return;
            clickedElement.attributes.image(this.getImage(clickedElement.attributes.chassis_type(), this.HIGHLIGHT));
        },

        addHighlightToLink: function(link_model_id) {
            var clickedElement = this.model.getEdge(link_model_id);
            if(clickedElement && clickedElement.length == 1)
                clickedElement = clickedElement[0];
            else
                return;
            clickedElement.attributes.color(this.style.defaultSelected.color);
        },

        getUnderlayTooltipConfig: function() {
            var _this = this;
            var tooltipTitleTmpl =
                contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP_TITLE),
                tooltipContentTmpl =
                contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP_CONTENT);
            return {
                "physical-router": {
                    title: function(node) {
                        return tooltipTitleTmpl({
                            name: node.attributes.name(),
                            type: ctwl.TITLE_GRAPH_ELEMENT_PHYSICAL_ROUTER
                        });

                    },
                    content: function(node) {
                        var actions = [], tooltipLblValues = [], ifLength = 0;
                        var iconClass = 'icon-contrail-router';
                        if (node.attributes.chassis_type() == 'tor') {
                            iconClass = 'icon-contrail-switch';
                        }
                        actions.push({
                            text: 'Configure',
                            iconClass: 'icon-cog'
                        });
                        ifLength = 
                        getValueByJsonPath(node.attributes.more_attributes(),"ifTable", []).length;
                        tooltipLblValues.push({
                            label: 'Name',
                            value: node.attributes.name()
                        });
                        if (node.attributes.errorMsg() != null) {
                            tooltipLblValues.push({
                                label: 'Events',
                                value: node.attributes.errorMsg()
                            });
                        } else {
                            tooltipLblValues.push({
                                label: 'Interfaces',
                                value: ifLength
                            }, {
                                label: 'Management IP',
                                value: ifNull(node.attributes.mgmt_ip(), '-')
                            });
                        }

                        return tooltipContentTmpl({
                            info: tooltipLblValues,
                            iconClass: iconClass,
                            actions: actions
                        });
                    },
                    actionsCallback: function(node) {
                        var actions = [];
                        actions.push({
                            callback: function(key, options) {
                                loadFeature({
                                    p: 'config_pd_physicalRouters'
                                });
                            }
                        });

                        actions.push({
                            callback: function(key, options) {
                                graphModel.selectedElement().model().set({
                                    'nodeType': ctwc.PROUTER,
                                    'nodeDetail': node});
                                graphModel.selectedElement().model().set({
                                    'nodeType': '',
                                    'nodeDetail': {}},{silent:true});
                            }
                        });

                        return actions;
                    }
                },
                "virtual-router": {
                    title: function(node) {
                        return tooltipTitleTmpl({
                            name: node.attributes.name(),
                            type: ctwl.TITLE_GRAPH_ELEMENT_VIRTUAL_ROUTER
                        });
                    },
                    content: function(node) {
                        var graphModel =
                            $("#"+ctwl.UNDERLAY_GRAPH_ID).data('graphModel');
                        var actions = [], instances = graphModel.getVirtualMachines(),
                            ip = monitorInfraConstants.noDataStr;
                        var vms = 0,
                            name = node.attributes.name();
                        if(name.length <= 0)
                            name = "-";
                        var ipArr = getValueByJsonPath(node.attributes.more_attributes(), 'VrouterAgent;self_ip_list', []);
                        if (ipArr.length > 0) {
                            ip = ipArr.join(',');
                        }
                        for (var i = 0; i < instances.length; i++) {
                            if (instances[i].attributes.more_attributes().vrouter === name) {
                                vms++;
                            }
                        }

                        actions.push({
                            text: 'Configure',
                            iconClass: 'icon-cog'
                        });

                        var tooltipContent = [{
                            label: 'Name',
                            value: name
                        },{
                            label: 'IP',
                            value: ip
                        }, {
                            label: "Number of VMs",
                            value: vms
                        }];
                        return tooltipContentTmpl({
                            info: tooltipContent,
                            iconClass: 'icon-contrail-virtual-router',
                            actions: actions
                        });
                    },
                    actionsCallback: function(node) {
                        var actions = [];
                        actions.push({
                            callback: function(key, options) {
                                loadFeature({
                                    p: 'config_infra_vrouters'
                                });
                            }
                        });

                        actions.push({
                            callback: function() {
                                graphModel.selectedElement().model().set({
                                    'nodeType': ctwc.VROUTER,
                                    'nodeDetail': node});
                                graphModel.selectedElement().model().set({
                                    'nodeType': '',
                                    'nodeDetail': {}},{silent:true});
                            }
                        });
                        return actions;
                    }
                },
                "virtual-machine": {
                    title: function(node) {
                        var virtualMachineName =
                        getValueByJsonPath(node.attributes.more_attributes(),
                                'vm_name', '-');
                        return tooltipTitleTmpl({
                            name: virtualMachineName,
                            type: ctwl.TITLE_GRAPH_ELEMENT_VIRTUAL_MACHINE
                        });
                    },
                    content: function(node) {
                        var actions = [],
                            tooltipContent, tooltipLblValues = [];
                        var graphModel =
                            $("#"+ctwl.UNDERLAY_GRAPH_ID).data('graphModel');
                        var vmIp = "",
                            vn = "",
                            label, instanceName = "";
                        var instanceUUID = node.attributes.name();
                        var instances = graphModel.getVirtualMachines();
                        for (var i = 0; i < instances.length; i++) {
                            if (instances[i].attributes.name() === instanceUUID) {
                                var attributes = ifNull(instances[i].attributes.more_attributes(), {}),
                                    ipArr = [],
                                    vnArr = [];
                                var interfaceList = ctwu.getDataBasedOnSource(ifNull(attributes['interface_list'], []));
                                label = "Name";
                                instanceName = attributes['vm_name'];
                                for (var j = 0; j < interfaceList.length; j++) {
                                    if (interfaceList[j]['virtual_network'] != null)
                                        vnArr.push(interfaceList[j]['virtual_network']);
                                    if (interfaceList[j]['ip6_active'] && interfaceList[j]['ip6_address'] != '0.0.0.0')
                                        ipArr.push(interfaceList[j]['ip6_address']);
                                    else if (interfaceList[j]['ip_address'] != '0.0.0.0')
                                        ipArr.push(interfaceList[j]['ip_address']);
                                }
                                if (ipArr.length > 0)
                                    vmIp = ipArr.join();
                                if (vnArr.length > 0)
                                    vn = ctwu.formatVNName(vnArr);
                                break;
                            }
                        }
                        if ("" == instanceName)
                            instanceName = node.attributes.name();
                        tooltipContent = {
                            iconClass: 'icon-contrail-virtual-machine font-size-30',
                            actions: actions
                        };
                        tooltipLblValues = [{
                            label: label,
                            value: instanceName
                        }];
                        tooltipLblValues.push({
                            label: 'UUID',
                            value: instanceUUID
                        });
                        if (vmIp !== "") {
                            tooltipLblValues.push({
                                label: "IP",
                                value: vmIp
                            });
                        }
                        if (vn !== "") {
                            tooltipLblValues.push({
                                label: "Network(s)",
                                value: vn
                            });
                        }
                        tooltipContent['info'] = tooltipLblValues;
                        return tooltipContentTmpl(tooltipContent);
                    }
                },
                link: {
                    title: function(link) {
                        var graphModel = $("#"+ctwl.UNDERLAY_GRAPH_ID).data('graphModel');
                        var instances = graphModel.getVirtualMachines(graphModel.nodes());
                        var instanceName1 = "";
                        var instanceName2 = "";
                        var endpoint1 = link.attributes.endpoints()[0];
                        var endpoint2 = link.attributes.endpoints()[1];
                        for (var i = 0; i < instances.length; i++) {
                            var instanceAttrs = instances[i].attributes;
                            if (instanceAttrs.name() === endpoint1) {
                                instanceName1 =
                                    instanceAttrs.more_attributes().vm_name;
                            } else if (instanceAttrs.name() === endpoint1) {
                                instanceName2 =
                                    instanceAttrs.more_attributes().vm_name;
                            }
                        }
                        if ("" == instanceName1)
                            instanceName1 = endpoint1;
                        if ("" == instanceName2)
                            instanceName2 = endpoint2;

                        return tooltipTitleTmpl({
                            name: instanceName1 + ctwc.LINK_CONNECTOR_STRING + instanceName2,
                            type: ctwl.TITLE_GRAPH_ELEMENT_CONNECTED_NETWORK
                        });
                    },
                    content: function(link) {
                        var local_interfaces = [];
                        var remote_interfaces = [];
                        if (link.attributes.more_attributes() && "-" !== link.attributes.more_attributes() &&
                            link.attributes.more_attributes().length > 0) {
                            var moreAttrs = link.attributes.more_attributes();
                            for (var i = 0; i < moreAttrs.length; i++) {
                                local_interfaces.push(" "+moreAttrs[i].local_interface_name + " (" + moreAttrs[i].local_interface_index + ")");
                                remote_interfaces.push(" "+moreAttrs[i].remote_interface_name + " (" + moreAttrs[i].remote_interface_index + ")");
                            }
                        }
                        data = [{
                            label: link.attributes.endpoints()[0],
                            value: local_interfaces
                        }, {
                            label: link.attributes.endpoints()[1],
                            value: remote_interfaces
                        }];
                        return tooltipContentTmpl({
                            info: data,
                            iconClass: 'icon-resize-horizontal'
                        });
                    }
                }
            };
        },

        resetTopology: function(options) {
            var self = this;
            var underlayGraphModel = self.model;
            //this.removeUnderlayPathIds();
            var restorePosition = options.restorePosition;
            this.resetConnectedElements(restorePosition);
            var adjList = _.clone(underlayGraphModel.underlayAdjacencyList());
            underlayGraphModel.adjacencyList(adjList);
            self.network.setOptions(self.visOptions);
            var childElementsArray =
                this.createElementsFromAdjacencyList(underlayGraphModel);
            this.addElementsToGraph(childElementsArray, restorePosition);
            this.markErrorNodes();
            if (options['resetBelowTabs'] == true) {
                underlayUtils.removeUnderlayTabs(
                    this.rootView.viewMap[ctwc.UNDERLAY_TABS_VIEW_ID]);
            }
            underlayGraphModel.selectedElement().model().set({
                'nodeType': '',
                'nodeDetail': {}});

            //self.enableFreeflow();
        },

        clearHighlightedConnectedElements: function() {
            this.markErrorNodes();
        },

        getImage: function(chassis_type, state) {
            switch(chassis_type) {
                case "coreswitch":
                    chassis_type = 'router';
                    break;
                case "spine":
                    chassis_type = 'router';
                    break;
                case "tor":
                    chassis_type = 'tor';
                    break;
                case "virtual-router":
                    chassis_type = 'virtual-router';
                    break;
                case "virtual-machine":
                    chassis_type = 'virtual-machine';
                    break;
                default:
                    chassis_type = 'router';
                    break;
            }
            return ("/img/" + chassis_type + "-" + state + ".svg");
        },
        getEventsConfig: function() {
            var self = this;
            return {
                "click"                         : self.clickHandler,
                "doubleClick"                   : self.doubleClickHandler,
                "showPopup"                     : self.showPopupHandler,
                "blurNode"                      : self.blurNodeHandler,
                "dragStart"                     : self.dragStartHandler,
                "dragEnd"                       : self.dragEndHandler,
                "stabilized"                    : self.stabilizedHandler,
                "stabilizationIterationsDone"   : self.stabilizationIterationsDoneHandler
            };
        },
        clickHandler: function(params, contrailVisView) {
            var parameters = params;
            timeout = setTimeout(function() {
                if($("#resetTopologyModal").is(":visible")) {
                    return;
                }
                var params = parameters;
                var self = contrailVisView.caller;
                var network = contrailVisView;
                var _network = network.network;
                if (params.nodes.length == 1) {
                    var clickedElement = _network.canvas.body.nodes[params.nodes[0]];
                    //self.resetConnectedElements();
                    self.addDimlightToConnectedElements();
                    var node = self.model.getNode(params.nodes[0]);
                    if(node && node.length == 1)
                        node = node[0];
                    else
                        return;
                    var elementType = clickedElement.options.node_type;
                    var chassis_type = clickedElement.options.chassis_type;
                    node.attributes.image(self.getImage(chassis_type, self.HIGHLIGHT));

                    switch (elementType) {
                        case ctwc.PROUTER:
                            var nodeDetails = clickedElement.options;
                            if (nodeDetails['more_attributes']['ifTable'] == '-')
                                nodeDetails['more_attributes']['ifTable'] = [];
                                graphModel.selectedElement().model().set({
                                    'nodeType': ctwc.PROUTER,
                                    'nodeDetail': nodeDetails});
                                graphModel.selectedElement().model().set({
                                    'nodeType': '',
                                    'nodeDetail': {}},{silent:true});
                            break;
                        case ctwc.VROUTER:
                            var nodeDetails = clickedElement.options;
                            graphModel.selectedElement().model().set({
                                'nodeType': ctwc.VROUTER,
                                'nodeDetail': nodeDetails});
                            graphModel.selectedElement().model().set({
                                'nodeType': '',
                                'nodeDetail': {}},{silent:true});
                            break;
                        case ctwc.VIRTUALMACHINE:
                            var nodeDetails = clickedElement.options;
                            graphModel.selectedElement().model().set({
                                'nodeType': ctwc.VIRTUALMACHINE,
                                'nodeDetail': nodeDetails});
                            graphModel.selectedElement().model().set({
                                'nodeType': '',
                                'nodeDetail': {}},{silent:true});
                            break;
                    }
                } else if (params.edges.length == 1) {
                    var data = {};
                    var clickedElement = _network.canvas.body.edges[params.edges[0]];
                    self.addDimlightToConnectedElements();
                    var edge = self.model.getEdge(params.edges[0]);
                    if(edge && edge.length == 1)
                        edge = edge[0];
                    else
                        return;
                    edge.attributes.color(self.style.defaultSelected.color);
                    var targetElement = clickedElement.to;
                    var sourceElement = clickedElement.from;
                    var endpoints = [sourceElement['options']['name'],
                        targetElement['options']['name']];
                    self.addHighlightToNodesAndLinks(
                        [targetElement['options'],
                        sourceElement['options']],
                        null,
                        graphModel);
                    var linkDetail = {};
                    linkDetail['endpoints'] = endpoints;
                    linkDetail['sourceElement'] = sourceElement['options'];
                    linkDetail['targetElement'] = targetElement['options'];
                    graphModel.selectedElement().model().set({
                        'nodeType': ctwc.UNDERLAY_LINK,
                        'nodeDetail': linkDetail});
                    graphModel.selectedElement().model().set({
                        'nodeType': '',
                        'nodeDetail': {}},{silent:true});

                } else if (params.edges.length == 0 && params.nodes.length == 0) {
                    $(".vis-network-tooltip").popover("hide");
                }
                timeout = null;
            }, 300);
        },
        blurNodeHandler: function(params, contrailVisView){
            var self = contrailVisView.caller;
            self.resetTooltip();
        },
        dragStartHandler: function(params, contrailVisView) {
            var self = contrailVisView.caller;
            self.duplicatePathsDrawn = false;
            //self.stabilized = true;
            self.resetTooltip();
            self.removeUnderlayPathIds();
        },
        dragEndHandler: function(params, contrailVisView){
            var self = contrailVisView.caller;
            self.resetTooltip();
            //self.stabilized = false;
            self.duplicatePaths("dragEnd", contrailVisView);
        },
        stabilizedHandler: function(params, contrailVisView){
            var self = contrailVisView.caller;
            self.duplicatePaths("stabilized", contrailVisView);
            self.enableFreeflow(contrailVisView);

            /*if(self.stabilized == false) {
                self.duplicatePaths("stabilized");
                self.enableFreeflow();
                self.network.fit();
                self.stabilized = true;
            }
            //self.enableFreeflow();*/
        },
        stabilizationIterationsDoneHandler: function(params, contrailVisView){
            var self = contrailVisView.caller;
            //self.duplicatePaths("stabilized");
            //self.stabilized = false;
            self.enableFreeflow(contrailVisView);
        },
        showPopupHandler: function(params, contrailVisView) {
            var self = contrailVisView.caller;
            var elementId = params;
            var timer = null;
            var _network = contrailVisView.network;
            var tooltipConfig = null;
            var hoveredElement = _network.canvas.body.nodes[elementId];
            if(!hoveredElement) { //not a node. check if edges with elementId present.
                hoveredElement = _network.body.data.edges._data[elementId];
                tooltipConfig = hoveredElement.tooltipConfig;
                if(!hoveredElement || !tooltipConfig)
                    return;   //return if not a node or edge or no tooltip config
            } else {
                tooltipConfig = hoveredElement.options.tooltipConfig;
            }

            self.tooltipConfigWidth = tooltipConfig.dimension.width;
            self.tooltipConfigHeight = tooltipConfig.dimension.height;
            var ttPosition = $(".vis-network-tooltip").offset();
            var cursorPosition =
            _network.canvasToDOM({
                x:hoveredElement.x,
                y:hoveredElement.y
            });
            var visContainerPosition = $('.vis-network').offset();
            cursorPosition.x = cursorPosition.x + visContainerPosition.left;
            cursorPosition.y = cursorPosition.y + visContainerPosition.top;
            var diffPosition = {
                left: cursorPosition.x-20,
                top: cursorPosition.y
            };
            $('.popover').remove();
            $(".vis-network-tooltip").offset(diffPosition);
            var tt = $(".vis-network-tooltip").popover({
                trigger: 'hover',
                html: true,
                animation: false,
                placement: function (context, src) {
                    //src is div.vis-network-tooltip
                    //context is div.popover
                    var srcOffset = $(src).offset(),
                        srcWidth = $(src)[0].getBoundingClientRect().width,
                        bodyWidth = $('body').width(),
                        bodyHeight = $('body').height(),
                        tooltipWidth = self.tooltipConfigWidth;

                    $(context).addClass('popover-tooltip');
                    $(context).css({
                        'min-width': tooltipWidth + 'px',
                        'max-width': tooltipWidth + 'px'
                    });
                    $(context).addClass('popover-tooltip');

                    if (srcOffset.left > tooltipWidth) {
                        return 'left';
                    } else if (bodyWidth - (srcOffset.left) - srcWidth > tooltipWidth){
                        return 'right';
                    } else if (srcOffset.top > bodyHeight / 2){
                         return 'top';
                    } else {
                        return 'bottom';
                    }
                },

                title: function () {
                    return tooltipConfig.title;
                },
                content: function () {
                    return tooltipConfig.content;
                },
                container: $('body')
            })
            $(".vis-network-tooltip").popover("show");
            $('.popover').find('.btn').on('click', function() {
                var actionKey = $(this).data('action'),
                  actionsCallback = tooltipConfig.actionsCallback(tt);
                  actionsCallback[actionKey].callback();
                  $(".vis-network-tooltip").popover("hide");
            });
            $('.popover').find('i.icon-remove').on('click', function() {
                  $(".vis-network-tooltip").popover("hide");
            });
            $(".vis-network-tooltip").css({
                'width': '0px',
                'height': '0px',
                'background-color': 'transparent',
                'border': 'transparent',
                'box-shadow': '0px 0px rgba(255, 255, 255, 0)',
                'fill': 'transparent'
            });
        },

        doubleClickHandler: function(params, contrailVisView) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }

            $(".vis-network-tooltip").popover("hide");
            var self = contrailVisView.caller;
            if (params.nodes.length == 1) {
                if(getCookie('nodeDoubleClick') != "true" &&
                    (self.underlayPathIds.nodes.length > 0 ||
                    self.underlayPathIds.links.length > 0)) {
                    var textTemplate =
                    contrail.getTemplate4Id("monitor-infra-topology-reset-template");
                    cowu.createModal({
                        'modalId': 'resetTopologyModal',
                        'className': 'modal-500',
                        'title': 'Clear map/trace flow',
                        'btnName': 'Confirm',
                        'body': textTemplate(),
                        'onSave': function () {
                            self.expandNodes(params, contrailVisView);
                            $("#resetTopologyModal").modal('hide');
                        },
                        'onCancel': function () {
                            $("#resetTopologyModal").modal('hide');
                        }
                    });
                } else {
                    self.expandNodes(params, contrailVisView);
                }
            } else if(params.nodes.length == 0 && params.edges.length == 0) {
                self.resetConnectedElements();
                underlayUtils.removeUnderlayTabs(
                    self.rootView.childViewMap[ctwl.UNDERLAY_TOPOLOGY_PAGE_ID].childViewMap[ctwc.UNDERLAY_TABS_VIEW_ID]
                );
            }
        },
        refreshHandler: function(e, underlayGraphView) {
            var self = underlayGraphView;
            self.attributes.viewConfig.listModel.refreshData();
        },
        rearrangeHandler: function(e, underlayGraphView) {
            var self = underlayGraphView;
            var network = self.network;
            var nodeIds = network.getNodeIds();
            var nodes = [];
            _.each(nodeIds, function(id, idx) {
                if($.inArray(id, self.underlayPathIds.nodes) == -1) {
                    var node = network.findNode(id);
                    if(node && node.length == 1) {
                        node = node[0];
                        node.x = 0;
                        node.y = 0;
                        nodes.push(node);
                    }
                }
            });
            if(nodes.length > 0) {
                network.setOptions(self.visOptions);
                network.setData();
                self.duplicatePathsDrawn = false;
            }
        },
        getNavigationsConfig: function() {
            var self = this;
            var style = 'display             : inline-block; ' +
                        'width               : 15px; ' +
                        'height              : 15px; ' +
                        'right               : 10px; '+
                        'position            : absolute; ' +
                        'border              : 1px solid #efefef; ' +
                        'color               : #777; ' +
                        'font-family         : FontAwesome; ' +
                        'font-size           : 15px; ' +
                        'z-index             : 1; ' +
                        'padding             : 7px 7px; ' +
                        'cursor              : pointer; ' +
                        'line-height         : normal; ' +
                        'background-image    : none; ' +
                        'background-color    : #f9f9f9; ' +
                        'background-repeat   : no-repeat; ' +
                        'background-position : 2px 2px; ';

            //Zoom-in/out/reset always appears.
            //There are additional navigations required on map
            //Increase 40 pixels for 'top'
            var navConfig = {
                "rearrange": {
                    "id"    : "rearrange",
                    "style" : style + " top:130px; ",
                    "title" : "Reset Layout",
                    "class" : "icon-align-center",
                    "click" : function(params) {
                        self.rearrangeHandler(params, self);
                    }
                },
                "refresh": {
                    "id"    : "refresh",
                    "class" : "icon-repeat",
                    "style" : style + " top:170px; ",
                    "title" : "Refresh",
                    "click" : function(params) {
                        self.refreshHandler(params, self);
                    }
                }
            };
            return navConfig;
        },
        getContrailVisViewConfig: function(selectorId) {
            var self = this;
            return {
                elementId: selectorId,
                view: 'ContrailVisView',
                viewConfig: {
                    elementId: selectorId,
                    caller: self,
                    visOptions: self.visOptions,
                    events: self.getEventsConfig(),
                    navigations: self.getNavigationsConfig()
                }
            };
        },
        getNodeChangeEventsConfig: function() {
            var self = this;
            return [
                "change:image",
                "change:x",
                "change:y",
                "change:hidden"
            ];
        },
        getEdgeChangeEventsConfig: function() {
            var self = this;
            return [
                "change:color"
            ];
        }
    });

    return UnderlayGraphView;
});