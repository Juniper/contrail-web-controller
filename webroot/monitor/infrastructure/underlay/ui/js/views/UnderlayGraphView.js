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
        underlayPathIds: {
            nodes: [],
            links: []
        },
        duplicatePathsDrawn: false,
        tooltipConfigWidth: 0,
        tooltipConfigHeight: 0,
        cursorPosition: {},
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
                shape: 'icon',
                icon: {
                    face: 'contrailFonts',
                    size: 40,
                    color: "rgba(85,85,85,.9)"
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
        enableFreeflow: function() {
            self.network.setOptions({physics:{enabled: false}, layout: {hierarchical: {enabled:false}}});
        },
        resetTooltip: function() {
            $(".vis-network-tooltip").popover('destroy');
            this.tooltipConfigWidth = 0;
            this.tooltipConfigHeight = 0;
        },
        removeUnderlayEffects: function() {
            monitorInfraUtils.removeUndelrayFlowInfoFromBreadCrumb();
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
                graphModel =
                new UnderlayGraphModel(this.getUnderlayGraphModelConfig());
            self.$el.html(graphTemplate());
            $("#" + ctwl.TOP_CONTENT_CONTAINER).addClass("underlay-container");
            $("#" + ctwl.TOP_CONTENT_CONTAINER).css('border-bottom', '8px solid #fafafa');
            $('#' + ctwl.TOP_CONTENT_CONTAINER).resizable({
                handles: 's',
                minHeight: 260,
                resize: function(e, ui) {
                    var parent = ui.element.parent();
                    var remainingSpace =
                        parent.height() - ui.element.outerHeight(),
                        divTwo = $('#' + ctwl.BOTTOM_CONTENT_CONTAINER),
                        divTwoHeight = (remainingSpace -
                            (divTwo.outerHeight() - divTwo.height()))/parent.height()*100+"%";
                    divTwo.height(divTwoHeight);
                    self.network.setSize(
                        ui.element.outerWidth() + "px",
                        ui.element.outerHeight() + "px");

                    self.network.redraw(); self.network.fit();
                },
            });
            $("#"+ctwl.UNDERLAY_GRAPH_ID).data('graphModel', graphModel);
            this.model = graphModel;
            this.model.listenTo(graphModel, "change", function (updatedGraphModel) {
                self.populateModelAndAddToGraph(updatedGraphModel.attributes);
            });

            $('body').on("click", '#flow-info span.reset', function () {
                self.resetTopology({
                    resetBelowTabs: true
                });
                self.removeUnderlayEffects();
            });
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
            var rearrange = $('<div id="rearrange" style="display:inline-block; width:15px; height:15px; background-image:none; top:130px; right:10px; position:absolute; background-color:#f9f9f9; border:1px solid #efefef; color:#777; font-family:FontAwesome; font-size:15px; z-index:1; padding: 7px 7px; line-height:normal; background-position:2px 2px; cursor:pointer; background-repeat:no-repeat" title="Reset Layout"><i class="icon-align-center" /></div>');
            $(rearrange).on("click", function(){
                var nodeIds = self.nodesDataSet.getIds();
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
                    _network.setOptions(self.visOptions);
                    _network.setData({
                        nodes: self.nodesDataSet,
                        edges: self.edgesDataSet
                    });
                    self.duplicatePathsDrawn = false;
                }
            });
            $('.vis-navigation').append(rearrange);
            var resetTopo = $('<div style="display:inline-block; width:15px; height:15px; background-image:none; top:170px; right:10px; position:absolute; background-color:#f9f9f9; border:1px solid #efefef; color:#777; font-family:FontAwesome; font-size:15px; z-index:1; padding: 7px 7px; line-height:normal; background-position:2px 2px; cursor:pointer; background-repeat:no-repeat" title="Reset Topology"><i class="icon-play-circle" /></div>');
            $(resetTopo).on("click", function(){
                self.resetTopology({
                    resetBelowTabs: true,
                    restorePosition: false
                });
                self.removeUnderlayEffects();
            });
            $('.vis-navigation').append(resetTopo);

            var _network = this.network;
            window.network = _network;
            window.view = this;
            this.network.on("blurNode", function(node){
                self.resetTooltip();
            });

            this.network.on("dragStart", function(node){
                self.duplicatePathsDrawn = false;
                self.resetTooltip();
                self.removeUnderlayPathIds();
            });
            this.network.on("dragEnd", function(node){
                self.resetTooltip();
                self.duplicatePaths("dragEnd");
            });
            this.network.on("stabilized", function(params){
                self.duplicatePaths("stabilized");
                self.enableFreeflow();
            });
            this.network.on("stabilizationIterationsDone", function(params){
                self.enableFreeflow();
            });
            this.network.on("showPopup", function(elementId) {
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
                var cursorPosition = 
                self.network.canvasToDOM({
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
            });

            this.network.on("click", function(params) {
                var parameters = params;
                timeout = setTimeout(function() {
                    if($("#resetTopologyModal").is(":visible")) {
                        return;
                    }
                    var params = parameters;

                    if (params.nodes.length == 1) {
                        var clickedElement = _network.canvas.body.nodes[params.nodes[0]];
                        //self.resetConnectedElements();
                        self.addDimlightToConnectedElements();
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
                        //self.resetConnectedElements();
                        self.addDimlightToConnectedElements();
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
                $(".vis-network-tooltip").popover("hide");
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
                                self.underlayPathIds.nodes = [];
                                self.underlayPathIds.links = [];
                                self.removeUnderlayEffects();
                                self.expandNodes(params);
                                $("#resetTopologyModal").modal('hide');
                            },
                            'onCancel': function () {
                                $("#resetTopologyModal").modal('hide');
                            }
                        });
                    } else {
                        self.expandNodes(params)
                    }
                } else if(params.nodes.length == 0 && params.edges.length == 0) {
                    self.resetConnectedElements();
                    monitorInfraUtils.removeUnderlayTabs(
                        self.rootView.childViewMap[ctwc.UNDERLAY_TABS_VIEW_ID]
                    );
                }
            });

            // Drawing the underlay path and trace flow for a given flow
            graphModel.flowPath.on('change:nodes', function () {
                var nodes = graphModel.flowPath.get('nodes');
                var links = graphModel.flowPath.get('links');
                if(nodes.length <=0 || links.length <= 0){
                    graphModel.flowPath.set('nodes',graphModel.flowPath._previousAttributes.nodes, {silent: true});
                    graphModel.flowPath.set('links',graphModel.flowPath._previousAttributes.links, {silent: true});
                    showInfoWindow("Cannot find the underlay path for selected flow", "Info");
                    return false;
                }
                if(_.isEqual(graphModel.flowPath._previousAttributes.nodes, 
                    graphModel.flowPath.attributes.nodes) &&
                    _.isEqual(graphModel.flowPath._previousAttributes.links,
                    graphModel.flowPath.attributes.links))
                    return false;

                self.resetTopology({
                    resetBelowTabs: true,
                });

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
                            graphModel.connectedElements.push(currentEl);
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
                            graphModel.connectedElements.push(currentEl);
                            var currentElId = currentEl.id;
                            elementMap.node[childName] = currentElId;
                        }
                    }
                }
                // When the underlay path is same for earlier flow and
                // current flow change events are not triggering so we need to
                // reset the nodes and links to empty array once the path is plotted.
                graphModel["elementMap"] = elementMap;
                graphModel['adjacencyList'] = graphModel['underlayAdjacencyList'];
                //graphModel.flowPath.set('nodes',[], {silent: true});
                //graphModel.flowPath.set('links',[], {silent: true});
            });
            $(".vis-button.vis-zoomIn").attr('title', 'Zoom In');
            $(".vis-button.vis-zoomOut").attr('title', 'Zoom Out');
            $(".vis-button.vis-zoomExtends").attr('title', 'Zoom Reset');
        },
        duplicatePaths: function(eventName) {
            var self = this;

            if(self.model.flowPath.attributes.nodes.length > 0 &&
                self.model.flowPath.attributes.links.length > 0 &&
                self.duplicatePathsDrawn == false) {
                self.duplicatePathsDrawn = true;
                if(self.underlayPathIds.nodes.length > 0) {
                    _.each(self.underlayPathIds.nodes, function(id, idx) {
                        var node = self.nodesDataSet.get(id);
                        if(node) {
                            self.nodesDataSet.remove(node);
                        }
                    });
                }
                if(self.underlayPathIds.links.length > 0) {
                    _.each(self.underlayPathIds.links, function(id, idx) {
                        var edge = self.edgesDataSet.get(id);
                        if(edge) {
                            self.edgesDataSet.remove(edge);
                        }
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
                var links = self.model.flowPath.attributes.links;
                var elementMap = self.model.elementMap;
                for (var i = 0; i < links.length; i++) {
                    var endpoints = links[i].endpoints;
                    var endpoint0 = endpoints[0];
                    var endpoint1 = endpoints[1];
                    var linkName = endpoint0 + "<->" + endpoint1;
                    var altLinkName = endpoint1 + "<->" + endpoint0;
                    var link = elementMap.link[linkName];
                    var existingLink = self.edgesDataSet.get(link);

                    var parentNode = null, childNode = null;
                    if(existingLink.from == elementMap.node[endpoint0]) {
                        parentNode = self.nodesDataSet.get(elementMap.node[endpoint0]);
                        childNode = self.nodesDataSet.get(elementMap.node[endpoint1]);
                    } else {
                        parentNode = self.nodesDataSet.get(elementMap.node[endpoint1]);
                        childNode = self.nodesDataSet.get(elementMap.node[endpoint0]);
                    }
                    if(parentNode == null || childNode == null)
                        continue;
                    var parentId = parentNode.id;
                    var childId = childNode.id;
                    var parentNodeType = parentNode.nodeDetails.node_type;
                    var childNodeType = childNode.nodeDetails.node_type;
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

                    var parentNodeElement = self.network.findNode(parentId);
                    parentNodeElement = parentNodeElement[0];
                    var childNodeElement = self.network.findNode(childId);
                    childNodeElement = childNodeElement[0];
                    var newParentNode = null, newChildNode = null;

                    if(dupNodes.hasOwnProperty(parentNode.nodeDetails.name)) {
                        newParentNode = dupNodes[parentNode.nodeDetails.name].data;
                    } else {
                        newParentNode = self.createNode(parentNode.nodeDetails);
                        newParentNode.x = parentNodeElement.x-7;
                        newParentNode.y = parentNodeElement.y-7;
                        /*if(parentNodeElement.x > childNodeElement.x &&
                            childNodeElement.y > parentNodeElement.y) {
                            newParentNode.x = parentNodeElement.x - 5;
                            newParentNode.y = parentNodeElement.y + 5;
                        } else if(parentNodeElement.x < childNodeElement.x &&
                            parentNodeElement.y < childNodeElement.y) {
                            newParentNode.x = parentNodeElement.x + 5;
                            newParentNode.y = parentNodeElement.y + 5;
                        }*/
                        newParentNode.hidden = true;
                        dupNodes[parentNode.nodeDetails.name] = {};
                        dupNodes[parentNode.nodeDetails.name]["id"]= newParentNode.id;
                        dupNodes[parentNode.nodeDetails.name]["data"]= newParentNode;
                        if($.inArray(newParentNode.id, underlayPathIds.nodes) == -1)
                            underlayPathIds.nodes.push(newParentNode.id);
                        self.nodesDataSet.add(newParentNode);
                    }

                    if(dupNodes.hasOwnProperty(childNode.nodeDetails.name)) {
                        newChildNode = dupNodes[childNode.nodeDetails.name].data;
                    } else {
                        newChildNode = self.createNode(childNode.nodeDetails);
                        newChildNode.x = childNodeElement.x-7;
                        newChildNode.y = childNodeElement.y-7;
                        /*if(parentNodeElement.x > childNodeElement.x &&
                            childNodeElement.y > parentNodeElement.y) {
                            newChildNode.x = childNodeElement.x + 5;
                            newChildNode.y = childNodeElement.y - 5;
                        } else if(parentNodeElement.x < childNodeElement.x &&
                            parentNodeElement.y < childNodeElement.y) {
                            newChildNode.x = childNodeElement.x - 5;
                            newChildNode.y = childNodeElement.y - 5;
                        }*/
                        newChildNode.hidden = true;
                        dupNodes[childNode.nodeDetails.name] = {};
                        dupNodes[childNode.nodeDetails.name]["id"]= newChildNode.id;
                        dupNodes[childNode.nodeDetails.name]["data"]= newChildNode;
                        if($.inArray(newChildNode.id, underlayPathIds.nodes) == -1)
                            underlayPathIds.nodes.push(newChildNode.id);
                        self.nodesDataSet.add(newChildNode);
                    }

                    var newLink = self.createLink(_.clone(links[i]), link_type,
                        newParentNode.id, newChildNode.id, arrowPosition, eventName);
                    var currentLinkId = newLink.id;
                    self.edgesDataSet.add(newLink);
                    if($.inArray(currentLinkId, underlayPathIds.links) == -1)
                        underlayPathIds.links.push(currentLinkId);
                    dupLinks[parentNode.nodeDetails.name+ "<->" + childNode.nodeDetails.name] = currentLinkId;
                    dupLinks[childNode.nodeDetails.name+ "<->" + parentNode.nodeDetails.name] = currentLinkId;
                }
                self.underlayPathIds = underlayPathIds;
            }
        },
        clearFlowPath: function() {
            graphModel.flowPath.set('nodes',[], {silent: true});
            graphModel.flowPath.set('links',[], {silent: true});
        },
        expandNodes: function (params) {
            var self = this;
            var _network = self.network;
            var graphModel = self.model;
            self.clearFlowPath();
            self.removeUnderlayPathIds();
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
                            self.addElementsToGraph(childElementsArray);
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
                    if(self.underlayPathIds.nodes.length > 0 ||
                        self.underlayPathIds.links.length > 0) {
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
                    if(parentNode != null) {
                        siblings = graphModel.getChildren(parentNode.nodeDetails['name'],
                        "virtual-router");
                    }
                    var children = graphModel.getChildren(nodeDetails['name'],
                        "virtual-machine");
                    var newAdjList = {};
                    var oldAdjList = {};
                    if(self.underlayPathIds.nodes.length > 0 ||
                        self.underlayPathIds.links.length > 0) {
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
                    self.addElementsToGraph(childElementsArray);
                    self.addDimlightToConnectedElements();
                    var thisNode = [nodeDetails];
                    self.addHighlightToNodesAndLinks(thisNode, childElementsArray, graphModel);
                    self.markErrorNodes();
                    graphModel['adjacencyList'] = oldAdjList;
                    self.clearFlowPath();
                    self.removeUnderlayPathIds();
                    break;
            }
        },

        createLink: function(link, link_type, srcId, tgtId, arrowPosition, eventName) {
            var options;
            var linkElement;
            link.link_type = link_type;
            var id = UUIDjs.create().hex;
            var linkConfig = {
                id: id,
                from: srcId,
                to: tgtId,
                linkDetails: link
            };
            if(arrowPosition == "from" ||
                arrowPosition == "to") {
                if(self.network.getSelectedNodes().length > 0 ||
                    self.network.getSelectedEdges().length > 0) {
                    if(eventName == "dragEnd")
                        linkConfig.color = this.style.flowPathDefault.color;
                    else
                        linkConfig.color = this.style.flowPathDimlight.color;
                } else {
                    linkConfig.color = this.style.flowPathDefault.color;
                }
                if(arrowPosition == "to") {
                    linkConfig.arrows = {
                        to : {
                            enabled : true,
                            scaleFactor: .6
                        }
                    };
                } else if(arrowPosition == "from") {
                    linkConfig.arrows = {
                        from : {
                            enabled : true,
                            scaleFactor: .6
                        }
                    };
                }
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
            /*nodeConfig.shape = 'icon';
            nodeConfig.font = {};
            nodeConfig.font.face = 'Arial, helvetica, sans-serif';
            nodeConfig.font.size = 10;
            nodeConfig.font.color = '#333'; //text color
            nodeConfig.font.strokeColor = '#333'; //text color
            nodeConfig.font.strokeWidth = 0.4; //text color*/
            nodeConfig.icon = {};
            /*nodeConfig.icon.face = 'contrailFonts';
            nodeConfig.icon.size = 40;
            nodeConfig.icon.color = this.style.default.color; //icon color*/
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
                    null != elMap["node"][endpoint1] && typeof elMap["node"][endpoint1] !== "undefined" &&
                    null != adjacencyList[endpoint0] &&
                    typeof adjacencyList[endpoint0] !== "undefined" &&
                    null != adjacencyList[endpoint1] &&
                    typeof adjacencyList[endpoint1] !== "undefined") {
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
                            var el = jsonPath(linkElements, '$[?(@.id=="' + elMap.link[linkName] + '")]');
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

            /*for(var i=0; i<links.length; i++) {
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
                if(endpoint0NodeType == "virtual-router" ||
                    endpoint1NodeType == "virtual-router" ||
                    endpoint0NodeType == "virtual-machine" ||
                    endpoint1NodeType == "virtual-machine")
                    continue;
                var link_type = endpoint0NodeType.split("-")[0][0] +
                    endpoint0NodeType.split("-")[1][0] + '-' +
                    endpoint1NodeType.split("-")[0][0] +
                    endpoint1NodeType.split("-")[1][0];
                if(null == elMap["node"][endpoint0]) {
                    var currentEl = self.createNode(endpoint0Node);
                    elements.push(currentEl);
                    var currentElId = currentEl.id;
                    elMap.node[endpoint0] = currentElId;
                }
                if(null == elMap["node"][endpoint1]) {
                    var currentEl = self.createNode(endpoint1Node);
                    elements.push(currentEl);
                    var currentElId = currentEl.id;
                    elMap.node[endpoint1] = currentElId;
                }
                linkElements.push(
                    self.createLink(link, link_type, elMap["node"][endpoint0], elMap["node"][endpoint1]));
                var currentLink =
                    linkElements[linkElements.length - 1];
                var currentLinkId = currentLink.id;

                elMap.link[linkName] = currentLinkId;
                elMap.link[altLinkName] = currentLinkId;
            }*/
            underlayGraphModel.elementMap = elMap;
            underlayGraphModel.connectedElements = conElements;
            // Links must be added after all the elements. This is because when the links
            // are added to the graph, link source/target
            // elements must be in the graph already.
            return elements.concat(linkElements);
        },
        populateModelAndAddToGraph: function(response) {
            $('#' + ctwl.GRAPH_LOADING_ID).hide();
            this.model.initializeUnderlayModel(response);
            var elements = this.createElementsFromAdjacencyList(this.model);
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
        getUnderlayGraphModelConfig: function() {
            var _this = this;
            return {
                remote: {
                    ajaxConfig: {
                        url: ctwl.URL_UNDERLAY_TOPOLOGY,
                        type: 'GET'
                    },
                    failureCallback: function(response, model) {
                        model['tree'] = {};
                        _this.populateModelAndAddToGraph(null);
                    }
                },
                vlRemoteConfig: {
                    vlRemoteList: [{
                        getAjaxConfig: function(response) {
                            return {
                                url: ctwl.URL_UNDERLAY_TOPOLOGY_REFRESH
                            };
                        },
                        successCallback: function(response, model) {
                            _this.network.redraw();
                            if (response.topologyChanged) {
                                model['tree'] = {};
                                _this.populateModelAndAddToGraph(response);
                            }
                        },
                        failureCallback: function(response, model) {
                            $(".vis-network-tooltip").popover('destroy');
                            model['tree'] = {};
                            _this.populateModelAndAddToGraph(null);
                        }
                    }]
                }
                /*cacheConfig: {
                    ucid: ctwc.UNDERLAY_TOPOLOGY_CACHE
                },*/
            };
        },

        addElementsToGraph: function(elements, restorePosition) {
            var network = this.network;
            var nodesDataSet = this.nodesDataSet;
            var edgesDataSet = this.edgesDataSet;
            var nodeIds = nodesDataSet.getIds();
            var edgeIds = edgesDataSet.getIds();
            var mapPositions = {};
            var newElementIds = jsonPath(elements, "$..id");

            _.each(nodeIds, function(id, idx) {
                if(newElementIds.indexOf(id) == -1) {
                    nodesDataSet.remove(id);
                } else {
                    if(false !== restorePosition) {
                        var node = network.findNode(id);
                        if(node && node.length == 1) {
                            node = node[0];
                            mapPositions[id] = {};
                            mapPositions[id] = {
                                x: node.x,
                                y: node.y
                            }
                        }
                    }
                }
            });
            _.each(edgeIds, function(id, idx) {
                if(newElementIds.indexOf(id) == -1) {
                    edgesDataSet.remove(id);
                }
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
                            var parent = elements[i].nodeDetails.parent;
                            if(parent) {
                                var parentElId = 
                                    this.model.elementMap.node[parent];
                                if(null !== parentElId) {
                                    var parentEl =
                                    nodesDataSet.get(parentElId);
                                    if(parentEl && !isNaN(parentEl.x) &&
                                        !isNaN(parentEl.y)) {
                                        elements[i].x = parentEl.x;
                                        elements[i].y = parentEl.y +
                                        (this.visOptions.layout
                                            .hierarchical.levelSeparation-20);
                                    } else {
                                        parentEl = this.network.findNode(parentElId);
                                        if(parentEl && parentEl.length == 1 &&
                                            JSON.stringify(mapPositions) !== "{}") {
                                            parentEl = parentEl[0];
                                            if(parentEl && !isNaN(parentEl.x) &&
                                                !isNaN(parentEl.y)) {
                                                elements[i].x = parentEl.x;
                                                elements[i].y = parentEl.y +
                                                (this.visOptions.layout.hierarchical
                                                    .levelSeparation-20);
                                            }
                                        }
                                    }
                                }
                            }
                            nodesDataSet.add(elements[i]);
                        } catch (e) {

                        }
                    }
                }
            }
            //if(mapPositions === {})
                network.setOptions(this.visOptions);
            var updatedNodes = [];
            if(false !== restorePosition) {
            _.each(mapPositions, function(position, id) {
                for (var i = 0; i < elements.length; i++) {
                    if (elements[i].id == id) {
                        elements[i].x = position.x;
                        elements[i].y = position.y;
                        nodesDataSet.update(elements[i]);
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
                        if(edgesDataSet.get(newElementIds[i]) == null) {
                            var newlyAddedElement = elements[i];
                            if(elements[i].nodeDetails.parent != null &&
                                elements[i].nodeDetails.parent.length > 0) {
                                var parentEl =
                                    nodesDataSet.get(this.model.elementMap.node[elements[i].nodeDetails.parent[0]]);
                                if(parentEl) {
                                    newParentElement = parentEl;
                                    newElements.push(elements[i]);
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
                        newElements[i].x = startPos + ((i+1)*50) + (i*30)
                        newElements[i].y = newParentElement.y + this.visOptions.layout.hierarchical.levelSeparation;
                        if(nodesDataSet.get(newElements[i].id) == null)
                            nodesDataSet.add(newElements[i]);
                        else
                            nodesDataSet.update(newElements[i]);
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
                    var node = this.nodesDataSet.get(elementMapNodes[errorNodes[i]]);
                    node.icon.color = this.style.errorNode.color;
                    this.nodesDataSet.update(node);
                }
            }
        },

        removeUnderlayPathIds: function() {
            var network = this.network;
            var graphModel = this.model;
            var elementMap = this.model.elementMap;
            var pathIds = this.underlayPathIds;
            var edgesDataSet = this.edgesDataSet;
            var nodesDataSet = this.nodesDataSet;
            var edgeIds = edgesDataSet.getIds();
            var edges = [];
            if(pathIds && pathIds.hasOwnProperty('links')) {
                for (var i = 0; i < pathIds.links.length; i++) {
                    var edge = edgesDataSet.get(pathIds.links[i]);
                    edgesDataSet.remove(edge);
                }
            }
            if(pathIds && pathIds.hasOwnProperty('nodes')) {
                for (var i = 0; i < pathIds.nodes.length; i++) {
                    var node = nodesDataSet.get(pathIds.nodes[i]);
                    nodesDataSet.remove(node);
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
            var nodesDataSet = this.nodesDataSet;
            var edgesDataSet = this.edgesDataSet;
            var nodeIds = nodesDataSet.getIds();
            var edgeIds = edgesDataSet.getIds();
            var nodes = [];
            var mapPositions = {};
            var flowPathEdges = this.underlayPathIds.links;
            for (var i = 0; i < nodeIds.length; i++) {
                var node = nodesDataSet.get(nodeIds[i]);
                var nodeEl = network.findNode(nodeIds[i]);
                if(nodeEl && nodeEl.length == 1) {
                    nodeEl = nodeEl[0];
                    mapPositions[nodeIds[i]] = {};
                    mapPositions[nodeIds[i]] = {
                        x: nodeEl.x,
                        y: nodeEl.y
                    }
                }
                node.icon.color = _this.style.defaultDimlight.color;
                nodes.push(node);
            }

            _.each(mapPositions, function(position, id) {
                for (var i = 0; i < nodes.length; i++) {
                    if (nodes[i].id == id) {
                        nodes[i].x = position.x;
                        nodes[i].y = position.y;
                        continue;
                    }
                }
            });
            nodesDataSet.update(nodes);
            var edges = [];
            for (var i = 0; i < edgeIds.length; i++) {
                var edge = edgesDataSet.get(edgeIds[i]);
                if($.inArray(edgeIds[i], flowPathEdges) == -1) {
                    edge.color = _this.style.defaultDimlight.color;
                } else {
                    edge.color = _this.style.flowPathDimlight.color;
                }
                edges.push(edge);
            }
            edgesDataSet.update(edges);
        },
        resetConnectedElements: function(restorePosition) {
            var network = this.network;
            var _this = this;
            var nodesDataSet = this.nodesDataSet;
            var edgesDataSet = this.edgesDataSet;
            var nodeIds = nodesDataSet.getIds();
            var edgeIds = edgesDataSet.getIds();
            var nodes = [];
            var flowPathEdges = this.underlayPathIds.links;
            var mapPositions = {};
            if(restorePosition == false) {
                for (var i = 0; i < nodeIds.length; i++) {
                    var node = nodesDataSet.get(nodeIds[i]);
                    node.icon.color = _this.style.default.color;
                    nodes.push(node);
                }
                nodesDataSet.update(nodes);
                return;
            }
            for (var i = 0; i < nodeIds.length; i++) {
                var node = nodesDataSet.get(nodeIds[i]);
                var nodeEl = network.findNode(nodeIds[i]);
                if(nodeEl && nodeEl.length == 1) {
                    nodeEl = nodeEl[0];
                    mapPositions[nodeIds[i]] = {};
                    mapPositions[nodeIds[i]] = {
                        x: nodeEl.x,
                        y: nodeEl.y
                    }
                }
                if(flowPathEdges.length > 0)
                    node.icon.color = _this.style.defaultDimlight.color;
                else
                    node.icon.color = _this.style.default.color;
                nodes.push(node);
            }

            _.each(mapPositions, function(position, id) {
                for (var i = 0; i < nodes.length; i++) {
                    if (nodes[i].id == id) {
                        nodes[i].x = position.x;
                        nodes[i].y = position.y;
                        continue;
                    }
                }
            });
            nodesDataSet.update(nodes);
            var edges = [];
            for (var i = 0; i < edgeIds.length; i++) {
                var edge = edgesDataSet.get(edgeIds[i]);
                if($.inArray(edgeIds[i], flowPathEdges) == -1) {
                    edge.color = _this.style.defaultDimlight.color;
                } else {
                    if(_this.network.getSelectedNodes().length > 0 ||
                        _this.network.getSelectedEdges().length > 0) {
                        edge.color = this.style.flowPathDimlight.color;
                    } else {
                        edge.color = this.style.flowPathDefault.color;
                    }
                }
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
                        var actions = [], instances = graphModel.VMs,
                            ip = monitorInfraConstants.noDataStr;
                        var vms = 0,
                            name = getValueByJsonPath(nodeDetails, 'name', '-');
                        var ipArr = getValueByJsonPath(nodeDetails,
                             'more_attributes;VrouterAgent;self_ip_list', []);
                        if (ipArr.length > 0) {
                            ip = ipArr.join(',');
                        }
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
                                'more_attributes;vm_name', '-');
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
                    }
                }
            };
        },

        resetTopology: function(options) {
            var self = this;
            var underlayGraphModel = self.model;
            this.removeUnderlayPathIds();
            var restorePosition = options.restorePosition;
            this.resetConnectedElements(restorePosition);
            var adjList = _.clone(underlayGraphModel['underlayAdjacencyList']);
            underlayGraphModel['adjacencyList'] = adjList;
            self.network.setOptions(self.visOptions);
            var childElementsArray =
                this.createElementsFromAdjacencyList(underlayGraphModel);
            this.addElementsToGraph(childElementsArray, restorePosition);
            this.markErrorNodes();
            if (options['resetBelowTabs'] == true) {
                monitorInfraUtils.removeUnderlayTabs(
                    this.rootView.viewMap[ctwc.UNDERLAY_TABS_VIEW_ID]);
            }
            underlayGraphModel.selectedElement.set({
                'nodeType': '',
                'nodeDetail': {}});

            $('.vis-button.vis-zoomExtends').click();
            self.enableFreeflow();
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
                failureCallback: function() {
                    var xhr = underlayGraphModel.errorList[0],
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

