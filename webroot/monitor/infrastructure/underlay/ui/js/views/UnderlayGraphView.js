/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view',
    'monitor/infrastructure/underlay/ui/js/underlay.utils'
], function(_, ContrailView, underlayUtils) {
    var UnderlayGraphView = ContrailView.extend({
        initVars: function() {
            var self                  = this;
            self.network              = null,
            self.model                = null,
            self.doubleClickTime      = 0,
            self.threshold            = 300,
            self.levelExpand          = {
                                        "tor" : false,
                                        "virtual-router": false,
                                        "virtual-machine": false
                                    },
            self.elementMap           = {
                                        "nodes": {},
                                        "edges": {}
                                    },
            self.underlayPathIds      = {
                                        "nodes": [],
                                        "edges": []
                                    },
            self.lastDblClickedType   = "",
            self.dblClickedType       = "",
            self.lastAddedElements    = {
                                        "nodes": [],
                                        "edges": []
                                    },
            self.toBeDupedElements   = {
                                        "nodes": [],
                                        "edges": []
                                    },
            self.stabilized          = false,
            self.tooltipConfigWidth  = 0,
            self.tooltipConfigHeight = 0,
            self.cursorPosition      = {},
            self.DIMLIGHT            = "dimlight",
            self.HIGHLIGHT           = "highlight",
            self.ERROR               = "error",
            self.DEFAULT             = "default",
            self.style               = {
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
                                    flowPathDefault: {
                                        color: "rgba(0,150,136,.8)" //teal
                                    },
                                    flowPathDimlight: {
                                        color: "rgba(0,150,136,.5)" //teal
                                    }
                                },
            self.visOptions          = {
                                    autoResize: true,
                                    clickToUse: false,
                                    interaction: {
                                        navigationButtons: true,
                                        hover: true,
                                        keyboard: false,
                                        selectConnectedEdges: false,
                                        hoverConnectedEdges: false,
                                        tooltipDelay: 1000,
                                        zoomView: false
                                    },
                                    layout: {
                                        hierarchical: {
                                            direction: 'UD',
                                            sortMethod: 'directed',
                                            levelSeparation: 100
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
                                            face :
                                                'Arial, helvetica, sans-serif',
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
                                            roundness: .7
                                        }
                                    }
                                }
            self.attributes.viewConfig.model.flowPath().model().
                set({'nodes': [], 'edges': []}, {silent:true});
        },
        enableFreeflow: function(contrailVisView) {
            contrailVisView.setOptions({physics:{enabled: false},
                layout: {hierarchical: {enabled:false}}});
        },
        resetTooltip: function() {
            $(".vis-network-tooltip").popover('destroy');
            this.tooltipConfigWidth = 0;
            this.tooltipConfigHeight = 0;
        },
        removeUnderlayEffects: function() {
            underlayUtils.removeUndelrayFlowInfoFromBreadCrumb();
            //Removing the selected row styling in
            //trace flow and map flow results.
            $("#" + ctwc.TRACEFLOW_RESULTS_GRID_ID+
                " div.slick-row.selected-slick-row").
                removeClass('selected-slick-row');
            $("#searchFlow-results div.slick-row.selected-slick-row").
                removeClass('selected-slick-row');
            this.clearFlowPath();
        },
        render: function() {
            var self = this,
                graphTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_UNDERLAY_GRAPH_VIEW),
                selectorId = '#' + ctwl.UNDERLAY_GRAPH_ID;
                graphModel = self.attributes.viewConfig.model;
            self.initVars();
            self.$el.html(graphTemplate());
            $(document).on("mousemove",function(e){
                self.cursorPosition = {
                    x: e.pageX,
                    y: e.pageY
                }
            });
            $("#" + ctwl.TOP_CONTENT_CONTAINER).
                addClass("underlay-container");
            $("#" + ctwl.TOP_CONTENT_CONTAINER).
                css('border-bottom', '8px solid #fafafa');
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
                            (divTwo.outerHeight() -
                                divTwo.height()))/parent.height()*100+"%";
                    divTwo.height(divTwoHeight);
                    _network.setSize(
                        ui.element.outerWidth() + "px",
                        ui.element.outerHeight() + "px");

                    _network.redraw(); _network.fit();
                },
            });
            $("#"+ctwl.UNDERLAY_GRAPH_ID).data('graphModel', graphModel);
            self.model = graphModel;
            self.initModelEvents();
            $('body').off().on("click", '#flow-info span.reset', function () {
                self.model.underlayPathReqObj({});
                layoutHandler.setURLHashParams({}, {
                    p: 'mon_infra_underlay',
                    merge: false
                });
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
                    underlayGraphView.network =
                        underlayGraphView.childViewMap[ctwl.UNDERLAY_GRAPH_ID];
                    underlayGraphView.populateModelAndAddToGraph();
                    window.view = underlayGraphView;
                    $(".vis-zoomExtends").off().on("click", function(args) {
                        self.zoomHandler(args,self);
                    });
                    $('canvas').on("mousewheel", function(e) {
                        var scrollTo = (e.originalEvent.wheelDelta * -1) +
                            $('body').scrollTop();
                        $('body').scrollTop(scrollTo);
                    });
                 });

            // Drawing the underlay path and trace flow for a given flow
            graphModel.flowPath().model().on('change:nodes', function() {
                var nodes = graphModel.flowPath().model().attributes["nodes"];
                var edges = graphModel.flowPath().model().attributes["edges"];
                if(nodes.length <= 0 || edges.length <= 0) {
                    graphModel.flowPath().model().set('nodes',
                        graphModel.flowPath().model().
                        _previousAttributes.nodes, {silent: true});
                    graphModel.flowPath().model().set('edges',
                        graphModel.flowPath().model()
                        ._previousAttributes.edges, {silent: true});
                    var postData =
                    graphModel.underlayPathReqObj();
                    showInfoWindow(
                        "Unable to " + postData.action + " from [" +
                        postData.srcIP + "]:" + postData.srcPort +
                        " to [" + postData.destIP + "]:" +
                        postData.destPort, "Info");
                    return false;
                }
                if(_.isEqual(graphModel.flowPath().model().
                    _previousAttributes.nodes,
                    graphModel.flowPath().model().attributes.nodes) &&
                    _.isEqual(graphModel.flowPath().model().
                    _previousAttributes.edges,
                    graphModel.flowPath().model().attributes.edges))
                    return false;
                self.showFlowPath(nodes, edges);
                self.rearrangeHandler({}, self);
                return true;
            });
        },
        initModelEvents: function() {
            var self = this,
                nodesCollection = self.model.nodesCollection,
                edgesCollection = self.model.edgesCollection,
                nodeModelEvents = self.getNodeChangeEventsConfig(),
                edgeModelEvents = self.getEdgeChangeEventsConfig();

            self.initModelEventsByType(nodesCollection.models,
                nodeModelEvents, "node");
            self.initModelEventsByType(edgesCollection.models,
                edgeModelEvents, "edge");
        },
        initModelEventsByType: function(models, events, type) {
            var self = this;
            _.each(models, function(model) {
                _.each(events, function(eventName) {
                    model.attributes.model().on(eventName, function() {
                        var params = arguments,
                            model = {};
                        if(type == "node") {
                            model = self.model.getNodeByElementId(
                                params[0].attributes.id);
                            if(null != model) {
                                self.network.updateNode(model);
                            }
                        } else if(type == "edge") {
                            model = self.model.getEdgeByElementId(
                                params[0].attributes.id);
                            if(null != model) {
                                self.network.updateEdge(model);
                            }
                        } else {
                            return;
                        }
                    });
                });
            });
        },
        showFlowPath: function (nodes, edges) {
            var self = this,
                nodesCollection = self.model.nodesCollection,
                edgesCollection = self.model.edgesCollection,
                notProuterNodeModels = [],
                notProuterNodeNames = [],
                notPRPREdgeModels = [],
                notPRPREdgeNames = [],
                toBeDupedNodeIds = [],
                toBeDupedEdgeIds = [],
                vrvrNodes = [],
                vrvrNodeIds = [],
                allNodeNames = [],
                allNodeNameTypes = [],
                allEdgeNamesDir = [],
                allEdgeNames = [];
            self.toBeDupedElements = {
                "nodes": [],
                "edges": []
            };
            self.removeUnderlayPathIds();
            for(var i=0; i<nodes.length; i++) {
                var node = nodes[i];
                allNodeNames.push(node["name"]);
                allNodeNameTypes.push(node["name"] + "<->" + node["node_type"]);
                var nodeModel = self.model.getNodeByName(node["name"]);
                if(null != nodeModel) {
                    if(node["node_type"] != "physical-router") {
                        notProuterNodeModels.push(nodeModel);
                        notProuterNodeNames.push(node["name"]);
                    }
                    toBeDupedNodeIds.push(
                        nodeModel.attributes.element_id());
                }
            }
            //These two variables are populated only when
            //there is a vr-vr edge is present in the
            //trace/map flow response.
            var fromVRouterNodeEdgeModels = [],
                toVRouterNodeEdgeModels = [];
            for(var i=0; i<edges.length; i++) {
                var endpoints = edges[i].endpoints;
                allEdgeNames.push(endpoints[0] + "<->" + endpoints[1]);
                allEdgeNames.push(endpoints[1] + "<->" + endpoints[0]);
                allEdgeNamesDir.push(endpoints[0] + "<->" + endpoints[1]);
                var fromModel = self.model.getNodeByName(endpoints[0]);
                var toModel = self.model.getNodeByName(endpoints[1]);
                if(null == fromModel || null == toModel)
                    continue;
                var fromNodeType = fromModel.attributes.node_type();
                var toNodeType = toModel.attributes.node_type();
                var edgeType = fromNodeType.split("-")[0][0] +
                    fromNodeType.split("-")[1][0] + '-' +
                    toNodeType.split("-")[0][0] +
                    toNodeType.split("-")[1][0];
                if(edgeType == "vr-vr") {
                    fromVRouterNodeEdgeModels =
                        _.filter(edgesCollection.models,
                        function(edgeModel) {
                            return ((edgeModel.attributes.model().
                            attributes.endpoints[0] == endpoints[0] ||
                            edgeModel.attributes.model().
                            attributes.endpoints[0] == endpoints[1]) &&
                            ($.inArray(self.getEdgeType(edgeModel),
                                ["pr-vr", "vr-pr"]) != -1));
                    });
                    toVRouterNodeEdgeModels =
                        _.filter(edgesCollection.models,
                        function(edgeModel) {
                            return ((edgeModel.attributes.model().
                            attributes.endpoints[1] == endpoints[0] ||
                            edgeModel.attributes.model().
                            attributes.endpoints[1] == endpoints[1]) &&
                            ($.inArray(self.getEdgeType(edgeModel),
                                ["pr-vr", "vr-pr"]) != -1))
                    });
                } else {
                    var fromOrToEdgeModel =
                        _.filter(edgesCollection.models,
                        function(edgeModel) {
                            return ((edgeModel.attributes.model().
                            attributes.endpoints[0] == endpoints[0] &&
                            edgeModel.attributes.model().
                            attributes.endpoints[1] == endpoints[1]) ||
                            (edgeModel.attributes.model().
                            attributes.endpoints[0] == endpoints[1] &&
                            edgeModel.attributes.model().
                            attributes.endpoints[1] == endpoints[0]));
                    });
                    if(fromOrToEdgeModel && fromOrToEdgeModel.length == 1) {
                        fromOrToEdgeModel = fromOrToEdgeModel[0];
                        var edgeName =
                            endpoints[0] + "<->" + endpoints[1],
                            altEdgeName =
                            endpoints[1] + "<->" + endpoints[0];

                        if($.inArray(edgeName, notPRPREdgeNames) != -1 ||
                            $.inArray(altEdgeName, notPRPREdgeNames) != -1)
                            continue; //edge already present in the list

                        if(edgeType !== "pr-pr") {
                            notPRPREdgeModels.push(fromOrToEdgeModel);
                            notPRPREdgeNames.push(edgeName);
                            notPRPREdgeNames.push(altEdgeName);
                        }
                        var arrowPosition = "";
                        var edgeEndpoints =
                            fromOrToEdgeModel.attributes.endpoints();
                        if(edgeEndpoints[0] ==
                            fromModel.attributes.name()) {
                            arrowPosition = "to";
                        } else {
                            arrowPosition = "from";
                        }
                        toBeDupedEdgeIds.push({
                            id: fromOrToEdgeModel.attributes.element_id(),
                            arrowPosition: arrowPosition
                        });
                        if($.inArray(endpoints[0],
                            notProuterNodeNames) == -1 &&
                            fromModel.attributes.node_type() !=
                            "physical-router") {
                            notProuterNodeModels.push(fromModel);
                            notProuterNodeNames.push(endpoints[0]);
                        }
                        if($.inArray(endpoints[1],
                            notProuterNodeNames) == -1 &&
                            toModel.attributes.node_type() !=
                            "physical-router") {
                            notProuterNodeModels.push(toModel);
                            notProuterNodeNames.push(endpoints[1]);
                        }
                    }
                }
            }
            var postData = self.model.underlayPathReqObj();
            delete postData["interval"];
            delete postData["maxAttempts"];
            delete postData["startAt"];
            var queryParams = {
                "path" : {
                    "nodes": allNodeNameTypes.join(","),
                    "edges": allEdgeNamesDir.join(","),
                    "postData": postData
                }
            };
            layoutHandler.setURLHashParams(queryParams, {
                p: 'mon_infra_underlay',
                merge: false
            });
            var vrprLink = [];
            _.each(edgesCollection.models, function(edgeModel) {
                //only pr-vr edges are to be found out.
                var fromModel = self.model.getNodeByElementId(
                    edgeModel.attributes.from())
                var toModel = self.model.getNodeByElementId(
                    edgeModel.attributes.to());
                if(null == fromModel || null == toModel)
                    return true;
                var fromNodeType = fromModel.attributes.node_type();
                var toNodeType = toModel.attributes.node_type();
                var edgeType = fromNodeType.split("-")[0][0] +
                    fromNodeType.split("-")[1][0] + '-' +
                    toNodeType.split("-")[0][0] +
                    toNodeType.split("-")[1][0];

                if(edgeType == "pr-vr" || edgeType == "vr-pr") {
                    var fromName = fromModel.attributes.name(),
                        toName   = toModel.attributes.name(),
                        edgeName = fromName + "<->" + toName,
                        altEdgeName = toName + "<->" + fromName;
                    //edge already in the list of models to be duplicated
                    //so dont add it again.
                    if($.inArray(edgeName, notPRPREdgeNames) != -1 ||
                        $.inArray(altEdgeName, notPRPREdgeNames) != -1)
                        return true;

                    //both nodes are not part of the flow path
                    //so dont add the edge.
                    if($.inArray(fromName, allNodeNames) == -1 &&
                        $.inArray(toName, allNodeNames) == -1)
                        return true;

                    var arrowPosition = "";
                    //add vr-pr/pr-vr edge model
                    if(edgeType.split("-")[0] == "vr") {
                        if($.inArray(fromName, notProuterNodeNames) != -1) {
                            if($.inArray(fromName, vrprLink) != -1)
                                return true;
                            notPRPREdgeModels.push(edgeModel);
                            notPRPREdgeNames.push(edgeName);
                            notPRPREdgeNames.push(altEdgeName);
                            arrowPosition = "from";
                            vrprLink.push(fromName);
                        }
                    } else if(edgeType.split("-")[1] == "vr") {
                        if($.inArray(toName, notProuterNodeNames) != -1) {
                            if($.inArray(toName, vrprLink) != -1)
                                return true;
                            notPRPREdgeModels.push(edgeModel);
                            notPRPREdgeNames.push(edgeName);
                            notPRPREdgeNames.push(altEdgeName);
                            arrowPosition = "to";
                            vrprLink.push(toName);
                        }
                    }
                    if($.inArray(edgeName, allEdgeNames) == -1 &&
                        $.inArray(altEdgeName, allEdgeNames) == -1) {
                        //edge is not part of the flow path
                        //so dont duplicate the edge.
                    } else {
                        //edge is part of the flow path
                        //so duplicate the edge.
                        toBeDupedEdgeIds.push({
                            id: edgeModel.attributes.element_id(),
                            arrowPosition: arrowPosition
                        });
                    }
                }
            });

            //When there is a vr-vr edge is present in the
            //trace/map flow response, we are supposed to find
            //edges to respective ToRs and there can be multiple
            //edges to ToRs. Find most opt edges and see if they
            //are already in the list of edges to be duplicated.
            if(fromVRouterNodeEdgeModels.length > 0 ||
                toVRouterNodeEdgeModels.length > 0) {
                var additionalEdges = [];
                if(fromVRouterNodeEdgeModels.length > 0)
                    additionalEdges.push(fromVRouterNodeEdgeModels[0]);
                if(toVRouterNodeEdgeModels.length > 0)
                    additionalEdges.push(toVRouterNodeEdgeModels[0]);

                _.each(additionalEdges, function(edgeModel) {
                    var fromModel = self.model.getNodeByElementId(
                        edgeModel.attributes.from());
                    var toModel = self.model.getNodeByElementId(
                        edgeModel.attributes.to());
                    if(null == fromModel || null == toModel)
                        return true;
                    var edgeName = fromModel.attributes.name() +
                        "<->" + toModel.attributes.name();
                    var altEdgeName = fromModel.attributes.name() +
                        "<->" + toModel.attributes.name();

                    if($.inArray(edgeName, notPRPREdgeNames) == -1 ||
                        $.inArray(altEdgeName, notPRPREdgeNames) == -1) {
                        notPRPREdgeNames.push(edgeName);
                        notPRPREdgeNames.push(altEdgeName);
                        notPRPREdgeModels.push(edgeModel);
                    }
                });
            }
            self.toBeDupedElements = {
                "nodes": toBeDupedNodeIds,
                "edges": toBeDupedEdgeIds
            };
            if(toBeDupedNodeIds.length > 0 &&
                toBeDupedEdgeIds.length > 0) {
                setTimeout(function(){
                    underlayUtils.addUnderlayFlowInfoToBreadCrumb({
                        action: postData['action'],
                        sourceip: postData['srcIP'],
                        destip: postData['destIP'],
                        sport: postData['srcPort'],
                        dport: postData['destPort']
                    });
                }, 300);
            } else {
                layoutHandler.setURLHashParams({}, {
                    p: 'mon_infra_underlay',
                    merge: false
                });
            }

            self.addElementsToNetwork(notProuterNodeModels,
                notPRPREdgeModels, null, true, false,
                self.toBeDupedElements);
        },
        getEdgeType: function(edgeModel) {
            var self = this,
                nodesCollection = self.model.nodesCollection;
            var fromModel =
                self.model.getNodeByElementId(edgeModel.attributes.from());
            var toModel =
                self.model.getNodeByElementId(edgeModel.attributes.to());
            if(null == fromModel || null == toModel)
                return "";
            var fromNodeType = fromModel.attributes.node_type();
            var toNodeType = toModel.attributes.node_type();
            var edgeType = fromNodeType.split("-")[0][0] +
                fromNodeType.split("-")[1][0] + '-' +
                toNodeType.split("-")[0][0] +
                toNodeType.split("-")[1][0];
            return edgeType;
        },
        duplicatePaths: function(toBeDupedNodeIds, toBeDupedEdgeIds) {
            var self = this,
                network = self.network,
                dupNodes = []
                dupNodeIds = [],
                dupEdges = [],
                dupEdgeIds = [],
                mapOrigNodeToDupNode = {};

            //duplicateNodes
            for(var i=0; i<toBeDupedNodeIds.length; i++) {
                var origNodeModel =
                    self.model.getNodeByElementId(toBeDupedNodeIds[i]);
                var origNodeElement =
                    self.network.network.findNode(toBeDupedNodeIds[i])
                if(null == origNodeModel)
                    continue;
                origNodeModel.attributes.image(
                    self.getImage(
                        origNodeModel.attributes.chassis_type(),
                        self.DEFAULT));
                origNodeModel = origNodeModel.attributes.model().attributes;

                if(origNodeElement && origNodeElement.length == 1 &&
                    origNodeElement[0] != undefined) {
                    origNodeElement = origNodeElement[0];
                } else {
                    continue;
                }

                self.model.addNode({
                    chassis_type: origNodeModel.chassis_type,
                    errorMsg: origNodeModel.errorMsg,
                    mgmt_ip: origNodeModel.mgmt_ip,
                    more_attributes: origNodeModel.more_attributes,
                    name: origNodeModel.name,
                    node_type: origNodeModel.node_type
                });
                var dupNode =
                    self.createNode(self.model.nodesCollection.last());
                dupNode.attributes.model().attributes.x = origNodeElement.x-7;
                dupNode.attributes.model().attributes.y = origNodeElement.y-7;
                dupNode.attributes.model().attributes.hidden = true;
                dupNodes.push(dupNode);
                mapOrigNodeToDupNode[toBeDupedNodeIds[i]] = {
                    id: dupNode.attributes.element_id()
                };
                dupNodeIds.push(dupNode.attributes.element_id());
            }
            if(dupNodes.length > 0)
                network.addNode(dupNodes);  //add to network;

            for(var i=0; i<toBeDupedEdgeIds.length; i++) {
                var origEdgeModel =
                    self.model.getEdgeByElementId(toBeDupedEdgeIds[i].id);
                if(null == origEdgeModel)
                    continue;
                origEdgeModel = origEdgeModel.attributes.model().attributes;
                var dupEdgeModel = self.model.addEdge({
                    link_type: origEdgeModel.link_type,
                    endpoints: origEdgeModel.endpoints,
                    more_attributes: origEdgeModel.more_attributes
                });
                dupEdgeModel.from(mapOrigNodeToDupNode[origEdgeModel.from].id);
                dupEdgeModel.to(mapOrigNodeToDupNode[origEdgeModel.to].id);
                var dupEdge = self.createEdge(
                    self.model.edgesCollection.last(),
                    origEdgeModel.link_type,
                    mapOrigNodeToDupNode[origEdgeModel.from].id,
                    mapOrigNodeToDupNode[origEdgeModel.to].id,
                    toBeDupedEdgeIds[i].arrowPosition);
                var currentEdgeId = dupEdge.attributes.element_id();
                dupEdges.push(dupEdge);
                dupEdgeIds.push(currentEdgeId);
            }
            if(dupEdges.length > 0)
                network.addEdge(dupEdges);
            self.underlayPathIds = {
                nodes: dupNodeIds,
                edges: dupEdgeIds
            };
        },
        clearFlowPath: function() {
            graphModel.flowPath().model().set('nodes',[], {silent: true});
            graphModel.flowPath().model().set('edges',[], {silent: true});
        },
        collapseNodes: function(params, contrailVisView){
          var self = contrailVisView.caller;
          self.removeElementsFromNetwork(
              self.lastAddedElements.nodes,
              self.lastAddedElements.edges);
          self.lastAddedElements = {
              "nodes": [],
              "edges": []
          };
          self.removeUnderlayPathIds();
          self.removeUnderlayEffects();

        },
        expandNodes: function(params, contrailVisView) {
            var self = contrailVisView.caller,
                _network = contrailVisView.network,
                graphModel = self.model,
                dblClickedElement = (_network.findNode(params.nodes[0]))[0],
                nodeDetails = dblClickedElement.options,
                elementType = nodeDetails["node_type"];
            self.clickedType = nodeDetails['chassis_type'];
            self.toBeDupedElements = {
                "nodes": [],
                "edges": []
            };
            var queryParams = {
                name: nodeDetails.name,
                selected: nodeDetails.name,
                expanded: true
            };
            switch (elementType) {
                case ctwc.PROUTER:
                    var chassis_type = nodeDetails['chassis_type'];
                    if (chassis_type === "tor") {
                        self.lastDblClickedType = self.dblClickedType;
                        self.dblClickedType = "tor";
                        var children = self.model.
                            getChildModels(dblClickedElement.options.model);
                        if(self.lastDblClickedType == "tor") {
                            if(self.lastAddedElements &&
                                self.lastAddedElements.
                                    hasOwnProperty("nodes") &&
                                self.lastAddedElements.
                                    hasOwnProperty("edges")) {
                                if(self.lastAddedElements.nodes.length > 0 ||
                                    self.lastAddedElements.edges.length > 0) {
                                    self.removeElementsFromNetwork(
                                        self.lastAddedElements.nodes,
                                        self.lastAddedElements.edges);
                                    self.lastAddedElements = {
                                        "nodes": [],
                                        "edges": []
                                    };
                                }
                            }

                            if(self.underlayPathIds &&
                                self.underlayPathIds.nodes &&
                                self.underlayPathIds.nodes.length > 0) {
                                self.addElementsToNetwork(children.nodes,
                                    children.edges, dblClickedElement, true);
                                self.lastAddedElements = {
                                    "nodes": children.nodes,
                                    "edges": children.edges
                                };
                            } else {
                                self.addElementsToNetwork(children.nodes,
                                    children.edges, dblClickedElement);
                                if(children.nodes.length > 0 ||
                                    children.edges.length > 0) {
                                    self.lastAddedElements = {
                                        "nodes": children.nodes,
                                        "edges": children.edges
                                    };
                                }
                            }
                        } else if(self.lastDblClickedType == ctwc.VROUTER) {
                            if(self.lastAddedElements &&
                                self.lastAddedElements.
                                    hasOwnProperty("nodes") &&
                                self.lastAddedElements.
                                    hasOwnProperty("edges") &&
                                (self.lastAddedElements.nodes.length > 0 ||
                                self.lastAddedElements.edges.length > 0)) {
                                self.removeElementsFromNetwork(
                                    self.lastAddedElements.nodes,
                                    self.lastAddedElements.edges);
                                self.lastAddedElements = {
                                    "nodes": [],
                                    "edges": []
                                };
                            }
                            self.addElementsToNetwork(children.nodes,
                                children.edges, dblClickedElement, true);
                            if(children.nodes.length > 0 ||
                                children.edges.length > 0) {
                                self.lastAddedElements = {
                                    "nodes": children.nodes,
                                    "edges": children.edges
                                };
                            }
                        } else if(self.lastDblClickedType == "") {
                            if(self.lastAddedElements &&
                                self.lastAddedElements.
                                    hasOwnProperty("nodes") &&
                                self.lastAddedElements.
                                    hasOwnProperty("edges")) {
                                if(self.lastAddedElements.nodes.length > 0 ||
                                    self.lastAddedElements.edges.length > 0) {
                                    self.removeElementsFromNetwork(
                                        self.lastAddedElements.nodes,
                                        self.lastAddedElements.edges);
                                    self.lastAddedElements = {
                                        "nodes": [],
                                        "edges": []
                                    };
                                }
                            }
                            if(self.underlayPathIds &&
                                self.underlayPathIds.nodes &&
                                self.underlayPathIds.nodes.length > 0) {
                                self.addElementsToNetwork(children.nodes,
                                    children.edges, dblClickedElement, true);
                                self.lastAddedElements = {
                                    "nodes": children.nodes,
                                    "edges": children.edges
                                };
                            } else {
                                if(self.dblClickedType == "tor") {
                                    self.addElementsToNetwork(children.nodes,
                                        children.edges,
                                        dblClickedElement, true);
                                } else {
                                    self.addElementsToNetwork(children.nodes,
                                        children.edges,
                                        dblClickedElement);
                                }
                                if(children.nodes.length > 0 ||
                                    children.edges.length > 0) {
                                    self.lastAddedElements = {
                                        "nodes": children.nodes,
                                        "edges": children.edges
                                    };
                                }
                            }
                        }

                        graphModel.selectedElement().model().set({
                        'nodeType': ctwc.PROUTER,
                        'nodeDetail': nodeDetails});
                        self.removeUnderlayPathIds();
                        self.removeUnderlayEffects();
                        self.markErrorNodes();
                        self.addDimlightToConnectedElements();
                        var thisNode = [nodeDetails];
                        self.addHighlightToNodesAndEdges(thisNode, graphModel);
                    }
                    else {
                        if(self.underlayPathIds.nodes.length > 0 ||
                                self.underlayPathIds.edges.length > 0) {
                                self.removeUnderlayPathIds();
                                self.removeUnderlayEffects();
                                self.resetTopology({
                                    resetBelowTabs: true
                                });
                            }
                        }
                    break;
                case ctwc.VROUTER:
                    var parentModels =
                    self.model.getParentModels(dblClickedElement.options.model);
                    if(parentModels != undefined &&
                        parentModels.nodes.length > 0) {
                        if(parentModels.nodes.length == 1) {
                            var parentNodeModels = parentModels.nodes[0];
                            var parentName =
                            parentNodeModels.attributes.name();
                            queryParams.parent = parentName;
                        } else {
                            var parentEdgeIds =
                                _network.getConnectedEdges(
                                    nodeDetails["element_id"]);
                            if(parentEdgeIds.length == 1 &&
                                parentEdgeIds[0] != undefined) {
                                var parentEdgeModel =
                                self.model.getEdgeByElementId(parentEdgeIds[0]);
                                if(parentEdgeModel.attributes.from() ==
                                    nodeDetails["element_id"]) {
                                    parentNodeModel =
                                    self.model.getNodeByElementId(
                                        parentEdgeModel.attributes.to());
                                } else if(parentEdgeModel.attributes.to() ==
                                    nodeDetails["element_id"]) {
                                    parentNodeModel =
                                    self.model.getNodeByElementId(
                                        parentEdgeModel.attributes.from());
                                }
                                if(null != parentNodeModel) {
                                    var parentName =
                                    parentNodeModel.attributes.name();
                                    queryParams.parent = parentName;
                                }
                            } else {
                                var parentEdgeModels = parentModels.edges;
                                if(parentEdgeModels != undefined &&
                                    parentEdgeModels.length > 0) {
                                    _.each(parentEdgeModels,
                                        function(edgeModel) {
                                        var parentNodeModel = null;
                                        var edgeId =
                                            edgeModel.attributes.element_id();
                                        if(edgeModel.attributes.from() ==
                                            nodeDetails["element_id"]) {
                                            parentNodeModel =
                                            self.model.getNodeByElementId(
                                                edgeModel.attributes.to());
                                        } else if(edgeModel.attributes.to() ==
                                            nodeDetails["element_id"]) {
                                            parentNodeModel =
                                            self.model.getNodeByElementId(
                                                edgeModel.attributes.from());
                                        }
                                        if(null != parentNodeModel) {
                                            queryParams.parent =
                                            parentNodeModel.attributes.name();
                                        }
                                    });
                                }
                            }
                        }
                    }
                    self.lastDblClickedType = self.dblClickedType;
                    self.dblClickedType = ctwc.VROUTER;
                    var children = self.model.
                        getChildModels(dblClickedElement.options.model);
                    if(self.lastDblClickedType == ctwc.VROUTER) {
                        if(self.lastAddedElements &&
                            self.lastAddedElements.hasOwnProperty("nodes") &&
                            self.lastAddedElements.hasOwnProperty("edges")) {
                            if(self.lastAddedElements.nodes.length > 0 ||
                                self.lastAddedElements.edges.length > 0) {
                                self.removeElementsFromNetwork(
                                    self.lastAddedElements.nodes,
                                    self.lastAddedElements.edges);
                                self.lastAddedElements = {
                                    "nodes": [],
                                    "edges": []
                                };
                                self.resetTopology({
                                    resetBelowTabs: true
                                });

                            }
                        }
                    }
                    if(self.underlayPathIds &&
                        self.underlayPathIds.nodes &&
                        self.underlayPathIds.nodes.length > 0) {
                        self.addElementsToNetwork(children.nodes,
                            children.edges, dblClickedElement, true);
                        self.lastAddedElements = {
                            "nodes": children.nodes,
                            "edges": children.edges
                        };
                    } else {
                        self.addElementsToNetwork(children.nodes,
                            children.edges, dblClickedElement);
                        if(children.nodes.length > 0 ||
                            children.edges.length > 0) {
                            self.lastAddedElements = {
                                "nodes": children.nodes,
                                "edges": children.edges
                            };
                        }
                    }
                    self.removeUnderlayPathIds();
                    self.removeUnderlayEffects();
                    graphModel.selectedElement().model().set({
                    'nodeType': ctwc.VROUTER,
                    'nodeDetail': nodeDetails});
                    self.markErrorNodes();
                    self.addDimlightToConnectedElements();
                    var thisNode = [nodeDetails];
                    self.addHighlightToNodesAndEdges(thisNode, graphModel);
                    break;
                case ctwc.VIRTUALMACHINE:
                    var parentModels =
                    self.model.getParentModels(dblClickedElement.options.model);
                    if(parentModels != undefined &&
                        parentModels.nodes.length > 0) {
                        if(parentModels.nodes.length == 1) {
                            var parentNodeModel = parentModels.nodes[0];
                            var parentName =
                            parentNodeModel.attributes.name();
                            queryParams.parent = parentName;
                            var gParentModels =
                                self.model.getParentModels(
                                    parentNodeModel);
                            if(gParentModels != undefined &&
                                gParentModels.nodes.length > 0) {
                                if(gParentModels.nodes.length == 1 &&
                                    gParentModels.nodes[0] != undefined) {
                                    var gParentNodeModel =
                                        gParentModels.nodes[0];
                                    var gParentName =
                                        gParentNodeModel.attributes.name();
                                    queryParams.gparent = gParentName;
                                }
                            }
                        } else {
                            var parentEdgeModels = parentModels.edges;
                            if(parentEdgeModels != undefined &&
                                parentEdgeModels.length > 0) {
                                _.each(parentEdgeModels, function(edgeModel) {
                                    var edgeId =
                                        edgeModel.attributes.element_id();
                                    var edgeEl =
                                        self.network.network.findNode(edgeId);
                                    if(null == edgeEl)
                                        return true;
                                    if(edgeModel.attributes.from() ==
                                        nodeDetails["element_id"]) {
                                        var parentNodeModel =
                                        self.model.getNodeByElementId(
                                            edgeModel.attributes.to());
                                        if(null != parentNodeModel) {
                                            queryParams.parent =
                                            parentNodeModel.attributes.name();
                                        }
                                    }
                                });
                            }
                        }
                    }
                    break;
            }
            layoutHandler.setURLHashParams(queryParams, {
                p: 'mon_infra_underlay',
                merge: false
            });

        },
        createEdge: function(edge, edge_type, srcId, tgtId,
            arrowPosition, eventName) {
            var self = this;
            edge.attributes.link_type(edge_type);
            if(arrowPosition == "from" ||
                arrowPosition == "to") {
                if(self.network.network.getSelectedNodes().length > 0 ||
                    self.network.network.getSelectedEdges().length > 0) {
                    if(eventName == "dragEnd")
                        edge.attributes.color(
                            self.style.flowPathDefault.color);
                    else
                        edge.attributes.color(
                            self.style.flowPathDimlight.color);
                } else {
                    edge.attributes.color(
                        self.style.flowPathDefault.color);
                }
                if(arrowPosition == "to") {
                    edge.attributes.arrows({
                        to : {
                            enabled : true,
                            scaleFactor: .6
                        }
                    });
                } else if(arrowPosition == "from") {
                    edge.attributes.arrows({
                        from : {
                            enabled : true,
                            scaleFactor: .6
                        }
                    });
                }
            }
            var tooltipConfig = self.getUnderlayTooltipConfig()['edge'];
            var title = tooltipConfig.title(edge);
            var content = tooltipConfig.content(edge);
            var tooltipTmpl =
                contrail.getTemplate4Id(cowc.TMPL_UNDERLAY_ELEMENT_TOOLTIP)
            var tooltip = tooltipTmpl({
                title: title,
                content: content
            });
            var dummydiv = $( '<div id=' + edge.attributes.element_id() +
                ' style="display:block;visibility:hidden"/>');
            $('body').append(dummydiv)
            dummydiv.append($(_.unescape(tooltip)));
            edge.attributes.tooltip(tooltip);
            edge.attributes.tooltipConfig({
                title       : title,
                content     : content,
                data        : edge,
                dimension   : {
                    width   : $(dummydiv).find('.popover').width(),
                    height  : $(dummydiv).find('.popover').height()
                }
            });
            $(dummydiv).empty();
            $(dummydiv).remove();
            dummydiv = $();
            delete dummydiv;
            return edge;
        },

        createNode: function(node) {
            var level = 1;
            var nodeName = node.attributes.name();
            var node_type = node.attributes.node_type();
            var chassis_type = node.attributes.chassis_type();
            var labelNodeName = contrail.truncateText(nodeName, 20);
            var tooltipConfig = this.getUnderlayTooltipConfig()[node_type];
            if (tooltipConfig != null) {
                var title = tooltipConfig.title(node);
                var content = tooltipConfig.content(node);
                var tooltipTmpl =
                    contrail.getTemplate4Id(cowc.TMPL_UNDERLAY_ELEMENT_TOOLTIP)
                var tooltip = tooltipTmpl({
                    title: title,
                    content: content
                });
                var dummydiv = $( '<div id=' + node.attributes.element_id() +
                    ' style="display:block;visibility:hidden"/>');
                $('body').append(dummydiv)
                dummydiv.append($(_.unescape(tooltip)));
                node.attributes.tooltip(tooltip);
                node.attributes.tooltipConfig({
                    title           : title,
                    content         : content,
                    data            : node,
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
            }
                return node;
        },
        removeElementsFromNetwork: function(nodeModels, edgeModels) {
            var self = this,
                graphModel = self.model,
                network = self.network,
                edgeElements = [],
                nodeElements = [];
            _.each(nodeModels, function(nodeModel, idx) {
                nodeElements.push(nodeModel.attributes.element_id());
            });

            //remove old edges
            _.each(edgeModels, function(edgeModel, idx) {
                edgeElements.push(edgeModel.attributes.element_id());
            });
            if(nodeElements.length > 0) {
                network.removeNode(nodeElements);
            }
            if(edgeElements.length > 0) {
                network.removeEdge(edgeElements);
            }
        },
        addElementsToNetwork: function(nodeModels, edgeModels,
            dblClickedElement, removeOther, restorePosition,
            toBeDupedElements) {
            var self = this,
                graphModel = self.model,
                elMap = self.elementMap,
                network = self.network,
                removedEdges = [],
                removedNodes = [],
                existingEdgeElements = [],
                newEdgeElements = [],
                existingNodes = [],
                newNodeElements = [],
                nodeIdsInNetwork = network.getNodeIds(),
                edgeIdsInNetwork = network.getEdgeIds(),
                mapPositions = {},
                options = self.visOptions;

            if(self.stabilized == true) {
                options.physics = {
                    "enabled" : false,
                    "stabilization" : {
                        "fit": false
                    }
                };
            } else {
                options.physics = {
                    "enabled" : true,
                    "stabilization" : {
                        "fit": true
                    }
                };
            }
            self.network.setOptions(options);
            var underlayNodes = self.model.getUnderlayNodes();
            var underlayNodePositions = {};
            var removedNodeIds = [];
            if(removeOther == true) {
                //remove all nodes except prouters
                _.each(nodeIdsInNetwork, function(nodeId, idx) {
                    var nodeInNetwork = network.getNode(nodeId);
                    if(null != nodeInNetwork &&
                        typeof nodeInNetwork != "undefined") {
                        if(nodeInNetwork.node_type !=
                            "physical-router") {
                            if(dblClickedElement &&
                                dblClickedElement.id == nodeId) {
                                if(self.model.flowPath().model().
                                    attributes.nodes && self.model.flowPath().
                                    model().attributes.nodes.length > 0) {
                                } else {
                                    removedNodes.push(nodeInNetwork);
                                    removedNodeIds.push(nodeId);
                                }
                            } else {
                                removedNodes.push(nodeInNetwork);
                                removedNodeIds.push(nodeId);
                            }
                        }
                    }
                });

                //remove all edges except prouter-prouter
                _.each(edgeIdsInNetwork, function(edgeId, idx) {
                    var edgeInNetwork = network.getEdge(edgeId);
                    if(null != edgeInNetwork &&
                        typeof edgeInNetwork != "undefined") {
                        if(edgeInNetwork.link_type != "pr-pr") {
                            var fromId = edgeInNetwork.from;
                            var toId = edgeInNetwork.to;
                            if(dblClickedElement &&
                                (dblClickedElement.id == fromId ||
                                dblClickedElement.id == toId)) {
                                if(self.model.flowPath().model().
                                    attributes.nodes && self.model.flowPath().
                                    model().attributes.nodes.length > 0) {
                                } else {
                                    removedEdges.push(edgeInNetwork);
                                }
                            } else {
                                removedEdges.push(edgeInNetwork);
                            }
                        }
                    }
                });
            }
            if(removedNodes.length > 0) {
                network.removeNode(removedNodes);
            }
            if(removedEdges.length > 0) {
                network.removeEdge(removedEdges);
            }
            if(restorePosition != false) {
                _.each(underlayNodes, function(nodeModel, idx) {
                    var underlayNodeId =
                        elMap["nodes"][nodeModel.attributes.name()];
                    if(null != underlayNodeId &&
                        typeof underlayNodeId != "undefined") {
                        var nodeInNetwork = network.findNode(underlayNodeId);
                        if(null != nodeInNetwork &&
                            typeof nodeInNetwork != "undefined" &&
                            nodeInNetwork.length == 1 &&
                            nodeInNetwork[0] != undefined) {
                            nodeInNetwork = nodeInNetwork[0];
                            underlayNodePositions[underlayNodeId] = {};
                            underlayNodePositions[underlayNodeId] = {
                                x: nodeInNetwork.x,
                                y: nodeInNetwork.y
                            }
                        }
                    }
                });
                _.each(nodeIdsInNetwork, function(id, idx) {
                    if(!underlayNodePositions.hasOwnProperty(id) &&
                        ($.inArray(id, removedNodeIds) == -1)) {
                        var nodeInNetwork = network.findNode(id);
                        if(null != nodeInNetwork &&
                            typeof nodeInNetwork != "undefined" &&
                            nodeInNetwork.length == 1 &&
                            nodeInNetwork[0] != undefined) {
                            nodeInNetwork = nodeInNetwork[0];
                            mapPositions[id] = {};
                            mapPositions[id] = {
                                x: nodeInNetwork.x,
                                y: nodeInNetwork.y
                            };
                            var existingNode =
                                self.model.getNodeByElementId(id);
                            if(null != existingNode)
                                existingNodes.push(existingNode);
                        }
                    }
                });
            }
            //add new nodes
            var nodeModelsLen = nodeModels.length,
                dblClickedElementX = 0,
                dblClickedElementY = 0,
                childStartX = 0,
                nodeSep = 100;

            if(null != dblClickedElement && typeof
                dblClickedElement != "undefined") {
                dblClickedElementX =
                    dblClickedElement.x;
                dblClickedElementY =
                    dblClickedElement.y;
                if(nodeModelsLen % 2 == 0) {
                    //Even number of children.
                    var halfChildren = nodeModelsLen/2;
                    if(halfChildren == 1) {
                        childStartX = dblClickedElementX - 50;
                    } else {
                        childStartX = dblClickedElementX -
                        (halfChildren * nodeSep) + dblClickedElementX/2;
                    }
                } else {
                    //Odd number of children.
                    //To be distributed 100px apart.
                    var halfChildren = Math.floor(nodeModelsLen/2);
                    childStartX = dblClickedElementX - (halfChildren * nodeSep);
                }
            }
            _.each(nodeModels, function(nodeModel, idx) {
                var currentEl = nodeModel;
                if (null == elMap["nodes"][nodeModel.attributes.name()] &&
                    typeof elMap["nodes"][nodeModel.attributes.name()]
                        == "undefined") {
                    currentEl = self.createNode(nodeModel);
                    elMap.nodes[nodeModel.attributes.name()] =
                        currentEl.attributes.element_id();
                }
                if(null != dblClickedElement && typeof
                    dblClickedElement != "undefined") {
                    currentEl.attributes.model().set(
                        {"x": childStartX + (idx * nodeSep)},
                        {"silent":true});
                    currentEl.attributes.model().set(
                        {"y":dblClickedElementY +
                        (self.visOptions.
                            layout.hierarchical.levelSeparation)},
                        {"silent":true});
                }
                newNodeElements.push(currentEl);
            });

            //add new edges
            _.each(edgeModels, function(edgeModel, idx) {
                var fromNodeId = edgeModel.attributes.from(),
                    toNodeId = edgeModel.attributes.to(),
                    fromNodeModel = self.model.getNodeByElementId(fromNodeId),
                    toNodeModel = self.model.getNodeByElementId(toNodeId);
                if(null == fromNodeModel || null == toNodeModel)
                    return true;

                var fromName = fromNodeModel.attributes.name(),
                    toName = toNodeModel.attributes.name(),
                    edgeName = fromName + "<->" + toName,
                    altEdgeName = toName + "<->" + fromName,
                    edge_type =
                    fromNodeModel.attributes.node_type().split("-")[0][0] +
                    fromNodeModel.attributes.node_type().split("-")[1][0] +'-'+
                    toNodeModel.attributes.node_type().split("-")[0][0] +
                    toNodeModel.attributes.node_type().split("-")[1][0];

                if (null !== elMap["edges"][edgeName] &&
                    typeof elMap["edges"][edgeName] !== "undefined" &&
                    null !== elMap["edges"][altEdgeName] &&
                    typeof elMap["edges"][altEdgeName] !== "undefined") {
                    var edgeInNetwork =
                        network.getEdge(elMap["edges"][altEdgeName]);
                    if(null == edgeInNetwork ||
                        typeof edgeInNetwork == "undefined")
                        newEdgeElements.push(edgeModel);
                } else {
                    newEdgeElements.push(self.createEdge(
                        edgeModel, edge_type, fromNodeId, toNodeId));
                    var currentEl = newEdgeElements[newEdgeElements.length - 1];
                    elMap.edges[edgeName] = currentEl.attributes.element_id();
                    elMap.edges[altEdgeName] =
                        currentEl.attributes.element_id();
                }
            });
            if(null != toBeDupedElements &&
                typeof toBeDupedElements != "undefined") {
                if(null != toBeDupedElements.nodes &&
                    typeof toBeDupedElements.nodes != "undefined" &&
                    toBeDupedElements.nodes.length > 0) {
                    var prvrEdges =
                    _.filter(edgeModels, function(edgeModel, idx) {
                        var edge_type = self.getEdgeType(edgeModel);
                        return (edge_type == "pr-vr" || edge_type == "vr-pr");
                    });
                    _.each(prvrEdges, function(edgeModel, idx) {
                        var fromNodeId = edgeModel.attributes.from(),
                            toNodeId = edgeModel.attributes.to(),
                            fromNodeModel =
                                self.model.getNodeByElementId(fromNodeId),
                            toNodeModel =
                                self.model.getNodeByElementId(toNodeId);
                        if(null == fromNodeModel || null == toNodeModel)
                            return true;

                        var fromName = fromNodeModel.attributes.name(),
                            toName = toNodeModel.attributes.name(),
                            edgeName = fromName + "<->" + toName,
                            altEdgeName = toName + "<->" + fromName,
                            edge_type =
                            fromNodeModel.attributes.node_type().
                                split("-")[0][0] +
                            fromNodeModel.attributes.node_type().
                                split("-")[1][0] + '-' +
                            toNodeModel.attributes.node_type().
                                split("-")[0][0] +
                            toNodeModel.attributes.node_type().
                                split("-")[1][0];

                        if(edge_type == "pr-vr") {
                            toNodeModel.attributes.model().attributes.x =
                            fromNodeModel.attributes.model().attributes.x;
                            toNodeModel.attributes.model().attributes.y =
                            fromNodeModel.attributes.model().attributes.y + 100;
                        } else if(edge_type == "vr-pr") {
                            fromNodeModel.attributes.model().attributes.x =
                            toNodeModel.attributes.model().attributes.x;
                            fromNodeModel.attributes.model().attributes.y =
                            toNodeModel.attributes.model().attributes.y + 100;
                        }
                    });
                    var vrvmEdges =
                    _.filter(edgeModels, function(edgeModel, idx) {
                        var edge_type = self.getEdgeType(edgeModel);
                        return (edge_type == "vr-vm" || edge_type == "vm-vr");
                    });
                    var vrvmEdgesLen = vrvmEdges.length;
                    _.each(vrvmEdges, function(edgeModel, idx) {
                        var fromNodeId = edgeModel.attributes.from(),
                            toNodeId = edgeModel.attributes.to(),
                            fromNodeModel =
                                self.model.getNodeByElementId(fromNodeId),
                            toNodeModel =
                                self.model.getNodeByElementId(toNodeId);
                        if(null == fromNodeModel || null == toNodeModel)
                            return true;
                        var fromName = fromNodeModel.attributes.name(),
                            toName = toNodeModel.attributes.name(),
                            edgeName = fromName + "<->" + toName,
                            altEdgeName = toName + "<->" + fromName,
                            edge_type =
                            fromNodeModel.attributes.node_type().
                                split("-")[0][0] +
                            fromNodeModel.attributes.node_type().
                                split("-")[1][0] + '-' +
                            toNodeModel.attributes.node_type().
                                split("-")[0][0] +
                            toNodeModel.attributes.node_type().
                                split("-")[1][0];

                        if(edge_type == "vr-vm") {
                            if(vrvmEdgesLen == 1)
                                toNodeModel.attributes.model().attributes.x =
                                fromNodeModel.attributes.model().attributes.x;
                            toNodeModel.attributes.model().attributes.y =
                            fromNodeModel.attributes.model().attributes.y + 100;
                        } else if(edge_type == "vm-vr") {
                            if(vrvmEdgesLen == 1)
                                fromNodeModel.attributes.model().attributes.x =
                                toNodeModel.attributes.model().attributes.x;
                            fromNodeModel.attributes.model().attributes.y =
                            toNodeModel.attributes.model().attributes.y + 100;
                        }
                    });
                }
            }
            if(newNodeElements.length > 0) {
                network.addNode(newNodeElements);
            }
            if(newEdgeElements.length > 0) {
                network.addEdge(newEdgeElements);
            }
            _.each(underlayNodes, function(nodeModel) {
                var nodeId =
                    nodeModel.attributes.element_id();
                var nodeElement = network.network.findNode(nodeId);
                if(underlayNodePositions.hasOwnProperty(nodeId) &&
                    nodeElement && nodeElement.length == 1 &&
                    nodeElement[0] != undefined) {
                    nodeElement = nodeElement[0];
                    nodeElement.x = underlayNodePositions[nodeId].x;
                    nodeElement.y = underlayNodePositions[nodeId].y;
                }
            });
            if(existingNodes.length > 0) {
                if(restorePosition != false) {
                    _.each(existingNodes, function(nodeModel) {
                        var nodeId =
                            nodeModel.attributes.element_id();
                        if(mapPositions.hasOwnProperty(nodeId)) {
                            nodeModel.attributes.model().attributes.x =
                                mapPositions[nodeId].x;
                            nodeModel.attributes.model().attributes.y =
                                mapPositions[nodeId].y;
                        }
                    });
                }
                network.updateNode(existingNodes);
            }
            if(existingEdgeElements.length > 0) {
                network.updateEdge(existingEdgeElements);
            }
            if(restorePosition != false) {
                if(null != Object.keys(underlayNodePositions)[0] &&
                    typeof Object.keys(underlayNodePositions)[0] !=
                    "undefined") {
                    network.updateNode(underlayNodes);
                }
            }
            if(null == dblClickedElement ||
                typeof dblClickedElement == "undefined")
                network.setData(null, options);
            if((self.model.flowPath().model().attributes["nodes"] &&
                graphModel.flowPath().model().attributes["nodes"].length > 0) ||
                removeOther == true) {
                var underlayNodePositions =
                    ifNull(self.underlayNodePositions, {});
                _.each(underlayNodes, function(nodeModel) {
                    var nodeId =
                        nodeModel.attributes.element_id();
                    var nodeElement = network.network.findNode(nodeId);
                    if(underlayNodePositions.hasOwnProperty(nodeId) &&
                        nodeElement && nodeElement.length == 1 &&
                        nodeElement[0] != undefined) {
                        nodeElement = nodeElement[0];
                        nodeElement.x = underlayNodePositions[nodeId].x;
                        nodeElement.y = underlayNodePositions[nodeId].y;
                    }
                });
            }
            if(toBeDupedElements && toBeDupedElements.nodes.length > 0 &&
                toBeDupedElements.edges.length > 0) {
                self.addDimlightToConnectedElements();
                self.duplicatePaths(toBeDupedElements.nodes,
                    toBeDupedElements.edges);
            }
            if(null != dblClickedElement &&
                typeof dblClickedElement != "undefined") {
                var networkFit = false;
                if(self.lastDblClickedType == "") {
                    networkFit = true;
                } else if(self.lastDblClickedType == "tor") {
                    if(self.dblClickedType != "tor") {
                        networkFit = true;
                    } else {
                        if(nodeModelsLen == 0) {
                            networkFit = true;
                        }
                    }
                } else if(self.lastDblClickedType == ctwc.VROUTER) {
                    if(self.dblClickedType != ctwc.VROUTER) {
                        networkFit = true;
                    } else {
                        if(nodeModelsLen == 0) {
                            networkFit = true;
                        }
                    }
                }
                if(nodeModelsLen == 0) {
                    self.dblClickedType = "";
                    //networkFit = false;
                }
                if(//networkFit == true &&
                    self.levelExpand.hasOwnProperty(self.dblClickedType) &&
                    self.levelExpand[self.dblClickedType] == false) {
                    self.levelExpand[self.dblClickedType] = true;
                    self.network.network.fit();
                }
            }
            if(self.stabilized == true) {
                self.enableFreeflow(self.network);
                //self.saveAsSVG();
            }
        },
        saveAsSVG: function() {
            var self = this;
            var sourceCanvas =
                self.network.network.canvas.frame.canvas;
            var img_dataurl = sourceCanvas.toDataURL("image/svg+xml");
            console.log(img_dataurl)
        },
        populateModelAndAddToGraph: function() {
            var self = this;
            $('#' + ctwl.GRAPH_LOADING_ID).hide();
            var underlayNodes = self.model.getUnderlayNodes(),
                underlayEdges = self.model.getUnderlayEdges();
            var elements = underlayNodes.concat(underlayEdges);
            if (elements.length > 0) {
                var hashEls =
                    self.handleHashParams(underlayNodes, underlayEdges);
                underlayNodes = underlayNodes.concat(hashEls["nodes"]);
                underlayEdges = underlayEdges.concat(hashEls["edges"]);
                self.addElementsToNetwork(underlayNodes, underlayEdges);
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
                $("#"+ctwl.UNDERLAY_GRAPH_ID).
                    html(notFoundTemplate(notFoundConfig));
            }
        },

        markErrorNodes: function() {
            var graphModel = this.model;
            var errorNodes = graphModel.getErrorNodes();
            var elementMapNodes = ifNull(this.elementMap['nodes'], {});
            if (!$.isArray(errorNodes)) {
                errorNodes = [errorNodes];
            }
            var errorNodesLen = errorNodes.length;
            for (var i = 0; i < errorNodesLen; i++) {
                if (null != elementMapNodes[errorNodes[i].attributes.name()]) {
                    var node = errorNodes[i];
                    node.attributes.image(this.getImage("unknown", this.ERROR));
                }
            }
        },
        getSiblingNodesAndEdges: function(childName, parentName) {
            var self = this,
                parentModel =
                    self.model.getNodeByName(parentName),
                childModel =
                    self.model.getNodeByName(childName),
                hashNodes = [],
                hashEdges = [];

            if(null != parentModel) {
                var siblingModels =
                self.model.getChildModels(parentModel);
                if(siblingModels.hasOwnProperty("nodes")) {
                    if(siblingModels.nodes.length > 0)
                        hashNodes =
                        hashNodes.concat(siblingModels.nodes);
                }
                if(siblingModels.hasOwnProperty("edges")) {
                    if(siblingModels.edges.length > 0)
                        hashEdges =
                        hashEdges.concat(siblingModels.edges);
                }
            } else if(undefined != childModel) {
                hashNodes = hashNodes.concat(childModel);
            }
            return {
                nodes: hashNodes,
                edges: hashEdges
            };
        },
        handleHashParams: function(underlayNodes, underlayEdges) {
            var self = this,
                hashParams = layoutHandler.getURLHashParams(),
                hashNodes = [],
                hashEdges = [],
                modelsToAdd = {
                    nodes: [],
                    edges: []
                };

            if(hashParams.hasOwnProperty("name")) {
                //hash has a node to be selected
                var hashNodeName = hashParams.name;
                var nodeModel = self.model.getNodeByName(hashNodeName);
                if(undefined == nodeModel)
                    return modelsToAdd;

                //node found
                var chassis_type = nodeModel.attributes.chassis_type();
                switch (chassis_type) {
                    case "coreswitch":
                    case "spine":
                    case "tor":
                        if(hashParams.hasOwnProperty("expanded") &&
                            "true" == ""+hashParams["expanded"]) {
                            var childModels =
                            self.model.getChildModels(nodeModel);
                            if(childModels.hasOwnProperty("nodes") &&
                                childModels["nodes"].length > 0) {
                                hashNodes =
                                hashNodes.concat(childModels["nodes"]);
                            }
                            if(childModels.hasOwnProperty("edges") &&
                                childModels["edges"].length > 0) {
                                hashEdges =
                                hashEdges.concat(childModels["edges"]);
                            }
                            if(self.lastAddedElements != undefined) {
                                if(self.lastAddedElements.nodes !=
                                    undefined) {
                                    self.lastAddedElements.nodes =
                                    self.lastAddedElements.nodes.
                                        concat(hashNodes);
                                }
                                if(self.lastAddedElements.edges !=
                                    undefined) {
                                    self.lastAddedElements.edges =
                                    self.lastAddedElements.edges.
                                        concat(hashEdges);
                                }
                            }
                            self.dblClickedType = "tor";
                        }
                        break;
                    case "virtual-router":
                        if(hashParams.hasOwnProperty("parent")) {
                            var prName = hashParams["parent"];
                            var vrName = hashNodeName;
                            var models =
                            self.getSiblingNodesAndEdges(vrName, prName);
                            if(models.nodes.length > 0) {
                                hashNodes =
                                hashNodes.concat(models.nodes);
                            }
                            if(models.edges.length > 0) {
                                hashEdges =
                                hashEdges.concat(models.edges);
                            }
                        }
                        if(hashParams.hasOwnProperty("expanded") &&
                            "true" == ""+hashParams["expanded"]) {
                            var childModels =
                            self.model.getChildModels(nodeModel);
                            if(childModels.hasOwnProperty("nodes") &&
                                childModels["nodes"].length > 0) {
                                hashNodes =
                                hashNodes.concat(childModels["nodes"]);
                                if(self.lastAddedElements != undefined) {
                                    if(self.lastAddedElements.nodes !=
                                        undefined)
                                        self.lastAddedElements.nodes =
                                        self.lastAddedElements.nodes.
                                        concat(childModels["nodes"]);
                                    self.dblClickedType = ctwc.VROUTER;
                                }
                            }
                            if(childModels.hasOwnProperty("edges") &&
                                childModels["edges"].length > 0) {
                                hashEdges =
                                hashEdges.concat(childModels["edges"]);
                                if(self.lastAddedElements != undefined) {
                                    if(self.lastAddedElements.edges !=
                                        undefined)
                                        self.lastAddedElements.edges =
                                        self.lastAddedElements.edges.
                                        concat(childModels["edges"]);
                                    self.dblClickedType = ctwc.VROUTER;
                                }
                            }
                        }
                        break;
                    case "virtual-machine":
                        if(hashParams.hasOwnProperty("parent")) {
                            var vrName = hashParams["parent"];
                            var vmName = hashNodeName;
                            var models =
                            self.getSiblingNodesAndEdges(vmName, vrName);
                            if(models.nodes.length > 0) {
                                hashNodes =
                                hashNodes.concat(models.nodes);
                            }
                            if(models.edges.length > 0) {
                                hashEdges =
                                hashEdges.concat(models.edges);
                            }
                            if(hashParams.hasOwnProperty("gparent")) {
                                var prModel =
                                self.model.getNodeByName(
                                    hashParams["gparent"]);
                                if(null != prModel) {
                                    hashNodes =
                                    hashNodes.concat(prModel);
                                    var prvrEdgeModel =
                                    self.model.getEdgeByEndpoints(
                                        hashParams["gparent"],
                                        hashParams["parent"]);
                                    if(null != prvrEdgeModel) {
                                        hashEdges =
                                        hashEdges.concat(prvrEdgeModel);
                                    }
                                }
                            }
                        }
                        break;
                }
            }
            modelsToAdd.nodes = hashNodes;
            modelsToAdd.edges = hashEdges;
            return modelsToAdd;
        },
        removeUnderlayPathIds: function() {
            var network = this.network;
            var graphModel = this.model;
            var pathIds = this.underlayPathIds;
            var edgeIds = network.getEdgeIds();
            var edges = [];
            if(pathIds && pathIds.hasOwnProperty('edges')) {
                for (var i = 0; i < pathIds.edges.length; i++) {
                    var edgeToRemove =
                    graphModel.getEdgeByElementId(pathIds.edges[i]);
                    if(null != edgeToRemove) {
                        graphModel.edgesCollection.remove(edgeToRemove);
                        network.removeEdge(pathIds.edges[i]);
                    }
                }
            }
            if(pathIds && pathIds.hasOwnProperty('nodes')) {
                for (var i = 0; i < pathIds.nodes.length; i++) {
                    var nodeToRemove =
                        graphModel.getNodeByElementId(pathIds.nodes[i]);
                    if(null != nodeToRemove) {
                        graphModel.nodesCollection.remove(nodeToRemove);
                        network.removeNode(pathIds.nodes[i]);
                    }
                }
            }
            this.underlayPathIds = {
                nodes: [],
                edges: []
            };
        },
        addDimlightToConnectedElements: function() {
            var network = this.network;
            var _this = this;
            var nodeIds = network.getNodeIds();
            var edgeIds = network.getEdgeIds();
            var nodes = [];
            var mapPositions = {};
            var flowPathEdges = this.underlayPathIds.edges;
            for (var i = 0; i < nodeIds.length; i++) {
                var node = _this.model.getNodeByElementId(nodeIds[i]);
                if(null == node)
                    continue;
                var nodeEl = network.findNode(nodeIds[i]);
                if(nodeEl && nodeEl.length == 1 &&
                    nodeEl[0] != undefined) {
                    nodeEl = nodeEl[0];
                    node.attributes.model().set({"x": nodeEl.x},
                        {"silent": true})
                    node.attributes.model().set({"y": nodeEl.y})
                    mapPositions[nodeIds[i]] = {};
                    mapPositions[nodeIds[i]] = {
                        x: nodeEl.x,
                        y: nodeEl.y
                    }
                }
                if(node.attributes.chassis_type() == "unknown")
                    node.attributes.image("/img/router-error-dimlight.svg");
                else
                    node.attributes.image(
                        _this.getImage(
                            node.attributes.chassis_type(), _this.DIMLIGHT));
                nodes.push(node);
            }

            _.each(mapPositions, function(position, id) {
                for (var i = 0; i < nodes.length; i++) {
                    if (nodes[i].attributes.element_id() == id) {
                        continue;
                    }
                }
            });

            for (var i = 0; i < edgeIds.length; i++) {
                var edge = _this.model.getEdgeByElementId(edgeIds[i]);
                if(null != edge) {
                    if($.inArray(edgeIds[i], flowPathEdges) == -1) {
                        edge.attributes.model().set("color",
                            _this.style.defaultDimlight.color);
                    } else {
                        edge.attributes.model().set("color",
                            _this.style.flowPathDimlight.color);
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
            var flowPathEdges = self.underlayPathIds.edges;
            var mapPositions = {};

            for (var i = 0; i < nodeIds.length; i++) {
                var nodeModel =
                    self.model.getNodeByElementId(nodeIds[i]);
                var nodeEl = network.findNode(nodeIds[i]);
                if(nodeEl && nodeEl.length == 1 &&
                    nodeEl[0] != undefined && null != nodeModel) {
                    nodeEl = nodeEl[0];
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
                    if(nodeModel.attributes.chassis_type() == "unknown")
                        nodeModel.attributes.image("/img/router-error.svg");
                    else
                        nodeModel.attributes.image(
                            this.getImage(nodeModel.attributes.chassis_type(),
                                this.DEFAULT));
                }
                nodes.push(nodeModel);
            }
            if(restorePosition == false) {
                network.updateNode(nodes);
                return;
            }
            _.each(mapPositions, function(position, id) {
                for (var i = 0; i < nodes.length; i++) {
                    if (nodes[i].id == id) {
                        node.attributes.model().set({"x":position.x},
                            {"silent": true});
                        node.attributes.model().set({"y":position.y});
                        continue;
                    }
                }
            });
            var edges = [];
            for (var i = 0; i < edgeIds.length; i++) {
                var edge = self.model.getEdgeByElementId(edgeIds[i]);
                if(null == edge)
                    continue;
                if($.inArray(edgeIds[i], flowPathEdges) == -1) {
                    edge.attributes.color(self.style.defaultDimlight.color);
                } else {
                    if(network.network.getSelectedNodes().length > 0 ||
                        network.network.getSelectedEdges().length > 0) {
                        edge.attributes.color(
                            self.style.flowPathDimlight.color);
                    } else {
                        edge.attributes.color(
                            self.style.flowPathDefault.color);
                    }
                }
                edges.push(edge);
            }
            network.updateNode(nodes);
            network.updateEdge(edges);
        },
        addHighlightToNodesAndEdges: function(nodes, graphModel) {
            var elMap = this.elementMap;
            var errorNodes = graphModel.getErrorNodes();
            var _this = this;
            if (typeof nodes == "object" && nodes.length > 0) {
                var nodeNames = [];
                for (var i = 0; i < nodes.length; i++) {
                    var node = nodes[i],
                        name = node.name;
                    nodeNames.push(name);
                    var node_model_id =
                        jsonPath(elMap, '$.nodes[' + node.name + ']');
                    if (false !== node_model_id &&
                        typeof node_model_id === "object" &&
                        node_model_id.length === 1 &&
                        errorNodes.indexOf(name) == -1) {
                        node_model_id = node_model_id[0];
                        _this.addHighlightToNode(node_model_id);
                    }
                }

                $.each(elMap.edges, function(edge, edge_id) {
                    var endpoints = edge.split("<->");
                    var endpoint0 = endpoints[0];
                    var endpoint1 = endpoints[1];
                    if (nodeNames.indexOf(endpoint0) !== -1 &&
                        nodeNames.indexOf(endpoint1) !== -1) {
                        _this.addHighlightToEdge(edge_id);
                    }
                });
            }
        },

        addHighlightToNode: function(node_model_id) {
            var clickedElement = this.model.getNodeByElementId(node_model_id);
            if(null == clickedElement)
                return;
            clickedElement.attributes.image(
                this.getImage(clickedElement.attributes.chassis_type(),
                    this.HIGHLIGHT));
        },

        addHighlightToEdge: function(edge_model_id) {
            var clickedElement = this.model.getEdgeByElementId(edge_model_id);
            if(null == clickedElement)
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
                    data: function(node) {
                        return node;
                    },
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
                            iconClass: 'fa fa-cog'
                        });
                        ifLength =
                        getValueByJsonPath(node.attributes.more_attributes(),
                            "ifTable", []).length;
                        tooltipLblValues.push({
                            label: 'Name',
                            value: node.attributes.name()
                        });
                        if (null != node.attributes.errorMsg()) {
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
                    data: function(node) {
                        return node;
                    },
                    title: function(node) {
                        return tooltipTitleTmpl({
                            name: node.attributes.name(),
                            type: ctwl.TITLE_GRAPH_ELEMENT_VIRTUAL_ROUTER
                        });
                    },
                    content: function(node) {
                        var graphModel =
                            $("#"+ctwl.UNDERLAY_GRAPH_ID).data('graphModel');
                        var actions = [],
                            instances = graphModel.getVirtualMachines(),
                            ip = monitorInfraConstants.noDataStr;
                        var vms = 0,
                            name = node.attributes.name();
                        if(name.length <= 0)
                            name = "-";
                        var ipArr = getValueByJsonPath(
                            node.attributes.more_attributes(),
                            'VrouterAgent;self_ip_list', []);
                        if (ipArr.length > 0) {
                            ip = ipArr.join(',');
                        }
                        for (var i = 0; i < instances.length; i++) {
                            if (instances[i].attributes.
                                more_attributes().vrouter === name) {
                                vms++;
                            }
                        }

                        actions.push({
                            text: 'Configure',
                            iconClass: 'fa fa-cog'
                        });
                        actions.push({
                            text: 'Trace Flow',
                            iconClass: 'icon-exchange'
                        });
                        actions.push({
                            text: 'Map Flow',
                            iconClass: 'icon-exchange'
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
                                    p: 'config_infra_nodes'
                                });
                            }
                        });

                        actions.push({
                            callback: function(underlayGraphView) {
                              /*  graphModel.selectedElement().model().set({
                                    'nodeType': ctwc.VROUTER,
                                    'nodeDetail':
                                    node.data()["bs.popover"].
                                    options.data.attributes.
                                    model().attributes});*/
                                // Trace Flow Tab
                                $("#"+ctwc.UNDERLAY_TAB_ID).tabs({active:1});
                                /*graphModel.selectedElement().model().set({
                                    'nodeType': '',
                                    'nodeDetail': {}},{silent:true});
                                    */
                            }
                        });
                        actions.push({

                            callback: function(underlayGraphView) {
                              /*  graphModel.selectedElement().model().set({
                                    'nodeType': ctwc.VROUTER,
                                    'nodeDetail':
                                    node.data()["bs.popover"].
                                    options.data.attributes.
                                    model().attributes});
                                */
                                // Map Flow Tab
                                $("#"+ctwc.UNDERLAY_TAB_ID).tabs({active:0});
                                // Re Run the query
                                $("#run_query").find("button").click();
                                /*underlayGraphView.rootView.viewMap.
                                    traceflow_radiobtn_name.model.
                                    traceflow_radiobtn_name('vRouter');
                                underlayGraphView.rootView.viewMap.
                                    vrouter_dropdown_name.model.
                                    vrouter_dropdown_name(
                                        node.data()["bs.popover"].
                                        options.data.attributes.
                                        model().attributes.name);
                                graphModel.selectedElement().model().set({
                                    'nodeType': '',
                                    'nodeDetail': {}},{silent:true});
                                    */
                            }
                        });
                        return actions;
                    }
                },
                "virtual-machine": {
                    data: function(node) {
                        return node;
                    },
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
                        var fip_addr = "";
                        var fip_addr_arr = [];
                        for (var i = 0; i < instances.length; i++) {
                            if (instances[i].attributes.name()
                                === instanceUUID) {
                                var attributes =
                                    ifNull(instances[i].attributes.
                                        more_attributes(), {}),
                                    ipArr = [],
                                    vnArr = [];
                                var interfaceList =
                                    ctwu.getDataBasedOnSource(
                                    ifNull(attributes['interface_list'], []));
                                label = "Name";
                                instanceName = attributes['vm_name'];
                                for (var j = 0; j < interfaceList.length; j++) {
                                    if (interfaceList[j]['virtual_network']
                                        != null)
                                        vnArr.push(
                                        interfaceList[j]['virtual_network']);
                                    if (interfaceList[j]['ip6_active'] &&
                                        interfaceList[j]['ip6_address'] !=
                                        '0.0.0.0')
                                        ipArr.push(
                                            interfaceList[j]['ip6_address']);
                                    else if (interfaceList[j]['ip_address'] !=
                                        '0.0.0.0')
                                        ipArr.push(
                                            interfaceList[j]['ip_address']);
                                    fip_addr_arr =
                                    getValueByJsonPath(
                                        interfaceList[j], "floating_ips", []);
                                    if (fip_addr != "")
                                        fip_addr += ", ";
                                    fip_addr +=
                                    _.pluck(fip_addr_arr,
                                        'ip_address').join(', ');
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
                        actions.push({
                            text: 'Trace Flow',
                            iconClass: 'icon-exchange'
                        });
                        tooltipContent = {
                            iconClass:
                                'icon-contrail-virtual-machine font-size-30',
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

                        if (fip_addr != "") {
                            tooltipLblValues.push({
                                label: "Floating IP(s)",
                                value: fip_addr
                            });
                        }
                        tooltipContent['info'] = tooltipLblValues;
                        return tooltipContentTmpl(tooltipContent);
                    },
                    actionsCallback: function(node) {
                        var actions = [];
                        actions.push({
                            callback: function(underlayGraphView) {
                                /*
                                graphModel.selectedElement().model().set({
                                    'nodeType': ctwc.VIRTUALMACHINE,
                                    'nodeDetail':
                                    node.data()["bs.popover"].
                                    options.data.attributes.
                                    model().attributes});
                                  */

                                $("#"+ctwc.UNDERLAY_TAB_ID).tabs({active:1});
                                /*
                                underlayGraphView.rootView.viewMap.
                                    traceflow_radiobtn_name.model.
                                    traceflow_radiobtn_name('instance');
                                underlayGraphView.rootView.viewMap.
                                    instance_dropdown_name.model.
                                    instance_dropdown_name(
                                        node.data()["bs.popover"].
                                        options.data.attributes.
                                        model().attributes.name);
                                graphModel.selectedElement().model().set({
                                    'nodeType': '',
                                    'nodeDetail': {}},{silent:true});
                              */
                            }
                        });
                        return actions;
                    }
                },
                "bare-metal-server": {
                    data: function(node) {
                        return node;
                    },
                    title: function(node) {
                        var bmsName = node.attributes.name();
                        return tooltipTitleTmpl({
                            name: bmsName,
                            type: ctwl.TITLE_GRAPH_ELEMENT_BMS
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
                        var instances = graphModel.getBareMetalServer();
                        var fip_addr = "";
                        var fip_addr_arr = [];

                        if ("" == instanceName)
                            instanceName = node.attributes.name();
                       tooltipContent = {
                            iconClass:
                                'icon-contrail-virtual-machine font-size-30',
                            actions: actions
                        };
                        tooltipLblValues = [{
                            label: "Name",
                            value: instanceName
                        }];
                        tooltipContent['info'] = tooltipLblValues;
                        return tooltipContentTmpl(tooltipContent);
                    },

                    actionsCallback: function(node) {
                        var actions = [];
                        actions.push({
                            callback: function(underlayGraphView) {

                            }
                        });
                        return actions;
                    }
                },
                edge: {
                    title: function(edge) {
                        var graphModel =
                            $("#"+ctwl.UNDERLAY_GRAPH_ID).data('graphModel');
                        var instances =
                            graphModel.getVirtualMachines(graphModel.nodes());
                        var instanceName1 = "";
                        var instanceName2 = "";
                        var endpoint1 = edge.attributes.endpoints()[0];
                        var endpoint2 = edge.attributes.endpoints()[1];
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
                            name: instanceName1 + ctwc.LINK_CONNECTOR_STRING +
                                instanceName2,
                            type: ctwl.TITLE_GRAPH_ELEMENT_CONNECTED_NETWORK
                        });
                    },
                    content: function(edge) {
                        var local_interfaces = [];
                        var remote_interfaces = [];
                        if (edge.attributes.more_attributes() &&
                            "-" !== edge.attributes.more_attributes() &&
                            edge.attributes.more_attributes().length > 0) {
                            var moreAttrs = edge.attributes.more_attributes();
                            for (var i = 0; i < moreAttrs.length; i++) {
                                local_interfaces.push(
                                    " " + moreAttrs[i].local_interface_name +
                                    " (" + moreAttrs[i].local_interface_index +
                                    ")");
                                remote_interfaces.push(
                                    " " + moreAttrs[i].remote_interface_name +
                                    " (" + moreAttrs[i].remote_interface_index +
                                    ")");
                            }
                        }
                        data = [{
                            label: edge.attributes.endpoints()[0],
                            value: local_interfaces
                        }, {
                            label: edge.attributes.endpoints()[1],
                            value: remote_interfaces
                        }];
                        return tooltipContentTmpl({
                            info: data,
                            iconClass: 'fa fa-arrows-h'
                        });
                    }
                }
            };
        },

        resetTopology: function(options) {
            var self = this;
            var underlayGraphModel = self.model;
            self.toBeDupedElements = {
                "nodes": [],
                "edges": []
            };
            var restorePosition = options.restorePosition;
            self.addElementsToNetwork([], [], null, true, false);
            self.resetConnectedElements(restorePosition);
            this.markErrorNodes();
            if (options['resetBelowTabs'] == true) {
                underlayUtils.removeUnderlayTabs(
                    self.rootView.viewMap[ctwc.UNDERLAY_TABS_VIEW_ID]);
            }
            underlayGraphModel.selectedElement().model().set({
                'nodeType': '',
                'nodeDetail': {}});
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
                case "bare-metal-server":
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
                "stabilized"                    : self.stabilizedHandler
            };
        },
        zoomHandler: function(params, graphView) {
            var self = graphView;
            self.levelExpand = {
                            "tor" : false,
                            "virtual-router": false,
                            "virtual-machine": false
                            }
            self.rearrangeHandler({}, self);
        },
        clickHandler: function(params, contrailVisView) {
            var t0 = new Date();
            var parameters = params;
            var self = contrailVisView.caller;
            var _network = contrailVisView.network;
            if (params.nodes.length == 1) {
                self.addDimlightToConnectedElements();
                var clickedElement =
                    _network.canvas.body.nodes[params.nodes[0]];
                var node = self.model.getNodeByElementId(params.nodes[0]);

                if(null == node)
                    return;
                if( typeof clickedElement == "undefined" ||
                          typeof clickedElement.options == "undefined"){
                  self.resetTopology({
                      resetBelowTabs: true
                  });
                  return;
                }

                var chassis_type = clickedElement.options.chassis_type;
                node.attributes.image(
                    self.getImage(chassis_type, self.HIGHLIGHT));
            } else if (params.edges.length == 1) {
                self.addDimlightToConnectedElements();
                var clickedElement =
                    _network.canvas.body.edges[params.edges[0]];
                var edge = self.model.getEdgeByElementId(params.edges[0]);
                if(null == edge || clickedElement == undefined)
                    return;
                edge.attributes.color(self.style.defaultSelected.color);
                var targetElement = clickedElement.to;
                var sourceElement = clickedElement.from;
                var endpoints = [sourceElement['options']['name'],
                    targetElement['options']['name']];
                self.addHighlightToNodesAndEdges(
                    [targetElement['options'], sourceElement['options']],
                    graphModel);
            } else if (params.edges.length == 0 && params.nodes.length == 0) {
                $(".vis-network-tooltip").popover("hide");
            }
            if(t0 - self.doubleClickTime > self.threshold) {
            timeout = setTimeout(function() {
                var self = contrailVisView.caller;
                    if (t0 - self.doubleClickTime > self.threshold) {
                if($("#resetTopologyModal").is(":visible")) {
                    return;
                }
                var params = parameters;
                var network = contrailVisView;
                var _network = network.network;
                if (params.nodes.length == 1) {
                    var clickedElement =
                        _network.canvas.body.nodes[params.nodes[0]];
                    var node =
                        self.model.getNodeByElementId(params.nodes[0]);
                    if(null == node)
                        return;
                    if( typeof clickedElement == "undefined" ||
                              typeof clickedElement.options == "undefined"){
                      self.resetTopology({
                          resetBelowTabs: true
                      });
                      return
                    }

                    var elementType = clickedElement.options.node_type;
                    switch (elementType) {
                        case ctwc.PROUTER:
                            var nodeDetails = clickedElement.options;
                            if (nodeDetails['more_attributes']['ifTable'] =='-')
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
                        case ctwc.BARE_METAL_SERVER:
                            var nodeDetails = clickedElement.options;
                            graphModel.selectedElement().model().set({
                                'nodeType': ctwc.BARE_METAL_SERVER,
                                'nodeDetail': nodeDetails});
                            graphModel.selectedElement().model().set({
                                'nodeType': '',
                                'nodeDetail': {}},{silent:true});
                            break;
                    }
                    var newQueryParams = {
                        selected: clickedElement.options.name
                    };
                    var oldQueryParams = layoutHandler.getURLHashParams();
                    if(oldQueryParams.hasOwnProperty("expanded"))
                        newQueryParams["expanded"] = true;
                    if(oldQueryParams.hasOwnProperty("tab") &&
                        oldQueryParams["tab"].hasOwnProperty("underlayTabs") &&
                        contrailVisView.manual == true) {
                        newQueryParams["tab"] = {
                            "underlayTabs":
                                oldQueryParams["tab"]["underlayTabs"]
                        };
                    }
                    if(oldQueryParams.hasOwnProperty("path") &&
                        oldQueryParams["path"].hasOwnProperty("nodes") &&
                        oldQueryParams["path"].hasOwnProperty("edges") &&
                        oldQueryParams["path"].hasOwnProperty("postData") &&
                        oldQueryParams["path"]["postData"]
                            .hasOwnProperty("action") &&
                        oldQueryParams["path"]["postData"]
                            .hasOwnProperty("srcIP") &&
                        oldQueryParams["path"]["postData"]
                            .hasOwnProperty("destIP") &&
                        oldQueryParams["path"]["postData"]
                            .hasOwnProperty("srcPort") &&
                        oldQueryParams["path"]["postData"]
                            .hasOwnProperty("destPort")) {
                        newQueryParams["path"] = oldQueryParams["path"];
                    }
                    if(oldQueryParams.hasOwnProperty("name"))
                        newQueryParams["name"] = oldQueryParams["name"];
                    if(contrailVisView.manual == true) {
                        newQueryParams["name"] = clickedElement.options.name;
                    }
                    if(oldQueryParams.hasOwnProperty("parent"))
                        newQueryParams["parent"] = oldQueryParams["parent"];
                    if(oldQueryParams.hasOwnProperty("gparent"))
                        newQueryParams["gparent"]=oldQueryParams["gparent"];

                    layoutHandler.setURLHashParams(newQueryParams, {
                        p: 'mon_infra_underlay',
                        merge: false
                    });
                } else if (params.edges.length == 1) {
                    var data = {};
                    var clickedElement =
                        _network.canvas.body.edges[params.edges[0]];
                    var targetElement = clickedElement.to;
                    var sourceElement = clickedElement.from;
                    var endpoints = [sourceElement['options']['name'],
                        targetElement['options']['name']];
                    self.addHighlightToNodesAndEdges(
                        [targetElement['options'],
                        sourceElement['options']],
                        graphModel);
                    var edgeDetail = {};
                    edgeDetail['endpoints'] = endpoints;
                    edgeDetail['sourceElement'] = sourceElement['options'];
                    edgeDetail['targetElement'] = targetElement['options'];
                    graphModel.selectedElement().model().set({
                        'nodeType': ctwc.UNDERLAY_LINK,
                        'nodeDetail': edgeDetail});
                    graphModel.selectedElement().model().set({
                        'nodeType': '',
                        'nodeDetail': {}},{silent:true});
                    var queryParams = {
                        endpoints: endpoints.join("|")
                    };
                    layoutHandler.setURLHashParams(queryParams, {
                        p: 'mon_infra_underlay',
                        merge: true
                    });
                }
                }
                self.doubleClickTime = 0;
            }, self.threshold);

            }
        },
        blurNodeHandler: function(params, contrailVisView) {
            var self = contrailVisView.caller;
            self.resetTooltip();
        },
        dragStartHandler: function(params, contrailVisView) {
            var self = contrailVisView.caller;
            self.resetTooltip();
            self.removeUnderlayPathIds();
        },
        dragEndHandler: function(params, contrailVisView) {
            var self = contrailVisView.caller;
            self.resetTooltip();
            self.duplicatePaths(self.toBeDupedElements.nodes,
                self.toBeDupedElements.edges);
        },
        stabilizedHandler: function(params, contrailVisView) {
            var self = contrailVisView.caller;
            self.saveUnderlayNodePositions();
            self.enableFreeflow(contrailVisView);
            var hashParams = layoutHandler.getURLHashParams();
            if(self.stabilized == false) {
                self.stabilized = true;
                if(hashParams.hasOwnProperty("path") &&
                    underlayUtils.tabsRendered(self.rootView.
                        viewMap[ctwc.UNDERLAY_TABS_VIEW_ID])) {
                    var edges = [],
                        nodes = [];
                    if(hashParams["path"].hasOwnProperty("nodes") &&
                        hashParams["path"].hasOwnProperty("edges") &&
                        hashParams["path"]["nodes"].length > 0 &&
                        hashParams["path"]["edges"].length > 0) {
                        var nodeSplit = hashParams["path"]["nodes"].split(","),
                            edgeSplit = hashParams["path"]["edges"].split(","),
                            postData = hashParams["path"]["postData"];
                        graphModel.underlayPathReqObj(postData);
                        for(var i=0; i<nodeSplit.length; i++) {
                            var node_type_split = nodeSplit[i].split("<->");
                            nodes.push({
                                name: node_type_split[0],
                                node_type: node_type_split[1]
                            });
                        }
                        for(var i=0; i<edgeSplit.length; i++) {
                            edges.push({
                                endpoints: edgeSplit[i].split("<->")
                            });
                        }
                        underlayUtils.addUnderlayFlowInfoToBreadCrumb({
                            action: postData['action'],
                            sourceip: postData['srcIP'],
                            destip: postData['destIP'],
                            sport: postData['srcPort'],
                            dport: postData['destPort']
                        });
                        graphModel.flowPath().model().set('nodes', nodes,
                            {silent: true});
                        graphModel.flowPath().model().set('edges', edges,
                            {silent: true});
                        graphModel.flowPath().model().trigger('change:nodes');
                    }
                }
                if(hashParams.hasOwnProperty("selected") &&
                    !hashParams.hasOwnProperty("endpoints") &&
                    underlayUtils.tabsRendered(self.rootView.
                        viewMap[ctwc.UNDERLAY_TABS_VIEW_ID])) {
                    //hash has a node to be selected
                    var hashNodeName = hashParams.selected;
                    var nodeModel = self.model.getNodeByName(hashNodeName);
                    if(null != nodeModel) {
                        //node found, handle click
                        self.clickHandler({
                            nodes: [nodeModel.attributes.element_id()],
                            edges: []
                        }, {
                            network: self.network.network,
                            caller: self,
                            manual: true
                        });
                    }
                }
                if(hashParams.hasOwnProperty("endpoints") &&
                    underlayUtils.tabsRendered(self.rootView.
                        viewMap[ctwc.UNDERLAY_TABS_VIEW_ID])) {
                    //hash has a edge to be selected
                    var hashEndpoints = hashParams.endpoints.split("|");
                    var edgeModel =
                        self.model.getEdgeByEndpoints(hashEndpoints[0],
                            hashEndpoints[1]);
                    if(null != edgeModel) {
                        //node found, handle click
                        self.clickHandler({
                            nodes: [],
                            edges: [edgeModel.attributes.element_id()]
                        }, {
                            network: self.network.network,
                            caller: self,
                            manual: true
                        });
                    }
                }
            }
            self.stabilized = true;
            //self.initTest();
        },
        saveUnderlayNodePositions: function() {
            var self = this;
            var underlayNodes = self.model.getUnderlayNodes();
            var underlayNodePositions = {};
            _.each(underlayNodes, function(nodeModel) {
                var nodeElement =
                self.network.network.
                    findNode(nodeModel.attributes.element_id());
                if(nodeElement && nodeElement.length == 1 &&
                    nodeElement[0] != undefined) {
                    nodeElement = nodeElement[0];
                    if(null != nodeElement) {
                        underlayNodePositions[nodeElement.id] = {
                            x: nodeElement.x,
                            y: nodeElement.y
                        }
                    }
                }
            });
            self.underlayNodePositions = underlayNodePositions;
        },
        showPopupHandler: function(params, contrailVisView) {
            var self = contrailVisView.caller;
            var elementId = params;
            var timer = null;
            var _network = contrailVisView.network;
            var tooltipConfig = null;
            var hoveredElement = _network.canvas.body.nodes[elementId];
            if(!hoveredElement) {
                //not a node. check if edges with elementId present.
                hoveredElement = _network.body.data.edges._data[elementId];
                tooltipConfig = hoveredElement.tooltipConfig;
                if(!hoveredElement || !tooltipConfig)
                    return; //return if not a node or edge or no tooltip config
            } else {
                tooltipConfig = hoveredElement.options.tooltipConfig;
            }

            self.tooltipConfigWidth = tooltipConfig.dimension.width;
            self.tooltipConfigHeight = tooltipConfig.dimension.height;
            var ttPosition = $(".vis-network-tooltip").position();
            var cursorPosition = {};
            if(isNaN(hoveredElement.x) &&
                isNaN(hoveredElement.y)) {
                cursorPosition = _network.DOMtoCanvas({
                    x:self.cursorPosition.x,
                    y:self.cursorPosition.y
                });
                var diffPosition = {
                    left: cursorPosition.x,
                    top: cursorPosition.y
                };
                $(".vis-network-tooltip").popover("destroy");
                $(".vis-network-tooltip").position(diffPosition);
            } else {
                cursorPosition = _network.canvasToDOM({
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
                $(".vis-network-tooltip").popover("destroy");
                $(".vis-network-tooltip").offset(diffPosition);
            }

            var tt = $(".vis-network-tooltip").popover({
                trigger: 'hover',
                html: true,
                animation: false,
                data: tooltipConfig.data,
                placement: function (context, src) {
                    //src is div.vis-network-tooltip
                    //context is div.popover
                    $(context).off().on("mouseleave", function(e) {
                        self.resetTooltip();
                    });
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
                    /*if(this.options.data.attributes.
                        hasOwnProperty('endpoints'))
                        return 'left';*/
                    if (srcOffset.left > tooltipWidth) {
                        return 'left';
                    } else if (bodyWidth - (srcOffset.left) -
                        srcWidth > tooltipWidth) {
                        return 'right';
                    } else if (srcOffset.top > bodyHeight / 2) {
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
                  actionsCallback[actionKey].callback(self);
                  $('.popover').hide();

            });
            $('.popover').find('i.fa-remove').on('click', function() {
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
            $("#" + ctwl.BOTTOM_CONTENT_CONTAINER).on("hover", function(e) {
                self.resetTooltip();
            });
        },
        doubleClickHandler: function(params, contrailVisView) {
            var self = contrailVisView.caller;
            self.doubleClickTime = new Date();
            if (params.nodes.length == 1) {
                var nodeName = getCookie('nodeDoubleClick_NodeName');
                if(self.lastAddedElements.nodes.length > 0 && nodeName == params.nodes[0]){
                    self.collapseNodes(params, contrailVisView);
                    setCookie('nodeDoubleClick_NodeName', "");
                }
                else if(getCookie('nodeDoubleClick')+"" != "true" &&
                    (self.underlayPathIds.nodes.length > 0 ||
                    self.underlayPathIds.edges.length > 0)) {
                    var textTemplate =
                    contrail.getTemplate4Id(
                        "monitor-infra-topology-reset-template");
                    cowu.createModal({
                        'modalId': 'resetTopologyModal',
                        'className': 'modal-500',
                        'title': 'Clear map/trace flow',
                        'btnName': 'Confirm',
                        'body': textTemplate(),
                        'onSave': function () {
                            if($("#remember-reset-topology").prop("checked") ==
                                true)
                                setCookie('nodeDoubleClick', true);

                            self.expandNodes(params, contrailVisView);
                            $("#resetTopologyModal").modal('hide');
                        },
                        'onCancel': function () {
                            if($("#remember-reset-topology").prop("checked") ==
                                true)
                                setCookie('nodeDoubleClick', true);
                            $("#resetTopologyModal").modal('hide');
                        }
                    });
                } else {
                    self.expandNodes(params, contrailVisView);
                    setCookie('nodeDoubleClick', true);
                    setCookie('nodeDoubleClick_NodeName', params.nodes[0]);
                }
            } else if(params.nodes.length == 0 && params.edges.length == 0) {
                self.resetConnectedElements();
                underlayUtils.removeUnderlayTabs(
                    self.rootView.childViewMap[ctwl.UNDERLAY_TOPOLOGY_PAGE_ID].
                    childViewMap[ctwc.UNDERLAY_TABS_VIEW_ID]
                );
            }
            self.rearrangeHandler({}, self);
            $('.popover').hide();
        },
        refreshHandler: function(e, underlayGraphView) {
            var self = underlayGraphView;

            self.removeUnderlayPathIds();
            self.removeUnderlayEffects();
            self.toBeDupedElements = {
                "nodes": [],
                "edges": []
            };
            self.clearData();
            self.attributes.viewConfig.listModel.refreshData();
            self.rearrangeHandler({}, self);
        },
        clearData: function() {
            var self = this;
            //Empty network graph;
            self.clearNetwork();
            self.clearModels();
        },
        clearModels: function() {
            var self = this,
                model = self.model,
                nodesCollection = model.nodesCollection,
                edgesCollection = model.edgesCollection;
            nodesCollection.reset(null);
            edgesCollection.reset(null);
        },
        clearNetwork: function() {
            var self = this,
                network = self.network;
            var nodeIdsInNetwork = network.getNodeIds(),
                edgeIdsInNetwork = network.getEdgeIds(),
                removedNodes = [],
                removedEdges = [];
            _.each(nodeIdsInNetwork, function(nodeId, idx) {
                var nodeInNetwork = network.getNode(nodeId);
                if(null != nodeInNetwork &&
                    typeof nodeInNetwork != "undefined") {
                    removedNodes.push(nodeInNetwork);
                }
            });

            _.each(edgeIdsInNetwork, function(edgeId, idx) {
                var edgeInNetwork = network.getEdge(edgeId);
                if(null != edgeInNetwork &&
                    typeof edgeInNetwork != "undefined") {
                    removedEdges.push(edgeInNetwork);
                }
            });
            if(removedNodes.length > 0) {
                network.removeNode(removedNodes);
            }
            if(removedEdges.length > 0) {
                network.removeEdge(removedEdges);
            }
            self.elementMap["nodes"] = {};
            self.elementMap["edges"] = {};
            self.stabilized = false;
        },
        rearrangeHandler: function(e, underlayGraphView) {
            var self = underlayGraphView;
            var network = self.network;
            var nodeIds = network.getNodeIds();
            var nodes = [];
            if(graphModel.flowPath().model().attributes["nodes"].length > 0 ||
                graphModel.flowPath().model().attributes["edges"].length > 0) {
                var nodes = graphModel.flowPath().model().attributes["nodes"];
                var edges = graphModel.flowPath().model().attributes["edges"];
                self.showFlowPath(nodes, edges);
                self.enableFreeflow(network);
            } else {
                _.each(nodeIds, function(id, idx) {
                    if($.inArray(id, self.underlayPathIds.nodes) == -1) {
                        var node = network.findNode(id);
                        if(node && node.length == 1 &&
                            node[0] != undefined) {
                            node = node[0];
                            node.x = 0;
                            node.y = 0;
                            nodes.push(node);
                        }
                    }
                });
                if(nodes.length > 0) {
                    var options = self.visOptions;
                    options.physics = {
                        "enabled" : true,
                        "stabilization" : {
                            "fit": true
                        }
                    };
                    network.setOptions(options);
                    network.setData();
                }
            }
        },
        getNavigationsConfig: function() {
            var self = this;
            //Zoom-in/out/reset always appears.
            //There are additional navigations required on map
            //For each items in navConfig, increase 40 pixels
            //starting at '130px', specifiy as a class name in CSS.
            var navConfig = {
                "refresh": {
                    "id"    : "refresh",
                    "class" : "vis-refresh",
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
        },
        /*initTest: function() {
            var self = this;
            require([
                'monitor/infrastructure/underlay/ui/js/hardcodeTestWrapper'
                ], function(hardcodeTestWrapper) {
                hardcodeTestWrapper.initTest(self);
            });
        }*/
    });

    return UnderlayGraphView;
});
