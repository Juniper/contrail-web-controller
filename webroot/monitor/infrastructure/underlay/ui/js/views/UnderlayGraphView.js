/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view',
    'underlay-graph-model',
    'vis'
], function(_, ContrailView, UnderlayGraphModel, vis) {
    var UnderlayGraphView = ContrailView.extend({
        network: null,
        model : null,
        tooltipConfigWidth: 0,
        tooltipConfigHeight: 0,
        cursorPosition: {},
        style: {
            default: {
                color: "rgba(85,85,85,1)"
            },
            defaultDimlight: {
                color: "rgba(85,85,85,0.3)"
            },
            defaultSelected: {
                color: "rgba(73,138,185,1)"
            },
            selectedDimlight: {
                color: "rgba(73,138,185,0.3)"
            },
            errorNode: {
                color: "rgba(185,74,72,1)"
            }
        },
        cidMap: {
            "coreswitch": 1,
            "spine": 2,
            "tor": 3,
            "virtual-router": 4,
            "virtual-machine": 5
        },
        nodesDataSet: null,
        edgesDataSet: null,
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
            layout: {
                hierarchical: {
                    direction: 'UD',
                    sortMethod: 'directed'
                },
                improvedLayout: true
            },
            /*edges: {
                smooth: {
                    enabled: true,
                    type: "cubicBezier",
                    forceDirection: "horizontal",
                    roundness: .7 //not to be used with dynamic
                }
            }*/
            edges: {
                smooth: {
                    enabled: true,
                    type: "dynamic",
                    forceDirection: "none"
                }
            }
        },
        resetTooltip: function() {
            $(".vis-network-tooltip").popover('destroy');
            this.tooltipConfigWidth = 0;
            this.tooltipConfigHeight = 0;
        },
        render: function() {
            var self = this,
                graphTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_UNDERLAY_GRAPH_VIEW),
                selectorId = '#' + ctwl.UNDERLAY_GRAPH_ID,
                graphModel =
                new UnderlayGraphModel(this.getUnderlayGraphModelConfig());
            this.model = graphModel;
            this.listenTo(graphModel, "change", function(updatedGraphModel) {
                if (contrail.checkIfExist(updatedGraphModel.elementsDataObj)) {
                    self.addElementsToGraph(updatedGraphModel.elementsDataObj.elements,
                        updatedGraphModel);
                }
            });
            graphModel.fetchData();

            self.$el.html(graphTemplate());

            $("#"+ctwl.UNDERLAY_GRAPH_ID).data('graphModel', graphModel);
            var graphWidth = $(selectorId).width();
            var graphHeight = $(selectorId).height();
            this.nodesDataSet = new vis.DataSet([]);
            this.edgesDataSet = new vis.DataSet([]);
            var container = document.getElementById(ctwl.UNDERLAY_GRAPH_ID);
            this.network = new vis.Network(container, {
                    nodes: this.nodesDataSet,
                    edges: this.edgesDataSet
                },
                this.visOptions);
            var _network = this.network;
            this.network.on("blurNode", function(node){
                self.resetTooltip();
            });

            this.network.on("dragEnd", function(node){
                self.resetTooltip();
            });

            $(document).bind('mousemove',function(e) {
                self.cursorPosition = {
                    "left": e.pageX,
                    "top": e.pageY
                };
            });
            this.network.on("showPopup", function(elementId){
                var timer = null;
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
                var cursorPosition = self.cursorPosition;
                var diffPosition = {
                    top: cursorPosition.top,
                    left: cursorPosition.left - 20
                };
                $('.popover').remove();
                $(".vis-network-tooltip").offset(diffPosition);
                var tt = $(".vis-network-tooltip").popover({
                    trigger: 'hover',
                    html: true,
                    animation: false,
                    placement: function (context, src) {  //src is mouse position
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
            });

            this.network.on("click", function(params) {
                var parameters = params;
                timeout = setTimeout(function() {
                    var params = parameters;

                    if (params.nodes.length == 1) {
                        var clickedElement = _network.canvas.body.nodes[params.nodes[0]];
                        self.resetConnectedElements();
                        var node = self.nodesDataSet.get(params.nodes[0]);
                        node.icon.color = self.style.defaultSelected.color;
                        self.nodesDataSet.update(node);
                        var elementType = clickedElement.options.type;
                        switch (elementType) {
                            case 'PhysicalRouter':
                                var nodeDetails = clickedElement.options.nodeDetails;
                                if (nodeDetails['more_attributes']['ifTable'] == '-')
                                    nodeDetails['more_attributes']['ifTable'] = [];
                                    graphModel.selectedElement.set({
                                        'nodeType': ctwc.PROUTER,
                                        'nodeDetail': nodeDetails});
                                    graphModel.selectedElement.set({
                                        'nodeType': '',
                                        'nodeDetail': {}},{silent:true});
                                break;
                            case 'VirtualRouter':
                                var nodeDetails = clickedElement.options.nodeDetails;
                                graphModel.selectedElement.set({
                                    'nodeType': ctwc.VROUTER,
                                    'nodeDetail': nodeDetails});
                                graphModel.selectedElement.set({
                                    'nodeType': '',
                                    'nodeDetail': {}},{silent:true});
                                break;
                            case 'VirtualMachine':
                                var nodeDetails = clickedElement.options.nodeDetails;
                                graphModel.selectedElement.set({
                                    'nodeType': ctwc.VIRTUALMACHINE,
                                    'nodeDetail': nodeDetails});
                                graphModel.selectedElement.set({
                                    'nodeType': '',
                                    'nodeDetail': {}},{silent:true});
                                break;
                        }
                    } else if (params.edges.length == 1) {
                        var data = {};
                        var linkDetails = _network.body.data.edges._data[params.edges[0]].linkDetails;
                        var clickedElement = _network.canvas.body.edges[params.edges[0]];
                        self.resetConnectedElements();
                        var edge = self.edgesDataSet.get(params.edges[0]);
                        edge.color = self.style.defaultSelected.color;
                        self.edgesDataSet.update(edge);
                        var targetElement = clickedElement.to;
                        var sourceElement = clickedElement.from;
                        var endpoints = [sourceElement['options']['nodeDetails']['name'],
                            targetElement['options']['nodeDetails']['name']];
                        self.addHighlightToNodesAndLinks(
                            [targetElement['options']['nodeDetails'],
                            sourceElement['options']['nodeDetails']],
                            null,
                            graphModel);
                        var linkDetail = {};
                        linkDetail['endpoints'] = endpoints;
                        linkDetail['sourceElement'] = sourceElement['options']['nodeDetails'];
                        linkDetail['targetElement'] = targetElement['options']['nodeDetails'];
                        graphModel.selectedElement.set({
                            'nodeType': ctwc.UNDERLAY_LINK,
                            'nodeDetail': linkDetail});
                        graphModel.selectedElement.set({
                            'nodeType': '',
                            'nodeDetail': {}},{silent:true});

                    } else if (params.edges.length == 0 && params.nodes.length == 0) {
                        $(".vis-network-tooltip").popover("hide");
                    }
                    timeout = null;
                }, 300);
            });

            this.network.on("doubleClick", function(params) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                if (params.nodes.length == 1) {
                    self.removeLinkArrows();
                    var dblClickedElement = (_network.findNode(params.nodes[0]))[0];
                    var nodeDetails = dblClickedElement.options.nodeDetails;
                    var elementType = dblClickedElement.options.type;
                    switch (elementType) {
                        case 'PhysicalRouter':
                            var chassis_type = nodeDetails['chassis_type'];
                            if (chassis_type === "tor") {
                                graphModel.selectedElement.set({
                                'nodeType': ctwc.PROUTER,
                                'nodeDetail': nodeDetails});
                                var children = graphModel.getChildren(
                                    nodeDetails['name'], "virtual-router");
                                var adjList = _.clone(
                                    graphModel['underlayAdjacencyList']);
                                if (children.length > 0) {
                                    var childrenName = [];
                                    for (var i = 0; i < children.length; i++) {
                                        childrenName.push(children[i]["name"]);
                                        adjList[children[i]["name"]] = [];
                                    }
                                    adjList[nodeDetails['name']] = childrenName;
                                    graphModel['adjacencyList'] = adjList;
                                    var childElementsArray = self
                                        .createElementsFromAdjacencyList(graphModel);
                                    self.addElementsToGraph(childElementsArray,
                                        graphModel);
                                    self.markErrorNodes();
                                    self.addDimlightToConnectedElements();
                                    var thisNode = [nodeDetails];
                                    self.addHighlightToNodesAndLinks(thisNode, childElementsArray, graphModel);
                                    var graphData = {
                                        nodes: this.nodesDataSet,
                                        edges: this.edgesDataSet
                                    };
                                }
                            }
                            break;
                        case 'VirtualRouter':
                            graphModel.selectedElement.set({
                            'nodeType': ctwc.VROUTER,
                            'nodeDetail': nodeDetails});
                            var parentNode = null;
                            if(graphModel.underlayPathIds.length > 0) {
                                $.each(_network.getConnectedEdges(params.nodes[0]), function(idx, edge_id) {
                                    var connectedNodes = _network.getConnectedNodes(edge_id);
                                    var connectedNode0 = self.nodesDataSet.get(connectedNodes[0]);
                                    var connectedNode1 = self.nodesDataSet.get(connectedNodes[1]);
                                    if(connectedNode0 &&
                                      connectedNode0.nodeDetails.node_type == "physical-router") {
                                        parentNode = connectedNode0;
                                    } else if (connectedNode1 &&
                                      connectedNode1.nodeDetails.node_type == "physical-router") {
                                        parentNode = connectedNode1;
                                    }
                                });
                            }
                            var siblings = []; //vrouter siblings
                            if(parentNode !== null) {
                                siblings = graphModel.getChildren(parentNode.nodeDetails['name'],
                                "virtual-router");
                            }
                            var children = graphModel.getChildren(nodeDetails['name'],
                                "virtual-machine");
                            var newAdjList = {};
                            var oldAdjList = {};
                            if(graphModel['underlayPathIds'].length > 0) {
                                newAdjList = _.clone(graphModel['underlayAdjacencyList']);
                                oldAdjList = _.clone(graphModel['underlayAdjacencyList']);
                            }
                            else {
                                newAdjList = _.clone(graphModel['adjacencyList']);
                                oldAdjList = _.clone(graphModel['adjacencyList']);
                            }
                            if (siblings.length > 0) {
                                var siblingName = [];
                                for (var i = 0; i < siblings.length; i++) {
                                    if(siblings[i]["name"] !== dblClickedElement.options.nodeDetails.name) {
                                        siblingName.push(siblings[i]["name"]);
                                        newAdjList[siblings[i]["name"]] = [];
                                    }
                                }
                                newAdjList[parentNode.nodeDetails['name']] = siblingName;
                                oldAdjList = _.clone(newAdjList);
                                oldAdjList[parentNode.nodeDetails['name']] = [];
                            }
                            if (children.length > 0) {
                                var childrenName = [];
                                for (var i = 0; i < children.length; i++) {
                                    childrenName.push(children[i]["name"]);
                                    newAdjList[children[i]["name"]] = [];
                                }
                                newAdjList[nodeDetails['name']] = childrenName;
                            } else {
                                newAdjList = oldAdjList;
                            }
                            graphModel['adjacencyList'] = newAdjList;
                            var childElementsArray = self.createElementsFromAdjacencyList(graphModel);
                            self.addElementsToGraph(childElementsArray, graphModel);
                            self.addDimlightToConnectedElements();
                            var thisNode = [nodeDetails];
                            self.addHighlightToNodesAndLinks(thisNode, childElementsArray, graphModel);
                            self.markErrorNodes();
                            graphModel['adjacencyList'] = oldAdjList;
                            self.removeUnderlayPathIds();
                            graphModel['underlayPathIds'] = [];
                            break;
                    }
                }
            });

            // Drawing the underlay path and trace flow for a given flow
            graphModel.flowPath.on('change:nodes', function () {
                self.removeLinkArrows();
                var nodes = graphModel.flowPath.get('nodes');
                var links = graphModel.flowPath.get('links');
                if(nodes.length <=0 || links.length <= 0){
                    showInfoWindow("Cannot Map the path for selected flow", "Info");
                    self.resetTopology({
                        resetBelowTabs: false,
                        model: graphModel
                    });
                    return false;
                }
                highlightedElements = {
                    nodes: [],
                    links: []
                };
                var elementMap = graphModel['elementMap'];
                var adjList = graphModel.prepareData("virtual-router");
                var nodeNames = [];
                for(var i=0; i<nodes.length; i++) {
                    nodeNames.push(nodes[i].name);
                    if(!adjList.hasOwnProperty(nodes[i].name)) {
                        adjList[nodes[i].name] = [];
                    }
                }

                for (var i = 0; i < links.length; i++) {
                    var endpoints = links[i].endpoints;
                    var endpoint0 = endpoints[0];
                    var endpoint1 = endpoints[1];
                    if(adjList.hasOwnProperty(endpoint0)) {
                        if(adjList[endpoint0].indexOf(endpoint1) == -1)
                            adjList[endpoint0][adjList[endpoint0].length] = endpoint1;
                    }
                    if(adjList.hasOwnProperty(endpoint1)) {
                        if(adjList[endpoint1].indexOf(endpoint0) == -1)
                            adjList[endpoint1][adjList[endpoint1].length] = endpoint0;
                    }
                }
                graphModel['adjacencyList'] = adjList;
                var childElementsArray = self.createElementsFromAdjacencyList(graphModel);

                var tors = graphModel['tors'];
                for(var i=0; i<tors.length; i++) {
                    var tor = tors[i];
                    var torName = tor.name;
                    var virtualRouters = tor.children;
                    for(var vrName in virtualRouters) {
                        if(nodeNames.indexOf(vrName) === -1) {
                            var vr_id = elementMap.node[vrName];
                            for(var j=0; j<childElementsArray.length; j++) {
                                var childEl = childElementsArray[j];
                                if(null === childEl || typeof childEl === "undefined")
                                    continue;
                                if(childEl.id === vr_id) {
                                    childElementsArray[j] = null;
                                    break;
                                }
                            }
                        }
                    }
                }
                childElementsArray = childElementsArray.filter(function(n){ return n != undefined });
                for(var i=0; i<tors.length; i++) {
                    var tor = tors[i];
                    var torName = tor.name;
                    var virtualRouters = tor.children;
                    for(var vrName in virtualRouters) {
                        if(nodeNames.indexOf(vrName) === -1) {
                            var link = torName + "<->" + vrName;
                            var altLink = vrName + "<->" + torName;
                            var link_id = elementMap.link[link];
                            var alt_link_id = elementMap.link[altLink];
                            for(var j=0; j<childElementsArray.length; j++) {
                                var childEl = childElementsArray[j];
                                if(null === childEl || typeof childEl === "undefined")
                                    continue;
                                if(childEl.id === link_id ||
                                    childEl.id === alt_link_id) {
                                    childElementsArray[j] = null;
                                }
                            }
                        }
                    }
                }
                childElementsArray = childElementsArray.filter(function(n){ return n != undefined });
                self.addElementsToGraph(childElementsArray);
                self.markErrorNodes();
                $(".popover").popover().hide();
                var connectionWrapIds = [];
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
                        parentNode = self.nodesDataSet.get(elementMap.node[endpoint0]);
                    else {
                        parentNode = jsonPath(graphModel.nodes, '$[?(@.name=="' +
                            endpoint0 + '")]');
                        if (false !== parentNode && parentNode.length === 1) {
                            parentNode = parentNode[0];
                            var parentName = parentNode.name;
                            var parentNodeType = parentNode.node_type;
                            var currentEl = self.createNode(parentNode);
                            graphmodel.conElements.push(currentEl);
                            var currentElId = currentEl.id;
                            elementMap.node[parentName] = currentElId;
                        }
                    }
                    if(null !== childNodeExists && typeof childNodeExists !== "undefined")
                        childNode = self.nodesDataSet.get(elementMap.node[endpoint1]);
                    else {
                        childNode = jsonPath(graphModel.nodes, '$[?(@.name=="' +
                            endpoint0 + '")]');
                        if (false !== childNode && childNode.length === 1) {
                            childNode = childNode[0];
                            var childName = childNode.name;
                            var childNodeType = childNode.node_type;
                            var currentEl = self.createNode(childNode);
                            graphmodel.conElements.push(currentEl);
                            var currentElId = currentEl.id;
                            elementMap.node[childName] = currentElId;
                        }
                    }
                    var parentId = parentNode.id;
                    var parentNodeType = parentNode.nodeDetails.node_type;
                    var childNodeType = childNode.nodeDetails.node_type;
                    var childId = childNode.id;
                    var link_type = parentNodeType.split("-")[0][0] +
                        parentNodeType.split("-")[1][0] + '-' +
                        childNodeType.split("-")[0][0] +
                        childNodeType.split("-")[1][0];

                    var arrowPosition = "";
                    if(graphModel.elementMap.node[endpoint0] == parentId) {
                        arrowPosition = "to";
                    } else {
                        arrowPosition = "from";
                    }

                    var newLink = self.createLink(links[i], link_type, parentId, childId, true, arrowPosition);
                    var currentLinkId = newLink.id;
                    self.edgesDataSet.add(newLink);
                    elementMap.link[linkName] = currentLinkId;
                    elementMap.link[altLinkName] = currentLinkId;
                    connectionWrapIds.push(currentLinkId);
                }
                if(connectionWrapIds.length > 0) {
                    graphModel['underlayPathIds'] = connectionWrapIds;
                }
                // When the underlay path is same for earlier flow and
                // current flow change events are not triggering so we need to
                // reset the nodes and links to empty array once the path is plotted.
                graphModel['adjacencyList'] = graphModel['underlayAdjacencyList'];
                graphModel.flowPath.set('nodes',[], {silent: true});
                graphModel.flowPath.set('links',[], {silent: true});
            });

        },

        createLink: function(link, link_type, srcId, tgtId, shadowLink, arrowPosition, reverse) {
            var options;
            var linkElement;
            link.link_type = link_type;
            var id = UUIDjs.create().hex;
            var linkConfig = {
                id: id,
                from: srcId,
                to: tgtId,
                linkDetails: link,
                color: this.style.default.color
            };
            if(arrowPosition == "to") {
                linkConfig.arrows = {
                    to : {
                        enabled : true,
                        scaleFactor: 1
                    }
                };
            } else if(arrowPosition == "from") {
                linkConfig.arrows = {
                    from : {
                        enabled : true,
                        scaleFactor: 1
                    }
                };
            }
            if(true == shadowLink) {
                linkConfig.color = this.style.defaultSelected.color;
                linkConfig.width = 2;
                linkConfig.smooth = {
                    type: "curvedCW",
                    forceDirection: "vertical",
                    roundness: .2

                };
                linkConfig.dashes = true;
                /*linkConfig.shadow =
                {
                    enabled: true,
                    size: 10,
                    x: (reverse == true) ? -5 : 5,
                    y: (reverse == true) ? -5 : 5
                }*/
            }
            var tooltipConfig = this.getUnderlayTooltipConfig()['link'];
            var title = tooltipConfig.title(link);
            var content = tooltipConfig.content(link);
            var tooltipTmpl = contrail.getTemplate4Id(cowc.TMPL_UNDERLAY_ELEMENT_TOOLTIP)
            var tooltip = tooltipTmpl({
                title: title,
                content: content
            });
            var dummydiv = $( '<div id=' + id +' style="display:block;visibility:hidden"/>');
            $('body').append(dummydiv)
            dummydiv.append($(_.unescape(tooltip)));
            linkConfig.tooltipConfig = {
                title: title,
                content: content,
                dimension: {
                    width: $(dummydiv).find('.popover').width(),
                    height: $(dummydiv).find('.popover').height()
                }
            };
            linkConfig.title = "";
            $(dummydiv).empty();
            $(dummydiv).remove();
            dummydiv = $();
            delete dummydiv;
            return linkConfig;
        },

        createNode: function(node) {
            var level = 1;
            var nodeName = node['name'];
            var node_type = node.node_type;
            var chassis_type = node.chassis_type;
            var nodeConfig = {};
            nodeConfig.shape = 'icon';
            nodeConfig.font = {};
            nodeConfig.font.face = 'Arial, helvetica, sans-serif';
            nodeConfig.font.size = 10;
            nodeConfig.font.color = '#333'; //text color
            nodeConfig.font.strokeColor = '#333'; //text color
            nodeConfig.font.strokeWidth = 0.4; //text color
            nodeConfig.icon = {};
            nodeConfig.icon.face = 'contrailFonts';
            nodeConfig.icon.size = 40;
            nodeConfig.icon.color = this.style.default.color; //icon color
            nodeConfig.color = {};
            nodeConfig.color.hover = {};
            nodeConfig.color.hover.border = "red";
            nodeConfig.color.hover.background = "red";
            var labelNodeName = contrail.truncateText(nodeName, 20);
            switch (node_type) {
                case 'physical-router':
                    node_type = 'PhysicalRouter';
                    break;
                case 'virtual-router':
                    node_type = 'VirtualRouter';
                    break;
                case 'virtual-machine':
                    node_type = 'VirtualMachine';
                    break;
                case 'link':
                    node_type = 'link';
                    break;
            }
            switch (chassis_type) {
                case "coreswitch":
                    level = 2;
                    nodeConfig.icon.code = '\ue616';
                    chassis_type = 'router';
                    break;
                case "spine":
                    level = 3;
                    nodeConfig.icon.code = '\ue616';
                    chassis_type = 'router';
                    break;
                case "router":
                    level = 3;
                    nodeConfig.icon.code = '\ue616';
                    break;
                case "tor":
                    level = 4;
                    nodeConfig.icon.code = '\ue60c';
                    chassis_type = 'switch';
                    break;
                case "virtual-router":
                    level = 5;
                    nodeConfig.icon.code = '\ue612';
                    break;
                case "virtual-machine":
                    level = 6;
                    nodeConfig.icon.code = '\ue603';
                    if (node.hasOwnProperty('more_attributes') &&
                        node.more_attributes.hasOwnProperty('vm_name') &&
                        node.more_attributes.vm_name.trim() !== "" &&
                        node.more_attributes.vm_name.trim() !== "-") {
                        labelNodeName = contrail.truncateText(
                            node.more_attributes.vm_name.trim(), 10);
                    } else {
                        labelNodeName = contrail.truncateText(nodeName, 10);
                    }
                    refY = .9;
                    break;
                case "unknown":
                    nodeConfig.icon.code = '\ue602';
                    break;
            }
            nodeConfig.level = level;
            var id = UUIDjs.create().hex;
            nodeConfig.id = id;
            nodeConfig.label = labelNodeName;
            nodeConfig.nodeDetails = node;
            nodeConfig.type = node_type;
            var tooltipConfig = this.getUnderlayTooltipConfig()[node_type];
            var title = tooltipConfig.title(node);
            var content = tooltipConfig.content(node);
            var tooltipTmpl = contrail.getTemplate4Id(cowc.TMPL_UNDERLAY_ELEMENT_TOOLTIP)
            var tooltip = tooltipTmpl({
                title: title,
                content: content
            });
            var dummydiv = $( '<div id=' + id +' style="display:block;visibility:hidden"/>');
            $('body').append(dummydiv)
            dummydiv.append($(_.unescape(tooltip)));
            nodeConfig.tooltipConfig = {
                title: title,
                content: content,
                actionsCallback: tooltipConfig.actionsCallback,
                dimension: {
                    width: $(dummydiv).find('.popover').width(),
                    height: $(dummydiv).find('.popover').height()
                }
            };
            nodeConfig.title = "";
            $(dummydiv).empty();
            $(dummydiv).remove();
            dummydiv = $();
            delete dummydiv;
            return nodeConfig;

        },
        createElementsFromAdjacencyList: function(underlayGraphModel) {
            var elements = [];
            var linkElements = [];
            var self = this;
            var adjacencyList = underlayGraphModel.adjacencyList;
            var conElements = underlayGraphModel.connectedElements;
            var nodes = underlayGraphModel.nodes;
            var links = underlayGraphModel.links;
            var elMap = underlayGraphModel.elementMap;
            var nodesDataSet = this.nodesDataSet;
            var edgesDataSet = this.edgesDataSet;
            _.each(adjacencyList, function(edges, parentElementLabel) {
                if (null !== elMap["node"][parentElementLabel] &&
                    typeof elMap["node"][parentElementLabel] !== "undefined") {
                    var el = nodesDataSet.get(elMap["node"][parentElementLabel]);
                    if (null !== el && typeof el !== "undefined") {
                        elements.push(el);
                        return;
                    } else {
                        el = jsonPath(conElements, '$[?(@.id=="' +
                            elMap["node"][parentElementLabel] + '")]');
                        if (typeof el === "object" && el.length === 1) {
                            elements.push(el[0]);
                            return;
                        }
                    }
                }
                var parentNode = jsonPath(nodes, '$[?(@.name=="' +
                    parentElementLabel + '")]');
                if (false !== parentNode && parentNode.length === 1) {
                    parentNode = parentNode[0];
                    var parentName = parentNode.name;
                    var parentNodeType = parentNode.node_type;
                    elements.push(self.createNode(parentNode));
                    var currentEl = elements[elements.length - 1];
                    conElements.push(currentEl);
                    var currentElId = currentEl.id;
                    elMap.node[parentName] = currentElId;
                }
            });

            _.each(adjacencyList, function(edges, parentElementLabel) {
                var parentNode = jsonPath(nodes, '$[?(@.name=="' +
                    parentElementLabel + '")]');
                if (false !== parentNode && parentNode.length === 1) {
                    parentNode = parentNode[0];
                    var parentNodeType = parentNode.node_type;
                    var parentId = elMap.node[parentNode.name];
                    _.each(edges, function(childElementLabel) {
                        if (null !== elMap["link"][parentElementLabel + "<->" + childElementLabel] &&
                            typeof elMap["link"][parentElementLabel + "<->" + childElementLabel] !== "undefined") {
                            var linkEl = nodesDataSet.get(elMap["link"][parentElementLabel + "<->" + childElementLabel]);
                            if (null !== linkEl && typeof linkEl !== "undefined") {
                                linkElements.push(linkEl);
                                return;
                            } else {
                                linkEl = jsonPath(conElements, '$[?(@.id=="' +
                                    elMap["link"][parentElementLabel +
                                        '<->' + childElementLabel
                                    ] + '")]');
                                if (typeof linkEl === "object" &&
                                    linkEl.length === 1) {
                                    linkElements.push(linkEl[0]);
                                    return;
                                }
                            }
                        }
                        var childNode = jsonPath(nodes, '$[?(@.name=="' +
                            childElementLabel + '")]');
                        if (false !== childNode && childNode.length === 1) {
                            childNode = childNode[0];
                            var childNodeType = childNode.node_type;
                            var childId = elMap.node[childNode["name"]];
                            var link_type = parentNodeType.split("-")[0][0] +
                                parentNodeType.split("-")[1][0] + '-' +
                                childNodeType.split("-")[0][0] +
                                childNodeType.split("-")[1][0];
                            for (var i = 0; i < links.length; i++) {
                                var link = links[i];
                                if (link.endpoints[0] === link.endpoints[1])
                                    continue;
                                if ((link.endpoints[0] === childElementLabel &&
                                        link.endpoints[1] === parentElementLabel) ||
                                    (link.endpoints[1] === childElementLabel &&
                                        link.endpoints[0] === parentElementLabel)) {
                                    var linkName = childElementLabel +
                                        "<->" + parentElementLabel;
                                    var altLinkName = parentElementLabel +
                                        "<->" + childElementLabel;
                                    if ((null == elMap["link"][linkName] &&
                                            typeof elMap["link"][linkName] == "undefined") &&
                                        null == elMap["link"][altLinkName] &&
                                        typeof elMap["link"][altLinkName] == "undefined") {
                                        linkElements.push(self.createLink(
                                            link, link_type, parentId, childId));
                                        var currentLink =
                                            linkElements[linkElements.length - 1];
                                        var currentLinkId = currentLink.id;
                                        conElements.push(currentLink);
                                        elMap.link[linkName] = currentLinkId;
                                        elMap.link[altLinkName] = currentLinkId;
                                        break;
                                    }
                                }
                            }
                        }
                    });
                }
            });

            for(var i=0; i<links.length; i++) {
                var link = links[i];
                var endpoints = link.endpoints;
                var endpoint0 = endpoints[0];
                var endpoint1 = endpoints[1];
                var linkName = endpoint0 + "<->" + endpoint1;
                var altLinkName = endpoint1 + "<->" + endpoint0;
                var endpoint0Node = jsonPath(nodes, '$[?(@.name=="' + endpoint0 + '")]');
                if(false !== endpoint0Node && endpoint0Node.length === 1) {
                    endpoint0Node = endpoint0Node[0];
                } else {
                    continue;
                }
                var endpoint1Node = jsonPath(nodes, '$[?(@.name=="' + endpoint1 + '")]');
                if(false !== endpoint1Node && endpoint1Node.length === 1) {
                    endpoint1Node = endpoint1Node[0];
                } else {
                    continue;
                }
                var endpoint0NodeType = endpoint0Node.node_type;
                var endpoint1NodeType = endpoint1Node.node_type;
                var link_type = endpoint0NodeType.split("-")[0][0] +
                    endpoint0NodeType.split("-")[1][0] + '-' +
                    endpoint1NodeType.split("-")[0][0] +
                    endpoint1NodeType.split("-")[1][0];
                if(null != elMap["node"] && typeof elMap["node"] !== "undefined") {
                    if(null != elMap["node"][endpoint0] && typeof elMap["node"][endpoint0] !== "undefined" &&
                    null != elMap["node"][endpoint1] && typeof elMap["node"][endpoint1] !== "undefined") {
                        if(null == elMap["link"][linkName] && typeof elMap["link"][linkName] === "undefined" &&
                            null == elMap["link"][altLinkName] && typeof elMap["link"][altLinkName] === "undefined") {
                            linkElements.push(
                                self.createLink(link, link_type, elMap["node"][endpoint0], elMap["node"][endpoint1]));
                            var currentLink =
                                linkElements[linkElements.length - 1];
                            var currentLinkId = currentLink.id;
                            conElements.push(currentLink);
                            elMap.link[linkName] = currentLinkId;
                            elMap.link[altLinkName] = currentLinkId;
                        } else {
                            var el = jsonPath(linkElements, '$[?(@.id=="' + linkName + '")]');
                            var linkEl = edgesDataSet.get(elMap.link[linkName]);
                            if(false == el && null != linkEl) {
                                linkElements.push(linkEl);
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

            underlayGraphModel.connectedElements = conElements;
            // Links must be added after all the elements. This is because when the links
            // are added to the graph, link source/target
            // elements must be in the graph already.
            return elements.concat(linkElements);
        },
        getUnderlayGraphModelConfig: function() {
            var _this = this;
            return {
                generateElementsFn: function(response) {
                    this.initializeUnderlayModel(response);
                    var els = _this.createElementsFromAdjacencyList(this);
                    return {
                        elements: els,
                        nodes: this.nodes,
                        links: this.links
                    }
                },
                remote: {
                    ajaxConfig: {
                        url: ctwl.URL_UNDERLAY_TOPOLOGY,
                        type: 'GET'
                    },
                    successCallback: function(response, underlayGraphModel) {
                        $('#' + ctwl.GRAPH_LOADING_ID).hide();
                        if (contrail.checkIfExist(underlayGraphModel.elementsDataObj)) {
                            var elements = underlayGraphModel.elementsDataObj.elements;
                            if (elements.length > 0) {
                                _this.addElementsToGraph(underlayGraphModel.elementsDataObj.elements,
                                underlayGraphModel);
                                _this.markErrorNodes();
                            } else {
                                underlayGraphModel.empty = true;
                            }
                        }
                        return false;
                    }
                },
                vlRemoteConfig: {
                    vlRemoteList: [{
                        getAjaxConfig: function(response) {
                            return {
                                url: ctwl.URL_UNDERLAY_TOPOLOGY_REFRESH
                            };
                        },
                        successCallback: function(response, underlayGraphModel) {
                            _this.network.redraw();
                            if (response.topologyChanged) {
                                underlayGraphModel['tree'] = {};
                                var eleDataObj = underlayGraphModel.generateElements(
                                    $.extend(true, {}, response),
                                    underlayGraphModel.elementMap,
                                    underlayGraphModel.rankDir);
                                _this.addElementsToGraph(
                                    eleDataObj['elements'], underlayGraphModel);
                                _this.markErrorNodes();
                            }
                        }
                    }]
                },
                cacheConfig: {
                    ucid: ctwc.UNDERLAY_TOPOLOGY_CACHE
                },
            };
        },

        addElementsToGraph: function(elements, graphModel) {
            var network = this.network;
            var nodesDataSet = this.nodesDataSet;
            var edgesDataSet = this.edgesDataSet;
            var nodeIds = nodesDataSet.getIds();
            var edgeIds = edgesDataSet.getIds();
            _.each(nodeIds, function(id, idx) {
                nodesDataSet.remove(id);
            });
            _.each(edgeIds, function(id, idx) {
                edgesDataSet.remove(id);
            });
            for (var i = 0; i < elements.length; i++) {
                if (elements[i].hasOwnProperty('from') &&
                    elements[i].hasOwnProperty('to')) {
                    //its an edge
                    //check if already exists.
                    if (edgesDataSet.getIds().indexOf(elements[i].id) == -1) {
                        try {
                            edgesDataSet.add(elements[i]);
                        } catch (e) {

                        }
                    }
                } else {
                    //its a node
                    //check if already exists.
                    if (nodesDataSet.getIds().indexOf(elements[i].id) == -1) {
                        try {
                            nodesDataSet.add(elements[i]);
                        } catch (e) {

                        }
                    }
                }
            }
            network.setData({
                nodes: nodesDataSet,
                edges: edgesDataSet
            });
        },

        markErrorNodes: function() {
            var graphModel = this.model;
            var errorNodes = graphModel.getErrorNodes();
            var elementMap = graphModel.elementMap;
            var elementMapNodes = ifNull(elementMap['node'], {});
            if (!$.isArray(errorNodes)) {
                errorNodes = [errorNodes];
            }
            var errorNodesLen = errorNodes.length;
            for (var i = 0; i < errorNodesLen; i++) {
                if (elementMapNodes[errorNodes[i]] != null) {
                    var node = this.nodesDataSet.get(node_model_id);
                    node.icon.color = this.style.errorNode.color;
                    this.nodesDataSet.update(node);
                }
            }
        },

        removeLinkArrows: function() {
            var network = this.network;
            var _this = this;
            var graphModel = this.model;
            var pathIds = graphModel['underlayPathIds']
            var edgesDataSet = this.edgesDataSet;
            var edgeIds = edgesDataSet.getIds();
            var edges = [];
            for (var i = 0; i < pathIds.length; i++) {
                var edge = edgesDataSet.get(pathIds[i]);
                edge.arrows = {};
                edges.push(edge);
            }
            edgesDataSet.update(edges);
        },
        addDimlightToConnectedElements: function() {
            var network = this.network;
            var _this = this;
            var nodesDataSet = this.nodesDataSet;
            var edgesDataSet = this.edgesDataSet;
            var nodeIds = nodesDataSet.getIds();
            var edgeIds = edgesDataSet.getIds();
            var nodes = [];
            for (var i = 0; i < nodeIds.length; i++) {
                var node = nodesDataSet.get(nodeIds[i]);
                node.icon.color = _this.style.defaultDimlight.color;
                nodes.push(node);
            }
            nodesDataSet.update(nodes);
            var edges = [];
            for (var i = 0; i < edgeIds.length; i++) {
                var edge = edgesDataSet.get(edgeIds[i]);
                edge.color = _this.style.defaultDimlight.color;
                edges.push(edge);
            }
            edgesDataSet.update(edges);
        },
        resetConnectedElements: function() {
            var network = this.network;
            var _this = this;
            var nodesDataSet = this.nodesDataSet;
            var edgesDataSet = this.edgesDataSet;
            var nodeIds = nodesDataSet.getIds();
            var edgeIds = edgesDataSet.getIds();
            var nodes = [];
            for (var i = 0; i < nodeIds.length; i++) {
                var node = nodesDataSet.get(nodeIds[i]);
                node.icon.color = _this.style.default.color;
                nodes.push(node);
            }
            nodesDataSet.update(nodes);
            var edges = [];
            for (var i = 0; i < edgeIds.length; i++) {
                var edge = edgesDataSet.get(edgeIds[i]);
                edge.color = _this.style.default.color;
                edges.push(edge);
            }
            edgesDataSet.update(edges);
        },
        addHighlightToNodesAndLinks: function(nodes, els, graphModel) {
            var elMap = graphModel['elementMap'];
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
            var clickedElement = this.nodesDataSet.get(node_model_id);
            clickedElement.icon.color = this.style.defaultSelected.color;
            this.nodesDataSet.update(clickedElement);
        },

        addHighlightToLink: function(link_model_id) {
            var clickedElement = this.edgesDataSet.get(link_model_id);
            clickedElement.color = this.style.defaultSelected.color;
            this.edgesDataSet.update(clickedElement);
        },

        getClickEventConfig: function(underlayGraphModel) {
            var timeout;
            var _this = this;
            return {
                'blank:pointerdblclick': function(evt) {
                    return false;
                    evt.stopImmediatePropagation();
                    /*_this.resetTopology({resetBelowTabs: false,
                                   model: underlayGraphModel});*/
                },
                'cell:pointerdblclick': function(cellView, evt, x, y) {
                    var graphView =
                        monitorInfraUtils.getUnderlayGraphInstance();
                    evt.stopImmediatePropagation();
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                    var dblClickedElement = cellView.model,
                        elementType = dblClickedElement['attributes']['type'],
                        nodeDetails =
                        dblClickedElement['attributes']['nodeDetails'];
                    switch (elementType) {
                        case 'contrail.PhysicalRouter':
                            var chassis_type = nodeDetails['chassis_type'];
                            if (chassis_type === "tor") {
                                underlayGraphModel.selectedElement.set({
                                     'nodeType': ctwc.PROUTER,
                                     'nodeDetail': nodeDetails});
                                var children = underlayGraphModel.getChildren(
                                    nodeDetails['name'], "virtual-router");
                                var adjList = _.clone(
                                    underlayGraphModel['underlayAdjacencyList']);
                                if (children.length > 0) {
                                    var childrenName = [];
                                    for (var i = 0; i < children.length; i++) {
                                        childrenName.push(children[i]["name"]);
                                        adjList[children[i]["name"]] = [];
                                    }
                                    adjList[nodeDetails['name']] = childrenName;
                                    underlayGraphModel['adjacencyList'] = adjList;
                                    var childElementsArray = underlayGraphModel
                                        .createElementsFromAdjacencyList();
                                    _this.addElementsToGraph(childElementsArray);
                                    _this.markErrorNodes();
                                    _this.addDimlightToConnectedElements();
                                    var thisNode = [nodeDetails];
                                    _this.addHighlightToNodesAndLinks(
                                        thisNode.concat(children),
                                        childElementsArray,
                                        underlayGraphModel);
                                }
                            }
                            // Need to call the initClickevents again because
                            // to bind events to newly added elements like vRouters
                            cowu.bindPopoverInTopology(
                                _this.getUnderlayTooltipConfig(),
                                graphView);
                            $(".popover").popover().hide();
                            break;

                        case 'contrail.VirtualRouter':
                             /*
                              * setting the selected element triggers
                              * handler in underlaytabview which renders the
                              * tabs of vrouter(click handler)
                              */
                             graphView.model.selectedElement.set({
                                 'nodeType': ctwc.VROUTER,
                                 'nodeDetail': nodeDetails});
                            var model_id = $(dblClickedElement).attr('id');
                            var children = underlayGraphModel.getChildren(
                                nodeDetails['name'],
                                "virtual-machine");
                            var oldAdjList =
                                _.clone(underlayGraphModel['adjacencyList']);
                            var newAdjList =
                                _.clone(underlayGraphModel['adjacencyList']);
                            if (children.length > 0) {
                                var childrenName = [];
                                for (var i = 0; i < children.length; i++) {
                                    childrenName.push(children[i]["name"]);
                                    newAdjList[children[i]["name"]] = [];
                                }
                                newAdjList[nodeDetails['name']] = childrenName;
                            } else {
                                newAdjList = oldAdjList;
                            }
                            underlayGraphModel['adjacencyList'] = newAdjList;
                            var childElementsArray = underlayGraphModel
                                .createElementsFromAdjacencyList();
                            _this.addElementsToGraph(childElementsArray, underlayGraphModel);
                            _this.markErrorNodes();
                            _this.addDimlightToConnectedElements();
                            var thisNode = [nodeDetails];
                            _this.addHighlightToNodesAndLinks(
                                thisNode.concat(children),
                                childElementsArray,
                                underlayGraphModel);
                            underlayGraphModel['adjacencyList'] = oldAdjList;
                            cowu.bindPopoverInTopology(
                                _this.getUnderlayTooltipConfig(),
                                graphView);
                            $(".popover").popover().hide();
                            break;
                    }
                },

                'cell:pointerclick': function(cellView, evt, x, y) {
                    evt.stopImmediatePropagation();
                    _this.clearHighlightedConnectedElements();
                    _this.addDimlightToConnectedElements();
                    var clickedElement = cellView.model;
                    var elementType = clickedElement['attributes']['type'];
                    var nodeDetails = {};
                    if(elementType != ctwc.UNDERLAY_LINK) {
                        nodeDetails = clickedElement['attributes']['nodeDetails'];
                        _this.addHighlightToNodesAndLinks([nodeDetails], null,
                            underlayGraphModel);
                    }
                    var graph =
                        monitorInfraUtils.getUnderlayGraphInstance();
                    var data = {};
                    switch (elementType) {
                        case 'PhysicalRouter':
                            if (nodeDetails['more_attributes']['ifTable'] == '-')
                                nodeDetails['more_attributes']['ifTable'] = [];
                                graph.model.selectedElement.set({
                                    'nodeType': ctwc.PROUTER,
                                    'nodeDetail': nodeDetails});
                                graph.model.selectedElement.set({
                                    'nodeType': '',
                                    'nodeDetail': {}},{silent:true});
                            break;
                        case 'VirtualRouter':
                                graph.model.selectedElement.set({
                                    'nodeType': ctwc.VROUTER,
                                    'nodeDetail': nodeDetails});
                                graph.model.selectedElement.set({
                                    'nodeType': '',
                                    'nodeDetail': {}},{silent:true});
                            break;
                        case 'VirtualMachine':
                                graph.model.selectedElement.set({
                                    'nodeType': ctwc.VIRTUALMACHINE,
                                    'nodeDetail': nodeDetails});
                                graph.model.selectedElement.set({
                                    'nodeType': '',
                                    'nodeDetail': {}},{silent:true});
                            break;
                        case 'link':
                            var targetElement =
                                graph.model.getCell(
                                    clickedElement['attributes']['target']['id']);
                            var sourceElement =
                                graph.model.getCell(
                                    clickedElement['attributes']['source']['id']);
                            var endpoints = [sourceElement['attributes']['nodeDetails']['name'],
                                targetElement['attributes']['nodeDetails']['name']];
                            addHighlightToNodesAndLinks(
                                [targetElement['attributes']['nodeDetails'],
                                sourceElement['attributes']['nodeDetails']],
                                null,
                                underlayGraphModel);
                            var linkDetail = {};
                            linkDetail['endpoints'] = endpoints;
                            linkDetail['sourceElement'] = sourceElement;
                            linkDetail['targetElement'] = targetElement;
                            graph.model.selectedElement.set({
                                'nodeType': ctwc.UNDERLAY_LINK,
                                'nodeDetail': linkDetail});
                            graph.model.selectedElement.set({
                                'nodeType': '',
                                'nodeDetail': {}},{silent:true});
                            break;
                    }
                },

                'cell:pointerdown': function(cellView, evt, x, y) {
                    evt.stopImmediatePropagation();
                    _this.removeUnderlayPathIds();
                },
                'cell:pointerup': function(cellView, evt, x, y) {
                    evt.stopImmediatePropagation();
                    var ids = underlayGraphModel['underlayPathIds'];
                    var graphView =
                        monitorInfraUtils.getUnderlayGraphInstance();
                    monitorInfraUtils.showFlowPath(ids,
                        null, graphView.model);
                }
            };
        },

        getUnderlayTooltipConfig: function() {
            var _this = this;
            var graphModel = $("#"+ctwl.UNDERLAY_GRAPH_ID).data('graphModel');
            var tooltipTitleTmpl =
                contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP_TITLE),
                tooltipContentTmpl =
                contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP_CONTENT);
            return {
                PhysicalRouter: {
                    title: function(nodeDetails) {
                        return tooltipTitleTmpl({
                            name: nodeDetails['name'],
                            type: ctwl.TITLE_GRAPH_ELEMENT_PHYSICAL_ROUTER
                        });

                    },
                    content: function(nodeDetails) {
                        var actions = [], tooltipLblValues = [], ifLength = 0;
                        var iconClass = 'icon-contrail-router';
                        if (nodeDetails.chassis_type == 'tor') {
                            iconClass = 'icon-contrail-switch';
                        }
                        actions.push({
                            text: 'Configure',
                            iconClass: 'icon-cog'
                        });
                        ifLength = getValueByJsonPath(nodeDetails,
                            'more_attributes;ifTable', []).length;
                        tooltipLblValues.push({
                            label: 'Name',
                            value: nodeDetails['name']
                        });
                        if (nodeDetails['errorMsg'] != null) {
                            tooltipLblValues.push({
                                label: 'Events',
                                value: nodeDetails['errorMsg']
                            });
                        } else {
                            tooltipLblValues.push({
                                label: 'Interfaces',
                                value: ifLength
                            }, {
                                label: 'Management IP',
                                value: ifNull(nodeDetails['mgmt_ip'], '-')
                            });
                        }

                        return tooltipContentTmpl({
                            info: tooltipLblValues,
                            iconClass: iconClass,
                            actions: actions
                        });
                    },
                    actionsCallback: function(nodeDetails) {
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
                                graphModel.selectedElement.set({
                                    'nodeType': ctwc.PROUTER,
                                    'nodeDetail': nodeDetails});
                                graphModel.selectedElement.set({
                                    'nodeType': '',
                                    'nodeDetail': {}},{silent:true});
                            }
                        });

                        return actions;
                    }
                },
                VirtualRouter: {
                    title: function(nodeDetails) {
                        return tooltipTitleTmpl({
                            name: nodeDetails['name'],
                            type: ctwl.TITLE_GRAPH_ELEMENT_VIRTUAL_ROUTER
                        });
                    },
                    content: function(nodeDetails) {
                        var actions = [], instances = graphModel.VMs;
                        var vms = 0,
                            name = getValueByJsonPath(nodeDetails, 'name', '-');
                        for (var i = 0; i < instances.length; i++) {
                            if (instances[i]['more_attributes']['vrouter'] ===
                                name) {
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
                    actionsCallback: function(nodeDetails) {
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
                                graphModel.selectedElement.set({
                                    'nodeType': ctwc.VROUTER,
                                    'nodeDetail': nodeDetails});
                                graphModel.selectedElement.set({
                                    'nodeType': '',
                                    'nodeDetail': {}},{silent:true});
                            }
                        });
                        return actions;
                    }
                },
                VirtualMachine: {
                    title: function(nodeDetails) {
                        var virtualMachineName = getValueByJsonPath(nodeDetails,
                                'name', '-');
                        return tooltipTitleTmpl({
                            name: virtualMachineName,
                            type: ctwl.TITLE_GRAPH_ELEMENT_VIRTUAL_MACHINE
                        });
                    },
                    content: function(nodeDetails) {
                        var actions = [],
                            tooltipContent, tooltipLblValues = [];
                        var vmIp = "",
                            vn = "",
                            label, instanceName = "";
                        var instanceUUID = nodeDetails['name'];
                        var instances = graphModel.VMs;
                        for (var i = 0; i < instances.length; i++) {
                            if (instances[i].name === instanceUUID) {
                                var attributes = ifNull(instances[i]['more_attributes'], {}),
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
                            instanceName = nodeDetails['name'];
                        /*actions.push({
                            text: 'View',
                            iconClass: 'icon-external-link'
                        });*/

                        tooltipContent = {
                            iconClass: 'icon-contrail-virtual-machine font-size-30',
                            actions: actions
                        };
                        tooltipLblValues = [{
                            label: label,
                            value: instanceName
                        }];
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
                    },
                    /*dimension: {
                        width: 355
                    },
                    actionsCallback: function(nodeDetails) {
                        var actions = [];
                        actions.push({
                            callback: function(key, options) {
                                graphModel.selectedElement.set({
                                    'nodeType': ctwc.VIRTUALMACHINE,
                                    'nodeDetail': nodeDetails});
                                graphModel.selectedElement.set({
                                    'nodeType': '',
                                    'nodeDetail': {}},{silent:true});
                            }
                        });

                        return actions;
                    }*/
                },
                link: {
                    title: function(linkDetails) {
                        var graphModel = $("#"+ctwl.UNDERLAY_GRAPH_ID).data('graphModel');
                        var instances = graphModel['VMs'];
                        var instanceName1 = "";
                        var instanceName2 = "";
                        var endpoint1 = linkDetails.endpoints[0];
                        var endpoint2 = linkDetails.endpoints[1];
                        for (var i = 0; i < instances.length; i++) {
                            if (instances[i].name === endpoint1) {
                                instanceName1 =
                                    instances[i]['more_attributes']['vm_name'];
                            } else if (instances[i].name === endpoint1) {
                                instanceName2 =
                                    instances[i]['more_attributes']['vm_name'];
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
                    content: function(linkDetails) {
                        var local_interfaces = [];
                        var remote_interfaces = [];
                        if (linkDetails.hasOwnProperty('more_attributes') &&
                            "-" !== linkDetails.more_attributes &&
                            linkDetails.more_attributes.length > 0) {
                            var moreAttrs = linkDetails.more_attributes;
                            for (var i = 0; i < moreAttrs.length; i++) {
                                local_interfaces.push(moreAttrs[i].local_interface_name + " (" + moreAttrs[i].local_interface_index + ")");
                                remote_interfaces.push(moreAttrs[i].remote_interface_name + " (" + moreAttrs[i].remote_interface_index + ")");
                            }
                        }
                        data = [{
                            lbl: linkDetails.endpoints[0],
                            value: local_interfaces
                        }, {
                            lbl: linkDetails.endpoints[1],
                            value: remote_interfaces
                        }];
                        return tooltipContentTmpl({
                            info: data,
                            iconClass: 'icon-resize-horizontal'
                        });
                    },
                    /*dimension: {
                        width: 400
                    }*/
                }

            };
        },

        resetTopology: function(options) {
            var underlayGraphModel = options['model'];
            this.removeUnderlayPathIds();
            underlayGraphModel['underlayPathIds'] = [];
            this.clearHighlightedConnectedElements();
            var adjList = _.clone(underlayGraphModel['underlayAdjacencyList']);
            underlayGraphModel['adjacencyList'] = adjList;
            var childElementsArray =
                this.createElementsFromAdjacencyList(underlayGraphModel);
            this.addElementsToGraph(childElementsArray, underlayGraphModel);
            this.markErrorNodes();
            if (options['resetBelowTabs'] == true) {
                monitorInfraUtils.removeUnderlayTabs();
            }
        },

        removeUnderlayPathIds: function() {
            var graphModel = $("#"+ctwl.UNDERLAY_GRAPH_ID).data('graphModel');
            var linkIds = graphModel['underlayPathIds'];
            if(linkIds.length > 0) {
                self.edgesDataSet.remove(linkIds[i]);
            }
        },

        clearHighlightedConnectedElements: function() {
            /*$('div.font-element')
                .removeClass('elementHighlighted')
                .removeClass('dimHighlighted');
            $('g.element')
                .removeClassSVG('elementHighlighted')
                .removeClassSVG('dimHighlighted');
            $('div.font-element')
                .css('fill', "")
                .css('stroke', "");
            $('div.font-element')
                .find('i')
                .css("color", "#555");
            $('g.element').find('text').css('fill', "#393939");
            $('g.element').find('rect').css('fill', "#393939");

            $('g.link')
                .removeClassSVG('elementHighlighted')
                .removeClassSVG('dimHighlighted');
            $("g.link").find('path.connection')
                .css("stroke", "#393939")
                .css("opacity", "0.6")
            $("g.link").find('path.marker-source')
                .css("fill", "#393939")
                .css("stroke", "#393939");
            $("g.link").find('path.marker-target')
                .css("fill", "#393939")
                .css("stroke", "#393939");
            $("g.link").find('path.connection-wrap')
                .css("opacity", "")
                .css("fill", "")
                .css("stroke", "");*/
            this.markErrorNodes();
        },

        getUnderlayGraphViewConfig: function(underlayGraphModel, selectorId) {
            return {
                el: $(selectorId),
                model: underlayGraphModel,
                tooltipConfig: this.getUnderlayTooltipConfig(),
                //clickEvents: this.getClickEventConfig(underlayGraphModel),
                emptyCallback: function(contrailGraphModel) {
                    var notFoundTemplate =
                        contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                        notFoundConfig =
                        $.extend(true, {}, cowc.DEFAULT_CONFIG_NOT_FOUND_PAGE, {
                            iconClass: false,
                            defaultErrorMessage: false,
                            defaultNavLinks: false,
                            title: ctwm.NO_PHYSICALDEVICES
                        });
                    $(selectorId).html(notFoundTemplate(notFoundConfig));
                },
                failureCallback: function(contrailGraphModel) {
                    var xhr = contrailGraphModel.errorList[0],
                        notFoundTemplate =
                        contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                        notFoundConfig =
                        $.extend(true, {}, cowc.DEFAULT_CONFIG_ERROR_PAGE, {
                            errorMessage: xhr.responseText
                        });

                    if (!(xhr.status === 0 && xhr.statusText === 'abort')) {
                        $(selectorId).html(notFoundTemplate(notFoundConfig));
                    }
                }
            }
        }
    });
    return UnderlayGraphView;
});

