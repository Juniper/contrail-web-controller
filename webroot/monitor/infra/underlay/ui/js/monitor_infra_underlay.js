/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 *
 * Underlay Overlay Visualisation Page
 */

var underlayRenderer = new underlayRenderer();
var PROUTER_DBL_CLICK =  'config_net_vn';
var PROUTER = 'physical-router';
var VROUTER = 'virtual-router';

var LEVEL_1_DIMENSION = {width: 0, height:0};
var LEVEL_2_DIMENSTION = {width: 0, height:0};
var ZOOMED_OUT = 0;

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
        //Populating the compute node datasource
        var computeNodeDS = new SingleDataSource('computeNodeDS');
        computeNodeDS.getDataSourceObj();
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
    this.connectedElements = [];
    this.tors              = [];
    this.spines            = [];
    this.cores             = [];
    this.vrouters          = [];
    this.elementMap        = {
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
    LEVEL_1_DIMENSION.width = $("#topology_paper").innerWidth();
    LEVEL_1_DIMENSION.height = $("#topology_paper").innerHeight();

    this.model = model || new underlayModel();
    this.graph = new joint.dia.Graph;
    this.paper  = new joint.dia.Paper({
        el: $("#paper"),
        model: this.graph,
        height: LEVEL_1_DIMENSION.height,
        width:  LEVEL_1_DIMENSION.width,
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
                xPos = (i+1)*275;
                yPos = 220;
                break;
            case "spine":
                xPos = (i+1)*275;
                yPos = 120;
                break;
            case "coreswitch":
                //tbd - make it 'core' here and in backend
                xPos = (i+1)*425;
                yPos = 20;
                break;
            case "-":
                chassis_type = "vrouter"
                xPos = (i+1)*150;
                yPos = 320;
                break;
            case "virtual-network":
                xPos = (i+1)*150;
                yPos = 420;
                break;
            case "virtual-machine":
                xPos = (i+1)*150;
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
        $reset: $("#zoomcontrols").find(".zoom-reset"),
        disablePan: true
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
                var viewElement = graph.getCell(element.attr('model-id'));
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
                return "VM content";
            }
        },
        VirtualRouter: {
            title: function(element, graph) {
                return 'Virtual Router';
            },
            content: function(element, graph) {
                return "VR content";
            }
        },
        link: {
            title: function(element, graph) {
                return "Link";
            },
            content: function(element, graph) {
                var viewElement = graph.getCell(element.attr('model-id'));
                var tooltipContent = contrail.getTemplate4Id('two-column-content-template');
                var local_interfaces = [];
                var remote_interfaces = [];
                if(viewElement.attributes && viewElement.attributes.hasOwnProperty('linkDetails') &&
                    viewElement.attributes.linkDetails.hasOwnProperty('more_attributes') &&
                    viewElement.attributes.linkDetails.more_attributes && 
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

underlayView.prototype.clearHighlightedConnectedElements = function() {
    var g = this.getGraph();
    $('div.font-element').removeClass('elementHighlighted').removeClass('dimHighlighted');
    $('g.element').removeClassSVG('elementHighlighted').removeClassSVG('dimHighlighted');
    $('g.link').removeClassSVG('elementHighlighted').removeClassSVG('dimHighlighted');
    $("g.link").find('path.connection')
        .css("stroke", "#637939");
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
        evt.stopImmediatePropagation();
        _this.resetTopology();
    });

    paper.on("cell:pointerdblclick", function (cellView, evt, x, y) {
        evt.stopImmediatePropagation();
        var dblClickedElement = cellView.model,
            elementType       = dblClickedElement['attributes']['type'];

        switch(elementType) {
            case 'contrail.PhysicalRouter':
                var chassis_type    = dblClickedElement['attributes']['nodeDetails']['chassis_type'];
                if(chassis_type === "tor") {
                    _this.resetTopology();
                    _this.showVRouter(dblClickedElement);
                }
                $('g.PhysicalRouter').popover('hide');
                break;

            case 'contrail.VirtualRouter':
                if(LEVEL_2_DIMENSTION.height == 0) {
                    LEVEL_2_DIMENSTION.height = LEVEL_1_DIMENSION.height + 200;
                    LEVEL_2_DIMENSTION.width = LEVEL_1_DIMENSION.width;
                }

                var model_id          = $(dblClickedElement).attr('id');
                //Faint all
                $('div.font-element')
                    .removeClass('elementHighlighted')
                    .addClass('dimHighlighted');
                +
                $('g.element')
                    .removeClassSVG('elementHighlighted')
                    .addClassSVG('dimHighlighted');
                $('g.link')
                    .removeClassSVG('elementHighlighted')
                    .addClassSVG('dimHighlighted');

                //Highlight selected vrouter
                $('div.font-element[font-element-model-id="' + model_id + '"]')
                    .addClass('elementHighlighted')
                    .removeClass('dimHighlighted')
                    .css('stroke', "#498AB9")
                    .css('fill', "#498AB9");

                $('g.element[model-id="' + model_id + '"]')
                    .addClassSVG('elementHighlighted')
                    .removeClassSVG('dimHighlighted')
                    .css('stroke', "#498AB9")
                    .css('fill', "#498AB9");
                _this.hideVMs();

                $.ajax({
                    dataType: "json",
                    url: "/api/tenant/get-data",
                    type: "POST",
                    data: {
                        "data":
                            [
                                {
                                    "kfilt" : dblClickedElement['attributes']['nodeDetails']['name'],
                                    "cfilt" : "VrouterAgent:virtual_machine_list",
                                    "type"  : "vrouter"
                                }
                            ]
                    },
                    success: function (response) {
                        if(null !== response && typeof response !== undefined && response.length > 0 &&
                            response[0].hasOwnProperty('value') && response[0].value.length > 0) {
                            var vms        = response[0].value[0].value['VrouterAgent'].virtual_machine_list;
                            if(vms.length <= 0) {
                                showGridMessage('Error', 'No Virtual Machines found for ' + dblClickedElement['attributes']['nodeDetails']['name']);
                                return;
                            }
                            _this.getPaper().setDimensions(LEVEL_2_DIMENSTION.width,LEVEL_2_DIMENSTION.height);
                            $('.viewport')
                                .height(LEVEL_2_DIMENSTION.width)
                                .width(LEVEL_2_DIMENSTION.height);

                            if(ZOOMED_OUT == 0) {
                                ZOOMED_OUT = 0.8;
                                $("#topology_paper").panzoom("zoom", true, ZOOMED_OUT);
                            }
                            var vrouterName= response[0].value[0].name;
                            var elementMap = _this.getModel().getElementMap();
                            var nodes      = _this.getModel().getNodes();
                            var links      = _this.getModel().getLinks();
                            var elements   = _this.getModel().getConnectedElements();

                            var newElements = [];
                            var vrouterToVMlinks = [];
                            for (var i = 0; i < vms.length; i++) {
                                var node = {
                                    "name"          : vms[i],
                                    "chassis_type"  : "virtual-machine",
                                    "node_type"     : "virtual-machine"
                                };
                                var newElement = _this.createNode(node, i, vms.length);
                                var nodeName = node['name'];
                                newElements.push(newElement);
                                elements.push(newElement);
                                elementMap.nodes[nodeName] = newElement.id;
                                nodes.push(node);
                                vrouterToVMlinks.push({
                                    "endpoints": [vrouterName, nodeName]
                                });

                            }
                            if(newElements.length > 0) {
                                _this.getGraph().addCells(newElements);
                                for(var i=0; i<newElements.length; i++) {
                                    $('g.element[model-id="' + newElements[i].id + '"]')
                                        .find('text')
                                        .css('stroke', "#498AB9")
                                        .css('fill', "#498AB9");
                                    $('div.font-element[font-element-model-id="' + newElements[i].id + '"]')
                                        .find('i.icon-contrail-virtual-machine')
                                        .css('color', "#498AB9");
                                }
                            }
                            newElements = [];
                            for (var i = 0; i < vrouterToVMlinks.length; i++) {
                                var link = {
                                    "connectionStroke" : "#637939",
                                    "linkType" : 'logical',
                                    "endpoints" : vrouterToVMlinks[i].endpoints
                                };
                                var newElement = _this.createLink(link, elements, elementMap);
                                newElements.push(newElement);
                                elements.push(newElement);
                                elementMap.links[newElement.attributes.linkDetails.endpoints[0] + '<->' + newElement.attributes.linkDetails.endpoints[1]] = newElement.id;
                                elementMap.links[newElement.attributes.linkDetails.endpoints[1] + '<->' + newElement.attributes.linkDetails.endpoints[0]] = newElement.id;
                                links.push(link);

                            }
                            if(newElements.length > 0) {
                                _this.getGraph().addCells(newElements);
                            }
                            _this.getModel().setNodes(nodes);
                            _this.getModel().setLinks(links);
                            _this.getModel().setConnectedElements(elements);
                            _this.getModel().setElementMap(elementMap);
                        }
                        else {
                            showInfoWindow("No Virtual Machines found for " + dblClickedElement['attributes']['nodeDetails']['name'], "Info");
                            return false;
                        }
                    }
                });
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
        var clickedElement = cellView.model,
            elementType    = clickedElement['attributes']['type'],
            data           = {};

        switch(elementType) {
            case 'contrail.PhysicalRouter':
                var nodeDetails = clickedElement['attributes']['nodeDetails'];
                data = {
                    host_name : ifNull(nodeDetails['name'],'-'),
                    description: ifNull(nodeDetails['more_attributes']['lldpLocSysDesc'],'-'),
                    intfCnt   : ifNull(nodeDetails['more_attributes']['ifTable'],[]).length,
                };
                data['type'] = 'node';
                _this.populateDetailsTab(data);
                $("#underlay_topology").data('nodeType',ifNull(nodeDetails['node_type'],'-'));
                $("#underlay_topology").data('nodeName',ifNull(nodeDetails['name'],'-'));
                break;
            case 'contrail.VirtualRouter':
                var nodeDetails = clickedElement['attributes']['nodeDetails'];
                $("#underlay_topology").data('nodeType',ifNull(nodeDetails['node_type'],'-'));
                $("#underlay_topology").data('nodeName',ifNull(nodeDetails['name'],'-'));
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
        }
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
    var elements = this.getModel().getConnectedElements();
    var elementMap = this.getModel().getElementMap();
    var delElements = [];
    for(var i=0; i<elements.length; i++) {
        var element = elements[i];
        if(element.attributes && element.attributes.hasOwnProperty('nodeDetails') &&
            element.attributes.nodeDetails.chassis_type == type) {
            delElements.push(element);
            $('div.font-element[font-element-model-id="' + element.id + '"]').remove();
            $('svg').find('g.element[model-id="' + element.id + '"]').remove();
            delete elementMap.nodes[element.attributes.nodeDetails.name];
            $.each(elementMap.links, function(linkKey, linkValue) {
                if(linkKey.indexOf(element.attributes.nodeDetails.name) !== -1) {
                    $('svg').find('g.link[model-id="' + linkValue + '"]').remove();
                    delete elementMap.links[linkKey];
                }
            });
            elements.splice(i,1);
        }
    }
    this.getModel().clearOtherNodes(type);
}

underlayView.prototype.resetTopology = function() {
    this.clearHighlightedConnectedElements();
    $("#topology_paper").panzoom("reset");
    ZOOMED_OUT = 0;
    this.hideVRouters();
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
                this.view.highlightPath(response);
            }
        };
        this.getModel().getData(cfg);
    }
}

underlayView.prototype.highlightPath = function(response) {
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
    var elementMap = _this.getModel().getElementMap();
    var conElements = _this.getModel().getConnectedElements();
    var graph      = _this.getGraph();
    var nodes      = response.nodes;
    var links      = response.links;

    for(var i=0; i<nodes.length; i++) {
        highlightedElements.nodes.push(nodes[i]);
    }

    for (var i = 0; i < links.length; i++) {
        highlightedElements.links.push(links[i].endpoints[0] + "<->" + links[i].endpoints[1]);
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
        $("g.link[model-id='" + nodeElement.id + "']").removeClassSVG('hidden');
        $("g.link[model-id='" + nodeElement.id + "']")
            .find('path.connection-wrap')
                .css("opacity", ".2")
                .css("fill", "#498AB9")
                .css("stroke", "#498AB9");
    });
};

underlayView.prototype.showVRouter = function(dblClickedElement) {
    var elMap  = this.getModel().getElementMap();
    var clickedNodeName = dblClickedElement['attributes']['nodeDetails']['name'];
    var vrouters = [];
    var linkToVrouters = [];
    var links = this.getModel().getLinks();
    var nodes = this.getModel().getNodes();
    var graph = this.getGraph();
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
            this.hideVRouters();
        } else {
            $('div.font-element').removeClass('elementHighlighted').removeClass('dimHighlighted');
            $('g.element').removeClassSVG('elementHighlighted').removeClassSVG('dimHighlighted');
            $('g.link').removeClassSVG('elementHighlighted').removeClassSVG('dimHighlighted');
            this.hideVRouters();
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
        }

        if($('div.font-element[font-element-model-id="' + vrouter_model_id + '"]').hasClass('hidden')) {
            $('div.font-element[font-element-model-id="' + vrouter_model_id + '"]')
                .removeClass('hidden')
                .removeClass('dimHighlighted')
                .addClass('elementHighlighted');
        }
    }

    for(var i=0; i<linkToVrouters.length; i++) {
        var link_model_id = linkToVrouters[i];
        if($('g.link[model-id="' + link_model_id + '"]').hasClassSVG('hidden')) {
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
    }
}

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
    //this.initContextMenuConfig();
    this.graph.addCells(elements);
    this.initGraphEvents();
    this.initTooltipConfig();
}

underlayView.prototype.renderFlowRecords = function() {
    if($("#fr-results").data('contrailGrid') == null) {
        $("#flows-tab").html($("#qe-template").html());
        setFRValidValues();
        initFRQueryView('fr');
        //openWhereWithUnderlay('fr');
        initWidgetBoxes();
        queries['fr'].queryViewModel.timeRange([
                                                {"name":"Last 5 Mins", "value":300},
                                                {"name":"Last 10 Mins", "value":600},
                                                {"name":"Last 20 Mins", "value":1200},
                                                {"name":"Last 30 Mins", "value":1800},
                                                {"name":"Last 1 Hr", "value":3600},
                                     ]);
        queries['fr'].queryViewModel.defaultTRValue("600");
        queries['fr'].queryViewModel.isCustomTRVisible(false);
        ko.applyBindings(queries.fr.queryViewModel, document.getElementById('fr-query'));
    }
}

underlayView.prototype.renderTracePath = function(options) {
    var obj = [
       {
           label:'VRouter',
           key:'vRouter'
       }
    ];
    var _this = this;
    var nodeType = $("#underlay_topology").data('nodeType');
    var nodeName = $("#underlay_topology").data('nodeName');
    var tracePathTemplate = Handlebars.compile($("#tracePath-template").html())(obj);
    var defaultValue = '',ip = '';
    $("#traceFlow").html(tracePathTemplate);
    var items = globalObj['dataSources']['computeNodeDS']['dataSource'].getItems(),data = [];
    if(nodeType == VROUTER && nodeName != null) {
        defaultValue = nodeName;
    } else {
        defaultValue = items[0]['name'];
        ip = items[0]['ip'];
    }
    for(var i = 0; i < items.length; i++) {
        if(items[i]['name'] == defaultValue)
            ip = items[i]['ip'];
        data.push({
            text:items[i]['name'],
            value:items[i]['ip']
        });
    }
    $("#vRouter").contrailDropdown({
        dataTextField: "text",
        dataValueField: "value",
        change:function(e){
            var newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + e['val'], 
                        type:'Get'
                    };
            flowGrid.setRemoteAjaxConfig(newAjaxConfig);
            flowGrid._dataView.setData([]);
            flowGrid.showGridMessage('loading');
            reloadGrid(flowGrid);
        }
    });
    var vrouterDropdown = $("#vRouter").data('contrailDropdown');
    vrouterDropdown.setData(data);
    vrouterDropdown.text(defaultValue);
    //if(!isGridInitialized('#vrouterflows')) {
        $("#vrouterflows").contrailGrid({
            header : {
                title : {
                    text : 'Flows'
                },
                customControls : ['<button id="traceFlowBtn" class="btn btn-primary btn-mini" disabled="disabled" title="Map Flow">Map Flow</button>'],
            },
            columnHeader : {
                columns: [
                               {
                                   field:"protocol",
                                   name:"Protocol",
                                   minWidth:60,
                                   formatter:function(r,c,v,cd,dc){
                                       return formatProtocol(dc['protocol']);
                                   }
                               },
                               {
                                   field:"src_vn",
                                   name:"Src Network",
                                   cssClass:'cell-hyperlink-blue',
                                   events: {
                                       onClick: function(e,dc){
                                           var tabIdx = $.inArray("networks", computeNodeTabs);
                                           selectTab(computeNodeTabStrip,tabIdx);
                                       }
                                    },
                                   minWidth:195
                               },
                               {
                                   field:"sip",
                                   name:"Src IP",
                                   minWidth:70
                               },
                               {
                                   field:"src_port",
                                   name:"Src Port",
                                   minWidth:50
                               },
                               {
                                   field:"dst_vn",
                                   name:"Dest Network",
                                   cssClass:'cell-hyperlink-blue',
                                   events: {
                                       onClick: function(e,dc){
                                           var tabIdx = $.inArray("networks", computeNodeTabs);
                                           selectTab(computeNodeTabStrip,tabIdx);
                                       }
                                    },
                                   minWidth:195
                               },
                               {
                                   field:"dip",
                                   name:"Dest IP",
                                   minWidth:70
                               },
                               {
                                   field:"dst_port",
                                   name:"Dest Port",
                                   minWidth:50
                               },
                               {
                                   field:"direction",
                                   name:"Direction",
                                   minWidth:80,
                                   formatter:function(r,c,v,cd,dc) {
                                       var directionMap = {
                                           'egress': 'ENGRESS',
                                           'ingress': 'INGRESS'
                                       };
                                       return ifNull(directionMap[dc['raw_json']['direction']],'-');
                                   }
                               },
                               {
                                   field:"stats_bytes",
                                   name:"Bytes/Pkts",
                                   minWidth:80,
                                   formatter:function(r,c,v,cd,dc){
                                       return contrail.format("{0}/{1}",formatBytes(dc['stats_bytes'],'-'),dc['stats_packets']);
                                   },
                                   searchFn:function(d){
                                       return d['stats_bytes']+ '/ ' +d['stats_packets'];
                                   }
                               }
                           ]
            },
            body : {
                options : {
                    forceFitColumns: true,
                    sortable : false,
                    checkboxSelectable: {
                        enableRowCheckbox: true,
                        onNothingChecked: function(e){
                            $("div.slick-cell-checkboxsel > input").removeAttr('disabled')
                            $("#traceFlowBtn").attr('disabled','disabled');
                        },
                        onSomethingChecked: function(e){
                            $("div.slick-cell-checkboxsel > input").attr('disabled','disabled');
                            $("#traceFlowBtn").removeAttr('disabled');
                            $(e['currentTarget']).removeAttr('disabled')
                        }
                    },
                },
                dataSource : {
                    remote: {
                        ajaxConfig: {
                            url: function () {
                                return monitorInfraUrls['VROUTER_FLOWS'] + '?ip='+ip;
                            }(),
                            type: 'GET'
                        },
                        dataParser: self.parseFlowsData
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
            //change:onFlowChange
        });
        flowGrid = $('#vrouterflows').data('contrailGrid');
        $("#vrouterflows").find('input.headerRowCheckbox').parent('span').remove();
        flowGrid.showGridMessage('loading');
    /*} else {
        var newAjaxConfig;
        flowGrid = $('#gridComputeFlows').data('contrailGrid');
        if(selectedAcl != 'All'){
            newAjaxConfig = {
                    url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(obj), 
                    type:'Get'
                };
            flowGrid.setRemoteAjaxConfig(newAjaxConfig);
        } 
        reloadGrid(flowGrid);
    }*/
    $("#traceFlowBtn").on('click',function(e){
        var checkedRows = flowGrid.getCheckedRows();
        var dataItem = ifNull(checkedRows[0],{});
        var item = vrouterDropdown.getSelectedItem();
        /*
         * For egress flows the source vm ip may not spawned in the same vrouter,
         * so need to pick the peer_vrouter
         */
        var ip = dataItem['raw_json']['direction'] == 'egress' ? dataItem['raw_json']['peer_vrouter'] : item['id'] ;  
        var postData = {
               nodeIP: ip,
               srcIP: dataItem['sip'],
               destIP: dataItem['dip'],
               srcPort: dataItem['src_port'],
               destPort: dataItem['dst_port'],
               protocol: dataItem['protocol'],
               vrfId: parseInt(dataItem['raw_json']['vrf'])
        };
        $.ajax({
            url:'/api/tenant/networking/trace-flow',
            type:'POST',
            data:{
                data: postData
            }
        }).success(function(response){
            _this.highlightPath(response);
        }).always(function(response){
            
        });
    });
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
                this.view.highlightPath(response);
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
    var type = data['type'],details,content;
    $("#detailsLink").show();
    $("#underlay_tabstrip").tabs({active:2});
    if(type == 'node') {
        content = {
            host_name : ifNull(data['host_name'],'-'),
            description: ifNull(data['description'],'-'),
            intfCnt   : ifNull(data['intfCnt'],0)
        };
        details = Handlebars.compile($("#device-summary-template").html())(content);
        $("#detailsTab").html(details);
    } else if (type == 'link') {
        var endpoints = ifNull(data['endpoints'],[]);
        var sourceType = data['sourceElement']['attributes']['nodeDetails']['node_type'];
        var targetType = data['targetElement']['attributes']['nodeDetails']['node_type'];
        var url = '',link = 'vrouter';
        var type = 'GET';
        var ajaxData = {};
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
            //url = '/interfaceStats.json';
            link = 'prouter';
            details = Handlebars.compile($("#link-summary-template").html())({link:link,intfObjs:[{}]});
            $("#detailsTab").html(details);
        } else if(sourceType == VROUTER || targetType == VROUTER) {
            var vrouter = (sourceType == VROUTER) ? data['sourceElement']['attributes']['nodeDetails']['name']
                           : data['targetElement']['attributes']['nodeDetails']['name'];
            url = 'api/tenant/networking/vrouter/stats';
            ajaxData = {
                    minsSince: 60,
                    sampleCnt: 120,
                    useServerTime: true,
                    vrouter:vrouter
            };
            //url ='/vrouterifstats.json';
            var title = contrail.format('Traffic Statistics of {0}',vrouter);
            details = Handlebars.compile($("#link-summary-template").html())({link:'vrouter',title:title});
            $("#detailsTab").html(details);
            //$("#detailsTab").find('.icon-spinner').show();
        }
        $.ajax({
            url:url,
            type:type,
            data:ajaxData
        }).success(function(response){
            var chartObj = {
                    data:[]
            };
            var selector = '';
            if(link == 'vrouter') {
                selector = 'vrouter-ifstats';
                var flows = ifNull(response['flow-series'],[]);
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
                initMemoryLineChart('#'+selector,chartObj['data'],{height:300});
            } else if (link == 'prouter') {
                for(var i = 0; i < response.length; i++) {
                    var rawFlowData = response[i];
                    var lclData = ifNull(rawFlowData[0],{});
                    var rmtData = ifNull(rawFlowData[1],{});
                    var intfFlowData = [],inBytesData = [],outBytesData = [];
                    var title = contrail.format("Traffic statistics of link between {0} {1} and {2} {3}",lclData['summary']['name'],
                            lclData['summary']['if_name'],rmtData['summary']['name'],rmtData['summary']['if_name']);
                    var lclFlows = ifNull(lclData['flow-series']['value'],[]);
                    var rmtFlows = ifNull(rmtData['flow-series']['value'],[]);
                    var interfaceChartObj = {
                            title:title,
                            data:intfFlowData
                    };
                    for(var j = 0; j < lclFlows.length; j++) {
                        var lclFlowObj = lclFlows[j];
                        for(k = 0; k < rmtFlows.length; k++) {
                            if(lclFlowObj['T='] == rmtFlows[k]['T=']){
                                var time = lclFlowObj['T=']; 
                                var inBytes = ifNull(lclFlowObj['SUM(ifStats.ifInUcastPkts)'],0) + 
                                                ifNull(rmtFlows[k]['SUM(ifStats.ifInUcastPkts)'],0);
                                var outBytes = ifNull(lclFlowObj['SUM(ifStats.ifOutUcastPkts)'],0) + 
                                                ifNull(rmtFlows[k]['SUM(ifStats.ifOutUcastPkts)'],0);
                                inBytesData.push(
                                        {
                                            x:time,
                                            y:inBytes
                                        }
                                );
                                outBytesData.push(
                                        {
                                            x:time,
                                            y:outBytes
                                        }
                                );
                                break;
                            }
                                
                        }
                    }
                    intfFlowData.push({
                        key: 'Transmit',
                        values: inBytesData
                    });
                    intfFlowData.push({
                        key: 'Receive',
                        values: outBytesData
                    });
                    var icontag = "<i id='prouter-ifstats-loading-0' class='icon-spinner icon-spin blue bigger-125' " +
                            "style='display: none;'></i>";
                    $("#prouter-ifstats-widget-"+i).find('.widget-header > h4').html(icontag+title);
                    initMemoryLineChart('#prouter-ifstats-'+i,intfFlowData,{height:300});
                }
            } 
        }).always(function(response){
            $("#detailsTab").find('.icon-spinner').hide();
        });
    }
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
            _this.getView().resetTopology();
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