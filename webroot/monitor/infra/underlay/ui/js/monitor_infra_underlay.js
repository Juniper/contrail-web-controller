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
var view ="cdg";
var expanded = true;

function underlayRenderer() {
    this.load = function(obj) {
        this.configTemplate = Handlebars.compile($("#visualization-template").html());
        Handlebars.registerPartial("deviceSummary", $("#device-summary-template").html());
        $("#content-container").html('');
        $("#content-container").html(this.configTemplate);
        currTab = 'mon_infra_underlay';
        this.model = new underlayModel({nodes:[], links:[]});
        this.view  = new underlayView(this.model);
        this.controller = new underlayController(this.model, this.view);
        this.controller.getModelData();
        var instanceDS = new SingleDataSource('instDS');
        instanceDS.getDataSourceObj();
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

underlayModel.prototype.parseTree = function(parents, tree) {
    if(null !== parents && false !== parents && 
        typeof parents === "object" && parents.length > 0) {
        var parent_chassis_type = parents[0].chassis_type;
        var children_chassis_type = "";
        switch (parent_chassis_type) {
            case "core":
                children_chassis_type = "spine";
                break;
            case "spine":
                children_chassis_type = "tor";
                break;
            case "tor":
                children_chassis_type = "virtual-router";
                break;
            case "virtual-router":
                children_chassis_type = "virtual-machine";
        }
        for(var i=0; i<parents.length; i++) {
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

underlayModel.prototype.getNodesOfType = function(type) {
    var nodes = this.getNodes();
    var nodesOfType = jsonPath(nodes, "$[?(@.chassis_type=='" + type + "')]");
    return (nodesOfType === false ||
        null === nodesOfType ||
        typeof nodesOfType === "undefined" ) ? [] : nodesOfType;
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

underlayModel.prototype.clearOtherNodes = function(nodeType) {
    var nodes = this.getNodes();
    var links = this.getLinks();
    var elements = this.getConnectedElements();
    var elementMap = this.getElementMap();

    for(var i=0; i<nodes.length; i++) {
        if(nodes[i].chassis_type === nodeType) {
            $.each(links, function(linkKey, linkValue) {
                if(linkValue.endpoints.indexOf(nodes[i].name) !== -1) {
                    links.splice(linkKey, 1);
                }
            });

            nodes.splice(i,1);

        }
    }
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

underlayModel.prototype.appendNodes = function(newNodes) {
    var nodes = this.getNodes();
    for(var i=0; i<newNodes.length; i++) {
        nodes.push(newNodes[i]);
    };
    this.setNodes(nodes);
}

underlayModel.prototype.appendLinks = function(newLinks) {
    var links = this.getLinks();
    for(var i=0; i<newLinks.length; i++) {
        links.push(newLinks[i]);
    };
    this.setLinks(links);
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
    this.elementTree = {};
    this.connectedElements = [];
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
    this.initZoomControls();
    this.contextMenuConfig = {};
    this.tooltipConfig = {};
    var _this = this;
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
    this.renderFlowRecords();
}

underlayView.prototype.getConnectedElements = function() {
    return this.connectedElements;
}

underlayView.prototype.getElementMap = function() {
    return this.elementMap;
}

underlayView.prototype.getElementTree = function() {
    return this.elementTree;
}

underlayView.prototype.calculateDimensions = function(expand) {
    var viewArea = this.getViewArea();
    var viewAreaHeight = viewArea.height;
    var viewAreaWidth = viewArea.width;

    var topologyHeight = (expand === true) ? viewAreaHeight*90/100 : viewAreaHeight*60/100;
    var detailsTabHeight = (expand === true) ? viewAreaHeight*10/100 : viewAreaHeight*40/100;
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

underlayView.prototype.setElementTree = function(tree) {
    if(null !== tree && typeof tree !== "undefined") {
        this.elementTree = tree;
    } else {
        this.elementTree = {};
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

underlayView.prototype.getNodeElementByName = function(name) {

}

underlayView.prototype.formElementTree = function(prop, propObj, elTree, elMap, conElements) {
    if ( typeof prop === "undefined" || null === prop ||
        {} === prop || false === prop)
        return;
    elTree[prop] = {};
    var nodeElement = jsonPath(elMap, "$..nodes[" + prop + "]");
    if(false !== nodeElement && null !== nodeElement && typeof nodeElement === "object" &&
        nodeElement.length == 1) {
        elTree[prop]["element_id"] = nodeElement[0];
    }

    if(propObj.hasOwnProperty("children")) {
        elTree[prop]["children"] = {};
        var children = propObj["children"];
        for(var child in children) {
            this.formElementTree(child, children[child], elTree[prop]["children"], elMap, conElements);
        }
    }

}

underlayView.prototype.createElements = function() {
    this.createNodes();
    this.createLinks();
    this.createElementTree();
}

underlayView.prototype.createElementTree = function() {
    var treeModel = this.getModel().getTree();
    var elementTree = this.getElementTree();
    var elementMap = this.getElementMap();
    var conElements = this.getConnectedElements();
    for(var prop in treeModel) {
        if(treeModel.hasOwnProperty(prop)) {
            this.formElementTree(prop, treeModel[prop], elementTree, elementMap, conElements);
        }
    }
    this.setElementTree(elementTree);
}
//Try Directed Graph - Begin
underlayView.prototype.DGPrepare = function(prop, propObj, adjList) {
    if ( typeof prop === "undefined" || null === prop ||
        {} === prop || false === prop)
        return;
    adjList[prop] = [];
    if(propObj.hasOwnProperty("children")) {
        var children = propObj["children"];
        for(var child in children) {
            adjList[prop][adjList[prop].length] = child;
            this.DGPrepare(child, children[child], adjList);
        }
    }
}

underlayView.prototype.layout = function() {
    if(view === "cdg") {
        view = "dg";
        var adjList = this.prepareData();
        var elements = this.buildGraphFromAdjacencyList(adjList);
        var graph = this.getGraph();
        graph.clear();
        $("#topology-connected-elements").find("div").remove();
        graph.addCells(elements);
        joint.layout.DirectedGraph.layout(graph, {
            setLinkVertices: false
        });
        this.getPaper().fitToContent();
    } else if(view === "dg") {
        var graph = this.getGraph();
        graph.clear();
        $("#topology-connected-elements").find("div").remove();
        this.renderTopology({nodes: this.getModel().getNodes(), links: this.getModel().getLinks()})
        view = "cdg";
    }
}

underlayView.prototype.prepareData = function() {
    var treeModel = this.getModel().getTree();
    var adjList = {};
    for(var prop in treeModel) {
        if(treeModel.hasOwnProperty(prop)) {
            this.DGPrepare(prop, treeModel[prop], adjList);
        }
    }
    return adjList;
}

underlayView.prototype.buildGraphFromAdjacencyList = function(adjacencyList) {

    var elements = [];
    var links = [];
    var _this = this;
    var i=0;
    _.each(adjacencyList, function(edges, parentElementLabel) {
        elements.push(_this.makeElement(parentElementLabel, i++));

        _.each(edges, function(childElementLabel) {
            links.push(_this.makeLink(parentElementLabel, childElementLabel));
        });
    });

    // Links must be added after all the elements. This is because when the links
    // are added to the graph, link source/target
    // elements must be in the graph already.
    return elements.concat(links);
}

underlayView.prototype.makeLink = function(parentElementLabel, childElementLabel) {

    //var link = this.createLink({"endpoints" : [parentElementLabel, childElementLabel]}, this.getConnectedElements(), this.getElementMap(), 0);
    //return link;
    return new joint.dia.Link({
        source: { id: parentElementLabel },
        target: { id: childElementLabel },
        attrs: {
            '.marker-target': { d: 'M 4 0 L 0 2 L 4 4 z' }
        },
        smooth: true
    });
}

underlayView.prototype.makeElement = function(label, i) {
    var maxLineLength = _.max(label.split('\n'), function(l) {
        return l.length;
    }).length;

    // Compute width/height of the rectangle based on the number
    // of lines in the label and the letter size. 0.6 * letterSize is
        // an approximation of the monospace font letter width.
    var letterSize = 8;
    var width = 100;//2 * (letterSize * (0.6 * maxLineLength + 1));
    var height = 2 * ((label.split('\n').length + 1) * letterSize);
    /*var nodes = this.getModel().getNodes();
    var node = jsonPath(nodes, "$[?(@.name=='" + label + "')]");
    var newElement = this.createNode(node[0], i);
    return newElement;*/
    return new joint.shapes.basic.Rect({
        id: label,
        size: { width: width, height: height },
        attrs: {
            text: { text: (label.length > 10) ? label.substr(0,8)+".." : label, 
                'font-size': letterSize, 
                'font-family': 'monospace' 
            },
            rect: {
                width: width,
                height: height,
                rx: 5,
                ry: 5,
                stroke: '#555'
            }
        }
    });
}


/*underlayView.prototype.createElementTree = function() {
    var treeModel = this.getModel().getTree();
    var elementTree = this.getElementTree();
    var elementMap = this.getElementMap();
    var conElements = this.getConnectedElements();
    var i =0;
    for(var prop in treeModel) {
        if(treeModel.hasOwnProperty(prop)) {
            this.formElementTree1(prop, treeModel[prop], elementMap, conElements, i);
        }
    }
    this.setConnectedElements(conElements);
    this.setElementMap(elementMap);
    //this.setElementTree(elementTree);
}

underlayView.prototype.formElementTree1 = function(prop, propObj, elMap, conElements, i) {
    if ( typeof prop === "undefined" || null === prop ||
        {} === prop || false === prop)
        return;
    var el = this.createNode(propObj, i, 0);
    conElements.push(el);
    if(!elMap.hasOwnProperty('nodes'))
        elMap.nodes = {};
    elMap.nodes[prop] = el.id;
    if(propObj.hasOwnProperty("children")) {
        var children = propObj["children"];
        for(var child in children) {
            this.formElementTree1(child, children[child], elMap, conElements, i++);
        }
    }
}*/

underlayView.prototype.createNodes = function() {
        var newElement, nodeName;
        var tors      = this.getModel().getTors();
        var spines    = this.getModel().getSpines();
        var cores     = this.getModel().getCores();
        var vrouters  = this.getModel().getVrouters();
        var vms       = this.getModel().getVMs();
        var elements  = [];
        var elementMap = {
            nodes: {},
            links: {}
        };

        for (var i = 0; i < cores.length; i++) {
            newElement = this.createNode(cores[i], i, cores.length);
            nodeName = cores[i]['name'];
            elements.push(newElement);
            elementMap.nodes[nodeName] = newElement.id;
        }

        for (var i = 0; i < spines.length; i++) {
            newElement = this.createNode(spines[i], i, spines.length);
            nodeName = spines[i]['name'];
            elements.push(newElement);
            elementMap.nodes[nodeName] = newElement.id;
        }

        for (var i = 0; i < tors.length; i++) {
            newElement = this.createNode(tors[i], i, tors.length);
            nodeName = tors[i]['name'];
            elements.push(newElement);
            elementMap.nodes[nodeName] = newElement.id;
            var torPositionX = newElement.attributes.position.x;
            var virtualRouters = this.getModel().getVroutersUnderTor(tors[i]['name']);
            for (var j = 0; j < virtualRouters.length; j++) {
                var newElementVR = this.createNode(virtualRouters[j], j, virtualRouters.length, torPositionX);
                var nodeNameVR = virtualRouters[j]['name'];
                elements.push(newElementVR);
                elementMap.nodes[nodeNameVR] = newElementVR.id;
                var vrPositionX = newElementVR.attributes.position.x;
                var vms = this.getModel().getVMsUnderVrouter(virtualRouters[j]['name']);
                for (var k = 0; k < vms.length; k++) {
                    var newElementVM = this.createNode(vms[k], k, vms.length,vrPositionX);
                    var nodeNameVM = vms[k]['name'];
                    elements.push(newElementVM);
                    elementMap.nodes[nodeNameVM] = newElementVM.id;
                }
            }
        }
        this.setConnectedElements(elements);
        this.setElementMap(elementMap);
}

underlayView.prototype.createNode = function(node, i, cnt, offset) {
    var nodeName = node['name'],
        type = node.node_type,
        chassis_type = node.chassis_type,
        width = 40,
        height = 40,
        imageLink, element, options, imageName;
        var yPos = 0, xPos = 0;
        if(typeof offset !== "number") {
            offset = 0;
            i = i+1;
        }

        switch(chassis_type) {
            case "coreswitch":
                //tbd - make it 'core' here and in backend
                xPos = i*425 + offset;
                yPos = 20;
                break;
            case "spine":
                chassis_type = 'router';
                xPos = i*275 + offset;
                yPos = 120;
                break;
            case "tor":
                chassis_type = 'switch';
                xPos = i*275 + offset;
                yPos = 220;
                break;
            case "virtual-router":
                xPos = i*150 + offset;
                yPos = 320;
                break;
            case "virtual-machine":
                xPos = i*150 + offset;
                yPos = 420;
                break;
            case "virtual-network":
                xPos = i*150 + offset;
                yPos = 420;
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
                    text: contrail.truncateText(nodeName,20)
                }
            },
            size: {
                width: width,
                height: height
            },
            position: {
                x: xPos,
                y: yPos
            },
            nodeDetails: node,
            font: {
                iconClass: 'icon-contrail-' + chassis_type
            }
        };
    element = new ContrailElement(type, options);
    return element;
}

underlayView.prototype.createLinks = function() {
    var links = this.getModel().getLinks();
    var elementMap = this.getElementMap();
    var elements = this.getConnectedElements();

    for (var i = 0; i < links.length; i++) {
        var link = this.createLink(links[i], elements, elementMap, 0);
        elements.push(link);
        elementMap.links[link.attributes.linkDetails.endpoints[0] + '<->' + link.attributes.linkDetails.endpoints[1]] = link.id;
        elementMap.links[link.attributes.linkDetails.endpoints[1] + '<->' + link.attributes.linkDetails.endpoints[0]] = link.id;
    }

    this.setConnectedElements(elements);
    this.setElementMap(elementMap);
}

underlayView.prototype.createLink = function(link, elements, elementMap, layer) {
        var options;
        var link_type ="link";
        var linkElement;
        var endPoint0 = jsonPath(elements, "$.*[?(@.id=='" + elementMap.nodes[[link.endpoints[0]]] + "')]")[0].nodeDetails.node_type;
        var endPoint1 = jsonPath(elements, "$.*[?(@.id=='" + elementMap.nodes[[link.endpoints[1]]] + "')]")[0].nodeDetails.node_type;

        var endpoint0 = endPoint0.split('-');
        var endpoint1 = endPoint1.split('-');
        link.link_type = endpoint0[0][0] + endpoint0[1][0] + '-' + endpoint1[0][0] + endpoint1[1][0];
        options = {
            direction   : "bi",
            linkType    : link.link_type,
            linkDetails : link
        };
        var newX = 0;
        var newY = 0;
        if(layer === 0) {
            link['connectionStroke'] = '#637939';
        } else {
            link['connectionStroke'] = '#498AB9';

        }

        options['sourceId'] = elementMap.nodes[link.endpoints[0]];
        options['targetId'] = elementMap.nodes[link.endpoints[1]];
        linkElement = new ContrailElement('link', options);
        return linkElement;
}

underlayView.prototype.initZoomControls = function() {
    $("#topology-connected-elements").panzoom({
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
                var instances = globalObj['dataSources']['instDS']['dataSource'].getItems();
                var instanceName = "";
                var lbl = "UUID";
                var instanceUUID = viewElement.attributes.nodeDetails['name'];
                var vmIp = "";
                var vn = "";
                for(var i=0; i<instances.length; i++) {
                    if(instances[i].name === instanceUUID) {
                        lbl = "Name";
                        instanceName = instances[i].vmName;
                        if(instances[i].ip && instances[i].ip.length>0) {
                            vmIp = instances[i].ip.join();
                        }
                        if(instances[i].vn && instances[i].vn.length>0) {
                            vn = instances[i].vn.join();
                        }
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
                var instances = globalObj['dataSources']['instDS']['dataSource'].getItems();
                var vms = 0;
                for(var i=0; i<instances.length; i++) {
                    if(instances[i].vRouter === viewElement.attributes.nodeDetails['name']) {
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
                var instances = globalObj['dataSources']['instDS']['dataSource'].getItems();
                var instanceName1 = "";
                var instanceName2 = "";
                var endpoint1 = viewElement.attributes.linkDetails.endpoints[0];
                var endpoint2 = viewElement.attributes.linkDetails.endpoints[1];
                for(var i=0; i<instances.length; i++) {
                    if(instances[i].name === endpoint1) {
                        instanceName1 = instances[i].vmName;
                    } else if (instances[i].name === endpoint1) {
                        instanceName2 = instances[i].vmName;
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
    $('g.element').find('text').css('fill', "#333");
    $('g.element').find('rect').css('fill', "#FFF");
    $('g.link')
        .removeClassSVG('elementHighlighted')
        .removeClassSVG('dimHighlighted');
    $("g.link").find('path.connection')
        .css("stroke", "#333");
    $("g.link").find('path.marker-source')
        .css("fill", "#333")
        .css("stroke", "#333");
    $("g.link").find('path.marker-target')
        .css("fill", "#333")
        .css("stroke", "#333");
    $("g.link").find('path.connection-wrap')
        .css("opacity", "")
        .css("fill", "")
        .css("stroke", "");
}

underlayView.prototype.initGraphEvents = function() {
    var paper = this.getPaper();
    var graph = this.getGraph();
    var selectorId = paper.el.id;
    var _this      = this;

    paper.on('blank:pointerclick', function (evt, x, y) {
        //evt.stopImmediatePropagation();
        //_this.resetTopology();
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
                    _this.resetTopology();
                    _this.showChildrenOfType(dblClickedElement, "virtual-router");
                }
                $('g.PhysicalRouter').popover('hide');
                break;

            case 'contrail.VirtualRouter':
                var model_id          = $(dblClickedElement).attr('id');
                //Faint all
                _this.clearHighlightedConnectedElements();
                _this.addDimlightToConnectedElements();

                //Highlight selected vrouter
                _this.addHighlightToNode(model_id);

                if(ZOOMED_OUT == 0) {
                    ZOOMED_OUT = 0.9;
                    $("#topology-connected-elements").panzoom("zoom",ZOOMED_OUT);
                }
                _this.hideVMs();
                _this.showChildrenOfType(dblClickedElement, "virtual-machine");
                break;
            case 'link':
                var modelId = dblClickedElement.id;
                var targetElement = graph.getCell(dblClickedElement['attributes']['target']['id']),
                    sourceElement = graph.getCell(dblClickedElement['attributes']['source']['id']);
                break;
        }
    });

    paper.on('cell:pointerclick', function (cellView, evt, x, y) {
        evt.stopImmediatePropagation();
        timeout = setTimeout(function() {
            // This inner function is called after the delay
            // to handle the 'click-only' event.
            var clickedElement = cellView.model,
                elementType    = clickedElement['attributes']['type'],
                data           = {};

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
                    var vRouterDetails = globalObj['dataSources']['computeNodeDS']['dataSource'].getItems();
                    var selVrouterDetails = $.grep(vRouterDetails,function(item,idx){
                        return (item['name'] == nodeDetails['name']); 
                    });
                    var name = selVrouterDetails.length > 0 ? selVrouterDetails[0]['name'] : '-';
                    var hostNameIp =  selVrouterDetails.length > 0 ? (selVrouterDetails[0]['name'] + ' ('+selVrouterDetails[0]['ip']+')') : '-';
                    data['type'] = VROUTER,
                    data['version'] = selVrouterDetails.length > 0 ? selVrouterDetails[0]['version'] : '-';
                    data['interfaceCnt'] = selVrouterDetails.length > 0 ? selVrouterDetails[0]['intfCnt'] : '-';
                    data['hostName'] = hostNameIp;
                    data['virtualNetworkCnt'] = selVrouterDetails.length > 0 ? selVrouterDetails[0]['vnCnt'] : '-';
                    data['instanceCount'] = selVrouterDetails.length > 0 ? selVrouterDetails[0]['instCnt']: '-';
                    data['memory'] = selVrouterDetails.length > 0 ? selVrouterDetails[0]['memory']: '-';
                    data['link'] = {p:'mon_infra_vrouter',q:{node:name,tab:''}};
                    _this.populateDetailsTab(data);
                    break;
                case 'contrail.VirtualMachine':
                    var nodeDetails = clickedElement['attributes']['nodeDetails'];
                    var instances = globalObj['dataSources']['instDS']['dataSource'].getItems();
                    var ip = [],vnList = [],intfLen = 0,vmName,srcVN = "",instDetails = {};
                    for(var i = 0; i < instances.length; i++) {
                        if(instances[i]['name'] == nodeDetails['name']) {
                            var intfList = ifNull(instances[i]['rawData']['UveVirtualMachineAgent']['interface_list'],[]);
                            intfLen = intfList.length;
                            instDetails = instances[i];
                            vmName = instances[i]['vmName'];
                            if (intfLen > 1) {
                                for(var j = 0; j < intfLen; j++) {
                                    ip.push(intfList[j]['ip_address']);
                                    vnList.push(intfList[j]['virtual_network']);
                                }
                            } else {
                               ip[0] =  intfList[0]['ip_address'];
                               vnList[0] = intfList[0]['virtual_network'];
                            }
                            var networkName = vnList[0].split(':')[2];
                            var projectName = '('+vnList[0].split(':')[1]+')';
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
                            name: ifNull(instDetails['vmName'],'-'),
                            uuid: ifNull(nodeDetails['name'],'-'),
                            ipAddr: ip.length > 0 ? ip.join(',') : '-',
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

    $(selectorId + " text").on('mousedown touchstart', function (e) {
        e.stopImmediatePropagation();
        paper.pointerdown(e);
    });

    $(selectorId + " image").on('mousedown touchstart', function (e) {
        e.stopImmediatePropagation();
        paper.pointerdown(e);
    });

    $(selectorId + " polygon").on('mousedown touchstart', function (e) {
        e.stopImmediatePropagation();
        paper.pointerdown(e);
    });
    $(selectorId + " path").on('mousedown touchstart', function (e) {
        e.stopImmediatePropagation();
        paper.pointerdown(e);
    });
    $(selectorId + " rect").on('mousedown touchstart', function (e) {
        e.stopImmediatePropagation();
        paper.pointerdown(e);
    });
    $(selectorId + " .font-element").on('mousedown touchstart', function (e) {
        e.stopImmediatePropagation();
        paper.pointerdown(e);
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
    this.clearHighlightedConnectedElements();
    $("#topology-connected-elements").panzoom("reset");
    ZOOMED_OUT = 0;
    this.hideVRouters();
    this.hideVMs();
    $("#underlay_topology").removeData('nodeType');
    $("#underlay_topology").removeData('nodeName');
}

underlayView.prototype.renderTopology = function(response) {
    this.createElements();
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
    _this.resetTopology();
    highlightedElements = {
        nodes: [],
        links: []
    };
    var elementMap = _this.getElementMap();
    var conElements = _this.getConnectedElements();
    var graph      = _this.getGraph();
    var nodes      = response.nodes;
    var links      = response.links;

    for(var i=0; i<nodes.length; i++) {
        highlightedElements.nodes.push(nodes[i]);
    }

    for (var i = 0; i < links.length; i++) {
        highlightedElements.links.push(links[i].endpoints[0] + "<->" + links[i].endpoints[1]);
    }

    if(highlightedElements.nodes.length > 0) {
        if(ZOOMED_OUT == 0) {
            ZOOMED_OUT = 0.9;
            $("#topology-connected-elements").panzoom("zoom", ZOOMED_OUT);
        }
    }
    highlightedElements.nodes = $.unique(highlightedElements.nodes);
    for(var i=0; i<highlightedElements.nodes.length; i++) {
        var node = elementMap.nodes[highlightedElements.nodes[i].name];
        if($('g.element[model-id="' + node + '"]').hasClassSVG('hidden'))
            $('g.element[model-id="' + node + '"]').removeClassSVG('hidden');

        if($('div[font-element-model-id="' + node + '"]').hasClass('hidden'))
            $('div[font-element-model-id="' + node + '"]').removeClass('hidden');
    }
    highlightedElements.links = $.unique(highlightedElements.links);
    var linkEl = [];
    $.each(highlightedElements.links, function(linkKey, linkValue) {
        var nodeElement = graph.getCell(elementMap.links[linkValue]);
        if(typeof nodeElement === "undefined")
            return;
        $("g.link[model-id='" + nodeElement.id + "']").removeClassSVG('hidden');
        $("g.link[model-id='" + nodeElement.id + "']")
            .find('path.connection-wrap')
                .css("opacity", ".2")
                .css("fill", "#498AB9")
                .css("stroke", "#498AB9");
    });

    var srcIP = data.data['srcIP'];
    var destIP = data.data['destIP'];
    var instances = globalObj['dataSources']['instDS']['dataSource'].getItems();
    var srcVM = jsonPath(instances, "$[?(@.ip=='" + srcIP + "')]");
    if(false !== srcVM) {
        srcVM = srcVM[0].name;
    }
    var destVM = jsonPath(instances, "$[?(@.ip=='" + destIP + "')]");
    if(false !== destVM) {
        destVM = destVM[0].name;
    }
    for(var i=0; i<highlightedElements.nodes.length; i++) {
        var hlNode = highlightedElements.nodes[i];
        if(hlNode.node_type === 'virtual-machine') {
            var model_id = elementMap.nodes[hlNode.name];
            var associatedVRouter =
            jsonPath(globalObj.dataSources.instDS.dataSource.getItems(), "$[?(@.name =='" + hlNode.name + "')]");
            var associatedVRouterUID = "";
            if(false !== associatedVRouter &&
                "string" !== typeof associatedVRouter &&
                associatedVRouter.length > 0 ) {
                associatedVRouter = associatedVRouter[0].vRouter;
                if(null !== associatedVRouter && typeof associatedVRouter !== "undefined") {
                    associatedVRouterUID = _this.getElementMap().nodes[associatedVRouter];
                }
            }
            if(hlNode.name == srcVM) {
                //Plot green
                $('div.font-element[font-element-model-id="' + model_id + '"]')
                    .find('i')
                    .css("color", "green");

                if(associatedVRouterUID !== "") {
                    var cell = _this.getGraph().getCell(associatedVRouterUID);
                    var vrouterPosition = cell.attributes.position;
                    var vmNode = jsonPath(conElements, "$[?(@.id=='" + model_id + "')]");
                    if(false !== vmNode && vmNode.length == 1) {
                        vmNode[0].old_position = _this.getGraph().getCell(model_id).attributes.position;
                    }
                    _this.getGraph().getCell(model_id).transition('position/x', vrouterPosition.x);
                    _this.getGraph().getCell(model_id).transition('position/y', vrouterPosition.y + 80);
                }
            } else if(hlNode.name == destVM) {
                //Plot red
                $('div.font-element[font-element-model-id="' + model_id + '"]')
                    .find('i')
                    .css("color", "red");

                if(associatedVRouterUID !== "") {
                    var cell = _this.getGraph().getCell(associatedVRouterUID);
                    var vrouterPosition = cell.attributes.position;
                    var vmNode = jsonPath(conElements, "$[?(@.id=='" + model_id + "')]");
                    if(false !== vmNode && vmNode.length == 1) {
                        vmNode[0].old_position = _this.getGraph().getCell(model_id).attributes.position;
                    }
                    _this.getGraph().getCell(model_id).transition('position/x', vrouterPosition.x);
                    _this.getGraph().getCell(model_id).transition('position/y', vrouterPosition.y + 80);
                }
            }
            _this.setConnectedElements(conElements);
        }
    }
};

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
    var elements = this.getConnectedElements();
    //this.initContextMenuConfig();
    this.getGraph().addCells(elements);
    this.getPaper().fitToContent();
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
    var whereClauseStr;
    if(nodeType == VROUTER) {
        whereClauseStr = '(vrouter = '+nodeName+')';
    } else if(nodeType == VIRTUALMACHINE) {
        var nodeIp = ifNull($("#underlay_topology").data('nodeIp'),[]);
        var vnList = ifNull($("#underlay_topology").data('vnList'),[]);
        whereClauseStr = '(';
        for(var i = 0; i < nodeIp.length; i++) {
            whereClauseStr += 'sourcevn = '+vnList[i]+' AND sourceip = '+nodeIp[i];
            if((i+1) < nodeIp.length)
                whereClauseStr += 'AND';
        }
        whereClauseStr += ')';
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
    var computeNodesDS = globalObj['dataSources']['computeNodeDS']['dataSource'].getItems(),computeNodeCombobox = [];
    var computeNodes = []
    $.each(computeNodesDS,function(idx,value){
        if(value['vRouterType'] == 'hypervisor')
            computeNodes.push(value);
    });
    if(nodeType == VROUTER && nodeName != null) {
        defaultValue = nodeName;
    } else {
        defaultValue = computeNodes[0]['name'];
        ip = computeNodes[0]['ip'];
    }
    for(var i = 0; i < computeNodes.length; i++) {
        if(computeNodes[i]['name'] == defaultValue)
            ip = computeNodes[i]['ip'];
        computeNodeCombobox.push({
            text:contrail.format('{0} ({1})',computeNodes[i]['name'],computeNodes[i]['ip']),
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
                                          name:"Other vRouter",
                                          minWidth:120,
                                          formatter: function(r,c,v,cd,dc){
                                              var name = $.grep(computeNodes,function(value,idx){
                                                              return (value['ip'] == dc['peer_vrouter']);
                                                         });
                                              return contrail.format('{0} ({1})',ifNull(name[0]['name'],'-'),dc['peer_vrouter']);
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
                                          minWidth:150,
                                          /*formatter: function (r,c,v,cd,dc) {
                                              var srcVN = dc['src_vn'].split(":");
                                              return contrail.format('{0} ({1})',ifNull(srcVN[2],'-'),ifNull(srcVN[1],'-'));
                                          }*/
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
                                          minWidth:150,
                                          /*formatter: function (r,c,v,cd,dc) {
                                              var srcVN = dc['src_vn'].split(":");
                                              return contrail.format('{0} ({1})',ifNull(srcVN[2],'-'),ifNull(srcVN[1],'-'));
                                          }*/
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
        $("#vrouterflows").parent().siblings('div.widget-header').find('.icon-spinner').show()
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
    var instances = globalObj['dataSources']['instDS']['dataSource'].getItems(),instComboboxData = [];
    var instMap = {};
    for(var i = 0; i < instances.length; i++) {
        var instObj = instances[i];
        var instAttributes = ifNull(instObj['more_attributes'],{});
        instComboboxData.push({
            text: instObj['vmName']+' ('+instObj['name']+')',
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
            postData['nodeIP'] = dataItem['vrouter_ip'] != null ? dataItem['vrouter_ip'] : computeNodeInfo['ip'];
            nwFqName = dataItem['sourcevn'] != null ? dataItem['sourcevn'] : dataItem['src_vn'];
            //postData['vrfName'] = (dataItem['destvn'] +":"+ dataItem['destvn'].split(':')[2]);
        } else if(dataItem['direction_ing'] == 0 || dataItem['direction'] == 'egress') {
            postData['nodeIP'] = dataItem['other_vrouter_ip'] != null ? dataItem['other_vrouter_ip'] : dataItem['peer_vrouter'];
            nwFqName = dataItem['destvn'] != null ? dataItem['destvn'] : dataItem['dst_vn'];
            //postData['vrfName'] = (dataItem['destvn'] +":"+ dataItem['destvn'].split(':')[2]);
        }
        var progressBar = $("#network_topology").find('.topology-visualization-loading');
        $(progressBar).show();
        $(progressBar).css('margin-bottom',$(progressBar).parent().height());
        $.ajax({
            url:'api/tenant/networking/virtual-network/summary?fqNameRegExp='+nwFqName,
        }).always(function(networkDetails){
            if(networkDetails['value']!= null && networkDetails['value'][0] != null &&  networkDetails['value'][0]['value'] != null) {
                var vrfList = ifNull(networkDetails['value'][0]['value']['UveVirtualNetworkConfig']['routing_instance_list'],[]);
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
        var dataItem = ifNull(checkedRows[0],{});
        /*
         * For egress flows the source vm ip may not spawned in the same vrouter,
         * so need to pick the peer_vrouter
         */
        var postData = {
               srcIP: dataItem['destip'],
               destIP: dataItem['sourceip'],
               srcPort: dataItem['dport'],
               destPort: dataItem['sport'],
               protocol: dataItem['protocol'],
        };
        if(dataItem['direction_ing'] == 0) {
            postData['nodeIP'] = dataItem['vrouter_ip'];
            postData['vrfName'] = (dataItem['sourcevn'] +":"+ dataItem['sourcevn'].split(':')[2]);
        } else if(dataItem['direction_ing'] == 1) {
            postData['nodeIP'] = dataItem['other_vrouter_ip'];
            postData['vrfName'] = (dataItem['destvn'] +":"+ dataItem['destvn'].split(':')[2]);
        }
        $.ajax({
            url:'/api/tenant/networking/trace-flow',
            type:'POST',
            data:{
                data: postData
            }
        }).success(function(response){
            _this.highlightPath(response, {data: postData});
        }).always(function(response){
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
            var intfData = ifNull(vmData['more_attributes']['interface_list'],[]);
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

underlayView.prototype.populateDetailsTab = function(data) {
    var type = data['type'],details,content = {};
    $("#detailsLink").show();
    $("#underlay_tabstrip").tabs({active:2});
    if(type != 'link')
        $("#detailsLink").find('a.ui-tabs-anchor').html("Details");
    if(type == PROUTER) {
        content = {
            type      : PROUTER,
            hostName : ifNull(data['host_name'],'-'),
            description: ifNull(data['description'],'-'),
            intfCnt   : data['intfCnt']
        };
        details = Handlebars.compile($("#device-summary-template").html())(content);
        $("#detailsTab").html(details);
        var intfDetails = [];
        for(var i = 0; i < ifNull(data['response']['more_attributes']['ifTable'],[]).length; i++ ) {
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
        var selector = $("#detailsTab").find('div.contrail-grid')[0];
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
    } else if (type == VROUTER) {
        content = data;
        details = Handlebars.compile($("#device-summary-template").html())(content);
        $("#detailsTab").html(details);
    } else if(type == VIRTUALMACHINE) {
        content = data;
        details = Handlebars.compile($("#device-summary-template").html())(content);
        $("#detailsTab").html(details);
    } else if (type == 'link') {
        var endpoints = ifNull(data['endpoints'],[]);
        var sourceType = data['sourceElement']['attributes']['nodeDetails']['node_type'];
        var targetType = data['targetElement']['attributes']['nodeDetails']['node_type'];
        var url = '',link = '';
        var type = 'GET';
        var ajaxData = {};
        if(sourceType == VIRTUALMACHINE || targetType == VIRTUALMACHINE)
            return;
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
                /*var flows = ifNull(response['flow-series'],[]);
                var inBytes = [];
                var outBytes = [];
                for(var i = 0; i < flows.length; i++) {
                    var flowObj = flows[i];
                    inBytes.push({
                        x:flowObj['time'],
                        y:flowObj['inBytes']
                    });
                    outBytes.push({
                        x:flowObj['time'],
                        y:flowObj['outBytes']
                    });
                }
                chartObj['data'][0] = {
                                key:'InBytes',
                                values:inBytes,
                };
                chartObj['data'][1] = {
                        key:'OutBytes',
                        values:outBytes,
                }
                initMemoryLineChart('#'+selector,chartObj['data'],{height:300});*/
            } else if (link == 'prouter') {
                details = Handlebars.compile($("#link-summary-template").html())({link:link,intfObjs:response});
                $("#detailsTab").html(details);
                for(var i = 0; i < response.length; i++) {
                    var rawFlowData = response[i];
                    var lclData = ifNull(rawFlowData[0],{});
                    var rmtData = ifNull(rawFlowData[1],{});
                    var intfFlowData = [],lclInBytesData = [],lclOutBytesData = [],rmtInBytesData = [],rmtOutBytesData = [];
                    var lclFlows = ifNull(lclData['flow-series']['value'],[]);
                    var rmtFlows = ifNull(rmtData['flow-series']['value'],[]),chrtTitle;
                    chrtTitle = contrail.format('Traffic statistics of link {0} ({1}) -- {2} ({3})',lclData['summary']['name'],
                            lclData['summary']['if_name'],rmtData['summary']['name'],rmtData['summary']['if_name']);
                    var inPacketsLocal = {key:contrail.format('{0} ({1})',lclData['summary']['name'],lclData['summary']['if_name']), values:[]}, 
                        inPacketsRemote = {key:contrail.format('{0} ({1})',rmtData['summary']['name'],rmtData['summary']['if_name']), values:[]};
                    for(var j = 0; j < lclFlows.length; j++) {
                        var lclFlowObj = lclFlows[j];
                        inPacketsLocal['values'].push({
                            x: Math.floor(lclFlowObj['T=']/1000),
                            y: ifNull(lclFlowObj['SUM(ifStats.ifInUcastPkts)'],0)
                        });
                    }
                    for(var j = 0; j < rmtFlows.length; j++) {
                        var rmtFlowObj = rmtFlows[j];
                        inPacketsRemote['values'].push({
                            x: Math.floor(rmtFlowObj['T=']/1000),
                            y: ifNull(rmtFlowObj['SUM(ifStats.ifInUcastPkts)'],0)
                        });
                    }
                    var chartData = [inPacketsLocal,inPacketsRemote];
                    var icontag = "<i id='prouter-ifstats-loading-0' class='icon-spinner icon-spin blue bigger-125' " +
                            "style='display: none;'></i>";
                    $("#prouter-lclstats-widget-"+i).find('.widget-header > h4').html(icontag+chrtTitle);
                    options = {
                            height:300,
                            yAxisLabel: 'Packets per 72 secs',
                            y2AxisLabel: 'Packets per 72 secs'
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
    expanded = !expanded;
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
                var graph = _this.getView().getGraph();
                graph.clear();
                $("#topology-connected-elements").find('div').remove();
                $("#network_topology").find('.topology-visualization-loading').hide();
                topologyCallback(forceResponse);
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
        globalObj.topologyResponse = response;
        _this.getView().resetTopology();
        _this.getModel().setNodes(response['nodes']);
        _this.getModel().setLinks(response['links']);
        _this.getModel().updateChassisType(response['nodes']);
        _this.getModel().categorizeNodes(response['nodes']);
        _this.getModel().formTree();
        _this.getView().renderTopology(response);
    }
    if(null !== cfg && typeof cfg !== "undefined")
        this.getModel().getData(cfg);
    else
        this.getModel().getData(tmpCfg);
}

underlayController.prototype.destroy = function() {
    //tbd
}

underlayView.prototype.launchVMPage = function(jsonObj) {
    if(null !== jsonObj && typeof jsonObj !== "undefined" &&
        jsonObj.hasOwnProperty('q') &&
        jsonObj['q'].hasOwnProperty('srcVN'))
        jsonObj['q']['srcVN'] = decodeURIComponent(jsonObj['q']['srcVN']);

    layoutHandler.setURLHashObj(jsonObj);
}
