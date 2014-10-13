/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 *
 * Underlay Overlay Visualisation Page
 */

var underlayRenderer = new underlayRenderer();
var PROUTER_DBL_CLICK =  'config_net_vn';


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
        this.view.destroy();
        this.model.destroy();
        this.controller.destroy();
    }
}

var underlayModel = function(data) {
    this.nodes             = [];
    this.links             = [];
    this.connectedElements = [];
    this.tors              = [];
    this.spines            = [];
    this.cores             = [];
    this.vrouters          = [];
    this.elementMap        = {
        nodes: {},
        links: {}
    };

    this.highlightedNodes  = [];
    this.highlightedLinks  = [];
    this.highlightedConnectedElements = [];
    this.highlightedElementMap = {
        nodes: {},
        links: {}
    };

    if(data) {
        this.setNodes(data.nodes);
        this.setLinks(data.links);
        this.categorizeNodes(data.nodes);
    } else {
        this.setNodes([]);
        this.setLinks([]);
    }
}

underlayModel.prototype.getNodes = function() {
    return this.nodes;
}

underlayModel.prototype.getLinks = function() {
    return this.links;
}

underlayModel.prototype.getConnectedElements = function() {
    return this.connectedElements;
}

underlayModel.prototype.getElementMap = function() {
    return this.elementMap;
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

underlayModel.prototype.getHighlightedNodes = function() {
    return this.highlightedNodes;
}

underlayModel.prototype.getHighlightedLinks = function() {
    return this.highlightedLinks;
}

underlayModel.prototype.getHighlightedConnectedElements = function() {
    return this.highlightedConnectedElements;
}

underlayModel.prototype.getHighlightedElementMap = function() {
    return this.highlightedElementMap;
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

underlayModel.prototype.setConnectedElements = function(cEls) {
    if(null !== cEls && typeof cEls !== "undefined" &&
        cEls.length > 0) {
        this.connectedElements = cEls;
    } else {
        this.connectedElements = [];
    }     
}

underlayModel.prototype.setElementMap = function(elMap) {
    if(null !== elMap && typeof elMap !== "undefined") {
        this.elementMap = elMap;
    } else {
        this.elementMap = [];
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

underlayModel.prototype.setHighlightedNodes = function(nodes) {
    if(null !== nodes && typeof nodes !== "undefined" &&
        nodes.length > 0) {
        this.highlightedNodes = nodes;
    } else {
        this.highlightedNodes = [];
    }
}

underlayModel.prototype.setHighlightedLinks = function(links) {
    if(null !== links && typeof links !== "undefined" &&
        links.length > 0) {
        this.highlightedLinks = links;
    } else {
        this.highlightedLinks = [];
    }
}

underlayModel.prototype.setHighlightedElementMap = function(hgElMap) {
    this.highlightedElementMap = hgElMap;
}

underlayModel.prototype.setHighlightedConnectedElements = function(hgConElements) {
    this.highlightedConnectedElements = hgConElements;
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
            }
        });
    }
}

underlayModel.prototype.categorizeNodes = function(nodes) {
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

    var vrouters = jsonPath(nodes, "$[?(@.chassis_type=='-')]");
    if(false !== vrouters)
        this.setVrouters(vrouters);
    else 
        this.setVrouters([]);
}

underlayModel.prototype.appendNodes = function(nodes) {
    for(var i=0; i<nodes.length; i++) {
        this.nodes.push(nodes[i]);
    };
}

underlayModel.prototype.appendLinks = function(links) {
    for(var i=0; i<links.length; i++) {
        this.links.push(links[i]);
    };
}

underlayModel.prototype.reset = function() {
    this.nodes             = [];
    this.links             = [];
    this.connectedElements = [];
    this.tors              = [];
    this.spines            = [];
    this.cores             = [];
    this.vrouters          = []
    this.elementMap        = {
        nodes: {},
        links: {}
    };
}

underlayModel.prototype.destroy = function() {
    this.reset();
}




var underlayView = function (model) {
    this.model = model || new underlayModel();
    this.graph = new joint.dia.Graph;
    this.paper  = new joint.dia.Paper({
        el: $("#paper"),
        model: this.graph,
        linkView: joint.shapes.contrail.LinkView
    });
    this.initZoomControls();
    this.contextMenuConfig = {};
    var _this = this;
    $("#underlay_tabstrip").contrailTabs({
        activate:function (e, ui) {
            var selTab = $(ui.newTab.context).text();
            if (selTab == 'Search Flow') {
                _this.renderFlowRecords();
            } else if (selTab == 'Trace Flow') {
                _this.renderTracePath();
            } else if (selTab == 'Device Details') {
                var tabContent = {
                    host_name:'-',
                    description:'-',
                    intfCnt:'-'
                };
                _this.populateDetailsTab(tabContent,'node');
            }
        }
    });
    this.renderFlowRecords();
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

underlayView.prototype.createElements = function() {
    this.createNodes();
    this.createLinks();
}

underlayView.prototype.createNodes = function() {
        var newElement, nodeName;
        var tors      = this.getModel().getTors();
        var spines    = this.getModel().getSpines();
        var cores     = this.getModel().getCores();
        var vrouters  = this.getModel().getVrouters();
        var elements  = [];
        var elementMap = {
            nodes: {},
            links: {}
        };

        for (var i = 0; i < tors.length; i++) {
            newElement = this.createNode(tors[i], i, tors.length);
            nodeName = tors[i]['name'];
            elements.push(newElement);
            elementMap.nodes[nodeName] = newElement.id;
        }
        for (var i = 0; i < spines.length; i++) {
            newElement = this.createNode(spines[i], i, spines.length);
            nodeName = spines[i]['name'];
            elements.push(newElement);
            elementMap.nodes[nodeName] = newElement.id;
        }
        for (var i = 0; i < cores.length; i++) {
            newElement = this.createNode(cores[i], i, cores.length);
            nodeName = cores[i]['name'];
            elements.push(newElement);
            elementMap.nodes[nodeName] = newElement.id;
        }
        for (var i = 0; i < vrouters.length; i++) {
            newElement = this.createNode(vrouters[i], i, vrouters.length);
            nodeName = vrouters[i]['name'];
            elements.push(newElement);
            elementMap.nodes[nodeName] = newElement.id;
        }

        this.getModel().setConnectedElements(elements);
        this.getModel().setElementMap(elementMap);
}

underlayView.prototype.createNode = function(node, i, cnt) {
    var nodeName = node['name'],
        type = node.node_type,
        chassis_type = node.chassis_type,
        width = 40,
        height = 40,
        imageLink, element, options, imageName;
        var yPos = 0, xPos = 0;
        switch(chassis_type) {
            case "tor":
                xPos = (i+1)*175;
                yPos = 225;
                break;
            case "spine":
                xPos = (i+1)*175;
                yPos = 125;
                break;
            case "coreswitch": 
                //tbd - make it 'core' here and in backend
                xPos = (i+1)*250;
                yPos = 25;
                break;
            case "-":
                chassis_type = "vrouter"
                xPos = (i+1)*100;
                yPos = 325;
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
    var elementMap = this.getModel().getElementMap();
    var elements = this.getModel().getConnectedElements();

    for (var i = 0; i < links.length; i++) {
        var link = this.createLink(links[i], elements, elementMap, 0);
        elements.push(link);
        elementMap.links[link.attributes.linkDetails.endpoints[0] + '<->' + link.attributes.linkDetails.endpoints[1]] = link.id;
        elementMap.links[link.attributes.linkDetails.endpoints[1] + '<->' + link.attributes.linkDetails.endpoints[0]] = link.id;
    }

    this.getModel().setConnectedElements(elements);
    this.getModel().setElementMap(elementMap);
}

underlayView.prototype.createLink = function(link, elements, elementMap, layer) {
        var options;
        var link_type ="link";
        var linkElement;
        var endPoint0 = jsonPath(elements, "$.*[?(@.id=='" + elementMap.nodes[[link.endpoints[0]]] + "')]")[0].nodeDetails.node_type;
        var endPoint1 = jsonPath(elements, "$.*[?(@.id=='" + elementMap.nodes[[link.endpoints[1]]] + "')]")[0].nodeDetails.node_type;

        if(endPoint0 === "physical-router" && endPoint1 === "physical-router") {
            link.link_type = 'physical';
        } else if (endPoint0 === "virtual-router" || endPoint1 === "virtual-router") {
            link.link_type = 'logical';
        }
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
    $("#topology_paper").panzoom({
        $zoomIn: $("#zoomcontrols").find(".zoom-in"),
        $zoomOut: $("#zoomcontrols").find(".zoom-out"),
        $reset: $("#zoomcontrols").find(".zoom-reset")
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

underlayView.prototype.initGraphEvents = function() {
    var paper = this.getPaper();
    var graph = this.getGraph();
    var selectorId = paper.el.id;
    var _this      = this;

    paper.on('blank:pointerclick', function (evt, x, y) {
        setTimeout(function(){
            var g = _this.getGraph();
            var hgConElements = _this.getModel().getHighlightedConnectedElements();
            for(var i=0; i<hgConElements.length; i++) {
                var el = $("g.link[model-id='" + hgConElements[i].id + "']");
                el.empty();
                el.remove();
                el = $();
            }
            if(hgConElements.length > 0) {
                _this.getModel().setHighlightedConnectedElements([]);
                _this.getModel().setHighlightedElementMap({nodes:[], links:[]});
            }
            $('div.font-element').removeClass('elementHighlighted').removeClass('dimHighlighted');
            $('g.element').removeClassSVG('elementHighlighted').removeClassSVG('dimHighlighted');
            $('g.link').removeClassSVG('elementHighlighted').removeClassSVG('dimHighlighted');

            _this.hideVRouters();
        },1000);
    });

    paper.on("cell:pointerdblclick", function (cellView, evt, x, y) {
        setTimeout(function() {
        var dblClickedElement = cellView.model,
            elementType       = dblClickedElement['attributes']['type'];
        
        switch(elementType) {
            case 'contrail.PhysicalRouter':
                //loadFeature({p:PROUTER_DBL_CLICK,q:{fqName:dblClickedElement['attributes']['nodeDetails']['name']}});
                var chassis_type    = dblClickedElement['attributes']['nodeDetails']['chassis_type'];
                var clickedNodeName = dblClickedElement['attributes']['nodeDetails']['name'];
                var elMap           = _this.getModel().getElementMap();
                var vrouters = [];
                var linkToVrouters = [];
                if(chassis_type === "tor") {
                    var links = _this.getModel().getLinks();
                    var nodes = _this.getModel().getNodes();
                    var srcPoint = jsonPath(links, "$[?(@.endpoints[0]=='" + clickedNodeName + "')]");
                    var dstPoint = jsonPath(links, "$[?(@.endpoints[1]=='" + clickedNodeName + "')]");
                    if(false !== srcPoint && srcPoint.length > 0) {
                        for(var i=0; i<srcPoint.length; i++) {
                            var sp = srcPoint[i].endpoints;
                            if(elMap.links.hasOwnProperty(sp[0] + "<->" + clickedNodeName)) {
                                var otherEndNode = 
                                jsonPath(nodes, "$[?(@.name=='" + sp[0] + "')]");
                                if(false !== otherEndNode && otherEndNode.length == 1 && 
                                    otherEndNode[0].node_type == "virtual-router") {
                                    vrouters.push(elMap.nodes[sp[0]]);
                                    linkToVrouters.push(elMap.links[sp[0] + "<->" + clickedNodeName]);
                                }
                            } else if(elMap.links.hasOwnProperty(clickedNodeName + "<->" + sp[0])) {
                                var otherEndNode = 
                                jsonPath(nodes, "$[?(@.name=='" + sp[0] + "')]");
                                if(false !== otherEndNode && otherEndNode.length == 1 && 
                                    otherEndNode[0].node_type == "virtual-router") {
                                    vrouters.push(elMap.nodes[sp[0]]);
                                    linkToVrouters.push(elMap.links[clickedNodeName + "<->" + sp[0]]);
                                }
                            } else if(elMap.links.hasOwnProperty(sp[1] + "<->" + clickedNodeName)) {
                                var otherEndNode = 
                                jsonPath(nodes, "$[?(@.name=='" + sp[1] + "')]");
                                if(false !== otherEndNode && otherEndNode.length == 1 && 
                                    otherEndNode[0].node_type == "virtual-router") {
                                    vrouters.push(elMap.nodes[sp[1]]);
                                    linkToVrouters.push(elMap.links[sp[1] + "<->" + clickedNodeName]);
                                }
                            } else if(elMap.links.hasOwnProperty(clickedNodeName + "<->" + sp[1])) {
                                var otherEndNode = 
                                jsonPath(nodes, "$[?(@.name=='" + sp[1] + "')]");
                                if(false !== otherEndNode && otherEndNode.length == 1 && 
                                    otherEndNode[0].node_type == "virtual-router") {
                                    vrouters.push(elMap.nodes[sp[1]]);
                                    linkToVrouters.push(elMap.links[clickedNodeName + "<->" + sp[1]]);
                                }
                            }
                        }
                    }
                    if(false !== dstPoint && dstPoint.length > 0) {
                        for(var i=0; i<dstPoint.length; i++) {
                            var sp = dstPoint[i].endpoints;
                            if(elMap.links.hasOwnProperty(sp[0] + "<->" + clickedNodeName)) {
                                var otherEndNode = 
                                jsonPath(nodes, "$[?(@.name=='" + sp[0] + "')]");
                                if(false !== otherEndNode && otherEndNode.length == 1 && 
                                    otherEndNode[0].node_type == "virtual-router") {
                                    vrouters.push(elMap.nodes[sp[0]]);
                                    linkToVrouters.push(elMap.links[sp[0] + "<->" + clickedNodeName]);
                                }
                            } else if(elMap.links.hasOwnProperty(clickedNodeName + "<->" + sp[0])) {
                                var otherEndNode = 
                                jsonPath(nodes, "$[?(@.name=='" + sp[0] + "')]");
                                if(false !== otherEndNode && otherEndNode.length == 1 && 
                                    otherEndNode[0].node_type == "virtual-router") {
                                    vrouters.push(elMap.nodes[sp[0]]);
                                    linkToVrouters.push(elMap.links[clickedNodeName + "<->" + sp[0]]);
                                }
                            } else if(elMap.links.hasOwnProperty(sp[1] + "<->" + clickedNodeName)) {
                                var otherEndNode = 
                                jsonPath(nodes, "$[?(@.name=='" + sp[1] + "')]");
                                if(false !== otherEndNode && otherEndNode.length == 1 && 
                                    otherEndNode[0].node_type == "virtual-router") {
                                    vrouters.push(elMap.nodes[sp[1]]);
                                    linkToVrouters.push(elMap.links[sp[1] + "<->" + clickedNodeName]);
                                }
                            } else if(elMap.links.hasOwnProperty(clickedNodeName + "<->" + sp[1])) {
                                var otherEndNode = 
                                jsonPath(nodes, "$[?(@.name=='" + sp[1] + "')]");
                                if(false !== otherEndNode && otherEndNode.length == 1 && 
                                    otherEndNode[0].node_type == "virtual-router") {
                                    vrouters.push(elMap.nodes[sp[1]]);
                                    linkToVrouters.push(elMap.links[clickedNodeName + "<->" + sp[1]]);
                                }
                            }
                        }
                    }

                    if(vrouters.length > 0) {
                        if($('g.element[model-id="' + vrouters[0] + '"]').hasClassSVG('hidden')) {
                            $('div.font-element').removeClass('elementHighlighted').addClass('dimHighlighted');
                            $('g.element').removeClassSVG('elementHighlighted').addClassSVG('dimHighlighted');
                            $('g.link').removeClassSVG('elementHighlighted').addClassSVG('dimHighlighted');
                            _this.hideVRouters();
                        } else {
                            $('div.font-element').removeClass('elementHighlighted').removeClass('dimHighlighted');
                            $('g.element').removeClassSVG('elementHighlighted').removeClassSVG('dimHighlighted');
                            $('g.link').removeClassSVG('elementHighlighted').removeClassSVG('dimHighlighted');
                            _this.hideVRouters();
                            return;
                        }
                    }

                    for(var i=0; i<vrouters.length; i++) {
                        var vrouter_model_id = vrouters[i];
                        if($('g.element[model-id="' + vrouter_model_id + '"]').hasClassSVG('hidden')){                                
                                $('div[font-element-model-id="'+ dblClickedElement.id  + '"]')
                                    .removeClass('dimHighlighted')
                                    .addClass('elementHighlighted');
                                $('g.element[model-id="' + dblClickedElement.id + '"]')
                                    .removeClassSVG('dimHighlighted')
                                    .addClassSVG('elementHighlighted');
                            $('g.element[model-id="' + vrouter_model_id + '"]')
                                .removeClassSVG('hidden')
                                .removeClassSVG('dimHighlighted')
                                .addClassSVG('elementHighlighted');
                        } else {
                            $('g.element[model-id="' + vrouter_model_id + '"]')
                                .addClassSVG('hidden')
                                .removeClassSVG('dimHighlighted')
                                .removeClassSVG('elementHighlighted');
                        }

                        if($('div.font-element[font-element-model-id="' + vrouter_model_id + '"]').hasClass('hidden')) {
                            $('div.font-element[font-element-model-id="' + vrouter_model_id + '"]')
                                .removeClass('hidden')
                                .removeClass('dimHighlighted')
                                .addClass('elementHighlighted');
                        } else{
                            $('div.font-element[font-element-model-id="' + vrouter_model_id + '"]')
                                .addClass('hidden')
                                .removeClass('dimHighlighted')
                                .removeClass('elementHighlighted');
                        }
                    }

                    for(var i=0; i<linkToVrouters.length; i++) {
                        var link_model_id = linkToVrouters[i];
                        if($('g.link[model-id="' + link_model_id + '"]').hasClassSVG('hidden')) {
                            $('g.link[model-id="' + link_model_id + '"]')
                                .removeClassSVG('hidden')
                                .removeClassSVG('dimHighlighted')
                                .addClassSVG('elementHighlighted');
                        }
                        else {
                            $('g.link[model-id="' + link_model_id + '"]')
                                .addClassSVG('hidden')
                                .removeClassSVG('dimHighlighted')
                                .removeClassSVG('elementHighlighted');
                        }
                        graph.getCell(link_model_id).attr({
                            '.connection': { stroke: '#498AB9'},
                            '.marker-source': { stroke: '#498AB9', fill: '#498AB9'},
                            '.marker-target': { stroke: '#498AB9', fill: '#498AB9'}
                        });
                    }
                }
                $('g.PhysicalRouter').popover('hide');
                break;

            case 'contrail.VirtualRouter': 
                $.ajax({
                    dataType: "json",
                    url: url,
                    type: cfg.type,
                    data: cfg.data,
                    success: function (response) {
                        
                    }
                });
                break;
            case 'link':
                var modelId = dblClickedElement.id;                
                var targetElement = graph.getCell(dblClickedElement['attributes']['target']['id']),
                    sourceElement = graph.getCell(dblClickedElement['attributes']['source']['id']);                    
                break;
        }
        },1000);
    });

    paper.on('cell:pointerclick', function (cellView, evt, x, y) {
        setTimeout(function(){
        var clickedElement = cellView.model,
            elementType    = clickedElement['attributes']['type'];                

        switch(elementType) {
            case 'contrail.PhysicalRouter':
                var content = {
                    host_name : ifNull(clickedElement['attributes']['nodeDetails']['name'],'-'),
                    description: ifNull(clickedElement['attributes']['nodeDetails']['more_attr']['lldpLocSysDesc'],'-'),
                    intfCnt   : ifNull(clickedElement['attributes']['nodeDetails']['more_attr']['ifTable'],[]).length,
                };
                _this.populateDetailsTab(content,'node');
                break;
            case 'link':
                var targetElement = graph.getCell(clickedElement['attributes']['target']['id']),
                    sourceElement = graph.getCell(clickedElement['attributes']['source']['id']);

                alert(elementType + " between " + sourceElement['attributes']['nodeDetails']['name'] + 
                    " and " + targetElement['attributes']['nodeDetails']['name'] + " clicked.");
                break;                    
        }
        },1000);
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

underlayView.prototype.renderTopology = function(response) {
    this.createElements();
    this.renderUnderlayViz();
    this.hideVRouters();

    var data = this.getPostDataFromHashParams();
    var _this = this;
    if(JSON.stringify(data) !== '{"data":{}}') {
        var cfg = {
            url      : "api/tenant/networking/underlay-path",
            type     : "POST",
            data     : data,
            view     : this,
            callback : function(response) {
                this.view.getModel().setHighlightedNodes(response['nodes']);
                this.view.getModel().setHighlightedLinks(response['links']);
                this.view.highlightPath();
            }
        };
        this.getModel().getData(cfg);
    }
}

underlayView.prototype.highlightPath = function() {
    var _this = null;
    if(null !== this && typeof this !== "undefined" && this.hasOwnProperty('view') &&
        this.view instanceof underlayView) {
        _this = this.view;
    } else {
        _this = this;
    }
    setTimeout(function() {
    highlightedElements = {
        nodes: [],
        links: []
    };
    var elementMap = _this.getModel().getElementMap();
    var hgElementMap = _this.getModel().getHighlightedElementMap();
    var hgConElements = _this.getModel().getHighlightedConnectedElements();
    var conElements = _this.getModel().getConnectedElements();
    var graph      = _this.getGraph();
    var nodes      = _this.getModel().getHighlightedNodes();
    var links      = _this.getModel().getHighlightedLinks();
    
    for(var i=0; i<nodes.length; i++) {
        highlightedElements.nodes.push(nodes[i]);
    }
    
    for (var i = 0; i < links.length; i++) {
        highlightedElements.links.push(links[i].endpoints[0] + "<->" + links[i].endpoints[1]);
    }

    highlightedElements.nodes = $.unique(highlightedElements.nodes);
    for(var i=0; i<highlightedElements.nodes.length; i++) {
        var node = elementMap.nodes[highlightedElements.nodes[i].name];
        if($('g[model-id="' + node + '"]').hasClassSVG('hidden'))
            $('g[model-id="' + node + '"]').removeClassSVG('hidden');

        if($('div[font-element-model-id="' + node + '"]').hasClass('hidden'))
            $('div[font-element-model-id="' + node + '"]').removeClass('hidden');
    }
    highlightedElements.links = $.unique(highlightedElements.links);
    var linkEl = [];
    for(var i=0; i<highlightedElements.links.length; i++) {
        var link = {};
        link.endpoints = highlightedElements.links[i].split("<->");
        linkEl[linkEl.length] = _this.createLink(link, conElements, elementMap, 1);
        $('g[model-id="' + linkEl[linkEl.length-1].id + '"]').removeClassSVG('dimHighlighted');
        $('div[font-element-model-id="' + linkEl[linkEl.length-1].id + '"]').removeClass('dimHighlighted');
        linkEl[linkEl.length-1].attr({
            '.connection': { stroke: '#498AB9'},
            '.marker-source': { stroke: '#498AB9', fill: '#498AB9'},
            '.marker-target': { stroke: '#498AB9', fill: '#498AB9'}
        });
        hgConElements.push(linkEl[linkEl.length-1]);
        hgElementMap.links[linkEl[linkEl.length-1].attributes.linkDetails.endpoints[0] + 
            '<->' + linkEl[linkEl.length-1].attributes.linkDetails.endpoints[1]] = 
            linkEl[linkEl.length-1].id;
        hgElementMap.links[linkEl[linkEl.length-1].attributes.linkDetails.endpoints[1] + 
            '<->' + linkEl[linkEl.length-1].attributes.linkDetails.endpoints[0]] = 
            linkEl[linkEl.length-1].id;
    }
    if(linkEl.length > 0) {
        _this.getGraph().addCells(hgConElements);
        var allAttributes = jsonPath(conElements, "$.*.attributes");
        var newX = 0, newY = 0;
        for(var i=0; i<hgConElements.length; i++) {
            var layer0Link = null;
            for(var j=0; j<allAttributes.length; j++) {
                var attr = allAttributes[j];
                if(attr.hasOwnProperty('linkDetails') &&
                    attr['linkDetails'].hasOwnProperty('endpoints')) {
                    if((attr['linkDetails']['endpoints'][0] === hgConElements[i].attributes.linkDetails.endpoints[0] &&
                        attr['linkDetails']['endpoints'][1] === hgConElements[i].attributes.linkDetails.endpoints[1]) ||
                        (attr['linkDetails']['endpoints'][0] === hgConElements[i].attributes.linkDetails.endpoints[1] &&
                        attr['linkDetails']['endpoints'][1] === hgConElements[i].attributes.linkDetails.endpoints[0])) {
                        layer0Link = attr;
                        break;
                    }
                }
            }
            newX = $("g.link[model-id='" + layer0Link.id + "']").position().left - 5;
            newy = $("g.link[model-id='" + layer0Link.id + "']").position().top;
            $("g.link[model-id='" + hgConElements[i].id + "']").find('path').attr("transform", "translate(" + 8 + "," + 0 + ")")
        }

    }
    },1000);
};

underlayView.prototype.hideVRouters = function() {
    var elements = this.getModel().getConnectedElements();
    $.each(elements, function(key, value){
        if(value.attributes && value.attributes.linkDetails && value.attributes.linkDetails.link_type &&
            value.attributes.linkDetails.link_type == 'logical') {
            $('g.link[model-id="' + value.id + '"]')
                .removeClassSVG('elementHighlighted')
                .removeClassSVG('dimHighlighted')
                .addClassSVG('hidden');
        }
    });
    $.each(elements, function(key, value) {
        if(value.attributes && value.attributes.nodeDetails && value.attributes.nodeDetails.chassis_type &&
            value.attributes.nodeDetails.chassis_type == '-') {
            $('g.element[model-id="' + value.id + '"]')
                .removeClassSVG('elementHighlighted')
                .removeClassSVG('dimHighlighted')
                .addClassSVG('hidden');
            $('div.font-element[font-element-model-id="' + value.id + '"]')
                .removeClassSVG('elementHighlighted')
                .removeClassSVG('dimHighlighted')
                .addClassSVG('hidden');
        } else {
            $('g.element[model-id="' + value.id + '"]')
                .addClassSVG('elementHighlighted')
                .removeClassSVG('hidden');
            $('div.font-element[font-element-model-id="' + value.id + '"]')
                .removeClass('hidden');
        }
    });
}

underlayView.prototype.renderUnderlayViz = function() {
    var elements = this.getModel().getConnectedElements();
    this.initContextMenuConfig();
    this.graph.addCells(elements);
    this.initGraphEvents();

}

underlayView.prototype.renderFlowRecords = function() {
    $("#flows-tab").html($("#qe-template").html());
    setFRValidValues();
    initFRQueryView('fr','underlay');
    ko.applyBindings(queries.fr.queryViewModel, document.getElementById('fr-query'));
    openWhereWithUnderlay('fr');
    initWidgetBoxes();
}

underlayView.prototype.renderTracePath = function(options) {
    var obj = [
       {
           label:'VRouter',
           key:'vRouter'
       },
       {
           label:'Protocol',
           key:'protocol'
       },
       {
           label:'Source IP',
           key:'src_ip'
       },
       {
           label:'Source Port',
           key:'src_port'
       },
       {
           label:'Destination IP',
           key:'dst_ip'
       },
       {
           label:'Destination Port',
           key:'dst_port'
       },
       
    ];
    var response = {
        vRouter:[
                     {
                         text:'VRouter1',
                         value:'VRouter1'
                     },
                     {
                         text:'VRouter2',
                         value:'VRouter2'
                     },
                     {
                         text:'VRouter3',
                         value:'VRouter3'
                     }
                ],
        protocol:[
                     {
                         text:'TCP',
                         value:'tcp'
                     },
                     {
                         text:'UDP',
                         value:'udp'
                     },
                     {
                         text:'ICMP',
                         value:'icmp'
                     }
                ],
        src_ip:[
                     {
                         text:'VN1(10.10.10.10)',
                         value:'vn1'
                     },
                     {
                         text:'VN2(10.10.10.11)',
                         value:'vn2'
                     },
                     {
                         text:'VN3(10.10.10.12)',
                         value:'vn3'
                     }
                ],
        src_port:[
                     {
                         text:100,
                         value:100
                     },
                     {
                         text:200,
                         value:200
                     },
                     {
                         text:300,
                         value:300
                     }
            ],
        dst_ip:[
                     {
                         text:'10.10.10.10',
                         value:'10.10.10.10'
                     },
                     {
                         text:'10.10.10.11',
                         value:'10.10.10.11'
                     },
                     {
                         text:'10.10.10.12',
                         value:'10.10.10.12'
                     }
            ],
        dst_port:[
                     {
                         text:1000,
                         value:1000
                     },
                     {
                         text:1100,
                         value:1100
                     },
                     {
                         text:1200,
                         value:1200
                     }
            ]
                        
    };
    var _this = this;

    var tracePathTemplate = Handlebars.compile($("#tracePath-template").html())(obj);
    $("#traceFlow").html(tracePathTemplate);
    $("#tracepath-btn").bind('click', function(ctx) {
        _this.runTracePath(ctx, obj, response);
    });
    for(var i = 0; i < obj.length; i++) {
        $("#"+obj[i]['key']).contrailCombobox({
            dataTextField:"text",
            dataValueField:"value",
        });
        $("#"+obj[i]['key']).data('contrailCombobox').setData(response[obj[i]['key']]);
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
                this.view.getModel().setHighlightedNodes(response['nodes']);
                this.view.getModel().setHighlightedLinks(response['links']);
                this.view.highlightPath();
            }
        };
        this.getModel().getData(ajaxCfg);
    }
}

underlayView.prototype.getPostDataFromHashParams = function() {
    var hashParams = layoutHandler.getURLHashObj();
    var data = {"data" : {}};
    if(null !== hashParams && null !== hashParams.q && typeof hashParams.q !== "undefined") {
        data.data["minsSince"] = 300;
        if(hashParams.q.hasOwnProperty('srcIP') && "" !== hashParams.q['srcIP']) {
            data.data["srcIP"] = hashParams.q['srcIP'];
        } 
        if(hashParams.q.hasOwnProperty('sport') && "" !== hashParams.q['sport']) {
            data.data["sport"] = hashParams.q['sport'];
        }
        if(hashParams.q.hasOwnProperty('destIP') && "" !== hashParams.q['destIP']) {
            data.data["destIP"] = hashParams.q['destIP'];
        }
        if(hashParams.q.hasOwnProperty('dport') && "" !== hashParams.q['dport']) {
            data.data["dport"] = hashParams.q['dport'];
        }
        if(hashParams.q.hasOwnProperty('protocol') && "" !== hashParams.q['protocol']) {
            data.data["protocol"] = hashParams.q['protocol'];
        }
        if(hashParams.q.hasOwnProperty('srcVN') && "" !== hashParams.q['srcVN']) {
            data.data["srcVN"] = hashParams.q['srcVN'];
        }
        if(hashParams.q.hasOwnProperty('destVN') && "" !== hashParams.q['destVN']) {
            data.data["destVN"] = hashParams.q['destVN'];
        }
     }
     return data;
}

underlayView.prototype.populateDetailsTab = function(data,type) {
    if(type == 'node') {
        var content = {
            host_name : ifNull(data['host_name'],'-'),
            description: ifNull(data['description'],'-'),
            intfCnt   : ifNull(data['intfCnt'],0)
        };
        var details = Handlebars.compile($("#device-summary-template").html())(content);
    } else if (type == 'link') {
        var endpoints = ifNull(data['endpoints'],[]);
        $.ajax({
            url:'/api/tenant/networking/underlay-stats',
            type:'POST',
            data:{
                "data": {
                    "endpoints": endpoints
                  }
                }
        }).success(function(response){
            
        }).always(function(response){
            
        });
    }
    $("#underlay_tabstrip").tabs({active:2});
    $("#device-summary").html(details);
}

underlayView.prototype.destroy = function() {
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
    var _this  = this;
    var tmpCfg = {
        url      : "/api/tenant/networking/underlay-topology",
        type     : "GET",
        data     : data,
        callback : function (response) {
            _this.getModel().setNodes(response['nodes']);
            _this.getModel().setLinks(response['links']);
            _this.getModel().categorizeNodes(response['nodes']);
            _this.getView().renderTopology(response);
        }
    };
    if(null !== cfg && typeof cfg !== "undefined")
        this.getModel().getData(cfg);
    else
        this.getModel().getData(tmpCfg);
}

underlayController.prototype.destroy = function() {
    //tbd
}