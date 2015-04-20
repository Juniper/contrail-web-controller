/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 *
 * Underlay Overlay Visualisation Page
 */

var underlayRenderer = new underlayRenderer();
var PROUTER_DBL_CLICK =  'config_net_vn';
var PROUTER = 'physical-router';
var VROUTER = 'virtual-router';
var VIRTUALMACHINE = 'virtual-machine';
var ZOOMED_OUT = 0;
var timeout;
var expanded = true;

function underlayRenderer() {
    this.load = function(obj) {
        this.configTemplate = Handlebars.compile($("#visualization-template").html());
        Handlebars.registerPartial("deviceSummary", $("#device-summary-template").html());
        Handlebars.registerPartial('underlayTabsHtml',$('#underlay-tabs').html());
        $("#content-container").html('');
        $("#content-container").html(this.configTemplate);
        currTab = 'mon_infra_underlay';
        this.model = new underlayModel({nodes:[], links:[]});
        this.view  = new underlayView(this.model);
        this.controller = new underlayController(this.model, this.view);
        this.controller.getModelData();
    }

    this.getModel = function() {
        return this.model;
    }

    this.getView = function() {
        return this.view;
    }

    this.getController = function() {
        return this.controller;
    }

    this.destroy = function() {
        this.getModel().destroy();
        this.getView().destroy();
        this.getController().destroy();
    }
}

var underlayModel = function(data) {
    this.nodes             = [];
    this.links             = [];
    this.tors              = [];
    this.spines            = [];
    this.cores             = [];
    this.vrouters          = [];
    this.vms               = [];
    this.vns               = [];
    this.tree              = {};
    if(data && data.hasOwnProperty('nodes') && data.nodes.length>0) {
        this.setNodes(data.nodes);
        this.setLinks(data.links);
        this.updateChassisType(data.nodes);
        this.categorizeNodes(data.nodes);
        this.formTree();
    } else {
        this.setNodes([]);
        this.setLinks([]);
    }
}

underlayModel.prototype.updateChassisType = function() {
    var nodes = this.getNodes();
    for(var i=0; i<nodes.length; i++) {
        if(nodes[i].chassis_type === "-") {
            nodes[i].chassis_type = nodes[i].node_type;
        }
    }
    this.setNodes(nodes);
}

underlayModel.prototype.getChildChassisType = function(parent_chassis_type) {
    switch (parent_chassis_type) {
        case "coreswitch":
            return "spine";
        case "spine":
            return "tor";
        case "tor":
            return "virtual-router";
        case "virtual-router":
            return "virtual-machine";
    }
}

underlayModel.prototype.parseTree = function(parents, tree) {
    if(null !== parents && false !== parents && 
        typeof parents === "object" && parents.length > 0) {
        for(var i=0; i<parents.length; i++) {
            var parent_chassis_type = parents[i].chassis_type;
            var children_chassis_type = this.getChildChassisType(parent_chassis_type);
            tree[parents[i].name] = parents[i];
            var children = this.getChildren(parents[i].name, children_chassis_type)
            tree[parents[i].name]["children"] = {};
            this.parseTree(children, tree[parents[i].name]["children"]);
        }
    }
    return tree;
}

underlayModel.prototype.formTree = function() {
    var nodes = this.getNodes();
    var links = this.getLinks();
    var cores = this.getCores();
    var tree = this.getTree();
    var firstLevelNodes = [];
    if(cores.length > 0) {
        firstLevelNodes = cores;
    } else {
        var spines = this.getSpines();
        if(spines.length > 0) {
            firstLevelNodes = spines;
        } else {
            var tors = this.getTors();
            if(tors.length > 0) {
                firstLevelNodes = tors;
            }
        }
    }
    this.parseTree(firstLevelNodes, tree);
    this.setTree(tree);
}

underlayModel.prototype.getNodes = function() {
    return this.nodes;
}

underlayModel.prototype.getLinks = function() {
    return this.links;
}

underlayModel.prototype.getTors = function() {
    return this.tors;
}

underlayModel.prototype.getSpines = function() {
    return this.spines;
}

underlayModel.prototype.getCores = function() {
    return this.cores;
}

underlayModel.prototype.getVrouters = function() {
    return this.vrouters;
}

underlayModel.prototype.getVMs = function() {
    return this.vms;
}

underlayModel.prototype.getVNs = function() {
    return this.vns;
}

underlayModel.prototype.getTree = function() {
    return this.tree;
}

underlayModel.prototype.getChildren = function(parent, child_type) {
    if(null == parent || typeof parent === "undefined" || false == parent ||
        typeof parent === "object")
        return [];
    if(typeof parent === "string" && "" === parent.trim())
        return [];
    if(null == child_type || typeof child_type === "undefined" || false == child_type ||
        typeof child_type === "object")
        return [];
    if(typeof child_type === "string" && "" === child_type.trim())
        return [];
    parent = parent.trim();
    child_type = child_type.trim();
    var nodes = this.getNodes();
    var links = this.getLinks();
    var srcPoint = jsonPath(links, "$[?(@.endpoints[0]=='" + parent + "')]");
    var dstPoint = jsonPath(links, "$[?(@.endpoints[1]=='" + parent + "')]");
    var children = [], childNodes = [];
    if(false !== srcPoint && srcPoint.length > 0) {
        for(var i=0; i<srcPoint.length; i++) {
            var sp = srcPoint[i].endpoints;
            var otherEndNode =
                jsonPath(nodes, "$[?(@.name=='" + sp[1] + "')]");
            if(false !== otherEndNode && otherEndNode.length == 1 &&
                otherEndNode[0].chassis_type == child_type) {
                children.push(otherEndNode[0].name);
            }
        }
    }
    if(false !== dstPoint && dstPoint.length > 0) {
        for(var i=0; i<dstPoint.length; i++) {
            var sp = dstPoint[i].endpoints;
            var otherEndNode =
                jsonPath(nodes, "$[?(@.name=='" + sp[0] + "')]");
            if(false !== otherEndNode && otherEndNode.length == 1 &&
                otherEndNode[0].chassis_type == child_type) {
                children.push(otherEndNode[0].name);
            }
        }
    }
    children = children.unique();
    for(var i=0; i<children.length; i++) {
        var childNode = jsonPath(nodes, "$[?(@.name=='" + children[i] + "')]");
        if(null !== childNode  && false !== childNode && typeof childNode === "object" &&
            childNode.length == 1) {
            childNode = childNode[0];
            childNodes.push(childNode);
        }
    }
    return childNodes;
}

underlayModel.prototype.getSpinesUnderCore = function(core) {
    return this.getChildren(core, "spine");
}

underlayModel.prototype.getTorsUnderSpine = function(spine) {
    return this.getChildren(spine, "tor");
}

underlayModel.prototype.getVroutersUnderTor = function(tor) {
    return this.getChildren(tor, "virtual-router");
}

underlayModel.prototype.getVMsUnderVrouter = function(vrouter) {
    return this.getChildren(vrouter, "virtual-machine");
}

underlayModel.prototype.getVNsUnderVrouter = function(vrouter) {
    return this.getChildren(vrouter, "virtual-network");
}

underlayModel.prototype.setTors = function(tors) {
    if(null !== tors && typeof tors !== "undefined" &&
        tors.length > 0) {
        this.tors = tors;
    } else {
        this.tors = [];
    }
}

underlayModel.prototype.setSpines = function(spns) {
    if(null !== spns && typeof spns !== "undefined" &&
        spns.length > 0) {
        this.spines = spns;
    } else {
        this.spines = [];
    }
}

underlayModel.prototype.setCores = function(crs) {
    if(null !== crs && typeof crs !== "undefined" &&
        crs.length > 0) {
        this.cores = crs;
    } else {
        this.cores = [];
    }
}

underlayModel.prototype.setVrouters = function(vrs) {
    if(null !== vrs && typeof vrs !== "undefined" &&
        vrs.length > 0) {
        this.vrouters = vrs;
    } else {
        this.vrouters = [];
    }
}

underlayModel.prototype.setVMs = function(vms) {
    if(null !== vms && typeof vms !== "undefined" &&
        vms.length > 0) {
        this.vms = vms;
    } else {
        this.vms = [];
    }
}

underlayModel.prototype.setVNs = function(vns) {
    if(null !== vns && typeof vns !== "undefined" &&
        vns.length > 0) {
        this.vns = vns;
    } else {
        this.vns = [];
    }
}

underlayModel.prototype.setNodes = function(nodes) {
    if(null !== nodes && typeof nodes !== "undefined" &&
        nodes.length > 0) {
        this.nodes = nodes;
    } else {
        this.nodes = [];
    }
}

underlayModel.prototype.setLinks = function(links) {
    if(null !== links && typeof links !== "undefined" &&
        links.length > 0) {
        this.links = links;
    } else {
        this.links = [];
    }
}

underlayModel.prototype.setTree = function(t) {
    if(null !== t && typeof t !== "undefined" && false !== t) {
        this.tree = t;
    } else {
        this.tree = {};
    }
}

underlayModel.prototype.getData = function(cfg) {

    var url = cfg.url;
    var _this = this;
    if(null !== url && "" !== url.trim()) {
        $.ajax({
            dataType: "json",
            url: url,
            type: cfg.type,
            data: cfg.data,
            success: function (response) {
                cfg.callback(response);
            },
            failure: function (err) {
                if(cfg.failureCallback != null && typeof cfg.failureCallback == 'function')
                    cfg.failureCallback(err);
            }
        });
    }
}

underlayModel.prototype.categorizeNodes = function(nodes) {
    if(null === nodes || typeof nodes === "undefined" ||
        false === nodes || nodes.length <= 0) {
        this.setTors([]);
        this.setSpines([]);
        this.setCores([]);
        this.setVrouters([]);
        this.setVMs([]);
        this.setVNs([]);
        return;
    }
    var tors = jsonPath(nodes, "$[?(@.chassis_type=='tor')]");
    if(false !== tors)
        this.setTors(tors);
    else
        this.setTors([]);

    var spines = jsonPath(nodes, "$[?(@.chassis_type=='spine')]");
    if(false !== spines)
        this.setSpines(spines);
    else
        this.setSpines([]);

    var cores = jsonPath(nodes, "$[?(@.chassis_type=='coreswitch')]");
    if(false !== cores)
        this.setCores(cores);
    else
        this.setCores([]);

    var vrs = jsonPath(nodes, "$[?(@.chassis_type=='virtual-router')]");
    if(false !== vrs)
        this.setVrouters(vrs);
    else
        this.setVrouters([]);

    var vms = jsonPath(nodes, "$[?(@.chassis_type=='virtual-machine')]");
    if(false !== vms)
        this.setVMs(vms);
    else
        this.setVMs([]);

    var vns = jsonPath(nodes, "$[?(@.chassis_type=='virtual-network')]");
    if(false !== vns)
        this.setVNs(vns);
    else
        this.setVNs([]);
}

underlayModel.prototype.reset = function() {
    this.nodes             = [];
    this.links             = [];
    this.tors              = [];
    this.spines            = [];
    this.cores             = [];
    this.vrouters          = []
}

underlayModel.prototype.destroy = function() {
    this.reset();
}

var underlayView = function (model) {
    this.elementMap        = {
        nodes: {},
        links: {}
    };
    this.connectedElements = [];
    this.adjacencyList = [];
    this.underlayAdjacencyList = [];
    this.connectionWrapIds = [];
    this.model = model || new underlayModel();
    this.graph = new joint.dia.Graph;
    window.onresize = this.resizeTopology;
    var topologySize = this.calculateDimensions(false);
    this.setDimensions(topologySize);
    this.paper  = new joint.dia.Paper({
        el: $("#topology-connected-elements"),
        model: this.graph,
        width: $("#topology-connected-elements").innerWidth(),
        height: $("#topology-connected-elements").innerHeight(),
        linkView: joint.shapes.contrail.LinkView
    });

    var defs = $('svg').find('defs');
    var markers = this.getMarkers();
    for(var i=0; i<markers.length; i++)
        defs.append(markers[i]);
    this.initZoomControls();
    this.contextMenuConfig = {};
    this.tooltipConfig = {};
    var _this = this;
    _this.renderUnderlayTabs();
    //Disabling the tabs on page load we are activating them 
    //Once the topology ajax calls are successful.
    $("#underlay_tabstrip").tabs('disable');
}

underlayView.prototype.getConnectedElements = function() {
    return this.connectedElements;
}

underlayView.prototype.getElementMap = function() {
    return this.elementMap;
}

underlayView.prototype.calculateDimensions = function(expand) {
    var viewArea = this.getViewArea();
    var viewAreaHeight = viewArea.height;
    var viewAreaWidth = viewArea.width;

    var topologyHeight = (expand === true) ? viewAreaHeight*90/100 : viewAreaHeight*70/100;
    var detailsTabHeight = (expand === true) ? viewAreaHeight*10/100 : viewAreaHeight*30/100;
    return {
        "underlay_topology": {
            width: viewAreaWidth,
            height: viewAreaHeight
        },
            "network_topology": {
                width: viewAreaWidth,
                height: topologyHeight
            },
                "topology": {
                    width: viewAreaWidth*90/100,
                    height: topologyHeight
                },
                    "topology-connected-elements": {
                        width: viewAreaWidth*90/100,
                        height: topologyHeight
                    },
                    "topology-controls": {
                        width: viewAreaWidth*10/100,
                        height: topologyHeight
                    },
            "details_tab": {
                width: viewAreaWidth,
                height: detailsTabHeight
            }
    };
}

underlayView.prototype.getViewArea = function() {
    var viewAreaWidth = 980;
    var viewAreaHeight = 725;
    var windowHeight = $(window).height()-100; //less breadcrumb
    var windowWidth = $(window).width();
    if(windowHeight > viewAreaHeight )
        viewAreaHeight = windowHeight;
    if(windowWidth > viewAreaWidth)
        viewAreaWidth = windowWidth - 200; //less menu
    return {"width": viewAreaWidth, "height": viewAreaHeight};
}

underlayView.prototype.setDimensions = function(dimObj) {
    var _this = this;
    for(var prop in dimObj) {
        if(dimObj.hasOwnProperty(prop)) {
            $("#" + prop).innerWidth(dimObj[prop].width);
            $("#" + prop).innerHeight(dimObj[prop].height);
        }
    }
}

underlayView.prototype.setConnectedElements = function(cEls) {
    if(null !== cEls && typeof cEls !== "undefined" &&
        cEls.length > 0) {
        this.connectedElements = cEls;
    } else {
        this.connectedElements = [];
    }
}

underlayView.prototype.setElementMap = function(elMap) {
    if(null !== elMap && typeof elMap !== "undefined") {
        this.elementMap = elMap;
    } else {
        this.elementMap = [];
    }
}
underlayView.prototype.getModel = function() {
    return this.model;
}

underlayView.prototype.getGraph = function() {
    return this.graph;
}

underlayView.prototype.getPaper = function() {
    return this.paper;
}

underlayView.prototype.formElementTree = function(prop, propObj, elTree, elMap, conElements, elements, linkElements, stopAt) {
    if ( typeof prop === "undefined" || null === prop ||
        {} === prop || false === prop)
        return;
    elTree[prop] = {};
    var nodeElement = jsonPath(elMap, "$..nodes[" + prop + "]");

    if(false !== nodeElement && null !== nodeElement && typeof nodeElement === "object" &&
        nodeElement.length == 1) {
        nodeElement = nodeElement[0];
        var node = jsonPath(conElements, "$[?(@.id=='" + nodeElement + "')]");
        if(false !== node && node.length == 1) {
            node = node[0];
            elTree[prop]["element_id"] = nodeElement;
            elTree[prop]["element"] = node;
            elements.push(node);
        }
    }

    if(propObj.hasOwnProperty("children")) {
        elTree[prop]["children"] = {};
        var children = propObj["children"];
        for(var child in children) {
            var childElement = jsonPath(conElements, "$[?(@.id=='" + nodeElement + "')]");
            if(false !== childElement && childElement.length == 1) {
                childElement = childElement[0];
                if(null === stopAt || typeof stopAt === "undefined" ||
                    (typeof stopAt === "string" && stopAt.trim() === "") ||
                    (typeof stopAt === "string" && node.attributes.nodeDetails.chassis_type !== stopAt)) {
                    var linkId = jsonPath(elMap, "$..links[" + prop + "<->" + child + "]");
                    if(false !== linkId && linkId.length == 1) {
                        linkId = linkId[0];
                        elTree[prop]["link_id"] = linkId;
                        linkElements.push(childElement);
                    }
                    this.formElementTree(child, children[child], elTree[prop]["children"], elMap, conElements, elements, linkElements, stopAt);

                }
            }
        }
    }

}

underlayView.prototype.setUnderlayAdjacencyList = function(adjList) {
    if(typeof adjList === "object")
        this.underlayAdjacencyList = adjList;
    else 
        this.underlayAdjacencyList = {};
}

underlayView.prototype.getUnderlayAdjacencyList = function() {
    return this.underlayAdjacencyList;
}

underlayView.prototype.setAdjacencyList = function(adjList) {
    if(typeof adjList === "object")
        this.adjacencyList = adjList;
    else 
        this.adjacencyList = {};
}

underlayView.prototype.getAdjacencyList = function() {
    return this.adjacencyList;
}

underlayView.prototype.addElementsToGraph = function(els) {
        var graph = this.getGraph();
        $("#topology-connected-elements").find("div").remove();
        graph.clear();
        graph.resetCells(els);
        var newGraphSize = joint.layout.DirectedGraph.layout(graph, {"rankDir" : "TB", "nodeSep" : 70, "rankSep" : 80});
        var svgHeight = newGraphSize.height;
        var svgWidth = newGraphSize.width;
        var viewAreaHeight = $("#topology-connected-elements").height();
        var viewAreaWidth = $("#topology-connected-elements").width();
        var paperHeight = 0;
        var paperWidth = 0;
        var offsetX = 0;
        var offsetY = 0;
        var offset = {
            x: 0,
            y: 0
        };
        if(svgHeight < viewAreaHeight) {
            offsetY = (viewAreaHeight - svgHeight)/2;
        }

        if(svgWidth < viewAreaWidth) {
            offsetX = (viewAreaWidth - svgWidth)/2;
        }

        offset = {
            x: offsetX,
            y: offsetY
        };
        $.each(els, function (elementKey, elementValue) {
            elementValue.translate(offset.x, offset.y);
        });
        if(svgHeight > viewAreaHeight || svgWidth > viewAreaWidth) {
            this.getPaper().fitToContent();
        }
        this.initTooltipConfig();
}


underlayView.prototype.DGPrepare = function(prop, propObj, adjList, stopAt) {
    if ( typeof prop === "undefined" || null === prop ||
        {} === prop || false === prop)
        return;
    adjList[prop] = [];
    if(propObj.hasOwnProperty("children")) {
        var children = propObj["children"];
        for(var child in children) {
            if(null === stopAt || typeof stopAt === "undefined" ||
                (typeof stopAt === "string" && stopAt.trim() === "") ||
                (typeof stopAt === "string" && propObj.chassis_type !== stopAt)) {
               adjList[prop][adjList[prop].length] = child;
                this.DGPrepare(child, children[child], adjList, stopAt);
            }
        }
    }
}

underlayView.prototype.prepareData = function(stopAt) {
    var treeModel = this.getModel().getTree();
    var adjList = {};
    for(var prop in treeModel) {
        if(treeModel.hasOwnProperty(prop)) {
            this.DGPrepare(prop, treeModel[prop], adjList, stopAt);
        }
    }
    return adjList;
}

underlayView.prototype.createElementsFromAdjacencyList = function() {
    var elements = [];
    var linkElements = [];
    var _this = this;
    var adjacencyList = this.getAdjacencyList();
    var conElements = this.getConnectedElements();
    var i=0;
    var nodes = this.getModel().getNodes();
    var links = this.getModel().getLinks();
    var elMap = this.getElementMap();
    _.each(adjacencyList, function(edges, parentElementLabel) {
        if(null !== elMap["nodes"][parentElementLabel] &&
            typeof elMap["nodes"][parentElementLabel] !== "undefined") {
            var el = _this.getGraph().getCell(elMap["nodes"][parentElementLabel]);
            if(null !== el && typeof el !== "undefined") {
                elements.push(el);
                return;
            } else {
                el = jsonPath(conElements, "$[?(@.id=='" + elMap["nodes"][parentElementLabel] + "')]");
                if(typeof el === "object" && el.length === 1) {
                    elements.push(el[0]);
                    return;
                }
            }
        }
        var parentNode = jsonPath(nodes, "$[?(@.name=='" + parentElementLabel + "')]");
        if(false !== parentNode && parentNode.length === 1) {
            parentNode = parentNode[0];
            var parentName = parentNode.name;
            var parentNodeType = parentNode.node_type;
            elements.push(_this.createNode(parentNode));
            var currentEl = elements[elements.length-1];
            conElements.push(currentEl);
            var currentElId = currentEl.id;
            elMap.nodes[parentName] = currentElId;
        }
    });

    _.each(adjacencyList, function(edges, parentElementLabel) {
        var parentNode = jsonPath(nodes, "$[?(@.name=='" + parentElementLabel + "')]");
        if(false !== parentNode && parentNode.length === 1) {
            parentNode = parentNode[0];
            var parentNodeType = parentNode.node_type;
            var parentId = elMap.nodes[parentNode.name];
            _.each(edges, function(childElementLabel) {
                if(null !== elMap["links"][parentElementLabel + "<->" + childElementLabel] &&
                    typeof elMap["links"][parentElementLabel + "<->" + childElementLabel] !== "undefined") {
                    var linkEl = _this.getGraph().getCell(elMap["links"][parentElementLabel + "<->" + childElementLabel]);
                    if(null !== linkEl && typeof linkEl !== "undefined") {
                        linkElements.push(linkEl);
                        return;
                    } else {
                        linkEl = jsonPath(conElements, "$[?(@.id=='" + elMap["links"][parentElementLabel + "<->" + childElementLabel] + "')]");
                        if(typeof linkEl === "object" && linkEl.length === 1) {
                            linkElements.push(linkEl[0]);
                            return;
                        }
                    }
                }
                var childNode = jsonPath(nodes, "$[?(@.name=='" + childElementLabel + "')]");
                if(false !== childNode && childNode.length === 1) {
                    childNode = childNode[0];
                    var childNodeType = childNode.node_type;
                    var childId = elMap.nodes[childNode["name"]];
                    var link_type = parentNodeType.split("-")[0][0] + parentNodeType.split("-")[1][0] + '-' + 
                        childNodeType.split("-")[0][0] + childNodeType.split("-")[1][0];
                    for(var i=0; i<links.length; i++) {
                        var link = links[i];
                        if((link.endpoints[0] === childElementLabel && link.endpoints[1] === parentElementLabel) ||
                            (link.endpoints[1] === childElementLabel && link.endpoints[0] === parentElementLabel)) {
                            var linkName = childElementLabel + "<->" + parentElementLabel;
                            var altLinkName = parentElementLabel + "<->" + childElementLabel;
                            if((null == elMap["links"][linkName] && typeof elMap["links"][linkName] == "undefined") &&
                                null == elMap["links"][altLinkName] && typeof elMap["links"][altLinkName] == "undefined") {
                                linkElements.push(_this.createLink(link, link_type, parentId, childId));
                                var currentLink = linkElements[linkElements.length-1];
                                var currentLinkId = currentLink.id;
                                conElements.push(currentLink);
                                elMap.links[linkName] = currentLinkId;
                                elMap.links[altLinkName] = currentLinkId;
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
        if(null !== elMap["nodes"] && typeof elMap["nodes"] !== "undefined") {
            if(null == elMap["nodes"][endpoint0] && typeof elMap["nodes"][endpoint0] == "undefined") {
                var node = jsonPath(nodes, "$[?(@.name=='" + endpoint0 + "')]");
                if(false !== node && node.length === 1) {
                    node = node[0];
                    var nodeName = node.name;
                    var currentEl = _this.createNode(node);
                    conElements.push(currentEl);
                    var currentElId = currentEl.id;
                    elMap.nodes[nodeName] = currentElId;
                    if(adjacencyList.hasOwnProperty(nodeName)) {
                        elements.push(currentEl);
                    }
                }
            }
            if(null == elMap["nodes"][endpoint1] && typeof elMap["nodes"][endpoint1] == "undefined") {
                var node = jsonPath(nodes, "$[?(@.name=='" + endpoint1 + "')]");
                if(false !== node && node.length === 1) {
                    node = node[0];
                    var nodeName = node.name;
                    var currentEl = _this.createNode(node);
                    conElements.push(currentEl);
                    var currentElId = currentEl.id;
                    elMap.nodes[nodeName] = currentElId;
                    if(adjacencyList.hasOwnProperty(nodeName)) {
                        elements.push(currentEl);
                    }
                }
            }
        }

        if(null !== elMap["links"] && typeof elMap["links"] !== "undefined") {
            if((null == elMap["links"][linkName] && typeof elMap["links"][linkName] == "undefined") ||
                null == elMap["links"][altLinkName] && typeof elMap["links"][altLinkName] == "undefined") {
                var parentNode = jsonPath(nodes, "$[?(@.name=='" + endpoint0 + "')]");
                if(false !== parentNode && parentNode.length === 1) {
                    parentNode = parentNode[0];
                    var parentNodeType = parentNode.node_type;
                    var parentId = elMap.nodes[parentNode.name];
                    var childNode = jsonPath(nodes, "$[?(@.name=='" + endpoint1 + "')]");
                    if(false !== childNode && childNode.length === 1) {
                        childNode = childNode[0];
                        var childNodeType = childNode.node_type;
                        var childId = elMap.nodes[childNode.name];
                        var link_type = parentNodeType.split("-")[0][0] + parentNodeType.split("-")[1][0] + '-' + 
                            childNodeType.split("-")[0][0] + childNodeType.split("-")[1][0];
                        var linkEl = _this.createLink(link, link_type, parentId, childId);
                        conElements.push(linkEl);
                        var currentLinkId = linkEl.id;
                        elMap.links[linkName] = currentLinkId;
                        elMap.links[altLinkName] = currentLinkId;
                        if(adjacencyList.hasOwnProperty(endpoint0) &&
                            adjacencyList.hasOwnProperty(endpoint1)) {
                            linkElements.push(linkEl);
                        }
                    }
                }
            } else {
                //Check if already added to linkElements to be rendered. If yes, do nothing.
                linkEl = jsonPath(linkElements, "$[?(@.id=='" + elMap["links"][linkName] + "')]");
                if(typeof linkEl === "object" && linkEl.length === 1) {
                    //already exists, dont do anything.
                } else {
                    //Check in Graph. If available, add again to render.
                    var linkEl = _this.getGraph().getCell(elMap["links"][linkName]);
                    if(null !== linkEl && typeof linkEl !== "undefined") {
                        if(adjacencyList.hasOwnProperty(endpoint0) &&
                            adjacencyList.hasOwnProperty(endpoint1)) {
                            linkElements.push(linkEl);
                        }
                    } else {
                        //Check if this element already created. If yes, add to linkElements if this link
                        // exists in adjList
                        linkEl = jsonPath(conElements, "$[?(@.id=='" + elMap["links"][linkName] + "')]");
                        if(typeof linkEl === "object" && linkEl.length === 1) {
                            if(adjacencyList.hasOwnProperty(endpoint0) &&
                                adjacencyList.hasOwnProperty(endpoint1)) {
                                linkElements.push(linkEl[0]);
                            }
                        }
                    }
                }
            }
        }
    }

    this.setConnectedElements(conElements);
    // Links must be added after all the elements. This is because when the links
    // are added to the graph, link source/target
    // elements must be in the graph already.
    return elements.concat(linkElements.unique());
}

underlayView.prototype.createLink = function(link, link_type, srcId, tgtId) {
        var options;
        var linkElement;
        link.link_type = link_type;
        options = {
            direction   : "bi",
            linkType    : link.link_type,
            linkDetails : link
        };
        link['connectionStroke'] = '#637939';

        options['sourceId'] = srcId;
        options['targetId'] = tgtId;
        linkElement = new ContrailElement('link', options);
        return linkElement;
}

underlayView.prototype.createNode = function(node) {
    var nodeName = node['name'],
        type = node.node_type,
        chassis_type = node.chassis_type,
        width = 40,
        height = 40,
        imageLink, element, options, imageName;
        var refX, refY;
        var labelNodeName = contrail.truncateText(nodeName,20);
        switch(chassis_type) {
            case "spine":
                chassis_type = 'router';
                break;
            case "tor":
                chassis_type = 'switch';
                break;
            case "virtual-machine":
                labelNodeName = contrail.truncateText(nodeName,10);
                refY = .9;
                break;
        }
        imageName = getImageName(node);
        imageLink = '/img/icons/' + imageName;
        options = {
            attrs: {
                image: {
                    'xlink:href': imageLink,
                    width: width,
                    height: height
                },
                text: {
                    text: labelNodeName,
                    "ref-y": refY
                }
            },
            size: {
                width: width,
                height: height
            },
            nodeDetails: node,
            font: {
                iconClass: 'icon-contrail-' + chassis_type
            }
        };
    element = new ContrailElement(type, options);
    return element;
}

underlayView.prototype.initZoomControls = function() {
    $("#topology-connected-elements").panzoom({
        transition: true,
        duration: 200,
        increment: 0.1,
        minScale: 0.5,
        maxScale: 20,
        contain: false,
        $zoomIn: $("#topology-controls").find(".zoom-in"),
        $zoomOut: $("#topology-controls").find(".zoom-out"),
        $reset: $("#topology-controls").find(".zoom-reset"),
        cursor: "default"
    });
    var _this = this;
    $('#topology-connected-elements').on('mousedown touchstart', function( e ) {
        if(e.target.nodeName == 'svg') {
            $('#topology-connected-elements').panzoom("enable");
        } else{
            $('#topology-connected-elements').panzoom("disable");
        }
    });
    $('#topology-connected-elements').on('mouseup touchend', function( e ) {
        $('#topology-connected-elements').panzoom("enable");
    });
}

underlayView.prototype.initTooltipConfig = function() {
    var _this = this;
    this.tooltipConfig = {
        PhysicalRouter: {
            title: function(element, graph) {
                return 'Physical Router';
            },
            content: function(element, graph) {
                var viewElement = _this.getGraph().getCell(element.attr('model-id'));
                var tooltipContent = contrail.getTemplate4Id('tooltip-content-template');

                var ifLength = 0;
                if(viewElement.attributes && viewElement.attributes.hasOwnProperty('nodeDetails') &&
                    viewElement.attributes.nodeDetails.hasOwnProperty('more_attributes') &&
                    viewElement.attributes.nodeDetails.more_attributes.hasOwnProperty('ifTable') &&
                    viewElement.attributes.nodeDetails.more_attributes.ifTable.length) {
                    ifLength = viewElement.attributes.nodeDetails.more_attributes.ifTable.length;
                }
                return tooltipContent([
                    {
                        lbl:'Name',
                        value: viewElement.attributes.nodeDetails['name']
                    },
                    {
                        lbl:'Interfaces',
                        value: ifLength
                    }
                ]);
            }
        },
        VirtualMachine: {
            title: function(element, graph) {
                return 'Virtual Machine';
            },
            content: function(element, graph) {
                var viewElement = graph.getCell(element.attr('model-id'));
                var tooltipContent = contrail.getTemplate4Id('tooltip-content-template');
                var instances = globalObj['topologyResponse']['VMList'];
                var instanceName = "";
                var lbl = "UUID";
                var instanceUUID = viewElement.attributes.nodeDetails['name'];
                var vmIp = "";
                var vn = "";
                for(var i=0; i<instances.length; i++) {
                    if(instances[i].name === instanceUUID) {
                        var attributes = ifNull(instances[i]['more_attributes'],{}),ipArr = [],vnArr = [];
                        var interfaceList = tenantNetworkMonitorUtils.getDataBasedOnSource(ifNull(attributes['interface_list'],[]));
                        lbl = "Name";
                        instanceName = attributes['vm_name'];
                        for(var j = 0; j < interfaceList.length; j++) {
                            if(interfaceList[j]['virtual_network'] != null)
                                vnArr.push(interfaceList[j]['virtual_network']);
                            if(interfaceList[j]['ip6_active'] && interfaceList[j]['ip6_address'] != '0.0.0.0')
                                ipArr.push(interfaceList[j]['ip6_address']);
                            else if(interfaceList[j]['ip_address'] != '0.0.0.0')
                                ipArr.push(interfaceList[j]['ip_address']);
                        }
                        if(ipArr.length > 0)
                            vmIp = ipArr.join();
                        if(vnArr.length > 0)
                            vn = tenantNetworkMonitorUtils.formatVN(vnArr);
                        break;
                    }
                }
                if("" == instanceName)
                    instanceName = viewElement.attributes.nodeDetails['name'];
                var tooltip = [];
                tooltip.push({
                    lbl:lbl,
                    value: instanceName
                });
                if(vmIp !== "") {
                    tooltip.push({
                        lbl: "IP",
                        value: vmIp
                    });
                }
                if(vn !== "") {
                    tooltip.push({
                        lbl: "Network(s)",
                        value: vn
                    });
                }
                if(viewElement.attributes && viewElement.attributes.hasOwnProperty('nodeDetails'))
                    return tooltipContent(tooltip);
            }
        },
        VirtualRouter: {
            title: function(element, graph) {
                return 'Virtual Router';
            },
            content: function(element, graph) {
                var viewElement = graph.getCell(element.attr('model-id'));
                var tooltipContent = contrail.getTemplate4Id('tooltip-content-template');
                var instances = globalObj['topologyResponse']['VMList'];
                var vms = 0;
                for(var i=0; i<instances.length; i++) {
                    if(instances[i]['more_attributes']['vrouter'] === viewElement.attributes.nodeDetails['name']) {
                        vms++;
                    }
                }
                if(viewElement.attributes && viewElement.attributes.hasOwnProperty('nodeDetails'))
                return tooltipContent([
                    {
                        lbl:'Name',
                        value: viewElement.attributes.nodeDetails['name']
                    },
                    {
                        lbl: "Number of VMs",
                        value: vms
                    }
                ]);
            }
        },
        link: {
            title: function(element, graph) {
                var viewElement = graph.getCell(element.attr('model-id'));
                var instances = globalObj['topologyResponse']['VMList'];
                var instanceName1 = "";
                var instanceName2 = "";
                var endpoint1 = viewElement.attributes.linkDetails.endpoints[0];
                var endpoint2 = viewElement.attributes.linkDetails.endpoints[1];
                for(var i=0; i<instances.length; i++) {
                    if(instances[i].name === endpoint1) {
                        instanceName1 = instances[i]['more_attributes']['vm_name'];
                    } else if (instances[i].name === endpoint1) {
                        instanceName2 = instances[i]['more_attributes']['vm_name'];
                    }
                }
                if("" == instanceName1)
                    instanceName1 = endpoint1;
                if("" == instanceName2)
                    instanceName2 = endpoint2;
                return "<div class='row-fluid'><div class='span1' style='margin-right:5px'>" + "Link" + "</div>" +
                    "<div class='span5'>" + instanceName1 + "</div>" +
                    "<div class='span5'>" + instanceName2 + "</div></div>";
            },
            content: function(element, graph) {
                var viewElement = graph.getCell(element.attr('model-id'));
                var tooltipContent = contrail.getTemplate4Id('two-column-content-template');
                var local_interfaces = [];
                var remote_interfaces = [];
                if(viewElement.attributes && viewElement.attributes.hasOwnProperty('linkDetails') &&
                    viewElement.attributes.linkDetails.hasOwnProperty('more_attributes') &&
                    viewElement.attributes.linkDetails.more_attributes &&
                    "-" !== viewElement.attributes.linkDetails.more_attributes &&
                    viewElement.attributes.linkDetails.more_attributes.length > 0) {
                    var moreAttrs = viewElement.attributes.linkDetails.more_attributes;
                    for(var i=0; i<moreAttrs.length; i++) {
                        local_interfaces.push(moreAttrs[i].local_interface_name + " (" + moreAttrs[i].local_interface_index + ")");
                        remote_interfaces.push(moreAttrs[i].remote_interface_name + " (" + moreAttrs[i].remote_interface_index + ")");
                    }
                }

                return tooltipContent([
                    {
                        lbl: viewElement.attributes.linkDetails.endpoints[0],
                        value: local_interfaces
                    },
                    {
                        lbl: viewElement.attributes.linkDetails.endpoints[1],
                        value: remote_interfaces
                    }
                ]);
            }
        }
    };
    $.each(this.tooltipConfig, function(keyConfig, valueConfig){
        $('g.' + keyConfig).popover({
            trigger: 'hover',
            html: true,
            delay: { show: 200, hide: 10 },
            title: function(){
                return valueConfig.title($(this), _this.getGraph());
            },
            content: function(){
                return valueConfig.content($(this), _this.getGraph());
            },
            container: $('body')
        });
    });
}

underlayView.prototype.initContextMenuConfig = function() {
    this.contextMenuConfig =  {
        PhysicalRouter: function(element, viewObj) {
            var viewElement = viewObj.getGraph().getCell(element.attr('model-id')),
                  jointElementFullName = viewElement.attributes.nodeDetails['name'],
                  items = {
                    configure: {
                          name: '<i class="icon-cog"></i><span class="margin-0-5">Configure Physical Router</span>',
                          callback: function(key, options) {
                            loadFeature({p:PROUTER_DBL_CLICK});
                          }
                    }
                  };
            return {items: items};
        }
    };
    var _this = this;
    $.contextMenu('destroy', 'g');
    $.contextMenu({
        selector: 'g',
        position: function(opt, x, y){
            opt.$menu.css({top: y + 5, left: x + 5});
        },
        build: function($trigger, e){
            if(!$trigger.hasClassSVG('element')){
                $trigger = $trigger.parentsSVG('g.element');
                if($trigger.length > 0){
                    $trigger = $($trigger[0]);
                }
            }
            var contextMenuItems = false;
            if(contrail.checkIfExist($trigger)){
                $.each(_this.contextMenuConfig, function(keyConfig, valueConfig){
                    if($trigger.hasClassSVG(keyConfig)){
                        contextMenuItems = valueConfig($trigger, _this);
                        $('g.' + keyConfig).popover('hide');
                        return false;
                    }
                });
            }
            return contextMenuItems;
        }
    });
}
underlayView.prototype.addDimlightToConnectedElements = function() {
    this.addDimlightToNodes();
    this.addDimlightToLinks();
}

underlayView.prototype.addDimlightToNodes = function() {
    $('div.font-element')
        .removeClass('elementHighlighted')
        .addClass('dimHighlighted');
    $('div.font-element')
        .find('i')
            .css("color", "#555");
    $('g.element')
        .removeClassSVG('elementHighlighted')
        .addClassSVG('dimHighlighted');
}

underlayView.prototype.addDimlightToLinks = function() {
    $('g.link')
        .removeClassSVG('elementHighlighted')
        .addClassSVG('dimHighlighted')
        .css('')
}

underlayView.prototype.addHighlightToNodesAndLinks = function(nodes, els) {
    var elMap = this.getElementMap();
    var _this = this;
    if(typeof nodes == "object" && nodes.length > 0) {
        var nodeNames = [];
        for(var i=0; i<nodes.length; i++) {
            var node = nodes[i];
            nodeNames.push(node.name);
            var node_model_id = jsonPath(elMap, "$.nodes[" + node.name + "]");
            if(false !== node_model_id && typeof node_model_id === "object" &&
                node_model_id.length === 1) {
                node_model_id = node_model_id[0];
                this.addHighlightToNode(node_model_id);
            }
        }

        $.each(elMap.links, function(link, link_id){
            var endpoints = link.split("<->");
            var endpoint0 = endpoints[0];
            var endpoint1 = endpoints[1];
            if(nodeNames.indexOf(endpoint0) !== -1 &&
                nodeNames.indexOf(endpoint1) !== -1) {
                _this.addHighlightToLink(link_id);
            }
        });
    }
}

underlayView.prototype.addHighlightToNode = function(node_model_id) {
    $('div.font-element[font-element-model-id="' + node_model_id + '"]')
        .addClass('elementHighlighted')
        .removeClass('dimHighlighted')
        .removeClass('hidden');

    $('g.element[model-id="' + node_model_id + '"]')
        .addClassSVG('elementHighlighted')
        .removeClassSVG('dimHighlighted')
        .removeClassSVG('hidden');

    $('div.font-element[font-element-model-id="' + node_model_id + '"]')
        .find('i')
            .css("color", "#498AB9");

}

underlayView.prototype.hideLink = function(link_model_id) {
    $('g.link[model-id="' + link_model_id + '"]')
        .removeClassSVG('elementHighlighted')
        .removeClassSVG('dimHighlighted')
        .addClassSVG('hidden');
}

underlayView.prototype.hideNode = function(node_model_id) {
    $('g.element[model-id="' + node_model_id + '"]')
        .removeClassSVG('elementHighlighted')
        .removeClassSVG('dimHighlighted')
        .addClassSVG('hidden');
    $('div.font-element[font-element-model-id="' + node_model_id + '"]')
        .removeClass('elementHighlighted')
        .removeClass('dimHighlighted')
        .addClass('hidden');
}

underlayView.prototype.addHighlightToLink = function(link_model_id) {
    $('g.link[model-id="' + link_model_id + '"]')
        .removeClassSVG('hidden')
        .removeClassSVG('dimHighlighted')
        .addClassSVG('elementHighlighted');

    $('g.link[model-id="' + link_model_id + '"]')
        .find('path.connection')
            .css("stroke", "#498AB9");
    $('g.link[model-id="' + link_model_id + '"]')
        .find('path.marker-source')
            .css("fill", "#498AB9")
            .css("stroke", "#498AB9");
    $('g.link[model-id="' + link_model_id + '"]')
        .find('path.marker-target')
            .css("fill", "#498AB9")
            .css("stroke", "#498AB9");
    $('g.link[model-id="' + link_model_id + '"]')
        .find('path.connection-wrap')
            .css("opacity", "")
            .css("fill", "")
            .css("stroke", "");
}

underlayView.prototype.clearHighlightedConnectedElements = function() {
    var g = this.getGraph();

    $('div.font-element')
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
        .css("stroke", "");
}

underlayView.prototype.initGraphEvents = function() {
    var paper = this.getPaper();
    var graph = this.getGraph();
    var selectorId = "#" + paper.el.id;
    var _this      = this;

    paper.on('blank:pointerdblclick', function (evt, x, y) {
        evt.stopImmediatePropagation();
        _this.resetTopology();
    });

    paper.on("cell:pointerdblclick", function (cellView, evt, x, y) {
        evt.stopImmediatePropagation();
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        var dblClickedElement = cellView.model,
            elementType       = dblClickedElement['attributes']['type'];

        switch(elementType) {
            case 'contrail.PhysicalRouter':
                var chassis_type    = dblClickedElement['attributes']['nodeDetails']['chassis_type'];
                if(chassis_type === "tor") {
                    var children = _this.getModel().getChildren(dblClickedElement['attributes']['nodeDetails']['name'], "virtual-router");
                    var adjList = _.clone(_this.getUnderlayAdjacencyList());
                    if(children.length > 0) {
                        var childrenName = [];
                        for(var i=0; i<children.length; i++) {
                            childrenName.push(children[i]["name"]);
                            adjList[children[i]["name"]] = [];
                        }
                        adjList[dblClickedElement['attributes']['nodeDetails']['name']] = childrenName;
                        _this.setAdjacencyList(adjList);
                        var childElementsArray = _this.createElementsFromAdjacencyList();
                        _this.addElementsToGraph(childElementsArray);
                        var thisNode = [dblClickedElement["attributes"]["nodeDetails"]];
                        _this.addHighlightToNodesAndLinks(thisNode.concat(children), childElementsArray);
                    }
                }
                $(".popover").popover().hide();
                break;

            case 'contrail.VirtualRouter':
                var model_id          = $(dblClickedElement).attr('id');
                var children = _this.getModel().getChildren(dblClickedElement['attributes']['nodeDetails']['name'], "virtual-machine");
                var oldAdjList = _.clone(_this.getAdjacencyList());
                var newAdjList = _.clone(_this.getAdjacencyList());
                if(children.length > 0) {
                    if(ZOOMED_OUT == 0) {
                        ZOOMED_OUT = 0.9;
                        $("#topology-connected-elements").panzoom("zoom",ZOOMED_OUT);
                    }
                    var childrenName = [];
                    for(var i=0; i<children.length; i++) {
                        childrenName.push(children[i]["name"]);
                        newAdjList[children[i]["name"]] = [];
                    }
                    newAdjList[dblClickedElement['attributes']['nodeDetails']['name']] = childrenName;
                } else {
                    newAdjList = oldAdjList;
                }
                _this.setAdjacencyList(newAdjList);
                var childElementsArray = _this.createElementsFromAdjacencyList();
                _this.addElementsToGraph(childElementsArray);
                _this.addDimlightToConnectedElements();
                var thisNode = [dblClickedElement["attributes"]["nodeDetails"]];
                _this.addHighlightToNodesAndLinks(thisNode.concat(children), childElementsArray);
                _this.setAdjacencyList(oldAdjList);
                $(".popover").popover().hide();

                break;
            case 'link':
                var modelId = dblClickedElement.id;
                var targetElement = graph.getCell(dblClickedElement['attributes']['target']['id']),
                    sourceElement = graph.getCell(dblClickedElement['attributes']['source']['id']);
                $(".popover").popover().hide();
                break;
        }
    });
    
    paper.on('cell:pointerdown', function (cellView, evt, x, y) {
        evt.stopImmediatePropagation();
        _this.removeUnderlayPathIds();
    });
        
    paper.on('cell:pointerup', function (cellView, evt, x, y) {
        evt.stopImmediatePropagation();
        var ids = _this.getUnderlayPathIds();
        _this.showPath(ids);
    });
        
    paper.on('cell:pointerclick', function (cellView, evt, x, y) {
        evt.stopImmediatePropagation();
        _this.clearHighlightedConnectedElements();
        var clickedElement = cellView.model;
        var elementType    = clickedElement['attributes']['type'];
        if(elementType === "link") {
            _this.addHighlightToLink(clickedElement.id);
        } else {
            _this.addHighlightToNode(clickedElement.id);    
        }
        
        timeout = setTimeout(function() {
            //trigger 'click' event after 'doubleclick' is initiated.
            var data           = {};

            switch(elementType) {
                case 'contrail.PhysicalRouter':
                    var nodeDetails = clickedElement['attributes']['nodeDetails'];
                    if(nodeDetails['more_attributes']['ifTable'] == '-')
                        nodeDetails['more_attributes']['ifTable'] = [];
                    data = {
                        host_name : ifNull(nodeDetails['name'],'-'),
                        description: ifNull(nodeDetails['more_attributes']['lldpLocSysDesc'],'-'),
                        intfCnt   : nodeDetails['more_attributes']['ifTable'].length,
                    };
                    data['type'] = PROUTER;
                    data['response'] = nodeDetails;
                    _this.populateDetailsTab(data);
                    $("#underlay_topology").data('nodeType',ifNull(nodeDetails['node_type'],'-'));
                    $("#underlay_topology").data('nodeName',ifNull(nodeDetails['name'],'-'));
                    break;
                case 'contrail.VirtualRouter':
                    var nodeDetails = clickedElement['attributes']['nodeDetails'];
                    $("#underlay_topology").data('nodeType',ifNull(nodeDetails['node_type'],'-'));
                    $("#underlay_topology").data('nodeName',ifNull(nodeDetails['name'],'-'));
                    _this.updateWhereClause();
                    data['type'] = VROUTER;
                    data['name'] = nodeDetails['name'];
                    data['ip'] = getValueByJsonPath(nodeDetails,'more_attributes;VrouterAgent;self_ip_list;0','-');
                    _this.populateDetailsTab(data);
                    break;
                case 'contrail.VirtualMachine':
                    var nodeDetails = clickedElement['attributes']['nodeDetails'];
                    var instances = globalObj['topologyResponse']['VMList'];
                    var ip = [],vnList = [],intfLen = 0,vmName,srcVN = "",instDetails = {},inBytes = 0,outBytes = 0;
                    for(var i = 0; i < instances.length; i++) {
                        if(instances[i]['name'] == nodeDetails['name']) {
                            var intfList = tenantNetworkMonitorUtils.getDataBasedOnSource(ifNull(instances[i]['more_attributes']['interface_list'],[]));
                            intfLen = intfList.length;
                            instDetails = instances[i];
                            vmName = instances[i]['more_attributes']['vm_name'];
                            for(var j = 0; j < intfLen; j++) {
                                var intfObj = intfList[j];
                                ip.push(ifNull(intfObj['ip_address'],'-'));
                                vnList.push(ifNull(intfObj['virtual_network'],'-'));
                                for(var k = 0; k < ifNull(intfObj['floating_ips'],[]).length > 0; k++) {
                                    ip.push(ifNull(intfObj['floating_ips'][k]['ip_address'],'-'));
                                    vnList.push(ifNull(intfObj['floating_ips'][k]['virtual_network'],'-'));
                                }
                            }
                            var vnNameArr = ifNull(vnList[0].split(':'),[]);
                            var networkName = ifNull(vnNameArr[2],'-');
                            var projectName = '('+ifNull(vnNameArr[2],'-')+')';
                            srcVN += networkName +" "+ projectName;
                            break;
                        }
                    }
                    $("#underlay_topology").data('nodeType',ifNull(nodeDetails['node_type'],'-'));
                    $("#underlay_topology").data('nodeName',ifNull(nodeDetails['name'],'-'));
                    $("#underlay_topology").data('nodeIp',ip);
                    $("#underlay_topology").data('vnList',vnList);
                    _this.updateWhereClause();
                    data = {
                            type: VIRTUALMACHINE,
                            name: ifNull(instDetails['more_attributes']['vm_name'],'-'),
                            uuid: ifNull(nodeDetails['name'],'-'),
                            ipAddr: ip.length > 0 ? ip.join(',') : '-',
                            formattedVN: vnList.length > 0 ? formatVN(vnList).join(',') : '-',
                            virtualNetwork: vnList.length > 0 ? vnList.join(',') : '-',
                            interfaceCount : intfLen,
                            stats: formatBytes(ifNull(instDetails['inBytes'],'-'))+"/"+ifNull(formatBytes(instDetails['outBytes'],'-')),
                            link:{p:'mon_net_instances',q:{vmName:vmName,fqName:nodeDetails['name'],srcVN:srcVN}}
                    };
                    _this.populateDetailsTab(data);
                    break;
                case 'link':
                    var targetElement = graph.getCell(clickedElement['attributes']['target']['id']),
                        sourceElement = graph.getCell(clickedElement['attributes']['source']['id']);
                    var endpoints = [sourceElement['attributes']['nodeDetails']['name'],
                                     targetElement['attributes']['nodeDetails']['name']];
                    data['endpoints'] = endpoints;
                    data['type'] = 'link';
                    data['sourceElement'] = sourceElement;
                    data['targetElement'] = targetElement;
                    _this.populateDetailsTab(data);
                    break;

                timeout = null;
            }
        }, 500);
    });

}

underlayView.prototype.hideVMs = function() {
    this.hideNodesOfType('virtual-machine');
}

underlayView.prototype.hideVNs = function() {
    this.hideNodesOfType('virtual-network');
}

underlayView.prototype.hideNodesOfType = function(type) {
    var link_type = type.split('-');
    link_type = link_type[0][0] + link_type[1][0];
    var elements = this.getConnectedElements();
    var _this = this;
    $.each(elements, function(key, value){
        if(value.attributes && value.attributes.linkDetails && value.attributes.linkDetails.link_type &&
            value.attributes.linkDetails.link_type.indexOf(link_type) !== -1) {
            _this.hideLink(value.id);
        }
    });
    $.each(elements, function(key, value) {
        if(value.attributes && value.attributes.nodeDetails && value.attributes.nodeDetails.chassis_type &&
            value.attributes.nodeDetails.chassis_type == type) {
            _this.hideNode(value.id);
        }
    });
}

underlayView.prototype.resetTopology = function() {
    $("#underlay_topology").data('nodeType',null);
    $("#underlay_topology").data('nodeName',null);
    this.renderUnderlayTabs();
    this.renderFlowRecords();
    this.removeUnderlayPathIds();
    this.setUnderlayPathIds([]);
    this.clearHighlightedConnectedElements();
    $("#topology-connected-elements").panzoom("resetZoom");
    $("#topology-connected-elements").panzoom("reset");
    ZOOMED_OUT = 0;
    var adjList = _.clone(this.getUnderlayAdjacencyList());
    this.setAdjacencyList(adjList);
    var childElementsArray = this.createElementsFromAdjacencyList();
    this.addElementsToGraph(childElementsArray);
    $("#underlay_topology").removeData('nodeType');
    $("#underlay_topology").removeData('nodeName');
}

underlayView.prototype.removeUnderlayPathIds = function() {
    $(".connection-wrap-up").remove();
    $(".connection-wrap-down").remove();
}

underlayView.prototype.setUnderlayPathIds = function(connectionWrapIds) {
    if(typeof connectionWrapIds === "object" &&
        connectionWrapIds.length > 0) {
        this.connection_wrap_ids = connectionWrapIds;
    } else {
        this.connection_wrap_ids = [];
    }
}

underlayView.prototype.getUnderlayPathIds = function(connectionWrapIds) {
    return this.connection_wrap_ids;
}

underlayView.prototype.renderTopology = function(response) {
    var fullAdjList = this.prepareData();
    this.setAdjacencyList(fullAdjList);
    this.createElementsFromAdjacencyList();
    var adjList = this.prepareData("tor");
    this.setAdjacencyList(adjList);
    this.setUnderlayAdjacencyList(adjList);
    var childElementsArray = this.createElementsFromAdjacencyList();
    this.addElementsToGraph(childElementsArray);
    this.renderUnderlayViz();
    this.hideVRouters();
    this.hideVMs();
    var data = this.getPostDataFromHashParams();
    var _this = this;
    if(JSON.stringify(data) !== '{"data":{}}') {
        var cfg = {
            url      : "api/tenant/networking/underlay-path",
            type     : "POST",
            data     : data,
            view     : this,
            callback : function(response) {
                this.view.highlightPath(response, data);
            }
        };
        this.getModel().getData(cfg);
    }
}

underlayView.prototype.highlightPath = function(response, data) {
    if(null !== response && typeof response !== "undefined" &&
        null !== response.nodes && typeof response.nodes !== "undefined"){

    }
    if(response.nodes <=0 ){
        showInfoWindow("No Underlay paths found for the selected flow.", "Info");
        return false;
    }
    if(typeof response === "string") {
        showInfoWindow(response, "Info");
        return false;
    }
    var _this = null;
    if(null !== this && typeof this !== "undefined" && this.hasOwnProperty('view') &&
        this.view instanceof underlayView) {
        _this = this.view;
    } else {
        _this = this;
    }

    highlightedElements = {
        nodes: [],
        links: []
    };
    var elementMap = _this.getElementMap();
    var conElements = _this.getConnectedElements();
    var graph      = _this.getGraph();
    var nodes      = response.nodes;
    var links      = response.links;
    var adjList = this.prepareData("virtual-router");
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
    _this.setAdjacencyList(adjList);
    var childElementsArray = _this.createElementsFromAdjacencyList();

    var tors = _this.getModel().getTors();
    for(var i=0; i<tors.length; i++) {
        var tor = tors[i];
        var torName = tor.name;
        var virtualRouters = tor.children;
        for(var vrName in virtualRouters) {
            if(nodeNames.indexOf(vrName) === -1) {
                var vr_id = elementMap.nodes[vrName];
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
                var link_id = elementMap.links[link];
                var alt_link_id = elementMap.links[altLink];
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
    _this.addElementsToGraph(childElementsArray);
    _this.renderUnderlayViz();
    var connectionWrapIds = [];
    for (var i = 0; i < links.length; i++) {
        var endpoints = links[i].endpoints;
        var endpoint0 = endpoints[0];
        var endpoint1 = endpoints[1];
        var link = elementMap.links[endpoint0 + "<->" + endpoint1];
        if(null == link || typeof link === "undefined")
            continue;
        else {
            if(typeof $("g.link[model-id='" + link + "']").find('path.connection-wrap') == "object" &&
                $("g.link[model-id='" + link + "']").find('path.connection-wrap').length === 1) {
                connectionWrapIds.push($("g.link[model-id='" + link + "']").find('path.connection-wrap')[0].id);
                $("g.link[model-id='" + link + "']")
                    .css("opacity", "1");
            }
        }
    }
    if(connectionWrapIds.length > 0) {
        if(ZOOMED_OUT == 0) {
            ZOOMED_OUT = 0.9;
            $("#topology-connected-elements").panzoom("zoom", ZOOMED_OUT);
        }
        this.setUnderlayPathIds(connectionWrapIds);
        this.showPath(connectionWrapIds);
    }

    var srcIP = data.data['srcIP'];
    var destIP = data.data['destIP'];
    var instances = globalObj['topologyResponse']['VMList'],srcVM = [],destVM = [];
    for(var i = 0; i < instances.length; i++) {
        $.each(ifNull(instances[i]['more_attributes']['interface_list'],[]),function(idx,intfObj){
           if((intfObj['ip_address'] == srcIP && intfObj['ip_address'] != '0.0.0.0') || 
                   (intfObj['ip6_address'] == srcIP && intfObj['ip6_address'] != '0.0.0.0'))
               srcVM = instances[i]['name'];
           else if((intfObj['ip_address'] == destIP && intfObj['ip_address'] != '0.0.0.0') || 
                   (intfObj['ip6_address'] == destIP && intfObj['ip6_address'] != '0.0.0.0'))
               destVM = instances[i]['name'];
        });
    }
    for(var i=0; i<nodes.length; i++) {
        var hlNode = nodes[i];
        if(hlNode.node_type === 'virtual-machine') {
            var model_id = elementMap.nodes[hlNode.name];
            var associatedVRouter =
            jsonPath(globalObj['topologyResponse']['VMList'], "$[?(@.name =='" + hlNode.name + "')]");
            var associatedVRouterUID = "";
            if(false !== associatedVRouter &&
                "string" !== typeof associatedVRouter &&
                associatedVRouter.length > 0 ) {
                associatedVRouter = associatedVRouter[0]['more_attributes']['vrouter'];
                if(null !== associatedVRouter && typeof associatedVRouter !== "undefined") {
                    associatedVRouterUID = _this.getElementMap().nodes[associatedVRouter];
                }
            }
            if(hlNode.name == srcVM) {
                //Plot green
                $('div.font-element[font-element-model-id="' + model_id + '"]')
                    .find('i')
                    .css("color", "green");
            } else if(hlNode.name == destVM) {
                //Plot red
                $('div.font-element[font-element-model-id="' + model_id + '"]')
                    .find('i')
                    .css("color", "red");
            }
        }
    }
};

underlayView.prototype.getMarkers = function() {
    
    var marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'head');
    marker.setAttribute('orient', 'auto');
    marker.setAttribute('markerWidth', '30');
    marker.setAttribute('markerHeight', '30');
    marker.setAttribute('refX', '3');
    marker.setAttribute('refY', '.5');

    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', "M0,0 L0,3 L3,0");
    path.setAttribute('style', "stroke:#85b9dd; fill:#85b9dd;");
    marker.appendChild(path);

    var marker1 = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker1.setAttribute('id', 'up');
    marker1.setAttribute('orient', 'auto');
    marker1.setAttribute('markerWidth', '30');
    marker1.setAttribute('markerHeight', '30');
    marker1.setAttribute('refX', '0');
    marker1.setAttribute('refY', '0');

    var path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', "M0,0 L3,3 L0,3");
    path1.setAttribute('style', "stroke:#85b9dd; fill:#85b9dd;");
    marker1.appendChild(path1);

    var marker2 = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker2.setAttribute('id', 'down');
    marker2.setAttribute('orient', 'auto');
    marker2.setAttribute('markerWidth', '30');
    marker2.setAttribute('markerHeight', '30');
    marker2.setAttribute('refX', '3');
    marker2.setAttribute('refY', '3');    

    var path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', "M0,0 L3,3 L3,0");
    path2.setAttribute('style', "stroke:#85b9dd; fill:#85b9dd;");
    marker2.appendChild(path2);

    return [marker, marker1, marker2];
}

underlayView.prototype.showChildrenOfType = function(parent, child_type) {
    var elMap  = this.getElementMap();
    var clickedNodeName = parent['attributes']['nodeDetails']['name'];
    var children = parent['attributes']['nodeDetails']['children'];
    this.addHighlightToNode(parent.id);
    var _this = this;
    if(null !== children && typeof children === "object" && {} !== children) {
        for(var child in children) {
            var childName = children[child]["name"];
            var node_model_id = elMap["nodes"][childName];
            if($('g.element[model-id="' + node_model_id + '"]').hasClassSVG('hidden')){
                _this.addHighlightToNode(node_model_id);
            }
            var link_model_id = elMap["links"][clickedNodeName + "<->" + childName];
            if(null !== link_model_id && typeof link_model_id !== "undefined") {
                if($('g.link[model-id="' + link_model_id + '"]').hasClassSVG('hidden')) {
                    _this.addHighlightToLink(link_model_id);
                }
            }
        }
    }
}

underlayView.prototype.hideVRouters = function() {
    this.hideNodesOfType('virtual-router');
}

underlayView.prototype.renderUnderlayViz = function() {
    this.initGraphEvents();
    this.initTooltipConfig();
}

underlayView.prototype.renderFlowRecords = function() {
    if($("#fr-results").data('contrailGrid') == null || $("#underlay_topology").data('nodeType') != null) {
        var whereClauseStr;
        $("#flows-tab").html($("#qe-template").html());
        setFRValidValues();
        initFRQueryView('fr');
        initWidgetBoxes();
        queries['fr'].queryViewModel.timeRange([
                                                {"name":"Last 5 Mins", "value":300},
                                                {"name":"Last 10 Mins", "value":600},
                                                {"name":"Last 20 Mins", "value":1200},
                                                {"name":"Last 30 Mins", "value":1800},
                                                {"name":"Last 1 Hr", "value":3600},
                                                {"name":"Custom", "value":0},
                                     ]);
        queries['fr'].queryViewModel.defaultTRValue("600");
        queries['fr'].queryViewModel.isCustomTRVisible(false);
        ko.applyBindings(queries.fr.queryViewModel, document.getElementById('fr-query'));
        whereClauseStr = this.updateWhereClause();
    }
}
/*
 * This method updates the where clause in search flow based on the selection of
 * device in the topology(currently we are updating vrouter and VM details ) 
 */
underlayView.prototype.updateWhereClause = function () {
    var nodeType = $("#underlay_topology").data('nodeType');
    var nodeName = $("#underlay_topology").data('nodeName');
    var whereClauseStr = '';
    if(nodeType == VROUTER) {
        whereClauseStr = '(vrouter = '+nodeName+')';
    } else if(nodeType == VIRTUALMACHINE) {
        var nodeIp = ifNull($("#underlay_topology").data('nodeIp'),[]);
        var vnList = ifNull($("#underlay_topology").data('vnList'),[]);
        for(var i = 0; i < nodeIp.length; i++) {
            whereClauseStr += '( sourcevn = '+vnList[i]+' AND sourceip = '+nodeIp[i]+' )';
            if((i+1) < nodeIp.length)
                whereClauseStr += ' OR ';
        }
    }
    $('#fr-where').val(whereClauseStr);
}

underlayView.prototype.renderTracePath = function(options) {
    var _this = this;
    var nodeType = $("#underlay_topology").data('nodeType');
    var nodeName = $("#underlay_topology").data('nodeName');
    var tracePathTemplate = Handlebars.compile($("#tracePath-template").html())();
    var defaultValue = '',ip = '';
    var isAllPrevFirstTimeClicked = true,vrouterflowsGrid;
    // Global variable need to reset to empty array because it is commonly used
    // in monitor infra vrouter details page flows tab
    flowKeyStack = [];
    $("#traceFlow").html(tracePathTemplate);
    var computeNodes = getValueByJsonPath(globalObj,'topologyResponse;vRouterList',[]),computeNodeCombobox = [];
    if(nodeType == VROUTER && nodeName != null) {
        defaultValue = nodeName;
    } else {
        defaultValue = getValueByJsonPath(computeNodes,'0;name','-');
        ip = getValueByJsonPath(computeNodes,'0;more_attributes;VrouterAgent;self_ip_list;0','-');
    }
    for(var i = 0; i < computeNodes.length; i++) {
        if(computeNodes[i]['name'] == defaultValue)
            ip = getValueByJsonPath(computeNodes[i],'more_attributes;VrouterAgent;self_ip_list;0','-');
        computeNodeCombobox.push({
            text:contrail.format('{0} ({1})',computeNodes[i]['name'],
                    getValueByJsonPath(computeNodes[i],'more_attributes;VrouterAgent;self_ip_list;0','-')),
            value:computeNodes[i]['name']
        });
    }
    var computeNodeInfo = {name:defaultValue};
    var deferredObj = $.Deferred();
    cmpNodeView.getComputeNodeDetails(deferredObj,computeNodeInfo);
    $("#vrouterflows").parent().siblings('div.widget-header').find('.icon-spinner').show();
    deferredObj.done(function(data){
        $("#vrouterflows").parent().siblings('div.widget-header').find('.icon-spinner').hide();
        computeNodeInfo['ip'] = getValueByJsonPath(data,'VrouterAgent;self_ip_list;0',getValueByJsonPath(data,'ConfigData;virtual-router;virtual_router_ip_address'));
        computeNodeInfo['introspectPort'] = getValueByJsonPath(data,'VrouterAgent;sandesh_http_port',defaultIntrospectPort);
        renderVrouterFlowsGrid(computeNodeInfo);
    });    
    function renderVrouterFlowsGrid(computeNodeInfo){
        flowKeyStack = [];
        var vRouterFlowsColumns = [
                                      {
                                          field:'peer_vrouter',
                                          name:"Other Virtual Router",
                                          minWidth:170,
                                          formatter: function(r,c,v,cd,dc){
                                              var name = $.grep(computeNodes,function(value,idx){
                                                              return (getValueByJsonPath(value,'more_attributes;VrouterAgent;self_ip_list;0','-') == dc['peer_vrouter']);
                                                         });
                                              return contrail.format('{0} ({1})',getValueByJsonPath(name,'0;name','-'),dc['peer_vrouter']);
                                          }
                                      },
                                      {
                                          field:"protocol",
                                          name:"Protocol",
                                          minWidth:40,
                                          formatter:function(r,c,v,cd,dc){
                                              return formatProtocol(dc['protocol']);
                                          }
                                      },
                                      {
                                          field:"src_vn",
                                          name:"Source Network",
                                          minWidth:125,
                                          formatter: function (r,c,v,cd,dc) {
                                              var srcVN = dc['src_vn'] != null ? dc['src_vn'] : noDataStr;
                                              return formatVN(srcVN);
                                          }
                                      },
                                      {
                                          field:"sip",
                                          name:"Source IP",
                                          minWidth:70,
                                          formatter:function(r,c,v,cd,dc) {
                                              if(validateIPAddress(dc['sip']))
                                                  return dc['sip']
                                              else
                                                  noDataStr;
                                          }
                                      },
                                      {
                                          field:"src_port",
                                          name:"Source Port",
                                          minWidth:50
                                      },
                                      {
                                          field:"direction",
                                          name:"Direction",
                                          minWidth:50,
                                          formatter: function(r,c,v,cd,dc) {
                                              if (dc['direction'] == 'ingress')
                                                  return 'INGRESS'
                                              else if (dc['direction'] == 'egress')
                                                  return 'EGRESS'
                                              else
                                                  return '-';
                                          }
                                      },
                                      {
                                          field:"dst_vn",
                                          name:"Destination Network",
                                          minWidth:125,
                                          formatter: function (r,c,v,cd,dc) {
                                              var destVN = dc['dst_vn'] != null ? dc['dst_vn'] : noDataStr;
                                              return formatVN(destVN);
                                          }
                                      },
                                      {
                                          field:"dip",
                                          name:"Destination IP",
                                          minWidth:70,
                                          formatter:function(r,c,v,cd,dc) {
                                              if(validateIPAddress(dc['dip']))
                                                  return dc['dip']
                                              else
                                                  noDataStr;
                                          }
                                      },
                                      {
                                          field:"dst_port",
                                          name:"Destination Port",
                                          minWidth:50
                                      },
                                      {
                                          field:"stats_bytes",
                                          name:"Bytes/Pkts",
                                          minWidth:80,
                                          formatter:function(r,c,v,cd,dc){
                                              return contrail.format("{0}/{1}",formatBytes(dc['stats_bytes']),dc['stats_packets']);
                                          },
                                          searchFn:function(d){
                                              return d['stats_bytes']+ '/ ' +d['stats_packets'];
                                          }
                                      }
                              ];
        var gridRenderDefObj = $.Deferred();
        var prevClicked = false;
        gridRenderDefObj.done(function(){
            if(flowKeyStack.length > 0)
                $("#btnNextFlows").removeAttr('disabled'); 
        });
        $("#vrouterflows").contrailGrid({
            header : {
                title : {
                    text : 'Flows'
                },
                customControls: [
                                  '<button id="btnNextFlows" disabled="disabled" class="btn btn-primary btn-mini">Next >></button>',
                                  '<button id="btnPrevFlows" disabled="disabled" class="btn btn-primary btn-mini"><< Prev</button>',
                                  '<button id="revTraceFlowBtn" class="btn btn-primary btn-mini" disabled="disabled" title="Reverse Trace Flow">Reverse Trace Flow</button>',
                                  '<button id="traceFlowBtn" class="btn btn-primary btn-mini" disabled="disabled" title="Trace Flow">Trace Flow</button>',
                           ],
            },
            columnHeader : {
                columns: vRouterFlowsColumns
            },
            body : {
                options : {
                    forceFitColumns: true,
                    sortable : false,
                    checkboxSelectable: {
                        enableRowCheckbox: true,
                        onNothingChecked: function(e){
                            $("div.slick-cell-checkboxsel > input").removeAttr('disabled')
                            $("#mapflow").attr('disabled','disabled');
                            $("#traceFlowBtn").attr('disabled','disabled');
                            $("#revTraceFlowBtn").attr('disabled','disabled');
                        },
                        onSomethingChecked: function(e){
                            $("div.slick-cell-checkboxsel > input").attr('checked',false);
                            $("#mapflow").removeAttr('disabled');
                            $("#traceFlowBtn").removeAttr('disabled');
                            $("#revTraceFlowBtn").removeAttr('disabled');
                            $(e['currentTarget']).attr('checked',true);
                        }
                    },
                },
                dataSource : {
                    remote: {
                        ajaxConfig: {
                            url: function () {
                                return monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(computeNodeInfo) + '&introspectPort=' + computeNodeInfo['introspectPort'];
                            }(),
                            type: 'GET'
                        },
                        dataParser: function(response) {
                            //Need to diasable the next button if there are no more records
                            if(response != null && response[0]['FlowRecordsResp'] != null && response[0]['FlowRecordsResp']['flow_key'] == '0:0:0:0:0.0.0.0:0.0.0.0')
                                $("#btnNextFlows").attr('disabled','disabled'); 
                            return monitorInfraComputeFlowsClass.parseFlowsData(response,gridRenderDefObj);
                        },
                    },
                    events:{
                        onDataBoundCB : function () {
                            var gridObj = $("#vrouterflows").data('contrailGrid');
                            if(gridObj != null) {
                                var dataItems = gridObj._dataView.getItems();
                                var dataItemsLen = dataItems.length;
                                for(var i = 0; i < dataItemsLen; i++) {
                                    if(dataItems[i]['peer_vrouter'] == null) {
                                        $("[data-cgrid='"+dataItems[i]['cgrid']+"']").find('input.rowCheckbox').attr('disabled',true);
                                    }
                                }
                            }
                        }
                    }
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Flows..',
                    },
                    empty: {
                        text: 'No Flows to display'
                    }, 
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'icon-warning',
                        text: 'Error in getting Data.'
                    }
                }
            },
            footer : false,
        });
        vrouterflowsGrid = $("#vrouterflows").data('contrailGrid');
        vrouterflowsGrid.showGridMessage('loading');
        var newAjaxConfig = {};
        $("#btnNextFlows").click(function(){
            if(flowKeyStack.length > 0 && flowKeyStack[flowKeyStack.length - 1] != null){
                nextClicked = true;
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(computeNodeInfo) 
                                                            + '&flowKey=' + flowKeyStack[flowKeyStack.length - 1] + '&introspectPort=' + computeNodeInfo['introspectPort'],
                        type:'Get'
                    };
                $("#btnPrevFlows").removeAttr('disabled');
                vrouterflowsGrid.setRemoteAjaxConfig(newAjaxConfig);
                reloadGrid(vrouterflowsGrid);
            }
        });
        $("#btnPrevFlows").click(function(){
            if(nextClicked)
                flowKeyStack.pop();
            nextClicked = false;
            if(flowKeyStack.length > 0) {
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(computeNodeInfo) 
                            + '&flowKey=' + flowKeyStack.pop() 
                            + '&introspectPort=' + computeNodeInfo['introspectPort'],
                        type:'Get'
                    };
            } else if (flowKeyStack.length < 1){
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(computeNodeInfo) 
                            + '&introspectPort=' + computeNodeInfo['introspectPort'],
                        type:'Get'
                    };
                //Need to disable the prev button because flowKeystack < 1 which means first set of records call
                $("#btnPrevFlows").attr('disabled','disabled');
            } 
            vrouterflowsGrid.setRemoteAjaxConfig(newAjaxConfig);
            reloadGrid(vrouterflowsGrid);
            $("#btnNextFlows").removeAttr('disabled');
        });
    }

    $("#tracePathDropdown").contrailDropdown({
        dataTextField: "text",
        dataValueField: "value",
        change: function(e) {
            if($('#vrouterRadiobtn').is(':checked') == true) {
                $("#prevNextBtns").toggleClass('show hide');
                var deferredObj = $.Deferred(),vRouterData = {name:e['val']};
                updateVrouterFlowsGrid(deferredObj,vRouterData);
            } else if($('#instRadiobtn').is(':checked') == true) {
                $("#prevNextBtns").toggleClass('show hide');
                var ajaxConfig = {};
                ajaxConfig = getInstFlowsUrl(e['val'],VIRTUALMACHINE);
                reloadFlowsGrid(ajaxConfig);
            }
        }
    });
    function updateVrouterFlowsGrid(deferredObj,vRouterData) {
        cmpNodeView.getComputeNodeDetails(deferredObj,vRouterData);
        vrouterflowsGrid.showGridMessage('loading');
        $("#vrouterflows").find('.icon-spinner').show()
        deferredObj.done(function(data){
            $("#vrouterflows").parent().siblings('div.widget-header').find('.icon-spinner').hide()
            vRouterData['ip'] = getValueByJsonPath(data,'VrouterAgent;self_ip_list;0',getValueByJsonPath(data,'ConfigData;virtual-router;virtual_router_ip_address'));
            vRouterData['introspectPort'] = getValueByJsonPath(data,'VrouterAgent;sandesh_http_port',defaultIntrospectPort);
            renderVrouterFlowsGrid(vRouterData);
        });
    }
    var tracePathDropdown = $("#tracePathDropdown").data('contrailDropdown');
    tracePathDropdown.setData(computeNodeCombobox);
    tracePathDropdown.text(contrail.format('{0} ({1})',defaultValue,ip));
    
    $("#vrouterRadiobtn").prop('checked',true);
    var instances = getValueByJsonPath(globalObj,'topologyResponse;VMList',[]),instComboboxData = [];
    var instMap = {};
    for(var i = 0; i < instances.length; i++) {
        var instObj = instances[i];
        var instAttributes = ifNull(instObj['more_attributes'],{});
        var interfaceList = ifNull(instAttributes['interface_list'],[])
        var vmIp = '-',vmIpArr = [];
        if(interfaceList.length > 0) {
            for(var j = 0; j < interfaceList.length; j++) {
                var intfObj = interfaceList[j];
                if(intfObj['ip6_active']) {
                    vmIpArr.push(isValidIP(intfObj['ip6_address']) ? intfObj['ip6_address'] : '-');
                } else {
                    vmIpArr.push(isValidIP(intfObj['ip_address']) ? intfObj['ip_address'] : '-');
                }
            }
            if(vmIpArr.length > 0)
                vmIp = vmIpArr.join(',');
        }
        instComboboxData.push({
            text: instAttributes['vm_name']+' ('+vmIp+')',
            value: instances[i]['name']
        });
        instMap[instances[i]['name']] = instances[i];
    }
    //Todo when changing the VM flows to introspect need to merge this function
    function reloadFlowsGrid(newAjaxConfig) {
        var selectArray = parseStringToArray("other_vrouter_ip,agg-bytes", ',');
        selectArray = selectArray.concat(queries['fr']['defaultColumns']);
        var options = getFRDefaultOptions();
        options['elementId'] = 'vrouterflows';
        var columnDisplay = getColumnDisplay4Grid(queries['fr']['columnDisplay'], selectArray, true);
        selectArray = selectArray.concat(newAjaxConfig['data']['select']);
        loadFlowResultsForUnderlay(options,newAjaxConfig['data'],columnDisplay,null,true);
    }
    $('input[name="flowtype"]').change(function(){
        var ajaxConfig = {},selItem = {};
        if($('#vrouterRadiobtn').is(':checked') == true) {
            $("#prevNextBtns").toggleClass('show hide');
            tracePathDropdown.setData(computeNodeCombobox);
            selItem = $("#tracePathDropdown").data('contrailDropdown').getAllData()[0];
            var deferredObj = $.Deferred(),vRouterData = {name:selItem['value']};
            updateVrouterFlowsGrid(deferredObj,vRouterData);
        } else if($('#instRadiobtn').is(':checked') == true) {
            $("#prevNextBtns").toggleClass('show hide');
            tracePathDropdown.setData(instComboboxData);
            selItem = $("#tracePathDropdown").data('contrailDropdown').getAllData()[0];
            ajaxConfig = getInstFlowsUrl(selItem['value'],VIRTUALMACHINE);
            reloadFlowsGrid(ajaxConfig);
        }
    });
    
    $("#traceFlowBtn").die('click').live('click',function(e){
        var flowGrid = $("#vrouterflows").data('contrailGrid');
        var checkedRows = flowGrid.getCheckedRows();
        var dataItem = ifNull(checkedRows[0],{});
        var item = tracePathDropdown.getSelectedData();
        /*
         * For egress flows the source vm ip may not spawned in the same vrouter,
         * so need to pick the peer_vrouter
         */
        var postData = {},nwFqName = '';
        var postData = {
                srcIP: dataItem['sourceip'] != null ? dataItem['sourceip'] : dataItem['sip'],
                destIP: dataItem['destip'] != null ? dataItem['destip'] : dataItem['dip'],
                srcPort: dataItem['sport'] != null ? dataItem['sport'] : dataItem['src_port'],
                destPort: dataItem['dport'] != null ? dataItem['dport'] : dataItem['dst_port'],
                protocol: dataItem['protocol'],
         };
        if(dataItem['direction_ing'] == 1 || dataItem['direction'] == 'ingress') {
            if($("#vrouterRadiobtn").is(':checked')) {
                postData['nodeIP'] = item[0]['text'].split("(")[1].slice(0,-1);
            } else if($("#instRadiobtn").is(':checked')) {
                if (dataItem['vrouter_ip'] != null) {
                    postData['nodeIP'] = dataItem['vrouter_ip'];
                } else if (dataItem['vrouter'] != null){
                    var vrouterDetails = underlayView.prototype.getvRouterVMDetails(dataItem['vrouter'],'name',VROUTER);
                    postData['nodeIP'] = getValueByJsonPath(vrouterDetails,'more_attributes;VrouterAgent;self_ip_list;0','-');
                }
            }
            nwFqName = dataItem['sourcevn'] != null ? dataItem['sourcevn'] : dataItem['src_vn'];
        } else if(dataItem['direction_ing'] == 0 || dataItem['direction'] == 'egress') {
            postData['nodeIP'] = dataItem['other_vrouter_ip'] != null ? dataItem['other_vrouter_ip'] : dataItem['peer_vrouter'];
            nwFqName = dataItem['sourcevn'] != null ? dataItem['sourcevn'] : dataItem['src_vn'];
        }
        var progressBar = $("#network_topology").find('.topology-visualization-loading');
        $(progressBar).show();
        $(progressBar).css('margin-bottom',$(progressBar).parent().height());
        $.ajax({
            url:'api/tenant/networking/virtual-network/summary?fqNameRegExp='+nwFqName,
        }).always(function(networkDetails){
            if(networkDetails['value']!= null && networkDetails['value'][0] != null &&  networkDetails['value'][0]['value'] != null) {
                var vrfList = getValueByJsonPath(networkDetails,'value;0;value;UveVirtualNetworkConfig;routing_instance_list',[]);
                if(vrfList[0] != null)
                    nwFqName += ":"+vrfList[0];
            } else 
                // if there is no vrf name in the response then just constructing it in general format
                nwFqName += ":"+nwFqName.split(':')[2];
            postData['vrfName'] = nwFqName;
            $.ajax({
                url:'/api/tenant/networking/trace-flow',
                type:'POST',
                data:{
                    data: postData
                }
            }).success(function(response){
                _this.highlightPath(response, {data: postData});
            }).always(function(response){
                $("#network_topology").find('.topology-visualization-loading').hide();
            });
        });
    });
    $("#revTraceFlowBtn").die('click').live('click',function(e){
        var flowGrid = $("#vrouterflows").data('contrailGrid');
        var checkedRows = flowGrid.getCheckedRows();
        var dataItem = ifNull(checkedRows[0],{}),nwFqName = '';
        var item = tracePathDropdown.getSelectedData();
        /*
         * For egress flows the source vm ip may not spawned in the same vrouter,
         * so need to pick the peer_vrouter
         */
        var postData = {
                srcIP: dataItem['destip'] != null ? dataItem['destip'] : dataItem['dip'],
                        destIP: dataItem['sourceip'] != null ? dataItem['sourceip'] : dataItem['sip'],
                        srcPort: dataItem['dport'] != null ? dataItem['dport'] : dataItem['dst_port'],
                        destPort: dataItem['sport'] != null ? dataItem['sport'] : dataItem['src_port'],
               protocol: dataItem['protocol'],
        };
        if(dataItem['direction_ing'] == 0 || dataItem['direction'] == 'egress') {
            if($("#vrouterRadiobtn").is(':checked')) {
                postData['nodeIP'] = item[0]['text'].split("(")[1].slice(0,-1);
            } else if($("#instRadiobtn").is(':checked')) {
                if (dataItem['vrouter_ip'] != null) {
                    postData['nodeIP'] = dataItem['vrouter_ip'];
                } else if (dataItem['vrouter'] != null){
                    var vrouterDetails = underlayView.prototype.getvRouterVMDetails(dataItem['vrouter'],'name',VROUTER);
                    postData['nodeIP'] = getValueByJsonPath(vrouterDetails,'more_attributes;VrouterAgent;self_ip_list;0','-');
                }
            }
            nwFqName = dataItem['destvn'] != null ? dataItem['destvn'] : dataItem['dst_vn'];
        } else if(dataItem['direction_ing'] == 1 || dataItem['direction'] == 'ingress') {
            postData['nodeIP'] = dataItem['other_vrouter_ip'] != null ? dataItem['other_vrouter_ip'] : dataItem['peer_vrouter'];
            nwFqName = dataItem['destvn'] != null ? dataItem['destvn'] : dataItem['dst_vn'];
        }
        var progressBar = $("#network_topology").find('.topology-visualization-loading');
        $(progressBar).show();
        $(progressBar).css('margin-bottom',$(progressBar).parent().height());
        $.ajax({
            url:'api/tenant/networking/virtual-network/summary?fqNameRegExp='+nwFqName,
        }).always(function(networkDetails){
            if(networkDetails['value']!= null && networkDetails['value'][0] != null &&  networkDetails['value'][0]['value'] != null) {
                var vrfList = getValueByJsonPath(networkDetails,'value;0;value;UveVirtualNetworkConfig;routing_instance_list',[]);
                if(vrfList[0] != null)
                    nwFqName += ":"+vrfList[0];
            } else 
                // if there is no vrf name in the response then just constructing it in general format
                nwFqName += ":"+nwFqName.split(':')[2];
            postData['vrfName'] = nwFqName;
            $.ajax({
                url:'/api/tenant/networking/trace-flow',
                type:'POST',
                data:{
                    data: postData
                }
            }).success(function(response){
                _this.highlightPath(response, {data: postData});
            }).always(function(response){
                $("#network_topology").find('.topology-visualization-loading').hide();
            });
        });
    });
    function getInstFlowsUrl(name,type){
        var req = {};
        var ajaxData = {
                pageSize: 50,
                timeRange: 300,
                select: 'agg-bytes,agg-packets,vrouter_ip,other_vrouter_ip',
                fromTimeUTC: 'now-300s',
                toTimeUTC: 'now',
                queryId: randomUUID(),
                async: true,
                table:'FlowRecordTable'
        };
        if(type == VIRTUALMACHINE) {
            var vmData = instMap[name];
            var intfData = getValueByJsonPath(vmData,'more_attributes;interface_list',[]);
            var where = '';
            for(var i = 0; i < intfData.length; i++) {
                where += '(sourcevn = '+intfData[i]['virtual_network']+' AND sourceip = '+intfData[i]['ip_address']+')';
                if(i+1 > intfData.length)
                    where+= 'OR';
            }
            ajaxData['where'] = where;
        } else if(type == VROUTER) {
            ajaxData['where'] = "(vrouter = "+name+")";
        }
        ajaxData['engQueryStr'] = getEngQueryStr(ajaxData);
        req['data'] = ajaxData;
        req['url'] = '/api/admin/reports/query';
        return req;
    }
}
/*
 * This is utility function which accepts value to compare and key to lookup 
 * and type to check in globalObj and get the response where we lookup for the
 * value and returns the matche value if nothing matches empty object will be
 * returned.
 */
underlayView.prototype.getvRouterVMDetails = function(value,key,type){
    var data = [],selectedNode = {},id;
    if(type == VIRTUALMACHINE) 
        data = getValueByJsonPath(globalObj,'topologyResponse;VMList',[]);
    else if (type == VROUTER)
        data = getValueByJsonPath(globalObj,'topologyResponse;vRouterList',[]);
    $.each(data,function(idx,item){
        var details = jsonPath(item,'$..'+key);
        if($.isArray(details) && details.indexOf(value) > -1) {
            selectedNode = item;
        } else if (details == value) { 
            selectedNode = item;
        }
    });
    return selectedNode;
}
underlayView.prototype.runTracePath = function(context, obj, response) {
    var data = {};
    for(var i = 0; i < obj.length; i++) {
        if ($("#"+obj[i]['key']).data('contrailCombobox').value() != "")
            data[obj[i]['key']] = $("#"+obj[i]['key']).data('contrailCombobox').value();
    }
    if(JSON.stringify(data) !== "{}") {
        var ajaxCfg = {
            url      : "/api/tenant/networking/trace-flow",
            type     : "POST",
            data     : data,
            view     : this,
            callback : function(response) {
                this.view.highlightPath(response, data);
            }
        };
        this.getModel().getData(ajaxCfg);
    }
}

underlayView.prototype.getPostDataFromHashParams = function() {
    var hashParams = layoutHandler.getURLHashObj();
    var data = {"data" : {}};
    if(null !== hashParams && null !== hashParams.q && typeof hashParams.q !== "undefined") {
        var hasPostData = false;
        if(hashParams.q.hasOwnProperty('srcIP') && "" !== hashParams.q['srcIP']) {
            data.data["srcIP"] = hashParams.q['srcIP'];
            hasPostData = true;
        }
        if(hashParams.q.hasOwnProperty('sport') && "" !== hashParams.q['sport']) {
            data.data["sport"] = hashParams.q['sport'];
            hasPostData = true;
        }
        if(hashParams.q.hasOwnProperty('destIP') && "" !== hashParams.q['destIP']) {
            data.data["destIP"] = hashParams.q['destIP'];
            hasPostData = true;
        }
        if(hashParams.q.hasOwnProperty('dport') && "" !== hashParams.q['dport']) {
            data.data["dport"] = hashParams.q['dport'];
            hasPostData = true;
        }
        if(hashParams.q.hasOwnProperty('protocol') && "" !== hashParams.q['protocol']) {
            data.data["protocol"] = hashParams.q['protocol'];
            hasPostData = true;
        }
        if(hashParams.q.hasOwnProperty('srcVN') && "" !== hashParams.q['srcVN']) {
            data.data["srcVN"] = hashParams.q['srcVN'];
            hasPostData = true;
        }
        if(hashParams.q.hasOwnProperty('destVN') && "" !== hashParams.q['destVN']) {
            data.data["destVN"] = hashParams.q['destVN'];
            hasPostData = true;
        }
        if(hasPostData === true) {
            data.data["minsSince"] = 300;
        }
     }
     return data;
}
underlayView.prototype.addCommonTabs = function(tabDiv) {
    var _this = this;
    var tabObj = $("#"+tabDiv).data('contrailTabs');
    tabObj.addTab('traceFlow','Trace Flows',{position: 'before'});
    tabObj.addTab('flows-tab','Search Flows',{position: 'before'});
    $("#"+tabDiv).on('tabsactivate',function(e,ui){
        var selTab = $(ui.newTab.context).text();
        if(selTab == 'Search Flows')
            _this.renderFlowRecords();
        else if(selTab == 'Trace Flows')
            _this.renderTracePath();
    });
}

underlayView.prototype.renderUnderlayTabs = function() {
    var _this = this;
    $("#underlayTabs").html(Handlebars.compile($("#underlay-tabs").html()));
    $("#underlay_tabstrip").contrailTabs({
        activate:function (e, ui) {
            var selTab = $(ui.newTab.context).text();
            if (selTab == 'Search Flows') {
                _this.renderFlowRecords();
            } else if (selTab == 'Trace Flows') {
                _this.renderTracePath();
            } else if (selTab == 'Details') {
            }
        }
    });
}

underlayView.prototype.populateDetailsTab = function(data) {
    var type = data['type'],details,content = {},_this = this;
    //$("#detailsLink").show();
    //$("#underlay_tabstrip").tabs({active:2});
    if(type != 'link')
        $("#detailsLink").find('a.ui-tabs-anchor').html("Details");
    if(type == PROUTER) {
        _this.renderUnderlayTabs();
        $("#detailsLink").show();
        $("#underlay_tabstrip").tabs({active:2});
        content = {
            type      : PROUTER,
            hostName : ifNull(data['host_name'],'-'),
            description: ifNull(data['description'],'-'),
            intfCnt   : data['intfCnt']
        };
        details = Handlebars.compile($("#device-summary-template").html())(content);
        $("#detailsTab").html(details);
        var underlayTabObj = $("#underlay_tabstrip").data('contrailTabs');
        underlayTabObj.addTab('pRouterInterfacesTab','Interfaces');
        $("#underlay_tabstrip").on('tabsactivate',function(e,ui){
            var selTab = $(ui.newTab.context).text();
            if(selTab == 'Interfaces'){
                $("#pRouterInterfacesTab").html(Handlebars.compile($("#pRouterInterfaces").html()))
                var intfDetails = [];
                for(var i = 0; i < getValueByJsonPath(data,'response;more_attributes;ifTable',[]).length; i++ ) {
                    var intfObj = data['response']['more_attributes']['ifTable'][i];
                    var rowObj = {
                            ifDescr: ifNull(intfObj['ifDescr'],'-'),
                            ifIndex: ifNull(intfObj['ifIndex'],'-'),
                            ifInOctets: intfObj['ifInOctets'],
                            ifOutOctets: intfObj['ifOutOctets'],
                            ifPhysAddress: ifNull(intfObj['ifPhysAddress'],'-'),
                            rawData: intfObj
                    };
                    intfDetails.push(rowObj);
                }
                var dataSource = new ContrailDataView();
                dataSource.setData(intfDetails);
                var columns = [{
                    field:'ifDescr',
                    name:'Name',
                    minWidth: 150,
                },{
                    field:'ifIndex',
                    name:'Index',
                    minWidth: 150
                },{
                    field:'bandwidth',
                    name:'Traffic (In/Out)',
                    minWidth:150,
                    formatter:function(r,c,v,cd,dc) {
                        return contrail.format("{0} / {1}",formatBytes(dc['ifInOctets']),formatBytes(dc['ifOutOctets']));
                    }
                },{
                    field:'ifPhysAddress',
                    name:'Address',
                    minWidth:150,
                }];
                var selector = $("#pRouterInterfacesTab").find('div.contrail-grid')[0];
                $(selector).contrailGrid({
                    header : {
                        title : {
                            text : 'Interfaces'
                        }
                    },
                    columnHeader : {
                        columns:columns
                    },
                    body : {
                        options : {
                            forceFitColumns: true,
                            sortable : false
                        },
                        dataSource:{
                            dataView:dataSource,
                        },
                        statusMessages: {
                            loading: {
                                text: 'Loading Interface ...',
                            },
                            empty: {
                                text: 'No Interfaces to display'
                            }, 
                            errorGettingData: {
                                type: 'error',
                                iconClasses: 'icon-warning',
                                text: 'Error in getting Data.'
                            }
                        }
                    }
                });
            }
        });
    } else if (type == VROUTER) {
        content = data;
        content['page'] = 'underlay';
        $("#underlayTabs").html(Handlebars.compile($("#computenode-template").html())(content));
        var vRouterDetails = $.grep(globalObj['topologyResponse']['vRouterList'],function(value,idx){
                                return value['name'] == content['name'];
                             });
        var introspectPort = defaultIntrospectPort;
        try{
            introspectPort = vRouterDetails[0]['more_attributes']['VrouterAgent']['sandesh_http_port'];
        }catch(e){
            introspectPort = defaultIntrospectPort;
        }
        cmpNodeView.populateComputeNode({name:content['name'], ip:content['ip'], page:'underlay',
            introspectPort:introspectPort != null ? introspectPort : defaultIntrospectPort});
        _this.addCommonTabs('compute_tabstrip_'+content['name']);
    } else if(type == VIRTUALMACHINE) {
        check4CTInit(function() {
            _this.renderUnderlayTabs();
            content = data;
            var tabConfig = ctwgrc.getTabsViewConfig(ctwc.GRAPH_ELEMENT_INSTANCE, {
                fqName: content['virtualNetwork'],
                uuid: content['uuid']
            });
            cowu.renderView4Config($('#underlay_tabstrip'), null, tabConfig, null, null, null);
            _this.addCommonTabs('contrail-tabs');
        });
    } else if (type == 'link') {
        var endpoints = ifNull(data['endpoints'],[]);
        var sourceType = data['sourceElement']['attributes']['nodeDetails']['node_type'];
        var targetType = data['targetElement']['attributes']['nodeDetails']['node_type'];
        var url = '',link = '';
        var type = 'GET';
        var ajaxData = {};
        if(sourceType == VIRTUALMACHINE || targetType == VIRTUALMACHINE)
            return;
        _this.renderUnderlayTabs();
        $("#detailsLink").show();
        $("#underlay_tabstrip").tabs({active:2});
        //"Details" tab changing to "Traffic Statistics"
        $("#detailsLink").find('a.ui-tabs-anchor').html("Traffic Statistics");
        if(sourceType == PROUTER && targetType == PROUTER) {
            url = '/api/tenant/networking/underlay/prouter-link-stats';
            type = 'POST';
            ajaxData = {
                    "data": {
                        "endpoints": endpoints,
                        "sampleCnt": 150, 
                        "minsSince":60
                      }
                    };
            link = 'prouter';
            details = Handlebars.compile($("#link-summary-template").html())({link:link,intfObjs:[{}]});
            $("#detailsTab").html(details);
        } else if(sourceType == PROUTER && targetType == VROUTER) {
            var vrouter = (sourceType == VROUTER) ? data['sourceElement']['attributes']['nodeDetails']['name']
                           : data['targetElement']['attributes']['nodeDetails']['name'];
            url = 'api/tenant/networking/vrouter/stats';
            ajaxData = {
                    minsSince: 60,
                    sampleCnt: 120,
                    useServerTime: true,
                    vrouter:vrouter
            };
            var title = contrail.format('Traffic Statistics of {0}',vrouter);
            link = 'vrouter';
            details = Handlebars.compile($("#link-summary-template").html())({link:link,title:title});
            $("#detailsTab").html(details);
        }
        $.ajax({
            url:url,
            type:type,
            data:ajaxData
        }).success(function(response){
            var chartData = {};
            var selector = '',options = {
                                            height:300,
                                            yAxisLabel: 'Bytes per 30 secs',
                                            y2AxisLabel: 'Bytes per min'
                                        };
            if(link == 'vrouter') {
                selector = '#vrouter-ifstats';
                chartData = parseTSChartData(response);
                initTrafficTSChart(selector, chartData, options, null, "formatSumBytes", "formatSumBytes");
            } else if (link == 'prouter') {
                details = Handlebars.compile($("#link-summary-template").html())({link:link,intfObjs:response});
                $("#detailsTab").html(details);
                for(var i = 0; i < response.length; i++) {
                    var rawFlowData = response[i];
                    var lclData = ifNull(rawFlowData[0],{});
                    var rmtData = ifNull(rawFlowData[1],{});
                    var intfFlowData = [],lclInBytesData = [],lclOutBytesData = [],rmtInBytesData = [],rmtOutBytesData = [];
                    var lclFlows = getValueByJsonPath(lclData,'flow-series;value',[]);
                    var rmtFlows = getValueByJsonPath(rmtData,'flow-series;value',[]),chrtTitle,
                        lclNodeName = getValueByJsonPath(lclData,'summary;name','-'),
                        lclInfName = getValueByJsonPath(lclData,'summary;if_name','-'),
                        rmtNodeName = getValueByJsonPath(rmtData,'summary;name','-'),
                        rmtIntfName = getValueByJsonPath(rmtData,'summary;if_name','-');
                    
                    chrtTitle = contrail.format('Traffic statistics of link {0} ({1}) -- {2} ({3})',lclNodeName,
                                                lclInfName,rmtNodeName,rmtIntfName);
                    var inPacketsLocal = {key:contrail.format('{0} ({1})',lclNodeName,lclInfName), values:[]}, 
                        inPacketsRemote = {key:contrail.format('{0} ({1})',rmtNodeName,rmtIntfName), values:[]};
                    for(var j = 0; j < lclFlows.length; j++) {
                        var lclFlowObj = lclFlows[j];
                        inPacketsLocal['values'].push({
                            x: Math.floor(lclFlowObj['T=']/1000),
                            y: ifNull(lclFlowObj['SUM(ifStats.ifInPkts)'],0)
                        });
                    }
                    for(var j = 0; j < rmtFlows.length; j++) {
                        var rmtFlowObj = rmtFlows[j];
                        inPacketsRemote['values'].push({
                            x: Math.floor(rmtFlowObj['T=']/1000),
                            y: ifNull(rmtFlowObj['SUM(ifStats.ifInPkts)'],0)
                        });
                    }
                    var chartData = [inPacketsLocal,inPacketsRemote];
                    var icontag = "<i id='prouter-ifstats-loading-0' class='icon-spinner icon-spin blue bigger-125' " +
                            "style='display: none;'></i>";
                    $("#prouter-lclstats-widget-"+i).find('.widget-header > h4').html(icontag+chrtTitle);
                    options = {
                            height:300,
                            yAxisLabel: 'Packets per 72 secs',
                            y2AxisLabel: 'Packets per 72 secs',
                            defaultSelRange: 9 //(latest 9 samples)
                        };
                    initTrafficTSChart('#prouter-lclstats-'+i, chartData, options, null, "formatSumPackets", "formatSumPackets");
                }
            } 
        }).always(function(response){
            $("#detailsTab").find('.icon-spinner').hide();
        });
    }
}

underlayView.prototype.resizeTopology = function() {
    var topologySize = underlayRenderer.getView().calculateDimensions(false);
    underlayRenderer.getView().setDimensions(topologySize);
}

underlayView.prototype.expandTopology = function() {
    var topologySize = this.calculateDimensions(expanded);
    this.setDimensions(topologySize);
    //this.getPaper().setDimensions($("#topology-connected-elements").width(), $("#topology-connected-elements").height());
    var graph = this.getGraph();
    var newGraphSize = graph.getBBox(graph.getElements());
    var svgHeight = newGraphSize.height;
    var svgWidth = newGraphSize.width;
    var viewAreaHeight = $("#topology-connected-elements").height();
    var viewAreaWidth = $("#topology-connected-elements").width();
    var paperHeight = 0;
    var paperWidth = 0;
    var offsetX = 0;
    var offsetY = 0;
    var offset = {
        x: 0,
        y: 0
    };
    if(svgHeight < viewAreaHeight) {
        offsetY = (viewAreaHeight - svgHeight)/2;
    }

    if(svgWidth < viewAreaWidth) {
        offsetX = (viewAreaWidth - svgWidth)/2;
    }

    offset = {
        x: offsetX,
        y: offsetY
    };
    $.each(graph.getElements(), function (elementKey, elementValue) {
        elementValue.translate(offset.x, offset.y);
    });
    if(svgHeight > viewAreaHeight || svgWidth > viewAreaWidth) {
        this.getPaper().fitToContent();
    }
    this.initTooltipConfig();
    expanded = !expanded;
}

underlayView.prototype.launchVMPage = function(jsonObj) {
    if(null !== jsonObj && typeof jsonObj !== "undefined" &&
        jsonObj.hasOwnProperty('q') &&
        jsonObj['q'].hasOwnProperty('srcVN'))
        jsonObj['q']['srcVN'] = decodeURIComponent(jsonObj['q']['srcVN']);

    layoutHandler.setURLHashObj(jsonObj);
}

underlayView.prototype.showPath = function(connectionWrapIds, offsetWidth) {
    if(offsetWidth == null)
        offsetWidth = 5;
    if(!(connectionWrapIds instanceof Array))
        return;
    var hopLength = connectionWrapIds.length;
    for(var i=0;i<hopLength;i++) {
        this.addOffsetPath(connectionWrapIds[i],offsetWidth);
    }
}

underlayView.prototype.addOffsetPath = function(connectionWrapId, offsetWidth) {
    var connectionWrapElem = $('#' + connectionWrapId);
    if(connectionWrapElem.length > 0)
        connectionWrapElem = $(connectionWrapElem[0]);
    else
        return;
    var path = connectionWrapElem.attr('d');
    var pathCoords;
    if(typeof(path) == 'string') {
        pathCoords = path.match(/M ([\d.]+) ([\d.]+) C ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)/);
        if((pathCoords instanceof Array) && pathCoords.length == 9) {
            pathCoords.shift();
            pathCoords = $.map(pathCoords,function(val) {
                return parseFloat(val);
            });
            var offsetPath; 
            if(offsetWidth < 0) {
                offsetPath = connectionWrapElem.clone().prop('id',connectionWrapId + '_down');
            } else {
                offsetPath = connectionWrapElem.clone().prop('id',connectionWrapId + '_up');
            }
            var curve = new Bezier(pathCoords);
            offsetPath.attr('marker-end',"url(#head)");
            if(curve._linear != true) {
                var offsetPathStr = this.getOffsetBezierPath(pathCoords,offsetWidth);
                var offsetPathCords = offsetPathStr.split(' ');
                var offsetPathCordsLen = offsetPathCords.length;
                var lastX = offsetPathCords[offsetPathCords.length - 2];
                lastX = parseFloat(lastX) - 10;
                offsetPathCords[offsetPathCords.length - 2] = lastX;
                offsetPath.attr('d',offsetPathCords.join(' '));
            } else {
                //Vertical line
                if(pathCoords[0] == pathCoords[6]) {
                    //Pointing upwards/downwards
                    if(pathCoords[1] > pathCoords[7]) {
                        offsetPath.attr('transform','translate(' + offsetWidth + ',0)');
                        offsetPath.attr('marker-end',"url(#up)");
                    } else {
                        offsetPath.attr('transform','translate(-' + offsetWidth + ',0)');
                        offsetPath.attr('marker-end',"url(#down)");
                    }
                }
                //Horizontal line
                if(pathCoords[1] == pathCoords[7]) {
                    offsetPath.attr('transform','translate(0,' + offsetWidth + ')');
                }
            }
            
            if(offsetWidth < 0) {
                offsetPath.attr('class','connection-wrap-down');
            } else {
                offsetPath.attr('class','connection-wrap-up');
            }
            offsetPath.insertAfter(connectionWrapElem);
        }
    }
}

underlayView.prototype.getOffsetBezierPath = function(pathCoords, offsetWidth) {
    //var curve = new Bezier(315,225,431,225,431,141,547,141);
    var curve = new Bezier(pathCoords);
    if(curve._linear == true) {
    }
    var offsetCurve = curve.offset(offsetWidth);
    var offsetCurvePath = "";
    for(var i=0;i<offsetCurve.length;i++) {
        offsetCurvePath += " " + offsetCurve[i].toSVG();
    }
    return offsetCurvePath;
}

underlayView.prototype.destroy = function() {
    this.connectedElements = [];
    this.elementMap        = {
        nodes: {},
        links: {}
    };
    var vizTemplate = $("#visualization-template");
    if(isSet(vizTemplate)) {
        vizTemplate.remove();
        vizTemplate = $();
    }
}



var underlayController = function (model, view) {
    this.model = model || new underlayModel({nodes:[], links:[]});
    this.view  = view  || new new underlayView(this._model);
}

underlayController.prototype.getModel = function() {
    return this.model;
}

underlayController.prototype.getView = function() {
    return this.view;
}

underlayController.prototype.getModelData = function(cfg) {
    var data   = this.getView().getPostDataFromHashParams();
    var _this  = this,url = '/api/tenant/networking/underlay-topology';
    $("#underlay_topology").find('.topology-visualization-loading').show();
    //Force refresh call config
    var forceCallCfg = {
            url     : url+'?forceRefresh',
            type    : "GET",
            data    : data,
            callback: function (forceResponse) {
                //removing the progress bar and clearing the graph
                $("#network_topology").find('.topology-visualization-loading').hide();
                if(getValueByJsonPath(forceResponse,'nodes',[]).length == 0 ) {
                    showEmptyInfo('network_topology');
                    $("#underlay_tabstrip").tabs('disable');
                } else if(forceResponse['topologyChanged']) {
                    var graph = _this.getView().getGraph();
                    graph.clear();
                    $("#topology-connected-elements").find('div').remove();
                    _this.getModel().setTree({});
                    topologyCallback(forceResponse);
                    //Enabling the below tabs only on success of ajax calls.
                    $("#underlay_tabstrip").tabs('enable');
                    //Rendering the first search flows tab
                    underlayView.prototype.renderFlowRecords();
                }
            },
            failureCallback : function (err) {
                $("#network_topology").find('.topology-visualization-loading').hide();
                $("#underlay_topology").html('Error in fetching details');
            }
        }
    //Cache call config
    var tmpCfg = {
        url      : url,
        type     : "GET",
        data     : data,
        callback : function (response) {
            //removing the progress bar
            $("#network_topology").find('.topology-visualization-loading').hide();
            if(getValueByJsonPath(response,'nodes',[]).length > 0) {
                //Enabling the below tabs only on success of ajax calls.
                $("#underlay_tabstrip").tabs('enable');
                //Rendering the first search flows tab
                underlayView.prototype.renderFlowRecords();
            }
            topologyCallback(response);
            _this.getModel().getData(forceCallCfg);
        },
        //Calling the force refresh call on failure of the cache call
        failureCallback : function (err) {
            $("#network_topology").find('.topology-visualization-loading').hide();
            _this.getModel().getData(forceCallCfg);
        }
    };
    function topologyCallback(response){
        globalObj['topologyResponse'] = response;
        var virtualMachineList = $.grep(ifNull(response['nodes'],[]),function(value,idx){
            return value['node_type'] == 'virtual-machine';
        });
        var vRouterList = $.grep(ifNull(response['nodes'],[]),function(value,idx){
           return value['node_type'] == 'virtual-router'; 
        });
        globalObj['topologyResponse']['VMList'] = virtualMachineList;
        globalObj['topologyResponse']['vRouterList'] = vRouterList;
        _this.getModel().setNodes(response['nodes']);
        _this.getModel().setLinks(response['links']);
        _this.getModel().updateChassisType(response['nodes']);
        _this.getModel().categorizeNodes(response['nodes']);
        _this.getModel().formTree();
        _this.getView().renderTopology(response);
    }
    function showEmptyInfo(container) {
        $("#"+container).html('<div class="display-nonodes">No Physical Devices found</div>');
    }
    if(null !== cfg && typeof cfg !== "undefined")
        this.getModel().getData(cfg);
    else
        this.getModel().getData(tmpCfg);
}

underlayController.prototype.destroy = function() {
    //tbd
}

